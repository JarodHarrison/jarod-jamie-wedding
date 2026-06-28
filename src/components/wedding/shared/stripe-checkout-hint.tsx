import { STRIPE_BNPL_HINT } from "@/lib/stripe-checkout-hints";

type StripeCheckoutHintProps = {
  className?: string;
};

export function StripeCheckoutHint({ className = "" }: StripeCheckoutHintProps) {
  return (
    <p className={`text-[10px] leading-relaxed text-gray-500 ${className}`.trim()}>
      {STRIPE_BNPL_HINT}
    </p>
  );
}
