"use client";

// File: /src/app/(shell)/settings/page.tsx

import { useState, useEffect, type FormEvent } from "react";
import { createClient } from "@/src/lib/supabase/client";

export default function SettingsPage() {
  const [deviceLabel, setDeviceLabel] = useState("Main SmartWatt device");
  const [deviceLocation, setDeviceLocation] = useState("Ground floor panel");
  const [ratePerKwh, setRatePerKwh] = useState("12.50"); // Default example rate

  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  // Password change state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        // Get user's device (assuming 1:1 for now based on UI copy)
        const { data: devices, error: deviceError } = await supabase
          .from("devices")
          .select("id, label, location")
          .eq("owner_user_id", user.id)
          .single();

        if (deviceError && deviceError.code !== "PGRST116") {
          console.error("Error fetching device:", deviceError);
        }

        if (devices) {
          setDeviceLabel(devices.label || "");
          setDeviceLocation(devices.location || "");

          // Fetch config for this device
          const { data: config } = await supabase
            .from("device_config")
            .select("rate_per_kwh")
            .eq("device_id", devices.id)
            .single();

          if (config?.rate_per_kwh) {
            setRatePerKwh(config.rate_per_kwh.toString());
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [supabase]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSavedAt(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("No user found");

      // 1. Update/Get Device
      // For simplicity, we assume the device exists. If not, we might need to create it, but that's likely part of onboarding.
      // We'll search for the device first.
      let { data: device } = await supabase
        .from("devices")
        .select("id")
        .eq("owner_user_id", user.id)
        .single();

      if (!device) {
        // Handle case where device doesn't exist?
        // For now, let's assume it exists or we can't save config.
        // Or maybe we just update if it exists.
        console.warn("No device found for user, cannot save settings yet.");
        // Potentially trigger a toast here
      } else {
        // Update device details
        const { error: devError } = await supabase
          .from("devices")
          .update({
            label: deviceLabel,
            location: deviceLocation,
          })
          .eq("id", device.id);

        if (devError) throw devError;

        // Update config
        // Check if config exists
        const { data: existingConfig } = await supabase
          .from("device_config")
          .select("id")
          .eq("device_id", device.id)
          .single();

        if (existingConfig) {
          await supabase
            .from("device_config")
            .update({
              rate_per_kwh: parseFloat(ratePerKwh) || 0,
            })
            .eq("id", existingConfig.id);
        } else {
          // Insert new config
          await supabase.from("device_config").insert({
            device_id: device.id,
            daily_limit_kwh: 0, // Default
            rate_per_kwh: parseFloat(ratePerKwh) || 0,
          });
        }
      }

      setSavedAt(new Date());
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdatePassword(e: FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    setUpdatingPassword(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setUpdatingPassword(false);

    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSuccess("Password updated successfully.");
      setNewPassword("");
      setConfirmPassword("");
    }
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

        {/* Energy Costs */}
        <section className="rounded-3xl border border-smart-border bg-smart-surface p-6 md:p-8 space-y-4">
          <header className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-smart-panel text-smart-accent">
                <IconCurrency />
              </span>
              <h2 className="text-base font-semibold">Energy Costs</h2>
            </div>
            <p className="text-sm text-smart-dim">
              Set your electricity rate to calculate estimated costs.
            </p>
          </header>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="rate-per-kwh"
                className="text-sm font-medium text-smart-muted"
              >
                Rate per kWh
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-smart-dim">
                  ₱
                </span>
                <input
                  id="rate-per-kwh"
                  type="number"
                  step="0.01"
                  min="0"
                  value={ratePerKwh}
                  onChange={(e) => setRatePerKwh(e.target.value)}
                  className="w-full rounded-xl border border-smart-border bg-smart-panel px-4 py-3 pl-8 text-sm text-smart-fg outline-none placeholder:text-smart-dim/80 focus:border-smart-primary focus:ring-1 focus:ring-smart-primary"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-smart-dim">
                This rate will be used to estimate your daily and monthly
                spending.
              </p>
            </div>
          </div>
        </section>

        {/* Security / Change Password */}
        <section className="rounded-3xl border border-smart-border bg-smart-surface p-6 md:p-8 space-y-4">
          <header className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-smart-panel text-smart-danger">
                <IconLock />
              </span>
              <h2 className="text-base font-semibold">Security</h2>
            </div>
            <p className="text-sm text-smart-dim">
              Update your account password to keep your account secure.
            </p>
          </header>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="new-password"
                className="text-sm font-medium text-smart-muted"
              >
                New password
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-smart-border bg-smart-panel px-4 py-3 text-sm text-smart-fg outline-none placeholder:text-smart-dim/80 focus:border-smart-primary focus:ring-1 focus:ring-smart-primary"
                placeholder="Enter new password"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirm-password"
                className="text-sm font-medium text-smart-muted"
              >
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-smart-border bg-smart-panel px-4 py-3 text-sm text-smart-fg outline-none placeholder:text-smart-dim/80 focus:border-smart-primary focus:ring-1 focus:ring-smart-primary"
                placeholder="Confirm new password"
              />
            </div>
          </div>

          {passwordError && (
            <div className="rounded-xl border border-smart-danger/50 bg-smart-danger/15 px-4 py-3 text-sm text-smart-danger">
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div className="rounded-xl border border-green-500/50 bg-green-500/15 px-4 py-3 text-sm text-green-500">
              {passwordSuccess}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleUpdatePassword}
              disabled={updatingPassword}
              className="inline-flex items-center gap-2 rounded-xl bg-smart-panel border border-smart-border px-4 py-2 text-sm font-medium text-smart-fg transition hover:bg-smart-border disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updatingPassword ? "Updating..." : "Update password"}
            </button>
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

function IconLock() {
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
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconCurrency() {
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
      <line x1="12" y1="1" x2="12" y2="23"></line>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
  );
}
