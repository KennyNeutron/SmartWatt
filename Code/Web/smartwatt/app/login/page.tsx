import type { Metadata } from "next";
import LoginForm from "../../components/LoginForm";

export const metadata: Metadata = {
  title: "Login • SmartWatt",
  description: "Sign in to SmartWatt",
};

export default function LoginPage() {
  return (
    <main className="min-h-dvh grid place-items-center bg-background text-foreground">
      <div className="w-full max-w-sm p-6 rounded-2xl shadow-lg border bg-white/70 dark:bg-black/30 backdrop-blur">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">SmartWatt</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to continue</p>
        </div>
        <LoginForm />
        <p className="mt-6 text-xs text-center text-gray-500">
          By continuing, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </main>
  );
}
