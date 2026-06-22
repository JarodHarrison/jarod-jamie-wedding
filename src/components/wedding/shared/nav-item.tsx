import type { LucideIcon } from "lucide-react";
import type { AppTab } from "@/types/wedding";

type NavItemProps = {
  id: AppTab;
  icon: LucideIcon;
  label: string;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  compact?: boolean;
};

export function NavItem({
  id,
  icon: Icon,
  label,
  activeTab,
  setActiveTab,
  compact = false,
}: NavItemProps) {
  const isActive = activeTab === id;

  return (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`flex min-h-[40px] min-w-0 flex-1 touch-manipulation flex-col items-center justify-center gap-px transition-opacity duration-200 ${isActive ? "opacity-100" : "opacity-55"}`}
    >
      <div
        className={`rounded-xl transition-colors ${compact ? "p-1.5" : "p-2"} ${isActive ? "bg-[#c3a379] text-white shadow-md" : "text-[#2a2723]"}`}
      >
        <Icon size={compact ? 17 : 20} strokeWidth={isActive ? 2.25 : 2} />
      </div>
      <span
        className={`max-w-full truncate px-0.5 text-[7px] font-bold uppercase leading-tight tracking-wide sm:text-[8px] sm:tracking-widest ${isActive ? "text-[#c3a379]" : "text-gray-400"}`}
      >
        {label}
      </span>
    </button>
  );
}
