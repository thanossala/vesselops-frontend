import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--navy)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Decorative side */}
      <div style={{
        flex: '0 0 48%',
        background: 'linear-gradient(135deg, #0d1630 0%, #0a0f1e 50%, #111d3e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem',
        position: 'relative',
        borderRight: '1px solid rgba(143,163,200,0.08)',
        overflow: 'hidden',
      }}>
        {/* Concentric rings */}
        {[320, 240, 160, 80].map((size, i) => (
          <div key={size} style={{
            position: 'absolute',
            width: size, height: size,
            borderRadius: '50%',
            border: `1px solid rgba(240,160,32,${0.04 + i * 0.02})`,
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
          }} />
        ))}
        {/* Cross lines */}
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(240,160,32,0.06)' }} />
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(240,160,32,0.06)' }} />

        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ marginBottom: 24 }}>
            <circle cx="32" cy="32" r="30" stroke="#f0a020" strokeWidth="1.5" opacity="0.5"/>
            <circle cx="32" cy="32" r="20" stroke="#f0a020" strokeWidth="1" opacity="0.3"/>
            <circle cx="32" cy="32" r="10" stroke="#f0a020" strokeWidth="1" opacity="0.2"/>
            <line x1="32" y1="2" x2="32" y2="14" stroke="#f0a020" strokeWidth="2"/>
            <line x1="32" y1="50" x2="32" y2="62" stroke="#f0a020" strokeWidth="2"/>
            <line x1="2" y1="32" x2="14" y2="32" stroke="#f0a020" strokeWidth="2"/>
            <line x1="50" y1="32" x2="62" y2="32" stroke="#f0a020" strokeWidth="2"/>
            <polygon points="32,12 34,28 32,32 30,28" fill="#f0a020" opacity="0.9"/>
            <circle cx="32" cy="32" r="3" fill="#f0a020"/>
          </svg>
          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 36, fontWeight: 800,
            color: '#e8edf8', letterSpacing: '-0.04em',
            marginBottom: 8,
          }}>
            VESSEL<span style={{ color: '#f0a020' }}>OPS</span>
          </h1>
          <p style={{ color: 'var(--mist)', fontSize: 14, lineHeight: 1.6, maxWidth: 280 }}>
            Maritime operations management for modern fleets
          </p>

          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['Fleet & Vessel Registry', 'Crew Management', 'Watch Scheduling', 'Digital Logbook', 'Certificate Tracking'].map((f) => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(187,200,224,0.6)', fontSize: 13 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f0a020', opacity: 0.7 }} />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form side */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <h2 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 24, fontWeight: 700,
            color: '#e8edf8', marginBottom: 6, letterSpacing: '-0.02em',
          }}>
            Sign in
          </h2>
          <p style={{ color: 'var(--mist)', fontSize: 14, marginBottom: 32 }}>
            Access your fleet operations dashboard
          </p>

          {error && <div className="alert-error">{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="captain@fleet.com"
                autoFocus
              />
            </div>
            <div>
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: 14, marginTop: 8 }}
            >
              {loading ? (
                <><div className="spinner" style={{ width: 14, height: 14 }} /> Signing in...</>
              ) : 'Sign in'}
            </button>
          </form>

          <p style={{ marginTop: 24, fontSize: 13, color: 'var(--mist)', textAlign: 'center' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#f0a020', fontWeight: 500, textDecoration: 'none' }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
