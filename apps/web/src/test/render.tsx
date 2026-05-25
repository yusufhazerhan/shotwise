import * as React from "react";
import type { ReactElement, ReactNode } from "react";
import { render } from "@testing-library/react";
import { CreditsProvider } from "@/components/credit-balance";

export function renderWithProviders(
  ui: ReactElement,
  opts?: { balance?: number; lifetimeActive?: boolean; wrapper?: (children: ReactNode) => ReactNode }
) {
  const Wrapper = ({ children }: { children: ReactNode }) => {
    const inner = (
      <CreditsProvider
        initialBalance={opts?.balance ?? 20}
        initialLifetimeActive={opts?.lifetimeActive ?? false}
      >
        {children}
      </CreditsProvider>
    );
    return opts?.wrapper ? <>{opts.wrapper(inner)}</> : <>{inner}</>;
  };

  return render(ui, { wrapper: Wrapper });
}
