import mapDataSvgString from './mapDataSvgString'

// Load svg and add to body to be able to use getBoundingClientRect()
const mapDataSvg = new DOMParser().parseFromString(mapDataSvgString, 'image/svg+xml')
const domSvg = document.importNode(mapDataSvg.documentElement, true)
domSvg.style.position = 'absolute'
domSvg.style.opacity = '0'
domSvg.style.top = -99999
domSvg.style.left = -99999
domSvg.style.pointerEvents = 'none'
document.body.append(domSvg)

const svgRect = domSvg.getBBox()
export const islandSize = {
  width: svgRect.width,
  height: svgRect.height,
}

// Parse Texts
export const texts = Array.from(domSvg.getElementById('Nombres').getElementsByTagName('text'))
  .map(text => {
    const [, left, top] = /([\d.]+) ([\d.]+)/.exec(text.attributes.transform.value)
    return {
      text: text.textContent,
      x: parseFloat(left),
      y: parseFloat(top),
    }
  })
  .map(name => {
    const fontScale = name.text === 'City of Argentas' ? 0.05 : 0.025
    return {
      ...name,
      fontSize: fontScale * islandSize.width,
    }
  })

// Parse Hoods
export const hoodsFromSvg = Array.from(domSvg.getElementById('Fronteras_Bloques_2.0').children).map((hood, index) => {
  let d = hood.attributes.d?.value
  let centerPoint
  let returnWidth
  if (!d) {
    const x = parseFloat(hood.attributes.x.value)
    const y = parseFloat(hood.attributes.y.value)
    const height = parseFloat(hood.attributes.height.value)
    const width = parseFloat(hood.attributes.width.value)
    d = `M${x},${y} l${width},${0} l${0},${height} l${-width},${0} l${0},${-height}`
    centerPoint = { x: x + width / 2, y: y + height / 2 }
    returnWidth = width
  } else {
    const box = hood.getBBox()
    const x = box.x
    const y = box.y
    const width = box.width
    const height = box.height
    centerPoint = { x: x + width / 2, y: y + height / 2 }
    returnWidth = Math.max(50, width)
  }

  return {
    id: index + 1,
    centerPoint,
    path: new Path2D(d),
    width: returnWidth,
  }
})

domSvg.remove()

export const MINIMUM_ZOOM_FOR_HOODS = 0.8
export const MAX_ZOOM_FOR_TEXTS = 0.8
