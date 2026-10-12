import React, { useState } from 'react';
import {
  Radio,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Wifi,
  WifiOff,
  Bell,
  Send,
  FileText,
  ShieldCheck,
  Award,
  ChevronRight,
  Sparkles,
  Users,
  Building2,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  ArrowRight,
  FileSpreadsheet,
  Check,
  X,
  Upload,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { UserRole } from '../skills/CourseManagementApp';
import { ClassStudentManagement } from '../skills/ClassStudentManagement';

// ============================================================================
// 1. STUDENT WORKSPACE VIEW (星航者 · 陈星航 选课学生)
// ============================================================================
export interface StudentWorkspaceViewProps {
  activeTab: 'attendance' | 'badges' | 'analytics' | 'mycourses';
  showToast: (msg: string) => void;
  lightPoints: number;
  setLightPoints: React.Dispatch<React.SetStateAction<number>>;
}

export const StudentWorkspaceView: React.FC<StudentWorkspaceViewProps> = ({
  activeTab,
  showToast,
  lightPoints,
  setLightPoints,
}) => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState('');
  const [isOfflineCached, setIsOfflineCached] = useState(false);
  const [distanceMeters, setDistanceMeters] = useState(16); // Inside 50m geofence

  // Leave application state
  const [leaveType, setLeaveType] = useState<'sick' | 'personal' | 'official'>('sick');
  const [leaveCourse, setLeaveCourse] = useState('高级算法与AI导论');
  const [leaveReason, setLeaveReason] = useState('因急性扁桃体发炎需前往校医院输液治疗');
  const [leaveSubmitted, setLeaveSubmitted] = useState(false);
  const [hasProofFile, setHasProofFile] = useState(true);

  // Check-in action
  const handleBeaconCheckIn = () => {
    const timeStr = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    setIsCheckedIn(true);
    setCheckInTime(timeStr);
    setLightPoints((prev) => prev + 20);
    showToast(`🎉 信标感应打卡成功！已记录时间戳 ${timeStr}，获得 +20 光芒点数！`);
  };

  const handleOfflineCheckIn = () => {
    const timeStr = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    setIsOfflineCached(true);
    setIsCheckedIn(true);
    setCheckInTime(`${timeStr} (离线安全缓存)`);
    showToast(`📶 弱网模式：已捕获本地微围栏加密晶振时间戳，网络恢复后将自动上报至助教！`);
  };

  const handleSubmitLeave = (e: React.FormEvent) => {
    e.preventDefault();
    setLeaveSubmitted(true);
    showToast('✅ 请假申请已提交！已流转至王助教初审与李辅导员终审！');
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-200">
      {/* ================= TAB 1: 信标打卡 (ATTENDANCE) ================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-3">
          {/* Main Beacon Check-in Card */}
          <div className="bg-white border border-[#E4E6EB] rounded-md p-3.5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xs bg-[#E7F3FF] text-[#1877F2] flex items-center justify-center">
                  <Radio size={16} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#050505]">空间信标打卡中心</h3>
                  <p className="text-[10px] text-[#65676B]">50米蓝牙/GPS微围栏智能感应</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                信标已点亮 (50m)
              </span>
            </div>

            {/* Current Course Info Box */}
            <div className="bg-[#F0F2F5] p-2.5 rounded-xs space-y-1.5 border border-[#E4E6EB]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#1877F2]">当前课程 · 正在打卡</span>
                <span className="text-[9.5px] text-[#65676B]">今日 10:00 - 11:40</span>
              </div>
              <h4 className="text-sm font-bold text-[#050505]">高级算法与AI导论</h4>
              <div className="flex items-center gap-3 text-[10.5px] text-[#65676B]">
                <span>主讲: 张立华 教授</span>
                <span>•</span>
                <span>地点: 计算机大楼 302 智慧教室</span>
              </div>
            </div>

            {/* Distance Radar Status */}
            <div className="bg-[#FAFBFD] p-3 border border-[#E4E6EB] rounded-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#050505]">
                  <MapPin size={14} className="text-[#1877F2]" />
                  <span>实时微围栏测距</span>
                </div>
                <span className="text-[10.5px] font-mono font-bold text-emerald-600">
                  {distanceMeters} 米 (已在 50m 围栏内)
                </span>
              </div>

              {/* Progress bar representing distance in 50m */}
              <div className="w-full h-2 bg-[#E4E6EB] rounded-full overflow-hidden">
                <div className="h-full bg-[#1877F2] transition-all" style={{ width: '32%' }} />
              </div>

              <div className="flex items-center justify-between text-[9px] text-[#65676B]">
                <span>0m 教室中心</span>
                <span className="text-[#1877F2] font-bold">● 当前位置 (16m)</span>
                <span>50m 边缘</span>
              </div>
            </div>

            {/* Check-in Actions or Status */}
            {!isCheckedIn ? (
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleBeaconCheckIn}
                  className="w-full py-2.5 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-xs rounded-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                >
                  <Radio size={16} />
                  <span>一键空间信标感应打卡</span>
                </button>

                <button
                  type="button"
                  onClick={handleOfflineCheckIn}
                  className="w-full py-2 bg-white hover:bg-[#F0F2F5] text-[#65676B] hover:text-[#050505] font-bold text-[11px] rounded-xs border border-[#CED0D4] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <WifiOff size={13} />
                  <span>弱网/离线应急签到 (存入本地安全缓存)</span>
                </button>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-xs space-y-1.5 animate-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between text-emerald-800 font-bold text-xs">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>打卡成功 · 出勤已确认</span>
                  </div>
                  <span className="text-[10px] font-mono">{checkInTime}</span>
                </div>
                <p className="text-[10px] text-emerald-700 leading-tight">
                  蓝牙微围栏硬件验证通过 (RSSI: -68dBm)。凭证识别码: <strong className="font-mono">ST-2024-88392</strong>
                </p>
                <div className="flex items-center justify-between pt-1 text-[9.5px] text-emerald-700">
                  <span>出勤率: 100% (全勤)</span>
                  <span className="font-bold text-[#1877F2] flex items-center gap-0.5">
                    <Zap size={10} /> +20 光芒点数
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Today Course Schedule List */}
          <div className="bg-white border border-[#E4E6EB] rounded-md p-3 space-y-2 shadow-2xs">
            <h4 className="text-xs font-bold text-[#050505] flex items-center justify-between">
              <span>今日课程考勤日程</span>
              <span className="text-[10px] text-[#65676B]">共 3 门课程</span>
            </h4>

            <div className="space-y-1.5 text-xs">
              <div className="p-2 border border-[#E4E6EB] rounded-xs flex items-center justify-between bg-[#FAFBFD]">
                <div className="space-y-0.5">
                  <div className="font-bold text-[#050505]">08:00 - 09:40 高等数学 (下)</div>
                  <div className="text-[10px] text-[#65676B]">主讲: 刘建中 教授 · 阶梯一教室</div>
                </div>
                <span className="px-1.5 py-0.5 rounded-xs text-[9.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  已出勤 (07:56)
                </span>
              </div>

              <div className="p-2 border border-[#1877F2] rounded-xs flex items-center justify-between bg-[#F7FAFF]">
                <div className="space-y-0.5">
                  <div className="font-bold text-[#1877F2]">10:00 - 11:40 高级算法与AI导论</div>
                  <div className="text-[10px] text-[#65676B]">主讲: 张立华 教授 · 计算中心 302</div>
                </div>
                <span className={`px-1.5 py-0.5 rounded-xs text-[9.5px] font-bold ${isCheckedIn ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                  {isCheckedIn ? '已入圈打卡' : '打卡进行中'}
                </span>
              </div>

              <div className="p-2 border border-[#E4E6EB] rounded-xs flex items-center justify-between bg-white">
                <div className="space-y-0.5">
                  <div className="font-bold text-[#050505]">14:00 - 15:40 计算机网络系统</div>
                  <div className="text-[10px] text-[#65676B]">主讲: 陈明 副教授 · 实验大楼 501</div>
                </div>
                <span className="px-1.5 py-0.5 rounded-xs text-[9.5px] font-bold bg-gray-50 text-gray-600 border border-gray-200">
                  尚未点亮
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: 我的课表 (BADGES / SCHEDULE) ================= */}
      {activeTab === 'badges' && (
        <div className="space-y-3">
          <div className="bg-white border border-[#E4E6EB] rounded-md p-3 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
              <h3 className="text-xs font-bold text-[#050505] flex items-center gap-1.5">
                <Calendar size={14} className="text-[#1877F2]" />
                <span>学生个人课表 (计科2401班 · 陈星航)</span>
              </h3>
              <span className="text-[10px] font-bold text-[#1877F2] bg-blue-50 px-1.5 py-0.5 rounded-xs border border-blue-200">
                本周全勤
              </span>
            </div>

            <div className="space-y-2 pt-1 text-xs">
              {[
                { day: '周一 1-2节', name: '高级算法与AI导论', room: '计机楼 302', teacher: '张立华 教授', credits: '3.0学分' },
                { day: '周二 3-4节', name: '数据结构与抽象算法', room: '实验楼 204', teacher: '周教授', credits: '4.0学分' },
                { day: '周三 1-2节', name: '高等数学 (下)', room: '第一教学楼 101', teacher: '刘建中 教授', credits: '5.0学分' },
                { day: '周四 5-6节', name: '计算机系统架构', room: '计机楼 405', teacher: '钱主任', credits: '3.5学分' },
                { day: '周五 7-8节', name: 'AI综合实训项目', room: 'AI智慧工坊', teacher: '张立华 教授', credits: '2.0学分' },
              ].map((c, idx) => (
                <div key={idx} className="p-2 border border-[#E4E6EB] rounded-xs bg-white hover:border-[#1877F2] transition-colors flex items-center justify-between">
                  <div>
                    <span className="text-[9.5px] font-mono font-bold text-[#1877F2] bg-blue-50 px-1 py-0.2 rounded-xs border border-blue-200">
                      {c.day}
                    </span>
                    <h5 className="font-bold text-[#050505] text-[11.5px] mt-0.5">{c.name}</h5>
                    <p className="text-[10px] text-[#65676B]">{c.room} · {c.teacher}</p>
                  </div>
                  <span className="text-[10px] font-bold text-gray-500">{c.credits}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: 成长徽章 (ANALYTICS / BADGES) ================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-3">
          <div className="bg-white border border-[#E4E6EB] rounded-md p-3 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
              <h3 className="text-xs font-bold text-[#050505] flex items-center gap-1.5">
                <Award size={14} className="text-[#1877F2]" />
                <span>星航者成长徽章陈列室</span>
              </h3>
              <span className="text-[10px] font-bold text-[#1877F2] flex items-center gap-0.5">
                <Sparkles size={11} /> 光芒点数: {lightPoints} 点
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 border border-[#1877F2] bg-[#F7FAFF] rounded-xs space-y-1.5">
                <div className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-bold text-xs">
                  🏆
                </div>
                <div className="font-bold text-[#050505] text-[11px]">星际全勤王</div>
                <p className="text-[9.5px] text-[#65676B]">连续 18 次课程准时打卡</p>
                <div className="w-full h-1.5 bg-[#E4E6EB] rounded-full overflow-hidden">
                  <div className="h-full bg-[#1877F2]" style={{ width: '90%' }} />
                </div>
                <span className="text-[8.5px] font-bold text-[#1877F2]">已达成 90%</span>
              </div>

              <div className="p-2.5 border border-emerald-300 bg-emerald-50 rounded-xs space-y-1.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                  🌅
                </div>
                <div className="font-bold text-[#050505] text-[11px]">破晓早鸟</div>
                <p className="text-[9.5px] text-[#65676B]">提前10分钟进入50m围栏</p>
                <span className="px-1.5 py-0.5 rounded-xs text-[8.5px] font-bold bg-emerald-600 text-white inline-block">
                  已佩戴
                </span>
              </div>

              <div className="p-2.5 border border-purple-300 bg-purple-50 rounded-xs space-y-1.5">
                <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-xs">
                  ⚡
                </div>
                <div className="font-bold text-[#050505] text-[11px]">算法先锋</div>
                <p className="text-[9.5px] text-[#65676B]">实验课考勤满分</p>
                <span className="px-1.5 py-0.5 rounded-xs text-[8.5px] font-bold bg-purple-600 text-white inline-block">
                  已佩戴
                </span>
              </div>

              <div className="p-2.5 border border-[#E4E6EB] bg-white rounded-xs space-y-1.5">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-xs">
                  🎖️
                </div>
                <div className="font-bold text-[#050505] text-[11px]">学期大满贯</div>
                <p className="text-[9.5px] text-[#65676B]">学期所有课程零缺勤</p>
                <span className="px-1.5 py-0.5 rounded-xs text-[8.5px] font-bold bg-gray-100 text-gray-600 border border-gray-200 inline-block">
                  冲击中 (14/16周)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: 请假申请 (MYCOURSES / LEAVE) ================= */}
      {activeTab === 'mycourses' && (
        <div className="space-y-3">
          <div className="bg-white border border-[#E4E6EB] rounded-md p-3 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
              <h3 className="text-xs font-bold text-[#050505] flex items-center gap-1.5">
                <FileText size={14} className="text-[#1877F2]" />
                <span>学生在线请假凭据申请单</span>
              </h3>
              <span className="text-[10px] text-[#65676B]">流转至助教初审与辅导员</span>
            </div>

            {leaveSubmitted ? (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xs space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-[#1877F2]">
                  <CheckCircle2 size={16} />
                  <span>请假条已送审</span>
                </div>
                <p className="text-[10px] text-[#65676B] leading-tight">
                  您提交的《{leaveCourse}》{leaveType === 'sick' ? '病假' : '事假'}申请已送达王助教与李辅导员工作台，审核通过后将自动核销旷课记录。
                </p>
                <button
                  type="button"
                  onClick={() => setLeaveSubmitted(false)}
                  className="px-2 py-1 bg-white border border-[#1877F2] text-[#1877F2] font-bold text-[10px] rounded-xs cursor-pointer"
                >
                  再填一张请假单
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitLeave} className="space-y-2.5 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-[#65676B] mb-1">请假类型</label>
                  <div className="grid grid-cols-3 gap-1.5 text-center">
                    {[
                      { id: 'sick', label: '病假 (附医院凭单)' },
                      { id: 'personal', label: '事假 (紧急私务)' },
                      { id: 'official', label: '公假 (竞赛/答辩)' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setLeaveType(t.id as any)}
                        className={`py-1 px-1 rounded-xs border text-[10px] font-bold cursor-pointer ${
                          leaveType === t.id
                            ? 'bg-[#E7F3FF] text-[#1877F2] border-[#1877F2]'
                            : 'bg-white text-[#65676B] border-[#E4E6EB]'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#65676B] mb-1">请假课程</label>
                  <input
                    type="text"
                    value={leaveCourse}
                    onChange={(e) => setLeaveCourse(e.target.value)}
                    className="w-full px-2 py-1.5 border border-[#E4E6EB] rounded-xs text-xs bg-white text-[#050505]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#65676B] mb-1">请假说明与医嘱诊断</label>
                  <textarea
                    rows={2}
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    className="w-full px-2 py-1.5 border border-[#E4E6EB] rounded-xs text-xs bg-white text-[#050505]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#65676B] mb-1">附件证明 (病历/挂号单/批条)</label>
                  <div className="p-2 border border-dashed border-[#CED0D4] rounded-xs flex items-center justify-between bg-[#F0F2F5]">
                    <div className="flex items-center gap-1.5 text-[10.5px] text-[#050505]">
                      <FileText size={13} className="text-[#1877F2]" />
                      <span>校医院急诊挂号凭单_20241012.jpg</span>
                    </div>
                    <span className="text-[9.5px] text-emerald-600 font-bold">已就绪</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-xs rounded-xs cursor-pointer shadow-2xs transition-colors"
                >
                  确认提交请假单
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 2. MONITOR WORKSPACE VIEW (班级守护者 · 赵班长 计科2401班)
// ============================================================================
export interface MonitorWorkspaceViewProps {
  activeTab: 'attendance' | 'badges' | 'analytics' | 'mycourses';
  showToast: (msg: string) => void;
}

export const MonitorWorkspaceView: React.FC<MonitorWorkspaceViewProps> = ({
  activeTab,
  showToast,
}) => {
  const [pushedAll, setPushedAll] = useState(false);
  const [unarrivedCount, setUnarrivedCount] = useState(2);
  const [verifiedOnsite, setVerifiedOnsite] = useState(false);

  const handlePushUnarrived = () => {
    setPushedAll(true);
    showToast('📢 已向周小波、孙雷发送班长专属催到闪信与微信震动通知！');
    // Simulate one student running into the classroom
    setTimeout(() => {
      setUnarrivedCount(1);
      showToast('⚡ 周小波已跑入50米信标微围栏并完成打卡！计科2401班实到升至31人！');
    }, 1800);
  };

  const handleOnsiteVerify = () => {
    setVerifiedOnsite(true);
    showToast('✅ 现场到课复核申请已提交给张立华教授！待教师终端确认。');
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-200">
      {/* ================= TAB 1: 班级考勤 (ATTENDANCE) ================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-3">
          <div className="bg-white border border-[#E4E6EB] rounded-md p-3 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
              <div>
                <h3 className="text-xs font-bold text-[#050505]">计科2401班 · 实时考勤大屏</h3>
                <p className="text-[10px] text-[#65676B]">班长: 赵班长 · 辅导员: 李辅导员</p>
              </div>
              <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold bg-[#E7F3FF] text-[#1877F2] border border-[#1877F2]/30">
                班级守护者工作台
              </span>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
              <div className="p-2 bg-[#FAFBFD] border border-[#E4E6EB] rounded-xs">
                <span className="text-[9.5px] text-[#65676B]">班级应到</span>
                <div className="text-base font-bold text-[#050505] mt-0.5">32 人</div>
              </div>
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xs">
                <span className="text-[9.5px] text-emerald-700 font-bold">已入圈实到</span>
                <div className="text-base font-bold text-emerald-700 mt-0.5">
                  {32 - unarrivedCount} 人
                </div>
              </div>
              <div className="p-2 bg-rose-50 border border-rose-200 rounded-xs">
                <span className="text-[9.5px] text-rose-700 font-bold">未入圈预警</span>
                <div className="text-base font-bold text-rose-700 mt-0.5">{unarrivedCount} 人</div>
              </div>
            </div>

            {/* Unarrived alert strip */}
            {unarrivedCount > 0 && (
              <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xs flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-amber-900 font-bold">
                  <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                  <span>本班仍有 {unarrivedCount} 人未进入50m蓝牙教室微围栏</span>
                </div>
                <button
                  type="button"
                  onClick={handlePushUnarrived}
                  className="px-2 py-1 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-[10px] rounded-xs cursor-pointer shadow-2xs flex items-center gap-1"
                >
                  <Send size={10} />
                  <span>一键催到</span>
                </button>
              </div>
            )}
          </div>

          {/* Student Roster List */}
          <div className="bg-white border border-[#E4E6EB] rounded-md p-3 space-y-2 shadow-2xs">
            <h4 className="text-xs font-bold text-[#050505]">现场学生考勤协查名册 (计科2401班)</h4>

            <div className="space-y-1.5 text-xs">
              <div className="p-2 border border-rose-200 bg-rose-50/50 rounded-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#050505]">孙雷 (2024CS0812)</div>
                  <div className="text-[10px] text-rose-600 font-mono">距信标 850米 · 宿舍区尚未出发</div>
                </div>
                <button
                  type="button"
                  onClick={() => showToast('已向孙雷发送紧急催促通知')}
                  className="px-2 py-0.8 bg-white hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xs text-[9.5px] font-bold cursor-pointer"
                >
                  精准催他
                </button>
              </div>

              {unarrivedCount === 2 && (
                <div className="p-2 border border-amber-200 bg-amber-50/50 rounded-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#050505]">周小波 (2024CS0808)</div>
                    <div className="text-[10px] text-amber-700 font-mono">距信标 120米 · 走廊连廊小跑中</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast('已向周小波发送步速提醒')}
                    className="px-2 py-0.8 bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xs text-[9.5px] font-bold cursor-pointer"
                  >
                    呼叫入圈
                  </button>
                </div>
              )}

              <div className="p-2 border border-emerald-200 bg-emerald-50/50 rounded-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#050505]">陈志强 (2024CS0801)</div>
                  <div className="text-[10px] text-emerald-700">已入圈 (距信标 12米 · 09:58 打卡)</div>
                </div>
                <span className="text-[9.5px] font-bold text-emerald-700">出勤正常</span>
              </div>

              <div className="p-2 border border-emerald-200 bg-emerald-50/50 rounded-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#050505]">陈星航 (2024CS0805)</div>
                  <div className="text-[10px] text-emerald-700">已入圈 (距信标 16米 · 10:04 打卡)</div>
                </div>
                <span className="text-[9.5px] font-bold text-emerald-700">出勤正常</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: 一键催到 (BADGES / PUSH) ================= */}
      {activeTab === 'badges' && (
        <div className="space-y-3">
          <div className="bg-white border border-[#E4E6EB] rounded-md p-3 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
              <h3 className="text-xs font-bold text-[#050505] flex items-center gap-1.5">
                <Bell size={14} className="text-[#1877F2]" />
                <span>班级一键催到通道 (闪信/强震动)</span>
              </h3>
              <span className="text-[10px] text-[#65676B]">未入圈学生专属呼叫</span>
            </div>

            <p className="text-[11px] text-[#65676B] leading-tight">
              当上课铃响后，仍有同学在 50m 微围栏外漂移时，班长可通过此通道向其终端发送高优先级别弹窗提醒，督促其迅速就位。
            </p>

            <button
              type="button"
              onClick={handlePushUnarrived}
              disabled={pushedAll}
              className={`w-full py-2.5 font-bold text-xs rounded-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-colors ${
                pushedAll
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-[#1877F2] hover:bg-[#166FE5] text-white'
              }`}
            >
              <Send size={14} />
              <span>{pushedAll ? '已触发催到通知 (等待学生入圈)' : '向未到同学一键全员下发催到'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 3: 现场核查 (ANALYTICS / AUDIT) ================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-3">
          <div className="bg-white border border-[#E4E6EB] rounded-md p-3 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
              <h3 className="text-xs font-bold text-[#050505] flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#1877F2]" />
                <span>现场目视核查与补签提交</span>
              </h3>
              <span className="text-[10px] text-[#65676B]">协助老师核验忘带手机同学</span>
            </div>

            <div className="p-2.5 border border-[#E4E6EB] rounded-xs space-y-2 bg-[#FAFBFD] text-xs">
              <div className="font-bold text-[#050505]">核对现场在座但未带手机的同学:</div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-[#1877F2]" />
                <span>周小波 (已在第3排就座，手机电量耗尽无法打卡)</span>
              </label>

              <button
                type="button"
                onClick={handleOnsiteVerify}
                disabled={verifiedOnsite}
                className="w-full py-2 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-xs rounded-xs cursor-pointer transition-colors shadow-2xs"
              >
                {verifiedOnsite ? '已向任课教师提交证明申请' : '向张立华教授提交现场到课证明'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: 班级课表 (MYCOURSES / SCHEDULE) ================= */}
      {activeTab === 'mycourses' && (
        <div className="space-y-3">
          <div className="bg-white border border-[#E4E6EB] rounded-md p-3 space-y-2 shadow-2xs">
            <h4 className="text-xs font-bold text-[#050505] flex items-center gap-1.5">
              <Calendar size={14} className="text-[#1877F2]" />
              <span>计科2401班 · 全周集体课程与自习安排</span>
            </h4>

            <div className="space-y-1.5 text-xs">
              <div className="p-2 border border-[#E4E6EB] rounded-xs bg-white flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#050505]">今日周一 · 高级算法与AI导论</div>
                  <div className="text-[10px] text-[#65676B]">计机楼 302 · 全员大班课</div>
                </div>
                <span className="text-[10px] font-bold text-[#1877F2]">32人</span>
              </div>
              <div className="p-2 border border-[#E4E6EB] rounded-xs bg-white flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#050505]">明日周二 · 算法上机实验课</div>
                  <div className="text-[10px] text-[#65676B]">实验中心 204 · 王助教协助点名</div>
                </div>
                <span className="text-[10px] font-bold text-[#1877F2]">32人</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 3. TA WORKSPACE VIEW (副领航员 · 王助教 课程助教)
// ============================================================================
export interface TAWorkspaceViewProps {
  activeTab: 'attendance' | 'badges' | 'analytics' | 'mycourses';
  showToast: (msg: string) => void;
}

export const TAWorkspaceView: React.FC<TAWorkspaceViewProps> = ({
  activeTab,
  showToast,
}) => {
  const [leaves, setLeaves] = useState([
    {
      id: 'l1',
      studentName: '陈志强',
      studentId: '2024CS0801',
      type: '病假',
      reason: '因急性肠胃炎于校医院急诊就医，附急诊挂号单及医嘱证明',
      proof: '校医院挂号证明单.jpg',
      status: 'pending',
    },
    {
      id: 'l2',
      studentName: '李小龙',
      studentId: '2024CS0803',
      type: '竞赛公假',
      reason: '代表学院参加ACM区域选拔赛，附指导教师批条',
      proof: 'ACM参赛公假批条.pdf',
      status: 'pending',
    },
  ]);

  const [offlinePool, setOfflinePool] = useState([
    { studentName: '周小波', studentId: '2024CS0808', rssi: -88, time: '10:18:24 (本地晶振)' },
    { studentName: '孙雷', studentId: '2024CS0812', rssi: -92, time: '10:19:05 (本地晶振)' },
  ]);

  const handleApproveLeave = (id: string, name: string) => {
    setLeaves((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'approved' } : l))
    );
    showToast(`✅ 已通过 ${name} 的请假凭据审核！已同步录入考勤大厅。`);
  };

  const handleSyncOffline = () => {
    setOfflinePool([]);
    showToast('📶 弱网本地离线打卡数据已全数同步至教务考勤云端！');
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-200">
      {/* ================= TAB 1: 助教协查 (ATTENDANCE) ================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-3">
          <div className="bg-white border border-[#E4E6EB] rounded-md p-3 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
              <div>
                <h3 className="text-xs font-bold text-[#050505]">副领航员 · 课程助教考勤协查</h3>
                <p className="text-[10px] text-[#65676B]">协同张立华教授管理《高级算法与AI导论》</p>
              </div>
              <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                助教协同权限
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-[#FAFBFD] border border-[#E4E6EB] rounded-xs space-y-1">
                <span className="text-[10px] text-[#65676B]">待审假条凭证</span>
                <div className="text-base font-bold text-amber-700">
                  {leaves.filter((l) => l.status === 'pending').length} 份
                </div>
              </div>
              <div className="p-2 bg-[#FAFBFD] border border-[#E4E6EB] rounded-xs space-y-1">
                <span className="text-[10px] text-[#65676B]">离线缓存待同步</span>
                <div className="text-base font-bold text-[#1877F2]">{offlinePool.length} 条</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: 假条审核 (BADGES / REVIEW) ================= */}
      {activeTab === 'badges' && (
        <div className="space-y-3">
          <div className="bg-white border border-[#E4E6EB] rounded-md p-3 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
              <h3 className="text-xs font-bold text-[#050505] flex items-center gap-1.5">
                <FileSpreadsheet size={14} className="text-[#1877F2]" />
                <span>学生假条凭据待审箱 ({leaves.filter((l) => l.status === 'pending').length})</span>
              </h3>
              <span className="text-[10px] text-[#65676B]">助教初审</span>
            </div>

            <div className="space-y-2 text-xs">
              {leaves.map((l) => (
                <div key={l.id} className="p-2.5 border border-[#E4E6EB] rounded-xs bg-[#FAFBFD] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-[#050505]">
                      {l.studentName} ({l.studentId})
                    </div>
                    <span className="px-1.5 py-0.2 rounded-xs text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                      {l.type}
                    </span>
                  </div>

                  <p className="text-[10.5px] text-[#65676B] leading-tight">{l.reason}</p>

                  <div className="flex items-center justify-between text-[10px] text-[#1877F2] bg-white p-1.5 border border-[#E4E6EB] rounded-xs">
                    <span>📎 {l.proof}</span>
                    <span className="font-bold">示例凭证</span>
                  </div>

                  {l.status === 'pending' ? (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleApproveLeave(l.id, l.studentName)}
                        className="flex-1 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-[10.5px] rounded-xs cursor-pointer"
                      >
                        审核通过并录入
                      </button>
                      <button
                        type="button"
                        onClick={() => showToast('补充凭证原型演示，尚未退回或通知学生')}
                        className="px-3 py-1.5 bg-white border border-[#CED0D4] text-[#65676B] hover:text-[#050505] font-bold text-[10.5px] rounded-xs cursor-pointer"
                      >
                        要求补单
                      </button>
                    </div>
                  ) : (
                    <div className="text-[10.5px] font-bold text-emerald-700 flex items-center gap-1">
                      <Check size={12} />
                      <span>助教初审已通过</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: 离线同步 (ANALYTICS / SYNC) ================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-3">
          <div className="bg-white border border-[#E4E6EB] rounded-md p-3 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
              <h3 className="text-xs font-bold text-[#050505] flex items-center gap-1.5">
                <RefreshCw size={14} className="text-[#1877F2]" />
                <span>弱网离线打卡缓存同步器</span>
              </h3>
              <span className="text-[10px] text-[#65676B]">防误判晶振校准</span>
            </div>

            <p className="text-[10.5px] text-[#65676B] leading-tight">
              教室网络波动或校园网网关超时时，学生客户端打卡记录被本地晶振加密暂存，助教接入网络后可一键批量同步。
            </p>

            {offlinePool.length > 0 ? (
              <div className="space-y-2">
                <div className="space-y-1.5 text-xs">
                  {offlinePool.map((p, i) => (
                    <div key={i} className="p-2 border border-[#E4E6EB] rounded-xs bg-[#FAFBFD] flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[#050505]">{p.studentName} ({p.studentId})</div>
                        <div className="text-[10px] text-[#65676B]">{p.time} · RSSI: {p.rssi}dBm</div>
                      </div>
                      <span className="text-[10px] font-bold text-amber-700">待上报</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleSyncOffline}
                  className="w-full py-2 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-xs rounded-xs cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <RefreshCw size={12} />
                  <span>一键批量同步离线打卡至云端</span>
                </button>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xs text-xs text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>离线缓存池已全部同步清空，所有数据均已入库！</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 4: 课程信息 (MYCOURSES) ================= */}
      {activeTab === 'mycourses' && (
        <div className="space-y-3">
          <div className="bg-white border border-[#E4E6EB] rounded-md p-3 space-y-2 shadow-2xs">
            <h4 className="text-xs font-bold text-[#050505]">高级算法与AI导论 · 助教答疑排班</h4>
            <div className="text-xs text-[#65676B] space-y-1.5">
              <p>每周二晚 19:00 - 21:00 计机楼 302 现场答疑</p>
              <p>实验作业提交截止时间: 每周日 23:59</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 4. ADVISER WORKSPACE VIEW (星区守护者 · 李辅导员 院系辅导员)
// ============================================================================
export interface AdviserWorkspaceViewProps {
  activeTab: 'attendance' | 'badges' | 'analytics' | 'mycourses';
  showToast: (msg: string) => void;
  counselorName?: string;
  counselorRankTag?: string;
  classList?: Array<{ id: string; name: string; shortCode?: string; count?: number; dept?: string }>;
  onNavigateTab?: (tab: 'attendance' | 'badges' | 'analytics' | 'mycourses') => void;
}

export const AdviserWorkspaceView: React.FC<AdviserWorkspaceViewProps> = ({
  activeTab,
  showToast,
  counselorName = '李明',
  counselorRankTag = '专职辅导员',
  classList,
  onNavigateTab,
}) => {
  const [warnedSun, setWarnedSun] = useState(false);
  const [approvedLongLeave, setApprovedLongLeave] = useState(false);
  const [activeSubView, setActiveSubView] = useState<'overview' | 'class_students'>(
    activeTab === 'mycourses' ? 'class_students' : 'overview'
  );

  React.useEffect(() => {
    if (activeTab === 'mycourses') {
      setActiveSubView('class_students');
    }
  }, [activeTab]);

  const handleSendWarning = () => {
    setWarnedSun(true);
    showToast('🚨 已向连续缺勤学生孙雷下发院系《学业督导与约谈通知函》！');
  };

  const handleApproveLongLeave = () => {
    setApprovedLongLeave(true);
    showToast('🏛️ 辅导员终审完成！已批准学生跨周长期病假，并自动通知全院任课教师。');
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-200">
      {/* 辅导员工作台顶层快捷切换栏 (院系总览 vs 班级学生管理) */}
      <div className="bg-white p-1 border border-[#E4E6EB] rounded-xs shadow-2xs flex items-center gap-1">
        <button
          type="button"
          onClick={() => setActiveSubView('overview')}
          className={`flex-1 py-1.5 px-2 rounded-2xs text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeSubView === 'overview'
              ? 'bg-[#1877F2] text-white shadow-2xs'
              : 'bg-[#F0F2F5] text-[#65676B] hover:text-[#1877F2] hover:bg-[#E7F3FF]'
          }`}
        >
          <ShieldCheck size={14} />
          <span>学工事务与预警审批</span>
        </button>
        <button
          type="button"
          id="counselor-switch-to-students-btn"
          onClick={() => {
            setActiveSubView('class_students');
            if (onNavigateTab) onNavigateTab('mycourses');
          }}
          className={`flex-1 py-1.5 px-2 rounded-2xs text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeSubView === 'class_students'
              ? 'bg-[#1877F2] text-white shadow-2xs'
              : 'bg-[#F0F2F5] text-[#65676B] hover:text-[#1877F2] hover:bg-[#E7F3FF]'
          }`}
        >
          <Users size={14} />
          <span>班级学生管理</span>
          <span
            className={`text-[8.5px] px-1 py-0.2 rounded-2xs ${
              activeSubView === 'class_students'
                ? 'bg-white/20 text-white'
                : 'bg-white text-[#1877F2] border border-[#CED0D4]'
            }`}
          >
            小方块卡片
          </span>
        </button>
      </div>

      {/* 条件渲染：如果切换到班级学生管理，直接呈现完整的班级学生小方块与Stellar代码/扫码邀请中心 */}
      {activeSubView === 'class_students' ? (
        <ClassStudentManagement
          counselorName={counselorName}
          counselorRankTag={counselorRankTag}
          showToast={showToast}
          initialClassList={classList}
        />
      ) : (
        <>
          {/* ================= TAB 1: 全院预警 (ATTENDANCE) ================= */}
          {activeTab === 'attendance' && (
            <div className="space-y-3">
              {/* 快捷进入班级学生管理横幅 */}
              <div className="bg-[#E7F3FF] border border-[#1877F2]/30 p-2.5 rounded-xs flex items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-xs bg-[#1877F2] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Users size={15} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#050505] truncate">
                      辅导员专属：班级学生小方块管理页面
                    </div>
                    <div className="text-[10px] text-[#1877F2] truncate">
                      点击 + 号邀请加入 · 生成班级 Stellar 代码搜索加入 · 扫码即时入班
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  id="counselor-banner-enter-students-btn"
                  onClick={() => {
                    setActiveSubView('class_students');
                    if (onNavigateTab) onNavigateTab('mycourses');
                  }}
                  className="px-2.5 py-1 bg-[#1877F2] hover:bg-[#166FE5] text-white text-[10.5px] font-bold rounded-xs cursor-pointer shadow-2xs shrink-0 flex items-center gap-1"
                >
                  <span>进入学生管理</span>
                  <ArrowRight size={11} />
                </button>
              </div>

              <div className="bg-white border border-[#E4E6EB] rounded-md p-3 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
                  <div>
                    <h3 className="text-xs font-bold text-[#050505]">计算机学院 · 出勤红线预警看板</h3>
                    <p className="text-[10px] text-[#65676B]">
                      辅导员: {counselorName} ({counselorRankTag}) · 管辖 120 人
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-300">
                    院级学工工作台
                  </span>
                </div>

                {/* Red line card */}
                <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                      <AlertTriangle size={15} className="text-rose-600" />
                      <span>连续缺勤红线预警学生 (达到院级干预标准)</span>
                    </div>
                    <span className="text-[9.5px] font-bold text-rose-700 font-mono">1 人超标</span>
                  </div>

                  <div className="bg-white p-2 border border-rose-200 rounded-xs flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#050505]">孙雷 (计科2401班 · 2024CS0812)</div>
                      <div className="text-[10px] text-rose-600">本周已连续 2 次大课旷课 · 出勤率降至 68%</div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSendWarning}
                      disabled={warnedSun}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-xs cursor-pointer ${
                        warnedSun
                          ? 'bg-gray-100 text-gray-500 border border-gray-300'
                          : 'bg-rose-600 hover:bg-rose-700 text-white'
                      }`}
                    >
                      {warnedSun ? '已发约谈函' : '下发约谈函'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: 假条终审 (BADGES / LEAVE) ================= */}
          {activeTab === 'badges' && (
            <div className="space-y-3">
              <div className="bg-white border border-[#E4E6EB] rounded-md p-3 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
                  <h3 className="text-xs font-bold text-[#050505] flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-[#1877F2]" />
                    <span>跨周长期病事假终审审批</span>
                  </h3>
                  <span className="text-[10px] text-[#65676B]">辅导员专属审批权</span>
                </div>

                <div className="p-2.5 border border-[#E4E6EB] rounded-xs bg-[#FAFBFD] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#050505]">王凯 (计科2402班)</span>
                    <span className="px-1.5 py-0.2 rounded-xs text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      跨周长期病假 (3周)
                    </span>
                  </div>
                  <p className="text-[10.5px] text-[#65676B]">因韧带拉伤需住院治疗与康复，附三甲医院住院证明与免修申请表。</p>
                  <button
                    type="button"
                    onClick={handleApproveLongLeave}
                    disabled={approvedLongLeave}
                    className="w-full py-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-xs rounded-xs cursor-pointer shadow-2xs"
                  >
                    {approvedLongLeave ? '已终审批准并下发通知' : '院系级终审批准'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: 学情看板 (ANALYTICS) ================= */}
          {activeTab === 'analytics' && (
            <div className="space-y-3">
              <div className="bg-white border border-[#E4E6EB] rounded-md p-3 space-y-2.5 shadow-2xs">
                <h3 className="text-xs font-bold text-[#050505] flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-[#1877F2]" />
                  <span>全院各行政班出勤排行榜 (到课率横向对比)</span>
                </h3>

                <div className="space-y-1.5 text-xs">
                  <div className="p-2 border border-emerald-300 bg-emerald-50 rounded-xs flex items-center justify-between">
                    <div className="font-bold text-[#050505]">🥇 计科2401班 (赵班长)</div>
                    <span className="font-bold text-emerald-700">98.2% (全勤优胜)</span>
                  </div>
                  <div className="p-2 border border-blue-200 bg-blue-50 rounded-xs flex items-center justify-between">
                    <div className="font-bold text-[#050505]">🥈 计科2402班 (孙班长)</div>
                    <span className="font-bold text-[#1877F2]">95.4%</span>
                  </div>
                  <div className="p-2 border border-[#E4E6EB] bg-white rounded-xs flex items-center justify-between">
                    <div className="font-bold text-[#050505]">🥉 计科2403班 (李班长)</div>
                    <span className="font-bold text-[#65676B]">91.0%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: 班级学生管理 (MYCOURSES) ================= */}
          {activeTab === 'mycourses' && (
            <ClassStudentManagement
              counselorName={counselorName}
              counselorRankTag={counselorRankTag}
              showToast={showToast}
              initialClassList={classList}
            />
          )}
        </>
      )}
    </div>
  );
};

// ============================================================================
// 5. ADMIN WORKSPACE VIEW (星系管理员 · 林教务长 教务处管理者)
// ============================================================================
export interface AdminWorkspaceViewProps {
  activeTab: 'attendance' | 'badges' | 'analytics' | 'mycourses';
  showToast: (msg: string) => void;
}

export const AdminWorkspaceView: React.FC<AdminWorkspaceViewProps> = ({
  activeTab,
  showToast,
}) => {
  return (
    <div className="space-y-3 animate-in fade-in duration-200">
      {/* ================= TAB 1: 全校总览 (ATTENDANCE) ================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-3">
          <div className="bg-white border border-[#E4E6EB] rounded-md p-3 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
              <div>
                <h3 className="text-xs font-bold text-[#050505]">全校教学运行总览驾驶舱</h3>
                <p className="text-[10px] text-[#65676B]">校教务处: 林教务长 · 统一监管平台</p>
              </div>
              <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-300">
                星系管理员
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
              <div className="p-2 bg-[#FAFBFD] border border-[#E4E6EB] rounded-xs">
                <span className="text-[9.5px] text-[#65676B]">全校今日开课</span>
                <div className="text-base font-bold text-[#050505] mt-0.5">186 门次</div>
              </div>
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xs">
                <span className="text-[9.5px] text-emerald-700 font-bold">全校综合到课</span>
                <div className="text-base font-bold text-emerald-700 mt-0.5">96.8%</div>
              </div>
              <div className="p-2 bg-blue-50 border border-blue-200 rounded-xs">
                <span className="text-[9.5px] text-[#1877F2] font-bold">信标灯塔健康</span>
                <div className="text-base font-bold text-[#1877F2] mt-0.5">48/48 正常</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: 学院对比 (BADGES) ================= */}
      {activeTab === 'badges' && (
        <div className="space-y-3">
          <div className="bg-white border border-[#E4E6EB] rounded-md p-3 space-y-2.5 shadow-2xs">
            <h3 className="text-xs font-bold text-[#050505] flex items-center gap-1.5">
              <Building2 size={14} className="text-[#1877F2]" />
              <span>全校各二级学院出勤率宏观横向对比</span>
            </h3>

            <div className="space-y-1.5 text-xs">
              {[
                { name: '计算机科学与技术学院', rate: '97.2%', classes: '42门次' },
                { name: '电子与信息工程学院', rate: '96.5%', classes: '38门次' },
                { name: '生物工程与医学学院', rate: '95.8%', classes: '30门次' },
                { name: '经济与管理学院', rate: '94.9%', classes: '46门次' },
              ].map((c, i) => (
                <div key={i} className="p-2 border border-[#E4E6EB] rounded-xs flex items-center justify-between bg-white">
                  <div>
                    <div className="font-bold text-[#050505]">{c.name}</div>
                    <div className="text-[10px] text-[#65676B]">今日开课: {c.classes}</div>
                  </div>
                  <span className="font-bold text-[#1877F2]">{c.rate}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: 宏观学情 (ANALYTICS) ================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-3">
          <div className="bg-white border border-[#E4E6EB] rounded-md p-3 space-y-2 shadow-2xs">
            <h4 className="text-xs font-bold text-[#050505]">全校教学周历与学期出勤走势</h4>
            <p className="text-xs text-[#65676B]">第 6 教学周总体运行平稳，零重大教学事故。</p>
          </div>
        </div>
      )}

      {/* ================= TAB 4: 周历调度 (MYCOURSES) ================= */}
      {activeTab === 'mycourses' && (
        <div className="space-y-3">
          <div className="bg-white border border-[#E4E6EB] rounded-md p-3 space-y-2 shadow-2xs">
            <h4 className="text-xs font-bold text-[#050505]">节假日调课与期末考试周调度</h4>
            <p className="text-xs text-[#65676B]">国庆假期调休安排已下发至全校师生终端。</p>
          </div>
        </div>
      )}
    </div>
  );
};
