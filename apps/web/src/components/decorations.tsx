// Decorative olive branches and soft shapes from the designs. Purely visual.

const LEAVES = [
  { x: 30, y: 78, r: -50 },
  { x: 48, y: 60, r: 30 },
  { x: 58, y: 44, r: -40 },
  { x: 76, y: 30, r: 40 },
  { x: 86, y: 16, r: -30 },
];

export function LeafBranch({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <path
        d="M10 112C40 86 70 52 104 6"
        stroke="var(--color-olive-dark)"
        strokeWidth="1.5"
        fill="none"
      />
      {LEAVES.map((leaf) => (
        <ellipse
          key={`${leaf.x}-${leaf.y}`}
          cx={leaf.x}
          cy={leaf.y}
          rx="20"
          ry="6"
          fill="var(--color-olive)"
          opacity="0.85"
          transform={`rotate(${leaf.r} ${leaf.x} ${leaf.y})`}
        />
      ))}
    </svg>
  );
}

/** Branches in two corners of the screen and a soft blob, behind the page content. */
export function PageDecorations() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      <LeafBranch className="absolute -top-2 -right-4 h-32 w-32" />
      <LeafBranch className="absolute -bottom-4 -left-6 h-28 w-28 rotate-180" />
      <div className="absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-blush/70" />
    </div>
  );
}
