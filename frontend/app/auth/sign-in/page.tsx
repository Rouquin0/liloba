"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Fonction de traduction des erreurs adaptée pour la connexion
function traduireErreur(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login") || m.includes("invalid credentials")) {
    return "Email ou mot de passe incorrect.";
  }
  if (m.includes("email not confirmed")) {
    return "Tu dois d'abord confirmer ton adresse email. Vérifie ta boîte mail.";
  }
  if (m.includes("rate limit") || m.includes("too many")) {
    return "Trop de tentatives. Réessaie dans quelques minutes.";
  }
  if (m.includes("network") || m.includes("fetch") || m.includes("failed")) {
    return "Problème de connexion. Vérifie ton réseau et réessaie.";
  }
  return "Une erreur est survenue. Réessaie dans un instant.";
}

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");
  const [loading, setLoading] = useState(false);
  
  // Mode : mot de passe ou lien magique
  const [mode, setMode] = useState<"password" | "magic_link">("password");

  const afficher = (texte: string, type: "error" | "success") => {
    setMessage(texte);
    setMessageType(type);
  };

  // 1. Connexion classique (Mot de passe)
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Garde-fou anti-double-soumission
    if (loading) return;
    
    setMessage("");
    setMessageType("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password 
      });

      if (error) {
        afficher(traduireErreur(error.message), "error");
        return;
      }

      afficher("Connexion réussie. Redirection...", "success");
      
      // Petit délai pour que l'utilisateur voie le message de succès
      setTimeout(() => {
        router.push("/");
      }, 800);

    } catch (err) {
      afficher("Une erreur inattendue est survenue.", "error");
    } finally {
      setLoading(false);
    }
  };

  // 2. Connexion par Lien Magique (Magic Link)
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();

    // Garde-fou anti-double-soumission
    if (loading) return;

    setMessage("");
    setMessageType("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({ 
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        }
      });

      if (error) {
        afficher(traduireErreur(error.message), "error");
        return;
      }

      afficher("Lien magique envoyé. Vérifie ta boîte mail.", "success");
    } catch (err) {
      afficher("Une erreur inattendue est survenue.", "error");
    } finally {
      setLoading(false);
    }
  };

  const changerMode = (nouveauMode: "password" | "magic_link") => {
    setMode(nouveauMode);
    setMessage("");
    setMessageType("");
  };

  return (
    // Conteneur global pour coller l'en-tête en haut
    <div className="flex min-h-full flex-col bg-[var(--background)]">
      
      {/* EN-TÊTE : Hamburger à gauche + Titre */}
      <header className="flex items-center gap-3 px-4 py-4 md:px-6">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("liloba:open-menu"))}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
          aria-label="Ouvrir le menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-[var(--foreground)]">Connexion</h1>
      </header>

      {/* FORMULAIRE CENTRÉ */}
      <div className="mx-auto w-full max-w-md flex-1 p-6 pt-2">
        
        {/* Boutons pour choisir la méthode */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => changerMode("password")}
            disabled={loading}
            className={`flex-1 p-2 rounded-lg border transition-colors ${
              mode === "password" 
                ? "bg-gray-100 font-bold border-gray-400" 
                : "bg-white border-gray-300 hover:bg-gray-50"
            } disabled:opacity-50`}
          >
            Mot de passe
          </button>
          <button
            type="button"
            onClick={() => changerMode("magic_link")}
            disabled={loading}
            className={`flex-1 p-2 rounded-lg border transition-colors ${
              mode === "magic_link" 
                ? "bg-gray-100 font-bold border-gray-400" 
                : "bg-white border-gray-300 hover:bg-gray-50"
            } disabled:opacity-50`}
          >
            Lien magique
          </button>
        </div>

        {mode === "password" ? (
          // Formulaire classique
          <form onSubmit={handleSignIn} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Ton email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
              className="p-3 rounded-lg border border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
              className="p-3 rounded-lg border border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="p-3 rounded-lg bg-black text-white disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        ) : (
          // Formulaire Lien Magique
          <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
            <p className="text-sm text-gray-500 mb-1">
              Pas de mot de passe. On t'envoie un lien sécurisé par email.
            </p>
            <input
              type="email"
              placeholder="Ton email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
              className="p-3 rounded-lg border border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="p-3 rounded-lg bg-black text-white disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Envoi..." : "Recevoir mon lien magique"}
            </button>
          </form>
        )}

        {message && (
          <p className={`mt-5 text-sm ${messageType === "error" ? "text-red-600" : "text-blue-600"}`}>
            {message}
          </p>
        )}
        
        <p className="mt-5 text-sm">
          Pas de compte ?{" "}
          <Link href="/auth/sign-up" className="underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
