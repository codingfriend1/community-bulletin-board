'use strict';

var _ = require('lodash');
var auth = require('feathers-authentication').hooks;

// Add any common hooks you want to share across services in here.
//
// Below is an example of how a hook is written and exported. Please
// see http://docs.feathersjs.com/hooks/readme.html for more details
// on hooks.

exports.populateUserEmail = function(options) {
  return function(hook) {
    if(!_.isEmpty(hook.params, 'user')) {
      hook.data.createdByEmail = hook.params.user.email;
    }
  };
};

exports.voteOrOwner = function(options) {
  return function(hook) {
    return new Promise((resolve, reject) => {
      if (Object.keys(hook.data).length === 1 && !_.isEmpty(hook.data, '$inc.votes') && (hook.data.$inc.votes === 1 || hook.data.$inc.votes === -1)) {
        return resolve(hook);
      } else {
        // call the original hook
        var onlyOwner = auth.restrictToOwner(options).bind(hook.app.service('articles'))
        onlyOwner(hook)
          .then(hook => {
            // do something custom
            resolve(hook);
          })
          .catch(error => {
            console.log("error", error);
            // do any custom error handling
            error.message = 'You must be authenticated to edit an article';
            reject(error);
          });
      }
    });
  };
}
