import type { Metadata } from "next";
import {
  Instrument_Serif,
  Noto_Sans_Devanagari,
  Plus_Jakarta_Sans,
} from "next/font/google";
import "./globals.css";

const displayFont = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-sargam-display",
  weight: "400",
});

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sargam-sans",
});

const devanagariFont = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-sargam-devanagari",
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
