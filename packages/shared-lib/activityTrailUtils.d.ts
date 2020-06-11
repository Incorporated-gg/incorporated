export declare enum ActivityTrailType {
    ATTACK_START = "attackStart",
    ATTACK_CANCEL = "attackCancel",
    ATTACK_FINISH = "attackFinish",
    SPY_START = "spyStart",
    SPY_CANCEL = "spyCancel",
    SPY_FINISH = "spyFinish",
    LOGIN = "login",
    CORP_CREATE = "corpCreate",
    CORP_DELETE = "corpDelete",
    CORP_LEAVE = "corpLeave",
    CORP_BUFF = "corpBuff",
    CORP_REQUEST = "corpRequest",
    CORP_KICK = "corpKick",
    CORP_REJECT = "corpReject",
    CORP_ACCEPT = "corpAccept",
    CORP_DEPOSIT = "corpDeposit",
    CORP_WITHDRAW = "corpWithdraw",
    CORP_INVEST = "corpInvest",
    BUILDING_BOUGHT = "buildingBought",
    BUILDING_EXTRACT = "buildingExtract",
    RESEARCH_START = "researchStart",
    RESEARCH_MANUALLY_ENDED = "researchManuallyEnded",
    RESEARCH_END = "researchEnd",
    PERSONNEL_HIRED = "personnelHired",
    PERSONNEL_FIRED = "personnelFired"
}
export interface ActivityTrailData {
    userId: number;
    date: number;
    ip: string;
    type: ActivityTrailType;
    message?: string;
    extra?: string;
}
export interface ActivityTrailDataForFrontend extends ActivityTrailData {
    username: string;
    userColor: string;
}
