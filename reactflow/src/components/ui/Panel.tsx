import clsx from "clsx";
import type { PropsWithChildren } from "react";

interface PanelProps {
  className?: string;
}

export function Panel({ children, className }: PropsWithChildren<PanelProps>) {
  return (
    <section className={clsx("border border-white/10 bg-shell-900/90 shadow-2xl backdrop-blur", className)}>
      {children}
    </section>
  );
}
