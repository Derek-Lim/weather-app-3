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

const form = document.getElementById('location-form')
form.addEventListener('submit', handleFormSubmit)

async function handleFormSubmit(event) {
  event.preventDefault()
  const location = form.querySelector('input').value.trim()
  if (!location) return console.warn('No location entered')

  try {
    const weatherData = await getWeatherData(location)
    renderWeather(weatherData)
    console.log(JSON.stringify(weatherData, null, 2))
  } catch (err) {
    console.error('Error fetching weather data:', err.message)
    alert('Failed to load weather data. Please try another location.')
  }
}

function renderWeather(data) {
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
  getById('temp').textContent = `${data.temp}°`
  getById('conditions').textContent = data.conditions
  el('#min-temp .value').textContent = `${data.dailyData[0].min}°`
  el('#max-temp .value').textContent = `${data.dailyData[0].max}°`
  getById('feels-like').textContent = `Feels like ${data.feelsLike}°`
  getById('chance-of-rain').textContent = `${data.chanceOfRain ?? 'N/A'}%`
  getById('wind').textContent = `${data.wind ?? 'N/A'} mph`
  getById('sunrise').textContent = data.sunrise ? formatTime(data.sunrise) : 'N/A'
  getById('sunset').textContent = data.sunset ? formatTime(data.sunset) : 'N/A'
  getById('uv-index').textContent = data.uvIndex ?? 'N/A'
  getById('pressure').textContent = data.pressure ? `${data.pressure} inHg` : 'N/A'
  getById('humidity').textContent = data.humidity ? `${data.humidity}%` : 'N/A'
  getById('gusts').textContent = data.gusts ? `${data.gusts} mph` : '0 mph'
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

  days.forEach(day => {
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
      block.innerHTML = `<div class="number">${value}°</div><div class="text">${type}</div>`
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
  return days.slice(1, 7).map(d => ({
    icon: d.icon,
    date: d.datetime,
    min: d.tempmin,
    max: d.tempmax
  }))
}

async function getWeatherData(location) {
  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}?key=JGM7G4V9AVASVNWUXBBZVPUPZ`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch weather data')

  const data = await res.json()
  const current = mapCurrentConditions(data.currentConditions)
  const hourlyIcons = mapHourlyIcons(data)
  const dailyData = mapDailyForecast(data.days)

  return { ...current, hourlyIcons, dailyData }
}
