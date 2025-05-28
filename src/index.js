import './styles.css'

const form = document.getElementById('location-form')
form.addEventListener('submit', handleSubmit)

function getLocation() {
  return form.querySelector('input').value.trim()
}

async function handleSubmit(event) {
  event.preventDefault()
  const location = getLocation()
  if (!location) {
    console.warn('No location entered.')
    return
  }
  try {
    const weatherData = await getWeatherData(location)
    console.log('Altered:\n' + JSON.stringify(weatherData, null, 2))
  } catch (error) {
    console.error('Error fetching weather data:', error)
  }
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

function mapHourlyIcons(hours) {
  return hours.slice(0, 8).map(hour => hour.icon)
}

function mapDailyForecast(days) {
  return days.slice(0, 7).map(day => ({
    icon: day.icon,
    date: day.datetime,
    min: day.tempmin,
    max: day.tempmax
  }))
}

async function getWeatherData(location) {
  const endpoint = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}?key=JGM7G4V9AVASVNWUXBBZVPUPZ`

  const response = await fetch(endpoint)
  if (!response.ok) {
    throw new Error('Failed to fetch weather data')
  }
  const weatherData = await response.json()
  console.log(weatherData)

  const current = mapCurrentConditions(weatherData.currentConditions)
  const hourlyIcons = mapHourlyIcons(weatherData.days[0].hours)
  const dailyData = mapDailyForecast(weatherData.days)

  return {
    ...current,
    hourlyIcons,
    dailyData
  }
}