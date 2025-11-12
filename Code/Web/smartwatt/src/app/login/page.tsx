import type { Metadata } from "next";
import LoginForm from "@/src/components/LoginForm";

export const metadata: Metadata = {
  title: "Login • SmartWatt",
  description: "Sign in to SmartWatt",
};

export default function LoginPage() {
  return (
    <main className="min-h-dvh grid place-items-center bg-smart-bg text-smart-fg">
      <div className="w-full max-w-sm p-6 rounded-2xl shadow-lg border border-smart-border bg-smart-panel">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">SmartWatt</h1>
          <p className="text-sm text-smart-dim mt-1">Sign in to continue</p>
        </div>
        <LoginForm />
        <p className="mt-6 text-xs text-center text-smart-dim">
          By continuing, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </main>
  );
}
