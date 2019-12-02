import React from 'react'
import MoneyDisplay from '../components/MoneyDisplay'
import { NavLink } from 'react-router-dom'
import './DesktopHeader.scss'

export default function DesktopHeader() {
  return (
    <nav className="desktop-header">
      <div className="money-display">
        <MoneyDisplay />
      </div>

      <ul className="main-menu">
        <li>
          <NavLink to="/" exact>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/personnel">Personal</NavLink>
        </li>
        <li>
          <NavLink to="/buildings">Edificios</NavLink>
        </li>
        <li>
          <NavLink to="/research">Investigaciones</NavLink>
        </li>
        <li>
          <NavLink to="/ranking">Ranking</NavLink>
        </li>
        <li>
          <NavLink to="/alliance">Alianza</NavLink>
        </li>
        <li>
          <NavLink to="/messages">Mensajes</NavLink>
        </li>
      </ul>
    </nav>
  )
}
