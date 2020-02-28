export const newsItemTypes = {
  WAR_DECLARATION: 'WAR_DECLARATION',
  WAR_ENDED: 'WAR_ENDED',
  WAR_UPDATE_DAY_3: 'WAR_UPDATE_DAY_3',
  TOTAL_ATTACKS_COUNT: 'TOTAL_ATTACKS_COUNT',
  TOTAL_ROBBED_MONEY: 'TOTAL_ROBBED_MONEY',
  FAKE_AD: 'FAKE_AD',
}

export default class NewsItem {
  constructor({ type, weight, data }) {
    if (type === undefined) throw new Error('NewsItem missing required field: type')
    if (weight === undefined) throw new Error('NewsItem missing required field: weight')
    if (data === undefined) throw new Error('NewsItem missing required field: data')

    this.type = type
    this.weight = weight
    this.rawData = data
  }
}

export function rankPositionToWeightVal(rank) {
  return Math.max(0, 1 - (rank || Infinity) * 0.04)
}
