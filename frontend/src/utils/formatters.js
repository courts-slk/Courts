export function formatCurrency(amount) {
  return `LKR ${parseFloat(amount).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateLong(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
}

export function formatTimeRange(startTime, endTime) {
  return `${formatTime(startTime)} — ${formatTime(endTime)}`;
}

export function formatSlotTime(date, startTime, endTime) {
  return `${formatDateLong(date)} • ${formatTimeRange(startTime, endTime)}`;
}

export function minutesUntil(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const slotTime = new Date(dateStr + 'T' + timeStr);
  const minutes = Math.floor((slotTime - Date.now()) / 60000);
  return minutes;
}

export function hoursUntil(dateStr, timeStr) {
  const minutes = minutesUntil(dateStr, timeStr);
  if (minutes === null) return null;
  return Math.floor(minutes / 60);
}

export function isToday(dateStr) {
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
}

export function isTomorrow(dateStr) {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  return dateStr === tomorrow;
}

export function isPastSlot(dateStr, timeStr) {
  return minutesUntil(dateStr, timeStr) < 0;
}

export function getRefundAmount(dateStr, timeStr, deposit = 500) {
  const hours = hoursUntil(dateStr, timeStr);
  if (hours === null) return 0;
  if (hours >= 24) return deposit;
  if (hours > 0) return Math.round(deposit * 0.5);
  return 0;
}
