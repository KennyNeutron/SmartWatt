// File: /src/app/error/page.tsx

"use client";

import Link from "next/link";

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Something went wrong
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        We encountered an error processing your request. The link may be expired
        or invalid.
      </p>
      <Link
        href="/login"
        className="rounded-xl bg-blue-600 px-6 py-3 text-white font-semibold shadow-md hover:bg-blue-700 transition"
      >
        Return to Login
      </Link>
    </div>
  );
}
