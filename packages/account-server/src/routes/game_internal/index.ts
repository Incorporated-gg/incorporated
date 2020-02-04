import express from 'express'
import fs from 'fs'

export default function(app: express.Application): void {
  const files = fs.readdirSync(__dirname).filter((f: string) => f !== 'index.js')

  if (!files.length) {
    return console.error('No se han encontrado archivos en el directorio actual')
  }

  // Require all routes available in this directory
  files.forEach((file: string) => {
    require(`./${file}`).default(app)
  })
}

export function validateSecret(secret?: string): boolean {
  if (!secret) return false
  return secret === 'c342[E$32C'
}
