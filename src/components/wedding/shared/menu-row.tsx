import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { theme } from "@/lib/theme";

type MenuRowProps = {
  icon: LucideIcon;
  title: string;
  onClick: () => void;
};

export function MenuRow({ icon: Icon, title, onClick }: MenuRowProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      className="flex cursor-pointer items-center justify-between rounded-2xl border bg-white/60 p-4 shadow-sm transition-colors hover:bg-white"
      style={{ borderColor: theme.border }}
    >
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-[#f7f4ee] p-2 text-[#c3a379]">
          <Icon size={18} />
        </div>
        <span className="text-sm font-bold uppercase tracking-[0.1em] text-[#2a2723]">
          {title}
        </span>
      </div>
      <ChevronRight size={18} className="text-gray-400" />
    </div>
  );
}
