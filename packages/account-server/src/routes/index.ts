import express from 'express'
import fs from 'fs'

export const setupRoutes = (app: express.Application): void => {
  const files = fs.readdirSync(__dirname).filter((f: string) => f !== 'index.js')

  if (!files.length) {
    return console.error('No se han encontrado archivos en el directorio actual')
  }

  // Require all routes available in this directory
  files.forEach((file: string) => {
    require(`./${file}`).default(app)
  })
}
