import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { APP_TITLE } from "@/lib/jj-branding";
import { fontVariables } from "@/lib/fonts";
import { WEDDING_THEME_STORAGE_KEY } from "@/lib/theme";
import { OrientationGuard } from "@/components/wedding/shared/orientation-guard";
import "./globals.css";

export const metadata: Metadata = {
  title: APP_TITLE,
  description: "Wedding celebration for Jarod and Jamie — 26 September 2026",
  applicationName: APP_TITLE,
  appleWebApp: {
    capable: true,
    title: APP_TITLE,
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icon", sizes: "32x32", type: "image/png" },
      { url: "/icon-192", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#f7f4ee",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`} suppressHydrationWarning>
      <head>
        <Script id="wedding-theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem("${WEDDING_THEME_STORAGE_KEY}");if(t==="rainbow")document.documentElement.dataset.theme="rainbow";}catch(e){}})();`}
        </Script>
      </head>
      <body className="flex min-h-dvh flex-col overflow-x-hidden font-sans max-sm:overflow-hidden">
        <OrientationGuard />
        {children}
      </body>
    </html>
  );
}
