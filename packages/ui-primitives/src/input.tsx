import * as React from "react";
import { cn } from "./cn.js";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return <input ref={ref} data-slot="input" className={cn("input", className)} {...rest} />;
  }
);

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...rest }, ref) {
  return (
    <textarea ref={ref} data-slot="textarea" className={cn("textarea", className)} {...rest} />
  );
});

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  function Label({ className, ...rest }, ref) {
    return <label ref={ref} data-slot="label" className={cn("label", className)} {...rest} />;
  }
);
