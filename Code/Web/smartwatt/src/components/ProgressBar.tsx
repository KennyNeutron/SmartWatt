"use client";

type Props = {
  percent: number; // 0..100
  ariaLabel?: string;
};

export default function ProgressBar({
  percent,
  ariaLabel = "progress",
}: Props) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="w-full rounded-full bg-gray-200 dark:bg-neutral-800">
      <div
        className="h-2 rounded-full bg-gray-900 dark:bg-gray-100"
        style={{ width: `${clamped}%` }}
        role="progressbar"
        aria-label={ariaLabel}
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}
