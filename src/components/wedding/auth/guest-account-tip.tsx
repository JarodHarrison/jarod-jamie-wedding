import { theme } from "@/lib/theme";

type GuestAccountTipProps = {
  compact?: boolean;
  className?: string;
};

export function GuestAccountTip({ compact = false, className = "" }: GuestAccountTipProps) {
  return (
    <div
      className={`rounded-xl border bg-[#f7f4ee] px-4 py-3 text-xs leading-relaxed text-gray-600 ${className}`}
      style={{ borderColor: theme.border }}
    >
      <p className="font-semibold text-[#2a2723]">
        {compact ? "Use your invite email" : "Getting started"}
      </p>
      <p className="mt-1">
        Sign up with the <strong className="font-medium text-[#2a2723]">same email you gave us</strong>{" "}
        on your invitation or RSVP — we&apos;ll load your guest profile automatically.
      </p>
      {!compact && (
        <p className="mt-2 text-[11px] text-gray-500">
          Prefer Google or a passkey? Sign in first, then link them under{" "}
          <strong className="font-medium text-[#2a2723]">Profile → App preferences</strong>.
        </p>
      )}
    </div>
  );
}
