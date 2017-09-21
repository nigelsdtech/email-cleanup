"use strict"

var
    cfg                = require('config'),
    EmailNotification  = require('email-notification'),
    log4js             = require('log4js')


/*
 * Object variables
 */

var
  gmail,
  logPrefix,
  name,
  searches


/**
 * Mailbox model constructor.
 * @param {object}   params - Params to be passed in
 * @param {string}   params.name - Name of the mailbox (for logging and as seen in config item names)
 * @constructor
 */
function Mailbox (params) {

  this.name     = params.name
  this.searches = cfg.mailboxes[this.name].searches

  // Log out the searches
  var self = this

  // logs

  log4js.configure(cfg.log.log4jsConfigs);

  self.logPrefix = "mailbox [" + this.name + "]"

}


var method = Mailbox.prototype


/**
 * mailbox.getMessages
 *
 * @desc Idetify messages matching search criteria
 *
 * @alias mailbox.getMessages
 *
 * @param  {object} params - Parameters for request (currently unused)
 * @param  {callback} callback - The callback that handles the error response. Returns callback(errMsg)
 * @return {object} errMsg -
 */
method.process = function (params,cb) {

  var mb = this.name

  var self = this;

  self.searches.forEach( function (search, searchIdx) {

    var log = log4js.getLogger(self.logPrefix + " [" + searchIdx + "]");
    log.setLevel(cfg.log.level);

    log.info('Search: %s ', JSON.stringify(search))

    // Retrieve the search and the action to be performed on emails matching that search
    // Default behaviour is to trash messages
    var searchCriteria = search
    var actions = ['trash']
    if (typeof search === 'object') {
      searchCriteria = search.criteria
      actions        = search.actions
    }


    // Create an email-notification object to do all the work
    var tokenFile = cfg.auth.tokenFile.replace("%s",mb);

    var enParams = {
      format:            'metadata',
      gmail: {
        clientSecretFile: cfg.auth.clientSecretFile,
        googleScopes:     cfg.auth.googleScopes,
        name:             cfg.auth.name,
        tokenDir:         cfg.auth.tokenDir,
        tokenFile:        tokenFile
      },
      gmailSearchCriteria: searchCriteria,
      metadataHeaders:    ['subject','date'],
      processedLabelName: cfg.processedLabelName,
      retFields:          ['id','labelIds','payload(headers)']
    }

    if (cfg.maxResults) enParams.maxResults = cfg.maxResults

    var en = new EmailNotification(enParams);



    // Kick off and get the matching messages

    en.getMessages(null, function (err, messages) {
    
      if (err) {
        log.error('Error retrieving emails for search: %s\n%s ', err.message, err.stack)
        cb(err)
        return null;
      }

      var numMessages = (messages)? messages.length : 0
      log.info('Found %s messages', numMessages ) ;

      // Bail if there were no hits
      if (!messages) return;


      // Log out details of matches
      messages.forEach( function(message,idx) {

        // Get metadata for better logging
        var id      = message.id
        var subject = ''
        var date    = ''
        var headers = message.payload.headers

        for (var i = 0; i < headers.length; i++) {
          if      (headers[i].name == "Subject") { subject = headers[i].value }
          else if (headers[i].name == "Date")    { date    = headers[i].value }
        }

        log.info('[%s]: Found message: "%s" (%s)', id, subject, date) ;

      })


      //
      // Perform processing actions
      //


      var applyProcessedLabel = (actions.indexOf('applyProcessedLabel') >= 0)? true : false
      var markAsRead          = (actions.indexOf('markAsRead')          >= 0)? true : false
      var trash               = (actions.indexOf('trash')               >= 0)? true : false

      log.info('Updating %s messages [%s]', numMessages, actions) ;

      // Do the update
      en.updateLabels({
        applyProcessedLabel: applyProcessedLabel,
        markAsRead:          markAsRead,
        trash:               trash
      }, function (err,resps) {
        if (err) {
          log.error('Error updating labels: %s\n%s ', err.message, err.stack)
          cb(err)
          return null;
        }
        log.info('Updated %s messages', numMessages) ;
      });
    })
  })

}


module.exports = Mailbox
