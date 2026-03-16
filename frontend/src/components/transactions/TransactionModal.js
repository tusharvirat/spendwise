import React, { useState, useEffect } from 'react';
import { CATEGORIES } from '../../utils/helpers';

const today = () => new Date().toISOString().split('T')[0];

const EMPTY = {
  description: '', amount: '', type: 'expense',
  category: 'Food', date: today(), notes: '',
};

export default function TransactionModal({ onClose, onSave, editing, loading }) {
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editing) {
      setForm({
        description: editing.description,
        amount:      editing.amount,
        type:        editing.type,
        category:    editing.category,
        date:        editing.date?.split('T')[0] || today(),
        notes:       editing.notes || '',
      });
    } else {
      setForm({ ...EMPTY, date: today() });
    }
    setErrors({});
  }, [editing]);

  function set(k, v) { setForm((p) => ({ ...p, [k]: v })); }

  function validate() {
    const e = {};
    if (!form.description.trim()) e.description = 'Required';
    if (!form.amount || isNaN(form.amount) || +form.amount <= 0) e.amount = 'Must be > 0';
    if (!form.date) e.date = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    onSave({ ...form, amount: parseFloat(form.amount) });
  }

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-title">{editing ? 'Edit transaction' : 'New transaction'}</div>

        {/* Type toggle */}
        <div className="type-toggle">
          <button
            type="button"
            className={`type-btn ${form.type === 'expense' ? 'active-exp' : ''}`}
            onClick={() => set('type', 'expense')}
          >− Expense</button>
          <button
            type="button"
            className={`type-btn ${form.type === 'income' ? 'active-inc' : ''}`}
            onClick={() => set('type', 'income')}
          >+ Income</button>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
          <div className="form-grid-2">
            {/* Description */}
            <div className="form-group form-full">
              <label className="form-label">Description</label>
              <input
                className="form-input"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="What was this for?"
                maxLength={100}
              />
              {errors.description && <span className="form-error">{errors.description}</span>}
            </div>

            {/* Amount */}
            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input
                className="form-input"
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(e) => set('amount', e.target.value)}
                placeholder="0"
              />
              {errors.amount && <span className="form-error">{errors.amount}</span>}
            </div>

            {/* Date */}
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                className="form-input"
                type="date"
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
              />
              {errors.date && <span className="form-error">{errors.date}</span>}
            </div>

            {/* Category */}
            <div className="form-group form-full">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Notes */}
            <div className="form-group form-full">
              <label className="form-label">Notes (optional)</label>
              <input
                className="form-input"
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Any extra details..."
                maxLength={300}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : null}
              {editing ? 'Update' : 'Add transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
