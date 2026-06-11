// ─────────────────────────────────────────────
//  VesselOps — Crew.tsx  (updated)
//  Changes vs original:
//    ✓ TableSkeleton instead of spinner
//    ✓ Error state with retry
//    ✓ Table scrolls horizontally on mobile
// ─────────────────────────────────────────────

import { useEffect, useState, useCallback } from 'react';
import api from '../api/client';
import { TableSkeleton } from '../components/SkeletonLoader';
import ErrorState from '../components/ErrorState';

interface CrewMember {
  id: string;
  first_name: string;
  last_name: string;
  rank: string;
  nationality: string;
  status: string;
  contract_start: string;
  contract_end: string;
}

const RANKS = [
  'Captain', 'Chief Officer', 'Second Officer', 'Third Officer',
  'Chief Engineer', 'Second Engineer', 'Third Engineer', 'Fourth Engineer',
  'Bosun', 'AB Seaman', 'OS Seaman', 'Cook', 'Steward', 'Electrician',
];

const STATUS_BADGE: Record<string, string> = {
  active: 'badge-green',
  on_leave: 'badge-amber',
  off_signed: 'badge-muted',
};

const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  on_leave: 'On Leave',
  off_signed: 'Off Signed',
};

const emptyForm = {
  vessel_id: '', first_name: '', last_name: '', rank: '',
  nationality: '', contract_start: '', contract_end: '',
};

export default function Crew() {
  const [crew, setCrew]           = useState<CrewMember[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchCrew = useCallback(() => {
    setLoading(true);
    setError('');
    api.get('/crew')
      .then((res) => setCrew(res.data))
      .catch(() => setError('Could not load crew roster.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchCrew(); }, [fetchCrew]);

  const openModal  = () => { setForm(emptyForm); setFormError(''); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setFormError(''); };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.first_name.trim() || !form.last_name.trim() || !form.rank) {
      setFormError('First name, last name and rank are required.');
      return;
    }
    let vessel_id = form.vessel_id;
    if (!vessel_id) {
      try {
        const vessels = await api.get('/vessels');
        if (vessels.data.length === 0) { setFormError('No vessels found. Please add a vessel first.'); return; }
        vessel_id = vessels.data[0].id;
      } catch { setFormError('Could not fetch vessels.'); return; }
    }
    setSubmitting(true);
    try {
      await api.post('/crew', { ...form, vessel_id });
      closeModal();
      fetchCrew();
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to add crew member.');
    } finally { setSubmitting(false); }
  };

  const filtered = filterStatus === 'all' ? crew : crew.filter((m) => m.status === filterStatus);

  const contractDaysLeft = (end: string) => {
    if (!end) return null;
    return Math.ceil((new Date(end).getTime() - Date.now()) / 86400000);
  };

  if (loading) return <TableSkeleton rows={6} cols={5} />;

  if (error) return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Crew Roster</div>
        <button onClick={openModal} className="btn btn-primary">+ Add Crew Member</button>
      </div>
      <div className="card"><ErrorState message={error} onRetry={fetchCrew} /></div>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Crew Roster</div>
          <div style={{ color: 'var(--mist)', fontSize: 13, marginTop: 3 }}>{crew.length} crew members</div>
        </div>
        <button onClick={openModal} className="btn btn-primary">+ Add Crew Member</button>
      </div>

      <div className="filter-tabs">
        {['all', 'active', 'on_leave', 'off_signed'].map((s) => (
          <button key={s} className={`filter-tab ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>
            {s === 'all' ? 'All' : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="table-wrap"><div className="empty">
          <div className="empty-icon">👤</div>
          {filterStatus === 'all' ? 'No crew members yet.' : `No crew with status "${STATUS_LABEL[filterStatus]}".`}
        </div></div>
      ) : (
        /* overflow-x: auto makes the table scroll on small screens */
        <div className="table-wrap" style={{ overflowX: 'auto' }}>
          <table style={{ minWidth: 560 }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Rank</th>
                <th>Nationality</th>
                <th>Contract Ends</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((member) => {
                const days = contractDaysLeft(member.contract_end);
                return (
                  <tr key={member.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--white)', fontSize: 13 }}>
                        {member.first_name} {member.last_name}
                      </div>
                    </td>
                    <td style={{ color: 'var(--fog)' }}>{member.rank}</td>
                    <td style={{ color: member.nationality ? 'var(--fog)' : 'var(--mist)' }}>
                      {member.nationality || '—'}
                    </td>
                    <td>
                      {member.contract_end ? (
                        <div>
                          <div style={{ fontSize: 12, color: days !== null && days < 30 ? 'var(--amber)' : 'var(--fog)' }}>
                            {new Date(member.contract_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                          {days !== null && days < 30 && days > 0 && (
                            <div style={{ fontSize: 10, color: 'var(--amber)', marginTop: 2 }}>{days}d remaining</div>
                          )}
                          {days !== null && days <= 0 && (
                            <div style={{ fontSize: 10, color: 'var(--red)', marginTop: 2 }}>Expired</div>
                          )}
                        </div>
                      ) : <span style={{ color: 'var(--mist)' }}>—</span>}
                    </td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[member.status] || 'badge-muted'}`}>
                        {STATUS_LABEL[member.status] || member.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Add Crew Member</div>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            {formError && <div className="alert-error">{formError}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-grid form-grid-2">
                  <div>
                    <label>First name *</label>
                    <input name="first_name" value={form.first_name} onChange={handleChange} required placeholder="John" autoFocus />
                  </div>
                  <div>
                    <label>Last name *</label>
                    <input name="last_name" value={form.last_name} onChange={handleChange} required placeholder="Smith" />
                  </div>
                </div>
                <div>
                  <label>Rank *</label>
                  <select name="rank" value={form.rank} onChange={handleChange} required>
                    <option value="">Select rank...</option>
                    {RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label>Nationality</label>
                  <input name="nationality" value={form.nationality} onChange={handleChange} placeholder="e.g. Greek" />
                </div>
                <div className="form-grid form-grid-2">
                  <div>
                    <label>Contract Start</label>
                    <input type="date" name="contract_start" value={form.contract_start} onChange={handleChange} />
                  </div>
                  <div>
                    <label>Contract End</label>
                    <input type="date" name="contract_end" value={form.contract_end} onChange={handleChange} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn btn-ghost">Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Adding...' : 'Add Crew Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
