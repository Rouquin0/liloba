"use client";

import type { AvatarId } from "@/lib/profile-storage";

// ============================================================
// LILOBA — Avatars de profil (SVG « stroke », style épuré, sans emoji)
// ------------------------------------------------------------
// colombe · agneau · lion · poisson (ichthus) · olivier · étoile ·
// couronne · ancre. Colombe, poisson, olivier, étoile, couronne et ancre :
// tracés issus de Lucide (licence ISC). Agneau et lion : dessinés pour LILOBA.
// ============================================================

const PATHS: Record<AvatarId, string> = {
  dove: "<path d=\"M16 7h.01\"/><path d=\"M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20\"/><path d=\"m20 7 2 .5-2 .5\"/><path d=\"M10 18v3\"/><path d=\"M14 17.75V21\"/><path d=\"M7 18a6 6 0 0 0 3.84-10.61\"/>",
  lamb: "<path d=\"M15 5.4a3.6 3.6 0 0 0-6.4.9A4 4 0 0 0 6 14.2a3.6 3.6 0 0 0 4.2 2.6H15a3.8 3.8 0 0 0 0-7.6 3.6 3.6 0 0 0 0-3.8Z\" transform=\"translate(-1.2 0.3)\"/><path d=\"M16.6 13.3c1.4-1.6 4.3-1.1 4.5 1.2.2 2.2-1.2 3.7-3 3.7-1.6 0-2.7-1.2-2.7-2.7\"/><path d=\"M17.2 11.6l-.9-1.5M19.6 12.4l.7-1.5\"/><path d=\"M6.3 17.2V21M11.2 17.4V21\"/><circle cx=\"18.9\" cy=\"14.8\" r=\".5\" fill=\"currentColor\"/>",
  lion: "<path d=\"M12.00 3.70A2.35 2.35 0 0 1 16.15 4.81A2.35 2.35 0 0 1 19.19 7.85A2.35 2.35 0 0 1 20.30 12.00A2.35 2.35 0 0 1 19.19 16.15A2.35 2.35 0 0 1 16.15 19.19A2.35 2.35 0 0 1 12.00 20.30A2.35 2.35 0 0 1 7.85 19.19A2.35 2.35 0 0 1 4.81 16.15A2.35 2.35 0 0 1 3.70 12.00A2.35 2.35 0 0 1 4.81 7.85A2.35 2.35 0 0 1 7.85 4.81A2.35 2.35 0 0 1 12.00 3.70Z\"/><circle cx=\"12\" cy=\"12\" r=\"4.6\"/><path d=\"M10 11.2h.01M14 11.2h.01\"/><path d=\"M11 14.2l1 .8 1-.8\"/>",
  fish: "<path d=\"M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z\"/><path d=\"M18 12v.5\"/><path d=\"M16 17.93a9.77 9.77 0 0 1 0-11.86\"/><path d=\"M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33\"/><path d=\"M10.46 7.26C10.2 5.88 9.17 4.24 8 3h5.8a2 2 0 0 1 1.98 1.67l.23 1.4\"/><path d=\"m16.01 17.93-.23 1.4A2 2 0 0 1 13.8 21H9.5a5.96 5.96 0 0 0 1.49-3.98\"/>",
  leaf: "<path d=\"M11 20a10 10 0 0010-10 25.9 25.9 0 00-1.04-7.281 1 1 0 00-1.755-.325C15.833 5.5 13 5.5 9.8 6.1A7 7 0 0011 20\"/><path d=\"M2 21a5 5 0 012.911-4.544C7.613 15.212 8.351 15.24 11 13\"/>",
  star: "<path d=\"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z\"/>",
  crown: "<path d=\"M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z\"/><path d=\"M5 21h14\"/>",
  anchor: "<path d=\"M12 6v16\"/><path d=\"m19 13 2-1a9 9 0 0 1-18 0l2 1\"/><path d=\"M9 11h6\"/><circle cx=\"12\" cy=\"4\" r=\"2\"/>",
};

export default function ProfileAvatar({
  avatar,
  color,
  size = 32,
  className = "",
}: {
  avatar: AvatarId;
  color: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        color,
        background: `color-mix(in srgb, ${color} 16%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 45%, transparent)`,
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        width={Math.round(size * 0.58)}
        height={Math.round(size * 0.58)}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
        dangerouslySetInnerHTML={{ __html: PATHS[avatar] ?? PATHS.dove }}
      />
    </span>
  );
}
