import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import React, { act } from 'react';
import { build } from 'esbuild';
import { unlink } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const dom = new Window({url:'http://localhost:4174'});
for (const key of ['window','document','navigator','HTMLElement','SVGElement','Element','Node','Event','MouseEvent','KeyboardEvent','localStorage','getComputedStyle','requestAnimationFrame','cancelAnimationFrame']) {
  const value = dom[key];
  Object.defineProperty(globalThis,key,{value:['getComputedStyle','requestAnimationFrame','cancelAnimationFrame'].includes(key) ? value.bind(dom) : value,configurable:true});
}
const observers: { disconnects: number }[] = [];
class TestResizeObserver {
  disconnects = 0;
  constructor() { observers.push(this); }
  observe() {}
  disconnect() { this.disconnects++; }
}
Object.defineProperty(globalThis,'ResizeObserver',{value:TestResizeObserver,configurable:true});
Object.defineProperty(dom.Element.prototype,'animate',{value:undefined,configurable:true});
Object.defineProperty(dom.SVGSVGElement.prototype,'createSVGRect',{value:() => ({}),configurable:true});
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
localStorage.setItem('stellar_preset_map_zoom','15');
const { createRoot } = await import('react-dom/client');
const L = (await import('leaflet')).default;
const originalMap = L.map;
const maps: import('leaflet').Map[] = [];
L.map = ((...args: Parameters<typeof L.map>) => {
  const map = originalMap(...args);
  maps.push(map);
  return map;
}) as typeof L.map;

const bundle = new URL('../.leaflet-runtime-test.mjs',import.meta.url);
await build({entryPoints:[fileURLToPath(new URL('../src/components/SlippyLeafletMap.tsx',import.meta.url))],outfile:fileURLToPath(bundle),bundle:true,format:'esm',platform:'node',packages:'external',loader:{'.css':'empty'},logLevel:'silent',plugins:[{name:'ignore-css',setup(builder) { builder.onResolve({filter:/\.css$/},args => ({path:args.path,namespace:'empty-css'})); builder.onLoad({filter:/.*/,namespace:'empty-css'},() => ({contents:'',loader:'js'})); }}]});
const { SlippyLeafletMap } = await import(bundle.href);
await unlink(bundle);
const userLocation = {lat:36.061,lng:103.832};
const friend = {id:'friend',name:'Stella',lat:36.075,lng:103.84,avatar:'',battery:80,status:'咖啡时间',relationship:'friend'};
const route = {points:[[36.061,103.832],[36.067,103.833],[36.075,103.84]],distanceKm:1.9,minutes:24,estimated:false};
const navState = {friend,friendId:friend.id,status:'me_moving_to_friend',progress:.7};

async function mount(extra: Record<string, unknown> = {}) {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  const base = {userLocation,friends:[friend],simulatedActivities:[],starCards:[],customMarkers:[],schedules:[],activeMapFilter:['friends'],onSelectFriend:() => {},...extra};
  await act(async () => root.render(<SlippyLeafletMap {...base}/>));
  const map = maps.at(-1)!;
  return {host,root,map,render:async (next:Record<string,unknown>) => { await act(async () => root.render(<SlippyLeafletMap {...base} {...next}/>)); },unmount:async () => { await act(async () => root.unmount()); host.remove(); }};
}

test('a real route is drawn once, keeps actual endpoint avatars and does not move them using simulated progress',async t => {
  const app = await mount({lifeRoute:route,navState,selectedFriendId:friend.id});
  t.after(app.unmount);
  const polylines: import('leaflet').Polyline[] = [];
  const markers: import('leaflet').Marker[] = [];
  app.map.eachLayer(layer => { if (layer instanceof L.Polyline) polylines.push(layer); if (layer instanceof L.Marker) markers.push(layer); });
  assert.equal(polylines.length,2,'only a white route outline and blue actual geometry should render');
  for (const line of polylines) assert.deepEqual(line.getLatLngs().map((point:any) => [point.lat,point.lng]),route.points);
  assert.ok(markers.some(marker => marker.getLatLng().equals([userLocation.lat,userLocation.lng])),'user avatar remains at origin');
  assert.ok(markers.some(marker => marker.getLatLng().equals([friend.lat,friend.lng])),'friend avatar remains at actual destination');
  await app.render({lifeRoute:null,navState:null,selectedFriendId:null});
  const remaining: import('leaflet').Polyline[] = [];
  app.map.eachLayer(layer => { if (layer instanceof L.Polyline) remaining.push(layer); });
  assert.equal(remaining.length,0,'ending navigation clears the route');
});

test('navigation owns framing only when a new route arrives; zoom controls preserve a panned center',async t => {
  const app = await mount({lifeRoute:route,navState,selectedFriendId:friend.id});
  t.after(app.unmount);
  await act(async () => app.map.setView([36.12,103.91],13,{animate:false}));
  const center = app.map.getCenter();
  await app.render({lifeRoute:route,navState:{...navState,progress:.8},selectedFriendId:friend.id});
  assert.ok(app.map.getCenter().equals(center),'metadata changes cannot recenter a manually panned map');
  await app.render({lifeRoute:route,navState,selectedFriendId:null});
  const zoomButton = app.host.querySelector('button[aria-label="放大"]');
  assert.ok(zoomButton);
  await act(async () => zoomButton.dispatchEvent(new dom.MouseEvent('click',{bubbles:true}) as unknown as Event));
  assert.ok(app.map.getCenter().equals(center),'zoom must retain the viewed map center');
});

test('the map has one base layer and one resize observer, and releases both on unmount',async t => {
  const before = observers.length;
  const app = await mount();
  t.after(app.unmount);
  const tiles = () => { const result: import('leaflet').TileLayer[] = []; app.map.eachLayer(layer => { if (layer instanceof L.TileLayer) result.push(layer); }); return result; };
  assert.equal(tiles().length,1,'initial render does not create a duplicate base layer');
  assert.equal(observers.length-before,1,'resize is managed by one observer');
  await app.render({mapStyle:'dark'});
  await app.render({mapStyle:'minimal'});
  assert.equal(tiles().length,1,'rapid style switching does not leave old tile layers');
  await app.unmount();
  assert.equal(observers[before].disconnects,1);
  assert.equal((app.map as any)._containerId,undefined,'Leaflet removes ownership of its DOM container');
});

test('base tile failures use one backup layer and disclose when the backup also fails',async t => {
  const app = await mount();
  t.after(app.unmount);
  let tile: import('leaflet').TileLayer | undefined;
  app.map.eachLayer(layer => { if (layer instanceof L.TileLayer) tile = layer; });
  assert.ok(tile);
  await act(async () => { for (let i=0;i<6;i++) tile!.fire('tileerror'); });
  assert.match(tile.getTileUrl({x:1,y:1,z:1} as any),/basemaps\.cartocdn\.com/);
  assert.match(app.host.querySelector('[role="status"]')?.textContent || '',/备用底图/);
  await act(async () => { for (let i=0;i<6;i++) tile!.fire('tileerror'); });
  assert.match(app.host.querySelector('[role="status"]')?.textContent || '',/暂时加载失败/);
  const tiles: import('leaflet').TileLayer[] = [];
  app.map.eachLayer(layer => { if (layer instanceof L.TileLayer) tiles.push(layer); });
  assert.deepEqual(tiles,[tile]);
});

test('selected target distances below a kilometer are still reported accurately in km',async t => {
  const app = await mount({selectedTargetCoord:{lat:36.06498,lng:103.832}});
  t.after(app.unmount);
  const locator = app.host.querySelector('button[aria-label^="定位至我的位置"]');
  assert.match(locator?.getAttribute('title') || '',/相距 0\.44 km$/);
});

test('viewport callbacks report the actual center and zoom after pan and zoom',async t => {
  const viewports: {lat:number;lng:number;zoom?:number}[] = [];
  const app = await mount({onViewportChanged:(viewport:{lat:number;lng:number;zoom?:number}) => viewports.push(viewport)});
  t.after(app.unmount);
  await act(async () => app.map.setView([36.12,103.91],12,{animate:false}));
  assert.deepEqual(viewports.at(-1),{lat:36.12,lng:103.91,zoom:12});
  await act(async () => app.map.setZoom(13,{animate:false}));
  assert.deepEqual(viewports.at(-1),{lat:36.12,lng:103.91,zoom:13});
});

test('a navigation friend remains visible outside the active layer without bypassing hidden privacy',async t => {
  const app = await mount({lifeRoute:route,navState,activeMapFilter:['activities']});
  t.after(app.unmount);
  const friendMarkers = () => { const markers: import('leaflet').Marker[] = []; app.map.eachLayer(layer => { if (layer instanceof L.Marker && layer.options.title === friend.name) markers.push(layer); }); return markers; };
  assert.equal(friendMarkers().length,1);
  await app.render({friends:[{...friend,isHidden:true}],navState:{...navState,friend:{...friend,isHidden:true}}});
  assert.equal(friendMarkers().length,0,'navigation never reveals a hidden friend');
});

test('explicit friend focus can run during navigation, and a late route result does not override the open friend card',async t => {
  const other = {...friend,id:'other',name:'Other',lat:36.15,lng:103.95};
  const app = await mount({lifeRoute:route,navState,friends:[friend,other]});
  t.after(app.unmount);
  const focusCalls: unknown[] = [];
  app.map.flyTo = ((location:import('leaflet').LatLngExpression,zoom:number) => { focusCalls.push(location); return app.map.setView(location,zoom,{animate:false}); }) as typeof app.map.flyTo;
  await app.render({selectedFriendId:other.id,flyToLocation:{lat:other.lat,lng:other.lng,timestamp:100}});
  await act(async () => { await new Promise(resolve => requestAnimationFrame(resolve)); });
  assert.ok(focusCalls.length > 0,'a new explicit focus request is executed during active navigation');
  const selectedCenter = app.map.getCenter();
  await app.render({selectedFriendId:other.id,flyToLocation:{lat:other.lat,lng:other.lng,timestamp:100},lifeRoute:{...route,points:[...route.points]}});
  assert.ok(app.map.getCenter().equals(selectedCenter),'the active user-selected friend takes priority over a late route response');
  const calls = focusCalls.length;
  await app.render({selectedFriendId:other.id,flyToLocation:{lat:other.lat,lng:other.lng,timestamp:100},lifeRoute:route,navState:{...navState,progress:.8}});
  await act(async () => { await new Promise(resolve => requestAnimationFrame(resolve)); });
  assert.equal(focusCalls.length,calls,'metadata and a consumed focus timestamp never move the camera again');
});

test('switching display themes preserves Leaflet container classes and tile styling',async t => {
  const app=await mount({mapStyle:'standard'});t.after(app.unmount);
  const container=app.map.getContainer();
  assert.ok(container.classList.contains('leaflet-container'));
  await app.render({mapStyle:'dark'});
  assert.ok(container.classList.contains('leaflet-container'),'theme rerenders must not remove the class that protects tile dimensions');
  assert.ok(container.classList.contains('dark-map'));
  assert.ok(app.host.querySelector('.leaflet-layer.stellar-tiles-dark'));
  await app.render({mapStyle:'standard'});
  assert.ok(container.classList.contains('leaflet-container'));
  assert.equal(container.classList.contains('dark-map'),false);
  assert.equal(app.host.querySelector('.leaflet-layer.stellar-tiles-dark'),null);
});

test('selected activity shows only its valid places, needs and memories and clears them when selection changes',async t => {
  const activity = {id:'activity-one',title:'城市骑行',icon:'🚲',color:'#1877F2',lat:36.08,lng:103.86,startTime:'19:00',endTime:'21:00',status:'upcoming',participants:[],originLocation:{name:'集合点',lat:36.06,lng:103.83},venueLocation:{name:'终点',lat:36.08,lng:103.86},routeNodes:[{name:'补给点',lat:36.07,lng:103.85,status:'next'},{name:'无效地点',lat:91,lng:103.86,status:'planned'}],needs:[{id:'water',title:'需要水',icon:'💧',status:'open',lat:36.071,lng:103.851},{id:'repair',title:'补胎',icon:'🔧',status:'claimed',lat:36.072,lng:103.852},{id:'done',title:'已补给',icon:'✅',status:'resolved',lat:36.073,lng:103.853}],moments:[{id:'photo',caption:'一起看日落',url:'/sunset.jpg',lat:36.074,lng:103.854}]};
  const other = {...activity,id:'activity-two',needs:[{...activity.needs[0],id:'other-water'}],moments:[{...activity.moments[0],id:'other-photo'}]};
  const selected:string[]=[];
  const app=await mount({simulatedActivities:[activity,other],activeMapFilter:['activities'],selectedActivityId:activity.id,onSelectActivity:(item:any)=>selected.push(item.id)});t.after(app.unmount);
  assert.equal(app.host.querySelectorAll('[data-activity-need]').length,3,'only selected activity demand pins are shown');
  assert.equal(app.host.querySelectorAll('[data-activity-moment]').length,1);
  assert.equal(app.host.querySelector('[data-activity-need="other-water"]'),null);
  const waypoints:import('leaflet').Marker[]=[];
  const lines:import('leaflet').Polyline[]=[];
  app.map.eachLayer(layer=>{if(layer instanceof L.Marker && layer.options.title?.startsWith('活动地点：'))waypoints.push(layer);if(layer instanceof L.Polyline)lines.push(layer);});
  assert.equal(waypoints.length,3,'origin, valid route node and venue have exact coordinate anchors');
  assert.ok(waypoints.some(marker=>marker.getLatLng().equals([36.06,103.83])));
  assert.ok(waypoints.some(marker=>marker.getLatLng().equals([36.08,103.86])));
  assert.ok(lines.every(line=>line.getLatLngs().every((point:any)=>point.lat>=-90 && point.lat<=90)),'invalid route coordinates never reach Leaflet');
  assert.ok(lines.some(line=>line.getTooltip()?.getContent()==='计划路线示意 · 点击活动卡查看真实道路导航'));
  const needMarker:import('leaflet').Marker[]=[];
  app.map.eachLayer(layer=>{if(layer instanceof L.Marker && layer.getElement()?.querySelector('[data-activity-need="water"]'))needMarker.push(layer);});
  assert.equal(needMarker.length,1);assert.ok(needMarker[0].getLatLng().equals([36.071,103.851]));
  await act(async()=>{needMarker[0].fire('click');});assert.deepEqual(selected,[activity.id]);
  const updated={...activity,needs:[{...activity.needs[0],status:'claimed',helperName:'小雨',lat:36.077}],moments:[]};
  await app.render({simulatedActivities:[updated,other],selectedActivityId:activity.id});
  assert.equal(app.host.querySelectorAll('[data-activity-need]').length,1,'an updated activity removes stale demand markers');
  assert.match(app.host.querySelector('[data-activity-need="water"]')?.textContent || '',/协助中 · 小雨/);
  assert.equal(app.host.querySelectorAll('[data-activity-moment]').length,0,'deleted memories disappear from the map');
  const updatedMarkers:import('leaflet').Marker[]=[];
  app.map.eachLayer(layer=>{if(layer instanceof L.Marker && layer.getElement()?.querySelector('[data-activity-need="water"]'))updatedMarkers.push(layer);});
  assert.equal(updatedMarkers.length,1);assert.ok(updatedMarkers[0].getLatLng().equals([36.077,103.851]),'updated coordinates replace the old marker position');
  await app.render({simulatedActivities:[activity,other],selectedActivityId:other.id});
  assert.equal(app.host.querySelector('[data-activity-need="water"]'),null);
  assert.ok(app.host.querySelector('[data-activity-need="other-water"]'));
  await app.render({simulatedActivities:[activity,other],selectedActivityId:null});
  assert.equal(app.host.querySelectorAll('[data-activity-need],[data-activity-moment]').length,0);
});

test('activity participant guidance uses a labelled straight schematic without invented distance or speed',async t=>{
  const participant={id:'member',name:'伙伴',avatar:'',status:'on_the_way',statusText:'在路上',currentLat:36.07,currentLng:103.84};
  const activity={id:'activity',title:'散步',icon:'🚶',color:'#1877F2',lat:36.08,lng:103.86,startTime:'19:00',endTime:'21:00',status:'upcoming',participants:[participant]};
  const app=await mount({simulatedActivities:[activity],activeMapFilter:['activities'],selectedActivityId:activity.id});t.after(app.unmount);
  const lines:import('leaflet').Polyline[]=[];
  app.map.eachLayer(layer=>{if(layer instanceof L.Polyline)lines.push(layer);});
  assert.equal(lines.length,1);
  assert.deepEqual(lines[0].getLatLngs().map((point:any)=>[point.lat,point.lng]),[[36.07,103.84],[36.08,103.86]]);
  assert.equal(lines[0].getTooltip()?.getContent(),'前往方向示意 · 非道路路线');
  const badge=app.host.querySelector('.custom-leaflet-transit-marker')?.textContent || '';
  assert.doesNotMatch(badge,/45 km\/h|5 km\/h|1\.2 km/);
  await app.render({simulatedActivities:[{...activity,participants:[{...participant,isLocationAuthorized:false}]}],selectedActivityId:activity.id});
  assert.equal(app.host.querySelector('.custom-leaflet-transit-marker'),null,'activity selection never reveals an unauthorized member location');
  const remaining:import('leaflet').Polyline[]=[];
  app.map.eachLayer(layer=>{if(layer instanceof L.Polyline)remaining.push(layer);});
  assert.equal(remaining.length,0,'unauthorized guidance is cleared with the participant');
});

test('gatherings retain member clicks, destination coordinates and stable markers and clear with map filters',async t=>{
  const lover={...friend,id:'lover',name:'恋人',relationship:'lover',lat:userLocation.lat,lng:userLocation.lng,isOnline:true};
  const selectedFriends:string[]=[];
  const selectedActivities:string[]=[];
  const selectedMembers:string[]=[];
  let ownClicks=0;
  const app=await mount({friends:[lover],activeMapFilter:['friends'],onSelectFriend:(person:any)=>selectedFriends.push(person.id),onOpenUserTransportCard:()=>ownClicks++});t.after(app.unmount);
  const couple=app.host.querySelector('.stellar-couple-gathering');
  assert.ok(couple);
  await act(async()=>{couple.querySelector('[data-gathering-member="lover"] img')!.dispatchEvent(new dom.MouseEvent('click',{bubbles:true}) as unknown as Event);});
  assert.deepEqual(selectedFriends,['lover'],'a lover portrait opens that original friend');
  const ownButton=[...couple.querySelectorAll('button[data-gathering-member]')].find(button=>button.getAttribute('data-gathering-member')!=='lover')!;
  await act(async()=>{ownButton.dispatchEvent(new dom.MouseEvent('click',{bubbles:true}) as unknown as Event);});
  assert.equal(ownClicks,1,'the own portrait retains its original own-user action');
  await app.render({userNote:'新便签'});
  assert.equal(app.host.querySelector('.stellar-couple-gathering'),couple,'metadata refresh preserves the live animation DOM');
  await app.render({selectedFriendId:lover.id});
  assert.equal(app.host.querySelector('.stellar-couple-gathering'),null,'selection unfolds a single purple friend marker');
  assert.ok(app.host.querySelector('.stellar-friend-marker.is-selected'));
  await app.render({activeMapFilter:['family']});
  assert.equal(app.host.querySelector('.stellar-couple-gathering'),null,'per-person filters remove the excluded lover gathering');

  const destination={name:'终点',lat:36.08,lng:103.86};
  const member={id:'arrived',name:'已到场伙伴',avatar:'',status:'arrived',invitationStatus:'confirmed',isLocationAuthorized:true,currentLat:destination.lat,currentLng:destination.lng};
  const activity={id:'gathering',title:'终点骑行',icon:'🚴',lat:36.06,lng:103.83,venueLocation:destination,status:'upcoming',participants:[member]};
  await app.render({activeMapFilter:['activities'],simulatedActivities:[activity],onSelectActivity:(item:any)=>selectedActivities.push(item.id),onSelectActivityParticipant:(_item:any,person:any)=>selectedMembers.push(person.id)});
  const halo=app.host.querySelector('.stellar-activity-gathering');
  assert.ok(halo);
  const markers:import('leaflet').Marker[]=[];
  app.map.eachLayer(layer=>{if(layer instanceof L.Marker && layer.getElement()?.querySelector('.stellar-activity-gathering'))markers.push(layer);});
  assert.equal(markers.length,1);
  assert.ok(markers[0].getLatLng().equals([destination.lat,destination.lng]),'arrived avatars surround the real venue rather than the origin');
  await act(async()=>{halo.querySelector('[data-gathering-member="arrived"] img')!.dispatchEvent(new dom.MouseEvent('click',{bubbles:true}) as unknown as Event);});
  assert.deepEqual(selectedMembers,['arrived']);
  assert.equal(selectedActivities.length,0,'member click does not also open the activity');
  app.map.flyTo=((location:import('leaflet').LatLngExpression,zoom:number)=>app.map.setView(location,zoom,{animate:false})) as typeof app.map.flyTo;
  await act(async()=>{markers[0].getElement()!.querySelector('.stellar-event-emoji')!.dispatchEvent(new dom.MouseEvent('click',{bubbles:true}) as unknown as Event);});
  assert.deepEqual(selectedActivities,['gathering']);
  assert.ok(app.map.getCenter().equals([destination.lat,destination.lng]),'the activity click focuses the same venue coordinate');
  await app.render({activeMapFilter:['places'],simulatedActivities:[activity]});
  assert.equal(app.host.querySelector('.stellar-activity-gathering'),null);
  assert.equal(app.map.hasLayer(markers[0]),false,'filter changes release the persistent activity marker');
});

test('friend markers remain directly positioned without dashed displacement lines on map move/zoom',async t=>{
  const nearby={...friend,lat:userLocation.lat+.0001,lng:userLocation.lng+.0001};
  const selected:string[]=[];
  const app=await mount({friends:[nearby],onSelectFriend:(person:any)=>selected.push(person.id)});t.after(app.unmount);
  const other=app.host.querySelector<HTMLElement>('[data-friend-id="friend"]')!;
  await act(async()=>{app.map.fire('moveend');app.map.fire('zoomend');});
  const lines:import('leaflet').Polyline[]=[];
  const markers:import('leaflet').Marker[]=[];
  app.map.eachLayer(layer=>{if(layer instanceof L.Polyline)lines.push(layer);if(layer instanceof L.Marker && layer.options.title===friend.name)markers.push(layer);});
  assert.equal(lines.length,0,'no dashed displacement polylines created on map zoom or pan');
  assert.ok(markers[0].getLatLng().equals([nearby.lat,nearby.lng]),'friend marker remains anchored at exact coordinate');
  await act(async()=>{other.querySelector('.stellar-friend-avatar img')!.dispatchEvent(new dom.MouseEvent('click',{bubbles:true}) as unknown as Event);});
  assert.deepEqual(selected,[friend.id]);
});
