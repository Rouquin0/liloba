# import json
# import re
# import unicodedata
# from pathlib import Path


# # ============================================================
# # CONFIGURATION
# # ============================================================

# FICHIER_INDEX = "versets_index.json"
# FICHIER_BIBLE = "bible.json"
# FICHIER_SORTIE = "profils_versets.json"


# # ============================================================
# # NORMALISATION DU TEXTE
# # ============================================================

# def normaliser_texte(texte):
#     """
#     Met le texte en minuscules et supprime les accents
#     afin de faciliter la détection des mots.
#     """
#     texte = str(texte).lower()

#     texte = unicodedata.normalize("NFD", texte)
#     texte = "".join(
#         caractere
#         for caractere in texte
#         if unicodedata.category(caractere) != "Mn"
#     )

#     return texte


# def contient(texte, expression):
#     """
#     Vérifie si une expression apparaît dans le texte.
#     """
#     return expression in texte


# def compter_occurrences(texte, expressions):
#     """
#     Compte combien d'expressions d'une liste apparaissent
#     dans le texte.
#     """
#     total = 0

#     for expression in expressions:
#         if expression in texte:
#             total += 1

#     return total


# # ============================================================
# # MOTS / EXPRESSIONS BIBLIQUES
# # ============================================================

# MOTS_PARDON = [
#     "pardon",
#     "pardonne",
#     "pardonnez",
#     "pardonner",
#     "pardonne-moi",
#     "pardonne-nous",
#     "pardonne-leur",
#     "pardonne-lui",
#     "pardonnez-nous",
#     "pardonnez-leur",
#     "pardonnez-lui",
#     "pardonne les",
#     "pardonné",
#     "pardonnée",
#     "pardonnés",
#     "pardonnés",
#     "remets",
#     "remettre",
#     "remise",
#     "remis",
# ]

# MOTS_REPENTANCE = [
#     "repens",
#     "repentez",
#     "repentir",
#     "repentance",
#     "repenti",
#     "repentie",
#     "convertis",
#     "convertissez",
#     "conversion",
#     "convertir",
#     "retourne",
#     "retournez",
#     "retour",
#     "reviens",
#     "revenez",
#     "confesse",
#     "confesser",
#     "confession",
#     "avou",
#     "avoue",
#     "avouer",
# ]

# MOTS_PECHE = [
#     "peche",
#     "peches",
#     "pecheur",
#     "pecheurs",
#     "faute",
#     "fautes",
#     "iniquite",
#     "iniquites",
#     "transgression",
#     "transgressions",
#     "mal",
#     "mechancete",
# ]

# MOTS_DIEU = [
#     "dieu",
#     "seigneur",
#     "eternel",
#     "pere",
#     "christ",
#     "jesus",
# ]

# MOTS_HUMAINS = [
#     "homme",
#     "hommes",
#     "frere",
#     "freres",
#     "soeur",
#     "soeurs",
#     "prochain",
#     "prochains",
#     "ennemi",
#     "ennemis",
#     "ami",
#     "amis",
#     "quelqu'un",
#     "quelqu",
#     "les uns les autres",
#     "les uns envers les autres",
#     "reciproquement",
#     "offense",
#     "offenses",
# ]

# MOTS_PRIERE = [
#     "prie",
#     "prier",
#     "priere",
#     "prieres",
#     "invoque",
#     "invoquer",
#     "demande",
#     "demander",
#     "crie",
#     "crier",
#     "supplication",
#     "supplications",
# ]

# MOTS_MISERICORDE = [
#     "misericorde",
#     "grace",
#     "compassion",
#     "pitie",
#     "bonte",
# ]

# MOTS_SALUT = [
#     "salut",
#     "sauve",
#     "sauver",
#     "sauveur",
#     "sauves",
#     "redemption",
#     "redempteur",
#     "delivrance",
#     "delivre",
# ]


# # ============================================================
# # EXTRACTION DES INFORMATIONS
# # ============================================================

# def extraire_versets():
#     """
#     Essaie d'abord de charger versets_index.json.
#     Si le fichier n'est pas disponible, utilise bible.json.
#     """

#     if Path(FICHIER_INDEX).exists():

#         print(f"📖 Chargement de {FICHIER_INDEX}...")

#         with open(FICHIER_INDEX, "r", encoding="utf-8") as fichier:
#             donnees = json.load(fichier)

#         versets = []

#         for indice, element in enumerate(donnees):

#             texte = (
#                 element.get("texte")
#                 or element.get("text")
#                 or element.get("Scripture")
#                 or element.get("scripture")
#                 or ""
#             )

#             reference = (
#                 element.get("reference")
#                 or element.get("Reference")
#                 or ""
#             )

#             vrai_indice = element.get("indice", indice)

#             versets.append({
#                 "indice": vrai_indice,
#                 "reference": reference,
#                 "texte": texte
#             })

#         return versets

#     # --------------------------------------------------------
#     # FALLBACK : bible.json
#     # --------------------------------------------------------

#     if Path(FICHIER_BIBLE).exists():

#         print(f"📖 {FICHIER_INDEX} introuvable.")
#         print(f"📖 Utilisation de {FICHIER_BIBLE}...")

#         with open(FICHIER_BIBLE, "r", encoding="utf-8") as fichier:
#             donnees = json.load(fichier)

#         versets = []

#         for indice, element in enumerate(donnees):

#             texte = (
#                 element.get("texte")
#                 or element.get("text")
#                 or element.get("Texte")
#                 or element.get("Scripture")
#                 or element.get("scripture")
#                 or ""
#             )

#             livre = (
#                 element.get("livre")
#                 or element.get("Livre")
#                 or element.get("Book")
#                 or element.get("book")
#                 or ""
#             )

#             chapitre = (
#                 element.get("chapitre")
#                 or element.get("Chapitre")
#                 or element.get("Chapter")
#                 or element.get("chapter")
#                 or ""
#             )

#             verset = (
#                 element.get("verset")
#                 or element.get("Verset")
#                 or element.get("Verse")
#                 or element.get("verse")
#                 or ""
#             )

#             reference = f"{livre} {chapitre}:{verset}"

#             versets.append({
#                 "indice": indice,
#                 "reference": reference,
#                 "texte": texte
#             })

#         return versets

#     raise FileNotFoundError(
#         "Impossible de trouver versets_index.json ou bible.json."
#     )


# # ============================================================
# # PROFILAGE D'UN VERSET
# # ============================================================

# def profiler_verset(verset):

#     texte_original = verset["texte"]
#     texte = normaliser_texte(texte_original)

#     scores = {
#         "pardon": 0,
#         "pardon_divin": 0,
#         "pardon_humain": 0,
#         "repentance": 0,
#         "priere": 0,
#         "miséricorde": 0,
#         "salut": 0,
#     }

#     orientations = []
#     roles = []
#     concepts = []

#     # --------------------------------------------------------
#     # Détection du pardon
#     # --------------------------------------------------------

#     score_pardon = compter_occurrences(
#         texte,
#         MOTS_PARDON
#     )

#     if score_pardon > 0:
#         scores["pardon"] = score_pardon
#         concepts.append("pardon")

#     # --------------------------------------------------------
#     # Détection du péché
#     # --------------------------------------------------------

#     score_peche = compter_occurrences(
#         texte,
#         MOTS_PECHE
#     )

#     if score_peche > 0:
#         concepts.append("péché")

#     # --------------------------------------------------------
#     # Détection de Dieu
#     # --------------------------------------------------------

#     score_dieu = compter_occurrences(
#         texte,
#         MOTS_DIEU
#     )

#     dieu_present = score_dieu > 0

#     # --------------------------------------------------------
#     # Détection des humains
#     # --------------------------------------------------------

#     score_humain = compter_occurrences(
#         texte,
#         MOTS_HUMAINS
#     )

#     humain_present = score_humain > 0

#     # --------------------------------------------------------
#     # Détection de la repentance
#     # --------------------------------------------------------

#     score_repentance = compter_occurrences(
#         texte,
#         MOTS_REPENTANCE
#     )

#     if score_repentance > 0:
#         scores["repentance"] = score_repentance
#         concepts.append("repentance")

#         roles.append("repentance")
#         orientations.append("humain→Dieu")

#     # --------------------------------------------------------
#     # Détection de la prière
#     # --------------------------------------------------------

#     score_priere = compter_occurrences(
#         texte,
#         MOTS_PRIERE
#     )

#     if score_priere > 0:
#         scores["priere"] = score_priere
#         concepts.append("prière")

#     # --------------------------------------------------------
#     # Détection miséricorde / grâce
#     # --------------------------------------------------------

#     score_misericorde = compter_occurrences(
#         texte,
#         MOTS_MISERICORDE
#     )

#     if score_misericorde > 0:
#         scores["miséricorde"] = score_misericorde
#         concepts.append("miséricorde")

#     # --------------------------------------------------------
#     # Détection du salut
#     # --------------------------------------------------------

#     score_salut = compter_occurrences(
#         texte,
#         MOTS_SALUT
#     )

#     if score_salut > 0:
#         scores["salut"] = score_salut
#         concepts.append("salut")

#     # ========================================================
#     # ORIENTATION DU PARDON
#     # ========================================================

#     if score_pardon > 0:

#         # ----------------------------------------------------
#         # Dieu → humain
#         # ----------------------------------------------------

#         if dieu_present:

#             score_divin = (
#                 score_pardon
#                 + score_dieu * 0.8
#                 + score_peche * 0.4
#             )

#             scores["pardon_divin"] = round(score_divin, 3)

#             roles.append("pardon_divin")
#             orientations.append("Dieu→humain")

#         # ----------------------------------------------------
#         # humain → humain
#         # ----------------------------------------------------

#         if humain_present:

#             score_humain_pardon = (
#                 score_pardon
#                 + score_humain * 0.8
#             )

#             scores["pardon_humain"] = round(
#                 score_humain_pardon,
#                 3
#             )

#             roles.append("pardon_humain")
#             orientations.append("humain→humain")

#         # ----------------------------------------------------
#         # humain → Dieu
#         # ----------------------------------------------------

#         expressions_demande = [
#             "pardonne-moi",
#             "pardonne-nous",
#             "pardonne leur",
#             "pardonne-lui",
#             "pardonne mon",
#             "pardonne nos",
#             "pardonne mes",
#             "prie le seigneur",
#             "prie dieu",
#             "confesse",
#             "repens",
#             "repentez",
#         ]

#         demande_pardon = any(
#             expression in texte
#             for expression in expressions_demande
#         )

#         if demande_pardon:

#             roles.append("demande_de_pardon")
#             orientations.append("humain→Dieu")

#     # ========================================================
#     # CAS PARTICULIER : PARDON ENTRE HUMAINS
#     # ========================================================

#     expressions_pardon_humain = [
#         "pardonnez-vous",
#         "pardonnez vous",
#         "pardonnant reciproquement",
#         "vous pardonnant",
#         "pardonne a ton frere",
#         "pardonne a ton prochain",
#         "pardonne a ceux",
#         "pardonne a votre frere",
#         "pardonne a votre prochain",
#         "offense",
#         "offenses",
#         "les uns les autres",
#         "les uns envers les autres",
#         "ennemi",
#         "ennemis",
#     ]

#     if any(
#         expression in texte
#         for expression in expressions_pardon_humain
#     ):
#         if "pardon_humain" not in roles:
#             roles.append("pardon_humain")

#         if "humain→humain" not in orientations:
#             orientations.append("humain→humain")

#         scores["pardon_humain"] += 2

#     # ========================================================
#     # NETTOYAGE DES DOUBLONS
#     # ========================================================

#     roles = list(dict.fromkeys(roles))
#     orientations = list(dict.fromkeys(orientations))
#     concepts = list(dict.fromkeys(concepts))

#     # --------------------------------------------------------
#     # Si le verset parle de pardon mais qu'aucune orientation
#     # claire n'a été trouvée
#     # --------------------------------------------------------

#     if score_pardon > 0 and not orientations:
#         roles.append("pardon_general")

#     # --------------------------------------------------------
#     # Profil final
#     # --------------------------------------------------------

#     return {
#         "indice": verset["indice"],
#         "reference": verset["reference"],
#         "orientations": orientations,
#         "roles": roles,
#         "concepts": concepts,
#         "scores": scores
#     }


# # ============================================================
# # PROGRAMME PRINCIPAL
# # ============================================================

# def main():

#     print()
#     print("==============================================")
#     print("🧠 PROFILAGE BIBLIQUE DES VERSETS")
#     print("==============================================")
#     print()

#     versets = extraire_versets()

#     print(f"✅ {len(versets)} versets chargés !")
#     print()

#     profils = []

#     for position, verset in enumerate(versets, start=1):

#         profil = profiler_verset(verset)

#         profils.append(profil)

#         # Affichage de progression
#         if position % 5000 == 0:
#             print(
#                 f"🔎 Analyse : {position}/{len(versets)} versets..."
#             )

#     # ========================================================
#     # SAUVEGARDE
#     # ========================================================

#     with open(
#         FICHIER_SORTIE,
#         "w",
#         encoding="utf-8"
#     ) as fichier:

#         json.dump(
#             profils,
#             fichier,
#             ensure_ascii=False,
#             indent=2
#         )

#     print()
#     print("==============================================")
#     print("🎉 PROFILAGE TERMINÉ !")
#     print("==============================================")
#     print()

#     print(f"📚 Versets analysés : {len(profils)}")
#     print(f"💾 Fichier créé : {FICHIER_SORTIE}")
#     print()

#     # ========================================================
#     # STATISTIQUES
#     # ========================================================

#     pardon = 0
#     pardon_divin = 0
#     pardon_humain = 0
#     repentance = 0
#     priere = 0

#     for profil in profils:

#         if "pardon" in profil["concepts"]:
#             pardon += 1

#         if "pardon_divin" in profil["roles"]:
#             pardon_divin += 1

#         if "pardon_humain" in profil["roles"]:
#             pardon_humain += 1

#         if "repentance" in profil["roles"]:
#             repentance += 1

#         if "prière" in profil["concepts"]:
#             priere += 1

#     print("📊 STATISTIQUES")
#     print("----------------------------------------------")
#     print(f"🙏 Versets parlant du pardon : {pardon}")
#     print(f"✝️  Pardon divin détecté      : {pardon_divin}")
#     print(f"🤝 Pardon humain détecté      : {pardon_humain}")
#     print(f"🔄 Repentance détectée        : {repentance}")
#     print(f"🙏 Prière détectée            : {priere}")
#     print()


# if __name__ == "__main__":
#     main()

import json
import unicodedata
from pathlib import Path


# ============================================================
# 🧠 PROFILAGE BIBLIQUE — VERSION 3
# ============================================================

print("=" * 70)
print("🧠 PROFILAGE BIBLIQUE DES VERSETS — VERSION 3")
print("=" * 70)


# ============================================================
# 1. NORMALISATION
# ============================================================

def normaliser_texte(texte):
    texte = texte.lower()

    texte = unicodedata.normalize("NFD", texte)

    texte = "".join(
        caractere
        for caractere in texte
        if unicodedata.category(caractere) != "Mn"
    )

    return texte


# ============================================================
# 2. MOTS-CLÉS
# ============================================================

MOTS_PARDON = [
    "pardon",
    "pardonner",
    "pardonne",
    "pardonnez",
    "pardonne-moi",
    "pardonne moi",
    "pardonne-nous",
    "pardonne nous",
    "pardonne-lui",
    "pardonne lui",
    "pardonnez-vous",
    "pardonnez vous",
]

MOTS_REPENTANCE = [
    "repens",
    "repent",
    "repentez",
    "repentir",
    "repentance",
    "se repent",
    "repentez-vous",
    "revenez",
    "retournez",
    "convertissez",
    "conversion",
]

MOTS_PECHE = [
    "peche",
    "peches",
    "pecheur",
    "pecheurs",
    "iniquite",
    "iniquites",
    "transgression",
    "transgressions",
    "mechancete",
    "mechancetes",
    "faute",
    "fautes",
]

MOTS_DIEU = [
    "dieu",
    "seigneur",
    "eternel",
    "pere",
    "christ",
    "jesus",
    "esprit",
]

MOTS_HUMAINS = [
    "homme",
    "hommes",
    "frere",
    "freres",
    "prochain",
    "prochains",
    "autrui",
    "quelqu'un",
    "quelquun",
    "quiconque",
    "les uns",
    "les autres",
    "entre vous",
    "reciproquement",
]

MOTS_PRIERE = [
    "prie",
    "prier",
    "priere",
    "prieres",
    "priez",
    "prions",
    "demande",
    "demander",
    "invoque",
    "invoquer",
]

MOTS_MISERICORDE = [
    "misericorde",
    "compassion",
    "grace",
    "pitie",
]

MOTS_SALUT = [
    "salut",
    "sauve",
    "sauver",
    "sauves",
    "sauveur",
    "vie eternelle",
]


MOTS_AMOUR = [
    "amour",
    "aimer",
    "aime",
    "aimes",
    "aimez",
    "aimons",
    "charite",
]


MOTS_FOI = [
    "foi",
    "croire",
    "crois",
    "croit",
    "croyant",
    "croyants",
]


MOTS_CONFIANCE = [
    "confiance",
    "confie",
    "confier",
]


MOTS_SOUFFRANCE = [
    "souffrance",
    "souffrir",
    "souffre",
    "souffrent",
    "douleur",
    "douleurs",
    "epreuve",
    "epreuves",
    "malheur",
]


MOTS_PERSECUTION = [
    "persecution",
    "persecute",
    "persecutent",
    "persecutes",
]


MOTS_ENNEMIS = [
    "ennemi",
    "ennemis",
]


MOTS_RELATIONS = [
    "prochain",
    "prochains",
    "frere",
    "freres",
    "autrui",
    "les uns les autres",
    "quiconque",
]


MOTS_GRACE = [
    "grace",
]


MOTS_RECONCILIATION = [
    "reconciliation",
    "reconcilie",
    "reconcilier",
]


def contient(texte, liste):
    return any(mot in texte for mot in liste)


# ============================================================
# 🧩 FONCTION DU VERSET (générique, indépendante du thème)
# ============================================================
#
# Cette fonction ne regarde PAS de quoi parle le verset (amour,
# pardon, foi...) mais COMMENT il en parle : est-ce une définition,
# une instruction, une explication, une promesse, un exemple ?
# Ces marqueurs sont structurels et valables pour n'importe quel
# thème biblique, contrairement aux listes de phrases exactes.
# ============================================================

VERBES_IMPERATIFS = [
    "aimez", "aime ", "aime-",
    "pardonnez", "pardonne ", "pardonne-",
    "priez", "prie ", "prie-",
    "cherchez", "demandez", "veillez", "faites",
    "soyez", "gardez", "confessez", "repentez",
    "donnez", "allez", "venez", "ecoutez",
    "obeissez", "craignez", "honorez", "fuyez",
    "combattez", "revetez", "supportez", "portez",
    "benissez", "consolez", "exhortez", "edifiez",
    "rejouissez", "persistez", "recherchez",
    "abstenez", "attachez", "marchez", "vivez",
]

EXPRESSIONS_DEFINITION = [
    "la foi est", "l amour est", "le pardon est",
    "la priere est", "dieu est", "la grace est",
    "le salut est", "la charite est", "l esperance est",
    "la sagesse est", "la loi est",
]

EXPRESSIONS_AVERTISSEMENT = [
    "malheur a", "malheur ",
    "si vous ne", "si tu ne",
    "ne pardonnera pas", "sera condamne",
    "perira", "mourra", "ne recevrez pas",
    "ne pardonnez pas",
]

EXPRESSIONS_PROMESSE = [
    "sera sauve", "seras sauve", "serez sauves",
    "recevrez", "obtiendrez", "vous ouvrira",
    "vous sera donne", "heritier", "sera beni",
    "benira", "delivrera", "exaucera",
    "recompense sera grande", "vous donnera",
    "vous pardonnera",
]

EXPRESSIONS_EXPLICATION = [
    " car ", "parce que", "c est pourquoi", "en effet",
]

MARQUEURS_EXEMPLE = [
    "par la foi", "il pria", "il dit", "il repondit",
    "il se retira", "il se leva", "jesus dit",
    "jesus repondit", "il pria le seigneur",
    "les apotres dirent", "il construisit",
    "il condamna", "il devint",
]


def determiner_fonction(t):
    """
    Détermine la fonction rhétorique générique du verset :
    question, definition, avertissement, promesse,
    explication, instruction, exemple, ou general.
    L'ordre des tests reflète une priorité de spécificité.
    """

    if "?" in t:
        return "question"

    if any(expr in t for expr in EXPRESSIONS_DEFINITION):
        return "definition"

    if any(expr in t for expr in EXPRESSIONS_AVERTISSEMENT):
        return "avertissement"

    if any(expr in t for expr in EXPRESSIONS_PROMESSE):
        return "promesse"

    if any(expr in t for expr in EXPRESSIONS_EXPLICATION):
        return "explication"

    premiers_mots = " ".join(t.strip().split()[:3])

    if any(verbe in premiers_mots for verbe in VERBES_IMPERATIFS):
        return "instruction"

    if any(verbe in t for verbe in VERBES_IMPERATIFS):
        return "instruction"

    if any(expr in t for expr in MARQUEURS_EXEMPLE):
        return "exemple"

    return "general"


# ============================================================
# 3. PROFILAGE D'UN VERSET
# ============================================================

def profiler_verset(reference, texte):

    t = normaliser_texte(texte)

    concepts = []
    roles = []
    orientations = []

    contient_pardon = contient(t, MOTS_PARDON)
    contient_repentance = contient(t, MOTS_REPENTANCE)
    contient_peche = contient(t, MOTS_PECHE)
    contient_dieu = contient(t, MOTS_DIEU)
    contient_humain = contient(t, MOTS_HUMAINS)
    contient_priere = contient(t, MOTS_PRIERE)
    contient_misericorde = contient(t, MOTS_MISERICORDE)
    contient_salut = contient(t, MOTS_SALUT)
    contient_amour = contient(t, MOTS_AMOUR)
    contient_foi = contient(t, MOTS_FOI)
    contient_confiance = contient(t, MOTS_CONFIANCE)
    contient_souffrance = contient(t, MOTS_SOUFFRANCE)
    contient_persecution = contient(t, MOTS_PERSECUTION)
    contient_ennemis = contient(t, MOTS_ENNEMIS)
    contient_relations = contient(t, MOTS_RELATIONS)
    contient_grace = contient(t, MOTS_GRACE)
    contient_reconciliation = contient(t, MOTS_RECONCILIATION)


    # ========================================================
    # CONCEPTS
    # ========================================================

    if contient_pardon:
        concepts.append("pardon")

    if contient_repentance:
        concepts.append("repentance")

    if contient_peche:
        concepts.append("péché")

    if contient_dieu:
        concepts.append("Dieu")

    if contient_humain:
        concepts.append("humains")

    if contient_priere:
        concepts.append("prière")

    if contient_misericorde:
        concepts.append("miséricorde")

    if contient_salut:
        concepts.append("salut")

    if contient_amour:
        concepts.append("amour")

    if contient_foi:
        concepts.append("foi")

    if contient_confiance:
        concepts.append("confiance")

    if contient_souffrance:
        concepts.append("souffrance")
        concepts.append("épreuve")

    if contient_persecution:
        concepts.append("persécution")

    if contient_ennemis:
        concepts.append("ennemis")

    if contient_relations:
        concepts.append("relations")

    if contient_grace:
        concepts.append("grâce")

    if contient_reconciliation:
        concepts.append("réconciliation")


    # ========================================================
    # 🤝 PARDON HUMAIN
    # ========================================================

    expressions_humaines = [

        "nous pardonnons",
        "nous aussi nous pardonnons",

        "pardonnez aux hommes",
        "pardonne aux hommes",

        "pardonne a ceux",
        "pardonne aux ceux",

        "pardonne a celui",
        "pardonne a quiconque",

        "pardonne-lui",
        "pardonne lui",

        "pardonne-le",
        "pardonne le",

        "pardonnez-vous",
        "pardonnez vous",

        "pardonnez les uns",
        "pardonnez-vous les uns",

        "pardonnez a votre frere",
        "pardonne a ton frere",

        "pardonner a quelqu'un",
        "pardonner a quiconque",

        "pardonner aux autres",

        "pardonnez",
    ]

    pardon_humain = False

    if contient_pardon:

        if any(expression in t for expression in expressions_humaines):
            pardon_humain = True

        # Structure très caractéristique :
        # "les uns les autres"
        if "les uns les autres" in t:
            pardon_humain = True

        # Présence d'un frère + pardon
        if "frere" in t and contient_pardon:
            pardon_humain = True


    if pardon_humain:

        roles.append("pardon_humain")
        orientations.append("humain→humain")


    # ========================================================
    # ✝️ PARDON DIVIN
    # ========================================================

    expressions_divines_fortes = [

        # Dieu / Seigneur pardonne (sujet nommé explicitement)
        "dieu pardonne",
        "dieu pardonnera",
        "dieu pardonna",

        "le seigneur pardonne",
        "le seigneur pardonnera",
        "le seigneur pardonna",

        # Formulations bibliques
        "ton pere te pardonnera",
        "votre pere vous pardonnera",
        "votre pere celeste vous pardonnera",
        "votre pere qui est dans les cieux vous pardonne",

        # Pardons formulés comme un résultat
        "vos peches vous sont pardonnes",
        "tes peches te sont pardonnes",
        "leurs peches sont pardonnes",
        "les peches sont pardonnes",

        # Annonce du pardon
        "pardon des peches",
        "pardon des iniquites",
        "pardon des transgressions",
        "pardon vous est annonce",
        "pardon des peches vous est annonce",
        "remission des peches",
    ]

    # Formulations ambiguës à la première personne :
    # peuvent venir de Dieu OU d'un humain qui parle en son nom.
    # On ne les compte comme "pardon divin" que si le verset
    # n'a pas déjà été identifié comme un pardon humain.
    expressions_divines_faibles = [
        "je leur pardonnerai",
        "je lui pardonnerai",
        "je te pardonnerai",
        "je vous pardonnerai",
        "je pardonnerai",
        "je pardonne",
    ]


    pardon_divin = False

    if contient_pardon:

        if any(expression in t for expression in expressions_divines_fortes):
            pardon_divin = True

        if (
            not pardon_humain
            and any(expression in t for expression in expressions_divines_faibles)
        ):
            pardon_divin = True

        # Une formulation du type :
        # "pardon des péchés"
        # est généralement une formulation théologique
        # du pardon divin dans le contexte biblique.
        if "pardon des peches" in t:
            pardon_divin = True

        if "pardon des iniquites" in t:
            pardon_divin = True

        if "pardon des transgressions" in t:
            pardon_divin = True


    if pardon_divin:

        roles.append("pardon_divin")
        orientations.append("Dieu→humain")


    # ========================================================
    # 🙇 DEMANDE DE PARDON
    # ========================================================

    expressions_demande = [

        "pardonne-moi",
        "pardonne moi",

        "pardonne-nous",
        "pardonne nous",

        "pardonne mes",
        "pardonne nos",

        "que mon peche me soit pardonne",
        "que ma faute soit pardonne",
        "que mes peches soient pardonnes",
    ]

    demande_pardon = False

    if any(expression in t for expression in expressions_demande):
        demande_pardon = True

    # Péché + prière + pardon
    if (
        contient_pardon
        and contient_peche
        and contient_priere
        and not pardon_humain
    ):
        demande_pardon = True

    # Repentance + prière + péché
    if (
        contient_repentance
        and contient_priere
        and contient_peche
    ):
        demande_pardon = True


    if demande_pardon:

        roles.append("demande_de_pardon")
        orientations.append("humain→Dieu")


    # ========================================================
    # 🔄 REPENTANCE
    # ========================================================

    if contient_repentance:
        roles.append("repentance")


    # ========================================================
    # 📖 PARDON GÉNÉRAL
    # ========================================================

    if (
        contient_pardon
        and not pardon_humain
        and not pardon_divin
        and not demande_pardon
    ):
        roles.append("pardon_general")


    # ========================================================
    # NETTOYAGE
    # ========================================================

    concepts = list(dict.fromkeys(concepts))
    roles = list(dict.fromkeys(roles))
    orientations = list(dict.fromkeys(orientations))


    # ========================================================
    # 🎯 NIVEAU DE CONFIANCE
    # ========================================================

    nombre_roles_directionnels = sum(
        1
        for role in roles
        if role in [
            "pardon_humain",
            "pardon_divin",
            "demande_de_pardon"
        ]
    )

    if nombre_roles_directionnels >= 2:
        confiance = "élevée"

    elif nombre_roles_directionnels == 1:
        confiance = "élevée"

    elif "pardon_general" in roles:
        confiance = "moyenne"

    else:
        confiance = "faible"


    return {
        "reference": reference,
        "concepts": concepts,
        "roles": roles,
        "orientations": orientations,
        "confiance": confiance,
        "fonction": determiner_fonction(t)
    }


# ============================================================
# 4. CHARGEMENT DES VERSETS
# ============================================================

chemin_index = Path("versets_index.json")
chemin_bible = Path("bible.json")

print()
print("📖 Chargement des versets...")


if chemin_index.exists():

    with open(
        chemin_index,
        "r",
        encoding="utf-8"
    ) as fichier:

        versets = json.load(fichier)

    print("✅ versets_index.json chargé !")


elif chemin_bible.exists():

    with open(
        chemin_bible,
        "r",
        encoding="utf-8"
    ) as fichier:

        versets = json.load(fichier)

    print("✅ bible.json chargé !")


else:

    print("❌ Aucun fichier Bible trouvé.")
    exit()


print(f"📚 {len(versets)} versets trouvés !")


# ============================================================
# 5. PROFILAGE
# ============================================================

profils = []

compteurs = {
    "pardon": 0,
    "pardon_divin": 0,
    "pardon_humain": 0,
    "demande_de_pardon": 0,
    "repentance": 0,
    "priere": 0,
}


for i, verset in enumerate(versets):

    if isinstance(verset, dict):

        reference = (
            verset.get("reference")
            or verset.get("Reference")
            or verset.get("ref")
            or f"verset_{i}"
        )

        texte = (
            verset.get("texte")
            or verset.get("text")
            or verset.get("Scripture")
            or ""
        )

    else:

        reference = f"verset_{i}"
        texte = str(verset)


    profil = profiler_verset(
        reference,
        texte
    )

    profils.append(profil)


    # Statistiques
    if "pardon" in profil["concepts"]:
        compteurs["pardon"] += 1

    if "pardon_divin" in profil["roles"]:
        compteurs["pardon_divin"] += 1

    if "pardon_humain" in profil["roles"]:
        compteurs["pardon_humain"] += 1

    if "demande_de_pardon" in profil["roles"]:
        compteurs["demande_de_pardon"] += 1

    if "repentance" in profil["roles"]:
        compteurs["repentance"] += 1

    if "prière" in profil["concepts"]:
        compteurs["priere"] += 1


    if (i + 1) % 5000 == 0:

        print(
            f"🔎 Analyse : {i + 1}/{len(versets)} versets..."
        )


# ============================================================
# 6. SAUVEGARDE
# ============================================================

fichier_sortie = "profils_versets.json"

with open(
    fichier_sortie,
    "w",
    encoding="utf-8"
) as fichier:

    json.dump(
        profils,
        fichier,
        ensure_ascii=False,
        indent=2
    )


# ============================================================
# 7. STATISTIQUES
# ============================================================

print()
print("=" * 70)
print("🎉 PROFILAGE TERMINÉ !")
print("=" * 70)

print()
print(f"📚 Versets analysés         : {len(profils)}")
print(f"💾 Fichier créé             : {fichier_sortie}")

print()
print("📊 STATISTIQUES")
print("-" * 70)

print(
    f"🙏 Versets parlant du pardon : "
    f"{compteurs['pardon']}"
)

print(
    f"✝️  Pardon divin détecté      : "
    f"{compteurs['pardon_divin']}"
)

print(
    f"🤝 Pardon humain détecté      : "
    f"{compteurs['pardon_humain']}"
)

print(
    f"🙇 Demande de pardon détectée : "
    f"{compteurs['demande_de_pardon']}"
)

print(
    f"🔄 Repentance détectée        : "
    f"{compteurs['repentance']}"
)

print(
    f"🙏 Prière détectée            : "
    f"{compteurs['priere']}"
)

print()
print("🧠 Les profils sont maintenant prêts pour le moteur.")
print("=" * 70)
