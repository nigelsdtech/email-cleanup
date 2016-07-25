var cfg   = require('config');
var defer = require('config/defer').deferConfig;

module.exports = {

  auth: {
    scopes: ['https://mail.google.com']
  },

  mailboxes: [
    {
      auth: { tokenFile: defer( function (cfg) { return "access_token_"+cfg.appName+"-personal.json" } ) },
      name: 'Personal',
      searches: process.env.emailCleanupPersonal
    },
    {
      auth: { tokenFile: defer( function (cfg) { return "access_token_"+cfg.appName+"-work.json" } ) },
      name: 'Work Primary'
      searches: process.env.emailCleanupWork
    }
  ]

}
