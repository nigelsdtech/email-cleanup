"use strict"

var
    cfg        = require('config'),
    GmailModel = require('gmail-model'),
    log4js     = require('log4js')


/*
 * Object variables
 */

var
    gmail,
    log,
    name,
    searches


/**
 * Mailbox model constructor.
 * @param {object}   params - Params to be passed in
 * @param {string}   params.clientSecretFile - full path to the client secret file to be used by google if an access token doesn't yet exist
 * @param {string[]} params.googleScopes - Google drive scopes for which this object instance will have permissions
 * @param {string}   params.name - Name of the mailbox (for logging)
 * @param {string}   params.tokenDir - directory on the local machine in which the google access token lives
 * @param {string}   params.tokenFile - name of file on the local machine that contains the google access token
 * @constructor
 */
function Mailbox (params) {

  // logs

  log4js.configure(cfg.log.log4jsConfigs);

  log = log4js.getLogger(cfg.log.appName);
  log.setLevel(cfg.log.level);


  // Setup the gmail inbox
  this.gmail = new GmailModel({
    clientSecretFile: params.clientSecretFile,
    googleScopes:     params.googleScopes,
    name:             params.name,
    tokenDir:         params.tokenDir,
    tokenFile:        params.tokenFile
  })

  this.name     = params.name
  this.searches = params.searches

  // Log out the searches
  var self = this
  this.searches.forEach( function(el, idx) {
    log.info('[%s] [%s] Search: ', self.name, idx, el)
  })

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

  self.searches.forEach( function (el, searchIdx) {

    log.info('[%s] [%s] Searching', self.name, searchIdx) ;
  
    self.gmail.listMessages({
      freetextSearch: el,
      retFields: ['messages(id)']
    }, function (err, messages) {
    
      if (err) {
        var errMsg = '['+mb+'] ['+searchIdx+']: Error retrieving emails for search: "'+err;
        cb(errMsg)
        return null;
      }

      var numMessages = messages.length
      log.info('[%s] [%s] Trashing %s messages', self.name, searchIdx, numMessages ) ;

      // Bail if there was nothing to delete
      if (messages.length == 0) return;


      var ids = [];
      messages.forEach( function(el,idx) {
        ids.push(el.id)
      })

      // Log out details of the message about to be trashed
      ids.forEach( function(el,idx) {

        // Get message details to improve logging
        self.gmail.getMessage({
          messageId: el,
          format: 'metadata',
          metadataHeaders: ['Subject', 'Date'],
          retFields: ['payload(headers)']
        }, function (err, resp) {

          if (err) {
            var errMsg = '['+mb+'] ['+searchIdx+']: Error getting details for message '+el+': '+err;
            cb(errMsg)
            return null;
          }

          // Get metadata for better logging
          var subject = ''
          var date    = ''
	  var headers = resp.payload.headers

          for (var i = 0; i < headers.length; i++) {
            if (headers[i].name == "Subject") { subject = headers[i].value }
            else if (headers[i].name == "Date") { date = headers[i].value }
          }

          log.info('[%s] [%s] Trashing message (%s) "%s" (%s)', self.name, searchIdx, el, subject, date) ;
	})
      })


      // Trash them
      self.gmail.trashMessages({
        messageIds: ids
      }, function (err,resps) {
        if (err) {
          var errMsg = '['+mb+'] ['+searchIdx+']: Error trashing message: ' + err;
          cb(errMsg)
          return null;
        }
        log.info('[%s] [%s] Trashed %s messages', mb, searchIdx, numMessages) ;
      });

      
    })
  })

}

module.exports = Mailbox
