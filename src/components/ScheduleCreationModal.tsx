import { dateKey } from '../utils/lifePlanning';
import React, { useState, useEffect, useRef } from 'react';
import { useDialogFocus } from '../utils/useDialogFocus';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plane,
  Briefcase,
  Users,
  Compass,
  Stethoscope,
  Sparkles,
  MapPin,
  Clock,
  Bell,
  Eye,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Navigation,
  Info,
  Lock,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Schedule, ScheduleType, FlightStatus, VisibilityRule, Friend } from '../types';
import { soundEffects } from '../utils/soundEffects';
import { haptics } from '../utils/haptics';
import { CoordinatePicker } from './CoordinatePicker';
import { validCoordinates, validScheduleTime } from '../utils/creationValidation';

interface ScheduleCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  friends?: Friend[];
  onSuccessCreate: (newSchedule: Schedule) => void;
  onViewOnMap?: (schedule: Schedule) => void;
  onViewOnCalendar?: (schedule: Schedule) => void;
  showToast: (msg: string) => void;
  initialDate?: string;
  initialLocation?: { name?: string; address?: string; lat?: number; lng?: number };
}

const TEMPLATES: Array<{
  type: ScheduleType;
  label: string;
  icon: string;
  color: string;
  desc: string;
}> = [
  { type: 'general', label: '普通日程', icon: '📅', color: '#1877F2', desc: '日常工作、生活与个人事项' },
  { type: 'flight', label: '航班出行', icon: '✈️', color: '#0284C7', desc: '机票航线、登机提醒与轨迹演练' },
  { type: 'meeting', label: '会议', icon: '💼', color: '#8B5CF6', desc: '团队研讨、客户拜访与商讨' },
  { type: 'gathering', label: '聚会', icon: '🎉', color: '#F59E0B', desc: '朋友聚餐、生日派对与同城活动' },
  { type: 'travel', label: '旅行', icon: '🧳', color: '#10B981', desc: '假期出游、景点打卡与景点线路' },
  { type: 'medical', label: '医疗', icon: '🏥', color: '#EF4444', desc: '挂号体检、门诊约诊与用药提醒' },
  { type: 'custom', label: '自定义', icon: '✨', color: '#EC4899', desc: '自由设定图标、配色与地图锚点' },
];

const PRESET_FLIGHTS = [
  {
    flightNumber: 'CA1502',
    airline: '中国国际航空',
    depAirport: '兰州中川国际机场 (LHW)',
    arrAirport: '北京首都国际机场 (PEK)',
    depLat: 36.5147,
    depLng: 103.6212,
    arrLat: 40.0799,
    arrLng: 116.6031,
    depTerminal: 'T2',
    arrTerminal: 'T3',
    gate: 'B18',
    seat: '12A',
    depTime: '14:30',
    arrTime: '17:15',
  },
  {
    flightNumber: 'MU5108',
    airline: '中国东方航空',
    depAirport: '兰州中川国际机场 (LHW)',
    arrAirport: '上海虹桥国际机场 (SHA)',
    depLat: 36.5147,
    depLng: 103.6212,
    arrLat: 31.1979,
    arrLng: 121.3363,
    depTerminal: 'T1',
    arrTerminal: 'T2',
    gate: 'A06',
    seat: '35K',
    depTime: '09:15',
    arrTime: '12:05',
  },
  {
    flightNumber: 'CZ3101',
    airline: '中国南方航空',
    depAirport: '广州白云国际机场 (CAN)',
    arrAirport: '北京大兴国际机场 (PKX)',
    depLat: 23.3924,
    depLng: 113.2988,
    arrLat: 39.5098,
    arrLng: 116.4105,
    depTerminal: 'T2',
    arrTerminal: 'PKX',
    gate: 'C19',
    seat: '18C',
    depTime: '10:00',
    arrTime: '13:10',
  },
];

const getStellarDate = (daysFromNow = 0) => {
  const date = new Date(`${dateKey()}T12:00:00+08:00`); date.setDate(date.getDate()+daysFromNow); return dateKey(date);
};

const SCHEDULE_DRAFT_KEY = 'stellar_schedule_creation_draft_v1';

const REMINDER_OPTIONS = [
  { value: 0, label: '日程开始/起飞时' },
  { value: 15, label: '提前 15 分钟' },
  { value: 30, label: '提前 30 分钟' },
  { value: 60, label: '提前 1 小时' },
  { value: 120, label: '提前 2 小时' },
  { value: 720, label: '提前 12 小时' },
  { value: 1440, label: '提前 1 天' },
];

export const ScheduleCreationModal: React.FC<ScheduleCreationModalProps> = ({
  isOpen,
  onClose,
  friends = [],
  onSuccessCreate,
  onViewOnMap,
  onViewOnCalendar,
  showToast,
  initialLocation,
  initialDate,
}) => {
  const [step, setStep] = useState<number>(1);

  // Form State
  const [scheduleType, setScheduleType] = useState<ScheduleType>('general');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [icon, setIcon] = useState<string>('📅');
  const [color, setColor] = useState<string>('#1877F2');
  const [startDate, setStartDate] = useState<string>(getStellarDate());
  const [startTime, setStartTime] = useState<string>('14:30');
  const [endTime, setEndTime] = useState<string>('17:00');
  const [allDay, setAllDay] = useState<boolean>(false);
  const [timezone] = useState<string>('Asia/Shanghai');

  // Location & Anchor State
  const [locationName, setLocationName] = useState<string>(initialLocation?.name || '东方红广场');
  const [locationAddress, setLocationAddress] = useState<string>(initialLocation?.address || '兰州市城关区广场南路51号');
  const [locationLat, setLocationLat] = useState<number>(initialLocation?.lat ?? 36.0620);
  const [locationLng, setLocationLng] = useState<number>(initialLocation?.lng ?? 103.8080);
  const [isAnchorConfirmed, setIsAnchorConfirmed] = useState<boolean>(false);
  const [departureAnchorConfirmed, setDepartureAnchorConfirmed] = useState<boolean>(false);
  const [arrivalAnchorConfirmed, setArrivalAnchorConfirmed] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && initialLocation) {
      if (initialLocation.name) setLocationName(initialLocation.name);
      if (initialLocation.address) setLocationAddress(initialLocation.address);
      if (typeof initialLocation.lat === 'number') setLocationLat(initialLocation.lat);
      if (typeof initialLocation.lng === 'number') setLocationLng(initialLocation.lng);
      setIsAnchorConfirmed(false);
    }
  }, [isOpen, initialLocation]);

  useEffect(() => { if (isOpen) setStartDate(initialDate || getStellarDate()); },[isOpen,initialDate]);

  // Flight Fields
  const [flightNumber, setFlightNumber] = useState<string>('CA1502');
  const [airline, setAirline] = useState<string>('中国国际航空');
  const [departureAirport, setDepartureAirport] = useState<string>('兰州中川国际机场 (LHW)');
  const [arrivalAirport, setArrivalAirport] = useState<string>('北京首都国际机场 (PEK)');
  const [depLat, setDepLat] = useState<number>(36.5147);
  const [depLng, setDepLng] = useState<number>(103.6212);
  const [arrLat, setArrLat] = useState<number>(40.0799);
  const [arrLng, setArrLng] = useState<number>(116.6031);
  const [departureTerminal, setDepartureTerminal] = useState<string>('T2');
  const [arrivalTerminal, setArrivalTerminal] = useState<string>('T3');
  const [gate, setGate] = useState<string>('B18');
  const [seat, setSeat] = useState<string>('12A');
  const [luggageInfo, setLuggageInfo] = useState<string>('托运 1件 / 20kg');
  const [flightRemarks, setFlightRemarks] = useState<string>('携带有效身份证件，准时抵达登机口');

  // Reminders & Map Display Rules
  const [selectedReminders, setSelectedReminders] = useState<number[]>([120, 30]);
  const [mapVisibleAtRule, setMapVisibleAtRule] = useState<string>('12h_before');
  const [keepAsHistory, setKeepAsHistory] = useState<boolean>(true);
  const [mapHideOnFinish, setMapHideOnFinish] = useState<boolean>(false);

  // Privacy & Sharing Rules
  const [visibilityScope, setVisibilityScope] = useState<
    'private' | 'close' | 'lover' | 'family' | 'specified' | 'group' | 'excluded'
  >('private');
  const [specifiedFriendIds, setSpecifiedFriendIds] = useState<string[]>([]);
  const [showFlightNumber, setShowFlightNumber] = useState<boolean>(true);
  const [showExactAirport, setShowExactAirport] = useState<boolean>(true);
  const [showDepartureTime, setShowDepartureTime] = useState<boolean>(true);
  const [showCurrentLocation, setShowCurrentLocation] = useState<boolean>(true);
  const [showStage, setShowStage] = useState<boolean>(true);
  const [allowEtaView, setAllowEtaView] = useState<boolean>(true);

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Created Result State
  const [createdSchedule, setCreatedSchedule] = useState<Schedule | null>(null);

  const creating = useRef(false);
  const saveDraft = (notify = true) => {
    try {
      localStorage.setItem(SCHEDULE_DRAFT_KEY, JSON.stringify({ version: 1, step, scheduleType, title, description, icon, color, startDate, startTime, endTime, allDay, locationName, locationAddress, locationLat, locationLng, isAnchorConfirmed, departureAnchorConfirmed, arrivalAnchorConfirmed, flightNumber, airline, departureAirport, arrivalAirport, depLat, depLng, arrLat, arrLng, departureTerminal, arrivalTerminal, gate, seat, luggageInfo, flightRemarks, selectedReminders, mapVisibleAtRule, keepAsHistory, mapHideOnFinish, visibilityScope, specifiedFriendIds, showFlightNumber, showExactAirport, showDepartureTime, showCurrentLocation, showStage, allowEtaView }));
      if (notify) showToast('日程草稿已保存，下次打开可继续填写');
      return true;
    } catch {
      showToast('草稿未能保存，请检查浏览器存储空间后重试');
      return false;
    }
  };
  const close = () => {
    if (!createdSchedule && (title.trim() || description.trim()) && !saveDraft(false)) return;
    onClose();
  };
  const dialog = useDialogFocus(isOpen, close);

  useEffect(() => {
    if (!isOpen) return;
    setStep(1);
    setErrors({});
    setCreatedSchedule(null);
    creating.current = false;
    try {
      const draft = JSON.parse(localStorage.getItem(SCHEDULE_DRAFT_KEY) || 'null');
      if (draft?.version === 1 && typeof draft.title === 'string') {
        if (TEMPLATES.some(template => template.type === draft.scheduleType)) setScheduleType(draft.scheduleType);
        if (typeof draft.title === 'string') setTitle(draft.title);
        if (typeof draft.description === 'string') setDescription(draft.description);
        if (typeof draft.icon === 'string') setIcon(draft.icon);
        if (typeof draft.color === 'string') setColor(draft.color);
        if (typeof draft.startDate === 'string') setStartDate(draft.startDate);
        if (typeof draft.startTime === 'string') setStartTime(draft.startTime);
        if (typeof draft.endTime === 'string') setEndTime(draft.endTime);
        if (typeof draft.allDay === 'boolean') setAllDay(draft.allDay);
        if (typeof draft.locationName === 'string') setLocationName(draft.locationName);
        if (typeof draft.locationAddress === 'string') setLocationAddress(draft.locationAddress);
        if (typeof draft.locationLat === 'number' && Number.isFinite(draft.locationLat)) setLocationLat(draft.locationLat);
        if (typeof draft.locationLng === 'number' && Number.isFinite(draft.locationLng)) setLocationLng(draft.locationLng);
        if (typeof draft.isAnchorConfirmed === 'boolean') setIsAnchorConfirmed(draft.isAnchorConfirmed);
        if (typeof draft.departureAnchorConfirmed === 'boolean') setDepartureAnchorConfirmed(draft.departureAnchorConfirmed);
        if (typeof draft.arrivalAnchorConfirmed === 'boolean') setArrivalAnchorConfirmed(draft.arrivalAnchorConfirmed);
        if (typeof draft.flightNumber === 'string') setFlightNumber(draft.flightNumber);
        if (typeof draft.airline === 'string') setAirline(draft.airline);
        if (typeof draft.departureAirport === 'string') setDepartureAirport(draft.departureAirport);
        if (typeof draft.arrivalAirport === 'string') setArrivalAirport(draft.arrivalAirport);
        if (typeof draft.depLat === 'number' && Number.isFinite(draft.depLat)) setDepLat(draft.depLat);
        if (typeof draft.depLng === 'number' && Number.isFinite(draft.depLng)) setDepLng(draft.depLng);
        if (typeof draft.arrLat === 'number' && Number.isFinite(draft.arrLat)) setArrLat(draft.arrLat);
        if (typeof draft.arrLng === 'number' && Number.isFinite(draft.arrLng)) setArrLng(draft.arrLng);
        if (typeof draft.departureTerminal === 'string') setDepartureTerminal(draft.departureTerminal);
        if (typeof draft.arrivalTerminal === 'string') setArrivalTerminal(draft.arrivalTerminal);
        if (typeof draft.gate === 'string') setGate(draft.gate);
        if (typeof draft.seat === 'string') setSeat(draft.seat);
        if (typeof draft.luggageInfo === 'string') setLuggageInfo(draft.luggageInfo);
        if (typeof draft.flightRemarks === 'string') setFlightRemarks(draft.flightRemarks);
        if (Array.isArray(draft.selectedReminders)) setSelectedReminders(draft.selectedReminders.filter((value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0));
        if (typeof draft.mapVisibleAtRule === 'string') setMapVisibleAtRule(draft.mapVisibleAtRule);
        if (typeof draft.keepAsHistory === 'boolean') setKeepAsHistory(draft.keepAsHistory);
        if (typeof draft.mapHideOnFinish === 'boolean') setMapHideOnFinish(draft.mapHideOnFinish);
        if (['private','close','lover','family','specified','group','excluded'].includes(draft.visibilityScope)) setVisibilityScope(draft.visibilityScope);
        if (Array.isArray(draft.specifiedFriendIds)) setSpecifiedFriendIds(draft.specifiedFriendIds.filter((value: unknown): value is string => typeof value === 'string'));
        if (typeof draft.showFlightNumber === 'boolean') setShowFlightNumber(draft.showFlightNumber);
        if (typeof draft.showExactAirport === 'boolean') setShowExactAirport(draft.showExactAirport);
        if (typeof draft.showDepartureTime === 'boolean') setShowDepartureTime(draft.showDepartureTime);
        if (typeof draft.showCurrentLocation === 'boolean') setShowCurrentLocation(draft.showCurrentLocation);
        if (typeof draft.showStage === 'boolean') setShowStage(draft.showStage);
        if (typeof draft.allowEtaView === 'boolean') setAllowEtaView(draft.allowEtaView);
        if (Number.isInteger(draft.step) && draft.step >= 1 && draft.step <= 5) setStep(draft.step);
        if (initialDate) setStartDate(initialDate);
        showToast('已恢复上次保存的日程草稿');
      }
    } catch { /* Invalid drafts leave the existing form available. */ }
  }, [isOpen]);

  if (!isOpen) return null;

  const anchorsReady =
    scheduleType === 'flight'
      ? departureAnchorConfirmed && arrivalAnchorConfirmed && validCoordinates({lat:depLat,lng:depLng}) && validCoordinates({lat:arrLat,lng:arrLng})
      : isAnchorConfirmed && validCoordinates({lat:locationLat,lng:locationLng});

  // Template select action
  const handleSelectTemplate = (tpl: (typeof TEMPLATES)[0]) => {
    haptics.trigger('light');
    soundEffects.playTapSound();
    setScheduleType(tpl.type);
    setIcon(tpl.icon);
    setColor(tpl.color);

    if (tpl.type === 'flight') {
      setTitle('前往北京');
      setLocationName('兰州中川国际机场 (LHW)');
      setLocationAddress('甘肃省兰州市永登县中川镇机场路');
      setLocationLat(36.5147);
      setLocationLng(103.6212);
      setIsAnchorConfirmed(true);
      setMapVisibleAtRule('12h_before');
      setSelectedReminders([120, 30]);
      setDepartureAnchorConfirmed(false);
      setArrivalAnchorConfirmed(false);
    } else {
      if (!title || title === '前往北京') {
        setTitle(`我的${tpl.label}`);
      }
      setLocationName(initialLocation?.name || initialLocation?.address || '东方红广场');
      setLocationAddress(initialLocation?.address || '兰州市城关区广场南路51号');
      setLocationLat(initialLocation?.lat ?? 36.0620);
      setLocationLng(initialLocation?.lng ?? 103.8080);
      setIsAnchorConfirmed(false);
    }
  };

  // Preset flight auto-fill
  const handleApplyPresetFlight = (preset: (typeof PRESET_FLIGHTS)[0]) => {
    haptics.trigger('medium');
    setFlightNumber(preset.flightNumber);
    setAirline(preset.airline);
    setDepartureAirport(preset.depAirport);
    setArrivalAirport(preset.arrAirport);
    setDepLat(preset.depLat);
    setDepLng(preset.depLng);
    setArrLat(preset.arrLat);
    setArrLng(preset.arrLng);
    setDepartureTerminal(preset.depTerminal);
    setArrivalTerminal(preset.arrTerminal);
    setGate(preset.gate);
    setSeat(preset.seat);
    setStartTime(preset.depTime);
    setEndTime(preset.arrTime);
    setTitle(`前往${preset.arrAirport.split('国际机场')[0]}`);
    setLocationName(preset.depAirport);
    setLocationLat(preset.depLat);
    setLocationLng(preset.depLng);
    setIsAnchorConfirmed(true);
    setDepartureAnchorConfirmed(false);
    setArrivalAnchorConfirmed(false);
    showToast(`已填入 ${preset.flightNumber} 示例模板，请核对日期、机场与时间`);
  };

  // Step 2 Validation
  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};

    if (!validScheduleTime(startDate, startTime, endTime, allDay)) errs.time = '请选择有效日期和时间；跨午夜可选次日更早的结束时间，开始与结束不能相同';

    if (!title.trim()) {
      errs.title = '日程名称不能为空';
    }

    if (scheduleType === 'flight') {
      if (!flightNumber.trim()) {
        errs.flightNumber = '航班号不能为空';
      }
      if (!departureAirport.trim()) {
        errs.departureAirport = '出发机场不能为空';
      }
      if (!arrivalAirport.trim()) {
        errs.arrivalAirport = '到达机场不能为空';
      }
      if (departureAirport.trim() === arrivalAirport.trim()) {
        errs.arrivalAirport = '出发机场与到达机场不能相同';
      }
    } else {
      if (!locationName.trim()) {
        errs.locationName = '地点名称不能为空';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Next Step Handler
  const handleNextStep = () => {
    if (step === 2) {
      if (!validateStep2()) {
        haptics.trigger('heavy');
        soundEffects.playTapSound?.();
        return;
      }
    }

    if (step === 3 && !anchorsReady) {
      haptics.trigger('heavy');
      soundEffects.playTapSound?.();
      showToast(
        scheduleType === 'flight'
          ? '请先确认出发与到达机场锚点'
          : '请先确认地图锚点位置'
      );
      return;
    }

    haptics.trigger('light');
    soundEffects.playTapSound();
    setStep((prev) => Math.min(prev + 1, 5));
  };

  const handlePrevStep = () => {
    haptics.trigger('light');
    soundEffects.playTapSound();
    setStep((prev) => Math.max(prev - 1, 1));
  };

  // Final Confirmation Atomic Submission
  const handleConfirmCreate = () => {
    if (creating.current) return;
    if (!validateStep2()) { setStep(2); showToast('请先修正日程名称、日期或时间'); return; }
    if (!anchorsReady) { setStep(3); showToast('请确认日程位置的有效坐标'); return; }
    if (visibilityScope === 'specified' && specifiedFriendIds.length === 0) { showToast('请选择可查看日程的好友，或改为仅自己可见'); return; }
    creating.current = true;
    haptics.trigger('medium');
    soundEffects.playSuccessSound?.();

    const startAtStr = `${startDate} ${allDay ? '00:00' : startTime}`;
    const endAtStr = endDayOrTime(startDate, allDay ? '23:59' : endTime);

    // Compute mapVisibleAt date
    let mapVisibleAtStr = startAtStr;
    if (mapVisibleAtRule === '12h_before') {
      mapVisibleAtStr = '起飞/开始前 12 小时';
    } else if (mapVisibleAtRule === '2h_before') {
      mapVisibleAtStr = '起飞/开始前 2 小时';
    } else if (mapVisibleAtRule === '1d_before') {
      mapVisibleAtStr = '提前 1 天';
    } else if (mapVisibleAtRule === 'immediately') {
      mapVisibleAtStr = '立即在地图显示';
    }

    const newSched: Schedule = {
      id: `sched_${Date.now()}`,
      type: scheduleType,
      title: title || (scheduleType === 'flight' ? '前往目的地' : '我的日程'),
      description: description || undefined,
      icon: icon || (scheduleType === 'flight' ? '✈️' : '📅'),
      color: color || '#1877F2',
      startDate, startTime: allDay ? '00:00' : startTime, endTime: allDay ? '23:59' : endTime,
      startAt: startAtStr,
      endAt: endAtStr,
      allDay,
      timezone,
      location: {
        name: scheduleType === 'flight' ? departureAirport : locationName,
        address: locationAddress || undefined,
        latitude: scheduleType === 'flight' ? depLat : locationLat,
        longitude: scheduleType === 'flight' ? depLng : locationLng,
      },
      destination:
        scheduleType === 'flight'
          ? {
              name: arrivalAirport,
              address: `${arrivalAirport} Terminal ${arrivalTerminal}`,
              latitude: arrLat,
              longitude: arrLng,
            }
          : undefined,
      reminders: selectedReminders,
      mapVisibleAt: mapVisibleAtStr,
      mapHideAt: mapHideOnFinish ? endAtStr : undefined,
      keepAsHistory,
      visibilityRule: {
        scope: visibilityScope,
        specifiedIds: specifiedFriendIds,
        showFlightNumber,
        showExactAirport,
        showDepartureTime,
        showCurrentLocation,
        showStage,
        allowEtaView,
      },
      flight:
        scheduleType === 'flight'
          ? {
              flightNumber: flightNumber.trim().toUpperCase(),
              airline: airline.trim() || undefined,
              departureAirport,
              arrivalAirport,
              departureCode: departureAirport.match(/\(([A-Z]{3})\)/)?.[1],
              arrivalCode: arrivalAirport.match(/\(([A-Z]{3})\)/)?.[1],
              departureTime: startTime,
              arrivalTime: endTime,
              departureTerminal,
              arrivalTerminal,
              gate,
              seat,
              luggageInfo,
              remarks: flightRemarks,
              status: 'upcoming',
              isSimulated: false,
            }
          : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
    };

    try {
      onSuccessCreate(newSched);
      setCreatedSchedule(newSched);
      try { localStorage.removeItem(SCHEDULE_DRAFT_KEY); } catch { /* The schedule is already saved. */ }
    } catch {
      creating.current = false;
      showToast('日程暂未创建成功，填写内容已保留，请重试');
    }
  };

  const endDayOrTime = (dateStr: string, timeStr: string) => {
    if (!allDay && timeStr <= startTime) { const next = new Date(`${dateStr}T12:00:00+08:00`); next.setDate(next.getDate()+1); return `${dateKey(next)} ${timeStr}`; }
    return `${dateStr} ${timeStr}`;
  };

  const toggleReminder = (val: number) => {
    setSelectedReminders((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val].sort((a, b) => a - b)
    );
  };

  return (
    <div className="map-creation-dialog fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs font-sans select-none overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2 }}
        ref={dialog} role="dialog" aria-modal="true" aria-labelledby="schedule-creation-title" tabIndex={-1}
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-[#E4E6EB] flex flex-col overflow-hidden max-h-[calc(100dvh-32px)] [&_input]:min-h-11 [&_input]:text-base [&_select]:min-h-11 [&_select]:text-base [&_button]:min-h-11 [&_button]:touch-manipulation"
      >
        {/* Modal Header */}
        <div className="px-4 py-3 bg-white border-b border-[#E4E6EB] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#1877F2]/10 flex items-center justify-center text-[#1877F2]">
              <Calendar size={18} className="stroke-[2.2]" />
            </div>
            <div>
              <h2 id="schedule-creation-title" className="text-base font-black text-[#050505] tracking-tight">创建日程</h2>
              <p className="text-[11px] text-[var(--stellar-muted)] font-medium">
                步骤 {createdSchedule ? '5 / 5' : `${step} / 5`} ·{' '}
                {createdSchedule
                  ? '已完成创建'
                  : step === 1
                  ? '选择日程类型'
                  : step === 2
                  ? '填写内容与时间'
                  : step === 3
                  ? '确认地图锚点'
                  : step === 4
                  ? '提醒与地图显示'
                  : '预览与共享'}
              </p>
            </div>
          </div>

          {/* Step Progress Bar */}
          {!createdSchedule && (
            <div className="flex items-center space-x-1 mx-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s === step
                      ? 'w-6 bg-[#1877F2]'
                      : s < step
                      ? 'w-3 bg-emerald-500'
                      : 'w-3 bg-gray-200'
                  }`}
                />
              ))}
            </div>
          )}

          <button
            onClick={close}
            aria-label="保存草稿并关闭日程设置"
            className="w-11 h-11 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] flex items-center justify-center text-[#65676B] transition-colors"
            title="关闭"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* SUCCESS SCREEN */}
          {createdSchedule ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-6 text-center space-y-5"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={36} className="stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[var(--stellar-surface-ink)] tracking-tight">日程已创建</h3>
                <p className="text-xs text-[var(--stellar-muted)] mt-1 font-semibold">
                  已成功同步添加到个人日历与地图生活图层
                </p>
              </div>

              {/* Summary Card */}
              <div className="max-w-md mx-auto bg-gray-50 border border-[#E4E6EB] rounded-lg p-4 text-left space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{createdSchedule.icon}</span>
                    <span className="font-bold text-sm text-[var(--stellar-surface-ink)]">
                      {createdSchedule.title}
                    </span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-100 text-[#1877F2] font-black">
                    {createdSchedule.type === 'flight' ? '航班出行' : '普通日程'}
                  </span>
                </div>
                <div className="text-xs text-[var(--stellar-muted)] space-y-1 pt-1 border-t border-gray-200">
                  <p>⏰ 时间：{createdSchedule.startAt}</p>
                  <p>📍 锚点：{createdSchedule.location.name}</p>

                  {createdSchedule.flight && (
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 p-2 bg-white border border-blue-100 rounded-md">
                      <div className="min-w-0">
                        <span className="block text-[10px] text-[var(--stellar-muted)]">出发锚点</span>
                        <strong className="block truncate text-[11px] text-[var(--stellar-surface-ink)]">{createdSchedule.flight.departureAirport}</strong>
                      </div>
                      <span className="text-blue-600 font-bold" aria-label="航线模拟">✈️</span>
                      <div className="min-w-0 text-right">
                        <span className="block text-[10px] text-[var(--stellar-muted)]">到达锚点</span>
                        <strong className="block truncate text-[11px] text-[var(--stellar-surface-ink)]">{createdSchedule.flight.arrivalAirport}</strong>
                      </div>
                    </div>
                  )}

                  {createdSchedule.flight && (
                    <div className="bg-[var(--stellar-surface-soft)] p-2 rounded-md border border-blue-100 text-[11px] text-[var(--stellar-surface-ink)] mt-2 space-y-0.5 font-medium">
                      <p className="font-bold text-[var(--stellar-surface-ink)]">
                        ✈️ 航班 {createdSchedule.flight.flightNumber} ({createdSchedule.flight.airline})
                      </p>
                      <p>
                        {createdSchedule.flight.departureAirport} ➔ {createdSchedule.flight.arrivalAirport}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center space-x-3 pt-3">
                <button
                  onClick={() => {
                    onClose();
                    if (onViewOnMap) onViewOnMap(createdSchedule);
                  }}
                  className="px-5 py-2.5 rounded-lg bg-[#1877F2] hover:bg-blue-600 text-white font-bold text-xs flex items-center space-x-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
                >
                  <MapPin size={15} />
                  <span>在地图查看</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    if (onViewOnCalendar) onViewOnCalendar(createdSchedule);
                  }}
                  className="px-5 py-2.5 rounded-lg bg-white border border-[#E4E6EB] hover:bg-gray-50 text-[var(--stellar-surface-ink)] font-bold text-xs flex items-center space-x-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
                >
                  <Calendar size={15} className="text-[#1877F2]" />
                  <span>在日历查看</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              {/* STEP 1: SELECT TYPE */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="border-b border-gray-100 pb-2">
                    <h3 className="text-sm font-black text-[var(--stellar-surface-ink)]">请选择日程类型</h3>
                    <p className="text-xs text-[var(--stellar-muted)]">
                      选择类型后将为您自动加载匹配的主题图标、字段模板与地图动效
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {TEMPLATES.map((tpl) => {
                      const isSelected = scheduleType === tpl.type;
                      return (
                        <button
                          key={tpl.type}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => handleSelectTemplate(tpl)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start space-x-3 ${
                            isSelected
                              ? 'border-[#1877F2] bg-blue-50/50 shadow-xs ring-2 ring-[#1877F2]/20'
                              : 'border-[#E4E6EB] bg-white hover:border-[#1877F2]/50 hover:bg-gray-50'
                          }`}
                        >
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0 shadow-2xs"
                            style={{ backgroundColor: `${tpl.color}15`, color: tpl.color }}
                          >
                            {tpl.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-[var(--stellar-surface-ink)]">{tpl.label}</span>
                              {isSelected && <Check size={14} className="text-[#1877F2]" />}
                            </div>
                            <p className="text-[11px] text-[var(--stellar-muted)] line-clamp-2 mt-0.5">
                              {tpl.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {scheduleType === 'flight' && (
                    <div className="p-3 bg-[var(--stellar-surface-soft)] border border-sky-200 rounded-lg text-[var(--stellar-surface-ink)] text-xs flex items-start space-x-2">
                      <Plane size={16} className="text-sky-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">航班出行已触发：</span>
                        请确认起飞与到达机场坐标，并设置时间和提前提醒。航线仅作计划示意；实时数据需要连接航班服务。
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: FILL CONTENT & TIME */}
              {step === 2 && (
                <div className="space-y-4">
                  {/* Flight Preset Quick Selection Banner */}
                  {scheduleType === 'flight' && (
                    <div className="p-3 bg-[var(--stellar-surface-soft)] border border-blue-200 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[var(--stellar-surface-ink)] flex items-center space-x-1">
                          <Sparkles size={14} className="text-blue-600" />
                          <span>静态航班示例 · 快捷填报后请核对</span>
                        </span>
                        <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold">
                          模拟数据
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_FLIGHTS.map((p) => (
                          <button
                            key={p.flightNumber}
                            onClick={() => handleApplyPresetFlight(p)}
                            className="px-2.5 py-1 rounded bg-white hover:bg-blue-100 border border-blue-200 text-[11px] font-bold text-[var(--stellar-surface-ink)] transition-all cursor-pointer shadow-2xs"
                          >
                            ✈️ {p.flightNumber} ({p.depAirport.slice(0, 4)} ➔ {p.arrAirport.slice(0, 4)})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* General Fields */}
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="schedule-title" className="block text-xs font-bold text-[var(--stellar-surface-ink)] mb-1">
                        日程名称 <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="schedule-title"
                        aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? "schedule-title-error" : undefined}
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={scheduleType === 'flight' ? '例如：前往北京' : '例如：同城咖啡研讨会'}
                        className={`w-full px-3 py-2 rounded-md border text-xs text-[var(--stellar-surface-ink)] focus:outline-none focus:ring-2 ${
                          errors.title
                            ? 'border-red-500 ring-2 ring-red-200'
                            : 'border-[#E4E6EB] focus:ring-[#1877F2]/30 focus:border-[#1877F2]'
                        }`}
                      />
                      {errors.title && (
                        <p id="schedule-title-error" role="alert" className="text-[10.5px] text-red-500 font-semibold mt-1 flex items-center">
                          <AlertCircle size={11} className="mr-1" />
                          {errors.title}
                        </p>
                      )}
                    </div>

                    {/* Flight-Specific Fields */}
                    {scheduleType === 'flight' ? (
                      <div className="p-3 bg-gray-50 rounded-lg border border-[#E4E6EB] space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label htmlFor="flight-number" className="block text-[11px] font-bold text-[var(--stellar-surface-ink)] mb-1">
                              航班号 <span className="text-red-500">*</span>
                            </label>
                            <input
                              id="flight-number"
                              type="text"
                              value={flightNumber}
                              onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                              placeholder="CA1502"
                              className="w-full px-2.5 py-1.5 rounded border border-gray-300 text-xs font-mono font-bold uppercase"
                            />
                            {errors.flightNumber && (
                              <p className="text-[10px] text-red-500 mt-0.5">{errors.flightNumber}</p>
                            )}
                          </div>
                          <div>
                            <label htmlFor="airline" className="block text-[11px] font-bold text-[var(--stellar-surface-ink)] mb-1">
                              航空公司
                            </label>
                            <input
                              id="airline"
                              type="text"
                              value={airline}
                              onChange={(e) => setAirline(e.target.value)}
                              placeholder="中国国际航空"
                              className="w-full px-2.5 py-1.5 rounded border border-gray-300 text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label htmlFor="departure-airport" className="block text-[11px] font-bold text-[var(--stellar-surface-ink)] mb-1">
                              出发机场 <span className="text-red-500">*</span>
                            </label>
                            <input
                              id="departure-airport"
                              type="text"
                              value={departureAirport}
                              onChange={(e) => {
                                setDepartureAirport(e.target.value);
                                setDepartureAnchorConfirmed(false);
                              }}
                              placeholder="兰州中川国际机场 (LHW)"
                              className="w-full px-2.5 py-1.5 rounded border border-gray-300 text-xs"
                            />
                            {errors.departureAirport && (
                              <p className="text-[10px] text-red-500 mt-0.5">{errors.departureAirport}</p>
                            )}
                          </div>
                          <div>
                            <label htmlFor="arrival-airport" className="block text-[11px] font-bold text-[var(--stellar-surface-ink)] mb-1">
                              到达机场 <span className="text-red-500">*</span>
                            </label>
                            <input
                              id="arrival-airport"
                              type="text"
                              value={arrivalAirport}
                              onChange={(e) => {
                                setArrivalAirport(e.target.value);
                                setArrivalAnchorConfirmed(false);
                              }}
                              placeholder="北京首都国际机场 (PEK)"
                              className="w-full px-2.5 py-1.5 rounded border border-gray-300 text-xs"
                            />
                            {errors.arrivalAirport && (
                              <p className="text-[10px] text-red-500 mt-0.5">{errors.arrivalAirport}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2 text-[11px]">
                          <div>
                            <label htmlFor="departure-terminal" className="block font-medium text-[var(--stellar-muted)]">出发航站楼</label>
                            <input
                              id="departure-terminal"
                              type="text"
                              value={departureTerminal}
                              onChange={(e) => setDepartureTerminal(e.target.value)}
                              className="w-full px-2 py-1 rounded border border-gray-300 text-xs"
                            />
                          </div>
                          <div>
                            <label htmlFor="arrival-terminal" className="block font-medium text-[var(--stellar-muted)]">到达航站楼</label>
                            <input
                              id="arrival-terminal"
                              type="text"
                              value={arrivalTerminal}
                              onChange={(e) => setArrivalTerminal(e.target.value)}
                              className="w-full px-2 py-1 rounded border border-gray-300 text-xs"
                            />
                          </div>
                          <div>
                            <label htmlFor="boarding-gate" className="block font-medium text-[var(--stellar-muted)]">登机口</label>
                            <input
                              id="boarding-gate"
                              type="text"
                              value={gate}
                              onChange={(e) => setGate(e.target.value)}
                              className="w-full px-2 py-1 rounded border border-gray-300 text-xs"
                            />
                          </div>
                          <div>
                            <label htmlFor="seat-number" className="block font-medium text-[var(--stellar-muted)]">座位号</label>
                            <input
                              id="seat-number"
                              type="text"
                              value={seat}
                              onChange={(e) => setSeat(e.target.value)}
                              className="w-full px-2 py-1 rounded border border-gray-300 text-xs font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label htmlFor="location-name" className="block text-xs font-bold text-[var(--stellar-surface-ink)] mb-1">
                          地点名称 <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="location-name"
                          type="text"
                          value={locationName}
                          onChange={(e) => { setLocationName(e.target.value); setIsAnchorConfirmed(false); }}
                          placeholder="输入地点名称 (下一步可在地图确认位置)"
                          className={`w-full px-3 py-2 rounded-md border text-xs text-[var(--stellar-surface-ink)] focus:outline-none ${
                            errors.locationName
                              ? 'border-red-500'
                              : 'border-[#E4E6EB] focus:ring-[#1877F2]/30'
                          }`}
                        />
                        {errors.locationName && (
                          <p className="text-[10.5px] text-red-500 mt-1">{errors.locationName}</p>
                        )}
                      </div>
                    )}

                    {errors.time && <p role="alert" className="text-xs text-red-500">{errors.time}</p>}
                    {/* Date and Time Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label htmlFor="schedule-date" className="block text-xs font-bold text-[var(--stellar-surface-ink)] mb-1">日期</label>
                        <input
                          id="schedule-date"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-md border border-[#E4E6EB] text-xs"
                        />
                      </div>
                      <div>
                        <label htmlFor="schedule-start-time" className="block text-xs font-bold text-[var(--stellar-surface-ink)] mb-1">活动起始时间</label>
                        <input
                          id="schedule-start-time"
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-md border border-[#E4E6EB] text-xs font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label htmlFor="schedule-end-time" className="block text-xs font-bold text-[var(--stellar-surface-ink)] mb-1">活动结束时间</label>
                        <input
                          id="schedule-end-time"
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-md border border-[#E4E6EB] text-xs font-mono"
                        />
                      </div>
                    </div>

                    {/* Icon & Color selector */}
                    <div className="flex flex-col space-y-2 pt-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <label htmlFor="schedule-icon" className="block text-[11px] font-bold text-[var(--stellar-surface-ink)] mb-1">图标</label>
                          <input id="schedule-icon"
                            type="text"
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                            className="w-12 text-center py-1 rounded border border-[#E4E6EB] text-base"
                          />
                        </div>
                        <div>
                          <label htmlFor="schedule-color" className="block text-[11px] font-bold text-[var(--stellar-surface-ink)] mb-1">主题颜色</label>
                          <input id="schedule-color"
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-10 h-8 rounded cursor-pointer border-0"
                          />
                        </div>
                        <div className="flex-1">
                          <label htmlFor="schedule-description" className="block text-[11px] font-bold text-[var(--stellar-surface-ink)] mb-1">日程说明</label>
                          <input id="schedule-description"
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="可选：备注信息"
                            className="w-full px-2.5 py-1 rounded border border-[#E4E6EB] text-xs"
                          />
                        </div>
                      </div>

                      {/* Quick Emoji Presets Bar */}
                      <div>
                        <label className="block text-[10px] font-bold text-[var(--stellar-muted)] mb-1">快捷图标选择 (支持 ✈️ 航班/出行等)</label>
                        <div className="flex flex-wrap gap-1.5">
                          {['✈️', '📅', '💼', '🎉', '🧳', '🏥', '🏀', '☕', '🎬', '✨', '🚀', '📍'].map((emoji, eIdx) => (
                            <button
                              key={`sched-emoji-${emoji}-${eIdx}`}
                              type="button"
                              onClick={() => {
                                setIcon(emoji);
                                haptics.trigger('light');
                              }}
                              className={`w-7 h-7 rounded-md border text-sm flex items-center justify-center transition-all cursor-pointer ${
                                icon === emoji
                                  ? 'bg-blue-100 border-[#1877F2] ring-2 ring-[#1877F2]/40 scale-105'
                                  : 'bg-gray-50 border-[#E4E6EB] hover:bg-gray-100'
                              }`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: CONFIRM MAP ANCHOR */}
              {step === 3 && (
                <div className="space-y-3">
                  <div className="border-b border-gray-100 pb-2">
                    <h3 className="text-sm font-black text-[var(--stellar-surface-ink)] flex items-center justify-between">
                      <span>确定地图锚点</span>
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold" aria-live="polite">
                        {scheduleType === 'flight' ? (
                          <>
                            <span className={departureAnchorConfirmed ? 'text-emerald-600' : 'text-amber-600'}>
                              {departureAnchorConfirmed ? '✓ 出发已确认' : '○ 出发待确认'}
                            </span>
                            <span className={arrivalAnchorConfirmed ? 'text-emerald-600' : 'text-amber-600'}>
                              {arrivalAnchorConfirmed ? '✓ 到达已确认' : '○ 到达待确认'}
                            </span>
                          </>
                        ) : (
                          <span className={isAnchorConfirmed ? 'text-emerald-600' : 'text-amber-600'}>
                            {isAnchorConfirmed ? '✓ 地图锚点已确认' : '○ 待确认地图锚点'}
                          </span>
                        )}
                      </div>
                    </h3>
                    <p className="text-xs text-[var(--stellar-muted)]">
                      {scheduleType === 'flight'
                        ? '拖动两张地图确认出发与到达机场，航线连接这两个已确认位置'
                        : '请搜索或在地图预览中微调确认日程的具体地理锚点'}
                    </p>
                  </div>

                  {scheduleType === 'flight' ? <>
                    <CoordinatePicker label="出发机场" description="确认起飞位置，日程图标会锚定在这里。" value={{name:departureAirport,lat:depLat,lng:depLng}} confirmed={departureAnchorConfirmed} onChange={(location,confirmed) => {setDepartureAirport(location.name);setDepLat(location.lat);setDepLng(location.lng);setDepartureAnchorConfirmed(confirmed);}}/>
                    <CoordinatePicker label="到达机场" description="确认实际降落机场，作为航线终点。" value={{name:arrivalAirport,lat:arrLat,lng:arrLng}} confirmed={arrivalAnchorConfirmed} onChange={(location,confirmed) => {setArrivalAirport(location.name);setArrLat(location.lat);setArrLng(location.lng);setArrivalAnchorConfirmed(confirmed);}}/>
                  </> : <CoordinatePicker label="日程位置" description="拖动地图对准中心图钉，或快捷选择收藏地点；确认后日程和路线使用同一坐标。" value={{name:locationName,address:locationAddress,lat:locationLat,lng:locationLng}} confirmed={isAnchorConfirmed} onChange={(location,confirmed) => {setLocationName(location.name);setLocationAddress(location.address || '');setLocationLat(location.lat);setLocationLng(location.lng);setIsAnchorConfirmed(confirmed);}}/>}
                </div>
              )}

              {/* STEP 4: REMINDERS & MAP DISPLAY RULES */}
              {step === 4 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-black text-[var(--stellar-surface-ink)]">提醒与地图显示设置</h3>
                    <p className="text-xs text-[var(--stellar-muted)]">
                      设置时间节点提醒以及日程在地图上的出现与自动隐藏规则
                    </p>
                  </div>

                  {/* Reminders Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[var(--stellar-surface-ink)] flex items-center">
                      <Bell size={13} className="text-[#1877F2] mr-1" />
                      提醒触发时间 (多选)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {REMINDER_OPTIONS.map((opt) => {
                        const isChecked = selectedReminders.includes(opt.value);
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            aria-pressed={isChecked}
                            onClick={() => toggleReminder(opt.value)}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
                              isChecked
                                ? 'bg-blue-50 border-[#1877F2] text-[#1877F2]'
                                : 'bg-white border-[#E4E6EB] text-[var(--stellar-muted)] hover:bg-gray-50'
                            }`}
                          >
                            {isChecked && '✓ '}
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Map Display Rules */}
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <label className="block text-xs font-bold text-[var(--stellar-surface-ink)] flex items-center">
                      <Eye size={13} className="text-emerald-600 mr-1" />
                      地图图标出现时间
                    </label>
                    <div role="radiogroup" aria-label="地图图标出现时间" className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {[
                        { id: 'immediately', label: '立即显示' },
                        { id: '2h_before', label: '提前 2 小时显示' },
                        { id: '12h_before', label: '提前 12 小时显示 (航班推荐)' },
                        { id: '1d_before', label: '提前 1 天显示' },
                      ].map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          role="radio"
                          aria-checked={mapVisibleAtRule === r.id}
                          onClick={() => setMapVisibleAtRule(r.id)}
                          className={`p-2 rounded-md border text-left font-medium ${
                            mapVisibleAtRule === r.id
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                              : 'bg-white border-[#E4E6EB] text-[var(--stellar-surface-ink)]'
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Retention Rule */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 border border-[#E4E6EB] rounded-lg text-xs">
                    <div>
                      <span className="font-bold text-[var(--stellar-surface-ink)]">日程结束/落地后保留历史锚点</span>
                      <p className="text-[11px] text-[var(--stellar-muted)]">
                        保留在地图“个人足迹”图层中，而非彻底消失
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      aria-label="日程结束后保留历史锚点"
                      checked={keepAsHistory}
                      onChange={(e) => setKeepAsHistory(e.target.checked)}
                      className="w-4 h-4 text-[#1877F2] rounded focus:ring-[#1877F2]"
                    />
                  </div>

                  {/* Smart Departure Recommendation Widget */}
                  <div className="p-3 bg-[var(--stellar-surface-soft)] border border-amber-200 rounded-lg text-[var(--stellar-surface-ink)] text-xs space-y-1">
                    <span className="font-bold flex items-center">
                      <Info size={14} className="text-amber-600 mr-1" />
                      出发提醒与路线规划
                    </span>
                    <p className="text-[11px] text-[var(--stellar-surface-ink)]">
                      保存后根据当前位置估算路程与预留时间，并生成出发提醒。可在路线页调整交通方式和预留时间；距离估算不含实时路况。
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 5: PREVIEW & PRIVACY */}
              {step === 5 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-black text-[var(--stellar-surface-ink)]">隐私权限与最终预览</h3>
                    <p className="text-xs text-[var(--stellar-muted)]">
                      确认日程隐私分享规则，并最后核对各项要素
                    </p>
                  </div>

                  {/* Visibility Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[var(--stellar-surface-ink)] flex items-center">
                      <Lock size={13} className="text-indigo-600 mr-1" />
                      日程可见范围 (单选)
                    </label>
                    <div role="radiogroup" aria-label="日程可见范围" className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {[
                        { id: 'private', label: '🔒 仅自己' },
                        { id: 'close', label: '⭐ 密友可见' },
                        { id: 'lover', label: '❤️ 恋人可见' },
                        { id: 'family', label: '🏠 家人可见' },
                      ].map((v) => {
                        const isSelected = visibilityScope === v.id;
                        return (
                          <button
                            key={v.id}
                            type="button"
                            role="radio" aria-checked={isSelected}
                            onClick={() => setVisibilityScope(v.id as VisibilityRule['scope'])}
                            className={`p-2 rounded-md border text-center font-bold ${
                              isSelected
                                ? 'bg-[var(--stellar-surface-soft)] border-indigo-500 text-[var(--stellar-surface-ink)] ring-2 ring-indigo-200'
                                : 'bg-white border-[#E4E6EB] text-[var(--stellar-surface-ink)]'
                            }`}
                          >
                            {v.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Flight Privacy Toggles */}
                  {scheduleType === 'flight' && (
                    <div className="p-3 bg-gray-50 border border-[#E4E6EB] rounded-lg space-y-2 text-xs">
                      <span className="font-bold text-[var(--stellar-surface-ink)]">航班隐私字段细化控制：</span>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showFlightNumber}
                            onChange={(e) => setShowFlightNumber(e.target.checked)}
                          />
                          <span>显示航班号 ({flightNumber})</span>
                        </label>
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showExactAirport}
                            onChange={(e) => setShowExactAirport(e.target.checked)}
                          />
                          <span>显示精确机场及航站楼</span>
                        </label>
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showStage}
                            onChange={(e) => setShowStage(e.target.checked)}
                          />
                          <span>显示行程阶段状态</span>
                        </label>
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={allowEtaView}
                            onChange={(e) => setAllowEtaView(e.target.checked)}
                          />
                          <span>允许好友查看 ETA 预计到达</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Final Schedule Preview Card */}
                  <div className="p-4 bg-[var(--stellar-surface-soft)] border border-[#E4E6EB] rounded-lg space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{icon}</span>
                        <div>
                          <h4 className="font-black text-sm text-[var(--stellar-surface-ink)]">{title}</h4>
                          <span className="text-[11px] text-[var(--stellar-muted)]">
                            {startDate} · {startTime} ~ {endTime}
                          </span>
                        </div>
                      </div>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-2xs"
                        style={{ backgroundColor: color }}
                      >
                        {scheduleType === 'flight' ? '航班出行' : '普通日程'}
                      </span>
                    </div>

                    <div className="text-xs text-[var(--stellar-surface-ink)] space-y-1">
                      <p>📍 锚点：{scheduleType === 'flight' ? departureAirport : locationName}</p>
                      {scheduleType === 'flight' && (
                        <p className="font-mono text-[var(--stellar-surface-ink)] font-bold">
                          ✈️ 航班 {flightNumber} | {departureAirport} ➔ {arrivalAirport} (
                          {departureTerminal} 登机口 {gate})
                        </p>
                      )}
                      <p className="text-[11px] text-[var(--stellar-muted)]">
                        🔔 提醒：{selectedReminders.length} 个提醒节点 | 地图规则：{mapVisibleAtRule}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer Controls */}
        {!createdSchedule && (
          <div className="px-4 py-3 bg-gray-50 border-t border-[#E4E6EB] flex flex-wrap gap-2 items-center justify-between shrink-0">
            {step > 1 ? (
              <button
                onClick={handlePrevStep}
                className="px-3.5 py-1.5 rounded-md border border-[#E4E6EB] bg-white hover:bg-gray-100 text-xs font-bold text-[var(--stellar-surface-ink)] flex items-center space-x-1 transition-all active:scale-95 cursor-pointer"
              >
                <ChevronLeft size={15} />
                <span>返回上一步</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center space-x-2">
              {step === 5 ? (
                <>
                  <button
                    onClick={() => saveDraft()}
                    className="px-3 py-1.5 rounded-md border border-[#E4E6EB] bg-white hover:bg-gray-100 text-xs font-bold text-[var(--stellar-surface-ink)] transition-all active:scale-95 cursor-pointer"
                  >
                    保存草稿
                  </button>
                  <button
                    onClick={handleConfirmCreate}
                    className="px-5 py-2 rounded-md bg-[#1877F2] hover:bg-blue-600 text-white font-bold text-xs shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center space-x-1"
                  >
                    <CheckCircle2 size={15} />
                    <span>确认创建</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleNextStep}
                  disabled={step === 3 && !anchorsReady}
                  className="px-5 py-2 rounded-md bg-[#1877F2] hover:bg-blue-600 text-white font-bold text-xs shadow-2xs transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <span>下一步</span>
                  <ChevronRight size={15} />
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
