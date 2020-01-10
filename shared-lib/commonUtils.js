const timestampFromEpoch = epoch => {
  epoch *= 1000
  const date = new Date(epoch)
  const d = `${date.getDate()}`.padStart(2, '0')
  const mo = `${date.getMonth() + 1}`.padStart(2, '0')
  const y = `${date.getFullYear()}`.padStart(4, '0')
  const h = `${date.getHours()}`.padStart(2, '0')
  const m = `${date.getMinutes()}`.padStart(2, '0')
  const s = `${date.getSeconds()}`.padStart(2, '0')
  return `[${d}/${mo}/${y} ${h}:${m}:${s}]`
}

const msToDisplay = ms => {
  ms *= 1000
  // const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((ms % (1000 * 60)) / 1000)
  return `${minutes}:${seconds}`
}

module.exports = { timestampFromEpoch, msToDisplay }
