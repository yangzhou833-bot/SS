import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { Window } from 'happy-dom';
import React, { act } from 'react';
import type { Friend, Schedule } from '../src/types';

const dom = new Window({url:'http://localhost:4173'});
Object.defineProperty(dom.Element.prototype,'animate',{value:undefined,configurable:true});
for (const key of ['window','document','navigator','HTMLElement','HTMLTextAreaElement','SVGElement','Element','Node','PointerEvent','MouseEvent','KeyboardEvent','Event','CustomEvent','localStorage','getComputedStyle','requestAnimationFrame','cancelAnimationFrame','ResizeObserver']) {
  Object.defineProperty(globalThis,key,{value:typeof dom[key] === 'function' && ['getComputedStyle','requestAnimationFrame','cancelAnimationFrame'].includes(key) ? dom[key].bind(dom) : dom[key],configurable:true});
}
(globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;
registerHooks({resolve(specifier,context,nextResolve) {return specifier.endsWith('.css') ? {url:'data:text/javascript,export default {};',shortCircuit:true} : nextResolve(specifier,context);}});
const {createRoot}=await import('react-dom/client');
const {ChatView}=await import('../src/components/ChatView');
const {SearchModal}=await import('../src/components/SearchModal');
const {ScheduleCreationModal}=await import('../src/components/ScheduleCreationModal');
const {ScheduleDetailModal}=await import('../src/components/ScheduleDetailModal');
const {CreateLifePlaceModal}=await import('../src/components/CreateLifePlaceModal');
const {AddFriendModal}=await import('../src/components/AddFriendModal');
const click=async (element:Element) => act(async () => {assert.ok(element);element.dispatchEvent(new dom.MouseEvent('click',{bubbles:true}) as unknown as Event);});
const button=(host:Element,text:string) => [...host.querySelectorAll('button')].find(item => item.textContent?.trim() === text)!;
const fill=async (element:Element,value:string) => act(async () => {
  assert.ok(element);
  const prototype=element.tagName === 'TEXTAREA' ? dom.HTMLTextAreaElement.prototype : dom.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype,'value')!.set!.call(element,value);
  element.dispatchEvent(new dom.Event('input',{bubbles:true}) as unknown as Event);
});
const key=async (element:Element,options:Record<string,unknown>) => act(async () => {element.dispatchEvent(new dom.KeyboardEvent('keydown',{bubbles:true,...options}) as unknown as Event);});
const mount=async (content:React.ReactNode) => {
  const host=document.createElement('div');document.body.appendChild(host);const root=createRoot(host);
  await act(async () => root.render(content));
  return {host,root,cleanup:async () => {await act(async () => root.unmount());host.remove();}};
};
const friend:Friend={id:'sarah',name:'Sarah',avatar:'/avatar.png',status:'在线',locationName:'咖啡馆',lat:36,lng:103,x:50,y:50,distance:'1 km',battery:80,lastUpdated:'刚刚',isOnline:true};
const schedule:Schedule={id:'schedule-delete',type:'general',title:'周末咖啡',icon:'☕',color:'#1877F2',startAt:'2026-10-13 18:00',endAt:'2026-10-13 19:00',allDay:false,timezone:'Asia/Shanghai',location:{name:'咖啡馆',latitude:36,longitude:103},reminders:[30],mapVisibleAt:'立即在地图显示',keepAsHistory:true,visibilityRule:{scope:'private'},createdAt:'2026-10-12',updatedAt:'2026-10-12'};
const draftKey='stellar_schedule_creation_draft_v1';

test('Chinese composition confirmation never sends a chat; plain Enter sends the completed message once',async () => {
  localStorage.clear();
  const sent:string[]=[];
  const conversation={id:'ime-chat',friendId:friend.id,friendName:friend.name,avatar:friend.avatar,lastMessage:'',time:'',unreadCount:0,messages:[]};
  const view=await mount(<ChatView conversations={[conversation]} activeChatId={conversation.id} onSelectChat={() => {}} onSendMessage={(_id,text) => {sent.push(text);}}/>);
  try {
    const input=view.host.querySelector('#chat-text-input')!;
    await fill(input,'明天一起看日落');
    await key(input,{key:'Enter',isComposing:true});
    await key(input,{key:'Enter',keyCode:229});
    await key(input,{key:'Enter',shiftKey:true});
    assert.deepEqual(sent,[]);
    assert.equal((input as HTMLTextAreaElement).value,'明天一起看日落');
    await key(input,{key:'Enter'});
    assert.deepEqual(sent,['明天一起看日落']);
    await key(input,{key:'Enter'});
    assert.equal(sent.length,1,'empty composition must not resend');
  } finally {await view.cleanup();}
});

test('an empty search cannot locate an unrelated friend; Escape closes once and restores focus',async () => {
  const origin=document.createElement('button');document.body.appendChild(origin);origin.focus();
  const selected:string[]=[];let closes=0;
  const view=await mount(<SearchModal isOpen friends={[friend]} onClose={() => {closes++;}} onSelectFriend={item => selected.push(item.id)}/>);
  try {
    const input=view.host.querySelector('input')!;
    await fill(input,'不存在的好友');
    const radar=button(view.host,'全域地图雷达定位') as HTMLButtonElement;
    assert.equal(radar.disabled,true);
    await click(radar);await key(input,{key:'Enter'});
    assert.deepEqual(selected,[]);
    await fill(input,'Sarah');
    await key(input,{key:'Enter',isComposing:true});
    assert.deepEqual(selected,[]);
    await key(input,{key:'Enter'});
    assert.deepEqual(selected,['sarah']);
    closes=0;await key(input,{key:'Escape'});
    assert.equal(closes,1);
  } finally {await view.cleanup();}
  assert.ok(document.activeElement === origin, "return focus to the opener");origin.remove();
});

test('schedule draft survives closing and reopening, preserves one sharing scope and creates a cross-midnight schedule once',async () => {
  localStorage.clear();const notices:string[]=[];const created:Schedule[]=[];let closes=0;
  const props={isOpen:true,onClose:() => {closes++;},showToast:(text:string) => notices.push(text),onSuccessCreate:(item:Schedule) => created.push(item),initialLocation:{name:'自选集合点',lat:36.123,lng:103.456}};
  let view=await mount(<ScheduleCreationModal {...props}/>);
  try {
    await click([...view.host.querySelectorAll('button')].find(item => item.textContent?.includes('普通日程'))!);
    await click(button(view.host,'下一步'));
    await fill(view.host.querySelector('#schedule-title')!,'夜间散步');
    await fill(view.host.querySelector('#schedule-date')!,'2026-10-13');
    await fill(view.host.querySelector('#schedule-start-time')!,'23:30');
    await fill(view.host.querySelector('#schedule-end-time')!,'00:30');
    await click(button(view.host,'下一步'));
    await click(button(view.host,'确认日程位置'));
    await click(button(view.host,'下一步'));await click(button(view.host,'下一步'));
    await click(button(view.host,'🏠 家人可见'));
    assert.equal(view.host.querySelectorAll('[role="radio"][aria-checked="true"]').length,1);
    await click(button(view.host,'保存草稿'));
    assert.ok(notices.includes('日程草稿已保存，下次打开可继续填写'));
    const saved=JSON.parse(localStorage.getItem(draftKey)!);
    assert.equal(saved.visibilityScope,'family');assert.equal(saved.title,'夜间散步');assert.equal(saved.isAnchorConfirmed,true);
    await click(view.host.querySelector('[aria-label="保存草稿并关闭日程设置"]')!);assert.equal(closes,1);
  } finally {await view.cleanup();}
  view=await mount(<ScheduleCreationModal {...props}/>);
  try {
    assert.ok(notices.includes('已恢复上次保存的日程草稿'));
    assert.equal(button(view.host,'🏠 家人可见').getAttribute('aria-checked'),'true');
    const submit=button(view.host,'确认创建');
    await click(submit);await click(submit);
    assert.equal(created.length,1);
    assert.equal(created[0].title,'夜间散步');assert.equal(created[0].visibilityRule.scope,'family');
    assert.equal(created[0].location.latitude,36.123);assert.equal(created[0].location.longitude,103.456);
    assert.equal(created[0].startAt,'2026-10-13 23:30');assert.equal(created[0].endAt,'2026-10-14 00:30');
    assert.equal(localStorage.getItem(draftKey),null);
  } finally {await view.cleanup();}
});

test('schedule deletion requires confirmation and cancelling or Escape leaves the schedule intact',async () => {
  const deleted:string[]=[];let closes=0;
  const view=await mount(<ScheduleDetailModal isOpen schedule={schedule} onClose={() => {closes++;}} onViewOnMap={() => {}} onDeleteSchedule={id => deleted.push(id)} showToast={() => {}}/>);
  try {
    await click(view.host.querySelector('[aria-label="删除日程"]')!);
    assert.deepEqual(deleted,[]);assert.ok(view.host.querySelector('[role="alertdialog"]'));
    await click(button(view.host,'保留日程'));assert.deepEqual(deleted,[]);
    await click(view.host.querySelector('[aria-label="删除日程"]')!);
    await key(button(view.host,'保留日程'),{key:'Escape'});assert.deepEqual(deleted,[]);assert.equal(closes,0);
    await click(view.host.querySelector('[aria-label="删除日程"]')!);await click(button(view.host,'确认删除'));
    assert.deepEqual(deleted,[schedule.id]);assert.equal(closes,1);
  } finally {await view.cleanup();}
});

test('place form labels focus their controls and invalid unnamed locations cannot submit',async () => {
  const view=await mount(<CreateLifePlaceModal onClose={() => {}}/>);
  try {
    for (const id of ['life-place-tags','life-place-note','life-place-photo']) {
      const label=view.host.querySelector(`label[for="${id}"]`) as HTMLLabelElement;
      assert.ok(label);assert.equal(label.control?.id,id);
    }
    assert.ok(view.host.querySelector('[role="dialog"][aria-modal="true"]'));
    assert.equal((view.host.querySelector('button[disabled]') as HTMLButtonElement).disabled,true);
  } finally {await view.cleanup();}
});

test('a friend application has an associated note label and Escape returns to search before closing the modal',async () => {
  let closes=0;
  const view=await mount(<AddFriendModal isOpen onClose={() => {closes++;}} showToast={() => {}}/>);
  try {
    await click(button(view.host,'添加'));
    const label=view.host.querySelector('label[for="friend-application-note"]') as HTMLLabelElement;
    assert.ok(label);assert.equal(label.control?.id,'friend-application-note');
    await key(view.host.querySelector('#friend-application-note')!,{key:'Escape'});
    assert.equal(closes,0);
    const exitDeadline=Date.now()+2000;
    while (view.host.querySelector('#friend-application-note') && Date.now()<exitDeadline) {
      await act(async () => {await new Promise(resolve => setTimeout(resolve,25));});
    }
    assert.ok(view.host.querySelector('#friend-application-note') === null);
    await key(view.host.querySelector('input')!,{key:'Escape'});assert.equal(closes,1);
  } finally {await view.cleanup();}
});
