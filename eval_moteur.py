# import json
# from pathlib import Path
# from typing import Any, Dict, List, Tuple
# from moteur_biblique_optimise import rechercher

# # ============================================================
# # 🎯 CONFIG PRODUCTION
# # ============================================================
# K_EVAL = 3

# GROUND_TRUTH = [
#     {
#         "id": 1,
#         "question": "Comment obtenir le pardon de Dieu?",
#         "versets_attendus": ["1 Jean 1:9", "Éphésiens 1:7", "Psaume 103:12"],
#     },
#     {
#         "id": 2,
#         "question": "Que faire face à l'anxiété et l'inquiétude?",
#         "versets_attendus": ["Philippiens 4:6-7", "Matthieu 6:34", "1 Pierre 5:7"],
#     },
#     {
#         "id": 3,
#         "question": "Comment surmonter la colère?",
#         "versets_attendus": ["Éphésiens 4:26-27", "Jacques 1:19-20", "Proverbes 15:1"],
#     },
# ]

# def normaliser_reference(reference: Any) -> str:
#     if reference is None:
#         return ""
#     ref = str(reference).strip().lower()
#     ref = ref.replace("é", "e").replace("è", "e").replace("ê", "e")
#     return " ".join(ref.split())

# def extraire_references(resultats: Any) -> List[str]:
#     if not isinstance(resultats, list):
#         return []
#     refs = []
#     for r in resultats:
#         if not isinstance(r, dict):
#             continue
#         ref = normaliser_reference(r.get("reference", ""))
#         if ref:
#             refs.append(ref)
#     return refs

# def valider_dataset(dataset: Any) -> Tuple[bool, str]:
#     if not isinstance(dataset, list):
#         return False, "Le dataset doit être une liste."
#     if not dataset:
#         return False, "Le dataset est vide."
#     for index, item in enumerate(dataset, start=1):
#         if not isinstance(item, dict):
#             return False, f"Entrée #{index} invalide."
#         if not isinstance(item.get("question"), str) or not item.get("question").strip():
#             return False, f"Question invalide entrée #{index}."
#         if not isinstance(item.get("versets_attendus"), list) or not item.get("versets_attendus"):
#             return False, f"Aucun verset attendu entrée #{index}."
#     return True, ""

# def charger_ground_truth_defaut() -> List[Dict[str, Any]]:
#     chemin = Path("ground_truth.json")
#     if chemin.exists():
#         with open(chemin, "r", encoding="utf-8") as f:
#             return json.load(f)
#     return GROUND_TRUTH  # Fallback si le JSON externe n'existe pas encore

# def evaluer_moteur_production(dataset: List[Dict[str, Any]] = None, k: int = K_EVAL) -> Dict[str, Any]:
#     """
#     Version PRODUCTION - Aucun print.
#     À appeler depuis main.py si besoin de monitoring.
#     Retourne un dict avec les scores.
#     """
#     if dataset is None:
#         dataset = charger_ground_truth_defaut()

#     valide, msg = valider_dataset(dataset)
#     if not valide:
#         return {"erreur": msg, "valide": False}

#     cache = {}
#     for item in dataset:
#         try:
#             res = rechercher(item["question"], nombre_resultats=k)
#         except Exception:
#             res = []
#         cache[item["id"]] = extraire_references(res)

#     hits = 0
#     total_attendus = 0
#     total_retrouves = 0
#     somme_mrr = 0.0
#     details = []

#     for item in dataset:
#         attendus = {normaliser_reference(v) for v in item["versets_attendus"]}
#         trouves_list = cache[item["id"]]
#         inter = attendus.intersection(set(trouves_list))

#         if inter:
#             hits += 1

#         total_attendus += len(attendus)
#         total_retrouves += len(inter)

#         rr = 0.0
#         for rang, ref in enumerate(trouves_list, start=1):
#             if ref in attendus:
#                 rr = 1.0 / rang
#                 break
#         somme_mrr += rr

#         details.append({
#             "id": item["id"],
#             "hit": bool(inter),
#             "recall": len(inter) / len(attendus) if attendus else 0,
#             "mrr": rr
#         })

#     return {
#         "valide": True,
#         "k": k,
#         "hit_rate": (hits / len(dataset) * 100) if dataset else 0,
#         "recall": (total_retrouves / total_attendus * 100) if total_attendus else 0,
#         "mrr": somme_mrr / len(dataset) if dataset else 0,
#         "total_questions": len(dataset),
#         "details": details
#     }

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Tuple
from collections import Counter
import re

logger = logging.getLogger(__name__)

# ============================================================
# CONFIG PRODUCTION - BEN V2
# ============================================================
K_EVAL = 5
RESULTS_DIR = Path(__file__).parent / "eval_results"
RESULTS_DIR.mkdir(exist_ok=True)

try:
    from moteur_biblique_optimise import rechercher
    MOTEUR_PROD = True
except ImportError:
    from recherche_hybride import rechercher
    MOTEUR_PROD = False

# Dataset de base (fallback)
GROUND_TRUTH = [
    {
        "id": 1,
        "question": "Comment obtenir le pardon de Dieu?",
        "versets_attendus": ["1 Jean 1:9", "Éphésiens 1:7", "Psaume 103:12"],
        "type": "directe"
    },
    {
        "id": 2,
        "question": "Que faire face à l'anxiété et l'inquiétude?",
        "versets_attendus": ["Philippiens 4:6-7", "Matthieu 6:34", "1 Pierre 5:7"],
        "type": "principe"
    },
    {
        "id": 3,
        "question": "Comment surmonter la colère?",
        "versets_attendus": ["Éphésiens 4:26-27", "Jacques 1:19-20", "Proverbes 15:1"],
        "type": "principe"
    },
    # === TA PRIORITÉ : SUJETS MODERNES ===
    {
        "id": 4,
        "question": "Que dit la Bible sur l'intelligence artificielle?",
        "versets_attendus": [], # Aucune directe attendue
        "type": "sujet_moderne",
        "sujet": "intelligence artificielle",
        "comportement_attendu": "doit_detecter_moderne_et_ne_pas_dire_directe"
    },
    {
        "id": 5,
        "question": "Que dit Jean 3:16?",
        "versets_attendus": ["Jean 3:16"],
        "type": "reference",
        "est_reference_explicite": True
    },
]

# ============================================================
# NORMALISATION
# ============================================================
def normaliser_reference(reference: Any) -> str:
    if reference is None: return ""
    ref = str(reference).strip().lower()
    ref = ref.replace("é","e").replace("è","e").replace("ê","e").replace("à","a").replace("â","a")
    ref = re.sub(r"\s+", " ", ref)
    return ref

def extraire_references(resultats: Any) -> List[str]:
    if not isinstance(resultats, list): return []
    refs = []
    for r in resultats:
        if not isinstance(r, dict): continue
        ref = normaliser_reference(r.get("reference",""))
        if ref: refs.append(ref)
    return refs

def valider_dataset(dataset: Any) -> Tuple[bool, str]:
    if not isinstance(dataset, list): return False, "Dataset doit être liste"
    if not dataset: return False, "Dataset vide"
    for idx, item in enumerate(dataset, start=1):
        if not isinstance(item, dict): return False, f"Entrée #{idx} invalide"
        if not isinstance(item.get("question"), str) or not item.get("question").strip():
            return False, f"Question invalide #{idx}"
        if not isinstance(item.get("versets_attendus"), list):
            return False, f"versets_attendus doit être liste #{idx}"
    return True, ""

def charger_ground_truth_defaut() -> List[Dict[str, Any]]:
    chemin = Path("ground_truth.json")
    if chemin.exists():
        try:
            with open(chemin, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list) and data: return data
        except: pass
    return GROUND_TRUTH

# ============================================================
# ÉVALUATION PRODUCTION - SANS PRINT (pour monitoring api)
# ============================================================
def evaluer_moteur_production(dataset: List[Dict[str, Any]] = None, k: int = K_EVAL) -> Dict[str, Any]:
    """
    Version PRODUCTION - Aucun print, aucun effet de bord.
    Utilisable depuis main.py / api.py pour health check.
    """
    if dataset is None:
        dataset = charger_ground_truth_defaut()

    valide, msg = valider_dataset(dataset)
    if not valide:
        return {"erreur": msg, "valide": False}

    cache_resultats = {}
    for item in dataset:
        try:
            res = rechercher(item["question"], nombre_resultats=k)
        except Exception:
            logger.exception(f"Eval: erreur recherche id={item.get('id')}")
            res = []
        cache_resultats[item["id"]] = res

    hits = 0
    total_attendus = 0
    total_retrouves = 0
    somme_mrr = 0.0
    details = []
    # Métriques qualité pertinence PROD
    cas_directe_sur_moderne = 0
    cas_faible_hors_sujet_dans_top = 0
    doublons_total = 0

    for item in dataset:
        attendus = {normaliser_reference(v) for v in item["versets_attendus"]}
        res_list = cache_resultats[item["id"]]
        trouves_norm = extraire_references(res_list)
        inter = attendus.intersection(set(trouves_norm))

        if inter or (not attendus and item.get("type")=="sujet_moderne"):
            # Pour sujet moderne sans attendu, hit = a bien détecté moderne
            if item.get("type")=="sujet_moderne":
                if any(r.get("est_sujet_moderne") for r in res_list[:3]):
                    hits += 1
            else:
                if inter: hits += 1

        total_attendus += len(attendus)
        total_retrouves += len(inter)

        rr = 0.0
        for rang, ref in enumerate(trouves_norm, start=1):
            if ref in attendus:
                rr = 1.0 / rang
                break
        somme_mrr += rr

        # Qualité PROD : détection abusive directe sur moderne
        niveaux_top3 = [r.get("niveau_pertinence") for r in res_list[:3] if isinstance(r, dict)]
        if item.get("type")=="sujet_moderne" and "directe" in niveaux_top3:
            # Si le passage dit directe alors que c'est IA = bug critique
            if any(r.get("est_sujet_moderne") and r.get("niveau_pertinence")=="directe" for r in res_list[:3]):
                cas_directe_sur_moderne += 1

        if any(n in ("faible","hors_sujet") for n in niveaux_top3):
            cas_faible_hors_sujet_dans_top += 1

        refs_set = set(trouves_norm)
        doublons_total += len(trouves_norm) - len(refs_set)

        details.append({
            "id": item["id"],
            "question": item["question"][:80],
            "type": item.get("type","inconnu"),
            "hit": bool(inter) if attendus else any(r.get("est_sujet_moderne") for r in res_list[:3]),
            "recall": len(inter)/len(attendus) if attendus else (1.0 if item.get("type")=="sujet_moderne" else 0),
            "mrr": rr,
            "top_refs": trouves_norm[:3],
            "niveaux_top3": niveaux_top3,
            "est_moderne_detecte": any(r.get("est_sujet_moderne") for r in res_list[:3]) if res_list else False
        })

    return {
        "valide": True,
        "k": k,
        "hit_rate": (hits/len(dataset)*100) if dataset else 0,
        "recall": (total_retrouves/total_attendus*100) if total_attendus else (100 if any(d["type"]=="sujet_moderne" for d in details) else 0),
        "mrr": somme_mrr/len(dataset) if dataset else 0,
        "total_questions": len(dataset),
        # Métriques qualité CRITIQUES pour ta priorité
        "cas_directe_sur_moderne": cas_directe_sur_moderne, # DOIT ÊTRE 0
        "cas_faible_hors_sujet_dans_top": cas_faible_hors_sujet_dans_top, # DOIT ÊTRE 0
        "doublons_total": doublons_total,
        "details": details
    }

# ============================================================
# CLI INTERNE - Outil de debug séparé (ne s'exécute pas en prod)
# ============================================================
def _cli_eval():
    logging.basicConfig(level=logging.INFO)
    print("\n" + "="*70)
    print("🧪 EVAL MOTEUR BIBLE-IA - PROD V2")
    print("="*70)

    dataset = charger_ground_truth_defaut()
    print(f"📚 Dataset: {len(dataset)} questions")

    resultat = evaluer_moteur_production(dataset, k=K_EVAL)

    if not resultat.get("valide"):
        print(f"❌ Erreur: {resultat.get('erreur')}")
        return

    print(f"\n📊 RÉSULTATS k={resultat['k']}:")
    print(f" Hit Rate : {resultat['hit_rate']:.1f}%")
    print(f" Recall : {resultat['recall']:.1f}%")
    print(f" MRR : {resultat['mrr']:.3f}")
    print(f" Doublons : {resultat['doublons_total']}")

    print(f"\n🎯 QUALITÉ PERTINENCE (TA PRIORITÉ):")
    print(f" ❌ Directe abusive sur sujet moderne : {resultat['cas_directe_sur_moderne']} (objectif 0)")
    print(f" ❌ Faible/hors_sujet dans top3 : {resultat['cas_faible_hors_sujet_dans_top']} (objectif 0)")

    if resultat['cas_directe_sur_moderne']>0:
        print(" ⚠️ ALERTE: Ton moteur dit encore 'directe' pour l'IA - corrige moteur_biblique_optimise.py")

    print(f"\n📖 DÉTAILS:")
    for d in resultat["details"]:
        statut = "✅" if d["hit"] else "❌"
        print(f" {statut} #{d['id']} [{d['type']}] MRR={d['mrr']:.2f} | {d['top_refs']} | niveaux={d['niveaux_top3']} | moderne_detecte={d['est_moderne_detecte']}")

    # Sauvegarde
    out = RESULTS_DIR / "eval_dernier.json"
    with open(out, "w", encoding="utf-8") as f:
        json.dump(resultat, f, ensure_ascii=False, indent=2)
    print(f"\n💾 Sauvegardé: {out}")
    print("="*70)

if __name__ == "__main__":
    _cli_eval()
    