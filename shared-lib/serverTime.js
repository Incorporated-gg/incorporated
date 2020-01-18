const SERVER_DAY_OFFSET = 18277
function getServerDay(unixTimestamp = Date.now()) {
  const serverDate = getServerDate(unixTimestamp)
  const dayStartDate = new Date(serverDate.year, serverDate.month - 1, serverDate.day)
  const firstTimestamp = Math.floor(dayStartDate.getTime() / 1000)
  return Math.floor(firstTimestamp / 60 / 60 / 24) - SERVER_DAY_OFFSET
}
module.exports.getServerDay = getServerDay

const OFFSET_OVER_GMT = 3 * 60 * 60 * 1000
function getServerDate(unixTimestamp = Date.now()) {
  // GMT-3
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

function getInitialUnixTimestampOfServerDay(serverDay = getServerDay()) {
  const dayStartDate = new Date((serverDay + 1 + SERVER_DAY_OFFSET) * 24 * 60 * 60 * 1000 - OFFSET_OVER_GMT)
  return dayStartDate.getTime()
}
module.exports.getInitialUnixTimestampOfServerDay = getInitialUnixTimestampOfServerDay
