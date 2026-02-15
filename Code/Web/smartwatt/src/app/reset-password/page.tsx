// File: /src/app/reset-password/page.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Logo from "@/public/logo.jpg";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    setLoading(false);

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({
        type: "success",
        text: "Password updated successfully. Redirecting...",
      });
      setTimeout(() => {
        router.push("/home"); // or /login
      }, 2000);
    }
  }

  return (
    <div
      className="
        min-h-dvh flex items-center justify-center px-6
        bg-smart-bg text-smart-fg
        bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.35),transparent_55%),_radial-gradient(circle_at_bottom,_rgba(250,204,21,0.25),transparent_55%)]
      "
    >
      <div className="w-full max-w-lg rounded-3xl border border-smart-border bg-smart-surface/95 p-10 shadow-2xl">
        <div className="mb-8 flex items-center gap-4">
          <div className="h-14 w-14 overflow-hidden rounded-2xl border border-smart-primary/60 bg-smart-primary/10 relative">
            <Image
              src={Logo}
              alt="SmartWatt logo"
              fill
              className="object-cover"
            />
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Recovery</h1>
            <p className="text-sm text-smart-muted">Create new password</p>
          </div>
        </div>

        <h2 className="mb-2 text-2xl font-semibold">Reset Password</h2>
        <p className="mb-8 text-sm text-smart-dim">
          Enter your new password below.
        </p>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-base font-medium text-smart-muted">
              New Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                w-full rounded-xl border border-smart-border bg-smart-panel
                px-4 py-3 text-base text-smart-fg outline-none
                focus:border-smart-primary focus:ring-1 focus:ring-smart-primary
              "
              placeholder="New password"
            />
          </div>

          <div className="space-y-2">
            <label className="text-base font-medium text-smart-muted">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="
                w-full rounded-xl border border-smart-border bg-smart-panel
                px-4 py-3 text-base text-smart-fg outline-none
                focus:border-smart-primary focus:ring-1 focus:ring-smart-primary
              "
              placeholder="Confirm new password"
            />
          </div>

          {/* Message Area */}
          {message && (
            <div
              className={`
                rounded-xl border px-4 py-3 text-sm
                ${
                  message.type === "error"
                    ? "border-smart-danger/50 bg-smart-danger/15 text-smart-danger"
                    : "border-green-500/50 bg-green-500/15 text-green-400"
                }
              `}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="
              w-full rounded-xl bg-smart-primary px-4 py-3 text-base font-semibold
              text-smart-fg shadow-md shadow-smart-primary/40 transition
              hover:bg-smart-accent
              disabled:cursor-not-allowed disabled:opacity-60
            "
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
