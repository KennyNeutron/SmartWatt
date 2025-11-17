import LoginForm from "@/src/components/LoginForm";
import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/home");

  return (
    <div className="min-h-dvh grid place-items-center bg-gray-50 dark:bg-neutral-950">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h1 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-50">
          Sign in
        </h1>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Use your email and password.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
