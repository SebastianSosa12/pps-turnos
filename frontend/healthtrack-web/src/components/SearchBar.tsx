import React from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSearch: () => void;
  placeholder?: string;
  disabled?: boolean;
};

export default function SearchBar({ value, onChange, onSearch, placeholder, disabled }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
      <div>
        <label className="label">Filter</label>
        <input
          className="input"
          placeholder={placeholder || "Type to filter"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <button className="btn-primary" onClick={onSearch} disabled={disabled}>
        Search
      </button>
    </div>
  );
}
