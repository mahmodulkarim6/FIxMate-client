import type { Metadata, Viewport } from "next";
import {
  Bricolage_Grotesque,
  Caveat,
  Geist,
  Geist_Mono,
} from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
});

const hand = Caveat({
  subsets: ["latin"],
  variable: "--font-hand",
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "FixMate — Verified device & home appliance repair",
    template: "%s · FixMate",
  },
  description:
    "FixMate connects you with verified technicians for smartphones, laptops, ACs, refrigerators, TVs, washing machines and electrical work. Book a repair, track every step, and pay only after the job is done.",
  keywords: [
    "repair service",
    "technician",
    "appliance repair",
    "Dhaka",
    "FixMate",
  ],
  openGraph: {
    title: "FixMate — Repairs, minus the guesswork",
    description:
      "Verified technicians. Trackable jobs. Pay only after the repair is completed.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f2" },
    { media: "(prefers-color-scheme: dark)", color: "#132124" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable,
        display.variable,
        hand.variable
      )}
    >
      <body>
        <ThemeProvider>
          <TooltipProvider>
            {children}
            <Toaster position="top-right" richColors closeButton />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
