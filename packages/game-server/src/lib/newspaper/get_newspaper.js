import mysql from '../mysql'
import { parseNewsItem } from './news'

export default async function getNewspaper(dayID) {
  const newspaper = await mysql.selectOne('SELECT data FROM newspaper WHERE day=?', [dayID])
  if (!newspaper) return null

  const rawNews = JSON.parse(newspaper.data)
  const news = (
    await Promise.all(
      rawNews.map(newsItem =>
        parseNewsItem(newsItem).catch(err => {
          console.error('Error while parsing newspaper:', err)
        })
      )
    )
  ).filter(Boolean)

  return {
    day: dayID,
    news,
  }
}
