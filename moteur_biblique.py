
import json
import re
import numpy as np

from intelligence_biblique import modele, analyser_question


# ============================================================
# 1. CHARGEMENT DES DONNÉES
# ============================================================

with open("bible.json", "r", encoding="utf-8") as f:
    bible = json.load(f)

embeddings = np.load("embeddings.npy")

with open("versets_index.json", "r", encoding="utf-8") as f:
    versets_index = json.load(f)

with open("profils_versets.json", "r", encoding="utf-8") as f:
    profils_versets = json.load(f)


# ============================================================
# 2. NORMALISATION DES EMBEDDINGS
# ============================================================

normes = np.linalg.norm(embeddings, axis=1, keepdims=True)
normes[normes == 0] = 1

embeddings_normalises = embeddings / normes


# ============================================================
# 3. MOTS INUTILES
# ============================================================

mots_inutiles = {
    "je", "tu", "il", "elle", "nous", "vous", "ils", "elles",
    "me", "te", "se",
    "le", "la", "les", "un", "une", "des",
    "du", "de", "d",
    "ce", "cet", "cette", "ces",
    "mon", "ma", "mes",
    "ton", "ta", "tes",
    "son", "sa", "ses",
    "notre", "nos",
    "votre", "vos",
    "leur", "leurs",
    "qui", "que", "quoi", "dont", "où",
    "et", "ou", "mais", "donc", "or", "ni", "car",
    "à", "au", "aux", "en", "dans", "sur", "sous",
    "pour", "par", "avec", "sans", "comme",
    "est", "sont", "être", "avoir",
    "a", "ai", "as", "ont",
    "faire", "fait", "faut",
    "comment", "pourquoi", "quand"
}


# ============================================================
# 4. NORMALISATION D'UN MOT
# ============================================================

def normaliser_mot(mot):

    mot = mot.lower()

    remplacements = {
        "à": "a",
        "â": "a",
        "ä": "a",
        "é": "e",
        "è": "e",
        "ê": "e",
        "ë": "e",
        "î": "i",
        "ï": "i",
        "ô": "o",
        "ö": "o",
        "ù": "u",
        "û": "u",
        "ü": "u",
        "ç": "c"
    }

    for ancien, nouveau in remplacements.items():
        mot = mot.replace(ancien, nouveau)

    mot = re.sub(r"[^a-z0-9]", "", mot)

    return mot


# ============================================================
# 5. FAMILLES DE MOTS
# ============================================================

familles_mots = {

    "pardon": {
        "pardon",
        "pardonner",
        "pardonne",
        "pardonnez",
        "pardonnees",
        "pardonnees",
        "pardonne",
        "pardonna",
        "pardonnerai",
        "pardonneras",
        "pardonnera",
        "pardonnerons",
        "pardonnerez",
        "pardonneront"
    },

    "peche": {
        "peche",
        "peches",
        "pecher",
        "pecheur",
        "pecheurs",
        "pecheresse",
        "pecheresses"
    },

    "repentance": {
        "repentir",
        "repentez",
        "repentance",
        "repentant",
        "repentie",
        "repentis",
        "repent",
        "repente"
    },

    "amour": {
        "amour",
        "aimer",
        "aime",
        "aimez",
        "aimee",
        "aimees",
        "aimes",
        "aimant"
    },

    "foi": {
        "foi",
        "croire",
        "crois",
        "croit",
        "croyez",
        "croyant",
        "croyants",
        "confiance"
    },

    "priere": {
        "priere",
        "prieres",
        "prier",
        "prie",
        "priez",
        "priant"
    },

    "salut": {
        "salut",
        "sauver",
        "sauve",
        "sauvez",
        "sauveur",
        "sauves",
        "sauvee",
        "sauvees",
        "delivrance"
    },

    "souffrance": {
        "souffrance",
        "souffrir",
        "souffre",
        "souffres",
        "souffrent",
        "douleur",
        "douleurs",
        "mal",
        "malheur",
        "affliction",
        "afflige"
    },

    "ennemi": {
        "ennemi",
        "ennemis",
        "ennemie",
        "ennemies",
        "adversaire",
        "adversaires",
        "persecuteur",
        "persecuteurs"
    },

    "relation": {
        "personne",
        "personnes",
        "frere",
        "freres",
        "prochain",
        "prochains",
        "autrui",
        "autres",
        "homme",
        "hommes"
    }
}


# ============================================================
# 6. DÉTECTION DE FAMILLE
# ============================================================

def famille_du_mot(mot):

    mot = normaliser_mot(mot)

    for famille, mots in familles_mots.items():

        mots_normalises = {
            normaliser_mot(m)
            for m in mots
        }

        if mot in mots_normalises:
            return famille

    # Détection morphologique
    if mot.startswith("pardonn"):
        return "pardon"

    if mot.startswith("pech"):
        return "peche"

    if mot.startswith("repent"):
        return "repentance"

    if mot.startswith("aim"):
        return "amour"

    if mot.startswith("croi"):
        return "foi"

    if mot.startswith("prier") or mot.startswith("pri"):
        return "priere"

    if mot.startswith("sauv"):
        return "salut"

    if mot.startswith("souffr"):
        return "souffrance"

    return None


# ============================================================
# 7. MOTS IMPORTANTS
# ============================================================

def mots_importants(texte):

    mots = re.findall(
        r"[a-zA-ZÀ-ÿ]+",
        texte.lower()
    )

    resultat = []

    for mot in mots:

        mot_normalise = normaliser_mot(mot)

        if not mot_normalise:
            continue

        if mot_normalise in mots_inutiles:
            continue

        resultat.append(mot_normalise)

    return resultat


# ============================================================
# 8. SCORE LEXICAL
# ============================================================

def calculer_score_lexical(question, texte):

    mots_question = mots_importants(question)
    mots_texte = mots_importants(texte)

    if not mots_question or not mots_texte:
        return 0.0

    familles_question = set()
    familles_texte = set()

    for mot in mots_question:

        famille = famille_du_mot(mot)

        if famille:
            familles_question.add(famille)

    for mot in mots_texte:

        famille = famille_du_mot(mot)

        if famille:
            familles_texte.add(famille)

    correspondances_directes = (
        set(mots_question)
        &
        set(mots_texte)
    )

    correspondances_familles = (
        familles_question
        &
        familles_texte
    )

    score_direct = (
        len(correspondances_directes)
        /
        max(len(set(mots_question)), 1)
    )

    score_familles = (
        len(correspondances_familles)
        /
        max(len(familles_question), 1)
    )

    score = (
        0.35 * score_direct
        +
        0.65 * score_familles
    )

    return min(score, 1.0)


# ============================================================
# 9. RÉCUPÉRATION DU PROFIL
# ============================================================

def obtenir_profil_verset(indice):

    if isinstance(profils_versets, list):

        if 0 <= indice < len(profils_versets):
            return profils_versets[indice]

        return {}

    if isinstance(profils_versets, dict):

        if str(indice) in profils_versets:
            return profils_versets[str(indice)]

        if indice in profils_versets:
            return profils_versets[indice]

    return {}


# ============================================================
# 10. EXTRACTION PROPRE D'UN VERSET
# ============================================================

def obtenir_verset(indice):

    reference = ""
    texte = ""

    # --------------------------------------------------------
    # PRIORITÉ : versets_index
    # --------------------------------------------------------

    if isinstance(versets_index, list):

        if indice < len(versets_index):

            element = versets_index[indice]

            if isinstance(element, dict):

                reference = (
                    element.get("reference")
                    or element.get("Reference")
                    or ""
                )

                texte = (
                    element.get("texte")
                    or element.get("Scripture")
                    or element.get("scripture")
                    or ""
                )

            else:

                reference = str(element)

    # --------------------------------------------------------
    # FALLBACK : bible.json
    # --------------------------------------------------------

    if not texte and isinstance(bible, list):

        if indice < len(bible):

            element = bible[indice]

            if isinstance(element, dict):

                texte = (
                    element.get("texte")
                    or element.get("Scripture")
                    or element.get("scripture")
                    or ""
                )

            else:

                texte = str(element)

    # --------------------------------------------------------
    # FALLBACK DICTIONNAIRE
    # --------------------------------------------------------

    if not texte and isinstance(bible, dict):

        element = bible.get(str(indice), "")

        if isinstance(element, dict):

            texte = (
                element.get("texte")
                or element.get("Scripture")
                or element.get("scripture")
                or ""
            )

        else:

            texte = str(element)

    return reference, texte


# ============================================================
# 11. PROFILS DES TYPES DE QUESTIONS
# ============================================================

profils_types = {

    "pardon_aux_autres": {

        "roles": {
            "pardon_humain": 1.0
        },

        "orientations": {
            "humain→humain": 1.0
        },

        "concepts": {
            "pardon": 0.8,
            "humains": 0.5
        }
    },

    "obtenir_pardon": {

        "roles": {
            "demande_de_pardon": 1.0,
            "pardon_divin": 0.9,
            "repentance": 0.6
        },

        "orientations": {
            "humain→Dieu": 1.0,
            "Dieu→humain": 0.8
        },

        "concepts": {
            "pardon": 0.8,
            "péché": 0.7,
            "repentance": 0.7,
            "Dieu": 0.6
        }
    },

    "repentance": {

        "roles": {
            "repentance": 1.0,
            "demande_de_pardon": 0.5
        },

        "orientations": {},

        "concepts": {
            "repentance": 1.0,
            "péché": 0.8,
            "pardon": 0.5
        }
    },

    "raison_du_pardon": {

        "roles": {
            "pardon_divin": 0.8,
            "pardon_humain": 0.7
        },

        "orientations": {},

        "concepts": {
            "pardon": 1.0,
            "Dieu": 0.5,
            "amour": 0.5
        }
    },

    "possibilite_du_pardon": {

        "roles": {
            "pardon_divin": 0.8,
            "pardon_general": 0.7
        },

        "orientations": {},

        "concepts": {
            "pardon": 1.0,
            "péché": 0.6
        }
    },

    "pardon_general": {

        "roles": {
            "pardon_general": 1.0,
            "pardon_divin": 0.6,
            "pardon_humain": 0.6
        },

        "orientations": {},

        "concepts": {
            "pardon": 1.0
        }
    }
}


# ============================================================
# 12. SCORE DU TYPE
# ============================================================

def calculer_score_type_question(
    type_question,
    profil
):

    if not type_question:
        return 0.0

    configuration = profils_types.get(
        type_question
    )

    if not configuration:
        return 0.0

    roles = set(
        profil.get("roles", [])
    )

    orientations = set(
        profil.get("orientations", [])
    )

    concepts = set(
        profil.get("concepts", [])
    )

    score_roles = 0.0

    for role, poids in configuration["roles"].items():

        if role in roles:
            score_roles = max(
                score_roles,
                poids
            )

    score_orientations = 0.0

    for orientation, poids in configuration["orientations"].items():

        if orientation in orientations:
            score_orientations = max(
                score_orientations,
                poids
            )

    score_concepts = 0.0

    for concept, poids in configuration["concepts"].items():

        if concept in concepts:
            score_concepts = max(
                score_concepts,
                poids
            )

    # Cas spécial : pardon envers une autre personne
    if type_question == "pardon_aux_autres":

        if (
            "pardon_humain" in roles
            and
            "humain→humain" in orientations
        ):
            return 1.0

        if "pardon_humain" in roles:
            return 0.75

        if (
            "pardon_divin" in roles
            and
            "pardon_humain" not in roles
        ):
            return 0.15

    score = (
        0.45 * score_roles
        +
        0.35 * score_orientations
        +
        0.20 * score_concepts
    )

    return min(score, 1.0)


# ============================================================
# 13. SCORE DES CONCEPTS
# ============================================================

def calculer_score_concepts(
    themes,
    profil
):

    if not themes:
        return 0.0

    concepts = set(
        profil.get("concepts", [])
    )

    if not concepts:
        return 0.0

    correspondances = 0

    for theme in themes:

        if theme in concepts:
            correspondances += 1

    return min(
        correspondances / len(themes),
        1.0
    )


# ============================================================
# 14. SCORE DE L'INTENTION
# ============================================================

def calculer_score_intention(
    intentions,
    profil
):

    if not intentions:
        return 0.0

    concepts = set(
        profil.get("concepts", [])
    )

    roles = set(
        profil.get("roles", [])
    )

    meilleur_score = 0.0

    for nom, score in intentions:

        correspondance = False

        if nom in concepts:
            correspondance = True

        if nom == "pardon":

            if (
                "pardon" in concepts
                or
                "pardon_humain" in roles
                or
                "pardon_divin" in roles
                or
                "demande_de_pardon" in roles
                or
                "pardon_general" in roles
            ):
                correspondance = True

        elif nom == "relations_avec_les_autres":

            if (
                "humains" in concepts
                or
                "pardon_humain" in roles
            ):
                correspondance = True

        elif nom == "priere":

            if "prière" in concepts:
                correspondance = True

        elif nom == "souffrance":

            if "souffrance" in concepts:
                correspondance = True

        if correspondance:

            meilleur_score = max(
                meilleur_score,
                score
            )

    return min(
        meilleur_score,
        1.0
    )


# ============================================================
# 15. DÉTECTION DU MODE
# ============================================================

profils_modes_reponse = {

    "instruction": {

        "mots_forts": {
            "comment",
            "que faire",
            "que dois",
            "que devrais",
            "comment dois",
            "comment faire",
            "quelle attitude",
            "quelle conduite",
            "comment reagir",
            "comment agir"
        }
    },

    "explication": {

        "mots_forts": {
            "pourquoi",
            "quelle est la raison",
            "explique",
            "expliquer",
            "signifie",
            "signification",
            "sens",
            "que veut dire"
        }
    },

    "definition": {

        "mots_forts": {
            "qu est ce que",
            "quest ce que",
            "c est quoi",
            "definition",
            "definir"
        }
    },

    "oui_non": {

        "mots_forts": {
            "est ce que",
            "peut on",
            "doit on",
            "faut il",
            "est il"
        }
    }
}


def detecter_mode_question(question):

    texte = normaliser_mot(question)

    texte = re.sub(
        r"[^a-z0-9\s'-]",
        " ",
        texte
    )

    texte = re.sub(
        r"\s+",
        " ",
        texte
    ).strip()

    scores = {}

    for mode, profil in profils_modes_reponse.items():

        score = 0.0

        for expression in profil["mots_forts"]:

            expression_normalisee = normaliser_mot(
                expression
            )

            expression_normalisee = re.sub(
                r"[^a-z0-9\s'-]",
                " ",
                expression_normalisee
            )

            expression_normalisee = re.sub(
                r"\s+",
                " ",
                expression_normalisee
            ).strip()

            if expression_normalisee in texte:

                longueur = len(
                    expression_normalisee.split()
                )

                if longueur >= 2:
                    score = max(score, 1.0)
                else:
                    score = max(score, 0.95)

        scores[mode] = score

    mode_principal = max(
        scores,
        key=scores.get
    )

    score_principal = scores[
        mode_principal
    ]

    if score_principal == 0:
        return "general", 0.0

    return (
        mode_principal,
        score_principal
    )


# ============================================================
# 16. SCORE DU PROFIL BIBLIQUE
# ============================================================

def calculer_score_profil_biblique(
    type_question,
    profil
):

    roles = set(
        profil.get("roles", [])
    )

    orientations = set(
        profil.get("orientations", [])
    )

    concepts = set(
        profil.get("concepts", [])
    )

    score = 0.0

    # --------------------------------------------------------
    # PARDON AUX AUTRES
    # --------------------------------------------------------

    if type_question == "pardon_aux_autres":

        if "pardon_humain" in roles:
            score += 0.45

        if "humain→humain" in orientations:
            score += 0.35

        if "pardon" in concepts:
            score += 0.10

        if "humains" in concepts:
            score += 0.05

        if "relations" in concepts:
            score += 0.05

        if (
            "pardon_divin" in roles
            and
            "pardon_humain" not in roles
        ):
            score *= 0.20

        return min(
            score,
            1.0
        )

    # --------------------------------------------------------
    # OBTENIR LE PARDON
    # --------------------------------------------------------

    if type_question == "obtenir_pardon":

        if "pardon_divin" in roles:
            score += 0.45

        if "demande_de_pardon" in roles:
            score += 0.25

        if "repentance" in roles:
            score += 0.15

        if "humain→Dieu" in orientations:
            score += 0.15

        if "pardon" in concepts:
            score += 0.05

        return min(score, 1.0)

    # --------------------------------------------------------
    # REPENTANCE
    # --------------------------------------------------------

    if type_question == "repentance":

        if "repentance" in roles:
            score += 0.55

        if "repentance" in concepts:
            score += 0.20

        if "péché" in concepts:
            score += 0.15

        if "pardon" in concepts:
            score += 0.10

        return min(score, 1.0)

    # --------------------------------------------------------
    # RAISON DU PARDON
    # --------------------------------------------------------

    if type_question == "raison_du_pardon":

        if "pardon" in concepts:
            score += 0.45

        if "pardon_divin" in roles:
            score += 0.25

        if "pardon_humain" in roles:
            score += 0.20

        if "Dieu" in concepts:
            score += 0.10

        return min(score, 1.0)

    # --------------------------------------------------------
    # POSSIBILITÉ DU PARDON
    # --------------------------------------------------------

    if type_question == "possibilite_du_pardon":

        if "pardon" in concepts:
            score += 0.45

        if "pardon_divin" in roles:
            score += 0.30

        if "pardon_general" in roles:
            score += 0.25

        return min(score, 1.0)

    # --------------------------------------------------------
    # PARDON GÉNÉRAL
    # --------------------------------------------------------

    if type_question == "pardon_general":

        if "pardon_general" in roles:
            score += 0.50

        if "pardon" in concepts:
            score += 0.35

        if "pardon_divin" in roles:
            score += 0.075

        if "pardon_humain" in roles:
            score += 0.075

        return min(score, 1.0)

    return 0.0


# ============================================================
# 17. SCORE DU MODE
# ============================================================

def calculer_score_mode(
    mode_question,
    score_mode_question,
    profil
):

    score = score_mode_question

    roles = set(
        profil.get("roles", [])
    )

    orientations = set(
        profil.get("orientations", [])
    )

    if mode_question == "instruction":

        if (
            "pardon_humain" in roles
            and
            "humain→humain" in orientations
        ):
            score += 0.15

    return min(
        score,
        1.0
    )


# ============================================================
# 18. RECHERCHE
# ============================================================

def rechercher(
    question,
    nombre_resultats=10
):

    analyse = analyser_question(
        question
    )

    intentions = analyse["intentions"]
    themes = analyse["themes"]
    type_question = analyse["type_question"]

    if isinstance(type_question, dict):

        type_principal = type_question.get(
            "type"
        )

        score_type_question = type_question.get(
            "score",
            0.0
        )

    else:

        type_principal = type_question
        score_type_question = 0.0

    mode_question, score_mode_question = (
        detecter_mode_question(question)
    )

    # ========================================================
    # VECTEUR DE LA QUESTION
    # ========================================================

    vecteur_question = modele.encode(
        [question],
        convert_to_numpy=True
    )[0]

    norme = np.linalg.norm(
        vecteur_question
    )

    if norme != 0:

        vecteur_question = (
            vecteur_question / norme
        )

    scores_semantiques = (
        embeddings_normalises
        @
        vecteur_question
    )

    # ========================================================
    # NORMALISATION SÉMANTIQUE
    # ========================================================

    minimum = scores_semantiques.min()
    maximum = scores_semantiques.max()

    if maximum > minimum:

        scores_semantiques_normalises = (
            scores_semantiques - minimum
        ) / (
            maximum - minimum
        )

    else:

        scores_semantiques_normalises = (
            np.zeros_like(
                scores_semantiques
            )
        )

    # ========================================================
    # CALCUL DES SCORES
    # ========================================================

    resultats = []

    nombre_versets = len(
        embeddings
    )

    for indice in range(nombre_versets):

        reference, texte = obtenir_verset(
            indice
        )

        profil = obtenir_profil_verset(
            indice
        )

        # ----------------------------------------------------
        # SCORES
        # ----------------------------------------------------

        score_semantique = float(
            scores_semantiques_normalises[
                indice
            ]
        )

        score_mots = calculer_score_lexical(
            question,
            texte
        )

        score_intention = (
            calculer_score_intention(
                intentions,
                profil
            )
        )

        score_type = (
            calculer_score_type_question(
                type_principal,
                profil
            )
        )

        score_concepts = (
            calculer_score_concepts(
                themes,
                profil
            )
        )

        score_profil = (
            calculer_score_profil_biblique(
                type_principal,
                profil
            )
        )

        score_mode = (
            calculer_score_mode(
                mode_question,
                score_mode_question,
                profil
            )
        )

        # ----------------------------------------------------
        # SCORE FINAL
        # ----------------------------------------------------
        #
        # Pour une question de type instruction,
        # le profil et le type sont importants.
        #
        # ----------------------------------------------------

        score_final = (

            0.25 * score_semantique

            +
            0.15 * score_intention

            +
            0.20 * score_type

            +
            0.05 * score_mots

            +
            0.10 * score_concepts

            +
            0.15 * score_profil

            +
            0.10 * score_mode

        )

        resultats.append({

            "indice": indice,

            "score_final": float(
                score_final
            ),

            "score_semantique": float(
                score_semantique
            ),

            "score_intention": float(
                score_intention
            ),

            "score_type": float(
                score_type
            ),

            "score_mots": float(
                score_mots
            ),

            "score_concepts": float(
                score_concepts
            ),

            "score_profil": float(
                score_profil
            ),

            "score_mode": float(
                score_mode
            ),

            "reference": reference,

            "texte": texte
        })

    # ========================================================
    # TRI
    # ========================================================

    resultats.sort(
        key=lambda x: x["score_final"],
        reverse=True
    )

    return resultats[
        :nombre_resultats
    ]


# ============================================================
# 19. AFFICHAGE
# ============================================================

def afficher_resultats(
    question,
    nombre_resultats=10
):

    analyse = analyser_question(
        question
    )

    intentions = analyse["intentions"]
    themes = analyse["themes"]
    type_question = analyse["type_question"]

    mode_question, score_mode_question = (
        detecter_mode_question(question)
    )

    print("\n" + "=" * 70)
    print("🧠 ANALYSE DE LA QUESTION")
    print("=" * 70)

    if intentions:

        print(
            f"\n🎯 Intention principale : "
            f"{intentions[0][0]}"
        )

        print(
            f"⭐ Score : "
            f"{intentions[0][1]:.4f}"
        )

        if len(intentions) > 1:

            print(
                "\nIntentions secondaires :"
            )

            for nom, score in intentions[1:]:

                print(
                    f"• {nom} "
                    f"({score:.4f})"
                )

    else:

        print(
            "\n🎯 Intention principale : aucune"
        )

    print("\n❓ Type de question :")

    if isinstance(type_question, dict):

        print(
            f"   🎯 {type_question.get('type')}"
        )

        print(
            f"   ⭐ Score : "
            f"{type_question.get('score', 0):.4f}"
        )

    else:

        print(
            f"   🎯 {type_question}"
        )

    print("\n🗣️ Mode de réponse :")

    print(
        f"   🎯 {mode_question}"
    )

    print(
        f"   ⭐ Score : "
        f"{score_mode_question:.4f}"
    )

    print("\n📚 Thèmes :")

    if themes:

        print(
            "   "
            +
            ", ".join(themes)
        )

    else:

        print("   Aucun")

    resultats = rechercher(
        question,
        nombre_resultats
    )

    print("\n" + "=" * 70)
    print("📖 VERSETS LES PLUS PERTINENTS")
    print("=" * 70)

    for position, resultat in enumerate(
        resultats,
        start=1
    ):

        print(
            f"\n#{position} "
            f"{resultat['reference']}"
        )

        print(
            f"Score IA : "
            f"{resultat['score_final']:.4f}"
        )

        print(
            f"Sémantique : "
            f"{resultat['score_semantique']:.4f}"
        )

        print(
            f"Intention : "
            f"{resultat['score_intention']:.4f}"
        )

        print(
            f"Type : "
            f"{resultat['score_type']:.4f}"
        )

        print(
            f"Lexical : "
            f"{resultat['score_mots']:.4f}"
        )

        print(
            f"Concepts : "
            f"{resultat['score_concepts']:.4f}"
        )

        print(
            f"Profil : "
            f"{resultat['score_profil']:.4f}"
        )

        print(
            f"Mode : "
            f"{resultat['score_mode']:.4f}"
        )

        print(
            f"\n📜 {resultat['texte']}"
        )


# ============================================================
# 20. TEST
# ============================================================

if __name__ == "__main__":

    question_test = (
        "Comment pardonner une personne qui m'a fait du mal ?"
    )

    afficher_resultats(
        question_test,
        nombre_resultats=10
    )







    
    
    
        

        



    




    