var cfg   = require('config');
var defer = require('config/defer').deferConfig;

module.exports = {

  testTriggerEmail: {
    subject: defer( function (cfg) { return cfg.appName + ' delete this email' } )
  },

  mailboxes: [
    {
      auth: { tokenFile: defer( function (cfg) { return "access_token_"+cfg.appName+"-personal.json" } ) },
      name: 'Personal',
      searches: [
        'newer_than:1d subject:"' + cfg.appName + ' delete this email'
      ]
    },
    {
      auth: { tokenFile: defer( function (cfg) { return "access_token_"+cfg.appName+"-work.json" } ) },
      name: 'Work Primary'
      searches: defer( function(cfg) {
        return ['newer_than:1d subject:"' + cfg.testTriggerEmail.subject]
      })
     }
    }
  ]


}
