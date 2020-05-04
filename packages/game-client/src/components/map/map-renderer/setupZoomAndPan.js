import { islandSize } from './mapData'

export function setupZoomAndPan({ ctx, drawCanvas }) {
  addTouchEvents({ ctx, drawCanvas })
  addMouseEvents({ ctx, drawCanvas })
}
export function centerIsland({ ctx, drawCanvas }) {
  // Add initial zoom + pan to center island
  const factor = ctx.canvas.width / islandSize.width
  ctx.scale(factor, factor)
  ctx.translate(0, (ctx.canvas.height - ctx.canvas.width) / 2 / factor)

  updateZoom({
    ctx,
    drawCanvas,
    delta: 2,
    currentPointerPos: {
      x: islandSize.width * 0.7,
      y: islandSize.height * 0.2,
    },
  })
}

export function getZoom(ctx) {
  const transform = ctx.getTransform()
  return transform.a
}
export function getPan(ctx) {
  const transform = ctx.getTransform()
  const zoom = getZoom(ctx)
  return { x: -transform.e / zoom, y: -transform.f / zoom }
}
export function getViewport(ctx) {
  const zoom = getZoom(ctx)
  const pan = getPan(ctx)
  const width = ctx.canvas.width / zoom
  const height = ctx.canvas.height / zoom
  return {
    top: pan.y,
    left: pan.x,
    right: pan.x + width,
    bottom: pan.y + height,
    width,
    height,
  }
}

function updateZoom({ ctx, drawCanvas, delta, currentPointerPos }) {
  const minZoomLevel = ctx.canvas.width / islandSize.width
  const maxZoomLevel = minZoomLevel * (768 / ctx.canvas.width) * 6 // min 6, but scales on smaller devices

  ctx.translate(currentPointerPos.x, currentPointerPos.y)

  const scaleFactor = 1.1
  const factor = Math.pow(scaleFactor, delta)
  ctx.scale(factor, factor)
  let zoomLevel = getZoom(ctx)

  if (zoomLevel > maxZoomLevel) {
    const diff = maxZoomLevel / zoomLevel
    ctx.scale(diff, diff)
    zoomLevel = getZoom(ctx)
  }
  if (zoomLevel < minZoomLevel) {
    const diff = minZoomLevel / zoomLevel
    ctx.scale(diff, diff)
    zoomLevel = getZoom(ctx)
  }

  ctx.translate(-currentPointerPos.x, -currentPointerPos.y)
  drawCanvas()
}

function addTouchEvents({ ctx, drawCanvas }) {
  const canvas = ctx.canvas
  const touchStartingPoints = {}
  let lastSpaceBetweenTouches = null

  function clearTouchData(e) {
    e.preventDefault()
    // Clear data for 1-finger pan
    Array.from(e.touches).forEach(touch => {
      delete touchStartingPoints[touch.identifier]
    })
    // Clear data for 2-finger zoom
    lastSpaceBetweenTouches = null
  }
  canvas.addEventListener('touchstart', clearTouchData)
  canvas.addEventListener('touchend', clearTouchData)

  canvas.addEventListener('touchmove', e => {
    e.preventDefault()

    // 1-finger pan
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      const pt = ctx.transformedPoint(touch.pageX - canvas.offsetLeft, touch.pageY - canvas.offsetTop)
      const startingPoint = touchStartingPoints[touch.identifier]
      if (!startingPoint) {
        touchStartingPoints[touch.identifier] = { x: pt.x, y: pt.y }
      } else {
        const diff = {
          x: startingPoint.x - pt.x,
          y: startingPoint.y - pt.y,
        }
        ctx.translate(-diff.x, -diff.y)
      }
    } else {
      // 2-finger zoom

      const touchesArray = Array.from(e.touches)

      const spaceBetweenTouches = getDistanceBetweenNPoints(
        touchesArray.map(touch => ({ x: touch.pageX, y: touch.pageY }))
      )
      if (lastSpaceBetweenTouches === null) {
        lastSpaceBetweenTouches = spaceBetweenTouches
      } else {
        const delta = (spaceBetweenTouches - lastSpaceBetweenTouches) / 10
        lastSpaceBetweenTouches = spaceBetweenTouches

        const sumPts = touchesArray
          .map(touch => ctx.transformedPoint(touch.pageX - canvas.offsetLeft, touch.pageY - canvas.offsetTop))
          .reduce(
            (prev, pt) => ({
              x: prev.x + pt.x,
              y: prev.y + pt.y,
            }),
            { x: 0, y: 0 }
          )
        const avgPos = {
          x: sumPts.x / touchesArray.length,
          y: sumPts.y / touchesArray.length,
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
}

function getDistanceBetweenNPoints(pointsArray) {
  let distance = 0
  for (let i = 0; i < pointsArray.length; i++) {
    for (let j = i + 1; j < pointsArray.length; j++) {
      // shortest distance between point i and j.
      distance += Math.sqrt(
        Math.pow(pointsArray[i].x - pointsArray[j].x, 2) + Math.pow(2 + (pointsArray[i].y - pointsArray[j].y), 2)
      )
    }
  }
  return distance
}

function addMouseEvents({ ctx, drawCanvas }) {
  const canvas = ctx.canvas
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
      const diff = {
        x: clickStartPoint.x - pt.x,
        y: clickStartPoint.y - pt.y,
      }
      ctx.translate(-diff.x, -diff.y)
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
