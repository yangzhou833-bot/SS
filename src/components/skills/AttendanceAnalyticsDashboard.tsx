import React from 'react';
import {
  TrendingUp,
  FileText,
  BarChart3,
  Users,
  AlertTriangle,
  Bell,
  Edit3,
} from 'lucide-react';
import { StudentItem } from './CourseManagementApp';

export interface AttendanceAnalyticsDashboardProps {
  students: StudentItem[];
  notify: (msg: string) => void;
  openManualAuditModal: (stu: StudentItem) => void;
  getStatusBubbleConfig: (student: StudentItem) => {
    text: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
    dotColor: string;
    icon: React.ReactNode;
  };
  getStudentTrendData: (absentCount: number, studentId: string) => number[];
}

export const AttendanceAnalyticsDashboard: React.FC<AttendanceAnalyticsDashboardProps> = ({
  students,
  notify,
  openManualAuditModal,
  getStatusBubbleConfig,
  getStudentTrendData,
}) => {
  const totalEnrolled = 463;
  const currentAbsentSum = students.reduce((acc, s) => acc + (s.absentCount || 0), 0);
  const dynamicCheckedIn = Math.max(0, totalEnrolled - currentAbsentSum);
  const dynamicAttendanceRate = ((dynamicCheckedIn / totalEnrolled) * 100).toFixed(1);
  const highRiskList = students
    .filter((s) => (s.absentCount || 0) >= 2 || (s.consecutiveAbsent || 0) >= 2)
    .sort((a, b) => (b.absentCount || 0) - (a.absentCount || 0));
  const criticalHighRiskCount = students.filter((s) => (s.absentCount || 0) >= 3).length;

  const classStats = [
    { name: 'CS101 计科一班', count: 32, adviser: '张立华 教授' },
    { name: 'CS102 计科二班', count: 30, adviser: '李明 老师' },
    { name: 'CS104 计科四班', count: 32, adviser: '王建国 教授' },
  ].map((cls) => {
    const clsStudents = students.filter((s) => (s.className || '').includes(cls.name.slice(0, 5)));
    const clsAbsentCount = clsStudents.reduce((acc, s) => acc + (s.status === 'absent_gray' ? 1 : 0), 0);
    const clsChecked = Math.max(0, cls.count - clsAbsentCount);
    const clsRate = Number(((clsChecked / cls.count) * 100).toFixed(1));
    const clsWarnings = clsStudents.filter((s) => (s.absentCount || 0) >= 2).length;
    return {
      ...cls,
      checked: clsChecked,
      absent: clsAbsentCount,
      rate: clsRate,
      warningCount: clsWarnings,
    };
  });

  return (
    <div className="space-y-3 animate-in fade-in duration-150">
      {/* Header & Global Overview */}
      <div className="bg-white border border-[#E4E6EB] p-3.5 rounded-xs shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
          <div className="flex items-center gap-1.5">
            <div className="p-1.5 bg-[#1877F2] text-white rounded-2xs shadow-2xs">
              <TrendingUp size={15} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#1C1E21] flex items-center gap-1.5">
                <span>全校与各教学班考勤看板</span>
                <span className="text-[8px] bg-[#E7F3FF] text-[#1877F2] px-1.5 py-0.2 rounded-2xs border border-[#1877F2]/20 font-bold">
                  实时数据自动同步
                </span>
              </h3>
              <p className="text-[9.5px] text-[#65676B]">
                综合统计到课率、累计实到/缺勤人次；讲师人工核查补签后本页面数据实时联动更新
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => notify('📊 考勤分析周报已导出并同步发送至教务处与辅导员工作台！')}
            className="px-2.5 py-1 bg-[#E7F3FF] hover:bg-[#DBECFE] text-[#1877F2] font-bold text-[10px] rounded-xs border border-[#1877F2]/30 cursor-pointer flex items-center gap-1 shadow-2xs"
          >
            <FileText size={11} />
            <span>导出周报</span>
          </button>
        </div>

        {/* Top 4 KPI Metrics Cards (Reactive) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-[#FAFBFD] p-2.5 border border-[#E4E6EB] rounded-xs">
            <span className="text-[9.5px] text-[#65676B] block">总到课率 (全学期实时)</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-black text-emerald-600 font-mono">{dynamicAttendanceRate}%</span>
              <span className="text-[8px] text-emerald-600 font-bold">↑ 动态更新</span>
            </div>
            <span className="text-[8px] text-[#65676B] mt-0.5 block">高于学院基准线 (92.0%)</span>
          </div>

          <div className="bg-[#FAFBFD] p-2.5 border border-[#E4E6EB] rounded-xs">
            <span className="text-[9.5px] text-[#65676B] block">实到考勤总人次</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-black text-[#1877F2] font-mono">{dynamicCheckedIn}</span>
              <span className="text-[8.5px] text-[#65676B]">/ {totalEnrolled} 人次</span>
            </div>
            <span className="text-[8px] text-[#65676B] mt-0.5 block">含信标自动打卡与人工补录</span>
          </div>

          <div className="bg-[#FAFBFD] p-2.5 border border-[#E4E6EB] rounded-xs">
            <span className="text-[9.5px] text-[#65676B] block">累计缺课总人次</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-black text-rose-600 font-mono">{currentAbsentSum}</span>
              <span className="text-[8.5px] text-rose-500">人次</span>
            </div>
            <span className="text-[8px] text-[#65676B] mt-0.5 block">准假销假后实时自动扣减</span>
          </div>

          <div className="bg-[#FAFBFD] p-2.5 border border-[#E4E6EB] rounded-xs">
            <span className="text-[9.5px] text-[#65676B] block">缺课过多重点预警</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-black text-amber-600 font-mono">
                {criticalHighRiskCount}
              </span>
              <span className="text-[8.5px] text-amber-600 font-bold">人 (缺席≥3次)</span>
            </div>
            <span className="text-[8px] text-[#65676B] mt-0.5 block">已自动触发辅导员联络</span>
          </div>
        </div>

        {/* Weekly Trend Chart */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#1C1E21] flex items-center gap-1">
              <BarChart3 size={12} className="text-[#1877F2]" />
              <span>近 8 周各教学周到课率走势:</span>
            </span>
            <span className="text-[8.5px] text-[#65676B]">达标线: 90%</span>
          </div>

          <div className="h-28 bg-[#FAFBFD] border border-[#E4E6EB] p-2.5 rounded-xs flex items-end justify-between relative">
            <div className="absolute inset-0 flex flex-col justify-between p-2 pointer-events-none opacity-20">
              <div className="border-b border-slate-400 w-full" />
              <div className="border-b border-slate-400 w-full" />
              <div className="border-b border-slate-400 w-full" />
            </div>

            {[
              { week: 'W1', rate: 89, total: 58, checked: 52 },
              { week: 'W2', rate: 93, total: 58, checked: 54 },
              { week: 'W3', rate: 91, total: 60, checked: 55 },
              { week: 'W4', rate: 96, total: 60, checked: 58 },
              { week: 'W5', rate: 94, total: 58, checked: 55 },
              { week: 'W6', rate: 97, total: 60, checked: 58 },
              { week: 'W7', rate: 95, total: 58, checked: 55 },
              { week: 'W8', rate: Math.max(90, Math.min(100, Math.round(Number(dynamicAttendanceRate)))), total: 60, checked: 59 },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-0.5 z-10">
                <span className="text-[8px] font-mono font-bold text-[#1877F2]">{item.rate}%</span>
                <div
                  className={`w-4 rounded-2xs transition-all ${
                    item.rate >= 95
                      ? 'bg-[#1877F2]'
                      : item.rate >= 90
                      ? 'bg-blue-400'
                      : 'bg-amber-500'
                  }`}
                  style={{ height: `${Math.max(12, (item.rate - 75) * 3)}px` }}
                />
                <span className="text-[8px] text-[#65676B] font-mono">{item.week}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Card 2: 班级出勤率对比与明细统计 (Reactive) */}
      <div className="bg-white border border-[#E4E6EB] p-3.5 rounded-xs shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
          <h3 className="text-xs font-bold text-[#1C1E21] flex items-center gap-1.5">
            <Users size={14} className="text-[#1877F2]" />
            <span>各班级到课率与出勤统计对比</span>
          </h3>
          <span className="text-[9px] text-[#65676B]">共 3 个主要教学班 (实时联动)</span>
        </div>

        <div className="space-y-2 text-xs">
          {classStats.map((cls, idx) => (
            <div key={idx} className="p-2.5 bg-[#FAFBFD] border border-[#E4E6EB] rounded-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#1C1E21]">{cls.name}</span>
                  <span className="text-[9px] text-[#65676B]">班主任: {cls.adviser}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-[10px] text-[#65676B]">
                    实到 <strong>{cls.checked}</strong> / <strong>{cls.count}</strong> 人
                  </span>
                  <span className="text-xs font-black text-emerald-600">{cls.rate}%</span>
                </div>
              </div>

              <div className="w-full h-1.5 bg-[#E4E6EB] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1877F2] rounded-full transition-all duration-300"
                  style={{ width: `${cls.rate}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[8.5px] text-[#65676B]">
                <span>在册人数: {cls.count} 人 · 缺勤 {cls.absent} 人</span>
                <span className="text-amber-600 font-bold">
                  缺席预警学生: {cls.warningCount} 人
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Card 3: 班级缺席过多课程学生预警名单 (支持点击进入核查补签模式) */}
      <div className="bg-white border-2 border-rose-400 rounded-xs p-3.5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
          <div className="flex items-center gap-1.5">
            <div className="p-1.5 bg-rose-600 text-white rounded-2xs shadow-2xs">
              <AlertTriangle size={15} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#1C1E21] flex items-center gap-1.5">
                <span>缺席过多课程学生预警名单</span>
                <span className="text-[8px] bg-rose-50 text-rose-600 px-1.5 py-0.2 rounded-2xs border border-rose-200 font-bold">
                  重点关照 ({highRiskList.length}人)
                </span>
              </h3>
              <p className="text-[9.5px] text-[#65676B]">
                累计缺课 ≥2 次的学生；点击头像或「补签核查」按钮可录入请假条并自动销假
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => notify('🔔 已批量向缺席过多学生的班主任及辅导员发送协同提醒通知！')}
            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-xs cursor-pointer shadow-2xs flex items-center gap-1"
          >
            <Bell size={11} />
            <span>一键通报班主任</span>
          </button>
        </div>

        {/* Table / List of High-Risk Students */}
        <div className="space-y-1.5 text-xs">
          {highRiskList.length === 0 ? (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-center rounded-xs font-bold text-[10.5px] border border-emerald-200">
              🎉 太棒了！所有缺课学生均已完成假条核查或补签销假，当前无高危预警学生。
            </div>
          ) : (
            highRiskList.map((stu) => {
              const isHighRisk = (stu.absentCount || 0) >= 4;
              return (
                <div
                  key={stu.id}
                  className={`p-2.5 border rounded-xs flex items-center justify-between transition-all ${
                    isHighRisk
                      ? 'bg-rose-50/70 border-rose-300'
                      : 'bg-[#FAFBFD] border-[#E4E6EB]'
                  }`}
                >
                  <div
                    onClick={() => openManualAuditModal(stu)}
                    className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
                    title="点击学生头像/姓名进入人工核查与补签补录模式"
                  >
                    <div className="relative shrink-0 group/avatar">
                      {/* Red Pulsing Glow Effect for High-Risk Warning (absentCount >= 4) */}
                      {isHighRisk && (
                        <>
                          <span className="absolute -inset-1.5 rounded-full bg-rose-500/50 animate-ping opacity-75 pointer-events-none" />
                          <span className="absolute -inset-1 rounded-full border-2 border-rose-500 shadow-[0_0_12px_rgba(225,29,72,0.9)] animate-pulse pointer-events-none z-0" />
                        </>
                      )}

                      <img
                        src={stu.avatar}
                        alt={stu.name}
                        className={`w-8 h-8 rounded-full object-cover border relative z-10 shadow-2xs group-hover/avatar:ring-2 group-hover/avatar:ring-[#1877F2] transition-all ${
                          isHighRisk ? 'border-rose-500 ring-2 ring-rose-400/60' : 'border-rose-300'
                        }`}
                      />
                      {/* Status Bubble */}
                      {(() => {
                        const bubble = getStatusBubbleConfig(stu);
                        const totalAbsent = stu.absentCount || 0;
                        const trendPoints = getStudentTrendData(totalAbsent, stu.id);
                        
                        // SVG chart dimensions
                        const chartW = 210;
                        const chartH = 42;
                        const pad = 6;
                        const maxVal = Math.max(5, totalAbsent + 1);
                        
                        const coords = trendPoints.map((val, idx) => {
                          const x = pad + (idx / (trendPoints.length - 1)) * (chartW - 2 * pad);
                          const y = chartH - pad - (val / maxVal) * (chartH - 2 * pad);
                          return { x, y, val, week: idx + 1 };
                        });
                        
                        const polylinePoints = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
                        const areaPoints = `${coords[0].x.toFixed(1)},${chartH - pad} ${polylinePoints} ${coords[coords.length - 1].x.toFixed(1)},${chartH - pad}`;

                        return (
                          <>
                            <span
                              className={`absolute -top-1.5 -right-2 z-20 text-[7.5px] font-bold px-1.5 py-0.2 rounded-full border shadow-2xs whitespace-nowrap cursor-pointer ${bubble.bgColor} ${bubble.textColor} ${bubble.borderColor}`}
                            >
                              {bubble.text}
                            </span>

                            {/* Hover Tooltip: Audit Note & Absence Trend Polyline Chart */}
                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover/avatar:block z-50 w-64 p-2.5 bg-white border-2 border-[#1877F2] rounded-xs shadow-2xl text-left pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                              <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-1.5 mb-2">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className={`w-2 h-2 rounded-full shrink-0 ${bubble.dotColor} ${isHighRisk ? 'animate-ping' : ''}`} />
                                  <span className="text-xs font-black text-[#1C1E21] truncate">{stu.name}</span>
                                  <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded-2xs border ${
                                    isHighRisk ? 'bg-rose-100 text-rose-700 border-rose-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                                  }`}>
                                    {isHighRisk ? '高危预警 (≥4次)' : '中度预警'}
                                  </span>
                                </div>
                                <span className="text-[8.5px] text-[#65676B] font-mono shrink-0">{stu.studentId || '2024CS08'}</span>
                              </div>

                              {/* Student Absence Trend Line Chart (缺勤趋势折线图) */}
                              <div className="bg-[#FAFBFD] p-2 border border-[#E4E6EB] rounded-2xs mb-2 space-y-1">
                                <div className="flex items-center justify-between text-[9px] font-bold">
                                  <span className="flex items-center gap-1 text-[#1877F2]">
                                    <TrendingUp size={11} className="text-rose-600" />
                                    <span>近 8 周缺勤趋势折线图</span>
                                  </span>
                                  <span className="font-mono text-rose-600 font-black">累计 {totalAbsent} 次</span>
                                </div>

                                {/* SVG Chart */}
                                <div className="relative w-full h-[42px] my-1">
                                  <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-full overflow-visible">
                                    <defs>
                                      <linearGradient id={`trendGrad-${stu.id}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#E11D48" stopOpacity="0.4" />
                                        <stop offset="100%" stopColor="#E11D48" stopOpacity="0.02" />
                                      </linearGradient>
                                    </defs>
                                    
                                    {/* Background Dashed Grid */}
                                    <line x1={pad} y1={chartH/2} x2={chartW-pad} y2={chartH/2} stroke="#E4E6EB" strokeDasharray="2,2" strokeWidth="0.8" />
                                    
                                    {/* Gradient Area Fill */}
                                    <polygon points={areaPoints} fill={`url(#trendGrad-${stu.id})`} />
                                    
                                    {/* Trend Polyline */}
                                    <polyline
                                      fill="none"
                                      stroke="#E11D48"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      points={polylinePoints}
                                    />
                                    
                                    {/* Data Points */}
                                    {coords.map((c, idx) => {
                                      const isIncreased = idx > 0 && c.val > coords[idx - 1].val;
                                      return (
                                        <g key={idx}>
                                          <circle
                                            cx={c.x}
                                            cy={c.y}
                                            r={isIncreased ? 3.5 : 2}
                                            fill={isIncreased ? '#E11D48' : '#1877F2'}
                                            stroke="#FFFFFF"
                                            strokeWidth="1"
                                          />
                                        </g>
                                      );
                                    })}
                                  </svg>
                                </div>

                                {/* Week Labels */}
                                <div className="flex justify-between text-[7.5px] font-mono text-[#65676B] px-0.5">
                                  <span>W1</span>
                                  <span>W2</span>
                                  <span>W3</span>
                                  <span>W4</span>
                                  <span>W5</span>
                                  <span>W6</span>
                                  <span>W7</span>
                                  <span>W8</span>
                                </div>
                              </div>

                              <div className="space-y-1 text-[8.5px]">
                                <div>
                                  <span className="text-[#65676B] font-medium">审核批注：</span>
                                  <span className="text-[#1C1E21] font-normal leading-tight">
                                    {stu.auditNote || stu.manualRemarks || (stu.leaveNote ? stu.leaveNote.doctorAdvice : (stu.status === 'absent_gray' ? '尚未出示就医假条凭证' : '考勤预警观察中'))}
                                  </span>
                                </div>
                                {stu.leaveNote?.hospitalOrOrg && (
                                  <div className="text-[8px] text-[#65676B]">
                                    <span>机构来源: </span>
                                    <span>{stu.leaveNote.hospitalOrOrg}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#1C1E21] text-[11px] group-hover:text-[#1877F2] transition-colors">
                          {stu.name}
                        </span>
                        <span className="text-[9px] text-[#65676B] font-mono">
                          {stu.studentId}
                        </span>
                        <span className="text-[8.5px] text-[#65676B]">
                          · {stu.className}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] text-[#65676B] mt-0.5">
                        <span className="text-rose-600 font-bold">
                          累计缺课: {stu.absentCount || 0} 次
                        </span>
                        {((stu.consecutiveAbsent || 0) >= 2) && (
                          <span className="text-amber-600 font-bold bg-amber-50 px-1 rounded-2xs border border-amber-200">
                            连续缺勤 {stu.consecutiveAbsent} 节
                          </span>
                        )}
                        {stu.leaveNote && (
                          <span className="text-emerald-700 bg-emerald-50 px-1 rounded-2xs border border-emerald-200">
                            已附就医病假条
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => openManualAuditModal(stu)}
                      className="px-2 py-1 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-[9.5px] rounded-xs cursor-pointer shadow-2xs flex items-center gap-0.5"
                      title="审核请假条或补签到课"
                    >
                      <Edit3 size={10} />
                      <span>补签核查</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => notify(`已向学生【${stu.name}】发送电子考勤整改补签提醒`)}
                      className="px-2 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-300 font-bold text-[9.5px] rounded-xs cursor-pointer shadow-2xs"
                    >
                      单独提醒
                    </button>
                    <button
                      type="button"
                      onClick={() => notify(`已呼叫【${stu.name}】所在班级班长进行协助核查`)}
                      className="px-2 py-1 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#1C1E21] border border-[#E4E6EB] font-bold text-[9.5px] rounded-xs cursor-pointer"
                    >
                      联系班长
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-2 bg-rose-50/50 border border-rose-200/60 rounded-xs text-[9px] text-rose-700 flex items-center justify-between">
          <span>💡 规则说明：单门课程累计旷课达总学时 1/3 的学生，按教务处规定将取消期末考试资格。</span>
          <span className="font-bold cursor-pointer hover:underline" onClick={() => notify('教务处学籍考勤管理办法已查阅')}>
            查看学籍规定 &gt;
          </span>
        </div>
      </div>
    </div>
  );
};
