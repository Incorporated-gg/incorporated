const taxList = {
  income450k: 0.03,
  income5m: 0.01,
  income15m: 0.02,
  income30m: 0.02,
  income50m: 0.03,
  alliance: 0.03,
}

module.exports.getIncomeTaxes = (totalBuildingsIncome, hasAlliance) => {
  let taxesPercent = 0
  if (totalBuildingsIncome >= 450000) taxesPercent += taxList.income450k
  if (totalBuildingsIncome >= 5000000) taxesPercent += taxList.income5m
  if (totalBuildingsIncome >= 15000000) taxesPercent += taxList.income15m
  if (totalBuildingsIncome >= 30000000) taxesPercent += taxList.income30m
  if (totalBuildingsIncome >= 50000000) taxesPercent += taxList.income50m
  if (hasAlliance) taxesPercent += taxList.alliance
  return taxesPercent
}
