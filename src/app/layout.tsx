import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aether — read the land and the heavens",
  description:
    "A geomancy engine: leylines, sacred and anomalous sites, a synthesized planetary grid, and an autonomous Loom that seeks new patterns against an honest chance baseline.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
