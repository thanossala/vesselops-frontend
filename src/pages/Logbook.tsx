import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import api from '../api/client';

interface LogEntry {
  id: string;
  entry_time: string;
  latitude: number;
  longitude: number;
  weather: string;
  sea_state: string;
  speed_kn: number;
  course_deg: number;
  notes: string;
  created_by_email: string;
}

const SEA_STATES = ['calm', 'slight', 'moderate', 'rough', 'very_rough', 'high'];

const SEA_BADGE: Record<string, string> = {
  calm: 'badge-green', slight: 'badge-green', moderate: 'badge-amber',
  rough: 'badge-red', very_rough: 'badge-red', high: 'badge-red',
};

function fmtCoord(n: number, p: string, neg: string) {
  const dir = n >= 0 ? p : neg;
  return `${Math.abs(n).toFixed(4)}° ${dir}`;
}

export default function Logbook() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [vessels, setVessels] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    vessel_id: '', latitude: '', longitude: '',
    weather: '', sea_state: 'calm', speed_kn: '', course_deg: '', notes: '',
  });

  useEffect(() => {
    Promise.all([api.get('/logbook'), api.get('/vessels')])
      .then(([logRes, vesselRes]) => {
        setEntries(logRes.data);
        setVessels(vesselRes.data);
        if (vesselRes.data.length > 0) setForm((f) => ({ ...f, vessel_id: vesselRes.data[0].id }));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/logbook', {
        ...form,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        speed_kn: parseFloat(form.speed_kn),
        course_deg: parseFloat(form.course_deg),
      });
      setEntries([res.data, ...entries]);
      setShowForm(false);
      setForm((f) => ({ ...f, latitude: '', longitude: '', weather: '', speed_kn: '', course_deg: '', notes: '' }));
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="loading"><div className="spinner" />Loading logbook...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Voyage Logbook</div>
          <div style={{ color: 'var(--mist)', fontSize: 13, marginTop: 3 }}>{entries.length} entries</div>
        </div>
        <button onClick={() => setShowForm(!showForm)} className={showForm ? 'btn btn-ghost' : 'btn btn-primary'}>
          {showForm ? '✕ Cancel' : '+ New Entry'}
        </button>
      </div>

      {showForm && (
        <div className="panel">
          <div className="panel-title">
            <span style={{ color: 'var(--signal)' }}>◈</span> New Logbook Entry
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-grid form-grid-2" style={{ gap: 14, marginBottom: 14 }}>
              <div>
                <label>Vessel</label>
                <select value={form.vessel_id} onChange={(e) => setForm({ ...form, vessel_id: e.target.value })}>
                  {vessels.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              <div>
                <label>Sea State</label>
                <select value={form.sea_state} onChange={(e) => setForm({ ...form, sea_state: e.target.value })}>
                  {SEA_STATES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label>Latitude</label>
                <input type="number" step="0.0001" placeholder="37.9742" value={form.latitude}
                  onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
              </div>
              <div>
                <label>Longitude</label>
                <input type="number" step="0.0001" placeholder="23.7162" value={form.longitude}
                  onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
              </div>
              <div>
                <label>Speed (knots)</label>
                <input type="number" step="0.1" placeholder="12.4" value={form.speed_kn}
                  onChange={(e) => setForm({ ...form, speed_kn: e.target.value })} />
              </div>
              <div>
                <label>Course (°)</label>
                <input type="number" step="1" min="0" max="360" placeholder="275" value={form.course_deg}
                  onChange={(e) => setForm({ ...form, course_deg: e.target.value })} />
              </div>
              <div className="form-full">
                <label>Weather Conditions</label>
                <input type="text" placeholder="Clear skies, NE wind 15 kn" value={form.weather}
                  onChange={(e) => setForm({ ...form, weather: e.target.value })} />
              </div>
              <div className="form-full">
                <label>Notes</label>
                <textarea placeholder="Any notable events, observations..." value={form.notes} rows={3}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Saving...' : 'Save Entry'}
            </button>
          </form>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="table-wrap"><div className="empty">
          <div className="empty-icon">📋</div>
          No logbook entries yet. Record your first entry.
        </div></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date / Time</th>
                <th>Position</th>
                <th>Sea State</th>
                <th>Speed</th>
                <th>Course</th>
                <th>Weather</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--fog)', whiteSpace: 'nowrap' }}>
                      {new Date(entry.entry_time).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--mist)', marginTop: 2 }}>
                      {new Date(entry.entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--white)', whiteSpace: 'nowrap' }}>
                      {fmtCoord(entry.latitude, 'N', 'S')}
                    </div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--mist)', marginTop: 2 }}>
                      {fmtCoord(entry.longitude, 'E', 'W')}
                    </div>
                  </td>
                  <td><span className={`badge ${SEA_BADGE[entry.sea_state] || 'badge-muted'}`}>{entry.sea_state?.replace('_', ' ')}</span></td>
                  <td style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--fog)' }}>
                    {entry.speed_kn ? `${entry.speed_kn} kn` : '—'}
                  </td>
                  <td style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--fog)' }}>
                    {entry.course_deg ? `${entry.course_deg}°` : '—'}
                  </td>
                  <td style={{ color: 'var(--mist)', fontSize: 12, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {entry.weather || '—'}
                  </td>
                  <td style={{ color: 'var(--mist)', fontSize: 12, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {entry.notes || '—'}
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
