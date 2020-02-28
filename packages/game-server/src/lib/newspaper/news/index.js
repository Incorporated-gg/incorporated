import { newsItemTypes } from '../NewsItem'

import { generate as generateWarDeclaration, get as getWarDeclaration } from './war_declaration'
import { generate as generateWarEnded, get as getWarEnded } from './war_ended'
import { generate as generateWarUpdateDay3, get as getWarUpdateDay3 } from './war_update_day_3'
import { generate as generateTotalAttackCount, get as getTotalAttackCount } from './total_attacks_count'
import { generate as generateTotalRobbedMoney, get as getTotalRobbedMoney } from './total_robbed_money'
import { generate as generateFakeAd, get as getFakeAd } from './fake_ad'

const allGenerateFunctions = [
  generateWarDeclaration,
  generateWarEnded,
  generateWarUpdateDay3,
  generateTotalAttackCount,
  generateTotalRobbedMoney,
  generateFakeAd,
]

const allGetFunctions = {
  [newsItemTypes.WAR_DECLARATION]: getWarDeclaration,
  [newsItemTypes.WAR_ENDED]: getWarEnded,
  [newsItemTypes.WAR_UPDATE_DAY_3]: getWarUpdateDay3,
  [newsItemTypes.TOTAL_ATTACKS_COUNT]: getTotalAttackCount,
  [newsItemTypes.TOTAL_ROBBED_MONEY]: getTotalRobbedMoney,
  [newsItemTypes.FAKE_AD]: getFakeAd,
}

export async function generateAllNews(generateOptions) {
  return (await Promise.all(allGenerateFunctions.map(fn => fn(generateOptions)))).flat()
}

export async function parseNewsItem(newsItem) {
  const getDataFn =
    allGetFunctions[newsItem.type] ||
    (async () => {
      throw new Error(`Unable to parse newsItem with type ${newsItem.type}. No get function defined for it`)
    })

  return {
    type: newsItem.type,
    data: await getDataFn(newsItem.rawData),
  }
}
