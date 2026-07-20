import {
  STRIPE_BNPL_HINT,
  STRIPE_PROCESSING_FEE_DISCLAIMER,
} from "@/lib/stripe-checkout-hints";

type StripeCheckoutHintProps = {
  className?: string;
  includeProcessingFee?: boolean;
};

export function StripeCheckoutHint({
  className = "",
  includeProcessingFee = false,
}: StripeCheckoutHintProps) {
  return (
    <p className={`text-[10px] leading-relaxed text-gray-500 ${className}`.trim()}>
      {STRIPE_BNPL_HINT}
      {includeProcessingFee ? ` ${STRIPE_PROCESSING_FEE_DISCLAIMER}` : ""}
    </p>
  );
}
