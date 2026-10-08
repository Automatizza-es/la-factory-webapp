import { LoginForm } from "@/components/auth/LoginForm";

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

// /auth/callback sends expired or already-used email links back here
// with ?error=auth.
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;
  return <LoginForm linkExpired={error === "auth"} />;
}
