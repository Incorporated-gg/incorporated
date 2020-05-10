export default [
  {
    mainPath: '/ranking',
    svgIcon: require('./img/icon-missions.svg'),
    title: 'Misiones',
    items: [
      {
        path: '/ranking',
        alt: 'Ranking',
        alternativePaths: [/\/ranking\/*/],
      },
      {
        path: '/monopolies',
        alt: 'Monopolios',
      },
      {
        path: '/contest',
        alt: 'Competición',
      },
    ],
  },
  {
    mainPath: '/reports',
    svgIcon: require('./img/icon-newspaper.svg'),
    title: 'Buzón',
    extra: ['unread_reports', 'unread_messages'],
    items: [
      {
        path: '/reports',
        alt: 'Reportes',
        extra: ['unread_reports'],
      },
      {
        path: '/newspaper',
        alt: 'Periódico',
      },
      {
        path: '/messages',
        alternativePaths: ['/messages/sent'],
        alt: 'Mensajes',
        extra: ['unread_messages'],
      },
    ],
  },
  {
    mainPath: '/buildings',
    svgIcon: require('./img/icon-inversion.svg'),
    title: 'Inversión',
    items: [
      {
        path: '/buildings',
        alt: 'Edificios',
      },
      {
        path: '/research',
        alt: 'Investigación',
      },
      {
        path: '/personnel',
        alt: 'Personal',
      },
      {
        path: '/loans',
        alt: 'Préstamos',
      },
    ],
  },
  {
    mainPath: '/alliance',
    svgIcon: require('./img/icon-corp.svg'),
    title: 'Corporación',
    items: [
      {
        path: '/alliance',
        alt: 'Inicio',
        alternativePaths: ['/alliance/edit', '/alliance/edit-members'],
      },
      {
        path: '/alliance/resources',
        alt: 'Recursos',
      },
      {
        path: '/alliance/research',
        alt: 'Investigaciones',
      },
      {
        path: '/alliance/wars',
        alt: 'Guerras',
      },
    ],
  },
  {
    mainPath: '/map',
    svgIcon: require('./img/icon-map.svg'),
    title: 'Mapa',
    items: [
      {
        path: '/map',
        alt: 'Mapa',
      },
    ],
  },
]
