export function mapCurrentConditions(raw) {
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

export function mapHourlyIcons(data) {
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
    icons.push(data.days[day]?.hours[hour]?.icon)
  }
  return icons
}

export function mapDailyForecast(days) {
  return days.slice(0, 7).map(d => ({
    icon: d.icon,
    date: d.datetime,
    min: d.tempmin,
    max: d.tempmax
  }))
}