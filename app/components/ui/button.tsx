"use client";

import * as React from "react";
import { cn } from "../../../lib/utils";

type ButtonVariant = "default" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

export function Button({
  className,
  variant = "default",
  size = "md",
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  
  const baseStyles =
    "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none";

  const variants = {
    default: "bg-black text-white hover:opacity-90",
    outline: "border border-gray-300 bg-white hover:bg-gray-100",
    ghost: "bg-transparent hover:bg-gray-100",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Duke u ngarkuar..." : children}
    </button>
  );
}