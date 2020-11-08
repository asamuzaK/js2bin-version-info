'use strict';
const { fetchJson, isString, sleep } = require('../modules/common');
const { assert } = require('chai');
const { describe, it } = require('mocha');
const fetch = require('node-fetch');
const sinon = require('sinon');

describe('is string', () => {
  it('should get true if string is given', () => {
    const res = isString('a');
    assert.isTrue(res, 'result');
  });

  it('should get false if given argument is not string', () => {
    const res = isString(1);
    assert.isFalse(res, 'result');
  });
});

describe('sleep', () => {
  it('should resolve even if no argument given', async () => {
    const fake = sinon.fake();
    const fake2 = sinon.fake();
    await sleep().then(fake).catch(fake2);
    assert.strictEqual(fake.callCount, 1, 'resolved');
    assert.strictEqual(fake2.callCount, 0, 'not rejected');
  });

  it('should get null if 1st argument is not integer', async () => {
    const res = await sleep('foo');
    assert.isNull(res, 'result');
  });

  it('should get null if 1st argument is not positive integer', async () => {
    const res = await sleep(-1);
    assert.isNull(res, 'result');
  });

  it('should resolve', async () => {
    const fake = sinon.fake();
    const fake2 = sinon.fake();
    await sleep(1).then(fake).catch(fake2);
    assert.strictEqual(fake.callCount, 1, 'resoved');
    assert.strictEqual(fake2.callCount, 0, 'not rejected');
  });

  it('should reject', async () => {
    const fake = sinon.fake();
    const fake2 = sinon.fake();
    await sleep(1, true).then(fake).catch(fake2);
    assert.strictEqual(fake.callCount, 0, 'not resolved');
    assert.strictEqual(fake2.callCount, 1, 'rejected');
  });
});

describe('fetch JSON', () => {
  it('should throw', async () => {
    await fetchJson().catch(e => {
      assert.instanceOf(e, TypeError, 'error');
    });
  });

  it('should throw', async () => {
    await fetchJson('foo', 30000).catch(e => {
      assert.instanceOf(e, TypeError, 'error');
    });
  });

  it('should throw', async () => {
    const stubFetch = sinon.stub(fetch, 'Promise').resolves({
      ok: false,
      status: 404
    });
    await fetchJson('https://example.com', 30000).catch(e => {
      assert.instanceOf(e, Error, 'error');
      assert.strictEqual(e.message,
        'Network response was not ok. status: 404');
    });
    stubFetch.restore();
  });

  it('should get result', async () => {
    const stubFetch = sinon.stub(fetch, 'Promise').resolves({
      ok: true,
      status: 200,
      json: async () => []
    });
    const res = await fetchJson('https://example.com', 30000);
    stubFetch.restore();
    assert.deepEqual(res, [], 'result');
  });
});
