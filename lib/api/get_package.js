var backend = require('../storage')
  , not_found = require('./404')
  , semver = require('semver')

module.exports = get_package

function get_package(req, res, name, version) {
  backend.get_module_meta(name, function(err, meta) {
    if(err || !meta || !meta.versions || !meta.versions.length) {
      return not_found(req, res)
    }

    if(!version) {
      return all_meta(meta)
    }

    version = semver.maxSatisfying(meta.versions, version, true)

    if(!version) {
      return not_found(req, res)
    }

    backend.get_meta(name, version, return_meta)
  })

  function return_meta(err, meta) {
    if(err || !meta) {
      return not_found(req, res)
    }

    res.writeHead(200, {
        'Content-Type': 'application/json'
    })
    res.write(JSON.stringify(meta))
    res.end()
  }

  function all_meta(module_meta) {
    var data = {
        versions: {}
      , 'dist-tags': module_meta.tags
    }

    for(var i = module_meta.versions.length - 1; i >= 0; --i) {
      backend.get_meta(name, module_meta.versions[i], got_meta.bind(null, i))
    }

    function got_meta(i, err, meta) {
      if(err || !meta) {
        return on_error(req, res, new Error(
            'failed to load meta for ' + name + '@' + module_meta.versions[i]
        ))
      }

      data.versions[module_meta.versions[i]] = meta

      if(Object.keys(data.versions).length !== module_meta.versions.length) {
        return
      }

      res.writeHead(200, {
          'Content-Type': 'application/json'
      })
      res.write(JSON.stringify(data))
      res.end()
    }
  }

  function on_error(req, res, err) {
    process.stderr.write(err.message)
    res.writeHead(500)
    res.write('something went wrong')
    res.end()
  }
}
