import NewsItem, { newsItemTypes } from '../NewsItem'

export async function generate({ dayID, minTimestamp, maxTimestamp }) {
  const adID = Math.floor(Math.random() * (4 - 1) + 1) // [1, 4]

  return [
    new NewsItem({
      type: newsItemTypes.FAKE_AD,
      weight: 0.5,
      data: { adID },
    }),
  ]
}

export async function get({ adID }) {
  return { ad_id: adID }
}
