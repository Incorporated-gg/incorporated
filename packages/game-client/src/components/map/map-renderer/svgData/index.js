import outputJson from './output.json'

export const mapSize = outputJson.mapSize

export const texts = outputJson.texts

export const hoodsFromSvg = outputJson.hoodsFromSvg.map(hoodFromSvg => ({
  ...hoodFromSvg,
  path: new Path2D(hoodFromSvg.d),
}))
