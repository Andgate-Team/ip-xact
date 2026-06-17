import type { PropsWithChildren } from "react";

interface InspectorSectionProps {
  title: string;
}

export function InspectorSection({ title, children }: PropsWithChildren<InspectorSectionProps>) {
  return (
    <section className="border-t border-white/10 pt-4">
      <h3 className="mb-3 text-xs font-semibold uppercase text-slate-500">{title}</h3>
      {children}
    </section>
  );
}
