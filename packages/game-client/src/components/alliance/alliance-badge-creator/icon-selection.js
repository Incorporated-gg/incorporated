import React from 'react'
import PropTypes from 'prop-types'

IconSelection.propTypes = {
  availableIcons: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      component: PropTypes.any.isRequired,
    })
  ).isRequired,
  icon: PropTypes.number.isRequired,
  setIcon: PropTypes.func.isRequired,
}
export default function IconSelection({ availableIcons, icon, setIcon }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {availableIcons.map(itemIcon => {
        const isActive = itemIcon.id === icon
        return (
          <itemIcon.component
            key={itemIcon.id}
            onClick={() => setIcon(itemIcon.id)}
            style={{
              cursor: 'pointer',
              display: 'inline-block',
              width: 40,
              height: 40,
              marginBottom: 10,
              fill: isActive ? '#20bf55' : '#fff',
              color: '#0089ff',
            }}
          />
        )
      })}
    </div>
  )
}
