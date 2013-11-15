'use strict';
var path = require('path')
  , u = require('util')
  , fs = require('fs')
  , shell = require('shelljs')
  , mustache = require('mustache')
  , debug = require('debug')('slap:task:mustache')

  , context = require('slap/context')
  ;


shell.config.fatal = true;
shell.config.silent = true;

module.exports = function(taskSetName, taskConfig, taskSets, slapConfig, callback) {
  'use strict';
  var logKey = ''
    , reporter
    , errMsg
    , _err
    ;

  logKey = [ '[', taskSetName, ':mustache]' ].join('');

  debug("%s Executing mustache task ...", logKey);

  callback(_err);
}


