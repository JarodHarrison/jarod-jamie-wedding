import type { ReactNode } from "react";
import { theme } from "@/lib/theme";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh w-full sm:min-h-dvh">
      <div
        className="wedding-app-shell relative flex h-svh w-full flex-col font-sans sm:h-dvh sm:max-h-dvh"
        style={{ backgroundColor: theme.bg, color: theme.textDark }}
      >
        {children}
      </div>
    </div>
  );
}
