// formatters.js
// Helper functions for formatting text, time, and date values

// Formats a time string like "05:15" into "5:15 AM"
export function formatTime(time) {
  if (!time || typeof time !== 'string') return 'N/A'
  const [h, m] = time.split(':').map(Number)
  if (isNaN(h) || isNaN(m)) return 'N/A'
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`
}

// Formats a given date string (e.g., "2025-06-01") into "JUN 1"
export function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
}

// Returns the weekday name (e.g., "Monday") from a date string
export function getDayName(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
}

// Returns hour label for forecast: "3 PM", "4 AM", etc.
export function formatHourOffset(time, index) {
  const [h, m] = time.split(':').map(Number)
  let adj = h + (m === 45 ? 2 : 1)
  adj = (adj + index) % 24
  const period = adj >= 12 ? 'PM' : 'AM'
  const display = adj % 12 || 12
  return `${display} ${period}`
}
