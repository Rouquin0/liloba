# ============================================================
# api.py — BIBLE-IA PROD v2.1 (sans slowapi)
# ============================================================

import os
import json
import logging
import threading
import time
from pathlib import Path
from collections import defaultdict
from typing import List, Dict, Any, Optional

from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, StreamingResponse 
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel, Field
import uvicorn

from main import (
    traiter_question_bible,
    normaliser_niveau_utilisateur,
    MAX_QUESTION_LEN,
    MAX_QUESTION_MOTS,
)


# ============================================================
# CONFIGURATION
# ============================================================

load_dotenv()

APP_VERSION = "2.1.0"

_origins_env = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:5173"
)

ALLOWED_ORIGINS: List[str] = [
    o.strip() for o in _origins_env.split(",") if o.strip()
]

if not ALLOWED_ORIGINS:
    ALLOWED_ORIGINS = ["http://localhost:3000"]

BIBLE_JSON_PATH = Path(
    os.getenv("BIBLE_JSON_PATH", "bible.json")
)

MAX_BODY_SIZE = 16 * 1024  # 16 Ko


# ============================================================
# LOGGING
# ============================================================

def _configurer_logging() -> None:
    niveau = os.getenv("LOG_LEVEL", "INFO").upper()
    root = logging.getLogger()

    if not root.handlers:
        logging.basicConfig(
            level=niveau,
            format=(
                "%(asctime)s | %(levelname)s | "
                "%(name)s | %(message)s"
            ),
        )
    else:
        root.setLevel(niveau)


_configurer_logging()
logger = logging.getLogger("bible_ia.api")


# ============================================================
# APPLICATION
# ============================================================

from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Précharge le moteur biblique AU DÉMARRAGE du serveur.
    Évite que le premier utilisateur attende 40+ secondes.
    """
    logger.info("🚀 Préchargement du moteur biblique...")
    try:
        from main import _get_orchestrator
        orchestrator = _get_orchestrator()
        orchestrator._ensure_loaded()
        logger.info("✅ Moteur biblique prêt.")
    except Exception:
        logger.exception("⚠️ Échec du préchargement du moteur.")
        # On ne bloque PAS le démarrage : le moteur se chargera
        # à la première requête si le préchargement échoue.

    yield

    logger.info("👋 Arrêt du serveur.")


app = FastAPI(
    title="BIBLE-IA PROD",
    version=APP_VERSION,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    max_age=600,
)


# ============================================================
# RATE LIMITER MAISON (zéro dépendance)
# ============================================================

_rate_store: Dict[str, List[float]] = defaultdict(list)
_rate_lock = threading.Lock()


def _client_ip(request: Request) -> str:
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _check_rate_limit(
    ip: str,
    max_par_minute: int = 20,
    max_par_jour: int = 300,
) -> bool:
    maintenant = time.time()
    il_y_a_1_min = maintenant - 60
    il_y_a_1_jour = maintenant - 86400

    with _rate_lock:
        historique = _rate_store[ip]

        historique[:] = [t for t in historique if t > il_y_a_1_jour]

        dernieres_60s = [t for t in historique if t > il_y_a_1_min]

        if len(dernieres_60s) >= max_par_minute:
            return False

        if len(historique) >= max_par_jour:
            return False

        historique.append(maintenant)
        return True


# ============================================================
# MIDDLEWARE : LIMITE DE TAILLE DU CORPS
# ============================================================

@app.middleware("http")
async def limiter_taille_requete(request: Request, call_next):
    content_length = request.headers.get("content-length")

    if content_length is not None:
        try:
            taille = int(content_length)
        except ValueError:
            return JSONResponse(
                status_code=400,
                content={"detail": "Content-Length invalide"},
            )

        if taille > MAX_BODY_SIZE:
            return JSONResponse(
                status_code=413,
                content={"detail": "Requête trop volumineuse"},
            )

    return await call_next(request)


# ============================================================
# MEMOIRE UTILISATEUR
# ============================================================

_memoire_users: Dict[str, List[Dict[str, str]]] = {}
_lock_memoire = threading.Lock()
MAX_HIST_PER_USER = 6
MAX_USER_ID_LEN = 64


def _sanitize_user_id(user_id: Optional[str]) -> str:
    if not user_id:
        return "default"

    user_id = str(user_id)[:MAX_USER_ID_LEN]

    safe = "".join(
        c for c in user_id
        if c.isalnum() or c in "-_"
    )

    return safe or "default"


def _get_historique(user_id: str) -> List[Dict[str, str]]:
    with _lock_memoire:
        return list(_memoire_users.get(user_id, []))


def _add_historique(user_id: str, q: str, r: str) -> None:
    with _lock_memoire:
        hist = _memoire_users.get(user_id, [])
        hist.append({"role": "user", "content": q[:1000]})
        hist.append({"role": "assistant", "content": r[:1500]})
        _memoire_users[user_id] = hist[-MAX_HIST_PER_USER:]


def _clear_historique(user_id: str) -> None:
    with _lock_memoire:
        _memoire_users.pop(user_id, None)


# ============================================================
# MODELES PYDANTIC
# ============================================================

class AskRequest(BaseModel):
    question: str = Field(
        ...,
        min_length=1,
        max_length=MAX_QUESTION_LEN,
    )
    niveau: Optional[str] = "18+"
    user_id: Optional[str] = "default"
    historique: Optional[List[Dict[str, str]]] = None


class ClearRequest(BaseModel):
    user_id: Optional[str] = "default"


# ============================================================
# CHARGEMENT BIBLE
# ============================================================

_bible_cache: Optional[Dict[str, Any]] = None
_bible_lock = threading.Lock()


def _charger_bible() -> Optional[Dict[str, Any]]:
    global _bible_cache

    if _bible_cache is not None:
        return _bible_cache

    with _bible_lock:
        if _bible_cache is not None:
            return _bible_cache

        if not BIBLE_JSON_PATH.exists():
            logger.warning(
                "bible.json introuvable au chemin %s",
                BIBLE_JSON_PATH,
            )
            return None

        try:
            with BIBLE_JSON_PATH.open(
                "r", encoding="utf-8"
            ) as f:
                _bible_cache = json.load(f)

            logger.info(
                "bible.json chargé (%d livres).",
                len(_bible_cache) if isinstance(_bible_cache, dict) else 0,
            )

        except Exception:
            logger.exception("Échec du chargement de bible.json")
            _bible_cache = None

        return _bible_cache


# ============================================================
# ROUTES SYSTEME
# ============================================================

@app.get("/health")
async def health():
    _charger_bible()  # déclenche le chargement si pas encore fait
    return {
        "status": "ok",
        "version": APP_VERSION,
        "bible_chargee": _bible_cache is not None,
    }


@app.post("/clear")
async def clear(req: ClearRequest):
    user_id = _sanitize_user_id(req.user_id)
    _clear_historique(user_id)
    return {"status": "cleared", "user_id": user_id}


# ============================================================
# ROUTE /ask
# ============================================================

@app.post("/ask")
async def ask(request: Request, req: AskRequest):
    # Rate limiting
    ip = _client_ip(request)

    if not _check_rate_limit(ip):
        raise HTTPException(
            status_code=429,
            detail=(
                "Trop de requêtes. Réessaie dans une minute "
                "ou attends demain."
            ),
        )

    start = time.time()

    if len(req.question.split()) > MAX_QUESTION_MOTS:
        raise HTTPException(
            status_code=400,
            detail="Question trop longue",
        )

    user_id = _sanitize_user_id(req.user_id)
    niveau = normaliser_niveau_utilisateur(req.niveau)

    historique = (
        req.historique
        if req.historique is not None
        else _get_historique(user_id)
    )

    try:
        resultat = await run_in_threadpool(
            traiter_question_bible,
            question=req.question,
            niveau_utilisateur=niveau,
            historique=historique,
        )
    except Exception:
        logger.exception("Erreur moteur biblique")
        raise HTTPException(
            status_code=500,
            detail="Erreur interne du moteur biblique",
        )

    erreur = resultat.get("erreur")

    if erreur == "validation":
        raise HTTPException(
            status_code=400,
            detail=resultat.get("reponse"),
        )

    if erreur == "hors_sujet":
        return {
            "reponse": resultat.get("reponse", ""),
            "references": [],
            "sources": [],
            "personnages": [],
            "niveau_pertinence_top": "hors_sujet",
            "duree_ms": int((time.time() - start) * 1000),
        }

    reponse = resultat.get("reponse", "")
    sources = resultat.get("sources", [])

    if reponse and not erreur:
        _add_historique(user_id, req.question, reponse)

    return {
        "reponse": reponse,
        "references": resultat.get("references", [])[:5],
        "sources": [
            {
                "reference": s.get("reference"),
                "texte": (s.get("texte") or "")[:500],
                "niveau_pertinence": s.get("niveau_pertinence"),
                "est_reference_demandee": s.get(
                    "est_reference_demandee", False
                ),
            }
            for s in sources[:5]
        ],
        "personnages": resultat.get("personnages", []),
        "niveau_pertinence_top": resultat.get("niveau_pertinence_top"),
        "erreur": erreur,
        "duree_ms": int((time.time() - start) * 1000),
    }

# ============================================================
# ROUTE /ask/stream — Streaming SSE
# ============================================================

@app.post("/ask/stream")
async def ask_stream(req: AskRequest):
    """
    Endpoint de streaming SSE.
    Envoie la réponse d'Apollos morceau par morceau.

    Format SSE :
        data: {"type": "status", "message": "..."}
        data: {"type": "chunk", "content": "..."}
        data: {"type": "sources", "sources": [...]}
        data: {"type": "done"}
    """
    from main import traiter_question_bible_stream
    import json as _json

    # Vérifications préalables (comme la route /ask)
    if len(req.question.split()) > MAX_QUESTION_MOTS:
        raise HTTPException(
            status_code=400,
            detail="Question trop longue",
        )

    user_id = _sanitize_user_id(req.user_id)
    niveau = normaliser_niveau_utilisateur(req.niveau)

    historique = (
        req.historique
        if req.historique is not None
        else _get_historique(user_id)
    )

    async def event_generator():
        """Générateur SSE : yield les événements formatés."""
        full_response = []

        try:
            stream = traiter_question_bible_stream(
                question=req.question,
                niveau_utilisateur=niveau,
                historique=historique,
            )

            for event in stream:
                if event.get("type") == "chunk":
                    full_response.append(event.get("content", ""))

                payload = _json.dumps(event, ensure_ascii=False)
                yield f"data: {payload}\n\n"

        except Exception:
            logger.exception("Erreur dans le stream SSE")
            error_event = {
                "type": "error",
                "message": "Désolé, une erreur technique est survenue.",
            }
            yield f"data: {_json.dumps(error_event, ensure_ascii=False)}\n\n"
            yield f'data: {_json.dumps({"type": "done"})}\n\n'

        else:
            final_text = "".join(full_response).strip()
            if final_text:
                _add_historique(user_id, req.question, final_text)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ============================================================
# ROUTES BIBLE
# ============================================================

@app.get("/bible/livres")
async def bible_livres():
    bible = _charger_bible()

    if bible is None:
        raise HTTPException(
            status_code=503,
            detail="Bible non disponible",
        )

    if isinstance(bible, dict):
        livres = list(bible.keys())
    elif isinstance(bible, list):
        livres = [
            livre.get("nom") or livre.get("name")
            for livre in bible
            if isinstance(livre, dict)
        ]
    else:
        livres = []

    return {"livres": livres}


@app.get("/bible/{livre}/{chapitre}")
async def bible_chapitre(livre: str, chapitre: int):
    bible = _charger_bible()

    if bible is None:
        raise HTTPException(
            status_code=503,
            detail="Bible non disponible",
        )

    if isinstance(bible, dict):
        livre_data = bible.get(livre)

        if livre_data is None:
            for cle in bible.keys():
                if cle.lower() == livre.lower():
                    livre_data = bible[cle]
                    break

        if livre_data is None:
            raise HTTPException(
                status_code=404,
                detail=f"Livre '{livre}' introuvable",
            )

        if not isinstance(livre_data, dict):
            raise HTTPException(
                status_code=500,
                detail="Structure bible invalide",
            )

        chapitre_data = livre_data.get(str(chapitre))

        if chapitre_data is None:
            raise HTTPException(
                status_code=404,
                detail=f"Chapitre {chapitre} introuvable",
            )

        return {
            "livre": livre,
            "chapitre": chapitre,
            "versets": chapitre_data,
        }

    raise HTTPException(
        status_code=500,
        detail="Structure bible non supportée",
    )


# ============================================================
# HANDLER D'ERREUR GLOBAL
# ============================================================

@app.exception_handler(Exception)
async def global_handler(request: Request, exc: Exception):
    logger.exception(
        "Erreur globale sur %s %s",
        request.method,
        request.url.path,
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "Erreur interne, réessaie"},
    )


# ============================================================
# POINT D'ENTREE
# ============================================================

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    reload = os.getenv("RELOAD", "false").lower() == "true"

    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=port,
        reload=reload,
    )
