import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import React, { act } from 'react';
import type { ChatMessage } from '../src/types';

const dom = new Window({ url: 'http://localhost:4173' });
for (const key of ['window','document','navigator','HTMLElement','Element','Node','PointerEvent','MouseEvent','KeyboardEvent','Event','localStorage','getComputedStyle','ResizeObserver']) {
  Object.defineProperty(globalThis, key, {value:key === 'getComputedStyle' ? dom.getComputedStyle.bind(dom) : dom[key],configurable:true});
}
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
const { createRoot } = await import('react-dom/client');
const { FreeFormChatCanvas } = await import('../src/components/chat/FreeFormChatCanvas');
const message: ChatMessage = {id:'own',senderId:'me',text:'周末咖啡见',isMe:true,timestamp:'12:00',type:'text',textStyle:{id:'rainbow',alignment:'left'}};
const neighbour: ChatMessage = {...message,id:'neighbour',senderId:'friend',isMe:false,text:'好呀'};
const conversation = {id:'chat-v4-test',friendId:'friend',friendName:'好友',avatar:'',lastMessage:'',time:'',unreadCount:0,messages:[message,neighbour]};
const key = `stellar_chat_layout_${conversation.id}`;
const initial = {x:24,y:80,w:150,h:60,scale:1.3,rotation:24,flipX:true,z:4};
const other = {x:16,y:260,w:116,h:56,scale:1,rotation:0};
const migratedInitial = {...initial,w:200,widthVersion:2};
const migratedOther = {...other,w:116 * 4 / 3,widthVersion:2};
const pointer = (target: EventTarget, type: string, x: number, y: number) => target.dispatchEvent(new dom.PointerEvent(type,{bubbles:true,clientX:x,clientY:y,pointerId:1,button:0}) as unknown as Event);
const click = (target: EventTarget) => target.dispatchEvent(new dom.MouseEvent('click',{bubbles:true}) as unknown as Event);
const saved = () => JSON.parse(localStorage.getItem(key)!);

async function mount() {
  localStorage.clear(); localStorage.setItem(key,JSON.stringify({own:initial,neighbour:other}));
  const host = document.createElement('div'); document.body.appendChild(host); const root = createRoot(host);
  const deleted: string[] = []; const copies: ChatMessage[] = [];
  const Harness = () => {
    const [messages,setMessages] = React.useState([message,neighbour]);
    return <FreeFormChatCanvas conversation={conversation} messages={messages} onShowToast={() => {}} onDeleteMessage={id => {deleted.push(id);setMessages(current => current.filter(item => item.id !== id));}} onDuplicateMessage={msg => {const id=`duplicate-${copies.length}`;copies.push(msg);setMessages(current => [...current,{...msg,id}]);return id;}} />;
  };
  await act(async () => root.render(<Harness />));
  const bubble = () => host.querySelector('[data-message-id="own"]')!;
  await act(async () => {pointer(bubble(),'pointerdown',100,100);pointer(window,'pointerup',100,100);});
  return {host,root,bubble,deleted,copies,unmount:async () => {await act(async () => root.unmount());host.remove();}};
}

test('repeat creates an independent message with the original style and transform; flip changes only the selected message', async () => {
  const view = await mount();
  try {
    assert.ok(view.host.querySelector('[aria-label="复制消息"]'));
    assert.equal(view.host.querySelector('[aria-label="删除消息"]'),null,'secondary actions belong behind More');
    await act(async () => click(view.host.querySelector('[aria-label="重复消息"]')!));
    assert.equal(view.copies.length,1); assert.deepEqual(view.copies[0].textStyle,message.textStyle);
    assert.ok(view.host.querySelector('[data-message-id="duplicate-0"]'));
    const copy = saved()['duplicate-0'];
    for (const name of ['w','h','scale','rotation','flipX']) assert.equal(copy[name],migratedInitial[name],name);
    assert.equal(copy.widthVersion,2,'legacy width expansion must be marked before repeating');
    assert.notDeepEqual({x:copy.x,y:copy.y},{x:initial.x,y:initial.y},'a small offset keeps the duplicate selectable');
    await act(async () => click(view.host.querySelector('[aria-label="翻转消息"]')!));
    assert.equal(saved()['duplicate-0'].flipX,false); assert.equal(saved().own.flipX,true);
    assert.deepEqual(saved().neighbour,migratedOther);
  } finally {await view.unmount();}
});

test('Copy writes the selected message into the actual clipboard API', async () => {
  const view = await mount(); const descriptor = Object.getOwnPropertyDescriptor(navigator,'clipboard');
  const copied: string[] = [];
  Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async (text:string) => copied.push(text)}});
  try {
    await act(async () => click(view.host.querySelector('[aria-label="复制消息"]')!));
    assert.deepEqual(copied,[message.text]);
  } finally {
    if (descriptor) Object.defineProperty(navigator,'clipboard',descriptor); else delete (navigator as any).clipboard;
    await view.unmount();
  }
});

test('vertical precision controls commit a scale and rotation without reflow; cancelling restores the prior transform', async () => {
  const view = await mount();
  try {
    const scale = view.host.querySelector('[aria-label="精细缩放"]')!;
    assert.ok(scale);
    await act(async () => pointer(scale,'pointerdown',330,200));
    await act(async () => pointer(window,'pointermove',330,170));
    await act(async () => pointer(window,'pointerup',330,170));
    assert.ok(saved().own.scale > initial.scale); assert.deepEqual(saved().neighbour,migratedOther);
    const rotate = view.host.querySelector('[aria-label="精细旋转"]')!;
    await act(async () => pointer(rotate,'pointerdown',330,200));
    await act(async () => pointer(window,'pointermove',330,185));
    await act(async () => pointer(window,'pointerup',330,185));
    assert.equal(saved().own.rotation,39);
    const before = saved();
    await act(async () => pointer(rotate,'pointerdown',330,200));
    await act(async () => pointer(window,'pointermove',330,160));
    await act(async () => pointer(window,'pointercancel',330,160));
    assert.deepEqual(saved(),before);
  } finally {await view.unmount();}
});

test('drag hides tools and deletes only on a release in the drop zone; leaving or cancelling never deletes', async () => {
  const view = await mount();
  const trashBounds = {left:120,right:250,top:440,bottom:500,width:130,height:60,x:120,y:440,toJSON:() => ({})};
  const begin = async () => {
    await act(async () => pointer(view.bubble(),'pointerdown',100,100));
    await act(async () => pointer(window,'pointermove',185,470));
    const trash = view.host.querySelector('[aria-label="拖到这里删除消息"]')!;
    assert.ok(trash); (trash as HTMLElement).getBoundingClientRect = () => trashBounds as DOMRect;
    assert.equal(view.host.querySelector('[aria-label="重复消息"]'),null);
    await act(async () => pointer(window,'pointermove',185,470));
  };
  try {
    await begin();
    await act(async () => pointer(window,'pointerup',300,380));
    assert.equal(view.deleted.length,0,'release outside must override the previous hover inside');
    const neighbourPosition = saved().neighbour;
    await begin();
    await act(async () => pointer(window,'pointercancel',185,470));
    assert.equal(view.deleted.length,0); assert.deepEqual(saved().neighbour,neighbourPosition);
    await begin();
    await act(async () => pointer(window,'pointermove',300,380));
    await act(async () => pointer(window,'pointerup',185,470));
    assert.deepEqual(view.deleted,['own'],'release inside determines deletion even if the last move was outside');
  } finally {await view.unmount();}
});
