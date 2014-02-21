μnpm
====

Your own private npm

## Usage

To copy a module from the public npm:

`curl http://localhost:8123/clone/module-name/1.1.1?recursive=true -X POST`

---

Most normal npm commands work, you will just need to specify the location of
your μnpm server with a `--registry` flag (or via your `.npmrc` with a
`registry` entry).

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
