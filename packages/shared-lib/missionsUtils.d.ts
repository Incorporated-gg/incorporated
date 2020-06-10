export declare const NEWBIE_ZONE_DAILY_INCOME = 750000;
export declare const MAX_ACCUMULATED_ATTACKS = 6;
export declare function calculateIsInAttackRange(attackerDailyIncome: any, defenderDailyIncome: any): boolean;
export declare function calculateMaxDailyReceivedAttacks(dailyIncome: any): number;
export declare function calculateMissionTime(missionType: any): 0 | 5 | 60 | 300;
export declare function calcSabotsPower(sabotageResearchLvl: any): number;
export declare function calcThievesPower(sabotageResearchLvl: any): number;
export declare function calcGuardsPower(securityResearchLvl: any): number;
export declare function calcSpiesPower(spyResearchLvl: any): number;
export declare function calcSpyFailProbabilities({ resLvlAttacker, resLvLDefender, spiesSent }: {
    resLvlAttacker: any;
    resLvLDefender: any;
    spiesSent: any;
}): {
    spies: number;
    level: number;
    total: number;
};
export declare function calcSpyInformationPercentageRange({ resLvlAttacker, resLvLDefender, spiesRemaining }: {
    resLvlAttacker: any;
    resLvLDefender: any;
    spiesRemaining: any;
}): {
    min: number;
    max: number;
};
