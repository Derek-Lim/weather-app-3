import './styles.css'
import snowIcon from './icons/snow.png'
import rainIcon from './icons/rain.png'
import fogIcon from './icons/fog.png'
import windIcon from './icons/wind.png'
import cloudyIcon from './icons/cloudy.png'
import partlyCloudyDayIcon from './icons/partly-cloudy-day.png'
import partlyCloudyNightIcon from './icons/partly-cloudy-night.png'
import clearDayIcon from './icons/clear-day.png'
import clearNightIcon from './icons/clear-night.png'
import unknownIcon from './icons/unknown.png'
import metricIcon from './icons/metric.png'
import imperialIcon from './icons/imperial.png'

const form = document.getElementById('location-form')
const unitGroupToggle = document.getElementById('unit-group-toggle')

const STORAGE_KEYS = {
  WEATHER: 'weather-data',
  HAS_RUN: 'has-run',
  UNIT_GROUP: 'unit-group',
  LOCATION: 'location'
}

const units = {
  temp: {
    us: '°F',
    metric: '°C'
  },
  speed: {
    us: 'mph',
    metric: 'km/h'
  }
}

const Storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : fallback
    } catch (err) {
      console.warn(`Storage.get("${key}"):`, err.message)
      return fallback
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (err) {
      console.warn(`Storage.set("${key}"):`, err.message)
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const unitGroup = Storage.get(STORAGE_KEYS.UNIT_GROUP, 'us')
  updateUnitGroupUI(unitGroup)

  if (Storage.get(STORAGE_KEYS.HAS_RUN)) {
    renderWeather()
  } else {
    const defaultLocation = 'Silver Spring'
    Storage.set(STORAGE_KEYS.HAS_RUN, true)
    Storage.set(STORAGE_KEYS.UNIT_GROUP, unitGroup)
    Storage.set(STORAGE_KEYS.LOCATION, defaultLocation)
    handleFormSubmit(null, defaultLocation)
  }
})

form.addEventListener('submit', handleFormSubmit)

unitGroupToggle.addEventListener('click', () => {
  const newUnitGroup = switchUnitGroup()
  updateUnitGroupUI(newUnitGroup)

  const location = Storage.get(STORAGE_KEYS.LOCATION)
  handleFormSubmit(null, location)
})

function getUnit(type) {
  const group = Storage.get(STORAGE_KEYS.UNIT_GROUP, 'us')
  return units[type]?.[group] || ''
}

function switchUnitGroup() {
  const current = Storage.get(STORAGE_KEYS.UNIT_GROUP, 'us')
  const next = current === 'us' ? 'metric' : 'us'
  Storage.set(STORAGE_KEYS.UNIT_GROUP, next)
  return next
}

function updateUnitGroupUI(unitGroup) {
  const icon = unitGroupToggle.querySelector('img')
  const label = unitGroupToggle.querySelector('.text')
  icon.src = unitGroup === 'us' ? imperialIcon : metricIcon
  label.textContent = unitGroup === 'us' ? 'Imperial' : 'Metric'
}

async function handleFormSubmit(event, location) {
  if (event?.type === 'submit') {
    event.preventDefault()
    location = form.querySelector('input').value.trim()
  }

  if (!location) return console.warn('No location entered')
  Storage.set(STORAGE_KEYS.LOCATION, location)

  try {
    const weatherData = await getWeatherData(location)
    Storage.set(STORAGE_KEYS.WEATHER, weatherData)
    renderWeather()
    console.log(JSON.stringify(weatherData, null, 2))
  } catch (err) {
    console.error('Error fetching weather data:', err.message)
    alert('Failed to load weather data. Please try another location.')
  }
}

function renderWeather() {
  const data = Storage.get(STORAGE_KEYS.WEATHER)
  if (!data) return console.warn('No weather data to render')

  try {
    renderCurrent(data)
    renderHourly(data.currentTime, data.hourlyIcons)
    renderWeek(data.dailyData)
  } catch (err) {
    console.error('Error rendering weather:', err.message)
  }
}

function renderCurrent(data) {
  const el = selector => document.querySelector(selector)
  const getById = id => document.getElementById(id)

  const imgEl = el('.main-container img')
  if (imgEl) imgEl.remove()

  el('.main-container').prepend(createWeatherIcon(data.icon))
  getById('temp').textContent = `${data.temp}${getUnit('temp')}`
  getById('conditions').textContent = data.conditions
  el('#min-temp .value').textContent = `${data.dailyData[0].min}${getUnit('temp')}`
  el('#max-temp .value').textContent = `${data.dailyData[0].max}${getUnit('temp')}`
  getById('feels-like').textContent = `Feels like ${data.feelsLike}${getUnit('temp')}`
  getById('chance-of-rain').textContent = `${data.chanceOfRain ?? 'N/A'}%`
  getById('wind').textContent = `${data.wind ?? 'N/A'} ${getUnit('speed')}`
  getById('sunrise').textContent = data.sunrise ? formatTime(data.sunrise) : 'N/A'
  getById('sunset').textContent = data.sunset ? formatTime(data.sunset) : 'N/A'
  getById('uv-index').textContent = data.uvIndex ?? 'N/A'
  getById('pressure').textContent = data.pressure ? `${data.pressure} hPa` : 'N/A'
  getById('humidity').textContent = data.humidity ? `${data.humidity}%` : 'N/A'
  getById('gusts').textContent = data.gusts ? `${data.gusts} ${getUnit('speed')}` : `0 ${getUnit('speed')}`
}

function renderHourly(currentTime, icons) {
  const container = document.getElementById('hourly-data-container')
  container.textContent = ''

  icons.forEach((icon, offset) => {
    const card = document.createElement('div')
    card.className = 'card'

    const time = document.createElement('div')
    time.textContent = formatHourOffset(currentTime, offset)

    const image = createWeatherIcon(icon)

    card.append(time, image)
    container.appendChild(card)
  })
}

function renderWeek(days) {
  const container = document.getElementById('week-data-container')
  container.textContent = ''

  days.slice(1).forEach(day => {
    const card = document.createElement('div')
    card.className = 'card'

    const iconWrap = document.createElement('div')
    iconWrap.className = 'img-container'
    iconWrap.appendChild(createWeatherIcon(day.icon))

    const data = document.createElement('div')
    data.className = 'data'

    const weekday = document.createElement('div')
    weekday.className = 'week'
    weekday.textContent = getDayName(day.date)

    const label = document.createElement('div')
    label.className = 'date'
    label.textContent = formatDate(day.date)

    const temps = document.createElement('div')
    temps.className = 'data'

    const buildTemp = (type, value) => {
      const block = document.createElement('div')
      block.innerHTML = `<div class="number">${value}${getUnit('temp')}</div><div class="text">${type}</div>`
      return block
    }

    temps.append(buildTemp('min', day.min), buildTemp('max', day.max))
    data.append(weekday, label, temps)
    card.append(iconWrap, data)
    container.appendChild(card)
  })
}

function formatTime(time) {
  if (!time || typeof time !== 'string') return 'N/A'
  const [h, m] = time.split(':').map(Number)
  if (isNaN(h) || isNaN(m)) return 'N/A'
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`
}

function formatHourOffset(time, index) {
  const [h, m] = time.split(':').map(Number)
  let adj = h + (m === 45 ? 2 : 1)
  adj = (adj + index) % 24
  const period = adj >= 12 ? 'PM' : 'AM'
  const display = adj % 12 || 12
  return `${display} ${period}`
}

function formatDate(date) {
  const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  const [, month, day] = date.split('-')
  return `${MONTHS[+month - 1]} ${+day}`
}

function getDayName(date) {
  const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const [y, m, d] = date.split('-').map(Number)
  const parsed = new Date(y, m - 1, d)
  if (isNaN(parsed)) throw new Error('Invalid date format')
  return DAYS[parsed.getDay()]
}

function createWeatherIcon(name) {
  const ICONS = {
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

  const key = name?.toLowerCase()?.trim()
  const src = ICONS[key]

  const img = document.createElement('img')
  img.src = src || unknownIcon
  img.alt = src ? formatAltText(key) : 'Unknown weather condition'
  img.title = img.alt

  if (!src) {
    console.warn(`createWeatherIcon: unknown icon name "${name}"`)
  }

  return img
}

function formatAltText(str) {
  return str.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function mapCurrentConditions(raw) {
  return {
    icon: raw.icon,
    temp: raw.temp,
    conditions: raw.conditions,
    feelsLike: raw.feelslike,
    chanceOfRain: raw.precipprob,
    wind: raw.windspeed,
    sunrise: raw.sunrise,
    sunset: raw.sunset,
    uvIndex: raw.uvindex,
    pressure: raw.pressure,
    humidity: raw.humidity,
    gusts: raw.windgust,
    currentTime: raw.datetime
  }
}

function mapHourlyIcons(data) {
  const [h, m] = data.currentConditions.datetime.split(':').map(Number)
  let start = h + (m >= 45 ? 2 : 1)
  const icons = []
  let day = 0

  for (let i = 0; i < 8; i++) {
    let hour = start + i
    if (hour > 23) {
      hour -= 24
      day += 1
    }
    icons.push(data.days[day]?.hours[hour]?.icon || 'cloudy')
  }
  return icons
}

function mapDailyForecast(days) {
  return days.slice(0, 7).map(d => ({
    icon: d.icon,
    date: d.datetime,
    min: d.tempmin,
    max: d.tempmax
  }))
}

async function getWeatherData(location) {
  const unitGroup = Storage.get(STORAGE_KEYS.UNIT_GROUP, 'us')
  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}?unitGroup=${unitGroup}&key=JGM7G4V9AVASVNWUXBBZVPUPZ`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch weather data')

  const data = await res.json()
  const current = mapCurrentConditions(data.currentConditions)
  const hourlyIcons = mapHourlyIcons(data)
  const dailyData = mapDailyForecast(data.days)

  return { ...current, hourlyIcons, dailyData }
}
