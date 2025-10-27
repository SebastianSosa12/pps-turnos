import React from "react";

type Props = { label: string };

export default function Divider({ label }: Props) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-white/40" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-bg px-3 text-xs font-medium text-white/70 tracking-wide uppercase">
          {label}
        </span>
      </div>
    </div>
  );
}
