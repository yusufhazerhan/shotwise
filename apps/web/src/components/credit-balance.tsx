"use client";
import * as React from "react";

interface CreditsState {
  balance: number;
  monthlyRefillActive: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
}

const CreditsContext = React.createContext<CreditsState | null>(null);

export function CreditsProvider({
  children,
  initialBalance,
  initialActive,
}: {
  children: React.ReactNode;
  initialBalance?: number;
  initialActive?: boolean;
}) {
  const [balance, setBalance] = React.useState(initialBalance ?? 0);
  const [monthlyRefillActive, setActive] = React.useState(initialActive ?? false);
  const [loading, setLoading] = React.useState(false);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/credits", { cache: "no-store" });
      if (r.ok) {
        const data = (await r.json()) as { balance: number; monthlyRefillActive: boolean };
        setBalance(data.balance);
        setActive(data.monthlyRefillActive);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <CreditsContext.Provider value={{ balance, monthlyRefillActive, loading, refresh }}>
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
