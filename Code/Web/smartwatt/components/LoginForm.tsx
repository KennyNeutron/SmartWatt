"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      await new Promise((res) => setTimeout(res, 400));
      router.push("/home");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <label className="grid gap-2">
        <span className="text-sm">Email</span>
        <input
          type="email"
          className="w-full rounded-xl border border-smart-border px-3 py-2 outline-none bg-smart-surface placeholder:text-smart-dim"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm">Password</span>
        <div className="flex items-stretch rounded-xl border border-smart-border overflow-hidden">
          <input
            type={showPwd ? "text" : "password"}
            className="w-full px-3 py-2 outline-none bg-smart-surface placeholder:text-smart-dim"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            className="px-3 text-sm border-l border-smart-border bg-smart-surface hover:bg-smart-muted/10"
            aria-label={showPwd ? "Hide password" : "Show password"}
          >
            {showPwd ? "Hide" : "Show"}
          </button>
        </div>
      </label>

      {error && (
        <p className="text-sm text-smart-accent" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 inline-flex items-center justify-center rounded-xl px-4 py-2 font-medium border border-transparent bg-smart-accent text-black hover:opacity-95 disabled:opacity-60"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>

      <div className="text-xs text-smart-dim text-center">
        No account yet?{" "}
        <a href="#" className="underline underline-offset-2 text-smart-accent">
          Create one
        </a>
      </div>
    </form>
  );
}
