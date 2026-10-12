import React, { useState } from 'react';
import {
  GraduationCap,
  Shield,
  Check,
  User,
  Building,
  MapPin,
  FileBadge,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  BookOpen,
  Clock,
  Radio,
  Users,
} from 'lucide-react';
import { getWeekDayDates } from './CourseManagementApp';
import { BeaconMapPreviewModal } from './BeaconMapPreviewModal';

export interface UserIdentityProfile {
  type: 'teacher' | 'counselor';
  teacherTag: '助教' | '讲师' | '副教授' | '教授';
  counselorTag: string;
  name: string;
  staffId: string;
  department: string;
  office: string;
}

interface IdentitySelectionModalProps {
  isOpen: boolean;
  canCancel?: boolean;
  onClose?: () => void;
  onConfirmIdentity: (profile: UserIdentityProfile) => void;
  currentProfile?: Partial<UserIdentityProfile>;
  classList?: Array<{
    id: string;
    name: string;
    shortCode: string;
    dept: string;
    count: number;
    adviser: string;
  }>;
  onCreateCourse?: (courseData: {
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
  onCreateClass?: (classData: {
    name: string;
    shortCode: string;
    dept: string;
    count: number;
    adviser: string;
  }) => void;
}

export const TEACHER_TAGS: Array<'助教' | '讲师' | '副教授' | '教授'> = [
  '助教',
  '讲师',
  '副教授',
  '教授',
];

export const COUNSELOR_TAGS: string[] = [
  '见习辅导员',
  '专职辅导员',
  '骨干辅导员',
  '年级总辅导员/学工组长',
];

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

const QUICK_CLASS_PRESETS = [
  { name: '2024级 计算机科学一班', shortCode: 'CS-2401', count: 32 },
  { name: '2024级 软件工程精英班', shortCode: 'SE-2401', count: 32 },
  { name: '2024级 人工智能实验班', shortCode: 'AI-2401', count: 30 },
  { name: '2023级 网络空间安全班', shortCode: 'SEC-2301', count: 35 },
];

export const IdentitySelectionModal: React.FC<IdentitySelectionModalProps> = ({
  isOpen,
  canCancel = false,
  onClose,
  onConfirmIdentity,
  currentProfile,
  classList = [],
  onCreateCourse,
  onCreateClass,
}) => {
  // Current Step: 1 = 选择身份创建, 2 = 从头填写建立课程/班级
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 Profile States
  const [selectedType, setSelectedType] = useState<'teacher' | 'counselor'>(
    currentProfile?.type || 'teacher'
  );
  const [selectedTeacherTag, setSelectedTeacherTag] = useState<'助教' | '讲师' | '副教授' | '教授'>(
    currentProfile?.teacherTag || '教授'
  );
  const [selectedCounselorTag, setSelectedCounselorTag] = useState<string>(
    currentProfile?.counselorTag || '专职辅导员'
  );
  const [name, setName] = useState<string>(currentProfile?.name || '张立华');
  const [staffId, setStaffId] = useState<string>(currentProfile?.staffId || 'TEA-202688');
  const [department, setDepartment] = useState<string>(
    currentProfile?.department || '计算机科学与技术学院'
  );
  const [office, setOffice] = useState<string>(currentProfile?.office || '理科楼 3-402');

  // Step 2 Course States (for Teacher)
  const [courseName, setCourseName] = useState<string>('数据结构与算法');
  const [selectedWeek, setSelectedWeek] = useState<number>(8);
  const [selectedDay, setSelectedDay] = useState<string>('周一');
  const [selectedTime, setSelectedTime] = useState<string>('10:00 - 12:00');
  const [classroom, setClassroom] = useState<string>('3-101 计算机实验室');
  const [groupType, setGroupType] = useState<'small' | 'large'>('small');
  const [selectedClasses, setSelectedClasses] = useState<string[]>(['CS101 计科一班']);
  const [beaconLat, setBeaconLat] = useState<number>(36.0592);
  const [beaconLng, setBeaconLng] = useState<number>(103.8343);
  const [beaconRadius, setBeaconRadius] = useState<number>(50);
  const [isBeaconMapModalOpen, setIsBeaconMapModalOpen] = useState<boolean>(false);

  // Step 2 Class States (for Counselor)
  const [counselorClassName, setCounselorClassName] = useState<string>('2024级 计算机科学一班');
  const [counselorShortCode, setCounselorShortCode] = useState<string>('CS-2401');
  const [counselorClassCount, setCounselorClassCount] = useState<number>(32);

  if (!isOpen) return null;

  // Handle switching identity type
  const handleTypeChange = (type: 'teacher' | 'counselor') => {
    setSelectedType(type);
    if (type === 'teacher') {
      if (name === '李明 (辅导员)' || name === '李明') {
        setName('张立华');
      }
      setStaffId('TEA-202688');
      setDepartment('计算机科学与技术学院');
      setOffice('理科楼 3-402');
    } else {
      if (name === '张立华') {
        setName('李明');
      }
      setStaffId('ADV-202601');
      setDepartment('计算机科学学院 · 学工办');
      setOffice('学工楼 2-105');
    }
  };

  // Handle teacher tag selection
  const handleTeacherTagChange = (tag: '助教' | '讲师' | '副教授' | '教授') => {
    setSelectedTeacherTag(tag);
    if (tag === '助教') {
      setStaffId('TA-202601');
    } else if (tag === '讲师') {
      setStaffId('TEA-202612');
    } else if (tag === '副教授') {
      setStaffId('TEA-202635');
    } else if (tag === '教授') {
      setStaffId('TEA-202688');
    }
  };

  // Toggle class selection for course
  const handleToggleClass = (clsName: string) => {
    setSelectedClasses((prev) => {
      if (prev.includes(clsName)) {
        if (prev.length === 1) return prev;
        return prev.filter((c) => c !== clsName);
      }
      return [...prev, clsName];
    });
  };

  // Step 1: Proceed to Next Step
  const handleProceedToNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setStep(2);
  };

  // Step 1: Quick Confirm (if user is re-editing and only wants to save profile)
  const handleDirectConfirmProfile = () => {
    if (!name.trim()) return;
    onConfirmIdentity({
      type: selectedType,
      teacherTag: selectedTeacherTag,
      counselorTag: selectedCounselorTag,
      name: name.trim(),
      staffId: staffId.trim() || (selectedType === 'teacher' ? 'TEA-202688' : 'ADV-202601'),
      department: department.trim() || '计算机科学与技术学院',
      office: office.trim() || '理科楼 3-402',
    });
  };

  // Step 2 Submit: Complete Teacher Flow
  const handleFinishTeacherFlow = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCourseName = courseName.trim() || '数据结构与算法';
    const profile: UserIdentityProfile = {
      type: 'teacher',
      teacherTag: selectedTeacherTag,
      counselorTag: selectedCounselorTag,
      name: name.trim() || '张立华',
      staffId: staffId.trim() || 'TEA-202688',
      department: department.trim() || '计算机科学与技术学院',
      office: office.trim() || '理科楼 3-402',
    };

    onConfirmIdentity(profile);

    if (onCreateCourse) {
      onCreateCourse({
        name: finalCourseName,
        teacher: `${name.trim() || '张立华'} ${selectedTeacherTag} (我)`,
        schedule: `每${selectedDay} ${selectedTime}`,
        classroom: classroom.trim() || '3-101 计算机实验室',
        groupType,
        classes: selectedClasses.length > 0 ? selectedClasses : ['CS101 计科一班'],
        beaconLat: beaconLat || 36.0592,
        beaconLng: beaconLng || 103.8343,
        beaconRadius: beaconRadius || 50,
        day: selectedDay,
        time: selectedTime,
      });
    }
  };

  // Step 2 Submit: Complete Counselor Flow
  const handleFinishCounselorFlow = (e: React.FormEvent) => {
    e.preventDefault();
    const profile: UserIdentityProfile = {
      type: 'counselor',
      teacherTag: selectedTeacherTag,
      counselorTag: selectedCounselorTag,
      name: name.trim() || '李明',
      staffId: staffId.trim() || 'ADV-202601',
      department: department.trim() || '计算机科学学院 · 学工办',
      office: office.trim() || '学工楼 2-105',
    };

    onConfirmIdentity(profile);

    if (onCreateClass) {
      onCreateClass({
        name: counselorClassName.trim() || '2024级 计算机科学一班',
        shortCode: counselorShortCode.trim() || 'CS-2401',
        dept: department.trim() || '计算机科学学院',
        count: counselorClassCount,
        adviser: `${name.trim() || '李明'} ${selectedCounselorTag}`,
      });
    }
  };

  return (
    <div
      id="identity-selection-overlay"
      className="fixed inset-0 z-50 bg-black/60 sm:backdrop-blur-xs flex items-center justify-center p-0 sm:p-3 animate-in fade-in duration-150"
    >
      <div
        id="identity-selection-card"
        className="w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-md bg-white border border-[#E4E6EB] sm:rounded-md rounded-none shadow-xl flex flex-col overflow-hidden text-[#1C1E21]"
      >
        {/* Header (Facebook straight-edge style) with prominent Return button */}
        <div className="bg-white border-b border-[#E4E6EB] px-3.5 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {onClose && (
              <button
                type="button"
                id="identity-modal-back-btn"
                onClick={onClose}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#F0F2F5] hover:bg-[#E4E6EB] active:scale-95 text-[#1877F2] font-bold text-xs rounded-xs border border-[#CED0D4] cursor-pointer transition-colors shrink-0 shadow-2xs"
                title="返回地图 / 退出"
                aria-label="返回地图"
              >
                <ArrowLeft size={13} className="stroke-[2.5]" />
                <span>返回</span>
              </button>
            )}

            <div className="w-7 h-7 rounded-xs bg-[#1877F2] text-white flex items-center justify-center shrink-0 shadow-2xs">
              {step === 1 ? (
                <GraduationCap size={16} />
              ) : selectedType === 'teacher' ? (
                <BookOpen size={16} />
              ) : (
                <Shield size={16} />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs sm:text-sm font-bold text-[#050505] leading-tight truncate">
                  {step === 1
                    ? '高校教学管理 · 选择身份'
                    : selectedType === 'teacher'
                    ? '自建第一门授课课程'
                    : '建立学工班级名册'}
                </h2>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-2xs bg-[#E7F3FF] text-[#1877F2] border border-[#1877F2]/30 shrink-0 font-mono">
                  步骤 {step}/2
                </span>
              </div>
              <p className="text-[9.5px] text-[#65676B] truncate">
                {step === 1
                  ? '点击进入后先选择您的身份，开始自建教学体系'
                  : selectedType === 'teacher'
                  ? `【教师 · ${selectedTeacherTag}】${name} · 50m 考勤信标`
                  : `【辅导员 · ${selectedCounselorTag}】${name}`}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-[#65676B] hover:text-[#050505] p-1.5 rounded-xs hover:bg-[#F0F2F5] transition-colors cursor-pointer shrink-0 ml-1"
              title="关闭"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* ================= STEP 1: IDENTITY SELECTION ================= */}
        {step === 1 && (
          <form onSubmit={handleProceedToNextStep} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {/* 1. Initial Identity Choice (教师 / 辅导员) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#050505] flex items-center gap-1">
                <span className="text-[#1877F2]">1.</span>
                <span>请选择您的初始身份：</span>
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Option A: 教师 */}
                <button
                  type="button"
                  id="select-identity-teacher"
                  onClick={() => handleTypeChange('teacher')}
                  className={`p-3 rounded-md text-left transition-all border cursor-pointer flex flex-col justify-between ${
                    selectedType === 'teacher'
                      ? 'bg-[#E7F3FF] border-[#1877F2] ring-1 ring-[#1877F2] shadow-2xs'
                      : 'bg-white border-[#E4E6EB] hover:border-[#1877F2] hover:bg-[#F0F2F5]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="w-8 h-8 rounded-xs bg-blue-100 text-[#1877F2] flex items-center justify-center">
                      <GraduationCap size={18} />
                    </div>
                    {selectedType === 'teacher' && (
                      <div className="w-4 h-4 rounded-full bg-[#1877F2] text-white flex items-center justify-center">
                        <Check size={10} className="stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#050505]">教师 (任课教学)</div>
                    <div className="text-[9.5px] text-[#65676B] mt-0.5 leading-tight">
                      从头填写建立授课课程、发布 50m 虚拟信标空间考勤、管理班级课表
                    </div>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-[#E4E6EB] flex items-center gap-1">
                    <span className="text-[8.5px] font-bold text-[#1877F2] bg-white px-1.5 py-0.2 rounded-2xs border border-[#1877F2]/20">
                      可选4类职称标签
                    </span>
                  </div>
                </button>

                {/* Option B: 辅导员 */}
                <button
                  type="button"
                  id="select-identity-counselor"
                  onClick={() => handleTypeChange('counselor')}
                  className={`p-3 rounded-md text-left transition-all border cursor-pointer flex flex-col justify-between ${
                    selectedType === 'counselor'
                      ? 'bg-[#E7F3FF] border-[#1877F2] ring-1 ring-[#1877F2] shadow-2xs'
                      : 'bg-white border-[#E4E6EB] hover:border-[#1877F2] hover:bg-[#F0F2F5]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="w-8 h-8 rounded-xs bg-indigo-100 text-indigo-700 flex items-center justify-center">
                      <Shield size={18} />
                    </div>
                    {selectedType === 'counselor' && (
                      <div className="w-4 h-4 rounded-full bg-[#1877F2] text-white flex items-center justify-center">
                        <Check size={10} className="stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#050505]">辅导员 (学工督导)</div>
                    <div className="text-[9.5px] text-[#65676B] mt-0.5 leading-tight">
                      主管班级学籍底册、到课红线预警巡查、跨周请假终审与学风督办
                    </div>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-[#E4E6EB] flex items-center gap-1">
                    <span className="text-[8.5px] font-bold text-indigo-700 bg-white px-1.5 py-0.2 rounded-2xs border border-indigo-200">
                      学工年级守护者
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Teacher Rank Tags (教师选择后可选 助教、讲师、副教授、教授标签) */}
            {selectedType === 'teacher' && (
              <div
                id="teacher-tags-section"
                className="bg-[#FAFBFD] p-3 border border-[#E4E6EB] rounded-md space-y-2 animate-in fade-in duration-150"
              >
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[#050505] flex items-center gap-1">
                    <span className="text-[#1877F2]">2.</span>
                    <span>选择教师职称标签：</span>
                  </label>
                  <span className="text-[9px] text-[#1877F2] font-mono font-bold">
                    当前已选：【{selectedTeacherTag}】
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {TEACHER_TAGS.map((tag, tIdx) => {
                    const isSelected = selectedTeacherTag === tag;
                    return (
                      <button
                        key={`ttag-${tag}-${tIdx}`}
                        type="button"
                        id={`tag-teacher-${tag}`}
                        onClick={() => handleTeacherTagChange(tag)}
                        className={`py-2 px-1 rounded-xs text-xs font-bold border transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                          isSelected
                            ? 'bg-[#1877F2] text-white border-[#1877F2] shadow-2xs'
                            : 'bg-white text-[#1C1E21] border-[#E4E6EB] hover:bg-[#F0F2F5] hover:border-[#1877F2]'
                        }`}
                      >
                        <span className="leading-none">{tag}</span>
                        {isSelected ? (
                          <Check size={11} className="stroke-[3]" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#CED0D4]" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="text-[9.5px] text-[#65676B] flex items-center gap-1 pt-0.5">
                  <Sparkles size={11} className="text-[#1877F2] shrink-0" />
                  <span>
                    选定「{selectedTeacherTag}」后，将自动标注于主讲课程、考勤大厅及课表排期中。
                  </span>
                </div>
              </div>
            )}

            {/* 2 (Alt): Counselor Tags */}
            {selectedType === 'counselor' && (
              <div
                id="counselor-tags-section"
                className="bg-[#FAFBFD] p-3 border border-[#E4E6EB] rounded-md space-y-2 animate-in fade-in duration-150"
              >
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[#050505] flex items-center gap-1">
                    <span className="text-[#1877F2]">2.</span>
                    <span>选择辅导员岗位标签：</span>
                  </label>
                  <span className="text-[9px] text-indigo-700 font-mono font-bold">
                    当前已选：【{selectedCounselorTag}】
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {COUNSELOR_TAGS.map((tag, cIdx) => {
                    const isSelected = selectedCounselorTag === tag;
                    return (
                      <button
                        key={`ctag-${tag}-${cIdx}`}
                        type="button"
                        onClick={() => setSelectedCounselorTag(tag)}
                        className={`p-2 rounded-xs text-xs font-bold border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#1877F2] text-white border-[#1877F2] shadow-2xs'
                            : 'bg-white text-[#1C1E21] border-[#E4E6EB] hover:bg-[#F0F2F5] hover:border-[#1877F2]'
                        }`}
                      >
                        <span className="truncate text-[11px]">{tag}</span>
                        {isSelected && <Check size={11} className="stroke-[3] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Profile Information Setup */}
            <div className="space-y-2 pt-1 border-t border-[#E4E6EB]">
              <label className="text-[11px] font-bold text-[#050505] flex items-center gap-1">
                <span className="text-[#1877F2]">3.</span>
                <span>教职工信息（支持自定义修改）：</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {/* 姓名 */}
                <div className="space-y-1">
                  <span className="text-[10px] text-[#65676B] font-bold flex items-center gap-1">
                    <User size={10} />
                    <span>真实姓名</span>
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="如：张立华"
                    required
                    className="w-full text-xs p-2 bg-white border border-[#E4E6EB] rounded-xs focus:border-[#1877F2] focus:outline-hidden font-bold"
                  />
                </div>

                {/* 工号 */}
                <div className="space-y-1">
                  <span className="text-[10px] text-[#65676B] font-bold flex items-center gap-1">
                    <FileBadge size={10} />
                    <span>教工编号</span>
                  </span>
                  <input
                    type="text"
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                    placeholder="如：TEA-202688"
                    required
                    className="w-full text-xs p-2 bg-white border border-[#E4E6EB] rounded-xs focus:border-[#1877F2] focus:outline-hidden font-mono"
                  />
                </div>

                {/* 院系 */}
                <div className="space-y-1">
                  <span className="text-[10px] text-[#65676B] font-bold flex items-center gap-1">
                    <Building size={10} />
                    <span>所属学院/单位</span>
                  </span>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="如：计算机科学与技术学院"
                    className="w-full text-xs p-2 bg-white border border-[#E4E6EB] rounded-xs focus:border-[#1877F2] focus:outline-hidden"
                  />
                </div>

                {/* 办公室 */}
                <div className="space-y-1">
                  <span className="text-[10px] text-[#65676B] font-bold flex items-center gap-1">
                    <MapPin size={10} />
                    <span>办公地点/教研室</span>
                  </span>
                  <input
                    type="text"
                    value={office}
                    onChange={(e) => setOffice(e.target.value)}
                    placeholder="如：理科楼 3-402"
                    className="w-full text-xs p-2 bg-white border border-[#E4E6EB] rounded-xs focus:border-[#1877F2] focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Action Button: Matches user screenshot specifically with '点击进入下一步' */}
            <div className="pt-2 border-t border-[#E4E6EB]">
              <button
                type="submit"
                id="confirm-identity-btn"
                className="w-full py-2.5 px-4 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-xs rounded-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <span>点击进入下一步</span>
                <ArrowRight size={14} className="stroke-[2.5]" />
              </button>
              <p className="text-[9px] text-[#65676B] text-center mt-1.5">
                {selectedType === 'teacher'
                  ? '点击进入下一步：从头填写建立第一门授课课程并生成 50m 虚拟考勤信标'
                  : '点击进入下一步：从头建立学工负责班级名册与学风督导档案'}
              </p>

              {canCancel && (
                <button
                  type="button"
                  onClick={handleDirectConfirmProfile}
                  className="w-full mt-2 py-1.5 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#1C1E21] text-[10.5px] font-bold rounded-xs cursor-pointer text-center"
                >
                  仅保存当前身份信息并直接进入
                </button>
              )}
            </div>
          </form>
        )}

        {/* ================= STEP 2 (TEACHER): CREATE FIRST COURSE FROM SCRATCH ================= */}
        {step === 2 && selectedType === 'teacher' && (
          <form onSubmit={handleFinishTeacherFlow} className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar">
            {/* Notice */}
            <div className="bg-[#E7F3FF] p-2.5 border border-[#1877F2]/30 rounded-xs flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[10px] font-bold">
                  2
                </div>
                <div>
                  <div className="text-[11px] font-bold text-[#050505]">
                    从头填写建立第一门授课课程
                  </div>
                  <div className="text-[9.5px] text-[#65676B]">
                    主讲教师：{name} · {selectedTeacherTag}（已同步 Step 1 身份）
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[10px] text-[#1877F2] hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
              >
                <ArrowLeft size={10} />
                <span>返回修改身份</span>
              </button>
            </div>

            {/* Course Name */}
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
                id="step2-course-name-input"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="请输入课程名称，如：数据结构与算法"
                required
                className="w-full text-xs px-2.5 py-2 bg-white border border-[#E4E6EB] rounded-xs focus:border-[#1877F2] focus:ring-1 focus:ring-[#1877F2] outline-none font-bold text-[#1C1E21] transition-all"
              />

              {/* Quick Course Presets */}
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

            {/* Teacher & Group Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-[#050505] flex items-center gap-1">
                  <User size={11} className="text-[#1877F2]" />
                  <span>主讲教师</span>
                </label>
                <input
                  type="text"
                  disabled
                  value={`${name} ${selectedTeacherTag} (我)`}
                  className="w-full text-xs px-2.5 py-1.5 bg-[#FAFBFD] border border-[#E4E6EB] rounded-xs text-[#1877F2] font-bold"
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

            {/* Teaching Classes */}
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
                {(classList.length > 0 ? classList : [
                  { id: 'c1', name: 'CS101 计科一班' },
                  { id: 'c2', name: 'CS102 计科二班' },
                  { id: 'c3', name: 'SE201 软工一班' },
                ]).map((cls) => {
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

            {/* Time and Weekday */}
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

              {/* Time slots */}
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

            {/* Classroom */}
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
                className="w-full text-xs px-2.5 py-2 bg-white border border-[#E4E6EB] rounded-xs focus:border-[#1877F2] focus:ring-1 focus:ring-[#1877F2] outline-none"
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

            {/* 50m Attendance Beacon Info */}
            <div className="bg-[#FAFBFD] p-2.5 border border-[#E4E6EB] hover:border-[#1877F2]/60 rounded-xs space-y-2 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Radio size={13} className="text-[#1877F2] animate-pulse" />
                  <span className="text-[10.5px] font-bold text-[#050505]">
                    50m 虚拟考勤信标与实景地图打卡
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBeaconMapModalOpen(true)}
                  className="px-2 py-0.5 bg-[#E7F3FF] hover:bg-[#DBECFE] text-[#1877F2] border border-[#1877F2]/40 font-bold rounded-2xs text-[9.5px] cursor-pointer flex items-center gap-1 shadow-2xs transition-colors"
                >
                  <MapPin size={10} />
                  <span>地图选点与50m围栏预览</span>
                </button>
              </div>

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
                      坐标: {beaconLat}, {beaconLng} · 点击弹出 50 米虚拟围栏地图预览
                    </div>
                  </div>
                </div>

                <span className="text-[9px] text-[#1877F2] font-bold px-2 py-1 bg-[#E7F3FF] rounded-2xs shrink-0 group-hover:bg-[#1877F2] group-hover:text-white transition-colors">
                  选点预览
                </span>
              </div>

              <p className="text-[9px] text-[#65676B] leading-tight">
                课程建立后系统将自动在空间地图建立虚拟信标围栏（50米范围有效）。
              </p>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-[#E4E6EB] flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-2.5 px-3 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#1C1E21] font-bold text-xs rounded-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>上一步</span>
              </button>

              <button
                type="submit"
                id="finish-course-creation-btn"
                className="flex-1 py-2.5 px-4 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-xs rounded-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <Check size={14} className="stroke-[3]" />
                <span>完成建立并进入高校教学管理</span>
              </button>
            </div>
          </form>
        )}

        {/* Beacon Map Preview Modal for Step 2 */}
        <BeaconMapPreviewModal
          isOpen={isBeaconMapModalOpen}
          onClose={() => setIsBeaconMapModalOpen(false)}
          initialLat={beaconLat}
          initialLng={beaconLng}
          initialRadius={beaconRadius}
          initialRoomName={classroom}
          courseName={courseName || '数据结构与算法'}
          teacherName={`${name} ${selectedTeacherTag}`}
          onConfirm={(nLat, nLng, nRad, nRoom) => {
            setBeaconLat(nLat);
            setBeaconLng(nLng);
            setBeaconRadius(nRad);
            if (nRoom) {
              setClassroom(nRoom);
            }
          }}
        />

        {/* ================= STEP 2 (COUNSELOR): CREATE MANAGED CLASS ================= */}
        {step === 2 && selectedType === 'counselor' && (
          <form onSubmit={handleFinishCounselorFlow} className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar">
            {/* Notice */}
            <div className="bg-indigo-50 p-2.5 border border-indigo-200 rounded-xs flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                  2
                </div>
                <div>
                  <div className="text-[11px] font-bold text-[#050505]">
                    从头填写建立负责班级名册
                  </div>
                  <div className="text-[9.5px] text-[#65676B]">
                    主管辅导员：{name} · {selectedCounselorTag}（已同步 Step 1 身份）
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[10px] text-indigo-700 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
              >
                <ArrowLeft size={10} />
                <span>返回修改身份</span>
              </button>
            </div>

            {/* Class Name */}
            <div className="space-y-1.5">
              <label className="text-[10.5px] font-bold text-[#050505] flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span className="text-[#1877F2]">*</span>
                  <span>1. 负责班级全称：</span>
                </span>
                <span className="text-[9px] text-[#65676B]">点击快捷预设快速填入</span>
              </label>
              <input
                type="text"
                value={counselorClassName}
                onChange={(e) => setCounselorClassName(e.target.value)}
                placeholder="如：2024级 计算机科学一班"
                required
                className="w-full text-xs p-2 bg-white border border-[#E4E6EB] rounded-xs focus:border-[#1877F2] focus:outline-hidden font-bold"
              />

              <div className="flex flex-wrap gap-1">
                {QUICK_CLASS_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setCounselorClassName(p.name);
                      setCounselorShortCode(p.shortCode);
                      setCounselorClassCount(p.count);
                    }}
                    className={`text-[9.5px] px-2 py-0.8 rounded-2xs border transition-colors cursor-pointer ${
                      counselorClassName === p.name
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-bold'
                        : 'bg-[#FAFBFD] text-[#65676B] border-[#E4E6EB] hover:border-[#1877F2]'
                    }`}
                  >
                    + {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Short Code & Student Count */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-[#050505] flex items-center gap-1">
                  <FileBadge size={11} className="text-[#1877F2]" />
                  <span>班级代号</span>
                </label>
                <input
                  type="text"
                  value={counselorShortCode}
                  onChange={(e) => setCounselorShortCode(e.target.value)}
                  placeholder="如：CS-2401"
                  required
                  className="w-full text-xs p-1.5 bg-white border border-[#E4E6EB] rounded-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-[#050505] flex items-center gap-1">
                  <Users size={11} className="text-[#1877F2]" />
                  <span>学生建制规模</span>
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[30, 32, 45].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setCounselorClassCount(cnt)}
                      className={`py-1.5 text-[10px] font-bold rounded-xs border cursor-pointer transition-colors text-center ${
                        counselorClassCount === cnt
                          ? 'bg-[#1877F2] text-white border-[#1877F2]'
                          : 'bg-white text-[#65676B] border-[#E4E6EB]'
                      }`}
                    >
                      {cnt}人
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Supervision Rules Notice */}
            <div className="bg-[#FAFBFD] p-2.5 border border-[#E4E6EB] rounded-xs space-y-1.5 text-[10px]">
              <div className="font-bold text-[#050505] flex items-center gap-1">
                <Shield size={12} className="text-indigo-600" />
                <span>已启用的学风督导规则：</span>
              </div>
              <div className="space-y-1 text-[#65676B]">
                <div className="flex items-center gap-1.5">
                  <Check size={11} className="text-emerald-600 stroke-[3]" />
                  <span>出勤率低于 80% 触发红线自动预警</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={11} className="text-emerald-600 stroke-[3]" />
                  <span>连续缺勤纳入学籍导师周报督办</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-[#E4E6EB] flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-2.5 px-3 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#1C1E21] font-bold text-xs rounded-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>上一步</span>
              </button>

              <button
                type="submit"
                id="finish-counselor-creation-btn"
                className="flex-1 py-2.5 px-4 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-xs rounded-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <Check size={14} className="stroke-[3]" />
                <span>完成建立并进入学工管理控制台</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
