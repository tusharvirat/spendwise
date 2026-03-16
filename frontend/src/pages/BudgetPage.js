import React, { useEffect, useState } from 'react';
import { useBudgets } from '../context/BudgetContext';
import BudgetCard from '../components/budget/BudgetCard';
import BudgetModal from '../components/budget/BudgetModal';
import { currentMonthKey, monthLabel } from '../utils/helpers';
import '../components/budget/Budget.css';

export default function BudgetPage() {
  const { budgets, loading, fetchBudgets, saveBudgetsBulk } = useBudgets();
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]       = useState(false);
  const month = currentMonthKey();

  useEffect(() => { fetchBudgets(month); }, [fetchBudgets, month]);

  async function handleSave(budgetList) {
    setSaving(true);
    const ok = await saveBudgetsBulk(month, budgetList);
    setSaving(false);
    if (ok) { setShowModal(false); fetchBudgets(month); }
  }

  const exceeded = budgets.filter((b) => b.status === 'exceeded');
  const warning  = budgets.filter((b) => b.status === 'warning');
  const ok       = budgets.filter((b) => b.status === 'ok');

  return (
    <div className="page">
      <div className="sec-head">
        <div>
          <div className="sec-title">Budgets</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
            {monthLabel(month)}
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Edit budgets
        </button>
      </div>

      {loading ? (
        <div className="loading-screen"><div className="spinner" /></div>
      ) : budgets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎯</div>
          <p>No budgets set yet. Click "Edit budgets" to get started.</p>
        </div>
      ) : (
        <>
          {/* Alerts */}
          {exceeded.map((b) => (
            <div key={b._id} className="alert alert-danger">
              <span className="alert-icon">⚠</span>
              <span>
                <strong>{b.category}</strong> budget exceeded!
                Spent ₹{b.spent?.toLocaleString('en-IN')} of ₹{b.limit?.toLocaleString('en-IN')} limit.
              </span>
            </div>
          ))}
          {warning.map((b) => (
            <div key={b._id} className="alert alert-warn">
              <span className="alert-icon">↑</span>
              <span>
                <strong>{b.category}</strong> is at {b.percentage}% — approaching your ₹{b.limit?.toLocaleString('en-IN')} limit.
              </span>
            </div>
          ))}
          {exceeded.length === 0 && warning.length === 0 && (
            <div className="alert alert-success" style={{ marginBottom: 16 }}>
              <span className="alert-icon">✓</span>
              <span>All budgets are on track for {monthLabel(month)}.</span>
            </div>
          )}

          {/* Budget cards */}
          <div className="budget-grid">
            {[...exceeded, ...warning, ...ok].map((b) => (
              <BudgetCard key={b._id} budget={b} />
            ))}
          </div>

          {/* Summary stats */}
          <div className="grid-3" style={{ marginTop: 20 }}>
            <div className="card-sm">
              <div className="stat-label">Budgets on track</div>
              <div className="stat-value green">{ok.length}</div>
            </div>
            <div className="card-sm">
              <div className="stat-label">Approaching limit</div>
              <div className="stat-value yellow">{warning.length}</div>
            </div>
            <div className="card-sm">
              <div className="stat-label">Exceeded</div>
              <div className="stat-value red">{exceeded.length}</div>
            </div>
          </div>
        </>
      )}

      {showModal && (
        <BudgetModal
          existing={budgets}
          loading={saving}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
