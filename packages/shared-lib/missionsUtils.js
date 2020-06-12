"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcSpyInformationPercentageRange = exports.calcSpyFailProbabilities = exports.calcSpiesPower = exports.calcGuardsPower = exports.calcThievesPower = exports.calcSabotsPower = exports.calculateMissionTime = exports.calculateMaxDailyReceivedAttacks = exports.calculateIsInAttackRange = exports.MAX_ACCUMULATED_ATTACKS = exports.NEWBIE_ZONE_DAILY_INCOME = void 0;
const personnelUtils_1 = require("./personnelUtils");
exports.NEWBIE_ZONE_DAILY_INCOME = 750000;
exports.MAX_ACCUMULATED_ATTACKS = 6;
function calculateIsInAttackRange(attackerDailyIncome, defenderDailyIncome) {
    if (process.env.NODE_ENV === 'development')
        return true;
    if (attackerDailyIncome < exports.NEWBIE_ZONE_DAILY_INCOME || defenderDailyIncome < exports.NEWBIE_ZONE_DAILY_INCOME)
        return false;
    const maxIncome = attackerDailyIncome * 1.2 + 2000000;
    const minIncome = (attackerDailyIncome - 2000000) / 1.2;
    return defenderDailyIncome >= minIncome && defenderDailyIncome <= maxIncome;
}
exports.calculateIsInAttackRange = calculateIsInAttackRange;
function calculateMaxDailyReceivedAttacks(dailyIncome) {
    if (dailyIncome < 2e6)
        return 3;
    if (dailyIncome < 4e6)
        return 4;
    if (dailyIncome < 8e6)
        return 5;
    return 6 + Math.ceil((dailyIncome - 15e6) / 10e6);
}
exports.calculateMaxDailyReceivedAttacks = calculateMaxDailyReceivedAttacks;
function calculateMissionTime(missionType) {
    if (missionType === 'attack')
        return process.env.NODE_ENV === 'development' ? 5 : 300;
    if (missionType === 'spy')
        return process.env.NODE_ENV === 'development' ? 5 : 60;
    return 0;
}
exports.calculateMissionTime = calculateMissionTime;
function calcSabotsPower(sabotageResearchLvl) {
    return personnelUtils_1.PERSONNEL_OBJ.sabots.combatPower * sabotageResearchLvl;
}
exports.calcSabotsPower = calcSabotsPower;
function calcThievesPower(sabotageResearchLvl) {
    return personnelUtils_1.PERSONNEL_OBJ.thieves.combatPower * sabotageResearchLvl;
}
exports.calcThievesPower = calcThievesPower;
function calcGuardsPower(securityResearchLvl) {
    return personnelUtils_1.PERSONNEL_OBJ.guards.combatPower * securityResearchLvl;
}
exports.calcGuardsPower = calcGuardsPower;
function calcSpiesPower(spyResearchLvl) {
    return 2 * spyResearchLvl;
}
exports.calcSpiesPower = calcSpiesPower;
function calcEspionageDefensePower(spyResearchLvl) {
    return 5 * Math.pow(spyResearchLvl, 2.2);
}
function calcSpyFailProbabilities({ resLvlAttacker, resLvLDefender, spiesSent }) {
    let spiesProbability = (4 * spiesSent) / resLvlAttacker;
    spiesProbability = Math.min(100, Math.max(0, spiesProbability));
    let lvlProbability = 5 + (4 + Math.max(resLvLDefender, resLvlAttacker) / 4) * (resLvLDefender - resLvlAttacker);
    lvlProbability = Math.min(100, Math.max(-999, lvlProbability));
    return {
        spies: spiesProbability,
        level: lvlProbability,
        total: Math.min(100, Math.max(0, spiesProbability + lvlProbability)),
    };
}
exports.calcSpyFailProbabilities = calcSpyFailProbabilities;
function calcSpyInformationPercentageRange({ resLvlAttacker, resLvLDefender, spiesRemaining }) {
    const defensePower = calcEspionageDefensePower(resLvLDefender);
    const attackPower = calcSpiesPower(resLvlAttacker) * spiesRemaining;
    const randomPercentage = { min: -10, max: 10 };
    const powerPercentage = (attackPower / defensePower) * 100;
    return {
        min: Math.max(0, Math.min(100, powerPercentage + randomPercentage.min)),
        max: Math.max(0, Math.min(100, powerPercentage + randomPercentage.max)),
    };
}
exports.calcSpyInformationPercentageRange = calcSpyInformationPercentageRange;
