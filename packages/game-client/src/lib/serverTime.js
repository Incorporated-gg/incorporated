import {
  sharedLibGetServerDate,
  sharedLibGetServerDay,
  sharedLibGetInitialUnixTimestampOfServerDay,
} from 'shared-lib/serverTimeUtils'

let SERVER_DATE_OFFSET_OVER_GMT = 0
let SERVER_DAY_OFFSET = 0
export function setServerTimeOffsets(serverData) {
  SERVER_DATE_OFFSET_OVER_GMT = serverData.SERVER_DATE_OFFSET_OVER_GMT
  SERVER_DAY_OFFSET = serverData.SERVER_DAY_OFFSET
}

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
