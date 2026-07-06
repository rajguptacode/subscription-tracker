const PLANS = {
  1: { months: 1, price: 199, label: '1 Month' },
  3: { months: 3, price: 499, label: '3 Months' },
  6: { months: 6, price: 899, label: '6 Months' }
};

const PRODUCTS = [
  'Options Analytics Bot',
  'TradingView Indicator',
  'PCR Analysis Tool',
  'OI Buildup Tracker',
  'Max Pain Calculator',
  'IV Skew Analyzer',
  'Combo Pack'
];

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function createSubscriber(name, contact, planMonths, paymentDate, product, tvUsername) {
  const expiry = new Date(paymentDate);
  expiry.setMonth(expiry.getMonth() + planMonths);

  return {
    id: uid(),
    name,
    contact,
    tradingview_username: tvUsername || '',
    plan_months: planMonths,
    amount: PLANS[planMonths].price,
    payment_date: paymentDate,
    expiry_date: expiry.toISOString().split('T')[0],
    product: product || 'Unassigned',
    payment_status: 'pending',
    source: 'manual'
  };
}

function deriveStatus(expiryDate) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDate);
  exp.setHours(0, 0, 0, 0);

  if (exp < now) return 'expired';

  const diff = (exp - now) / (1000 * 60 * 60 * 24);
  if (diff <= 3) return 'expiring_soon';
  return 'active';
}

function calcRevenue(list) {
  const now = new Date();
  return list
    .filter(s => {
      const pd = new Date(s.payment_date);
      return pd.getMonth() === now.getMonth() && pd.getFullYear() === now.getFullYear();
    })
    .reduce((sum, s) => sum + s.amount, 0);
}

function calcReceivedRevenue(list) {
  return list
    .filter(s => s.payment_status === 'received')
    .reduce((sum, s) => sum + s.amount, 0);
}

function calcPendingRevenue(list) {
  return list
    .filter(s => s.payment_status === 'pending')
    .reduce((sum, s) => sum + s.amount, 0);
}

function getMonthlyRevenue(list, monthsBack = 6) {
  const result = [];
  const now = new Date();

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = monthLabel(d);
    const total = list
      .filter(s => {
        const pd = new Date(s.payment_date);
        return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear();
      })
      .reduce((sum, s) => sum + s.amount, 0);

    result.push({ label: monthStr, value: total, isCurrent: i === 0 });
  }

  return result;
}

function getMonthlyGrowth(list, monthsBack = 6) {
  const result = [];
  const now = new Date();

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = monthLabel(d);
    const count = list.filter(s => {
      const pd = new Date(s.payment_date);
      return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear();
    }).length;

    result.push({ label: monthStr, value: count, isCurrent: i === 0 });
  }

  return result;
}

function getPlanDistribution(list) {
  const dist = { 1: 0, 3: 0, 6: 0 };
  list.forEach(s => {
    if (dist[s.plan_months] !== undefined) {
      dist[s.plan_months]++;
    }
  });
  return dist;
}

function getProductDistribution(list) {
  const dist = {};
  PRODUCTS.forEach(p => dist[p] = 0);
  list.forEach(s => {
    const key = s.product || 'Unassigned';
    dist[key] = (dist[key] || 0) + 1;
  });
  return dist;
}

function getProductRevenue(list) {
  const dist = {};
  PRODUCTS.forEach(p => dist[p] = 0);
  list.forEach(s => {
    const key = s.product || 'Unassigned';
    dist[key] = (dist[key] || 0) + s.amount;
  });
  return dist;
}

function getActiveCount(list) {
  return list.filter(s => deriveStatus(s.expiry_date) === 'active').length;
}

function getExpiringSoonCount(list) {
  return list.filter(s => deriveStatus(s.expiry_date) === 'expiring_soon').length;
}

function getExpiredCount(list) {
  return list.filter(s => deriveStatus(s.expiry_date) === 'expired').length;
}

function getDaysLeft(expiryDate) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDate);
  exp.setHours(0, 0, 0, 0);
  return Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
}

function getExpiryLabel(expiryDate) {
  const days = getDaysLeft(expiryDate);
  if (days < 0) return `Expired ${Math.abs(days)}d ago`;
  if (days === 0) return 'Expires today';
  if (days === 1) return 'Expires tomorrow';
  return `${days} days left`;
}

function sortByExpiry(list) {
  return [...list].sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtMoney(n) {
  return '₹' + n.toLocaleString('en-IN');
}

function monthLabel(d) {
  return new Date(d).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
