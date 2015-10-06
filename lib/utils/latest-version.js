var semver = require('semver')

module.exports = latest_version

function latest_version(versions) {
  return versions.sort(by_semver)[0]
}

function by_semver(v1, v2) {
  if(semver.lt(v1, v2)) {
    return 1
  }

  return -1
}
