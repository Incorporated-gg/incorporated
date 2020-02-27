import React, { useCallback, useState, useEffect } from 'react'
import { buildingsList, calcBuildingDailyIncome } from 'shared-lib/buildingsUtils'
import { useUserData } from '../../lib/user'
import api from '../../lib/api'
import { personnelList } from 'shared-lib/personnelUtils'
import styles from './Finances.module.scss'

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

  const LOAN_DAYS_DURATION = 7
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
    const personnelInfo = personnelList.find(p => p.resource_id === resourceID)
    if (!personnelInfo) return
    const dailyCost = quantity * personnelInfo.dailyMaintenanceCost
    totalPersonnel += dailyCost
  })

  // Total
  const totalTotal = totalBuildingsIncome - totalPersonnel - lostFromLoans + gainedFromLoans

  return (
    <div>
      <h1>Finanzas</h1>
      <table cellSpacing={0}>
        <thead>
          <tr>
            <th>Concepto</th>
            <th>Ingresos</th>
            <th>Gastos</th>
          </tr>
        </thead>
        <tbody>
          {buildingsIncome.map(building => {
            return (
              <tr key={building.building_id}>
                <td>
                  {building.name} ({building.quantity.toLocaleString()})
                </td>
                <td>{building.income.toLocaleString()}</td>
                <td></td>
              </tr>
            )
          })}
          <tr>
            <td>
              <br />
            </td>
          </tr>
          <tr>
            <td>Total edificios</td>
            <td>{totalBuildingsIncome.toLocaleString()}</td>
            <td></td>
          </tr>
          <tr>
            <td>Préstamos</td>
            <td>{gainedFromLoans.toLocaleString()}</td>
            <td>{lostFromLoans.toLocaleString()}</td>
          </tr>
          <tr>
            <td>Mantenimiento de personal</td>
            <td></td>
            <td>{totalPersonnel.toLocaleString()}</td>
          </tr>
          <tr className={styles.textHighlight}>
            <td>TOTAL</td>
            <td>{totalTotal.toLocaleString()}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
