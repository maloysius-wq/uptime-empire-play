import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.UPTIME_PLAYWRIGHT || 'playwright');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(process.env.UPTIME_QA_RESULTS || resolve(root, '../outputs/audit-browser'));
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
const server = createServer(async (request, response) => {
  try {
    const requested = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = resolve(root, '.' + (requested === '/' ? '/index.html' : requested));
    if (!file.startsWith(root + sep)) { response.writeHead(403).end(); return; }
    const body = await readFile(file);
    response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' });
    response.end(body);
  } catch (_) { response.writeHead(404).end(); }
});
await new Promise(resolveListen => server.listen(0, '127.0.0.1', resolveListen));
const target = process.env.UPTIME_QA_URL || `http://127.0.0.1:${server.address().port}/`;
await mkdir(output, { recursive: true });
let browser;
const results = [];
try {
  browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--disable-gpu'] });
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const url = new URL(target);
    url.searchParams.set('qa', 'management');
    await page.goto(url.href, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.UptimeEmpire && window.UptimeEmpireUI?.computerOpen);
    await page.evaluate(() => {
      const app = window.UptimeEmpire;
      app.state.credits = 1e9;
      app.state.research = 100;
      app.state.achievementsClaimed = Object.fromEntries(window.UptimeEmpireData.achievementDefs.map(def => [def.id, Date.now()]));
      app.state.currentPanel = 'infrastructure';
      app.state.currentWorkspaceSection = 'fleet';
      app.renderAll();
    });
    const skins = await page.evaluate(() => window.UptimeEmpireData.uiSkinDefs.map(skin => skin.id));
    for (const skin of skins) {
      await page.evaluate(id => {
        window.UptimeEmpire.acquireUiSkin(id);
        window.UptimeEmpire.renderAll();
      }, skin);
      await page.waitForTimeout(160);
      await page.screenshot({ path: resolve(output, `management-${viewport.width}-${skin}.png`) });
      const layout = await page.evaluate(() => {
        const cards = [...document.querySelectorAll('#opsList [data-gen-card]')];
        const visibleButtons = [...document.querySelectorAll('.fleet-actions button')].filter(button => button.getBoundingClientRect().width);
        return {
          width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
          fleets: cards.length, expectedFleets: window.UptimeEmpireData.generatorDefs.length,
          overflowingButtons: visibleButtons.filter(button => button.scrollWidth > button.clientWidth + 2).map(button => button.textContent.trim())
        };
      });
      assert(layout.scrollWidth <= layout.width + 2, `horizontal page overflow at ${viewport.width}/${skin}`);
      assert.equal(layout.fleets, layout.expectedFleets, 'all fleet entries must remain visible in the catalog');
      assert.deepEqual(layout.overflowingButtons, [], `fleet button text overflow at ${viewport.width}/${skin}`);
      results.push({ type: 'management', viewport, skin, layout });
      for (const [panel, section] of [['command', 'overview'], ['infrastructure', 'upgrades'], ['people', 'operations'], ['people', 'staff'], ['network', 'regions'], ['progress', 'overhaul'], ['progress', 'skins'], ['progress', 'achievements']]) {
        await page.evaluate(([nextPanel, nextSection]) => {
          const app = window.UptimeEmpire;
          app.state.currentPanel = nextPanel;
          app.state.currentWorkspaceSection = nextSection;
          app.renderAll();
        }, [panel, section]);
        await page.screenshot({ path: resolve(output, `management-${viewport.width}-${skin}-${panel}-${section}.png`) });
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), `page overflow at ${viewport.width}/${skin}/${section}`);
        results.push({ type: 'management-section', viewport, skin, panel, section });
      }
      await page.evaluate(() => {
        window.UptimeEmpire.state.currentPanel = 'infrastructure';
        window.UptimeEmpire.state.currentWorkspaceSection = 'fleet';
        window.UptimeEmpire.renderAll();
      });
    }
    const firstId = await page.evaluate(() => window.UptimeEmpireData.generatorDefs[0].id);
    await page.locator(`#opsList [data-action="buy-generator"][data-id="${firstId}"]`).click();
    assert(await page.evaluate(id => window.UptimeEmpire.getGenState(id).owned > 0, firstId), 'fleet buy control must buy hardware');
    await page.locator(`#opsList [data-action="run-generator"][data-id="${firstId}"]`).click();
    assert(await page.evaluate(id => window.UptimeEmpire.getGenState(id).running, firstId), 'fleet Run control must start a cycle');
    await page.locator(`#opsList [data-action="hire-manager"][data-id="${firstId}"]`).click();
    assert(await page.evaluate(id => window.UptimeEmpire.getGenState(id).automated, firstId), 'fleet manager control must automate the generator');
    await page.evaluate(() => {
      const app = window.UptimeEmpire;
      app.state.currentPanel = 'command';
      app.state.currentWorkspaceSection = 'overview';
      app.renderAll();
    });
    await page.locator('#debtPaymentAmount').fill('100000000');
    await page.locator('[data-action="repay-debt"][data-amount="custom"]').click();
    assert.equal(await page.evaluate(() => window.UptimeEmpire.getDebtStatus().paid), 100000000);
    await page.screenshot({ path: resolve(output, `debt-${viewport.width}.png`) });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.UptimeEmpireUI?.computerOpen);
    assert.equal(await page.evaluate(() => window.UptimeEmpire.getDebtStatus().paid), 100000000, 'debt payment must survive browser reload');
    await page.evaluate(() => {
      const app = window.UptimeEmpire;
      app.state.credits = 1e100;
      const category = Object.entries(window.UptimeEmpireData.cosmetics).find(([, items]) => items.some(item => item.id === 'uplink-radio'))[0];
      app.buyCosmetic(category, 'uplink-radio');
      app.buyCosmetic('lighting', 'lamp');
      window.UptimeEmpireUI.openWorldUtility('settings');
    });
    await page.locator('[data-radio-setting="enabled"]').uncheck();
    await page.locator('[data-radio-setting="volume"]').fill('0.08');
    await page.locator('[data-radio-setting="volume"]').dispatchEvent('change');
    assert.equal(await page.evaluate(() => window.UptimeEmpire.getRadioProfile().enabled), false);
    assert.equal(await page.evaluate(() => window.UptimeEmpire.state.soundEnabled), true);
    await page.screenshot({ path: resolve(output, `radio-${viewport.width}.png`) });
    await page.evaluate(() => {
      const ui = window.UptimeEmpireUI;
      ui.app.state.currentShopView = 'lighting';
      ui.openWorldUtility('shop');
    });
    await page.locator('[data-light-setting="enabled"]').first().uncheck();
    assert.equal(await page.evaluate(() => window.UptimeEmpire.getOfficeLightSettings('lighting:lamp:1').enabled), false);
    await page.screenshot({ path: resolve(output, `lighting-controls-${viewport.width}.png`) });
    await page.evaluate(() => window.UptimeEmpireUI.closeWorldUtility(false));
    for (const [station, focus, visible, hidden] of [
      ['missionBoard', 'dispatch', '.mission-board-card', '.incident-monitor-card'],
      ['noc', 'incidents', '.incident-monitor-card', '.mission-board-card']
    ]) {
      await page.evaluate(id => window.UptimeEmpireUI.openWorldStation({ id }), station);
      assert.equal(await page.locator('#panel-missions').getAttribute('data-operations-focus'), focus);
      assert(await page.locator(visible).isVisible(), `${station} must show its own tasks`);
      assert.equal(await page.locator(hidden).isVisible(), false);
      await page.locator('[data-operations-focus="all"]').click();
      assert(await page.locator(hidden).isVisible(), 'accessibility shortcut must remain usable');
      await page.screenshot({ path: resolve(output, `${station}-${viewport.width}.png`) });
    }
    const arcade = await page.evaluate(() => {
      const ui = window.UptimeEmpireUI;
      const preview = document.createElement('canvas');
      preview.width = 512;
      preview.height = 384;
      preview.style.cssText = 'position:fixed;inset:0;margin:auto;width:min(95vw,800px);height:auto;aspect-ratio:4/3;z-index:99999;background:#000;image-rendering:pixelated';
      preview.id = 'qaArcadePreview';
      document.body.append(preview);
      ui.arcade.overlayOpen = true;
      return ui.arcade.catalog.map(game => game.id);
    });
    for (const id of arcade) {
      const canvas = await page.evaluate(gameId => {
        const ui = window.UptimeEmpireUI;
        ui.createArcadeGame(gameId);
        ui.arcade.currentGameId = gameId;
        const preview = document.getElementById('qaArcadePreview');
        const ctx = preview.getContext('2d');
        ui.renderCabinetArcade(ctx, preview.width, preview.height, 1);
        const bytes = ctx.getImageData(0, 0, preview.width, preview.height).data;
        let lit = 0;
        for (let i = 0; i < bytes.length; i += 4) if (bytes[i] + bytes[i + 1] + bytes[i + 2] > 100) lit += 1;
        return { lit, pixels: bytes.length / 4 };
      }, id);
      assert(canvas.lit > 1500, `${id} canvas is blank or placeholder-only`);
      await page.screenshot({ path: resolve(output, `arcade-${viewport.width}-${id}.png`) });
      results.push({ type: 'arcade', viewport, id, canvas });
    }
    assert.deepEqual(errors, [], 'browser page errors');
    await context.close();
  }
  await writeFile(resolve(output, 'gameplay-diagnostics.json'), JSON.stringify({ capturedAt: new Date().toISOString(), target, results }, null, 2));
  console.log(`Browser gameplay QA passed: ${results.length} desktop/mobile skin and arcade captures; debt reload verified. Output: ${output}`);
} finally {
  await browser?.close();
  await new Promise(resolveClose => server.close(resolveClose));
}
