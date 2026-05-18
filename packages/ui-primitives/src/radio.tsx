"use client";
import * as React from "react";
import * as RadioPrimitive from "@radix-ui/react-radio-group";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cn } from "./cn.js";

export const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioPrimitive.Root>
>(function RadioGroup({ className, ...rest }, ref) {
  return (
    <RadioPrimitive.Root
      ref={ref}
      data-slot="radio-group"
      className={cn("sw-radio-group", className)}
      {...rest}
    />
  );
});

export const RadioItem = React.forwardRef<
  React.ElementRef<typeof RadioPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioPrimitive.Item>
>(function RadioItem({ className, ...rest }, ref) {
  return (
    <RadioPrimitive.Item
      ref={ref}
      data-slot="radio-item"
      className={cn("sw-radio-item", className)}
      {...rest}
    >
      <RadioPrimitive.Indicator className="sw-radio-indicator">●</RadioPrimitive.Indicator>
    </RadioPrimitive.Item>
  );
});

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(function Checkbox({ className, ...rest }, ref) {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      data-slot="checkbox"
      className={cn("sw-checkbox", className)}
      {...rest}
    >
      <CheckboxPrimitive.Indicator className="sw-checkbox-indicator">✓</CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});
