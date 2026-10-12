import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { Window } from 'happy-dom';
import React, { act } from 'react';
import { reactionMap, toggleReaction, visibleChatMessages } from '../src/components/chat/chatMessages';
import { MESSAGE_STYLES } from '../src/components/chat/messageStyles';
import type { ChatMessage } from '../src/types';

const dom = new Window({ url: 'http://localhost:4173' });
for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'HTMLTextAreaElement', 'SVGElement', 'Element', 'Node', 'PointerEvent', 'MouseEvent', 'KeyboardEvent', 'Event', 'CustomEvent', 'localStorage', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame', 'ResizeObserver']) {
  Object.defineProperty(globalThis, key, { value: typeof dom[key] === 'function' && ['getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame'].includes(key) ? dom[key].bind(dom) : dom[key], configurable: true });
}
// The DOM harness checks interactions; Motion uses its JS fallback instead of Happy DOM's incomplete WAAPI implementation.
Object.defineProperty(dom.HTMLElement.prototype, 'animate', {value:undefined,configurable:true});
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
const { createRoot } = await import('react-dom/client');
const { FreeFormChatCanvas, arrangeMessages } = await import('../src/components/chat/FreeFormChatCanvas');
const { MessageStylePicker } = await import('../src/components/chat/MessageStylePicker');
const message = { id: 'own', senderId: 'me', text: '明天咖啡见', isMe: true, timestamp: '12:00', type: 'text' as const };
const friendMessage = { ...message, id: 'incoming', senderId: 'friend', isMe: false };
const conversation = { id: 'chat-modes-test', friendId: 'friend', friendName: '好友', avatar: '/bump/stickers.png', lastMessage: '', time: '', unreadCount: 0, messages: [message, friendMessage] };
const click = (target: EventTarget, type = 'click') => target.dispatchEvent(new dom.MouseEvent(type, { bubbles: true }) as unknown as Event);
const pointer = (target: EventTarget, type: string, x: number, y: number) => target.dispatchEvent(new dom.PointerEvent(type, { bubbles: true, clientX: x, clientY: y, pointerId: 1, button: 0 }) as unknown as Event);

test('source reactions survive empty local state and a cancelled reaction preserves other users', () => {
  const source = { ...message, reactions: [{ emoji: '👍', count: 4, hasReacted: true }, { emoji: '🔥', count: 2, hasReacted: false }] };
  const next = toggleReaction(reactionMap(source), '👍');
  assert.equal(next['👍'].count, 3);
  assert.equal(next['👍'].hasReacted, false);
  assert.equal(next['🔥'].count, 2);
  const visible = visibleChatMessages([source], [], {own:'旧本地文字'}, [], {}, true);
  assert.equal(visible[0].text, message.text, 'controlled canvas must read the current source text when the parent owns mutations');
  assert.deepEqual(visible[0].reactions, source.reactions);
  const standalone = visibleChatMessages([source], [], {}, [], { own: next });
  assert.equal(standalone[0].reactions?.find(item => item.emoji === '👍')?.count, 3, 'standalone chat must also apply local reaction changes to existing source reactions');
  assert.equal(visibleChatMessages([source], ['own'], {}, [], {}).length, 0);
});

test('free chat is denser without making multiline content too short', () => {
  const layout = arrangeMessages([message], {}, 370).own;
  assert.ok(layout.h < 70);
  const long = arrangeMessages([{...message, text:'今天一起去咖啡厅读书，然后散步回家。'.repeat(12)}], {}, 370).own;
  assert.ok(long.h > layout.h * 3);
  assert.equal(new Set(MESSAGE_STYLES.map(style => style[0])).size, MESSAGE_STYLES.length);
  for (const id of ['pixel-sky', 'pixel-peach', 'pixel-mint']) assert.ok(MESSAGE_STYLES.some(style => style[0] === id), `pixel combination ${id} remains selectable`);
});

test('legacy canvas widths grow by one third once while saved positions and transforms remain stable', () => {
  const saved = {own:{x:24,y:60,w:150,h:60,scale:1.3,rotation:18,flipX:true}};
  const migrated = arrangeMessages([message], saved, 370).own;
  assert.equal(migrated.w,200);
  assert.equal(migrated.widthVersion,2);
  for (const key of ['x','y','scale','rotation','flipX']) assert.equal(migrated[key],saved.own[key],key);
  assert.deepEqual(arrangeMessages([message],{own:migrated},370).own,migrated,'reopening or receiving another render must not expand the width again');
});

test('canvas double tap likes with thumbs up; edit and delete act on the same message id', async () => {
  localStorage.clear();
  const host = document.createElement('div'); document.body.appendChild(host);
  const root = createRoot(host);
  const calls: string[] = [];
  try {
    await act(async () => root.render(<FreeFormChatCanvas conversation={conversation} messages={[message]} onAddReaction={(id, emoji) => calls.push(`${id}:${emoji}`)} onEditMessage={msg => calls.push(`edit:${msg.id}`)} onDeleteMessage={id => calls.push(`delete:${id}`)} onShowToast={() => {}} />));
    const bubble = host.querySelector('[data-message-id="own"]')!;
    await act(async () => click(bubble, 'dblclick'));
    assert.deepEqual(calls, ['own:👍']);
    await act(async () => click(bubble));
    await act(async () => click(host.querySelector('[aria-label="更多消息操作"]')!));
    await act(async () => click(host.querySelector('[aria-label="编辑消息"]')!));
    assert.ok(calls.includes('edit:own'));
    await act(async () => click(bubble));
    await act(async () => click(host.querySelector('[aria-label="更多消息操作"]')!));
    await act(async () => click(host.querySelector('[aria-label="删除消息"]')!));
    assert.ok(calls.includes('delete:own'));
  } finally { await act(async () => root.unmount()); host.remove(); }
});

test('incoming canvas messages swipe to reply and cancelled gestures do not reply', async () => {
  const host = document.createElement('div'); document.body.appendChild(host);
  const root = createRoot(host);
  let replies = 0;
  try {
    await act(async () => root.render(<FreeFormChatCanvas conversation={conversation} messages={[friendMessage]} onQuotedReply={() => { replies++; }} onShowToast={() => {}} />));
    const bubble = host.querySelector('[data-message-id="incoming"]')!;
    await act(async () => pointer(bubble, 'pointerdown', 20, 80));
    await act(async () => pointer(window, 'pointermove', 90, 80));
    await act(async () => pointer(window, 'pointerup', 90, 80));
    assert.equal(replies, 1);
    await act(async () => pointer(bubble, 'pointerdown', 20, 80));
    await act(async () => pointer(window, 'pointermove', 90, 80));
    await act(async () => pointer(window, 'pointercancel', 90, 80));
    assert.equal(replies, 1);
  } finally { await act(async () => root.unmount()); host.remove(); }
});

test('style canvas pans without selecting a dragged card; a subsequent tap chooses it', async () => {
  const host = document.createElement('div'); document.body.appendChild(host);
  const root = createRoot(host);
  const choices: string[] = [];
  try {
    await act(async () => root.render(<MessageStylePicker appearance={{id:'lime',alignment:'center'}} onChange={value => choices.push(value.id)} onClose={() => {}} />));
    const surface = document.querySelector('[aria-label="平移消息样式画布"]')!;
    assert.ok(surface);
    const card = document.querySelector('[aria-label="极光玻璃"]')!;
    await act(async () => pointer(card, 'pointerdown', 240, 180));
    await act(async () => pointer(window, 'pointermove', 140, 140));
    await act(async () => pointer(window, 'pointerup', 140, 140));
    await act(async () => click(card));
    assert.equal(choices.length, 0);
    await act(async () => pointer(card, 'pointerdown', 140, 140));
    await act(async () => pointer(window, 'pointerup', 140, 140));
    await act(async () => click(card));
    assert.deepEqual(choices, ['aurora']);
  } finally { await act(async () => root.unmount()); host.remove(); }
});

test('single free canvas ignores legacy timeline preference and keeps reactions, edits, deletion, sending and recall in the controlled source', async () => {
  const cssHook = registerHooks({ resolve(specifier, context, nextResolve) { return specifier.endsWith('.css') ? { url:'data:text/javascript,export default {};', shortCircuit:true } : nextResolve(specifier,context); } });
  const { ChatView } = await import('../src/components/ChatView');
  cssHook.deregister();
  localStorage.clear();
  localStorage.setItem('stellar_chat_canvas_modes', JSON.stringify({[conversation.id]:'timeline'}));
  const host = document.createElement('div'); document.body.appendChild(host);
  const root = createRoot(host);
  let source: ChatMessage[] = [message];
  const Harness = () => {
    const [messages, setMessages] = React.useState<ChatMessage[]>([message]);
    source = messages;
    return <ChatView conversations={[{...conversation, messages}]} activeChatId={conversation.id} onSelectChat={() => {}} onSendMessage={(_conversationId,text,options,quote) => setMessages(current => [...current, {...message,id:`sent-${current.length}`,text,...options,quotedMessage:quote}])} onUpdateMessage={(_conversationId, id, updates) => setMessages(current => current.map(item => item.id === id ? {...item,...updates} : item))} onDeleteMessage={(_conversationId,id) => setMessages(current => current.filter(item => item.id !== id))} />;
  };
  try {
    await act(async () => root.render(<Harness />));
    assert.ok(host.querySelector('[data-free-canvas="true"]'));
    assert.equal(host.querySelector('.stellar-timeline-text'), null);
    assert.equal(host.querySelector('[title="经典时间线流"]'), null);
    const bubble = host.querySelector('[data-message-id="own"]')!;
    assert.ok(bubble);
    await act(async () => click(bubble, 'dblclick'));
    assert.equal((source[0] as any).reactions?.[0].emoji, '👍');
    assert.equal(bubble.querySelector('[aria-pressed="true"]')?.getAttribute('aria-label'), '取消 👍 反应');
    await act(async () => click(bubble));
    await act(async () => click(host.querySelector('[aria-label="更多消息操作"]')!));
    await act(async () => click(host.querySelector('[aria-label="编辑消息"]')!));
    const input = host.querySelector('textarea')!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(dom.HTMLTextAreaElement.prototype, 'value')!.set!.call(input, '下周咖啡见');
      input.dispatchEvent(new dom.Event('input', {bubbles:true}) as unknown as Event);
    });
    await act(async () => input.dispatchEvent(new dom.KeyboardEvent('keydown', {key:'Enter',bubbles:true}) as unknown as Event));
    assert.equal(source[0].text, '下周咖啡见');
    assert.equal(host.querySelector('[data-message-id="own"] .bump-canvas-text')?.textContent, '下周咖啡见');
    await act(async () => click(host.querySelector('[data-message-id="own"]')!));
    await act(async () => click(host.querySelector('[aria-label="更多消息操作"]')!));
    await act(async () => click(host.querySelector('[aria-label="删除消息"]')!));
    assert.equal(source.length, 0);
    assert.equal(host.querySelector('[data-message-id="own"]'), null);
    const nextInput = host.querySelector('textarea')!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(dom.HTMLTextAreaElement.prototype, 'value')!.set!.call(nextInput, '新的消息');
      nextInput.dispatchEvent(new dom.Event('input', {bubbles:true}) as unknown as Event);
    });
    await act(async () => nextInput.dispatchEvent(new dom.KeyboardEvent('keydown', {key:'Enter',bubbles:true}) as unknown as Event));
    assert.equal(source[0].text, '新的消息');
    const sentBubble = host.querySelector('[data-message-id="sent-0"]')!;
    assert.ok(sentBubble.textContent?.includes('新的消息'));
    await act(async () => pointer(sentBubble, 'pointerdown', 20, 80));
    await act(async () => pointer(window, 'pointermove', 90, 80));
    await act(async () => pointer(window, 'pointerup', 90, 80));
    await act(async () => click(host.querySelector('#toggle-emoji-drawer-btn')!));
    assert.equal(host.querySelectorAll('.stellar-chat-stickers button').length >= 6, true);
    await act(async () => click(host.querySelector('[aria-label="发送 小宇宙"]')!));
    assert.equal(source[1].emojiData?.emoji, '🪐');
    assert.equal(source[1].quotedMessage?.id, 'sent-0', 'original sticker sends must retain the reply selected on the free canvas');
    assert.ok(host.querySelector('[data-message-id="sent-0"] .bump-canvas-text')?.textContent?.includes('新的消息'));
    assert.ok(host.querySelector('[data-message-id="sent-1"] .bump-quote')?.textContent?.includes('新的消息'));
    assert.ok(host.querySelector('[data-message-id="sent-1"] [style*="stellar-reactions.png"]'), 'canvas replies retain original sticker artwork');
    await act(async () => host.querySelector('[data-message-id="sent-0"]')!.dispatchEvent(new dom.KeyboardEvent('keydown', {key:'Enter',bubbles:true}) as unknown as Event));
    await act(async () => click(host.querySelector('[aria-label="撤回消息"]')!));
    assert.equal(source[0].isRecalled, true);
    assert.equal(source[0].type, 'recalled');
    assert.equal(source[0].text, '你撤回了一条消息');
    assert.ok(host.querySelector('[data-message-id="sent-0"] .bump-recalled-bubble'));
    assert.equal(host.querySelector('[data-message-id="sent-0"] .bump-canvas-text'), null);
  } finally { await act(async () => root.unmount()); host.remove(); }
});

test('map composer applies the chosen style in the single canvas while legacy timeline preference cannot restore old UI', async () => {
  const cssHook = registerHooks({ resolve(specifier, context, nextResolve) { return specifier.endsWith('.css') ? { url:'data:text/javascript,export default {};', shortCircuit:true } : nextResolve(specifier,context); } });
  const { ChatView } = await import('../src/components/ChatView');
  cssHook.deregister();
  localStorage.clear();
  localStorage.setItem('stellar_chat_canvas_modes', JSON.stringify({[conversation.id]:'timeline'}));
  const host = document.createElement('div'); document.body.appendChild(host);
  const root = createRoot(host);
  const appearance = { id:'aurora', alignment:'left' as const };
  try {
    await act(async () => root.render(<ChatView conversations={[conversation]} activeChatId={conversation.id} onSelectChat={() => {}} onSendMessage={() => {}} canvasEntry={{friendId:conversation.friendId,appearance,key:1}} />));
    assert.ok(host.querySelector('[data-message-id="own"]'));
    assert.equal(host.querySelector('.stellar-timeline-text'), null);
    assert.ok(host.querySelector('.bump-message-style.style-aurora textarea'));
    assert.deepEqual(JSON.parse(localStorage.getItem('stellar_message_appearance')!), appearance);
    assert.ok(host.querySelector('[data-free-canvas="true"]'));
    assert.equal(host.querySelector('[title="经典时间线流"]'), null);
    assert.equal(host.querySelector('[title="自由拖动与缩放画布"]'), null);
    assert.ok(host.querySelector('[data-message-id="own"] .style-lime'), 'composer appearance must not restyle earlier messages');
  } finally { await act(async () => root.unmount()); host.remove(); }
});

test('repeat in ChatView keeps the source style, quote and transform while the next composition uses its own style', async () => {
  const { ChatView } = await import('../src/components/ChatView');
  localStorage.clear();
  localStorage.setItem('stellar_message_appearance',JSON.stringify({id:'aurora',alignment:'right'}));
  const layout = {x:24,y:60,w:160,h:60,scale:1.4,rotation:18,flipX:true};
  localStorage.setItem(`stellar_chat_layout_${conversation.id}`,JSON.stringify({own:layout}));
  const original: ChatMessage = {...message,quotedMessage:{id:'quote',senderName:'好友',text:'先约个时间'}};
  const host = document.createElement('div'); document.body.appendChild(host); const root = createRoot(host);
  let source: ChatMessage[] = []; let sequence = 0;
  const Harness = () => {
    const [messages,setMessages] = React.useState([original]); source = messages;
    return <ChatView conversations={[{...conversation,messages}]} activeChatId={conversation.id} onSelectChat={() => {}} onSendMessage={(_id,text,options,quotedMessage) => {
      const id = `repeat-send-${sequence++}`;
      setMessages(current => [...current,{...message,id,text,...options,quotedMessage}]); return id;
    }} />;
  };
  try {
    await act(async () => root.render(<Harness />));
    await act(async () => click(host.querySelector('[data-message-id="own"]')!));
    await act(async () => click(host.querySelector('[aria-label="重复消息"]')!));
    assert.equal(source.length,2); assert.equal(source[1].id,'repeat-send-0');
    assert.deepEqual(source[1].textStyle,{id:'lime',alignment:'center'},'old unstyled messages must keep their displayed frame');
    assert.deepEqual(source[1].quotedMessage,original.quotedMessage);
    const copy = JSON.parse(localStorage.getItem(`stellar_chat_layout_${conversation.id}`)!)['repeat-send-0'];
    assert.equal(copy.scale,layout.scale); assert.equal(copy.rotation,layout.rotation); assert.equal(copy.flipX,true);
    const input = host.querySelector('textarea')!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(dom.HTMLTextAreaElement.prototype,'value')!.set!.call(input,'下一条有自己的外观');
      input.dispatchEvent(new dom.Event('input',{bubbles:true}) as unknown as Event);
    });
    await act(async () => input.dispatchEvent(new dom.KeyboardEvent('keydown',{key:'Enter',bubbles:true}) as unknown as Event));
    assert.deepEqual(source[2].textStyle,{id:'aurora',alignment:'right'});
    assert.ok((host.querySelector('[data-message-id="repeat-send-1"]') as HTMLElement).style.transform.includes('scale(1)'));
    assert.equal(host.querySelectorAll('[data-message-id]').length,3,'duplicates and subsequent compositions remain in the shared canvas source');
    assert.equal(host.querySelector('[title="经典时间线流"]'), null);
  } finally {await act(async () => root.unmount());host.remove();}
});

test('chat drawer drag changes its height and cancellation restores it; categories and rich media remain usable', async () => {
  const { ChatView } = await import('../src/components/ChatView');
  localStorage.clear();
  const host = document.createElement('div'); document.body.appendChild(host); const root = createRoot(host);
  try {
    await act(async () => root.render(<ChatView conversations={[conversation]} activeChatId={conversation.id} onSelectChat={() => {}} onSendMessage={() => {}} />));
    await act(async () => click(host.querySelector('#toggle-emoji-drawer-btn')!));
    const drawer = () => host.querySelector('.stellar-chat-drawer') as HTMLElement;
    const handle = () => host.querySelector('[aria-label="调整聊天面板高度"]')!;
    assert.equal(drawer().style.height,'300px');
    await act(async () => pointer(handle(),'pointerdown',200,400));
    await act(async () => pointer(window,'pointermove',200,330));
    await act(async () => pointer(window,'pointerup',200,330));
    assert.equal(drawer().style.height,'370px');
    await act(async () => pointer(handle(),'pointerdown',200,400));
    await act(async () => pointer(window,'pointermove',200,470));
    assert.equal(drawer().style.height,'300px');
    await act(async () => pointer(window,'pointercancel',200,470));
    assert.equal(drawer().style.height,'370px');
    await act(async () => click(host.querySelector('[title="打开贴纸"]')!));
    assert.ok(host.textContent?.includes('潮流立体表情贴纸'));
    await act(async () => click(host.querySelector('#toggle-more-drawer-btn')!));
    assert.equal(drawer().style.height,'370px');
    assert.ok(host.querySelector('#chat-extension-tools-drawer')); assert.ok(host.querySelector('#ext-tool-photos'));
    await act(async () => pointer(handle(),'pointerdown',200,400));
    await act(async () => pointer(window,'pointermove',200,800));
    await act(async () => pointer(window,'pointerup',200,800));
    assert.equal(drawer().style.height,'160px','a compact drawer stays scrollable instead of cropping controls');
  } finally {await act(async () => root.unmount());host.remove();}
});

test('free chat returns only after a left-edge right swipe, without stealing message gestures or cancelled drags', async () => {
  const { ChatView } = await import('../src/components/ChatView');
  localStorage.clear();
  const host = document.createElement('div'); document.body.appendChild(host); const root = createRoot(host);
  const destinations: Array<string | null> = [];
  try {
    await act(async () => root.render(<ChatView conversations={[conversation]} activeChatId={conversation.id} onSelectChat={id => destinations.push(id)} onSendMessage={() => {}} />));
    const surface = host.querySelector('.bump-canvas-surface')!;
    const swipe = async (target: Element, x: number, end: string = 'pointerup') => {
      await act(async () => pointer(target,'pointerdown',x,160));
      await act(async () => pointer(target,'pointermove',x+130,165));
      await act(async () => pointer(target,end,x+130,165));
    };
    await swipe(surface,80); assert.deepEqual(destinations,[],'interior right swipes are not back gestures');
    await swipe(surface,10,'pointercancel'); assert.deepEqual(destinations,[]);
    await swipe(host.querySelector('[data-message-id="incoming"]')!,10); assert.deepEqual(destinations,[],'replying to a bubble must never navigate away');
    await swipe(surface,10); assert.deepEqual(destinations,[null]);
  } finally {await act(async () => root.unmount());host.remove();}
});
