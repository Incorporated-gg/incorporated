"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sharedLibGetInitialUnixTimestampOfServerDay = exports.sharedLibGetServerDay = exports.sharedLibGetServerDate = void 0;
function sharedLibGetServerDate({ unixTimestamp, OFFSET_OVER_GMT }) {
    let date = new Date(unixTimestamp);
    date = new Date(date.getTime() + OFFSET_OVER_GMT);
    return {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
        day_of_the_week: date.getUTCDay(),
        hours: date.getUTCHours(),
        minutes: date.getUTCMinutes(),
        seconds: date.getUTCSeconds(),
        milliseconds: date.getUTCMilliseconds(),
    };
}
exports.sharedLibGetServerDate = sharedLibGetServerDate;
function sharedLibGetServerDay({ unixTimestamp, SERVER_DAY_OFFSET, OFFSET_OVER_GMT }) {
    const serverDate = sharedLibGetServerDate({ unixTimestamp, OFFSET_OVER_GMT });
    const dayStartDate = new Date(Date.UTC(serverDate.year, serverDate.month - 1, serverDate.day));
    const firstTimestamp = Math.floor(dayStartDate.getTime() / 1000);
    return Math.floor(firstTimestamp / 60 / 60 / 24) - SERVER_DAY_OFFSET;
}
exports.sharedLibGetServerDay = sharedLibGetServerDay;
function sharedLibGetInitialUnixTimestampOfServerDay({ serverDay, SERVER_DAY_OFFSET, OFFSET_OVER_GMT }) {
    const dayStartDate = new Date((serverDay + SERVER_DAY_OFFSET) * 24 * 60 * 60 * 1000 - OFFSET_OVER_GMT);
    return dayStartDate.getTime();
}
exports.sharedLibGetInitialUnixTimestampOfServerDay = sharedLibGetInitialUnixTimestampOfServerDay;
