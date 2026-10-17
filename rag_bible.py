
import logging
from typing import List, Dict, Any, Tuple
from pathlib import Path

logger = logging.getLogger(__name__)

# Imports moteurs PROD que nous avons corrigés
try:
    from moteur_biblique_optimise import rechercher as moteur_rechercher
    from moteur_biblique_optimise import detecter_references
    MOTEUR_PROD_DISPO = True
except ImportError:
    # Fallback ancien recherche_hybride si moteur PROD pas encore installé
    try:
        from recherche_hybride import rechercher as moteur_rechercher
        MOTEUR_PROD_DISPO = False
    except ImportError:
        moteur_rechercher = None
        MOTEUR_PROD_DISPO = False

try:
    from generateur_reponse import generer_reponse_biblique
except ImportError:
    generer_reponse_biblique = None

# === CONFIG PROD RAG ===
MAX_CONTEXT_TOKENS = 3500 # ~25000 chars
MAX_VERSETS_RAG = 5 # Tu as dit : je préfère 3 pertinents à 12 vagues
MIN_SCORE_FINAL = 0.15

def _estimer_tokens(text: str) -> int:
    # Estimation simple : 1 token ~ 4 chars français
    return len(text) // 4

def construire_contexte_rag(resultats_filtres: List[Dict[str, Any]]) -> Tuple[str, List[Dict]]:
    """
    Construit le contexte RAG sans couper un verset au milieu.
    Ajoute des passages complets jusqu'à la limite.
    Retourne (texte_contexte, passages_utilises)
    """
    passages = []
    texte_parts = []
    tokens_actuels = 0

    for r in resultats_filtres:
        if len(passages) >= MAX_VERSETS_RAG:
            break

        bloc = f"{r.get('reference','')} : {r.get('texte','')}"
        tokens_bloc = _estimer_tokens(bloc)

        if tokens_actuels + tokens_bloc > MAX_CONTEXT_TOKENS:
            # Ne coupe pas au milieu, on s'arrête
            if not passages:
                # Si même le premier dépasse, on le prend quand même (cas rare)
                passages.append(r)
                texte_parts.append(bloc)
            break

        passages.append(r)
        texte_parts.append(bloc)
        tokens_actuels += tokens_bloc

    contexte_str = "\n\n".join(texte_parts)
    return contexte_str, passages

def pipeline_rag(
    question: str,
    nombre_resultats_recherche: int = 50,
    niveau_utilisateur: str = "18+",
    historique: List[Dict] = None
) -> Dict[str, Any]:
    """
    Pipeline complet PROD - chef d'orchestre RAG
    Utilisé par main.py
    """
    if not question or not isinstance(question, str):
        return {
            "reponse": "Pose ta question biblique, je suis là.",
            "sources": [],
            "pertinence": [],
            "erreur": "question_vide"
        }

    if moteur_rechercher is None:
        logger.error("Moteur recherche non disponible")
        return {
            "reponse": "Erreur interne : moteur de recherche indisponible.",
            "sources": [],
            "erreur": "moteur_indispo"
        }

    # 1. COMPRÉHENSION + RECHERCHE (déjà avec pertinence intégrée si moteur PROD)
    try:
        candidats = moteur_rechercher(question, nombre_resultats=nombre_resultats_recherche)
    except Exception as e:
        logger.exception(f"Erreur recherche pour question: {question[:50]}")
        return {
            "reponse": "Désolé, une erreur technique a empêché la recherche.",
            "sources": [],
            "erreur": "recherche_echouee"
        }

    if not candidats:
        # Aucun passage même modéré - honnêteté biblique
        if generer_reponse_biblique:
            try:
                rep = generer_reponse_biblique(
                    question=question,
                    versets_contexte="(aucun passage suffisamment pertinent trouvé)",
                    niveau_utilisateur=niveau_utilisateur,
                    historique=historique
                )
                return {"reponse": rep, "sources": [], "candidats": []}
            except:
                pass
        return {
            "reponse": "Je n'ai trouvé aucun passage réellement pertinent pour cette question dans les données disponibles. Peux-tu reformuler?",
            "sources": [],
            "candidats": []
        }

    # 2. ÉVALUATION + FILTRAGE déjà fait dans moteur PROD
    # Si ancien moteur, on filtre ici faiblement
    if not MOTEUR_PROD_DISPO:
        # Ancien moteur n'a pas de niveau, on garde top 5 sémantique
        filtres = candidats[:MAX_VERSETS_RAG]
    else:
        # Moteur PROD a déjà filtré directe/forte/moderee et exclu hors_sujet/faible
        # On applique règle : directe prio max, forte acceptée, modérée prudente
        filtres = []
        for c in candidats:
            niveau = c.get("niveau_pertinence", "moderee")
            if niveau in ("directe", "forte", "moderee"):
                if c.get("score_final", 0) >= MIN_SCORE_FINAL or c.get("est_reference_demandee"):
                    filtres.append(c)
        # Si référence demandée, on la garde même si score faible
        refs_demandees = [c for c in candidats if c.get("est_reference_demandee")]
        if refs_demandees:
            # Mettre références en tête
            filtres = refs_demandees + [f for f in filtres if not f.get("est_reference_demandee")]

    if not filtres:
        filtres = candidats[:1] # Dernier recours : au moins 1 si référence

    # 3. CLASSEMENT (déjà trié par score_final)
    # 4. CONTEXTE RAG (sans couper verset)
    contexte_str, passages_rag = construire_contexte_rag(filtres)

    # 5. GÉNÉRATION avec métadonnées de pertinence
    if generer_reponse_biblique is None:
        return {
            "reponse": contexte_str,
            "sources": passages_rag,
            "erreur": "generateur_indispo"
        }

    try:
        # NOUVEAUTÉ : on passe la liste enrichie, pas seulement le string
        # Le générateur PROD sait gérer les deux
        reponse = generer_reponse_biblique(
            question=question,
            versets_contexte=passages_rag, # Liste avec niveau, principe, justification
            niveau_utilisateur=niveau_utilisateur,
            historique=historique
        )
    except Exception as e:
        logger.exception("Erreur génération réponse")
        reponse = "Désolé, la génération de réponse a échoué. Réessaye dans quelques instants."

    return {
        "reponse": reponse,
        "sources": passages_rag,
        "candidats_bruts": len(candidats),
        "contexte_rag": contexte_str
    }

# Compatibilité ancienne API
def rag_bible(question: str, **kwargs):
    return pipeline_rag(question, **kwargs)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    q = "Que dit la Bible sur l'intelligence artificielle?"
    res = pipeline_rag(q, niveau_utilisateur="18+")
    print(res["reponse"][:500])
    print("\nSources:", [s["reference"] for s in res["sources"]])
    