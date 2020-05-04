import { getZoom } from './setupZoomAndPan'
import { texts, islandSize, hoods } from './mapData'

const FONT_FAMILY = 'Oswald, Arial, serif'

export function drawCanvas({ ctx, assets }) {
  const canvas = ctx.canvas
  const BG_COLOR = '#023249'
  const zoom = getZoom(ctx)

  // BG
  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.fillStyle = BG_COLOR
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.restore()

  // Base
  const bgImage = assets.images.base
  ctx.drawImage(bgImage, 0, 0, islandSize.width, islandSize.height)

  drawHoods({ ctx })
  drawTexts({ ctx, zoom })
}

function drawHoods({ ctx }) {
  ctx.fillStyle = 'rgba(10, 10, 10, 0.4)'
  hoods.forEach(hood => {
    ctx.fill(hood.path)
    // TODO: mouse collision detection with ctx.isPointInPath(hood.path)
  })
}

function drawTexts({ ctx, zoom }) {
  ctx.save()
  ctx.textAlign = 'left'
  ctx.verticalAlign = 'top'
  ctx.fillStyle = '#fff'
  ctx.shadowColor = '#000'
  ctx.shadowBlur = 4

  texts.forEach(text => {
    if (zoom > text.maxZoom) return
    const fontSize = text.fontSize
    ctx.font = `${fontSize}px ${FONT_FAMILY}`
    ctx.fillText(text.text, text.x, text.y)
  })
  ctx.restore()
}
