import React from 'react';
import {
  X,
  Shield,
  Clock,
  EyeOff,
  UserCheck,
  CheckCircle2,
  Info,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

interface MemberJoinConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
  onSelectConsent: (consentType: 'agreed_work_hours' | 'unauthorized' | 'undecided') => void;
  showToast: (msg: string) => void;
}

export const MemberJoinConsentModal: React.FC<MemberJoinConsentModalProps> = ({
  isOpen,
  onClose,
  groupName,
  onSelectConsent,
  showToast,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="member-join-consent-modal"
        className="relative w-full max-w-lg bg-white rounded-md border border-[#E4E6EB] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-14 px-4 bg-white border-b border-[#E4E6EB] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1877F2]">
              <Shield size={18} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-gray-900">加入小组定位与知情同意说明</h2>
                <span className="text-[10px] px-1.5 py-0.5 font-bold rounded-sm bg-blue-50 text-[#1877F2] border border-blue-200">
                  合规窗口
                </span>
              </div>
              <p className="text-[11px] text-gray-500">
                加入「{groupName}」前请确认您的位置共享偏好
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            aria-label="关闭加入授权弹窗"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Privacy Protection Summary Banner */}
          <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-sm space-y-1.5 text-xs text-blue-900">
            <div className="font-bold flex items-center space-x-1.5">
              <CheckCircle2 size={14} className="text-[#1877F2]" />
              <span>四项隐私刚性保障</span>
            </div>
            <ul className="text-[11px] text-blue-800 space-y-1 pl-4 list-disc">
              <li>非工作时段系统自动关闭实时定位，不留存精确行踪。</li>
              <li>进入办公室 300 米半径后，自动聚合为“办公室 N 人”卡片。</li>
              <li>未授权成员仅显示“未授权定位”，绝不向任何人展示精确坐标。</li>
              <li>您可随时在“个人”或“定位规则”中一键开启隐身或撤回授权。</li>
            </ul>
          </div>

          {/* Fixed Priority Notice */}
          <div className="bg-[#F8FAFC] border border-[#E4E6EB] p-2.5 rounded-sm">
            <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">
              不可篡改的单向优先级规则
            </div>
            <div className="text-xs font-mono text-gray-700">
              成员明确拒绝 &gt; 个人隐私模式 &gt; 小组禁用 &gt; 小队临时窗口 &gt; 小组工作时段 &gt; 默认状态
            </div>
          </div>

          {/* Three Choice Buttons */}
          <div className="space-y-2.5 pt-1">
            {/* 1. 同意并加入 */}
            <button
              onClick={() => {
                onSelectConsent('agreed_work_hours');
                showToast('已授权工作时段定位并成功加入小组 🎉');
                onClose();
              }}
              className="w-full p-3 bg-white hover:bg-blue-50/50 border border-[#1877F2] rounded-sm text-left transition-all group cursor-pointer shadow-2xs flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-[#1877F2] flex items-center justify-center font-bold text-sm shrink-0 border border-blue-200">
                  <UserCheck size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900 group-hover:text-[#1877F2] flex items-center space-x-1.5">
                    <span>同意并加入</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 text-[#1877F2] rounded-sm font-normal">
                      推荐
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    在周一至周五工作时段 (09:00-18:00) 共享办公点位置
                  </p>
                </div>
              </div>
              <ArrowRight size={14} className="text-[#1877F2]" />
            </button>

            {/* 2. 仅加入不共享位置 */}
            <button
              onClick={() => {
                onSelectConsent('unauthorized');
                showToast('已加入小组（未共享位置模式）🛡️');
                onClose();
              }}
              className="w-full p-3 bg-white hover:bg-gray-50 border border-[#E4E6EB] hover:border-gray-400 rounded-sm text-left transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-sm shrink-0 border border-gray-200">
                  <EyeOff size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">仅加入不共享位置</div>
                  <p className="text-[11px] text-gray-500">
                    参与文档、任务与频道交流，但在地图上显示“未授权定位”
                  </p>
                </div>
              </div>
              <ArrowRight size={14} className="text-gray-400" />
            </button>

            {/* 3. 稍后决定 */}
            <button
              onClick={() => {
                onSelectConsent('undecided');
                showToast('已暂缓定位授权，可在工作台随时开启 ⏳');
                onClose();
              }}
              className="w-full p-3 bg-white hover:bg-gray-50 border border-dashed border-[#E4E6EB] hover:border-gray-400 rounded-sm text-left transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center font-bold text-sm shrink-0 border border-gray-200">
                  <Clock size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-700">稍后决定</div>
                  <p className="text-[11px] text-gray-400">
                    先以访客模式浏览工作台，后续可随时调整
                  </p>
                </div>
              </div>
              <ArrowRight size={14} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#F8FAFC] border-t border-[#E4E6EB] flex items-center justify-between shrink-0 text-[11px] text-gray-500">
          <span>Stellar 隐私合规引擎 · 原型演示</span>
          <button
            onClick={onClose}
            className="text-xs font-bold text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
