import { JJ_ICON_BACKGROUND, JJ_ICON_GOLD } from "@/lib/jj-branding";

type JJIconImageProps = {
  fontSize: number;
  ampFontSize: number;
  borderRadius?: number;
};

/** Shared J&J mark for favicon / apple-touch-icon generation */
export function JJIconImage({ fontSize, ampFontSize, borderRadius = 0 }: JJIconImageProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: JJ_ICON_BACKGROUND,
        borderRadius,
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontWeight: 700,
        letterSpacing: "-0.04em",
        color: JJ_ICON_GOLD,
      }}
    >
      <span style={{ fontSize }}>J</span>
      <span style={{ fontSize: ampFontSize, marginTop: fontSize * 0.08 }}>&</span>
      <span style={{ fontSize }}>J</span>
    </div>
  );
}
