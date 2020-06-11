export declare function simulateAttack({ buildingID, buildingAmount, defensorGuards, attackerSabots, attackerThieves, defensorSecurityLvl, attackerSabotageLvl, defensorDefenseLvl, unprotectedMoney, }: {
    buildingID: any;
    buildingAmount: any;
    defensorGuards: any;
    attackerSabots: any;
    attackerThieves: any;
    defensorSecurityLvl: any;
    attackerSabotageLvl: any;
    defensorDefenseLvl: any;
    unprotectedMoney: any;
}): {
    result: string;
    killedGuards: number;
    killedThieves: number;
    killedSabots: number;
    gainedFame: number;
    destroyedBuildings: number;
    incomeForDestroyedBuildings: number;
    incomeForKilledTroops: number;
    attackerTotalIncome: number;
    realAttackerProfit: number;
    robbedMoney: number;
};
