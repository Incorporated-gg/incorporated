import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Modal from 'react-modal'
import Container from 'components/UI/container'
import AllianceLink from '../alliance-link'
import IncButton from 'components/UI/inc-button'
import api from 'lib/api'

AskForWarAidModal.propTypes = {
  war: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
}
export default function AskForWarAidModal({ war, isOpen, onRequestClose }) {
  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      {isOpen && <AskForWarAid war={war} onRequestClose={onRequestClose} />}
    </Modal>
  )
}

AskForWarAid.propTypes = {
  war: PropTypes.object.isRequired,
  onRequestClose: PropTypes.func.isRequired,
}
function AskForWarAid({ war, onRequestClose }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])

  useEffect(() => {
    if (searchTerm.length < 2) return
    api
      .get('/v1/search/alliance', { query: searchTerm })
      .then(res => {
        setSearchResults(res.alliances)
      })
      .catch(() => {})
  }, [searchTerm])

  const askForAid = allianceID => {
    api
      .post('/v1/alliance/war_aid/request', {
        war_id: war.id,
        aiding_alliance_id: allianceID,
      })
      .then(onRequestClose)
      .catch(err => {
        window.alert(err.message)
      })
  }

  return (
    <Container withHairline darkBg borderSize={20}>
      <div style={{ padding: 10 }}>
        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Alianza" />
        {searchResults.map(alliance => {
          return (
            <div key={alliance.id}>
              <AllianceLink alliance={alliance} />
              <IncButton onClick={() => askForAid(alliance.id)}>Pedir ayuda</IncButton>
            </div>
          )
        })}
      </div>
    </Container>
  )
}
