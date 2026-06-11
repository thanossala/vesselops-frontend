// ─────────────────────────────────────────────
//  VesselOps — Navbar.tsx  (updated)
//  Changes vs original:
//    ✓ Hamburger menu on mobile (≤768px)
//    ✓ Fullscreen nav overlay on mobile
//    ✓ Closes on nav click
// ─────────────────────────────────────────────

import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/',             label: 'Dashboard' },
  { to: '/vessels',      label: 'Vessels' },
  { to: '/crew',         label: 'Crew' },
  { to: '/watches',      label: 'Watches' },
  { to: '/logbook',      label: 'Logbook' },
  { to: '/certificates', label: 'Certificates' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
    padding: '6px 13px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: isActive ? 500 : 400,
    textDecoration: 'none',
    color: isActive ? '#f0a020' : 'rgba(187,200,224,0.7)',
    background: isActive ? 'rgba(240,160,32,0.1)' : 'transparent',
    border: isActive ? '1px solid rgba(240,160,32,0.2)' : '1px solid transparent',
    transition: 'all 0.15s',
    letterSpacing: '0.01em',
  });

  return (
    <>
      <nav style={{
        background: 'rgba(10,15,30,0.95)',
        borderBottom: '1px solid rgba(143,163,200,0.1)',
        backdropFilter: 'blur(20px)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 56,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="14" cy="14" r="13" stroke="#f0a020" strokeWidth="1.5" opacity="0.6"/>
              <circle cx="14" cy="14" r="8"  stroke="#f0a020" strokeWidth="1"   opacity="0.4"/>
              <line x1="14" y1="1"  x2="14" y2="6"  stroke="#f0a020" strokeWidth="1.5"/>
              <line x1="14" y1="22" x2="14" y2="27" stroke="#f0a020" strokeWidth="1.5"/>
              <line x1="1"  y1="14" x2="6"  y2="14" stroke="#f0a020" strokeWidth="1.5"/>
              <line x1="22" y1="14" x2="27" y2="14" stroke="#f0a020" strokeWidth="1.5"/>
              <circle cx="14" cy="14" r="2" fill="#f0a020"/>
              <line x1="14" y1="8" x2="14" y2="12" stroke="#f0a020" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: '#e8edf8', letterSpacing: '-0.03em' }}>
              VESSEL<span style={{ color: '#f0a020' }}>OPS</span>
            </span>
          </div>

          {/* Desktop nav links */}
          <div className="nav-desktop" style={{ display: 'flex', gap: 2 }}>
            {NAV_ITEMS.map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === '/'} style={navLinkStyle}>{label}</NavLink>
            ))}
          </div>
        </div>

        {/* Desktop user area */}
        <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '5px 10px',
            background: 'rgba(28,41,69,0.6)',
            border: '1px solid rgba(143,163,200,0.12)',
            borderRadius: 8,
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: 'rgba(240,160,32,0.2)',
              border: '1px solid rgba(240,160,32,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700, color: '#f0a020',
            }}>
              {user?.email?.[0]?.toUpperCase() || '?'}
            </div>
            <span style={{ fontSize: 12, color: 'rgba(187,200,224,0.7)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </span>
          </div>
          <button onClick={logout} className="btn btn-ghost" style={{ fontSize: 12, padding: '5px 12px' }}>
            Sign out
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="nav-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
          style={{
            display: 'none', // shown via CSS media query
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 6, color: 'var(--fog)',
          }}
        >
          {mobileOpen ? (
            // X icon
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <line x1="4" y1="4" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="18" y1="4" x2="4" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          ) : (
            // Hamburger icon
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <line x1="3" y1="6"  x2="19" y2="6"  stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="3" y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="3" y1="16" x2="19" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, top: 56,
            background: 'rgba(10,15,30,0.98)',
            backdropFilter: 'blur(12px)',
            zIndex: 99,
            display: 'flex', flexDirection: 'column',
            padding: '24px 20px',
            gap: 8,
            animation: 'slideDown 0.2s ease',
          }}
          className="nav-mobile-drawer"
        >
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                padding: '12px 16px',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: isActive ? 600 : 400,
                textDecoration: 'none',
                color: isActive ? '#f0a020' : 'rgba(187,200,224,0.85)',
                background: isActive ? 'rgba(240,160,32,0.1)' : 'transparent',
                border: isActive ? '1px solid rgba(240,160,32,0.2)' : '1px solid transparent',
                display: 'block',
              })}
            >
              {label}
            </NavLink>
          ))}

          {/* Mobile user + logout */}
          <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, color: 'var(--mist)', marginBottom: 12, paddingLeft: 4 }}>
              {user?.email}
            </div>
            <button
              onClick={() => { setMobileOpen(false); logout(); }}
              className="btn btn-ghost"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </>
  );
}
