import type { Metadata } from "next";
import Link from "next/link";
import { ScanLine } from "lucide-react";
import "./globals.css";
export const metadata: Metadata = {
  title: "ResultTrace — Follow the evidence",
  description:
    "An independent, local-first tool for comparing human-reviewed polling-unit result documents.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <header className="site-header">
          <Link href="/" className="brand">
            <span className="brand-icon">
              <ScanLine size={23} />
            </span>
            Result<span>Trace</span>
          </Link>
          <nav aria-label="Main navigation">
            <Link href="/comparisons">Saved comparisons</Link>
            <Link href="/about">Methodology</Link>
            <Link className="button small" href="/compare/new">
              New comparison <span aria-hidden>↗</span>
            </Link>
          </nav>
        </header>
        <main id="main">{children}</main>
        <footer>
          <span>
            ResultTrace{" "}
            <span className="muted">
              / Independent observation, informed by evidence.
            </span>
          </span>
          <span>Built for Every Vote, Every Voice · TEAM-17-3.0</span>
        </footer>
      </body>
    </html>
  );
}
