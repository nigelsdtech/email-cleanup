'use strict'

var cfg          = require('config'),
    chai         = require('chai'),
    GmailModel   = require('gmail-model'),
    rewire       = require('rewire'),
    sinon        = require('sinon'),
    EmailCleanup = rewire('../../lib/EmailCleanup.js');

/*
 * Set up chai
 */
chai.should();



/*
 * Work mailbox
 */

var workGmail = new GmailModel({
  clientSecretFile    : cfg.auth.clientSecretFile,
  googleScopes        : cfg.auth.scopes.work,
  name                : cfg.mailbox.work.name,
  tokenDir            : cfg.auth.tokenFileDir,
  tokenFile           : cfg.auth.tokenFile.work
});

/*
 * Personal mailbox
 */

var personalGmail = new GmailModel({
  clientSecretFile    : cfg.auth.clientSecretFile,
  googleScopes        : cfg.auth.scopes.personal,
  name                : cfg.mailbox.personal.name,
  tokenDir            : cfg.auth.tokenFileDir,
  tokenFile           : cfg.auth.tokenFile.personal
});




var timeout = cfg.test.functional


/*
 * Some utility functions
 */

/*
 * For sending out trigger emails
 */

var triggerGmail = new GmailModel({
  appSpecificPassword : cfg.mailbox.personal.password,
  clientSecretFile    : cfg.auth.clientSecretFile,
  emailsFrom          : cfg.mailbox.personal.emailsFrom,
  googleScopes        : cfg.auth.scopes.personal,
  tokenDir            : cfg.auth.tokenFileDir,
  tokenFile           : cfg.auth.tokenFile.personal,
  user                : cfg.mailbox.personal.user
});

/**
 * sendTriggerMessage
 *
 * params.subject
 * params.to
 */
function sendTriggerMessage (params,cb) {

  personalGmail.sendMessage ({
    body    : "This email to be cleaned up",
    subject : params.subject,
    to      : params.to
  }, function (err, message) {
    if (err) { cb(err); return null; }
    cb(message)
  })

}



/*
 * The actual tests
 */

describe('Running the script when processing is required', function () {

  this.timeout(timeout);

  var triggerEmailIdsPersonal = []
  var triggerEmailIdsWork     = []


  before(function (done) {

    // Subject, to
    var toSend = [
      {subject: 'Email cleanup test candidate 1',        to: personalEmail},
      {subject: 'Email cleanup test candidate 2',        to: personalEmail},
      {subject: 'Email cleanup test candidate 2 repeat', to: personalEmail},
      {subject: 'Email cleanup test no match',           to: personalEmail},
      {subject: 'Email cleanup test candidate 3',        to: workEmail},
      {subject: 'Email cleanup test candidate 4',        to: workEmail},
      {subject: 'Email cleanup test candidate 4 repeat', to: workEmail}
    ]

    toSend.foreach( function (el) {
      sendTriggerMessage ( function (err, msg) {
        if (err) {
          console.error('Failed to send trigger email: ' + err)
          console.error(JSON.stringify(el))
          throw new Error(err);
        }
      });
    });


    setTimeout(EmailCleanup, 5000);

  });


  it('deletes a message identified in the first mailbox')
  it('deletes multiple instances of a message identified in the first mailbox')

  it('deletes a message identified in the second mailbox')
  it('deletes multiple instances of a message identified in the second mailbox')

  it('doesn\'t delete a message that doesn\'t match the criteria')


  after(function (done) {

  });

});


describe('Error scenarios', function () {


  it('emails an error if it failed to search')
  it('emails an error if it failed to trash a message')


});
