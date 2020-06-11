"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHoodBenefitValue = exports.calcHoodDailyServerPoints = exports.calcHoodMaxGuards = exports.calcHoodUpgradePrice = exports.HOOD_ATTACK_PROTECTION_TIME = void 0;
exports.HOOD_ATTACK_PROTECTION_TIME = 60 * 60 * 24;
function calcHoodUpgradePrice(hoodLevel) {
    return 40000 * (hoodLevel + 2);
}
exports.calcHoodUpgradePrice = calcHoodUpgradePrice;
function calcHoodMaxGuards(hoodLevel) {
    return 3000 + 200 * (hoodLevel + 0.5 * hoodLevel * (hoodLevel + 1));
}
exports.calcHoodMaxGuards = calcHoodMaxGuards;
function calcHoodDailyServerPoints(hoodTier) {
    const map = {
        1: 10,
        2: 15,
        3: 20,
        4: 25,
        5: 40,
    };
    return map[hoodTier];
}
exports.calcHoodDailyServerPoints = calcHoodDailyServerPoints;
function getHoodBenefitValue(benefit, hoodTier) {
    if (benefit === 'alliance_research_sabots' ||
        benefit === 'alliance_research_guards' ||
        benefit === 'alliance_research_thieves') {
        return hoodTier;
    }
    if (benefit === 'extra_income') {
        return hoodTier;
    }
    if (benefit === 'player_research_security' ||
        benefit === 'player_research_espionage' ||
        benefit === 'player_research_defense') {
        return hoodTier - 3;
    }
    throw new Error('Unknown benefit');
}
exports.getHoodBenefitValue = getHoodBenefitValue;
