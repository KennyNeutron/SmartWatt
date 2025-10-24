"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

type Item = {
  href: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
};

function IconHome() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M3 11.5L12 4l9 7.5" />
      <path d="M5 10.5V20h14v-9.5" />
    </svg>
  );
}

function IconBolt() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M13 2L3 14h7l-1 8 11-12h-7l1-8z" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M3 3v18h18" />
      <rect x="6" y="12" width="3" height="6" />
      <rect x="11" y="9" width="3" height="9" />
      <rect x="16" y="6" width="3" height="12" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" />
      <path d="M3 12h2M19 12h2M12 3v2M12 19v2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M5 19l1.5-1.5" />
    </svg>
  );
}

function IconInfo() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8h.01M11 12h2v6h-2z" />
    </svg>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  const items: Item[] = useMemo(
    () => [
      {
        href: "/home",
        title: "Dashboard",
        subtitle: "Real-time Monitoring",
        icon: <IconHome />,
      },
      {
        href: "/power-limiter",
        title: "Power Limiter",
        subtitle: "Set kWh Limits",
        icon: <IconBolt />,
      },
      {
        href: "/monthly-report",
        title: "Monthly Report",
        subtitle: "Consumption Analysis",
        icon: <IconChart />,
      },
      {
        href: "/settings",
        title: "Settings",
        subtitle: "Account & System",
        icon: <IconSettings />,
      },
      {
        href: "/about",
        title: "About",
        subtitle: "Project Information",
        icon: <IconInfo />,
      },
    ],
    []
  );

  return (
    <aside className="h-dvh w-72 border-r bg-white/80 dark:bg-zinc-950/70 backdrop-blur sticky top-0">
      <div className="px-4 py-5 flex items-center gap-3">
        <div className="size-9 rounded-xl grid place-items-center border">
          <svg
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M9 18h6M10 21h4M6 10a6 6 0 1 1 12 0c0 2.5-1.5 3.5-2.5 5-.5.8-.5 1-.5 2h-4c0-1 0-1.2-.5-2-1-1.5-2.5-2.5-2.5-5z" />
          </svg>
        </div>
        <div className="leading-tight">
          <div className="font-semibold">SmartWatt</div>
          <div className="text-xs text-gray-500">Energy Limiter</div>
        </div>
      </div>

      <div className="px-4">
        <div className="text-xs uppercase tracking-wide text-gray-500 mb-3">
          Navigation
        </div>
        <nav className="space-y-1">
          {items.map((it) => {
            const active = pathname === it.href;
            return (
              <Link
                key={it.href}
                href={it.href}
                className={[
                  "group block rounded-xl border px-3 py-2",
                  active
                    ? "border-black/15 bg-black/5 dark:bg-white/5"
                    : "border-transparent hover:bg-black/5 dark:hover:bg-white/5",
                ].join(" ")}
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-700 dark:text-gray-200">
                    {it.icon}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{it.title}</div>
                    <div className="text-xs text-gray-500">{it.subtitle}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
