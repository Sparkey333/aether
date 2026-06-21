"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Dashboard" },
  { href: "/atlas", label: "Atlas" },
];

export default function TopNav() {
  const path = usePathname();
  return (
    <nav className="topnav">
      <span className="nav-brand">✦ AETHER</span>
      <div className="nav-tabs">
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`nav-tab${path === t.href ? " active" : ""}`}
          >
            {t.label}
          </Link>
        ))}
        {/* The Grove ships as self-contained static HTML under /public/grove,
            so it's a plain anchor, not a Next route. */}
        <a className="nav-tab" href="/grove/index.html">
          Grove
        </a>
      </div>
    </nav>
  );
}
