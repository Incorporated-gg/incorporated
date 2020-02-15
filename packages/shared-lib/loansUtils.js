const process = require('process')

module.exports.LOAN_DAYS_DURATION = process.env.NODE_ENV === 'development' ? 1 : 7
