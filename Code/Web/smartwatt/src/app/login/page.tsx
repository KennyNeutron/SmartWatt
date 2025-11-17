// File: /src/app/login/page.tsx

import LoginForm from "@/src/components/LoginForm";
import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";
import Logo from "@/public/logo.jpg";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/home");

  return (
    <div
      className="
        min-h-dvh flex items-center justify-center px-6
        bg-smart-bg text-smart-fg
        bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.35),transparent_55%),_radial-gradient(circle_at_bottom,_rgba(250,204,21,0.25),transparent_55%)]
      "
    >
      <div className="w-full max-w-lg rounded-3xl border border-smart-border bg-smart-surface/95 p-10 shadow-2xl">
        {/* Logo + Brand */}
        <div className="mb-8 flex items-center gap-4">
          <div className="h-14 w-14 overflow-hidden rounded-2xl border border-smart-primary/60 bg-smart-primary/10">
            <img
              src={Logo.src}
              alt="SmartWatt logo"
              className="h-full w-full object-cover"
            />
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">SmartWatt</h1>
            <p className="text-sm text-smart-muted">
              Electricity monitoring &amp; analytics dashboard
            </p>
          </div>
        </div>

        <h2 className="mb-2 text-2xl font-semibold">Sign in</h2>
        <p className="mb-8 text-sm text-smart-dim">
          Use your SmartWatt credentials to access the system.
        </p>

        <LoginForm />
      </div>
    </div>
  );
}
