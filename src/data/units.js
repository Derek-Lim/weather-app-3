// units.js
// Maps measurement units for temperature and speed based on region

const units = {
  temp: { us: '°F', metric: '°C' },
  speed: { us: 'mph', metric: 'km/h' }
}

/**
 * Retrieves the appropriate unit symbol based on the measurement type and unit group.
 * Example: getUnit('us', 'temp') → "°F"
 */
export function getUnit(group, type) {
  return units[type]?.[group] || ''
}
