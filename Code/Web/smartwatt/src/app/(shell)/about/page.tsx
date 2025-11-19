// File: /src/app/(shell)/about/page.tsx

export default function AboutPage() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <header className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-smart-muted">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-smart-border bg-smart-surface">
            <IconInfo />
          </span>
          <span>About</span>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">About SmartWatt</h1>
            <p className="text-sm text-smart-dim">
              Smart Energy Limiter System
            </p>
          </div>

          <span className="rounded-full border border-smart-border bg-smart-surface px-4 py-1.5 text-xs font-medium text-smart-muted">
            Version <span className="ml-1 font-mono text-smart-fg">2.1.3</span>
          </span>
        </div>
      </header>

      {/* Project overview */}
      <section className="rounded-3xl border border-smart-border bg-smart-surface p-6 md:p-8">
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-smart-panel text-smart-accent">
            <IconInfo />
          </span>
          <h2 className="text-base font-semibold">Project Overview</h2>
        </div>
        <p className="text-sm leading-relaxed text-smart-muted">
          SmartWatt is a distributed smart energy limiter system designed to
          help households, boarding houses, and small businesses save on
          electricity costs. It uses a network of ESP32 microcontrollers and
          precision sensors to monitor and control multiple outlets, and
          automatically switches the main power source between grid, solar, or
          battery backup when a daily energy limit is reached.
        </p>
      </section>

      {/* Mission and Vision */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Mission */}
        <div className="rounded-3xl border border-smart-border bg-smart-surface p-6 md:p-8">
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-smart-panel text-smart-primary">
              <IconMission />
            </span>
            <h2 className="text-base font-semibold">Our Mission</h2>
          </div>
          <p className="text-sm leading-relaxed text-smart-muted">
            To democratize energy management by providing affordable,
            intelligent solutions that empower individuals and small businesses
            to take control of their electricity consumption, reduce costs, and
            contribute to a more sustainable future through optimized energy
            usage and renewable energy integration.
          </p>
        </div>

        {/* Vision */}
        <div className="rounded-3xl border border-smart-border bg-smart-surface p-6 md:p-8">
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-smart-panel text-smart-accent">
              <IconVision />
            </span>
            <h2 className="text-base font-semibold">Our Vision</h2>
          </div>
          <p className="text-sm leading-relaxed text-smart-muted">
            To become the leading provider of smart energy management systems
            that bridge the gap between traditional power consumption and
            renewable energy sources, creating a world where every household and
            business can efficiently manage their energy usage while maximizing
            savings and minimizing environmental impact.
          </p>
        </div>
      </section>

      {/* Key technical features */}
      <section className="rounded-3xl border border-smart-border bg-smart-surface p-6 md:p-8 space-y-4">
        <header>
          <h2 className="text-base font-semibold">Key Technical Features</h2>
          <p className="text-sm text-smart-dim">
            Advanced technology powering the SmartWatt system
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <FeatureCard
            icon={<IconChip />}
            title="ESP32 Microcontrollers"
            description="Distributed network of powerful microcontrollers."
          />
          <FeatureCard
            icon={<IconSensor />}
            title="Precision Sensors"
            description="Accurate energy monitoring and measurement."
          />
          <FeatureCard
            icon={<IconSwitch />}
            title="Smart Switching"
            description="Automatic power source switching (grid/solar/battery)."
          />
          <FeatureCard
            icon={<IconCloud />}
            title="Secure Cloud Base, Web-Dashboard"
            description="Cloud-based monitoring with secure web dashboard access."
          />
        </div>
      </section>

      {/* Development Team */}
      <section className="rounded-3xl border border-smart-border bg-smart-surface p-6 md:p-8 space-y-4">
        <header>
          <h2 className="text-base font-semibold">Development Team</h2>
          <p className="text-sm text-smart-dim">
            Meet the team behind SmartWatt
          </p>
        </header>

        <div className="space-y-3">
          <TeamMember name="Kristine P. Canja" role="Project Lead" />
          <TeamMember name="Jb A. Binayog" role="Hardware Engineer" />
          <TeamMember
            name="Christian Dominic D. Gallo"
            role="Software Developer"
          />
        </div>
      </section>
    </div>
  );
}

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-smart-border bg-smart-panel p-4">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-smart-surface text-smart-primary">
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-smart-dim">{description}</div>
      </div>
    </div>
  );
}

type TeamMemberProps = {
  name: string;
  role: string;
};

function TeamMember({ name, role }: TeamMemberProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-smart-border bg-smart-panel px-4 py-3">
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-smart-surface text-smart-primary">
        <IconUser />
      </div>
      <div>
        <div className="text-sm font-semibold">{name}</div>
        <div className="text-xs text-smart-dim">{role}</div>
      </div>
    </div>
  );
}

/* Icons */

function IconInfo() {
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
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function IconMission() {
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
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4 12H2" />
      <path d="M22 12h-2" />
    </svg>
  );
}

function IconVision() {
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
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconChip() {
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
      <rect x="7" y="7" width="10" height="10" rx="2" />
      <path d="M4 10h3" />
      <path d="M4 14h3" />
      <path d="M17 10h3" />
      <path d="M17 14h3" />
      <path d="M10 4v3" />
      <path d="M14 4v3" />
      <path d="M10 17v3" />
      <path d="M14 17v3" />
    </svg>
  );
}

function IconSensor() {
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
      <circle cx="12" cy="12" r="3" />
      <path d="M5.5 5.5a8 8 0 0 1 0 11" />
      <path d="M18.5 5.5a8 8 0 0 0 0 11" />
    </svg>
  );
}

function IconSwitch() {
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
      <rect x="3" y="7" width="18" height="10" rx="5" />
      <circle cx="9" cy="12" r="3" />
    </svg>
  );
}

function IconCloud() {
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
      <path d="M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.7-1.4A4 4 0 1 1 19 18H7z" />
    </svg>
  );
}

function IconUser() {
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
      <circle cx="12" cy="8" r="3" />
      <path d="M6 18a6 6 0 0 1 12 0" />
    </svg>
  );
}
