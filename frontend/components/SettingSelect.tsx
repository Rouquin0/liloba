"use client";

import { useState } from "react";

interface SettingSelectOption<T extends string> {
  value: T;
  label: string;
  description?: string;
  flag?: string;
}

interface SettingSelectProps<T extends string> {
  icon: React.ReactNode;
  title: string;
  description?: string;
  value: T;
  options: SettingSelectOption<T>[];
  onChange: (value: T) => void;
}

export default function SettingSelect<T extends string>({
  icon,
  title,
  description,
  value,
  options,
  onChange,
}: SettingSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  const currentOption = options.find((o) => o.value === value);

  return (
    <>
      {/* Ligne cliquable */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center gap-3 border-b border-[var(--border)] py-4 text-left transition-colors hover:bg-[var(--surface-hover)]"
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{ background: "var(--surface-hover)" }}
        >
          {icon}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-sm font-medium text-[var(--foreground)]">
            {title}
          </span>
          {description && (
            <span className="truncate text-xs text-[var(--muted)]">
              {description}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {currentOption?.flag && (
            <span
              className="rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{
                background: "color-mix(in srgb, var(--color-accent) 15%, transparent)",
                color: "var(--color-accent)",
              }}
            >
              {currentOption.flag}
            </span>
          )}
          <span className="max-w-[120px] truncate text-xs font-medium text-[var(--color-accent)]">
            {currentOption?.label ?? "—"}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 shrink-0 text-[var(--muted)]"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>
      </button>

      {/* Modale */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm md:items-center"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="animate-fade-in max-h-[80vh] w-full overflow-hidden rounded-t-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl md:max-w-md md:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header modale */}
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <h3 className="text-sm font-semibold text-[var(--foreground)]">
                {title}
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
                aria-label="Fermer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            {/* Liste des options */}
            <div className="max-h-[60vh] overflow-y-auto py-1">
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 px-5 py-3 text-left transition-colors ${
                      isSelected
                        ? "bg-[color-mix(in_srgb,var(--color-accent)_8%,transparent)]"
                        : "hover:bg-[var(--surface-hover)]"
                    }`}
                  >
                    {option.flag && (
                      <span
                        className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          background: isSelected
                            ? "color-mix(in srgb, var(--color-accent) 15%, transparent)"
                            : "var(--surface-hover)",
                          color: isSelected ? "var(--color-accent)" : "var(--muted)",
                        }}
                      >
                        {option.flag}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm font-medium ${
                          isSelected
                            ? "text-[var(--color-accent)]"
                            : "text-[var(--foreground)]"
                        }`}
                      >
                        {option.label}
                      </div>
                      {option.description && (
                        <div className="truncate text-xs text-[var(--muted)]">
                          {option.description}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] text-white"
                        style={{ background: "var(--color-accent)" }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-3 w-3"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
