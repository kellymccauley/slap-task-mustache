'use strict';
var path = require('path')
  , u = require('util')
  , fs = require('fs')
  , _ = require('lodash')
  , shell = require('shelljs')
  , mustache = require('mustache')
  , debug = require('debug')('slap:task:mustache')

  , fileset = require('../fileset')
  , FileSet = fileset.FileSet

  , STRIP_EXT_RE = /\.\w+$/;
  ;


shell.config.fatal = true;
shell.config.silent = true;

module.exports = function(taskSetName, taskConfig, taskSets, slapConfig, callback) {
  'use strict';
  var logKey = ''
    , reporter
    , errMsg
    , _err
    , partialFiles = []
    , partials
    , templateFiles = []
    , destPath
    , data
    , transformerCallback
    ;

  logKey = ['[', taskSetName, ':mustache', ']'].join('');

  // {string|Array|FileSet|Object}  taskConfig.partials 
  // {Object}                       taskConfig.templateData 
  // {string|Array|FileSet}         taskConfig.templates
  // {string}                       taskConfig.toDir

  if (taskConfig.templates) {
    if (taskConfig.toDir) {

      if (taskConfig.outputTransformer && _.isFunction(taskConfig.outputTransformer)) {
        transformerCallback = _.createCallback(taskConfig.outputTransformer) || null;

      }


      if (taskConfig.partials) {
        if (_.isString(taskConfig.partials) || _.isArray(taskConfig.partials)) {
          partialFiles = fileset.of(taskConfig.partials).files;

        } else if (taskConfig.partials instanceof FileSet) {
          partialFiles = taskConfig.partials.files;

        } else {
          partials = taskConfig.partials;
        }

        // console.log("partialFiles: %s", u.inspect(partialFiles));

        if (partialFiles.length > 0) {
          partials = {};

          partialFiles.forEach(function(p) {
            'use strict';
            var key, content;
            key = path.basename(p).replace(STRIP_EXT_RE, '');
            if (!partials[key]) {
              content = fs.readFileSync(p, {encoding: 'utf8'});
              partials[key] = content;
            }
          });
        }
      }

      // console.log("partials: %s", u.inspect(partials));

      destPath = path.resolve(path.normalize(taskConfig.toDir));
      if (!fs.existsSync(destPath)) {
        u.print(u.format("%s Creating %s ...", logKey, destPath));
        shell.mkdir('-p', destPath);
        u.print(" ok\n");
      }

      if (_.isString(taskConfig.templates) || _.isArray(taskConfig.templates)) {
        templateFiles = fileset.of(taskConfig.templates).files;

      } else if (taskConfig.templates instanceof FileSet) {
        templateFiles = taskConfig.templates.files;

      }

      // console.log("templateFiles: %s", u.inspect(templateFiles));

      if (taskConfig.templateData) {
        data = taskConfig.templateData;
      }

      _.each(templateFiles, function(template) {
        'use strict';
        var file, fileName, destFile, input, output;

        file = path.resolve(path.normalize(template));
        fileName = path.basename(file);
        destFile = path.join(destPath, fileName);


        try {
          u.print(u.format("%s Rendering %s ...", logKey, file));

          input = fs.readFileSync(file, {encoding: 'utf8'});
          output = mustache.render(input, data, partials);

          if (transformerCallback) {
            output = transformerCallback(file, destFile, output);
          }

          if (fs.existsSync(destFile)) {
            fs.truncateSync(destFile, 0);
          }
          fs.writeFileSync(destFile, output, {encoding: 'utf8'});

          u.print(" ok\n");

        } catch (e) {
          u.print(" not ok!\n");
          _err = e;
          console.log("%s Unable to render template: %s", logKey, template);
          console.log("%s %s", logKey, e.message);
          return false;
        }
      });


    } else {
      _err = new Error(u.format("%s `toDir` property is required for the mustache task and it was not found in the task configuration: %s.", logKey, u.inspect(taskConfig)));
      console.log(_err.message);
    }

  }

  callback(_err);

};


