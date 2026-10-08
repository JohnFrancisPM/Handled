import Link from "next/link";
import type { ReactNode, ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonProps = {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  href?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<"button">, "type" | "children">;

const base =
  "inline-flex items-center justify-center gap-2 font-medium type-body-lg rounded-md transition-colors duration-[var(--motion-fast)] ease-ds-out disabled:cursor-not-allowed";

const variants = {
  primary:
    "bg-brand text-white hover:bg-brand-600 active:bg-brand-700 disabled:bg-grey-25 disabled:text-grey-400",
  secondary:
    "bg-white border border-grey-100 text-grey-900 hover:bg-grey-50 hover:border-grey-200 active:bg-grey-100 active:border-grey-300 disabled:text-grey-400",
  ghost:
    "bg-transparent text-brand hover:text-brand-600 hover:underline disabled:text-grey-400",
  danger:
    "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 disabled:bg-grey-25 disabled:text-grey-400"
} as const;

const sizes = {
  sm: "h-8 px-3 text-[12px]",
  md: "h-10 px-6",
  lg: "h-12 px-6"
} as const;

export function Button({
  variant = "primary",
  size = "md",
  href,
  type = "button",
  disabled = false,
  fullWidth = false,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = cn(
    base,
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled} className={classes} {...rest}>
      {children}
    </button>
  );
}
