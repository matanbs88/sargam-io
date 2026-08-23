import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const displayFont = localFont({
  src: "../src/assets/fonts/RozhaOne-Regular.ttf",
  variable: "--font-sargam-display",
  weight: "400",
  display: "swap",
});

const sansFont = localFont({
  src: [
    { path: "../src/assets/fonts/Poppins-Regular.ttf", weight: "400", style: "normal" },
    { path: "../src/assets/fonts/Poppins-Medium.ttf", weight: "500", style: "normal" },
    { path: "../src/assets/fonts/Poppins-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../src/assets/fonts/Poppins-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-sargam-sans",
  display: "swap",
});

const devanagariFont = localFont({
  src: "../src/server/export/fonts/NotoSansDevanagari-Regular.ttf",
  variable: "--font-sargam-devanagari",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Sargam.io - Hear it. Play it.",
    template: "%s | Sargam.io",
  },
  description:
    "Turn any song into instant Sargam and relative note notation for keyboard, harmonium, bansuri, and guitar.",
  keywords: [
    "sargam",
    "audio to notes",
    "bansuri fingering",
    "harmonium notes",
    "Indian music",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${sansFont.variable} ${devanagariFont.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
