var cfg   = require('config');
var defer = require('config/defer').deferConfig;

module.exports = {
  appName: "email-notification",
  appInstance: process.env.NODE_APP_INSTANCE,

  auth: {
    credentialsDir:   process.env.HOME+"/.credentials",
    clientSecretFile: defer( function (cfg) { return cfg.auth.credentialsDir+"/client_secret.json" } ),
    tokenFileDir:     defer( function (cfg) { return cfg.auth.credentialsDir } ),
    scopes:           ['https://mail.google.com']
  },

  log: {
    appName: defer(function (cfg) { return cfg.appName } ),
    level:   "INFO",
    log4jsConfigs: {
      appenders: [
        {
          type:       "file",
          filename:   defer(function (cfg) { return cfg.log.logDir.concat("/" , cfg.appInstance , ".log" ) }),
          category:   defer(function (cfg) { return cfg.appName }),
          reloadSecs: 60,
          maxLogSize: 1024000
        },
        {
          type: "console"
        }
      ],
      replaceConsole: true
    },
    logDir: "./logs"
  },

  processedLabelName: defer( function (cfg) { return cfg.appName + "-" + cfg.appInstance + "-processed" } ),

  reporter: {
    appName             : defer( function (cfg) { return cfg.appName + "-" + cfg.appInstance } ),
    appSpecificPassword : process.env.PERSONAL_APP_SPECIFIC_PASSWORD,
    clientSecretFile    : defer( function (cfg) { return cfg.auth.clientSecretFile } ),
    emailsFrom          : "Nigel's Raspberry Pi <"+process.env.PERSONAL_EMAIL+">",
    googleScopes        : ["https://www.googleapis.com/auth/gmail.send"],
    name                : "Reporter (Personal)",
    notificationTo      : process.env.PERSONAL_EMAIL,
    tokenDir            : defer( function (cfg) { return cfg.auth.tokenFileDir } ),
    tokenFile           : "access_token_reporter.json",
    user                : process.env.PERSONAL_GMAIL_USERNAME
  }

}
