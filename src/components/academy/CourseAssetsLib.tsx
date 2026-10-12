import React, { useState } from 'react';
import {
  FileText,
  Search,
  Upload,
  Download,
  Plus,
  FolderArchive,
  Eye,
  CheckCircle,
  Clock,
  Filter,
  Share2,
  FileSpreadsheet,
  FileCheck,
  AlertCircle
} from 'lucide-react';

interface AssetFile {
  id: string;
  title: string;
  chapter: string;
  type: 'courseware' | 'assignment' | 'exam' | 'notice';
  typeName: string;
  uploaderName: string;
  uploaderRole: '领航员' | '星航者' | '助教';
  size: string;
  uploadTime: string;
  downloadsCount: number;
  isAudited: boolean;
}

const INITIAL_ASSETS: AssetFile[] = [
  {
    id: 'f-1',
    title: '第一章：微服务架构高并发与负载均衡算法.ppt',
    chapter: '第1章 系统架构基础',
    type: 'courseware',
    typeName: '课件',
    uploaderName: '李建华 教授',
    uploaderRole: '领航员',
    size: '14.2 MB',
    uploadTime: '2天前',
    downloadsCount: 142,
    isAudited: true,
  },
  {
    id: 'f-2',
    title: '第一章课后大作业要求与评测用例.docx',
    chapter: '第1章 系统架构基础',
    type: 'assignment',
    typeName: '作业',
    uploaderName: '李建华 教授',
    uploaderRole: '领航员',
    size: '1.8 MB',
    uploadTime: '2天前',
    downloadsCount: 96,
    isAudited: true,
  },
  {
    id: 'f-3',
    title: '高并发 Raft 一致性算法复现参考论文.pdf',
    chapter: '第1章 系统架构基础',
    type: 'courseware',
    typeName: '拓展参考',
    uploaderName: 'Alexia (星航者)',
    uploaderRole: '星航者',
    size: '3.4 MB',
    uploadTime: '昨日',
    downloadsCount: 38,
    isAudited: true,
  },
  {
    id: 'f-4',
    title: '第二章：分布式事务与分布式锁设计原理.pdf',
    chapter: '第2章 分布式事务',
    type: 'courseware',
    typeName: '课件',
    uploaderName: '李建华 教授',
    uploaderRole: '领航员',
    size: '8.6 MB',
    uploadTime: '今日',
    downloadsCount: 65,
    isAudited: true,
  },
  {
    id: 'f-5',
    title: '2024-2025学年春季《高等软件工程》期中模拟试卷及参考答案.pdf',
    chapter: '试卷与模拟题',
    type: 'exam',
    typeName: '试卷',
    uploaderName: '李建华 教授',
    uploaderRole: '领航员',
    size: '4.1 MB',
    uploadTime: '5天前',
    downloadsCount: 180,
    isAudited: true,
  },
  {
    id: 'f-6',
    title: '第6周星期五微服务实践课调课通知.docx',
    chapter: '教务通知',
    type: 'notice',
    typeName: '通知',
    uploaderName: '星区守护者 (辅导员)',
    uploaderRole: '领航员',
    size: '520 KB',
    uploadTime: '刚刚',
    downloadsCount: 92,
    isAudited: true,
  },
];

interface CourseAssetsLibProps {
  showToast: (msg: string) => void;
}

export const CourseAssetsLib: React.FC<CourseAssetsLibProps> = ({ showToast }) => {
  const [assets, setAssets] = useState<AssetFile[]>(INITIAL_ASSETS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newChapter, setNewChapter] = useState('第1章 系统架构基础');

  const filteredAssets = assets.filter((a) => {
    const matchSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.chapter.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = selectedType === 'all' || a.type === selectedType;
    return matchSearch && matchType;
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newFile: AssetFile = {
      id: `f-${Date.now()}`,
      title: newTitle.trim().endsWith('.pdf') ? newTitle.trim() : `${newTitle.trim()}.pdf`,
      chapter: newChapter,
      type: 'courseware',
      typeName: '课件资料',
      uploaderName: '我 (星航者)',
      uploaderRole: '星航者',
      size: '2.5 MB',
      uploadTime: '刚刚',
      downloadsCount: 1,
      isAudited: true,
    };
    setAssets([newFile, ...assets]);
    setNewTitle('');
    setIsUploading(false);
    showToast('✨ 资料上传成功！已自动归入对应章节课程资产库 📂');
  };

  return (
    <div className="space-y-3.5 max-w-md mx-auto">
      {/* Top Search & Actions */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索课件、作业、试卷、考点笔记..."
            className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-full text-xs text-white placeholder:text-gray-400 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <button
          onClick={() => setIsUploading(true)}
          className="px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-full text-xs font-bold transition-all flex items-center gap-1 shadow cursor-pointer active:scale-95 shrink-0"
        >
          <Upload size={12} />
          <span>上传</span>
        </button>
      </div>

      {/* Type Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
        {[
          { key: 'all', label: '全部资产' },
          { key: 'courseware', label: '课件 PPT' },
          { key: 'assignment', label: '大作业' },
          { key: 'exam', label: '试卷模拟题' },
          { key: 'notice', label: '教务通知' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setSelectedType(t.key)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
              selectedType === t.key
                ? 'bg-cyan-500 text-white shadow'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Upload Modal */}
      {isUploading && (
        <form
          onSubmit={handleUpload}
          className="p-3.5 bg-black/60 border border-cyan-400/50 rounded-2xl space-y-2.5 text-xs animate-in fade-in"
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
            <span className="font-bold text-white flex items-center gap-1">
              <Upload size={13} className="text-cyan-400" />
              <span>上传课程资产资料</span>
            </span>
            <button
              type="button"
              onClick={() => setIsUploading(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div>
            <label className="text-gray-300 block mb-1">文件名称</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="例如：分布式系统 CAP 定理深入解析.pdf"
              className="w-full p-2 bg-white/10 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="text-gray-300 block mb-1">归属章节</label>
            <select
              value={newChapter}
              onChange={(e) => setNewChapter(e.target.value)}
              className="w-full p-2 bg-[#121528] border border-white/10 rounded-lg text-white focus:outline-none"
            >
              <option value="第1章 系统架构基础">第1章 系统架构基础</option>
              <option value="第2章 分布式事务">第2章 分布式事务</option>
              <option value="试卷与模拟题">试卷与模拟题</option>
              <option value="期末大作业设计">期末大作业设计</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsUploading(false)}
              className="px-3 py-1 text-gray-400 hover:text-white"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-cyan-500 text-white font-bold rounded-lg cursor-pointer"
            >
              确认上传
            </button>
          </div>
        </form>
      )}

      {/* Asset Files List */}
      <div className="space-y-2">
        {filteredAssets.map((f) => (
          <div
            key={f.id}
            className="p-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md space-y-2 text-xs hover:border-cyan-400/40 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5">
                  <FileText size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs leading-snug">{f.title}</h4>
                  <div className="flex items-center gap-2 mt-1 text-[10.5px] text-gray-400">
                    <span className="text-cyan-300 font-semibold">{f.chapter}</span>
                    <span>·</span>
                    <span>{f.size}</span>
                    <span>·</span>
                    <span>{f.uploaderName}</span>
                  </div>
                </div>
              </div>

              <span className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-full font-mono shrink-0">
                {f.typeName}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1.5 border-t border-white/5 text-[11px] text-gray-400">
              <span>{f.uploadTime} 上传 · {f.downloadsCount} 次下载</span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => showToast(`📖 正在在线预览文档【${f.title}】`)}
                  className="hover:text-white flex items-center gap-0.5 cursor-pointer"
                >
                  <Eye size={12} />
                  <span>预览</span>
                </button>
                <button
                  onClick={() => showToast(`📥 正在下载文件【${f.title}】...`)}
                  className="text-cyan-300 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <Download size={12} />
                  <span>下载</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* End of Term Archiving */}
      <div className="p-3.5 bg-gradient-to-r from-blue-950/60 to-purple-950/60 border border-white/10 rounded-2xl text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderArchive size={16} className="text-amber-400" />
          <div>
            <span className="font-bold text-white block">期末课程全景资产包一键归档</span>
            <span className="text-[10.5px] text-gray-400">包含全部 32 座灯塔课件、考勤大盘与成绩单</span>
          </div>
        </div>

        <button
          onClick={() => showToast('📦 正在打包生成 2025-2026 春季学期《高等软件工程》期末归档 ZIP 文件...')}
          className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl font-bold transition-all text-[11px] cursor-pointer"
        >
          导出归档包
        </button>
      </div>
    </div>
  );
};
