import test from 'node:test';
import assert from 'node:assert';
import handler from './get-style.js';

test('CORS headers allow strict origins', async (t) => {
  await t.test('Allows https://2gbxenvironment-2.vercel.app', async () => {
    let statusCode = 200;
    const headers = {};
    const req = {
      method: 'OPTIONS',
      headers: {
        origin: 'https://2gbxenvironment-2.vercel.app',
      },
    };
    const res = {
      setHeader: (key, value) => {
        headers[key.toLowerCase()] = value;
      },
      status: (code) => {
        statusCode = code;
        return {
          end: () => {},
        };
      },
    };

    await handler(req, res);

    assert.strictEqual(
      headers['access-control-allow-origin'],
      'https://2gbxenvironment-2.vercel.app'
    );
    assert.strictEqual(headers['access-control-allow-methods'], 'GET, OPTIONS');
    assert.strictEqual(headers['access-control-allow-headers'], 'Content-Type');
  });

  await t.test('Allows http://localhost:8080', async () => {
    let statusCode = 200;
    const headers = {};
    const req = {
      method: 'OPTIONS',
      headers: {
        origin: 'http://localhost:8080',
      },
    };
    const res = {
      setHeader: (key, value) => {
        headers[key.toLowerCase()] = value;
      },
      status: (code) => {
        statusCode = code;
        return {
          end: () => {},
        };
      },
    };

    await handler(req, res);

    assert.strictEqual(headers['access-control-allow-origin'], 'http://localhost:8080');
  });

  await t.test('Defaults invalid origin to production URL', async () => {
    let statusCode = 200;
    const headers = {};
    const req = {
      method: 'OPTIONS',
      headers: {
        origin: 'https://evil.com',
      },
    };
    const res = {
      setHeader: (key, value) => {
        headers[key.toLowerCase()] = value;
      },
      status: (code) => {
        statusCode = code;
        return {
          end: () => {},
        };
      },
    };

    await handler(req, res);

    assert.strictEqual(
      headers['access-control-allow-origin'],
      'https://2gbxenvironment-2.vercel.app'
    );
  });

  await t.test('Defaults missing origin to production URL', async () => {
    let statusCode = 200;
    const headers = {};
    const req = {
      method: 'OPTIONS',
      headers: {},
    };
    const res = {
      setHeader: (key, value) => {
        headers[key.toLowerCase()] = value;
      },
      status: (code) => {
        statusCode = code;
        return {
          end: () => {},
        };
      },
    };

    await handler(req, res);

    assert.strictEqual(
      headers['access-control-allow-origin'],
      'https://2gbxenvironment-2.vercel.app'
    );
  });
});
