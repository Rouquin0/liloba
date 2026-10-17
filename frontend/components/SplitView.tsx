"use client";

import {
  useSyncExternalStore,
  useState,
  useEffect,
  useRef,
} from "react";
import PanePanel from "./PanePanel";
import {
  getSplitState,
  subscribeSplit,
  swapPanes,
  setPaneTab,
  setRatio,
  disableSplit,
  DEFAULT_SPLIT,
  MIN_RATIO,
  MAX_RATIO,
} from "@/lib/split-view";

interface SplitViewProps {
  children: React.ReactNode;
}

export default function SplitView({ children }: SplitViewProps) {
  // useSyncExternalStore : lit directement dans le localStorage à chaque
  // notification. Pas de state dupliqué, pas de race condition.
  const state = useSyncExternalStore(
    subscribeSplit,
    getSplitState,
    () => DEFAULT_SPLIT
  );

  const [isDesktop, setIsDesktop] = useState(false);
  const [dragRatio, setDragRatio] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Détection desktop
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Rendu normal si split désactivé ou pas desktop
  if (!state.enabled || !isDesktop) {
    return <>{children}</>;
  }

  const ratio = dragRatio ?? state.ratio;

  // Drag de la poignée : on n'écrit dans le localStorage QU'au mouseup.
  // Pendant le drag, on utilise dragRatio local (fluide, pas de write).
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();

    let last = state.ratio;

    const move = (ev: MouseEvent) => {
      last = Math.min(
        MAX_RATIO,
        Math.max(MIN_RATIO, ((ev.clientX - rect.left) / rect.width) * 100)
      );
      setDragRatio(last);
    };

    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      setDragRatio(null);
      setRatio(last);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const leftPercent = `${ratio}%`;
  const rightPercent = `${100 - ratio}%`;

  return (
    <div
      ref={containerRef}
      className="flex h-full"
      style={{ cursor: dragRatio !== null ? "col-resize" : undefined }}
    >
      <div className="min-w-0" style={{ width: leftPercent }}>
        <PanePanel
          side="left"
          currentTab={state.left.tab}
          onChangeTab={(tab) => setPaneTab("left", tab)}
          onSwap={swapPanes}
        />
      </div>

      {/* Poignée de drag */}
      <div
        onMouseDown={handleMouseDown}
        onDoubleClick={() => setRatio(50)}
        className={`group relative flex w-1 shrink-0 cursor-col-resize items-center justify-center bg-[var(--border)] transition-colors hover:bg-[var(--color-accent)] ${
          dragRatio !== null ? "bg-[var(--color-accent)]" : ""
        }`}
        title="Glisse pour redimensionner · Double-clic pour 50/50"
        aria-label="Redimensionner les panneaux"
      >
        <div className="pointer-events-none flex flex-col items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="h-0.5 w-0.5 rounded-full bg-white" />
          <span className="h-0.5 w-0.5 rounded-full bg-white" />
          <span className="h-0.5 w-0.5 rounded-full bg-white" />
        </div>
      </div>

      <div className="min-w-0" style={{ width: rightPercent }}>
        <PanePanel
          side="right"
          currentTab={state.right.tab}
          onChangeTab={(tab) => setPaneTab("right", tab)}
          onClose={disableSplit}
          onSwap={swapPanes}
        />
      </div>
    </div>
  );
}
