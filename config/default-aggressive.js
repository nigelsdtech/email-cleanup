var cfg   = require('config');
var defer = require('config/defer').deferConfig;

module.exports = {

  mailboxes: {
    work: {
      auth: {
        tokenFile: defer( function (cfg) { return "access_token_"+cfg.appName+"-work.json" } )
      },
      emailAddress: process.env.OB_EMAIL_ADDRESS
     }
  }
}
