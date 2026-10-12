import React, { useState } from 'react';
import {
  X,
  Zap,
  Users,
  Clock,
  MapPin,
  FileText,
  Shield,
  CheckCircle2,
  Sparkles,
  Info,
  Radio,
  Eye,
} from 'lucide-react';
import { GroupMember, SquadItem, SquadBorderConfig, AuditLogItem } from './types';
import { PRESET_BORDER_STYLES } from './defaultData';

interface CreateSquadModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: GroupMember[];
  onSquadCreated: (squad: SquadItem) => void;
  showToast: (msg: string) => void;
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLogItem[]>>;
}

export const CreateSquadModal: React.FC<CreateSquadModalProps> = ({
  isOpen,
  onClose,
  members,
  onSquadCreated,
  showToast,
  setAuditLogs,
}) => {
  const [squadName, setSquadName] = useState('');
  const [targetGoal, setTargetGoal] = useState('');
  const [leaderId, setLeaderId] = useState(members[0]?.id || 'mem-1');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([members[0]?.id || 'mem-1']);
  const [description, setDescription] = useState('');
  const [selectedBorder, setSelectedBorder] = useState<SquadBorderConfig>(PRESET_BORDER_STYLES[0]);
  const [startTime, setStartTime] = useState('09:30');
  const [endTime, setEndTime] = useState('17:30');
  const [gatheringPoint, setGatheringPoint] = useState('兰州中山桥南广场 [36.0638, 103.8184]');
  const [visibilityRange, setVisibilityRange] = useState<'squad_only' | 'group_public'>('squad_only');
  const [associatedDocIds, setAssociatedDocIds] = useState<string[]>(['doc-1', 'doc-3']);

  if (!isOpen) return null;

  const toggleMember = (id: string) => {
    if (selectedMemberIds.includes(id)) {
      if (selectedMemberIds.length > 1) {
        setSelectedMemberIds(selectedMemberIds.filter((m) => m !== id));
      } else {
        showToast('小队至少需要包含1位成员');
      }
    } else {
      setSelectedMemberIds([...selectedMemberIds, id]);
    }
  };

  const toggleDoc = (docId: string) => {
    if (associatedDocIds.includes(docId)) {
      setAssociatedDocIds(associatedDocIds.filter((d) => d !== docId));
    } else {
      setAssociatedDocIds([...associatedDocIds, docId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!squadName.trim()) {
      showToast('请输入小队名称');
      return;
    }
    if (!targetGoal.trim()) {
      showToast('请输入小队核心任务目标');
      return;
    }

    const leader = members.find((m) => m.id === leaderId) || members[0];
    const squadMembers = members.filter((m) => selectedMemberIds.includes(m.id));

    const newSquad: SquadItem = {
      id: `squad-${Date.now()}`,
      name: squadName.trim(),
      targetGoal: targetGoal.trim(),
      leaderId: leader.id,
      leaderName: leader.name,
      leaderAvatar: leader.avatar,
      memberIds: selectedMemberIds,
      members: squadMembers,
      description: description.trim() || '执行专项踩线与应急测绘任务',
      borderConfig: selectedBorder,
      startTime,
      endTime,
      gatheringPoint,
      gatheringCoords: [36.0638, 103.8184],
      visibilityRange,
      associatedDocIds,
      status: 'active',
      progress: 10,
      recentChatSnippet: `${leader.name}: 小队已正式成立，临时定位窗口已开启。`,
    };

    onSquadCreated(newSquad);

    // Add Audit Log
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      operatorName: leader.name,
      operatorAvatar: leader.avatar,
      actionType: 'squad_created',
      title: `成立小队「${newSquad.name}」`,
      details: `指定小队长 ${leader.name}，任务时段 ${startTime}-${endTime}，邀请 ${selectedMemberIds.length} 位队员并配置专属头像边框。`,
      impactScope: `受邀队员在 ${startTime}-${endTime} 临时任务窗口内互见位置`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    showToast(`小队「${newSquad.name}」已成立，临时定位窗口已开启 ⚡`);
    onClose();
  };

  const demoDocOptions = [
    { id: 'doc-1', title: '《城市探索组协作手册》' },
    { id: 'doc-privacy-rule', title: '《小组定位与隐私规则》' },
    { id: 'doc-task-list', title: '《本周行动任务清单》' },
    { id: 'doc-2', title: '《9 月活动复盘》' },
    { id: 'doc-3', title: '《兰州城市路线知识库》' },
    { id: 'doc-5', title: '《项目素材.zip》' },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="create-squad-modal"
        className="relative w-full max-w-2xl bg-white rounded-md border border-[#E4E6EB] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="h-14 px-4 bg-white border-b border-[#E4E6EB] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1877F2]">
              <Zap size={18} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-gray-900">成立小队 · 临时任务编组</h2>
                <span className="text-[10px] px-1.5 py-0.5 font-bold rounded-sm bg-blue-50 text-[#1877F2] border border-blue-200">
                  工作台模块
                </span>
              </div>
              <p className="text-[11px] text-gray-500">
                配置临时任务时段、集合坐标、专属头像边框与授权窗口
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            aria-label="关闭成立小队弹窗"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Squad Name & Target Goal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">小队名称 *</label>
              <input
                type="text"
                placeholder="例如：白塔山踩线先锋队"
                value={squadName}
                onChange={(e) => setSquadName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E4E6EB] rounded-sm focus:outline-none focus:border-[#1877F2] bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">小队长 *</label>
              <select
                value={leaderId}
                onChange={(e) => setLeaderId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E4E6EB] rounded-sm focus:outline-none focus:border-[#1877F2] bg-white cursor-pointer"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.roleLabel})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">任务目标 *</label>
            <input
              type="text"
              placeholder="例如：完成白塔山至中山桥历史步道打卡点坐标校核"
              value={targetGoal}
              onChange={(e) => setTargetGoal(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#E4E6EB] rounded-sm focus:outline-none focus:border-[#1877F2] bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">任务详细说明</label>
            <textarea
              rows={2}
              placeholder="说明任务背景、行进要点与注意事项..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#E4E6EB] rounded-sm focus:outline-none focus:border-[#1877F2] bg-white"
            />
          </div>

          {/* Squad Avatar Border Config */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              小队专属头像边框样式 (地图/列表/任务/频道全局一致)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_BORDER_STYLES.map((border, idx) => {
                const isSelected = selectedBorder.name === border.name;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedBorder(border)}
                    className={`p-2.5 rounded-sm border cursor-pointer transition-all flex items-center space-x-3 ${
                      isSelected
                        ? 'border-[#1877F2] bg-blue-50/40 shadow-2xs ring-1 ring-[#1877F2]'
                        : 'border-[#E4E6EB] hover:border-gray-400 bg-white'
                    }`}
                  >
                    {/* Border Demo Avatar */}
                    <div className="relative shrink-0">
                      <img
                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"
                        alt="border preview"
                        className="w-8 h-8 rounded-full object-cover"
                        style={{
                          borderWidth: '2.5px',
                          borderStyle: border.style,
                          borderColor: border.color,
                        }}
                      />
                      <span className="absolute -top-1.5 -right-1.5 text-[11px] bg-white rounded-full p-0.5 shadow-2xs">
                        {border.badge}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-gray-900 truncate">{border.name}</div>
                      <div className="text-[10px] text-gray-500 truncate">
                        {border.style === 'solid' ? '实线' : border.style === 'double' ? '双线' : '虚线'} · 徽章 {border.badge}
                      </div>
                    </div>

                    {isSelected && <CheckCircle2 size={15} className="text-[#1877F2] shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time Window & Gathering Point */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">开始时间</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E4E6EB] rounded-sm focus:outline-none focus:border-[#1877F2] bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">结束时间</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E4E6EB] rounded-sm focus:outline-none focus:border-[#1877F2] bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">可见范围</label>
              <select
                value={visibilityRange}
                onChange={(e) =>
                  setVisibilityRange(e.target.value as 'squad_only' | 'group_public')
                }
                className="w-full px-3 py-2 text-xs border border-[#E4E6EB] rounded-sm focus:outline-none focus:border-[#1877F2] bg-white cursor-pointer"
              >
                <option value="squad_only">小队成员互见 (推荐)</option>
                <option value="group_public">全组成员可见</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">集合坐标与地点</label>
            <input
              type="text"
              value={gatheringPoint}
              onChange={(e) => setGatheringPoint(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#E4E6EB] rounded-sm focus:outline-none focus:border-[#1877F2] bg-white"
            />
          </div>

          {/* Member Invitation & Separate Consent Reminder */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-800">
                邀请小队成员 (已选 {selectedMemberIds.length} 人)
              </label>
              <span className="text-[10px] text-gray-500">成员将收到邀请并单独确认定位</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {members.map((member) => {
                const isChecked = selectedMemberIds.includes(member.id);
                return (
                  <div
                    key={member.id}
                    onClick={() => toggleMember(member.id)}
                    className={`p-2 rounded-sm border cursor-pointer flex items-center space-x-2 transition-all ${
                      isChecked
                        ? 'border-[#1877F2] bg-blue-50/50'
                        : 'border-[#E4E6EB] hover:border-gray-400 bg-white'
                    }`}
                  >
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-6 h-6 rounded-full object-cover border border-[#E4E6EB]"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-gray-900 truncate">{member.name}</div>
                      <div className="text-[9px] text-gray-400 truncate">{member.roleLabel}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Associated Documents */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              关联小组文档 / 协作资料
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {demoDocOptions.map((doc) => {
                const isSelected = associatedDocIds.includes(doc.id);
                return (
                  <div
                    key={doc.id}
                    onClick={() => toggleDoc(doc.id)}
                    className={`p-2 rounded-sm border cursor-pointer flex items-center justify-between text-xs transition-all ${
                      isSelected
                        ? 'border-[#1877F2] bg-blue-50/40 text-[#1877F2] font-bold'
                        : 'border-[#E4E6EB] text-gray-700 bg-white hover:border-gray-400'
                    }`}
                  >
                    <span className="truncate">{doc.title}</span>
                    {isSelected && <CheckCircle2 size={13} className="text-[#1877F2] shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Auto Privacy Guarantee Banner */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-sm text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center space-x-1">
              <Shield size={13} className="text-amber-700" />
              <span>小队时段临时定位刚性保护协议</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              活动时段 ({startTime} - {endTime}) 内，仅已确认同意定位的队员互见位置；时段一旦到达 {endTime}，实时定位将自动立刻关闭并记录归档。
            </p>
          </div>

          {/* Bottom Actions */}
          <div className="pt-3 flex items-center justify-end space-x-2 border-t border-[#E4E6EB]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100 rounded-sm border border-[#E4E6EB] transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-[#1877F2] hover:bg-[#166FE5] active:scale-[0.98] rounded-sm border border-[#1877F2] shadow-2xs transition-all cursor-pointer flex items-center space-x-1"
            >
              <Zap size={13} />
              <span>立即成立小队并开启窗口</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
