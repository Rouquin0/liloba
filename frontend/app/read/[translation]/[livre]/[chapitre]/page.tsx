"use client";

import { use } from "react";
import { notFound, useRouter } from "next/navigation";
import BibleReader from "@/components/BibleReader";
import { TRANSLATIONS, type TranslationId } from "@/lib/translations";

interface PageProps {
  params: Promise<{
    translation: string;
    livre: string;
    chapitre: string;
  }>;
}

export default function ReadTranslationPage({ params }: PageProps) {
  const { translation, livre, chapitre: chapitreStr } = use(params);
  const router = useRouter();

  const validTranslation = TRANSLATIONS.find((t) => t.id === translation);
  if (!validTranslation) {
    notFound();
  }

  const chapitre = parseInt(chapitreStr, 10);
  if (isNaN(chapitre) || chapitre < 1) {
    notFound();
  }

  return (
    <BibleReader
      livre={livre}
      chapitre={chapitre}
      translationId={translation as TranslationId}
      onNavigate={(newLivre, newChap) => {
        router.push(`/read/${translation}/${newLivre}/${newChap}`);
      }}
      onBackToList={() => {
        router.push(`/bible/${livre}`);
      }}
      showHeader={true}
      showMenuButton={false}
      compact={false}
    />
  );
}
