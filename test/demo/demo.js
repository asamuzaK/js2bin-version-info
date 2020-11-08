/**
 * demo.js
 */

'use strict';
const { VersionInfo } = require('../../index');
const process = require('process');

process.on('uncaughtException', e => {
  console.log('uncaughtException');
  throw e;
});
process.on('unhandledRejection', e => {
  console.log('unhandledRejection');
  console.error(e);
  process.exit(1);
});

(async () => {
  console.log('live demo\n');
  const startBuild = new Date();
  const versionInfoBuild = new VersionInfo();

  console.log('get version for "build"\n');
  console.log(`run get('build'): ${startBuild}`);
  const resBuild = await versionInfoBuild.get('build');
  console.log(`build version: ${resBuild}`);
  const endBuild = new Date();
  console.log(`elapsed time: ${endBuild - startBuild}\n`);

  console.log('simulating timeout, should throw.');
  const startBuildFail = new Date();
  const versionInfoBuildFail = new VersionInfo();
  console.log(`run get('build', { timeout: 1 }): ${startBuildFail}`);
  try {
    const resBuildFail = await versionInfoBuildFail.get('build', {
      timeout: 1
    });
    console.log(`build version: ${resBuildFail}`);
  } catch (e) {
    console.error(e);
  }
  const endBuildFail = new Date();
  console.log(`elapsed time: ${endBuildFail - startBuildFail}\n`);

  console.log('get versions for "ci"\n');
  const startCiList = new Date();
  const versionInfoCiList = new VersionInfo();
  console.log(`run get('ci'): ${startCiList}`);
  const resCiList = await versionInfoCiList.get('ci');
  console.log('ci versions:');
  console.log(resCiList);
  console.log('if the result is an empty [], the latest versions are already built.');
  const endCiList = new Date();
  console.log(`elapsed time: ${endCiList - startCiList}\n`);

  const startCiActive = new Date();
  const versionInfoCiActive = new VersionInfo();
  console.log(`run get('ci', { active: true }): ${startCiActive}`);
  const resCiActive = await versionInfoCiActive.get('ci', {
    active: true
  });
  console.log(`ci version: ${resCiActive}`);
  console.log('if the result is null, the latest version is already built.');
  const endCiActive = new Date();
  console.log(`elapsed time: ${endCiActive - startCiActive}\n`);

  process.exit(0);
})();
