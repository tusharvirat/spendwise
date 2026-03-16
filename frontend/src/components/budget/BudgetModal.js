import React, { useState, useEffect } from 'react';
import { CATEGORIES, CAT_COLORS } from '../../utils/helpers';

export default function BudgetModal({ onClose, onSave, existing, loading }) {
  // existing: array of { category, limit, alertThreshold }
  const [limits, setLimits] = useState({});
  const [alerts, setAlerts] = useState({});

  useEffect(() => {
    const l = {}, a = {};
    CATEGORIES.forEach((c) => {
      const found = existing?.find((b) => b.category === c);
      l[c] = found ? found.limit : '';
      a[c] = found ? found.alertThreshold : 90;
    });
    setLimits(l);
    setAlerts(a);
  }, [existing]);

  function handleSave() {
    const budgets = CATEGORIES
      .filter((c) => limits[c] && +limits[c] > 0)
      .map((c) => ({ category: c, limit: +limits[c], alertThreshold: +alerts[c] || 90 }));
    onSave(budgets);
  }

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-title">Set monthly budgets</div>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 18 }}>
          Leave blank to skip a category. Alert threshold triggers a warning before you exceed the limit.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '55vh', overflowY: 'auto', paddingRight: 4 }}>
          {CATEGORIES.map((cat) => (
            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: CAT_COLORS[cat], flexShrink: 0 }} />
              <span style={{ width: 100, fontSize: 13, flexShrink: 0 }}>{cat}</span>
              <div style={{ flex: 1, display: 'flex', gap: 8 }}>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  placeholder="No limit"
                  value={limits[cat] || ''}
                  onChange={(e) => setLimits((p) => ({ ...p, [cat]: e.target.value }))}
                  style={{ flex: 2 }}
                />
                <select
                  className="form-select"
                  value={alerts[cat] || 90}
                  onChange={(e) => setAlerts((p) => ({ ...p, [cat]: e.target.value }))}
                  style={{ flex: 1 }}
                  title="Alert at %"
                >
                  {[70, 80, 90, 95].map((v) => <option key={v} value={v}>{v}%</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : null}
            Save budgets
          </button>
        </div>
      </div>
    </div>
  );
}
