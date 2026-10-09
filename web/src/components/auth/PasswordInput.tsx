"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

// A password field with an eye button to show / hide what's typed.
export function PasswordInput({ className = "", ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const { dict } = useI18n();
  const [visible, setVisible] = useState(false);
  const label = visible ? dict.login.hidePassword : dict.login.showPassword;

  return (
    <div className="relative w-full">
      <input {...props} type={visible ? "text" : "password"} className={`${className} pr-11`} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={label}
        title={label}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-warm-gray hover:text-brown-dark"
      >
        {visible ? <EyeOff className="h-4 w-4" strokeWidth={2} /> : <Eye className="h-4 w-4" strokeWidth={2} />}
      </button>
    </div>
  );
}
