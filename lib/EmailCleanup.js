var cfg            = require('config'),
    GmailModel     = require('gmail-model'),
    log4js         = require('log4js'),
    Mailbox        = require('./Mailbox.js'),
    reporter       = require('reporter');



/*
* Purge the inbox of emails matching set out criteria
*
*/


module.exports = function () {


  /*
   * Initialize
   */


  // logs

  log4js.configure(cfg.log.log4jsConfigs);

  var log = log4js.getLogger(cfg.log.appName);
  log.setLevel(cfg.log.level);


  /*
   * Job reporter
   */
  reporter.configure(cfg.reporter);


  /*
   * Tidy error handler
   */
  function handleError(errMsg) {
    log.error(errMsg)
    reporter.handleError({errMsg: errMsg})
  }


  /*
   * Main program
   */


  log.info('Begin script');
  log.info('============');



  try {


    var mbs = cfg.mailboxes

    for (var mb in mbs) {

      if (!mbs[mb].hasOwnProperty('searches')) { continue }
      log.info('Processing mailbox %s', mb);

      // Setup the gmail inbox
      var mailbox = new Mailbox({
        clientSecretFile: cfg.auth.clientSecretFile,
        googleScopes:     cfg.auth.scopes,
        name:             mb,
        searches:         mbs[mb].searches,
        tokenDir:         cfg.auth.tokenFileDir,
	tokenFile:        mbs[mb].auth.tokenFile
      })

      mailbox.process(null,function (err) {
        var errMsg = 'Error in mailbox:'
        for (var key in err) {
          errMsg += '\n->' + key + ': ' + err[k]
        }
        handleError(errMsg)
      })
    };


  } catch (err) {

    var errMsg = 'Error in main body:'
    for (var key in err) {
      errMsg += '\n->' + key + ': ' + err[k]
    }
    handleError(errMsg)
    return null;
  }

  return;


}
