export declare function sharedLibGetServerDate({ unixTimestamp, OFFSET_OVER_GMT }: {
    unixTimestamp: any;
    OFFSET_OVER_GMT: any;
}): {
    year: number;
    month: number;
    day: number;
    day_of_the_week: number;
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
};
export declare function sharedLibGetServerDay({ unixTimestamp, SERVER_DAY_OFFSET, OFFSET_OVER_GMT }: {
    unixTimestamp: any;
    SERVER_DAY_OFFSET: any;
    OFFSET_OVER_GMT: any;
}): number;
export declare function sharedLibGetInitialUnixTimestampOfServerDay({ serverDay, SERVER_DAY_OFFSET, OFFSET_OVER_GMT }: {
    serverDay: any;
    SERVER_DAY_OFFSET: any;
    OFFSET_OVER_GMT: any;
}): number;
