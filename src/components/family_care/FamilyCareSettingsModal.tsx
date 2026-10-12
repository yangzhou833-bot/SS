import React, { useState } from 'react';
import {
  X,
  LogOut,
  ChevronRight,
  Shield,
  Bell,
  Users,
  Eye,
  Trash2,
  AlertTriangle,
  ArrowLeft,
  Sliders,
  Check
} from 'lucide-react';

interface FamilyCareSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExitFamilyCare: () => void;
  onDisbandFamilyGroup?: () => void;
}

export const FamilyCareSettingsModal: React.FC<FamilyCareSettingsModalProps> = ({
  isOpen,
  onClose,
  onExitFamilyCare,
  onDisbandFamilyGroup,
}) => {
  const [showDisbandConfirm, setShowDisbandConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [geofencePush, setGeofencePush] = useState(true);
  const [delayAlarm, setDelayAlarm] = useState(true);
  const [stealthMode, setStealthMode] = useState(false);

  if (!isOpen) return null;

  const handleDisband = () => {
    setShowDisbandConfirm(false);
    if (onDisbandFamilyGroup) {
      onDisbandFamilyGroup();
    } else {
      onExitFamilyCare();
    }
  };

  const handleExit = () => {
    setShowExitConfirm(false);
    onExitFamilyCare();
  };

  return (
    <div
      id="family-care-settings-view"
      className="fixed inset-0 z-50 bg-[#F0F2F5] flex flex-col select-none overflow-hidden animate-in fade-in duration-150 font-sans"
    >
      {/* Mobile Top Navigation Bar */}
      <header className="h-13 sm:h-14 bg-white border-b border-[#E4E6EB] px-3.5 flex items-center justify-between shrink-0 shadow-2xs z-10">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center space-x-1.5 py-1 px-2 -ml-1 rounded-md text-[#050505] hover:bg-[#F0F2F5] active:bg-[#E4E6EB] transition-colors cursor-pointer"
        >
          <ArrowLeft size={19} className="stroke-[2.5] text-[#050505]" />
          <span className="text-[14px] font-bold text-[#050505]">返回</span>
        </button>

        <div className="flex flex-col items-center">
          <h2 className="text-[15px] font-black text-[#050505] tracking-tight">家庭看护设置</h2>
          <span className="text-[10px] text-[#65676B] font-semibold">Stellar 幸福家庭守护舱</span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 bg-[#1877F2] text-white text-[12px] font-bold rounded-md hover:bg-blue-600 transition-colors shadow-2xs cursor-pointer"
        >
          完成
        </button>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 pb-10">
        {/* Status Card */}
        <div className="bg-white border border-[#E4E6EB] rounded-md p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-md bg-blue-50 text-[#1877F2] flex items-center justify-center font-black">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="text-[13.5px] font-black text-[#050505]">Stellar 幸福家庭组</h3>
                <p className="text-[10.5px] text-[#65676B]">5位成员 · 实时定位守护中</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
              正常运行
            </span>
          </div>
        </div>

        {/* Feature Switches */}
        <div className="bg-white border border-[#E4E6EB] rounded-md p-3.5 shadow-2xs space-y-3">
          <div className="flex items-center space-x-2 border-b border-[#E4E6EB] pb-2">
            <Sliders size={16} className="text-[#1877F2]" />
            <h3 className="text-[13px] font-black text-[#050505]">安全偏好配置</h3>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between py-1">
              <div>
                <span className="text-[12px] font-bold text-[#050505] block">电子围栏实时告警</span>
                <span className="text-[10px] text-[#65676B]">进出设定围栏自动向全家推送提醒</span>
              </div>
              <button
                type="button"
                onClick={() => setGeofencePush(!geofencePush)}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  geofencePush ? 'bg-[#1877F2]' : 'bg-gray-300'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 shadow-xs ${
                  geofencePush ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-[#E4E6EB]">
              <div>
                <span className="text-[12px] font-bold text-[#050505] block">异常停留与延迟预警</span>
                <span className="text-[10px] text-[#65676B]">通勤路段若异常停顿超时自动提醒</span>
              </div>
              <button
                type="button"
                onClick={() => setDelayAlarm(!delayAlarm)}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  delayAlarm ? 'bg-[#1877F2]' : 'bg-gray-300'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 shadow-xs ${
                  delayAlarm ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-[#E4E6EB]">
              <div>
                <span className="text-[12px] font-bold text-[#050505] block">隐身模式 (暂停位置上报)</span>
                <span className="text-[10px] text-[#65676B]">开启后仅保留紧急求助，不共享实时点位</span>
              </div>
              <button
                type="button"
                onClick={() => setStealthMode(!stealthMode)}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  stealthMode ? 'bg-[#1877F2]' : 'bg-gray-300'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 shadow-xs ${
                  stealthMode ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Exit & Dissolve Actions (CORE USER REQUIREMENT) */}
        <div className="bg-white border border-[#E4E6EB] rounded-md p-3.5 shadow-2xs space-y-3">
          <div className="flex items-center space-x-2 border-b border-[#E4E6EB] pb-2">
            <AlertTriangle size={16} className="text-amber-500" />
            <h3 className="text-[13px] font-black text-[#050505]">退出与解散操作</h3>
          </div>

          <div className="space-y-2.5">
            {/* Exit Family Care */}
            <div className="p-3 bg-[#F0F2F5] border border-[#E4E6EB] rounded-md flex items-center justify-between gap-2">
              <div>
                <h4 className="text-[12px] font-bold text-[#050505]">退出家庭看护</h4>
                <p className="text-[10px] text-[#65676B]">暂时离开监控舱，回到看护登录初始入口</p>
              </div>
              <button
                type="button"
                onClick={() => setShowExitConfirm(true)}
                className="px-3 py-1.5 bg-white border border-[#CED0D5] hover:border-[#1877F2] hover:text-[#1877F2] text-[#050505] text-[11.5px] font-bold rounded-md flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
              >
                <LogOut size={13} />
                <span>退出看护</span>
              </button>
            </div>

            {/* One-click Dissolve */}
            <div className="p-3 bg-red-50/70 border border-red-200 rounded-md flex items-center justify-between gap-2">
              <div>
                <h4 className="text-[12px] font-black text-[#FA3B30] flex items-center space-x-1">
                  <span>一键解散家庭看护群</span>
                  <span className="text-[9px] bg-red-100 text-red-700 px-1 rounded font-semibold">危险</span>
                </h4>
                <p className="text-[10px] text-red-600/90 mt-0.5">解散后清除所有数据，立即重置返回初始登录界面</p>
              </div>
              <button
                type="button"
                onClick={() => setShowDisbandConfirm(true)}
                className="px-3 py-1.5 bg-[#FA3B30] hover:bg-red-600 active:bg-red-700 text-white text-[11.5px] font-bold rounded-md flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
              >
                <Trash2 size={13} />
                <span>一键解散</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dissolve Dialog */}
      {showDisbandConfirm && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E4E6EB] rounded-lg max-w-xs w-full p-4 shadow-xl space-y-3">
            <h3 className="text-[14px] font-black text-[#050505] flex items-center space-x-1.5 text-red-600">
              <AlertTriangle size={16} />
              <span>确定一键解散家庭看护群？</span>
            </h3>
            <p className="text-[11px] text-[#65676B]">
              解散后将清空所有 5 位成员的监护关联与历史记录，并立即返回家庭看护登录初始界面。此操作不可逆。
            </p>
            <div className="flex items-center space-x-2 pt-2 border-t border-[#E4E6EB]">
              <button
                type="button"
                onClick={() => setShowDisbandConfirm(false)}
                className="flex-1 py-1.5 bg-[#F0F2F5] hover:bg-gray-200 text-[#050505] text-[11.5px] font-bold rounded-md cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleDisband}
                className="flex-1 py-1.5 bg-[#FA3B30] hover:bg-red-600 text-white text-[11.5px] font-bold rounded-md cursor-pointer"
              >
                确认解散
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E4E6EB] rounded-lg max-w-xs w-full p-4 shadow-xl space-y-3">
            <h3 className="text-[14px] font-black text-[#050505] flex items-center space-x-1.5 text-[#1877F2]">
              <LogOut size={16} />
              <span>确定退出家庭看护？</span>
            </h3>
            <p className="text-[11px] text-[#65676B]">
              退出后将关闭当前监控舱，并返回初始界面。
            </p>
            <div className="flex items-center space-x-2 pt-2 border-t border-[#E4E6EB]">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-1.5 bg-[#F0F2F5] hover:bg-gray-200 text-[#050505] text-[11.5px] font-bold rounded-md cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleExit}
                className="flex-1 py-1.5 bg-[#1877F2] hover:bg-blue-600 text-white text-[11.5px] font-bold rounded-md cursor-pointer"
              >
                确认退出
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
