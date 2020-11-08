/**
 * common.js
 */

'use strict';
const fetch = require('node-fetch');

/**
 * is string
 *
 * @param {*} o - object to check
 * @returns {boolean} - result
 */
const isString = o => typeof o === 'string' || o instanceof String;

/**
 * sleep
 *
 * @param {number} [ms] - milliseconds
 * @param {boolean} [rejects] - reject instead of resolve
 * @returns {?Function} - resolve / reject
 */
const sleep = (ms = 0, rejects = false) => {
  let func;
  if (Number.isInteger(ms) && ms >= 0) {
    func = new Promise((resolve, reject) => {
      if (rejects) {
        setTimeout(reject, ms);
      } else {
        setTimeout(resolve, ms);
      }
    });
  }
  return func || null;
};

/**
 * fetch JSON
 *
 * @param {string} url - URL
 * @param {number} ms - timeout in milliseconds
 * @returns {(Array|object)} - parsed JSON
 */
const fetchJson = async (url, ms) => {
  const res = await Promise.race([
    fetch(url),
    sleep(ms, true)
  ]).catch(e => {
    throw e || new Error('Timeout. Server did not respond in time.');
  });
  const { ok, status } = res;
  if (!ok) {
    throw new Error(`Network response was not ok. status: ${status}`);
  }
  return await res.json();
};

module.exports = {
  fetchJson,
  isString,
  sleep
};
