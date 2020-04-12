import React from 'react'
import PropTypes from 'prop-types'

const availableColors = ['#ffffff', '#000000', '#0089FF', '#20BF55', '#E50C68', '#FAFF00', '#EABA6B', '#FF0000']

ColorSelection.propTypes = {
  color: PropTypes.string,
  setColor: PropTypes.func.isRequired,
}
export default function ColorSelection({ color, setColor }) {
  return availableColors.map(itemColor => {
    return (
      <div
        key={itemColor}
        onClick={() => setColor(itemColor)}
        style={{
          cursor: 'pointer',
          display: 'inline-block',
          width: 40,
          height: 40,
          marginRight: 5,
          backgroundColor: itemColor,
          opacity: itemColor === color ? 0.5 : 1,
        }}
      />
    )
  })
}
