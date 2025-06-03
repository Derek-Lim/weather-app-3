export function formatTime(time) {
  if (!time || typeof time !== 'string') return 'N/A'
  const [h, m] = time.split(':').map(Number)
  if (isNaN(h) || isNaN(m)) return 'N/A'
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`
}

export function formatHourOffset(time, index) {
  const [h, m] = time.split(':').map(Number)
  let adj = h + (m === 45 ? 2 : 1)
  adj = (adj + index) % 24
  const period = adj >= 12 ? 'PM' : 'AM'
  const display = adj % 12 || 12
  return `${display} ${period}`
}

export function formatDate(date) {
  const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
  const [, month, day] = date.split('-')
  return `${MONTHS[+month - 1]} ${+day}`
}

export function getDayName(date) {
  const DAYS = ['SUN','MON','TUE','WED','THU','FRI','SAT']
  const [y, m, d] = date.split('-').map(Number)
  const parsed = new Date(y, m - 1, d)
  if (isNaN(parsed)) throw new Error('Invalid date format')
  return DAYS[parsed.getDay()]
}