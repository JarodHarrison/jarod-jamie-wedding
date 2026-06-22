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
      className={`flex ${compact ? "w-12" : "w-16"} flex-col items-center justify-center transition-all duration-300 ${isActive ? "-translate-y-1" : "opacity-60"}`}
    >
      <div
        className={`rounded-xl p-2 transition-colors ${isActive ? "bg-[#c3a379] text-white shadow-md" : "text-[#2a2723]"}`}
      >
        <Icon size={compact ? 18 : 20} />
      </div>
      <span
        className={`mt-1 text-[8px] font-bold uppercase tracking-widest transition-colors ${isActive ? "text-[#c3a379]" : "text-gray-400"}`}
      >
        {label}
      </span>
    </button>
  );
}
