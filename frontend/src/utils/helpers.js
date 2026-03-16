export const CATEGORIES = [
  'Food', 'Transport', 'Housing', 'Utilities', 'Healthcare',
  'Entertainment', 'Shopping', 'Education', 'Travel', 'Other',
];

export const CAT_COLORS = {
  Food:          '#f0b865',
  Transport:     '#65a8f0',
  Housing:       '#c865f0',
  Utilities:     '#65c8f0',
  Healthcare:    '#f0658a',
  Entertainment: '#c8f065',
  Shopping:      '#f06565',
  Education:     '#65f0c8',
  Travel:        '#f0e265',
  Other:         '#a8a8a8',
};

export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: '2-digit',
  });
}

export function monthKey(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function monthLabel(key) {
  const [year, m] = key.split('-');
  return `${MONTHS[+m - 1]} ${year}`;
}

export function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getErrorMessage(err) {
  return (
    err.response?.data?.errors?.[0]?.msg ||
    err.response?.data?.message ||
    err.message ||
    'Something went wrong'
  );
}
