module.exports = app => {
  require('./alliances/basic')(app)
  require('./alliances/manage_members')(app)
  require('./alliances/misc')(app)
}
