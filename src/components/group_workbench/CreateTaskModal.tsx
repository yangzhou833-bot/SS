import React, { useState } from 'react';
import {
  X,
  CheckSquare,
  Users,
  Clock,
  MapPin,
  FileText,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { GroupMember, SquadItem, GroupTaskItem, TaskStepItem } from './types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: GroupMember[];
  squads: SquadItem[];
  onTaskCreated: (task: GroupTaskItem) => void;
  showToast: (msg: string) => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  members,
  squads,
  onTaskCreated,
  showToast,
}) => {
  const [title, setTitle] = useState('');
  const [targetGoal, setTargetGoal] = useState('');
  const [assigneeId, setAssigneeId] = useState(members[0]?.id || 'mem-1');
  const [dueDate, setDueDate] = useState('2026-09-08 18:00');
  const [gatheringPoint, setGatheringPoint] = useState('Stellar 兰州办公室');
  const [squadId, setSquadId] = useState(squads[0]?.id || '');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [steps, setSteps] = useState<string[]>([
    '核对前序准备清单与安全规程',
    '实地执行踩线与数据记录',
    '输出总结成果并关联至知识库',
  ]);
  const [newStepText, setNewStepText] = useState('');
  const [associatedDocIds, setAssociatedDocIds] = useState<string[]>(['doc-1']);

  if (!isOpen) return null;

  const handleAddStep = () => {
    if (!newStepText.trim()) return;
    setSteps([...steps, newStepText.trim()]);
    setNewStepText('');
  };

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const toggleDoc = (docId: string) => {
    if (associatedDocIds.includes(docId)) {
      setAssociatedDocIds(associatedDocIds.filter((d) => d !== docId));
    } else {
      setAssociatedDocIds([...associatedDocIds, docId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('请输入任务标题');
      return;
    }

    const assignee = members.find((m) => m.id === assigneeId) || members[0];
    const squad = squads.find((s) => s.id === squadId);

    const stepItems: TaskStepItem[] = steps.map((text, idx) => ({
      id: `step-${Date.now()}-${idx}`,
      text,
      done: false,
    }));

    const newTask: GroupTaskItem = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      targetGoal: targetGoal.trim() || title.trim(),
      assigneeName: assignee.name,
      assigneeAvatar: assignee.avatar,
      assigneeRole: `${assignee.roleLabel} / ${assignee.department}`,
      dueDate,
      gatheringPoint,
      status: 'accepted',
      priority,
      steps: stepItems,
      associatedDocIds,
      locationWindow: squad ? `${squad.startTime} - ${squad.endTime}` : '工作日 09:00 - 18:00',
      activityLogs: [
        {
          id: `log-${Date.now()}`,
          time: '刚刚',
          text: `由 Alex Mercer 创建并指派给 ${assignee.name}`,
          user: 'Alex Mercer',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        },
      ],
      squadId: squad?.id,
      squadName: squad?.name,
    };

    onTaskCreated(newTask);
    showToast(`任务「${newTask.title}」创建成功，已同步至负责人员 ✅`);
    onClose();
  };

  const demoDocOptions = [
    { id: 'doc-1', title: '《城市探索组协作手册》' },
    { id: 'doc-privacy-rule', title: '《小组定位与隐私规则》' },
    { id: 'doc-task-list', title: '《本周行动任务清单》' },
    { id: 'doc-2', title: '《9 月活动复盘》' },
    { id: 'doc-3', title: '《兰州城市路线知识库》' },
    { id: 'doc-5', title: '《项目素材.zip》' },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="create-task-modal"
        className="relative w-full max-w-xl bg-white rounded-md border border-[#E4E6EB] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-14 px-4 bg-white border-b border-[#E4E6EB] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1877F2]">
              <CheckSquare size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">创建小组协作任务</h2>
              <p className="text-[11px] text-gray-500">
                分配责任人、关联行动步骤与小队定位窗口
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            aria-label="关闭创建任务弹窗"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">任务标题 *</label>
            <input
              type="text"
              placeholder="例如：白塔山至中山桥历史步道打卡点坐标校核"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#E4E6EB] rounded-sm focus:outline-none focus:border-[#1877F2] bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">核心交付目标</label>
            <input
              type="text"
              placeholder="明确交付物，例如：完成7个历史遗迹打卡点的RTK差分定位坐标标定"
              value={targetGoal}
              onChange={(e) => setTargetGoal(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#E4E6EB] rounded-sm focus:outline-none focus:border-[#1877F2] bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">负责人 *</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E4E6EB] rounded-sm focus:outline-none focus:border-[#1877F2] bg-white cursor-pointer"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.roleLabel})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">所属小队</label>
              <select
                value={squadId}
                onChange={(e) => setSquadId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E4E6EB] rounded-sm focus:outline-none focus:border-[#1877F2] bg-white cursor-pointer"
              >
                <option value="">独立任务 (全组通用)</option>
                {squads.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.startTime}-{s.endTime})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">截止时间</label>
              <input
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E4E6EB] rounded-sm focus:outline-none focus:border-[#1877F2] bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">优先级</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')}
                className="w-full px-3 py-2 text-xs border border-[#E4E6EB] rounded-sm focus:outline-none focus:border-[#1877F2] bg-white cursor-pointer"
              >
                <option value="high">高优先级 (🔥 关键路径)</option>
                <option value="medium">中优先级 (⚡ 正常推进)</option>
                <option value="low">低优先级 (☕ 常规排期)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">集合点 / 地理坐标</label>
            <input
              type="text"
              value={gatheringPoint}
              onChange={(e) => setGatheringPoint(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#E4E6EB] rounded-sm focus:outline-none focus:border-[#1877F2] bg-white"
            />
          </div>

          {/* Checklist Steps */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              执行步骤清单 ({steps.length} 项)
            </label>
            <div className="space-y-1.5 mb-2">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-[#F8FAFC] border border-[#E4E6EB] rounded-sm text-xs"
                >
                  <span className="text-gray-800 flex-1 min-w-0 pr-2 truncate">
                    {idx + 1}. {step}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveStep(idx)}
                    className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-1.5">
              <input
                type="text"
                placeholder="添加新步骤..."
                value={newStepText}
                onChange={(e) => setNewStepText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddStep();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs border border-[#E4E6EB] rounded-sm focus:outline-none focus:border-[#1877F2] bg-white"
              />
              <button
                type="button"
                onClick={handleAddStep}
                className="px-3 py-1.5 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-gray-800 text-xs font-bold rounded-sm border border-[#E4E6EB] flex items-center space-x-1 cursor-pointer"
              >
                <Plus size={13} />
                <span>添加</span>
              </button>
            </div>
          </div>

          {/* Associated Documents */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">关联任务文档</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {demoDocOptions.map((doc) => {
                const isSelected = associatedDocIds.includes(doc.id);
                return (
                  <div
                    key={doc.id}
                    onClick={() => toggleDoc(doc.id)}
                    className={`p-2 rounded-sm border cursor-pointer flex items-center justify-between text-xs transition-all ${
                      isSelected
                        ? 'border-[#1877F2] bg-blue-50/40 text-[#1877F2] font-bold'
                        : 'border-[#E4E6EB] text-gray-700 bg-white hover:border-gray-400'
                    }`}
                  >
                    <span className="truncate">{doc.title}</span>
                    {isSelected && <CheckCircle2 size={13} className="text-[#1877F2] shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end space-x-2 border-t border-[#E4E6EB]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100 rounded-sm border border-[#E4E6EB] transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-[#1877F2] hover:bg-[#166FE5] active:scale-[0.98] rounded-sm border border-[#1877F2] shadow-2xs transition-all cursor-pointer flex items-center space-x-1"
            >
              <CheckSquare size={13} />
              <span>确认创建并下发任务</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
