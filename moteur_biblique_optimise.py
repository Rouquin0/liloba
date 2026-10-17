from __future__ import annotations

import json
import logging
import re
import threading
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

import numpy as np


logger = logging.getLogger(__name__)


BASE_DIR = Path(__file__).resolve().parent

BIBLE_PATH = BASE_DIR / "bible.json"
VERSE_INDEX_PATH = BASE_DIR / "versets_index.json"
PROFILS_PATH = BASE_DIR / "profils_versets.json"
EMBEDDINGS_PATH = BASE_DIR / "embeddings.npy"


MAX_QUESTION_LEN = 500
MAX_RESULTATS = 50
MAX_TEXTE_VERSET = 10000


NIVEAUX = (
    "directe",
    "forte",
    "moderee",
    "faible",
    "hors_sujet",
)


COEFFICIENTS_PERTINENCE = {
    "directe": 1.00,
    "forte": 0.85,
    "moderee": 0.55,
    "faible": 0.20,
    "hors_sujet": 0.00,
}


SCORE_MINIMUM_NORMAL = 0.20
SCORE_MINIMUM_VERIFICATION = 0.12


MARQUEURS_VERIFICATION = {
    "est ce vrai",
    "est ce que c est vrai",
    "vrai que",
    "a t il",
    "a t elle",
    "ont ils",
    "ont elles",
    "aurait",
    "aurais",
    "aurait il",
    "aurait elle",
    "est il vrai",
    "dit vraiment",
    "la bible dit elle",
    "selon la bible",
    "que dit la bible sur le fait",
    "est ce que la bible dit",
    "la bible affirme",
    "la bible enseigne t elle",
}


MOTS_VIDES = {
    "le", "la", "les", "un", "une", "des", "du", "de", "au", "aux",
    "et", "ou", "mais", "donc", "or", "ni", "car", "a", "en",
    "dans", "sur", "pour", "par", "avec", "sans", "ce", "cet", "cette",
    "ces", "qui", "que", "quoi", "dont", "comment", "pourquoi",
    "est", "sont", "etre", "fait", "faire", "dit", "dire", "peut",
    "peut-il", "peut-elle", "comme", "entre", "son", "sa", "ses",
    "leur", "leurs", "mon", "ma", "mes", "ton", "ta", "tes", "il",
    "elle", "ils", "elles", "on", "nous", "vous", "je", "me", "se",
}


MOTS_FAIBLEMENT_DISTINCTIFS = {
    "parole", "paroles", "chose", "choses", "personne", "personnes",
    "homme", "hommes", "femme", "femmes", "jour", "jours", "faire",
    "fait", "dire", "dit", "voir", "vue", "aller", "venir", "donner",
    "prendre", "bonne", "bon", "grand", "grande", "nouveau", "nouvelle",
}


REMPLACEMENTS_ACCENTS = str.maketrans({
    "à": "a", "â": "a", "ä": "a", "á": "a", "ã": "a",
    "ç": "c",
    "é": "e", "è": "e", "ê": "e", "ë": "e",
    "î": "i", "ï": "i", "ì": "i", "í": "i",
    "ô": "o", "ö": "o", "ò": "o", "ó": "o",
    "ù": "u", "û": "u", "ü": "u", "ú": "u",
    "ÿ": "y", "ý": "y",
    "œ": "oe", "æ": "ae",
})


LIVRES_BIBLIQUES = {
    "genese": "Genèse",
    "gn": "Genèse",
    "exode": "Exode",
    "ex": "Exode",
    "levitique": "Lévitique",
    "lev": "Lévitique",
    "nombres": "Nombres",
    "nb": "Nombres",
    "deuteronome": "Deutéronome",
    "dt": "Deutéronome",
    "josue": "Josué",
    "jos": "Josué",
    "juges": "Juges",
    "jg": "Juges",
    "ruth": "Ruth",
    "rt": "Ruth",
    "1 samuel": "1 Samuel",
    "1samuel": "1 Samuel",
    "1 sam": "1 Samuel",
    "1sam": "1 Samuel",
    "2 samuel": "2 Samuel",
    "2samuel": "2 Samuel",
    "2 sam": "2 Samuel",
    "2sam": "2 Samuel",
    "1 rois": "1 Rois",
    "1rois": "1 Rois",
    "2 rois": "2 Rois",
    "2rois": "2 Rois",
    "1 chroniques": "1 Chroniques",
    "1chroniques": "1 Chroniques",
    "1 chr": "1 Chroniques",
    "1chr": "1 Chroniques",
    "2 chroniques": "2 Chroniques",
    "2chroniques": "2 Chroniques",
    "2 chr": "2 Chroniques",
    "2chr": "2 Chroniques",
    "esdras": "Esdras",
    "esd": "Esdras",
    "nehemie": "Néhémie",
    "neh": "Néhémie",
    "esther": "Esther",
    "est": "Esther",
    "job": "Job",
    "psaume": "Psaume",
    "psaumes": "Psaume",
    "ps": "Psaume",
    "proverbes": "Proverbes",
    "pr": "Proverbes",
    "ecclesiaste": "Ecclésiaste",
    "ec": "Ecclésiaste",
    "cantique": "Cantique",
    "ct": "Cantique",
    "esaie": "Ésaïe",
    "es": "Ésaïe",
    "jeremie": "Jérémie",
    "jer": "Jérémie",
    "lamentations": "Lamentations",
    "la": "Lamentations",
    "ezechiel": "Ézéchiel",
    "ez": "Ézéchiel",
    "daniel": "Daniel",
    "dn": "Daniel",
    "osee": "Osée",
    "os": "Osée",
    "joel": "Joël",
    "jl": "Joël",
    "amos": "Amos",
    "am": "Amos",
    "abdias": "Abdias",
    "ab": "Abdias",
    "jonas": "Jonas",
    "jon": "Jonas",
    "michee": "Michée",
    "mi": "Michée",
    "nahum": "Nahum",
    "na": "Nahum",
    "habacuc": "Habacuc",
    "ha": "Habacuc",
    "sophonie": "Sophonie",
    "so": "Sophonie",
    "aggee": "Aggée",
    "ag": "Aggée",
    "zacharie": "Zacharie",
    "za": "Zacharie",
    "malachie": "Malachie",
    "matthieu": "Matthieu",
    "mt": "Matthieu",
    "marc": "Marc",
    "mc": "Marc",
    "luc": "Luc",
    "lc": "Luc",
    "jean": "Jean",
    "jn": "Jean",
    "actes": "Actes",
    "ac": "Actes",
    "romains": "Romains",
    "rm": "Romains",
    "ro": "Romains",
    "1 corinthiens": "1 Corinthiens",
    "1corinthiens": "1 Corinthiens",
    "1 cor": "1 Corinthiens",
    "1cor": "1 Corinthiens",
    "2 corinthiens": "2 Corinthiens",
    "2corinthiens": "2 Corinthiens",
    "2 cor": "2 Corinthiens",
    "2cor": "2 Corinthiens",
    "galates": "Galates",
    "ga": "Galates",
    "ephesiens": "Éphésiens",
    "ep": "Éphésiens",
    "philippiens": "Philippiens",
    "ph": "Philippiens",
    "colossiens": "Colossiens",
    "col": "Colossiens",
    "1 thessaloniciens": "1 Thessaloniciens",
    "1thessaloniciens": "1 Thessaloniciens",
    "1 thess": "1 Thessaloniciens",
    "1thess": "1 Thessaloniciens",
    "2 thessaloniciens": "2 Thessaloniciens",
    "2thessaloniciens": "2 Thessaloniciens",
    "2 thess": "2 Thessaloniciens",
    "2thess": "2 Thessaloniciens",
    "1 timothee": "1 Timothée",
    "1timothee": "1 Timothée",
    "1 tim": "1 Timothée",
    "1tim": "1 Timothée",
    "2 timothee": "2 Timothée",
    "2timothee": "2 Timothée",
    "2 tim": "2 Timothée",
    "2tim": "2 Timothée",
    "tite": "Tite",
    "tit": "Tite",
    "philemon": "Philémon",
    "phm": "Philémon",
    "hebreux": "Hébreux",
    "he": "Hébreux",
    "jacques": "Jacques",
    "jc": "Jacques",
    "1 pierre": "1 Pierre",
    "1pierre": "1 Pierre",
    "1 pi": "1 Pierre",
    "1pi": "1 Pierre",
    "2 pierre": "2 Pierre",
    "2pierre": "2 Pierre",
    "2 pi": "2 Pierre",
    "2pi": "2 Pierre",
    "1 jean": "1 Jean",
    "1jean": "1 Jean",
    "2 jean": "2 Jean",
    "2jean": "2 Jean",
    "3 jean": "3 Jean",
    "3jean": "3 Jean",
    "jude": "Jude",
    "jd": "Jude",
    "apocalypse": "Apocalypse",
    "ap": "Apocalypse",
}


_lock = threading.RLock()

_instance: Optional[MoteurBibliquePROD] = None


def _texte_securise(
    valeur: Any,
    limite: int,
) -> str:
    if not isinstance(valeur, str):
        return ""

    valeur = valeur.replace(
        "\x00",
        " ",
    ).strip()

    return valeur[:limite]


def _borne(
    valeur: Any,
    minimum: float = 0.0,
    maximum: float = 1.0,
) -> float:
    try:
        valeur = float(valeur)
    except (TypeError, ValueError):
        return minimum

    if not np.isfinite(valeur):
        return minimum

    return max(
        minimum,
        min(maximum, valeur),
    )


@lru_cache(maxsize=5000)
def norm_mot(mot: str) -> str:
    if not isinstance(mot, str):
        return ""

    return mot.strip().lower().translate(
        REMPLACEMENTS_ACCENTS
    )


@lru_cache(maxsize=5000)
def norm_texte(texte: str) -> str:
    if not isinstance(texte, str):
        return ""

    texte = texte.lower().translate(
        REMPLACEMENTS_ACCENTS
    )

    texte = re.sub(
        r"[^a-z0-9\s'-]",
        " ",
        texte,
    )

    return re.sub(
        r"\s+",
        " ",
        texte,
    ).strip()


def _tokens_significatifs(
    texte: str,
) -> List[str]:
    normalise = norm_texte(texte)

    if not normalise:
        return []

    tokens = re.findall(
        r"[a-z0-9]+(?:['-][a-z0-9]+)*",
        normalise,
    )

    return [
        token
        for token in tokens
        if len(token) >= 3
        and token not in MOTS_VIDES
    ]


def _ensemble_tokens(
    texte: str,
) -> Set[str]:
    return set(
        _tokens_significatifs(texte)
    )


def _tokens_profil(
    profil: Dict[str, Any],
) -> List[str]:
    tokens: List[str] = []

    if not isinstance(profil, dict):
        return tokens

    for valeur in profil.values():
        if isinstance(valeur, str):
            tokens.extend(
                _tokens_significatifs(valeur)
            )

        elif isinstance(
            valeur,
            (list, tuple, set),
        ):
            for item in valeur:
                if isinstance(item, str):
                    tokens.extend(
                        _tokens_significatifs(item)
                    )

    return list(
        dict.fromkeys(tokens)
    )


def _detecter_mode_verification(
    question: str,
) -> bool:
    texte = norm_texte(question)

    if not texte:
        return False

    return any(
        marqueur in texte
        for marqueur in MARQUEURS_VERIFICATION
    )


def _extraire_ancrages_bibliques(
    question: str,
) -> List[str]:
    tokens = _tokens_significatifs(
        question
    )

    return [
        token
        for token in tokens
        if len(token) >= 4
        and token not in MOTS_FAIBLEMENT_DISTINCTIFS
    ]


def _obtenir_texte_verset(
    verset: Dict[str, Any],
) -> str:
    if not isinstance(verset, dict):
        return ""

    for champ in (
        "texte",
        "text",
        "contenu",
        "content",
        "verset",
    ):
        valeur = verset.get(champ)

        if isinstance(
            valeur,
            str,
        ) and valeur.strip():
            return _texte_securise(
                valeur,
                MAX_TEXTE_VERSET,
            )

    return ""


def _obtenir_reference(
    verset: Dict[str, Any],
) -> str:
    if not isinstance(verset, dict):
        return ""

    for champ in (
        "reference",
        "référence",
        "ref",
        "reference_complete",
        "reference_canonique",
    ):
        valeur = verset.get(champ)

        if isinstance(
            valeur,
            str,
        ) and valeur.strip():
            return valeur.strip()

    return ""


def _obtenir_identifiant_verset(
    verset: Dict[str, Any],
    index: int,
) -> str:
    if not isinstance(verset, dict):
        return str(index)

    for champ in (
        "id",
        "verset_id",
        "verse_id",
        "index",
    ):
        valeur = verset.get(champ)

        if isinstance(
            valeur,
            (str, int),
        ):
            return str(valeur)

    return (
        _obtenir_reference(verset)
        or str(index)
    )


def _normaliser_profil(
    profil: Any,
) -> Dict[str, Any]:
    return (
        profil
        if isinstance(profil, dict)
        else {}
    )


def _extraire_concepts_profil(
    profil: Dict[str, Any],
) -> List[str]:
    if not isinstance(profil, dict):
        return []

    concepts: List[str] = []

    for valeur in (
        profil.get("concepts"),
        profil.get("concepts_bibliques"),
        profil.get("themes"),
        profil.get("thèmes"),
        profil.get("mots_cles"),
        profil.get("mots-clés"),
    ):
        if isinstance(valeur, str):
            concepts.extend(
                _tokens_significatifs(valeur)
            )

        elif isinstance(
            valeur,
            (list, tuple, set),
        ):
            for item in valeur:
                if isinstance(item, str):
                    concepts.extend(
                        _tokens_significatifs(item)
                    )

    return list(
        dict.fromkeys(concepts)
    )


def _calculer_recouvrement_concepts(
    question: str,
    profil: Dict[str, Any],
) -> float:
    concepts = set(
        _extraire_concepts_profil(
            profil
        )
    )

    question_tokens = _ensemble_tokens(
        question
    )

    if not concepts or not question_tokens:
        return 0.0

    correspondances = (
        question_tokens.intersection(
            concepts
        )
    )

    return _borne(
        len(correspondances)
        / max(
            min(len(question_tokens), 8),
            1,
        )
    )


def _calculer_score_ancrage(
    ancrages: List[str],
    texte_verset: str,
    profil: Dict[str, Any],
) -> Tuple[float, List[str]]:
    if not ancrages:
        return 0.0, []

    texte_tokens = _ensemble_tokens(
        texte_verset
    )

    profil_tokens = set(
        _tokens_profil(profil)
    )

    # Le texte réel du verset fait toujours foi. Un ancrage présent
    # uniquement dans le profil (métadonnée dérivée) compte pour
    # moitié moins qu'un ancrage réellement présent dans le texte
    # biblique lui-même — le profil reste un signal auxiliaire, pas
    # une preuve équivalente au texte.
    PONDERATION_ANCRAGE_TEXTE = 1.0
    PONDERATION_ANCRAGE_PROFIL_SEUL = 0.5

    poids_total = 0.0
    presents: List[str] = []

    for ancrage in ancrages:
        dans_texte = ancrage in texte_tokens
        dans_profil = ancrage in profil_tokens

        if dans_texte:
            poids_total += PONDERATION_ANCRAGE_TEXTE
            presents.append(ancrage)
        elif dans_profil:
            poids_total += (
                PONDERATION_ANCRAGE_PROFIL_SEUL
            )
            presents.append(ancrage)

    return (
        _borne(
            poids_total
            / max(
                min(len(ancrages), 8),
                1,
            )
        ),
        presents,
    )


def _calculer_compatibilite_contextuelle(
    question: str,
    verset: Dict[str, Any],
    profil: Dict[str, Any],
) -> float:
    question_tokens = _ensemble_tokens(
        question
    )

    if not question_tokens:
        return 0.0

    texte_tokens = _ensemble_tokens(
        _obtenir_texte_verset(verset)
    )

    profil_tokens = set(
        _tokens_profil(profil)
    )

    # Le texte du verset doit peser davantage que le profil : un mot
    # de la question retrouvé dans le TEXTE compte pleinement, un mot
    # retrouvé seulement dans le PROFIL (et absent du texte) compte
    # pour moitié moins. Cela évite qu'un passage soit jugé pertinent
    # uniquement parce que son profil partage un mot-clé générique
    # (ex: "communication") avec la question, sans que le texte lui-
    # même n'ait de rapport réel avec le sujet.
    PONDERATION_TEXTE = 1.0
    PONDERATION_PROFIL_SEUL = 0.5

    if not texte_tokens and not profil_tokens:
        return 0.0

    correspondances_texte = (
        question_tokens.intersection(
            texte_tokens
        )
    )

    correspondances_profil_seul = (
        question_tokens.intersection(
            profil_tokens
        )
        - correspondances_texte
    )

    poids_total = (
        len(correspondances_texte)
        * PONDERATION_TEXTE
        + len(correspondances_profil_seul)
        * PONDERATION_PROFIL_SEUL
    )

    return _borne(
        poids_total
        / max(
            min(len(question_tokens), 8),
            1,
        )
    )


def _obtenir_score_semantique(
    score: Any,
) -> float:
    try:
        valeur = float(score)
    except (TypeError, ValueError):
        return 0.0

    if not np.isfinite(valeur):
        return 0.0

    return _borne(valeur)


# ----------------------------------------------------------------------
# CONSIGNES UTILISATEUR
# ----------------------------------------------------------------------

def analyser_consignes_reponse(
    question: str,
) -> Dict[str, Any]:
    texte = norm_texte(question)

    consignes = {
        "bref": False,
        "mots_simples": False,
        "oui_non": False,
        "nombre_phrases": None,
        "seulement_verset": False,
        "sans_explication": False,
        "style": "normal",
        "instruction_detectee": False,
    }

    if not texte:
        return consignes

    marqueurs_bref = (
        "sois bref",
        "soit bref",
        "fais bref",
        "fait bref",
        "reponse breve",
        "reponse courte",
        "en bref",
        "brievement",
        "court",
        "courte",
    )

    marqueurs_simple = (
        "mots faciles",
        "mots simples",
        "langage simple",
        "termes simples",
        "explique simplement",
        "explique avec des mots simples",
        "facile a comprendre",
    )

    marqueurs_oui_non = (
        "reponds par oui ou non",
        "repond par oui ou non",
        "juste oui ou non",
        "seulement oui ou non",
        "oui ou non seulement",
    )

    marqueurs_verset = (
        "seulement le verset",
        "juste le verset",
        "donne seulement le verset",
        "donne moi seulement le verset",
        "donne-moi seulement le verset",
        "sans explication",
        "sans explications",
        "uniquement le verset",
    )

    if any(
        marqueur in texte
        for marqueur in marqueurs_bref
    ):
        consignes["bref"] = True
        consignes["style"] = "court"

    if any(
        marqueur in texte
        for marqueur in marqueurs_simple
    ):
        consignes["mots_simples"] = True

    if any(
        marqueur in texte
        for marqueur in marqueurs_oui_non
    ):
        consignes["oui_non"] = True
        consignes["style"] = "oui_non"

    if any(
        marqueur in texte
        for marqueur in marqueurs_verset
    ):
        consignes["seulement_verset"] = True
        consignes["sans_explication"] = True

    correspondance = re.search(
        r"\b(?:en|avec|en seulement|dans)\s+"
        r"(\d{1,2})\s+phrases?\b",
        texte,
    )

    if correspondance:
        nombre = int(
            correspondance.group(1)
        )

        if 1 <= nombre <= 20:
            consignes["nombre_phrases"] = nombre

    consignes["instruction_detectee"] = any(
        (
            consignes["bref"],
            consignes["mots_simples"],
            consignes["oui_non"],
            consignes["nombre_phrases"] is not None,
            consignes["seulement_verset"],
            consignes["sans_explication"],
        )
    )

    return consignes

# ----------------------------------------------------------------------
# RÉFÉRENCES BIBLIQUES
# ----------------------------------------------------------------------

def _canoniser_nom_livre(
    nom: str,
) -> Optional[str]:
    if not isinstance(nom, str):
        return None

    return LIVRES_BIBLIQUES.get(
        norm_texte(nom)
    )


def _normaliser_reference_espaces(
    reference: str,
) -> str:
    if not isinstance(reference, str):
        return ""

    texte = reference.strip()

    texte = re.sub(
        r"\s*:\s*",
        ":",
        texte,
    )

    texte = re.sub(
        r"\s*[-–—]\s*",
        "-",
        texte,
    )

    texte = re.sub(
        r"\s+",
        " ",
        texte,
    )

    return texte


def _extraire_reference_canonique(
    texte: str,
) -> Optional[Dict[str, Any]]:
    if not isinstance(texte, str):
        return None

    original = texte.strip()

    if not original:
        return None

    normalise = norm_texte(original)

    normalise = re.sub(
        r"\bchapitres?\b",
        " ",
        normalise,
    )

    normalise = re.sub(
        r"\bchap\.\b",
        " ",
        normalise,
    )

    normalise = re.sub(
        r"\bversets?\b",
        " ",
        normalise,
    )

    normalise = re.sub(
        r"\bvers\.\b",
        " ",
        normalise,
    )

    normalise = re.sub(
        r"\bv\.\b",
        " ",
        normalise,
    )

    normalise = re.sub(
        r"\bde\b",
        " ",
        normalise,
    )

    normalise = re.sub(
        r"\s*:\s*",
        " ",
        normalise,
    )

    normalise = re.sub(
        r"\s*[-–—]\s*",
        "-",
        normalise,
    )

    normalise = re.sub(
        r"\s+\ba\b\s+",
        " - ",
        normalise,
    )

    normalise = re.sub(
        r"\s+",
        " ",
        normalise,
    ).strip()

    livres_tries = sorted(
        LIVRES_BIBLIQUES.keys(),
        key=len,
        reverse=True,
    )

    for livre_source in livres_tries:
        motif_livre = re.escape(
            livre_source
        )

        correspondance = re.search(
            rf"(?<![a-z0-9])"
            rf"{motif_livre}"
            rf"(?![a-z0-9])",
            normalise,
        )

        if not correspondance:
            correspondance = re.search(
                rf"(?<![a-z0-9])"
                rf"{motif_livre}"
                rf"(?=\d)",
                normalise,
            )

        if not correspondance:
            continue

        reste = normalise[
            correspondance.end():
        ].strip()

        if not reste:
            return {
                "valide_syntaxe": False,
                "livre": LIVRES_BIBLIQUES[
                    livre_source
                ],
                "chapitre": None,
                "verset_debut": None,
                "verset_fin": None,
                "reference_canonique": None,
                "raison": (
                    "chapitre_ou_verset_manquant"
                ),
            }

        motif = re.match(
            r"^"
            r"\s*(\d+)"
            r"(?:\s+(\d+)"
            r"(?:\s*-\s*(\d+))?)?"
            r"\s*$",
            reste,
        )

        if not motif:
            return {
                "valide_syntaxe": False,
                "livre": LIVRES_BIBLIQUES[
                    livre_source
                ],
                "chapitre": None,
                "verset_debut": None,
                "verset_fin": None,
                "reference_canonique": None,
                "raison": "format_non_reconnu",
            }

        chapitre = int(
            motif.group(1)
        )

        verset_debut = (
            int(motif.group(2))
            if motif.group(2)
            else None
        )

        verset_fin = (
            int(motif.group(3))
            if motif.group(3)
            else None
        )

        if (
            verset_debut is not None
            and verset_fin is not None
            and verset_fin < verset_debut
        ):
            return {
                "valide_syntaxe": False,
                "livre": LIVRES_BIBLIQUES[
                    livre_source
                ],
                "chapitre": chapitre,
                "verset_debut": verset_debut,
                "verset_fin": verset_fin,
                "reference_canonique": None,
                "raison": "plage_inversee",
            }

        livre_canonique = (
            LIVRES_BIBLIQUES[
                livre_source
            ]
        )

        if verset_debut is None:
            reference_canonique = (
                f"{livre_canonique} "
                f"{chapitre}"
            )

        elif verset_fin is None:
            reference_canonique = (
                f"{livre_canonique} "
                f"{chapitre}:"
                f"{verset_debut}"
            )

        else:
            reference_canonique = (
                f"{livre_canonique} "
                f"{chapitre}:"
                f"{verset_debut}-"
                f"{verset_fin}"
            )

        return {
            "valide_syntaxe": True,
            "livre": livre_canonique,
            "chapitre": chapitre,
            "verset_debut": verset_debut,
            "verset_fin": verset_fin,
            "reference_canonique": (
                reference_canonique
            ),
            "raison": None,
        }

    return None


def _extraire_references_flexibles(
    question: str,
) -> List[Dict[str, Any]]:
    """
    Détecte les références bibliques exprimées
    sous différentes formes naturelles.
    """
    if not isinstance(question, str):
        return []

    texte = _texte_securise(
        question,
        MAX_QUESTION_LEN,
    )

    if not texte:
        return []

    normalise = norm_texte(texte)

    resultats: List[Dict[str, Any]] = []
    cles: Set[str] = set()

    livres_tries = sorted(
        LIVRES_BIBLIQUES.keys(),
        key=len,
        reverse=True,
    )

    for livre in livres_tries:
        motif = (
            rf"(?<![a-z0-9])"
            rf"{re.escape(livre)}"
            rf"(?:\s*"
            rf"(?:chapitre|chap\.)?"
            rf"\s*\d+)"
            rf"(?:"
            rf"\s*(?::\s*|"
            rf"\s+(?:versets?|vers\.|v\.)?\s*)"
            rf"\d+"
            rf"(?:\s*(?:-|a)\s*\d+)?"
            rf")?"
            rf"(?![a-z0-9])"
        )

        for correspondance in re.finditer(
            motif,
            normalise,
            flags=re.IGNORECASE,
        ):
            brut = (
                correspondance.group(0)
                .strip()
            )

            parsed = (
                _extraire_reference_canonique(
                    brut
                )
            )

            if parsed is None:
                continue

            parsed["texte_source"] = brut

            cle = (
                parsed.get(
                    "reference_canonique"
                )
                or (
                    f"{parsed.get('livre', '')}|"
                    f"{parsed.get('chapitre', '')}|"
                    f"{parsed.get('verset_debut', '')}|"
                    f"{parsed.get('verset_fin', '')}"
                )
            )

            if cle in cles:
                continue

            cles.add(cle)
            resultats.append(parsed)

    return resultats


def _reference_normalisee(
    reference: str,
) -> str:
    if not isinstance(reference, str):
        return ""

    # IMPORTANT : contrairement à norm_texte(), on conserve le ':'
    # qui sépare chapitre et verset. norm_texte() le remplace par
    # un espace, ce qui empêche _reference_verset_structure() de
    # distinguer le chapitre du verset (ex: "Matthieu 5:44" devenait
    # "matthieu 5 44", puis mal découpé en livre="matthieu 5",
    # chapitre=44 au lieu de livre="matthieu", chapitre=5, verset=44).
    texte = reference.lower().translate(
        REMPLACEMENTS_ACCENTS
    )

    texte = re.sub(
        r"[^a-z0-9\s':-]",
        " ",
        texte,
    )

    return re.sub(
        r"\s+",
        " ",
        texte,
    ).strip()


def _reference_verset_structure(
    reference: str,
) -> Optional[
    Tuple[str, int, Optional[int]]
]:
    if not isinstance(reference, str):
        return None

    texte = _reference_normalisee(
        reference
    )

    motif = re.match(
        r"^(.+?)\s+(\d+)"
        r"(?:\s*:\s*(\d+))?$",
        texte,
    )

    if not motif:
        return None

    return (
        motif.group(1).strip(),
        int(motif.group(2)),
        (
            int(motif.group(3))
            if motif.group(3)
            else None
        ),
    )


def _reference_correspond(
    reference_verset: str,
    references_demandees: List[Any],
) -> bool:
    structure_verset = (
        _reference_verset_structure(
            reference_verset
        )
    )

    if structure_verset is None:
        return False

    (
        livre_verset,
        chapitre_verset,
        numero_verset,
    ) = structure_verset

    livre_verset = norm_texte(
        livre_verset
    )

    for demandee in references_demandees:
        if not isinstance(
            demandee,
            dict,
        ):
            continue

        livre = demandee.get("livre")
        chapitre = demandee.get(
            "chapitre"
        )
        debut = demandee.get(
            "verset_debut"
        )
        fin = demandee.get(
            "verset_fin"
        )

        if not livre or chapitre is None:
            continue

        if (
            norm_texte(str(livre))
            != livre_verset
            or int(chapitre)
            != chapitre_verset
        ):
            continue

        if debut is None:
            return True

        if numero_verset is None:
            continue

        if fin is None:
            fin = debut

        if (
            int(debut)
            <= numero_verset
            <= int(fin)
        ):
            return True

    return False


# ----------------------------------------------------------------------
# VALIDATION DES RÉFÉRENCES CONTRE L'INDEX RÉEL
# ----------------------------------------------------------------------

def _construire_index_references(
    index: List[Dict[str, Any]],
) -> Dict[str, Any]:
    resultats: Dict[str, Any] = {
        "versets": set(),
        "chapitres": {},
    }

    for verset in index:
        if not isinstance(
            verset,
            dict,
        ):
            continue

        reference = _obtenir_reference(
            verset
        )

        structure = (
            _reference_verset_structure(
                reference
            )
        )

        if structure is None:
            continue

        (
            livre,
            chapitre,
            numero,
        ) = structure

        livre_normalise = norm_texte(
            livre
        )

        if not livre_normalise:
            continue

        cle_chapitre = (
            f"{livre_normalise}|"
            f"{chapitre}"
        )

        resultats[
            "chapitres"
        ].setdefault(
            cle_chapitre,
            set(),
        )

        if numero is not None:
            resultats[
                "versets"
            ].add(
                (
                    livre_normalise,
                    chapitre,
                    numero,
                )
            )

            resultats[
                "chapitres"
            ][
                cle_chapitre
            ].add(numero)

    return resultats


def _valider_reference_dans_index(
    reference: Dict[str, Any],
    index_references: Dict[str, Any],
) -> Dict[str, Any]:
    if not isinstance(
        reference,
        dict,
    ):
        return {
            "valide": False,
            "raison": "reference_invalide",
        }

    if not reference.get(
        "valide_syntaxe",
        False,
    ):
        return {
            "valide": False,
            "raison": reference.get(
                "raison",
                "syntaxe_invalide",
            ),
        }

    livre = reference.get(
        "livre"
    )

    chapitre = reference.get(
        "chapitre"
    )

    verset_debut = reference.get(
        "verset_debut"
    )

    verset_fin = reference.get(
        "verset_fin"
    )

    if not livre or chapitre is None:
        return {
            "valide": False,
            "raison": "reference_incomplete",
        }

    cle_chapitre = (
        f"{norm_texte(str(livre))}|"
        f"{chapitre}"
    )

    chapitres = index_references.get(
        "chapitres",
        {},
    )

    numeros_versets = chapitres.get(
        cle_chapitre
    )

    if numeros_versets is None:
        return {
            "valide": False,
            "raison": "chapitre_inexistant",
        }

    if verset_debut is None:
        return {
            "valide": True,
            "raison": None,
        }

    if verset_debut not in numeros_versets:
        return {
            "valide": False,
            "raison": "verset_inexistant",
        }

    if verset_fin is None:
        return {
            "valide": True,
            "raison": None,
        }

    if verset_fin < verset_debut:
        return {
            "valide": False,
            "raison": "plage_inversee",
        }

    for numero in range(
        verset_debut,
        verset_fin + 1,
    ):
        if numero not in numeros_versets:
            return {
                "valide": False,
                "raison": (
                    "verset_inexistant_dans_plage"
                ),
            }

    return {
        "valide": True,
        "raison": None,
    }


def analyser_references_bibliques(
    question: str,
    index_references: Optional[
        Dict[str, Any]
    ] = None,
) -> Dict[str, Any]:
    references = (
        _extraire_references_flexibles(
            question
        )
    )

    valides: List[
        Dict[str, Any]
    ] = []

    invalides: List[
        Dict[str, Any]
    ] = []

    for reference in references:
        if index_references is None:
            validation = {
                "valide": bool(
                    reference.get(
                        "valide_syntaxe",
                        False,
                    )
                ),
                "raison": reference.get(
                    "raison"
                ),
            }

        else:
            validation = (
                _valider_reference_dans_index(
                    reference,
                    index_references,
                )
            )

        resultat = dict(
            reference
        )

        resultat["valide"] = (
            validation["valide"]
        )

        resultat[
            "raison_validation"
        ] = validation[
            "raison"
        ]

        if validation["valide"]:
            valides.append(
                resultat
            )
        else:
            invalides.append(
                resultat
            )

    return {
        "references_detectees": references,
        "references_valides": valides,
        "references_invalides": invalides,
        "nombre_valides": len(valides),
        "nombre_invalides": len(invalides),
    }


def _references_demandees(
    analyse_references: Dict[str, Any],
) -> List[Dict[str, Any]]:
    if not isinstance(
        analyse_references,
        dict,
    ):
        return []

    return [
        reference
        for reference in analyse_references.get(
            "references_valides",
            [],
        )
        if isinstance(
            reference,
            dict,
        )
        and reference.get(
            "reference_canonique"
        )
    ]

# ----------------------------------------------------------------------
# PERTINENCE CONTEXTUELLE
# ----------------------------------------------------------------------

def _priorite_niveau(
    niveau: str,
) -> int:
    ordre = {
        "hors_sujet": 0,
        "faible": 1,
        "moderee": 2,
        "forte": 3,
        "directe": 4,
    }

    return ordre.get(
        niveau,
        0,
    )


def _determiner_niveau_pertinence(
    score_semantique: float,
    score_ancrage: float,
    score_contexte: float,
    score_concepts: float,
    reference_demandee: bool,
) -> str:
    score_semantique = _borne(
        score_semantique
    )

    score_ancrage = _borne(
        score_ancrage
    )

    score_contexte = _borne(
        score_contexte
    )

    score_concepts = _borne(
        score_concepts
    )

    if reference_demandee:
        # IMPORTANT : le fait qu'une référence ait été explicitement
        # demandée (ex: "Jean 3:16") sert à SÉLECTIONNER le passage
        # exact — cela ne détermine PAS automatiquement sa pertinence
        # thématique. "Que dit Jean 3:16 sur TikTok ?" doit pouvoir
        # retourner Jean 3:16 (référence demandée = sélection), mais
        # sa pertinence par rapport à "TikTok" doit être évaluée
        # honnêtement (probablement faible/hors_sujet), pas classée
        # "directe" par défaut. L'admissibilité du résultat malgré une
        # pertinence faible est gérée séparément dans
        # _est_resultat_admissible().
        pass

    signal_contextuel = max(
        score_ancrage,
        score_contexte,
        score_concepts,
    )

    score_global = _borne(
        score_semantique * 0.55
        + score_ancrage * 0.20
        + score_contexte * 0.15
        + score_concepts * 0.10
    )

    if (
        score_semantique >= 0.82
        and signal_contextuel >= 0.25
    ):
        return "directe"

    if (
        score_semantique >= 0.75
        and signal_contextuel >= 0.35
    ):
        return "directe"

    if (
        score_semantique >= 0.68
        and signal_contextuel >= 0.15
    ):
        return "forte"

    if (
        score_semantique >= 0.58
        and signal_contextuel >= 0.08
        and score_global >= 0.34
    ):
        return "moderee"

    if (
        score_semantique >= 0.50
        and signal_contextuel >= 0.04
    ):
        return "faible"

    # VOIE SÉMANTIQUE PURE (cross-lingue) : les scores d'ancrage, de
    # contexte et de concepts reposent tous sur une correspondance de
    # MOTS EXACTS avec le texte/profil français. Pour une question
    # posée dans une autre langue (anglais, chinois...), ce
    # recouvrement lexical est structurellement impossible même
    # quand le modèle sémantique multilingue identifie correctement
    # un passage réellement pertinent (cosinus élevé). Sans cette
    # voie, TOUTE question non francophone tombait automatiquement
    # en hors_sujet, quelle que soit la qualité de la correspondance
    # sémantique. On reste volontairement prudent : "directe" reste
    # hors de portée par ce seul chemin (elle nécessite toujours un
    # signal contextuel réel), et les seuils sont élevés pour éviter
    # de faire remonter un passage vraiment sans rapport.
    if signal_contextuel < 0.04:
        if score_semantique >= 0.80:
            return "forte"

        if score_semantique >= 0.65:
            return "moderee"

    return "hors_sujet"


def _construire_justification_pertinence(
    niveau: str,
    ancrages_trouves: List[str],
) -> str:
    if niveau == "directe":
        if ancrages_trouves:
            return (
                "Le passage présente une correspondance "
                "directe avec la question et des éléments "
                "contextuels concordants."
            )

        return (
            "Le passage présente une correspondance "
            "directe avec la question."
        )

    if niveau == "forte":
        if ancrages_trouves:
            return (
                "Le passage présente une forte compatibilité "
                "sémantique et contextuelle avec la question, "
                "avec des ancrages bibliques concordants."
            )

        return (
            "Le passage présente une forte compatibilité "
            "sémantique et contextuelle avec la question."
        )

    if niveau == "moderee":
        return (
            "Le passage peut contribuer à la question, "
            "mais le lien est moins direct. Son utilisation "
            "doit rester prudente."
        )

    if niveau == "faible":
        return (
            "Le lien avec la question est très indirect "
            "et risque de produire une application artificielle."
        )

    return (
        "Le passage ne présente pas suffisamment de "
        "compatibilité contextuelle avec la question."
    )


def _evaluer_pertinence(
    question: str,
    verset: Dict[str, Any],
    profil: Dict[str, Any],
    score_semantique: float,
    ancrages: List[str],
    mode_verification: bool,
    reference_demandee: bool = False,
) -> Dict[str, Any]:
    texte_verset = _obtenir_texte_verset(
        verset
    )

    (
        score_ancrage,
        ancrages_trouves,
    ) = _calculer_score_ancrage(
        ancrages,
        texte_verset,
        profil,
    )

    score_contexte = (
        _calculer_compatibilite_contextuelle(
            question,
            verset,
            profil,
        )
    )

    score_concepts = (
        _calculer_recouvrement_concepts(
            question,
            profil,
        )
    )

    niveau = _determiner_niveau_pertinence(
        score_semantique=score_semantique,
        score_ancrage=score_ancrage,
        score_contexte=score_contexte,
        score_concepts=score_concepts,
        reference_demandee=reference_demandee,
    )

    coefficient = (
        COEFFICIENTS_PERTINENCE.get(
            niveau,
            0.0,
        )
    )

    score_brut = _borne(
        score_semantique * 0.55
        + score_ancrage * 0.20
        + score_contexte * 0.15
        + score_concepts * 0.10
    )

    if reference_demandee:
        score_brut = max(
            score_brut,
            score_semantique,
        )

    score_final = _borne(
        score_brut * coefficient
    )

    seuil = (
        SCORE_MINIMUM_VERIFICATION
        if mode_verification
        else SCORE_MINIMUM_NORMAL
    )

    return {
        "pertinence": niveau,
        "coefficient_pertinence": coefficient,
        "score": score_final,
        "score_brut": score_brut,
        "score_semantique": _borne(
            score_semantique
        ),
        "score_ancrage": _borne(
            score_ancrage
        ),
        "score_contexte": _borne(
            score_contexte
        ),
        "score_concepts": _borne(
            score_concepts
        ),
        "ancrages_trouves": (
            ancrages_trouves
        ),
        "reference_demandee": (
            reference_demandee
        ),
        "justification": (
            _construire_justification_pertinence(
                niveau,
                ancrages_trouves,
            )
        ),
        "seuil_admissibilite": seuil,
    }


def _est_resultat_admissible(
    evaluation: Dict[str, Any],
    mode_verification: bool,
) -> bool:
    if not isinstance(
        evaluation,
        dict,
    ):
        return False

    niveau = evaluation.get(
        "pertinence",
        "hors_sujet",
    )

    # Un passage explicitement demandé par référence (ex: "Jean 3:16")
    # doit toujours pouvoir être retourné, même si sa pertinence
    # thématique honnête est faible ou hors_sujet par rapport à un
    # éventuel sujet moderne accolé à la question (ex: "... sur
    # TikTok ?"). C'est au générateur de présenter cette nuance à
    # l'utilisateur, pas au moteur de cacher le passage demandé.
    if evaluation.get(
        "reference_demandee",
        False,
    ):
        return True

    if niveau in {
        "faible",
        "hors_sujet",
    }:
        return False

    score = _borne(
        evaluation.get(
            "score",
            0.0,
        )
    )

    seuil = (
        SCORE_MINIMUM_VERIFICATION
        if mode_verification
        else SCORE_MINIMUM_NORMAL
    )

    return score >= seuil


def _preparer_resultat(
    verset: Dict[str, Any],
    evaluation: Dict[str, Any],
    score_semantique: float,
    position: int,
    similarite_cosinus: Optional[float] = None,
) -> Dict[str, Any]:
    return {
        "id": _obtenir_identifiant_verset(
            verset,
            position,
        ),
        "reference": _obtenir_reference(
            verset
        ),
        "texte": _obtenir_texte_verset(
            verset
        ),
        "pertinence": evaluation.get(
            "pertinence",
            "hors_sujet",
        ),
        # Alias conservé pour compatibilité avec les consommateurs
        # (main.py, generateur_reponse.py) qui lisent la clé
        # "niveau_pertinence" plutôt que "pertinence".
        "niveau_pertinence": evaluation.get(
            "pertinence",
            "hors_sujet",
        ),
        "justification_pertinence": (
            evaluation.get(
                "justification",
                "",
            )
        ),
        "principe_biblique": None,
        "application_possible": None,
        "score": _borne(
            evaluation.get(
                "score",
                0.0,
            )
        ),
        "score_semantique": _borne(
            score_semantique
        ),
        # Champ additif : similarité cosinus RÉELLE (non transformée
        # par (x+1)/2), fournie pour la traçabilité. Ne pas la
        # présenter comme une probabilité — c'est un signal brut.
        "similarite_cosinus": (
            None
            if similarite_cosinus is None
            else round(
                float(similarite_cosinus),
                4,
            )
        ),
        "score_ancrage": _borne(
            evaluation.get(
                "score_ancrage",
                0.0,
            )
        ),
        "score_contexte": _borne(
            evaluation.get(
                "score_contexte",
                0.0,
            )
        ),
        "score_concepts": _borne(
            evaluation.get(
                "score_concepts",
                0.0,
            )
        ),
        "ancrages_trouves": list(
            evaluation.get(
                "ancrages_trouves",
                [],
            )
        ),
        "reference_demandee": bool(
            evaluation.get(
                "reference_demandee",
                False,
            )
        ),
    }


# ----------------------------------------------------------------------
# CHARGEMENT DES DONNÉES
# ----------------------------------------------------------------------

def _charger_json(
    path: Path,
    valeur_defaut: Any,
) -> Any:
    try:
        if not path.exists():
            logger.error(
                "Fichier introuvable : %s",
                path,
            )
            return valeur_defaut

        with path.open(
            "r",
            encoding="utf-8",
        ) as fichier:
            return json.load(fichier)

    except (
        OSError,
        json.JSONDecodeError,
    ) as exc:
        logger.error(
            "Impossible de charger %s : %s",
            path,
            exc,
        )
        return valeur_defaut


def _charger_embeddings(
    path: Path,
) -> np.ndarray:
    try:
        if not path.exists():
            logger.error(
                "Fichier embeddings introuvable : %s",
                path,
            )
            return np.empty(
                (0, 0),
                dtype=np.float32,
            )

        embeddings = np.load(
            path,
            mmap_mode="r",
            allow_pickle=False,
        )

        if not isinstance(
            embeddings,
            np.ndarray,
        ):
            return np.empty(
                (0, 0),
                dtype=np.float32,
            )

        if embeddings.ndim != 2:
            logger.error(
                "Format embeddings invalide : ndim=%s",
                embeddings.ndim,
            )
            return np.empty(
                (0, 0),
                dtype=np.float32,
            )

        if (
            embeddings.shape[0] == 0
            or embeddings.shape[1] == 0
        ):
            logger.error(
                "Le fichier embeddings est vide ou invalide."
            )
            return np.empty(
                (0, 0),
                dtype=np.float32,
            )

        return embeddings

    except (
        OSError,
        ValueError,
    ) as exc:
        logger.error(
            "Impossible de charger les embeddings : %s",
            exc,
        )
        return np.empty(
            (0, 0),
            dtype=np.float32,
        )


def _normaliser_collection_versets(
    donnees: Any,
) -> List[Dict[str, Any]]:
    if isinstance(
        donnees,
        list,
    ):
        return [
            item
            for item in donnees
            if isinstance(
                item,
                dict,
            )
        ]

    if isinstance(
        donnees,
        dict,
    ):
        resultats: List[
            Dict[str, Any]
        ] = []

        for valeur in donnees.values():
            if isinstance(
                valeur,
                dict,
            ):
                resultats.append(
                    valeur
                )

            elif isinstance(
                valeur,
                list,
            ):
                resultats.extend(
                    item
                    for item in valeur
                    if isinstance(
                        item,
                        dict,
                    )
                )

        return resultats

    return []


def _charger_modele_semantique():
    try:
        from intelligence_biblique import modele

        if modele is None:
            logger.error(
                "Le modèle sémantique est indisponible."
            )
            return None

        return modele

    except Exception as exc:
        logger.error(
            "Impossible de charger le modèle sémantique : %s",
            exc,
        )
        return None


def _charger_index_versets(
    donnees: Any,
) -> List[Dict[str, Any]]:
    return _normaliser_collection_versets(
        donnees
    )


def _attacher_profils(
    versets: List[Dict[str, Any]],
    profils: Any,
) -> List[Dict[str, Any]]:
    if not isinstance(
        profils,
        dict,
    ):
        return versets

    profils_par_reference: Dict[
        str,
        Dict[str, Any],
    ] = {}

    for cle, profil in profils.items():
        if isinstance(
            profil,
            dict,
        ):
            reference_normalisee = (
                _reference_normalisee(
                    str(cle)
                )
            )

            if reference_normalisee:
                profils_par_reference[
                    reference_normalisee
                ] = profil

    resultat: List[
        Dict[str, Any]
    ] = []

    for verset in versets:
        copie = dict(
            verset
        )

        reference = (
            _reference_normalisee(
                _obtenir_reference(
                    copie
                )
            )
        )

        copie["_profil"] = (
            profils_par_reference.get(
                reference,
                {},
            )
        )

        resultat.append(
            copie
        )

    return resultat


def _verifier_integrite_donnees(
    index: List[Dict[str, Any]],
    embeddings: np.ndarray,
) -> bool:
    if not index:
        logger.error(
            "Index biblique vide."
        )
        return False

    if (
        not isinstance(
            embeddings,
            np.ndarray,
        )
        or embeddings.ndim != 2
    ):
        logger.error(
            "Embeddings invalides."
        )
        return False

    if embeddings.shape[0] != len(index):
        logger.error(
            "Incohérence : %s versets pour %s embeddings.",
            len(index),
            embeddings.shape[0],
        )
        return False

    if embeddings.shape[1] <= 0:
        logger.error(
            "Dimension des embeddings invalide."
        )
        return False

    return True


def _normaliser_embeddings(
    embeddings: np.ndarray,
) -> np.ndarray:
    """
    Normalise chaque ligne (vecteur d'un verset) à une norme L2 de 1.

    Optimisation : appelée UNE SEULE FOIS au chargement du moteur,
    plutôt qu'à chaque requête utilisateur. Le calcul par requête se
    réduit ensuite à un simple produit scalaire
    (embeddings_normalises · vecteur_question), au lieu de
    recalculer les normes de ~31 000 vecteurs à chaque question.
    """

    try:
        embeddings = np.asarray(
            embeddings,
            dtype=np.float32,
        )

        if (
            embeddings.ndim != 2
            or embeddings.size == 0
        ):
            return embeddings

        normes = np.linalg.norm(
            embeddings,
            axis=1,
            keepdims=True,
        )

        normes = np.maximum(
            normes,
            np.finfo(np.float32).eps,
        )

        return embeddings / normes

    except Exception as exc:
        logger.error(
            "Erreur lors de la normalisation des embeddings : %s",
            exc,
        )
        return embeddings


class MoteurBibliquePROD:
    """
    Moteur biblique de production.

    Responsabilités :
    - charger les données bibliques ;
    - charger les profils et embeddings ;
    - encoder les questions ;
    - rechercher les passages candidats ;
    - valider les références bibliques ;
    - évaluer la pertinence contextuelle ;
    - filtrer les passages trop éloignés ;
    - retourner des sources structurées.

    Le moteur ne fabrique ni principe biblique
    ni application moderne.
    """

    def __init__(self) -> None:
        self.bible: List[
            Dict[str, Any]
        ] = []

        self.index: List[
            Dict[str, Any]
        ] = []

        self.profils: Dict[
            str,
            Any,
        ] = {}

        self.embeddings = np.empty(
            (0, 0),
            dtype=np.float32,
        )

        self.embeddings_normalises = np.empty(
            (0, 0),
            dtype=np.float32,
        )

        self.index_references: Dict[
            str,
            Any,
        ] = {
            "versets": set(),
            "chapitres": {},
        }

        self.modele = None
        self.charge = False

        self._charger()

    def _charger(self) -> None:
        with _lock:
            if self.charge:
                return

            logger.info(
                "Chargement moteur biblique PROD..."
            )

            donnees_bible = _charger_json(
                BIBLE_PATH,
                [],
            )

            donnees_index = _charger_json(
                VERSE_INDEX_PATH,
                [],
            )

            donnees_profils = _charger_json(
                PROFILS_PATH,
                {},
            )

            self.bible = (
                _normaliser_collection_versets(
                    donnees_bible
                )
            )

            self.index = (
                _charger_index_versets(
                    donnees_index
                )
            )

            if not self.index:
                logger.warning(
                    "Index de versets indisponible. "
                    "Utilisation des données bibliques."
                )

                self.index = list(
                    self.bible
                )

            self.profils = (
                donnees_profils
                if isinstance(
                    donnees_profils,
                    dict,
                )
                else {}
            )

            self.index = _attacher_profils(
                self.index,
                self.profils,
            )

            self.index_references = (
                _construire_index_references(
                    self.index
                )
            )

            self.embeddings = (
                _charger_embeddings(
                    EMBEDDINGS_PATH
                )
            )

            if not _verifier_integrite_donnees(
                self.index,
                self.embeddings,
            ):
                logger.error(
                    "Intégrité des données bibliques invalide."
                )
                return

            # Optimisation : les embeddings sont normalisés UNE SEULE
            # FOIS au chargement (au lieu d'être renormalisés à
            # chaque recherche). self.embeddings_normalises est
            # réutilisé par _calculer_similarites(). self.embeddings
            # (brut) reste inchangé pour ne rien casser côté
            # consommateurs éventuels de cet attribut.
            self.embeddings_normalises = (
                _normaliser_embeddings(
                    self.embeddings
                )
            )

            self.modele = (
                _charger_modele_semantique()
            )

            if self.modele is None:
                logger.error(
                    "Le modèle sémantique n'a pas pu être chargé."
                )
                return

            self.charge = True

            logger.info(
                "Moteur chargé : %s versets",
                len(self.index),
            )

    def est_disponible(self) -> bool:
        return bool(
            self.charge
            and self.index
            and self.modele is not None
            and self.embeddings.size > 0
        )

    def _encoder_question(
        self,
        question: str,
    ) -> Optional[np.ndarray]:
        if self.modele is None:
            return None

        try:
            vecteur = self.modele.encode(
                question,
                convert_to_numpy=True,
                normalize_embeddings=True,
            )

            vecteur = np.asarray(
                vecteur,
                dtype=np.float32,
            )

            if vecteur.ndim == 1:
                vecteur = vecteur.reshape(
                    1,
                    -1,
                )

            if (
                vecteur.ndim != 2
                or vecteur.shape[0] != 1
                or vecteur.shape[1] <= 0
            ):
                return None

            if not np.all(
                np.isfinite(vecteur)
            ):
                return None

            norme = np.linalg.norm(
                vecteur[0]
            )

            if (
                not np.isfinite(norme)
                or norme <= 0.0
            ):
                return None

            vecteur[0] /= norme

            return vecteur

        except Exception as exc:
            logger.error(
                "Erreur d'encodage sémantique : %s",
                exc,
            )
            return None

    def _calculer_similarites(
        self,
        vecteur_question: np.ndarray,
    ) -> Optional[np.ndarray]:
        if (
            not isinstance(
                vecteur_question,
                np.ndarray,
            )
            or vecteur_question.ndim != 2
            or self.embeddings.ndim != 2
            or self.embeddings.shape[0]
            != len(self.index)
            or self.embeddings.shape[1]
            != vecteur_question.shape[1]
        ):
            logger.error(
                "Dimensions incompatibles entre "
                "la question et les embeddings."
            )
            return None

        try:
            # Optimisation : on réutilise les embeddings déjà
            # normalisés au chargement (self.embeddings_normalises)
            # au lieu de renormaliser ~31 000 vecteurs à chaque
            # requête. Repli automatique et sûr sur un calcul à la
            # volée si le cache est absent ou incohérent (aucune
            # régression possible).
            embeddings_normalises = getattr(
                self,
                "embeddings_normalises",
                None,
            )

            if (
                not isinstance(
                    embeddings_normalises,
                    np.ndarray,
                )
                or embeddings_normalises.shape
                != self.embeddings.shape
            ):
                embeddings_normalises = (
                    _normaliser_embeddings(
                        self.embeddings
                    )
                )

            scores = np.dot(
                embeddings_normalises,
                vecteur_question[0],
            )

            scores = np.asarray(
                scores,
                dtype=np.float32,
            )

            if not np.all(
                np.isfinite(scores)
            ):
                scores[
                    ~np.isfinite(scores)
                ] = 0.0

            return np.clip(
                scores,
                -1.0,
                1.0,
            )

        except (
            ValueError,
            TypeError,
            FloatingPointError,
        ) as exc:
            logger.error(
                "Erreur lors du calcul des similarités : %s",
                exc,
            )
            return None

    def rechercher(
        self,
        question: str,
        limite: int = 10,
    ) -> List[Dict[str, Any]]:
        if not self.est_disponible():
            logger.error(
                "Recherche impossible : moteur indisponible."
            )
            return []

        if not isinstance(
            question,
            str,
        ):
            return []

        question = _texte_securise(
            question,
            MAX_QUESTION_LEN,
        )

        if not question:
            return []

        try:
            limite = int(limite)
        except (
            TypeError,
            ValueError,
        ):
            limite = 10

        limite = max(
            1,
            min(
                limite,
                MAX_RESULTATS,
            ),
        )

        mode_verification = (
            _detecter_mode_verification(
                question
            )
        )

        ancrages = (
            _extraire_ancrages_bibliques(
                question
            )
        )

        analyse_references = (
            analyser_references_bibliques(
                question,
                self.index_references,
            )
        )

        references_detectees = (
            analyse_references.get(
                "references_detectees",
                [],
            )
        )

        references_demandees = (
            _references_demandees(
                analyse_references
            )
        )

        if (
            references_detectees
            and not references_demandees
        ):
            logger.info(
                "Référence biblique détectée mais invalide : "
                "aucun résultat retourné."
            )
            return []

        vecteur_question = (
            self._encoder_question(
                question
            )
        )

        if vecteur_question is None:
            logger.error(
                "Impossible d'encoder la question."
            )
            return []

        scores_semantiques = (
            self._calculer_similarites(
                vecteur_question
            )
        )

        if scores_semantiques is None:
            return []

        candidats: List[
            Dict[str, Any]
        ] = []

        recherche_reference_explicite = bool(
            references_demandees
        )

        for position, verset in enumerate(
            self.index
        ):
            if not isinstance(
                verset,
                dict,
            ):
                continue

            reference = (
                _obtenir_reference(
                    verset
                )
            )

            reference_demandee = (
                _reference_correspond(
                    reference,
                    references_demandees,
                )
            )

            if (
                recherche_reference_explicite
                and not reference_demandee
            ):
                continue

            score_semantique = float(
                scores_semantiques[
                    position
                ]
            )

            score_semantique_normalise = (
                _borne(
                    (
                        score_semantique
                        + 1.0
                    )
                    / 2.0
                )
            )

            profil = _normaliser_profil(
                verset.get(
                    "_profil",
                    {},
                )
            )

            evaluation = (
                _evaluer_pertinence(
                    question=question,
                    verset=verset,
                    profil=profil,
                    score_semantique=(
                        score_semantique_normalise
                    ),
                    ancrages=ancrages,
                    mode_verification=(
                        mode_verification
                    ),
                    reference_demandee=(
                        reference_demandee
                    ),
                )
            )

            if not _est_resultat_admissible(
                evaluation,
                mode_verification,
            ):
                continue

            resultat = _preparer_resultat(
                verset=verset,
                evaluation=evaluation,
                score_semantique=(
                    score_semantique_normalise
                ),
                position=position,
                similarite_cosinus=(
                    score_semantique
                ),
            )

            resultat[
                "mode_verification"
            ] = mode_verification

            candidats.append(
                resultat
            )

        candidats.sort(
            key=lambda resultat: (
                _priorite_niveau(
                    resultat.get(
                        "pertinence",
                        "hors_sujet",
                    )
                ),
                bool(
                    resultat.get(
                        "reference_demandee",
                        False,
                    )
                ),
                float(
                    resultat.get(
                        "score",
                        0.0,
                    )
                ),
                float(
                    resultat.get(
                        "score_semantique",
                        0.0,
                    )
                ),
            ),
            reverse=True,
        )

        resultats = candidats[
            :limite
        ]

        if not resultats:
            logger.info(
                "Aucun passage suffisamment pertinent "
                "pour la question."
            )

        return resultats
    def rechercher_avec_metadata(
        self,
        question: str,
        limite: int = 10,
    ) -> Dict[str, Any]:
        question_securisee = (
            _texte_securise(
                question,
                MAX_QUESTION_LEN,
            )
        )

        resultats = self.rechercher(
            question_securisee,
            limite,
        )

        consignes = (
            analyser_consignes_reponse(
                question_securisee
            )
        )

        references = (
            analyser_references_bibliques(
                question_securisee,
                self.index_references,
            )
        )

        return {
            "question": question_securisee,
            "resultats": resultats,
            "nombre_resultats": len(
                resultats
            ),
            "mode_verification": (
                _detecter_mode_verification(
                    question_securisee
                )
            ),
            "ancrages_bibliques": (
                _extraire_ancrages_bibliques(
                    question_securisee
                )
            ),
            "references_bibliques": references,
            "consignes_reponse": consignes,
        }

    def analyser_question(
        self,
        question: str,
    ) -> Dict[str, Any]:
        question_securisee = (
            _texte_securise(
                question,
                MAX_QUESTION_LEN,
            )
        )

        return {
            "question": question_securisee,
            "mode_verification": (
                _detecter_mode_verification(
                    question_securisee
                )
            ),
            "ancrages_bibliques": (
                _extraire_ancrages_bibliques(
                    question_securisee
                )
            ),
            "references_bibliques": (
                analyser_references_bibliques(
                    question_securisee,
                    self.index_references,
                )
            ),
            "consignes_reponse": (
                analyser_consignes_reponse(
                    question_securisee
                )
            ),
        }


# ----------------------------------------------------------------------
# SINGLETON
# ----------------------------------------------------------------------

def _get_instance() -> MoteurBibliquePROD:
    global _instance

    if _instance is None:
        with _lock:
            if _instance is None:
                moteur = MoteurBibliquePROD()

                if not moteur.est_disponible():
                    logger.error(
                        "Le moteur biblique n'a pas pu être initialisé."
                    )

                _instance = moteur

    return _instance


# ----------------------------------------------------------------------
# INTERFACE PUBLIQUE
# ----------------------------------------------------------------------

def rechercher(
    question: str,
    limite: int = 10,
) -> List[Dict[str, Any]]:
    return _get_instance().rechercher(
        question,
        limite,
    )


def rechercher_avec_metadata(
    question: str,
    limite: int = 10,
) -> Dict[str, Any]:
    return _get_instance().rechercher_avec_metadata(
        question,
        limite,
    )


def analyser_question(
    question: str,
) -> Dict[str, Any]:
    return _get_instance().analyser_question(
        question
    )


def moteur_disponible() -> bool:
    return _get_instance().est_disponible()


__all__ = [
    "MoteurBibliquePROD",
    "rechercher",
    "rechercher_avec_metadata",
    "analyser_question",
    "analyser_consignes_reponse",
    "analyser_references_bibliques",
    "moteur_disponible",
    "norm_mot",
    "norm_texte",
    "NIVEAUX",
    "MAX_QUESTION_LEN",
    "MAX_RESULTATS",
]
