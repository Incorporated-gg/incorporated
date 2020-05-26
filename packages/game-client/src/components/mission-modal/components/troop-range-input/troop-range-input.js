import React from 'react'
import { numberToAbbreviation } from 'lib/utils'
import { buildingsList } from 'shared-lib/buildingsUtils'
import PropTypes from 'prop-types'
import IncButton from 'components/UI/inc-button'
import IncInput from 'components/UI/inc-input/inc-input'
import styles from './troop-range-input.module.scss'
import IncContainer from 'components/UI/inc-container'

TroopRangeInput.propTypes = {
  name: PropTypes.string.isRequired,
  max: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
  setValue: PropTypes.func.isRequired,
}
export default function TroopRangeInput({ name, max, value, setValue }) {
  const buildingsOptionsObj = {}
  buildingsList.forEach(building => {
    buildingsOptionsObj[building.id] = building.name
  })

  const adjustNum = max >= 10000 ? 100 : max >= 1000 ? 10 : 1
  const adjustButtonPressed = (curr, set, diff) => {
    set(Math.min(max, Math.max(0, curr + diff)))
  }
  const step = max > 100 ? 10 : 1

  return (
    <IncContainer className={styles.troopInputContainer}>
      <div className={styles.inputLabel}>
        <div>
          <p>{name}</p>
          <p>{value.toLocaleString()}</p>
        </div>
        <IncButton onClick={() => adjustButtonPressed(value, setValue, -adjustNum)}>
          -{numberToAbbreviation(adjustNum)}
        </IncButton>
        <IncInput step={step} min={0} max={max} type="range" value={value} onChangeText={setValue} />
        <IncButton onClick={() => adjustButtonPressed(value, setValue, adjustNum)}>
          +{numberToAbbreviation(adjustNum)}
        </IncButton>
      </div>
    </IncContainer>
  )
}
