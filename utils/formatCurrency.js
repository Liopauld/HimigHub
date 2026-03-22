export const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return '₱0.00';
  return `₱${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};