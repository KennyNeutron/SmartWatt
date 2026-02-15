// File: /src/app/forgot-password/page.tsx

"use client";

import { useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/logo.jpg";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    setLoading(false);

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({
        type: "success",
        text: "Check your email for the password reset link.",
      });
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
        {/* Same header as login (simplified) */}
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
            <p className="text-sm text-smart-muted">Reset your password</p>
          </div>
        </div>

        <h2 className="mb-2 text-2xl font-semibold">Forgot Password?</h2>
        <p className="mb-8 text-sm text-smart-dim">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-base font-medium text-smart-muted">
              Email
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-smart-dim">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
                  <path d="m22 6-10 7L2 6" />
                </svg>
              </span>

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="
                  w-full rounded-xl border border-smart-border bg-smart-panel
                  px-4 py-3 pl-12 text-base text-smart-fg outline-none
                  placeholder:text-smart-dim/80
                  focus:border-smart-primary focus:ring-1 focus:ring-smart-primary
                "
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
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
            {loading ? "Sending Link..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-smart-primary hover:text-smart-accent hover:underline"
          >
            Back to Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
