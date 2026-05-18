"use client";
import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { cn } from "./cn.js";

type ToastInput = {
  id?: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "error";
  durationMs?: number;
};

type ToastEntry = Required<Omit<ToastInput, "description" | "variant" | "durationMs">> & {
  description?: string;
  variant: "default" | "success" | "error";
  durationMs: number;
};

interface ToastContextValue {
  push: (t: ToastInput) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastEntry[]>([]);

  const push = React.useCallback((t: ToastInput) => {
    const entry: ToastEntry = {
      id: t.id ?? crypto.randomUUID(),
      title: t.title,
      description: t.description,
      variant: t.variant ?? "default",
      durationMs: t.durationMs ?? 4000,
    };
    setItems((prev) => [...prev, entry]);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      <ToastPrimitive.Provider swipeDirection="right" duration={4000}>
        {children}
        {items.map((it) => (
          <ToastPrimitive.Root
            key={it.id}
            duration={it.durationMs}
            data-slot="toast"
            data-variant={it.variant}
            className={cn("sw-toast", `sw-toast--${it.variant}`)}
            onOpenChange={(open) => {
              if (!open) setItems((prev) => prev.filter((x) => x.id !== it.id));
            }}
          >
            <ToastPrimitive.Title className="sw-toast-title">{it.title}</ToastPrimitive.Title>
            {it.description && (
              <ToastPrimitive.Description className="sw-toast-description">
                {it.description}
              </ToastPrimitive.Description>
            )}
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="sw-toast-viewport" data-slot="toast-viewport" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}
