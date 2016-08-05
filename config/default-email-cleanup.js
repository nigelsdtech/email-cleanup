var cfg   = require('config');
var defer = require('config/defer').deferConfig;

module.exports = {

  appName: "email-cleanup",

  auth: {
    scopes: ['https://mail.google.com']
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
