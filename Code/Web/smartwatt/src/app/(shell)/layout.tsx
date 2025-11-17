import { ReactNode } from "react";
import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/src/components/SideBar";
import SignOutButton from "@/src/components/SignOutButton";
import "@/src/app/globals.css";

export const metadata = {
  title: "SmartWatt • Dashboard",
};

export default async function ShellLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="grid grid-cols-[18rem_1fr]">
        <Sidebar />
        <main className="min-h-dvh p-6">
          <div className="mb-6 flex items-center justify-end">
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-200">
                {user?.email}
              </span>
              <SignOutButton />
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
