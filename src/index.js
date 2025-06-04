import './styles.css'
import { Storage, STORAGE_KEYS } from './storage.js'
import { getUnit } from './units.js'
import { createWeatherIcon, UNIT_GROUP_ICONS } from './icons.js'
import { formatTime, formatHourOffset, formatDate, getDayName } from './formatters.js'
import { getWeatherData } from './api.js'

const form = document.getElementById('location-form')
const settingsButton = document.getElementById('settings-button')
const unitGroupToggle = document.getElementById('unit-group-toggle')

function switchUnitGroup() {
  const current = Storage.get(STORAGE_KEYS.UNIT_GROUP, 'us')
  const next = current === 'us' ? 'metric' : 'us'
  Storage.set(STORAGE_KEYS.UNIT_GROUP, next)
  return next
}

function updateUnitGroupUI(unitGroup) {
  const icon = unitGroupToggle.querySelector('img')
  const label = unitGroupToggle.querySelector('.text')
  icon.src = UNIT_GROUP_ICONS[unitGroup]
  label.textContent = unitGroup === 'us' ? 'Imperial' : 'Metric'
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

settingsButton.addEventListener('click', (e) => {
  e.stopPropagation()

  const isExpanded = settingsButton.getAttribute('aria-expanded') === 'true'
  if (!isExpanded) {
    settingsButton.setAttribute('aria-expanded', 'true')
  }
})

document.addEventListener('click', (e) => {
  const isExpanded = settingsButton.getAttribute('aria-expanded') === 'true'
  const clickedInside = settingsButton.contains(e.target)

  if (isExpanded && !clickedInside) {
    settingsButton.setAttribute('aria-expanded', 'false')
  }
})

unitGroupToggle.addEventListener('click', () => {
  const newUnitGroup = switchUnitGroup()
  updateUnitGroupUI(newUnitGroup)
  const location = Storage.get(STORAGE_KEYS.LOCATION)
  handleFormSubmit(null, location)
})

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
  const group = Storage.get(STORAGE_KEYS.UNIT_GROUP)
  const getById = id => document.getElementById(id)
  document.querySelector('.main-container img')?.remove()
  document.querySelector('.main-container').prepend(createWeatherIcon(data.icon))

  getById('temp').textContent = `${data.temp}${getUnit(group, 'temp')}`
  getById('conditions').textContent = data.conditions
  getById('min-temp').querySelector('.value').textContent = `${data.dailyData[0].min}${getUnit(group, 'temp')}`
  getById('max-temp').querySelector('.value').textContent = `${data.dailyData[0].max}${getUnit(group, 'temp')}`
  getById('feels-like').textContent = `Feels like ${data.feelsLike}${getUnit(group, 'temp')}`
  getById('chance-of-rain').textContent = `${data.chanceOfRain ?? 'N/A'}%`
  getById('wind').textContent = `${data.wind ?? 'N/A'} ${getUnit(group, 'speed')}`
  getById('sunrise').textContent = data.sunrise ? formatTime(data.sunrise) : 'N/A'
  getById('sunset').textContent = data.sunset ? formatTime(data.sunset) : 'N/A'
  getById('uv-index').textContent = data.uvIndex ?? 'N/A'
  getById('pressure').textContent = `${data.pressure} hPa`
  getById('humidity').textContent = data.humidity ? `${data.humidity}%` : 'N/A'
  getById('gusts').textContent = `${data.gusts ?? 0} ${getUnit(group, 'speed')}`
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
  const group = Storage.get(STORAGE_KEYS.UNIT_GROUP)
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
      block.innerHTML = `<div class="number">${value}${getUnit(group, 'temp')}</div><div class="text">${type}</div>`
      return block
    }

    temps.append(buildTemp('min', day.min), buildTemp('max', day.max))
    data.append(weekday, label, temps)
    card.append(iconWrap, data)
    container.appendChild(card)
  })
}
