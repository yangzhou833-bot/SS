import { dateKey, scheduleTime } from './lifePlanning';
import { validClock, validDate } from './creationValidation';

type ActivityTimes = { date?:string; dateStr?:string; startTime?:string; endTime?:string };

function timestamp(dateValue?: string, timeValue?: string, defaultClock = '18:00', defaultDayOffset = 0) {
  const full = [timeValue, dateValue].find(value => /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/.test(value || ''));
  if (full) {
    if (!validDate(full.slice(0,10)) || !validClock(full.slice(11,16))) return Number.NaN;
    return scheduleTime(full);
  }
  const today = dateKey();
  const rawDate = dateValue?.trim() || '';
  let day = today;
  const isoDate = rawDate.match(/^(\d{4}-\d{2}-\d{2})/);
  const chineseDate = rawDate.match(/(?:(\d{4})年)?(\d{1,2})月(\d{1,2})日/);
  if (isoDate) day = isoDate[1];
  else if (chineseDate) day = `${chineseDate[1] || today.slice(0,4)}-${chineseDate[2].padStart(2,'0')}-${chineseDate[3].padStart(2,'0')}`;
  else {
    const offset = /前天/.test(rawDate) ? -2 : /昨天|昨日/.test(rawDate) ? -1 : /后天/.test(rawDate) ? 2 : /明天|明日/.test(rawDate) ? 1 : /今天|今日/.test(rawDate) ? 0 : rawDate ? 0 : defaultDayOffset;
    day = dateKey(new Date(scheduleTime(today) + offset * 86400000));
  }
  const clockMatch = timeValue?.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  const clock = clockMatch ? `${clockMatch[1].padStart(2,'0')}:${clockMatch[2]}` : timeValue ? '' : defaultClock;
  return validDate(day) && validClock(clock) ? scheduleTime(`${day} ${clock}`) : Number.NaN;
}

export function activityTimeWindow(activity: ActivityTimes) {
  const date = activity.dateStr || activity.date;
  const start = timestamp(date,activity.startTime,'15:00');
  let end = activity.endTime
    ? timestamp(Number.isFinite(start) ? dateKey(new Date(start)) : date,activity.endTime,'18:00')
    : activity.startTime ? start : timestamp(date,undefined,'18:00');
  // Legacy activities store only clock times. A next-day end needs to retain its day.
  if (activity.endTime && /^\d{1,2}:\d{2}/.test(activity.endTime) && end < start) end += 86400000;
  return {start,end};
}

export const isActivityExpired = (dateStr?:string,startTime?:string,endTime?:string,date?:string):boolean => {
  const end = activityTimeWindow({dateStr,date,startTime,endTime}).end;
  return Number.isFinite(end) && end <= Date.now();
};

export const getActivityStatusInfo = (activity: ActivityTimes & {status?:string;isArchived?:boolean;activityState?:string;endedAt?:number;startedAt?:number}) => {
  if (activity.endedAt) return {isExpired:true,isArchived:false,statusLabel:'已结束',badgeClass:'bg-zinc-100 text-zinc-600 border-zinc-300',stateText:'活动已结束'};
  if (activity.isArchived || activity.status === 'completed' || activity.activityState === '已归档') {
    return {isExpired:true,isArchived:true,statusLabel:'已归档',badgeClass:'bg-[#F0F2F5] text-[#65676B] border-[#CED0D4]',stateText:'历史已归档'};
  }
  const window = activityTimeWindow(activity);
  if ((!activity.startedAt && Number.isFinite(window.end) && window.end <= Date.now()) || activity.activityState === '已结束') {
    return {isExpired:true,isArchived:false,statusLabel:'已结束',badgeClass:'bg-zinc-100 text-zinc-600 border-zinc-300',stateText:'活动已结束'};
  }
  if (activity.status === 'active' || activity.activityState === '进行中' || (Number.isFinite(window.start) && Date.now() >= window.start)) {
    return {isExpired:false,isArchived:false,statusLabel:'进行中',badgeClass:'bg-emerald-500 text-white border-emerald-600 animate-pulse',stateText:'进行中 · 集合中'};
  }
  return {isExpired:false,isArchived:false,statusLabel:'即将开始',badgeClass:'bg-[#1877F2] text-white border-[#1877F2]',stateText:'即将开始'};
};

export const formatCountdownReminder = (dateStr?:string,timeStr?:string,endTime?:string):string => {
  const start = timestamp(dateStr,timeStr,'15:00',1);
  if (!Number.isFinite(start)) return '时间待确认';
  const now = Date.now();
  const diffMs = start - now;
  if (diffMs <= 0) {
    const end = endTime ? activityTimeWindow({dateStr:dateKey(new Date(start)),startTime:timeStr,endTime}).end : start + 3 * 3600000;
    return Number.isFinite(end) && now < end ? '进行中' : '已结束';
  }
  const totalMinutes = Math.max(1,Math.round(diffMs / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours >= 24) return `倒计时 ${Math.floor(hours / 24)}天${hours % 24}时`;
  if (hours > 0) return `倒计时 ${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:00`;
  return `倒计时 ${String(minutes).padStart(2,'0')}分钟`;
};
