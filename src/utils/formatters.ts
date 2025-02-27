// Convert English numbers to Persian numbers
export const toPersianNumber = (num: number | string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/[0-9]/g, (match) => persianDigits[parseInt(match)]);
};

// Format number with commas as thousands separators
export const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US');
};

// Format number with commas and convert to Persian
export const formatPersianNumber = (num: number): string => {
  return toPersianNumber(formatNumber(num));
};

// Format currency in IRT
export const formatCurrency = (amount: number, currency: string = 'IRT'): string => {
  if (currency === 'USD') {
    return `دلار ${formatNumber(Math.round(amount * 100) / 100)}`;
  }
  return `${formatNumber(Math.round(amount))} تومان`;
};

// Format currency in IRT and convert to Persian
export const formatPersianCurrency = (amount: number, currency: string = 'IRT'): string => {
  if (currency === 'USD') {
    return `$${formatPersianNumber(Math.round(amount * 100) / 100)}`;
  }
  return `${formatPersianNumber(Math.round(amount))} تومان`;
};

// Format date to Persian format
export const formatPersianDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  
  // This is a simplified version. In a real app, you would use a proper Persian date library
  // like Moment.js with Jalali/Shamsi calendar support
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  
  const persianMonth = getPersianMonth(month);
  
  return `${toPersianNumber(day)} ${persianMonth} ${toPersianNumber(year)} - ${toPersianNumber(hour)}:${toPersianNumber(minute.toString().padStart(2, '0'))}`;
};

// Get Persian month name
const getPersianMonth = (month: number): string => {
  const persianMonths = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];
  return persianMonths[month - 1];
};