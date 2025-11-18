// File: /src/app/(app)/dashboard/page.tsx

import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";

type PowerSource = "grid" | "solar";

interface PowerSnapshot {
  deviceId: string;
  gridUsageKwh: number;
  solarUsageKwh: number;
  currentSource: PowerSource;
}

async function getPowerSnapshot(userId: string): Promise<PowerSnapshot> {
  // TODO: Replace this stub with real data from your DB
  return {
    deviceId: "SW-DEV-00123", // look up the device assigned to this user
    gridUsageKwh: 6.2, // kWh drawn from the grid today
    solarUsageKwh: 3.4, // kWh supplied by solar today
    currentSource: "solar", // decide based on live readings (see notes)
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const snapshot = await getPowerSnapshot(user.id);
  const { deviceId, gridUsageKwh, solarUsageKwh, currentSource } = snapshot;

  const total = gridUsageKwh + solarUsageKwh || 1;
  const solarPercent = Math.round((solarUsageKwh / total) * 100);
  const gridPercent = 100 - solarPercent;

  const isSolar = currentSource === "solar";

  return (
    <div className="min-h-dvh bg-smart-bg px-8 py-6 text-smart-fg">
      {/* Header with device and current source */}
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-smart-dim">Real-time monitoring</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-full border border-smart-border px-4 py-1.5 text-xs text-smart-muted">
            Device ID:{" "}
            <span className="font-mono text-smart-fg">{deviceId}</span>
          </div>

          <div
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold ${
              isSolar
                ? "border-smart-accent/60 bg-smart-accent/15 text-smart-accent"
                : "border-smart-primary/70 bg-smart-primary/20 text-smart-primary"
            }`}
          >
            Current source: {isSolar ? "Solar" : "Grid"}
          </div>
        </div>
      </header>

      {/* Main metrics: grid vs solar */}
      <main className="space-y-6">
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {/* Grid usage */}
          <div className="rounded-2xl border border-smart-border bg-smart-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium text-smart-muted">
                Grid usage
              </h2>
              {/* Simple lightning icon */}
              <span className="text-smart-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </span>
            </div>

            <p className="text-3xl font-semibold">
              {gridUsageKwh.toFixed(1)}{" "}
              <span className="text-base font-normal text-smart-muted">
                kWh
              </span>
            </p>
            <p className="mt-2 text-xs text-smart-dim">
              Energy drawn from the grid today.
            </p>
          </div>

          {/* Solar usage */}
          <div className="rounded-2xl border border-smart-border bg-smart-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium text-smart-muted">
                Solar usage
              </h2>
              {/* Simple sun icon */}
              <span className="text-smart-accent">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                  <path d="m4.93 4.93 1.41 1.41" />
                  <path d="m17.66 17.66 1.41 1.41" />
                  <path d="M2 12h2" />
                  <path d="M20 12h2" />
                  <path d="m6.34 17.66-1.41 1.41" />
                  <path d="m19.07 4.93-1.41 1.41" />
                </svg>
              </span>
            </div>

            <p className="text-3xl font-semibold">
              {solarUsageKwh.toFixed(1)}{" "}
              <span className="text-base font-normal text-smart-muted">
                kWh
              </span>
            </p>
            <p className="mt-2 text-xs text-smart-dim">
              Energy supplied by solar today.
            </p>
          </div>

          {/* Energy mix */}
          <div className="rounded-2xl border border-smart-border bg-smart-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium text-smart-muted">
                Energy mix
              </h2>
            </div>

            <p className="text-3xl font-semibold">
              {(gridUsageKwh + solarUsageKwh).toFixed(1)}{" "}
              <span className="text-base font-normal text-smart-muted">
                kWh
              </span>
            </p>

            <p className="mt-2 text-xs text-smart-dim">
              {solarPercent}% from solar, {gridPercent}% from grid.
            </p>

            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-smart-panel">
              <div
                className="h-full bg-smart-accent"
                style={{ width: `${solarPercent}%` }}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
