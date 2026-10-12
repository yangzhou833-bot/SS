import React, { useState } from 'react';
import {
  Users,
  X,
  Shield,
  Eye,
  Lock,
  Plus,
  Trash2,
  Check,
  UserPlus,
  ArrowLeft,
  LogOut,
  AlertTriangle,
  Bell,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';
import { CareMember } from '../FamilyCareMonitorPage';

export interface FamilyMemberManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: CareMember[];
  onUpdateMemberRole: (memberId: string, role: string) => void;
  onToggleLocationPause: (memberId: string) => void;
  onRemoveMember: (memberId: string) => void;
  onInviteMember: () => void;
  onExitFamilyCare?: () => void;
  onDisbandFamilyGroup?: () => void;
  onLogoutToLoginRoleScreen?: () => void;
}

export const FamilyMemberManagementModal: React.FC<FamilyMemberManagementModalProps> = ({
  isOpen,
  onClose,
  members,
  onUpdateMemberRole,
  onToggleLocationPause,
  onRemoveMember,
  onInviteMember,
  onExitFamilyCare,
  onDisbandFamilyGroup,
  onLogoutToLoginRoleScreen,
}) => {
  const [showDisbandConfirm, setShowDisbandConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Preference switches
  const [geofenceAlerts, setGeofenceAlerts] = useState(true);
  const [delayAlerts, setDelayAlerts] = useState(true);
  const [stealthMode, setStealthMode] = useState(false);
  const [sosLinkage, setSosLinkage] = useState(true);

  if (!isOpen) return null;

  const handleConfirmDisband = () => {
    setShowDisbandConfirm(false);
    if (onDisbandFamilyGroup) {
      onDisbandFamilyGroup();
    } else {
      onClose();
    }
  };

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    if (onExitFamilyCare) {
      onExitFamilyCare();
    } else {
      onClose();
    }
  };

  return (
    <div
      id="family-care-settings-page"
      className="fixed inset-0 z-50 bg-[#F0F2F5] flex flex-col select-none overflow-hidden animate-in fade-in duration-150 font-sans"
    >
      {/* 1. Mobile Top Navigation Bar */}
      <header className="h-13 sm:h-14 bg-white border-b border-[#E4E6EB] px-3 sm:px-4 flex items-center justify-between shrink-0 shadow-2xs z-10">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center space-x-1.5 py-1 px-2 -ml-1 rounded-md text-[#050505] hover:bg-[#F0F2F5] active:bg-[#E4E6EB] transition-colors cursor-pointer"
          title="返回监控主页"
        >
          <ArrowLeft size={19} className="stroke-[2.5] text-[#050505]" />
          <span className="text-[14px] font-bold tracking-tight text-[#050505]">返回</span>
        </button>

        <div className="flex flex-col items-center">
          <h2 className="text-[15px] font-black text-[#050505] tracking-tight leading-tight">
            家庭看护设置与管理
          </h2>
          <div className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-[#65676B] font-semibold">
              Stellar 幸福家庭组 · 实时守护中
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 bg-[#1877F2] text-white text-[12px] font-bold rounded-md hover:bg-blue-600 active:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
        >
          完成
        </button>
      </header>

      {/* 2. Scrollable Body Content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 pb-10">
        {/* Module A: Overview Card */}
        <section className="bg-white border border-[#E4E6EB] rounded-md p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-md bg-blue-50 border border-blue-200 text-[#1877F2] flex items-center justify-center font-black shadow-2xs">
                <Shield size={20} className="stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="text-[14px] font-black text-[#050505] leading-tight">
                    Stellar 幸福家庭组
                  </h3>
                  <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-[#1877F2] font-bold">
                    尊享守护舱
                  </span>
                </div>
                <p className="text-[11px] text-[#65676B] mt-0.5">
                  当前管理者：<strong className="text-[#050505]">郭星河 (家庭管理员)</strong>
                </p>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>运行中</span>
            </span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#E4E6EB] grid grid-cols-3 gap-2 text-center text-[10.5px]">
            <div className="bg-[#F0F2F5] rounded p-1.5 border border-[#E4E6EB]">
              <span className="text-[#65676B] block">守护成员</span>
              <strong className="text-[13px] text-[#050505] font-black">{members.length} 人</strong>
            </div>
            <div className="bg-[#F0F2F5] rounded p-1.5 border border-[#E4E6EB]">
              <span className="text-[#65676B] block">安全围栏</span>
              <strong className="text-[13px] text-[#050505] font-black">3 处生效</strong>
            </div>
            <div className="bg-[#F0F2F5] rounded p-1.5 border border-[#E4E6EB]">
              <span className="text-[#65676B] block">定位更新</span>
              <strong className="text-[13px] text-emerald-600 font-black">实时同步</strong>
            </div>
          </div>
        </section>

        {/* Module B: Member Management Card */}
        <section className="bg-white border border-[#E4E6EB] rounded-md p-3.5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2.5">
            <div className="flex items-center space-x-2">
              <Users size={16} className="text-[#1877F2]" />
              <h3 className="text-[13px] font-black text-[#050505]">
                家庭成员与监护角色 ({members.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={onInviteMember}
              className="text-[11px] text-[#1877F2] font-bold hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <UserPlus size={13} />
              <span>+ 邀请新成员</span>
            </button>
          </div>

          {/* Member Items */}
          <div className="space-y-2.5">
            {members.map((m) => (
              <div
                key={m.id}
                className="p-3 bg-[#FFFFFF] border border-[#E4E6EB] hover:border-[#1877F2]/60 rounded-md shadow-2xs space-y-2.5 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="relative shrink-0">
                      <img
                        src={m.avatar}
                        alt={m.name}
                        className="w-10 h-10 rounded-full object-cover border border-[#E4E6EB] shadow-2xs"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 ring-1 ring-white rounded-full" />
                    </div>

                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h4 className="text-[13px] font-black text-[#050505]">{m.name}</h4>
                        <span className="text-[9.5px] bg-blue-50 text-[#1877F2] px-1.5 py-0.5 rounded font-bold border border-blue-200">
                          {m.relation}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#65676B] mt-0.5 flex items-center space-x-1">
                        <span className="truncate max-w-[170px]">{m.locationName}</span>
                        <span>·</span>
                        <span className="text-[#050505] font-medium">{m.lastActive}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <select
                      value={m.role || '被监护成员'}
                      onChange={(e) => onUpdateMemberRole(m.id, e.target.value)}
                      className="text-[10.5px] font-bold bg-[#F0F2F5] border border-[#E4E6EB] rounded px-1.5 py-1 text-[#050505] cursor-pointer focus:outline-none focus:border-[#1877F2]"
                    >
                      <option value="家庭管理员">家庭管理员</option>
                      <option value="协同监护人">协同监护人</option>
                      <option value="普通家庭成员">普通成员</option>
                      <option value="被监护成员">被监护成员</option>
                      <option value="临时访客">临时访客</option>
                    </select>
                  </div>
                </div>

                {/* Permissions and Actions bar */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-[#E4E6EB] text-[9.5px] text-[#65676B]">
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center space-x-0.5 text-[#1877F2]">
                      <Eye size={10} />
                      <span>实时定位: {m.role === '家庭管理员' ? '全员可见' : '仅监护人'}</span>
                    </span>
                    <span className="flex items-center space-x-0.5 text-emerald-600">
                      <Lock size={10} />
                      <span>轨迹: 授权可见</span>
                    </span>
                    <span className="flex items-center space-x-0.5 text-amber-600">
                      <Shield size={10} />
                      <span>告警: 接收</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => onToggleLocationPause(m.id)}
                      className="px-2 py-0.5 bg-[#F0F2F5] hover:bg-gray-200 text-[#050505] rounded text-[9.5px] font-bold cursor-pointer transition-colors"
                      title="暂停此成员向地图推送定位"
                    >
                      暂停定位
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveMember(m.id)}
                      className="p-1 text-red-500 hover:bg-red-50 hover:text-red-600 rounded cursor-pointer transition-colors"
                      title="从家庭组移出此成员"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={onInviteMember}
            className="w-full py-2 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-[#1877F2] rounded-md text-[11.5px] font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
          >
            <UserPlus size={14} />
            <span>生成家庭专属邀请口令与二维码</span>
          </button>
        </section>

        {/* Module C: Safety & Notification Settings */}
        <section className="bg-white border border-[#E4E6EB] rounded-md p-3.5 shadow-2xs space-y-3">
          <div className="flex items-center space-x-2 border-b border-[#E4E6EB] pb-2">
            <Sliders size={16} className="text-[#1877F2]" />
            <h3 className="text-[13px] font-black text-[#050505]">看护通知与安全策略</h3>
          </div>

          <div className="space-y-2.5">
            {/* Toggle 1: Geofence Alerts */}
            <div className="flex items-center justify-between py-1">
              <div>
                <span className="text-[12px] font-bold text-[#050505] block">
                  电子围栏进出自动告警
                </span>
                <span className="text-[10px] text-[#65676B]">
                  当家庭成员离开或进入设定安全范围时，立即推送消息
                </span>
              </div>
              <button
                type="button"
                onClick={() => setGeofenceAlerts(!geofenceAlerts)}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                  geofenceAlerts ? 'bg-[#1877F2]' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 shadow-xs ${
                    geofenceAlerts ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2: Delay & Long Stay Alerts */}
            <div className="flex items-center justify-between py-1 border-t border-[#E4E6EB]">
              <div>
                <span className="text-[12px] font-bold text-[#050505] block">
                  异常长时间停留 / 延迟告警
                </span>
                <span className="text-[10px] text-[#65676B]">
                  放学或通勤时间若超过预定路线时长，自动提醒监护人
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDelayAlerts(!delayAlerts)}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                  delayAlerts ? 'bg-[#1877F2]' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 shadow-xs ${
                    delayAlerts ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 3: Stealth Mode */}
            <div className="flex items-center justify-between py-1 border-t border-[#E4E6EB]">
              <div>
                <span className="text-[12px] font-bold text-[#050505] block">
                  隐身模式 (暂停向全员共享我的位置)
                </span>
                <span className="text-[10px] text-[#65676B]">
                  开启后家庭成员将无法在地图上获取您的当前实时坐标
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStealthMode(!stealthMode)}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                  stealthMode ? 'bg-[#1877F2]' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 shadow-xs ${
                    stealthMode ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 4: SOS Emergency */}
            <div className="flex items-center justify-between py-1 border-t border-[#E4E6EB]">
              <div>
                <span className="text-[12px] font-bold text-[#050505] block">
                  紧急 SOS 快速呼叫与全家强提醒
                </span>
                <span className="text-[10px] text-[#65676B]">
                  触发紧急求助时，突破静音模式发出高优先级警报
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSosLinkage(!sosLinkage)}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                  sosLinkage ? 'bg-[#1877F2]' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 shadow-xs ${
                    sosLinkage ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Module D: Danger & Exit Actions (USER'S CORE EXPLICIT REQUIREMENT) */}
        <section className="bg-white border border-[#E4E6EB] rounded-md p-3.5 shadow-2xs space-y-3">
          <div className="flex items-center space-x-2 border-b border-[#E4E6EB] pb-2">
            <AlertTriangle size={16} className="text-amber-500" />
            <h3 className="text-[13px] font-black text-[#050505]">看护操作与解散控制</h3>
          </div>

          <div className="space-y-3">
            {/* Button 1: Exit Family Care (退出家庭看护) */}
            <div className="p-3 bg-[#F0F2F5] border border-[#E4E6EB] rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <h4 className="text-[12px] font-bold text-[#050505]">退出家庭看护</h4>
                <p className="text-[10.5px] text-[#65676B]">
                  退出当前家庭看护监控舱，返回看护登录与创建初始界面
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowExitConfirm(true)}
                className="px-3.5 py-2 bg-white border border-[#CED0D5] hover:border-[#1877F2] hover:text-[#1877F2] text-[#050505] text-[12px] font-bold rounded-md flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
              >
                <LogOut size={14} />
                <span>退出家庭看护</span>
              </button>
            </div>

            {/* Button 2: One-click Dissolve (一键解散家庭看护群) */}
            <div className="p-3 bg-red-50/70 border border-red-200 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <h4 className="text-[12px] font-black text-[#FA3B30] flex items-center space-x-1">
                  <span>一键解散家庭看护群</span>
                  <span className="text-[9.5px] bg-red-100 text-red-700 px-1 rounded font-semibold">不可撤销</span>
                </h4>
                <p className="text-[10.5px] text-red-600/90 mt-0.5">
                  解散当前家庭守护群并清空所有配置，解散后将直接回到家庭看护登录初始界面
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDisbandConfirm(true)}
                className="px-3.5 py-2 bg-[#FA3B30] hover:bg-red-600 active:bg-red-700 text-white text-[12px] font-bold rounded-md flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
              >
                <Trash2 size={14} />
                <span>一键解散家庭群</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ========================================================================= */}
      {/* 3. Dissolve Group Confirmation Dialog */}
      {/* ========================================================================= */}
      {showDisbandConfirm && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-[#E4E6EB] rounded-lg max-w-sm w-full p-4 shadow-xl space-y-3.5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-2.5 text-red-600">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h3 className="text-[15px] font-black text-[#050505]">确定一键解散家庭看护群？</h3>
                <span className="text-[10px] text-red-600 font-semibold">解散后将立即返回家庭看护登录初始界面</span>
              </div>
            </div>

            <p className="text-[11.5px] text-[#65676B] leading-relaxed">
              解散后，所有 5 位成员的监护关联与位置共享将被清空，电子围栏与历史轨迹记录将重置。此操作不可恢复。
            </p>

            <div className="flex items-center space-x-2 pt-2 border-t border-[#E4E6EB]">
              <button
                type="button"
                onClick={() => setShowDisbandConfirm(false)}
                className="flex-1 py-2 bg-[#F0F2F5] hover:bg-gray-200 text-[#050505] text-[12px] font-bold rounded-md transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmDisband}
                className="flex-1 py-2 bg-[#FA3B30] hover:bg-red-600 active:bg-red-700 text-white text-[12px] font-bold rounded-md transition-colors shadow-2xs cursor-pointer flex items-center justify-center space-x-1"
              >
                <Trash2 size={13} />
                <span>确认解散并返回初始界面</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. Exit Family Care Confirmation Dialog */}
      {/* ========================================================================= */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-[#E4E6EB] rounded-lg max-w-sm w-full p-4 shadow-xl space-y-3.5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-2.5 text-[#1877F2]">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <LogOut size={18} />
              </div>
              <div>
                <h3 className="text-[15px] font-black text-[#050505]">退出家庭看护</h3>
                <span className="text-[10px] text-[#65676B] font-semibold">将暂时离开监控舱返回初始界面</span>
              </div>
            </div>

            <p className="text-[11.5px] text-[#65676B] leading-relaxed">
              退出后将关闭实时家庭监控舱界面，您可在初始界面随时重新进入或使用其他功能。
            </p>

            <div className="flex items-center space-x-2 pt-2 border-t border-[#E4E6EB]">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2 bg-[#F0F2F5] hover:bg-gray-200 text-[#050505] text-[12px] font-bold rounded-md transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmExit}
                className="flex-1 py-2 bg-[#1877F2] hover:bg-blue-600 active:bg-blue-700 text-white text-[12px] font-bold rounded-md transition-colors shadow-2xs cursor-pointer flex items-center justify-center space-x-1"
              >
                <LogOut size={13} />
                <span>确认退出</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
