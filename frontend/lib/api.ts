// ============================================================
// LILOBA — Client API
// ============================================================
// Centralise tous les appels au backend FastAPI.
// Modifier API_URL dans .env.local pour changer d'environnement.
// ============================================================

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ============================================================
// TYPES
// ============================================================

export interface SourceBiblique {
  reference: string;
  texte: string;
  niveau_pertinence: string | null;
  est_reference_demandee: boolean;
}

export interface Personnage {
  famille: string;
  profil: {
    nom: string;
    [key: string]: unknown;
  };
  score: number;
  aliases: string[];
}

export interface AskResponse {
  reponse: string;
  references: string[];
  sources: SourceBiblique[];
  personnages: Personnage[];
  niveau_pertinence_top: string | null;
  erreur: string | null;
  duree_ms: number;
}

export interface AskRequest {
  question: string;
  niveau?: string;
  user_id?: string;
  historique?: Array<{ role: string; content: string }>;
}

export interface LivresResponse {
  livres: string[];
}

export interface ChapitreResponse {
  livre: string;
  chapitre: number;
  versets: Record<string, string>;
}

// ============================================================
// ERREURS
// ============================================================

export class ApiError extends Error {
  status: number;
  detail?: string;

  constructor(status: number, message: string, detail?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail: string | undefined;
    try {
      const data = await response.json();
      detail = data.detail || data.message;
    } catch {
      // ignore
    }

    if (response.status === 429) {
      throw new ApiError(
        429,
        "Trop de questions. Réessaie dans une minute.",
        detail
      );
    }

    if (response.status === 400) {
      throw new ApiError(
        400,
        detail || "Question invalide.",
        detail
      );
    }

    if (response.status >= 500) {
      throw new ApiError(
        response.status,
        "Le service est temporairement indisponible.",
        detail
      );
    }

    throw new ApiError(
      response.status,
      detail || `Erreur ${response.status}`,
      detail
    );
  }

  return response.json();
}

// ============================================================
// ENDPOINTS
// ============================================================

/**
 * Pose une question à Apollos (assistant biblique).
 */
export async function askApollos(
  request: AskRequest
): Promise<AskResponse> {
  const response = await fetch(`${API_URL}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question: request.question,
      niveau: request.niveau ?? "18+",
      user_id: request.user_id ?? "web",
      historique: request.historique ?? null,
    }),
  });

  return handleResponse<AskResponse>(response);
}

/**
 * Récupère la liste des 66 livres de la Bible.
 */
export async function fetchLivres(): Promise<LivresResponse> {
  const response = await fetch(`${API_URL}/bible/livres`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  return handleResponse<LivresResponse>(response);
}

/**
 * Récupère un chapitre complet.
 * Exemple : fetchChapitre("Jean", 3)
 */
export async function fetchChapitre(
  livre: string,
  chapitre: number
): Promise<ChapitreResponse> {
  const livreEncode = encodeURIComponent(livre);
  const response = await fetch(
    `${API_URL}/bible/${livreEncode}/${chapitre}`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
    }
  );

  return handleResponse<ChapitreResponse>(response);
}

/**
 * Vérifie que le backend est en ligne.
 */
export async function checkHealth(): Promise<{
  status: string;
  version: string;
  bible_chargee: boolean;
}> {
  const response = await fetch(`${API_URL}/health`, {
    method: "GET",
  });

  return handleResponse(response);
}

// ============================================================
// STREAMING — Consommation du SSE
// ============================================================

export type StreamEvent =
  | { type: "status"; message: string }
  | { type: "sources"; sources: SourceBiblique[]; niveau_pertinence_top: string | null }
  | { type: "chunk"; content: string }
  | { type: "error"; message: string }
  | { type: "done" };

/**
 * Pose une question à Apollos en mode streaming.
 * Appelle le callback à chaque événement reçu.
 *
 * @param request - La question + contexte
 * @param onEvent - Callback appelé pour chaque événement du stream
 * @param signal - AbortSignal pour annuler la requête
 */
export async function askApollosStream(
  request: AskRequest,
  onEvent: (event: StreamEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch(`${API_URL}/ask/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      question: request.question,
      niveau: request.niveau ?? "18+",
      user_id: request.user_id ?? "web",
      historique: request.historique ?? null,
    }),
    signal,
  });

  if (!response.ok) {
    let detail: string | undefined;
    try {
      const data = await response.json();
      detail = data.detail;
    } catch {
      // ignore
    }
    throw new ApiError(
      response.status,
      detail || `Erreur ${response.status}`,
      detail
    );
  }

  if (!response.body) {
    throw new ApiError(500, "Pas de réponse du serveur");
  }

  // Lecture du stream SSE
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Les événements SSE sont séparés par "\n\n"
      const parts = buffer.split("\n\n");
      // Le dernier élément est potentiellement incomplet
      buffer = parts.pop() || "";

      for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed.startsWith("data:")) continue;

        const jsonStr = trimmed.slice(5).trim(); // enlève "data:"
        if (!jsonStr) continue;

        try {
          const event = JSON.parse(jsonStr) as StreamEvent;
          onEvent(event);
        } catch (e) {
          console.warn("Événement SSE invalide:", jsonStr);
        }
      }
    }

    // Traiter le dernier morceau s'il reste
    if (buffer.trim().startsWith("data:")) {
      const jsonStr = buffer.trim().slice(5).trim();
      if (jsonStr) {
        try {
          const event = JSON.parse(jsonStr) as StreamEvent;
          onEvent(event);
        } catch {
          // ignore
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
