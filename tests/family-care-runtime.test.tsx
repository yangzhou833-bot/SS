import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { readFile } from 'node:fs/promises';
import { Window } from 'happy-dom';
import React, { act } from 'react';

const dom = new Window({url:'http://localhost:4174'});
Object.defineProperty(dom.Element.prototype,'animate',{value:undefined,configurable:true});
Object.defineProperty(dom.SVGSVGElement.prototype,'createSVGRect',{value:() => ({}),configurable:true});
for (const key of ['window','document','navigator','HTMLElement','SVGElement','Element','Node','Event','MouseEvent','localStorage','getComputedStyle','requestAnimationFrame','cancelAnimationFrame']) {
  Object.defineProperty(globalThis,key,{value:['getComputedStyle','requestAnimationFrame','cancelAnimationFrame'].includes(key) ? dom[key].bind(dom) : dom[key],configurable:true});
}
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
registerHooks({resolve(specifier,context,nextResolve) {return specifier.endsWith('.css') ? {url:'data:text/javascript,export default {};',shortCircuit:true} : nextResolve(specifier,context);}});
const {createRoot} = await import('react-dom/client');
const L = (await import('leaflet')).default;
const {getManagedMap} = await import('../src/map/managedMap');
const {FamilyCareMonitorPage} = await import('../src/components/FamilyCareMonitorPage');
const {TopBar} = await import('../src/components/TopBar');
const mount = async (content:React.ReactNode) => {
  const host = document.createElement('div');document.body.append(host);
  const root = createRoot(host);
  await act(async () => root.render(content));
  return {host,render:async (next:React.ReactNode) => {await act(async () => root.render(next));},cleanup:async () => {await act(async () => root.unmount());host.remove();}};
};

test('opening, closing and reopening family care keeps six members on one OSM layer and releases map ownership',async () => {
  const content = (isOpen:boolean) => <FamilyCareMonitorPage isOpen={isOpen} onClose={() => {}} familyGroup={null}/>;
  const view = await mount(content(false));
  await view.render(content(true));
  let container = view.host.querySelector<HTMLElement>('.leaflet-container')!;
  const map = getManagedMap(container)!;
  try {
    assert.ok(map);
    const tiles:import('leaflet').TileLayer[] = [];
    const markers:import('leaflet').Marker[] = [];
    map.eachLayer(layer => {
      if (layer instanceof L.TileLayer) tiles.push(layer);
      if (layer instanceof L.Marker) markers.push(layer);
    });
    assert.equal(tiles.length,1);
    assert.equal(tiles[0].getTileUrl({x:1,y:1,z:map.getZoom()} as any),`https://tile.openstreetmap.org/${map.getZoom()}/1/1.png`);
    assert.match(tiles[0].options.attribution || '',/OpenStreetMap/);
    assert.equal(markers.length,6);
    await view.render(content(false));
    assert.ok(!getManagedMap(container),'closing unregisters the original container');
    await view.render(content(true));
    container = view.host.querySelector<HTMLElement>('.leaflet-container')!;
    const reopened = getManagedMap(container)!;
    assert.ok(reopened && reopened !== map,'reopening owns a fresh map instance');
    let reopenedTiles = 0;let reopenedMarkers = 0;
    reopened.eachLayer(layer => {
      if (layer instanceof L.TileLayer) reopenedTiles++;
      if (layer instanceof L.Marker) reopenedMarkers++;
    });
    assert.equal(reopenedTiles,1);
    assert.equal(reopenedMarkers,6);
  } finally {await view.cleanup();}
  assert.ok(!getManagedMap(container),'unmount removes ownership of the original map container');
});

test('the narrow family toolbar retains every action in two rows with 44px targets',async () => {
  const style = document.createElement('style');
  style.textContent = await readFile(new URL('../src/components/map-home-h1.css',import.meta.url),'utf8') + await readFile(new URL('../src/components/stellar-h1.css',import.meta.url),'utf8');
  document.head.append(style);
  const calls:string[] = [];
  const view = await mount(<TopBar currentTab="stellar" isFamilyCareOpen isDarkMode={false} familyTimeRange="realtime" unreadNotificationsCount={2}
    onOpenSearch={() => {}} onOpenAdd={() => {}} onOpenSettings={() => calls.push('general-settings')}
    onCloseFamilyCare={() => calls.push('back')} onToggleDarkMode={() => calls.push('theme')}
    onOpenNotifications={() => calls.push('notifications')} onOpenFamilyCareSettings={() => calls.push('family-settings')}
    onChangeFamilyTimeRange={range => calls.push(range)}/>);
  view.host.style.width='320px';
  try {
    const header = view.host.querySelector('header')!;
    assert.equal(getComputedStyle(header).height,'104px');
    assert.equal(getComputedStyle(header.querySelector('.stellar-topbar-row')!).display,'grid');
    const buttons = [...header.querySelectorAll<HTMLButtonElement>('button')];
    assert.equal(buttons.length,7,'no action disappears to make the toolbar fit');
    for (const button of buttons) {
      const computed = getComputedStyle(button);
      assert.ok(parseFloat(computed.width) >= 44 || parseFloat(computed.minWidth) >= 44);
      assert.ok(parseFloat(computed.height) >= 44 || parseFloat(computed.minHeight) >= 44);
      await act(async () => button.dispatchEvent(new dom.MouseEvent('click',{bubbles:true}) as unknown as Event));
    }
    assert.deepEqual(calls,['back','realtime','today','history','theme','notifications','family-settings']);
  } finally {await view.cleanup();style.remove();}
});
