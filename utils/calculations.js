export const getPurityPercentage = (purity) => {
  if (!purity) return 0;
  if (purity.includes('K')) {
    const karat = parseInt(purity.replace('K', ''));
    return isNaN(karat) ? 0 : karat / 24;
  }
  if (purity.includes('%')) {
    const percent = parseFloat(purity.replace('%', ''));
    return isNaN(percent) ? 0 : percent / 100;
  }
  const asFloat = parseFloat(purity);
  return isNaN(asFloat) ? 0 : asFloat / 100;
};
