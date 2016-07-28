var cfg   = require('config');
var defer = require('config/defer').deferConfig;

module.exports = {

  auth: {
    scopes: ['https://mail.google.com']
  },

  mailboxes: [
    {
      auth: { tokenFile: defer( function (cfg) { return "access_token_"+cfg.appName+"-personal.json" } ) },
      name: 'personal',
      searches: defer( function(cfg) { return cfg.searches['personal'] } )
    },
    {
      auth: { tokenFile: defer( function (cfg) { return "access_token_"+cfg.appName+"-work.json" } ) },
      name: 'workPrimary',
      searches: defer( function(cfg) { return cfg.searches['workPrimary'] } )
    }
  ]

}
