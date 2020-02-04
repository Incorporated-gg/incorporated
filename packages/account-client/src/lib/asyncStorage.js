export default {
  getItem(key, defaultValue) {
    if (!window.localStorage) return null
    const data = JSON.parse(window.localStorage.getItem(key))
    return Promise.resolve(data === null ? defaultValue : data)
  },
  setItem(key, data) {
    if (!window.localStorage) return
    window.localStorage.setItem(key, JSON.stringify(data))
    return Promise.resolve()
  },
  removeItem(key) {
    if (!window.localStorage) return
    window.localStorage.removeItem(key)
    return Promise.resolve()
  },
}
