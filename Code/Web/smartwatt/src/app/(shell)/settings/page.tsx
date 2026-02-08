"use client";

// File: /src/app/(shell)/settings/page.tsx

import { useState, type FormEvent } from "react";

type ChartRange = "24h" | "7d" | "30d";

export default function SettingsPage() {
  const [deviceLabel, setDeviceLabel] = useState("Main SmartWatt device");
  const [deviceLocation, setDeviceLocation] = useState("Ground floor panel");

  const [chartRange, setChartRange] = useState<ChartRange>("24h");

  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    // In a real app, persist to Supabase or your API here.
    setTimeout(() => {
      setSaving(false);
      setSavedAt(new Date());
    }, 600);
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <header className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-smart-muted">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-smart-border bg-smart-surface">
            <IconSettings />
          </span>
          <span>Settings</span>
        </div>

        <div>
          <h1 className="text-2xl font-semibold">SmartWatt Settings</h1>
          <p className="text-sm text-smart-dim">
            Configure alerts, device preferences, and dashboard behavior.
          </p>
        </div>
      </header>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Device preferences */}
        <section className="rounded-3xl border border-smart-border bg-smart-surface p-6 md:p-8 space-y-4">
          <header className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-smart-panel text-smart-accent">
                <IconDevice />
              </span>
              <h2 className="text-base font-semibold">Device Preferences</h2>
            </div>
            <p className="text-sm text-smart-dim">
              Customize how your assigned device appears across the dashboard.
            </p>
          </header>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="device-label"
                className="text-sm font-medium text-smart-muted"
              >
                Device label
              </label>
              <input
                id="device-label"
                type="text"
                value={deviceLabel}
                onChange={(e) => setDeviceLabel(e.target.value)}
                className="w-full rounded-xl border border-smart-border bg-smart-panel px-4 py-3 text-sm text-smart-fg outline-none placeholder:text-smart-dim/80 focus:border-smart-primary focus:ring-1 focus:ring-smart-primary"
                placeholder="Example: Apartment main meter"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="device-location"
                className="text-sm font-medium text-smart-muted"
              >
                Location notes
              </label>
              <input
                id="device-location"
                type="text"
                value={deviceLocation}
                onChange={(e) => setDeviceLocation(e.target.value)}
                className="w-full rounded-xl border border-smart-border bg-smart-panel px-4 py-3 text-sm text-smart-fg outline-none placeholder:text-smart-dim/80 focus:border-smart-primary focus:ring-1 focus:ring-smart-primary"
                placeholder="Example: Utility room, first floor"
              />
            </div>
          </div>

          <p className="mt-1 text-xs text-smart-dim">
            Each account is bound to a single SmartWatt device. Labels and
            location help you identify where it is installed.
          </p>
        </section>

        {/* Dashboard preferences */}
        <section className="rounded-3xl border border-smart-border bg-smart-surface p-6 md:p-8 space-y-4">
          <header className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-smart-panel text-smart-primary">
                <IconDisplay />
              </span>
              <h2 className="text-base font-semibold">Dashboard Preferences</h2>
            </div>
            <p className="text-sm text-smart-dim">
              Control how energy data is summarized on the main dashboard.
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Chart range */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-smart-muted">
                Default chart range
              </h3>
              <p className="text-xs text-smart-dim">
                Choose the time window SmartWatt uses when opening the
                dashboard.
              </p>
              <div className="mt-3 inline-flex rounded-full border border-smart-border bg-smart-panel p-1">
                <ChartRangeChip
                  value="24h"
                  label="Last 24 hours"
                  active={chartRange === "24h"}
                  onSelect={setChartRange}
                />
                <ChartRangeChip
                  value="7d"
                  label="Last 7 days"
                  active={chartRange === "7d"}
                  onSelect={setChartRange}
                />
                <ChartRangeChip
                  value="30d"
                  label="Last 30 days"
                  active={chartRange === "30d"}
                  onSelect={setChartRange}
                />
              </div>
            </div>

            {/* Units and theme, mostly informative for now */}
            <div className="space-y-3">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-smart-muted">
                  Energy units
                </h3>
                <p className="text-xs text-smart-dim">
                  SmartWatt currently reports consumption in kilowatt-hours.
                </p>
                <div className="mt-2 inline-flex items-center rounded-full border border-smart-border bg-smart-panel px-3 py-1.5 text-xs text-smart-muted">
                  <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-smart-surface text-smart-primary">
                    kWh
                  </span>
                  <span>Standard unit for energy billing</span>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-medium text-smart-muted">
                  Interface theme
                </h3>
                <p className="text-xs text-smart-dim">
                  SmartWatt uses a focused dark interface for better readability
                  of energy charts.
                </p>
                <div className="mt-2 inline-flex items-center rounded-full border border-smart-border bg-smart-panel px-3 py-1.5 text-xs text-smart-muted">
                  <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-smart-surface text-smart-accent">
                    <IconTheme />
                  </span>
                  <span>SmartWatt Dark (default)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Save bar */}
        <section className="flex flex-wrap items-center justify-between gap-3 border-t border-smart-border pt-4">
          <div className="text-xs text-smart-dim">
            {savedAt ? (
              <span>
                Settings saved at{" "}
                <span className="font-mono text-smart-muted">
                  {savedAt.toLocaleTimeString()}
                </span>
                .
              </span>
            ) : (
              <span>
                Changes are stored per account and apply to this device.
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-smart-primary px-5 py-2.5 text-sm font-semibold text-smart-fg shadow-md shadow-smart-primary/40 transition hover:bg-smart-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save settings"}
          </button>
        </section>
      </form>
    </div>
  );
}

/* Reusable pieces */

type ChartRangeChipProps = {
  value: ChartRange;
  label: string;
  active: boolean;
  onSelect: (value: ChartRange) => void;
};

function ChartRangeChip({
  value,
  label,
  active,
  onSelect,
}: ChartRangeChipProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition ${
        active
          ? "bg-smart-primary text-smart-fg"
          : "text-smart-dim hover:text-smart-muted"
      }`}
    >
      {label}
    </button>
  );
}

/* Icons */

function IconSettings() {
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
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.78 1.78 0 0 0 .35 1.94l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.78 1.78 0 0 0 15 19.4a1.78 1.78 0 0 0-1 .6 1.78 1.78 0 0 0-.45 1.11V22a2 2 0 0 1-4 0v-.09a1.78 1.78 0 0 0-.45-1.11 1.78 1.78 0 0 0-1-.6 1.78 1.78 0 0 0-1.94.35l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.78 1.78 0 0 0 4.6 15a1.78 1.78 0 0 0-.6-1 1.78 1.78 0 0 0-1.11-.45H3a2 2 0 0 1 0-4h.09a1.78 1.78 0 0 0 1.11-.45 1.78 1.78 0 0 0 .6-1 1.78 1.78 0 0 0-.35-1.94l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.78 1.78 0 0 0 9 4.6a1.78 1.78 0 0 0 1-.6 1.78 1.78 0 0 0 .45-1.11V3a2 2 0 0 1 4 0v.09a1.78 1.78 0 0 0 .45 1.11 1.78 1.78 0 0 0 1 .6 1.78 1.78 0 0 0 1.94-.35l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.78 1.78 0 0 0 19.4 9a1.78 1.78 0 0 0 .6 1 1.78 1.78 0 0 0 1.11.45H21a2 2 0 0 1 0 4h-.09a1.78 1.78 0 0 0-1.11.45 1.78 1.78 0 0 0-.6 1z" />
    </svg>
  );
}

function IconDevice() {
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
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M8 20h8" />
      <path d="M12 16v4" />
    </svg>
  );
}

function IconDisplay() {
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
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M7 20h10" />
      <path d="M9 16v4" />
      <path d="M15 16v4" />
    </svg>
  );
}

function IconTheme() {
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
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
