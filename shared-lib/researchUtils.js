const researchList = [
  { id: 1, name: 'Hacking', basePrice: 2000 },
  { id: 2, name: 'Ataque', basePrice: 4000 },
  { id: 3, name: 'Defensa', basePrice: 4000 },
  { id: 4, name: 'Banco', basePrice: 30000 },
  { id: 5, name: 'Investigación de mercado', basePrice: 6000 },
  { id: 6, name: 'Seguridad', basePrice: 3000 },
]
module.exports.researchList = researchList

function calcResearchPrice(researchID, currentLevel) {
  return Math.round(
    researchList.find(r => r.id === researchID).basePrice * Math.pow(1.3, currentLevel)
  )
}
module.exports.calcResearchPrice = calcResearchPrice

function calcUserMaxMoney(researchs) {
  return Math.floor(100000 * Math.pow(1.5, (researchs[4] - 1)))
}
module.exports.calcUserMaxMoney = calcUserMaxMoney
