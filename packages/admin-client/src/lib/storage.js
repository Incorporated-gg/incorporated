export default {
  getItem(key, defaultValue) {
    if (!window.localStorage) return null
    const data = JSON.parse(window.localStorage.getItem(key))
    return data === null ? defaultValue : data
  },
  setItem(key, data) {
    if (!window.localStorage) return
    window.localStorage.setItem(key, JSON.stringify(data))
  },
  removeItem(key) {
    if (!window.localStorage) return
    window.localStorage.removeItem(key)
  },
}
