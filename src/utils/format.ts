export const formatCurrency = (
  value: number | null | undefined,
  currency: string = 'CAD',
  locale: string = 'en-CA'
): string => {
  if (typeof value !== 'number' || isNaN(value)) return 'N/A';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `$${Math.round(value).toLocaleString('en-CA')}`;
  }
};

export const formatNumber = (
  value: number | null | undefined,
  locale: string = 'en-CA'
): string => {
  if (typeof value !== 'number' || isNaN(value)) return 'N/A';
  try {
    return new Intl.NumberFormat(locale).format(value);
  } catch {
    return value.toLocaleString('en-CA');
  }
};

export const formatKm = (value: number | null | undefined): string => {
  const n = typeof value === 'number' ? value : NaN;
  if (isNaN(n)) return 'N/A';
  return `${formatNumber(n)} km`;
};
