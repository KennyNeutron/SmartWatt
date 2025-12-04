"use client";

// File: /src/app/(shell)/power-limiter/page.tsx

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { createClient } from "@/src/lib/supabase/client";

const MIN_LIMIT = 1;
const MAX_LIMIT = 15;

export default function PowerLimiterPage() {
  const [limitInput, setLimitInput] = useState<string>("8");
  const [appliedLimit, setAppliedLimit] = useState<number>(8);

  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [configId, setConfigId] = useState<string | null>(null);

  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDeviceAndConfig() {
      try {
        const supabase = createClient();

        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("Error getting user:", userError.message);
          if (!isMounted) return;
          setErrorMessage("Unable to load user information.");
          return;
        }

        if (!user) {
          if (!isMounted) return;
          setErrorMessage("You are not signed in.");
          return;
        }

        // Get the first device for this user (same logic as home page)
        const { data: device, error: deviceError } = await supabase
          .from("devices")
          .select("id")
          .eq("owner_user_id", user.id)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (deviceError) {
          console.error("Error loading device:", deviceError.message);
          if (!isMounted) return;
          setErrorMessage("Failed to load device information.");
          return;
        }

        if (!device) {
          if (!isMounted) return;
          setErrorMessage("No device found for this account.");
          return;
        }

        if (!isMounted) return;

        setDeviceId(device.id);

        // Load existing device_config for this device, if any
        const { data: configRows, error: configError } = await supabase
          .from("device_config")
          .select("id, daily_limit_kwh, limit_enabled")
          .eq("device_id", device.id)
          .order("updated_at", { ascending: false })
          .limit(1);

        if (configError) {
          console.error("Error loading device_config:", configError.message);
          if (!isMounted) return;
          setErrorMessage("Failed to load power limiter configuration.");
          return;
        }

        if (configRows && configRows.length > 0) {
          const cfg = configRows[0];

          setConfigId(cfg.id);

          const value =
            typeof cfg.daily_limit_kwh === "number"
              ? cfg.daily_limit_kwh
              : appliedLimit;

          const clamped = Math.min(
            MAX_LIMIT,
            Math.max(MIN_LIMIT, value || MIN_LIMIT)
          );

          setAppliedLimit(clamped);
          setLimitInput(clamped.toString());
        } else {
          // No config yet; keep defaults
          setConfigId(null);
          setLimitInput(appliedLimit.toString());
        }
      } finally {
        if (isMounted) {
          setLoadingInitial(false);
        }
      }
    }

    loadDeviceAndConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    // Let the user type freely; validation happens on submit
    setLimitInput(e.target.value);
  }

  async function handleApply(e: FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (!deviceId) {
      setErrorMessage("No device linked to this account. Cannot save limit.");
      return;
    }

    const raw = limitInput.trim().replace(",", ".");

    if (raw === "") {
      setErrorMessage("Please enter a daily limit value.");
      return;
    }

    const parsed = Number(raw);

    if (!Number.isFinite(parsed)) {
      setErrorMessage("Invalid number. Please enter a valid value in kWh.");
      return;
    }

    // Allow decimals, but clamp to min and max
    const clamped = Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, parsed));

    setSaving(true);

    try {
      const supabase = createClient();

      const payload = {
        device_id: deviceId,
        daily_limit_kwh: clamped,
        limit_enabled: true,
      };

      let error = null;

      if (configId) {
        const { error: updateError } = await supabase
          .from("device_config")
          .update(payload)
          .eq("id", configId);
        error = updateError;
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from("device_config")
          .insert(payload)
          .select("id")
          .limit(1);
        error = insertError;

        if (!error && inserted && inserted.length > 0) {
          setConfigId(inserted[0].id);
        }
      }

      if (error) {
        console.error("Error saving device_config:", error.message);
        setErrorMessage("Failed to save daily limit. Please try again.");
        return;
      }

      setAppliedLimit(clamped);
      // Normalize the input string to the saved value (with decimals preserved as needed)
      setLimitInput(clamped.toString());
    } finally {
      setSaving(false);
    }
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
                {MAX_LIMIT} kWh). Decimals are allowed.
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
              type="text"
              inputMode="decimal"
              value={limitInput}
              onChange={handleChange}
              disabled={loadingInitial || saving}
              className="w-full rounded-xl border border-smart-border bg-smart-panel px-4 py-3 text-base text-smart-fg outline-none placeholder:text-smart-dim/80 focus:border-smart-primary focus:ring-1 focus:ring-smart-primary disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Enter daily limit in kWh"
            />
            <div className="mt-1 flex justify-between text-xs text-smart-dim">
              <span>Minimum: {MIN_LIMIT} kWh</span>
              <span>Maximum: {MAX_LIMIT} kWh</span>
            </div>
          </div>

          {errorMessage && (
            <p className="text-sm text-red-400">{errorMessage}</p>
          )}

          <div className="border-t border-smart-border/60 pt-4">
            <button
              type="submit"
              disabled={loadingInitial || saving}
              className="inline-flex items-center gap-2 rounded-xl bg-smart-primary px-5 py-2.5 text-sm font-semibold text-smart-fg shadow-md shadow-smart-primary/40 transition hover:bg-smart-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              <IconCheck />
              <span>{saving ? "Saving..." : "Apply Daily Limit"}</span>
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
            {loadingInitial ? (
              <span>Loading current daily limit...</span>
            ) : (
              <>
                Daily energy consumption limit set to{" "}
                <span className="font-semibold text-smart-fg">
                  {appliedLimit} kWh
                </span>
                . The system will monitor and control your usage accordingly.
              </>
            )}
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