// File: /src/app/forgot-password/page.tsx

"use client";

import { useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/logo.jpg";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function onRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    // We use signInWithOtp to send a code.
    // This will effectively log the user in when they verify it, allowing them to reset password.
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // Don't sign up new users, only allow existing
      },
    });

    setLoading(false);

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({
        type: "success",
        text: "Code sent! Check your email.",
      });
      setStep("otp");
    }
  }

  async function onVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    setLoading(false);

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({
        type: "success",
        text: "Verified! Redirecting...",
      });
      router.push("/reset-password");
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
            <p className="text-sm text-smart-muted">
              {step === "email"
                ? "Reset your password"
                : "Enter verification code"}
            </p>
          </div>
        </div>

        <h2 className="mb-2 text-2xl font-semibold">
          {step === "email" ? "Forgot Password?" : "Check your Email"}
        </h2>
        <p className="mb-8 text-sm text-smart-dim">
          {step === "email"
            ? "Enter your email address and we'll send you a pin code."
            : `We've sent a 6-digit code to ${email}.`}
        </p>

        {step === "email" ? (
          <form onSubmit={onRequestOtp} className="space-y-6">
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
              {loading ? "Sending..." : "Send Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={onVerifyOtp} className="space-y-6">
            <div className="space-y-2">
              <label className="text-base font-medium text-smart-muted">
                Verification Code
              </label>
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="
                    w-full rounded-xl border border-smart-border bg-smart-panel
                    px-4 py-3 text-center text-2xl tracking-widest text-smart-fg outline-none
                    placeholder:text-smart-dim/50
                    focus:border-smart-primary focus:ring-1 focus:ring-smart-primary
                  "
                placeholder="123456"
                maxLength={6}
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
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>

            <button
              type="button"
              onClick={() => setStep("email")}
              className="w-full text-sm text-smart-muted hover:text-smart-primary"
            >
              Use a different email
            </button>
          </form>
        )}

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
