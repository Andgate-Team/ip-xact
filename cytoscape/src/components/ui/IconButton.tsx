import clsx from "clsx";
import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

export function IconButton({
  children,
  className,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  return (
    <button
      className={clsx(
        "inline-grid h-9 w-9 place-items-center rounded-md border border-white/10 bg-white/5 text-slate-200 transition hover:border-cyan-300/40 hover:bg-cyan-300/10",
        className
      )}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
