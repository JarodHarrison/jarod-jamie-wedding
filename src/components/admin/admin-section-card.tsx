import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { theme } from "@/lib/theme";

type AdminSectionCardProps = {
  title: string;
  description: string;
  actionLabel: string;
  icon: LucideIcon;
  variant?: "dark" | "light" | "gold";
  onClick: () => void;
};

const variantStyles = {
  dark: {
    card: "bg-[#2a2723] text-white shadow-lg",
    title: "text-[#c3a379]",
    description: "text-gray-300",
    action: "text-white",
    iconOpacity: "opacity-20",
  },
  light: {
    card: "border bg-white shadow-md",
    title: "text-[#2a2723]",
    description: "text-gray-500",
    action: "text-[#c3a379]",
    iconOpacity: "opacity-10",
  },
  gold: {
    card: "bg-[#c3a379] text-white shadow-lg",
    title: "text-[#2a2723]",
    description: "text-white/90",
    action: "text-[#2a2723]",
    iconOpacity: "opacity-20",
  },
};

export function AdminSectionCard({
  title,
  description,
  actionLabel,
  icon: Icon,
  variant = "light",
  onClick,
}: AdminSectionCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      className={`group relative cursor-pointer overflow-hidden rounded-3xl p-6 transition-transform active:scale-95 ${styles.card}`}
      style={variant === "light" ? { borderColor: theme.border } : undefined}
    >
      <div
        className={`absolute right-0 top-0 p-4 transition-transform group-hover:scale-110 ${styles.iconOpacity}`}
      >
        <Icon size={64} color={variant === "light" ? theme.textDark : undefined} />
      </div>
      <h3 className={`mb-1 font-serif text-2xl ${styles.title}`}>{title}</h3>
      <p className={`mb-4 max-w-[80%] text-sm ${styles.description}`}>{description}</p>
      <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest ${styles.action}`}>
        {actionLabel} <ChevronRight size={12} />
      </span>
    </div>
  );
}
