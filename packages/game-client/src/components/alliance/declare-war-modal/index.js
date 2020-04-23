import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Modal from 'react-modal'
import IncContainer from 'components/UI/inc-container'
import { reloadUserData } from 'lib/user'
import api from 'lib/api'

DeclareWarModal.propTypes = {
  alliance: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
}
export default function DeclareWarModal({ alliance, isOpen, onRequestClose }) {
  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      {isOpen && <DeclareWar alliance={alliance} onRequestClose={onRequestClose} />}
    </Modal>
  )
}

DeclareWar.propTypes = {
  alliance: PropTypes.object.isRequired,
  onRequestClose: PropTypes.func.isRequired,
}
function DeclareWar({ alliance, onRequestClose }) {
  const [selectedHoods, setSelectedHoods] = useState([])

  const declareWar = () => {
    if (!window.confirm('Estás seguro de que quieres declarar guerra a esta alianza?')) return
    api
      .post('/v1/alliance/declare_war', {
        alliance_id: alliance.id,
        hoods: selectedHoods,
      })
      .then(() => {
        onRequestClose()
        reloadUserData()
      })
      .catch(err => {
        alert(err.message)
      })
  }

  return (
    <IncContainer withHairline darkBg borderSize={20}>
      <div style={{ padding: 10 }}>
        <h1>Declarar guerra a {alliance.short_name}</h1>
        {alliance.hoods.map(hood => {
          const isSelected = selectedHoods.some(hID => hID === hood.id)
          return (
            <div key={hood.id}>
              <label>
                {hood.name} (Lvl. {hood.level})
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {
                    if (isSelected) {
                      selectedHoods.splice(selectedHoods.indexOf(hood.id), 1)
                    } else {
                      selectedHoods.push(hood.id)
                    }
                    setSelectedHoods([...selectedHoods])
                  }}
                />
              </label>
            </div>
          )
        })}
        <button onClick={declareWar}>Declarar guerra</button>
      </div>
    </IncContainer>
  )
}
