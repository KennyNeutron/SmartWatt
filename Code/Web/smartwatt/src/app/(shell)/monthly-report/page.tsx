"use client";

// File: /src/app/(shell)/monthly-report/page.tsx

import { useState, type ReactNode } from "react";

type MonthKey = "2025-01" | "2025-02" | "2025-03";

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
  dateLabel: string;
  gridKwh: number;
  solarKwh: number;
  overLimit: boolean;
};

const MONTHLY_DATA: Record<
  MonthKey,
  { summary: MonthlySummary; days: DailyRecord[] }
> = {
  "2025-01": {
    summary: {
      monthKey: "2025-01",
      label: "January 2025",
      totalKwh: 214.3,
      averageDailyKwh: 6.9,
      solarPercent: 38,
      gridPercent: 62,
      limitBreaches: 3,
      estimatedBill: 2850,
    },
    days: [
      { dateLabel: "Jan 01", gridKwh: 7.5, solarKwh: 3.2, overLimit: false },
      { dateLabel: "Jan 02", gridKwh: 8.1, solarKwh: 2.4, overLimit: true },
      { dateLabel: "Jan 03", gridKwh: 5.9, solarKwh: 3.9, overLimit: false },
      { dateLabel: "Jan 04", gridKwh: 6.2, solarKwh: 4.1, overLimit: false },
      { dateLabel: "Jan 05", gridKwh: 9.3, solarKwh: 1.8, overLimit: true },
      { dateLabel: "Jan 06", gridKwh: 7.0, solarKwh: 3.5, overLimit: false },
      { dateLabel: "Jan 07", gridKwh: 8.6, solarKwh: 2.0, overLimit: true },
    ],
  },
  "2025-02": {
    summary: {
      monthKey: "2025-02",
      label: "February 2025",
      totalKwh: 197.8,
      averageDailyKwh: 7.1,
      solarPercent: 42,
      gridPercent: 58,
      limitBreaches: 2,
      estimatedBill: 2680,
    },
    days: [
      { dateLabel: "Feb 01", gridKwh: 6.8, solarKwh: 3.9, overLimit: false },
      { dateLabel: "Feb 02", gridKwh: 7.1, solarKwh: 4.2, overLimit: false },
      { dateLabel: "Feb 03", gridKwh: 8.0, solarKwh: 2.3, overLimit: true },
      { dateLabel: "Feb 04", gridKwh: 6.5, solarKwh: 4.0, overLimit: false },
      { dateLabel: "Feb 05", gridKwh: 7.2, solarKwh: 3.6, overLimit: false },
    ],
  },
  "2025-03": {
    summary: {
      monthKey: "2025-03",
      label: "March 2025",
      totalKwh: 225.5,
      averageDailyKwh: 7.3,
      solarPercent: 35,
      gridPercent: 65,
      limitBreaches: 4,
      estimatedBill: 2995,
    },
    days: [
      { dateLabel: "Mar 01", gridKwh: 8.4, solarKwh: 2.7, overLimit: false },
      { dateLabel: "Mar 02", gridKwh: 9.1, solarKwh: 1.9, overLimit: true },
      { dateLabel: "Mar 03", gridKwh: 7.6, solarKwh: 3.1, overLimit: false },
      { dateLabel: "Mar 04", gridKwh: 6.9, solarKwh: 3.8, overLimit: false },
      { dateLabel: "Mar 05", gridKwh: 8.8, solarKwh: 2.2, overLimit: true },
    ],
  },
};

export default function MonthlyReportPage() {
  const [selectedMonth, setSelectedMonth] = useState<MonthKey>("2025-01");

  const current = MONTHLY_DATA[selectedMonth];
  const summary = current.summary;
  const days = current.days;

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
              selected month.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <MonthSelector
              selected={selectedMonth}
              onChange={setSelectedMonth}
            />
            <ExportButtons />
          </div>
        </div>
      </header>

      {/* Summary cards */}
      <section className="grid gap-5 md:grid-cols-3 xl:grid-cols-4">
        <SummaryCard
          icon={<IconKwh />}
          title="Total consumption"
          value={`${summary.totalKwh.toFixed(1)} kWh`}
          hint={`${summary.averageDailyKwh.toFixed(1)} kWh per day on average`}
        />
        <SummaryCard
          icon={<IconBolt />}
          title="Grid contribution"
          value={`${summary.gridPercent}%`}
          hint={`${(summary.totalKwh * (summary.gridPercent / 100)).toFixed(
            1
          )} kWh from grid`}
        />
        <SummaryCard
          icon={<IconSolar />}
          title="Solar contribution"
          value={`${summary.solarPercent}%`}
          hint={`${(summary.totalKwh * (summary.solarPercent / 100)).toFixed(
            1
          )} kWh from solar`}
        />
        <SummaryCard
          icon={<IconLimit />}
          title="Limit breaches"
          value={summary.limitBreaches.toString()}
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
                Proportion of grid versus solar energy for {summary.label}.
              </p>
            </div>
          </header>

          <div className="mt-6 space-y-3">
            <div className="flex justify-between text-xs text-smart-dim">
              <span>Solar</span>
              <span>{summary.solarPercent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-smart-panel">
              <div
                className="h-full bg-smart-accent"
                style={{ width: `${summary.solarPercent}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-smart-dim">
              <span>Grid</span>
              <span>{summary.gridPercent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-smart-panel">
              <div
                className="h-full bg-smart-primary"
                style={{ width: `${summary.gridPercent}%` }}
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
            ₱{summary.estimatedBill.toLocaleString("en-PH")}
          </p>
          <p className="mt-2 text-sm text-smart-dim">
            Estimated based on your total kWh for {summary.label}. Adjust the
            rate and billing logic later in the backend once actual tariff data
            is available.
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
                    key={day.dateLabel}
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
          Note: Data shown here is sample data for UI wiring. Connect this table
          to your actual measurement logs in the database when the schema is
          ready.
        </p>
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
  selected: MonthKey;
  onChange: (key: MonthKey) => void;
};

function MonthSelector({ selected, onChange }: MonthSelectorProps) {
  const options: { key: MonthKey; label: string }[] = [
    { key: "2025-01", label: "Jan 2025" },
    { key: "2025-02", label: "Feb 2025" },
    { key: "2025-03", label: "Mar 2025" },
  ];

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-smart-border bg-smart-surface px-3 py-1.5 text-xs text-smart-muted">
      <IconCalendar />
      <select
        className="bg-transparent text-xs outline-none"
        value={selected}
        onChange={(e) => onChange(e.target.value as MonthKey)}
      >
        {options.map((opt) => (
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
      <polyline points="13 2 3 14 12 14 11 22 21 10 13 10 13 2" />
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
