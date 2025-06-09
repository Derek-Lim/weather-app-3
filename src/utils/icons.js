// icons.js
// Manages icon paths and helpers for rendering weather and setting icons

import unknownIcon from '../icons/unknown.png'

import clearDayIcon from '../icons/clear-day.png'
import clearNightIcon from '../icons/clear-night.png'
import cloudyIcon from '../icons/cloudy.png'
import fogIcon from '../icons/fog.png'
import partlyCloudyDayIcon from '../icons/partly-cloudy-day.png'
import partlyCloudyNightIcon from '../icons/partly-cloudy-night.png'
import rainIcon from '../icons/rain.png'
import snowIcon from '../icons/snow.png'
import windIcon from '../icons/wind.png'

import imperialIcon from '../icons/imperial.png'
import metricIcon from '../icons/metric.png'
import lightModeIcon from '../icons/light-mode.png'
import darkModeIcon from '../icons/dark-mode.png'

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

export const UNIT_GROUP_ICONS = {
  'us': imperialIcon,
  'metric': metricIcon
}

export const THEME_ICONS = {
  'light': lightModeIcon,
  'dark': darkModeIcon
}

/**
 * Creates an <img> element for a weather icon based on the given name.
 * Falls back to a default "unknown" icon if the name is unrecognized.
 *
 * @param {string} name - The weather condition name (e.g., "clear-day").
 * @returns {HTMLImageElement} - An <img> element with the appropriate icon.
 */
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

/**
 * Converts a kebab-case string into a human-readable label.
 * E.g., "partly-cloudy-day" → "Partly Cloudy Day"
 */
function formatAltText(str) {
  return str.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
