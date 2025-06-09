// api.js
// Handles fetching weather data from the Visual Crossing Weather API

import { Storage, STORAGE_KEYS } from './storage.js'
import { mapCurrentConditions, mapHourlyIcons, mapDailyForecast, mapModalData } from '../data/mappers.js'

const API_KEY = 'JGM7G4V9AVASVNWUXBBZVPUPZ'

/**
 * Fetches weather data for a given location and unit group.
 * @param {string} location
 * @returns {Promise<Object>}
 */
export async function getWeatherData(location) {
  const unitGroup = Storage.get(STORAGE_KEYS.UNIT_GROUP, 'us')
  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}?unitGroup=${unitGroup}&key=${API_KEY}`
  
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch weather data')
  
  const data = await res.json()
  const current = mapCurrentConditions(data.currentConditions)
  const hourlyIcons = mapHourlyIcons(data)
  const dailyData = mapDailyForecast(data.days)
  const modalData = mapModalData(data)
  
  return { ...current, hourlyIcons, dailyData, modalData }
}
