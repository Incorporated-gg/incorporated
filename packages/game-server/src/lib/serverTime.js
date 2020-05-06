import {
  sharedLibGetServerDate,
  sharedLibGetServerDay,
  sharedLibGetInitialUnixTimestampOfServerDay,
} from 'shared-lib/serverTimeUtils'

export const SERVER_DATE_OFFSET_OVER_GMT = parseInt(process.env.SERVER_DATE_OFFSET_OVER_GMT)
export const SERVER_DAY_OFFSET = parseInt(process.env.SERVER_DAY_OFFSET)

export function getServerDate(unixTimestamp = Date.now()) {
  return sharedLibGetServerDate({
    unixTimestamp,
    OFFSET_OVER_GMT: SERVER_DATE_OFFSET_OVER_GMT,
  })
}

export function getServerDay(unixTimestamp = Date.now()) {
  return sharedLibGetServerDay({
    unixTimestamp,
    SERVER_DAY_OFFSET,
    OFFSET_OVER_GMT: SERVER_DATE_OFFSET_OVER_GMT,
  })
}

export function getInitialUnixTimestampOfServerDay(serverDay = getServerDay()) {
  return sharedLibGetInitialUnixTimestampOfServerDay({
    serverDay,
    SERVER_DAY_OFFSET,
    OFFSET_OVER_GMT: SERVER_DATE_OFFSET_OVER_GMT,
  })
}
