import { useEffect, useState } from 'react';
import api from '../api/client';

interface CertAlert {
  first_name: string;
  last_name: string;
  rank: string;
  cert_type: string;
  expiry_date: string;
  status: string;
}

interface LogEntry {
  entry_time: string;
  latitude: number;
  longitude: number;
  weather: string;
  sea_state: string;
  speed_kn: number;
}

interface CrewStat {
  status: string;
  count: string;
}

interface DashboardData {
  crew_summary: CrewStat[];
  cert_alerts: CertAlert[];
  recent_logbook: LogEntry[];
}

const SEA_STATE_BADGE: Record<string, string> = {
  calm: 'badge-green', slight: 'badge-green', moderate: 'badge-amber',
  rough: 'badge-red', very_rough: 'badge-red', high: 'badge-red',
};

function fmtDeg(n: number, posDir: string, negDir: string) {
  const dir = n >= 0 ? posDir : negDir;
  return `${Math.abs(n).toFixed(2)}° ${dir}`;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getCrewCount = (status: string) =>
    data?.crew_summary.find((s) => s.status === status)?.count || '0';

  if (loading) return (
    <div className="loading">
      <div className="spinner" />
      Loading operations data...
    </div>
  );

  const stats = [
    { label: 'Active Crew', value: getCrewCount('active'), note: 'on duty' },
    { label: 'On Leave', value: getCrewCount('on_leave'), note: 'away' },
    { label: 'Cert Alerts', value: data?.cert_alerts.length || 0, note: 'require attention', danger: (data?.cert_alerts.length || 0) > 0 },
    { label: 'Logbook Entries', value: data?.recent_logbook.length || 0, note: 'recent' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Operations Dashboard</div>
          <div style={{ color: 'var(--mist)', fontSize: 13, marginTop: 3 }}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 12px',
          background: 'rgba(34,197,94,0.1)',
          border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: 8,
          fontSize: 12, color: '#22c55e', fontWeight: 500,
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
          Systems operational
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {stats.map(({ label, value, note, danger }) => (
          <div key={label} className="stat-card">
            <div className="stat-label">{label}</div>
            <div className={`stat-value ${danger ? 'danger' : ''}`}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--mist)', marginTop: 6 }}>{note}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Certificate Alerts */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, fontFamily: "'Syne', sans-serif" }}>Certificate Alerts</h2>
            {data?.cert_alerts.length ? (
              <span className="badge badge-red">{data.cert_alerts.length} alert{data.cert_alerts.length !== 1 ? 's' : ''}</span>
            ) : (
              <span className="badge badge-green">All clear</span>
            )}
          </div>

          {data?.cert_alerts.length === 0 ? (
            <div style={{ color: 'var(--mist)', fontSize: 13, padding: '12px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'var(--green)', fontSize: 16 }}>✓</span>
              All certificates are valid
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data?.cert_alerts.map((cert, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 12px',
                  background: cert.status === 'expired' ? 'rgba(239,68,68,0.07)' : 'rgba(245,158,11,0.07)',
                  border: `1px solid ${cert.status === 'expired' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)'}`,
                  borderRadius: 8,
                }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13, color: 'var(--white)' }}>
                      {cert.first_name} {cert.last_name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--mist)', marginTop: 2 }}>
                      {cert.cert_type} · {cert.rank}
                    </div>
                  </div>
                  <span className={`badge ${cert.status === 'expired' ? 'badge-red' : 'badge-amber'}`}>
                    {cert.status === 'expired' ? 'Expired' : new Date(cert.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Logbook */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, fontFamily: "'Syne', sans-serif" }}>Recent Logbook</h2>
          </div>

          {data?.recent_logbook.length === 0 ? (
            <div style={{ color: 'var(--mist)', fontSize: 13, padding: '12px 0' }}>
              No logbook entries yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {data?.recent_logbook.map((entry, i) => (
                <div key={i} style={{
                  padding: '12px 0',
                  borderBottom: i < (data.recent_logbook.length - 1) ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--white)', fontWeight: 500 }}>
                      {fmtDeg(entry.latitude, 'N', 'S')} &nbsp; {fmtDeg(entry.longitude, 'E', 'W')}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--mist)' }}>
                      {new Date(entry.entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className={`badge ${SEA_STATE_BADGE[entry.sea_state] || 'badge-muted'}`} style={{ fontSize: 10 }}>
                      {entry.sea_state?.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--mist)' }}>{entry.speed_kn} kn</span>
                    {entry.weather && <span style={{ fontSize: 11, color: 'var(--mist)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.weather}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
