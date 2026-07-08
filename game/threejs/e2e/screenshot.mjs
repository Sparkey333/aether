import { chromium } from 'playwright';

const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.URL || 'http://localhost:4319/';
const OUT = process.env.OUT || '/tmp';

const browser = await chromium.launch({
  executablePath: EXE,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--use-gl=angle'],
});
const page = await browser.newPage({ viewport: { width: 960, height: 720 }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));

await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForSelector('canvas', { timeout: 15000 });
await page.waitForTimeout(1500);

const canvas = await page.$('canvas');
await canvas.click({ position: { x: 480, y: 360 } }); // focus canvas

// let the sim run, then drive some input: walk forward + lock-on + attack
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/m3-arena.png` });

await page.keyboard.press('Tab'); // lock-on
await page.keyboard.down('KeyW');
await page.waitForTimeout(700);
await page.keyboard.up('KeyW');
// mash a few light attacks (Mouse0)
for (let i = 0; i < 5; i++) { await page.mouse.down(); await page.mouse.up(); await page.waitForTimeout(180); }
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/m3-combat.png` });

const state = await page.evaluate(() => {
  const a = window.__aether;
  return a ? { frame: a.frame, player: a.player, enemies: a.enemies } : null;
});

console.log('CONSOLE_ERRORS:', JSON.stringify(errors.slice(0, 8)));
console.log('SIM_STATE:', JSON.stringify(state, null, 2));
await browser.close();
