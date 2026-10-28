"use client";

import type { ReactNode } from "react";

// ============================================================
// LILOBA — Anneau de progression circulaire (SVG)
// ============================================================

export default function ProgressRing({
  percent,
  size = 160,
  stroke = 12,
  className = "",
  children,
}: {
  /** 0..100 */
  percent: number;
  size?: number;
  stroke?: number;
  className?: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.min(100, Math.max(0, percent));
  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={Math.round(p)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - p / 100)}
          style={{ transition: "stroke-dashoffset 600ms ease" }}
        />
      </svg>
      {children !== undefined && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
      )}
    </div>
  );
}
