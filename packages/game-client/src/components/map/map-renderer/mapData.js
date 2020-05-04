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

const svgRect = domSvg.getBoundingClientRect()
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
      x: parseInt(left),
      y: parseInt(top),
    }
  })
  .map(name => {
    const fontScale = name.text === 'City of Argentas' ? 0.05 : 0.025
    return {
      ...name,
      fontSize: fontScale * islandSize.width,
      maxZoom: 0.8,
    }
  })

// Parse Hoods
export const hoods = Array.from(domSvg.getElementById('Fronteras_Bloques_2.0').children).map((hood, index) => {
  let d = hood.attributes.d?.value
  if (!d) {
    const x = parseInt(hood.attributes.x.value)
    const y = parseInt(hood.attributes.y.value)
    const height = parseInt(hood.attributes.height.value)
    const width = parseInt(hood.attributes.width.value)
    d = `M${x},${y} l${width},${0} l${0},${height} l${-width},${0} l${0},${-height}`
  }

  return {
    id: index + 1,
    path: new Path2D(d),
  }
})

domSvg.remove()
