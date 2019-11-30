const express = require('express')
const app = express()
const { setupRoutes } = require('./routes')

require('./express-async-errors-patch')
app.disable('x-powered-by')

// Parse application/json
var bodyParser = require('body-parser')
app.use(bodyParser.json())

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.header('Allow', 'GET, POST, OPTIONS')
  next()
})

// OPTIONS middleware
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
    return
  }
  next()
})

// Auth middleware
require('./auth-middleware')(app)

// Our routes
setupRoutes(app)

// Errors middleware
app.use(errorHandler)
function errorHandler(err, req, res, next) {
  console.error(err.stack)
  res.status(500).send({ error: 'Error 500: Algo salió mal' })
}

app.listen(3001, function() {
  console.log('Server listening on port 3001!')
})
