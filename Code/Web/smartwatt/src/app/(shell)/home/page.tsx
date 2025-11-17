import StatCard from "@/src/components/StatCard";
import ProgressBar from "@/src/components/ProgressBar";

function IconBolt() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 2L5 14h6l-1 8 7-12h-6l1-8z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}

function IconSun() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function IconBattery() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="2"
        y="7"
        width="18"
        height="10"
        rx="2"
        ry="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="20"
        y="10"
        width="2"
        height="4"
        rx="0.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function IconTrendUp() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 17l6-6 4 4 7-7"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <path d="M14 8h6v6" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

export default function DashboardPage() {
  // Example values to match screenshot
  const currentUsageKWh = 8.5;
  const dailyLimitKWh = 15;
  const solarKWh = 2.1;
  const batteryKWh = 1.8;
  const efficiencyPct = 87;
  const usagePct = (currentUsageKWh / dailyLimitKWh) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
            Dashboard
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Real-time Monitoring
          </p>
        </div>

        <div className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-200">
          Welcome, admin
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {/* Current Usage */}
        <StatCard
          title="Current Usage"
          value={`${currentUsageKWh} kWh`}
          subtitle={`of ${dailyLimitKWh} kWh daily limit`}
          icon={<IconBolt />}
        >
          <ProgressBar
            percent={usagePct}
            ariaLabel="Current usage vs daily limit"
          />
        </StatCard>

        {/* Solar Generation */}
        <StatCard
          title="Solar Generation"
          value={`${solarKWh} kWh`}
          subtitle="Generating power"
          subtitleTone="positive"
          icon={<IconSun />}
        />

        {/* Battery Storage */}
        <StatCard
          title="Battery Storage"
          value={`${batteryKWh} kWh`}
          subtitle="Available backup power"
          icon={<IconBattery />}
        />

        {/* Efficiency */}
        <StatCard
          title="Efficiency"
          value={`${efficiencyPct}%`}
          subtitle="+2% from yesterday"
          subtitleTone="positive"
          icon={<IconTrendUp />}
        />
      </div>
    </div>
  );
}
