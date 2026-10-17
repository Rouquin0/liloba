import os
import time
import random
import re
import json
import logging
from typing import List, Dict, Any, Union
from dotenv import load_dotenv
from google import genai

from identite import (
    NOM_APPLICATION,
    NOM_ASSISTANT,
    VERSION_BIBLE,
    REGLES_APOLLOS,
    STYLE_APOLLOS,
)

load_dotenv()
logger = logging.getLogger(__name__)

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY manquante dans le fichier .env !")
client = genai.Client(api_key=api_key)

MAX_QUESTION_LEN = 1000
MAX_CONTEXT_LEN = 25000
MAX_HISTORIQUE_MESSAGES = 6
MAX_HISTORIQUE_CONTENT_LEN = 1200
MAX_HISTORIQUE_LEN = 6000

NIVEAUX_AUTORISES = {"8-11","12-15","16-17","18+","approfondi"}

def normaliser_niveau_utilisateur(niveau: str) -> str:
    if not isinstance(niveau, str): return "18+"
    niveau = niveau.strip().lower()
    corr = {
        "8":"8-11","8-11":"8-11","8–11":"8-11","8_11":"8-11","8 à 11":"8-11","8 a 11":"8-11",
        "12":"12-15","12-15":"12-15","12–15":"12-15","12_15":"12-15","12 à 15":"12-15","12 a 15":"12-15",
        "16":"16-17","16-17":"16-17","16–17":"16-17","16_17":"16-17","16 à 17":"16-17","16 a 17":"16-17",
        "18":"18+","18+":"18+","18 et plus":"18+","18 ans et plus":"18+","adulte":"18+",
        "approfondi":"approfondi","approfondie":"approfondi","expert":"approfondi","detaille":"approfondi","détaillé":"approfondi",
    }
    niveau = corr.get(niveau, niveau)
    return niveau if niveau in NIVEAUX_AUTORISES else "18+"

CONSIGNES_NIVEAUX = {
    "8-11": "Utilisateur 8-11 ans : phrases très courtes, vocab simple, pas de mot compliqué comme 'anachronique', explique avec des mots d'enfant.",
    "12-15": "Utilisateur 12-15 ans : français simple, explique notions bibliques clairement.",
    "16-17": "Utilisateur 16-17 ans : français clair, distingue texte vs déduction.",
    "18+": "Utilisateur 18+ : français précis, distingue faits textuels vs déductions.",
    "approfondi": "Niveau approfondi : analyse détaillée, compare passages.",
}

MODELS_FALLBACK = [
    # Ordre basé sur vos tests réels (2026-09) : les alias "*-latest"
    # et gemini-pro-latest ont systématiquement fonctionné, tandis
    # que gemini-2.5-flash / gemini-2.5-flash-lite renvoyaient un
    # 404 malgré leur présence dans client.models.list() (souci
    # probable de routage/quota côté Google, pas une suppression
    # définitive) — ils restent en dernier recours plutôt que
    # d'être supprimés, au cas où cela se résorbe.
    "gemini-flash-lite-latest",
    "gemini-flash-latest",
    "gemini-pro-latest",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.5-pro",
]

_QUOTA_DAILY_EXHAUSTED = set()

def _extract_retry_delay(msg: str) -> float:
    if not isinstance(msg, str): return 0
    m = re.search(r'"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"', msg, re.I)
    if m: return float(m.group(1))
    m = re.search(r"Please retry in (\d+(?:\.\d+)?)s", msg, re.I)
    if m: return float(m.group(1))
    return 0

def classifier_erreur(e: Exception) -> dict:
    msg = str(e).lower()
    if "generaterequestsperdayperprojectpermodel-freetier" in msg or "requests per day" in msg:
        return {"type":"QUOTA_DAILY","retryable":False,"wait":0,"log":"Quota quotidien épuisé"}
    if "404" in msg or "not_found" in msg or "was not found" in msg:
        return {"type":"NOT_FOUND_404","retryable":False,"wait":0,"log":"Modèle inexistant"}
    if "503" in msg or "unavailable" in msg:
        return {"type":"UNAVAILABLE_503","retryable":True,"wait":3,"log":"Service indisponible"}
    if "429" in msg or "resource_exhausted" in msg or "rate limit" in msg:
        delay = _extract_retry_delay(str(e))
        return {"type":"QUOTA_TEMP","retryable":True,"wait":delay if delay>0 else 5,"log":"Limite débit"}
    if "400" in msg or "invalid_argument" in msg:
        return {"type":"BAD_REQUEST_400","retryable":False,"wait":0,"log":"Requête invalide"}
    return {"type":"OTHER","retryable":False,"wait":0,"log":"Erreur non catégorisée"}

def _sleep_with_jitter(base: float):
    if base>0: time.sleep(base * random.uniform(0.8,1.2))

def _formater_historique(historique) -> str:
    if not historique or not isinstance(historique, list): return ""
    lignes, total = [], 0
    for m in historique[-MAX_HISTORIQUE_MESSAGES:]:
        if not isinstance(m, dict): continue
        if m.get("role") not in {"user","assistant"}: continue
        c = str(m.get("content","")).strip()[:MAX_HISTORIQUE_CONTENT_LEN]
        if not c: continue
        role_label = "UTILISATEUR" if m["role"] == "user" else NOM_ASSISTANT.upper()
        ligne = f"{role_label} (précédent) : {c}"
        if total + len(ligne) > MAX_HISTORIQUE_LEN: break
        lignes.append(ligne); total+=len(ligne)
    return "\n".join(lignes).strip()

def _preparer_texte(texte: str, limite: int, suffixe: str) -> str:
    if not isinstance(texte, str): texte = str(texte)
    texte = texte.strip()
    return texte if len(texte)<=limite else texte[:limite]+suffixe

def _construire_contexte_rag(resultats: Union[str, List[Dict[str,Any]]]) -> str:
    if isinstance(resultats, str):
        return _preparer_texte(resultats, MAX_CONTEXT_LEN, "\n[...contexte tronqué...]")
    blocs = []
    for r in resultats[:5]:
        if not isinstance(r, dict):
            continue
        ref = r.get("reference","")
        txt = r.get("texte","")
        # Compatibilité : certains moteurs utilisent la clé "pertinence"
        # au lieu de "niveau_pertinence".
        niveau = r.get("niveau_pertinence") or r.get("pertinence") or "inconnu"
        justif = r.get("justification_pertinence","")
        principe = r.get("principe_biblique")
        bloc = f"[PASSAGE] Ref: {ref} | Pertinence: {niveau} | Texte: {txt} | Justif: {justif}"
        if principe:
            bloc += f" | Principe: {principe}"
        bloc += " [/PASSAGE]"
        blocs.append(bloc)
    contexte = "\n\n".join(blocs)
    return _preparer_texte(contexte, MAX_CONTEXT_LEN, "\n[...contexte tronqué...]")

def _construire_prompt(
    question_safe: str,
    contexte_rag: str,
    niveau_utilisateur: str,
    consigne_niveau: str,
    hist_texte: str,
    consignes_supplementaires: str,
    regle_pertinence: str,
) -> str:
    """
    Construit le prompt système envoyé à Gemini.
    Utilise les constantes d'identité définies dans identite.py.
    """
    # Construction des règles d'Apollos (depuis identite.py)
    regles_formatees = "\n".join(
        f"{i+1}. {regle}"
        for i, regle in enumerate(REGLES_APOLLOS)
    )

    # Construction du style d'Apollos (depuis identite.py)
    style_formate = (
        f"- Ton : {STYLE_APOLLOS['ton']}\n"
        f"- Longueur : {STYLE_APOLLOS['longueur']}\n"
        f"- Format : {STYLE_APOLLOS['format']}\n"
        f"- Langue : {STYLE_APOLLOS['langue']}\n"
        f"- Sources : {STYLE_APOLLOS['sources']}"
    )

    return f"""
Tu es {NOM_ASSISTANT}, l'assistant biblique de {NOM_APPLICATION}.
Tu réponds normalement aux questions bibliques en te basant sur la {VERSION_BIBLE}.

{consigne_niveau}

{regle_pertinence}

REGLES D'APOLLOS :
{regles_formatees}

REGLES DE FIDÉLITÉ BIBLIQUE :
1. Réponds UNIQUEMENT à partir du <BIBLE_CONTEXT> si pertinence = directe/forte.
2. Si pertinence faible, dis que ce n'est pas dans la Bible et corrige avec la vraie histoire.
3. Ne jamais inventer de verset ou d'histoire.
4. Distingue Saül roi vs Saül de Tarse, Marie mère Jésus vs Marie Magdala, etc.
5. David a battu Goliath avec fronde et pierre (1 Samuel 17), pas d'arme moderne.
6. Le mot "anachronique" : INTERDIT pour niveau 8-11. Pour 12-15 utilise-le 1 fois max si vraiment nécessaire. Pour 18+ tu peux l'utiliser mais pas à chaque phrase.

Si utilisateur demande qui est Jésus, réponds simplement: Fils de Dieu, Sauveur, mort et ressuscité (Jean 3:16), pas besoin de structure compliquée.

{consignes_supplementaires}

STYLE DE RÉPONSE :
{style_formate}

Format normal:
- Pour question simple: réponse courte et claire.
- Pour question complexe: 1. Réponse directe 2. Ce que disent les textes 3. Principe

<HISTORIQUE>
{hist_texte}
</HISTORIQUE>

<BIBLE_CONTEXT>
{contexte_rag}
</BIBLE_CONTEXT>

<USER_QUESTION>
{question_safe}
</USER_QUESTION>

NIVEAU: {niveau_utilisateur}
"""

def generer_reponse_biblique(
    question: str,
    versets_contexte: Union[str, List[Dict[str,Any]]],
    niveau_utilisateur: str = "18+",
    historique=None,
    consignes_supplementaires: str = "",
) -> str:
    if not isinstance(question, str): question = str(question)
    question = question.strip()
    if not question: return "Pose ta question biblique, je suis là."
    question_safe = _preparer_texte(question, MAX_QUESTION_LEN, " [question tronquée]")
    contexte_rag = _construire_contexte_rag(versets_contexte)
    niveau_utilisateur = normaliser_niveau_utilisateur(niveau_utilisateur)
    consigne_niveau = CONSIGNES_NIVEAUX[niveau_utilisateur]
    hist_texte = _formater_historique(historique) or "(aucun historique)"

    # DETECTION PERTINENCE FAIBLE POUR PROMPT INTELLIGENT
    pertinence_faible = False
    if isinstance(versets_contexte, list) and versets_contexte:
        niveaux = [
            (r.get("niveau_pertinence") or r.get("pertinence") or "")
            for r in versets_contexte if isinstance(r, dict)
        ]
        if niveaux and all(n in ("faible","hors_sujet","moderee") for n in niveaux):
            pertinence_faible = True

    consignes_supplementaires = _preparer_texte(
        consignes_supplementaires or "", 3000, "\n[...consignes tronquées...]"
    )

    regle_pertinence = ""
    if pertinence_faible:
        regle_pertinence = """
REGLE CRITIQUE - PERTINENCE FAIBLE:
Les passages fournis sont de pertinence modérée/faible/hors_sujet.
Cela veut dire que la question contient des éléments qui ne sont PAS dans la Bible (vidéo, bazooka, TikTok, Congo, pomme avec Goliath, etc.).
Dans ce cas, tu dois:
1. Dire clairement: "Cette affirmation ne se trouve pas dans la Bible."
2. Expliquer brièvement la réalité biblique (ex: Goliath = 1 Samuel 17 fronde/pierre, pas bazooka. Eden = Genèse 2-3 Adam/Eve, pas Goliath)
3. Ne PAS broder une longue exégèse avec les passages faibles (ex: Lamentations n'a rien à voir)
4. Ne PAS utiliser le mot "anachronique" pour les 8-11 ans. Utilise "ça n'existait pas à l'époque".
"""

    prompt = _construire_prompt(
        question_safe=question_safe,
        contexte_rag=contexte_rag,
        niveau_utilisateur=niveau_utilisateur,
        consigne_niveau=consigne_niveau,
        hist_texte=hist_texte,
        consignes_supplementaires=consignes_supplementaires,
        regle_pertinence=regle_pertinence,
    )

    MAX_RETRIES_503 = 2
    MAX_RETRIES_429 = 2
    for model_name in MODELS_FALLBACK:
        if model_name in _QUOTA_DAILY_EXHAUSTED: continue
        r503 = r429 = 0
        while True:
            try:
                response = client.models.generate_content(model=model_name, contents=prompt)
                txt = getattr(response, "text", None)
                if not txt: break
                txt = str(txt).strip()
                if not txt: break
                return txt
            except Exception as e:
                info = classifier_erreur(e)
                logger.warning(f"{info['log']} sur {model_name} | {info['type']}")
                if info["type"]=="QUOTA_DAILY":
                    _QUOTA_DAILY_EXHAUSTED.add(model_name); break
                if info["type"]=="NOT_FOUND_404": break
                if info["type"]=="BAD_REQUEST_400":
                    return "Désolé, la génération n'a pas pu être effectuée. Veuillez reformuler."
                if info["type"]=="UNAVAILABLE_503":
                    r503+=1
                    if r503>MAX_RETRIES_503: break
                    _sleep_with_jitter(info["wait"] * (2**(r503-1))); continue
                if info["type"]=="QUOTA_TEMP":
                    r429+=1
                    if r429>MAX_RETRIES_429: break
                    _sleep_with_jitter(info["wait"]); continue
                break
    return "Désolé, tous les modèles sont temporairement indisponibles. Réessayez dans quelques minutes."



# ============================================================
# STREAMING — Génération de réponse en temps réel
# ============================================================

def generer_reponse_biblique_stream(
    question: str,
    versets_contexte: Union[str, List[Dict[str, Any]]],
    niveau_utilisateur: str = "18+",
    historique=None,
    consignes_supplementaires: str = "",
):
    """
    Version streaming de generer_reponse_biblique.
    C'est un GÉNÉRATEUR Python qui yield les chunks de texte
    au fur et à mesure que Gemini les produit.

    Usage :
        for chunk in generer_reponse_biblique_stream(...):
            print(chunk, end="", flush=True)
    """
    if not isinstance(question, str):
        question = str(question)
    question = question.strip()
    if not question:
        yield "Pose ta question biblique, je suis là."
        return

    question_safe = _preparer_texte(question, MAX_QUESTION_LEN, " [question tronquée]")
    contexte_rag = _construire_contexte_rag(versets_contexte)
    niveau_utilisateur = normaliser_niveau_utilisateur(niveau_utilisateur)
    consigne_niveau = CONSIGNES_NIVEAUX[niveau_utilisateur]
    hist_texte = _formater_historique(historique) or "(aucun historique)"

    # Détection pertinence faible (même logique que la version non-stream)
    pertinence_faible = False
    if isinstance(versets_contexte, list) and versets_contexte:
        niveaux = [
            (r.get("niveau_pertinence") or r.get("pertinence") or "")
            for r in versets_contexte
            if isinstance(r, dict)
        ]
        if niveaux and all(n in ("faible", "hors_sujet", "moderee") for n in niveaux):
            pertinence_faible = True

    consignes_supplementaires = _preparer_texte(
        consignes_supplementaires or "", 3000, "\n[...consignes tronquées...]"
    )

    regle_pertinence = ""
    if pertinence_faible:
        regle_pertinence = """
REGLE CRITIQUE - PERTINENCE FAIBLE:
Les passages fournis sont de pertinence modérée/faible/hors_sujet.
Cela veut dire que la question contient des éléments qui ne sont PAS dans la Bible (vidéo, bazooka, TikTok, Congo, pomme avec Goliath, etc.).
Dans ce cas, tu dois:
1. Dire clairement: "Cette affirmation ne se trouve pas dans la Bible."
2. Expliquer brièvement la réalité biblique (ex: Goliath = 1 Samuel 17 fronde/pierre, pas bazooka. Eden = Genèse 2-3 Adam/Eve, pas Goliath)
3. Ne PAS broder une longue exégèse avec les passages faibles (ex: Lamentations n'a rien à voir)
4. Ne PAS utiliser le mot "anachronique" pour les 8-11 ans. Utilise "ça n'existait pas à l'époque".
"""

    prompt = _construire_prompt(
        question_safe=question_safe,
        contexte_rag=contexte_rag,
        niveau_utilisateur=niveau_utilisateur,
        consigne_niveau=consigne_niveau,
        hist_texte=hist_texte,
        consignes_supplementaires=consignes_supplementaires,
        regle_pertinence=regle_pertinence,
    )

    MAX_RETRIES_503 = 2
    MAX_RETRIES_429 = 2

    for model_name in MODELS_FALLBACK:
        if model_name in _QUOTA_DAILY_EXHAUSTED:
            continue

        r503 = r429 = 0
        while True:
            try:
                # ⚡ STREAMING : generate_content_stream au lieu de generate_content
                stream = client.models.generate_content_stream(
                    model=model_name,
                    contents=prompt,
                )

                got_any = False
                for chunk in stream:
                    # Récupère le texte du chunk
                    txt = getattr(chunk, "text", None)
                    if not txt:
                        continue
                    txt = str(txt)
                    if not txt:
                        continue
                    got_any = True
                    yield txt

                if got_any:
                    return  # Streaming terminé avec succès

                # Si aucun chunk reçu, on essaie le modèle suivant
                break

            except Exception as e:
                info = classifier_erreur(e)
                logger.warning(
                    f"[STREAM] {info['log']} sur {model_name} | {info['type']}"
                )
                if info["type"] == "QUOTA_DAILY":
                    _QUOTA_DAILY_EXHAUSTED.add(model_name)
                    break
                if info["type"] == "NOT_FOUND_404":
                    break
                if info["type"] == "BAD_REQUEST_400":
                    yield "Désolé, la génération n'a pas pu être effectuée. Veuillez reformuler."
                    return
                if info["type"] == "UNAVAILABLE_503":
                    r503 += 1
                    if r503 > MAX_RETRIES_503:
                        break
                    _sleep_with_jitter(info["wait"] * (2 ** (r503 - 1)))
                    continue
                if info["type"] == "QUOTA_TEMP":
                    r429 += 1
                    if r429 > MAX_RETRIES_429:
                        break
                    _sleep_with_jitter(info["wait"])
                    continue
                break

    yield "Désolé, tous les modèles sont temporairement indisponibles. Réessayez dans quelques minutes."
    