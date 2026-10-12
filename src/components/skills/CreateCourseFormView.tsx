import React, { useState } from 'react';
import {
  BookOpen,
  User,
  Clock,
  MapPin,
  Users,
  Radio,
  Plus,
  Sparkles,
  Check,
  Compass,
  Maximize2,
  Layers,
  ArrowLeft,
} from 'lucide-react';
import { getWeekDayDates } from './CourseManagementApp';
import { BeaconMapPreviewModal } from './BeaconMapPreviewModal';

interface CreateCourseFormViewProps {
  currentTeacherName: string;
  currentTeacherRank: string;
  classList: Array<{
    id: string;
    name: string;
    shortCode: string;
    dept: string;
    count: number;
    adviser: string;
  }>;
  onSubmitCourse: (courseData: {
    name: string;
    teacher: string;
    schedule: string;
    classroom: string;
    groupType: 'small' | 'large';
    classes: string[];
    beaconLat: number;
    beaconLng: number;
    beaconRadius: number;
    day: string;
    time: string;
  }) => void;
  onCancel?: () => void;
  isInline?: boolean;
}

const QUICK_COURSE_PRESETS = [
  '数据结构与算法',
  '操作系统原理与实验',
  '数据库系统概论',
  '人工智能与机器学习',
  '计算机网络技术',
  '高等数学与线性代数',
];

const QUICK_CLASSROOM_PRESETS = [
  '3-101 计算机实验室',
  '2-405 大报告厅',
  '5-203 嵌入式中心',
  '理科楼 1-208 研讨室',
  '工科楼 4-302 智慧教室',
];

const WEEK_DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const TIME_SLOTS = [
  '08:00 - 10:00',
  '10:00 - 12:00',
  '14:00 - 16:00',
  '16:00 - 18:00',
  '19:00 - 21:00',
];

export const CreateCourseFormView: React.FC<CreateCourseFormViewProps> = ({
  currentTeacherName,
  currentTeacherRank,
  classList,
  onSubmitCourse,
  onCancel,
  isInline = false,
}) => {
  const [courseName, setCourseName] = useState<string>('');
  const [teacher, setTeacher] = useState<string>(
    `${currentTeacherName} ${currentTeacherRank} (我)`
  );
  const [selectedWeek, setSelectedWeek] = useState<number>(8);
  const [selectedDay, setSelectedDay] = useState<string>('周一');
  const [selectedTime, setSelectedTime] = useState<string>('10:00 - 12:00');
  const [classroom, setClassroom] = useState<string>('3-101 计算机实验室');
  const [groupType, setGroupType] = useState<'small' | 'large'>('small');
  const [selectedClasses, setSelectedClasses] = useState<string[]>(['CS101 计科一班']);
  const [beaconRadius, setBeaconRadius] = useState<number>(50);
  const [lat, setLat] = useState<string>('36.0592');
  const [lng, setLng] = useState<string>('103.8343');
  const [autoBeacon, setAutoBeacon] = useState<boolean>(true);
  const [isBeaconMapModalOpen, setIsBeaconMapModalOpen] = useState<boolean>(false);

  // Toggle class selection
  const handleToggleClass = (clsName: string) => {
    setSelectedClasses((prev) => {
      if (prev.includes(clsName)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((c) => c !== clsName);
      }
      return [...prev, clsName];
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = courseName.trim();
    if (!finalName) return;

    onSubmitCourse({
      name: finalName,
      teacher: teacher.trim() || `${currentTeacherName} ${currentTeacherRank}`,
      schedule: `每${selectedDay} ${selectedTime}`,
      classroom: classroom.trim() || '3-101 计算机实验室',
      groupType,
      classes: selectedClasses.length > 0 ? selectedClasses : ['CS101 计科一班'],
      beaconLat: parseFloat(lat) || 36.0592,
      beaconLng: parseFloat(lng) || 103.8343,
      beaconRadius,
      day: selectedDay,
      time: selectedTime,
    });
  };

  return (
    <div
      id="from-scratch-course-creation"
      className={`bg-white border border-[#E4E6EB] rounded-md shadow-2xs text-[#1C1E21] overflow-hidden ${
        isInline ? 'p-3.5 space-y-3' : 'p-4 space-y-3.5'
      }`}
    >
      {/* Header */}
      <div className="border-b border-[#E4E6EB] pb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#1877F2] text-white rounded-xs shadow-2xs">
            <BookOpen size={15} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#050505] flex items-center gap-1.5">
              <span>从头填写建立授课课程</span>
              <span className="text-[9px] text-[#1877F2] bg-[#E7F3FF] px-1.5 py-0.2 rounded-2xs border border-[#1877F2]/20 font-bold">
                从零自建
              </span>
            </h3>
            <p className="text-[9.5px] text-[#65676B]">
              已去除预设课程，请在此完整填写课程信息，建立后将自动排入课表并点亮 50m 虚拟考勤信标
            </p>
          </div>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-[10.5px] text-[#1877F2] hover:text-[#166FE5] font-bold px-2 py-1 bg-[#E7F3FF] hover:bg-[#D8EBFF] border border-[#1877F2]/30 rounded-xs cursor-pointer flex items-center gap-1 transition-colors shrink-0 shadow-2xs"
            title="返回"
          >
            <ArrowLeft size={11} className="stroke-[2.5]" />
            <span>返回</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        {/* Field 1: Course Name */}
        <div className="space-y-1.5">
          <label className="text-[10.5px] font-bold text-[#050505] flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span className="text-[#1877F2]">*</span>
              <span>1. 课程名称：</span>
            </span>
            <span className="text-[9px] text-[#65676B]">推荐从下方快捷点选或手动输入</span>
          </label>
          <input
            type="text"
            id="new-course-name-input"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            placeholder="请输入课程名称，如：数据结构与算法"
            required
            className="w-full text-xs px-2.5 py-2 bg-white border border-[#E4E6EB] rounded-xs focus:border-[#1877F2] focus:ring-1 focus:ring-[#1877F2] outline-none font-bold text-[#1C1E21] transition-all"
          />

          {/* Quick presets */}
          <div className="flex flex-wrap gap-1 pt-0.5">
            {QUICK_COURSE_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setCourseName(preset)}
                className={`text-[9.5px] px-2 py-0.8 rounded-2xs border transition-colors cursor-pointer whitespace-nowrap ${
                  courseName === preset
                    ? 'bg-[#E7F3FF] text-[#1877F2] border-[#1877F2] font-bold'
                    : 'bg-[#FAFBFD] text-[#65676B] border-[#E4E6EB] hover:border-[#1877F2]'
                }`}
              >
                + {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Field 2: Teacher & Mode */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[10.5px] font-bold text-[#050505] flex items-center gap-1">
              <User size={11} className="text-[#1877F2]" />
              <span>主讲教师与职称</span>
            </label>
            <input
              type="text"
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
              placeholder="如：张立华 教授 (我)"
              required
              className="w-full text-xs px-2.5 py-1.5 bg-white border border-[#E4E6EB] rounded-xs focus:border-[#1877F2] focus:ring-1 focus:ring-[#1877F2] outline-none font-bold text-[#1C1E21] transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10.5px] font-bold text-[#050505] flex items-center gap-1">
              <Users size={11} className="text-[#1877F2]" />
              <span>授课模式</span>
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setGroupType('small')}
                className={`flex-1 py-1.5 px-1.5 rounded-xs text-[10px] font-bold border cursor-pointer transition-colors text-center truncate ${
                  groupType === 'small'
                    ? 'bg-[#E7F3FF] text-[#1877F2] border-[#1877F2]'
                    : 'bg-white text-[#65676B] border-[#E4E6EB]'
                }`}
              >
                小班精讲 (32人)
              </button>
              <button
                type="button"
                onClick={() => setGroupType('large')}
                className={`flex-1 py-1.5 px-1.5 rounded-xs text-[10px] font-bold border cursor-pointer transition-colors text-center truncate ${
                  groupType === 'large'
                    ? 'bg-[#E7F3FF] text-[#1877F2] border-[#1877F2]'
                    : 'bg-white text-[#65676B] border-[#E4E6EB]'
                }`}
              >
                合班大课 (62人)
              </button>
            </div>
          </div>
        </div>

        {/* Field 3: Class Selection */}
        <div className="space-y-1">
          <label className="text-[10.5px] font-bold text-[#050505] flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Users size={11} className="text-[#1877F2]" />
              <span>2. 授课教学班级（可多选）：</span>
            </span>
            <span className="text-[9px] text-[#1877F2] font-mono">
              已选 {selectedClasses.length} 个班级
            </span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {classList.map((cls) => {
              const isChecked = selectedClasses.includes(cls.name);
              return (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => handleToggleClass(cls.name)}
                  className={`p-1.5 rounded-xs border text-left cursor-pointer transition-colors flex items-center justify-between ${
                    isChecked
                      ? 'bg-[#E7F3FF] border-[#1877F2] text-[#1877F2] font-bold'
                      : 'bg-[#FAFBFD] border-[#E4E6EB] text-[#1C1E21] hover:bg-[#F0F2F5]'
                  }`}
                >
                  <span className="text-[10px] truncate">{cls.name}</span>
                  {isChecked && <Check size={11} className="shrink-0 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Field 4: Time and Weekday */}
        <div className="space-y-2 border border-[#E4E6EB] p-2.5 rounded-xs bg-[#FAFBFD]">
          <div className="flex items-center justify-between">
            <label className="text-[10.5px] font-bold text-[#050505] flex items-center gap-1">
              <Clock size={11} className="text-[#1877F2]" />
              <span>3. 排课时间（星期与节次）：</span>
            </label>
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-[#65676B]">教学周：</span>
              <span className="px-1.5 py-0.2 bg-[#E7F3FF] text-[#1877F2] font-bold rounded-2xs text-[9px] border border-[#1877F2]/20 font-mono">
                第 {selectedWeek} 周标识
              </span>
            </div>
          </div>

          {/* Week switcher */}
          <div className="grid grid-cols-4 gap-1">
            {[
              { week: 7, label: '第 7 周', range: '10.05 - 10.11' },
              { week: 8, label: '第 8 周 (本周)', range: '10.12 - 10.18' },
              { week: 9, label: '第 9 周 (下周)', range: '10.19 - 10.25' },
              { week: 10, label: '第 10 周', range: '10.26 - 11.01' },
            ].map((w) => {
              const isSelected = selectedWeek === w.week;
              return (
                <button
                  key={w.week}
                  type="button"
                  onClick={() => setSelectedWeek(w.week)}
                  className={`py-1 px-1 rounded-xs border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-[#E7F3FF] border-[#1877F2] text-[#1877F2] font-bold shadow-2xs'
                      : 'bg-white border-[#E4E6EB] text-[#65676B] hover:border-[#1877F2]/40'
                  }`}
                >
                  <span className="text-[9.5px] font-bold leading-tight">{w.label}</span>
                  <span className="text-[8px] font-mono opacity-80 mt-0.5">{w.range}</span>
                </button>
              );
            })}
          </div>

          {/* Weekday buttons with specific dates */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9.5px] text-[#65676B]">上课星期与对应具体日期：</span>
              <span className="text-[9px] text-[#1877F2] font-mono font-bold">
                已选：{selectedDay} ({getWeekDayDates(selectedWeek).find((d) => d.day === selectedDay)?.monthDayStr})
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {getWeekDayDates(selectedWeek).map((item) => {
                const isSelected = selectedDay === item.day;
                return (
                  <button
                    key={item.day}
                    type="button"
                    onClick={() => setSelectedDay(item.day)}
                    className={`py-1 px-0.5 text-center rounded-xs border cursor-pointer transition-all flex flex-col items-center justify-center min-h-[44px] ${
                      isSelected
                        ? 'bg-[#1877F2] text-white border-[#1877F2] shadow-2xs font-bold scale-[1.02] z-10'
                        : 'bg-white text-[#1C1E21] border-[#E4E6EB] hover:border-[#1877F2]'
                    }`}
                  >
                    <span className="text-[10px] font-bold leading-tight">{item.day}</span>
                    <span
                      className={`text-[8px] font-mono leading-tight mt-0.5 ${
                        isSelected ? 'text-white/95 font-bold' : 'text-[#65676B]'
                      }`}
                    >
                      {item.dateStr}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time slot buttons */}
          <div className="grid grid-cols-3 gap-1 pt-0.5">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedTime(slot)}
                className={`py-1 px-1 text-[9.5px] font-bold rounded-xs border cursor-pointer transition-colors text-center font-mono ${
                  selectedTime === slot
                    ? 'bg-[#E7F3FF] text-[#1877F2] border-[#1877F2] shadow-2xs'
                    : 'bg-white text-[#65676B] border-[#E4E6EB] hover:bg-[#F0F2F5]'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>

          {/* Specific date summary strip */}
          {(() => {
            const activeInfo = getWeekDayDates(selectedWeek).find((d) => d.day === selectedDay);
            return (
              <div className="bg-white border border-[#E4E6EB] p-1.5 rounded-xs flex items-center justify-between text-[9.5px]">
                <span className="text-[#050505] font-bold">
                  具体日期：{activeInfo?.fullDateStr} ({selectedDay}) · {selectedTime}
                </span>
                <span className="text-[#1877F2] font-mono font-bold">
                  第 {selectedWeek} 周标识
                </span>
              </div>
            );
          })()}
        </div>

        {/* Field 5: Classroom */}
        <div className="space-y-1.5">
          <label className="text-[10.5px] font-bold text-[#050505] flex items-center justify-between">
            <span className="flex items-center gap-1">
              <MapPin size={11} className="text-[#1877F2]" />
              <span>4. 上课教室与地点：</span>
            </span>
            <span className="text-[9px] text-[#65676B]">点击预设快速填入</span>
          </label>
          <input
            type="text"
            value={classroom}
            onChange={(e) => setClassroom(e.target.value)}
            placeholder="如：3-101 计算机实验室"
            required
            className="w-full text-xs p-2 bg-white border border-[#E4E6EB] rounded-xs focus:border-[#1877F2] focus:outline-hidden"
          />

          <div className="flex flex-wrap gap-1">
            {QUICK_CLASSROOM_PRESETS.map((rm) => (
              <button
                key={rm}
                type="button"
                onClick={() => setClassroom(rm)}
                className={`text-[9px] px-1.5 py-0.5 rounded-2xs border cursor-pointer transition-colors ${
                  classroom === rm
                    ? 'bg-[#E7F3FF] text-[#1877F2] border-[#1877F2] font-bold'
                    : 'bg-[#FAFBFD] text-[#65676B] border-[#E4E6EB]'
                }`}
              >
                {rm}
              </button>
            ))}
          </div>
        </div>

        {/* Field 6: 50m Electronic Attendance Beacon */}
        <div className="bg-[#FAFBFD] p-2.5 border border-[#E4E6EB] hover:border-[#1877F2]/60 rounded-xs space-y-2 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Radio size={13} className="text-[#1877F2] animate-pulse" />
              <span className="text-[10.5px] font-bold text-[#050505]">
                50m 虚拟考勤信标与地图打卡
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsBeaconMapModalOpen(true)}
                className="px-2 py-0.5 bg-[#E7F3FF] hover:bg-[#DBECFE] text-[#1877F2] border border-[#1877F2]/40 font-bold rounded-2xs text-[9.5px] cursor-pointer flex items-center gap-1 shadow-2xs transition-colors"
              >
                <MapPin size={10} />
                <span>地图选点与50m围栏预览</span>
              </button>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoBeacon}
                  onChange={(e) => setAutoBeacon(e.target.checked)}
                  className="w-3.5 h-3.5 text-[#1877F2] rounded-xs"
                />
                <span className="text-[9.5px] font-bold text-[#1877F2]">自动生成信标</span>
              </label>
            </div>
          </div>

          <p className="text-[9px] text-[#65676B] leading-tight">
            课程建立后系统将自动在空间地图建立虚拟信标围栏（50米范围有效），学生在围栏内即可一键打卡。
          </p>

          {/* Interactive Map Preview Card Banner */}
          <div
            onClick={() => setIsBeaconMapModalOpen(true)}
            className="bg-white border border-[#1877F2]/40 hover:border-[#1877F2] p-2 rounded-xs flex items-center justify-between gap-2 cursor-pointer group shadow-2xs transition-all"
            title="点击打开地图预览窗口，并在中心点渲染出50米虚拟围栏圆圈区域"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-sm shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                🗼
              </div>
              <div className="min-w-0 text-[9.5px]">
                <div className="font-bold text-[#1C1E21] truncate flex items-center gap-1">
                  <span>{classroom} · 信标中心点</span>
                  <span className="text-[8.5px] bg-[#E7F3FF] text-[#1877F2] px-1 py-0.2 rounded-2xs font-mono font-bold">
                    R = {beaconRadius}m
                  </span>
                </div>
                <div className="text-[#65676B] font-mono truncate">
                  坐标: {lat}, {lng} · 点击弹出 50 米虚拟围栏地图预览
                </div>
              </div>
            </div>

            <button
              type="button"
              className="px-2 py-1 bg-[#1877F2] text-white font-bold rounded-2xs text-[9px] shrink-0 flex items-center gap-0.5 shadow-2xs group-hover:bg-[#166FE5]"
            >
              <Maximize2 size={9} />
              <span>全屏选点</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-[9.5px] pt-0.5">
            <div>
              <span className="text-[#65676B] block">围栏半径</span>
              <span className="font-mono font-bold text-[#1877F2]">{beaconRadius} 米 (标准教学区)</span>
            </div>
            <div>
              <span className="text-[#65676B] block">经度 (Lng)</span>
              <span className="font-mono font-bold text-[#050505]">{lng}</span>
            </div>
            <div>
              <span className="text-[#65676B] block">纬度 (Lat)</span>
              <span className="font-mono font-bold text-[#050505]">{lat}</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-1">
          <button
            type="submit"
            id="submit-course-btn"
            className="w-full py-2.5 px-4 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-xs rounded-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
          >
            <Plus size={14} className="stroke-[3]" />
            <span>立即建立课程并生成课表与信标</span>
          </button>
        </div>
      </form>

      {/* Beacon Map Preview Modal (50m virtual fence window) */}
      <BeaconMapPreviewModal
        isOpen={isBeaconMapModalOpen}
        onClose={() => setIsBeaconMapModalOpen(false)}
        initialLat={parseFloat(lat) || 36.0592}
        initialLng={parseFloat(lng) || 103.8343}
        initialRadius={beaconRadius}
        initialRoomName={classroom}
        courseName={courseName || '未命名课程'}
        teacherName={teacher}
        onConfirm={(newLatVal, newLngVal, newRadVal, newRoomVal) => {
          setLat(newLatVal.toString());
          setLng(newLngVal.toString());
          setBeaconRadius(newRadVal);
          if (newRoomVal) {
            setClassroom(newRoomVal);
          }
        }}
      />
    </div>
  );
};
