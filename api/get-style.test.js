import { test } from 'node:test';
import assert from 'node:assert';
import handler from './get-style.js';

test('CORS origin checking', async (t) => {
  await t.test('allows localhost:8080', async () => {
    const req = { method: 'GET', headers: { origin: 'http://localhost:8080' } };
    let statusSet = 200;
    const res = {
      headers: {},
      setHeader: function(k, v) { this.headers[k] = v; },
      status: function(code) { statusSet = code; return this; },
      json: function(data) { this.data = data; return this; },
      end: function() { return this; }
    };
    process.env.MAP_TILER = 'DUMMY_KEY';
    global.fetch = async () => ({ ok: true, json: async () => ({}) });

    await handler(req, res);
    assert.strictEqual(statusSet, 200);
    assert.strictEqual(res.headers['Access-Control-Allow-Origin'], 'http://localhost:8080');
  });

  await t.test('allows vercel.app domains', async () => {
    const req = { method: 'GET', headers: { origin: 'https://2gbxenvironment-2.vercel.app' } };
    let statusSet = 200;
    const res = {
      headers: {},
      setHeader: function(k, v) { this.headers[k] = v; },
      status: function(code) { statusSet = code; return this; },
      json: function(data) { this.data = data; return this; },
      end: function() { return this; }
    };

    await handler(req, res);
    assert.strictEqual(statusSet, 200);
    assert.strictEqual(res.headers['Access-Control-Allow-Origin'], 'https://2gbxenvironment-2.vercel.app');
  });

  await t.test('blocks arbitrary domains with 403', async () => {
    const req = { method: 'GET', headers: { origin: 'https://evil.com' } };
    let statusSet = 200;
    const res = {
      headers: {},
      setHeader: function(k, v) { this.headers[k] = v; },
      status: function(code) { statusSet = code; return this; },
      json: function(data) { this.data = data; return this; },
      end: function() { return this; }
    };

    await handler(req, res);
    assert.strictEqual(statusSet, 403);
    assert.strictEqual(res.headers['Access-Control-Allow-Origin'], undefined);
  });
});
