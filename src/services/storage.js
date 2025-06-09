// storage.js
// Local storage utility with safe get/set methods

export const STORAGE_KEYS = {
  WEATHER: 'weather-data',
  HAS_RUN: 'has-run',
  UNIT_GROUP: 'unit-group',
  LOCATION: 'location',
  THEME: 'theme'
}

export const Storage = {
  // Get value from localStorage, with optional fallback
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : fallback
    } catch (err) {
      console.warn(`Storage.get("${key}"):`, err.message)
      return fallback
    }
  },

  // Set value in localStorage as JSON
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (err) {
      console.warn(`Storage.set("${key}"):`, err.message)
    }
  }
}