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
      return 'Estalla guerra entre dos principales corporaciones'
    }
    case 'WAR_ENDED': {
      return 'Termina la guerra entre dos principales corporaciones'
    }
    case 'WAR_UPDATE_DAY_3': {
      return 'Continua la guerra entre dos principales corporaciones'
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
          La corporación <AllianceLink alliance={article.data.alliance1} /> ha declarado la guerra a{' '}
          <AllianceLink alliance={article.data.alliance2} />. La tensión entre los dos gigantes se palpaba, y a nadie
          esta noticia le viene por sorpresa. Continuaremos informando sobre los avances de este conflicto.
        </>
      )
    }
    case 'WAR_ENDED': {
      return (
        <>
          Ha finalizado la guerra entre la corporación <AllianceLink alliance={article.data.alliance1} /> y
          <AllianceLink alliance={article.data.alliance2} />. La ganadora ha sido{' '}
          <AllianceLink alliance={article.data.winner} />
        </>
      )
    }
    case 'WAR_UPDATE_DAY_3': {
      return (
        <>
          La guerra entre dos principales corporaciones continúa. De momento, los puntos acumulados son{' '}
          {article.data.warPoints1} para <AllianceLink alliance={article.data.alliance1} /> y {article.data.warPoints2}{' '}
          para <AllianceLink alliance={article.data.alliance2} />
        </>
      )
    }
    case 'FAKE_AD': {
      if (article.data.ad_id === 1) return 'Compre Puros Ulises! Los mejores de la ciudad'
      if (article.data.ad_id === 2)
        return 'La ropa de Canel tiene calidad insuperable. Venga a visitarnos y no se arrepentirá!'
      if (article.data.ad_id === 3)
        return 'Si quiere juventud, salud, y belleza... Use usted jabón y crema Bella Della cada día'
      if (article.data.ad_id === 4) return 'Tabletas Layer de Aspirina®: El fin del sufrimiento'
      return ''
    }
    case 'TOTAL_ROBBED_MONEY': {
      return (
        <>
          En los últimos {article.data.days_period} días han sido robados un total de{' '}
          {numberToAbbreviation(article.data.robbed_money)} <Icon iconName="money" size={22} />
        </>
      )
    }
    case 'TOTAL_ATTACKS_COUNT': {
      return `${numberToAbbreviation(
        article.data.attacks_count
      )} ataques han sido reportados en las últimas 24 horas. El alcade ha asegurado que las fuerzas de seguridad están trabajando para resolver este problema que plaga la ciudad`
    }
    default: {
      return 'Artículo desconocido'
    }
  }
}
