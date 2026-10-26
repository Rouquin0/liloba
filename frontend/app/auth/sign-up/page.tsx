"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

function traduireErreur(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login") || m.includes("invalid credentials")) {
    return "Un compte existe peut-être déjà avec cet email, ou le mot de passe est incorrect. Essaie de te connecter.";
  }
  if (m.includes("already registered") || m.includes("already exists") || m.includes("user already")) {
    return "Un compte existe déjà avec cet email. Essaie de te connecter.";
  }
  if (m.includes("password") && (m.includes("short") || m.includes("6 characters") || m.includes("least"))) {
    return "Le mot de passe doit contenir au moins 6 caractères.";
  }
  if (m.includes("invalid") && m.includes("email")) {
    return "Cette adresse email n'est pas valide.";
  }
  if (m.includes("rate limit") || m.includes("too many")) {
    return "Trop de tentatives. Réessaie dans quelques minutes.";
  }
  if (m.includes("network") || m.includes("fetch") || m.includes("failed")) {
    return "Problème de connexion. Vérifie ton réseau et réessaie.";
  }
  return "Une erreur est survenue. Réessaie dans un instant.";
}

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");
  const [loading, setLoading] = useState(false);

  const afficher = (texte: string, type: "error" | "success") => {
    setMessage(texte);
    setMessageType(type);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setMessage("");
    setMessageType("");

    if (password.length < 6) {
      afficher("Le mot de passe doit contenir au moins 6 caractères.", "error");
      return;
    }
    if (password !== confirmPassword) {
      afficher("Les deux mots de passe ne correspondent pas.", "error");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/sign-in`,
        },
      });

      if (error) {
        afficher(traduireErreur(error.message), "error");
        return;
      }

      if (data.user && !data.user.identities?.length) {
        afficher("Un compte existe déjà avec cet email. Essaie de te connecter.", "error");
        return;
      }

      if (!data.session) {
        afficher("Compte créé. Vérifie ta boîte mail pour confirmer ton adresse.", "success");
        return;
      }

      afficher("Compte créé et connecté. Redirection...", "success");
      router.push("/");
    } catch (err) {
      afficher("Une erreur inattendue est survenue. Réessaie.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col bg-[var(--background)]">
      
      {/* EN-TÊTE : Bouton Retour (caché sur PC) */}
      <header className="flex items-center gap-3 px-4 py-4 md:px-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] md:hidden"
          aria-label="Retour"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-[var(--foreground)]">Créer un compte</h1>
      </header>

      <div className="mx-auto w-full max-w-md flex-1 p-6 pt-2">
        <form onSubmit={handleSignUp} className="flex flex-col gap-3">
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
          
          {/* MOT DE PASSE */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe (6 caractères min)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
              autoComplete="new-password"
              className="w-full p-3 pr-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] disabled:bg-[var(--surface-hover)] disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
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

          {/* CONFIRMATION MOT DE PASSE */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirme le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
              autoComplete="new-password"
              className="w-full p-3 pr-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] disabled:bg-[var(--surface-hover)] disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              {showConfirmPassword ? (
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
            aria-busy={loading}
            className="p-3 mt-2 rounded-lg bg-black text-white disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors dark:bg-white dark:text-black font-semibold"
          >
            {loading ? "Création..." : "S'inscrire"}
          </button>
        </form>

        {message && (
          <p className={`mt-5 text-sm ${messageType === "error" ? "text-red-600" : "text-blue-600"}`}>
            {message}
          </p>
        )}

        {/* METTRE SE CONNECTER EN AVANT */}
        <div className="mt-8 border-t border-[var(--border)] pt-6">
          <p className="text-center text-sm text-[var(--muted)] mb-3">
            Déjà un compte sur LILOBA ?
          </p>
          <Link 
            href="/auth/sign-in" 
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-[var(--color-accent)] px-4 py-3 text-sm font-bold text-[var(--color-accent)] transition-all hover:bg-[var(--color-accent)]/10"
          >
            Se connecter
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
            </svg>
          </Link>
        </div>

      </div>
    </div>
  );
}
