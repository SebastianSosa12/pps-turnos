import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
};

function fmt(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function parse(v: string) {
  if (!v) return null;
  const [y, m, d] = v.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export default function DatePicker({ value, onChange, placeholder = "yyyy-mm-dd", className }: Props) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => parse(value), [value]);
  const [cursor, setCursor] = useState<Date>(() => selected ?? new Date());
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const start = new Date(firstOfMonth);
  const mondayIndex = (firstOfMonth.getDay() + 6) % 7;
  start.setDate(firstOfMonth.getDate() - mondayIndex);

  const days = useMemo(() => {
    const arr: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, [year, month]);

  const todayKey = fmt(new Date());
  const selKey = selected ? fmt(selected) : "";

  function pick(d: Date) {
    onChange(fmt(d));
    setOpen(false);
  }

  function prevMonth() {
    const d = new Date(cursor);
    d.setMonth(d.getMonth() - 1);
    setCursor(d);
  }

  function nextMonth() {
    const d = new Date(cursor);
    d.setMonth(d.getMonth() + 1);
    setCursor(d);
  }

  const months = useMemo(
    () => Array.from({ length: 12 }, (_, i) => new Date(2000, i, 1).toLocaleString(undefined, { month: "long" })),
    []
  );

  const years = useMemo(() => {
    const max = new Date().getFullYear();
    const min = 1900;
    const list: number[] = [];
    for (let y = max; y >= min; y--) list.push(y);
    return list;
  }, []);

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        className={`w-full rounded-md border border-gray-600 bg-[#0b1220] text-white px-3 py-2 outline-none text-left flex items-center justify-between ${className ?? ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={value ? "text-white" : "text-gray-400"}>{value || placeholder}</span>
        <span className="opacity-70">📅</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-80 rounded-xl border border-white/10 bg-[#0b1220] p-3 shadow-lg">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              className="h-8 w-8 rounded-md border border-white/20 hover:border-white/40"
              onMouseDown={(e) => {
                e.preventDefault();
                prevMonth();
              }}
            >
              ‹
            </button>

            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  className="ht-dark-select appearance-none bg-[#0b1220] text-white border border-white/20 rounded-md px-2 pr-7 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-white/40"
                  value={month}
                  onChange={(e) => {
                    const m = Number(e.target.value);
                    const d = new Date(cursor);
                    d.setMonth(m, 1);
                    setCursor(d);
                  }}
                >
                  {months.map((m, i) => (
                    <option key={i} value={i}>
                      {m}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-2 top-1.5 text-white/70">▾</span>
              </div>

              <div className="relative">
                <select
                  className="ht-dark-select appearance-none bg-[#0b1220] text-white border border-white/20 rounded-md px-2 pr-7 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-white/40"
                  value={year}
                  onChange={(e) => {
                    const y = Number(e.target.value);
                    const d = new Date(cursor);
                    d.setFullYear(y, d.getMonth(), 1);
                    setCursor(d);
                  }}
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-2 top-1.5 text-white/70">▾</span>
              </div>
            </div>

            <button
              type="button"
              className="h-8 w-8 rounded-md border border-white/20 hover:border-white/40"
              onMouseDown={(e) => {
                e.preventDefault();
                nextMonth();
              }}
            >
              ›
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] text-white/70">
            <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {days.map((d) => {
              const key = fmt(d);
              const inMonth = d.getMonth() === month;
              const isToday = key === todayKey;
              const isSel = key === selKey;
              return (
                <button
                  type="button"
                  key={key}
                  className={[
                    "h-9 w-9 md:h-10 md:w-10 flex items-center justify-center rounded-md text-sm",
                    inMonth ? "text-white" : "text-white/40",
                    isSel ? "bg-white/15 ring-1 ring-white/30" : "hover:bg-white/10",
                    isToday && !isSel ? "border border-white/20" : "",
                  ].join(" ")}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pick(d);
                  }}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between text-sm text-white/80">
            <button
              type="button"
              className="rounded-md border border-white/20 px-3 py-1 hover:border-white/40"
              onMouseDown={(e) => {
                e.preventDefault();
                const t = new Date();
                setCursor(new Date(t.getFullYear(), t.getMonth(), 1));
                onChange(fmt(t));
                setOpen(false);
              }}
            >
              Today
            </button>
            <button
              type="button"
              className="rounded-md border border-white/20 px-3 py-1 hover:border-white/40"
              onMouseDown={(e) => {
                e.preventDefault();
                setOpen(false);
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      <style>{`
        .ht-dark-select, .ht-dark-select option { background-color: #0b1220; color: #ffffff; }
        .ht-dark-select:focus { outline: none; }
      `}</style>
    </div>
  );
}
