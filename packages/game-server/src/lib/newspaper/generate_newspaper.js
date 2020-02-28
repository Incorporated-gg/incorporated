import { getInitialUnixTimestampOfServerDay } from 'shared-lib/serverTime'
import NewsItem from './NewsItem'
import { generateAllNews } from './news'

export default async function generateNewspaper(dayID) {
  const minTimestamp = getInitialUnixTimestampOfServerDay(dayID) / 1000
  const maxTimestamp = getInitialUnixTimestampOfServerDay(dayID + 1) / 1000 - 1
  const generateOptions = { dayID, minTimestamp, maxTimestamp }

  let allNews = await generateAllNews(generateOptions)
  allNews = allNews.sort((a, b) => (a.weight > b.weight ? -1 : 1)).slice(0, 12)

  allNews.forEach(newsItem => {
    if (!(newsItem instanceof NewsItem)) throw new Error('Generated news items must be an instance of NewsItem')
  })

  return allNews
}
