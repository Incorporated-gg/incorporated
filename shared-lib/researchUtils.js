const researchList = [
  { id: 1, name: 'Spying', basePrice: 2000 },
  { id: 2, name: 'Ataque', basePrice: 4000 },
  { id: 3, name: 'Defensa', basePrice: 4000 },
  { id: 4, name: 'Banco', basePrice: 30000 },
  { id: 5, name: 'Oficina Central', basePrice: 15000 },
  { id: 6, name: 'Seguridad', basePrice: 3000 },
]
module.exports.researchList = researchList

function calcResearchPrice(researchID, currentLevel) {
  const researchInfo = researchList.find(r => r.id === researchID)

  // Custom base for optimize buildings
  const powerBase = researchID === 5 ? 2 : 1.3
  return Math.round(researchInfo.basePrice * Math.pow(powerBase, currentLevel - 1))
}
module.exports.calcResearchPrice = calcResearchPrice

function calcUserMaxMoney(researchs) {
  return Math.floor(450000 * Math.pow(1.5, researchs[4] - 1))
}
module.exports.calcUserMaxMoney = calcUserMaxMoney
