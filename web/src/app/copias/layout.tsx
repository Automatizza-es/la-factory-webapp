import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { default: "Copias de seguridad | La Factory", template: "%s | La Factory" },
  description: "Información sobre la integración interna de copias de seguridad de La Factory con Google Drive.",
  robots: { index: false, follow: false },
};

export default function BackupInformationLayout({ children }: { children: React.ReactNode }) {
  return (
    <div lang="es" className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
      <header className="mb-8 border-b border-sand pb-6">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brown">La Factory Coworking</p>
        <nav aria-label="Información de las copias" className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-brown">
          <Link className="underline underline-offset-4" href="/copias">La herramienta</Link>
          <Link className="underline underline-offset-4" href="/copias/privacidad">Privacidad</Link>
          <Link className="underline underline-offset-4" href="/copias/condiciones">Condiciones</Link>
        </nav>
      </header>
      <main className="space-y-5 leading-7 [&_h1]:mb-6 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:leading-tight [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_li]:pl-1 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_a]:text-brown [&_a]:underline [&_a]:underline-offset-4">
        {children}
      </main>
      <footer className="mt-12 border-t border-sand pt-5 text-sm text-warm-gray">
        <p>Última actualización: 4 de noviembre de 2026.</p>
        <p>Contacto: <a className="text-brown underline" href="mailto:coworkingtbf@gmail.com">coworkingtbf@gmail.com</a></p>
      </footer>
    </div>
  );
}
