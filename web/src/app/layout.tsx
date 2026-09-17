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
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-cream font-sans text-ink antialiased md:bg-sand/25">
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
