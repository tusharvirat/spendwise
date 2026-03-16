import React from 'react';

export default function StatCard({ label, value, sub, color = '' }) {
  return (
    <div className="card-sm">
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${color}`}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}
