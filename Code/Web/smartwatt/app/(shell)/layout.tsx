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
    <div className="min-h-dvh bg-smart-bg text-smart-fg">
      <div className="grid [grid-template-columns:18rem_1fr]">
        <Sidebar />
        <main className="min-h-dvh p-6 bg-smart-surface">{children}</main>
      </div>
    </div>
  );
}
