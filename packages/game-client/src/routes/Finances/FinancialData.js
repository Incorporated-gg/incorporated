import React from 'react'
import { buildingsList, calcBuildingDailyIncome } from 'shared-lib/buildingsUtils'
import { useUserData } from '../../lib/user'
import { PERSONNEL_OBJ } from 'shared-lib/personnelUtils'
import styles from './Finances.module.scss'

export default function FinancialData() {
  const userData = useUserData()

  if (!userData) return null

  // Buildings income
  const buildingsIncome = buildingsList.map(buildingInfo => {
    const quantity = userData.buildings[buildingInfo.id].quantity
    const income = calcBuildingDailyIncome(buildingInfo.id, quantity, userData.researchs[5]) * userData.incomeMultiplier
    return { building_id: buildingInfo.id, name: buildingInfo.name, quantity, income }
  })
  const totalBuildingsIncome = buildingsIncome.reduce((prev, curr) => prev + curr.income, 0)

  // Personnel maintenance
  let totalPersonnel = 0
  Object.entries(userData.personnel).forEach(([resourceID, quantity]) => {
    const personnelInfo = PERSONNEL_OBJ[resourceID]
    if (!personnelInfo) return
    const dailyCost = quantity * personnelInfo.dailyMaintenanceCost
    totalPersonnel += dailyCost
  })

  // Total
  const totalTotal = totalBuildingsIncome - totalPersonnel

  return (
    <div>
      <h1 className={styles.title}>Finanzas</h1>
      <div className={styles.table} cellSpacing={0}>
        <div className={styles.tableTitle}>Concepto</div>
        <div className={styles.tableTitle}></div>
        <div className={styles.tableTitle}>Ingresos</div>
        <div className={styles.tableTitle}>Gastos</div>
        {buildingsIncome.map(building => {
          return (
            <React.Fragment key={building.building_id}>
              <div>{building.name}</div>
              <div>({building.quantity.toLocaleString()})</div>
              <div>{building.income.toLocaleString()}</div>
              <div></div>
            </React.Fragment>
          )
        })}
        <div>Total edificios</div>
        <div></div>
        <div>{totalBuildingsIncome.toLocaleString()}</div>
        <div></div>

        <div>Personal</div>
        <div></div>
        <div></div>
        <div>{totalPersonnel.toLocaleString()}</div>

        <div className={`${styles.textHighlight} ${styles.textHighlightFirst}`}>TOTAL</div>
        <div className={styles.textHighlight}></div>
        <div className={`${styles.textHighlight} ${styles.textHighlightLast}`}>{totalTotal.toLocaleString()}</div>
        <div></div>
      </div>
    </div>
  )
}
