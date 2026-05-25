"use client";
import * as React from "react";

interface CreditsState {
  balance: number;
  lifetimeActive: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
}

const CreditsContext = React.createContext<CreditsState | null>(null);

export function CreditsProvider({
  children,
  initialBalance,
  initialLifetimeActive,
}: {
  children: React.ReactNode;
  initialBalance?: number;
  initialLifetimeActive?: boolean;
}) {
  const [balance, setBalance] = React.useState(initialBalance ?? 0);
  const [lifetimeActive, setActive] = React.useState(initialLifetimeActive ?? false);
  const [loading, setLoading] = React.useState(false);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/credits", { cache: "no-store" });
      if (r.ok) {
        const data = (await r.json()) as { balance: number; lifetimeActive: boolean };
        setBalance(data.balance);
        setActive(data.lifetimeActive);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <CreditsContext.Provider value={{ balance, lifetimeActive, loading, refresh }}>
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  const ctx = React.useContext(CreditsContext);
  if (!ctx) throw new Error("useCredits must be used within CreditsProvider");
  return ctx;
}

export function CreditBalance() {
  const { balance, loading } = useCredits();
  return (
    <span data-slot="credit-balance" className="sw-credit-balance" data-loading={loading ? "" : undefined}>
      {balance} credits
    </span>
  );
}
