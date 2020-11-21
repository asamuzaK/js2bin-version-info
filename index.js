/**
 * Helper module for js2bin<https://github.com/criblio/js2bin>.
 * Resolve version information from online resources.
 */

'use strict';
const { compareSemVer, isValidSemVer } = require('semver-parser');
const { fetchJson, isString } = require('./modules/common');

/* constants */
// js2bin release assets info
const JS2BIN_RELEASE = 'https://api.github.com/repos/criblio/js2bin/releases';
// nodejs release info
const NODEJS_RELEASE = 'https://nodejs.org/download/release/index.json';
// nodejs release schedule info
const NODEJS_SCHEDULE =
  'https://raw.githubusercontent.com/nodejs/Release/master/schedule.json';
const REG_NODEJS_KEY = /^v(?:0\.(?:0|[1-9]\d*)|[1-9]\d*)$/;
const REG_PLATFORM = /(darwin|linux|windows)/;
const REG_SEMVER = /[^.]((?:0|[1-9]?\d+)(?:\.(?:0|[1-9]?\d+)){2})(?:[^.].*)?$/;
const TIMEOUT_FETCH = 30000;

/* version container */
class VersionContainer {
  constructor() {
    this._latest = null;
    this._versions = new Set();
  }

  get latest() {
    return this._latest;
  }

  set latest(version) {
    if (isString(version) && isValidSemVer(version, true)) {
      this._latest = version;
    }
  }

  /**
   * add version
   *
   * @param {string} version - version
   * @returns {void}
   */
  add(version) {
    if (isString(version) && isValidSemVer(version, true)) {
      this._versions.add(version);
    }
  }

  /**
   * get version list as array
   *
   * @returns {Array} - version list
   */
  list() {
    return Array.from(this._versions);
  }
}

/* version info */
class VersionInfo {
  /**
   * constructor
   *
   * @param {object} [opt] - options
   * @param {boolean} [opt.active] - for 'ci', get only latest active version
   * @param {boolean} [opt.current] - for 'ci', include current nodejs release
   * @param {number} [opt.timeout] - timeout on fetch, in milliseconds
   */
  constructor(opt = {}) {
    const { active, current, timeout } = opt;
    this._active = !!active;
    this._current = !!current;
    this._js2bin = {
      latest: null,
      darwin: new VersionContainer(),
      linux: new VersionContainer(),
      windows: new VersionContainer()
    };
    this._nodelts = {
      latest: null
    };
    this._timeout =
      Number.isInteger(timeout) && timeout >= 0 ? timeout : TIMEOUT_FETCH;
    this._url = {
      js2binRelease: JS2BIN_RELEASE,
      nodeRelease: NODEJS_RELEASE,
      nodeSchedule: NODEJS_SCHEDULE
    };
  }

  get active() {
    return !!this._active;
  }

  set active(bool) {
    this._active = !!bool;
  }

  get current() {
    return !!this._current;
  }

  set current(bool) {
    this._current = !!bool;
  }

  get timeout() {
    return this._timeout;
  }

  set timeout(ms) {
    if (Number.isInteger(ms) && ms >= 0) {
      this._timeout = ms;
    }
  }

  /**
   * get version list
   *
   * @param {!string} name - property name, 'js2bin' or 'nodelts'
   * @returns {Array} - version list
   */
  _getVersionList(name) {
    if (!isString(name) || !/^(?:js2bin|nodelts)$/.test(name)) {
      const value = isString(name) ? `"${name}"` : name;
      const msg = `Expected either "js2bin" or "nodelts" but got ${value}.`;
      throw new Error(msg);
    }
    const versionList = new Set();
    const entries = Object.entries(this[`_${name}`]);
    for (const [key, value] of entries) {
      if (key !== 'latest') {
        if (name === 'js2bin') {
          const versions = value.list();
          for (const version of versions) {
            versionList.add(version);
          }
        } else {
          name === 'nodelts' && versionList.add(value.latest);
        }
      }
    }
    return Array.from(versionList);
  }

  /**
   * set versions of js2bin assets
   *
   * @returns {void}
   */
  async _setJs2binVersions() {
    const res = await fetchJson(this._url.js2binRelease, this._timeout);
    if (Array.isArray(res)) {
      const [{ assets }] = res;
      if (Array.isArray(assets)) {
        for (const asset of assets) {
          const { name } = asset;
          if (isString(name) &&
              REG_PLATFORM.test(name) && REG_SEMVER.test(name)) {
            const [, platform] = REG_PLATFORM.exec(name);
            const [, version] = REG_SEMVER.exec(name);
            if (!this._js2bin.latest ||
                compareSemVer(version, this._js2bin.latest) > 0) {
              this._js2bin.latest = version;
            }
            if (!this._js2bin[platform].latest ||
                compareSemVer(version, this._js2bin[platform].latest) > 0) {
              this._js2bin[platform].latest = version;
            }
            this._js2bin[platform].add(version);
          }
        }
      }
    }
  }

  /**
   * set codenames of nodejs LTS
   *
   * @returns {void}
   */
  async _setNodeltsCodenames() {
    const stats = await fetchJson(this._url.nodeSchedule, this._timeout);
    if (stats && Object.keys(stats).every(key => REG_NODEJS_KEY.test(key))) {
      const now = Date.now();
      const values = Object.values(stats);
      for (const value of values) {
        const { codename, end, start } = value;
        if (codename) {
          const isActive = new Date(end) > now && new Date(start) < now;
          if (isActive) {
            this._nodelts[codename] = new VersionContainer();
          }
        }
      }
      if (this._current) {
        this._nodelts.current = new VersionContainer();
      }
    }
  }

  /**
   * set versions of nodejs LTS
   *
   * @returns {void}
   */
  async _setNodeltsVersions() {
    const res = await fetchJson(this._url.nodeRelease, this._timeout);
    if (Array.isArray(res)) {
      await this._setNodeltsCodenames();
      for (const item of res) {
        const { lts, version: nodeVersion } = item;
        const codename = lts || (this._current && 'current');
        if (codename && this._nodelts[codename] &&
            REG_SEMVER.test(nodeVersion)) {
          const [, version] = REG_SEMVER.exec(nodeVersion);
          if (!this._nodelts.latest ||
              compareSemVer(version, this._nodelts.latest) > 0) {
            this._nodelts.latest = version;
          }
          if (!this._nodelts[codename].latest ||
              compareSemVer(version, this._nodelts[codename].latest) > 0) {
            this._nodelts[codename].latest = version;
          }
          this._nodelts[codename].add(version);
        }
      }
    }
  }

  /**
   * get version
   *
   * @param {!string} cmd - command name, 'build' or 'ci'
   * @param {object} [opt] - options
   * @param {boolean} [opt.active] - for 'ci', get only latest active version
   * @param {boolean} [opt.current] - for 'ci', include current nodejs release
   * @param {number} [opt.timeout] - timeout on fetch, in milliseconds
   * @returns {(string|Array|null)} - result
   */
  async get(cmd, opt = {}) {
    if (!isString(cmd) || !/^(?:build|ci)$/.test(cmd)) {
      const value = isString(cmd) ? `"${cmd}"` : cmd;
      const msg = `Expected either "build" or "ci" but got ${value}.`;
      throw new Error(msg);
    }
    let res;
    const { active, current, timeout } = opt;
    if (typeof current === 'boolean') {
      this._current = current;
    }
    if (Number.isInteger(timeout) && timeout >= 0) {
      this._timeout = timeout;
    }
    await this._setJs2binVersions();
    if (cmd === 'ci') {
      const js2binList = this._getVersionList('js2bin');
      await this._setNodeltsVersions();
      if (active || this._active) {
        const { latest } = this._nodelts;
        if (latest && !js2binList.includes(latest)) {
          res = latest;
        }
      } else {
        const versionList = new Set();
        const nodeltsList = this._getVersionList('nodelts');
        for (const version of nodeltsList) {
          if (!js2binList.includes(version)) {
            versionList.add(version);
          }
        }
        res = Array.from(versionList);
      }
    } else {
      res = cmd === 'build' && this._js2bin.latest;
    }
    return res || null;
  }
}

module.exports = {
  VersionContainer,
  VersionInfo
};
