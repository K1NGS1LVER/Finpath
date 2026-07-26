#!/usr/bin/env tsx
// Boots a throwaway Vite dev server (mock auth, seeded demo profile) and
// captures the README's screenshots into docs/screenshots/. Re-run this
// any time a screen's layout changes enough that the docs go stale —
// nothing here is hand-maintained state, it's all regenerated from the
// running app.

import { chromium } from '@playwright/test';
import { spawn, type ChildProcess } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// scripts/ is at frontend/scripts/; repo root is two levels up.
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const FRONTEND = resolve(REPO_ROOT, 'frontend');
const OUT_DIR = resolve(REPO_ROOT, 'docs/screenshots');

// A non-default port so this never collides with a `pnpm dev` you already
// have open on 5173.
const PORT = 5183;
const BASE_URL = `http://localhost:${PORT}`;

interface Shot {
  path: string;
  file: string;
  dark?: boolean;
  waitForText?: string;
}

// Note: the app shell scrolls in an inner container (`overflow-y-auto`),
// not the document body, so `page.screenshot({ fullPage: true })` always
// comes back viewport-sized regardless — these are all single-viewport
// hero shots by construction, not by an unused option.
const SHOTS: Shot[] = [
  { path: '/', file: 'landing.png' },
  { path: '/?demo=1', file: 'dashboard.png', waitForText: 'Financial Overview' },
  { path: '/dashboard', file: 'dashboard-dark.png', dark: true },
  { path: '/journey', file: 'journey.png' },
  { path: '/cashflow', file: 'cashflow.png' },
  { path: '/debt', file: 'debt.png' },
  { path: '/afford', file: 'affordability.png' },
  { path: '/design', file: 'design-system.png' },
];

function waitForServer(url: string, timeoutMs = 30_000): Promise<void> {
  const start = Date.now();
  return new Promise((resolvePromise, reject) => {
    const tick = async () => {
      try {
        const res = await fetch(url);
        if (res.ok || res.status < 500) return resolvePromise();
      } catch {
        // not up yet
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`Dev server didn't respond at ${url} within ${timeoutMs}ms`));
        return;
      }
      setTimeout(tick, 300);
    };
    tick();
  });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  console.log(`[screenshots] starting Vite on port ${PORT}...`);
  const vite: ChildProcess = spawn(
    'pnpm',
    ['exec', 'vite', '--port', String(PORT), '--strictPort'],
    {
      cwd: FRONTEND,
      env: { ...process.env, VITE_AUTH_MOCK: 'true' },
      stdio: 'pipe',
    },
  );
  vite.on('error', (err) => {
    console.error('[screenshots] failed to start vite:', err.message);
    process.exit(1);
  });

  try {
    await waitForServer(BASE_URL);
    console.log('[screenshots] dev server up, launching browser...');

    const browser = await chromium.launch();
    const page = await browser.newPage({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 2,
    });

    for (const shot of SHOTS) {
      await page.goto(`${BASE_URL}${shot.path}`, { waitUntil: 'networkidle' });

      if (shot.waitForText) {
        await page.getByText(shot.waitForText).first().waitFor({ timeout: 10_000 });
      }
      if (shot.dark) {
        await page.getByRole('button', { name: 'Toggle Theme' }).click();
        await page.waitForTimeout(500); // let the theme-transition CSS settle
      }

      // Small settle window for entrance animations to finish so the
      // screenshot doesn't catch a mid-fade frame.
      await page.waitForTimeout(400);

      const outPath = resolve(OUT_DIR, shot.file);
      await page.screenshot({ path: outPath });
      console.log(`[screenshots] wrote ${shot.file}`);
    }

    await browser.close();
  } finally {
    vite.kill();
  }

  console.log(`[screenshots] done — see ${OUT_DIR}`);
}

main().catch((err) => {
  console.error('[screenshots] failed:', err);
  process.exit(1);
});
