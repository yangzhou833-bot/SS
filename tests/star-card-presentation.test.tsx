import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import React, { act } from 'react';
import type { DiscoverPost } from '../src/types';
import { starCardCreationDate, renderStarCardMarker, STAR_CARD_MAP_SIZE } from '../src/utils/starCardPresentation';
import { renderPlaceMarker, PLACE_MARKER_MAP_SIZE } from '../src/utils/placeMarkerPresentation';

const dom=new Window({url:'http://localhost:4173'});
Object.defineProperty(dom.Element.prototype,'animate',{value:undefined,configurable:true});
for (const key of ['window','document','navigator','HTMLElement','Element','Node','MouseEvent','Event','CustomEvent','localStorage','getComputedStyle','requestAnimationFrame','cancelAnimationFrame']) Object.defineProperty(globalThis,key,{value:typeof dom[key] === 'function' && ['getComputedStyle','requestAnimationFrame','cancelAnimationFrame'].includes(key) ? dom[key].bind(dom) : dom[key],configurable:true});
(globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;
const {createRoot}=await import('react-dom/client');
const fs=await import('node:fs/promises');
const ts=await import('typescript');
// The Node test runner does not load CSS; evaluate only these independent components.
async function loadComponent(path:string) {
  const source=(await fs.readFile(new URL(path,import.meta.url),'utf8')).replace(/^import ['"]\.\/[^'"]+\.css['"];?\n/gm,'');
  const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  const {createRequire}=await import('node:module');const require=createRequire(new URL(path,import.meta.url));require.extensions['.css']=()=>{};const module={exports:{}};
  new Function('require','module','exports',compiled)(require,module,module.exports);
  return module.exports as any;
}
const {StarCardDetailModal}=await loadComponent('../src/components/StarCardDetailModal.tsx');
const {IPhone17ProFrame}=await loadComponent('../src/components/IPhone17ProFrame.tsx');
const {ProfileView}=await loadComponent('../src/components/ProfileView.tsx');
const card:DiscoverPost={id:'star-test',authorName:'作者',authorAvatar:'https://example.com/avatar.png',location:'已选位置',time:'10分钟前',content:'这段记忆',image:'https://example.com/photo.png',likes:1,comments:0,createdAt:Date.parse('2026-10-06T23:50:00Z')};
const click=async (element:Element) => act(async () => {element.dispatchEvent(new dom.MouseEvent('click',{bubbles:true}) as unknown as Event);});

test('star dates use stored timestamps in Shanghai and never manufacture a creation date from a relative label',() => {
  assert.deepEqual(starCardCreationDate(card),{short:'10/07',full:'创建于 2026-10-07'});
  assert.deepEqual(starCardCreationDate({time:'10分钟前'}),{short:'未记录',full:'创建日期未记录'});
  assert.equal(starCardCreationDate({time:'2026-02-30'}).short,'未记录');
  assert.equal(starCardCreationDate({time:'2026-10-03 10:20'}).short,'10/03');
  assert.equal(starCardCreationDate({createdAt:Number.NaN,time:'昨天'}).short,'未记录');
});

test('the enlarged marker is frameless, keeps the author, adds a calendar date and escapes content',() => {
  const html=renderStarCardMarker(card,1,1);
  assert.deepEqual(STAR_CARD_MAP_SIZE,{width:76,height:160});assert.ok(html.includes('star-card-photo'));assert.ok(html.includes('star-card-author'));assert.ok(html.includes('star-card-month">10月'));assert.ok(html.includes('star-card-day">07'));assert.ok(html.includes('创建于 2026-10-07'));assert.equal(html.includes('bg-black'),false);assert.equal(html.includes('p-1'),false);
  const text=renderStarCardMarker({...card,image:undefined,content:'<script>alert(1)</script>'},1,1);assert.ok(text.includes('&lt;script&gt;'));assert.equal(text.includes('<script>'),false);
});

test('life map markers show one themed emoji while the place name stays accessible',() => {
  const host=document.createElement('div');
  host.innerHTML=renderPlaceMarker({id:'p',name:'<书店>',icon:'📖',selected:true});
  assert.deepEqual(PLACE_MARKER_MAP_SIZE,{width:44,height:44});
  assert.equal(host.querySelectorAll('.place-theme-emoji').length,1);
  assert.equal(host.textContent?.trim(),'📖');
  assert.equal(host.querySelector('img'),null);
  assert.equal(host.querySelector('.place-theme-marker')?.getAttribute('aria-label'),'<书店>');
  assert.ok(host.querySelector('.is-selected'));
  host.innerHTML=renderPlaceMarker({id:'p',name:'坐标',icon:'',selected:false});
  assert.equal(host.textContent?.trim(),'📍');assert.equal(host.querySelector('.is-selected'),null);
});

test('the white detail retains like/comment/close callbacks and has no invented fallback video',async () => {
  const host=document.createElement('div');document.body.appendChild(host);const root=createRoot(host);let likes=0;let comments=0;let closed=0;
  await act(async () => root.render(<StarCardDetailModal card={card} onClose={() => {closed++;}} onLike={() => {likes++;}} commentValue="真实评论" onCommentChange={() => {}} onSubmitComment={() => {comments++;}}/>));
  const dialog=host.querySelector('[role="dialog"]')!;assert.ok(dialog.className.includes('bg-white'));assert.ok(host.textContent?.includes('2026-10-07'));assert.equal(host.querySelector('video'),null);assert.equal(host.querySelector('img')?.getAttribute('src'),card.image);
  await click(host.querySelector('[aria-pressed]')!);assert.equal(likes,1);
  await act(async () => {host.querySelector('form')!.dispatchEvent(new dom.Event('submit',{bubbles:true,cancelable:true}) as unknown as Event);});assert.equal(comments,1);
  await click(host.querySelector('[aria-label="关闭星片详情"]')!);assert.equal(closed,1);
  await act(async () => root.unmount());host.remove();
});

test('the phone status strip uses floating icon groups without the old solid background or battery pill',async () => {
  const host=document.createElement('div');document.body.appendChild(host);const root=createRoot(host);
  await act(async () => root.render(<IPhone17ProFrame currentTab="home"><div>产品内容</div></IPhone17ProFrame>));
  const strip=host.querySelector('[aria-label="手机悬浮状态栏"]')!;assert.ok(strip.className.includes('phone-status-floating'));assert.equal(strip.className.includes('bg-white'),false);assert.equal(strip.className.includes('border-b'),false);
  const icons=strip.querySelector('[aria-label="信号、无线网络与电量"]')!;assert.equal(icons.querySelector('[class*="bg-black/10"]'),null);assert.ok(host.textContent?.includes('产品内容'));
  await act(async () => root.unmount());host.remove();
});

test('profile opens the same dated white detail and follows real parent like/comment updates',async () => {
  const host=document.createElement('div');document.body.appendChild(host);const root=createRoot(host);let submitted='';
  const profile:any={operatorName:'测试作者',birthday:'',hobbies:'',stickers:[],currentCity:'兰州'};
  function Profile() {
    const [posts,setPosts]=React.useState([{...card,isStarCard:true}]);
    return <ProfileView profileData={profile} setProfileData={()=>{}} discoverPosts={posts} onLikePost={(id:string) => setPosts(previous => previous.map(post => post.id === id ? {...post,likes:post.likes+1,likedByMe:true} : post))} onAddCommentToPost={(id:string,text:string) => {submitted=text;setPosts(previous => previous.map(post => post.id === id ? {...post,comments:1,commentsList:[{id:'real-comment',userName:'测试作者',userAvatar:card.authorAvatar,content:text,time:'已录入'}]} : post));}}/>;
  }
  await act(async () => root.render(<Profile/>));
  const preview=host.querySelector('[aria-label="打开星片：已选位置"]')!;assert.ok(preview);assert.equal(preview.className.includes('border-2'),false);assert.ok(preview.textContent?.includes('10/07'));
  await click(preview);
  let dialog=host.querySelector('[aria-label="星片详情"]')!;assert.ok(dialog);assert.ok(dialog.className.includes('bg-white'));
  await click(dialog.querySelector('[aria-pressed]')!);assert.ok(dialog.textContent?.includes('2 点赞'));
  const input=dialog.querySelector('[aria-label="星片评论"]') as HTMLInputElement;
  await act(async () => {const setValue=Object.getOwnPropertyDescriptor(dom.HTMLInputElement.prototype,'value')!.set!;setValue.call(input,'保留这段回忆');input.dispatchEvent(new dom.Event('input',{bubbles:true}) as unknown as Event);});
  await act(async () => {dialog.querySelector('form')!.dispatchEvent(new dom.Event('submit',{bubbles:true,cancelable:true}) as unknown as Event);});
  assert.equal(submitted,'保留这段回忆');assert.ok(dialog.textContent?.includes('保留这段回忆'));assert.equal(input.value,'');
  await act(async () => root.unmount());host.remove();
});
