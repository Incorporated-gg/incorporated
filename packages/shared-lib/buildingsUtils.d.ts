export declare const buildingsList: {
    id: number;
    name: string;
    nameGender: string;
    basePrice: number;
    baseIncome: number;
    maximumDestroyedBuildings: number;
    requiredOptimizeResearchLevel: number;
    resistanceDivider: number;
    fame: number;
}[];
export declare function calcBuildingPrice(buildingID: any, currentAmount: any): number;
export declare function calcBuildingDailyIncome(buildingID: any, currentAmount: any, optimizeResearchLevel: any): number;
export declare function calcBuildingResistance(buildingID: any, infraLevel: any): number;
export declare function calcBuildingMaxMoney({ buildingID, buildingAmount, bankResearchLevel }: {
    buildingID: any;
    buildingAmount: any;
    bankResearchLevel: any;
}): {
    maxSafe: number;
    maxTotal: number;
};
export declare function getBuildingDestroyedProfit({ buildingID, buildingAmount, destroyedBuildings }: {
    buildingID: any;
    buildingAmount: any;
    destroyedBuildings: any;
}): number;
