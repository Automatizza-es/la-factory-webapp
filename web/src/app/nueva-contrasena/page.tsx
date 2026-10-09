import { NewPasswordForm } from "@/components/auth/NewPasswordForm";

interface NewPasswordPageProps {
  searchParams: Promise<{ bienvenida?: string }>;
}

// Reached signed in: from the recovery email (via /auth/callback), from a
// welcome invitation (/invite/[token], with ?bienvenida=1), or from
// "Cambiar contraseña" in the profile. Not a public path: the proxy sends
// signed-out visitors to /login.
export default async function NewPasswordPage({ searchParams }: NewPasswordPageProps) {
  const { bienvenida } = await searchParams;
  return <NewPasswordForm welcome={bienvenida === "1"} />;
}
