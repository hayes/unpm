&mu;npm
====

Your own private npm

[![Build Status](https://travis-ci.org/hayes/unpm.png?branch=master)](https://travis-ci.org/hayes/unpm)
[![Coverage Status](https://coveralls.io/repos/hayes/unpm/badge.png?branch=master)](https://coveralls.io/r/hayes/unpm?branch=master)

## Installation and Usage

### Command line

If you just want a &mu;npm with the default configuration:

`
npm install -g unpm && unpm 
`

Now you have your own npm running at `localhost:8123`.

> You also have a directory called `$(pwd)/data`, which will hold flat files
> with data on your users, packages, etc.

#### Command line options

The default command line tool accepts the following flags:

- `--port, -p <number>`: Run &mu;npm's http server on port `<number>`
- `--verbose, -v`: Enable logging to stdout
- `--log, -l`: Store logs on the file system
- `--logdir, -L`: Path for log storage, defaults to `$(pwd)`
- `--datadir, -d`: Path for storing tarballs and data files, defaults to
`$(pwd)/data`

#### Extended usage

Now use `npm` as normal-- simply specify the URI of the running &mu;npm service
via the `--registry` flag, or with the `registry` parameter of your `.npmrc`.
Most of [npm's methods](https://www.npmjs.org/doc/) are supported. 

Usage might look something like the following:

```sh
# Install a module:
npm install module-name@1.1.1 --registry http://localhost:8123

# Publish the module defined in the current dir:
npm publish --registry http://localhost:8123

# Install dependencies:
npm install --registry http://localhost:8123

# Add a user:
npm adduser --registry http://localhost:8123
```

#### Useful tools

- [clone-packages](http://npm.im/clone-packages) allows you to clone packages
from one npm registry to another.

### As a node module

Install with `npm install unpm`. 

Now `require('unpm')` returns a function which takes a `config` object, and
constructs a &mu;npm service, with attributes as defined in [Instance](#instance).

The `config` object can have all the keys defined in
[Configuration](#configuration), with the following additions:

- `config.backend`: Specifies the persistence layer for &mu;npm. See the default
  [file-system backend][fs-back] or the alternative [levelDB
  backend][leveldb-back]
- `config.sessions`: An object with methods:
  - `set(data, done)`, where `done` is a node style callback. If successful,
    `done` will be called with a token which can be used to retrieve `data` via
    the `get` method. 
  - `get(token, done)`, where `done` is a node style callback. If successful,
    `done` will be called with the data correspondinging to the token.

  By default, `config.sessions` defaults to a simple, in-memory
  [store](./lib/models/SessionStore.js).

#### Instance

The &mu;npm service instance has the following attributes:

- `sessions`: The `config.sessions` object.
- `server`: An [HTTP
  server](http://nodejs.org/api/http.html#http_class_http_server) instance
  which will service the npm api, and the additional resources defined for
  &mu;npm.
- `log`: The logging object. Has methods `info` and `error`, which should
  support the [Bunyan logging
  API](https://github.com/trentm/node-bunyan#log-method-api).
- `backend`: The &mu;npm backend. This is a module which encapsulates
  persistence logic for &mu;npm. It defaults to a
  [file-system backend][fs-back], but is of course configurable.
- `router`: The router which defines what logic to invoke for a given requests.
  It is an instance of [&mu;npm-router](https://github.com/hayes/unpm-router)
- `config`: The `config` object passed to the constructor.
- `handler`: The handler for the [`request` event](http://nodejs.org/api/http.html#http_event_request).

## Configuration

A default configuration file is set in [./lib/config.json](./lib/config.json).
Any configuration options that are not explicitly passed to &mu;npm (via
`unpm(config)`) will default to the values in that file.

You can set the following values as configuration options:

#### `config.host`

  `config.host` is passed directly to
  [`url.format`](http://nodejs.org/api/url.html#url_url_format_urlobj)

  Describes a base URI at which &mu;npm's resources will be made
  available, modulo package name. The URI (with package name) is written to
  each package's metadata. At current this simply sets the URI (modulo name and
  version) at which package tarballs are available. 

  Note: that this may or may not reflect the URI at which &mu;npm's resources
  will be made available.  The intent is to allow &mu;npm to sit behind a proxy,
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
  `make_filename`:

  ```javascript
  var url = require('url') // node's url lib
  
  function make_filename(name, version) {
    var filename = name + '-' + version + '.tgz'
    
    return url.format(config.host) + path.join('/', name, '-','filename')
  }
  ```

#### `config.base_pathname`

  The path prefix from which &mu;npm serves requests.

#### `config.crypto`

  An object to be passed to require('[password-hash][password-hash]').generate
  as its second argument, when hashing passwords.

#### `config.verbose`

  If true, causes log level info to be printed to standard out.

#### `config.log`

  If true, saves logs, otherwise no logs will be printed. Stores rotational
  file logs with a period of one day, keeping 10 days worth of archives.

#### `config.log_dir`

  The directory into which to write logs. If this option is defined, but
  `config.log` is not specifically set, logs **will** still be written. If
  this option is not defined, but `config.log` is set, logs will be written
  to the current working directory.

#### `config.cidr`

  An array of cidr ip ranges. If this option is set, unpm will return a 403
  to any request whos ip does not fall into the provided ip ranges.

## License

[MIT](./LICENSE)

[fs-back]: https://github.com/jarofghosts/unpm-fs-backend
[leveldb-back]: https://github.com/hayes/unpm-leveldb
[password-hash]: https://www.npmjs.org/package/password-hash
