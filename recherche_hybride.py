
import json
import re
import logging
import threading
from pathlib import Path
from typing import List, Dict, Any
import numpy as np

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).parent
BIBLE_PATH = BASE_DIR / "bible.json"
VERSE_INDEX_PATH = BASE_DIR / "versets_index.json"
EMBEDDINGS_PATH = BASE_DIR / "embeddings.npy"

DEFAULT_TOP_K = 50
MAX_TOP_K = 200
MAX_QUESTION_LENGTH = 500

_lock = threading.Lock()
_engine_instance = None

MOTS_INUTILES = {
    "le", "la", "les", "un", "une", "des", "du", "de", "d",
    "et", "ou", "à", "au", "aux", "que", "qui", "est", "sont",
    "dans", "sur", "pour", "avec", "me", "moi", "je", "tu",
    "il", "elle", "nous", "vous", "ils", "elles", "ce", "ces",
    "cet", "cette", "mon", "ma", "mes", "ton", "ta", "tes",
    "son", "sa", "ses", "leur", "leurs"
}

_RE_PONCTUATION = re.compile(r"[?!.,;:(){}\[\]\"']+")
_RE_SPACES = re.compile(r"\s+")

class BibleSearchEngine:
    def __init__(self):
        self._bible = None
        self._versets = None
        self._embeddings_norm = None
        self._modele = None
        self._loaded = False
        self._load_lock = threading.Lock()

    def _ensure_loaded(self):
        if self._loaded:
            return
        with self._load_lock:
            if self._loaded:
                return
            try:
                logger.info("Chargement index Bible...")
                if not BIBLE_PATH.exists():
                    raise FileNotFoundError(f"{BIBLE_PATH} introuvable")
                if not VERSE_INDEX_PATH.exists():
                    raise FileNotFoundError(f"{VERSE_INDEX_PATH} introuvable")
                if not EMBEDDINGS_PATH.exists():
                    raise FileNotFoundError(f"{EMBEDDINGS_PATH} introuvable")

                try:
                    from intelligence_biblique import modele as _modele
                    self._modele = _modele
                except Exception as e:
                    logger.error(f"Echec chargement modele: {e}")
                    raise RuntimeError("Modèle sémantique non disponible") from e

                with open(VERSE_INDEX_PATH, "r", encoding="utf-8") as f:
                    self._versets = json.load(f)

                embeddings = np.load(str(EMBEDDINGS_PATH))
                if len(embeddings)!= len(self._versets):
                    raise ValueError("Incohérence embeddings / versets_index")

                normes = np.linalg.norm(embeddings, axis=1, keepdims=True)
                self._embeddings_norm = embeddings / np.maximum(normes, 1e-12)

                with open(BIBLE_PATH, "r", encoding="utf-8") as f:
                    self._bible = json.load(f)

                self._loaded = True
                logger.info(f"Index chargé: {len(self._versets)} versets")
            except Exception as e:
                logger.exception("Erreur chargement moteur recherche")
                raise

    @staticmethod
    def _normaliser_question(question: str) -> str:
        if not isinstance(question, str):
            raise TypeError("Question doit être une chaîne")
        question = question.strip()
        if not question:
            raise ValueError("Question vide")
        if len(question) > MAX_QUESTION_LENGTH:
            raise ValueError(f"Question trop longue (> {MAX_QUESTION_LENGTH})")
        return question

    @staticmethod
    def _tokeniser_filtrage(question: str) -> List[str]:
        q = question.lower()
        q = _RE_PONCTUATION.sub(" ", q)
        q = _RE_SPACES.sub(" ", q).strip()
        mots = q.split()
        return [m for m in mots if m not in MOTS_INUTILES and len(m) > 2]

    @staticmethod
    def _score_mots(mots_cles: List[str], texte: str) -> int:
        if not mots_cles:
            return 0
        texte_l = texte.lower()
        score = 0
        for mot in mots_cles:
            if re.search(r"\b" + re.escape(mot) + r"\b", texte_l):
                score += 1
        return score

    def rechercher(self, question: str, nombre_resultats: int = DEFAULT_TOP_K) -> List[Dict[str, Any]]:
        self._ensure_loaded()
        question = self._normaliser_question(question)
        nombre_resultats = int(nombre_resultats)
        nombre_resultats = max(1, min(nombre_resultats, MAX_TOP_K))
        nombre_resultats = min(nombre_resultats, len(self._versets))

        mots_cles = self._tokeniser_filtrage(question)

        vecteur_q = self._modele.encode(question, convert_to_numpy=True)
        norme = np.linalg.norm(vecteur_q)
        if norme > 1e-12:
            vecteur_q = vecteur_q / norme

        scores_sem = np.dot(self._embeddings_norm, vecteur_q)

        scores_mots = np.zeros(len(self._versets), dtype=np.float32)
        if mots_cles:
            for i, v in enumerate(self._versets):
                scores_mots[i] = self._score_mots(mots_cles, v.get("texte", ""))

        s_min, s_max = float(scores_sem.min()), float(scores_sem.max())
        if (s_max - s_min) > 1e-6:
            scores_sem_norm = (scores_sem - s_min) / (s_max - s_min)
        else:
            scores_sem_norm = np.zeros_like(scores_sem)

        m_max = float(scores_mots.max()) if len(scores_mots) > 0 else 0.0
        if m_max > 0:
            scores_mots_norm = scores_mots / m_max
        else:
            scores_mots_norm = np.zeros_like(scores_mots)

        scores_finaux = 0.70 * scores_sem_norm + 0.30 * scores_mots_norm
        meilleurs_idx = np.argsort(scores_finaux)[::-1][:nombre_resultats]

        resultats = []
        for idx in meilleurs_idx:
            v = self._versets[int(idx)]
            resultats.append({
                "indice": int(idx),
                "score_final": float(scores_finaux[int(idx)]),
                "score_semantique": float(scores_sem[int(idx)]),
                "score_mots": int(scores_mots[int(idx)]),
                "reference": v.get("reference", ""),
                "texte": v.get("texte", ""),
                "livre": v.get("livre", ""),
                "chapitre": v.get("chapitre"),
                "verset": v.get("verset"),
            })
        return resultats

def _get_engine() -> BibleSearchEngine:
    global _engine_instance
    if _engine_instance is None:
        with _lock:
            if _engine_instance is None:
                _engine_instance = BibleSearchEngine()
    return _engine_instance

def rechercher(question: str, nombre_resultats: int = DEFAULT_TOP_K) -> List[Dict[str, Any]]:
    try:
        engine = _get_engine()
        return engine.rechercher(question, nombre_resultats)
    except (ValueError, TypeError) as e:
        logger.warning(f"Requête invalide: {e}")
        raise
    except Exception as e:
        logger.exception("Erreur interne recherche_hybride")
        raise RuntimeError("Erreur interne du moteur de recherche") from e

    
    