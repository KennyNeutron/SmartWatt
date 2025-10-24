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
      // Simulate a short delay before navigation
      await new Promise((res) => setTimeout(res, 500));
      router.push("/home"); // Redirect to Home Page
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
          className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 ring-offset-0 focus:ring-black/20 dark:focus:ring-white/30 bg-white/80 dark:bg-zinc-900"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm">Password</span>
        <div className="flex items-stretch rounded-xl border overflow-hidden focus-within:ring-2 focus-within:ring-black/20 dark:focus-within:ring-white/30">
          <input
            type={showPwd ? "text" : "password"}
            className="w-full px-3 py-2 outline-none bg-white/80 dark:bg-zinc-900"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            className="px-3 text-sm border-l hover:bg-black/5 dark:hover:bg-white/5"
            aria-label={showPwd ? "Hide password" : "Show password"}
          >
            {showPwd ? "Hide" : "Show"}
          </button>
        </div>
      </label>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 inline-flex items-center justify-center rounded-xl px-4 py-2 font-medium border bg-black text-white hover:opacity-90 disabled:opacity-60 dark:bg-white dark:text-black"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>

      <div className="text-xs text-gray-500 text-center">
        No account yet?{" "}
        <a href="#" className="underline-offset-4 hover:underline">
          Create one
        </a>
      </div>
    </form>
  );
}
