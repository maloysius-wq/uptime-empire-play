import { mkdir, rm, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const resultsDir = resolve(projectRoot, 'qa-results');
const targetUrl = process.env.UPTIME_QA_URL || 'https://maloysius-wq.github.io/uptime-empire-play/';
const useHeadless = /^1|true$/i.test(process.env.UPTIME_QA_HEADLESS || '');
const views = ['arcade-front', 'arcade-quarter', 'desk-mount', 'storage-cabinet'];

function fail(message) {
  throw new Error(`[GPU visual QA] ${message}`);
}

function wait(ms) {
  return new Promise(resolveWait => setTimeout(resolveWait, ms));
}

async function removeWithRetry(path) {
  let lastError = null;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      await rm(path, { recursive: true, force: true });
      return;
    } catch (error) {
      lastError = error;
      if (error.code !== 'EBUSY' && error.code !== 'EPERM') throw error;
      await wait(350 * (attempt + 1));
    }
  }
  if (lastError) console.warn(`Could not immediately remove temporary Chrome profile: ${lastError.message}`);
}

async function waitFor(task, timeoutMs, label) {
  const deadline = Date.now() + timeoutMs;
  let lastError = null;
  while (Date.now() < deadline) {
    try {
      const result = await task();
      if (result) return result;
    } catch (error) {
      lastError = error;
    }
    await wait(120);
  }
  const detail = lastError ? ` (${lastError.message})` : '';
  fail(`Timed out waiting for ${label}${detail}`);
}

async function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const roots = [process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)'], process.env.LOCALAPPDATA].filter(Boolean);
  const candidates = roots.flatMap(root => [
    join(root, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    join(root, 'Google', 'Chrome Beta', 'Application', 'chrome.exe'),
    join(root, 'Google', 'Chrome Dev', 'Application', 'chrome.exe')
  ]);
  for (const candidate of candidates) {
    try {
      await (await import('node:fs/promises')).access(candidate);
      return candidate;
    } catch {
      // Try the next standard Chrome location.
    }
  }
  fail('Google Chrome was not found. Install stable Chrome or set CHROME_PATH for the runner.');
}

async function getFreePort() {
  const net = await import('node:net');
  return new Promise((resolvePort, reject) => {
    const server = net.createServer();
    server.unref();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      server.close(error => error ? reject(error) : resolvePort(address.port));
    });
  });
}

class CdpClient {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 1;
    this.pending = new Map();
    socket.addEventListener('message', event => {
      const message = JSON.parse(String(event.data));
      if (!message.id) return;
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message || 'Chrome DevTools error'));
      else pending.resolve(message.result || {});
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolveCommand, reject) => {
      this.pending.set(id, { resolve: resolveCommand, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.pending.forEach(({ reject }) => reject(new Error('Chrome connection closed.')));
    this.pending.clear();
    this.socket.close();
  }
}

async function openCdp(version) {
  if (typeof globalThis.WebSocket !== 'function') fail('This runner needs Node.js 22 or later for the built-in WebSocket client.');
  const socket = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((resolveOpen, reject) => {
    socket.addEventListener('open', resolveOpen, { once: true });
    socket.addEventListener('error', () => reject(new Error('Could not open the local Chrome debugging connection.')), { once: true });
  });
  return new CdpClient(socket);
}

function qaUrl(view) {
  const url = new URL(targetUrl);
  url.searchParams.set('qa', view);
  url.searchParams.set('qaRun', String(Date.now()));
  return url.href;
}

async function evaluate(client, expression) {
  const result = await client.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) fail(result.exceptionDetails.text || 'Page evaluation failed.');
  return result.result?.value;
}

async function waitForQaReady(client, view) {
  return waitFor(async () => {
    const probe = await evaluate(client, `(() => ({
      state: window.__UPTIME_VISUAL_QA__ || null,
      hint: document.getElementById('office3dHint')?.textContent || ''
    }))()`);
    const state = probe?.state || null;
    if (!state && /failed to load/i.test(probe?.hint || '')) {
      fail(`Chrome could not initialize the 3D scene: ${probe.hint}. Check that this runner has an active hardware-accelerated desktop.`);
    }
    if (!state) return null;
    if (state.status === 'failed') fail(state.reason || `The ${view} visual QA scene failed to initialize.`);
    return state.status === 'ready' ? state : null;
  }, 45000, `${view} scene readiness`);
}

async function collectDiagnostics(client, state) {
  return evaluate(client, `(() => {
    const canvas = document.getElementById('office3dCanvas');
    const gl = canvas && (canvas.getContext('webgl2') || canvas.getContext('webgl'));
    const debug = gl && gl.getExtension('WEBGL_debug_renderer_info');
    return {
      url: location.href,
      view: ${JSON.stringify(state.view)},
      camera: ${JSON.stringify(state.camera)},
      viewport: { width: window.innerWidth, height: window.innerHeight, devicePixelRatio: window.devicePixelRatio },
      renderer: debug && gl ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : null,
      vendor: debug && gl ? gl.getParameter(debug.UNMASKED_VENDOR_WEBGL) : null,
      webglVersion: gl ? gl.getParameter(gl.VERSION) : null,
      hardwareConcurrency: navigator.hardwareConcurrency || null
    };
  })()`);
}

async function main() {
  const outputRelative = relative(projectRoot, resultsDir);
  if (!outputRelative || outputRelative.startsWith('..')) fail('Refusing to write visual QA output outside this project.');
  await removeWithRetry(resultsDir);
  await mkdir(resultsDir, { recursive: true });

  const chromePath = await findChrome();
  const port = await getFreePort();
  const profileDir = join(tmpdir(), `uptime-empire-qa-${process.pid}-${Date.now()}`);
  const chromeArgs = [
    `--remote-debugging-port=${port}`,
    '--remote-allow-origins=*',
    `--user-data-dir=${profileDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-component-update',
    '--autoplay-policy=no-user-gesture-required',
    '--enable-gpu',
    '--ignore-gpu-blocklist',
    '--disable-software-rasterizer',
    '--use-angle=d3d11',
    '--force-device-scale-factor=1',
    '--window-size=1600,1000',
    'about:blank'
  ];
  if (useHeadless) chromeArgs.splice(-1, 0, '--headless=new');

  const chrome = spawn(chromePath, chromeArgs, { stdio: 'ignore', windowsHide: true });
  let client = null;
  try {
    await waitFor(async () => {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      return response.ok;
    }, 20000, 'Chrome to start');
    const pageTarget = await waitFor(async () => {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      if (!response.ok) return null;
      const targets = await response.json();
      return targets.find(target => target.type === 'page' && target.webSocketDebuggerUrl) || null;
    }, 10000, 'a Chrome page target');
    client = await openCdp(pageTarget);
    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Emulation.setDeviceMetricsOverride', { width: 1600, height: 1000, deviceScaleFactor: 1, mobile: false });

    const captures = [];
    for (const view of views) {
      await client.send('Page.navigate', { url: qaUrl(view) });
      const state = await waitForQaReady(client, view);
      await wait(700);
      const screenshot = await client.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
      await writeFile(join(resultsDir, `${view}.png`), Buffer.from(screenshot.data, 'base64'));
      captures.push(await collectDiagnostics(client, state));
    }

    await writeFile(join(resultsDir, 'diagnostics.json'), `${JSON.stringify({
      capturedAt: new Date().toISOString(),
      targetUrl,
      headless: useHeadless,
      chromePath,
      captures
    }, null, 2)}\n`);
    console.log(`Captured ${captures.length} GPU visual QA screenshots in ${resultsDir}`);
  } finally {
    client?.close();
    if (!chrome.killed) chrome.kill();
    await wait(1200);
    await removeWithRetry(profileDir);
  }
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
