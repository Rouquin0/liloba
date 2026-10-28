"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ConfirmPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const handleConfirm = async () => {
      const params = new URLSearchParams(window.location.search);
      const token_hash = params.get("token_hash");
      const type = params.get("type") as "email" | null;

      if (!token_hash || !type) {
        setStatus("error");
        return;
      }

      const { error } = await supabase.auth.verifyOtp({ type, token_hash });

      if (error) {
        setStatus("error");
      } else {
        setStatus("success");
        setTimeout(() => router.push("/"), 2000);
      }
    };

    handleConfirm();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4 text-center">
      {status === "loading" && <p>Confirmation en cours...</p>}
      {status === "success" && (
        <div>
          <p className="text-green-600 font-bold">Compte confirmé !</p>
          <p className="text-sm text-[var(--muted)]">Redirection vers LILOBA...</p>
        </div>
      )}
      {status === "error" && (
        <div>
          <p className="text-red-600 font-bold">Lien invalide ou expiré.</p>
          <p className="text-sm text-[var(--muted)]">Retourne sur LILOBA et connecte-toi.</p>
        </div>
      )}
    </div>
  );
}
