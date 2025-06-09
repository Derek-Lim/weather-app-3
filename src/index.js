// =======================
// Imports
// =======================
import './css/index.css'
import { Storage, STORAGE_KEYS } from './services/storage.js'
import { getUnit } from './data/units.js'
import { createWeatherIcon, THEME_ICONS, UNIT_GROUP_ICONS } from './utils/icons.js'
import { formatTime, formatHourOffset, formatDate, getDayName } from './data/formatters.js'
import { getWeatherData } from './services/api.js'

// =======================
// DOM Utilities
// =======================
const getById = id => document.getElementById(id)

// =======================
// Element References
// =======================
const form = getById('location-form')
const settingsButton = getById('settings-button')
const unitGroupToggle = getById('unit-group-toggle')
const themeToggle = getById('theme-toggle')
const modal = document.querySelector('[data-modal]')
const openModalBtn = document.querySelector('[data-open-modal]')
const closeModalBtn = document.querySelector('[data-close-modal]')

// =======================
// Event Listeners
// =======================

// Modal toggle
openModalBtn.addEventListener('click', () => {
  if (isSettingsExpanded()) modal.showModal()
})
closeModalBtn.addEventListener('click', () => modal.close())
modal.addEventListener('click', e => {
  const rect = modal.getBoundingClientRect()
  if (
    e.clientX < rect.left || e.clientX > rect.right ||
    e.clientY < rect.top || e.clientY > rect.bottom
  ) modal.close()
})
modal.addEventListener('keydown', e => {
  if (e.key === 'Escape') modal.close()
})

// Settings toggle
settingsButton.addEventListener('click', e => {
  e.stopPropagation()
  if (!isSettingsExpanded()) settingsButton.setAttribute('aria-expanded', 'true')
})

document.addEventListener('click', e => {
  if (isSettingsExpanded() && !settingsButton.contains(e.target)) {
    settingsButton.setAttribute('aria-expanded', 'false')
  }
})

// Form submission
form.addEventListener('submit', handleFormSubmit)

// Unit toggle
unitGroupToggle.addEventListener('click', () => {
  if (isSettingsExpanded()) {
    const newGroup = switchUnitGroup()
    updateUnitGroupUI(newGroup)
    fetchAndRenderWeather(Storage.get(STORAGE_KEYS.LOCATION))
  }
})

// Theme toggle
themeToggle.addEventListener('click', () => {
  if (isSettingsExpanded()) {
    const newTheme = switchTheme()
    updateThemeUI(newTheme)
  }
})

// =======================
// App Initialization
// =======================
document.addEventListener('DOMContentLoaded', () => {
  const unitGroup = Storage.get(STORAGE_KEYS.UNIT_GROUP, 'us')
  const theme = Storage.get(STORAGE_KEYS.THEME, 'light')
  const location = Storage.get(STORAGE_KEYS.LOCATION)
  const hasRun = Storage.get(STORAGE_KEYS.HAS_RUN)

  updateUnitGroupUI(unitGroup)
  updateThemeUI(theme)
  document.body.setAttribute('data-theme', theme)

  if (hasRun && location) {
    fetchAndRenderWeather(location)
  } else {
    const defaultLocation = 'Silver Spring'
    Storage.set(STORAGE_KEYS.HAS_RUN, true)
    Storage.set(STORAGE_KEYS.UNIT_GROUP, unitGroup)
    Storage.set(STORAGE_KEYS.THEME, 'light')
    Storage.set(STORAGE_KEYS.LOCATION, defaultLocation)
    fetchAndRenderWeather(defaultLocation)
  }
})

// =======================
// UI State Helpers
// =======================
function isSettingsExpanded() {
  return settingsButton.getAttribute('aria-expanded') === 'true'
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
  icon.src = UNIT_GROUP_ICONS[unitGroup]
  label.textContent = unitGroup === 'us' ? 'Imperial' : 'Metric'
}

function switchTheme() {
  const current = Storage.get(STORAGE_KEYS.THEME, 'light')
  const next = current === 'light' ? 'dark' : 'light'
  Storage.set(STORAGE_KEYS.THEME, next)
  document.body.setAttribute('data-theme', next)
  return next
}

function updateThemeUI(theme) {
  const icon = themeToggle.querySelector('img')
  const label = themeToggle.querySelector('.text')
  icon.src = THEME_ICONS[theme]
  label.textContent = theme === 'light' ? 'Light' : 'Dark'
}

function applyFadeIn(element) {
  element.classList.remove('fade-in')
  void element.offsetWidth
  element.classList.add('fade-in')
}

// =======================
// Core App Logic
// =======================
async function handleFormSubmit(event) {
  event.preventDefault()
  const input = form.querySelector('input')
  const location = input.value.trim()
  if (!location) return console.warn('No location entered')

  input.value = ''
  Storage.set(STORAGE_KEYS.LOCATION, location)
  await fetchAndRenderWeather(location)
}

async function fetchAndRenderWeather(location) {
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
    renderModal(data.modalData)
  } catch (err) {
    console.error('Error rendering weather:', err.message)
  }
}

// =======================
// Render Helpers
// =======================
function renderCurrent(data) {
  const group = Storage.get(STORAGE_KEYS.UNIT_GROUP)

  const iconContainer = document.querySelector('.main-container')
  const oldIcon = iconContainer.querySelector('img')
  if (oldIcon) oldIcon.remove()
  const newIcon = createWeatherIcon(data.icon)
  applyFadeIn(newIcon)
  iconContainer.prepend(newIcon)

  const elements = [
    [getById('temp'), `${data.temp}${getUnit(group, 'temp')}`],
    [getById('conditions'), data.conditions],
    [getById('min-temp').querySelector('.value'), `${data.dailyData[0].min}${getUnit(group, 'temp')}`],
    [getById('max-temp').querySelector('.value'), `${data.dailyData[0].max}${getUnit(group, 'temp')}`],
    [getById('feels-like'), `Feels like ${data.feelsLike}${getUnit(group, 'temp')}`],
    [getById('chance-of-rain'), `${data.chanceOfRain ?? 'N/A'}%`],
    [getById('wind'), `${data.wind ?? 'N/A'} ${getUnit(group, 'speed')}`],
    [getById('sunrise'), data.sunrise ? formatTime(data.sunrise) : 'N/A'],
    [getById('sunset'), data.sunset ? formatTime(data.sunset) : 'N/A'],
    [getById('uv-index'), data.uvIndex ?? 'N/A'],
    [getById('pressure'), `${data.pressure} hPa`],
    [getById('humidity'), data.humidity ? `${data.humidity}%` : 'N/A'],
    [getById('gusts'), `${data.gusts ?? 0} ${getUnit(group, 'speed')}`],
  ]

  for (const [el, text] of elements) {
    el.textContent = text
    applyFadeIn(el)
  }
}

function renderHourly(currentTime, icons) {
  const container = getById('hourly-data-container')
  container.textContent = ''

  icons.forEach((icon, offset) => {
    const card = document.createElement('div')
    card.className = 'card fade-in'
    card.style.animationDelay = `${offset * 100}ms`

    const time = document.createElement('div')
    time.textContent = formatHourOffset(currentTime, offset)

    const image = createWeatherIcon(icon)

    card.append(time, image)
    container.appendChild(card)
  })
}

function renderWeek(days) {
  const group = Storage.get(STORAGE_KEYS.UNIT_GROUP)
  const container = getById('week-data-container')
  container.textContent = ''

  days.slice(1).forEach((day, offset) => {
    const card = document.createElement('div')
    card.className = 'card fade-in'
    card.style.animationDelay = `${offset * 200}ms`

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

function renderModal(data) {
  getById('location').textContent = data.location
  getById('timezone').textContent = data.timezone.replace('_', ' ')
  getById('date').textContent = formatDate(data.date)
  getById('time').textContent = formatTime(data.time)
}
