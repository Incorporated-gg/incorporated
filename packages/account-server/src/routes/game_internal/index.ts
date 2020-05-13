import express from 'express'
import fs from 'fs'

export default function(app: express.Application): void {
  const files = fs.readdirSync(__dirname).filter((f: string) => f !== 'index.ts')

  if (!files.length) {
    return console.error('No se han encontrado archivos en el directorio actual')
  }

  // Require all routes available in this directory
  files.forEach((file: string) => {
    require(`./${file}`).default(app)
  })
}

export function validateGameServerRequest(req: express.Request): boolean {
  const secret = req.headers.authorization?.replace('Bearer ', '')
  if (!secret) return false
  return secret === process.env.ACCOUNT_CLIENT_SHARED_SECRET
}
