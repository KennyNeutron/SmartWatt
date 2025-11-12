"use client";

import { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  subtitleTone?: "muted" | "positive";
  icon?: ReactNode;
  children?: ReactNode; // for progress bar or extra content
};

export default function StatCard({
  title,
  value,
  subtitle,
  subtitleTone = "muted",
  icon,
  children,
}: StatCardProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-4 flex items-start justify-between">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </h3>
        {icon ? (
          <div className="text-gray-400 dark:text-gray-500">{icon}</div>
        ) : null}
      </div>

      <div className="text-3xl font-semibold leading-tight text-gray-900 dark:text-gray-50">
        {value}
      </div>

      {subtitle ? (
        <p
          className={
            subtitleTone === "positive"
              ? "mt-2 text-sm font-medium text-emerald-600"
              : "mt-2 text-sm text-gray-600 dark:text-gray-400"
          }
        >
          {subtitle}
        </p>
      ) : null}

      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}
