import React, { useState } from 'react';
import {
  X,
  Play,
  Terminal,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  Send,
  Zap,
  Sliders,
  Radio,
  FileCode,
  MapPin
} from 'lucide-react';
import { SkillItem } from '../../data/skillsData';
import { CourseManagementApp } from './CourseManagementApp';
import { FamilyCareMonitorPage } from '../FamilyCareMonitorPage';
import { EBookReaderApp } from './EBookReaderApp';
import { CityCostOfLivingApp } from './CityCostOfLivingApp';

interface SkillPlaygroundProps {
  skill: SkillItem;
  onClose: () => void;
  showToast: (msg: string) => void;
  onNavigateToMapLocation?: (loc: { lat: number; lng: number; name?: string }) => void;
}

export const SkillPlayground: React.FC<SkillPlaygroundProps> = ({
  skill,
  onClose,
  showToast,
  onNavigateToMapLocation,
}) => {
  // Directly render full product apps without sandbox terminal wrapper
  if (skill.id === 'skill-ebook' || skill.id.includes('ebook') || skill.displayName.includes('电子书')) {
    return <EBookReaderApp onClose={onClose} showToast={showToast} />;
  }
  if (skill.id === 'skill-city-cost-of-living' || skill.id.includes('city-cost') || skill.id.includes('cost-of-living') || skill.displayName.includes('生活成本')) {
    return <CityCostOfLivingApp onClose={onClose} showToast={showToast} />;
  }

  const [isRunning, setIsRunning] = useState(false);
  const [inputPayload, setInputPayload] = useState<string>(
    skill.id === 'skill-gemini-agent'
      ? '请帮我规划从兰州大学到黄河风情线的一日学术与浪漫漫步路线，推荐 3 个适合拍照的小众地标。'
      : skill.id === 'skill-spatial-radar'
      ? '{"centerLat": 36.0611, "centerLng": 103.8343, "scanRadiusMeters": 3000, "filterTags": ["friends", "landmarks"]}'
      : skill.id === 'skill-academy-lighthouse'
      ? '{"courseId": "CS-4010", "studentId": "20220901", "stayDurationMin": 42, "currentGpsDistance": 28}'
      : skill.id === 'skill-guardian-sos'
      ? '{"alertLevel": "HIGH_PRIORITY", "triggerType": "MANUAL_SOS_PRESS", "gps": [36.0611, 103.8343], "batteryPct": 86}'
      : '{"action": "EXECUTE_DEFAULT", "target": "stellar-universe", "timestamp": ' + Date.now() + '}'
  );

  const [logs, setLogs] = useState<Array<{ type: 'info' | 'warn' | 'success' | 'data' | 'error'; text: string; time: string }>>([
    {
      type: 'info',
      text: `[INIT] Loading runtime environment for skill @${skill.repoName} (${skill.version})...`,
      time: new Date().toLocaleTimeString(),
    },
    {
      type: 'info',
      text: `[CONFIG] Loaded ${Object.keys(skill.config).length} active schema parameters.`,
      time: new Date().toLocaleTimeString(),
    },
    {
      type: 'success',
      text: `[READY] Skill sandbox ready for execution.`,
      time: new Date().toLocaleTimeString(),
    },
  ]);

  const handleRunSkill = () => {
    setIsRunning(true);
    const now = new Date().toLocaleTimeString();

    setLogs((prev) => [
      ...prev,
      {
        type: 'info',
        text: `[EXEC] Invoking skill execution hook with user payload...`,
        time: now,
      },
    ]);

    setTimeout(() => {
      let resultText = '';
      if (skill.id === 'skill-gemini-agent') {
        resultText = `[OUTPUT] Gemini 3.7 Spatial Agent Response:\n` +
          `🗺️ 【兰州学术与浪漫漫步路线推荐】：\n` +
          `1. 📍 兰州大学积石堂（百年学府书香沉淀）- 建议停留 40 分钟\n` +
          `2. 📍 读者出版集团文化长廊（文学记忆与绿荫漫步）- 距离 1.2km\n` +
          `3. 📍 中山铁桥西侧黄河落日露台（18:30 观景最佳）- 绝美黄昏摄影点\n` +
          `⚡ 预计总耗时 2.5 小时，沿途已自动为您匹配 4 位同路星友！`;
      } else if (skill.id === 'skill-spatial-radar') {
        resultText = `[OUTPUT] Spatial Radar Scan Complete:\n` +
          `📡 探测范围：3000m | 发现活跃星友：4 人 | 热门打卡点：2 处\n` +
          `✨ 林浩 (兄弟) 距离 480m (金城关博览园)\n` +
          `✨ 王建国 (叔叔) 距离 1.8km (读者大道)\n` +
          `🎉 发现 1 个隐藏引力盲盒：中山铁桥北广场 (剩余 42 分钟)`;
      } else if (skill.id === 'skill-academy-lighthouse') {
        resultText = `[OUTPUT] Lighthouse Engine Attendance Result:\n` +
          `✅ 物理坐标：逸夫楼 302 教室 (距离 28m <= 100m 判定阈值)\n` +
          `⏱️ 停留时长：42 分钟 >= 40 分钟最低停留标准\n` +
          `🎓 判定状态：【有效到场 (Valid Attendance)】\n` +
          `💎 积分变动：学业积分 +10，点亮指数累计更新至 95.8%！`;
      } else if (skill.id === 'skill-guardian-sos') {
        resultText = `[OUTPUT] Guardian SOS Emergency Triggered:\n` +
          `🚨 警报级别：一级紧急 | 坐标：[36.0611, 103.8343] (兰州·城关)\n` +
          `📞 已自动同步警报至家庭守护组 (4 位成员已收到强提醒震动)\n` +
          `🔒 实时加密轨迹信道已建立，现场 10 秒音频已安全归档。`;
      } else {
        resultText = `[OUTPUT] Skill @${skill.repoName} executed successfully with code 0.\nResult payload returned from worker thread.`;
      }

      setLogs((prev) => [
        ...prev,
        {
          type: 'success',
          text: resultText,
          time: new Date().toLocaleTimeString(),
        },
      ]);
      setIsRunning(false);
      showToast(`⚡ 技能【${skill.displayName}】沙盒运行成功！`);
    }, 1200);
  };

  const handleClearLogs = () => {
    setLogs([
      {
        type: 'info',
        text: `[CLEAR] Terminal logs cleared. Ready for next execution.`,
        time: new Date().toLocaleTimeString(),
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="bg-[#0D1117] text-[#C9D1D9] border border-[#30363D] w-full max-w-3xl max-h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl font-mono text-xs">
        
        {/* Terminal Header */}
        <div className="bg-[#161B22] px-4 py-3 border-b border-[#30363D] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F] inline-block" />
            </div>
            <span className="text-xs font-bold text-[#E6EDF3] flex items-center gap-1.5 ml-2 font-sans">
              <Terminal size={14} className="text-[#58A6FF]" />
              <span>Skill Sandbox: <strong>@{skill.repoName}</strong></span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearLogs}
              className="p-1 text-[#8B949E] hover:text-white rounded hover:bg-[#30363D] transition-colors"
              title="清空终端日志"
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={onClose}
              className="p-1 text-[#8B949E] hover:text-white rounded hover:bg-[#30363D] transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Input Payload Panel */}
        {skill.id === 'skill-course-management' ? (
          <div className="p-4 bg-[#0D1117] flex flex-col items-center overflow-y-auto max-h-[80vh]">
            <CourseManagementApp
              onClose={onClose}
              showToast={showToast}
              onLightUpBeacon={(beacon) => {
                const title = `${beacon.teacher} + ${beacon.courseName}`;
                showToast(`🗼 已在主页地图点亮课程灯塔：【${title}】(${beacon.room}) 📍`);
                if (onNavigateToMapLocation) {
                  onNavigateToMapLocation({
                    lat: beacon.lat,
                    lng: beacon.lng,
                    name: `🗼 ${title}`,
                  });
                }
                onClose();
              }}
            />
          </div>
        ) : skill.id === 'skill-happy-family' ? (
          <div className="p-4 bg-[#0D1117] flex flex-col items-center overflow-y-auto max-h-[80vh] w-full">
            <FamilyCareMonitorPage isOpen={true} onClose={onClose} familyGroup={null} />
          </div>
        ) : skill.id === 'skill-ebook' ? (
          <div className="p-1 sm:p-2 bg-[#0D1117] flex flex-col items-center overflow-y-auto max-h-[85vh] w-full">
            <EBookReaderApp onClose={onClose} showToast={showToast} />
          </div>
        ) : skill.id === 'skill-city-cost-of-living' ? (
          <div className="p-1 sm:p-2 bg-[#0D1117] flex flex-col items-center overflow-y-auto max-h-[85vh] w-full">
            <CityCostOfLivingApp onClose={onClose} showToast={showToast} />
          </div>
        ) : (
          <>
            <div className="p-3 bg-[#0D1117] border-b border-[#30363D] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#8B949E] font-bold font-sans">
                  📥 输入测试 Payload / 触发参数：
                </span>
                <button
                  onClick={handleRunSkill}
                  disabled={isRunning}
                  className="px-4 py-1.5 bg-[#238636] hover:bg-[#2EA043] disabled:opacity-50 text-white font-bold rounded-lg text-xs font-sans flex items-center gap-1.5 shadow cursor-pointer active:scale-95 transition-all"
                >
                  <Play size={13} fill="white" />
                  <span>{isRunning ? 'Executing...' : 'Run Skill (执行)'}</span>
                </button>
              </div>

              <textarea
                value={inputPayload}
                onChange={(e) => setInputPayload(e.target.value)}
                rows={3}
                className="w-full p-2.5 bg-[#161B22] border border-[#30363D] rounded-lg text-xs text-[#79C0FF] font-mono focus:outline-none focus:border-[#58A6FF] resize-none"
                placeholder="输入 JSON 参数或自然语言提示词..."
              />
            </div>

            {/* Live Terminal Output Console */}
            <div className="flex-1 bg-[#010409] p-4 overflow-y-auto space-y-2 select-text font-mono text-[11px] leading-relaxed">
              {logs.map((log, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-[#8B949E] shrink-0 font-mono text-[10px]">{log.time}</span>
                  <div
                    className={`whitespace-pre-wrap ${
                      log.type === 'error'
                        ? 'text-[#F85149]'
                        : log.type === 'warn'
                        ? 'text-[#D29922]'
                        : log.type === 'success'
                        ? 'text-[#3FB950] font-semibold'
                        : 'text-[#C9D1D9]'
                    }`}
                  >
                    {log.text}
                  </div>
                </div>
              ))}

              {isRunning && (
                <div className="flex items-center gap-2 text-[#58A6FF] animate-pulse">
                  <span className="text-[#8B949E] text-[10px]">{new Date().toLocaleTimeString()}</span>
                  <span>[RUNNING] Processing worker threads and neural pipeline...</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer Actions */}
        <div className="bg-[#161B22] px-4 py-2.5 border-t border-[#30363D] flex items-center justify-between text-xs font-sans text-[#8B949E]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#3FB950] inline-block animate-ping" />
            <span>Sandbox Worker Thread #1 (Active)</span>
          </div>

          <div className="flex items-center gap-2">
            {skill.id === 'skill-spatial-radar' && onNavigateToMapLocation && (
              <button
                onClick={() => {
                  onNavigateToMapLocation({ lat: 36.0611, lng: 103.8343, name: '空间雷达扫描中心' });
                  onClose();
                }}
                className="px-2.5 py-1 bg-[#21262D] hover:bg-[#30363D] text-[#58A6FF] rounded border border-[#30363D] flex items-center gap-1 font-bold cursor-pointer"
              >
                <MapPin size={12} />
                <span>地图同步定位</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-3 py-1 bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] rounded border border-[#30363D] cursor-pointer"
            >
              关闭沙盒
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
