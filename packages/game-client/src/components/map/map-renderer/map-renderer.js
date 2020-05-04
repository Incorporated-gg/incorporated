import React, { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import styles from './map-renderer.module.scss'
import { trackTransforms, setupZoomAndPan, centerIsland } from './setupZoomAndPan'
import { drawCanvas } from './drawCanvas'

MapRenderer.propTypes = {
  hoods: PropTypes.array.isRequired,
}
export default function MapRenderer({ hoods }) {
  const canvasRef = useRef()

  useEffect(() => {
    setupMapCanvas(canvasRef.current)
  }, [])

  return <canvas ref={canvasRef} className={styles.canvas} />
}

async function loadAssets() {
  const images = {
    base: require('./img/base.jpg'),
  }
  const imagesPromises = Object.entries(images).map(([key, src]) => {
    return new Promise((resolve, reject) => {
      const imgElm = new Image()
      imgElm.onload = () => resolve([key, imgElm])
      imgElm.onerror = reject
      imgElm.src = src
    })
  })
  const imagesResolved = Object.fromEntries(await Promise.all(imagesPromises))

  return {
    images: imagesResolved,
  }
}

async function setupMapCanvas(canvas) {
  const ctx = canvas.getContext('2d')
  const canvasBox = canvas.getBoundingClientRect()
  canvas.width = canvasBox.width
  canvas.height = canvas.width * 1.3

  const assets = await loadAssets()

  function drawCanvasHelper() {
    drawCanvas({ ctx, assets })
  }

  trackTransforms(ctx)
  setupZoomAndPan({
    ctx,
    drawCanvas: drawCanvasHelper,
  })
  centerIsland({ ctx, drawCanvas: drawCanvasHelper })
  drawCanvasHelper()
}
