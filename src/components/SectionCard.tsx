"use client";

import type { ReactNode } from "react";

export const SectionCard = ({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className={`rounded-3xl border border-slate-800 bg-slate-900/60 p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg text-white">{title}</h3>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
};
