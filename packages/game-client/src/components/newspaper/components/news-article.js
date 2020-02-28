import React from 'react'
import PropTypes from 'prop-types'
import AllianceLink from 'components/alliance/alliance-link'
import Icon from 'components/icon'
import { numberToAbbreviation } from 'lib/utils'

NewsArticle.propTypes = {
  article: PropTypes.object.isRequired,
}
export default function NewsArticle({ article, ...props }) {
  return (
    <div {...props}>
      <h4>{getArticleTitle(article)}</h4>
      <div>{getArticleCorpus(article)}</div>
    </div>
  )
}

function getArticleTitle(article) {
  switch (article.type) {
    case 'WAR_DECLARATION': {
      return 'Una nueva guerra comienza'
    }
    case 'FAKE_AD': {
      return 'Anuncio'
    }
    case 'TOTAL_ROBBED_MONEY': {
      return 'Negocios bajo ataque'
    }
    case 'TOTAL_ATTACKS_COUNT': {
      return '"Ciudad más segura que nunca" - dice el alcalde'
    }
    default: {
      return 'Artículo desconocido'
    }
  }
}

function getArticleCorpus(article) {
  switch (article.type) {
    case 'WAR_DECLARATION': {
      return (
        <>
          La alianza <AllianceLink alliance={article.data.alliance1} /> ha declarado la guerra a{' '}
          <AllianceLink alliance={article.data.alliance2} />. Buena suerte a ambas!!
        </>
      )
    }
    case 'FAKE_AD': {
      if (article.data.ad_id === 1) return 'Compra Puros Pepe! Los mejores de la ciudad'
      if (article.data.ad_id === 2)
        return 'La ropa de Push&Rear tiene calidad insuperable. Ven a visitarnos y no te arrepentirás!'
      if (article.data.ad_id === 3)
        return 'Si quiere juventud, salud, y belleza... Use usted jabón y crema Bella Della cada día'
      if (article.data.ad_id === 4) return 'Tabletas Layer de Aspirina®: El fin del sufrimiento'
      return ''
    }
    case 'TOTAL_ROBBED_MONEY': {
      return (
        <>
          En los últimos {article.data.days_period} días han sido robados un total de{' '}
          {numberToAbbreviation(article.data.robbed_money)} <Icon iconName="money" size={20} />
        </>
      )
    }
    case 'TOTAL_ATTACKS_COUNT': {
      return `${numberToAbbreviation(
        article.data.attacks_count
      )} ataques han sido reportados en las últimas 24 horas. Vayan con cuidado!`
    }
    default: {
      return 'Artículo desconocido'
    }
  }
}
