import React from 'react'
import PropTypes from 'prop-types'

const availableColors = ['#FFFFFF', '#000000', '#0089FF', '#20BF55', '#E50C68', '#FAFF00', '#EABA6B', '#FF0000']

ColorSelection.propTypes = {
  color: PropTypes.string,
  setColor: PropTypes.func.isRequired,
}
export default function ColorSelection({ color, setColor }) {
  return (
    <div>
      {availableColors.map(itemColor => {
        const isActive = itemColor === color
        const activeBorderColor = color === '#FFFFFF' ? '#111' : '#eee'
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
              borderStyle: 'solid',
              borderWidth: 3,
              borderColor: isActive ? activeBorderColor : 'transparent',
            }}
          />
        )
      })}
    </div>
  )
}
