export function mapCurrentConditions(data) {
  return {
    icon: data.icon,
    temp: data.temp,
    conditions: data.conditions,
    feelsLike: data.feelslike,
    chanceOfRain: data.precipprob,
    wind: data.windspeed,
    sunrise: data.sunrise,
    sunset: data.sunset,
    uvIndex: data.uvindex,
    pressure: data.pressure,
    humidity: data.humidity,
    gusts: data.windgust,
    currentTime: data.datetime
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

export function mapModalData(data) {
  return {
    location: data.resolvedAddress,
    timezone: data.timezone,
    date: data.days[0]?.datetime,
    time: data.currentConditions?.datetime
  }
}