const timestampFromEpoch = epoch => {
  epoch *= 1000
  const date = new Date(epoch)
  return `[${date.toLocaleString()}]`
}

const msToDisplay = ms => {
  ms *= 1000
  // const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((ms % (1000 * 60)) / 1000)
  return `${minutes}:${seconds}`
}

module.exports = { timestampFromEpoch, msToDisplay }
