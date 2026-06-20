// ===================================================================
// Floating, draggable, collapsible wrapper for the monitoring panel.
// - drag by the top handle (mouse + touch via pointer events)
// - minimize to a small pill; click the pill to expand again
// New, self-contained; wraps WebMonitoringPanel without changing it.
// ===================================================================
import { useRef, useState } from "react";
import { GripHorizontal, Minus, Camera } from "lucide-react";
import WebMonitoringPanel from "./WebMonitoringPanel";

export default function FloatingMonitor() {
  const [collapsed, setCollapsed] = useState(false);
  const [pos, setPos] = useState(() => ({
    x: 16,
    y: typeof window !== "undefined" ? Math.max(16, window.innerHeight - 330) : 80,
  }));
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const moved = useRef(false);

  function onPointerDown(e: React.PointerEvent) {
    drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    moved.current = false;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current) return;
    moved.current = true;
    const x = Math.max(0, Math.min(window.innerWidth - 60, e.clientX - drag.current.dx));
    const y = Math.max(0, Math.min(window.innerHeight - 40, e.clientY - drag.current.dy));
    setPos({ x, y });
  }
  function onPointerUp(e: React.PointerEvent) {
    drag.current = null;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  }

  if (collapsed) {
    return (
      <button
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={() => { if (!moved.current) setCollapsed(false); }}
        style={{ position: "fixed", left: pos.x, top: pos.y, zIndex: 50 }}
        className="flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-lg hover:bg-indigo-700 cursor-move"
        title="Open AI monitoring (drag to move)"
      >
        <Camera className="h-3.5 w-3.5" /> AI Monitor
      </button>
    );
  }

  return (
    <div
      style={{ position: "fixed", left: pos.x, top: pos.y, zIndex: 50, width: 256 }}
      className="max-w-[88vw] shadow-2xl rounded-2xl"
    >
      {/* drag handle */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="flex items-center justify-between rounded-t-2xl bg-indigo-600 px-2.5 py-1 cursor-move select-none"
      >
        <span className="flex items-center gap-1 text-[10px] font-medium text-white">
          <GripHorizontal className="h-3.5 w-3.5" /> Drag to move
        </span>
        <button
          onClick={() => setCollapsed(true)}
          className="rounded p-0.5 text-white/90 hover:bg-white/20 hover:text-white"
          title="Minimize"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
      </div>
      {/* panel (top corners flattened to join the handle) */}
      <div className="[&>div]:rounded-t-none">
        <WebMonitoringPanel />
      </div>
    </div>
  );
}
