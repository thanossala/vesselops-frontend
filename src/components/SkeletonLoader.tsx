// ─────────────────────────────────────────────
//  VesselOps — Skeleton Loader Components
//  Drop this file into: src/components/SkeletonLoader.tsx
// ─────────────────────────────────────────────

// ── Base shimmer block ────────────────────────
const Sk = ({
  width = '100%',
  height = 16,
  radius = 6,
  style = {},
}: {
  width?: string | number;
  height?: number;
  radius?: number;
  style?: React.CSSProperties;
}) => (
  <div
    className="sk-shimmer"
    style={{ width, height, borderRadius: radius, flexShrink: 0, ...style }}
  />
);

// ── Dashboard ─────────────────────────────────
export function DashboardSkeleton() {
  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Sk width={200} height={24} />
          <Sk width={160} height={13} />
        </div>
        <Sk width={140} height={32} radius={8} />
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="stat-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Sk width="55%" height={11} />
            <Sk width="40%" height={36} />
            <Sk width="35%" height={11} />
          </div>
        ))}
      </div>

      {/* Two-column cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {Array.from({ length: 2 }).map((_, col) => (
          <div key={col} className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Sk width={140} height={14} />
              <Sk width={70} height={22} radius={20} />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Sk width={120} height={13} />
                  <Sk width={80} height={11} />
                </div>
                <Sk width={60} height={22} radius={20} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Table (used by Crew, Certificates, Logbook, Watches) ─
export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  const colWidths = ['180px', '120px', '100px', '110px', '80px', '90px'];
  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Sk width={180} height={22} />
          <Sk width={110} height={13} />
        </div>
        <Sk width={150} height={36} radius={8} />
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs">
        {Array.from({ length: 4 }).map((_, i) => (
          <Sk key={i} width={i === 0 ? 48 : 90} height={30} radius={20} style={{ display: 'inline-block' }} />
        ))}
      </div>

      {/* Table */}
      <div className="table-wrap">
        {/* thead */}
        <div style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 16, background: 'rgba(10,15,30,0.5)' }}>
          {Array.from({ length: cols }).map((_, i) => (
            <Sk key={i} width={colWidths[i] || 80} height={11} />
          ))}
        </div>
        {/* rows */}
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            style={{
              padding: '13px 16px',
              display: 'flex',
              gap: 16,
              alignItems: 'center',
              borderBottom: r < rows - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            {/* First col: name + subtitle */}
            <div style={{ width: colWidths[0], display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0 }}>
              <Sk width="80%" height={13} />
              <Sk width="55%" height={11} />
            </div>
            {Array.from({ length: cols - 1 }).map((_, c) => (
              <Sk key={c} width={colWidths[c + 1] || 80} height={13} style={{ flexShrink: 0 }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Vessels page ──────────────────────────────
export function VesselsSkeleton() {
  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Sk width={160} height={22} />
          <Sk width={100} height={13} />
        </div>
        <Sk width={140} height={36} radius={8} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Sk width="60%" height={17} />
              <Sk width={60} height={22} radius={20} />
            </div>
            <Sk width="45%" height={13} />
            <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
              <Sk width={80} height={13} />
              <Sk width={80} height={13} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
