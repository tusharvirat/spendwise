import React, { useEffect, useState, useCallback } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import api from '../utils/api';
import { formatCurrency, monthLabel, MONTHS, CAT_COLORS } from '../utils/helpers';
import StatCard from '../components/dashboard/StatCard';
import CategoryBar from '../components/reports/CategoryBar';
import { toast } from 'react-toastify';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

export default function ReportsPage() {
  const [availableMonths, setAvailableMonths] = useState([]);
  const [selectedMonth, setSelectedMonth]     = useState('');
  const [report, setReport]                   = useState(null);
  const [yearlyData, setYearlyData]           = useState(null);
  const [loadingReport, setLoadingReport]     = useState(false);
  const [view, setView]                       = useState('monthly'); // 'monthly' | 'yearly'

  // Fetch available months
  useEffect(() => {
    api.get('/reports/months')
      .then(({ data }) => {
        setAvailableMonths(data);
        if (data.length) setSelectedMonth(data[0].key);
      })
      .catch(() => toast.error('Could not load months'));
  }, []);

  // Fetch monthly report
  useEffect(() => {
    if (!selectedMonth || view !== 'monthly') return;
    setLoadingReport(true);
    api.get('/reports/monthly', { params: { month: selectedMonth } })
      .then(({ data }) => setReport(data))
      .catch(() => toast.error('Could not load report'))
      .finally(() => setLoadingReport(false));
  }, [selectedMonth, view]);

  // Fetch yearly report
  useEffect(() => {
    if (view !== 'yearly') return;
    const year = new Date().getFullYear();
    setLoadingReport(true);
    api.get('/reports/yearly', { params: { year } })
      .then(({ data }) => setYearlyData(data))
      .catch(() => toast.error('Could not load yearly report'))
      .finally(() => setLoadingReport(false));
  }, [view]);

  // Chart colours
  const CHART_OPTS = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: '#2a2d22' }, ticks: { color: '#7a7d6e', font: { family: 'DM Mono', size: 11 } } },
      y: { grid: { color: '#2a2d22' }, ticks: { color: '#7a7d6e', font: { family: 'DM Mono', size: 11 } } },
    },
  };

  function buildDailyChart() {
    if (!report?.dailyTrend) return null;
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const expByDay = {}, incByDay = {};
    report.dailyTrend.forEach(({ _id, total }) => {
      if (_id.type === 'expense') expByDay[_id.day] = total;
      else incByDay[_id.day] = total;
    });
    const labels = days.filter((d) => expByDay[d] || incByDay[d]);
    return {
      labels,
      datasets: [
        {
          label: 'Expense',
          data: labels.map((d) => expByDay[d] || 0),
          borderColor: '#f06565',
          backgroundColor: 'rgba(240,101,101,.12)',
          tension: 0.4,
          fill: true,
          pointRadius: 3,
        },
        {
          label: 'Income',
          data: labels.map((d) => incByDay[d] || 0),
          borderColor: '#65f0c8',
          backgroundColor: 'rgba(101,240,200,.08)',
          tension: 0.4,
          fill: true,
          pointRadius: 3,
        },
      ],
    };
  }

  function buildYearlyChart() {
    if (!yearlyData?.monthly) return null;
    return {
      labels: MONTHS,
      datasets: [
        { label: 'Income',  data: yearlyData.monthly.map((m) => m.income),  backgroundColor: '#65f0c8' },
        { label: 'Expense', data: yearlyData.monthly.map((m) => m.expense), backgroundColor: '#f06565' },
      ],
    };
  }

  function buildDoughnut() {
    if (!report?.categoryBreakdown?.length) return null;
    const top = report.categoryBreakdown.slice(0, 7);
    return {
      labels: top.map((c) => c._id),
      datasets: [{
        data: top.map((c) => c.total),
        backgroundColor: top.map((c) => CAT_COLORS[c._id] || '#888'),
        borderWidth: 0,
        hoverOffset: 6,
      }],
    };
  }

  const dailyChart  = buildDailyChart();
  const yearlyChart = buildYearlyChart();
  const doughnut    = buildDoughnut();

  return (
    <div className="page">
      <div className="sec-head">
        <div className="sec-title">Reports</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className={`btn ${view === 'monthly' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('monthly')}>Monthly</button>
          <button className={`btn ${view === 'yearly'  ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('yearly')}>Yearly</button>
        </div>
      </div>

      {/* ── Monthly View ── */}
      {view === 'monthly' && (
        <>
          {/* Month tabs */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6, marginBottom: 20 }}>
            {availableMonths.map((m) => (
              <button
                key={m.key}
                style={{
                  padding: '6px 14px', borderRadius: 20,
                  border: '1px solid', whiteSpace: 'nowrap',
                  background: selectedMonth === m.key ? 'var(--accent)' : 'none',
                  color:      selectedMonth === m.key ? '#0e0f0c' : 'var(--muted)',
                  borderColor: selectedMonth === m.key ? 'var(--accent)' : 'var(--border)',
                  fontFamily: 'var(--font-mono)', fontSize: 11, cursor: 'pointer',
                }}
                onClick={() => setSelectedMonth(m.key)}
              >
                {m.label}
              </button>
            ))}
          </div>

          {loadingReport ? (
            <div className="loading-screen"><div className="spinner" /></div>
          ) : report ? (
            <>
              <div className="grid-4" style={{ marginBottom: 20 }}>
                <StatCard label="Income"       value={formatCurrency(report.summary.income)}  color="green" />
                <StatCard label="Expenses"     value={formatCurrency(report.summary.expense)} color="red" />
                <StatCard label="Net savings"  value={formatCurrency(report.summary.net)}     color={report.summary.net >= 0 ? 'green' : 'red'} />
                <StatCard label="Savings rate" value={report.summary.income > 0 ? `${report.summary.savingsRate}%` : '—'} color="yellow" />
              </div>

              <div className="grid-2" style={{ marginBottom: 20 }}>
                {/* Daily trend chart */}
                {dailyChart && (
                  <div className="card">
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>Daily trend</div>
                    <div style={{ height: 200, position: 'relative' }}>
                      <Line data={dailyChart} options={{ ...CHART_OPTS, plugins: { legend: { display: false } } }} />
                    </div>
                    <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                      {[['#f06565','Expense'],['#65f0c8','Income']].map(([col,label]) => (
                        <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--muted)' }}>
                          <span style={{ width: 10, height: 10, borderRadius: 2, background: col, display: 'inline-block' }} />
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Doughnut */}
                {doughnut && (
                  <div className="card">
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>Spending by category</div>
                    <div style={{ height: 200, position: 'relative' }}>
                      <Doughnut data={doughnut} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '65%' }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Category breakdown */}
              {report.categoryBreakdown.length > 0 && (
                <div className="card">
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>Category breakdown</div>
                  {report.categoryBreakdown.map((c) => (
                    <CategoryBar
                      key={c._id}
                      category={c._id}
                      total={c.total}
                      percentage={c.percentage}
                      maxTotal={report.categoryBreakdown[0]?.total || 1}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <p>No data for this month. Add transactions to see your report.</p>
            </div>
          )}
        </>
      )}

      {/* ── Yearly View ── */}
      {view === 'yearly' && (
        loadingReport ? (
          <div className="loading-screen"><div className="spinner" /></div>
        ) : yearlyData ? (
          <>
            <div className="grid-3" style={{ marginBottom: 20 }}>
              <StatCard label="Total income"  value={formatCurrency(yearlyData.totals.income)}  color="green" />
              <StatCard label="Total expense" value={formatCurrency(yearlyData.totals.expense)} color="red" />
              <StatCard label="Net saved"     value={formatCurrency(yearlyData.net)} color={yearlyData.net >= 0 ? 'yellow' : 'red'} />
            </div>

            <div className="card">
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>Monthly overview {yearlyData.year}</div>
              <div style={{ height: 260, position: 'relative' }}>
                {yearlyChart && <Bar data={yearlyChart} options={{ ...CHART_OPTS, plugins: { legend: { display: false } } }} />}
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                {[['#65f0c8','Income'],['#f06565','Expense']].map(([col,label]) => (
                  <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--muted)' }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: col, display: 'inline-block' }} />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📈</div>
            <p>No yearly data available yet.</p>
          </div>
        )
      )}
    </div>
  );
}
