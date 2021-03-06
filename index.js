var fs = require('fs');
var async = require('async');
var path = require('path');
var glob = require('glob');
var sprintf = require('util').format

module.exports = function toRelative(opts) {
  var moduleName = opts.moduleName;
  var base = opts.base;
  var exclude = opts.exclude;

  var files = glob('**/*.js', { cwd: base }, function(err, files) {
    async.map(files, function(file, cb) {
      var absFilepath = path.join(base, file);

      var entry = {
        file: file,
        filepath: absFilepath,
        changes: []
      }

      fs.readFile(absFilepath, { encoding: 'utf8'}, function(err, content) {
        if (err) {
          console.error(err)
          return
        }
        var findRegex = /require\('([^\.^\']+)'\)/g;
        entry.newContent = content.replace(findRegex, function(whole, match, ind) {
          if (exclude.indexOf(match) === -1) {
            var requireAbsFilepath = path.join(base, match + '.js');
            var requireAbsFilepathIndex = path.join(base, match, './index.js');
            var newRequire;
            if (fs.existsSync(requireAbsFilepath)) {
              newRequire = path.relative(absFilepath, requireAbsFilepath)
            } else if (fs.existsSync(requireAbsFilepathIndex)) {
              newRequire = path.relative(absFilepath, requireAbsFilepathIndex)
            } else {
              var diff = path.relative(absFilepath, base)
              newRequire = path.join(diff, match)
            }

            if (/^\.\.\/\w/.test(newRequire)) {
              newRequire = newRequire.replace('../', './');
            } else {
              newRequire = newRequire.replace('../', '');
            }

            newRequire = newRequire.replace(/\.js$/, '');
            if (/\/index$/.test(newRequire)) {
              newRequire = newRequire.replace(/\/index$/, '');

            }
            changed = true;

            var replaced = "require('" + newRequire + "')";
            entry.changes.push({
              original: whole,
              replaced: replaced,
            })

            return replaced;
          }
          return whole;
        })

        cb(null, entry)
      })
    }, function(err, results) {
      if (err) {
        console.error(err)
        return
      }

      var changes = results.filter(function(item) {
        return item.changes.length > 0
      })

      if (opts.dry) {
        changes.forEach(function(entry) {
          var file = entry.file

          entry.changes.forEach(function(change) {
            console.log(sprintf("%s: %s -> %s", file, change.original, change.replaced))
          })
        });
      } else {
        changes.forEach(function(change) {
          console.log('writing file: ' + change.filepath, change.newContent)
          //fs.writeFile(change.filepath, change.newContent)
        });
      }
    })
  })
}

