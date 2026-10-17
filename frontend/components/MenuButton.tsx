"use client";

interface MenuButtonProps {
  onClick: () => void;
  className?: string;
}

export default function MenuButton({
  onClick,
  className = "",
}: MenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-sm transition-all hover:scale-105 hover:border-[var(--color-accent)]/50 hover:bg-[var(--surface-hover)] active:scale-95 ${className}`}
      aria-label="Ouvrir le menu"
    >
      <div className="flex flex-col items-center justify-center gap-[5px]">
        {/* Trait 1 */}
        <span
          className="h-[2px] w-5 rounded-full transition-all duration-300 group-hover:w-4 group-hover:translate-x-[2px]"
          style={{ background: "var(--color-accent)" }}
        />
        {/* Trait 2 */}
        <span
          className="h-[2px] w-5 rounded-full transition-all duration-300 group-hover:w-6"
          style={{ background: "var(--color-accent)" }}
        />
        {/* Trait 3 */}
        <span
          className="h-[2px] w-5 rounded-full transition-all duration-300 group-hover:w-4 group-hover:translate-x-[2px]"
          style={{ background: "var(--color-accent)" }}
        />
      </div>
    </button>
  );
}
