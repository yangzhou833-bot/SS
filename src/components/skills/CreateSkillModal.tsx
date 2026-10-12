import React, { useState } from 'react';
import { X, Plus, Sparkles, Code, FileText, Check, Layers, Tag } from 'lucide-react';
import { SkillItem } from '../../data/skillsData';

interface CreateSkillModalProps {
  onClose: () => void;
  onPublish: (newSkill: SkillItem) => void;
  showToast: (msg: string) => void;
}

export const CreateSkillModal: React.FC<CreateSkillModalProps> = ({
  onClose,
  onPublish,
  showToast,
}) => {
  const [repoName, setRepoName] = useState('user-labs/my-custom-skill');
  const [displayName, setDisplayName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SkillItem['category']>('AI 智能体');
  const [language, setLanguage] = useState<SkillItem['language']>('TypeScript');
  const [tags, setTags] = useState('custom-agent, automation, spatial');
  const [capability1, setCapability1] = useState('自定义事件监听与自动化响应');
  const [capability2, setCapability2] = useState('支持流式多模态推理与空间坐标注入');

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      showToast('⚠️ 请填写技能名称！');
      return;
    }

    const splittedRepo = repoName.split('/');
    const owner = splittedRepo[0] || 'user-labs';
    const rawName = splittedRepo[1] || displayName.toLowerCase().replace(/\s+/g, '-');

    const newSkill: SkillItem = {
      id: `skill-custom-${Date.now()}`,
      repoName: `${owner}/${rawName}`,
      name: rawName,
      author: owner,
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      displayName: displayName.trim(),
      tagline: tagline.trim() || '用户自定义空间技能',
      description: description.trim() || '基于 Stellar 开放协议构建的自定义技能模块。',
      version: 'v1.0.0',
      stars: 1,
      forks: 0,
      watchers: 1,
      downloads: 1,
      language,
      languageColor: language === 'TypeScript' ? '#3178C6' : language === 'Python' ? '#3572A5' : '#DEA584',
      license: 'MIT',
      category,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      isInstalled: true,
      isEnabled: true,
      isVerified: false,
      isFeatured: false,
      updatedAt: '刚刚',
      iconName: 'cpu',
      mastery: {
        level: 1,
        maxLevel: 5,
        exp: 15,
        maxExp: 100,
        percentage: 15,
        tierTitle: '见习学者',
      },
      usageGuide: '用户自研扩展技能模块，已挂载至通用课程任务管线。',
      courseTasks: ['个性化课程大作业实践', '学术智能体协同开发'],
      capabilities: [capability1, capability2].filter(Boolean),
      config: {
        autoRunOnStartup: {
          label: '启动时自动初始化',
          type: 'boolean',
          value: true,
          description: '系统进入该星球或地图区域时自动装载技能钩子',
        },
      },
      readme: `# 🌟 ${displayName} (@${owner}/${rawName})

> 用户在 Stellar Skills Registry 中最新发布的自定义技能。

---

## ⚡ 核心能力
- ${capability1}
- ${capability2}

## 🚀 调用方式
\`\`\`bash
npx stellar-skills install @${owner}/${rawName}
\`\`\`
`,
    };

    onPublish(newSkill);
    showToast(`🎉 技能【${newSkill.displayName}】已成功发布并安装！`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in font-sans">
      <div className="bg-white text-[#050505] border border-[#E4E6EB] w-full max-w-xl rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="bg-white px-4 py-3.5 border-b border-[#E4E6EB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#E7F3FF] text-[#1877F2] flex items-center justify-center">
              <Plus size={16} />
            </div>
            <h3 className="text-sm font-bold text-[#050505]">
              新建并发布技能仓库 (Publish New Skill)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#65676B] hover:text-[#050505] rounded-full hover:bg-[#F0F2F5] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handlePublish} className="p-4 sm:p-5 space-y-3.5 max-h-[75vh] overflow-y-auto text-xs bg-[#F0F2F5]/20">
          <div>
            <label className="block text-xs font-bold text-[#050505] mb-1">
              仓库全名 (Repository Namespace)
            </label>
            <input
              type="text"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              className="w-full p-2 bg-[#F0F2F5] border border-transparent focus:border-[#1877F2] focus:bg-white rounded-lg text-xs font-mono text-[#050505] focus:outline-none transition-all"
              placeholder="e.g. your-name/skill-name"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#050505] mb-1">
                技能展示名称 (Display Name)
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full p-2 bg-[#F0F2F5] border border-transparent focus:border-[#1877F2] focus:bg-white rounded-lg text-xs text-[#050505] focus:outline-none transition-all"
                placeholder="e.g. 咖啡馆空间气味探针"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#050505] mb-1">所属分类 (Category)</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-2 bg-[#F0F2F5] border border-transparent focus:border-[#1877F2] focus:bg-white rounded-lg text-xs text-[#050505] focus:outline-none transition-all cursor-pointer"
              >
                <option value="AI 智能体">AI 智能体</option>
                <option value="空间与地图">空间与地图</option>
                <option value="学术与效率">学术与效率</option>
                <option value="视听与沉浸">视听与沉浸</option>
                <option value="安全与应急">安全与应急</option>
                <option value="自动化工具">自动化工具</option>
                <option value="社交与协作">社交与协作</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#050505] mb-1">
              一句话简介 (Tagline)
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full p-2 bg-[#F0F2F5] border border-transparent focus:border-[#1877F2] focus:bg-white rounded-lg text-xs text-[#050505] focus:outline-none transition-all"
              placeholder="描述技能解决的核心场景与价值..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#050505] mb-1">
              详细描述 (Description)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full p-2 bg-[#F0F2F5] border border-transparent focus:border-[#1877F2] focus:bg-white rounded-lg text-xs text-[#050505] focus:outline-none transition-all resize-none"
              placeholder="详细阐述技能的算法原理与使用条件..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#050505] mb-1">编程语言 / 运行时</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full p-2 bg-[#F0F2F5] border border-transparent focus:border-[#1877F2] focus:bg-white rounded-lg text-xs text-[#050505] focus:outline-none transition-all cursor-pointer"
              >
                <option value="TypeScript">TypeScript (Native)</option>
                <option value="Python">Python 3.11</option>
                <option value="Rust">Rust (WASM)</option>
                <option value="WebAssembly">WebAssembly</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#050505] mb-1">Tags (逗号分隔)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full p-2 bg-[#F0F2F5] border border-transparent focus:border-[#1877F2] focus:bg-white rounded-lg text-xs text-[#050505] focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#E4E6EB]">
            <label className="block text-xs font-bold text-[#050505]">核心 Capabilities 钩子</label>
            <input
              type="text"
              value={capability1}
              onChange={(e) => setCapability1(e.target.value)}
              className="w-full p-2 bg-[#F0F2F5] border border-transparent focus:border-[#1877F2] focus:bg-white rounded-lg text-xs text-[#050505]"
              placeholder="能力 1..."
            />
            <input
              type="text"
              value={capability2}
              onChange={(e) => setCapability2(e.target.value)}
              className="w-full p-2 bg-[#F0F2F5] border border-transparent focus:border-[#1877F2] focus:bg-white rounded-lg text-xs text-[#050505]"
              placeholder="能力 2..."
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-[#E4E6EB] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] font-semibold rounded-lg"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              <Sparkles size={14} />
              <span>发布到 Skills 仓库</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
