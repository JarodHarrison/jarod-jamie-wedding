import type { ReactNode } from "react";
import { theme } from "@/lib/theme";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen justify-center bg-gray-100">
      <div
        className="relative h-screen w-full max-w-[420px] overflow-hidden font-sans shadow-2xl sm:my-auto sm:h-[850px] sm:rounded-[2.5rem] sm:border-[8px] sm:border-gray-900"
        style={{ backgroundColor: theme.bg, color: theme.textDark }}
      >
        {children}
      </div>
    </div>
  );
}
