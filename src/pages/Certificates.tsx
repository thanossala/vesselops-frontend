import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import api from '../api/client';

interface Certificate {
  id: string;
  crew_member_id: string;
  first_name: string;
  last_name: string;
  rank: string;
  cert_type: string;
  cert_number: string;
  issue_date: string;
  expiry_date: string;
  status: string;
}

interface CrewMember {
  id: string;
  first_name: string;
  last_name: string;
  rank: string;
}

const CERT_TYPES = [
  'STCW Basic Safety', 'Medical Certificate', 'GMDSS Certificate',
  'Officer of the Watch', 'Chief Mate Certificate', 'Master Certificate',
  'Dangerous Goods', 'Security Awareness', 'Proficiency in Survival Craft',
];

const STATUS_INFO: Record<string, { badge: string; label: string }> = {
  valid:         { badge: 'badge-green', label: 'Valid' },
  expiring_soon: { badge: 'badge-amber', label: 'Expiring Soon' },
  expired:       { badge: 'badge-red',   label: 'Expired' },
};

export default function Certificates() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [form, setForm] = useState({ crew_member_id: '', cert_type: CERT_TYPES[0], cert_number: '', issue_date: '', expiry_date: '' });

  useEffect(() => {
    Promise.all([api.get('/certificates'), api.get('/crew')])
      .then(([certRes, crewRes]) => {
        setCerts(certRes.data);
        setCrew(crewRes.data);
        if (crewRes.data.length > 0) setForm((f) => ({ ...f, crew_member_id: crewRes.data[0].id }));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/certificates', form);
      const member = crew.find((c) => c.id === form.crew_member_id);
      setCerts([{ ...res.data, first_name: member?.first_name, last_name: member?.last_name, rank: member?.rank }, ...certs]);
      setShowForm(false);
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const filtered = filterStatus === 'all' ? certs : certs.filter((c) => c.status === filterStatus);

  const counts = {
    all: certs.length,
    valid: certs.filter((c) => c.status === 'valid').length,
    expiring_soon: certs.filter((c) => c.status === 'expiring_soon').length,
    expired: certs.filter((c) => c.status === 'expired').length,
  };

  if (loading) return <div className="loading"><div className="spinner" />Loading certificates...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Crew Certificates</div>
          <div style={{ color: 'var(--mist)', fontSize: 13, marginTop: 3 }}>{certs.length} certificates tracked</div>
        </div>
        <button onClick={() => setShowForm(!showForm)} className={showForm ? 'btn btn-ghost' : 'btn btn-primary'}>
          {showForm ? '✕ Cancel' : '+ Add Certificate'}
        </button>
      </div>

      {showForm && (
        <div className="panel">
          <div className="panel-title"><span style={{ color: 'var(--signal)' }}>◈</span> Add Certificate</div>
          <form onSubmit={handleSubmit}>
            <div className="form-grid form-grid-2" style={{ gap: 14, marginBottom: 14 }}>
              <div>
                <label>Crew Member</label>
                <select value={form.crew_member_id} onChange={(e) => setForm({ ...form, crew_member_id: e.target.value })}>
                  {crew.map((c) => <option key={c.id} value={c.id}>{c.first_name} {c.last_name} — {c.rank}</option>)}
                </select>
              </div>
              <div>
                <label>Certificate Type</label>
                <select value={form.cert_type} onChange={(e) => setForm({ ...form, cert_type: e.target.value })}>
                  {CERT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label>Certificate Number</label>
                <input type="text" placeholder="GR-2024-001234" value={form.cert_number}
                  onChange={(e) => setForm({ ...form, cert_number: e.target.value })} />
              </div>
              <div />
              <div>
                <label>Issue Date</label>
                <input type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} />
              </div>
              <div>
                <label>Expiry Date *</label>
                <input type="date" required value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} />
              </div>
            </div>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Saving...' : 'Save Certificate'}
            </button>
          </form>
        </div>
      )}

      <div className="filter-tabs">
        {(['all', 'valid', 'expiring_soon', 'expired'] as const).map((s) => (
          <button key={s} className={`filter-tab ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>
            {s === 'all' ? 'All' : STATUS_INFO[s]?.label}
            <span style={{ marginLeft: 5, opacity: 0.7 }}>({counts[s]})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="table-wrap"><div className="empty">
          <div className="empty-icon">📜</div>
          No certificates found.
        </div></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Crew Member</th>
                <th>Certificate</th>
                <th>Number</th>
                <th>Issued</th>
                <th>Expires</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cert) => (
                <tr key={cert.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--white)', fontSize: 13 }}>
                      {cert.first_name} {cert.last_name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--mist)', marginTop: 2 }}>{cert.rank}</div>
                  </td>
                  <td style={{ color: 'var(--fog)', fontSize: 13 }}>{cert.cert_type}</td>
                  <td>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: cert.cert_number ? 'var(--mist)' : 'transparent' }}>
                      {cert.cert_number || '—'}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--mist)' }}>
                    {cert.issue_date ? new Date(cert.issue_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td style={{ fontSize: 12, color: cert.status === 'expired' ? 'var(--red)' : cert.status === 'expiring_soon' ? 'var(--amber)' : 'var(--fog)' }}>
                    {new Date(cert.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td>
                    <span className={`badge ${STATUS_INFO[cert.status]?.badge || 'badge-muted'}`}>
                      {STATUS_INFO[cert.status]?.label || cert.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
