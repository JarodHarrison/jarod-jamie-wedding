import type { Metadata, Viewport } from "next";
import { APP_TITLE } from "@/lib/jj-branding";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: APP_TITLE,
  description: "Wedding celebration for Jarod and Jamie — 26 September 2026",
  applicationName: APP_TITLE,
  appleWebApp: {
    title: APP_TITLE,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-dvh flex-col overflow-x-hidden font-sans max-sm:overflow-hidden">
        {children}
      </body>
    </html>
  );
}
