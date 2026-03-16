import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm]     = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  function validate() {
    const e = {};
    if (!form.name.trim())                       e.name     = 'Name is required';
    if (!form.email.includes('@'))               e.email    = 'Valid email required';
    if (form.password.length < 6)                e.password = 'At least 6 characters';
    if (form.password !== form.confirm)          e.confirm  = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await register(form.name, form.email, form.password);
    setLoading(false);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><span className="logo-italic">spend</span>wise</div>
        <p className="auth-subtitle">Create your free account</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full name</label>
            <input className="form-input" placeholder="Jane Doe" value={form.name} onChange={(e) => set('name', e.target.value)} required autoFocus />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} required />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Min. 6 characters" value={form.password} onChange={(e) => set('password', e.target.value)} required />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Confirm password</label>
            <input className="form-input" type="password" placeholder="Re-enter password" value={form.confirm} onChange={(e) => set('confirm', e.target.value)} required />
            {errors.confirm && <span className="form-error">{errors.confirm}</span>}
          </div>
          <button className="btn btn-primary auth-btn" type="submit" disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
