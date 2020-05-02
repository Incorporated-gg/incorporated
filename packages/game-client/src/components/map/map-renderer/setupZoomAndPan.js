export function setupZoomAndPan({ canvas, ctx, drawCanvas }) {
  addTouchEvents({ canvas, ctx, drawCanvas })
  addMouseEvents({ canvas, ctx, drawCanvas })
}

export function getZoomAndPan({ ctx }) {
  const transform = ctx.getTransform()
  return {
    // TODO scrap zoomLevel in favor of transform.a
    zoom: zoomLevel,
    // TODO: Fix pan values
    pan: { x: transform.e / zoomLevel, y: transform.f / zoomLevel },
  }
}

let zoomLevel = 1
function updateZoom({ ctx, drawCanvas, delta, currentPointerPos }) {
  ctx.translate(currentPointerPos.x, currentPointerPos.y)

  const scaleFactor = 1.1
  const factor = Math.pow(scaleFactor, delta)
  zoomLevel *= factor
  ctx.scale(factor, factor)

  const maxZoomLevel = 7
  const minZoomLevel = 1
  if (zoomLevel > maxZoomLevel) {
    const diff = maxZoomLevel / zoomLevel
    zoomLevel *= diff
    ctx.scale(diff, diff)
  }
  if (zoomLevel < minZoomLevel) {
    const diff = minZoomLevel / zoomLevel
    zoomLevel *= diff
    ctx.scale(diff, diff)
  }

  ctx.translate(-currentPointerPos.x, -currentPointerPos.y)
  drawCanvas()
}

function addTouchEvents({ canvas, ctx, drawCanvas }) {
  const touchStartingPoints = {}
  canvas.addEventListener('touchstart', e => {
    e.preventDefault()
  })

  let lastSpaceBetweenTouches = null
  canvas.addEventListener('touchmove', e => {
    e.preventDefault()

    // 1-finger pan
    if (e.changedTouches.length === 1) {
      const touch = e.changedTouches[0]
      const pt = ctx.transformedPoint(touch.pageX - canvas.offsetLeft, touch.pageY - canvas.offsetTop)
      const startingPoint = touchStartingPoints[touch.identifier]
      if (!startingPoint) {
        touchStartingPoints[touch.identifier] = { x: pt.x, y: pt.y }
      } else {
        const diff = { x: pt.x - startingPoint.x, y: pt.y - startingPoint.y }
        ctx.translate(diff.x, diff.y)
      }
    } else {
      // 2-finger zoom
      const touch1 = e.changedTouches[0]
      const pt1 = ctx.transformedPoint(touch1.pageX - canvas.offsetLeft, touch1.pageY - canvas.offsetTop)
      delete touchStartingPoints[touch1.identifier]

      const touch2 = e.changedTouches[1]
      const pt2 = ctx.transformedPoint(touch2.pageX - canvas.offsetLeft, touch2.pageY - canvas.offsetTop)
      delete touchStartingPoints[touch2.identifier]

      const spaceBetweenTouches = Math.abs(pt1.x - pt2.x) + Math.abs(pt1.y - pt2.y)
      if (!lastSpaceBetweenTouches) {
        lastSpaceBetweenTouches = spaceBetweenTouches
      } else {
        const delta = (spaceBetweenTouches - lastSpaceBetweenTouches) / 8
        const avgPos = {
          x: (pt1.x + pt2.x) / 2,
          y: (pt1.y + pt2.y) / 2,
        }

        updateZoom({
          ctx,
          drawCanvas,
          delta,
          currentPointerPos: avgPos,
        })
      }
    }

    drawCanvas()
  })

  canvas.addEventListener('touchend', e => {
    e.preventDefault()
    const touch = e.changedTouches[0]
    delete touchStartingPoints[touch.identifier]
    lastSpaceBetweenTouches = null
  })
}

function addMouseEvents({ canvas, ctx, drawCanvas }) {
  let lastX = canvas.width / 2
  let lastY = canvas.height / 2
  let isMouseDown = false
  let clickStartPoint

  canvas.addEventListener('mousedown', e => {
    e.preventDefault()

    lastX = e.offsetX || e.pageX - canvas.offsetLeft
    lastY = e.offsetY || e.pageY - canvas.offsetTop
    isMouseDown = true
    clickStartPoint = ctx.transformedPoint(lastX, lastY)
  })
  canvas.addEventListener('mouseup', e => {
    e.preventDefault()

    isMouseDown = null
  })
  canvas.addEventListener('mouseleave', e => {
    e.preventDefault()

    isMouseDown = null
  })
  canvas.addEventListener(
    'mousemove',
    e => {
      e.preventDefault()

      lastX = e.offsetX || e.pageX - canvas.offsetLeft
      lastY = e.offsetY || e.pageY - canvas.offsetTop
      if (!isMouseDown) return

      const pt = ctx.transformedPoint(lastX, lastY)
      ctx.translate(pt.x - clickStartPoint.x, pt.y - clickStartPoint.y)
      drawCanvas()
    },
    false
  )
  canvas.addEventListener('wheel', e => {
    e.preventDefault()

    const delta = e.wheelDelta ? e.wheelDelta / 45 : e.detail ? -e.detail : 0
    if (delta) {
      const currentPointerPos = ctx.transformedPoint(lastX, lastY)
      updateZoom({ ctx, drawCanvas, delta, currentPointerPos })
    }
    return false
  })
}

// Adds ctx.getTransform() - returns an SVGMatrix
// Adds ctx.transformedPoint(x,y) - returns an SVGPoint
export function trackTransforms(ctx) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  let xform = svg.createSVGMatrix()
  ctx.getTransform = function() {
    return xform
  }

  const savedTransforms = []
  const save = ctx.save
  ctx.save = function() {
    savedTransforms.push(xform.translate(0, 0))
    return save.call(ctx)
  }
  const restore = ctx.restore
  ctx.restore = function() {
    xform = savedTransforms.pop()
    return restore.call(ctx)
  }

  const scale = ctx.scale
  ctx.scale = function(sx, sy) {
    xform = xform.scaleNonUniform(sx, sy)
    return scale.call(ctx, sx, sy)
  }
  const rotate = ctx.rotate
  ctx.rotate = function(radians) {
    xform = xform.rotate((radians * 180) / Math.PI)
    return rotate.call(ctx, radians)
  }
  const translate = ctx.translate
  ctx.translate = function(dx, dy) {
    xform = xform.translate(dx, dy)
    return translate.call(ctx, dx, dy)
  }
  const transform = ctx.transform
  ctx.transform = function(a, b, c, d, e, f) {
    const m2 = svg.createSVGMatrix()
    m2.a = a
    m2.b = b
    m2.c = c
    m2.d = d
    m2.e = e
    m2.f = f
    xform = xform.multiply(m2)
    return transform.call(ctx, a, b, c, d, e, f)
  }
  const setTransform = ctx.setTransform
  ctx.setTransform = function(a, b, c, d, e, f) {
    xform.a = a
    xform.b = b
    xform.c = c
    xform.d = d
    xform.e = e
    xform.f = f
    return setTransform.call(ctx, a, b, c, d, e, f)
  }
  const pt = svg.createSVGPoint()
  ctx.transformedPoint = function(x, y) {
    pt.x = x
    pt.y = y
    return pt.matrixTransform(xform.inverse())
  }
}
