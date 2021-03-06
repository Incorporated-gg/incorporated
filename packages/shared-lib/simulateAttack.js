"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulateAttack = void 0;
const buildingsUtils_1 = require("./buildingsUtils");
const personnelUtils_1 = require("./personnelUtils");
const missionsUtils_1 = require("./missionsUtils");
function simulateCombat({ attackedBuildingInfo, buildingAmount, defensorSecurityLvl, attackerSabots, attackerThieves, defensorGuards, defensorDefenseLvl, attackerSabotageLvl, }) {
    const guardsPower = missionsUtils_1.calcGuardsPower(defensorDefenseLvl);
    const sabotPower = missionsUtils_1.calcSabotsPower(attackerSabotageLvl);
    const thievesPower = missionsUtils_1.calcThievesPower(attackerSabotageLvl);
    let survivingSabots = attackerSabots;
    let survivingThieves = attackerThieves;
    let survivingGuards = defensorGuards;
    if (survivingGuards > 0 && survivingSabots > 0) {
        const maxDeadSabots = Math.floor((survivingGuards * guardsPower) / sabotPower);
        const maxDeadGuardsFromSabots = Math.floor((survivingSabots * sabotPower) / guardsPower);
        survivingSabots = Math.max(0, survivingSabots - maxDeadSabots);
        survivingGuards = Math.max(0, survivingGuards - maxDeadGuardsFromSabots);
    }
    if (survivingGuards > 0 && survivingThieves > 0) {
        const maxDeadThieves = Math.floor((survivingGuards * guardsPower) / thievesPower);
        const maxDeadGuardsFromThieves = Math.floor((survivingThieves * thievesPower) / guardsPower);
        survivingThieves = Math.max(0, survivingThieves - maxDeadThieves);
        survivingGuards = Math.max(0, survivingGuards - maxDeadGuardsFromThieves);
    }
    const killedSabots = attackerSabots - survivingSabots;
    const killedThieves = attackerThieves - survivingThieves;
    const killedGuards = defensorGuards - survivingGuards;
    const buildingResistance = buildingsUtils_1.calcBuildingResistance(attackedBuildingInfo.id, defensorSecurityLvl);
    const attackPowerVsBuildings = Math.max(0, survivingSabots * sabotPower + survivingThieves * thievesPower);
    const theoreticalDestroyedBuildings = Math.floor(attackPowerVsBuildings / buildingResistance);
    const destroyedBuildings = Math.min(attackedBuildingInfo.maximumDestroyedBuildings, buildingAmount, theoreticalDestroyedBuildings);
    return {
        destroyedBuildings,
        killedGuards,
        killedThieves,
        killedSabots,
        survivingGuards,
        survivingThieves,
    };
}
function simulateAttack({ buildingID, buildingAmount, defensorGuards, attackerSabots, attackerThieves, defensorSecurityLvl, attackerSabotageLvl, defensorDefenseLvl, unprotectedMoney, }) {
    if (typeof buildingID === 'undefined') {
        throw new Error(`Missing param ${'buildingID'} for attack simulation`);
    }
    if (typeof buildingAmount === 'undefined') {
        throw new Error(`Missing param ${'buildingAmount'} for attack simulation`);
    }
    if (typeof defensorGuards === 'undefined') {
        throw new Error(`Missing param ${'defensorGuards'} for attack simulation`);
    }
    if (typeof attackerSabots === 'undefined') {
        throw new Error(`Missing param ${'attackerSabots'} for attack simulation`);
    }
    if (typeof attackerThieves === 'undefined') {
        throw new Error(`Missing param ${'attackerThieves'} for attack simulation`);
    }
    if (typeof defensorSecurityLvl === 'undefined') {
        throw new Error(`Missing param ${'defensorSecurityLvl'} for attack simulation`);
    }
    if (typeof attackerSabotageLvl === 'undefined') {
        throw new Error(`Missing param ${'attackerSabotageLvl'} for attack simulation`);
    }
    if (typeof defensorDefenseLvl === 'undefined') {
        throw new Error(`Missing param ${'defensorDefenseLvl'} for attack simulation`);
    }
    if (typeof unprotectedMoney === 'undefined') {
        throw new Error(`Missing param ${'unprotectedMoney'} for attack simulation`);
    }
    const attackedBuildingInfo = buildingsUtils_1.buildingsList.find(b => b.id === buildingID);
    buildingID = parseInt(buildingID);
    buildingAmount = parseInt(buildingAmount);
    defensorGuards = parseInt(defensorGuards);
    attackerSabots = parseInt(attackerSabots);
    attackerThieves = parseInt(attackerThieves);
    defensorSecurityLvl = parseInt(defensorSecurityLvl);
    attackerSabotageLvl = parseInt(attackerSabotageLvl);
    defensorDefenseLvl = parseInt(defensorDefenseLvl);
    unprotectedMoney = parseInt(unprotectedMoney);
    const { destroyedBuildings, killedGuards, killedThieves, killedSabots, survivingGuards, survivingThieves, } = simulateCombat({
        buildingAmount,
        attackedBuildingInfo,
        defensorDefenseLvl,
        attackerSabots,
        attackerThieves,
        defensorGuards,
        defensorSecurityLvl,
        attackerSabotageLvl,
    });
    const result = survivingGuards > 0 ? 'lose' : destroyedBuildings > 0 ? 'win' : 'draw';
    const killedGuardsPrice = killedGuards * personnelUtils_1.PERSONNEL_OBJ.guards.price;
    const killedSabotsPrice = killedSabots * personnelUtils_1.PERSONNEL_OBJ.sabots.price;
    const killedThievesPrice = killedThieves * personnelUtils_1.PERSONNEL_OBJ.thieves.price;
    const incomeForDestroyedBuildings = buildingsUtils_1.getBuildingDestroyedProfit({
        buildingID,
        buildingAmount,
        destroyedBuildings,
    });
    const maxRobbedMoney = survivingThieves * personnelUtils_1.PERSONNEL_OBJ.thieves.robbingPower;
    const robbedMoney = Math.min(maxRobbedMoney, unprotectedMoney);
    const incomeForKilledTroops = killedGuardsPrice * 0.1;
    const attackerTotalIncome = incomeForKilledTroops + incomeForDestroyedBuildings + robbedMoney;
    const realAttackerProfit = attackerTotalIncome - killedSabotsPrice - killedThievesPrice;
    const gainedFame = destroyedBuildings * attackedBuildingInfo.fame;
    return {
        result,
        killedGuards,
        killedThieves,
        killedSabots,
        gainedFame,
        destroyedBuildings,
        incomeForDestroyedBuildings,
        incomeForKilledTroops,
        attackerTotalIncome,
        realAttackerProfit,
        robbedMoney,
    };
}
exports.simulateAttack = simulateAttack;
