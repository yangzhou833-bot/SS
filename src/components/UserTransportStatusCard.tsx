import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Compass,
  Activity,
  ShieldCheck,
  Radio,
  Sliders,
  Sparkles,
  Info,
  Clock,
  Gauge,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  EyeOff,
  Navigation,
} from 'lucide-react';
import { TransportMode, TransportModeEvaluation } from '../types';
import {
  globalTransportEngine,
  TRANSPORT_MODE_LABELS,
  TRANSPORT_MODE_ICONS,
} from '../utils/transportModeEngine';
import { globalMockLocationAdapter } from '../utils/mockLocationAdapter';

interface UserTransportStatusCardProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDemoPanel?: () => void;
  userAvatar?: string;
  userName?: string;
}

export const UserTransportStatusCard: React.FC<UserTransportStatusCardProps> = ({
  isOpen,
  onClose,
  onOpenDemoPanel,
  userAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  userName = '我 (当前用户)',
}) => {
  const [evaluation, setEvaluation] = useState<TransportModeEvaluation>(() =>
    globalTransportEngine.evaluateCurrentState()
  );
  const [settings, setSettings] = useState(() => globalTransportEngine.getSettings());
  const [activeTab, setActiveTab] = useState<'status' | 'scores' | 'settings'>('status');

  useEffect(() => {
    const update = () => {
      setEvaluation(globalTransportEngine.evaluateCurrentState());
      setSettings(globalTransportEngine.getSettings());
    };

    update();
    const interval = setInterval(update, 1000);
    const unsubscribe = globalMockLocationAdapter.subscribe(update);

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  if (!isOpen) return null;

  const isLowConfidence = evaluation.confidence < 70 && evaluation.currentMode !== 'stationary';
  const displayLabel = TRANSPORT_MODE_LABELS[evaluation.displayMode];
  const displayIcon = TRANSPORT_MODE_ICONS[evaluation.displayMode];

  const handleSetManualOverride = (mode: TransportMode) => {
    const expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes
    globalTransportEngine.updateSettings({
      manualOverrideMode: mode,
      manualOverrideExpiresAt: expiresAt,
    });
    setSettings(globalTransportEngine.getSettings());
    setEvaluation(globalTransportEngine.evaluateCurrentState());
  };

  const handleClearOverride = () => {
    globalTransportEngine.updateSettings({
      manualOverrideMode: undefined,
      manualOverrideExpiresAt: undefined,
    });
    setSettings(globalTransportEngine.getSettings());
    setEvaluation(globalTransportEngine.evaluateCurrentState());
  };

  const handleToggleAuto = () => {
    globalTransportEngine.updateSettings({
      autoRecognitionEnabled: !settings.autoRecognitionEnabled,
    });
    setSettings(globalTransportEngine.getSettings());
  };

  const handleToggleForceMoving = () => {
    globalTransportEngine.updateSettings({
      forceMovingOnly: !settings.forceMovingOnly,
    });
    setSettings(globalTransportEngine.getSettings());
    setEvaluation(globalTransportEngine.evaluateCurrentState());
  };

  const handleToggleShowMode = () => {
    globalTransportEngine.updateSettings({
      showTransportMode: !settings.showTransportMode,
    });
    setSettings(globalTransportEngine.getSettings());
  };

  return (
    <div className="fixed inset-0 z-[800] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        className="bg-white border border-[#E4E6EB] rounded-md shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#E4E6EB] flex items-center justify-between bg-gray-50/80">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full overflow-hidden border border-[#E4E6EB]">
              <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="text-xs font-bold text-gray-900">{userName}</h3>
                <span className="text-[10px] bg-blue-50 text-[#1877F2] font-semibold px-1.5 py-0.2 rounded-sm border border-blue-100">
                  移动识别卡
                </span>
              </div>
              <span className="text-[10px] text-gray-500">
                {evaluation.isSimulated ? '演示模式数据 (Mock)' : '真实定位传感'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {onOpenDemoPanel && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDemoPanel();
                }}
                className="bg-blue-50 hover:bg-blue-100 text-[#1877F2] border border-blue-200 px-2 py-1 rounded-md text-[11px] font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                title="打开演示控制台"
              >
                <Sliders size={12} />
                <span>演示面板</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-md cursor-pointer transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E4E6EB] bg-white px-3 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'status'
                ? 'border-[#1877F2] text-[#1877F2]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            实时状态
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('scores')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'scores'
                ? 'border-[#1877F2] text-[#1877F2]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            评分模型 ({evaluation.confidence}%)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'border-[#1877F2] text-[#1877F2]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            识别控制
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'status' && (
            <div className="space-y-4">
              {/* Primary Status Banner */}
              <div
                className={`border rounded-md p-4 transition-all ${
                  evaluation.displayMode === 'car'
                    ? 'bg-blue-50/60 border-blue-200'
                    : evaluation.displayMode === 'bicycle'
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : evaluation.displayMode === 'walking'
                    ? 'bg-amber-50/60 border-amber-200'
                    : evaluation.displayMode === 'stationary'
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-indigo-50/60 border-indigo-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl p-2 bg-white rounded-md shadow-2xs border border-[#E4E6EB]">
                      {displayIcon}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h2 className="text-lg font-black text-gray-900">{displayLabel}</h2>
                        {evaluation.userOverride ? (
                          <span className="bg-purple-100 text-purple-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded-sm border border-purple-200">
                            手动设定
                          </span>
                        ) : isLowConfidence ? (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-sm border border-amber-200">
                            低置信度泛化
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-sm border border-emerald-200">
                            已识别
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 font-medium mt-0.5">
                        当前平滑时速：
                        <span className="text-sm font-black text-gray-900 ml-1">
                          {evaluation.smoothedSpeedKmh} km/h
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-gray-500 block">综合置信度</span>
                    <span
                      className={`text-sm font-black ${
                        evaluation.confidence >= 70
                          ? 'text-emerald-600'
                          : evaluation.confidence >= 50
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {evaluation.confidence}%
                    </span>
                  </div>
                </div>

                {/* Low confidence prompt requirement */}
                {isLowConfidence && (
                  <div className="mt-3 bg-amber-50 border border-amber-200/80 rounded-md p-2 flex items-center space-x-2 text-xs text-amber-800">
                    <AlertTriangle size={14} className="shrink-0 text-amber-600" />
                    <span>当前正在移动，暂无法准确识别交通方式（置信度未满 70%）</span>
                  </div>
                )}

                {/* Debounce notice */}
                {evaluation.isDebouncing && (
                  <div className="mt-2 bg-blue-50 border border-blue-200 rounded-md p-2 flex items-center justify-between text-xs text-[#1877F2]">
                    <div className="flex items-center space-x-1.5">
                      <Clock size={13} className="animate-spin" />
                      <span>正在进行连续采样防抖验证...</span>
                    </div>
                    <span className="font-bold text-[11px]">{evaluation.debounceCountdownSec}s</span>
                  </div>
                )}
              </div>

              {/* Statistical Metrics Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-50 border border-[#E4E6EB] rounded-md p-2.5 text-center">
                  <span className="text-[10px] text-gray-500 block">中位数速度</span>
                  <span className="text-xs font-bold text-gray-900">{evaluation.medianSpeedKmh} km/h</span>
                </div>
                <div className="bg-gray-50 border border-[#E4E6EB] rounded-md p-2.5 text-center">
                  <span className="text-[10px] text-gray-500 block">P90 峰值速度</span>
                  <span className="text-xs font-bold text-gray-900">{evaluation.p90SpeedKmh} km/h</span>
                </div>
                <div className="bg-gray-50 border border-[#E4E6EB] rounded-md p-2.5 text-center">
                  <span className="text-[10px] text-gray-500 block">速度方差</span>
                  <span className="text-xs font-bold text-gray-900">{evaluation.speedVariance}</span>
                </div>

                <div className="bg-gray-50 border border-[#E4E6EB] rounded-md p-2.5 text-center">
                  <span className="text-[10px] text-gray-500 block">静止时间占比</span>
                  <span className="text-xs font-bold text-gray-900">{Math.round(evaluation.stopRatio * 100)}%</span>
                </div>
                <div className="bg-gray-50 border border-[#E4E6EB] rounded-md p-2.5 text-center">
                  <span className="text-[10px] text-gray-500 block">航向稳定性</span>
                  <span className="text-xs font-bold text-gray-900">{evaluation.headingStability}分</span>
                </div>
                <div className="bg-gray-50 border border-[#E4E6EB] rounded-md p-2.5 text-center">
                  <span className="text-[10px] text-gray-500 block">GPS 信号质量</span>
                  <span className="text-xs font-bold text-gray-900">{evaluation.gpsQuality}分</span>
                </div>
              </div>

              {/* Sample Window Info */}
              <div className="bg-white border border-[#E4E6EB] rounded-md p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">有效样本窗口：</span>
                  <span className="font-bold text-gray-800">
                    最近 {evaluation.validSamplesWindowSec} 秒 ({evaluation.sampleCount} 个样本)
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">判定规则：</span>
                  <span className="text-gray-700">连续2窗口确认 / 70%置信度门限</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">更新时间：</span>
                  <span className="text-gray-700">{new Date(evaluation.lastUpdated).toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Identification Reasons list */}
              <div className="bg-gray-50 border border-[#E4E6EB] rounded-md p-3">
                <h4 className="text-xs font-bold text-gray-900 mb-1.5 flex items-center space-x-1">
                  <Info size={13} className="text-[#1877F2]" />
                  <span>特征匹配依据</span>
                </h4>
                <ul className="space-y-1">
                  {evaluation.topScoreReasons.map((reason, idx) => (
                    <li key={idx} className="text-[11px] text-gray-600 flex items-start space-x-1.5">
                      <span className="text-[#1877F2] font-bold">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'scores' && (
            <div className="space-y-4">
              <div className="bg-gray-50 border border-[#E4E6EB] rounded-md p-3">
                <h4 className="text-xs font-bold text-gray-900 mb-2">多模态打分对比 (0 - 100)</h4>
                <div className="space-y-2.5">
                  {(['car', 'bicycle', 'walking', 'stationary'] as TransportMode[]).map((mode) => {
                    const score = evaluation.scores[mode] || 0;
                    const isWinner = evaluation.currentMode === mode;
                    return (
                      <div key={`score-mode-${mode}`} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-gray-700 flex items-center space-x-1">
                            <span>{TRANSPORT_MODE_ICONS[mode]}</span>
                            <span>{TRANSPORT_MODE_LABELS[mode]}</span>
                            {isWinner && (
                              <span className="bg-blue-100 text-[#1877F2] text-[9px] px-1 py-0.2 rounded-xs font-bold">
                                当前候选
                              </span>
                            )}
                          </span>
                          <span className="font-bold text-gray-900">{score} 分</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              score >= 70
                                ? 'bg-[#1877F2]'
                                : score >= 50
                                ? 'bg-amber-500'
                                : 'bg-gray-400'
                            }`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Scoring Weights breakdown explanation */}
              <div className="bg-white border border-[#E4E6EB] rounded-md p-3 space-y-2 text-xs text-gray-600">
                <h5 className="font-bold text-gray-900">打分权重模型分配：</h5>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-1.5 bg-gray-50 rounded-sm border border-gray-100">
                    <span className="font-bold text-gray-800">速度区间匹配：</span>45%
                  </div>
                  <div className="p-1.5 bg-gray-50 rounded-sm border border-gray-100">
                    <span className="font-bold text-gray-800">速度稳定性：</span>20%
                  </div>
                  <div className="p-1.5 bg-gray-50 rounded-sm border border-gray-100">
                    <span className="font-bold text-gray-800">地图道路环境：</span>15%
                  </div>
                  <div className="p-1.5 bg-gray-50 rounded-sm border border-gray-100">
                    <span className="font-bold text-gray-800">动力加减速：</span>10%
                  </div>
                  <div className="p-1.5 bg-gray-50 rounded-sm border border-gray-100 col-span-2">
                    <span className="font-bold text-gray-800">GPS 质量评分：</span>10%
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4 text-xs">
              {/* Auto recognition switch */}
              <div className="flex items-center justify-between p-3 bg-gray-50 border border-[#E4E6EB] rounded-md">
                <div>
                  <span className="font-bold text-gray-900 block">自动识别交通方式</span>
                  <span className="text-[11px] text-gray-500">基于传感器与道路算法实时推断</span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleAuto}
                  className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    settings.autoRecognitionEnabled ? 'bg-[#1877F2]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      settings.autoRecognitionEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Force moving only switch */}
              <div className="flex items-center justify-between p-3 bg-gray-50 border border-[#E4E6EB] rounded-md">
                <div>
                  <span className="font-bold text-gray-900 block">统一只显示「移动中」</span>
                  <span className="text-[11px] text-gray-500">不向外界展示具体步行/骑行/汽车</span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleForceMoving}
                  className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    settings.forceMovingOnly ? 'bg-[#1877F2]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      settings.forceMovingOnly ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Manual Override Selector */}
              <div className="p-3 bg-white border border-[#E4E6EB] rounded-md space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">手动指定当前交通方式 (有效30分钟)</span>
                  {settings.manualOverrideMode && (
                    <button
                      type="button"
                      onClick={handleClearOverride}
                      className="text-[11px] text-rose-600 font-bold hover:underline cursor-pointer flex items-center space-x-0.5"
                    >
                      <RotateCcw size={11} />
                      <span>恢复自动</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {(['stationary', 'walking', 'bicycle', 'car'] as TransportMode[]).map((mode) => {
                    const isSelected = settings.manualOverrideMode === mode;
                    return (
                      <button
                        key={`override-mode-${mode}`}
                        type="button"
                        onClick={() => handleSetManualOverride(mode)}
                        className={`p-2 rounded-md border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 border-[#1877F2] text-[#1877F2] font-bold shadow-2xs'
                            : 'bg-gray-50 border-[#E4E6EB] hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <span className="text-base block">{TRANSPORT_MODE_ICONS[mode]}</span>
                        <span className="text-[10px] mt-0.5 block">{TRANSPORT_MODE_LABELS[mode]}</span>
                      </button>
                    );
                  })}
                </div>

                {settings.manualOverrideMode && settings.manualOverrideExpiresAt && (
                  <div className="bg-purple-50 border border-purple-200 rounded-sm p-2 text-[11px] text-purple-800 flex items-center justify-between mt-2">
                    <span>已手动锁定为「{TRANSPORT_MODE_LABELS[settings.manualOverrideMode]}」</span>
                    <span className="font-bold">
                      倒计时 {Math.max(1, Math.round((settings.manualOverrideExpiresAt - Date.now()) / 60000))} 分钟
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#E4E6EB] bg-gray-50/80 flex items-center justify-between">
          <span className="text-[11px] text-gray-500 flex items-center space-x-1">
            <ShieldCheck size={13} className="text-emerald-600" />
            <span>隐私保护：Ghost Mode 下完全隐藏</span>
          </span>

          <button
            type="button"
            onClick={onClose}
            className="bg-[#1877F2] hover:bg-[#166FE5] text-white px-4 py-1.5 rounded-md text-xs font-bold cursor-pointer transition-colors shadow-2xs active:scale-98"
          >
            完成
          </button>
        </div>
      </motion.div>
    </div>
  );
};
