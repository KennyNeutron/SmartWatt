// File: /src/app/(shell)/home/page.tsx

import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";

type PowerSource = "grid" | "solar";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

interface PowerSnapshot {
  deviceId: string;
  gridUsageKwh: number;
  solarUsageKwh: number;
  currentSource: PowerSource;
  voltageV: number;
  currentA: number;
  powerW: number;
  recordedAt: string | null;
}

async function getPowerSnapshot(
  supabase: SupabaseClient,
  userId: string
): Promise<PowerSnapshot> {
  // 1) Find the first device assigned to this user
  const { data: device, error: deviceError } = await supabase
    .from("devices")
    .select("id")
    .eq("owner_user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (deviceError) {
    console.error("Error fetching device:", deviceError.message);
  }

  if (!device) {
    // No device registered yet
    return {
      deviceId: "No device assigned",
      gridUsageKwh: 0,
      solarUsageKwh: 0,
      currentSource: "grid",
      voltageV: 0,
      currentA: 0,
      powerW: 0,
      recordedAt: null,
    };
  }

  // 2) Get the latest device_readings row for this device
  const { data: latestReading, error: readingsError } = await supabase
    .from("device_readings")
    .select(
      "grid_kwh, solar_kwh, current_source, voltage_v, current_a, power_w, recorded_at"
    )
    .eq("device_id", device.id)
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (readingsError) {
    console.error("Error fetching device_readings:", readingsError.message);
  }

  const gridUsageKwh = latestReading
    ? Number(latestReading.grid_kwh ?? 0)
    : 0;
  const solarUsageKwh = latestReading
    ? Number(latestReading.solar_kwh ?? 0)
    : 0;

  const voltageV = latestReading ? Number(latestReading.voltage_v ?? 0) : 0;
  const currentA = latestReading ? Number(latestReading.current_a ?? 0) : 0;
  const powerW = latestReading ? Number(latestReading.power_w ?? 0) : 0;
  const recordedAt: string | null =
    latestReading && typeof latestReading.recorded_at === "string"
      ? latestReading.recorded_at
      : null;

  let currentSource: PowerSource = "grid";
  if (
    latestReading?.current_source === "solar" ||
    latestReading?.current_source === "grid"
  ) {
    currentSource = latestReading.current_source as PowerSource;
  }

  return {
    deviceId: String(device.id),
    gridUsageKwh,
    solarUsageKwh,
    currentSource,
    voltageV,
    currentA,
    powerW,
    recordedAt,
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const snapshot = await getPowerSnapshot(supabase, user.id);
  const {
    deviceId,
    gridUsageKwh,
    solarUsageKwh,
    currentSource,
    voltageV,
    currentA,
    powerW,
    recordedAt,
  } = snapshot;

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
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
              isSolar
                ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-200"
                : "border-amber-400/60 bg-amber-500/10 text-amber-100"
            }`}
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/20">
              {/* Simple icon for source */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {isSolar ? (
                  <>
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="m4.93 4.93 1.41 1.41" />
                    <path d="m17.66 17.66 1.41 1.41" />
                    <path d="M2 12h2" />
                    <path d="M20 12h2" />
                    <path d="m6.34 17.66-1.41 1.41" />
                    <path d="m19.07 4.93-1.41 1.41" />
                  </>
                ) : (
                  <>
                    <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </>
                )}
              </svg>
            </span>
            <span className="font-medium">
              Source: {isSolar ? "Solar" : "Grid"}
            </span>
          </div>
        </div>
      </header>

      <main className="space-y-6">
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {/* Grid usage */}
          <div className="rounded-2xl border border-smart-border bg-smart-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium text-smart-muted">
                Grid usage
              </h2>
              {/* Lightning icon */}
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
              Energy drawn from the grid based on the latest reading.
            </p>
          </div>

          {/* Solar usage */}
          <div className="rounded-2xl border border-smart-border bg-smart-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium text-smart-muted">
                Solar usage
              </h2>
              {/* Sun icon */}
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
              Energy supplied by solar based on the latest reading.
            </p>
          </div>

          {/* Energy mix */}
          <div className="rounded-2xl border border-smart-border bg-smart-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium text-smart-muted">
                Energy mix
              </h2>
            </div>

            <p className="text-sm text-smart-dim">
              Solar is providing{" "}
              <span className="font-semibold text-smart-fg">
                {solarPercent}%
              </span>{" "}
              of your total energy based on the most recent reading.
            </p>

            <div className="mt-4 flex items-center justify-between text-xs text-smart-dim">
              <span>Grid {gridPercent}%</span>
              <span>Solar {solarPercent}%</span>
            </div>

            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-smart-panel">
              <div
                className="h-full bg-smart-accent"
                style={{ width: `${solarPercent}%` }}
              />
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-smart-border bg-smart-surface p-6 md:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium text-smart-muted">
                Latest raw reading
              </h2>
              {recordedAt && (
                <p className="text-xs text-smart-dim">
                  Recorded at{" "}
                  {new Date(recordedAt).toLocaleString()}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3 text-sm">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-smart-dim">
                  Voltage
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {voltageV.toFixed(1)}{" "}
                  <span className="text-xs font-normal text-smart-muted">
                    V
                  </span>
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-smart-dim">
                  Current
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {currentA.toFixed(2)}{" "}
                  <span className="text-xs font-normal text-smart-muted">
                    A
                  </span>
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-smart-dim">
                  Power
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {powerW.toFixed(1)}{" "}
                  <span className="text-xs font-normal text-smart-muted">
                    W
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
