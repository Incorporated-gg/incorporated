import React, { useState } from 'react'
import api from '../../lib/api'
import PropTypes from 'prop-types'
import { CREATE_ALLIANCE_PRICE } from 'shared-lib/allianceUtils'
import { reloadUserData } from '../../lib/user'

CreateAlliance.propTypes = {
  reloadAllianceData: PropTypes.func.isRequired,
}
export default function CreateAlliance({ reloadAllianceData }) {
  const [longName, setLongName] = useState('')
  const [shortName, setShortName] = useState('')
  const [description, setDescription] = useState('')

  const createAlliance = e => {
    e.preventDefault()
    api
      .post('/v1/alliance/create', {
        long_name: longName,
        short_name: shortName,
        description,
      })
      .then(res => {
        reloadAllianceData()
        reloadUserData()
      })
      .catch(err => {
        alert(err.message)
      })
  }

  return (
    <form>
      <div>
        <label>
          Nombre: <input type="text" value={longName} onChange={e => setLongName(e.target.value)} />
        </label>
      </div>
      <div>
        <label>
          Iniciales: <input type="text" value={shortName} onChange={e => setShortName(e.target.value)} />
        </label>
      </div>
      <div>
        <label>
          Descripción: <textarea value={description} onChange={e => setDescription(e.target.value)}></textarea>
        </label>
      </div>
      <div>Precio: {CREATE_ALLIANCE_PRICE.toLocaleString()}€</div>
      <div>
        <button onClick={createAlliance}>Crear</button>
      </div>
    </form>
  )
}
