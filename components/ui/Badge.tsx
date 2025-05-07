import { cn } from "@/lib/utils";
import React from "react";

export type BadgeProps = {
  children: React.ReactNode;
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  variant?: "solid" | "flat" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
};

export const Badge = ({
  children,
  color = "default",
  variant = "solid",
  size = "md",
  className,
  ...props
}: BadgeProps & React.HTMLAttributes<HTMLSpanElement>) => {
  const colorStyles = {
    default: {
      solid: "bg-default-500 text-white",
      flat: "bg-default-100 text-default-800",
      outline: "border border-default-300 text-default-800",
    },
    primary: {
      solid: "bg-primary text-white",
      flat: "bg-primary-100 text-primary-800",
      outline: "border border-primary-300 text-primary-800",
    },
    secondary: {
      solid: "bg-secondary text-white",
      flat: "bg-secondary-100 text-secondary-800",
      outline: "border border-secondary-300 text-secondary-800",
    },
    success: {
      solid: "bg-success text-white",
      flat: "bg-success-100 text-success-800",
      outline: "border border-success-300 text-success-800",
    },
    warning: {
      solid: "bg-warning text-white",
      flat: "bg-warning-100 text-warning-800",
      outline: "border border-warning-300 text-warning-800",
    },
    danger: {
      solid: "bg-danger text-white",
      flat: "bg-danger-100 text-danger-800",
      outline: "border border-danger-300 text-danger-800",
    },
  };

  const sizeStyles = {
    sm: "text-xs px-1.5 py-0.5 rounded",
    md: "text-xs px-2 py-1 rounded-md",
    lg: "text-sm px-2.5 py-1 rounded-md",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-medium",
        colorStyles[color][variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
