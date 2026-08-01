"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LeafMark from "@/components/lyfe/LeafMark";

const TABS = [
  { href: "/", label: "Home" },
  { href: "/atlas", label: "Atlas" },
  { href: "/lyfe", label: "Lyfe" },
];

export default function TopNav() {
  const path = usePathname();
  const onLyfe = path.startsWith("/lyfe");

  return (
    <nav className="topnav">
      <span className={`nav-brand${onLyfe ? " on-lyfe" : ""}`}>
        {onLyfe ? <LeafMark size={15} gradId="navLeaf" /> : "✦"} AETHER
      </span>
      <div className="nav-tabs">
        {TABS.map((t) => {
          const active = t.href === "/" ? path === "/" : path.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`nav-tab${active ? " active" : ""}${t.href === "/lyfe" ? " lyfe" : ""}`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
