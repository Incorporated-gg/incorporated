const express = require('express')
const app = express()
const { setupRoutes } = require('./routes')

setupRoutes(app)

app.listen(3001, function () {
  console.log('Server listening on port 3001!')
})
