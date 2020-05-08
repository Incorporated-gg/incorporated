import React from 'react'
import PropTypes from 'prop-types'

const availableColors = ['#FFFFFF', '#000000', '#B17FEB', '#54A4EB', '#9E7739', '#299E54', '#9E3D39', '#C0C0C0']

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
