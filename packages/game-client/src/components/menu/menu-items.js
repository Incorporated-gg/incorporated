export default [
  {
    mainPath: '/ranking',
    svgIcon: require('./img/icon-missions.svg'),
    svgText: require('./img/text-missions.svg'),
    extra: ['unread_reports'],
    items: [
      {
        path: '/ranking',
        alt: 'Ranking',
        alternativePaths: [/\/ranking\/*/],
      },
      {
        path: '/contests/monopolies',
        alt: 'Competiciones',
        alternativePaths: [/\/contests\/*/],
      },
      {
        path: '/personnel',
        alt: 'Personal',
      },
      {
        path: '/reports',
        alt: 'Reportes',
        extra: ['unread_reports'],
      },
    ],
  },
  {
    mainPath: '/newspaper',
    svgIcon: require('./img/icon-newspaper.svg'),
    svgText: require('./img/text-newspaper.svg'),
    extra: ['unread_messages'],
    items: [
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
    svgText: require('./img/text-inversion.svg'),
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
        path: '/loans',
        alt: 'Préstamos',
      },
      {
        path: '/finances',
        alt: 'Finanzas',
      },
    ],
  },
  {
    mainPath: '/alliance',
    svgIcon: require('./img/icon-corp.svg'),
    svgText: require('./img/text-corp.svg'),
    items: [
      {
        path: '/alliance',
        alt: 'Inicio',
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
        path: '/alliance/missions',
        alt: 'Misiones',
        alternativePaths: ['/alliance/missions/spy'],
      },
      {
        path: '/alliance/wars',
        alt: 'Guerras',
      },
      {
        path: '/alliance/admin',
        alt: 'Admin',
      },
    ],
  },
  {
    mainPath: '/map',
    svgIcon: require('./img/icon-map.svg'),
    svgText: require('./img/text-map.svg'),
    items: [
      {
        path: '/map',
        alt: 'Mapa',
      },
    ],
  },
]
