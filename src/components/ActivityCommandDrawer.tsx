import React, { useEffect, useRef, useState } from 'react';
import { Calendar, MapPin, Plus, Users, X, ChevronRight, Bookmark, Search } from 'lucide-react';
import { SimulatedMapActivity } from '../types';
import { getActivityStatusInfo } from '../utils/countdownHelper';

interface ActivityCommandDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activities: SimulatedMapActivity[];
  selectedActivityId?: string | null;
  onSelectActivity: (activity: SimulatedMapActivity) => void;
  onOpenCreateActivity: () => void;
  onFocusOnMap?: (activity: SimulatedMapActivity) => void;
  onShareActivity?: (activity: SimulatedMapActivity) => void;
  onOpenCleanModal?: () => void;
  onToggleAllParticipantsArrived?: (activityId: string) => void;
  initialTab?: 'all' | 'active' | 'upcoming' | 'my' | 'archived' | 'management';
  showToast?: (message: string) => void;
  reducedMotion?: boolean;
}

export const ActivityCommandDrawer: React.FC<ActivityCommandDrawerProps> = ({
  isOpen, onClose, activities, selectedActivityId, onSelectActivity, onOpenCreateActivity,
  onOpenCleanModal, initialTab = 'all', reducedMotion = false,
}: ActivityCommandDrawerProps) => {
  const [activeTab, setActiveTab] = useState(initialTab === 'management' ? 'my' : initialTab);
  const [query, setQuery] = useState('');
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (isOpen) { setActiveTab(initialTab === 'management' ? 'my' : initialTab); setQuery(''); closeRef.current?.focus({ preventScroll: true }); } }, [isOpen, initialTab]);
  useEffect(() => {
    if (!isOpen) return;
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); onClose(); } };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  const filtered = activities.filter(activity => {
    const status = getActivityStatusInfo(activity);
    const matchesTab = activeTab === 'active' ? !status.isExpired && status.statusLabel === '进行中'
      : activeTab === 'upcoming' ? !status.isExpired && status.statusLabel === '即将开始'
      : activeTab === 'archived' ? status.isExpired
      : activeTab === 'my' ? activity.isUserPublished || activity.isUserAdmin || activity.participants.some(person => ['me', 'p-me'].includes(person.id))
      : !status.isArchived;
    return matchesTab && (!query.trim() || (activity.title + activity.locationName + activity.category).toLowerCase().includes(query.trim().toLowerCase()));
  });
  const tabs = [['all', '全部'], ['upcoming', '准备中'], ['active', '进行中'], ['my', '我的'], ['archived', '活动记忆']] as const;
  return <div className="stellar-activity-layer" data-reduced-motion={reducedMotion}>
    <section className="stellar-activity-sheet activity-list-sheet" role="dialog" aria-modal="false" aria-label="我的活动" onClick={event => event.stopPropagation()}>
      <div className="activity-grip" aria-hidden="true" />
      <header className="activity-sheet-header"><div><span className="activity-list-kicker">把计划放到地图上</span><h2>一起去生活</h2></div><button ref={closeRef} className="activity-icon-button" aria-label="关闭活动列表" onClick={onClose}><X size={22} /></button></header>
      <div className="activity-sheet-scroll">
        <div className="activity-search"><Search size={18} /><input aria-label="搜索活动" value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索活动、地点或兴趣" /></div>
        <nav className="activity-tabs" aria-label="筛选活动">{tabs.map(([id, label]) => <button key={id} aria-pressed={activeTab === id} onClick={() => setActiveTab(id)}>{label}</button>)}</nav>
        <div className="activity-list">{filtered.map(activity => {
          const status = getActivityStatusInfo(activity);
          return <button key={activity.id} id={'activity-card-' + activity.id} className="activity-list-card" aria-current={selectedActivityId === activity.id ? 'true' : undefined} onClick={() => { onSelectActivity(activity); onClose(); }}>
            <div className="activity-list-cover">{activity.coverImageUrl ? <img src={activity.coverImageUrl} alt="" /> : <span>{activity.icon || '🎯'}</span>}</div>
            <div className="activity-list-copy"><span className={'activity-phase ' + (status.isExpired ? 'is-ended' : status.statusLabel === '进行中' ? 'is-active' : '')}><i />{status.isExpired ? '活动记忆' : status.statusLabel === '进行中' ? '进行中' : '准备中'}</span><h3>{activity.title}</h3><p><Calendar size={13} />{[activity.dateStr || activity.date, activity.startTime].filter(Boolean).join(' · ') || '时间待确认'}</p><p><MapPin size={13} />{activity.locationName}</p><div className="activity-list-meta"><span><Users size={13} />{activity.participants.filter(person => person.invitationStatus !== 'invited').length} 人参与</span>{activity.templateSaved && <span><Bookmark size={13} />已存模板</span>}</div></div><ChevronRight size={19} />
          </button>;
        })}{!filtered.length && <div className="activity-memory-empty"><Calendar size={34} /><h3>{query.trim() ? '没有找到相关活动' : activeTab === 'archived' ? '下一次相聚，会成为新的记忆' : '这里还没有活动'}</h3><p>从一次散步、骑行或咖啡聚会开始。</p></div>}</div>
      </div>
      <footer className="activity-sheet-footer"><button className="activity-primary activity-wide" onClick={() => { onClose(); onOpenCreateActivity(); }}><Plus size={20} />发起活动</button>{onOpenCleanModal && activeTab === 'archived' && <button className="activity-secondary" onClick={onOpenCleanModal}>管理记录</button>}</footer>
    </section>
  </div>;
};
