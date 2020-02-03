const fs = require('fs')

module.exports.setupRoutes = app => {
  const files = fs.readdirSync(__dirname).filter(f => f !== 'index.js')

  if (!files.length) {
    return console.error('No se han encontrado archivos en el directorio actual')
  }

  // Require all routes available in this directory
  files.forEach(file => {
    require(`./${file}`)(app)
  })
}
