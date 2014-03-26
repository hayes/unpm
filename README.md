μnpm
====

Your own private npm

[![Build Status](https://travis-ci.org/hayes/unpm.png?branch=master)](https://travis-ci.org/hayes/unpm)
[![Coverage Status](https://coveralls.io/repos/hayes/unpm/badge.png?branch=master)](https://coveralls.io/r/hayes/unpm?branch=master)
## Usage

To copy a module from the public npm:

`curl http://localhost:8123/clone/module-name/1.1.1?recursive=true -X POST`

To clone deps for a module already in μnpm:

`curl http://localhost:8123/get_deps/module-name/1.1.1?recursive=true -X POST`

---

Most normal npm commands work, you will just need to specify the location of
your μnpm server with a `--registry` flag (or via your `.npmrc` with a
`registry` entry).

## Configuration

A default configuration file is set in [./lib/config.json](./lib/config.json).

You can, of course, pass your own configuration object.  The parameters are as
follows:

Assuming you have set `config = require('config.json')`, then `config` can 
have the following attributes.

- `config.host`: Describes a base URI at which μnpm's resources will be made
  available, modulo package name. The URI (with package name) is written to
  each packages metadata. At current this simply sets the URI (modulo name and
  version) at which package tarballs are available. `config.host` is passed
  directly to
  [`url.format`](http://nodejs.org/api/url.html#url_url_format_urlobj)

  Note: that this may or may not reflect the URI at which μnpm's resources
  will be made available.  The intent is to allow μnpm to sit behind a proxy,
  writing its data to a location from which they might be served by a light,
  fast static asset server. The proxy can route requests to host to the static
  server, and requests to `unpm`.

  Defaults to:

  ```json
  {
    "hostname": "localhost",
    "protocol": "http",
    "port": 8123,
    "pathname": ""
  }
  ```

  Package's metadata will include a url that looks like the return value of
  this function:

  ```javascript
  var url = require('url') // node's url lib
  
  function(name, version) {
    var filename = name + '-' + version + '.tgz'
    
    return url.format(config.host) + path.join('/', name, '-','filename')
  }
  ```

- `config.base_pathname`: The path prefix from which μnpm serves requests.
- `config.data_path`: The relative path to the directory on disk to which
  tarballs are written. If you are using the [default file-system
  back-end](https://www.npmjs.org/package/unpm-fs-backend), then JSON user and
  metadata files will be stored here as well.
- `config.auto_clone_deps`: A boolean which determines whether μnpm clones
  from a public repository module dependencies which it cannot meet. It
  defaults to true.
- `config.public_registry`: The URI for a public npm which hosts a larger
  universe of modules you might require.
- `caching_proxy`: A Boolean determining whether μnpm should look to the
  `config.public_registry` for packages it does not have.
- `config.crypto`: An object to be passed to
  require('[password-hash][password-hash]').generate as its second argument,
  when hashing passwords.

[password-hash]: https://www.npmjs.org/package/password-hash

### Examples

* Install module:
`npm install module-name@1.1.1 --registry http://localhost:8123`
* Publish module: `npm publish --registry http://localhost:8123`
* Install dependencies: `npm install --registry http://localhost:8123`
* Add a user: `npm adduser --registry http://localhost:8123`

## TODO

Basics of authentication are working. You can create users, update users, and
create sessions, but nothing checks for the sessions yet.

## License

MIT
