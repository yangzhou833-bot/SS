import React, { useState } from 'react';
import {
  X,
  Building,
  Users,
  Clock,
  MapPin,
  Shield,
  FileCheck,
  Zap,
  FileText,
  History,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Sliders,
  Sparkles,
  Info,
  Calendar,
  Lock,
  Compass,
} from 'lucide-react';
import {
  GroupMember,
  GroupWorkSchedule,
  RegionAnimalConfig,
  SquadItem,
  GroupTaskItem,
  AuditLogItem,
  LocationRuleState,
  GroupRole,
} from './types';
import { REGION_ANIMALS } from './defaultData';
import { LocationRulesTimeline } from './LocationRulesTimeline';

interface ManageGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
  setGroupName: (name: string) => void;
  groupDescription: string;
  setGroupDescription: (desc: string) => void;
  selectedRegionAnimal: RegionAnimalConfig;
  setSelectedRegionAnimal: (animal: RegionAnimalConfig) => void;
  schedule: GroupWorkSchedule;
  setSchedule: React.Dispatch<React.SetStateAction<GroupWorkSchedule>>;
  members: GroupMember[];
  setMembers: React.Dispatch<React.SetStateAction<GroupMember[]>>;
  squads: SquadItem[];
  tasks: GroupTaskItem[];
  auditLogs: AuditLogItem[];
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLogItem[]>>;
  showToast: (msg: string) => void;
}

type ManageTab =
  | 'basic'
  | 'members'
  | 'schedule'
  | 'location_coords'
  | 'rules'
  | 'consent_logs'
  | 'squads'
  | 'task_templates'
  | 'file_permissions'
  | 'audit_logs';

export const ManageGroupModal: React.FC<ManageGroupModalProps> = ({
  isOpen,
  onClose,
  groupName,
  setGroupName,
  groupDescription,
  setGroupDescription,
  selectedRegionAnimal,
  setSelectedRegionAnimal,
  schedule,
  setSchedule,
  members,
  setMembers,
  squads,
  tasks,
  auditLogs,
  setAuditLogs,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<ManageTab>('basic');

  // Local form states
  const [tempGroupName, setTempGroupName] = useState(groupName);
  const [tempDescription, setTempDescription] = useState(groupDescription);
  const [tempAnimal, setTempAnimal] = useState(selectedRegionAnimal);
  const [tempStartTime, setTempStartTime] = useState(schedule.startTime);
  const [tempEndTime, setTempEndTime] = useState(schedule.endTime);
  const [tempTimezone, setTempTimezone] = useState(schedule.timezone);
  const [tempWorkDays, setTempWorkDays] = useState<string[]>(schedule.workDays);
  const [tempOfficeName, setTempOfficeName] = useState(schedule.officeName);
  const [tempRadius, setTempRadius] = useState(schedule.effectiveRadiusMeters);
  const [tempRuleState, setTempRuleState] = useState<LocationRuleState>(schedule.locationRuleState);

  if (!isOpen) return null;

  const toggleWorkDay = (day: string) => {
    if (tempWorkDays.includes(day)) {
      if (tempWorkDays.length > 1) {
        setTempWorkDays(tempWorkDays.filter((d) => d !== day));
      } else {
        showToast('至少需要保留一个工作日');
      }
    } else {
      setTempWorkDays([...tempWorkDays, day]);
    }
  };

  const handleUpdateMemberRole = (memberId: string, newRole: GroupRole) => {
    const roleLabels: Record<GroupRole, string> = {
      leader: '组长',
      admin: '管理员',
      squad_leader: '小队长',
      squad_member: '小队成员',
      member: '普通成员',
    };
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? { ...m, role: newRole, roleLabel: roleLabels[newRole] }
          : m
      )
    );
    const target = members.find((m) => m.id === memberId);
    showToast(`已将「${target?.name}」角色调整为：${roleLabels[newRole]}`);
  };

  const handleSaveAllChanges = () => {
    setGroupName(tempGroupName);
    setGroupDescription(tempDescription);
    setSelectedRegionAnimal(tempAnimal);

    setSchedule((prev) => ({
      ...prev,
      startTime: tempStartTime,
      endTime: tempEndTime,
      timezone: tempTimezone,
      workDays: tempWorkDays,
      officeName: tempOfficeName,
      effectiveRadiusMeters: tempRadius,
      locationRuleState: tempRuleState,
    }));

    // Add Audit Log
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      operatorName: 'Alex Mercer (组长)',
      operatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      actionType: 'rule_update',
      title: '更新小组管理配置与定位时段规则',
      details: `更新工作时间为 ${tempWorkDays.join('、')} ${tempStartTime}-${tempEndTime}，办公坐标：${tempOfficeName} (${tempRadius}米半径)。`,
      impactScope: `影响全组 ${members.length} 位成员的位置聚合与工作台展示`,
    };

    setAuditLogs((prev) => [newLog, ...prev]);
    showToast('小组工作台管理配置与定位规则已成功更新生效 🎉');
    onClose();
  };

  const navItems = [
    { id: 'basic', label: '基本信息', icon: Building },
    { id: 'members', label: '成员与角色', icon: Users, badge: members.length },
    { id: 'schedule', label: '工作时间', icon: Clock },
    { id: 'location_coords', label: '办公坐标', icon: MapPin },
    { id: 'rules', label: '定位规则', icon: Shield },
    { id: 'consent_logs', label: '成员同意记录', icon: FileCheck },
    { id: 'squads', label: '小队管理', icon: Zap, badge: squads.length },
    { id: 'task_templates', label: '任务模板', icon: Sliders },
    { id: 'file_permissions', label: '文件权限', icon: Lock },
    { id: 'audit_logs', label: '操作记录', icon: History },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="manage-group-modal"
        className="relative w-full max-w-4xl bg-white rounded-md border border-[#E4E6EB] shadow-xl overflow-hidden flex flex-col h-[90vh] max-h-[800px] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="h-14 px-4 bg-white border-b border-[#E4E6EB] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1877F2]">
              <Building size={17} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-gray-900">管理小组 · {groupName}</h2>
                <span className="text-[10px] px-1.5 py-0.5 font-bold rounded-sm bg-blue-50 text-[#1877F2] border border-blue-200">
                  原型演示
                </span>
              </div>
              <p className="text-[11px] text-gray-500">统一维护小组规则、工作坐标、小队授权与操作日志</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            aria-label="关闭管理面板"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body with Left Sidebar & Right Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Sidebar Navigation */}
          <div className="w-full md:w-52 bg-[#F8FAFC] border-b md:border-b-0 md:border-r border-[#E4E6EB] shrink-0 p-2 overflow-x-auto md:overflow-y-auto flex md:flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as ManageTab)}
                  className={`flex items-center justify-between px-3 py-2 text-xs font-bold rounded-sm transition-all text-left shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#1877F2] border border-[#E4E6EB] shadow-2xs'
                      : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon size={14} className={isActive ? 'text-[#1877F2]' : 'text-gray-400'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-gray-100 text-gray-600 rounded-full font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Content Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-white">
            {/* 1. Basic Information */}
            {activeTab === 'basic' && (
              <div className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">小组名称</label>
                  <input
                    type="text"
                    value={tempGroupName}
                    onChange={(e) => setTempGroupName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E4E6EB] rounded-sm focus:outline-none focus:border-[#1877F2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">小组简介与定位</label>
                  <textarea
                    rows={3}
                    value={tempDescription}
                    onChange={(e) => setTempDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E4E6EB] rounded-sm focus:outline-none focus:border-[#1877F2]"
                  />
                </div>

                {/* Region & Animal Icon Selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1.5">
                    地域与专属线性动物图标
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {REGION_ANIMALS.map((animal) => {
                      const isSelected = tempAnimal.region === animal.region;
                      return (
                        <div
                          key={animal.region}
                          onClick={() => setTempAnimal(animal)}
                          className={`p-2.5 rounded-sm border cursor-pointer transition-all flex items-center space-x-2.5 ${
                            isSelected
                              ? 'border-[#1877F2] bg-blue-50/50 shadow-2xs ring-1 ring-[#1877F2]'
                              : 'border-[#E4E6EB] hover:border-gray-400 bg-white'
                          }`}
                        >
                          <div className="w-9 h-9 rounded-md bg-white border border-[#E4E6EB] flex items-center justify-center text-xl shrink-0 shadow-2xs">
                            {animal.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-900">
                                {animal.region} · {animal.animalName}
                              </span>
                              {isSelected && (
                                <CheckCircle2 size={13} className="text-[#1877F2]" />
                              )}
                            </div>
                            <p className="text-[10px] text-gray-500 truncate">
                              {animal.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 2. Members & Roles */}
            {activeTab === 'members' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500">
                    管理全组成员角色权限与在岗状态（组长、管理员、小队长、小队成员、普通成员）
                  </p>
                  <span className="text-xs font-bold text-gray-700">共 {members.length} 人</span>
                </div>

                <div className="border border-[#E4E6EB] rounded-sm divide-y divide-[#E4E6EB]">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#F8FAFC]"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-8 h-8 rounded-full border border-[#E4E6EB] object-cover shrink-0"
                        />
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-bold text-gray-900">{member.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 bg-blue-50 text-[#1877F2] font-bold rounded-sm border border-blue-200">
                              {member.roleLabel}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-500">
                            {member.department} · 加入时间: {member.joinDate}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <select
                          value={member.role}
                          onChange={(e) =>
                            handleUpdateMemberRole(member.id, e.target.value as GroupRole)
                          }
                          className="px-2 py-1 text-xs border border-[#E4E6EB] rounded-sm focus:outline-none focus:border-[#1877F2] bg-white cursor-pointer"
                        >
                          <option value="leader">组长</option>
                          <option value="admin">管理员</option>
                          <option value="squad_leader">小队长</option>
                          <option value="squad_member">小队成员</option>
                          <option value="member">普通成员</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Work Schedule */}
            {activeTab === 'schedule' && (
              <div className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1.5">工作日设置</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day) => {
                      const isSelected = tempWorkDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleWorkDay(day)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-sm border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#1877F2] text-white border-[#1877F2]'
                              : 'bg-white text-gray-600 border-[#E4E6EB] hover:border-gray-400'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1">上班时间</label>
                    <input
                      type="time"
                      value={tempStartTime}
                      onChange={(e) => setTempStartTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#E4E6EB] rounded-sm focus:outline-none focus:border-[#1877F2]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1">下班时间</label>
                    <input
                      type="time"
                      value={tempEndTime}
                      onChange={(e) => setTempEndTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#E4E6EB] rounded-sm focus:outline-none focus:border-[#1877F2]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">基准时区</label>
                  <input
                    type="text"
                    value={tempTimezone}
                    onChange={(e) => setTempTimezone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E4E6EB] rounded-sm bg-gray-50 text-gray-700"
                    readOnly
                  />
                  <p className="text-[11px] text-gray-400 mt-1">固定为 Asia/Shanghai 中国标准时间 (CST)</p>
                </div>

                <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-sm space-y-1 text-xs text-gray-600">
                  <div className="font-bold text-gray-800 flex items-center space-x-1">
                    <Calendar size={13} className="text-[#1877F2]" />
                    <span>节假日与异常日例外设置</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    法定休假日（如国庆、中秋）自动停用日常工作定位，转入隐私保护模式。
                  </p>
                </div>
              </div>
            )}

            {/* 4. Office Location Coordinates */}
            {activeTab === 'location_coords' && (
              <div className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">办公地点名称</label>
                  <input
                    type="text"
                    value={tempOfficeName}
                    onChange={(e) => setTempOfficeName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E4E6EB] rounded-sm focus:outline-none focus:border-[#1877F2]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1">办公经度</label>
                    <input
                      type="text"
                      value={schedule.officeCoords[1]}
                      readOnly
                      className="w-full px-3 py-2 text-xs border border-[#E4E6EB] rounded-sm bg-gray-50 text-gray-600 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1">办公纬度</label>
                    <input
                      type="text"
                      value={schedule.officeCoords[0]}
                      readOnly
                      className="w-full px-3 py-2 text-xs border border-[#E4E6EB] rounded-sm bg-gray-50 text-gray-600 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-800">有效聚合判定半径 (米)</label>
                    <span className="text-xs font-bold text-[#1877F2] font-mono">{tempRadius} 米</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="1000"
                    step="50"
                    value={tempRadius}
                    onChange={(e) => setTempRadius(Number(e.target.value))}
                    className="w-full accent-[#1877F2] cursor-pointer"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    当授权组员进入该半径范围内时，在工作台地图自动聚合成“办公室 N 人”卡片。
                  </p>
                </div>

                {/* Simulated Location Status Card */}
                <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-sm">
                  <div className="flex items-center space-x-2 text-xs font-bold text-blue-900 mb-1">
                    <Compass size={14} className="text-[#1877F2]" />
                    <span>实地地理围栏状态 (甘肃兰州)</span>
                  </div>
                  <p className="text-[11px] text-blue-700">
                    当前演示基准：甘肃省兰州市城关区南滨河东路 · 信号状态：RTK亚米级高精差分
                  </p>
                </div>
              </div>
            )}

            {/* 5. Location Rules Timeline */}
            {activeTab === 'rules' && (
              <div>
                <LocationRulesTimeline
                  schedule={{
                    ...schedule,
                    workDays: tempWorkDays,
                    startTime: tempStartTime,
                    endTime: tempEndTime,
                    effectiveRadiusMeters: tempRadius,
                    locationRuleState: tempRuleState,
                  }}
                />
              </div>
            )}

            {/* 6. Consent Logs */}
            {activeTab === 'consent_logs' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500">全员定位授权与知情同意审计追踪流水</p>
                  <span className="text-xs font-bold text-[#1877F2]">
                    已授权 {members.filter((m) => m.locationConsent === 'agreed_work_hours').length} / {members.length} 人
                  </span>
                </div>

                <div className="border border-[#E4E6EB] rounded-sm divide-y divide-[#E4E6EB]">
                  {members.map((m) => (
                    <div key={m.id} className="p-3 flex items-center justify-between hover:bg-[#F8FAFC]">
                      <div className="flex items-center space-x-3">
                        <img
                          src={m.avatar}
                          alt={m.name}
                          className="w-7 h-7 rounded-full border border-[#E4E6EB] object-cover"
                        />
                        <div>
                          <div className="text-xs font-bold text-gray-900">{m.name}</div>
                          <div className="text-[10px] text-gray-400">
                            同意时间: {m.consentTime || '未签署 / 仅加入'}
                          </div>
                        </div>
                      </div>

                      <div>
                        {m.locationConsent === 'agreed_work_hours' && (
                          <span className="text-[10px] px-2 py-0.5 font-bold rounded-sm bg-blue-50 text-[#1877F2] border border-blue-200">
                            同意并加入 (共享工作时段)
                          </span>
                        )}
                        {m.locationConsent === 'squad_temporary' && (
                          <span className="text-[10px] px-2 py-0.5 font-bold rounded-sm bg-purple-50 text-purple-700 border border-purple-200">
                            小队临时任务授权
                          </span>
                        )}
                        {m.locationConsent === 'unauthorized' && (
                          <span className="text-[10px] px-2 py-0.5 font-bold rounded-sm bg-gray-100 text-gray-600 border border-gray-200">
                            仅加入不共享位置
                          </span>
                        )}
                        {m.locationConsent === 'stealth_mode' && (
                          <span className="text-[10px] px-2 py-0.5 font-bold rounded-sm bg-amber-50 text-amber-700 border border-amber-200">
                            个人隐私模式 (已隐身)
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. Squads Overview */}
            {activeTab === 'squads' && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500">管理进行中与已归档的小队任务</p>
                <div className="grid grid-cols-1 gap-2.5">
                  {squads.map((squad) => (
                    <div key={squad.id} className="p-3 border border-[#E4E6EB] rounded-sm hover:border-[#1877F2]/60">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-gray-900">{squad.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-blue-50 text-[#1877F2] font-bold rounded-sm border border-blue-200">
                          {squad.status === 'active' ? '执行中' : squad.status === 'preparing' ? '筹备中' : '已完成'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 mb-2">{squad.targetGoal}</p>
                      <div className="text-[10px] text-gray-400 flex items-center space-x-3">
                        <span>小队长: {squad.leaderName}</span>
                        <span>时段: {squad.startTime} - {squad.endTime}</span>
                        <span>集合点: {squad.gatheringPoint}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. Task Templates */}
            {activeTab === 'task_templates' && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500">小组预设任务标准化模板库</p>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { title: '实地踩线与打卡点校核模板', steps: '4项核验步骤 · 关联地标知识库', category: '踩线考察' },
                    { title: '应急保障与AED物资巡检模板', steps: '3项自检清单 · 包含对讲机频点', category: '安全防护' },
                    { title: '活动联合复盘报告初审模板', steps: '满意度统计 · 行动项落地', category: '文档纪要' },
                  ].map((tpl, i) => (
                    <div key={i} className="p-3 border border-[#E4E6EB] rounded-sm hover:bg-[#F8FAFC] flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-gray-900">{tpl.title}</div>
                        <div className="text-[10px] text-gray-500">{tpl.steps}</div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-sm font-bold">
                        {tpl.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 9. File Permissions */}
            {activeTab === 'file_permissions' && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500">团队文档空间与小队关联资料访问权限</p>
                <div className="border border-[#E4E6EB] rounded-sm p-3 bg-[#F8FAFC] text-xs text-gray-700 space-y-2">
                  <div className="font-bold text-gray-900">文档沉淀保护机制：</div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    小队任务结束后，小队实时定位窗口自动关闭，但所有在小队期间沉淀的《协作手册》、《复盘纪要》、《知识库》与附件将自动永久归档并保留在团队空间供全员查阅。
                  </p>
                </div>
              </div>
            )}

            {/* 10. Audit Logs */}
            {activeTab === 'audit_logs' && (
              <div className="space-y-2.5">
                <p className="text-xs text-gray-500">小组不可篡改的管理操作与规则变更历史记录</p>
                <div className="border border-[#E4E6EB] rounded-sm divide-y divide-[#E4E6EB]">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-3 hover:bg-[#F8FAFC]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-gray-900">{log.title}</span>
                        <span className="text-[10px] font-mono text-gray-400">{log.timestamp}</span>
                      </div>
                      <p className="text-xs text-gray-700 mb-1">{log.details}</p>
                      <div className="text-[10px] text-gray-500 flex items-center space-x-2">
                        <span className="font-bold text-[#1877F2]">{log.operatorName}</span>
                        <span>·</span>
                        <span>{log.impactScope}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="h-14 px-4 bg-[#F8FAFC] border-t border-[#E4E6EB] flex items-center justify-between shrink-0">
          <div className="text-[11px] text-gray-500 flex items-center space-x-1">
            <Info size={13} className="text-[#1877F2]" />
            <span>规则变更将实时通知受影响成员并记录至操作日志</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-200/70 rounded-sm border border-[#E4E6EB] transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              onClick={handleSaveAllChanges}
              className="px-4 py-1.5 text-xs font-bold text-white bg-[#1877F2] hover:bg-[#166FE5] active:scale-[0.98] rounded-sm border border-[#1877F2] shadow-2xs transition-all cursor-pointer flex items-center space-x-1"
            >
              <CheckCircle2 size={13} />
              <span>确认并更新小组规则</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
