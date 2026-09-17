"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface SignOutButtonProps {
  label: string;
}

export function SignOutButton({ label }: SignOutButtonProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="flex items-center justify-center gap-2 rounded-2xl bg-white p-4 text-sm font-medium text-red-600 shadow-sm transition-colors hover:bg-red-50"
    >
      <LogOut className="h-4 w-4" strokeWidth={2} />
      {label}
    </button>
  );
}
