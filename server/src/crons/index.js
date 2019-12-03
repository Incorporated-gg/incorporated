const fs = require('fs')
const path = require('path')

module.exports = () => {
  const files = fs.readdirSync(__dirname).filter(f => f !== 'index.js')

  if (!files.length) {
    return console.error('No se han encontrado archivos en el directorio actual')
  }

  // Require all routes available in this directory
  files.forEach(file => {
    const filePath = path.join(__dirname, file)
    if (!fs.lstatSync(filePath).isFile()) return
    const cron = require(filePath)
    if (!cron || !cron.run || !cron.frequencyMs) return
    cron.run().catch(err => {
      err.message = `[CRON] [${file}]: ` + err.message
      console.error(err)
    })
    setInterval(() => cron.run(), cron.frequencyMs)
  })
}
