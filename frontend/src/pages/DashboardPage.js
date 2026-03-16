import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/dashboard/StatCard';
import TransactionRow from '../components/transactions/TransactionRow';
import { formatCurrency, currentMonthKey, monthLabel } from '../utils/helpers';

export default function DashboardPage() {
  const { summary, fetchSummary, loading } = useTransactions();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  const monthlyIncome  = summary?.monthly?.income?.total  || 0;
  const monthlyExpense = summary?.monthly?.expense?.total || 0;
  const monthlyNet     = monthlyIncome - monthlyExpense;
  const allTimeIncome  = summary?.allTime?.income?.total  || 0;
  const allTimeExpense = summary?.allTime?.expense?.total || 0;
  const savingsRate    = monthlyIncome > 0
    ? Math.round((1 - monthlyExpense / monthlyIncome) * 100) : 0;

  return (
    <div className="page">
      <div className="sec-head" style={{ marginBottom: 24 }}>
        <div>
          <div className="sec-title">Good day, {user?.name?.split(' ')[0]} 👋</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
            {monthLabel(currentMonthKey())} overview
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/transactions')}>
          + Add transaction
        </button>
      </div>

      {loading && !summary ? (
        <div className="loading-screen"><div className="spinner" /></div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid-4" style={{ marginBottom: 20 }}>
            <StatCard
              label="Monthly income"
              value={formatCurrency(monthlyIncome)}
              color="green"
              sub={`${summary?.monthly?.income?.count || 0} transactions`}
            />
            <StatCard
              label="Monthly expense"
              value={formatCurrency(monthlyExpense)}
              color="red"
              sub={`${summary?.monthly?.expense?.count || 0} transactions`}
            />
            <StatCard
              label="Net balance"
              value={formatCurrency(monthlyNet)}
              color={monthlyNet >= 0 ? 'green' : 'red'}
            />
            <StatCard
              label="Savings rate"
              value={monthlyIncome > 0 ? `${savingsRate}%` : '—'}
              color="yellow"
              sub="this month"
            />
          </div>

          {/* All-time row */}
          <div className="grid-2" style={{ marginBottom: 20 }}>
            <StatCard
              label="All-time income"
              value={formatCurrency(allTimeIncome)}
              color="green"
            />
            <StatCard
              label="All-time saved"
              value={formatCurrency(allTimeIncome - allTimeExpense)}
              color={allTimeIncome - allTimeExpense >= 0 ? 'yellow' : 'red'}
            />
          </div>

          {/* Recent transactions */}
          <div className="card">
            <div className="sec-head">
              <div className="sec-title">Recent transactions</div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/transactions')}>
                View all →
              </button>
            </div>

            {summary?.recentTransactions?.length ? (
              <div className="tx-list">
                {summary.recentTransactions.map((t) => (
                  <TransactionRow key={t._id} transaction={t} compact />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <p>No transactions yet. Add your first one!</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
