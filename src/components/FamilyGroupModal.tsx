import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, X, Plus, UserPlus, Trash2, Check, UserCheck, Shield } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';
import { haptics } from '../utils/haptics';

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  avatar?: string;
}

export interface FamilyGroupData {
  isSet: boolean;
  name: string;
  avatarUrl: string;
  members: FamilyMember[];
}

export const PRESET_FAMILY_AVATARS = [
  'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1609234656388-0ff363383899?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=200',
];

interface FamilyGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyGroup: FamilyGroupData | null;
  onSaveFamilyGroup: (data: FamilyGroupData) => void;
  onRemoveFamilyGroup: () => void;
}

export const FamilyGroupModal: React.FC<FamilyGroupModalProps> = ({
  isOpen,
  onClose,
  familyGroup,
  onSaveFamilyGroup,
  onRemoveFamilyGroup,
}) => {
  const [familyForm, setFamilyForm] = useState<{
    name: string;
    avatarUrl: string;
    members: FamilyMember[];
  }>({
    name: '温馨幸福家',
    avatarUrl: PRESET_FAMILY_AVATARS[0],
    members: [
      { id: 'm1', name: 'Alexia (我)', relation: '户主' },
      { id: 'm2', name: '老张', relation: '爸爸' },
      { id: 'm3', name: '秀兰', relation: '妈妈' },
    ],
  });
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRelation, setNewMemberRelation] = useState('伴侣');

  useEffect(() => {
    if (familyGroup && familyGroup.isSet) {
      setFamilyForm({
        name: familyGroup.name,
        avatarUrl: familyGroup.avatarUrl || PRESET_FAMILY_AVATARS[0],
        members: familyGroup.members || [],
      });
    }
  }, [familyGroup, isOpen]);

  if (!isOpen) return null;

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    haptics.trigger('light');
    soundEffects.playTapSound();
    setFamilyForm((prev) => ({
      ...prev,
      members: [
        ...prev.members,
        {
          id: `m-${Date.now()}`,
          name: newMemberName.trim(),
          relation: newMemberRelation,
        },
      ],
    }));
    setNewMemberName('');
  };

  const handleRemoveMember = (idx: number) => {
    haptics.trigger('selection');
    setFamilyForm((prev) => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== idx),
    }));
  };

  const handleSave = () => {
    if (!familyForm.name.trim()) return;
    haptics.trigger('success');
    soundEffects.playSuccessSound();
    onSaveFamilyGroup({
      isSet: true,
      name: familyForm.name.trim(),
      avatarUrl: familyForm.avatarUrl || PRESET_FAMILY_AVATARS[0],
      members: familyForm.members,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[920] flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
      <div className="w-full max-w-sm bg-white rounded-md shadow-lg overflow-hidden flex flex-col border border-[#E4E6EB] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#1877F2] p-4 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-md bg-white/20 hover:bg-white/30 text-white cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-md bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <Home size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">
                {familyGroup?.isSet ? '家庭小组信息与设置' : '创建家庭小组'}
              </h3>
              <p className="text-[11px] text-blue-100 font-normal">
                绑定家人同城运动与安全保护路线
              </p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Avatar selection */}
          <div>
            <label className="text-xs font-bold text-[#050505] block mb-2">
              选择家庭社群头像
            </label>
            <div className="flex space-x-3 justify-center py-1">
              {PRESET_FAMILY_AVATARS.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt="Family Avatar Preset"
                  onClick={() => {
                    haptics.trigger('selection');
                    setFamilyForm({ ...familyForm, avatarUrl: url });
                  }}
                  className={`w-11 h-11 rounded-md object-cover cursor-pointer transition-all duration-200 ${
                    familyForm.avatarUrl === url
                      ? 'ring-2 ring-[#1877F2] ring-offset-2 scale-105 shadow-xs'
                      : 'border border-[#E4E6EB] opacity-70 hover:opacity-100 hover:scale-102'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Name input */}
          <div>
            <label className="text-xs font-bold text-[#050505] block mb-1">
              家庭小组名称
            </label>
            <input
              type="text"
              value={familyForm.name}
              onChange={(e) => setFamilyForm({ ...familyForm, name: e.target.value })}
              placeholder="例如：温馨幸福家、张氏户外小组"
              className="w-full text-xs p-2.5 rounded-md border border-[#E4E6EB] bg-[#F0F2F5] focus:bg-white focus:border-[#1877F2] focus:ring-1 focus:ring-[#1877F2] outline-none font-medium text-[#050505] transition-all"
            />
          </div>

          {/* Member list & add member */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#050505] flex items-center space-x-1">
                <span>家庭成员</span>
                <span className="text-[#65676B] font-normal text-[11px]">({familyForm.members.length}人)</span>
              </label>
              <span className="text-[10px] text-[#1877F2] font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-100 flex items-center space-x-1">
                <Shield size={10} />
                <span>优先安全联络人</span>
              </span>
            </div>

            {/* Animated Interactive Family Member Cards */}
            <div className="space-y-1.5 mb-3">
              <AnimatePresence initial={false}>
                {familyForm.members.map((m, idx) => (
                  <motion.div
                    key={m.id || idx}
                    layout
                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -12, scale: 0.92, transition: { duration: 0.15 } }}
                    transition={{ type: 'spring', damping: 24, stiffness: 350 }}
                    whileHover={{ scale: 1.01 }}
                    className="group flex items-center justify-between p-2.5 rounded-md bg-white border border-[#E4E6EB] hover:border-[#1877F2] hover:bg-[#F0F2F5]/50 hover:shadow-2xs transition-all duration-200"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1877F2] font-bold text-xs shrink-0 group-hover:bg-[#1877F2] group-hover:text-white group-hover:border-[#1877F2] transition-colors">
                        {m.relation.slice(0, 1)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-bold text-[#050505] truncate">{m.name}</span>
                          <span className="text-[10px] font-medium text-[#65676B] bg-[#F0F2F5] group-hover:bg-white px-1.5 py-0.2 rounded border border-[#E4E6EB] transition-colors">
                            {m.relation}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveMember(idx)}
                      className="p-1 rounded-md text-[#65676B] hover:text-rose-600 hover:bg-rose-50 opacity-70 group-hover:opacity-100 transition-all cursor-pointer"
                      title="移除此成员"
                    >
                      <Trash2 size={13} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {familyForm.members.length === 0 && (
                <div className="py-4 text-center text-xs text-[#65676B] border border-dashed border-[#E4E6EB] rounded-md bg-[#F0F2F5]/40">
                  暂无家庭成员，请在下方添加
                </div>
              )}
            </div>

            {/* Add Member Controls */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMember();
                  }
                }}
                placeholder="成员姓名/昵称"
                className="flex-1 text-xs p-2 rounded-md border border-[#E4E6EB] bg-[#F0F2F5] focus:bg-white focus:border-[#1877F2] outline-none font-medium text-[#050505] transition-all"
              />
              <select
                value={newMemberRelation}
                onChange={(e) => setNewMemberRelation(e.target.value)}
                className="text-xs p-2 rounded-md border border-[#E4E6EB] bg-[#F0F2F5] focus:bg-white focus:border-[#1877F2] outline-none font-medium cursor-pointer transition-all text-[#050505]"
              >
                <option value="伴侣">伴侣</option>
                <option value="爸爸">爸爸</option>
                <option value="妈妈">妈妈</option>
                <option value="孩子">孩子</option>
                <option value="长辈">长辈</option>
                <option value="其他">其他</option>
              </select>
              <button
                type="button"
                onClick={handleAddMember}
                className="px-3.5 py-1.5 bg-[#1877F2] hover:bg-[#166fe5] active:scale-95 text-white rounded-md text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 shadow-2xs"
              >
                <Plus size={13} />
                <span>添加</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-3 bg-[#F0F2F5] border-t border-[#E4E6EB] flex items-center justify-between">
          {familyGroup?.isSet ? (
            <button
              type="button"
              onClick={() => {
                haptics.trigger('warning');
                onRemoveFamilyGroup();
                onClose();
              }}
              className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-md border border-transparent hover:border-rose-200 transition-all flex items-center space-x-1 cursor-pointer"
            >
              <Trash2 size={13} />
              <span>解散/移除</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-[#65676B] hover:bg-[#E4E6EB] rounded-md transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-bold text-white bg-[#1877F2] hover:bg-[#166fe5] active:scale-95 rounded-md shadow-2xs transition-all cursor-pointer flex items-center space-x-1"
            >
              <Check size={14} />
              <span>保存配置</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
