// ─────────────────────────────────────────────
//  VesselOps — Watches.tsx  (updated)
//  Changes vs original:
//    ✓ TableSkeleton instead of spinner
//    ✓ Error state with retry (was just console.error)
//    ✓ Replaced alert() with inline error message in form
//    ✓ Table scrolls horizontally on mobile
//    ✓ useCallback on fetch to allow retry
// ─────────────────────────────────────────────

import { useEffect, useState, useCallback } from 'react';
import type { FormEvent } from 'react';
import api from '../api/client';
import { TableSkeleton } from '../components/SkeletonLoader';
import ErrorState from '../components/ErrorState';

interface Watch {
  id: string;
  crew_member_id: string;
  first_name: string;
  last_name: string;
  rank: string;
  watch_type: string;
  start_time: string;
  end_time: string;
  schedule_date: string;
}

interface CrewMember { id: string; first_name: string; last_name: string; rank: string; }

const WATCH_BADGE: Record<string, string> = {
  bridge: 'badge-blue',
  engine: 'badge-amber',
  deck:   'badge-green',
};

const today = new Date().toISOString().split('T')[0];

function calcDuration(start: string, end: string) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let diff = (eh * 60 + em) - (sh * 60 + sm);
  if (diff < 0) diff += 24 * 60;
  return `${Math.floor(diff / 60)}h${diff % 60 > 0 ? ` ${diff % 60}m` : ''}`;
}

export default function Watches() {
  const [watches, setWatches]     = useState<Watch[]>([]);
  const [crew, setCrew]           = useState<CrewMember[]>([]);
  const [vessels, setVessels]     = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [showForm, setShowForm]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [selectedDate, setSelectedDate] = useState(today);
  const [form, setForm] = useState({
    vessel_id: '', crew_member_id: '', watch_type: 'bridge',
    start_time: '00:00', end_time: '04:00', schedule_date: today,
  });

  const fetchAll = useCallback((date: string) => {
    setLoading(true);
    setError('');
    Promise.all([
      api.get(`/watches?date=${date}`),
      api.get('/crew'),
      api.get('/vessels'),
    ])
      .then(([watchRes, crewRes, vesselRes]) => {
        setWatches(watchRes.data);
        setCrew(crewRes.data);
        setVessels(vesselRes.data);
        if (crewRes.data.length > 0)   setForm((f) => ({ ...f, crew_member_id: crewRes.data[0].id }));
        if (vesselRes.data.length > 0) setForm((f) => ({ ...f, vessel_id: vesselRes.data[0].id }));
      })
      .catch(() => setError('Could not load watch schedule.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAll(selectedDate); }, [fetchAll, selectedDate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);
    try {
      const res = await api.post('/watches', form);
      const member = crew.find((c) => c.id === form.crew_member_id);
      setWatches([...watches, {
        ...res.data,
        first_name: member?.first_name,
        last_name:  member?.last_name,
        rank:       member?.rank,
      }]);
      setShowForm(false);
    } catch (err: any) {
      // Was alert() — now shows inline error in the form
      setSubmitError(err.response?.data?.error || 'Failed to save watch.');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/watches/${id}`);
      setWatches(watches.filter((w) => w.id !== id));
    } catch (err) { console.error(err); }
  };

  if (loading) return <TableSkeleton rows={4} cols={5} />;

  if (error) return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Watch Schedules</div>
      </div>
      <div className="card">
        <ErrorState message={error} onRetry={() => fetchAll(selectedDate)} />
      </div>
    </div>
  );

  const sorted = [...watches].sort((a, b) => a.start_time.localeCompare(b.start_time));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Watch Schedules</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
            <label style={{ textTransform: 'none', fontSize: 13, color: 'var(--mist)', letterSpacing: 0 }}>Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ width: 'auto', fontSize: 13, padding: '5px 10px' }}
            />
            <span style={{ fontSize: 13, color: 'var(--mist)' }}>{watches.length} watches scheduled</span>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setSubmitError(''); }}
          className={showForm ? 'btn btn-ghost' : 'btn btn-primary'}
        >
          {showForm ? '✕ Cancel' : '+ Add Watch'}
        </button>
      </div>

      {showForm && (
        <div className="panel">
          <div className="panel-title"><span style={{ color: 'var(--signal)' }}>◈</span> Schedule Watch</div>
          {submitError && <div className="alert-error" style={{ marginBottom: 14 }}>{submitError}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-grid form-grid-3" style={{ gap: 14, marginBottom: 14 }}>
              <div>
                <label>Vessel</label>
                <select value={form.vessel_id} onChange={(e) => setForm({ ...form, vessel_id: e.target.value })}>
                  {vessels.length === 0
                    ? <option>No vessels found</option>
                    : vessels.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)
                  }
                </select>
              </div>
              <div>
                <label>Crew Member</label>
                <select value={form.crew_member_id} onChange={(e) => setForm({ ...form, crew_member_id: e.target.value })}>
                  {crew.length === 0
                    ? <option>No crew found</option>
                    : crew.map((c) => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)
                  }
                </select>
              </div>
              <div>
                <label>Watch Type</label>
                <select value={form.watch_type} onChange={(e) => setForm({ ...form, watch_type: e.target.value })}>
                  <option value="bridge">Bridge</option>
                  <option value="engine">Engine</option>
                  <option value="deck">Deck</option>
                </select>
              </div>
              <div>
                <label>Date</label>
                <input type="date" value={form.schedule_date} onChange={(e) => setForm({ ...form, schedule_date: e.target.value })} />
              </div>
              <div>
                <label>Start Time</label>
                <input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
              </div>
              <div>
                <label>End Time</label>
                <input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
              </div>
            </div>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Saving...' : 'Save Watch'}
            </button>
          </form>
        </div>
      )}

      {watches.length === 0 ? (
        <div className="table-wrap"><div className="empty">
          <div className="empty-icon">🕐</div>
          No watches scheduled for this date.
        </div></div>
      ) : (
        <div className="table-wrap" style={{ overflowX: 'auto' }}>
          <table style={{ minWidth: 520 }}>
            <thead>
              <tr>
                <th>Crew Member</th>
                <th>Watch Type</th>
                <th>Start</th>
                <th>End</th>
                <th>Duration</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((watch) => (
                <tr key={watch.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--white)', fontSize: 13 }}>
                      {watch.first_name} {watch.last_name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--mist)', marginTop: 2 }}>{watch.rank}</div>
                  </td>
                  <td>
                    <span className={`badge ${WATCH_BADGE[watch.watch_type] || 'badge-muted'}`} style={{ textTransform: 'capitalize' }}>
                      {watch.watch_type}
                    </span>
                  </td>
                  <td style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: 'var(--fog)' }}>
                    {watch.start_time.slice(0, 5)}
                  </td>
                  <td style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: 'var(--fog)' }}>
                    {watch.end_time.slice(0, 5)}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--mist)' }}>
                    {calcDuration(watch.start_time, watch.end_time)}
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(watch.id)}
                      className="btn btn-danger"
                      style={{ padding: '4px 12px', fontSize: 12 }}
                    >
                      Remove
                    </button>
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
