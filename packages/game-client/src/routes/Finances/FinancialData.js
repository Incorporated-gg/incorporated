import React, { useCallback, useState, useEffect } from 'react'
import { buildingsList, calcBuildingDailyIncome } from 'shared-lib/buildingsUtils'
import { useUserData } from '../../lib/user'
import api from '../../lib/api'
import { PERSONNEL_OBJ } from 'shared-lib/personnelUtils'
import styles from './Finances.module.scss'
import { LOAN_DAYS_DURATION } from 'shared-lib/loansUtils'

export default function FinancialData() {
  const userData = useUserData()
  const [givenLoan, setGivenLoan] = useState()
  const [takenLoan, setTakenLoan] = useState()

  // Loans
  const refreshLoansList = useCallback(() => {
    api.get('/v1/loans').then(res => {
      setGivenLoan(res.given_loan)
      setTakenLoan(res.taken_loan)
    })
  }, [])
  useEffect(() => {
    refreshLoansList()
  }, [refreshLoansList])

  const gainedFromLoans =
    givenLoan && givenLoan.borrower
      ? Math.round((givenLoan.money_amount * (givenLoan.interest_rate / 100 + 1)) / LOAN_DAYS_DURATION)
      : 0
  const lostFromLoans = takenLoan
    ? Math.round((takenLoan.money_amount * (takenLoan.interest_rate / 100 + 1)) / LOAN_DAYS_DURATION)
    : 0

  if (!userData) return null

  // Buildings income
  const buildingsIncome = buildingsList.map(buildingInfo => {
    const quantity = userData.buildings[buildingInfo.id].quantity
    const income = calcBuildingDailyIncome(buildingInfo.id, quantity, userData.researchs[5])
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
  const totalTotal = totalBuildingsIncome - totalPersonnel - lostFromLoans + gainedFromLoans

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

        <div>Préstamos</div>
        <div></div>
        <div>{gainedFromLoans.toLocaleString()}</div>
        <div>{lostFromLoans.toLocaleString()}</div>

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
