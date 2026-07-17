import type { Metadata } from "next";
import TrophyHype from "@/components/trophy/TrophyHype";

export const metadata: Metadata = {
  title: "Trophy Hype — track every arena, prove every win",
  description:
    "Find races, peaks, angling collections, festivals, and competitions across the full athletic and creative spectrum. Track them, plan them, and earn gamified — provably honest — rewards.",
};

export default function Page() {
  return <TrophyHype />;
}
