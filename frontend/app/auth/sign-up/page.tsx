"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

function traduireErreur(message: string): string {
  const m = message.toLowerCase();
  
  // Gestion du cas "grant_type=password" (mauvais mot de passe ou email existant)
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
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");
  const [loading, setLoading] = useState(false);

  const afficher = (texte: string, type: "error" | "success") => {
    setMessage(texte);
    setMessageType(type);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Garde-fou anti-double-soumission
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

      if (process.env.NODE_ENV === "development") {
        console.log("DEBUG SIGNUP", JSON.stringify({ data, error }, null, 2));
      }

      if (error) {
        afficher(traduireErreur(error.message), "error");
        return;
      }

      // Cas 1 : email deja utilise (user sans identite)
      if (data.user && !data.user.identities?.length) {
        afficher("Un compte existe déjà avec cet email. Essaie de te connecter.", "error");
        return;
      }

      // Cas 2 : confirmation email activee -> pas de session
      if (!data.session) {
        afficher("Compte créé. Vérifie ta boîte mail pour confirmer ton adresse.", "success");
        return;
      }

      // Cas 3 : confirmation desactivee -> deja connecte
      afficher("Compte créé et connecté. Redirection...", "success");
      router.push("/");
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("DEBUG SIGNUP EXCEPTION", err);
      }
      afficher("Une erreur inattendue est survenue. Réessaie.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6">
      <h1 className="text-2xl font-bold mb-6">Créer un compte</h1>

      <form onSubmit={handleSignUp} className="flex flex-col gap-3">
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
          placeholder="Mot de passe (6 caractères min)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          minLength={6}
          autoComplete="new-password"
          className="p-3 rounded-lg border border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <input
          type="password"
          placeholder="Confirme le mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading}
          minLength={6}
          autoComplete="new-password"
          className="p-3 rounded-lg border border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className="p-3 rounded-lg bg-black text-white disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-70 transition-colors"
        >
          {loading ? "Création..." : "S'inscrire"}
        </button>
      </form>

      {message && (
        <p className={`mt-5 text-sm ${messageType === "error" ? "text-red-600" : "text-blue-600"}`}>
          {message}
        </p>
      )}

      <p className="mt-5 text-sm">
        Déjà un compte ?{" "}
        <Link href="/auth/sign-in" className="underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
