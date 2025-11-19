"use client";

// File: /src/app/(shell)/power-limiter/page.tsx

import { useState, ChangeEvent, FormEvent } from "react";

const MIN_LIMIT = 1;
const MAX_LIMIT = 15;

export default function PowerLimiterPage() {
  const [limit, setLimit] = useState<number>(8);
  const [appliedLimit, setAppliedLimit] = useState<number>(8);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const value = Number(e.target.value);
    if (Number.isNaN(value)) {
      setLimit(MIN_LIMIT);
      return;
    }
    const clamped = Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, value));
    setLimit(clamped);
  }

  function handleApply(e: FormEvent) {
    e.preventDefault();
    setAppliedLimit(limit);
    // TODO: Persist appliedLimit to backend (Supabase/device configuration).
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <header className="space-y-1">
        <div className="flex items-center gap-2 text-sm text-smart-muted">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-smart-border bg-smart-surface/70">
            <IconLimiter />
          </span>
          <span>Power Limiter</span>
        </div>
        <h1 className="text-2xl font-semibold">Power Limiter Controls</h1>
        <p className="text-sm text-smart-dim">
          Set your daily energy consumption limit.
        </p>
      </header>

      {/* Main limiter card */}
      <section className="rounded-3xl border border-smart-border bg-smart-surface p-6 md:p-8">
        <form onSubmit={handleApply} className="space-y-6">
          {/* Title row */}
          <div className="flex items-start gap-3">
            <div className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-smart-panel">
              <IconBolt />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Daily Consumption Limit</h2>
              <p className="text-sm text-smart-dim">
                Enter maximum daily energy consumption ({MIN_LIMIT} -{" "}
                {MAX_LIMIT} kWh).
              </p>
            </div>
          </div>

          {/* Input field */}
          <div className="space-y-2">
            <label
              htmlFor="daily-limit"
              className="text-sm font-medium text-smart-muted"
            >
              Daily Limit (kWh)
            </label>
            <input
              id="daily-limit"
              type="number"
              min={MIN_LIMIT}
              max={MAX_LIMIT}
              value={limit}
              onChange={handleChange}
              className="w-full rounded-xl border border-smart-border bg-smart-panel px-4 py-3 text-base text-smart-fg outline-none placeholder:text-smart-dim/80 focus:border-smart-primary focus:ring-1 focus:ring-smart-primary"
              placeholder="Enter daily limit in kWh"
            />
            <div className="mt-1 flex justify-between text-xs text-smart-dim">
              <span>Minimum: {MIN_LIMIT} kWh</span>
              <span>Maximum: {MAX_LIMIT} kWh</span>
            </div>
          </div>

          <div className="border-t border-smart-border/60 pt-4">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-smart-primary px-5 py-2.5 text-sm font-semibold text-smart-fg shadow-md shadow-smart-primary/40 transition hover:bg-smart-accent"
            >
              <IconCheck />
              <span>Apply Daily Limit</span>
            </button>
          </div>
        </form>
      </section>

      {/* Status summary */}
      <section>
        <div className="flex items-start gap-3 rounded-2xl border border-smart-border bg-smart-surface px-4 py-3 text-sm">
          <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-smart-panel text-smart-accent">
            <IconStatus />
          </span>
          <p className="text-smart-muted">
            Daily energy consumption limit set to{" "}
            <span className="font-semibold text-smart-fg">
              {appliedLimit} kWh
            </span>
            . The system will monitor and control your usage accordingly.
          </p>
        </div>
      </section>
    </div>
  );
}

function IconLimiter() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 9h10" />
      <path d="M7 13h5" />
    </svg>
  );
}

function IconBolt() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="13 2 3 14 11 14 9 22 21 10 13 10 13 2" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function IconStatus() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9 12.5l2 2 4-4" />
    </svg>
  );
}
