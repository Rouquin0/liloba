"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  href?: string;
  className?: string;
}

export default function BackButton({ href, className = "" }: BackButtonProps) {
  const router = useRouter();

  const content = (
    <div className="relative flex h-5 w-5 items-center justify-center overflow-hidden">
      {/* Flèche (slide vers la gauche au hover) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1"
      >
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
      </svg>
    </div>
  );

  const classNameFull = `group flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)]/80 text-[var(--muted)] backdrop-blur-sm transition-all hover:border-[var(--color-accent)]/50 hover:bg-[var(--surface-hover)] hover:text-[var(--color-accent)] active:scale-95 ${className}`;

  if (href) {
    return (
      <Link href={href} className={classNameFull} aria-label="Retour">
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={classNameFull}
      aria-label="Retour"
    >
      {content}
    </button>
  );
}
