import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "SmartWatt",
  description: "SmartWatt — Energy Limiter",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Set this to true to enable the 404 error page and block all other pages
  const ENABLE_404_MODE = false;

  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {ENABLE_404_MODE ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
              flexDirection: "column",
              fontFamily: "sans-serif",
            }}
          >
            <h1
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                marginBottom: "1rem",
              }}
            >
              404
            </h1>
            <p>This page could not be found.</p>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
