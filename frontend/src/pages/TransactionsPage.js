import React, { useEffect, useState, useCallback } from 'react';
import { useTransactions } from '../context/TransactionContext';
import TransactionRow from '../components/transactions/TransactionRow';
import TransactionModal from '../components/transactions/TransactionModal';
import { CATEGORIES } from '../utils/helpers';
import '../components/transactions/Transactions.css';

const TYPE_FILTERS = ['all', 'income', 'expense'];

export default function TransactionsPage() {
  const { transactions, pagination, loading, fetchTransactions, addTransaction, updateTransaction, deleteTransaction } = useTransactions();

  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [saving, setSaving]         = useState(false);
  const [search, setSearch]         = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCat, setFilterCat]   = useState('all');
  const [page, setPage]             = useState(1);

  const load = useCallback(() => {
    const params = { page, limit: 30 };
    if (filterType !== 'all') params.type = filterType;
    if (filterCat  !== 'all') params.category = filterCat;
    if (search.trim())        params.search = search.trim();
    fetchTransactions(params);
  }, [fetchTransactions, page, filterType, filterCat, search]);

  useEffect(() => { load(); }, [load]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [filterType, filterCat, search]);

  async function handleSave(payload) {
    setSaving(true);
    let ok;
    if (editing) {
      ok = await updateTransaction(editing._id, payload);
    } else {
      ok = await addTransaction(payload);
    }
    setSaving(false);
    if (ok) { setShowModal(false); setEditing(null); load(); }
  }

  function openEdit(t) { setEditing(t); setShowModal(true); }
  function openAdd()   { setEditing(null); setShowModal(true); }

  return (
    <div className="page">
      <div className="sec-head">
        <div className="sec-title">Transactions</div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add</button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 10 }}>
        <input
          className="form-input"
          placeholder="Search transactions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 360 }}
        />
      </div>

      {/* Type filter */}
      <div className="filters-bar">
        {TYPE_FILTERS.map((t) => (
          <button
            key={t}
            className={`filter-chip ${filterType === t ? 'active' : ''}`}
            onClick={() => setFilterType(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
        <span style={{ color: 'var(--border)', padding: '0 2px' }}>|</span>
        {['all', ...CATEGORIES].map((c) => (
          <button
            key={c}
            className={`filter-chip ${filterCat === c ? 'active' : ''}`}
            onClick={() => setFilterCat(c)}
          >
            {c === 'all' ? 'All categories' : c}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="loading-screen"><div className="spinner" /></div>
      ) : transactions.length ? (
        <>
          <div className="tx-list">
            {transactions.map((t) => (
              <TransactionRow
                key={t._id}
                transaction={t}
                onEdit={openEdit}
                onDelete={deleteTransaction}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >← Prev</button>
              <span style={{ padding: '5px 10px', fontSize: 12, color: 'var(--muted)' }}>
                {page} / {pagination.pages}
              </span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
              >Next →</button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p>No transactions found. Try adjusting your filters.</p>
        </div>
      )}

      {showModal && (
        <TransactionModal
          editing={editing}
          loading={saving}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
