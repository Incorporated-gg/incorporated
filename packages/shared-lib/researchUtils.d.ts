export declare const researchList: {
    id: number;
    name: string;
    basePrice: number;
}[];
export declare function calcResearchPrice(researchID: any, currentLevel: any): number;
export declare function calcResearchSecondsDuration(researchID: any, currentLevel: any): number;
export declare const MANUALLY_FINISH_RESEARCH_UPGRADES_SECONDS = 300;
