import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Sparkles,
  Zap,
  Gauge,
  Activity,
  CheckCircle2,
  Clock,
  Compass,
  AlertTriangle,
  Radio,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { TransportMode, TransportModeEvaluation } from '../types';
import {
  globalTransportEngine,
  TRANSPORT_MODE_LABELS,
  TRANSPORT_MODE_ICONS,
} from '../utils/transportModeEngine';
import {
  globalMockLocationAdapter,
  DEMO_SCENARIOS,
  DemoScenarioKey,
} from '../utils/mockLocationAdapter';

interface TransportModeDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStatusCard?: () => void;
}

export const TransportModeDemoModal: React.FC<TransportModeDemoModalProps> = ({
  isOpen,
  onClose,
  onOpenStatusCard,
}) => {
  const [evaluation, setEvaluation] = useState<TransportModeEvaluation>(() =>
    globalTransportEngine.evaluateCurrentState()
  );
  const [activeScenario, setActiveScenario] = useState<DemoScenarioKey>(() =>
    globalMockLocationAdapter.getActiveScenario()
  );
  const [isAutoRunning, setIsAutoRunning] = useState<boolean>(() =>
    globalMockLocationAdapter.getIsAutoRunning()
  );
  const [tickEffect, setTickEffect] = useState<boolean>(false);

  useEffect(() => {
    const update = () => {
      setEvaluation(globalTransportEngine.evaluateCurrentState());
      setActiveScenario(globalMockLocationAdapter.getActiveScenario());
      setIsAutoRunning(globalMockLocationAdapter.getIsAutoRunning());
    };

    update();
    const interval = setInterval(update, 1000);
    const unsubscribe = globalMockLocationAdapter.subscribe(() => {
      update();
      setTickEffect(true);
      setTimeout(() => setTickEffect(false), 300);
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  if (!isOpen) return null;

  const handleSelectScenario = (key: DemoScenarioKey) => {
    globalMockLocationAdapter.setScenario(key, true);
    setEvaluation(globalTransportEngine.evaluateCurrentState());
  };

  const handleTogglePlay = () => {
    globalMockLocationAdapter.toggleSimulation();
    setIsAutoRunning(globalMockLocationAdapter.getIsAutoRunning());
  };

  const handleManualTick = () => {
    globalMockLocationAdapter.tick();
  };

  const handleReset = () => {
    globalMockLocationAdapter.seedInitialSamples(activeScenario);
    setEvaluation(globalTransportEngine.evaluateCurrentState());
  };

  const currentConfig = DEMO_SCENARIOS[activeScenario];
  const displayLabel = TRANSPORT_MODE_LABELS[evaluation.displayMode];
  const displayIcon = TRANSPORT_MODE_ICONS[evaluation.displayMode];
  const isLowConfidence = evaluation.confidence < 70 && evaluation.currentMode !== 'stationary';

  return (
    <div className="fixed inset-0 z-[820] bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        className="bg-white border border-[#E4E6EB] rounded-md shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#E4E6EB] flex items-center justify-between bg-gray-50/90">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-blue-50 text-[#1877F2] rounded-md border border-blue-200">
              <Sliders size={16} />
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xs font-bold text-gray-900">交通方式识别 · 演示控制台</h3>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.2 rounded-xs border border-amber-200">
                  演示模式
                </span>
              </div>
              <p className="text-[10px] text-gray-500">
                多模态速度平滑 · 道路环境拟合 · 双窗口防抖
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {onOpenStatusCard && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenStatusCard();
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors"
              >
                查看卡片
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

        {/* Live State Dashboard Banner */}
        <div className="p-3.5 bg-gray-50 border-b border-[#E4E6EB] space-y-3">
          <div className="flex items-center justify-between">
            {/* Live Result Icon & Label */}
            <div className="flex items-center space-x-2.5">
              <div
                className={`text-2xl p-2 bg-white rounded-md border border-[#E4E6EB] shadow-2xs transition-transform ${
                  tickEffect ? 'scale-110' : 'scale-100'
                }`}
              >
                {displayIcon}
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-gray-500">当前识别结果：</span>
                  <span className="text-sm font-black text-gray-900">{displayLabel}</span>
                  {isLowConfidence && (
                    <span className="text-[9px] bg-amber-50 text-amber-700 font-bold px-1 rounded-xs border border-amber-200">
                      置信度 &lt;70% 泛化
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-gray-600 font-medium flex items-center space-x-2 mt-0.5">
                  <span>
                    平滑速度：<strong className="text-gray-900">{evaluation.smoothedSpeedKmh} km/h</strong>
                  </span>
                  <span>·</span>
                  <span>
                    采样数：<strong className="text-gray-900">{evaluation.sampleCount} 个</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Confidence Badge */}
            <div className="text-right">
              <span className="text-[10px] text-gray-500 block">综合置信度</span>
              <div
                className={`text-base font-black ${
                  evaluation.confidence >= 70
                    ? 'text-emerald-600'
                    : evaluation.confidence >= 50
                    ? 'text-amber-600'
                    : 'text-rose-600'
                }`}
              >
                {evaluation.confidence}%
              </div>
            </div>
          </div>

          {/* Debounce status countdown */}
          {evaluation.isDebouncing && (
            <div className="bg-blue-50/80 border border-blue-200 rounded-md p-2 flex items-center justify-between text-xs text-[#1877F2]">
              <div className="flex items-center space-x-1.5">
                <Clock size={13} className="animate-spin" />
                <span>连续窗口防抖确认中 (需连续 2 窗口保持一致)</span>
              </div>
              <span className="font-bold text-[11px]">{evaluation.debounceCountdownSec}s 倒计时</span>
            </div>
          )}

          {/* Real-time Scores Mini Bars */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {(['stationary', 'walking', 'bicycle', 'car'] as TransportMode[]).map((mode) => {
              const score = evaluation.scores[mode] || 0;
              const isWinner = evaluation.displayMode === mode;
              return (
                <div
                  key={mode}
                  className={`p-1.5 rounded-md border text-center transition-all ${
                    isWinner
                      ? 'bg-white border-[#1877F2] shadow-2xs'
                      : 'bg-white/70 border-[#E4E6EB]'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span className="text-xs">{TRANSPORT_MODE_ICONS[mode]}</span>
                    <span className="text-[10px] font-bold text-gray-700">{TRANSPORT_MODE_LABELS[mode]}</span>
                  </div>
                  <div className="text-[11px] font-black text-gray-900 mt-0.5">{score}分</div>
                  <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full ${
                        score >= 70 ? 'bg-[#1877F2]' : score >= 50 ? 'bg-amber-500' : 'bg-gray-400'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Preset Scenarios Selector */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-900 flex items-center space-x-1">
              <Layers size={13} className="text-[#1877F2]" />
              <span>选择模拟测试场景</span>
            </h4>
            <span className="text-[10px] text-gray-500">点击即刻重置采样窗口</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(Object.keys(DEMO_SCENARIOS) as DemoScenarioKey[]).map((key) => {
              const item = DEMO_SCENARIOS[key];
              const isSelected = activeScenario === key;
              return (
                <div
                  key={key}
                  onClick={() => handleSelectScenario(key)}
                  className={`p-2.5 rounded-md border transition-all cursor-pointer text-left flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-50/70 border-[#1877F2] shadow-2xs ring-1 ring-[#1877F2]/30'
                      : 'bg-white border-[#E4E6EB] hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">{item.name}</span>
                    {isSelected && (
                      <span className="bg-[#1877F2] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-xs">
                        已激活
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between text-[9.5px] text-gray-600 mt-2 pt-1 border-t border-gray-100">
                    <span>预期：{item.expectedMode}</span>
                    <span className="font-semibold text-blue-700">{item.expectedConfidenceRange}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Scenario Details */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-md p-3 text-xs space-y-1.5">
            <div className="flex items-center justify-between font-bold text-[#1877F2]">
              <span>当前测试用例说明</span>
              <span className="text-[10px] bg-blue-100 px-1.5 py-0.5 rounded-sm">
                道路环境：{currentConfig.roadType}
              </span>
            </div>
            <p className="text-[11px] text-gray-700">{currentConfig.description}</p>
          </div>
        </div>

        {/* Bottom Simulation Controller */}
        <div className="p-3 border-t border-[#E4E6EB] bg-gray-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleTogglePlay}
              className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors shadow-2xs active:scale-98 ${
                isAutoRunning
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-[#1877F2] hover:bg-[#166FE5] text-white'
              }`}
            >
              {isAutoRunning ? <Pause size={13} /> : <Play size={13} />}
              <span>{isAutoRunning ? '暂停采样' : '开始轮询'}</span>
            </button>

            <button
              type="button"
              onClick={handleManualTick}
              className="bg-white hover:bg-gray-100 border border-[#E4E6EB] text-gray-800 px-2.5 py-1.5 rounded-md text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors shadow-2xs active:scale-98"
              title="单步推送一条位置采样"
            >
              <Zap size={13} className="text-amber-500" />
              <span>单步推进</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="bg-white hover:bg-gray-100 border border-[#E4E6EB] text-gray-600 px-2 py-1.5 rounded-md text-xs font-medium flex items-center space-x-1 cursor-pointer transition-colors shadow-2xs"
              title="重置 60 秒采样窗口"
            >
              <RotateCcw size={12} />
              <span>重置窗口</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="bg-[#1877F2] hover:bg-[#166FE5] text-white px-3.5 py-1.5 rounded-md text-xs font-bold cursor-pointer transition-colors shadow-2xs active:scale-98"
          >
            完成
          </button>
        </div>
      </motion.div>
    </div>
  );
};
