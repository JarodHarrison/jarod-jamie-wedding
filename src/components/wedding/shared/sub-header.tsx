import { ArrowLeft } from "lucide-react";
import { theme } from "@/lib/theme";

type SubHeaderProps = {
  title: string;
  subtitle: string;
  onBack: () => void;
};

export function SubHeader({ title, subtitle, onBack }: SubHeaderProps) {
  return (
    <div
      className="wedding-screen-top sticky top-0 z-20 border-b bg-[#f7f4ee]/90 px-8 pb-6 text-center backdrop-blur-md"
      style={{ borderColor: theme.border }}
    >
      <button
        type="button"
        onClick={onBack}
        className="wedding-top-offset absolute left-6 flex items-center gap-1 text-[10px] uppercase tracking-widest text-gray-500 transition-colors hover:text-black"
      >
        <ArrowLeft size={14} /> Back
      </button>
      <h2 className="mb-2 font-serif text-xs uppercase tracking-[0.15em] text-gray-500">
        {subtitle}
      </h2>
      <h1 className="font-serif text-2xl text-[#2a2723]">{title}</h1>
    </div>
  );
}
