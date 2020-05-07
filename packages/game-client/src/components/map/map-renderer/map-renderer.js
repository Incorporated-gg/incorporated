import React, { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import styles from './map-renderer.module.scss'
import { trackTransforms, setupZoomAndPan, centerIsland, setOnHoodClickEventListener } from './setupZoomAndPan'
import { drawCanvas } from './drawCanvas'

MapRenderer.propTypes = {
  hoods: PropTypes.array.isRequired,
}
export default function MapRenderer({ hoods }) {
  const canvasRef = useRef()

  useSetupMapCanvas(canvasRef, hoods)

  return <canvas ref={canvasRef} className={styles.canvas} />
}

function getMapTilesUrl() {
  // Image splitted with https://www.pictools.net/split/
  const images = {}
  for (let row = 1; row <= 10; row++) {
    for (let col = 1; col <= 10; col++) {
      images[`mapTile${row}${col}`] = require(`./img/map-tiles/image_${col}_${row}.jpeg`)
    }
  }
  return images
}

async function loadAssets() {
  const images = {
    base: require('./img/base.jpg'),
    ...getMapTilesUrl(),
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

async function useSetupMapCanvas(canvasRef, hoods) {
  useEffect(() => {
    async function main() {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      const canvasBox = canvas.getBoundingClientRect()
      canvas.width = canvasBox.width
      canvas.height = canvas.width * 1.3

      const assets = await loadAssets()

      function drawCanvasHelper() {
        drawCanvas({ ctx, assets, hoods })
      }

      trackTransforms(ctx)
      setupZoomAndPan({
        ctx,
        drawCanvas: drawCanvasHelper,
      })
      centerIsland({ ctx, drawCanvas: drawCanvasHelper })
      drawCanvasHelper()
    }
    main()

    const removeCallback = setOnHoodClickEventListener(hoodID => {
      const hood = hoods.find(h => h.id === hoodID)
      console.log(hood)
      window.alert(hood.name)
    })
    return removeCallback
  }, [canvasRef, hoods])
}
