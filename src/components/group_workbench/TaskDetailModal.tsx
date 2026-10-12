import React from 'react';
import {
  X,
  CheckSquare,
  Clock,
  MapPin,
  FileText,
  User,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { GroupTaskItem, TaskStatus } from './types';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: GroupTaskItem | null;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onToggleStep: (taskId: string, stepId: string) => void;
  onOpenDoc?: (docId: string) => void;
  showToast: (msg: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
  onUpdateTaskStatus,
  onToggleStep,
  onOpenDoc,
  showToast,
}) => {
  if (!isOpen || !task) return null;

  const statusConfig: Record<
    TaskStatus,
    { label: string; bg: string; text: string; border: string }
  > = {
    pending_accept: {
      label: '待接受',
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-300',
    },
    accepted: {
      label: '已接受',
      bg: 'bg-blue-50',
      text: 'text-[#1877F2]',
      border: 'border-blue-200',
    },
    in_progress: {
      label: '执行中',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
    },
    blocked: {
      label: '阻塞',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
    },
    under_review: {
      label: '待复核',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
    },
    completed: {
      label: '已完成',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
    },
    cancelled: {
      label: '已取消',
      bg: 'bg-gray-200',
      text: 'text-gray-500',
      border: 'border-gray-300',
    },
  };

  const currentStatus = statusConfig[task.status] || statusConfig.accepted;
  const completedSteps = task.steps.filter((s) => s.done).length;
  const totalSteps = task.steps.length;
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="task-detail-modal"
        className="relative w-full max-w-2xl bg-white rounded-md border border-[#E4E6EB] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-14 px-4 bg-white border-b border-[#E4E6EB] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1877F2] shrink-0">
              <CheckSquare size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-gray-900 truncate">
                  {task.title}
                </h2>
                <span
                  className={`text-[10px] px-2 py-0.5 font-bold rounded-sm border shrink-0 ${currentStatus.bg} ${currentStatus.text} ${currentStatus.border}`}
                >
                  {currentStatus.label}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 truncate">
                所属：{task.squadName ? `小队「${task.squadName}」` : '小组全局任务'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer shrink-0 ml-2"
            aria-label="关闭任务详情"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Target Goal Banner */}
          <div className="p-3 bg-[#F8FAFC] border border-[#E4E6EB] rounded-sm">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              核心交付目标
            </div>
            <p className="text-xs text-gray-800 font-medium leading-relaxed">
              {task.targetGoal}
            </p>
          </div>

          {/* Quick Status Bar */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">快捷流转状态</label>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  'pending_accept',
                  'accepted',
                  'in_progress',
                  'blocked',
                  'under_review',
                  'completed',
                ] as TaskStatus[]
              ).map((st) => {
                const conf = statusConfig[st];
                const isActive = task.status === st;
                return (
                  <button
                    key={st}
                    onClick={() => {
                      onUpdateTaskStatus(task.id, st);
                      showToast(`任务状态已更新为「${conf.label}」`);
                    }}
                    className={`px-2.5 py-1 text-xs font-bold rounded-sm border cursor-pointer transition-all ${
                      isActive
                        ? `${conf.bg} ${conf.text} ${conf.border} ring-1 ring-current shadow-2xs`
                        : 'bg-white text-gray-600 border-[#E4E6EB] hover:border-gray-400'
                    }`}
                  >
                    {conf.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Meta Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white border border-[#E4E6EB] rounded-sm text-xs">
            <div className="flex items-center space-x-2.5">
              <img
                src={task.assigneeAvatar}
                alt={task.assigneeName}
                className="w-8 h-8 rounded-full border border-[#E4E6EB] object-cover"
              />
              <div>
                <div className="text-gray-500 text-[10px]">负责人</div>
                <div className="font-bold text-gray-900">{task.assigneeName}</div>
                <div className="text-gray-400 text-[9px]">{task.assigneeRole}</div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-gray-500 text-[10px] flex items-center space-x-1">
                <Clock size={11} />
                <span>截止时间：{task.dueDate}</span>
              </div>
              <div className="text-gray-500 text-[10px] flex items-center space-x-1">
                <MapPin size={11} />
                <span>集合点：{task.gatheringPoint}</span>
              </div>
              <div className="text-gray-500 text-[10px] flex items-center space-x-1">
                <Info size={11} />
                <span>定位窗口：{task.locationWindow}</span>
              </div>
            </div>
          </div>

          {/* Steps Checklist */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-800">
                步骤清单 ({completedSteps}/{totalSteps} 项完成 · {progressPercent}%)
              </label>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-[#1877F2] transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="space-y-1.5">
              {task.steps.map((step) => (
                <div
                  key={step.id}
                  onClick={() => onToggleStep(task.id, step.id)}
                  className={`p-2.5 border rounded-sm flex items-center space-x-2.5 cursor-pointer transition-all ${
                    step.done
                      ? 'bg-emerald-50/40 border-emerald-200 text-emerald-900'
                      : 'bg-white border-[#E4E6EB] text-gray-800 hover:border-gray-400'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-all ${
                      step.done
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {step.done && <CheckCircle2 size={12} />}
                  </div>
                  <span
                    className={`text-xs flex-1 min-w-0 ${
                      step.done ? 'line-through text-gray-500' : 'font-medium'
                    }`}
                  >
                    {step.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Associated Documents */}
          {task.associatedDocIds && task.associatedDocIds.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">关联资料与文档</label>
              <div className="flex flex-wrap gap-2">
                {task.associatedDocIds.map((docId) => (
                  <button
                    key={docId}
                    type="button"
                    onClick={() => {
                      if (onOpenDoc) onOpenDoc(docId);
                      showToast(`已在文档库中打开关联资料 📄`);
                    }}
                    className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#1877F2] text-xs font-bold rounded-sm border border-blue-200 flex items-center space-x-1 transition-colors cursor-pointer"
                  >
                    <FileText size={12} />
                    <span>
                      {docId === 'doc-1'
                        ? '《城市探索组协作手册》'
                        : docId === 'doc-2'
                        ? '《9 月活动复盘》'
                        : docId === 'doc-3'
                        ? '《兰州城市路线知识库》'
                        : docId === 'doc-5'
                        ? '《项目素材.zip》'
                        : docId === 'doc-privacy-rule'
                        ? '《小组定位与隐私规则》'
                        : '《本周行动任务清单》'}
                    </span>
                    <ExternalLink size={10} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Activity Logs */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">任务活动记录</label>
            <div className="border border-[#E4E6EB] rounded-sm p-3 bg-[#F8FAFC] space-y-2">
              {task.activityLogs.map((log) => (
                <div key={log.id} className="text-[11px] text-gray-600 flex items-center space-x-2">
                  <span className="font-mono text-gray-400">{log.time}</span>
                  <span className="font-bold text-gray-800">{log.user}:</span>
                  <span>{log.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="h-14 px-4 bg-[#F8FAFC] border-t border-[#E4E6EB] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-gray-400">所有操作记录自动同步至小组工作台</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-white bg-[#1877F2] hover:bg-[#166FE5] rounded-sm border border-[#1877F2] shadow-2xs transition-all cursor-pointer"
          >
            完成查看
          </button>
        </div>
      </div>
    </div>
  );
};
