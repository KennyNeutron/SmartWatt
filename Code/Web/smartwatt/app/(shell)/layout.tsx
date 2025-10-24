import type { Metadata } from "next";
import Sidebar from "@/components/SideBar";

export const metadata: Metadata = {
  title: "SmartWatt • Dashboard",
};

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="grid grid-cols-[18rem_1fr]">
        <Sidebar />
        <main className="min-h-dvh p-6">{children}</main>
      </div>
    </div>
  );
}
