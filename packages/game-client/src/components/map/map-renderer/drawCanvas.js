import { getZoomAndPan } from './setupZoomAndPan'

export function drawCanvas({ canvas, ctx, assets }) {
  const BG_COLOR = '#023249'
  const FONT_FAMILY = 'Oswald, Arial, serif'
  const zoomLevel = getZoomAndPan({ ctx }).zoom

  // BG
  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.fillStyle = BG_COLOR
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.restore()

  // Base
  const bgImage = zoomLevel <= 2 ? assets.images.base : assets.images.baseDetailed
  ctx.drawImage(bgImage, 0, (canvas.height - canvas.width) / 2, canvas.width, canvas.width)

  // Texts
  ctx.textAlign = 'center'
  ctx.fillStyle = '#fff'
  ctx.font = '50px ' + FONT_FAMILY
  ctx.fillText('City of Argentas', canvas.width / 2, canvas.height * 0.15)
}
