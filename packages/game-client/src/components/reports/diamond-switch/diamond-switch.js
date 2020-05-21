import React, { useState, useCallback, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import DiamondShapeIncContainer from '../diamond-shape-inc-container/diamond-shape-inc-container'
import styles from './diamond-switch.module.scss'
import useWindowSize from 'lib/useWindowSize'

DiamondSwitch.propTypes = {
  selected: PropTypes.string.isRequired,
  options: PropTypes.object.isRequired,
  onOptionSelected: PropTypes.func.isRequired,
}
export default function DiamondSwitch({ selected, options, onOptionSelected }) {
  const linkRefs = useRef({})
  const [markersStyle, setMarkersStyle] = useState({})
  const windowDimesions = useWindowSize()

  const reloadMarkerTransform = useCallback(() => {
    const itemElm = linkRefs.current[selected]
    if (!itemElm) return
    const translateX = itemElm.offsetLeft + itemElm.clientWidth / 2
    setMarkersStyle({ transform: `translateX(${translateX}px)` })
  }, [selected])

  useEffect(() => {
    reloadMarkerTransform()
    setTimeout(reloadMarkerTransform, 100)
  }, [reloadMarkerTransform, windowDimesions])

  return (
    <DiamondShapeIncContainer darkBg>
      <div style={{ position: 'relative', margin: -5 }}>
        <div className={styles.markers} style={markersStyle} />

        <div className={styles.container}>
          {Object.entries(options).map(([key, value]) => {
            return (
              <div
                key={key}
                ref={ref => (linkRefs.current[key] = ref)}
                tabIndex={0}
                onClick={() => onOptionSelected(key)}
                onKeyPress={e => {
                  if (e.key !== 'Enter' && e.key !== ' ') return
                  onOptionSelected(key)
                }}
                className={`${styles.item} ${key === selected ? styles.selected : ''}`}>
                {value}
              </div>
            )
          })}
        </div>
      </div>
    </DiamondShapeIncContainer>
  )
}
