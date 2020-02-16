export default [
  {
    mainPath: '/ranking',
    svgIcon: 'missions',
    svgText: 'text-misiones',
    extra: ['unread_reports'],
    items: [
      {
        path: '/ranking',
        alt: 'Ranking',
        alternativePaths: ['/ranking/research', '/ranking/alliances'],
      },
      {
        path: '/contests/monopolies',
        alt: 'Competiciones',
        alternativePaths: ['/contests', '/contests/fever', '/contests/profit', '/contests/spy'],
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
    svgIcon: 'inversion',
    svgText: 'text-periodico',
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
    svgIcon: 'inversion',
    svgText: 'text-inversion',
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
    svgIcon: 'inversion',
    svgText: 'text-corporacion',
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
    svgIcon: 'inversion',
    svgText: 'text-mapa',
    items: [
      {
        path: '/map',
        alt: 'Mapa',
      },
    ],
  },
]
