import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import React, { act } from 'react';
import type { MessageAppearance } from '../src/components/chat/messageStyles';

const dom = new Window({url:'http://localhost:4173'});
for (const key of ['window','document','navigator','HTMLElement','Element','Node','PointerEvent','MouseEvent','Event','CustomEvent','localStorage','getComputedStyle','requestAnimationFrame','cancelAnimationFrame','ResizeObserver']) Object.defineProperty(globalThis,key,{value:typeof dom[key] === 'function' && ['getComputedStyle','requestAnimationFrame','cancelAnimationFrame'].includes(key) ? dom[key].bind(dom) : dom[key],configurable:true});
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
const {createRoot} = await import('react-dom/client');
const {BumpFriendDock} = await import('../src/components/BumpFriendDock');
const friend = {id:'charge-friend',name:'好友',avatar:'/bump/stickers.png',status:'在家',locationName:'上海',lat:0,lng:0,x:0,y:0,distance:'1 km',battery:50,lastUpdated:'刚刚',isOnline:true};
const pointer = (target:EventTarget,type:string,x=30,y=300) => target.dispatchEvent(new dom.PointerEvent(type,{bubbles:true,button:0,pointerId:1,clientX:x,clientY:y}) as unknown as Event);
const click = (target:EventTarget) => target.dispatchEvent(new dom.MouseEvent('click',{bubbles:true}) as unknown as Event);
const wait = async (milliseconds:number) => { await act(async () => new Promise(resolve => setTimeout(resolve,milliseconds))); };
async function mount(extra:Record<string,any>={}) {
  localStorage.clear();
  const phone = document.createElement('div'); phone.id='stellar-phone-content'; document.body.appendChild(phone);
  const host = document.createElement('div'); phone.appendChild(host);
  const root=createRoot(host); let launches=0, knocks=0;
  await act(async () => root.render(<BumpFriendDock friend={friend} friendCount={10} onLaunch={() => launches++} onOpenChat={() => {}} onCamera={() => {}} onTrajectory={() => {}} onKnock={() => knocks++} onShowToast={() => {}} {...extra}/>));
  return {phone,host,root,get launches(){return launches;},get knocks(){return knocks;},close:async () => {await act(async () => root.unmount());phone.remove();}};
}

test('sticker charge starts after 320ms, stays inside the phone, and release clears the effect',async () => {
  const view = await mount();
  try {
    await act(async () => pointer(view.host.querySelector('[aria-label="发送 爱心"]')!,'pointerdown'));
    await wait(220); assert.equal(view.phone.querySelector('[data-sticker-effect]'),null); assert.equal(view.launches,0);
    await wait(190);
    const effect = view.phone.querySelector('[data-sticker-effect="heart"]'); assert.ok(effect);
    assert.equal(effect.parentElement,view.phone,'effect must be portalled to the phone instead of the desktop body');
    assert.ok(view.launches >= 1);
    await act(async () => pointer(window,'pointerup'));
    assert.equal(view.phone.querySelector('[data-sticker-effect]'),null);
    const count=view.launches; await wait(180); assert.equal(view.launches,count);
  } finally {await view.close();}
});

test('horizontal swipe and pointercancel cannot send a sticker or leave charging behind',async () => {
  const view = await mount();
  try {
    const heart=view.host.querySelector('[aria-label="发送 爱心"]')!;
    await act(async () => {pointer(heart,'pointerdown');pointer(window,'pointermove',90,301);pointer(window,'pointerup',90,301);click(heart);});
    await wait(370); assert.equal(view.launches,0); assert.equal(view.phone.querySelector('[data-sticker-effect]'),null);
    await act(async () => pointer(heart,'pointerdown'));
    await wait(360); assert.ok(view.phone.querySelector('[data-sticker-effect]'));
    await act(async () => {pointer(window,'pointercancel');click(heart);});
    assert.equal(view.phone.querySelector('[data-sticker-effect]'),null);
    const count=view.launches;await wait(170);assert.equal(view.launches,count);
  } finally {await view.close();}
});

test('swiping a locked sticker does not open its unlock card',async () => {
  const view = await mount({friendCount:2});
  try {
    const beer=view.host.querySelector('[aria-label="解锁 Cheers!"]')!;
    await act(async () => {pointer(beer,'pointerdown');pointer(window,'pointermove',90,301);pointer(window,'pointerup',90,301);click(beer);});
    assert.ok(!view.phone.querySelector('[aria-label="解锁贴纸"]'),'swiping must not open the unlock card');
    assert.equal(view.launches,0);
    await act(async () => {pointer(beer,'pointerdown');pointer(window,'pointerup');click(beer);});
    assert.ok(view.phone.querySelector('[aria-label="解锁贴纸"]'));
  } finally {await view.close();}
});

test('beer fills the phone before a contained shake and burst',async t => {
  let now=10_000;
  t.mock.method(Date,'now',()=>now);
  const view = await mount();
  try {
    await act(async () => pointer(view.host.querySelector('[aria-label="发送 Cheers!"]')!,'pointerdown'));
    await wait(380);
    now=10_120;await wait(70);
    const liquid=view.phone.querySelector('[data-sticker-effect="beer"] .sticker-charge-liquid') as HTMLElement;
    assert.ok(liquid);assert.ok(parseFloat(liquid.style.height)>0);
    now=12_500;await wait(70);
    assert.ok(view.phone.querySelector('[data-sticker-phase="full"]'));assert.ok(view.phone.classList.contains('stellar-screen-jolt'));
    now=12_850;await wait(70);
    assert.ok(view.phone.querySelector('[data-sticker-phase="burst"]'));
    await act(async () => pointer(window,'pointercancel'));
    assert.equal(view.phone.querySelector('[data-sticker-effect]'),null);
    assert.ok(!view.phone.classList.contains('stellar-screen-jolt'));
  } finally {await view.close();}
});

test('message appearance updates the entry and is passed when opening the free chat',async () => {
  const opened:MessageAppearance[]=[];
  const view = await mount({onOpenCanvasChat:(appearance:MessageAppearance)=>opened.push(appearance)});
  try {
    assert.ok(view.host.querySelector('.floating-message-entry.style-stellar'),'a new map entry defaults to the Stellar gradient appearance');
    assert.equal(localStorage.getItem('stellar_message_appearance'),null,'the local entry default must not replace the global saved preference');
    assert.equal(view.host.querySelector('input[aria-label="地图消息"]'),null,'message entry must open the canvas instead of editing inline');
    const appearanceButton=view.host.querySelector('[aria-label="选择地图消息样式"]')!;assert.ok(appearanceButton);
    await act(async () => click(appearanceButton));
    await act(async () => click(document.querySelector('[aria-label="钴蓝珐琅"]')!));
    await act(async () => click(document.querySelector('[aria-label="左对齐"]')!));
    await act(async () => click(document.querySelector('[aria-label="完成样式选择"]')!));
    const entry=view.host.querySelector('[aria-label="进入自由聊天画布"]')!;
    assert.ok(entry.className.includes('style-cobalt'));assert.equal((entry as HTMLElement).style.textAlign,'left');
    await act(async () => click(entry));
    assert.deepEqual(opened,[{id:'cobalt',alignment:'left'}]);
    assert.equal(view.host.querySelector('[aria-label="选择地图消息样式"]')?.closest('.bump-friend-action-strip') !== null,true);
  } finally {await view.close();}
});

test('knock gives contained feedback without opening another card',async () => {
  const view = await mount();
  try {
    await act(async () => click(view.host.querySelector('[aria-label="敲门"]')!));
    assert.equal(view.knocks,1);assert.ok(view.phone.querySelector('[data-knock-effect]'));assert.ok(view.host.querySelector('[aria-label="好友互动卡片"]'));
    assert.equal(view.phone.querySelector('[role="dialog"]'),null);
    await wait(980);assert.equal(view.phone.querySelector('[data-knock-effect]'),null);
  } finally {await view.close();}
});

test('closing an active charge stops launches; reduced motion uses a static progress label',async () => {
  const view=await mount();
  await act(async()=>pointer(view.host.querySelector('[aria-label="发送 爱心"]')!,'pointerdown'));
  await wait(360);assert.ok(view.phone.querySelector('[data-sticker-effect]'));
  await view.close();const count=view.launches;await wait(180);assert.equal(view.launches,count);
  const descriptor=Object.getOwnPropertyDescriptor(window,'matchMedia');
  Object.defineProperty(window,'matchMedia',{configurable:true,value:()=>({matches:true,addEventListener(){},removeEventListener(){}})});
  const {StickerChargeEffect}=await import('../src/components/chat/StickerChargeEffect');
  const phone=document.createElement('div');document.body.appendChild(phone);const root=createRoot(phone);
  try {
    await act(async()=>root.render(<StickerChargeEffect charge={{id:'beer',emoji:'🍺',label:'Cheers!',progress:1,phase:'full'}} knock={0} scope={phone}/>));
    assert.ok(phone.querySelector('.sticker-charge-reduced'));assert.equal(phone.querySelector('.sticker-charge-liquid'),null);assert.ok(!phone.classList.contains('stellar-screen-jolt'));
  } finally {await act(async()=>root.unmount());phone.remove();if(descriptor)Object.defineProperty(window,'matchMedia',descriptor);else delete(window as any).matchMedia;}
});
