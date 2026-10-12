import React, { useState } from 'react';
import {
  X,
  User,
  Shield,
  MapPin,
  Clock,
  Battery,
  BatteryCharging,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Bell,
  Sliders,
  Calendar,
  Route,
  Navigation,
  PhoneCall,
  MessageSquare,
  ShieldAlert,
  Footprints,
  Home,
  School,
  Lock,
  Eye,
  Info,
  ChevronRight,
  Siren,
  RotateCcw
} from 'lucide-react';
import { CareMember } from '../FamilyCareMonitorPage';

export interface WardCareDetailModalProps {
  member: CareMember | null;
  isOpen: boolean;
  onClose: () => void;
  onCallMember: (member: CareMember) => void;
  onSendMessage: (member: CareMember) => void;
}

export const WardCareDetailModal: React.FC<WardCareDetailModalProps> = ({
  member,
  isOpen,
  onClose,
  onCallMember,
  onSendMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'now' | 'trajectory' | 'alerts' | 'settings'>('now');

  // Config State for Elderly
  const [longStillThreshold, setLongStillThreshold] = useState(45); // minutes
  const [lowBatteryThreshold, setLowBatteryThreshold] = useState(20); // %
  const [fallDetectionAlert, setFallDetectionAlert] = useState(true);
  const [retentionDays, setRetentionDays] = useState<'7' | '14' | '30'>('7');

  // Config State for Child
  const [schoolGeofenceActive, setSchoolGeofenceActive] = useState(true);
  const [homeGeofenceActive, setHomeGeofenceActive] = useState(true);
  const [safeRouteAlert, setSafeRouteAlert] = useState(true);
  const [routeDeviationAlert, setRouteDeviationAlert] = useState(true);
  const [delayedArrivalAlert, setDelayedArrivalAlert] = useState(true);
  const [expectedHomeTime, setExpectedHomeTime] = useState('18:20');

  if (!isOpen || !member) return null;

  const isElderly = member.type === 'elderly';
  const isChild = member.type === 'child';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 backdrop-blur-2xs animate-in fade-in select-none">
      <div className="bg-white border border-[#E4E6EB] rounded-xl shadow-2xl max-w-lg w-full p-4 space-y-3 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover border" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-bold text-[#050505]">{member.name}</h3>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${
                  isElderly ? 'bg-emerald-50 text-[#31A24C] border-emerald-200' : isChild ? 'bg-blue-50 text-[#1877F2] border-blue-200' : 'bg-gray-50 text-[#65676B] border-gray-200'
                }`}>
                  {isElderly ? '老人专看护' : isChild ? '儿童安全护航' : '监护成员'}
                </span>
              </div>
              <p className="text-[11px] text-[#65676B] mt-0.5">
                {member.relation} · 最后更新：{member.lastActive}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-[#65676B] hover:text-[#050505] p-1.5 rounded-md hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* 4 Block Tabs */}
        <div className="grid grid-cols-4 gap-1 bg-[#F0F2F5] p-1 rounded-md shrink-0 text-[12px] font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('now')}
            className={`py-1.5 rounded transition-all cursor-pointer ${
              activeTab === 'now' ? 'bg-white text-[#1877F2] shadow-2xs' : 'text-[#65676B] hover:text-[#050505]'
            }`}
          >
            现在
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('trajectory')}
            className={`py-1.5 rounded transition-all cursor-pointer ${
              activeTab === 'trajectory' ? 'bg-white text-[#1877F2] shadow-2xs' : 'text-[#65676B] hover:text-[#050505]'
            }`}
          >
            {isElderly ? '今日轨迹' : '今日路线'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('alerts')}
            className={`py-1.5 rounded transition-all cursor-pointer ${
              activeTab === 'alerts' ? 'bg-white text-[#1877F2] shadow-2xs' : 'text-[#65676B] hover:text-[#050505]'
            }`}
          >
            {isElderly ? '安全提醒' : '到达记录'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`py-1.5 rounded transition-all cursor-pointer ${
              activeTab === 'settings' ? 'bg-white text-[#1877F2] shadow-2xs' : 'text-[#65676B] hover:text-[#050505]'
            }`}
          >
            监护设置
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 text-[12px]">
          {/* 1. 现在 TAB */}
          {activeTab === 'now' && (
            <div className="space-y-3">
              {/* Fall / Anomaly Alert Warning Banner */}
              {member.bodyPosture === '疑似异常跌落' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-[#FA3B30] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[13px]">
                    <AlertTriangle size={16} />
                    <span>检测到异常状态，请联系成员确认</span>
                  </div>
                  <p className="text-[11px] text-[#050505]">智能传感器推测加速度异常，请立即联系确认长辈身体状态。</p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onCallMember(member)}
                      className="px-3 py-1 bg-[#FA3B30] text-white font-bold rounded text-[11px] cursor-pointer"
                    >
                      立即电话确认
                    </button>
                    <button
                      type="button"
                      onClick={() => onSendMessage(member)}
                      className="px-3 py-1 bg-white border border-red-200 text-[#FA3B30] font-bold rounded text-[11px] cursor-pointer"
                    >
                      发送确认消息
                    </button>
                  </div>
                </div>
              )}

              {/* Status Overview Card */}
              <div className="p-3 bg-white border border-[#E4E6EB] rounded-md space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#050505] text-[13px]">当前安全与位置状态</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-[#31A24C] font-bold text-[10.5px] rounded border border-emerald-200">
                    {member.statusText}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-[#050505] pt-1">
                  <div className="p-2 bg-[#F0F2F5] rounded border border-[#E4E6EB]">
                    <p className="text-[#65676B] text-[10px]">当前地点</p>
                    <p className="font-bold text-[#050505] mt-0.5">{member.locationName}</p>
                  </div>

                  <div className="p-2 bg-[#F0F2F5] rounded border border-[#E4E6EB]">
                    <p className="text-[#65676B] text-[10px]">{isElderly ? '静止 / 在家时长' : '到家预估时间'}</p>
                    <p className="font-bold text-[#050505] mt-0.5">{isElderly ? member.stayDuration : '预计 18:20 到家'}</p>
                  </div>

                  <div className="p-2 bg-[#F0F2F5] rounded border border-[#E4E6EB]">
                    <p className="text-[#65676B] text-[10px]">终端剩余电量</p>
                    <p className={`font-bold mt-0.5 ${member.battery <= 20 ? 'text-[#FA3B30]' : 'text-[#050505]'}`}>
                      {member.battery}% ({member.isCharging ? '正在充电' : '低功耗模式'})
                    </p>
                  </div>

                  <div className="p-2 bg-[#F0F2F5] rounded border border-[#E4E6EB]">
                    <p className="text-[#65676B] text-[10px]">定位精度 & 状态</p>
                    <p className="font-bold text-[#1877F2] mt-0.5">±{member.gpsAccuracy} · 正常在线</p>
                  </div>
                </div>
              </div>

              {/* Quick Contact Bar */}
              <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-md flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#050505]">守护一键触达通道</p>
                  <p className="text-[10.5px] text-[#65676B]">随时与{member.name}发起语音呼叫或位置问候</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSendMessage(member)}
                    className="px-3 py-1.5 bg-white border border-blue-200 text-[#1877F2] font-bold text-[11px] rounded hover:bg-blue-50 cursor-pointer"
                  >
                    消息
                  </button>
                  <button
                    type="button"
                    onClick={() => onCallMember(member)}
                    className="px-3 py-1.5 bg-[#1877F2] text-white font-bold text-[11px] rounded hover:bg-blue-600 cursor-pointer shadow-2xs"
                  >
                    一键联系
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. 今日轨迹 / 路线 TAB */}
          {activeTab === 'trajectory' && (
            <div className="space-y-2">
              <h4 className="font-bold text-[#050505] text-[13px]">{isElderly ? '今日时间轴行程记录' : '今日上学与返家路线'}</h4>

              {isElderly ? (
                <div className="space-y-2 pl-2 border-l-2 border-[#1877F2]">
                  <div className="p-2 bg-white border border-[#E4E6EB] rounded shadow-2xs">
                    <p className="font-bold text-[#1877F2]">08:10 · 家中</p>
                    <p className="text-[#65676B] text-[11px]">起床洗漱，居家静止停留 42 分钟</p>
                  </div>
                  <div className="p-2 bg-white border border-[#E4E6EB] rounded shadow-2xs">
                    <p className="font-bold text-[#1877F2]">08:52 · 前往社区医院</p>
                    <p className="text-[#65676B] text-[11px]">步行 1.2 km · 耗时 18 分钟 · 路线平稳</p>
                  </div>
                  <div className="p-2 bg-white border border-[#E4E6EB] rounded shadow-2xs">
                    <p className="font-bold text-[#1877F2]">09:10 · 社区医院取药</p>
                    <p className="text-[#65676B] text-[11px]">社区诊所停留 36 分钟</p>
                  </div>
                  <div className="p-2 bg-white border border-[#E4E6EB] rounded shadow-2xs">
                    <p className="font-bold text-[#31A24C]">10:05 · 返回家中</p>
                    <p className="text-[#65676B] text-[11px]">预计 12 分钟到达，当前行驶在阳光大道</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pl-2 border-l-2 border-[#1877F2]">
                  <div className="p-2 bg-white border border-[#E4E6EB] rounded shadow-2xs">
                    <p className="font-bold text-[#31A24C]">07:40 · 家庭安全区</p>
                    <p className="text-[#65676B] text-[11px]">已出发离家前往学校</p>
                  </div>
                  <div className="p-2 bg-white border border-[#E4E6EB] rounded shadow-2xs">
                    <p className="font-bold text-[#1877F2]">08:05 · 朝阳第一小学</p>
                    <p className="text-[#65676B] text-[11px]">电子围栏打卡：已安全到达学校</p>
                  </div>
                  <div className="p-2 bg-white border border-[#E4E6EB] rounded shadow-2xs">
                    <p className="font-bold text-[#F59E0B]">16:35 · 朝阳第一小学</p>
                    <p className="text-[#65676B] text-[11px]">已离开学校，开启校路守护路线</p>
                  </div>
                  <div className="p-2 bg-white border border-[#E4E6EB] rounded shadow-2xs">
                    <p className="font-bold text-[#1877F2]">17:50 · 预计到家</p>
                    <p className="text-[#65676B] text-[11px]">当前距离家庭安全区 860m，沿文昌路绿道正常行进</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. 安全提醒 / 到达记录 TAB */}
          {activeTab === 'alerts' && (
            <div className="space-y-2">
              <h4 className="font-bold text-[#050505] text-[13px]">{isElderly ? '近期安全提醒汇总' : '安全到达与打卡记录'}</h4>

              <div className="space-y-2">
                <div className="p-2.5 bg-emerald-50/60 border border-emerald-200 rounded flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-[#31A24C] mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-[#050505]">安全入界打卡提醒</p>
                    <p className="text-[10.5px] text-[#65676B]">今天 08:05 顺利进入【阳光家园安全区】</p>
                  </div>
                </div>

                <div className="p-2.5 bg-amber-50/60 border border-amber-200 rounded flex items-start gap-2">
                  <AlertTriangle size={16} className="text-[#F59E0B] mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-[#050505]">手机低电量告警 (20%)</p>
                    <p className="text-[10.5px] text-[#65676B]">昨天 19:20 监测到终端电量较低，已自动开启长效低功耗守护。</p>
                  </div>
                </div>

                <div className="p-2.5 bg-blue-50/60 border border-blue-200 rounded flex items-start gap-2">
                  <Bell size={16} className="text-[#1877F2] mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-[#050505]">定时服药提醒通知</p>
                    <p className="text-[10.5px] text-[#65676B]">今天 12:30 已按时提醒长辈服用降压药。</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. 监护设置 TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-3">
              <h4 className="font-bold text-[#050505] text-[13px]">独立监护配置与阈值设置</h4>

              {isElderly ? (
                <div className="space-y-2.5 text-[11px]">
                  <div className="p-2.5 bg-[#F0F2F5] rounded border border-[#E4E6EB] flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#050505]">长时间静止告警阈值</p>
                      <p className="text-[10px] text-[#65676B]">连续无微移动超过此时间推送通知</p>
                    </div>
                    <select
                      value={longStillThreshold}
                      onChange={(e) => setLongStillThreshold(Number(e.target.value))}
                      className="bg-white border border-[#E4E6EB] rounded px-2 py-1 font-bold text-[#050505]"
                    >
                      <option value={30}>30 分钟</option>
                      <option value={45}>45 分钟</option>
                      <option value={60}>60 分钟</option>
                    </select>
                  </div>

                  <div className="p-2.5 bg-[#F0F2F5] rounded border border-[#E4E6EB] flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#050505]">低电量提醒阈值</p>
                      <p className="text-[10px] text-[#65676B]">低于该电量时自动广播至监护人</p>
                    </div>
                    <select
                      value={lowBatteryThreshold}
                      onChange={(e) => setLowBatteryThreshold(Number(e.target.value))}
                      className="bg-white border border-[#E4E6EB] rounded px-2 py-1 font-bold text-[#050505]"
                    >
                      <option value={15}>15%</option>
                      <option value={20}>20%</option>
                      <option value={30}>30%</option>
                    </select>
                  </div>

                  <div className="p-2.5 bg-[#F0F2F5] rounded border border-[#E4E6EB] flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#050505]">疑似异常姿态自动检测</p>
                      <p className="text-[10px] text-[#65676B]">检测到剧烈震动/跌落姿态时提示确认</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={fallDetectionAlert}
                      onChange={(e) => setFallDetectionAlert(e.target.checked)}
                      className="w-4 h-4 text-[#1877F2] rounded cursor-pointer"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 text-[11px]">
                  <div className="p-2.5 bg-[#F0F2F5] rounded border border-[#E4E6EB] flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#050505]">学校安全围栏守护</p>
                      <p className="text-[10px] text-[#65676B]">进出朝阳第一小学时自动打卡</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={schoolGeofenceActive}
                      onChange={(e) => setSchoolGeofenceActive(e.target.checked)}
                      className="w-4 h-4 text-[#1877F2] rounded cursor-pointer"
                    />
                  </div>

                  <div className="p-2.5 bg-[#F0F2F5] rounded border border-[#E4E6EB] flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#050505]">偏离安全路线告警</p>
                      <p className="text-[10px] text-[#65676B]">偏移常用路线超过 200m 时推送提醒</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={routeDeviationAlert}
                      onChange={(e) => setRouteDeviationAlert(e.target.checked)}
                      className="w-4 h-4 text-[#1877F2] rounded cursor-pointer"
                    />
                  </div>

                  <div className="p-2.5 bg-[#F0F2F5] rounded border border-[#E4E6EB] flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#050505]">预计到家时间设定</p>
                      <p className="text-[10px] text-[#65676B]">超过此时长未归自动提醒监护人</p>
                    </div>
                    <input
                      type="time"
                      value={expectedHomeTime}
                      onChange={(e) => setExpectedHomeTime(e.target.value)}
                      className="bg-white border border-[#E4E6EB] rounded px-2 py-0.5 font-bold text-[#050505]"
                    />
                  </div>
                </div>
              )}

              {/* Data Retention & Visibility */}
              <div className="p-3 bg-gray-50 border border-[#E4E6EB] rounded-md space-y-1.5 text-[11px]">
                <p className="font-bold text-[#050505]">轨迹数据保留与隐私设置</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[#65676B]">历史轨迹自动保存期限:</span>
                  <div className="flex gap-1">
                    {(['7', '14', '30'] as const).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setRetentionDays(d)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          retentionDays === d ? 'bg-[#1877F2] text-white' : 'bg-white border border-[#E4E6EB] text-[#050505]'
                        }`}
                      >
                        {d} 天
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#E4E6EB] pt-2 shrink-0 flex items-center justify-between">
          <span className="text-[10.5px] text-[#65676B]">Stellar 幸福家庭守护算法已在本地脱敏加密</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1 bg-[#1877F2] text-white font-bold text-[12px] rounded hover:bg-blue-600 transition-colors cursor-pointer"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
