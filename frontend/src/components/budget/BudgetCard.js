import React from 'react';
import { CAT_COLORS, formatCurrency } from '../../utils/helpers';

export default function BudgetCard({ budget }) {
  const { category, limit, spent = 0, percentage = 0, status = 'ok' } = budget;
  const color =
    status === 'exceeded' ? 'var(--danger)' :
    status === 'warning'  ? 'var(--warn)'   :
    CAT_COLORS[category]  || '#888';

  return (
    <div className="budget-card">
      <div className="budget-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
          <span style={{ fontSize: 13 }}>{category}</span>
          {status === 'exceeded' && <span className="badge badge-expense">Over!</span>}
          {status === 'warning'  && <span style={{ fontSize: 10, color: 'var(--warn)' }}>↑ Alert</span>}
        </div>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>
          {formatCurrency(spent)} / {formatCurrency(limit)}
        </span>
      </div>
      <div className="progress-track" style={{ marginTop: 8 }}>
        <div
          className="progress-fill"
          style={{ width: `${Math.min(percentage, 100)}%`, background: color }}
        />
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, textAlign: 'right' }}>
        {percentage}% used
      </div>
    </div>
  );
}
