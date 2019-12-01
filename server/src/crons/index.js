const fs = require('fs')

module.exports = () => {
  const files = fs.readdirSync(__dirname).filter(f => f !== 'index.js')

  if (!files.length) {
    return console.error('No se han encontrado archivos en el directorio actual')
  }

  // Require all routes available in this directory
  files.forEach(file => {
    const cron = require(`./${file}`)
    cron.run()
    setInterval(() => cron.run(), cron.frequencyMs)
  })
}
