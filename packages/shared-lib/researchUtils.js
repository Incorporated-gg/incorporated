"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MANUALLY_FINISH_RESEARCH_UPGRADES_SECONDS = exports.calcResearchSecondsDuration = exports.calcResearchPrice = exports.researchList = void 0;
exports.researchList = [
    { id: 1, name: 'Espionaje', basePrice: 1200 },
    { id: 2, name: 'Ataque', basePrice: 2500 },
    { id: 3, name: 'Defensa', basePrice: 2500 },
    { id: 4, name: 'Banco', basePrice: 1500 },
    { id: 5, name: 'Oficina Central', basePrice: 15000 },
    { id: 6, name: 'Seguridad', basePrice: 1800 },
];
function calcResearchPrice(researchID, currentLevel) {
    const researchInfo = exports.researchList.find(r => r.id === researchID);
    const powerBase = researchID === 5 ? 1.75 : 1.3;
    return Math.round(researchInfo.basePrice * Math.pow(powerBase, currentLevel - 1));
}
exports.calcResearchPrice = calcResearchPrice;
function calcResearchSecondsDuration(researchID, currentLevel) {
    const researchInfo = exports.researchList.find(r => r.id === researchID);
    const powerExponent = researchID === 5 ? 4.5 : 3.75;
    const basePriceDivider = researchID === 5 ? 3600 : 1200;
    const researchTime = (currentLevel * 5 + Math.pow(currentLevel / 2, powerExponent)) * (researchInfo.basePrice / basePriceDivider);
    return Math.round(researchTime);
}
exports.calcResearchSecondsDuration = calcResearchSecondsDuration;
exports.MANUALLY_FINISH_RESEARCH_UPGRADES_SECONDS = 300;
