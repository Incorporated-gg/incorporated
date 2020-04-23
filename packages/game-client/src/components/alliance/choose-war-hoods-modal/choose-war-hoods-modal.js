import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Modal from 'react-modal'
import IncContainer from 'components/UI/inc-container'
import IncButton from 'components/UI/inc-button'
import api from 'lib/api'

ChooseWarHoodsModal.propTypes = {
  war: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
}
export default function ChooseWarHoodsModal({ war, isOpen, onRequestClose }) {
  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      {isOpen && <ChooseWarHoods war={war} onRequestClose={onRequestClose} />}
    </Modal>
  )
}

ChooseWarHoods.propTypes = {
  war: PropTypes.object.isRequired,
  onRequestClose: PropTypes.func.isRequired,
}
function ChooseWarHoods({ war, onRequestClose }) {
  const [enemyAlliance, setEnemyAlliance] = useState()
  const [selectedHoods, setSelectedHoods] = useState([])

  useEffect(() => {
    api
      .get(`/v1/ranking/alliance/${war.alliance1.short_name}`)
      .then(res => {
        setEnemyAlliance(res.alliance)
      })
      .catch(err => {
        window.alert(err.message)
      })
  }, [war.alliance1.id, war.alliance1.short_name])

  const chooseHoods = () => {
    api
      .post('/v1/alliance/choose_war_hoods', {
        war_id: war.id,
        hoods: selectedHoods,
      })
      .then(onRequestClose)
      .catch(err => {
        window.alert(err.message)
      })
  }

  return (
    <IncContainer withHairline darkBg borderSize={20}>
      <div style={{ padding: 10 }}>
        {!enemyAlliance
          ? 'Cargando...'
          : enemyAlliance.hoods.map(hood => {
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
        <IncButton onClick={chooseHoods}>Escoger barrios</IncButton>
      </div>
    </IncContainer>
  )
}
