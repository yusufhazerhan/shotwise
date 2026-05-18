import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "./cn.js";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "coral";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
  loading?: boolean;
}

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-ghost",
  ghost: "btn-ghost",
  danger: "btn-danger",
  coral: "btn-coral",
};

const SIZE_CLASS: Record<Size, string> = {
  sm: "btn-sm",
  md: "",
  lg: "btn-lg",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", asChild, loading, disabled, children, ...rest },
  ref
) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-loading={loading ? "" : undefined}
      disabled={disabled || loading}
      className={cn("btn", VARIANT_CLASS[variant], SIZE_CLASS[size], className)}
      {...rest}
    >
      {children}
    </Comp>
  );
});
