const pad = (n) => (n < 10 ? `0${n}` : `${n}`);

function formatDate(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatCurrency(value, currency = 'EUR', locale = 'pt-PT') {
  const num = typeof value === 'number' ? value : Number(value || 0);
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(num);
}

module.exports = {
  formatDate,
  formatCurrency,
};

