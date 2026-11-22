import React from "react";

interface BadgeProps {
  variant?:
    | "free"
    | "borrow"
    | "exchange"
    | "paid"
    | "verified"
    | "neutral"
    | "status"
    | "match"
    | "warning"
    | "success"
    | "danger";
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "neutral",
  children,
  className = "",
  size = "md",
}) => {
  const sizeStyles = size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-2.5 py-0.5 text-xs font-medium";

  const variantStyles = {
    free: "bg-emerald-50 text-emerald-800 border border-emerald-200/80",
    borrow: "bg-amber-50 text-amber-800 border border-amber-200/80",
    exchange: "bg-purple-50 text-purple-800 border border-purple-200/80",
    paid: "bg-blue-50 text-[#005bab] border border-blue-200/80 font-semibold",
    verified: "bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1",
    match: "bg-indigo-50 text-indigo-800 border border-indigo-200 font-semibold flex items-center gap-1",
    warning: "bg-amber-50 text-amber-800 border border-amber-200/80",
    success: "bg-emerald-50 text-emerald-800 border border-emerald-200/80",
    danger: "bg-rose-50 text-rose-800 border border-rose-200/80 font-medium",
    neutral: "bg-[#f6f5f4] text-[#1a1a1a] border border-[#e6e6e6]",
    status: "bg-slate-900 text-white font-medium",
  }[variant];

  return (
    <span className={`inline-flex items-center rounded-full tracking-normal whitespace-nowrap ${sizeStyles} ${variantStyles} ${className}`}>
      {children}
    </span>
  );
};
