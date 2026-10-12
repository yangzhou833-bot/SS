import React from 'react';
import {
  Calendar,
  Plus,
  Edit3,
  ChevronRight,
  CalendarDays,
  CalendarCheck,
  CheckCircle2,
  Users,
  AlertCircle,
  Radio,
} from 'lucide-react';
import { CourseItem, CALENDAR_DAYS_SCHEDULE } from './CourseManagementApp';

export interface WeeklyScheduleItem {
  id: string;
  day: string;
  time: string;
  title: string;
  room: string;
  tag: string;
  classes?: string;
  hasBeacon?: boolean;
  isToday?: boolean;
}

export interface CourseScheduleTimetableProps {
  courses: CourseItem[];
  weeklySchedule: WeeklyScheduleItem[];
  setWeeklySchedule: React.Dispatch<React.SetStateAction<WeeklyScheduleItem[]>>;
  selectedScheduleDay: string;
  setSelectedScheduleDay: (day: string) => void;
  selectedCalendarDayNum: number;
  setSelectedCalendarDayNum: (num: number) => void;
  setIsCreateCourseModalOpen: (v: boolean) => void;
  openEditCourseModal: (course: CourseItem) => void;
  notify: (msg: string) => void;
  onQuickAttendance: (course: CourseItem) => void;
  onViewAttendanceRecord?: (courseName: string, dayNum: number) => void;
}

export const CourseScheduleTimetable: React.FC<CourseScheduleTimetableProps> = ({
  courses,
  weeklySchedule,
  setWeeklySchedule,
  selectedScheduleDay,
  setSelectedScheduleDay,
  selectedCalendarDayNum,
  setSelectedCalendarDayNum,
  setIsCreateCourseModalOpen,
  openEditCourseModal,
  notify,
  onQuickAttendance,
  onViewAttendanceRecord,
}) => {
  return (
    <div className="space-y-3 animate-in fade-in duration-150">
      {/* 1. 课程课表 (PRIMARY FEATURED FACEBOOK STRAIGHT-EDGE CALENDAR TIMETABLE) */}
      <div className="bg-white border border-[#E4E6EB] p-3 rounded-xs shadow-2xs space-y-2.5">
        <div className="flex flex-col gap-2 border-b border-[#E4E6EB] pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="p-1 bg-[#1877F2] text-white rounded-2xs shadow-2xs">
                <Calendar size={14} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#1C1E21] flex items-center gap-1.5">
                  <span>日历课表 · 2026秋季学期</span>
                  <span className="text-[8px] text-[#1877F2] bg-[#E7F3FF] px-1 py-0.2 rounded-2xs border border-[#1877F2]/20 font-normal">
                    Facebook 直角UI
                  </span>
                </h3>
                <p className="text-[9px] text-[#65676B]">自动对应填入 · 包含 50m 虚拟信标考勤提醒</p>
              </div>
            </div>
          </div>

          {/* Sub-bar: add course button and clear button */}
          <div className="flex items-center justify-between pt-1 border-t border-[#E4E6EB]/60">
            <button
              type="button"
              onClick={() => setIsCreateCourseModalOpen(true)}
              className="px-2.5 py-0.5 bg-[#1877F2] hover:bg-[#166FE5] text-white text-[9px] font-bold rounded-xs cursor-pointer flex items-center gap-1 shadow-2xs transition-colors"
            >
              <Plus size={11} className="stroke-[3]" />
              <span>增加课程</span>
            </button>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  if (weeklySchedule.length > 0) {
                    setWeeklySchedule([]);
                    notify('🗑️ 已成功清空当前周课表排期！');
                  } else {
                    notify('当前课表已为空');
                  }
                }}
                className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[9px] font-bold rounded-xs border border-rose-200 cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <span>删除</span>
              </button>
            </div>
          </div>
        </div>

        {/* Day Filter Strip (Facebook Straight-Edge Tabs with Week 8 badge at front) */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px]">
          <span className="px-2.5 py-1 rounded-xs font-bold bg-[#E7F3FF] text-[#1877F2] border border-[#1877F2]/30 whitespace-nowrap text-[10px] flex items-center gap-1 shrink-0 shadow-2xs">
            <span>📅 第 8 周</span>
          </span>
          {['all', '周一', '周二', '周三', '周四', '周五'].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setSelectedScheduleDay(d)}
              className={`px-2.5 py-1 rounded-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                selectedScheduleDay === d
                  ? 'bg-[#1877F2] text-white border-[#1877F2] shadow-2xs'
                  : 'bg-[#FAFBFD] text-[#65676B] hover:text-[#1877F2] hover:bg-[#E7F3FF]/50 border-[#E4E6EB]'
              }`}
            >
              {d === 'all' ? '全周课表' : d}
            </button>
          ))}
        </div>

        {/* Weekly Timetable Schedule Matrix */}
        <div className="space-y-1.5 text-[10px]">
          {weeklySchedule
            .filter((item) => selectedScheduleDay === 'all' || item.day === selectedScheduleDay)
            .map((item, idx) => (
              <div
                key={`weekly-sch-${item.id || idx}-${idx}`}
                className={`p-2.5 border rounded-xs flex items-center justify-between transition-all ${
                  item.isToday
                    ? 'border-[#1877F2] bg-[#E7F3FF]/30 shadow-2xs'
                    : 'border-[#E4E6EB] bg-white hover:border-[#1877F2]/40'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                  <div
                    className={`w-11 text-center py-1.5 font-black rounded-xs text-[9px] shrink-0 ${
                      item.isToday
                        ? 'bg-[#1877F2] text-white shadow-2xs'
                        : 'bg-[#F0F2F5] text-[#1877F2] border border-[#E4E6EB]'
                    }`}
                  >
                    <div>{item.day}</div>
                    <div className="text-[7px] font-normal opacity-80">课表排期</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-[#1C1E21] flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px]">{item.title}</span>
                      {item.isToday && (
                        <span className="text-[8px] text-emerald-600 font-bold bg-emerald-50 px-1 rounded-2xs border border-emerald-200 shrink-0">
                          今日课程
                        </span>
                      )}
                      <span className="text-[8px] text-[#1877F2] bg-[#E7F3FF] px-1 rounded-2xs border border-[#1877F2]/20 font-normal shrink-0">
                        {item.tag}
                      </span>
                    </div>
                    <div className="text-[9px] text-[#65676B] mt-0.5 flex items-center gap-1.5 truncate">
                      <span className="font-mono">{item.time}</span>
                      <span>·</span>
                      <span>{item.room}</span>
                      {item.classes && (
                        <>
                          <span>·</span>
                          <span className="text-[#1877F2] font-semibold">{item.classes}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[8px] font-mono text-[#1877F2] bg-[#E7F3FF] px-1.5 py-0.5 rounded-xs border border-[#1877F2]/20">
                    {item.hasBeacon ? '50m 虚拟信标' : '常规考勤'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const matched = courses.find((c) => c.name.includes(item.title) || item.title.includes(c.name));
                        if (matched) {
                          openEditCourseModal(matched);
                        } else {
                          openEditCourseModal({
                            id: item.id,
                            name: item.title,
                            teacher: '张立华 教授',
                            schedule: `每${item.day} ${item.time}`,
                            classroom: item.room,
                            groupType: item.tag === '合班大课' ? 'large' : 'small',
                            classes: [item.classes || 'CS101 计科一班'],
                            beaconLat: 31.2304,
                            beaconLng: 121.4737,
                            beaconRadius: 50,
                            status: 'upcoming',
                            attendancePct: 95,
                            checkedCount: 30,
                            totalCount: 32,
                            hasBeaconIcon: true,
                          });
                        }
                      }}
                      className="px-1.5 py-0.5 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#1C1E21] text-[8px] font-bold rounded-xs cursor-pointer border border-[#E4E6EB] flex items-center gap-0.5"
                    >
                      <Edit3 size={9} className="text-[#1877F2]" />
                      <span>修改课程</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const matched = courses.find((c) => c.name.includes(item.title) || item.title.includes(c.name));
                        if (matched) {
                          onQuickAttendance(matched);
                        } else {
                          onQuickAttendance({
                            id: item.id,
                            name: item.title,
                            teacher: '张立华 教授',
                            schedule: `每${item.day} ${item.time}`,
                            classroom: item.room,
                            groupType: item.tag === '合班大课' ? 'large' : 'small',
                            classes: [item.classes || 'CS101 计科一班'],
                            beaconLat: 31.2304,
                            beaconLng: 121.4737,
                            beaconRadius: 50,
                            status: 'ongoing',
                            attendancePct: 95,
                            checkedCount: 30,
                            totalCount: 32,
                            hasBeaconIcon: true,
                          });
                        }
                      }}
                      className="px-2 py-0.5 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold rounded-xs text-[8px] cursor-pointer shadow-2xs flex items-center gap-0.5"
                    >
                      <span>一键考勤</span>
                      <ChevronRight size={10} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

          {weeklySchedule.filter((item) => selectedScheduleDay === 'all' || item.day === selectedScheduleDay).length === 0 && (
            <div className="text-center py-6 bg-[#FAFBFD] border border-dashed border-[#E4E6EB] rounded-xs text-[#65676B] space-y-1">
              <CalendarDays size={20} className="mx-auto text-[#1877F2]/50" />
              <p className="text-[10px] font-bold">该日暂无教学排课</p>
              <p className="text-[8px]">可通过【新建课程】添加新排期，提交后将自动对应填入本课表</p>
            </div>
          )}
        </div>

        {/* Sync Actions Bar */}
        <div className="pt-2 border-t border-[#E4E6EB] flex items-center justify-between text-[10px] flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => notify('已成功将本学期课表与 50m 考勤提醒同步至系统日历！')}
            className="px-2.5 py-1 bg-[#E7F3FF] hover:bg-[#DBECFE] text-[#1877F2] font-bold rounded-xs border border-[#1877F2]/30 cursor-pointer flex items-center gap-1 shadow-2xs"
          >
            <CalendarCheck size={12} />
            <span>同步至手机/系统日历</span>
          </button>
          <div className="flex items-center gap-2 text-[9px] text-[#65676B]">
            <span className="flex items-center gap-1 text-emerald-600 font-bold">
              <CheckCircle2 size={11} />
              <span>课前15分钟信标提醒已开通</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. 课程考勤与排期日历 (SECOND MODULE IN COURSE SCHEDULE TAB) */}
      <div className="bg-white border border-[#E4E6EB] p-3 rounded-xs shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
          <div className="flex items-center gap-1.5">
            <div className="p-1 bg-[#1877F2] text-white rounded-2xs shadow-2xs">
              <CalendarDays size={14} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#1C1E21] flex items-center gap-1.5">
                <span>2026年10月 · 课程考勤与排期日历</span>
                <span className="text-[8px] bg-[#E7F3FF] text-[#1877F2] px-1 py-0.2 rounded-2xs border border-[#1877F2]/20 font-normal">
                  直角线框
                </span>
              </h3>
              <p className="text-[9px] text-[#65676B]">点击日期查看到课率、未到课学生 mini 头像聚合列表与排期教案</p>
            </div>
          </div>
          <span className="text-[9px] text-[#1877F2] font-bold bg-[#E7F3FF] px-2 py-0.5 rounded-2xs border border-[#1877F2]/30">
            第 8-9 周排期
          </span>
        </div>

        {/* Month Grid Header & Buttons */}
        <div className="bg-[#FAFBFD] border border-[#E4E6EB] p-2 rounded-xs space-y-2">
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-bold text-[#1877F2] flex items-center gap-1">
              <CalendarDays size={12} />
              <span>2026年 10月 (第 8-9 周)</span>
            </span>
            <span className="text-[8px] text-[#65676B]">
              点击日期切换下方考勤与教案详情
            </span>
          </div>

          {/* Weekday columns */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[9px] text-[#65676B] border-b border-[#E4E6EB] pb-1">
            <span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span>
          </div>

          {/* Day Buttons Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-[9px]">
            {CALENDAR_DAYS_SCHEDULE.map((item) => {
              const isSelected = selectedCalendarDayNum === item.num;
              return (
                <button
                  key={item.num}
                  type="button"
                  onClick={() => setSelectedCalendarDayNum(item.num)}
                  className={`p-1.5 border rounded-xs flex flex-col items-center justify-between transition-all cursor-pointer relative min-h-[46px] ${
                    isSelected
                      ? 'bg-[#1877F2] text-white border-[#1877F2] font-bold shadow-2xs scale-102 z-10'
                      : item.isTaught
                      ? 'bg-emerald-50/70 border-emerald-200 text-[#1C1E21] hover:border-[#1877F2]'
                      : item.isUpcoming
                      ? 'bg-white border-[#E4E6EB] text-[#1C1E21] hover:border-[#1877F2]'
                      : 'bg-[#FAFBFD] border-slate-100 text-[#65676B]'
                  }`}
                >
                  <span className="font-mono text-[10px] font-bold">{item.num}</span>
                  {item.isTaught && (
                    <span className={`text-[7px] font-bold px-0.5 rounded-2xs ${isSelected ? 'bg-white/20 text-white' : 'text-emerald-700 bg-emerald-100'}`}>
                      {item.rate}%
                    </span>
                  )}
                  {item.isUpcoming && (
                    <span className={`text-[7px] ${isSelected ? 'text-white/90' : 'text-[#1877F2]'}`}>
                      待授课
                    </span>
                  )}
                  {!item.isTaught && !item.isUpcoming && (
                    <span className="text-[7px] text-[#65676B] opacity-60">无课</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details Card */}
        {(() => {
          const currentActiveDay = CALENDAR_DAYS_SCHEDULE.find((d) => d.num === selectedCalendarDayNum) || CALENDAR_DAYS_SCHEDULE[0];

          return (
            <div className="space-y-2 text-[10px]">
              {currentActiveDay.isTaught && (
                <div className="p-2.5 border-2 border-emerald-500/80 bg-white rounded-xs space-y-2.5 shadow-xs">
                  <div className="flex items-start justify-between border-b border-[#E4E6EB] pb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 bg-emerald-600 text-white font-bold text-[9px] rounded-xs">
                          10月{currentActiveDay.num}日 ({currentActiveDay.weekday})
                        </span>
                        <span className="font-black text-[#1C1E21] text-xs">
                          《{currentActiveDay.course}》
                        </span>
                      </div>
                      <span className="text-[9px] text-[#65676B] font-mono block mt-0.5">
                        {currentActiveDay.time} · {currentActiveDay.room}
                      </span>
                    </div>
                    <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-2xs shrink-0">
                      已完成授课考勤
                    </span>
                  </div>

                  {/* Attendance Rate Section */}
                  <div className="bg-[#FAFBFD] p-2 border border-[#E4E6EB] rounded-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1C1E21] text-[10px] flex items-center gap-1">
                        <Users size={12} className="text-[#1877F2]" />
                        <span>到课率统计:</span>
                      </span>
                      <span className="font-black text-emerald-600 text-sm font-mono">
                        {currentActiveDay.rate}%
                      </span>
                    </div>

                    <div className="w-full h-2 bg-[#E4E6EB] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${currentActiveDay.rate}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[8.5px] text-[#65676B] font-mono pt-0.5">
                      <span>实到 {currentActiveDay.checked} 人 / 应到 {currentActiveDay.total} 人</span>
                      <span className="text-rose-600 font-bold">缺勤 {currentActiveDay.absent.length} 人</span>
                    </div>
                  </div>

                  {/* Absent Students Mini Avatar Stack */}
                  <div className="bg-rose-50/50 p-2 border border-rose-200/80 rounded-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-800 text-[9.5px] flex items-center gap-1">
                        <AlertCircle size={11} className="text-rose-600" />
                        <span>未到课学生 mini 头像聚合列表 ({currentActiveDay.absent.length}人):</span>
                      </span>
                      {currentActiveDay.absent.length > 0 && (
                        <button
                          type="button"
                          onClick={() => notify(`已向未到课学生及其班主任触发告警通知！`)}
                          className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[8px] rounded-2xs cursor-pointer shadow-2xs"
                        >
                          一键提醒
                        </button>
                      )}
                    </div>

                    {currentActiveDay.absent.length === 0 ? (
                      <div className="p-2 bg-emerald-50 text-emerald-700 font-bold text-[9px] rounded-2xs text-center border border-emerald-200">
                        🎉 完美出勤！全员按时到课，无缺勤学生。
                      </div>
                    ) : (
                      <div className="space-y-1.5 pt-0.5">
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                          {currentActiveDay.absent.map((stu, i) => (
                            <div
                              key={`timetable-absent-${currentActiveDay.num}-${stu.name}-${i}`}
                              className="flex items-center gap-1.5 bg-white border border-rose-200 p-1 rounded-xs shrink-0 shadow-2xs"
                            >
                              <img
                                src={stu.avatar}
                                alt={stu.name}
                                className="w-6 h-6 rounded-full object-cover border border-rose-400"
                              />
                              <div className="text-[8.5px]">
                                <div className="font-bold text-[#1C1E21]">{stu.name}</div>
                                <div className="text-rose-600 font-medium text-[7.5px]">{stu.reason}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Lesson Plan Summary */}
                  <div className="bg-[#FAFBFD] p-2 border border-[#E4E6EB] rounded-xs space-y-0.5">
                    <span className="font-bold text-[#1877F2] text-[9px]">教案要点:</span>
                    <p className="text-[9px] text-[#1C1E21]">{currentActiveDay.plan}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-[#E4E6EB] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        const matched = courses.find((c) => c.name.includes(currentActiveDay.course) || currentActiveDay.course.includes(c.name));
                        if (matched) {
                          openEditCourseModal(matched);
                        } else {
                          openEditCourseModal({
                            id: `cal-crs-${currentActiveDay.num}`,
                            name: currentActiveDay.course,
                            teacher: '张立华 教授',
                            schedule: `每${currentActiveDay.weekday} ${currentActiveDay.time}`,
                            classroom: currentActiveDay.room,
                            groupType: 'small',
                            classes: ['CS101 计科一班'],
                            beaconLat: 31.2304,
                            beaconLng: 121.4737,
                            beaconRadius: 50,
                            status: 'ongoing',
                            attendancePct: currentActiveDay.rate,
                            checkedCount: currentActiveDay.checked,
                            totalCount: currentActiveDay.total,
                            hasBeaconIcon: true,
                          });
                        }
                      }}
                      className="px-2.5 py-1 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#1C1E21] font-bold rounded-xs cursor-pointer border border-[#E4E6EB] flex items-center gap-1"
                    >
                      <Edit3 size={11} className="text-[#1877F2]" />
                      <span>修改课程</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onViewAttendanceRecord) {
                          onViewAttendanceRecord(currentActiveDay.course, currentActiveDay.num);
                        } else {
                          notify(`正在查阅 10月${currentActiveDay.num}日《${currentActiveDay.course}》考勤底册与在位日志`);
                        }
                      }}
                      className="px-3 py-1 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold rounded-xs cursor-pointer shadow-2xs flex items-center gap-1"
                    >
                      <span>查看考勤记录</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              )}

              {currentActiveDay.isUpcoming && (
                <div className="p-2.5 border-2 border-[#1877F2]/60 bg-white rounded-xs space-y-2.5 shadow-xs">
                  <div className="flex items-start justify-between border-b border-[#E4E6EB] pb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 bg-[#1877F2] text-white font-bold text-[9px] rounded-xs">
                          10月{currentActiveDay.num}日 ({currentActiveDay.weekday})
                        </span>
                        <span className="font-black text-[#1C1E21] text-xs">
                          《{currentActiveDay.course}》
                        </span>
                      </div>
                      <span className="text-[9px] text-[#65676B] font-mono block mt-0.5">
                        {currentActiveDay.time} · {currentActiveDay.room}
                      </span>
                    </div>
                    <span className="text-[8px] font-bold text-[#1877F2] bg-[#E7F3FF] border border-[#1877F2]/30 px-1.5 py-0.5 rounded-2xs shrink-0">
                      未授课 · 待排课
                    </span>
                  </div>

                  <div className="bg-[#FAFBFD] p-2 border border-[#E4E6EB] rounded-xs space-y-1">
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="font-bold text-[#1C1E21] flex items-center gap-1">
                        <Radio size={11} className="text-[#1877F2] animate-pulse" />
                        <span>50m 虚拟信标预设状态:</span>
                      </span>
                      <span className="font-mono text-emerald-600 font-bold">待机就绪 (课前15分钟自动开启)</span>
                    </div>
                    <div className="text-[8.5px] text-[#65676B]">
                      应到人数: <strong className="text-[#1C1E21]">{currentActiveDay.total} 人</strong> · 教学教室: <strong className="text-[#1877F2]">{currentActiveDay.room}</strong>
                    </div>
                  </div>

                  <div className="bg-[#FAFBFD] p-2 border border-[#E4E6EB] rounded-xs space-y-0.5">
                    <span className="font-bold text-[#1877F2] text-[9px]">具体教案与实验要点:</span>
                    <p className="text-[9px] text-[#1C1E21]">{currentActiveDay.plan}</p>
                  </div>

                  <div className="pt-2 border-t border-[#E4E6EB] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        const matched = courses.find((c) => c.name.includes(currentActiveDay.course) || currentActiveDay.course.includes(c.name));
                        if (matched) {
                          openEditCourseModal(matched);
                        } else {
                          openEditCourseModal({
                            id: `cal-crs-${currentActiveDay.num}`,
                            name: currentActiveDay.course,
                            teacher: '张立华 教授',
                            schedule: `每${currentActiveDay.weekday} ${currentActiveDay.time}`,
                            classroom: currentActiveDay.room,
                            groupType: 'small',
                            classes: ['CS101 计科一班'],
                            beaconLat: 31.2304,
                            beaconLng: 121.4737,
                            beaconRadius: 50,
                            status: 'upcoming',
                            attendancePct: 0,
                            checkedCount: 0,
                            totalCount: currentActiveDay.total,
                            hasBeaconIcon: true,
                          });
                        }
                      }}
                      className="px-2.5 py-1 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#1C1E21] font-bold rounded-xs cursor-pointer border border-[#E4E6EB] flex items-center gap-1"
                    >
                      <Edit3 size={11} className="text-[#1877F2]" />
                      <span>修改课程</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const matched = courses.find((c) => c.name.includes(currentActiveDay.course) || currentActiveDay.course.includes(c.name));
                        if (matched) {
                          onQuickAttendance(matched);
                        } else {
                          notify(`进入 10月${currentActiveDay.num}日《${currentActiveDay.course}》电子考勤配置`);
                        }
                      }}
                      className="px-3 py-1 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold rounded-xs cursor-pointer shadow-2xs flex items-center gap-1"
                    >
                      <span>一键考勤</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              )}

              {!currentActiveDay.isTaught && !currentActiveDay.isUpcoming && (
                <div className="p-4 border border-dashed border-[#E4E6EB] bg-[#FAFBFD] rounded-xs text-center space-y-1.5 text-[#65676B]">
                  <CalendarDays size={20} className="mx-auto text-[#1877F2]/50" />
                  <div className="font-bold text-[#1C1E21]">10月{currentActiveDay.num}日 ({currentActiveDay.weekday}) · 本日无教学排课</div>
                  <p className="text-[8.5px]">自由备课与教研时间，可通过【新建课程】添加新排期</p>
                  <button
                    type="button"
                    onClick={() => setIsCreateCourseModalOpen(true)}
                    className="px-2.5 py-1 bg-[#1877F2] text-white text-[9px] font-bold rounded-xs cursor-pointer shadow-2xs inline-flex items-center gap-1 mt-1"
                  >
                    <Plus size={10} />
                    <span>快速添加授课排期</span>
                  </button>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
};
