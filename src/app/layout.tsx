import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "OnboardEasy — Client Onboarding for Freelancers",
  description:
    "Proposals, checklists, contracts, invoices & client portal for Indian freelancers & small agencies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} dark`}>
      <body className="min-h-screen antialiased font-sans bg-[var(--bg)] text-[var(--fg)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
