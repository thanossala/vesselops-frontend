// ─────────────────────────────────────────────
//  VesselOps — Vessels.tsx  (updated)
//  Changes vs original:
//    ✓ VesselsSkeleton instead of spinner
//    ✓ Error state with retry (was just console.error)
//    ✓ Table scrolls horizontally on mobile
// ─────────────────────────────────────────────

import { useEffect, useState, useCallback } from 'react';
import api from '../api/client';
import { VesselsSkeleton } from '../components/SkeletonLoader';
import ErrorState from '../components/ErrorState';

interface Vessel {
  id: number;
  name: string;
  imo_number: string | null;
  flag: string | null;
  vessel_type: string | null;
  created_at: string;
}

const VESSEL_TYPES = [
  'Bulk Carrier', 'Container Ship', 'Tanker', 'General Cargo',
  'Ro-Ro', 'Passenger', 'Ferry', 'Tug', 'Offshore Supply', 'Fishing Vessel', 'Other',
];

const TYPE_COLORS: Record<string, string> = {
  'Tanker':           'badge-red',
  'Container Ship':   'badge-blue',
  'Bulk Carrier':     'badge-amber',
  'Passenger':        'badge-green',
  'Ferry':            'badge-green',
};

export default function Vessels() {
  const [vessels, setVessels]     = useState<Vessel[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({ name: '', imo_number: '', flag: '', vessel_type: '' });

  const fetchVessels = useCallback(() => {
    setLoading(true);
    setError('');
    api.get('/vessels')
      .then((res) => setVessels(res.data))
      .catch(() => setError('Could not load fleet registry.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchVessels(); }, [fetchVessels]);

  const openModal  = () => { setForm({ name: '', imo_number: '', flag: '', vessel_type: '' }); setFormError(''); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setFormError(''); };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name.trim()) { setFormError('Vessel name is required.'); return; }
    setSubmitting(true);
    setFormError('');
    try {
      await api.post('/vessels', {
        name:        form.name.trim(),
        imo_number:  form.imo_number.trim() || null,
        flag:        form.flag.trim()        || null,
        vessel_type: form.vessel_type        || null,
      });
      closeModal();
      fetchVessels();
    } catch (err: any) {
      setFormError(err?.response?.data?.error || 'Failed to add vessel.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <VesselsSkeleton />;

  if (error) return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Fleet Registry</div>
        <button onClick={openModal} className="btn btn-primary">+ Add Vessel</button>
      </div>
      <div className="card"><ErrorState message={error} onRetry={fetchVessels} /></div>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Fleet Registry</div>
          <div style={{ color: 'var(--mist)', fontSize: 13, marginTop: 3 }}>
            {vessels.length} vessel{vessels.length !== 1 ? 's' : ''} registered
          </div>
        </div>
        <button onClick={openModal} className="btn btn-primary">+ Add Vessel</button>
      </div>

      {vessels.length === 0 ? (
        <div className="table-wrap"><div className="empty">
          <div className="empty-icon">⚓</div>
          No vessels registered yet. Add your first vessel to begin.
        </div></div>
      ) : (
        <div className="table-wrap" style={{ overflowX: 'auto' }}>
          <table style={{ minWidth: 520 }}>
            <thead>
              <tr>
                <th>Vessel Name</th>
                <th>IMO Number</th>
                <th>Flag State</th>
                <th>Type</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {vessels.map((v) => (
                <tr key={v.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--white)', fontSize: 13 }}>{v.name}</div>
                  </td>
                  <td>
                    <span style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 12,
                      color: v.imo_number ? 'var(--fog)' : 'var(--mist)',
                      opacity: v.imo_number ? 1 : 0.5,
                    }}>
                      {v.imo_number || '—'}
                    </span>
                  </td>
                  <td style={{ color: v.flag ? 'var(--fog)' : 'var(--mist)', opacity: v.flag ? 1 : 0.5 }}>
                    {v.flag || '—'}
                  </td>
                  <td>
                    {v.vessel_type
                      ? <span className={`badge ${TYPE_COLORS[v.vessel_type] || 'badge-muted'}`}>{v.vessel_type}</span>
                      : <span style={{ color: 'var(--mist)', opacity: 0.5 }}>—</span>
                    }
                  </td>
                  <td style={{ color: 'var(--mist)', fontSize: 12 }}>
                    {new Date(v.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Add Vessel</div>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            {formError && <div className="alert-error">{formError}</div>}
            <div className="form-grid">
              <div>
                <label>Vessel name <span style={{ color: 'var(--red)' }}>*</span></label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="MV Atlantic Pioneer" autoFocus />
              </div>
              <div>
                <label>IMO Number</label>
                <input name="imo_number" value={form.imo_number} onChange={handleChange} placeholder="9321483" />
              </div>
              <div className="form-grid form-grid-2">
                <div>
                  <label>Flag State</label>
                  <input name="flag" value={form.flag} onChange={handleChange} placeholder="Panama" />
                </div>
                <div>
                  <label>Vessel Type</label>
                  <select name="vessel_type" value={form.vessel_type} onChange={handleChange}>
                    <option value="">Select type…</option>
                    {VESSEL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={closeModal} className="btn btn-ghost">Cancel</button>
              <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary">
                {submitting ? 'Adding...' : 'Add Vessel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
