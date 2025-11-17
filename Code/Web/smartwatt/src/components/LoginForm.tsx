// File: /src/components/LoginForm.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    router.replace("/home");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Email */}
      <div className="space-y-2">
        <label className="text-base font-medium text-smart-muted">Email</label>
        <div className="relative">
          {/* Mail icon */}
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

      {/* Password */}
      <div className="space-y-2">
        <label className="text-base font-medium text-smart-muted">
          Password
        </label>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            {/* Lock icon */}
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
                <rect x="4" y="11" width="16" height="9" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
            </span>

            <input
              type={showPwd ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                w-full rounded-xl border border-smart-border bg-smart-panel
                px-4 py-3 pl-12 text-base text-smart-fg outline-none
                placeholder:text-smart-dim/80
                focus:border-smart-primary focus:ring-1 focus:ring-smart-primary
              "
              placeholder="Your password"
              autoComplete="current-password"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowPwd((s) => !s)}
            className="
              shrink-0 rounded-lg border border-smart-border bg-smart-surface
              px-4 py-2 text-sm font-medium text-smart-muted
              hover:border-smart-primary hover:text-smart-primary
            "
          >
            {showPwd ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {/* Error */}
      {errorMsg && (
        <div
          className="
            rounded-xl border border-smart-danger/50 bg-smart-danger/15
            px-4 py-3 text-sm text-smart-danger
          "
        >
          {errorMsg}
        </div>
      )}

      {/* Submit */}
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
        {loading ? "Signing in..." : "Sign in"}
      </button>

      {/* Footnote */}
      <p className="text-sm text-smart-dim">
        SmartWatt • Monitor, optimize, and protect your energy usage.
      </p>
    </form>
  );
}
