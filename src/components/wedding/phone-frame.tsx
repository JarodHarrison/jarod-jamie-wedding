import type { ReactNode } from "react";
import { theme } from "@/lib/theme";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh justify-center bg-gray-100 sm:min-h-dvh sm:items-center sm:p-4">
      <div
        className="relative flex h-svh w-full max-w-[420px] flex-col overflow-hidden font-sans shadow-2xl sm:h-[min(850px,100dvh)] sm:max-h-[min(850px,100dvh)] sm:rounded-[2.5rem] sm:border-[8px] sm:border-gray-900 md:max-w-[430px]"
        style={{ backgroundColor: theme.bg, color: theme.textDark }}
      >
        {children}
      </div>
    </div>
  );
}
