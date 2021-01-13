[![build](https://github.com/asamuzaK/js2bin-version-info/workflows/build/badge.svg)](https://github.com/asamuzaK/js2bin-version-info/actions?query=workflow%3Abuild)
[![dependencies Status](https://david-dm.org/asamuzaK/js2bin-version-info/status.svg)](https://david-dm.org/asamuzaK/js2bin-version-info)
[![devDependency Status](https://david-dm.org/asamuzaK/js2bin-version-info/dev-status.svg)](https://david-dm.org/asamuzaK/js2bin-version-info?type=dev)
[![npm version](https://badge.fury.io/js/js2bin-version-info.svg)](https://badge.fury.io/js/js2bin-version-info)

# js2bin version info

Helper module for [js2bin](https://github.com/criblio/js2bin).
Resolve version information from online resources.

## Usage

```
const { VersionInfo } = require('js2bin-version-info');

/**
 * Returns the latest version, for the "build" command.
 */
const getVersionForBuild = async () => {
  const info = new VersionInfo();
  const version = await info.get('build');
  return version;
};

/**
 * Returns an array of the latest versions, for the "ci" command.
 * It will return an empty array if all the latest versions are already
 * available in the js2bin release assets.
 */
const getVersionsForCi = async () => {
  const info = new VersionInfo();
  const versions = await info.get('ci');
  return versions;
};
```

### Options

You can give options either when you create an instance or when you get versions.

```
const info = new VersionInfo(opt);
```

* @param {object} [opt] - options
* @param {boolean} [opt.active] - for 'ci', get only the latest active version
* @param {boolean} [opt.current] - for 'ci', include current nodejs release
* @param {number} [opt.timeout] - timeout on fetch, in milliseconds

```
const getVersionsForCi = async () => {
  const info = new VersionInfo({
    current: true,
    timeout: 10000
  });
  const versions = await info.get('ci');
  return versions;
};

const getVersionForBuild = async () => {
  const info = new VersionInfo();
  const version = await info.get('build', {
    timeout: 10000
  });
  return version;
};
```

## Demo

Run `npm run demo` for the live demo.
