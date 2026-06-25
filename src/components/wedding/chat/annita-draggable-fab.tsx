"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { X } from "lucide-react";
import {
  ANNITA_DISMISS_ZONE,
  isOverAnnitaDismissZone,
  type AnnitaFabPosition,
} from "@/lib/annita-fab-prefs";
import { useAnnitaFabPrefs } from "@/components/wedding/hooks/use-annita-fab-prefs";

const FAB_SIZE = 75;
const DRAG_THRESHOLD = 8;

type AnnitaDraggableFabProps = {
  onOpen: () => void;
  children: ReactNode;
};

function defaultFabPosition(): AnnitaFabPosition {
  const margin = 16;
  return {
    x: window.innerWidth - margin - FAB_SIZE / 2,
    y: window.innerHeight - margin - FAB_SIZE / 2 - 68,
  };
}

export function AnnitaDraggableFab({ onOpen, children }: AnnitaDraggableFabProps) {
  const { hidden, position, setHidden, setPosition, ready } = useAnnitaFabPrefs();
  const [coords, setCoords] = useState<AnnitaFabPosition | null>(null);
  const [dragging, setDragging] = useState(false);
  const [overDismiss, setOverDismiss] = useState(false);
  const dragState = useRef({
    pointerId: -1,
    moved: false,
    offsetX: 0,
    offsetY: 0,
  });

  useEffect(() => {
    if (!ready) return;
    if (position) setCoords(position);
    else setCoords(defaultFabPosition());
  }, [ready, position]);

  const clampPosition = useCallback((x: number, y: number): AnnitaFabPosition => {
    const pad = FAB_SIZE / 2 + 8;
    return {
      x: Math.min(window.innerWidth - pad, Math.max(pad, x)),
      y: Math.min(window.innerHeight - pad, Math.max(pad, y)),
    };
  }, []);

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!coords) return;
    dragState.current = {
      pointerId: event.pointerId,
      moved: false,
      offsetX: event.clientX - coords.x,
      offsetY: event.clientY - coords.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (dragState.current.pointerId !== event.pointerId || !coords) return;

    const next = clampPosition(
      event.clientX - dragState.current.offsetX,
      event.clientY - dragState.current.offsetY,
    );

    if (!dragState.current.moved) {
      const dx = next.x - coords.x;
      const dy = next.y - coords.y;
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      dragState.current.moved = true;
      setDragging(true);
    }

    setCoords(next);
    setOverDismiss(
      isOverAnnitaDismissZone(event.clientX, event.clientY, window.innerWidth, window.innerHeight),
    );
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (dragState.current.pointerId !== event.pointerId) return;

    const wasDrag = dragState.current.moved;
    dragState.current.pointerId = -1;
    setDragging(false);

    if (!wasDrag) {
      onOpen();
      return;
    }

    if (overDismiss || isOverAnnitaDismissZone(event.clientX, event.clientY, window.innerWidth, window.innerHeight)) {
      setHidden(true);
      setOverDismiss(false);
      return;
    }

    if (coords) setPosition(coords);
    setOverDismiss(false);
  };

  const handlePointerCancel = () => {
    dragState.current.pointerId = -1;
    dragState.current.moved = false;
    setDragging(false);
    setOverDismiss(false);
    if (position) setCoords(position);
    else setCoords(defaultFabPosition());
  };

  if (!ready || hidden || !coords) return null;

  const dismissTop = `${ANNITA_DISMISS_ZONE.y * 100}%`;

  return (
    <>
      {dragging && (
        <div className="pointer-events-none fixed inset-0 z-[55]" aria-hidden>
          <div
            className="absolute flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full border-2 border-dashed transition-all duration-200"
            style={{
              top: dismissTop,
              left: "50%",
              borderColor: overDismiss ? "#f43f5e" : "rgba(236, 72, 153, 0.45)",
              backgroundColor: overDismiss ? "rgba(244, 63, 94, 0.18)" : "rgba(253, 242, 248, 0.9)",
              transform: `translate(-50%, -50%) scale(${overDismiss ? 1.08 : 1})`,
              boxShadow: overDismiss ? "0 0 24px rgba(244, 63, 94, 0.35)" : undefined,
            }}
          >
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
                overDismiss ? "bg-rose-500 text-white" : "bg-white text-rose-400"
              }`}
            >
              <X size={22} strokeWidth={2.5} />
            </span>
          </div>
          <p
            className="absolute left-1/2 -translate-x-1/2 text-center text-[10px] font-bold uppercase tracking-widest text-rose-400"
            style={{ top: `calc(${dismissTop} + 2.75rem)` }}
          >
            Drop to hide for now
          </p>
        </div>
      )}

      <button
        type="button"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        className={`fixed z-[60] touch-none select-none transition-shadow ${
          dragging ? "scale-105 cursor-grabbing shadow-2xl ring-4 ring-pink-300" : "cursor-grab active:scale-95"
        }`}
        style={{
          left: coords.x,
          top: coords.y,
          transform: "translate(-50%, -50%)",
          touchAction: "none",
        }}
        aria-label="Drag Annita or tap to open chat"
      >
        {children}
      </button>
    </>
  );
}
