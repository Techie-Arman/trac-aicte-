import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.example";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TRAC-AICTE — Institutional Grievance Intelligence",
    template: "%s | TRAC-AICTE",
  },
  description:
    "Centralized institutional grievance monitoring, cross-bureau overlap detection, suspected duplicate review, institution resolution, and SLA monitoring.",
  keywords: [
    "AICTE",
    "Grievance Redressal",
    "Institutional Oversight",
    "Compliance Monitoring",
    "Technical Education",
  ],
  authors: [{ name: "TRAC-AICTE Project Team" }],
  openGraph: {
    title: "TRAC-AICTE — Institutional Grievance Intelligence",
    description:
      "Centralized institutional grievance monitoring, cross-bureau overlap detection, suspected duplicate review, institution resolution, and SLA monitoring.",
    url: siteUrl,
    siteName: "TRAC-AICTE",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TRAC-AICTE — Institutional Grievance Intelligence",
    description:
      "Centralized institutional grievance monitoring, cross-bureau overlap detection, and SLA oversight dashboard.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased bg-[#0d0d0f] text-neutral-900`}>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
