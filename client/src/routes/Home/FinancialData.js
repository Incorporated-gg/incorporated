import React, { useState, useEffect } from 'react'
import api from '../../lib/api'
import { buildingsList, calcBuildingDailyIncome } from 'shared-lib/buildingsUtils'
import { logout, useUserData } from '../../lib/user'
import { taxList, getIncomeTaxes } from 'shared-lib/taxes'
import { personnelList } from 'shared-lib/personnelUtils'

export default function FinancialData() {
  const userData = useUserData()
  const [buildings, setBuildings] = useState(null)
  useEffect(() => {
    api.get('/v1/buildings').then(res => {
      setBuildings(res.buildings)
    })
  }, [])

  // Buildings income
  const buildingsIncome = buildingsList.map(buildingInfo => {
    const quantity = buildings ? buildings[buildingInfo.id] : 0
    const income = calcBuildingDailyIncome(buildingInfo.id, quantity, userData.researchs[5])
    return { building_id: buildingInfo.id, name: buildingInfo.name, quantity, income }
  })
  const totalBuildingsIncome = buildingsIncome.reduce((prev, curr) => prev + curr.income, 0)

  // Taxes
  let taxesPercent = getIncomeTaxes(totalBuildingsIncome)
  if (userData.has_alliance) taxesPercent += taxList.alliance
  const totalTaxes = Math.round(totalBuildingsIncome * taxesPercent)

  // Personnel maintenance
  let totalPersonnel = 0
  Object.entries(userData.personnel).forEach(([resourceID, quantity]) => {
    const personnelInfo = personnelList.find(p => p.resource_id === resourceID)
    if (!personnelInfo) return
    const dailyCost = quantity * personnelInfo.dailyMaintenanceCost
    totalPersonnel += dailyCost
  })

  // Total
  const totalTotal = totalBuildingsIncome - totalTaxes - totalPersonnel

  return (
    <div>
      <button type="button" onClick={logout}>
        Logout
      </button>
      <h1>Finanzas</h1>
      <table>
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
            <td>Impuestos ({(taxesPercent * 100).toLocaleString()}%)</td>
            <td></td>
            <td>{totalTaxes.toLocaleString()}</td>
          </tr>
          <tr>
            <td>Mantenimiento de personal</td>
            <td></td>
            <td>{totalPersonnel.toLocaleString()}</td>
          </tr>
          <tr>
            <td>TOTAL</td>
            <td>{totalTotal.toLocaleString()}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
