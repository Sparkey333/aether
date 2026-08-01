// The leaf — Lyfe's mark. A leaf is the fruit of a seed: the living, visible
// end of a long unseen root system. Emerald, because it is for life.
//
// gradId must be unique per rendered instance (SVG gradient ids are global).

export default function LeafMark({
  size = 30,
  gradId = "lyfeLeaf",
}: {
  size?: number;
  gradId?: string;
}) {
  return (
    <svg className="leaf" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3ee08f" />
          <stop offset="1" stopColor="#0c8a4f" />
        </linearGradient>
      </defs>
      {/* the blade */}
      <path d="M21 3C9 3 3 9 3 21c12 0 18-6 18-18Z" fill={`url(#${gradId})`} />
      {/* the midrib — the trunk's line, mirrored in the leaf */}
      <path
        d="M6.5 17.5C9 12 13 8 18.5 5.5"
        fill="none"
        stroke="#06311e"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.55"
      />
      {/* veins — branches, and their root-mirror below */}
      <path
        d="M10.4 13.6c.3-1.8 1-2.9 2.6-3.9M13 11.1c.2-1.5.7-2.4 2-3.2"
        fill="none"
        stroke="#06311e"
        strokeWidth="0.9"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  );
}
