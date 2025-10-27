import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  minuteStep?: number;
  placeholder?: string;
  className?: string;
};

function pad(n: number) { return String(n).padStart(2, "0"); }

export default function TimePicker({ value, onChange, minuteStep = 5, placeholder = "--:--", className }: Props) {
  const [open, setOpen] = useState(false);
  const [tempH, setTempH] = useState<string>("");
  const [tempM, setTempM] = useState<string>("");
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const [h, m] = useMemo(() => {
    if (!value) return ["", ""];
    const [hh, mm] = value.split(":");
    return [hh ?? "", mm ?? ""];
  }, [value]);

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => pad(i)), []);
  const step = Math.max(1, Math.min(30, minuteStep));
  const minutes = useMemo(
    () => Array.from({ length: Math.floor(60 / step) }, (_, i) => pad(i * step)),
    [step]
  );

  function openPanel() {
    setTempH(h || "00");
    setTempM(m || "00");
    setOpen((o) => !o);
  }

  function confirm() {
    onChange(`${tempH || "00"}:${tempM || "00"}`);
    setOpen(false);
  }

  function cancel() { setOpen(false); }

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const ITEM_H = 36;
  const VISIBLE = 5;
  const PAD = Math.floor(VISIBLE / 2);

  function useWheel(values: string[], selected: string, onSelected: (v: string) => void) {
    const ref = useRef<HTMLDivElement | null>(null);
    const timer = useRef<number | null>(null);

    useEffect(() => {
      if (!open) return;
      const idx = Math.max(0, values.indexOf(selected));
      if (ref.current) ref.current.scrollTop = (idx + PAD) * ITEM_H;
    }, [open]);

    function onScroll() {
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        if (!ref.current) return;
        const pos = ref.current.scrollTop;
        const nearest = Math.round(pos / ITEM_H) - PAD;
        const clamped = Math.max(0, Math.min(values.length - 1, nearest));
        ref.current.scrollTo({ top: (clamped + PAD) * ITEM_H, behavior: "smooth" });
      }, 80);
    }

    function onClick(v: string) {
      onSelected(v);
    }

    return { ref, onScroll, onClick };
  }

  const wheelH = useWheel(hours, tempH || "00", setTempH);
  const wheelM = useWheel(minutes, tempM || "00", setTempM);

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        className={`w-full rounded-md border border-gray-600 bg-[#0b1220] text-white px-3 py-2 outline-none text-left flex items-center justify-between ${className ?? ""}`}
        onClick={openPanel}
      >
        <span className={value ? "text-white" : "text-gray-400"}>{value || placeholder}</span>
        <span className="opacity-70">🕘</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-[18rem] rounded-xl border border-white/10 bg-[#0b1220] p-4 shadow-lg">
          <div className="mb-3 text-center text-2xl font-semibold tabular-nums">
            {tempH || "--"}<span className="opacity-60">:</span>{tempM || "--"}
          </div>

          <div className="relative grid grid-cols-2 gap-4">
            <div className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2">
              <div className="mx-6 h-[36px] rounded-md bg-white/10 ring-1 ring-white/20" />
            </div>

            <div
              ref={wheelH.ref}
              onScroll={wheelH.onScroll}
              className="h-[180px] overflow-y-auto snap-y snap-mandatory rounded-lg border border-white/10"
              style={{ scrollbarWidth: "none" }}
            >
              <div style={{ height: PAD * ITEM_H }} />
              {hours.map((hh) => (
                <div
                  key={hh}
                  className={`h-9 flex items-center justify-center snap-center tabular-nums cursor-pointer select-none ${
                    hh === tempH ? "text-white" : "text-white/80"
                  }`}
                  onMouseDown={(e) => { e.preventDefault(); wheelH.onClick(hh); }}
                >
                  {hh}
                </div>
              ))}
              <div style={{ height: PAD * ITEM_H }} />
            </div>

            <div
              ref={wheelM.ref}
              onScroll={wheelM.onScroll}
              className="h-[180px] overflow-y-auto snap-y snap-mandatory rounded-lg border border-white/10"
              style={{ scrollbarWidth: "none" }}
            >
              <div style={{ height: PAD * ITEM_H }} />
              {minutes.map((mm) => (
                <div
                  key={mm}
                  className={`h-9 flex items-center justify-center snap-center tabular-nums cursor-pointer select-none ${
                    mm === tempM ? "text-white" : "text-white/80"
                  }`}
                  onMouseDown={(e) => { e.preventDefault(); wheelM.onClick(mm); }}
                >
                  {mm}
                </div>
              ))}
              <div style={{ height: PAD * ITEM_H }} />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2 text-sm">
            <button
              type="button"
              className="rounded-md border border-white/20 px-3 py-1 hover:border-white/40"
              onMouseDown={(e) => { e.preventDefault(); cancel(); }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-md border border-white/20 px-3 py-1 hover:border-white/40 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!tempH || !tempM}
              onMouseDown={(e) => { e.preventDefault(); confirm(); }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
