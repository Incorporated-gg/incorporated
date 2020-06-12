import { Application, Request, Response, NextFunction } from 'express'
import fs from 'fs'

export default function(app: Application): void {
  const files = fs.readdirSync(__dirname).filter((f: string) => f !== 'index.ts')

  if (!files.length) {
    return console.error('No se han encontrado archivos en el directorio actual')
  }

  // Require all routes available in this directory
  files.forEach((file: string) => {
    require(`./${file}`).default(app)
  })
}

export function validateIsAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.accountData || !req.accountData.admin) {
    res.status(401).json({ error: 'No tienes permisos suficientes', errorCode: 'not_logged_in' })
    return
  }
  next()
}
