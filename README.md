# js2bin version info

Helper module for [js2bin](https://github.com/criblio/js2bin).
Resolve version information from online resources.

## Usage

```
const { VersionInfo } = require('js2bin-version-info');

/**
 * Returns a latest version for the "build" command.
 */
const getVersionForBuild = async () => {
  const info = new VersionInfo();
  const version = await info.get('build');
  return version;
};

/*
 * Returns an array of latest versions for the "ci" command.
 * It will return an empty array if all the latest versions are already
 * available in the js2bin release assets.
 */
const getVersionsForCi = async () => {
  const info = new VersionInfo();
  const versions = await info.get('ci');
  return versions;
};
```

## Demo

Run `npm run demo` for the live demo.
