const OFFSET_OVER_GMT = 3 * 60 * 60 * 1000 // GMT-3
function getServerDate(unixTimestamp = Date.now()) {
  let date = new Date(unixTimestamp)
  date = new Date(date.getTime() + OFFSET_OVER_GMT)
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    day_of_the_week: date.getUTCDay(),
    hours: date.getUTCHours(),
    minutes: date.getUTCMinutes(),
    seconds: date.getUTCSeconds(),
    milliseconds: date.getUTCMilliseconds(),
  }
}
module.exports.getServerDate = getServerDate

const SERVER_DAY_OFFSET = 18270
function getServerDay(unixTimestamp = Date.now()) {
  const serverDate = getServerDate(unixTimestamp)
  const dayStartDate = new Date(Date.UTC(serverDate.year, serverDate.month - 1, serverDate.day))
  const firstTimestamp = Math.floor(dayStartDate.getTime() / 1000)
  return Math.floor(firstTimestamp / 60 / 60 / 24) - SERVER_DAY_OFFSET
}
module.exports.getServerDay = getServerDay

function getInitialUnixTimestampOfServerDay(serverDay = getServerDay()) {
  const dayStartDate = new Date((serverDay + SERVER_DAY_OFFSET) * 24 * 60 * 60 * 1000 - OFFSET_OVER_GMT)
  return dayStartDate.getTime()
}
module.exports.getInitialUnixTimestampOfServerDay = getInitialUnixTimestampOfServerDay
