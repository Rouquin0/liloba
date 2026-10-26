"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  if (m.includes("signups not allowed")) {
    return "Aucun compte trouvé avec cet email. Veuillez d'abord créer un compte.";
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
  const [showPassword, setShowPassword] = useState(false); // <-- Nouvel état
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"password" | "magic_link">("password");

  const afficher = (texte: string, type: "error" | "success") => {
    setMessage(texte);
    setMessageType(type);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setTimeout(() => router.push("/"), 800);
    } catch (err) {
      afficher("Une erreur inattendue est survenue.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setMessage("");
    setMessageType("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({ 
        email: email.trim(),
        options: { 
          emailRedirectTo: `${window.location.origin}/`,
          shouldCreateUser: false // <-- Empêche la création auto de compte
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
    <div className="flex min-h-full flex-col bg-[var(--background)]">
      
      {/* EN-TÊTE */}
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

      <div className="mx-auto w-full max-w-md flex-1 p-6 pt-2">
        
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => changerMode("password")}
            disabled={loading}
            className={`flex-1 p-2 rounded-lg border transition-colors ${
              mode === "password" 
                ? "bg-[var(--surface-hover)] font-bold border-[var(--border)]" 
                : "bg-transparent border-[var(--border)] hover:bg-[var(--surface-hover)]"
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
                ? "bg-[var(--surface-hover)] font-bold border-[var(--border)]" 
                : "bg-transparent border-[var(--border)] hover:bg-[var(--surface-hover)]"
            } disabled:opacity-50`}
          >
            Lien magique
          </button>
        </div>

        {mode === "password" ? (
          <form onSubmit={handleSignIn} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Ton email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
              className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] disabled:bg-[var(--surface-hover)] disabled:cursor-not-allowed"
            />
            
            {/* CHAMP MOT DE PASSE AVEC BOUTON OEIL */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
                className="w-full p-3 pr-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] disabled:bg-[var(--surface-hover)] disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="p-3 mt-2 rounded-lg bg-black text-white disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors dark:bg-white dark:text-black"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
            <p className="text-sm text-[var(--muted)] mb-1">
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
              className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] disabled:bg-[var(--surface-hover)] disabled:cursor-not-allowed"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="p-3 mt-2 rounded-lg bg-black text-white disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors dark:bg-white dark:text-black"
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
        
        <p className="mt-5 text-center text-sm">
          Pas de compte ?{" "}
          <Link href="/auth/sign-up" className="underline font-medium">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
