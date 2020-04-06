export const researchList = [
  { id: 1, name: 'Espionaje', basePrice: 1200, skipResearchDuration: false },
  { id: 2, name: 'Ataque', basePrice: 2500, skipResearchDuration: false },
  { id: 3, name: 'Defensa', basePrice: 2500, skipResearchDuration: false },
  { id: 4, name: 'Banco', basePrice: 1500, skipResearchDuration: false },
  { id: 5, name: 'Oficina Central', basePrice: 15000, skipResearchDuration: true },
  { id: 6, name: 'Seguridad', basePrice: 1800, skipResearchDuration: false },
]

export function calcResearchPrice(researchID, currentLevel) {
  const researchInfo = researchList.find(r => r.id === researchID)

  // Custom base for optimize buildings
  const powerBase = researchID === 5 ? 1.75 : 1.3
  return Math.round(researchInfo.basePrice * Math.pow(powerBase, currentLevel - 1))
}

export function calcResearchSecondsDuration(researchID, currentLevel) {
  const researchInfo = researchList.find(r => r.id === researchID)
  if (researchInfo.skipResearchDuration) return 0
  const researchTime = (currentLevel * 5 + Math.pow(currentLevel / 2, 3.75)) * (researchInfo.basePrice / 1200)
  return Math.round(researchTime)
}

export const MANUALLY_FINISH_RESEARCH_UPGRADES_SECONDS = 300
