const basePrice = [null, 2000, 4000, 4000, 30000, 6000, 3000]

const researchList = [
  { id: 1, name: 'Hacking' },
  { id: 2, name: 'Ataque' },
  { id: 3, name: 'Defensa' },
  { id: 4, name: 'Banco' },
  { id: 5, name: 'Investigación de mercado' },
  { id: 6, name: 'Seguridad' },
]
module.exports.researchList = researchList

function calcResearchPrice(researchID, currentLevel) {
  return Math.round(
    basePrice[researchID] * Math.pow(1.3, currentLevel)
  )
}
module.exports.calcResearchPrice = calcResearchPrice
