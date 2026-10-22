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
    <div className="max-w-md mx-auto mt-12 p-6">
      <h1 className="text-2xl font-bold mb-6">Connexion</h1>
      
      {/* Boutons pour choisir la méthode (Tailwind) */}
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
  );
}
