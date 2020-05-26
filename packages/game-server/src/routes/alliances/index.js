module.exports = app => {
  require('./basic')(app)
  require('./manage_members')(app)
  require('./misc')(app)
  require('./war')(app)
  require('./war_aid')(app)
}
