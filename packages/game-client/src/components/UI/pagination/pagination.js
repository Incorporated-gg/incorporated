import React, { useState, useEffect } from 'react'
import styles from './pagination.module.scss'
import PropTypes from 'prop-types'

/**
 * Pagination
 * @param {string} paramName - Indica el nombre del parámetro GET que se usará para la paginación
 * @param {number} maxPages - Indica el número máximo de páginas que hay para la paginación actual
 * @param {function} onPageChange - Callback que se ejecutará cuando cambie la página. Devuelve el nuevo número de página.
 * @param {number} numItems - Número máximo de páginas que se mostrarán tanto por atrás como por delante de la página actual.
 */
Pagination.propTypes = {
  paramName: PropTypes.string,
  maxPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func,
  numItems: PropTypes.number,
}
export default function Pagination({ paramName = 'page', maxPages, onPageChange = () => {}, numItems = 2 }) {
  const urlParams = new URLSearchParams(window.location.search)
  const [curPage, setCurPage] = useState(parseInt(urlParams.get(paramName)) || 1)

  useEffect(() => {
    onPageChange(curPage)
  }, [curPage, onPageChange])

  return (
    <div className={styles.pagination}>
      <button onClick={() => setCurPage(1)} className={`${styles.prev} ${styles.navLink}`}>
        {'<<'}
      </button>

      {Array.from(new Array(numItems).keys()).map((x, pageCount, allItems) => {
        if (curPage - (numItems - pageCount - 1) > 1) {
          return (
            <button
              key={`page${curPage - (numItems - pageCount)}`}
              onClick={() => setCurPage(curPage - (numItems - pageCount))}
              className={`${styles.prev} ${styles.navLink}`}>
              {curPage - (numItems - pageCount)}
            </button>
          )
        } else return null
      })}

      <button className={`${styles.navLink} ${styles.current}`}>{curPage}</button>

      {Array.from(new Array(numItems).keys()).map((x, pageCount) => {
        if (curPage + pageCount < maxPages) {
          return (
            <button
              key={`page${curPage + (pageCount + 1)}`}
              onClick={() => setCurPage(curPage + (pageCount + 1))}
              className={`${styles.prev} ${styles.navLink}`}>
              {curPage + (pageCount + 1)}
            </button>
          )
        } else return null
      })}
      <button onClick={() => setCurPage(maxPages)} className={`${styles.prev} ${styles.navLink}`}>
        {'>>'}
      </button>
    </div>
  )
}
