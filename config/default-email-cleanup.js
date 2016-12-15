var cfg   = require('config');
var defer = require('config/defer').deferConfig;

module.exports = {

  appName: "email-cleanup",

  auth: {
    scopes: ['https://mail.google.com']
  },

  log: {
    log4jsConfigs: {
      appenders: [
        {
          type:       "file",
          filename:   defer(function (cfg) { return cfg.log.logDir.concat("/" , cfg.appName , '-' , process.env.NODE_APP_INSTANCE , ".log" ) }),
          category:   defer(function (cfg) { return cfg.appName }),
          reloadSecs: 180,
          maxLogSize: 512000
        },
        {
          type: "console"
        }
      ],
      replaceConsole: true
    }
  },

  mailboxes: {
    personal: {
      auth: {
        tokenFile: defer( function (cfg) { return "access_token_"+cfg.appName+"-personal.json" } )
       },
      emailAddress: process.env.PERSONAL_EMAIL_ADDRESS
    },
    work: {
      auth: {
        tokenFile: defer( function (cfg) { return "access_token_"+cfg.appName+"-work.json" } )
      },
      emailAddress: process.env.OB_EMAIL_ADDRESS,
    }
  },

}
