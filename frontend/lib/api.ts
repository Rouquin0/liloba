// ============================================================
// LILOBA — Client API
// ============================================================

import { supabase } from "@/lib/supabase"; // <-- NOUVEL IMPORT

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://liloba-backend.onrender.com";

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
      throw new ApiError(429, detail || "Trop de questions. Réessaie plus tard.", detail);
    }

    if (response.status === 401) {
      throw new ApiError(401, detail || "Session invalide. Connecte-toi.", detail);
    }

    if (response.status === 400) {
      throw new ApiError(400, detail || "Question invalide.", detail);
    }

    if (response.status >= 500) {
      throw new ApiError(response.status, "Le service est temporairement indisponible.", detail);
    }

    throw new ApiError(response.status, detail || `Erreur ${response.status}`, detail);
  }

  return response.json();
}

// ============================================================
// AUTHENTIFICATION (NOUVEAU)
// ============================================================

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }
  return headers;
}

// ============================================================
// ENDPOINTS
// ============================================================

export async function askApollos(request: AskRequest): Promise<AskResponse> {
  const headers = await getAuthHeaders(); // <-- NOUVEAU
  
  const response = await fetch(`${API_URL}/ask`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      question: request.question,
      niveau: request.niveau ?? "18+",
      historique: request.historique ?? null,
    }),
  });

  return handleResponse<AskResponse>(response);
}

export async function fetchLivres(): Promise<LivresResponse> {
  const response = await fetch(`${API_URL}/bible/livres`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  return handleResponse<LivresResponse>(response);
}

export async function fetchChapitre(livre: string, chapitre: number): Promise<ChapitreResponse> {
  const livreEncode = encodeURIComponent(livre);
  const response = await fetch(`${API_URL}/bible/${livreEncode}/${chapitre}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  return handleResponse<ChapitreResponse>(response);
}

export async function checkHealth(): Promise<{ status: string; version: string; bible_chargee: boolean; }> {
  const response = await fetch(`${API_URL}/health`, { method: "GET" });
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

export async function askApollosStream(
  request: AskRequest,
  onEvent: (event: StreamEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  const headers = await getAuthHeaders(); // <-- NOUVEAU
  headers["Accept"] = "text/event-stream";

  const response = await fetch(`${API_URL}/ask/stream`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      question: request.question,
      niveau: request.niveau ?? "18+",
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
    throw new ApiError(response.status, detail || `Erreur ${response.status}`, detail);
  }

  if (!response.body) {
    throw new ApiError(500, "Pas de réponse du serveur");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() || "";

      for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed.startsWith("data:")) continue;
        const jsonStr = trimmed.slice(5).trim();
        if (!jsonStr) continue;

        try {
          const event = JSON.parse(jsonStr) as StreamEvent;
          onEvent(event);
        } catch (e) {
          console.warn("Événement SSE invalide:", jsonStr);
        }
      }
    }

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
