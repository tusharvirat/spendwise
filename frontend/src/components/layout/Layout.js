import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const NAV_ITEMS = [
  { path: '/dashboard',    label: 'Overview'      },
  { path: '/transactions', label: 'Transactions'  },
  { path: '/budget',       label: 'Budgets'       },
  { path: '/reports',      label: 'Reports'       },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="layout">
      <nav className="navbar">
        <NavLink to="/dashboard" className="nav-logo">
          <span className="logo-italic">spend</span>wise
        </NavLink>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {NAV_ITEMS.map(({ path, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </div>

        <div className="nav-right">
          <span className="nav-user">{user?.name}</span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
          <button className="hamburger" onClick={() => setMenuOpen((o) => !o)} aria-label="menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
