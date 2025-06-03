const units = {
  temp: { us: '°F', metric: '°C' },
  speed: { us: 'mph', metric: 'km/h' }
}

export function getUnit(group, type) {
  return units[type]?.[group] || ''
}