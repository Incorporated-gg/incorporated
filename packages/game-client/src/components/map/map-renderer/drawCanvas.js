import { getZoom, getViewport } from './setupZoomAndPan'
import { texts, islandSize, hoodsFromSvg, MINIMUM_ZOOM_FOR_HOODS, MAX_ZOOM_FOR_TEXTS } from './mapData'

const FONT_FAMILY = 'Oswald, Arial, serif'

export function drawCanvas({ ctx, assets, hoods }) {
  const canvas = ctx.canvas
  const BG_COLOR = '#023249'
  const zoom = getZoom(ctx)
  const viewport = getViewport(ctx)

  // BG
  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.fillStyle = BG_COLOR
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.restore()

  drawBaseMap({ ctx, zoom, viewport, assets })
  drawHoods({ ctx, zoom, hoods })
  drawTexts({ ctx, zoom })
}

function drawBaseMap({ ctx, zoom, viewport, assets }) {
  if (zoom <= 1.2) {
    const bgImage = assets.images.base
    ctx.drawImage(bgImage, 0, 0, islandSize.width, islandSize.height)
    return
  }

  for (let row = 1; row <= 10; row++) {
    for (let col = 1; col <= 10; col++) {
      const bgImage = assets.images[`mapTile${row}${col}`]
      const tileSize = islandSize.width / 10
      const x = (row - 1) * tileSize
      const y = (col - 1) * tileSize
      const shouldNotDraw =
        x + tileSize < viewport.left || x > viewport.right || y + tileSize < viewport.top || y > viewport.bottom
      if (shouldNotDraw) continue
      ctx.drawImage(bgImage, x, y, tileSize, tileSize)
    }
  }
}

function drawHoods({ ctx, zoom, hoods }) {
  if (zoom <= MINIMUM_ZOOM_FOR_HOODS) return
  ctx.save()

  const districtColors = {
    1: '#21E6AC',
    2: '#79F2E9',
    3: '#722DEF',
    4: '#450CBC',
    5: '#70DE13',
    6: '#1BDF80',
    7: '#9E5A2C',
    8: '#3D1028',
    9: '#2B2A58',
    10: '#F741A6',
    11: '#D8F76C',
  }

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#fff'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
  ctx.shadowBlur = 3
  ctx.font = `7px ${FONT_FAMILY}`
  hoodsFromSvg.forEach(hoodFromSvg => {
    const hood = hoods.find(h => h.id === hoodFromSvg.id)

    // Fill bg
    ctx.fillStyle = districtColors[hood.district.id] + '60'
    ctx.fill(hoodFromSvg.path)

    // Text
    let text = `${hood.name}\nLvl. ${hood.level}`
    if (hood.owner) {
      text += `\n[${hood.owner.short_name}]`
      const badgeImg = new Image() // TODO
      ctx.drawImage(badgeImg, hoodFromSvg.centerPoint.x, hoodFromSvg.centerPoint.y + 30)
    }
    ctx.fillStyle = '#fff'
    wrapText(ctx, text, hoodFromSvg.centerPoint.x, hoodFromSvg.centerPoint.y, hoodFromSvg.width - 4, 9)
  })

  ctx.restore()
}

function drawTexts({ ctx, zoom }) {
  ctx.save()
  ctx.textAlign = 'left'
  ctx.textBaseline = 'bottom'
  ctx.fillStyle = '#fff'
  ctx.shadowColor = '#000'
  ctx.shadowBlur = 4

  texts.forEach(text => {
    if (zoom > MAX_ZOOM_FOR_TEXTS) return
    const fontSize = text.fontSize
    ctx.font = `${fontSize}px ${FONT_FAMILY}`
    ctx.fillText(text.text, text.x, text.y)
  })
  ctx.restore()
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text
    .replace(/\n/g, ' \n ')
    .split(' ')
    .filter(Boolean)
  let line = ''

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' '
    const metrics = ctx.measureText(testLine)
    const testWidth = metrics.width
    if (words[n][0] === '\n' || (testWidth > maxWidth && n > 0)) {
      ctx.fillText(line, x, y)
      line = words[n] + ' '
      y += lineHeight
    } else {
      line = testLine
    }
  }
  ctx.fillText(line, x, y)
}
