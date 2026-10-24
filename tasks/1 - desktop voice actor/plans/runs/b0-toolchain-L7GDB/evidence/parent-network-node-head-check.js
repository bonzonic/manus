'use strict';

const fs = require('node:fs');
const path = require('node:path');
const https = require('node:https');

const MAX_MS_PER_TARGET = 10_000;
const MAX_REDIRECTS = 5;
const USER_AGENT = 'b0-toolchain-node-head/1';
const TARGETS = Object.freeze([
  'https://dot.net/v1/dotnet-install.ps1',
  'https://dotnetcli.blob.core.windows.net/dotnet/release-metadata/10.0/releases.json',
]);
const ALLOWED_HOSTS = new Set([
  'dot.net',
  'dotnetcli.blob.core.windows.net',
  'builds.dotnet.microsoft.com',
  'download.visualstudio.microsoft.com',
]);
const REDIRECT_CODES = new Set([301, 302, 303, 307, 308]);

function parseArgs() {
  let receiptPath = null;
  for (let i = 2; i < process.argv.length; i += 1) {
    if (process.argv[i] === '--receipt' && process.argv[i + 1]) {
      receiptPath = process.argv[++i];
    } else {
      throw new Error(`unexpected argument: ${process.argv[i]}`);
    }
  }
  if (!receiptPath) {
    throw new Error('usage: node parent-network-node-head-check.js --receipt <receipt.json>');
  }
  return path.resolve(receiptPath);
}

function checkedUrl(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || !ALLOWED_HOSTS.has(url.hostname.toLowerCase())) {
    throw new Error(`URL is not an allowed official HTTPS endpoint: ${value}`);
  }
  return url;
}

function selectedHeaders(headers) {
  const selected = {};
  for (const name of ['content-length', 'content-type', 'etag', 'last-modified', 'location']) {
    const value = headers[name];
    if (value !== undefined) {
      selected[name] = Array.isArray(value) ? value.join(', ') : String(value);
    }
  }
  return selected;
}

function headOnce(value, deadline, redirects) {
  const url = checkedUrl(value);
  const remaining = deadline - Date.now();
  if (remaining <= 0) {
    const timeout = new Error('per-target 10 second deadline exceeded');
    timeout.code = 'ETIMEDOUT';
    return Promise.reject(timeout);
  }

  return new Promise((resolve, reject) => {
    const request = https.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || 443,
        path: `${url.pathname}${url.search}`,
        method: 'HEAD',
        headers: {
          'User-Agent': USER_AGENT,
          Accept: '*/*',
        },
        // Intentionally no ca, agent, rejectUnauthorized, proxy, or credential options.
        // Node's normal certificate and hostname validation remain in force.
      },
      (response) => {
        const statusCode = response.statusCode ?? null;
        const headers = selectedHeaders(response.headers);
        let location = null;
        if (typeof response.headers.location === 'string') {
          try {
            location = new URL(response.headers.location, url).toString();
          } catch {
            location = null;
          }
        }

        // Do not read, buffer, or save a response body. Close immediately after headers.
        response.destroy();

        if (REDIRECT_CODES.has(statusCode) && location) {
          if (redirects.length >= MAX_REDIRECTS) {
            const error = new Error('redirect limit exceeded');
            error.code = 'EREDIRECTLIMIT';
            reject(error);
            return;
          }
          try {
            checkedUrl(location);
          } catch (error) {
            error.code = error.code || 'EREDIRECTTARGET';
            reject(error);
            return;
          }
          headOnce(location, deadline, [...redirects, location]).then(resolve, reject);
          return;
        }

        resolve({
          statusCode,
          headers,
          finalUrl: url.toString(),
          redirects,
        });
      },
    );

    request.setTimeout(remaining, () => {
      const error = new Error('per-target 10 second deadline exceeded');
      error.code = 'ETIMEDOUT';
      request.destroy(error);
    });
    request.on('error', reject);
    request.end();
  });
}

async function checkTarget(target) {
  const startedAt = new Date().toISOString();
  const started = Date.now();
  try {
    const result = await headOnce(target, started + MAX_MS_PER_TARGET, []);
    const endedAt = new Date().toISOString();
    return {
      target,
      startedAt,
      endedAt,
      elapsedMs: Date.now() - started,
      ok: result.statusCode >= 200 && result.statusCode < 400,
      ...result,
    };
  } catch (error) {
    return {
      target,
      startedAt,
      endedAt: new Date().toISOString(),
      elapsedMs: Date.now() - started,
      ok: false,
      error: {
        name: error.name || 'Error',
        code: error.code || null,
        message: error.message || String(error),
      },
    };
  }
}

async function main() {
  const receiptPath = parseArgs();
  const results = [];
  for (const target of TARGETS) {
    // Sequential execution keeps the bound and evidence unambiguous per exact target.
    results.push(await checkTarget(target));
  }

  const receipt = {
    schema: 'b0-parent-network-node-head-receipt-v1',
    generatedAt: new Date().toISOString(),
    client: {
      module: 'node:https',
      runtime: process.version,
      platform: process.platform,
      arch: process.arch,
      openssl: process.versions.openssl || null,
      method: 'HEAD',
      tls: 'Node defaults: normal certificate-chain and hostname validation; no custom CA',
      credentials: 'none supplied or read',
    },
    bounds: {
      maxMsPerTarget: MAX_MS_PER_TARGET,
      maxRedirects: MAX_REDIRECTS,
      redirectPolicy: 'HTTPS only; allowlisted official Microsoft hosts only',
      responseBodies: 'not read, buffered, or saved',
    },
    targets: TARGETS,
    results,
    diagnosticOnly: true,
    noAcquisitionRestoreBuild: true,
  };

  fs.mkdirSync(path.dirname(receiptPath), { recursive: true });
  fs.writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, {
    encoding: 'utf8',
    flag: 'wx',
  });
  process.stdout.write(`${JSON.stringify(receipt)}\n`);
  process.exitCode = results.every((result) => result.ok) ? 0 : 1;
}

main().catch((error) => {
  process.stderr.write(`${error.name || 'Error'}: ${error.message || String(error)}\n`);
  process.exitCode = 2;
});
