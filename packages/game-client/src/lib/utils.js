import api from './api'
import { userData, reloadUserData } from './user'
import variables from '../_variables.scss'
import { getServerDate, getServerDay } from './serverTime'

export const DESKTOP_WIDTH_BREAKPOINT = parseInt(variables.breakpointDesktop)

/**
 * Converts a number to a human readable string. No guaranteed limit in chars (for really big numbers), but usually between 4 and 6
 * @param {Number} number
 * @returns {String} Number as string
 */
export function numberToAbbreviation(number) {
  const symbolStr = number < 0 ? '-' : ''
  number = Math.abs(number)

  if (number >= 1e9) {
    // Multi millions, after 1000M. No decimals
    const numStr = Math.floor(number / 1e6).toLocaleString()
    return symbolStr + numStr + 'M'
  }
  if (number >= 1e7) {
    // Millions, between 10M and 1000M. 1 decimal
    const numStr = (Math.floor((number / 1e6) * 10) / 10).toLocaleString()
    return symbolStr + numStr + 'M'
  }
  if (number >= 1e6) {
    // Single Millions, between 1M and 9.99M. 2 decimals
    let numStr = (Math.floor((number / 1e6) * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })
    return symbolStr + numStr + 'M'
  }

  if (number >= 1e5) {
    // Thousands, between 100,000 and 1M
    return symbolStr + Math.floor(number / 1e3) + 'K'
  }

  // Small numbers
  return symbolStr + Math.floor(number).toLocaleString()
}

export const getTimeUntil = (unixTimestamp, asString = false) => {
  // Set the date we're counting down to
  const countDownDate = unixTimestamp * 1000

  const diff = countDownDate - Date.now()
  let hours = Math.floor(diff / (1000 * 60 * 60))
  let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  let seconds = Math.floor((diff % (1000 * 60)) / 1000)

  hours = String(hours).padStart(2, '0')
  minutes = String(minutes).padStart(2, '0')
  seconds = String(seconds).padStart(2, '0')

  if (asString) {
    if (seconds < 0) return 'Completando...'
    if (hours > 0) return `${hours}:${minutes}:${seconds}`
    return `${minutes}:${seconds}`
  }

  return { hours, minutes, seconds }
}

export function getServerTimeString(unixTimestamp) {
  const serverTime = getServerDate(unixTimestamp * 1000)
  const serverDay = getServerDay(unixTimestamp * 1000)

  const hours = String(serverTime.hours).padStart(2, '0')
  const minutes = String(serverTime.minutes).padStart(2, '0')

  return `Día\xA0${serverDay}\xA0 [${hours}:${minutes}]`
}

export function debounce(func, wait, immediate) {
  var timeout
  return function() {
    var context = this
    var args = arguments
    var later = function() {
      timeout = null
      if (!immediate) func.apply(context, args)
    }
    var callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(context, args)
  }
}

export function throttle(func, wait, { leading = true, trailing = true } = {}) {
  var context, args, result
  var timeout = null
  var previous = 0
  var later = function() {
    previous = leading === false ? 0 : Date.now()
    timeout = null
    result = func.apply(context, args)
    if (!timeout) context = args = null
  }
  return function() {
    var now = Date.now()
    if (!previous && leading === false) previous = now
    var remaining = wait - (now - previous)
    context = this
    args = arguments
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      result = func.apply(context, args)
      if (!timeout) context = args = null
    } else if (!timeout && trailing !== false) {
      timeout = setTimeout(later, remaining)
    }
    return result
  }
}

export async function cancelActiveMission() {
  const activeMision = userData.active_mission
  if (!activeMision) return
  return await api.post('/v1/missions/cancel', { started_at: activeMision.started_at }).then(() => {
    reloadUserData()
  })
}

export function contestIDToName(contestName) {
  if (contestName === 'income') return 'Ingresos'
  if (contestName === 'research') return 'Investigaciones'
  if (contestName === 'destruction') return 'Destrucción'
  if (contestName === 'robbing') return 'Robo'
  return contestName
}
