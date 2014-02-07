var semver = require('semver')

module.exports = get_package

function get_package(app, req, res, name, version) {
  var not_found = app.responses.not_found
    , on_error = app.responses.error
    , backend = app.models.Package
    , ok = app.responses.ok

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

    ok(req, res, meta)
  }

  function all_meta(module_meta) {
    var data = {'dist-tags': module_meta.tags}

    data.versions = {}

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

      ok(req, res, data)
    }
  }
}
