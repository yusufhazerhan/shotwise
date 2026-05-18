"use client";
import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "./cn.js";

export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(function Slider({ className, ...rest }, ref) {
  return (
    <SliderPrimitive.Root
      ref={ref}
      data-slot="slider"
      className={cn("sw-slider", className)}
      {...rest}
    >
      <SliderPrimitive.Track className="sw-slider-track">
        <SliderPrimitive.Range className="sw-slider-range" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="sw-slider-thumb" />
    </SliderPrimitive.Root>
  );
});

export const ProgressBar = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(function ProgressBar({ className, value, ...rest }, ref) {
  return (
    <ProgressPrimitive.Root
      ref={ref}
      data-slot="progress"
      value={value}
      className={cn("sw-progress", className)}
      {...rest}
    >
      <ProgressPrimitive.Indicator
        className="sw-progress-indicator"
        style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      data-slot="spinner"
      className={cn("sw-spinner", className)}
      role="status"
      aria-label="Loading"
    >
      ⟳
    </span>
  );
}
