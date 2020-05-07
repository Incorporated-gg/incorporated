import { mapSize, hoodsFromSvg } from './svgData'
import { MINIMUM_ZOOM_FOR_HOODS } from './utils'

export function setupZoomAndPan({ ctx, drawCanvas }) {
  addTouchEvents({ ctx, drawCanvas })
  addMouseEvents({ ctx, drawCanvas })
}
export function centerIsland({ ctx, drawCanvas }) {
  // Add initial zoom + pan to center island
  const factor = ctx.canvas.width / mapSize.width
  ctx.scale(factor, factor)
  ctx.translate(0, (ctx.canvas.height - ctx.canvas.width) / 2 / factor)

  updateZoom({
    ctx,
    drawCanvas,
    delta: 2,
    currentPointerPos: {
      x: mapSize.width * 0.8,
      y: mapSize.height * 0.2,
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

function onClick(ctx) {
  const hoodFromSvg = getIntersectingHoodFromSvg(ctx, ctx._pointerPos.x, ctx._pointerPos.y)
  if (!hoodFromSvg) return
  onHoodClickEventListeners.forEach(cb => cb(hoodFromSvg.id))
}

let onHoodClickEventListeners = []
export function setOnHoodClickEventListener(callback) {
  onHoodClickEventListeners.push(callback)
  return () => {
    onHoodClickEventListeners = onHoodClickEventListeners.filter(cb => cb !== callback)
  }
}

function getIntersectingHoodFromSvg(ctx, x, y) {
  if (getZoom(ctx) < MINIMUM_ZOOM_FOR_HOODS) return null
  for (const hoodFromSvg of hoodsFromSvg) {
    if (!ctx.isPointInPath(hoodFromSvg.path, x, y)) continue
    return hoodFromSvg
  }
  return null
}

function updatePointerPosition(ctx, x, y) {
  ctx._pointerPos = { x, y }
  ctx.canvas.style.cursor = getIntersectingHoodFromSvg(ctx, x, y) ? 'pointer' : 'default'
}

function updateZoom({ ctx, drawCanvas, delta, currentPointerPos }) {
  const minZoomLevel = ctx.canvas.width / mapSize.width
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
  let touchStartTimestamp
  let touchStartCanvasPosition

  function clearTouchData(e) {
    e.preventDefault()
    // Clear data for 1-finger pan
    Array.from(e.touches).forEach(touch => {
      delete touchStartingPoints[touch.identifier]
    })
    // Clear data for 2-finger zoom
    lastSpaceBetweenTouches = null
  }
  canvas.addEventListener('touchstart', e => {
    clearTouchData(e)

    if (e.touches.length === 1) {
      touchStartTimestamp = Date.now()
      const touch = e.changedTouches[0]
      touchStartCanvasPosition = { x: touch.pageX - canvas.offsetLeft, y: touch.pageY - canvas.offsetTop }
      updatePointerPosition(ctx, touchStartCanvasPosition.x, touchStartCanvasPosition.y)
    }
  })
  canvas.addEventListener('touchend', e => {
    clearTouchData(e)

    if (e.touches.length === 0) {
      const msElapsed = Date.now() - touchStartTimestamp
      const touch = e.changedTouches[0]
      const posNow = { x: touch.pageX - canvas.offsetLeft, y: touch.pageY - canvas.offsetTop }
      if (msElapsed < 500 && getDistanceBetweenNPoints([touchStartCanvasPosition, posNow]) < 3) {
        onClick(ctx)
      }
    }
  })

  canvas.addEventListener('touchmove', e => {
    e.preventDefault()

    // 1-finger pan
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      const touchPos = { x: touch.pageX - canvas.offsetLeft, y: touch.pageY - canvas.offsetTop }
      updatePointerPosition(ctx, touchPos.x, touchPos.y)
      const pt = ctx.transformedPoint(touchPos.x, touchPos.y)
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
  let clickStartTimestamp
  let clickStartPoint
  let clickStartCanvasPos

  canvas.addEventListener('mousedown', e => {
    e.preventDefault()

    lastX = e.offsetX || e.pageX - canvas.offsetLeft
    lastY = e.offsetY || e.pageY - canvas.offsetTop
    isMouseDown = true
    clickStartTimestamp = Date.now()
    clickStartCanvasPos = { x: lastX, y: lastY }
    clickStartPoint = ctx.transformedPoint(lastX, lastY)
  })
  canvas.addEventListener('mouseup', e => {
    e.preventDefault()

    isMouseDown = null

    lastX = e.offsetX || e.pageX - canvas.offsetLeft
    lastY = e.offsetY || e.pageY - canvas.offsetTop

    const msElapsed = Date.now() - clickStartTimestamp
    if (msElapsed <= 500 && getDistanceBetweenNPoints([clickStartCanvasPos, { x: lastX, y: lastY }]) <= 3) {
      onClick(ctx)
    }
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
      updatePointerPosition(ctx, lastX, lastY)
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
      updatePointerPosition(ctx, lastX, lastY)
    }
    return false
  })
}

// Adds ctx.getTransform() - returns an SVGMatrix
// Adds ctx.transformedPoint(x,y) - returns an SVGPoint
// Adds ctx.unTransformedPoint(x,y) - returns an SVGPoint
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
