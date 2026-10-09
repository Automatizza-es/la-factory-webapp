import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { I18nProvider } from "@/lib/i18n/context";
import { getLocale } from "@/lib/i18n/server";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "La Factory Coworking",
  description: "Reserva de salas y gestión de tu cuenta en La Factory Coworking.",
  appleWebApp: {
    capable: true,
    title: "La Factory",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/brand/icon-180.png",
  },
  // Next only emits the standard mobile-web-app-capable tag, but iOS still
  // needs the apple- prefixed one to honour the status bar style above.
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // The app has no dark theme. (iOS still paints the installed app's status
  // bar black in system dark mode -- that one isn't controllable from the web.)
  colorScheme: "light",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-cream font-sans text-ink antialiased">
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
