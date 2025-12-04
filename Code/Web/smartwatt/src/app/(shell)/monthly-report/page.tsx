"use client";

// File: /src/app/(shell)/monthly-report/page.tsx

import { useEffect, useState, type ReactNode } from "react";
import { createClient } from "@/src/lib/supabase/client";

type MonthKey = string;

type MonthlySummary = {
  monthKey: MonthKey;
  label: string;
  totalKwh: number;
  averageDailyKwh: number;
  solarPercent: number;
  gridPercent: number;
  limitBreaches: number;
  estimatedBill: number;
};

type DailyRecord = {
  dateISO: string;
  dateLabel: string;
  gridKwh: number;
  solarKwh: number;
  overLimit: boolean;
};

type MonthDataMap = Record<
  MonthKey,
  {
    summary: MonthlySummary;
    days: DailyRecord[];
  }
>;

const ESTIMATED_RATE_PER_KWH = 13.3;

export default function MonthlyReportPage() {
  const [selectedMonth, setSelectedMonth] = useState<MonthKey | null>(null);
  const [months, setMonths] = useState<{ key: MonthKey; label: string }[]>([]);
  const [monthData, setMonthData] = useState<MonthDataMap>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadMonthlyData() {
      setLoading(true);
      setErrorMessage(null);

      try {
        const supabase = createClient();

        // Current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("Error getting user:", userError.message);
          if (isMounted) setErrorMessage("Unable to load user information.");
          return;
        }

        if (!user) {
          if (isMounted) setErrorMessage("You are not signed in.");
          return;
        }

        // First device owned by this user
        const {
          data: device,
          error: deviceError,
        } = await supabase
          .from("devices")
          .select("id")
          .eq("owner_user_id", user.id)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (deviceError) {
          console.error("Error loading device:", deviceError.message);
          if (isMounted) {
            setErrorMessage("Failed to load device information.");
          }
          return;
        }

        if (!device) {
          if (isMounted) {
            setErrorMessage("No device found for this account.");
          }
          return;
        }

        const deviceId: string = device.id;

        // Current config for this device (daily limit)
        let dailyLimitKwh: number | null = null;
        let limitEnabled = false;

        const {
          data: configRows,
          error: configError,
        } = await supabase
          .from("device_config")
          .select("daily_limit_kwh, limit_enabled")
          .eq("device_id", deviceId)
          .order("updated_at", { ascending: false })
          .limit(1);

        if (configError) {
          console.error("Error loading device_config:", configError.message);
        }

        if (configRows && configRows.length > 0) {
          const cfg = configRows[0] as {
            daily_limit_kwh: number | null;
            limit_enabled: boolean | null;
          };
          if (typeof cfg.daily_limit_kwh === "number") {
            dailyLimitKwh = cfg.daily_limit_kwh;
          }
          limitEnabled = !!cfg.limit_enabled;
        }

        // All readings for this device
        const {
          data: readings,
          error: readingsError,
        } = await supabase
          .from("device_readings")
          .select("grid_kwh, solar_kwh, recorded_at")
          .eq("device_id", deviceId)
          .order("recorded_at", { ascending: true });

        if (readingsError) {
          console.error("Error loading device_readings:", readingsError.message);
          if (isMounted) {
            setErrorMessage("Failed to load device readings.");
          }
          return;
        }

        if (!readings || readings.length === 0) {
          if (isMounted) {
            setMonths([]);
            setMonthData({});
            setSelectedMonth(null);
            setErrorMessage("No readings found yet for this device.");
          }
          return;
        }

        // Aggregate readings by day and month
        // NOTE: grid_kwh and solar_kwh are CUMULATIVE counters that reset on reboot.
        // We must calculate deltas.
        // We also filter out "glitch" resets where the value jumps from 0 back to a high number instantly.

        type DayBucket = { grid: number; solar: number };

        const monthBuckets: Record<
          MonthKey,
          {
            totalGrid: number;
            totalSolar: number;
            totalKwh: number;
            days: Record<string, DayBucket>;
          }
        > = {};

        let prevGrid = 0;
        let prevSolar = 0;
        let prevTime = 0;
        let firstReading = true;

        // Max possible power (kW) to filter out glitches.
        // e.g. if delta is 10kWh in 1 minute, that's 600kW -> impossible for this device.
        // 20kW is a safe upper bound for a home sensor (ACS712 30A @ 230V ~ 7kW).
        const MAX_POWER_KW = 10.0; 

        for (const row of readings as {
          grid_kwh: number | null;
          solar_kwh: number | null;
          recorded_at: string;
        }[]) {
          if (!row.recorded_at) continue;
          const dt = new Date(row.recorded_at);
          const time = dt.getTime();
          if (isNaN(time)) continue;

          const currentGrid = Number(row.grid_kwh ?? 0);
          const currentSolar = Number(row.solar_kwh ?? 0);

          let deltaGrid = 0;
          let deltaSolar = 0;

          if (firstReading) {
            deltaGrid = 0;
            deltaSolar = 0;
            firstReading = false;
          } else {
            // Calculate raw deltas
            let rawDeltaGrid = 0;
            if (currentGrid >= prevGrid) {
              rawDeltaGrid = currentGrid - prevGrid;
            } else {
              // Counter reset
              rawDeltaGrid = currentGrid;
            }

            let rawDeltaSolar = 0;
            if (currentSolar >= prevSolar) {
              rawDeltaSolar = currentSolar - prevSolar;
            } else {
              // Counter reset
              rawDeltaSolar = currentSolar;
            }

            // Sanity check: Calculate implied power
            const timeDiffHours = (time - prevTime) / 3600000.0; // ms to hours
            
            // Avoid division by zero (shouldn't happen if timestamps are unique, but safety first)
            if (timeDiffHours > 0.000001) {
               const impliedGridKw = rawDeltaGrid / timeDiffHours;
               const impliedSolarKw = rawDeltaSolar / timeDiffHours;

               if (impliedGridKw < MAX_POWER_KW) {
                 deltaGrid = rawDeltaGrid;
               } else {
                 // Glitch detected (huge jump), ignore this delta
                 console.warn(`Ignored grid glitch: ${rawDeltaGrid.toFixed(2)} kWh in ${timeDiffHours.toFixed(4)} h (${impliedGridKw.toFixed(1)} kW)`);
                 deltaGrid = 0;
               }

               if (impliedSolarKw < MAX_POWER_KW) {
                 deltaSolar = rawDeltaSolar;
               } else {
                 console.warn(`Ignored solar glitch: ${rawDeltaSolar.toFixed(2)} kWh in ${timeDiffHours.toFixed(4)} h (${impliedSolarKw.toFixed(1)} kW)`);
                 deltaSolar = 0;
               }
            } else {
              // Duplicate timestamp or extremely close? Ignore delta to be safe.
              deltaGrid = 0;
              deltaSolar = 0;
            }
          }

          // Update previous values
          prevGrid = currentGrid;
          prevSolar = currentSolar;
          prevTime = time;

          // Skip if no change
          if (deltaGrid === 0 && deltaSolar === 0) continue;

          const year = dt.getFullYear();
          const month = String(dt.getMonth() + 1).padStart(2, "0");
          const day = String(dt.getDate()).padStart(2, "0");

          const monthKey: MonthKey = `${year}-${month}`;
          const dayKey = `${year}-${month}-${day}`;

          const totalDelta = deltaGrid + deltaSolar;

          if (!monthBuckets[monthKey]) {
            monthBuckets[monthKey] = {
              totalGrid: 0,
              totalSolar: 0,
              totalKwh: 0,
              days: {},
            };
          }

          const monthBucket = monthBuckets[monthKey];
          monthBucket.totalGrid += deltaGrid;
          monthBucket.totalSolar += deltaSolar;
          monthBucket.totalKwh += totalDelta;

          if (!monthBucket.days[dayKey]) {
            monthBucket.days[dayKey] = { grid: 0, solar: 0 };
          }

          monthBucket.days[dayKey].grid += deltaGrid;
          monthBucket.days[dayKey].solar += deltaSolar;
        }

        const newMonthData: MonthDataMap = {};
        const monthKeys = Object.keys(monthBuckets).sort(); // ascending

        for (const monthKey of monthKeys) {
          const bucket = monthBuckets[monthKey];
          const dayEntries = Object.entries(bucket.days).sort((a, b) =>
            a[0].localeCompare(b[0])
          );

          const days: DailyRecord[] = dayEntries.map(([dayKey, values]) => {
            const dateObj = new Date(dayKey);
            const dateLabel = dateObj.toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
            });

            const gridKwh = values.grid;
            const solarKwh = values.solar;
            const total = gridKwh + solarKwh;

            const overLimit =
              limitEnabled &&
              dailyLimitKwh !== null &&
              dailyLimitKwh > 0 &&
              total > dailyLimitKwh;

            return {
              dateISO: dayKey,
              dateLabel,
              gridKwh,
              solarKwh,
              overLimit,
            };
          });

          const totalKwh = bucket.totalKwh;
          const dayCount = days.length || 1;
          const averageDailyKwh = totalKwh / dayCount;

          const solarPercent =
            totalKwh > 0
              ? Math.round((bucket.totalSolar / totalKwh) * 100)
              : 0;
          const gridPercent = 100 - solarPercent;

          const limitBreaches = days.filter((d) => d.overLimit).length;

          const estimatedBill = Math.round(
            totalKwh * ESTIMATED_RATE_PER_KWH
          );

          const [yearStr, monthStr] = monthKey.split("-");
          const labelDate = new Date(
            Number(yearStr),
            Number(monthStr) - 1,
            1
          );
          const label = labelDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          });

          newMonthData[monthKey] = {
            summary: {
              monthKey,
              label,
              totalKwh,
              averageDailyKwh,
              solarPercent,
              gridPercent,
              limitBreaches,
              estimatedBill,
            },
            days,
          };
        }

        const newMonths = monthKeys.map((key) => ({
          key,
          label: newMonthData[key].summary.label,
        }));

        if (isMounted) {
          setMonthData(newMonthData);
          setMonths(newMonths);
          setSelectedMonth((prev) =>
            prev && newMonthData[prev]
              ? prev
              : monthKeys[monthKeys.length - 1] || null
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadMonthlyData();

    return () => {
      isMounted = false;
    };
  }, []);

  const current =
    selectedMonth && monthData[selectedMonth]
      ? monthData[selectedMonth]
      : null;

  const summary = current?.summary ?? null;
  const days = current?.days ?? [];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <header className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-smart-muted">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-smart-border bg-smart-surface">
            <IconReport />
          </span>
          <span>Monthly Report</span>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Monthly Energy Report</h1>
            <p className="text-sm text-smart-dim">
              Review grid and solar usage against your power limiter for the
              selected month. Data is aggregated from your SmartWatt device
              readings in Supabase.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <MonthSelector
              selected={selectedMonth}
              months={months}
              onChange={setSelectedMonth}
            />
            <ExportButtons />
          </div>
        </div>

        {errorMessage && (
          <p className="text-xs text-red-400">{errorMessage}</p>
        )}
      </header>

      {/* Summary cards */}
      <section className="grid gap-5 md:grid-cols-3 xl:grid-cols-4">
        <SummaryCard
          icon={<IconKwh />}
          title="Total consumption"
          value={
            summary ? `${summary.totalKwh.toFixed(1)} kWh` : "0.0 kWh"
          }
          hint={
            summary
              ? `${summary.averageDailyKwh.toFixed(
                  1
                )} kWh per day on average`
              : "No data for this month yet."
          }
        />
        <SummaryCard
          icon={<IconBolt />}
          title="Grid contribution"
          value={summary ? `${summary.gridPercent}%` : "0%"}
          hint={
            summary
              ? `${(
                  summary.totalKwh *
                  (summary.gridPercent / 100)
                ).toFixed(1)} kWh from grid`
              : "No grid data for this month."
          }
        />
        <SummaryCard
          icon={<IconSolar />}
          title="Solar contribution"
          value={summary ? `${summary.solarPercent}%` : "0%"}
          hint={
            summary
              ? `${(
                  summary.totalKwh *
                  (summary.solarPercent / 100)
                ).toFixed(1)} kWh from solar`
              : "No solar data for this month."
          }
        />
        <SummaryCard
          icon={<IconLimit />}
          title="Limit breaches"
          value={summary ? summary.limitBreaches.toString() : "0"}
          hint="Days where usage exceeded your daily limit"
        />
      </section>

      {/* Bill estimate and energy mix */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-smart-border bg-smart-surface p-6 lg:col-span-2">
          <header className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Energy mix this month</h2>
              <p className="text-sm text-smart-dim">
                Proportion of grid versus solar energy for{" "}
                {summary ? summary.label : "the selected month"}.
              </p>
            </div>
          </header>

          <div className="mt-6 space-y-3">
            <div className="flex justify-between text-xs text-smart-dim">
              <span>Solar</span>
              <span>{summary ? summary.solarPercent : 0}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-smart-panel">
              <div
                className="h-full bg-smart-accent"
                style={{
                  width: `${summary ? summary.solarPercent : 0}%`,
                }}
              />
            </div>

            <div className="flex justify-between text-xs text-smart-dim">
              <span>Grid</span>
              <span>{summary ? summary.gridPercent : 0}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-smart-panel">
              <div
                className="h-full bg-smart-primary"
                style={{
                  width: `${summary ? summary.gridPercent : 0}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-smart-border bg-smart-surface p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-smart-panel text-smart-accent">
              <IconBill />
            </span>
            <h2 className="text-base font-semibold">Estimated bill</h2>
          </div>
          <p className="text-3xl font-semibold">
            ₱
            {summary
              ? summary.estimatedBill.toLocaleString("en-PH")
              : "0"}
          </p>
          <p className="mt-2 text-sm text-smart-dim">
            Estimated using a flat rate of ₱
            {ESTIMATED_RATE_PER_KWH.toFixed(2)} per kWh based on your total
            consumption. Adjust the tariff logic in the backend when actual
            utility rates are available.
          </p>
        </div>
      </section>

      {/* Daily breakdown table */}
      <section className="rounded-3xl border border-smart-border bg-smart-surface p-6 md:p-8">
        <header className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Daily breakdown</h2>
            <p className="text-sm text-smart-dim">
              Grid and solar contribution per day, including days over your
              configured limit.
            </p>
          </div>
        </header>

        {loading ? (
          <p className="text-sm text-smart-dim">
            Loading monthly data from Supabase...
          </p>
        ) : days.length === 0 ? (
          <p className="text-sm text-smart-dim">
            No readings available for this month.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-smart-border text-xs text-smart-muted">
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 pr-4">Grid (kWh)</th>
                    <th className="pb-3 pr-4">Solar (kWh)</th>
                    <th className="pb-3 pr-4">Total (kWh)</th>
                    <th className="pb-3 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {days.map((day) => {
                    const total = day.gridKwh + day.solarKwh;
                    return (
                      <tr
                        key={day.dateISO}
                        className="border-b border-smart-border/40 last:border-b-0"
                      >
                        <td className="py-2 pr-4 text-xs text-smart-muted">
                          {day.dateLabel}
                        </td>
                        <td className="py-2 pr-4 text-xs text-smart-fg">
                          {day.gridKwh.toFixed(1)}
                        </td>
                        <td className="py-2 pr-4 text-xs text-smart-fg">
                          {day.solarKwh.toFixed(1)}
                        </td>
                        <td className="py-2 pr-4 text-xs text-smart-fg">
                          {total.toFixed(1)}
                        </td>
                        <td className="py-2 pr-4 text-xs">
                          {day.overLimit ? (
                            <span className="inline-flex items-center rounded-full border border-smart-danger/60 bg-smart-danger/20 px-2 py-0.5 text-[11px] font-medium text-smart-danger">
                              Over daily limit
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full border border-smart-border bg-smart-panel px-2 py-0.5 text-[11px] font-medium text-smart-muted">
                              Within limit
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-xs text-smart-dim">
              Daily totals are computed by summing all readings for each
              calendar day from the{" "}
              <code className="rounded bg-smart-panel px-1 py-0.5 text-[11px]">
                device_readings
              </code>{" "}
              table for your device. Limit breaches are based on the daily limit
              configured in{" "}
              <code className="rounded bg-smart-panel px-1 py-0.5 text-[11px]">
                device_config
              </code>
              .
            </p>
          </>
        )}
      </section>
    </div>
  );
}

/* Reusable UI pieces */

type SummaryCardProps = {
  icon: ReactNode;
  title: string;
  value: string;
  hint: string;
};

function SummaryCard({ icon, title, value, hint }: SummaryCardProps) {
  return (
    <div className="rounded-3xl border border-smart-border bg-smart-surface p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-smart-muted">{title}</h2>
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-smart-panel text-smart-primary">
          {icon}
        </span>
      </div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-smart-dim">{hint}</p>
    </div>
  );
}

type MonthSelectorProps = {
  selected: MonthKey | null;
  months: { key: MonthKey; label: string }[];
  onChange: (key: MonthKey) => void;
};

function MonthSelector({ selected, months, onChange }: MonthSelectorProps) {
  if (months.length === 0) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-smart-border bg-smart-surface px-3 py-1.5 text-xs text-smart-dim">
        <IconCalendar />
        <span>No data yet</span>
      </div>
    );
  }

  const currentValue = selected ?? months[months.length - 1].key;

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-smart-border bg-smart-surface px-3 py-1.5 text-xs text-smart-muted">
      <IconCalendar />
      <select
        className="bg-transparent text-xs outline-none"
        value={currentValue}
        onChange={(e) => onChange(e.target.value)}
      >
        {months.map((opt) => (
          <option key={opt.key} value={opt.key}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ExportButtons() {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-full border border-smart-border bg-smart-surface px-3 py-1.5 text-smart-muted hover:border-smart-primary hover:text-smart-primary"
      >
        <IconDownload />
        <span>Export CSV</span>
      </button>
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-full border border-smart-border bg-smart-surface px-3 py-1.5 text-smart-muted hover:border-smart-primary hover:text-smart-primary"
      >
        <IconDownload />
        <span>Export PDF</span>
      </button>
    </div>
  );
}

/* Icons */

function IconReport() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 3h10a2 2 0 0 1 2 2v14l-4-3-4 3-4-3-4 3V5a2 2 0 0 1 2-2z" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    </svg>
  );
}

function IconKwh() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function IconBolt() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="13 2 3 14 11 14 9 22 21 10 13 10 13 2" />
    </svg>
  );
}

function IconSolar() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
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
  );
}

function IconLimit() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="7" width="18" height="10" rx="5" />
      <circle cx="15" cy="12" r="3" />
    </svg>
  );
}

function IconBill() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 7h6" />
      <path d="M9 11h6" />
      <path d="M9 15h4" />
    </svg>
  );
}
