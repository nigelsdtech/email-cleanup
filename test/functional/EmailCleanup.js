'use strict'

var cfg          = require('config'),
    chai         = require('chai'),
    GmailModel   = require('gmail-model'),
    EmailCleanup = require('../../lib/EmailCleanup.js');

/*
 * Set up chai
 */
chai.should();



/*
 * Personal and Work mailboxes
 */

var mailboxes = {}

for (var mb in cfg.mailboxes) {

  mailboxes[mb] = new GmailModel({
    clientSecretFile    : cfg.auth.clientSecretFile,
    googleScopes        : cfg.auth.scopes,
    name                : mb,
    tokenDir            : cfg.auth.tokenFileDir,
    tokenFile           : cfg.mailboxes[mb].auth.tokenFile
  })

}


/*
 * For sending out trigger emails
 */

var triggerGmail = new GmailModel(cfg.test.personalGmail);



var timeout = cfg.test.timeout.functional


/*
 * Some utility functions
 */

/**
 * sendTriggerMessage
 *
 * params.subject
 * params.to
 */
function sendTriggerMessage (params) {

  triggerGmail.sendMessage ({
    body    : "This email to be cleaned up",
    subject : params.subject,
    to      : params.to
  }, function (err, message) {
    if (err) {
      console.error('Failed to send trigger email: ' + err)
      console.error(JSON.stringify(params))
      throw new Error(err);
    }
  })

}

/**
 * deleteTriggerMessage
 *
 * params.subject
 * params.to
 */
function deleteTriggerMessage (params) {

  triggerGmail.listMessages ({
    freetextSearch: "from:me subject:'" + params.subject + "'"
  }, function (err, messages) {
    if (err) {
      console.error('Failed to list sent trigger email for deletion: ' + err)
      console.error(JSON.stringify(params))
      throw new Error(err);
    }

    var msgsToTrash = [];
    messages.forEach( function (el) { msgsToTrash.push(el.id) })
    
    triggerGmail.trashMessages({
      messageIds: msgsToTrash
    }, function (err,resps) {
      if (err) {
        console.error('Failed to delete trigger email: ' + err)
        console.error(JSON.stringify(params))
        throw new Error(err);
      }

    });

  })

}


/*
 * The actual tests
 */

describe('Running the script when processing is required', function () {

  this.timeout(timeout);

  // Subject, to
  var triggerEmails = [
    {subject: 'Email cleanup test candidate 1',        to: cfg.mailboxes.personal.emailAddress},
    {subject: 'Email cleanup test candidate 2',        to: cfg.mailboxes.personal.emailAddress},
    {subject: 'Email cleanup test candidate 2 repeat', to: cfg.mailboxes.personal.emailAddress},
    {subject: 'Email cleanup test no match',           to: cfg.mailboxes.personal.emailAddress},
    {subject: 'Email cleanup test candidate 3',        to: cfg.mailboxes.work.emailAddress},
    {subject: 'Email cleanup test candidate 4',        to: cfg.mailboxes.work.emailAddress},
    {subject: 'Email cleanup test candidate 4 repeat', to: cfg.mailboxes.work.emailAddress}
  ]



  before(function (done) {

    triggerEmails.forEach( function (el) { sendTriggerMessage (el) });

    setTimeout(EmailCleanup, 10000);

  });


  it('deletes a message identified in the first mailbox')
  it('deletes multiple instances of a message identified in the first mailbox')

  it('deletes a message identified in the second mailbox')
  it('deletes multiple instances of a message identified in the second mailbox')

  it('doesn\'t delete a message that doesn\'t match the criteria')


  after(function () {
    triggerEmails.forEach( function (el) { deleteTriggerMessage (el) });
  });

});


describe('Error scenarios', function () {


  it('emails an error if it failed to search')
  it('emails an error if it failed to trash a message')


});
