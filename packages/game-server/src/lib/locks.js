const locks = new Map()

export default {
  get(key) {
    const lock = locks.get(key)
    if (!lock) return undefined
    return lock.value
  },
  set(key, value) {
    locks.set(key, value)
  },
  remove(key) {
    locks.delete(key)
  },
}
