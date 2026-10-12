import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { Window } from 'happy-dom';
import React, { act } from 'react';
import { MESSAGE_STYLES, readMessageAppearance } from '../src/components/chat/messageStyles';

const dom = new Window({ url: 'http://localhost:4173' });
for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'Element', 'Node', 'PointerEvent', 'MouseEvent', 'KeyboardEvent', 'Event', 'localStorage', 'getComputedStyle']) {
  Object.defineProperty(globalThis, key, { value: key === 'getComputedStyle' ? dom.getComputedStyle.bind(dom) : dom[key], configurable: true });
}
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
const { createRoot } = await import('react-dom/client');
const { MessageStylePicker } = await import('../src/components/chat/MessageStylePicker');
const pixelIds = ['pixel-sky', 'pixel-peach', 'pixel-mint'];

test('all three pixel recipes can be restored without invalidating the original pixel style', () => {
  localStorage.clear();
  try {
    for (const id of [...pixelIds, 'pixel']) {
      assert.ok(MESSAGE_STYLES.some(([styleId]) => styleId === id));
      localStorage.setItem('stellar_message_appearance', JSON.stringify({ id, alignment: 'right' }));
      assert.deepEqual(readMessageAppearance(), { id, alignment: 'right' });
    }
  } finally { localStorage.clear(); }
});

test('pixel cards preview Chinese and their paired fonts, fit in the pannable field, and select the complete recipe', async () => {
  const host = document.createElement('div'); document.body.appendChild(host);
  const root = createRoot(host);
  const choices: unknown[] = [];
  try {
    await act(async () => root.render(<MessageStylePicker appearance={{ id: 'pixel', alignment: 'left' }} onChange={value => choices.push(value)} onClose={() => {}} />));
    const field = document.querySelector<HTMLElement>('.bump-style-field')!;
    const cards = [...field.querySelectorAll<HTMLElement>('.bump-style-option')];
    assert.equal(cards.length, MESSAGE_STYLES.length);
    const texts = new Set<string>();
    const fonts = new Set<string>();
    for (const id of pixelIds) {
      const preview = field.querySelector<HTMLElement>(`.style-${id}`)!;
      assert.ok(preview, `${id} must be selectable`);
      assert.match(preview.textContent || '', /[\u4e00-\u9fff]/);
      assert.match(preview.textContent || '', /[a-zA-Z0-9]/);
      const card = preview.closest<HTMLElement>('.bump-style-option')!;
      assert.ok(parseFloat(card.style.top) + 132 <= parseFloat(field.style.height), 'the extra row must be reachable');
      texts.add(preview.textContent || '');
      fonts.add(card.querySelector('.bump-style-font')?.textContent || '');
      await act(async () => card.dispatchEvent(new dom.MouseEvent('click', { bubbles: true }) as unknown as Event));
    }
    assert.equal(texts.size, 3);
    assert.equal(fonts.size, 3);
    assert.ok(!fonts.has(''));
    assert.deepEqual(choices, pixelIds.map(id => ({ id, alignment: 'left' })));
    const viewport = document.querySelector('[aria-label="平移消息样式画布"]')!;
    for (let index = 0; index < 20; index++) {
      await act(async () => viewport.dispatchEvent(new dom.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }) as unknown as Event));
    }
    const transform = /translate\([^,]+,([^p]+)px\) scale\(([^)]+)\)/.exec(field.style.transform)!;
    const offset = Number(transform[1]), zoom = Number(transform[2]);
    const lastRowTop = Math.max(...cards.map(card => parseFloat(card.style.top)));
    assert.ok(lastRowTop * zoom + offset >= 0);
    assert.ok((lastRowTop + 132) * zoom + offset <= 440, 'panning to the bottom must reveal the new pixel row');
  } finally { await act(async () => root.unmount()); host.remove(); }
});

test('pixel palettes, contours and Chinese font families differ while classic text stays unthemed', () => {
  const style = document.createElement('style');
  style.textContent = readFileSync(new URL('../src/components/chat/bump.css', import.meta.url), 'utf8');
  document.head.appendChild(style);
  const host = document.createElement('div');
  host.innerHTML = pixelIds.map(id => `<span class="bump-message-style style-${id}">明天见</span>`).join('') + '<span class="stellar-timeline-text">明天见</span><div class="bump-classic-composer">输入消息</div>';
  document.body.appendChild(host);
  try {
    const pixels = [...host.querySelectorAll<HTMLElement>('.bump-message-style')].map(element => getComputedStyle(element));
    for (const property of ['--pixel-fill', '--pixel-shape', '--style-font']) {
      const values = pixels.map(value => value.getPropertyValue(property));
      assert.equal(new Set(values).size, 3, `${property} must distinguish complete recipes`);
      assert.ok(values.every(Boolean));
    }
    assert.ok(pixels.every(value => value.getPropertyValue('--style-font').includes('Stellar Pixel')));
    for (const element of host.querySelectorAll<HTMLElement>('.stellar-timeline-text,.bump-classic-composer')) {
      assert.equal(getComputedStyle(element).getPropertyValue('--pixel-shape'), '');
      assert.doesNotMatch(getComputedStyle(element).fontFamily, /Stellar Pixel/);
    }
  } finally { host.remove(); style.remove(); }
});

test('the three CSS font sources ship the verified Chinese WOFF2 assets and their license', () => {
  const css = readFileSync(new URL('../src/components/chat/bump.css', import.meta.url), 'utf8');
  const hashes = {
    '8px-monospaced': '2e05f9b5c16ef55fd936fc6e1545f3bca2e3faebf22f20b2ea22fbe599b9b343',
    '10px-proportional': '30cff04a27ec139dc1eb948f6f3d3b48d6c25cc59ba5ed011d229ed6ffc3c2c9',
    '12px-monospaced': 'a2f54f80506f5d48e24ba94b2b714efdfb1b6bf0a1b250f50e7dd28a50a6b5b6',
  };
  for (const [variant, hash] of Object.entries(hashes)) {
    const file = `fonts/fusion-pixel/fusion-pixel-${variant}-zh_hans.otf.woff2`;
    assert.ok(css.includes(`url('/${file}')`));
    const asset = readFileSync(new URL(`../public/${file}`, import.meta.url));
    assert.equal(asset.subarray(0, 4).toString(), 'wOF2');
    assert.equal(createHash('sha256').update(asset).digest('hex'), hash, 'the decoded, Chinese-glyph-verified original font must be included intact');
  }
  assert.match(readFileSync(new URL('../public/fonts/fusion-pixel/OFL.txt', import.meta.url), 'utf8'), /SIL OPEN FONT LICENSE Version 1\.1/);
});
