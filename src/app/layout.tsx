import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jarod & Jamie | 26.09.26",
  description: "Wedding celebration for Jarod and Jamie",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
