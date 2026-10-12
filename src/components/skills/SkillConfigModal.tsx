import React, { useState } from 'react';
import { X, Settings, Check, Save, RotateCcw, Sliders, AlertCircle } from 'lucide-react';
import { SkillItem, SkillConfigItem } from '../../data/skillsData';

interface SkillConfigModalProps {
  skill: SkillItem;
  onClose: () => void;
  onSaveConfig: (skillId: string, updatedConfig: SkillItem['config']) => void;
  showToast: (msg: string) => void;
}

export const SkillConfigModal: React.FC<SkillConfigModalProps> = ({
  skill,
  onClose,
  onSaveConfig,
  showToast,
}) => {
  const [currentConfig, setCurrentConfig] = useState<Record<string, SkillConfigItem>>(
    JSON.parse(JSON.stringify(skill.config))
  );

  const handleChange = (key: string, val: any) => {
    setCurrentConfig((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        value: val,
      },
    }));
  };

  const handleSave = () => {
    onSaveConfig(skill.id, currentConfig);
    showToast(`✅ 已成功保存【${skill.displayName}】的参数配置！`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in font-sans">
      <div className="bg-white text-[#050505] border border-[#E4E6EB] w-full max-w-lg rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="bg-white px-4 py-3.5 border-b border-[#E4E6EB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#E7F3FF] text-[#1877F2] flex items-center justify-center">
              <Sliders size={16} />
            </div>
            <h3 className="text-sm font-bold text-[#050505]">
              配置技能参数: <strong>{skill.displayName}</strong>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#65676B] hover:text-[#050505] rounded-full hover:bg-[#F0F2F5] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Config Form Fields */}
        <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto text-xs bg-[#F0F2F5]/30">
          {Object.entries(currentConfig).map(([key, item]: [string, SkillConfigItem]) => (
            <div key={key} className="p-3.5 bg-white border border-[#E4E6EB] rounded-xl space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="font-bold text-[#050505]">{item.label}</label>
                <span className="text-[10px] text-[#65676B] bg-[#F0F2F5] px-2 py-0.5 rounded-full border border-[#E4E6EB]">
                  {key} ({item.type})
                </span>
              </div>

              {item.description && (
                <p className="text-[11px] text-[#65676B] leading-relaxed">{item.description}</p>
              )}

              {item.type === 'boolean' && (
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => handleChange(key, !item.value)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      item.value ? 'bg-[#1877F2]' : 'bg-[#CED0D4]'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-xs ${
                        item.value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-xs font-semibold text-[#050505]">
                    {item.value ? '已启用 (TRUE)' : '已停用 (FALSE)'}
                  </span>
                </div>
              )}

              {item.type === 'number' && (
                <input
                  type="number"
                  value={item.value}
                  onChange={(e) => handleChange(key, Number(e.target.value))}
                  className="w-full p-2 bg-[#F0F2F5] border border-transparent focus:border-[#1877F2] focus:bg-white rounded-lg text-xs text-[#050505] focus:outline-none transition-all"
                />
              )}

              {item.type === 'string' && (
                <input
                  type="text"
                  value={item.value}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full p-2 bg-[#F0F2F5] border border-transparent focus:border-[#1877F2] focus:bg-white rounded-lg text-xs text-[#050505] focus:outline-none transition-all"
                />
              )}

              {item.type === 'select' && item.options && (
                <select
                  value={item.value}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full p-2 bg-[#F0F2F5] border border-transparent focus:border-[#1877F2] focus:bg-white rounded-lg text-xs text-[#050505] focus:outline-none transition-all cursor-pointer"
                >
                  {item.options.map((opt) => (
                    <option key={opt} value={opt} className="bg-white text-[#050505]">
                      {opt}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-white px-4 py-3 border-t border-[#E4E6EB] flex items-center justify-end gap-2 text-xs">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] font-semibold rounded-lg cursor-pointer transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <Save size={13} />
            <span>保存配置</span>
          </button>
        </div>

      </div>
    </div>
  );
};
