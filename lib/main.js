var cfg            = require('config'),
    gmailModel     = require('gmail-model'),
    log4js         = require('log4js'),
    Reporter       = require('reporter');



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
  var reporter = new Reporter(cfg.reporter);


  /*
   * Tidy error handler
   */
  function handleError(errMsg) {
    log.error(errMsg)
    reporter.handleError(errMsg)
  }


  /*
   * Main program
   */


  log.info('Begin script');
  log.info('============');



  try {


    cfg.mailboxes.foreach(function (mbEl) {


      // Setup the gmail inbox
      var gmail = new GmailModel({
        clientSecretFile: cfg.auth.clientSecretFile
        googleScopes:     cfg.auth.scopes
        name:             mbEl.name
        tokenDir:         cfg.auth.tokenFileDir
	tokenFile:        mbEl.auth.tokenFile
      }

      var searches = cfg.mailbox[mailbox].searches


      // Get the emails from the gmail search criteria
      searches.forEach(function(el) {

        gmail.listMessages({
          freetextSearch: el.q
        }, function (err, messages) {

          if (err) {
            var errMsg = 'main.js Error retrieving emails for search %s\n%s: ', el.q, err;
            handleError(errMsg)
            return null;
          }

          // Trash each one
          messages.forEach(function(msgEl) {
            gmail.trashMessages({messageIds: [msgEl.id]}, function (err, resps) {
              if (err) {
                var errMsg = 'main.js Error trashing message %s\n%s: ', msgEl.id, err;
                handleError(errMsg)
                return null;
              }
            });
          });
        });
      });
    });


  } catch (err) {

    var errMsg = 'Error in main body:\n ' + err + '\n' + err.stack;
    handleError(errMsg)
    return null;
  }

  return;


}
