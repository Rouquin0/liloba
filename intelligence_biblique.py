
import re
import numpy as np
from sentence_transformers import SentenceTransformer


# ==========================================
# MODÈLE SÉMANTIQUE UNIQUE
# ==========================================

print("🧠 Chargement du modèle sémantique...")

modele = SentenceTransformer(
    "paraphrase-multilingual-MiniLM-L12-v2"
)

print("✅ Modèle chargé !")


# ==========================================
# INTENTIONS BIBLIQUES
# ==========================================

intentions_bibliques = {

    "salut": {
        "exemples": [
            "Comment être sauvé ?",
            "Que faut-il faire pour obtenir le salut ?",
            "Comment avoir la vie éternelle ?",
            "Est-ce que croire en Dieu suffit pour être sauvé ?",
            "Comment obtenir le salut de Dieu ?"
        ],

        "themes": [
            "foi",
            "grâce",
            "salut",
            "repentance"
        ]
    },


    "pardon": {
        "exemples": [
            "Comment obtenir le pardon de Dieu ?",
            "Que dois-je faire après avoir péché ?",
            "Que faire quand j'ai désobéi à Dieu ?",
            "J'ai fait quelque chose de mauvais devant Dieu, que dois-je faire ?",
            "Comment être pardonné par Dieu ?",
            "Que faire après avoir commis une faute ?",
            "Comment me réconcilier avec Dieu après mon péché ?",
            "Comment confesser mes péchés à Dieu ?",
            "Comment me repentir de mes péchés ?",
            "Dieu peut-il pardonner mes péchés ?"
        ],

        "themes": [
            "pardon",
            "repentance",
            "réconciliation"
        ]
    },


    "foi": {
        "exemples": [
            "Qu'est-ce que la foi ?",
            "Comment avoir plus de foi ?",
            "Que signifie croire en Dieu ?",
            "Est-ce important de croire en Jésus ?",
            "Comment fortifier ma foi ?"
        ],

        "themes": [
            "foi",
            "confiance",
            "salut"
        ]
    },


        "amour": {
        "exemples": [
            "Que dit la Bible sur l'amour ?",
            "Comment aimer mon prochain ?",
            "Comment aimer mes ennemis ?",
            "Comment traiter une personne qui me fait du mal ?",
            "Comment dois-je me comporter avec quelqu'un qui me fait du mal ?",
            "Quel est le plus grand commandement ?",
            "Comment aimer Dieu de tout mon coeur ?",
            "Comment mettre Dieu en premier dans ma vie ?"
        ],

        "themes": [
            "amour",
            "relations",
            "ennemis"
        ]
    },


    "priere": {
        "exemples": [
            "Comment prier Dieu ?",
            "Comment dois-je prier ?",
            "Que dit la Bible sur la prière ?",
            "Comment parler à Dieu ?",
            "Que puis-je demander à Dieu ?"
        ],

        "themes": [
            "prière",
            "demande",
            "relation avec Dieu"
        ]
    },


    "souffrance": {
        "exemples": [
            "Pourquoi est-ce que je souffre ?",
            "Que dit la Bible sur la souffrance ?",
            "Comment supporter les épreuves ?",
            "Pourquoi Dieu permet-il la souffrance ?",
            "Comment traverser une période difficile ?"
        ],

        "themes": [
            "souffrance",
            "épreuve",
            "persécution"
        ]
    },


    "relations_avec_les_autres": {
        "exemples": [
            "Comment traiter une personne qui me fait du mal ?",
            "Comment agir envers quelqu'un qui m'a blessé ?",
            "Comment dois-je traiter mon prochain ?",
            "Comment me comporter avec mes ennemis ?",
            "Que dit la Bible sur les relations avec les autres ?"
        ],

        "themes": [
            "amour",
            "pardon",
            "ennemis",
            "relations"
        ]
    }
}


# ==========================================
# PRÉPARATION DES INTENTIONS
# ==========================================

print("📚 Préparation des intentions bibliques...")

noms_intentions = []
exemples_intentions = []

for nom_intention, donnees in intentions_bibliques.items():

    for exemple in donnees["exemples"]:

        noms_intentions.append(nom_intention)
        exemples_intentions.append(exemple)


print("🧠 Transformation des exemples en vecteurs...")

embeddings_intentions = modele.encode(
    exemples_intentions,
    convert_to_numpy=True
)

normes = np.linalg.norm(
    embeddings_intentions,
    axis=1,
    keepdims=True
)

embeddings_intentions = (
    embeddings_intentions /
    np.maximum(normes, 1e-12)
)


# ==========================================
# PROTOTYPES DES INTENTIONS
# ==========================================

prototypes_intentions = {}

for intention in intentions_bibliques:

    indices = [
        i
        for i, nom in enumerate(noms_intentions)
        if nom == intention
    ]

    prototype = np.mean(
        embeddings_intentions[indices],
        axis=0
    )

    norme = np.linalg.norm(prototype)

    if norme != 0:

        prototype = prototype / norme

    prototypes_intentions[intention] = prototype


print("✅ Intentions préparées !")


# ==========================================
# TYPES PRÉCIS DE QUESTIONS
# ==========================================

types_questions = {

    "obtenir_pardon": [
        "Comment obtenir le pardon de Dieu ?",
        "Que dois-je faire pour être pardonné par Dieu ?",
        "Comment recevoir le pardon de mes péchés ?",
        "Comment être pardonné par Dieu ?",
        "Que faut-il faire pour obtenir le pardon ?",
        "Comment obtenir le pardon de mes péchés ?"
    ],


    "repentance": [
        "Que dois-je faire après avoir péché ?",
        "Que faire lorsque j'ai désobéi à Dieu ?",
        "Comment me repentir de mes péchés ?",
        "Que faire après avoir commis un péché ?",
        "Comment revenir vers Dieu après avoir péché ?",
        "Que signifie se repentir ?"
    ],


    "raison_du_pardon": [
        "Pourquoi Dieu pardonne-t-il ?",
        "Pourquoi Dieu veut-il pardonner nos péchés ?",
        "Pourquoi Dieu fait-il miséricorde ?",
        "Pourquoi Dieu est-il miséricordieux ?",
        "Quelle est la raison du pardon de Dieu ?"
    ],


    "possibilite_du_pardon": [
        "Dieu peut-il pardonner tous les péchés ?",
        "Y a-t-il un péché que Dieu ne pardonne pas ?",
        "Est-ce que Dieu peut pardonner mon péché ?",
        "Existe-t-il un péché impardonnable ?",
        "Dieu pardonne-t-il toujours ?"
    ],


    "pardon_aux_autres": [
        "Comment pardonner à quelqu'un qui m'a fait du mal ?",
        "Que dit la Bible sur le fait de pardonner aux autres ?",
        "Dois-je pardonner à celui qui m'a offensé ?",
        "Comment pardonner à une personne qui m'a blessé ?",
        "Pourquoi devons-nous pardonner aux autres ?"
    ],


    "pardon_general": [
        "Que dit la Bible sur le pardon ?",
        "Parle-moi du pardon dans la Bible",
        "Quels versets parlent du pardon ?",
        "Que signifie le pardon selon la Bible ?",
        "Explique-moi le pardon dans la Bible"
    ],


    "obtenir_salut": [
        "Comment être sauvé ?",
        "Que faut-il faire pour obtenir le salut ?",
        "Est-ce que croire en Dieu suffit pour être sauvé ?",
        "Comment obtenir le salut de Dieu ?",
        "Que dois-je faire pour avoir la vie éternelle ?",
        "Suffit-il de croire en Jésus pour être sauvé ?"
    ],


    "comprendre_souffrance": [
        "Que dit la Bible sur la souffrance ?",
        "Pourquoi est-ce que je souffre ?",
        "Pourquoi Dieu permet-il la souffrance ?",
        "Comment supporter les épreuves ?",
        "Comment traverser une période difficile ?",
        "Que dit la Bible sur les épreuves de la vie ?"
    ],


    "attitude_envers_prochain": [
        "Quelle attitude doit avoir un chrétien envers son prochain ?",
        "Comment dois-je traiter mon prochain ?",
        "Comment me comporter avec les autres ?",
        "Que dit la Bible sur l'amour du prochain ?",
        "Comment aimer mon prochain ?",
        "Quel comportement avoir envers autrui ?"
    ],


    "comment_prier": [
        "Comment prier Dieu ?",
        "Comment bien prier ?",
        "Que dire quand je prie ?",
        "Comment dois-je prier ?",
        "Quelle est la bonne façon de prier ?",
        "Comment adresser une prière à Dieu ?"
    ],


    "pourquoi_prier": [
        "Pourquoi prier ?",
        "Pourquoi est-il important de prier ?",
        "A quoi sert la prière ?",
        "Pourquoi devons-nous prier Dieu ?",
        "Quel est le but de la prière ?",
        "Pourquoi Dieu veut-il que nous priions ?"
    ],


    "amour_pour_dieu": [
        "Comment aimer Dieu de tout mon coeur ?",
        "Que signifie aimer Dieu par-dessus tout ?",
        "Comment mettre Dieu en premier dans ma vie ?",
        "Quel est le plus grand commandement ?",
        "Comment aimer Dieu de toute mon âme ?",
        "Pourquoi devons-nous aimer Dieu avant tout ?"
    ],


    "amour_general": [
        "Que dit la Bible sur l'amour ?",
        "Qu'est-ce que l'amour selon la Bible ?",
        "Quelles sont les caractéristiques de l'amour véritable ?",
        "Parle-moi de l'amour dans la Bible",
        "Comment savoir si j'aime vraiment quelqu'un ?",
        "Que dit 1 Corinthiens 13 sur l'amour ?"
    ],


    "aimer_ses_ennemis": [
        "Comment aimer ses ennemis ?",
        "Que dit la Bible sur l'amour envers ses ennemis ?",
        "Dois-je aimer ceux qui me détestent ?",
        "Comment traiter quelqu'un qui me fait du mal ?",
        "Pourquoi devons-nous aimer nos ennemis ?",
        "Comment réagir face à quelqu'un qui me persécute ?"
    ],


    "definir_la_foi": [
        "Qu'est-ce que la foi ?",
        "Comment la Bible définit-elle la foi ?",
        "Que signifie avoir la foi ?",
        "Qu'est-ce que croire vraiment ?",
        "Que dit la Bible sur la foi ?",
        "Quelle est la définition biblique de la foi ?"
    ],


    "augmenter_sa_foi": [
        "Comment augmenter ma foi ?",
        "Comment avoir plus de foi ?",
        "Comment grandir dans la foi ?",
        "Comment fortifier ma foi en Dieu ?",
        "D'où vient la foi ?",
        "Comment ne pas douter et avoir la foi ?"
    ],


    "foi_et_oeuvres": [
        "La foi sans les oeuvres est-elle suffisante ?",
        "Que dit la Bible sur la foi et les oeuvres ?",
        "Suffit-il de croire sans agir ?",
        "Pourquoi Jacques dit que la foi sans les oeuvres est morte ?",
        "La foi doit-elle se manifester par des actes ?",
        "Peut-on avoir la foi sans la montrer par ses actions ?"
    ]
}


# ==========================================
# PRÉPARATION DES TYPES DE QUESTIONS
# ==========================================

print("❓ Préparation des types de questions...")

vecteurs_types_questions = {}

for type_question, exemples in types_questions.items():

    vecteurs = modele.encode(
        exemples,
        convert_to_numpy=True
    )

    normes = np.linalg.norm(
        vecteurs,
        axis=1,
        keepdims=True
    )

    vecteurs = (
        vecteurs /
        np.maximum(normes, 1e-12)
    )

    vecteurs_types_questions[type_question] = vecteurs


print("✅ Types de questions préparés !")


# ==========================================
# NETTOYAGE
# ==========================================

def nettoyer_question(question):

    question = question.lower()

    question = re.sub(
        r"[^\w\sàâäéèêëîïôöùûüÿç'-]",
        " ",
        question
    )

    return question.strip()


# ==========================================
# DÉTECTION DES INTENTIONS
# ==========================================

def detecter_intentions(question, seuil=0.55):

    question = nettoyer_question(question)

    vecteur_question = modele.encode(
        question,
        convert_to_numpy=True
    )

    norme = np.linalg.norm(
        vecteur_question
    )

    if norme != 0:

        vecteur_question = (
            vecteur_question / norme
        )

    scores = np.dot(
        embeddings_intentions,
        vecteur_question
    )

    meilleurs_scores = {}

    for indice, score in enumerate(scores):

        intention = noms_intentions[indice]

        if (
            intention not in meilleurs_scores
            or score > meilleurs_scores[intention]
        ):

            meilleurs_scores[intention] = float(score)

    intentions_triees = sorted(
        meilleurs_scores.items(),
        key=lambda x: x[1],
        reverse=True
    )

    if not intentions_triees:

        return []

    intention_principale, score_principal = (
        intentions_triees[0]
    )

    if score_principal < seuil:

        return []

    intentions_detectees = [
        (
            intention_principale,
            score_principal
        )
    ]

    for intention, score in intentions_triees[1:]:

        if score < seuil:
            continue

        if score >= score_principal * 0.90:

            intentions_detectees.append(
                (intention, score)
            )

    return intentions_detectees


# ==========================================
# DÉTECTION DU TYPE DE QUESTION
# ==========================================

def detecter_type_question(question):

    question = nettoyer_question(question)

    vecteur_question = modele.encode(
        question,
        convert_to_numpy=True
    )

    norme = np.linalg.norm(
        vecteur_question
    )

    if norme != 0:

        vecteur_question = (
            vecteur_question / norme
        )


    scores = []


    for type_question, vecteurs in (
        vecteurs_types_questions.items()
    ):

        similarites = np.dot(
            vecteurs,
            vecteur_question
        )

        meilleur_score = float(
            np.max(similarites)
        )

        scores.append(
            (
                type_question,
                meilleur_score
            )
        )


    scores.sort(
        key=lambda x: x[1],
        reverse=True
    )


    if not scores:

        return {
            "type": None,
            "score": 0.0,
            "scores": []
        }


    type_principal = scores[0][0]
    score_principal = scores[0][1]


    return {
        "type": type_principal,
        "score": score_principal,
        "scores": scores
    }


# ==========================================
# RÉCUPÉRATION DES THÈMES
# ==========================================

def recuperer_themes(intentions_detectees):

    themes = []

    for intention, score in intentions_detectees:

        donnees = intentions_bibliques[
            intention
        ]

        for theme in donnees["themes"]:

            if theme not in themes:

                themes.append(theme)

    return themes


# ==========================================
# ANALYSE COMPLÈTE
# ==========================================

def analyser_question(question):

    intentions_detectees = detecter_intentions(
        question
    )

    themes = recuperer_themes(
        intentions_detectees
    )

    type_question = detecter_type_question(
        question
    )

    return {
        "intentions": intentions_detectees,
        "themes": themes,
        "type_question": type_question
    }


# ==========================================
# PROGRAMME DE TEST
# ==========================================

if __name__ == "__main__":

    print("\n" + "=" * 60)
    print("🧠 INTELLIGENCE BIBLIQUE")
    print("=" * 60)

    print("\nPose une question.")
    print("Tape 'quitter' pour arrêter.\n")


    while True:

        question = input(
            "🤖 Question : "
        ).strip()


        if question.lower() == "quitter":

            print(
                "\n👋 À bientôt mon ami !"
            )

            break


        if not question:

            print(
                "⚠️ Écris une question.\n"
            )

            continue


        resultat = analyser_question(
            question
        )


        print(
            "\n🎯 Intentions détectées :"
        )


        if resultat["intentions"]:

            for numero, (
                intention,
                score
            ) in enumerate(
                resultat["intentions"],
                start=1
            ):

                if numero == 1:

                    print(
                        f"   ⭐ PRINCIPALE : "
                        f"{intention} "
                        f"(score : {score:.4f})"
                    )

                else:

                    print(
                        f"   🔹 SECONDAIRE : "
                        f"{intention} "
                        f"(score : {score:.4f})"
                    )

        else:

            print(
                "   ❌ Aucune intention détectée."
            )


        print(
            "\n❓ Type de question :"
        )

        print(
            f"   🎯 {resultat['type_question']['type']}"
        )

        print(
            f"   ⭐ Score : "
            f"{resultat['type_question']['score']:.4f}"
        )


        print(
            "\n📚 Thèmes associés :",
            resultat["themes"]
        )


        print()


        