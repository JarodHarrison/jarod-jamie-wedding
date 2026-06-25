import { WeddingThemeProvider } from "@/components/wedding/hooks/use-wedding-theme";
import { WeddingApp } from "@/components/wedding/wedding-app";

export default function Home() {
  return (
    <WeddingThemeProvider>
      <WeddingApp />
    </WeddingThemeProvider>
  );
}
