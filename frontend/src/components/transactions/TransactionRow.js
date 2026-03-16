import React from 'react';
import { CAT_COLORS, formatCurrency, formatDate } from '../../utils/helpers';

export default function TransactionRow({ transaction: t, onEdit, onDelete, compact = false }) {
  const isExpense = t.type === 'expense';

  return (
    <div className="tx-row">
      <div className="tx-dot" style={{ background: CAT_COLORS[t.category] || '#888' }} />

      <div className="tx-info">
        <div className="tx-desc">{t.description}</div>
        <div className="tx-meta">
          {formatDate(t.date)}
          {compact && ` · ${t.category}`}
        </div>
      </div>

      {!compact && (
        <span className="tx-cat-badge">{t.category}</span>
      )}

      <div className={`tx-amount ${isExpense ? 'exp' : 'inc'}`}>
        {isExpense ? '−' : '+'}{formatCurrency(t.amount)}
      </div>

      {!compact && (
        <div className="tx-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => onEdit(t)}>Edit</button>
          <button className="btn btn-danger-ghost" onClick={() => onDelete(t._id)}>Del</button>
        </div>
      )}
    </div>
  );
}
