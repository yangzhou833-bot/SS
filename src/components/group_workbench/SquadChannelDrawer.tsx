import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  MessageSquare,
  AlertTriangle,
  Radio,
  MapPin,
  FileText,
  Image as ImageIcon,
  Paperclip,
  CheckCircle2,
  Phone,
  Video,
  BellOff,
  Eye,
  Clock,
  Sparkles,
  Info,
  ChevronRight,
  Shield,
  Zap,
  CornerDownRight,
  UserCheck,
  Check,
  CheckCheck,
  Navigation,
} from 'lucide-react';
import {
  SquadItem,
  GroupMember,
  SquadChatMessage,
  InTeamChatMode,
  SquadBorderConfig,
  AuditLogItem,
} from './types';
import { WaveAvatar } from './WaveAvatar';

interface SquadChannelDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  squad: SquadItem;
  members: GroupMember[];
  messages: SquadChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<SquadChatMessage[]>>;
  onEndSquadWindow: (squadId: string) => void;
  onSimulateArrived: () => void;
  showToast: (msg: string) => void;
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLogItem[]>>;
  onOpenDoc?: (docId: string) => void;
  onOpenMissionControl?: (squad: SquadItem) => void;
}

export const SquadChannelDrawer: React.FC<SquadChannelDrawerProps> = ({
  isOpen,
  onClose,
  squad,
  members,
  messages,
  setMessages,
  onEndSquadWindow,
  onSimulateArrived,
  showToast,
  setAuditLogs,
  onOpenDoc,
  onOpenMissionControl,
}) => {
  const [activeMode, setActiveMode] = useState<InTeamChatMode>('squad_channel');
  const [inputText, setInputText] = useState('');
  const [isEmergencyOnly, setIsEmergencyOnly] = useState(false);
  const [isThreadMuted, setIsThreadMuted] = useState(false);
  const [activeThreadReplyId, setActiveThreadReplyId] = useState<string | null>(null);
  const [threadReplyInput, setThreadReplyInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const currentUserId = 'mem-1';
  const currentUser = members.find((m) => m.id === currentUserId) || members[0];

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: SquadChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: `${currentUser.name} (${currentUser.roleLabel})`,
      senderAvatar: currentUser.avatar,
      senderRole: currentUser.roleLabel,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      content: inputText.trim(),
      mode: activeMode,
      isSelf: true,
      isEmergency: activeMode === 'emergency_broadcast',
      acknowledgedUserIds: activeMode === 'emergency_broadcast' ? [currentUser.id] : undefined,
      squadBorder: squad.borderConfig,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    if (activeMode === 'emergency_broadcast') {
      showToast('【🚨 紧急广播】已发布并置顶，要求全员确认已读！');
      // Add audit log
      const log: AuditLogItem = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        operatorName: currentUser.name,
        operatorAvatar: currentUser.avatar,
        actionType: 'broadcast_sent',
        title: `发布紧急广播「${inputText.trim().slice(0, 20)}...」`,
        details: `在小队「${squad.name}」频道发布全员强制置顶广播`,
        impactScope: '小队全员与在线管理员置顶强提醒',
      };
      setAuditLogs((prev) => [log, ...prev]);
    }
  };

  const handleAcknowledgeEmergency = (msgId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === msgId
          ? {
              ...msg,
              acknowledgedUserIds: Array.from(
                new Set([...(msg.acknowledgedUserIds || []), currentUser.id])
              ),
            }
          : msg
      )
    );
    showToast('已确认已读该紧急广播 ✅');
  };

  const handleAddThreadReply = (msgId: string) => {
    if (!threadReplyInput.trim()) return;

    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === msgId) {
          const replies = msg.threadReplies || [];
          return {
            ...msg,
            threadReplies: [
              ...replies,
              {
                id: `tr-${Date.now()}`,
                senderName: currentUser.name,
                senderAvatar: currentUser.avatar,
                content: threadReplyInput.trim(),
                time: new Date().toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
              },
            ],
          };
        }
        return msg;
      })
    );
    setThreadReplyInput('');
    showToast('已发表任务线程回复 💬');
  };

  const handleSendQuickStatus = (statusTitle: string) => {
    let content = '';
    let locationStatusCard: SquadChatMessage['locationStatusCard'] | undefined = undefined;

    if (statusTitle === '我已到达') {
      content = `【📍 状态播报】我已顺利到达集合点「${squad.gatheringPoint}」，状态良好！`;
      locationStatusCard = {
        locationName: squad.gatheringPoint,
        time: new Date().toLocaleTimeString('zh-CN'),
        isArrived: true,
        accuracy: 'RTK 亚米级 ±0.3m',
      };
      onSimulateArrived();
    } else if (statusTitle === '我在路上') {
      content = `【🚶 状态播报】我正在前往集合点，预计 10 分钟后到达，保持通信正常。`;
      locationStatusCard = {
        locationName: '黄河南岸滨河路段 (在途)',
        time: new Date().toLocaleTimeString('zh-CN'),
        isArrived: false,
        accuracy: 'GPS 定位 ±3.0m',
      };
    } else if (statusTitle === '需要帮助') {
      content = `【⚠️ 状态播报】遇到路段施工/物资不足，请求小队领队或后勤支援！`;
    } else if (statusTitle === '任务完成') {
      content = `【🎉 状态播报】本阶段踩线与标定任务已全部顺利完成，准备归档！`;
    } else if (statusTitle === '共享当前位置 15 分钟') {
      content = `【🛰️ 临时位置共享】已开启 15 分钟临时应急高频位置广播，请注意查收。`;
      locationStatusCard = {
        locationName: '实时动态航迹点 (15分钟)',
        time: new Date().toLocaleTimeString('zh-CN'),
        isArrived: false,
        accuracy: '高频流式共享',
      };
    }

    const newMsg: SquadChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: `${currentUser.name} (${currentUser.roleLabel})`,
      senderAvatar: currentUser.avatar,
      senderRole: currentUser.roleLabel,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      content,
      mode: 'status_broadcast',
      isSelf: true,
      locationStatusCard,
      squadBorder: squad.borderConfig,
    };

    setMessages((prev) => [...prev, newMsg]);
    showToast(`已发送快捷状态：「${statusTitle}」`);
  };

  const emergencyMessages = messages.filter((m) => m.isEmergency);
  const filteredMessages = messages.filter((m) => {
    if (isEmergencyOnly) return m.isEmergency;
    if (activeMode === 'squad_channel') return true;
    return m.mode === activeMode;
  });

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-end bg-black/45 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="squad-channel-drawer"
        className="relative w-full max-w-xl h-full bg-white border-l border-[#E4E6EB] shadow-2xl flex flex-col animate-in slide-in-from-right duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="h-16 px-4 bg-white border-b border-[#E4E6EB] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <WaveAvatar
              src={squad.leaderAvatar}
              name={squad.leaderName}
              size={40}
              isCaptain={true}
              badgeIcon={squad.borderConfig.badge}
              borderConfig={squad.borderConfig}
              className="shrink-0"
            />

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-gray-900">{squad.name}</h3>
                <span className="text-[10px] px-1.5 py-0.2 bg-blue-50 text-[#1877F2] font-bold rounded-sm border border-blue-200">
                  {squad.status === 'active' ? '执行中' : squad.status === 'preparing' ? '筹备中' : '已完成'}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 flex items-center space-x-2">
                <span>时段: {squad.startTime} - {squad.endTime}</span>
                <span>·</span>
                <span>集合点: {squad.gatheringPoint.split(' ')[0]}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* Open Tactical Mission Control */}
            {onOpenMissionControl && (
              <button
                onClick={() => onOpenMissionControl(squad)}
                className="px-2.5 py-1 text-xs font-bold text-[#1877F2] bg-blue-50 hover:bg-[#1877F2] hover:text-white rounded-sm border border-blue-200 hover:border-[#1877F2] transition-colors cursor-pointer flex items-center space-x-1"
                title="打开小队行动指挥台"
              >
                <Navigation size={12} />
                <span>行动指挥台</span>
              </button>
            )}

            {/* End Squad Window Button */}
            {squad.status === 'active' && (
              <button
                onClick={() => {
                  onEndSquadWindow(squad.id);
                  showToast('小队活动时段已结束，实时定位已自动关闭并归档 🛡️');
                }}
                className="px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-sm border border-rose-200 transition-colors cursor-pointer"
                title="结束小队活动时段，自动关闭实时定位"
              >
                结束时段
              </button>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
              aria-label="关闭频道"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Pinned Emergency Broadcast Banner (if any) */}
        {emergencyMessages.length > 0 && (
          <div className="bg-rose-50 border-b border-rose-200 p-2.5 px-4 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-rose-900">
              <div className="flex items-center space-x-1.5">
                <AlertTriangle size={14} className="text-rose-600 animate-pulse" />
                <span>置顶紧急广播</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 bg-rose-200 text-rose-800 rounded-sm font-bold">
                强制确认
              </span>
            </div>
            {emergencyMessages.slice(-1).map((em) => {
              const isAcknowledged = em.acknowledgedUserIds?.includes(currentUser.id);
              return (
                <div key={em.id} className="flex items-center justify-between gap-2">
                  <p className="text-xs text-rose-800 font-medium truncate flex-1">
                    {em.content}
                  </p>
                  <button
                    onClick={() => handleAcknowledgeEmergency(em.id)}
                    disabled={isAcknowledged}
                    className={`px-2 py-0.5 text-[11px] font-bold rounded-sm border shrink-0 transition-all cursor-pointer flex items-center space-x-1 ${
                      isAcknowledged
                        ? 'bg-rose-100 text-rose-500 border-rose-200 cursor-default'
                        : 'bg-rose-600 text-white border-rose-600 hover:bg-rose-700 shadow-2xs'
                    }`}
                  >
                    {isAcknowledged ? <CheckCheck size={12} /> : <Check size={12} />}
                    <span>{isAcknowledged ? '已确认' : '确认已读'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* 4 In-Team Communication Modes Selector */}
        <div className="px-3 py-2 bg-[#F8FAFC] border-b border-[#E4E6EB] flex items-center justify-between gap-1 overflow-x-auto shrink-0">
          <div className="flex items-center space-x-1">
            {[
              { id: 'squad_channel', label: '小队频道', icon: MessageSquare },
              { id: 'task_thread', label: '任务线程', icon: CornerDownRight },
              { id: 'status_broadcast', label: '状态播报', icon: Radio },
              { id: 'emergency_broadcast', label: '紧急广播', icon: AlertTriangle },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeMode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveMode(tab.id as InTeamChatMode);
                    setIsEmergencyOnly(false);
                  }}
                  className={`px-2.5 py-1 text-xs font-bold rounded-sm transition-all flex items-center space-x-1 shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#1877F2] border border-[#E4E6EB] shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon size={12} className={isActive ? 'text-[#1877F2]' : 'text-gray-400'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-1 text-xs text-gray-500 shrink-0">
            <button
              onClick={() => {
                setIsEmergencyOnly(!isEmergencyOnly);
                showToast(isEmergencyOnly ? '已显示全部交流信息' : '已过滤为仅接收紧急广播 🚨');
              }}
              className={`p-1 rounded-sm border cursor-pointer ${
                isEmergencyOnly
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-white border-[#E4E6EB] text-gray-600'
              }`}
              title="只接收紧急广播"
            >
              <AlertTriangle size={13} />
            </button>
            <button
              onClick={() => {
                setIsThreadMuted(!isThreadMuted);
                showToast(isThreadMuted ? '已开启任务线程通知' : '已静音任务线程 🔕');
              }}
              className={`p-1 rounded-sm border cursor-pointer ${
                isThreadMuted
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-white border-[#E4E6EB] text-gray-600'
              }`}
              title="静音任务线程"
            >
              <BellOff size={13} />
            </button>
          </div>
        </div>

        {/* Quick Status Buttons Bar */}
        <div className="px-3 py-1.5 bg-white border-b border-[#E4E6EB] flex items-center space-x-1.5 overflow-x-auto shrink-0">
          <span className="text-[10px] font-bold text-gray-400 shrink-0">快捷播报：</span>
          {['我已到达', '我在路上', '需要帮助', '任务完成', '共享当前位置 15 分钟'].map(
            (btnText) => (
              <button
                key={btnText}
                onClick={() => handleSendQuickStatus(btnText)}
                className="px-2.5 py-1 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-gray-800 text-xs font-bold rounded-sm border border-[#E4E6EB] whitespace-nowrap transition-colors cursor-pointer shrink-0"
              >
                {btnText}
              </button>
            )
          )}
        </div>

        {/* Messages List Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAFAFA]">
          {filteredMessages.map((msg) => {
            const isSelf = msg.senderId === currentUser.id;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} space-y-1`}
              >
                {/* Sender Info */}
                <div className="flex items-center space-x-1.5 text-[11px] text-gray-500">
                  <span className="font-bold text-gray-800">{msg.senderName}</span>
                  <span>·</span>
                  <span className="font-mono text-[10px]">{msg.time}</span>
                  {msg.isEmergency && (
                    <span className="text-[9px] px-1 bg-rose-100 text-rose-700 font-bold rounded-xs border border-rose-200">
                      紧急广播
                    </span>
                  )}
                </div>

                {/* Message Bubble */}
                <div className="flex items-start space-x-2 max-w-[90%]">
                  {!isSelf && (
                    <WaveAvatar
                      src={msg.senderAvatar}
                      name={msg.senderName}
                      size={28}
                      isCaptain={msg.senderRole?.includes('队长') || msg.senderRole?.includes('领队')}
                      badgeIcon={msg.squadBorder?.badge || '⚡'}
                      borderConfig={
                        msg.squadBorder || {
                          color: '#1877F2',
                          style: 'solid',
                          badge: '⚡',
                          name: '先锋队',
                        }
                      }
                      className="shrink-0 mt-0.5"
                    />
                  )}

                  <div
                    className={`p-3 rounded-md text-xs leading-relaxed shadow-2xs border ${
                      msg.isEmergency
                        ? 'bg-rose-50 border-rose-300 text-rose-950 font-medium'
                        : isSelf
                        ? 'bg-blue-50/80 border-blue-200 text-gray-900'
                        : 'bg-white border-[#E4E6EB] text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* Location Status Card */}
                    {msg.locationStatusCard && (
                      <div className="mt-2 p-2 bg-white/90 border border-[#E4E6EB] rounded-sm flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-blue-50 text-[#1877F2] flex items-center justify-center shrink-0">
                          <MapPin size={13} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-gray-900 text-xs">
                            {msg.locationStatusCard.locationName}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {msg.locationStatusCard.accuracy} · {msg.locationStatusCard.time}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Attached File Preview */}
                    {msg.attachedFile && (
                      <div
                        onClick={() => {
                          if (onOpenDoc) onOpenDoc('doc-1');
                          showToast(`已在文档库中打开 ${msg.attachedFile?.name}`);
                        }}
                        className="mt-2 p-2 bg-white/90 border border-[#E4E6EB] hover:border-[#1877F2] rounded-sm flex items-center space-x-2 cursor-pointer transition-colors"
                      >
                        <FileText size={16} className="text-[#1877F2] shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-gray-900 text-xs truncate">
                            {msg.attachedFile.name}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {msg.attachedFile.size} · 点击预览
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Thread Replies List */}
                    {msg.threadReplies && msg.threadReplies.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200 space-y-1.5">
                        <div className="text-[10px] font-bold text-gray-500 uppercase">
                          任务线程回复 ({msg.threadReplies.length})
                        </div>
                        {msg.threadReplies.map((tr) => (
                          <div
                            key={tr.id}
                            className="bg-gray-50 border border-gray-200 rounded-sm p-1.5 text-[11px]"
                          >
                            <span className="font-bold text-gray-800">{tr.senderName}: </span>
                            <span>{tr.content}</span>
                            <span className="text-[9px] text-gray-400 ml-1 font-mono">{tr.time}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply to Thread Trigger */}
                    {msg.mode === 'task_thread' && (
                      <div className="mt-2 flex items-center justify-between text-[10px] text-gray-500 border-t border-gray-100 pt-1">
                        <button
                          onClick={() =>
                            setActiveThreadReplyId(
                              activeThreadReplyId === msg.id ? null : msg.id
                            )
                          }
                          className="font-bold text-[#1877F2] hover:underline flex items-center space-x-0.5 cursor-pointer"
                        >
                          <CornerDownRight size={10} />
                          <span>回复线程</span>
                        </button>
                      </div>
                    )}

                    {/* Inline Thread Reply Input */}
                    {activeThreadReplyId === msg.id && (
                      <div className="mt-2 flex items-center space-x-1">
                        <input
                          type="text"
                          placeholder="输入线程回复并 @成员..."
                          value={threadReplyInput}
                          onChange={(e) => setThreadReplyInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddThreadReply(msg.id);
                            }
                          }}
                          className="flex-1 px-2 py-1 text-xs border border-[#E4E6EB] rounded-sm focus:outline-none focus:border-[#1877F2] bg-white"
                        />
                        <button
                          onClick={() => handleAddThreadReply(msg.id)}
                          className="px-2 py-1 bg-[#1877F2] text-white text-xs font-bold rounded-sm border border-[#1877F2] cursor-pointer"
                        >
                          发送
                        </button>
                      </div>
                    )}
                  </div>

                  {isSelf && (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                      style={{
                        borderWidth: '1.5px',
                        borderStyle: squad.borderConfig.style,
                        borderColor: squad.borderConfig.color,
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Demo Voice / Video Calls Header Strip */}
        <div className="px-3 py-1.5 bg-[#F8FAFC] border-t border-[#E4E6EB] flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => showToast('【原型演示】小队语音通话连线已开启 📞')}
              className="px-2 py-1 bg-white hover:bg-gray-100 border border-[#E4E6EB] rounded-sm text-xs font-bold text-gray-700 flex items-center space-x-1 cursor-pointer"
            >
              <Phone size={12} className="text-[#1877F2]" />
              <span>小队对讲 (演示)</span>
            </button>

            <button
              onClick={() => showToast('【原型演示】多方协同视频会议已发起 🎥')}
              className="px-2 py-1 bg-white hover:bg-gray-100 border border-[#E4E6EB] rounded-sm text-xs font-bold text-gray-700 flex items-center space-x-1 cursor-pointer"
            >
              <Video size={12} className="text-[#1877F2]" />
              <span>视频会议 (演示)</span>
            </button>
          </div>

          <span className="text-[10px] text-gray-400">全部通讯协议已加密</span>
        </div>

        {/* Message Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 bg-white border-t border-[#E4E6EB] flex items-center space-x-2 shrink-0"
        >
          <input
            type="text"
            placeholder={
              activeMode === 'emergency_broadcast'
                ? '输入全员置顶紧急广播内容...'
                : activeMode === 'task_thread'
                ? '输入任务线程讨论（支持 @成员）...'
                : '在小队频道中发送消息...'
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-3 py-2 text-xs border border-[#E4E6EB] rounded-sm focus:outline-none focus:border-[#1877F2]"
          />

          <button
            type="submit"
            className="px-4 py-2 bg-[#1877F2] hover:bg-[#166FE5] active:scale-[0.98] text-white text-xs font-bold rounded-sm border border-[#1877F2] shadow-2xs transition-all flex items-center space-x-1 cursor-pointer"
          >
            <Send size={13} />
            <span>发送</span>
          </button>
        </form>
      </div>
    </div>
  );
};
