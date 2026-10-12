import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import React, { act } from 'react';

const dom = new Window({ url: 'http://localhost:4173' });
for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'Element', 'Node', 'PointerEvent', 'MouseEvent', 'Event', 'CustomEvent', 'localStorage', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame', 'ResizeObserver']) {
  Object.defineProperty(globalThis, key, { value: typeof dom[key] === 'function' && ['getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame'].includes(key) ? dom[key].bind(dom) : dom[key], configurable: true });
}
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
const { createRoot } = await import('react-dom/client');
const { FreeFormChatCanvas } = await import('../src/components/chat/FreeFormChatCanvas');
const msg = { id: 'own', senderId: 'me', text: 'hello', isMe: true, timestamp: '12:00', type: 'text' as const };
const conversation = { id: 'gesture-test', friendId: 'friend', friendName: '好友', avatar: '', lastMessage: '', time: '', unreadCount: 0, messages: [msg] };
const initial = { x: 20, y: 80, w: 160, h: 70, scale: 1, rotation: 0, widthVersion: 2 };
const saved = () => JSON.parse(localStorage.getItem('stellar_chat_layout_gesture-test') || '{}').own;
const pointer = (target: EventTarget, type: string, x: number, y: number) => target.dispatchEvent(new dom.PointerEvent(type, { bubbles: true, clientX: x, clientY: y, pointerId: 1, button: 0 }) as unknown as Event);

async function mount() {
  localStorage.clear();
  localStorage.setItem('stellar_chat_mode_gesture-test', 'free');
  localStorage.setItem('stellar_chat_layout_gesture-test', JSON.stringify({ own: initial }));
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => root.render(<FreeFormChatCanvas conversation={conversation} messages={[msg]} onShowToast={() => {}} />));
  const bubble = () => host.querySelector('[data-message-id="own"]') || [...host.querySelectorAll('div')].find(el => el.className.includes?.('absolute group'));
  await act(async () => { pointer(bubble()!, 'pointerdown', 100, 100); pointer(window, 'pointerup', 100, 100); });
  return { host, root, bubble, unmount: async () => { await act(async () => root.unmount()); host.remove(); } };
}

test('resize commits its final size and keyboard undo/redo preserves native editing', async () => {
  const view = await mount();
  const resize = view.host.querySelector('[aria-label="缩放消息"]') || view.host.querySelector('[title^="按住拖拽缩放"]');
  assert.ok(resize, 'selected message must expose a resize handle');
  await act(async () => pointer(resize, 'pointerdown', 180, 150));
  await act(async () => pointer(window, 'pointermove', 260, 220));
  await act(async () => pointer(window, 'pointerup', 260, 220));
  assert.ok(saved().scale > 1 || saved().w > initial.w, 'pointerup must not revert the resize');
  const resized = saved();
  for (const modifier of ['metaKey','ctrlKey']) {
    const undo = new dom.KeyboardEvent('keydown',{bubbles:true,cancelable:true,key:'z',[modifier]:true});
    await act(async()=>view.bubble()!.dispatchEvent(undo as unknown as Event));
    assert.equal(undo.defaultPrevented,true,'canvas undo must consume the shortcut');
    assert.equal(saved().w,initial.w);
    assert.equal(saved().scale ?? 1,1);
    const redo = new dom.KeyboardEvent('keydown',{bubbles:true,cancelable:true,key:'Z',shiftKey:true,[modifier]:true});
    await act(async()=>view.bubble()!.dispatchEvent(redo as unknown as Event));
    assert.equal(redo.defaultPrevented,true);
    assert.deepEqual(saved(),resized,'redo must restore the committed resize');
  }
  for (const tag of ['input','textarea','div']) {
    const editor = document.createElement(tag);
    if (tag==='div') editor.setAttribute('contenteditable','true');
    view.bubble()!.appendChild(editor);
    const target = tag==='div' ? editor.appendChild(document.createElement('span')) : editor;
    for (const modifier of ['metaKey','ctrlKey']) {
      for (const shiftKey of [false,true]) {
        const nativeUndo = new dom.KeyboardEvent('keydown',{bubbles:true,cancelable:true,key:shiftKey?'Z':'z',shiftKey,[modifier]:true});
        await act(async()=>target.dispatchEvent(nativeUndo as unknown as Event));
        assert.equal(nativeUndo.defaultPrevented,false,`${tag} must retain its native undo/redo`);
        assert.deepEqual(saved(),resized,'editing undo must not change the canvas layout');
      }
    }
    editor.remove();
  }
  await view.unmount();
});

test('rotation is saved; pointercancel discards a subsequent change', async () => {
  const view = await mount();
  const rotate = view.host.querySelector('[aria-label="旋转消息"]');
  assert.ok(rotate, 'a selected owned message needs a rotation handle');
  await act(async () => pointer(rotate, 'pointerdown', 100, 55));
  await act(async () => pointer(window, 'pointermove', 160, 115));
  await act(async () => pointer(window, 'pointerup', 160, 115));
  assert.ok(Math.abs(saved().rotation) > 30);
  const before = saved();
  await act(async () => pointer(view.bubble()!, 'pointerdown', 100, 115));
  await act(async () => pointer(window, 'pointermove', 130, 165));
  await act(async () => pointer(window, 'pointercancel', 130, 165));
  assert.deepEqual(saved(), before);
  await view.unmount();
});

test('holding a sticker repeats, release stops it, and a locked sticker never sends', async () => {
  const module = await import('../src/components/BumpFriendDock');
  assert.ok(module, 'map focus must have the Bump interaction dock');
  let hits = 0;
  const host = document.createElement('div'); document.body.appendChild(host);
  const root = createRoot(host);
  const friend = { id: 'f', name: '好友', avatar: '/bump/stickers.png', status: '在家', locationName: '上海', lat: 0, lng: 0, x: 0, y: 0, distance: '1km', battery: 50, lastUpdated: '刚刚', isOnline: true };
  await act(async () => root.render(<module.BumpFriendDock friend={friend} friendCount={2} onLaunch={() => hits++} onOpenChat={() => {}} onCamera={() => {}} onTrajectory={() => {}} onAddFriend={() => {}} onShowToast={() => {}} />));
  const heart = host.querySelector('[aria-label="发送 爱心"]')!;
  await act(async () => pointer(heart, 'pointerdown', 30, 300));
  await act(async () => new Promise(resolve => setTimeout(resolve, 500)));
  assert.ok(hits > 1);
  await act(async () => pointer(window, 'pointerup', 30, 300));
  const released = hits;
  await act(async () => new Promise(resolve => setTimeout(resolve, 180)));
  assert.equal(hits, released);
  const squirrel = host.querySelector('[aria-label="解锁 Acorn lover"]')!;
  await act(async () => pointer(squirrel, 'pointerdown', 30, 300));
  assert.equal(hits, released);
  await act(async () => { pointer(window, 'pointerup', 30, 300); squirrel.dispatchEvent(new dom.MouseEvent('click', { bubbles: true }) as unknown as Event); });
  assert.ok(host.querySelector('[role="dialog"]'));
  await act(async () => root.unmount()); host.remove();
});

test('friend card exposes six ordered actions, navigation compass and no intercom', async () => {
  const { BumpFriendDock } = await import('../src/components/BumpFriendDock');
  const host = document.createElement('div'); document.body.appendChild(host);
  const root = createRoot(host);
  const calls: string[] = [];
  const friend = { id: 'f', name: '好友', avatar: '/bump/stickers.png', status: '在家', locationName: '上海', lat: 0, lng: 0, x: 0, y: 0, distance: '1km', battery: 50, lastUpdated: '刚刚', isOnline: true };
  try {
    await act(async () => root.render(<BumpFriendDock friend={friend} friendCount={2} onLaunch={() => {}} onOpenChat={() => calls.push('chat')} onCamera={() => calls.push('camera')} onTrajectory={() => calls.push('trajectory')} onNavigate={() => calls.push('navigate')} onKnock={() => calls.push('knock')} onProfile={() => calls.push('profile')} onClose={() => calls.push('close')} onGreet={() => calls.push('greet')} onBump={() => calls.push('bump')} onRelationshipChange={relationship=>calls.push(`relation:${relationship}`)} onShowToast={message => calls.push(message)} />));
    assert.ok(!host.textContent?.includes('更多操作'), 'actions must be available without switching to another card');
    for (const [label, action] of [['进入自由聊天画布','chat'],['拍摄 POV','camera'],['敲门','knock'],['好友轨迹','trajectory'],['好友资料','profile'],['打招呼','greet'],['碰一碰','bump'],['关闭好友互动','close']]) {
      const button = host.querySelector(`[aria-label="${label}"]`);
      assert.ok(button, `${label} must be directly accessible`);
      await act(async () => button.dispatchEvent(new dom.MouseEvent('click', { bubbles: true }) as unknown as Event));
      assert.ok(calls.includes(action));
    }
    for (const label of ['私聊','位置提醒','打开好友聊天','去找 TA','我的隐身设置']) assert.equal(host.querySelector(`[aria-label="${label}"]`),null);
    assert.deepEqual([...host.querySelectorAll('.bump-dock-actions button')].map(b=>b.textContent),['打招呼','敲门','碰一碰','轨迹','拍照','资料']);
    assert.equal(host.querySelector('.floating-message-entry')?.textContent,'消息');
    assert.equal(host.querySelector('.bump-dock-identity'),null,'the dock must not repeat the map avatar name');
    assert.ok(host.querySelector('.bump-friend-header [aria-label="关闭好友互动"]'));
    const relationship = host.querySelector('[aria-label="好友关系"]') as HTMLSelectElement;
    assert.ok(relationship);relationship.value='family';
    await act(async()=>relationship.dispatchEvent(new dom.Event('change',{bubbles:true}) as unknown as Event));
    assert.ok(calls.includes('relation:family'),'relationship editing remains available after removing the identity row');
    await act(async () => host.querySelector('.floating-friend-compass')!.dispatchEvent(new dom.MouseEvent('click',{bubbles:true}) as unknown as Event));
    assert.ok(calls.includes('navigate'), 'the compass starts in-map route selection');
    assert.equal(host.querySelectorAll('.floating-compass-ticks line').length,12);
    assert.ok(host.querySelector('.floating-compass-dial strong'));
    assert.equal(host.querySelector('[aria-label="一键对讲"]'),null);
  } finally { await act(async () => root.unmount()); host.remove(); }
});

test('opening a friend has no voice button and never requests microphone access',async()=>{
  const {FriendInteractiveModal}=await import('../src/components/FriendInteractiveModal');
  const host=document.createElement('div');const root=createRoot(host);let requests=0;
  const descriptor=Object.getOwnPropertyDescriptor(navigator,'mediaDevices');
  Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:async()=>{requests++;}}});
  const friend={id:'no-voice',name:'好友',avatar:'',status:'在家',lat:0,lng:0,x:0,y:0,distance:'1km',battery:50,lastUpdated:'刚刚'};
  try {
    await act(async()=>root.render(<FriendInteractiveModal friend={friend} isOpen onClose={()=>{}} onOpenChat={()=>{}} onNavigate={()=>{}} onShowToast={()=>{}}/>));
    assert.equal(host.querySelector('[aria-label="一键对讲"]'),null);assert.equal(requests,0);
  } finally {await act(async()=>root.unmount());if(descriptor)Object.defineProperty(navigator,'mediaDevices',descriptor);else delete (navigator as any).mediaDevices;}
});

test('new messages are placed below persisted bubbles and conversation geometry stays isolated', async () => {
  const view = await mount();
  const second = { ...msg, id: 'second', text: 'new' };
  await act(async () => view.root.render(<FreeFormChatCanvas conversation={conversation} messages={[msg, second]} onShowToast={() => {}} />));
  const nextBubble = view.host.querySelector('[data-message-id="second"]') as HTMLElement;
  assert.ok(parseFloat(nextBubble.style.top) >= initial.y + initial.h + 16);
  const other = { ...conversation, id: 'other-chat' };
  localStorage.setItem('stellar_chat_layout_other-chat', JSON.stringify({ own: { ...initial, x: 44, y: 333 } }));
  await act(async () => view.root.render(<FreeFormChatCanvas conversation={other} messages={[msg]} onShowToast={() => {}} />));
  const otherBubble = view.host.querySelector('[data-message-id="own"]') as HTMLElement;
  assert.equal(parseFloat(otherBubble.style.top), 333);
  assert.equal(saved().y, initial.y);
  await view.unmount();
});

test('calendar opens on the current month and accepts schedules without legacy reminder fields', async () => {
  const { CalendarView } = await import('../src/components/CalendarView');
  const host = document.createElement('div'); document.body.appendChild(host);
  const root = createRoot(host);
  const now = new Date();
  const key = [now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
  const schedule = {id:'modern',type:'general',title:'仅 startAt 的日程',icon:'☕',color:'#1877F2',startAt:`${key}T18:00:00+08:00`,endAt:`${key}T19:00:00+08:00`,allDay:false,timezone:'Asia/Shanghai',location:{name:'咖啡馆',latitude:36.065,longitude:103.832},reminders:[30],mapVisibleAt:'日程当天',keepAsHistory:false,visibilityRule:{scope:'private'},createdAt:'',updatedAt:''};
  try {
    await act(async () => root.render(<CalendarView schedules={[schedule as any]} />));
    assert.ok(host.textContent?.includes(`${now.getFullYear()}年 ${now.getMonth()+1}月`), 'calendar must open on the actual current month');
    assert.ok(host.textContent?.includes('仅 startAt 的日程'), 'today must include schedules created by the current form');
    await act(async () => root.render(<CalendarView schedules={[]} />));
    assert.ok(!host.textContent?.includes('仅 startAt 的日程'), 'removed schedules must not remain in calendar');
  } finally { await act(async () => root.unmount()); host.remove(); }
});
