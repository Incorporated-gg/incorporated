const getTimeUntil = epochTimestamp => {
  // Set the date we're counting down to
  const countDownDate = new Date(epochTimestamp * 1000).getTime()

  // Get todays date and time
  const now = new Date().getTime()

  // Find the distance between now and the count down date
  const distance = countDownDate - now

  // Time calculations for days, hours, minutes and seconds
  /* const days = String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0')
  const hours = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0') */
  const minutes = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0')
  const seconds = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0')

  return {
    minutes,
    seconds,
  }
}

module.exports = {
  getTimeUntil,
}
