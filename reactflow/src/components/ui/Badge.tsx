import type { PropsWithChildren } from "react";

interface BadgeProps {
  color?: string;
}

export function Badge({ children, color = "#94a3b8" }: PropsWithChildren<BadgeProps>) {
  return (
    <span
      className="inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
      style={{
        borderColor: color,
        color,
        backgroundColor: `${color}1a`
      }}
    >
      {children}
    </span>
  );
}
