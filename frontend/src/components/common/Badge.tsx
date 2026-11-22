import React from "react";

interface BadgeProps {
  variant?: "free" | "borrow" | "exchange" | "paid" | "verified" | "neutral" | "status";
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
  const sizeStyles = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs font-medium";

  const variantStyles = {
    free: "bg-emerald-50 text-emerald-700 border border-emerald-200/80",
    borrow: "bg-amber-50 text-amber-700 border border-amber-200/80",
    exchange: "bg-purple-50 text-purple-700 border border-purple-200/80",
    paid: "bg-indigo-50 text-indigo-700 border border-indigo-200/80",
    verified: "bg-blue-50 text-blue-700 border border-blue-200/80 flex items-center gap-1",
    neutral: "bg-slate-100 text-slate-700 border border-slate-200",
    status: "bg-emerald-500 text-white font-medium",
  }[variant];

  return (
    <span className={`inline-flex items-center rounded-full ${sizeStyles} ${variantStyles} ${className}`}>
      {children}
    </span>
  );
};
