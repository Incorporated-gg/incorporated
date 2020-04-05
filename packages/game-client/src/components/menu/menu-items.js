export default [
  {
    mainPath: '/ranking',
    svgIcon: require('./img/icon-missions.svg'),
    title: 'Misiones',
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
    title: 'Periódico',
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
    title: 'Corporación',
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
    title: 'Mapa',
    items: [
      {
        path: '/map',
        alt: 'Mapa',
      },
    ],
  },
]
