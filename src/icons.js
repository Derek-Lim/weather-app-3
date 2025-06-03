import unknownIcon from './icons/unknown.png'
import snowIcon from './icons/snow.png'
import rainIcon from './icons/rain.png'
import fogIcon from './icons/fog.png'
import windIcon from './icons/wind.png'
import cloudyIcon from './icons/cloudy.png'
import partlyCloudyDayIcon from './icons/partly-cloudy-day.png'
import partlyCloudyNightIcon from './icons/partly-cloudy-night.png'
import clearDayIcon from './icons/clear-day.png'
import clearNightIcon from './icons/clear-night.png'
import imperialIcon from './icons/imperial.png'
import metricIcon from './icons/metric.png'

export const UNIT_GROUP_ICONS = {
  'us': imperialIcon,
  'metric': metricIcon
}

const WEATHER_ICONS = {
  'snow': snowIcon,
  'rain': rainIcon,
  'fog': fogIcon,
  'wind': windIcon,
  'cloudy': cloudyIcon,
  'partly-cloudy-day': partlyCloudyDayIcon,
  'partly-cloudy-night': partlyCloudyNightIcon,
  'clear-day': clearDayIcon,
  'clear-night': clearNightIcon
}

export function createWeatherIcon(name) {
  const key = name?.toLowerCase()?.trim()
  const src = WEATHER_ICONS[key]
  const img = document.createElement('img')
  img.src = src || unknownIcon
  img.alt = src ? formatAltText(key) : 'Unknown weather condition'
  img.title = img.alt
  if (!src) console.warn(`createWeatherIcon: unknown icon name "${name}"`)
  return img
}

function formatAltText(str) {
  return str.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}