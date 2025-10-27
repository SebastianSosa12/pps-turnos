import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";

export type AutoOption = { id: string; fullName: string };

type Props = {
  label: string;
  placeholder?: string;
  fetcher: (q: string) => Promise<AutoOption[]>;
  onSelect: (opt: AutoOption) => void;
  initialText?: string;
  className?: string;
};

export type AutocompleteHandle = { reset: () => void };

const AutocompleteSelect = forwardRef<AutocompleteHandle, Props>(function AutocompleteSelect(
  { label, placeholder, fetcher, onSelect, initialText, className }: Props,
  ref
) {
  const [text, setText] = useState(initialText ?? "");
  const [options, setOptions] = useState<AutoOption[]>([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<number | null>(null);
  const suppressNextFetch = useRef(false);
  const focusedRef = useRef(false);

  useImperativeHandle(ref, () => ({
    reset() {
      setText("");
      setOptions([]);
      setOpen(false);
      setHighlight(0);
    },
  }));

  useEffect(() => {
    if (suppressNextFetch.current) {
      suppressNextFetch.current = false;
      return;
    }
    if (!focusedRef.current) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (!text) {
      setOptions([]);
      setOpen(false);
      return;
    }
    timerRef.current = window.setTimeout(async () => {
      if (!focusedRef.current) return;
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const data = await fetcher(text);
        if (!focusedRef.current) return;
        setOptions(data);
        setOpen(data.length > 0);
        setHighlight(0);
      } catch {}
    }, 250);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [text, fetcher]);

  function choose(opt: AutoOption) {
    suppressNextFetch.current = true;
    setText(opt.fullName);
    setOptions([]);
    setOpen(false);
    onSelect(opt);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || options.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(options[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function handleFocus() {
    focusedRef.current = true;
  }

  function handleBlur() {
    focusedRef.current = false;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (abortRef.current) abortRef.current.abort();
    setOpen(false);
  }

  return (
    <div className="relative">
      <label className="label">{label}</label>
      <input
        className={className ? className : "input"}
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={onKeyDown}
        autoComplete="off"
      />
      {open && options.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full max-h-56 overflow-auto rounded-md border border-white/10 bg-[#0b1220] shadow">
          {options.map((opt, i) => (
            <li
              key={opt.id}
              className={`px-3 py-2 cursor-pointer ${i === highlight ? "bg-white/10" : ""}`}
              onMouseEnter={() => setHighlight(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(opt);
              }}
            >
              {opt.fullName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

export default AutocompleteSelect;
