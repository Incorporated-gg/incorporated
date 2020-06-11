"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcAllianceResourceGeneration = exports.calcAllianceResourceMax = exports.calcResearchPrice = exports.NAMING_REQUIREMENTS = exports.PERMISSIONS_LIST = exports.PERMISSIONS_OBJECT = exports.ALLIANCE_RESOURCES_LIST = exports.ALLIANCE_RESEARCHS = exports.WAR_DAYS_DURATION = exports.MAX_ALLIANCE_MEMBERS = exports.CREATE_ALLIANCE_PRICE = void 0;
const personnelUtils_1 = require("./personnelUtils");
exports.CREATE_ALLIANCE_PRICE = 50000;
exports.MAX_ALLIANCE_MEMBERS = 8;
exports.WAR_DAYS_DURATION = 5;
exports.ALLIANCE_RESEARCHS = {
    2: {
        id: 2,
        name: 'Barracones de guardias',
        resourceGeneratedName: 'Guardias',
        pricePerLvl: 200000,
        type: 'resource',
    },
    3: {
        id: 3,
        name: 'Cabinas de gángsters',
        resourceGeneratedName: 'Gángsters',
        pricePerLvl: 200000,
        type: 'resource',
    },
    4: { id: 4, name: 'Academias de ladrones', resourceGeneratedName: 'Ladrones', pricePerLvl: 200000, type: 'resource' },
    5: { id: 5, name: 'Buff de ataque', pricePerLvl: 5000000, type: 'buff' },
    6: { id: 6, name: 'Buff de defensa', pricePerLvl: 5000000, type: 'buff' },
};
exports.ALLIANCE_RESOURCES_LIST = [
    {
        resource_id: 'sabots',
        name: personnelUtils_1.PERSONNEL_OBJ.sabots.name,
    },
    {
        resource_id: 'guards',
        name: personnelUtils_1.PERSONNEL_OBJ.guards.name,
    },
    {
        resource_id: 'thieves',
        name: personnelUtils_1.PERSONNEL_OBJ.thieves.name,
    },
];
exports.PERMISSIONS_OBJECT = {
    permission_admin: 'Admin',
    permission_accept_and_kick_members: 'Editar miembros',
    permission_extract_resources: 'Extraer recursos',
    permission_activate_buffs: 'Activar buffs',
};
exports.PERMISSIONS_LIST = Object.keys(exports.PERMISSIONS_OBJECT);
exports.NAMING_REQUIREMENTS = {
    short_name: {
        regExp: /^[a-z0-9]+$/i,
        minChars: 2,
        maxChars: 5,
    },
    long_name: {
        regExp: /^[a-z0-9 _-]+$/i,
        minChars: 2,
        maxChars: 20,
    },
};
function calcResearchPrice(researchID, researchLevel) {
    const data = exports.ALLIANCE_RESEARCHS[researchID];
    if (!data)
        return false;
    if (data.type === 'buff') {
        return data.pricePerLvl * Math.pow(researchLevel + 1, 2);
    }
    return data.pricePerLvl * (researchLevel + 1);
}
exports.calcResearchPrice = calcResearchPrice;
const mapResearchIDToResourceID = {
    2: 'guards',
    3: 'sabots',
    4: 'thieves',
};
const maxResourcesPerLevel = {
    guards: 2000,
    sabots: 2000,
    thieves: 2500,
};
function calcAllianceResourceMax(researchID, researchLevel) {
    const resourceID = mapResearchIDToResourceID[researchID];
    return maxResourcesPerLevel[resourceID] * (1 + researchLevel);
}
exports.calcAllianceResourceMax = calcAllianceResourceMax;
const genResourcesPerLevel = {
    money: 100000,
    guards: 200,
    sabots: 100,
    thieves: 100,
};
function calcAllianceResourceGeneration(researchID, researchLevel) {
    const resourceID = mapResearchIDToResourceID[researchID];
    return genResourcesPerLevel[resourceID] * (1 + researchLevel);
}
exports.calcAllianceResourceGeneration = calcAllianceResourceGeneration;
