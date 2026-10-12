import React, { useEffect, useRef, useState } from 'react';
import { X, Navigation, Calendar, MapPin, Users, Bell, Check, Route, Sparkles, Share2, Play, Pause, Flag, Plus, Camera, HeartHandshake, Crown, Settings2, ChevronRight, Clock, Send, Bookmark, RotateCcw, MessageCircle, Shield } from 'lucide-react';
import { SimulatedMapActivity, ActivityParticipantStatus, Friend } from '../types';
import { activityTimeWindow, getActivityStatusInfo } from '../utils/countdownHelper';
import { clockTime, dateKey, scheduleTime } from '../utils/lifePlanning';
import { calculateLatLngDistanceMeters } from '../utils/geoUtils';
import { CURRENT_USER_PROFILE, INITIAL_FRIENDS } from '../data/mockData';
import { elapsedActivitySeconds, summarizeActivity } from '../utils/activityPlanning';

export type ActivityPrivacyLevel = 'public' | 'friends' | 'selected' | 'private';
interface ActivityDetailShortCardProps {
  activity: SimulatedMapActivity | null;
  userLocation: { lat: number; lng: number };
  onClose: () => void;
  friends?: Friend[];
  onNavigate?: (activity: SimulatedMapActivity) => void;
  onOpenCalendar?: () => void;
  onShowToast?: (msg: string) => void;
  onFocusOnMap?: (lat: number, lng: number) => void;
  onSelectParticipant?: (activity: SimulatedMapActivity, participant: ActivityParticipantStatus) => void;
  onShareActivity?: (activity: SimulatedMapActivity) => void;
  onOpenManagementMode?: (activity: SimulatedMapActivity) => void;
  onCleanExpiredActivity?: (activityId: string) => void;
  onOpenCleanModal?: () => void;
  onUpdatePrivacy?: (activityId: string, privacyLevel: ActivityPrivacyLevel, visibleFriendIds: string[]) => void;
  onUpdateActivity?: (activity: SimulatedMapActivity) => void;
  onEditActivity?: (activity: SimulatedMapActivity) => void;
  onRepeatActivity?: (activity: SimulatedMapActivity) => void;
  onOpenChat?: (activity: SimulatedMapActivity) => void;
  currentUser?: { id: string; name: string; avatar: string };
  isUnavailable?: boolean;
}
type Tab = 'details' | 'route' | 'members' | 'updates' | 'needs' | 'roles' | 'settings' | 'calendar' | 'memory';
const LABELS: Record<Tab, string> = { details: '详情', route: '路线', members: '成员', updates: '动态', needs: '需求墙', roles: '角色', settings: '设置', calendar: '日历排期', memory: '活动记忆' };
const PRIVACY: Record<ActivityPrivacyLevel, string> = { public: '公开', friends: '好友可见', selected: '指定好友', private: '仅自己' };
const timerText = (seconds: number) => [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, Math.floor(seconds) % 60].map(value => String(value).padStart(2, '0')).join(':');
const escapeICS = (text: string) => text.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

export const ActivityDetailShortCard: React.FC<ActivityDetailShortCardProps> = ({
  activity, userLocation, onClose, friends = INITIAL_FRIENDS, onNavigate, onOpenCalendar, onShowToast,
  onFocusOnMap, onSelectParticipant, onShareActivity, onOpenManagementMode, onCleanExpiredActivity,
  onOpenCleanModal, onUpdatePrivacy, onUpdateActivity, onEditActivity, onRepeatActivity, onOpenChat,
  currentUser, isUnavailable = false,
}: ActivityDetailShortCardProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [management, setManagement] = useState(false);
  const [assistant, setAssistant] = useState(false);
  const [needComposer, setNeedComposer] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [needTitle, setNeedTitle] = useState('');
  const [needDescription, setNeedDescription] = useState('');
  const [updateText, setUpdateText] = useState('');
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [now, setNow] = useState(Date.now());
  const latestActivity = useRef(activity);
  latestActivity.current = activity;
  const closeRef = useRef<HTMLButtonElement>(null);
  const needInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const assistantInputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    setActiveTab('details'); setManagement(false); setAssistant(false); setNeedComposer(false); setConfirmEnd(false);
    setNeedTitle(''); setNeedDescription(''); setUpdateText(''); setPrompt(''); setAnswer(''); setPhotoError('');
  }, [activity?.id]);
  useEffect(() => {
    if (!activity) return;
    closeRef.current?.focus({ preventScroll: true });
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [activity?.id]);
  useEffect(() => {
    if (!activity) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      if (needComposer) setNeedComposer(false);
      else if (assistant) setAssistant(false);
      else if (confirmEnd) setConfirmEnd(false);
      else onClose();
    };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [activity?.id, needComposer, assistant, confirmEnd, onClose]);
  useEffect(() => { if (needComposer) needInputRef.current?.focus(); }, [needComposer]);
  useEffect(() => { if (assistant) assistantInputRef.current?.focus(); }, [assistant]);
  useEffect(() => { if (confirmEnd) endRef.current?.scrollIntoView?.({ block: 'nearest', behavior: reducedMotion ? 'instant' : 'smooth' }); }, [confirmEnd, reducedMotion]);

  if (!activity) return null;
  const actor = currentUser || friends.find(friend => friend.isMe || friend.id === 'me') || CURRENT_USER_PROFILE;
  const participants = activity.participants || [];
  const self = participants.find(person => person.id === actor.id || (actor.id === 'me' && person.id === 'p-me'));
  const joined = Boolean(self && self.invitationStatus !== 'invited');
  const admin = activity.isUserAdmin === true || activity.isUserPublished === true;
  const status = getActivityStatusInfo(activity);
  const ended = Boolean(activity.endedAt) || status.isExpired;
  const active = !ended && (Boolean(activity.startedAt) || status.statusLabel === '进行中');
  const writable = Boolean(onUpdateActivity) && !isUnavailable;
  const timing = activityTimeWindow(activity);
  const startDate = Number.isFinite(timing.start) ? new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }).format(timing.start) : '日期待确认';
  const timeRange = Number.isFinite(timing.start) && Number.isFinite(timing.end) ? clockTime(timing.start) + ' – ' + (dateKey(new Date(timing.start)) !== dateKey(new Date(timing.end)) ? dateKey(new Date(timing.end)) + ' ' : '') + clockTime(timing.end) : '时间待确认';
  const origin = activity.originLocation || { name: activity.locationName, lat: activity.lat, lng: activity.lng };
  const venue = activity.venueLocation || { name: activity.locationName, lat: activity.lat, lng: activity.lng };
  const nodes = activity.routeNodes?.length ? activity.routeNodes : [{ ...origin, status: 'current' as const, label: '集合点' }, ...(origin.lat !== venue.lat || origin.lng !== venue.lng ? [{ ...venue, status: 'planned' as const, label: '目的地' }] : [])];
  const routeKm = nodes.slice(1).reduce((total, node, index) => total + calculateLatLngDistanceMeters(nodes[index].lat, nodes[index].lng, node.lat, node.lng) / 1000, 0);
  const userDistance = calculateLatLngDistanceMeters(userLocation.lat, userLocation.lng, origin.lat, origin.lng) / 1000;
  const confirmed = participants.filter(person => person.invitationStatus !== 'invited');
  const arrived = participants.filter(person => person.status === 'arrived').length;
  const needs = activity.needs || [], moments = activity.moments || [], updates = activity.updates || [];
  const solved = needs.filter(need => need.status === 'resolved'), openNeeds = needs.filter(need => need.status !== 'resolved');
  const deadlinePassed = Boolean(activity.deadlineTime && now > scheduleTime(activity.deadlineTime));
  const full = Boolean(activity.maxParticipants && confirmed.length >= activity.maxParticipants);
  const phase = ended ? '已结束' : active ? activity.pausedAt ? '已暂停' : '进行中' : '准备中';
  const categoryLabel = activity.category.replace(/\s*·\s*(准备中|即将开始|进行中|已暂停|已结束|已归档)\s*$/, '').trim();
  const shownTab = activeTab === 'details' ? ended ? 'memory' : active ? 'route' : 'details' : activeTab;
  const tabs: Tab[] = management ? ['members', 'needs', 'route', 'roles'] : ended ? ['memory', 'members', 'needs'] : active ? ['route', 'members', 'updates'] : ['details', 'members', 'calendar'];
  const leaders = Object.values(solved.reduce<Record<string, { name: string; count: number }>>((result, need) => {
    if (need.helperId) result[need.helperId] = { name: need.helperName || '伙伴', count: (result[need.helperId]?.count || 0) + 1 };
    return result;
  }, {})).sort((first, second) => second.count - first.count);

  const save = (patch: Partial<SimulatedMapActivity>, text?: string) => {
    if (!writable) return;
    const current = latestActivity.current;
    if (!current || current.id !== activity.id) return;
    const next = { ...current, ...patch };
    if (text) next.updates = [{ id: 'update-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7), text, createdAt: Date.now() }, ...current.updates || []];
    onUpdateActivity?.(next);
  };
  const join = () => {
    if (!writable || ended || joined || full || deadlinePassed) return;
    const next: ActivityParticipantStatus = self ? { ...self, invitationStatus: 'confirmed' } : { id: actor.id, name: actor.name, avatar: actor.avatar, status: 'preparing', statusText: '已报名 · 准备出发', invitationStatus: 'confirmed', isLocationAuthorized: true };
    save({ participants: self ? participants.map(person => person.id === self.id ? next : person) : [...participants, next] }, actor.name + ' 确认参加活动');
  };
  const changePrivacy = (privacyLevel: ActivityPrivacyLevel, visibleFriendIds = activity.visibleFriendIds || []) => {
    save({ privacyLevel, visibleFriendIds });
    onUpdatePrivacy?.(activity.id, privacyLevel, visibleFriendIds);
  };
  const publishNeed = (event: React.FormEvent) => {
    event.preventDefault();
    if (!needTitle.trim() || !writable || ended) return;
    save({ needs: [{ id: 'need-' + Date.now(), title: needTitle.trim(), description: needDescription.trim(), authorId: actor.id, authorName: actor.name, lat: userLocation.lat, lng: userLocation.lng, createdAt: Date.now(), status: 'open' }, ...needs] }, actor.name + ' 发布需求：' + needTitle.trim());
    setNeedTitle(''); setNeedDescription(''); setNeedComposer(false); setActiveTab('needs');
  };
  const updateNeed = (id: string, state: 'claimed' | 'resolved') => {
    const target = needs.find(need => need.id === id);
    if (!target || ended || (state === 'claimed' && target.status !== 'open') || (state === 'resolved' && target.helperId !== actor.id && target.authorId !== actor.id && !admin)) return;
    save({ needs: needs.map(need => need.id === id ? { ...need, status: state, ...(state === 'claimed' ? { helperId: actor.id, helperName: actor.name } : {}) } : need) }, (state === 'claimed' ? actor.name + ' 响应需求：' : '需求已解决：') + target.title);
  };
  const runAssistant = (event: React.FormEvent) => {
    event.preventDefault();
    const summary = summarizeActivity(activity);
    const response = /装备|带什么|准备/.test(prompt) ? activity.equipmentTips || '尚未设置装备清单。建议确认饮水、充电和适合活动的装备。'
      : /路线|集合|出发|地点/.test(prompt) ? '集合：' + origin.name + '；目的地：' + venue.name + '。距集合点直线 ' + userDistance.toFixed(1) + ' km；使用路线按钮查看道路导航。'
      : /需求|帮助|补给/.test(prompt) ? openNeeds.length ? '待处理需求：' + openNeeds.map(need => need.title + '（' + (need.status === 'claimed' ? '处理中' : '待响应') + '）').join('、') : '目前没有待处理需求。可发布补给、装备或同行协助。'
      : summary;
    setAnswer(response); save({ assistantSummary: summary });
  };
  const addPhotos = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget as HTMLInputElement;
    setPhotoError('');
    const remaining = Math.max(0, 12 - moments.length);
    if (!remaining) { setPhotoError('最多保留 12 张活动照片，请使用现有照片记录。'); input.value = ''; return; }
    const chosen = Array.from(input.files || []).filter(file => file.type.startsWith('image/'));
    const files = chosen.slice(0, Math.min(6, remaining));
    if (chosen.length > files.length) setPhotoError('每次最多添加 6 张，活动照片总数不超过 12 张。');
    const additions = await Promise.all(files.map(file => new Promise<NonNullable<SimulatedMapActivity['moments']>[number] | null>(resolve => {
      const fail = () => { setPhotoError('部分照片无法处理，请选择 JPEG、PNG 或 WebP 图片重试。'); resolve(null); };
      if (file.size > 20 * 1024 * 1024) { setPhotoError('单张原图请小于 20MB。'); resolve(null); return; }
      const reader = new FileReader();
      reader.onerror = fail;
      reader.onload = () => {
        const image = new Image();
        image.onerror = fail;
        image.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const scale = Math.min(1, 960 / Math.max(image.naturalWidth, image.naturalHeight));
            canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
            canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
            const context = canvas.getContext('2d');
            if (!context) { fail(); return; }
            context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            let url = canvas.toDataURL('image/jpeg', 0.75);
            if (url.length > 240000) url = canvas.toDataURL('image/jpeg', 0.5);
            if (!url.startsWith('data:image/jpeg') || url.length > 350000) { setPhotoError('照片压缩后仍较大，请裁剪或选择较小的图片。'); resolve(null); return; }
            resolve({ id: 'moment-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7), url, caption: file.name.replace(/\.[^.]+$/, ''), createdAt: Date.now(), authorName: actor.name, lat: userLocation.lat, lng: userLocation.lng });
          } catch { fail(); }
        };
        image.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    })));
    const valid = additions.filter((moment): moment is NonNullable<typeof moment> => moment !== null);
    const current = latestActivity.current;
    if (valid.length && current?.id === activity.id) save({ moments: [...current.moments || [], ...valid].slice(0, 12), assistantSummary: undefined }, actor.name + ' 添加了活动照片');
    input.value = '';
  };
  const exportCalendar = () => {
    if (!Number.isFinite(timing.start) || !Number.isFinite(timing.end)) return;
    const stamp = (value: number) => new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const content = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Stellar//Activity//CN', 'BEGIN:VEVENT', 'UID:' + escapeICS(activity.id) + '@stellar', 'DTSTAMP:' + stamp(Date.now()), 'SUMMARY:' + escapeICS(activity.title), 'LOCATION:' + escapeICS(origin.name), 'DESCRIPTION:' + escapeICS(activity.description || ''), 'DTSTART:' + stamp(timing.start), 'DTEND:' + stamp(timing.end), ...(activity.isReminderSet ? ['BEGIN:VALARM', 'TRIGGER:-PT' + (activity.reminderMinutes ?? 30) + 'M', 'ACTION:DISPLAY', 'DESCRIPTION:活动提醒', 'END:VALARM'] : []), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/calendar;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = activity.title + '.ics'; anchor.click(); URL.revokeObjectURL(url);
  };

  return <div className="stellar-activity-layer" data-reduced-motion={Boolean(reducedMotion)}>
    <section className="stellar-activity-sheet" role="dialog" aria-modal="false" aria-label={activity.title + '活动详情'} onClick={event => event.stopPropagation()}>
      <div className="activity-grip" aria-hidden="true" />
      <header className="activity-sheet-header"><div><span className={'activity-phase ' + (ended ? 'is-ended' : active ? 'is-active' : '')}><i />{phase}</span><h2>{management ? '活动管理' : ended ? '活动记忆' : '活动详情'}</h2></div><div className="activity-header-actions">{admin && !ended && <button aria-label={management ? '退出管理' : '管理活动'} aria-pressed={management} className="activity-icon-button" onClick={() => { setManagement(!management); setActiveTab(management ? active ? 'route' : 'details' : 'members'); }}><Settings2 size={20} /></button>}<button ref={closeRef} className="activity-icon-button" aria-label="关闭活动卡片" onClick={onClose}><X size={22} /></button></div></header>
      <div className="activity-sheet-scroll">
        <div className="activity-overview"><div className="activity-cover">{activity.coverImageUrl ? <img src={activity.coverImageUrl} alt={activity.title + '封面'} /> : <span>{activity.icon || '🎯'}</span>}</div><div className="activity-overview-copy"><h3>{activity.title}</h3><p><Calendar size={14} />{startDate}</p><p><Clock size={14} />{timeRange}</p><div className="activity-tags"><span>{categoryLabel}</span><span>{PRIVACY[activity.privacyLevel || 'public']}</span><span>{confirmed.length}{activity.maxParticipants ? '/' + activity.maxParticipants : ''} 人</span></div></div></div>
        {!ended && <div className="activity-timing"><span>{active ? activity.pausedAt ? '活动已暂停' : '活动用时' : '距离开始'}</span><strong aria-live="off">{active ? timerText(elapsedActivitySeconds(activity, now)) : Number.isFinite(timing.start) ? Math.floor(Math.max(0, timing.start - now) / 86400000) + '天 ' + timerText(Math.max(0, timing.start - now) / 1000 % 86400) : '待确认'}</strong>{admin && writable && <button aria-label={active ? activity.pausedAt ? '继续活动' : '暂停活动' : '开始活动'} onClick={() => active ? save(activity.pausedAt ? { pausedAt: undefined, pausedDurationMs: (activity.pausedDurationMs || 0) + now - activity.pausedAt } : { pausedAt: now }) : save({ startedAt: now, activityState: '进行中', statusText: '进行中', pausedDurationMs: 0 }, '活动开始')}><span className="sr-only">{active ? activity.pausedAt ? '继续活动' : '暂停活动' : '开始活动'}</span>{active && !activity.pausedAt ? <Pause size={17} /> : <Play size={17} />}</button>}</div>}
        {isUnavailable && <p className="activity-empty">活动当前不可操作，可查看已有记录。</p>}
        {photoError && <p className="activity-photo-error" role="alert">{photoError}</p>}
        <nav className="activity-tabs" aria-label={management ? '活动管理栏目' : '活动栏目'}>{tabs.map((tab, index) => <button key={`act-tab-${tab}-${index}`} role="tab" aria-selected={shownTab === tab} onClick={() => setActiveTab(tab)}>{LABELS[tab]}{tab === 'members' && <small>{participants.length}</small>}{tab === 'needs' && openNeeds.length > 0 && <small>{openNeeds.length}</small>}</button>)}</nav>

        {shownTab === 'details' && <div className="activity-content-stack">
          <div className="activity-location-pair"><button disabled={!onFocusOnMap} onClick={() => onFocusOnMap?.(origin.lat, origin.lng)}><MapPin size={20} /><span><small>集合地点</small><b>{origin.name}</b><em>距你直线 {userDistance.toFixed(1)} km</em></span><ChevronRight size={16} /></button><button disabled={!onFocusOnMap} onClick={() => onFocusOnMap?.(venue.lat, venue.lng)}><Flag size={20} /><span><small>活动目的地</small><b>{venue.name}</b><em>{venue.address || '查看地图位置'}</em></span><ChevronRight size={16} /></button></div>
          <div className="activity-section-heading"><h4>参与进度 <strong>{confirmed.length} / {activity.maxParticipants || participants.length || '不限'}</strong></h4><span>{participants.filter(person => person.invitationStatus === 'invited').length} 人待确认</span></div>
          <div className="activity-avatar-row">{participants.slice(0, 8).map(person => <img key={person.id} src={person.avatar} alt={person.name} />)}{!participants.length && <span>邀请伙伴，一起把计划变成生活。</span>}</div>
          <div className="activity-quick-grid"><button onClick={() => setActiveTab('route')}><Route size={22} /><b>路线安排</b><span>{nodes.length} 个地点</span></button><button onClick={() => setActiveTab('calendar')}><Calendar size={22} /><b>日历排期</b><span>{activity.agenda?.length || 1} 个环节</span></button><button onClick={() => setActiveTab('needs')}><HeartHandshake size={22} /><b>需求墙</b><span>{openNeeds.length} 条待处理</span></button>{onOpenChat ? <button onClick={() => onOpenChat(activity)}><MessageCircle size={22} /><b>活动交流</b><span>联系参与伙伴</span></button> : <button onClick={() => setActiveTab('members')}><Users size={22} /><b>参与伙伴</b><span>查看成员状态</span></button>}</div>
          <div className="activity-panel"><h4>装备与费用</h4><p>{activity.equipmentTips || '还没有装备清单，发起人可在编辑活动中补充。'}</p><span className="activity-muted">{activity.feeType || '免费'}{activity.feeType === '固定费用' ? ' · ¥' + (activity.fixedFee || 0) : ''}</span></div>
          {activity.description && <div className="activity-panel"><h4>一起做什么</h4><p>{activity.description}</p></div>}
        </div>}
        {shownTab === 'route' && <div className="activity-content-stack">
          <div className="activity-panel activity-route-summary"><div><Route size={22} /><h4>{active ? '正在前往' : '活动路线'}</h4></div><strong>{routeKm.toFixed(1)} <small>km</small></strong><p>坐标直线估算 · 实际距离与时间以道路导航为准</p><button className="activity-primary" disabled={!onNavigate} onClick={() => onNavigate?.(activity)}><Navigation size={17} />查看道路路线</button></div>
          <ol className="activity-route-nodes">{nodes.map((node, index) => <li key={index}><button disabled={!onFocusOnMap} onClick={() => onFocusOnMap?.(node.lat, node.lng)}><i>{index + 1}</i><span><b>{node.name}</b><small>{node.label || (index === 0 ? '集合点' : index === nodes.length - 1 ? '目的地' : '途经地点')}</small></span><ChevronRight size={17} /></button></li>)}</ol>
          <div className="activity-stat-grid"><div><small>到场情况</small><b>{arrived} / {participants.length} 人</b></div><div><small>下一个地点</small><b>{activity.nextNode || nodes.find(node => node.status === 'next')?.name || venue.name}</b></div></div>
          {admin && onEditActivity && !ended && <button className="activity-secondary activity-wide" onClick={() => onEditActivity(activity)}>编辑路线与地点</button>}
        </div>}
        {(shownTab === 'members' || shownTab === 'roles') && <div className="activity-content-stack">
          <div className="activity-section-heading"><h4>{shownTab === 'roles' ? '分工让活动更顺利' : '参与伙伴'}</h4><span>到场 {arrived} / {participants.length}</span></div>{!participants.length && <p className="activity-empty">暂无参与伙伴，邀请好友后会显示在这里。</p>}
          {participants.map(person => <div key={person.id} className="activity-member"><button className="activity-member-person" disabled={!onSelectParticipant || person.isLocationAuthorized === false} onClick={() => onSelectParticipant?.(activity, person)}><img src={person.avatar} alt="" /><span><b>{person.name}</b><small>{person.invitationStatus === 'invited' ? '待确认邀请' : person.isLocationAuthorized === false ? '未授权位置' : person.statusText || '准备中'}</small>{person.isLocationAuthorized !== false && <em>{person.distanceText || ''}{person.etaMinutes ? ' · 约 ' + person.etaMinutes + ' 分钟' : ''}</em>}</span></button>{shownTab === 'roles' && admin && writable && !ended ? <select aria-label={person.name + '的活动职责'} value={person.activityRole || '参与者'} onChange={event => save({ participants: participants.map(member => member.id === person.id ? { ...member, activityRole: event.target.value } : member) }, person.name + ' 的职责设为' + event.target.value)}>{['参与者', '组织者', '协助者', '领骑', '补给', '摄影'].map(role => <option key={role}>{role}</option>)}</select> : <span className="activity-member-role">{person.activityRole || (person.groupRole === 'admin' ? '组织者' : '参与者')}</span>}{management && shownTab === 'members' && admin && writable && !ended && <button className="activity-checkin" onClick={() => save({ participants: participants.map(member => member.id === person.id ? { ...member, status: member.status === 'arrived' ? 'on_the_way' : 'arrived', statusText: member.status === 'arrived' ? '前往集合点' : '已签到', isInGeofence: member.status !== 'arrived' } : member) }, person.name + (person.status === 'arrived' ? ' 取消签到' : ' 确认到场'))}>{person.status === 'arrived' ? '取消签到' : '确认到场'}</button>}</div>)}
          {!ended && <button className="activity-secondary activity-wide" disabled={!onShareActivity} onClick={() => onShareActivity?.(activity)}><Users size={17} />邀请朋友</button>}
        </div>}
        {shownTab === 'calendar' && <div className="activity-content-stack">
          <div className="activity-panel"><h4>{startDate}</h4><strong>{timeRange}</strong><p>集合地点：{origin.name}</p><div className="activity-inline-actions"><button disabled={!onOpenCalendar} onClick={onOpenCalendar}><Calendar size={17} />在日历中查看</button><button onClick={exportCalendar}>导出 .ics 文件</button></div></div>
          {activity.agenda?.length ? <ol className="activity-agenda">{activity.agenda.map((item, index) => <li key={index}><time>{item.time}</time><div><b>{item.title}</b>{item.desc && <p>{item.desc}</p>}</div></li>)}</ol> : <p className="activity-empty">到达集合点后，按照活动时间安排参与。</p>}
          <button id="act-short-card-remind-btn" className="activity-secondary activity-wide" disabled={!writable || ended} onClick={() => save({ isReminderSet: !activity.isReminderSet, reminderMinutes: activity.reminderMinutes ?? 30 })}><Bell size={17} />{activity.isReminderSet ? (activity.reminderMinutes === 0 ? '取消开始时提醒' : '取消提前' + (activity.reminderMinutes ?? 30) + '分钟提醒') : activity.reminderMinutes === 0 ? '活动开始时提醒' : '提前' + (activity.reminderMinutes ?? 30) + '分钟提醒'}</button>
        </div>}
        {shownTab === 'updates' && <div className="activity-content-stack">
          {writable && !ended && <button className="activity-secondary activity-wide" onClick={() => photoInputRef.current?.click()}><Camera size={17} />记录活动照片</button>}
          {writable && !ended && <form className="activity-update-form" onSubmit={event => { event.preventDefault(); if (updateText.trim()) { save({}, actor.name + '：' + updateText.trim()); setUpdateText(''); } }}><input aria-label="活动动态内容" value={updateText} onChange={event => setUpdateText(event.target.value)} maxLength={300} placeholder="分享活动进展或现场消息" /><button aria-label="发布活动动态" disabled={!updateText.trim()}><Send size={18} /></button></form>}
          {!updates.length && <p className="activity-empty">报名、签到、需求和照片更新将在这里汇合。</p>}<ol className="activity-updates">{updates.map(update => <li key={update.id}><i /><div><p>{update.text}</p><time>{clockTime(update.createdAt)}</time></div></li>)}</ol>
        </div>}
        {shownTab === 'needs' && <div className="activity-content-stack">
          <div className="activity-section-heading"><h4>伙伴之间的互助</h4><span>已解决 {solved.length} · 待处理 {openNeeds.length}</span></div>{!needs.length && <p className="activity-empty">需要饮水、工具或同行协助？将需求标记在你的位置。</p>}
          {needs.map(need => <article className={'activity-need is-' + need.status} key={need.id}><div className="activity-section-heading"><h4>{need.title}</h4><span>{need.status === 'resolved' ? '已解决' : need.status === 'claimed' ? '处理中' : '待响应'}</span></div><p>{need.description || '向参与伙伴请求帮助'}</p><small>{need.authorName} · {clockTime(need.createdAt)}</small>{need.helperName && <p className="activity-helper"><HeartHandshake size={15} />{need.helperName} {need.status === 'resolved' ? '已完成帮助' : '正在帮助'}</p>}<div className="activity-inline-actions"><button disabled={!onFocusOnMap} onClick={() => onFocusOnMap?.(need.lat, need.lng)}><MapPin size={16} />地图位置</button>{!ended && writable && need.status === 'open' && <button onClick={() => updateNeed(need.id, 'claimed')}>我来帮忙</button>}{!ended && writable && need.status === 'claimed' && (need.helperId === actor.id || need.authorId === actor.id || admin) && <button onClick={() => updateNeed(need.id, 'resolved')}>确认解决</button>}</div></article>)}
          {!ended && <button className="activity-secondary activity-wide" disabled={!writable} onClick={() => setNeedComposer(true)}><Plus size={17} />发布新需求</button>}
          {solved.length > 0 && <div className="activity-achievement"><HeartHandshake size={26} /><div><h4>互助成就</h4><p>{solved.length} 条真实需求已解决 · {leaders.length} 位伙伴参与帮助</p>{leaders.slice(0, 3).map((leader, index) => <p key={index}>{index + 1}. {leader.name} · 帮助 {leader.count} 次</p>)}</div></div>}
        </div>}
        {shownTab === 'memory' && <div className="activity-content-stack">
          <div className="activity-memory-media">{moments.map(moment => <button key={moment.id} disabled={!onFocusOnMap} onClick={() => onFocusOnMap?.(moment.lat, moment.lng)} title={moment.caption + ' · 查看拍摄位置'}><img src={moment.url} alt={moment.caption || '活动照片'} /><span>{moment.caption || moment.authorName}</span></button>)}{!moments.length && <div className="activity-memory-empty"><Camera size={30} /><p>把这次相聚留在地图上</p><span>添加真实照片，生成你的活动记忆。</span></div>}</div>
          {writable && <button className="activity-secondary activity-wide" onClick={() => photoInputRef.current?.click()}><Camera size={17} />添加活动照片</button>}
          <div className="activity-stat-grid is-three"><div><Route size={19} /><b>{routeKm.toFixed(1)} km</b><small>坐标直线估算</small></div><div><Clock size={19} /><b>{Math.floor(elapsedActivitySeconds(activity, now) / 60)} min</b><small>活动时长</small></div><div><Users size={19} /><b>{confirmed.length} 人</b><small>确认参与</small></div></div>
          <div className="activity-panel"><h4><Sparkles size={19} />活动回顾 <small>本地整理</small></h4><p>{activity.assistantSummary || summarizeActivity(activity)}</p></div>
          <div className="activity-achievement"><HeartHandshake size={27} /><div><h4>互助成果</h4><p>解决 {solved.length} 条需求 · {leaders.length} 位伙伴提供帮助</p>{leaders[0] && <p><Crown size={15} />{leaders[0].name} · 帮助 {leaders[0].count} 次</p>}</div></div>
          {onCleanExpiredActivity && <button className="activity-text-button" onClick={() => onCleanExpiredActivity(activity.id)}>移除此活动记录</button>}
        </div>}
        {shownTab === 'settings' && <div className="activity-content-stack">
          <div className="activity-panel"><h4><Shield size={18} />谁可以看到活动</h4><div className="activity-privacy-options">{(Object.keys(PRIVACY) as ActivityPrivacyLevel[]).map(level => <button key={level} disabled={!writable || !admin} aria-pressed={(activity.privacyLevel || 'public') === level} onClick={() => changePrivacy(level)}>{PRIVACY[level]}</button>)}</div>{activity.privacyLevel === 'selected' && <div className="activity-visible-friends">{friends.filter(friend => !friend.isMe && friend.id !== 'me').map(friend => <button key={friend.id} disabled={!writable || !admin} aria-pressed={activity.visibleFriendIds?.includes(friend.id) || false} onClick={() => changePrivacy('selected', activity.visibleFriendIds?.includes(friend.id) ? activity.visibleFriendIds.filter(id => id !== friend.id) : [...activity.visibleFriendIds || [], friend.id])}><img src={friend.avatar} alt="" />{friend.name}</button>)}</div>}</div>
          <div className="activity-panel"><h4>地图与提醒</h4>{[['showLocationAndDistance', '显示成员位置'], ['showNavRoutesAndSpeed', '显示成员路线与速度']].map(([key, label]) => <label key={key} className="activity-toggle-row">{label}<input type="checkbox" disabled={!writable || !admin} checked={activity[key as 'showLocationAndDistance'] !== false} onChange={event => save({ [key]: event.target.checked })} /></label>)}<label className="activity-toggle-row">活动开始前提醒<input type="checkbox" disabled={!writable || ended} checked={Boolean(activity.isReminderSet)} onChange={event => save({ isReminderSet: event.target.checked, reminderMinutes: activity.reminderMinutes ?? 30 })} /></label></div>
          {admin && onEditActivity && !ended && <button className="activity-secondary activity-wide" onClick={() => onEditActivity(activity)}>编辑活动内容</button>}{onOpenManagementMode && admin && <button className="activity-secondary activity-wide" onClick={() => onOpenManagementMode(activity)}>打开活动管理</button>}{onOpenCleanModal && ended && <button className="activity-secondary activity-wide" onClick={onOpenCleanModal}>管理历史记录</button>}
        </div>}
        {assistant && <form className="activity-assistant activity-panel" onSubmit={runAssistant}><div className="activity-section-heading"><h4><Sparkles size={18} />AI 助手</h4><button type="button" className="activity-icon-button" aria-label="关闭活动助手" onClick={() => setAssistant(false)}><X size={18} /></button></div><p className="activity-muted">本地整理 · 基于当前活动信息，不包含联网检索或实时交通。</p><div className="activity-assistant-prompts">{['准备带什么？', '集合在哪里？', '有什么待处理需求？'].map((item, index) => <button type="button" key={`prompt-${item}-${index}`} onClick={() => setPrompt(item)}>{item}</button>)}</div><div className="activity-update-form"><input ref={assistantInputRef} aria-label="向活动助手提问" value={prompt} onChange={event => setPrompt(event.target.value)} placeholder="问问集合、装备或互助需求" /><button aria-label="整理活动建议"><Send size={18} /></button></div>{answer && <p aria-live="polite">{answer}</p>}</form>}
        {needComposer && <form className="activity-panel activity-need-composer" onSubmit={publishNeed}><div className="activity-section-heading"><h4>发一个需求</h4><button type="button" className="activity-icon-button" aria-label="关闭需求编辑" onClick={() => setNeedComposer(false)}><X size={18} /></button></div><label>需要什么<input ref={needInputRef} aria-label="需求名称" value={needTitle} maxLength={40} onChange={event => setNeedTitle(event.target.value)} placeholder="例如：需要两瓶饮用水" /></label><label>补充说明<textarea aria-label="需求说明" value={needDescription} maxLength={200} onChange={event => setNeedDescription(event.target.value)} placeholder="数量、情况或可提供的帮助" /></label><p className="activity-muted"><MapPin size={14} />将发布在你的当前地图位置</p><button className="activity-primary activity-wide" disabled={!needTitle.trim() || !writable}><Plus size={17} />发布需求</button></form>}
        {confirmEnd && <div ref={endRef} className="activity-panel activity-end-confirm"><h4>结束这次活动？</h4><p>会保留成员、照片和互助记录，生成活动记忆。</p><div className="activity-inline-actions"><button onClick={() => setConfirmEnd(false)}>继续活动</button><button onClick={() => { const finished = { ...activity, endedAt: now, activityState: '已结束' as const, statusText: '已结束', pausedAt: undefined, pausedDurationMs: (activity.pausedDurationMs || 0) + (activity.pausedAt ? now - activity.pausedAt : 0) }; save({ ...finished, assistantSummary: summarizeActivity(finished) }, '活动结束，记忆已保留'); setConfirmEnd(false); setManagement(false); setActiveTab('memory'); }}>确认结束</button></div></div>}
      </div>
      <footer className="activity-sheet-footer">{ended ? <><button className="activity-secondary" disabled={!writable} onClick={() => save({ templateSaved: !activity.templateSaved })}><Bookmark size={17} />{activity.templateSaved ? '已保存模板' : '保存模板'}</button><button className="activity-secondary" disabled={!onRepeatActivity} onClick={() => onRepeatActivity?.(activity)}><RotateCcw size={17} />再次发起</button><button className="activity-primary" disabled={!onShareActivity} onClick={() => onShareActivity?.(activity)}><Share2 size={17} />分享回忆</button></> : <><button id="act-short-card-nav-btn" className="activity-primary" disabled={!onNavigate} onClick={() => onNavigate?.({ ...activity, lat: origin.lat, lng: origin.lng })}><Navigation size={18} />{active ? '导航' : '路线'}</button>{active ? <button className="activity-secondary" disabled={!writable} onClick={() => { setNeedComposer(true); setActiveTab('needs'); }}><Plus size={18} />发需求</button> : <button id="act-short-card-join-btn" className="activity-secondary" disabled={!writable || joined || full || deadlinePassed} onClick={join}>{joined ? <Check size={18} /> : <Users size={18} />}{joined ? '已报名' : full ? '人数已满' : deadlinePassed ? '报名截止' : '报名参与'}</button>}<button className="activity-secondary" disabled={!onShareActivity} onClick={() => onShareActivity?.(activity)}><Users size={18} />邀请</button><button className="activity-ai-button" aria-pressed={assistant} onClick={() => { setAssistant(!assistant); if (!assistant) setAnswer(summarizeActivity(activity)); }}><Sparkles size={18} />AI 助手</button></>}</footer>
      <div className="activity-sheet-extra-actions"><button onClick={() => setActiveTab(activeTab === 'settings' ? active ? 'route' : 'details' : 'settings')}>设置</button>{admin && active && writable && <button className="activity-end-button" onClick={() => setConfirmEnd(true)}>结束活动</button>}</div>
      <input ref={photoInputRef} type="file" accept="image/*" multiple hidden aria-label="添加活动记忆照片" onChange={addPhotos} />
    </section>
  </div>;
};
