import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
