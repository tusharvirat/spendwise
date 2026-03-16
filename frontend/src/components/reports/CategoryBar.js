import React from 'react';
import { CAT_COLORS, formatCurrency } from '../../utils/helpers';

export default function CategoryBar({ category, total, percentage, maxTotal }) {
  const width = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  const color = CAT_COLORS[category] || '#888';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
      <span style={{ width: 100, fontSize: 12, color: 'var(--muted)', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {category}
      </span>
      <div style={{ flex: 1, height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${width}%`, background: color, borderRadius: 4, transition: 'width .5s ease' }} />
      </div>
      <span style={{ fontSize: 11, color: 'var(--muted)', minWidth: 80, textAlign: 'right', flexShrink: 0 }}>
        {formatCurrency(total)} <span style={{ opacity: .6 }}>({percentage}%)</span>
      </span>
    </div>
  );
}
