export declare const CREATE_ALLIANCE_PRICE = 50000;
export declare const MAX_ALLIANCE_MEMBERS = 8;
export declare const WAR_DAYS_DURATION = 5;
export declare const ALLIANCE_RESEARCHS: {
    2: {
        id: number;
        name: string;
        resourceGeneratedName: string;
        pricePerLvl: number;
        type: string;
    };
    3: {
        id: number;
        name: string;
        resourceGeneratedName: string;
        pricePerLvl: number;
        type: string;
    };
    4: {
        id: number;
        name: string;
        resourceGeneratedName: string;
        pricePerLvl: number;
        type: string;
    };
    5: {
        id: number;
        name: string;
        pricePerLvl: number;
        type: string;
    };
    6: {
        id: number;
        name: string;
        pricePerLvl: number;
        type: string;
    };
};
export declare const ALLIANCE_RESOURCES_LIST: {
    resource_id: string;
    name: string;
}[];
export declare const PERMISSIONS_OBJECT: {
    permission_admin: string;
    permission_accept_and_kick_members: string;
    permission_extract_resources: string;
    permission_activate_buffs: string;
};
export declare const PERMISSIONS_LIST: string[];
export declare const NAMING_REQUIREMENTS: {
    short_name: {
        regExp: RegExp;
        minChars: number;
        maxChars: number;
    };
    long_name: {
        regExp: RegExp;
        minChars: number;
        maxChars: number;
    };
};
export declare function calcResearchPrice(researchID: any, researchLevel: any): number | false;
export declare function calcAllianceResourceMax(researchID: any, researchLevel: any): number;
export declare function calcAllianceResourceGeneration(researchID: any, researchLevel: any): number;
