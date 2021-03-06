"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityTrailType = void 0;
var ActivityTrailType;
(function (ActivityTrailType) {
    ActivityTrailType["ATTACK_START"] = "attackStart";
    ActivityTrailType["ATTACK_CANCEL"] = "attackCancel";
    ActivityTrailType["ATTACK_FINISH"] = "attackFinish";
    ActivityTrailType["SPY_START"] = "spyStart";
    ActivityTrailType["SPY_CANCEL"] = "spyCancel";
    ActivityTrailType["SPY_FINISH"] = "spyFinish";
    ActivityTrailType["LOGIN"] = "login";
    ActivityTrailType["CORP_CREATE"] = "corpCreate";
    ActivityTrailType["CORP_DELETE"] = "corpDelete";
    ActivityTrailType["CORP_LEAVE"] = "corpLeave";
    ActivityTrailType["CORP_BUFF"] = "corpBuff";
    ActivityTrailType["CORP_REQUEST"] = "corpRequest";
    ActivityTrailType["CORP_KICK"] = "corpKick";
    ActivityTrailType["CORP_REJECT"] = "corpReject";
    ActivityTrailType["CORP_ACCEPT"] = "corpAccept";
    ActivityTrailType["CORP_DEPOSIT"] = "corpDeposit";
    ActivityTrailType["CORP_WITHDRAW"] = "corpWithdraw";
    ActivityTrailType["CORP_INVEST"] = "corpInvest";
    ActivityTrailType["BUILDING_BOUGHT"] = "buildingBought";
    ActivityTrailType["BUILDING_EXTRACT"] = "buildingExtract";
    ActivityTrailType["RESEARCH_START"] = "researchStart";
    ActivityTrailType["RESEARCH_MANUALLY_ENDED"] = "researchManuallyEnded";
    ActivityTrailType["RESEARCH_END"] = "researchEnd";
    ActivityTrailType["PERSONNEL_HIRED"] = "personnelHired";
    ActivityTrailType["PERSONNEL_FIRED"] = "personnelFired";
})(ActivityTrailType = exports.ActivityTrailType || (exports.ActivityTrailType = {}));
