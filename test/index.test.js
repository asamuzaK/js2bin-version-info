'use strict';
const { VersionContainer, VersionInfo } = require('../index');
const { isValidSemVer } = require('semver-parser');
const { assert } = require('chai');
const { describe, it } = require('mocha');
const fetch = require('node-fetch');
const sinon = require('sinon');

describe('version container', () => {
  it('should be instance of VersionContainer', () => {
    const container = new VersionContainer();
    assert.instanceOf(container, VersionContainer, 'instance');
  });

  describe('getter / setter', () => {
    it('should get null', () => {
      const container = new VersionContainer();
      assert.isNull(container.latest, 'latest version');
    });

    it('should not set', () => {
      const container = new VersionContainer();
      container.latest = 'foo';
      assert.isNull(container.latest, 'latest version');
    });

    it('should not set', () => {
      const container = new VersionContainer();
      container.latest = 1;
      assert.isNull(container.latest, 'latest version');
    });

    it('should not set', () => {
      const container = new VersionContainer();
      container.latest = '1.2.3.4';
      assert.isNull(container.latest, 'latest version');
    });

    it('should not set if v prefixed', () => {
      const container = new VersionContainer();
      container.latest = 'v1.2.3';
      assert.isNull(container.latest, 'latest version');
    });

    it('should set version', () => {
      const container = new VersionContainer();
      container.latest = '1.2.3';
      assert.strictEqual(container.latest, '1.2.3', 'latest version');
      assert.isTrue(isValidSemVer(container.latest), 'valid semver');
    });

    it('should set version', () => {
      const container = new VersionContainer();
      container.latest = '1.2.3';
      assert.strictEqual(container.latest, '1.2.3', 'latest version');
      container.latest = '1.2.4';
      assert.strictEqual(container.latest, '1.2.4', 'latest version');
      container.latest = 'foo';
      assert.strictEqual(container.latest, '1.2.4', 'latest version');
      assert.isTrue(isValidSemVer(container.latest), 'valid semver');
    });
  });

  describe('add', () => {
    it('should be instance of Set', () => {
      const container = new VersionContainer();
      assert.instanceOf(container._versions, Set, 'instance');
    });

    it('should not add', () => {
      const container = new VersionContainer();
      container.add('foo');
      assert.strictEqual(container._versions.size, 0, 'size');
    });

    it('should not add', () => {
      const container = new VersionContainer();
      container.add(1);
      assert.strictEqual(container._versions.size, 0, 'size');
    });

    it('should not add', () => {
      const container = new VersionContainer();
      container.add('1.2.3.4');
      assert.strictEqual(container._versions.size, 0, 'size');
    });

    it('should not add if v prefixed', () => {
      const container = new VersionContainer();
      container.add('v1.2.3');
      assert.strictEqual(container._versions.size, 0, 'size');
    });

    it('should add version', () => {
      const container = new VersionContainer();
      container.add('1.2.3');
      assert.strictEqual(container._versions.size, 1, 'size');
      assert.isTrue(container._versions.has('1.2.3'), 'has value');
    });

    it('should add version', () => {
      const container = new VersionContainer();
      container.add('1.2.3');
      container.add('1.2.4');
      container.add('1.2.3');
      assert.strictEqual(container._versions.size, 2, 'size');
      assert.isTrue(container._versions.has('1.2.3'), 'has value');
      assert.isTrue(container._versions.has('1.2.4'), 'has value');
    });
  });

  describe('list', () => {
    it('should get empty array', () => {
      const container = new VersionContainer();
      const res = container.list();
      assert.isTrue(Array.isArray(res), 'array');
      assert.strictEqual(res.length, 0, 'length');
    });

    it('should get result', () => {
      const container = new VersionContainer();
      container.add('1.2.3');
      container.add('1.2.4');
      const res = container.list();
      assert.isTrue(Array.isArray(res), 'array');
      assert.strictEqual(res.length, 2, 'length');
      assert.isTrue(res.includes('1.2.3'), 'value');
      assert.isTrue(res.includes('1.2.4'), 'value');
    });
  });
});

describe('version info', () => {
  it('should be instance of VersionInfo', () => {
    const info = new VersionInfo();
    assert.instanceOf(info, VersionInfo, 'instance');
    assert.isObject(info._js2bin, 'js2bin');
    assert.isObject(info._nodelts, 'nodelts');
    assert.strictEqual(info._timeout, 30000, 'timeout');
  });

  describe('get version list', () => {
    it('should throw', () => {
      const info = new VersionInfo();
      assert.throws(() => info._getVersionList(),
        'Expected either "js2bin" or "nodelts" but got undefined.');
    });

    it('should throw', () => {
      const info = new VersionInfo();
      assert.throws(() => info._getVersionList('foo'),
        'Expected either "js2bin" or "nodelts" but got "foo".');
    });

    it('should get empty array', () => {
      const info = new VersionInfo();
      const res = info._getVersionList('js2bin');
      assert.deepEqual(res, [], 'result');
    });

    it('should get result', () => {
      const info = new VersionInfo();
      info._js2bin.latest = '3.0.0';
      info._js2bin.darwin.latest = '3.0.0';
      info._js2bin.darwin.add('3.0.0');
      info._js2bin.darwin.add('2.0.0');
      info._js2bin.darwin.add('1.0.0');
      info._js2bin.linux.latest = '3.0.0';
      info._js2bin.linux.add('3.0.0');
      info._js2bin.linux.add('2.0.0');
      info._js2bin.linux.add('1.0.0');
      info._js2bin.windows.latest = '3.0.0';
      info._js2bin.windows.add('3.0.0');
      info._js2bin.windows.add('2.0.0');
      info._js2bin.windows.add('1.0.0');
      const res = info._getVersionList('js2bin');
      assert.isTrue(Array.isArray(res), 'array');
      assert.strictEqual(res.length, 3, 'length');
      assert.isTrue(res.includes('3.0.0'), 'value');
      assert.isTrue(res.includes('2.0.0'), 'value');
      assert.isTrue(res.includes('1.0.0'), 'value');
    });

    it('should get result', () => {
      const info = new VersionInfo();
      info._nodelts.Foo = new VersionContainer();
      info._nodelts.Bar = new VersionContainer();
      info._nodelts.Baz = new VersionContainer();
      info._nodelts.latest = '3.3.0';
      info._nodelts.Foo.latest = '3.2.0';
      info._nodelts.Foo.add('3.2.0');
      info._nodelts.Foo.add('3.1.0');
      info._nodelts.Foo.add('3.0.0');
      info._nodelts.Bar.latest = '2.2.0';
      info._nodelts.Bar.add('2.2.0');
      info._nodelts.Bar.add('2.1.0');
      info._nodelts.Bar.add('2.0.0');
      info._nodelts.Baz.latest = '1.2.0';
      info._nodelts.Baz.add('1.2.0');
      info._nodelts.Baz.add('1.1.0');
      info._nodelts.Baz.add('1.0.0');
      const res = info._getVersionList('nodelts');
      assert.isTrue(Array.isArray(res), 'array');
      assert.strictEqual(res.length, 3, 'length');
      assert.isTrue(res.includes('3.2.0'), 'value');
      assert.isTrue(res.includes('2.2.0'), 'value');
      assert.isTrue(res.includes('1.2.0'), 'value');
    });
  });

  describe('set versions of js2bin assets', () => {
    it('should not set', async () => {
      const stubFetch = sinon.stub(fetch, 'Promise').resolves({
        ok: true,
        status: 200,
        json: async () => undefined
      });
      const info = new VersionInfo();
      await info._setJs2binVersions();
      stubFetch.restore();
      assert.isNull(info._js2bin.latest, 'not set');
    });

    it('should not set', async () => {
      const stubFetch = sinon.stub(fetch, 'Promise').resolves({
        ok: true,
        status: 200,
        json: async () => [{}]
      });
      const info = new VersionInfo();
      await info._setJs2binVersions();
      stubFetch.restore();
      assert.isNull(info._js2bin.latest, 'not set');
    });

    it('should not set', async () => {
      const stubFetch = sinon.stub(fetch, 'Promise').resolves({
        ok: true,
        status: 200,
        json: async () => [{
          assets: []
        }]
      });
      const info = new VersionInfo();
      await info._setJs2binVersions();
      stubFetch.restore();
      assert.isNull(info._js2bin.latest, 'not set');
    });

    it('should not set', async () => {
      const stubFetch = sinon.stub(fetch, 'Promise').resolves({
        ok: true,
        status: 200,
        json: async () => [{
          assets: [{
            name: 'foo'
          }]
        }]
      });
      const info = new VersionInfo();
      await info._setJs2binVersions();
      stubFetch.restore();
      assert.isNull(info._js2bin.latest, 'not set');
    });

    it('should set', async () => {
      const stubFetch = sinon.stub(fetch, 'Promise').resolves({
        ok: true,
        status: 200,
        json: async () => [{
          assets: [
            {
              name: 'darwin-1.2.3'
            },
            {
              name: 'linux-1.2.3'
            },
            {
              name: 'windows-1.2.3'
            },
            {
              name: 'darwin-1.3.0'
            },
            {
              name: 'linux-1.3.0'
            },
            {
              name: 'windows-1.3.0'
            },
            {
              name: 'darwin-1.0.0'
            },
            {
              name: 'linux-1.0.0'
            },
            {
              name: 'windows-1.0.0'
            }
          ]
        }]
      });
      const info = new VersionInfo();
      await info._setJs2binVersions();
      stubFetch.restore();
      assert.strictEqual(info._js2bin.latest, '1.3.0', 'set latest');
      assert.strictEqual(info._js2bin.darwin.latest, '1.3.0', 'set latest');
      assert.strictEqual(info._js2bin.darwin._versions.size, 3, 'set size');
      assert.strictEqual(info._js2bin.linux.latest, '1.3.0', 'set latest');
      assert.strictEqual(info._js2bin.linux._versions.size, 3, 'set size');
      assert.strictEqual(info._js2bin.windows.latest, '1.3.0', 'set latest');
      assert.strictEqual(info._js2bin.windows._versions.size, 3, 'set size');
    });
  });

  describe('set codenames of nodejs LTS', () => {
    it('should not set', async () => {
      const stubFetch = sinon.stub(fetch, 'Promise').resolves({
        ok: true,
        status: 200,
        json: async () => undefined
      });
      const info = new VersionInfo();
      await info._setNodeltsCodenames();
      stubFetch.restore();
      assert.strictEqual(Object.keys(info._nodelts).length, 1, 'not set');
    });

    it('should not set', async () => {
      const stubFetch = sinon.stub(fetch, 'Promise').resolves({
        ok: true,
        status: 200,
        json: async () => ({})
      });
      const info = new VersionInfo();
      await info._setNodeltsCodenames();
      stubFetch.restore();
      assert.strictEqual(Object.keys(info._nodelts).length, 1, 'not set');
    });

    it('should not set', async () => {
      const stubFetch = sinon.stub(fetch, 'Promise').resolves({
        ok: true,
        status: 200,
        json: async () => ({
          'v0.10': {}
        })
      });
      const info = new VersionInfo();
      await info._setNodeltsCodenames();
      stubFetch.restore();
      assert.strictEqual(Object.keys(info._nodelts).length, 1, 'not set');
    });

    it('should not set', async () => {
      const now = Date.now();
      const stubFetch = sinon.stub(fetch, 'Promise').resolves({
        ok: true,
        status: 200,
        json: async () => ({
          'v0.10': {
            codename: 'Foo',
            end: new Date(now - 200),
            start: new Date(now - 100)
          }
        })
      });
      const info = new VersionInfo();
      await info._setNodeltsCodenames();
      stubFetch.restore();
      assert.isUndefined(info._nodelts.Foo, 'not set');
    });

    it('should set', async () => {
      const now = Date.now();
      const stubFetch = sinon.stub(fetch, 'Promise').resolves({
        ok: true,
        status: 200,
        json: async () => ({
          'v0.10': {
            codename: 'Foo',
            end: new Date(now - 200),
            start: new Date(now - 100)
          },
          v1: {
            codename: '',
            end: new Date(now + 100),
            start: new Date(now - 200)
          },
          v2: {
            codename: 'Bar',
            end: new Date(now + 200),
            start: new Date(now - 100)
          },
          v3: {
            codename: 'Baz',
            end: new Date(now + 200),
            start: new Date(now + 100)
          }
        })
      });
      const info = new VersionInfo();
      await info._setNodeltsCodenames();
      stubFetch.restore();
      assert.strictEqual(Object.keys(info._nodelts).length, 2, 'set');
      assert.isUndefined(info._nodelts.Foo, 'not set');
      assert.isObject(info._nodelts.Bar, 'set');
      assert.isUndefined(info._nodelts.Baz, 'not set');
    });
  });

  describe('set versions of nodejs LTS', () => {
    it('should not set', async () => {
      const stubFetch = sinon.stub(fetch, 'Promise').resolves({
        ok: true,
        status: 200,
        json: async () => undefined
      });
      const info = new VersionInfo();
      await info._setNodeltsVersions();
      stubFetch.restore();
      assert.strictEqual(Object.keys(info._nodelts).length, 1, 'not set');
      assert.isNull(info._nodelts.latest, 'not set');
    });

    it('should not set', async () => {
      const stubFetch = sinon.stub(fetch, 'Promise');
      const now = Date.now();
      stubFetch.onCall(0).resolves({
        ok: true,
        status: 200,
        json: async () => []
      });
      stubFetch.onCall(1).resolves({
        ok: true,
        status: 200,
        json: async () => ({
          'v0.10': {
            codename: 'Foo',
            end: new Date(now - 100),
            start: new Date(now - 300)
          },
          v1: {
            codename: '',
            end: new Date(now + 100),
            start: new Date(now - 200)
          },
          v2: {
            codename: 'Bar',
            end: new Date(now + 200),
            start: new Date(now - 100)
          },
          v3: {
            codename: 'Baz',
            end: new Date(now + 200),
            start: new Date(now + 100)
          }
        })
      });
      const info = new VersionInfo();
      await info._setNodeltsVersions();
      stubFetch.restore();
      assert.strictEqual(Object.keys(info._nodelts).length, 2, 'set');
      assert.isNull(info._nodelts.latest, 'not set');
      assert.isObject(info._nodelts.Bar, 'set');
      assert.isNull(info._nodelts.Bar.latest, 'not set');
    });

    it('should not set', async () => {
      const stubFetch = sinon.stub(fetch, 'Promise');
      const now = Date.now();
      stubFetch.onCall(0).resolves({
        ok: true,
        status: 200,
        json: async () => [
          {
            lts: 'Foo',
            version: 'v0.10.2'
          },
          {
            lts: 'Foo',
            version: 'v0.10.1'
          },
          {
            lts: '',
            version: 'v1.0.0'
          }
        ]
      });
      stubFetch.onCall(1).resolves({
        ok: true,
        status: 200,
        json: async () => ({
          'v0.10': {
            codename: 'Foo',
            end: new Date(now - 100),
            start: new Date(now - 300)
          },
          v1: {
            codename: '',
            end: new Date(now + 100),
            start: new Date(now - 200)
          },
          v2: {
            codename: 'Bar',
            end: new Date(now + 200),
            start: new Date(now - 100)
          },
          v3: {
            codename: 'Baz',
            end: new Date(now + 200),
            start: new Date(now + 100)
          }
        })
      });
      const info = new VersionInfo();
      await info._setNodeltsVersions();
      stubFetch.restore();
      assert.strictEqual(Object.keys(info._nodelts).length, 2, 'set');
      assert.isNull(info._nodelts.latest, 'not set');
      assert.isObject(info._nodelts.Bar, 'set');
      assert.isNull(info._nodelts.Bar.latest, 'not set');
    });

    it('should set', async () => {
      const stubFetch = sinon.stub(fetch, 'Promise');
      const now = Date.now();
      stubFetch.onCall(0).resolves({
        ok: true,
        status: 200,
        json: async () => [
          {
            lts: 'Foo',
            version: 'v0.10.2'
          },
          {
            lts: 'Foo',
            version: 'v0.10.1'
          },
          {
            lts: '',
            version: 'v1.0.0'
          },
          {
            lts: 'Bar',
            version: 'v2.1.0'
          },
          {
            lts: 'Bar',
            version: 'v2.0.0'
          },
          {
            lts: 'Baz',
            version: 'v3.0.0'
          }
        ]
      });
      stubFetch.onCall(1).resolves({
        ok: true,
        status: 200,
        json: async () => ({
          'v0.10': {
            codename: 'Foo',
            end: new Date(now - 100),
            start: new Date(now - 300)
          },
          v1: {
            codename: '',
            end: new Date(now + 100),
            start: new Date(now - 200)
          },
          v2: {
            codename: 'Bar',
            end: new Date(now + 200),
            start: new Date(now - 200)
          },
          v3: {
            codename: 'Baz',
            end: new Date(now + 300),
            start: new Date(now - 100)
          }
        })
      });
      const info = new VersionInfo();
      await info._setNodeltsVersions();
      stubFetch.restore();
      assert.strictEqual(Object.keys(info._nodelts).length, 3, 'set');
      assert.strictEqual(info._nodelts.latest, '3.0.0', 'set');
      assert.isObject(info._nodelts.Bar, 'set');
      assert.strictEqual(info._nodelts.Bar.latest, '2.1.0', 'set');
      assert.isObject(info._nodelts.Baz, 'set');
      assert.strictEqual(info._nodelts.Baz.latest, '3.0.0', 'set');
    });
  });

  describe('get version', () => {
    it('should throw', async () => {
      const info = new VersionInfo();
      await info.get().catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Expected either "build" or "ci" but got undefined.', 'message');
      });
    });

    it('should throw', async () => {
      const info = new VersionInfo();
      await info.get('foo').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Expected either "build" or "ci" but got "foo".', 'message');
      });
    });

    it('should get value', async () => {
      const stubFetch = sinon.stub(fetch, 'Promise');
      stubFetch.onCall(0).resolves({
        ok: true,
        status: 200,
        json: async () => [{
          assets: [
            {
              name: 'darwin-1.2.3'
            },
            {
              name: 'linux-1.2.3'
            },
            {
              name: 'windows-1.2.3'
            }
          ]
        }]
      });
      const info = new VersionInfo();
      const res = await info.get('build');
      stubFetch.restore();
      assert.strictEqual(res, '1.2.3', 'result');
    });

    it('should get value', async () => {
      const stubFetch = sinon.stub(fetch, 'Promise');
      const now = Date.now();
      stubFetch.onCall(0).resolves({
        ok: true,
        status: 200,
        json: async () => [{
          assets: [
            {
              name: 'darwin-1.2.3'
            },
            {
              name: 'linux-1.2.3'
            },
            {
              name: 'windows-1.2.3'
            }
          ]
        }]
      });
      stubFetch.onCall(1).resolves({
        ok: true,
        status: 200,
        json: async () => [
          {
            lts: 'Foo',
            version: 'v1.3.0'
          },
          {
            lts: 'Foo',
            version: 'v1.2.3'
          },
          {
            lts: 'Bar',
            version: 'v2.1.0'
          },
          {
            lts: 'Bar',
            version: 'v2.0.0'
          }
        ]
      });
      stubFetch.onCall(2).resolves({
        ok: true,
        status: 200,
        json: async () => ({
          v1: {
            codename: 'Foo',
            end: new Date(now + 200),
            start: new Date(now - 200)
          },
          v2: {
            codename: 'Bar',
            end: new Date(now + 300),
            start: new Date(now - 100)
          }
        })
      });
      const info = new VersionInfo();
      const res = await info.get('ci');
      stubFetch.restore();
      assert.isTrue(Array.isArray(res), 'array');
      assert.strictEqual(res.length, 2, 'length');
      assert.isTrue(res.includes('2.1.0'), 'value');
      assert.isTrue(res.includes('1.3.0'), 'value');
    });

    it('should get empty array', async () => {
      const stubFetch = sinon.stub(fetch, 'Promise');
      const now = Date.now();
      stubFetch.onCall(0).resolves({
        ok: true,
        status: 200,
        json: async () => [{
          assets: [
            {
              name: 'darwin-1.3.0'
            },
            {
              name: 'linux-1.3.0'
            },
            {
              name: 'windows-1.3.0'
            },
            {
              name: 'darwin-2.1.0'
            },
            {
              name: 'linux-2.1.0'
            },
            {
              name: 'windows-2.1.0'
            }
          ]
        }]
      });
      stubFetch.onCall(1).resolves({
        ok: true,
        status: 200,
        json: async () => [
          {
            lts: 'Foo',
            version: 'v1.3.0'
          },
          {
            lts: 'Foo',
            version: 'v1.2.3'
          },
          {
            lts: 'Bar',
            version: 'v2.1.0'
          },
          {
            lts: 'Bar',
            version: 'v2.0.0'
          }
        ]
      });
      stubFetch.onCall(2).resolves({
        ok: true,
        status: 200,
        json: async () => ({
          v1: {
            codename: 'Foo',
            end: new Date(now + 200),
            start: new Date(now - 200)
          },
          v2: {
            codename: 'Bar',
            end: new Date(now + 300),
            start: new Date(now - 100)
          }
        })
      });
      const info = new VersionInfo();
      const res = await info.get('ci');
      stubFetch.restore();
      assert.deepEqual(res, [], 'result');
    });

    it('should get value', async () => {
      const stubFetch = sinon.stub(fetch, 'Promise');
      const now = Date.now();
      stubFetch.onCall(0).resolves({
        ok: true,
        status: 200,
        json: async () => [{
          assets: [
            {
              name: 'darwin-1.2.3'
            },
            {
              name: 'linux-1.2.3'
            },
            {
              name: 'windows-1.2.3'
            }
          ]
        }]
      });
      stubFetch.onCall(1).resolves({
        ok: true,
        status: 200,
        json: async () => [
          {
            lts: 'Foo',
            version: 'v1.3.0'
          },
          {
            lts: 'Foo',
            version: 'v1.2.3'
          },
          {
            lts: 'Bar',
            version: 'v2.1.0'
          },
          {
            lts: 'Bar',
            version: 'v2.0.0'
          }
        ]
      });
      stubFetch.onCall(2).resolves({
        ok: true,
        status: 200,
        json: async () => ({
          v1: {
            codename: 'Foo',
            end: new Date(now + 200),
            start: new Date(now - 200)
          },
          v2: {
            codename: 'Bar',
            end: new Date(now + 300),
            start: new Date(now - 100)
          }
        })
      });
      const info = new VersionInfo();
      const res = await info.get('ci', {
        active: true,
        timeout: 10000
      });
      stubFetch.restore();
      assert.strictEqual(res, '2.1.0', 'result');
    });

    it('should get null', async () => {
      const stubFetch = sinon.stub(fetch, 'Promise');
      const now = Date.now();
      stubFetch.onCall(0).resolves({
        ok: true,
        status: 200,
        json: async () => [{
          assets: [
            {
              name: 'darwin-1.3.0'
            },
            {
              name: 'linux-1.3.0'
            },
            {
              name: 'windows-1.3.0'
            },
            {
              name: 'darwin-2.1.0'
            },
            {
              name: 'linux-2.1.0'
            },
            {
              name: 'windows-2.1.0'
            }
          ]
        }]
      });
      stubFetch.onCall(1).resolves({
        ok: true,
        status: 200,
        json: async () => [
          {
            lts: 'Foo',
            version: 'v1.3.0'
          },
          {
            lts: 'Foo',
            version: 'v1.2.3'
          },
          {
            lts: 'Bar',
            version: 'v2.1.0'
          },
          {
            lts: 'Bar',
            version: 'v2.0.0'
          }
        ]
      });
      stubFetch.onCall(2).resolves({
        ok: true,
        status: 200,
        json: async () => ({
          v1: {
            codename: 'Foo',
            end: new Date(now + 200),
            start: new Date(now - 200)
          },
          v2: {
            codename: 'Bar',
            end: new Date(now + 300),
            start: new Date(now - 100)
          }
        })
      });
      const info = new VersionInfo();
      const res = await info.get('ci', {
        active: true,
        timeout: 10000
      });
      stubFetch.restore();
      assert.isNull(res, 'result');
    });
  });
});
