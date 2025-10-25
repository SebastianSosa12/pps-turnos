import React from "react";

type Props = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children: React.ReactNode;
};

export default function SectionTitle({ icon: Icon, children }: Props) {
  return (
    <div className="flex items-center gap-2 text-white">
      <span className="p-2 rounded-xl bg-brand-500/10 text-brand-400">
        <Icon className="w-6 h-6" />
      </span>
      <h2 className="text-xl font-semibold">{children}</h2>
    </div>
  );
}
