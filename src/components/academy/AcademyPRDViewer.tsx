import React, { useState } from 'react';
import {
  FileText,
  Download,
  Copy,
  Check,
  BookOpen,
  Search,
  ChevronRight,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  Users,
  Compass,
  Award,
  Globe,
  Radio,
  FileCode,
  CheckCircle2
} from 'lucide-react';

interface AcademyPRDViewerProps {
  showToast: (msg: string) => void;
}

export const AcademyPRDViewer: React.FC<AcademyPRDViewerProps> = ({ showToast }) => {
  const [activeSection, setActiveSection] = useState<string>('sec-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const sections = [
    { id: 'sec-meta', title: '文档版本与元数据', num: '0.0' },
    { id: 'sec-1', title: '1. 产品概述 (定位/目标/Slogan)', num: '1.0' },
    { id: 'sec-2', title: '2. 用户与角色 (角色体系/权限矩阵)', num: '2.0' },
    { id: 'sec-3', title: '3. 总体架构：主宇宙 + 星球容器', num: '3.0' },
    { id: 'sec-4', title: '4. 身份与账号体系 (激活/切换)', num: '4.0' },
    { id: 'sec-5', title: '5. 核心功能模块 (班级库/排课/签到/资产)', num: '5.0' },
    { id: 'sec-6', title: '6. 页面与交互设计 (Facebook规范/线框图)', num: '6.0' },
    { id: 'sec-7', title: '7. 数据模型 (核心 8 大表结构)', num: '7.0' },
    { id: 'sec-8', title: '8. 异常与边界 (定位/请假/调课/安全)', num: '8.0' },
    { id: 'sec-9', title: '9. 成功指标 (KPI 目标矩阵)', num: '9.0' },
    { id: 'sec-10', title: '10. 附录：术语表', num: '10.0' },
    { id: 'sec-11', title: '11. 总结', num: '11.0' },
  ];

  const handleCopyMarkdown = async () => {
    try {
      const res = await fetch('/Stella_Academy_PRD_V4.0.md');
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast('📋 已成功复制 Stella 学海星球 PRD V4.0 Markdown 全文！');
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      showToast('❌ 复制失败，请尝试直接下载文件');
    }
  };

  const handleDownloadDocx = () => {
    const link = document.createElement('a');
    link.href = '/Stella_Academy_PRD_V4.0.docx';
    link.download = 'Stella_Academy_Star_Atlas_PRD_V4.0.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📥 正在下载 Word 格式 PRD 需求文档 (.docx)！');
  };

  const handleDownloadMd = () => {
    const link = document.createElement('a');
    link.href = '/Stella_Academy_PRD_V4.0.md';
    link.download = 'Stella_Academy_Star_Atlas_PRD_V4.0.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📥 正在下载 Markdown 格式 PRD 需求文档 (.md)！');
  };

  return (
    <div className="flex flex-col bg-[#FFFFFF] text-[#050505] font-sans rounded-2xl overflow-hidden border border-[#E4E6EB] shadow-lg">
      {/* Top PRD Toolbar */}
      <div className="bg-[#F0F2F5] px-4 py-3 border-b border-[#E4E6EB] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1877F2] text-white flex items-center justify-center font-black text-sm">
            <BookOpen size={18} />
          </div>
          <div>
            <h2 className="text-sm font-black text-[#050505] flex items-center gap-1.5">
              <span>Stella 学海星球（Academy Star Atlas）PRD</span>
              <span className="text-[10px] bg-[#1877F2]/10 text-[#1877F2] px-2 py-0.5 rounded font-bold">
                V4.0 最终整合版
              </span>
            </h2>
            <p className="text-[11px] text-[#65676B]">大学课程与学业管理系统 · 官方产品需求文档</p>
          </div>
        </div>

        {/* Download and Export Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyMarkdown}
            className="px-2.5 py-1.5 bg-[#FFFFFF] hover:bg-[#E4E6EB] border border-[#CCD0D5] text-[#050505] rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95"
            title="复制 Markdown 全文"
          >
            {copied ? <Check size={13} className="text-[#31A24C]" /> : <Copy size={13} />}
            <span>{copied ? '已复制' : '复制全文'}</span>
          </button>

          <button
            onClick={handleDownloadMd}
            className="px-2.5 py-1.5 bg-[#FFFFFF] hover:bg-[#E4E6EB] border border-[#CCD0D5] text-[#050505] rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95"
            title="下载 Markdown (.md)"
          >
            <FileCode size={13} className="text-[#1877F2]" />
            <span>下载 .md</span>
          </button>

          <button
            onClick={handleDownloadDocx}
            className="px-3 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-[#FFFFFF] rounded text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
            title="导出 Word 文档 (.docx)"
          >
            <Download size={13} />
            <span>导出 Word (.docx)</span>
          </button>
        </div>
      </div>

      {/* Chapter Quick Filter */}
      <div className="bg-[#FFFFFF] px-3 py-2 border-b border-[#E4E6EB] flex items-center gap-1 overflow-x-auto no-scrollbar text-xs">
        {sections.map((sec) => (
          <button
            key={sec.id}
            onClick={() => {
              setActiveSection(sec.id);
              const el = document.getElementById(sec.id);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className={`px-2.5 py-1 rounded text-xs whitespace-nowrap transition-colors cursor-pointer font-semibold ${
              activeSection === sec.id
                ? 'bg-[#1877F2] text-white'
                : 'text-[#65676B] hover:bg-[#F0F2F5] hover:text-[#050505]'
            }`}
          >
            {sec.title}
          </button>
        ))}
      </div>

      {/* Main Document Content Body (Following Facebook Design Language: Flat, White, 1px Dividers, No Nested Cards) */}
      <div className="p-4 sm:p-6 space-y-6 max-h-[70vh] overflow-y-auto leading-relaxed text-sm">
        
        {/* Document Meta */}
        <div id="sec-meta" className="pb-4 border-b border-[#E4E6EB] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#65676B]">
            <span>文档编号：ST-PRD-ACADEMY-2026</span>
            <span>更新时间：2026-08-19</span>
          </div>
          <h1 className="text-xl font-black text-[#050505]">
            Stella 学海星球（Academy Star Atlas）
          </h1>
          <p className="text-xs font-bold text-[#1877F2]">大学课程与学业管理系统 · 产品需求文档（PRD）</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
            <div className="p-2 bg-[#F0F2F5] rounded">
              <span className="text-[#65676B] block text-[11px]">文档版本</span>
              <span className="font-bold text-[#050505]">V4.0</span>
            </div>
            <div className="p-2 bg-[#F0F2F5] rounded">
              <span className="text-[#65676B] block text-[11px]">修改日期</span>
              <span className="font-bold text-[#050505]">2026-08-19</span>
            </div>
            <div className="p-2 bg-[#F0F2F5] rounded">
              <span className="text-[#65676B] block text-[11px]">撰写人</span>
              <span className="font-bold text-[#050505]">Stella 产品组</span>
            </div>
            <div className="p-2 bg-[#F0F2F5] rounded">
              <span className="text-[#65676B] block text-[11px]">文档状态</span>
              <span className="font-bold text-[#31A24C]">最终整合版 (Approved)</span>
            </div>
          </div>
        </div>

        {/* 1. 产品概述 */}
        <section id="sec-1" className="space-y-3 pb-6 border-b border-[#E4E6EB]">
          <h2 className="text-base font-extrabold text-[#050505] flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#1877F2] rounded-full inline-block" />
            <span>1. 产品概述</span>
          </h2>
          
          <div className="space-y-2 text-xs text-[#050505]">
            <p><strong>1.1 产品名称：</strong>Stella 学海星图（Academy Star Atlas）</p>
            <p><strong>1.2 产品定位：</strong>学海星图是 Stella 主宇宙中的一个官方垂直星球，面向高校教师、学生、辅导员及院系管理者，提供基于地图与定位能力的大学课程与学业管理服务。它将每一堂课抽象为一座“灯塔”，将一学期课程连接为一条“航线”，将专业与院系构建为“星座”与“星区”，形成真实可交互的学术星图。</p>
            <p><strong>1.3 产品目标：</strong></p>
            <ul className="list-disc pl-5 space-y-1 text-[#65676B]">
              <li>解决高校传统考勤耗时、代签、资料散落、过程性评价难、课堂互动低、跨班级管理复杂等痛点。</li>
              <li>利用 Stella 的地图与定位能力，实现自动化签到、未到学生追踪、到课率实时计算。</li>
              <li>通过星球化设计，为教师和学生提供沉浸式教学与学习体验。</li>
              <li>建立教师与学生双身份成就体系，提升教学与学习积极性。</li>
              <li>形成院系、学校、跨校同专业的多层次数据对比，推动教学透明化与良性竞争。</li>
              <li>严格遵循 Facebook 设计语言：平面文字 + 图标 + 线条，无卡片式结构。</li>
            </ul>
            <div className="p-3 bg-[#F0F2F5] border-l-4 border-[#1877F2] mt-2">
              <span className="text-xs font-bold text-[#1877F2] block">1.4 产品 Slogan</span>
              <p className="text-sm font-black italic text-[#050505] mt-0.5">
                “每一堂课，都是一座灯塔；每一学期，都是一条星座。”
              </p>
            </div>
          </div>
        </section>

        {/* 2. 用户与角色 */}
        <section id="sec-2" className="space-y-3 pb-6 border-b border-[#E4E6EB]">
          <h2 className="text-base font-extrabold text-[#050505] flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#1877F2] rounded-full inline-block" />
            <span>2. 用户与角色体系</span>
          </h2>

          <div className="space-y-3 text-xs">
            <h3 className="font-bold text-[#050505]">2.1 角色体系</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F0F2F5] border-b border-[#E4E6EB] text-[#65676B]">
                    <th className="p-2 font-bold">角色</th>
                    <th className="p-2 font-bold">对应实体</th>
                    <th className="p-2 font-bold">主要职责</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E6EB]">
                  <tr>
                    <td className="p-2 font-bold text-[#1877F2]">星系管理员</td>
                    <td className="p-2">学校教务 / 校级管理者</td>
                    <td className="p-2 text-[#65676B]">管理全校星系、院系星区、专业数据</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-[#1877F2]">星区守护者</td>
                    <td className="p-2">院系辅导员 / 教导员</td>
                    <td className="p-2 text-[#65676B]">维护本院系学生名单、班级目录、学籍信息</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-[#1877F2]">领航员</td>
                    <td className="p-2">授课老师 / 课程负责人</td>
                    <td className="p-2 text-[#65676B]">创建课程、排课、创建灯塔、授课管理</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-[#1877F2]">副领航员</td>
                    <td className="p-2">助教 / 课程管理员</td>
                    <td className="p-2 text-[#65676B]">协助老师管理课程、审核资料、查看数据</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-[#1877F2]">班级守护者</td>
                    <td className="p-2">小班教导员 / 辅导员</td>
                    <td className="p-2 text-[#65676B]">管理指定小班、查看未到学生、发送提醒</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-[#1877F2]">星航者</td>
                    <td className="p-2">学生</td>
                    <td className="p-2 text-[#65676B]">签到、学习、查看资料、参与讨论、获得成就</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="font-bold text-[#050505] pt-2">2.2 权限矩阵</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F0F2F5] border-b border-[#E4E6EB] text-[#65676B]">
                    <th className="p-2 text-left font-bold">功能模块</th>
                    <th className="p-2 font-bold">星系管理员</th>
                    <th className="p-2 font-bold">星区守护者</th>
                    <th className="p-2 font-bold">领航员</th>
                    <th className="p-2 font-bold">副领航员</th>
                    <th className="p-2 font-bold">班级守护者</th>
                    <th className="p-2 font-bold">星航者</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E6EB] text-xs">
                  <tr>
                    <td className="p-2 text-left font-semibold">维护院系/专业/班级目录</td>
                    <td className="p-2 text-[#31A24C]">✅</td>
                    <td className="p-2 text-[#31A24C]">✅</td>
                    <td className="p-2 text-[#FA383E]">❌</td>
                    <td className="p-2 text-[#FA383E]">❌</td>
                    <td className="p-2 text-[#FA383E]">❌</td>
                    <td className="p-2 text-[#FA383E]">❌</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-left font-semibold">导入/编辑学生名单</td>
                    <td className="p-2 text-[#31A24C]">✅</td>
                    <td className="p-2 text-[#31A24C]">✅</td>
                    <td className="p-2 text-[#FA383E]">❌</td>
                    <td className="p-2 text-[#FA383E]">❌</td>
                    <td className="p-2 text-[#FA383E]">❌</td>
                    <td className="p-2 text-[#FA383E]">❌</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-left font-semibold">创建课程</td>
                    <td className="p-2 text-[#31A24C]">✅</td>
                    <td className="p-2 text-[#31A24C]">✅</td>
                    <td className="p-2 text-[#31A24C]">✅</td>
                    <td className="p-2 text-[#FA383E]">❌</td>
                    <td className="p-2 text-[#FA383E]">❌</td>
                    <td className="p-2 text-[#FA383E]">❌</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-left font-semibold">设置授课班级/名单</td>
                    <td className="p-2 text-[#31A24C]">✅</td>
                    <td className="p-2 text-[#31A24C]">✅</td>
                    <td className="p-2 text-[#31A24C]">✅</td>
                    <td className="p-2 text-[#31A24C]">✅</td>
                    <td className="p-2 text-[#FA383E]">❌</td>
                    <td className="p-2 text-[#FA383E]">❌</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-left font-semibold">生成排课计划/灯塔</td>
                    <td className="p-2 text-[#31A24C]">✅</td>
                    <td className="p-2 text-[#31A24C]">✅</td>
                    <td className="p-2 text-[#31A24C]">✅</td>
                    <td className="p-2 text-[#31A24C]">✅</td>
                    <td className="p-2 text-[#FA383E]">❌</td>
                    <td className="p-2 text-[#FA383E]">❌</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-left font-semibold">查看本院系未到学生位置</td>
                    <td className="p-2 text-[#31A24C]">✅</td>
                    <td className="p-2 text-[#31A24C]">✅</td>
                    <td className="p-2 text-[#31A24C]">✅</td>
                    <td className="p-2 text-[#31A24C]">✅</td>
                    <td className="p-2 text-[#31A24C]">✅(本班)</td>
                    <td className="p-2 text-[#FA383E]">❌</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-left font-semibold">发布/管理课程资产</td>
                    <td className="p-2 text-[#31A24C]">✅</td>
                    <td className="p-2 text-[#31A24C]">✅</td>
                    <td className="p-2 text-[#31A24C]">✅</td>
                    <td className="p-2 text-[#31A24C]">✅</td>
                    <td className="p-2 text-[#FA383E]">❌</td>
                    <td className="p-2 text-[#65676B]">仅上传</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-left font-semibold">课堂签到</td>
                    <td className="p-2 text-[#31A24C]">✅</td>
                    <td className="p-2 text-[#31A24C]">✅</td>
                    <td className="p-2 text-[#31A24C]">✅</td>
                    <td className="p-2 text-[#31A24C]">✅</td>
                    <td className="p-2 text-[#31A24C]">✅</td>
                    <td className="p-2 text-[#31A24C]">✅</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 3. 总体架构 */}
        <section id="sec-3" className="space-y-3 pb-6 border-b border-[#E4E6EB]">
          <h2 className="text-base font-extrabold text-[#050505] flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#1877F2] rounded-full inline-block" />
            <span>3. 总体架构：主宇宙 + 星球容器</span>
          </h2>
          <div className="space-y-2 text-xs text-[#050505]">
            <p><strong>3.1 架构概念：</strong>Stella 主产品为“地图社交宇宙”，其中包含多个星球。每个星球是独立的垂直世界，拥有自己的世界观、身份体系、功能模块和交互规则。学海星图是其中一个官方垂直星球。</p>
            <div className="p-3 bg-[#F0F2F5] font-mono text-[11px] rounded text-[#050505] leading-relaxed">
              Stella 主宇宙<br />
              ├── 主地图（日常社交、位置分享）<br />
              ├── 主身份（Stella Citizen）<br />
              ├── 主消息系统<br />
              └── 星球容器<br />
              &nbsp;&nbsp;&nbsp;&nbsp;├── 🌌 学海星图（大学课程管理）<br />
              &nbsp;&nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;├── 星球身份：教师 / 学生 / 辅导员 / 管理者<br />
              &nbsp;&nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;├── 星图地图：灯塔、航线、星座<br />
              &nbsp;&nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;├── 课程系统：排课、签到、资产库<br />
              &nbsp;&nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;└── 成就体系：教学勋章 / 学业星徽<br />
              &nbsp;&nbsp;&nbsp;&nbsp;└── 🪐 其他星球（未来拓展）
            </div>
            <p><strong>3.2 关键原则：</strong></p>
            <ul className="list-disc pl-5 space-y-1 text-[#65676B]">
              <li><strong>主身份不变，星球身份叠加</strong>：用户始终是 Stella Citizen，进入学海星图后获得星球身份，两者并存。</li>
              <li><strong>数据隔离，入口统一</strong>：星球内数据不影响主系统社交流；主系统仅提供入口、通知、账号基础能力。</li>
              <li><strong>星球即世界</strong>：进入星球后呈现完整学术星图地图，而非传统单调功能列表。</li>
            </ul>
          </div>
        </section>

        {/* 4. 身份与账号体系 */}
        <section id="sec-4" className="space-y-3 pb-6 border-b border-[#E4E6EB]">
          <h2 className="text-base font-extrabold text-[#050505] flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#1877F2] rounded-full inline-block" />
            <span>4. 身份与账号体系</span>
          </h2>
          <div className="space-y-2 text-xs text-[#050505]">
            <p><strong>4.1 身份层级：</strong>L0 (Stella 主身份) → L1 (学海星图星球身份) → L2 (组织与班级身份)。</p>
            <p><strong>4.2 身份激活流程：</strong>点击学海星图 → 弹出身份激活引导 → 选择学生/教师/辅导员 → 输入学号/工号与邀请码 → 验证通过自动匹配学籍/教职信息 → 激活成功进入主星图。</p>
            <p><strong>4.3 身份切换逻辑：</strong>顶部身份栏支持一键实时切换多重身份（如学生/助教/教师），页面功能与权限秒级热更新。</p>
          </div>
        </section>

        {/* 5. 核心功能模块 */}
        <section id="sec-5" className="space-y-4 pb-6 border-b border-[#E4E6EB]">
          <h2 className="text-base font-extrabold text-[#050505] flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#1877F2] rounded-full inline-block" />
            <span>5. 核心功能模块规范</span>
          </h2>

          <div className="space-y-3 text-xs text-[#050505]">
            <div className="p-3 bg-[#F0F2F5] rounded space-y-1.5">
              <h4 className="font-bold text-[#1877F2]">5.1 学籍与班级库</h4>
              <p className="text-[#65676B]">数据层级：大学（星系）→ 院系（星区）→ 专业（星座）→ 年级 → 行政班 → 学生。支持 Excel/CSV 批量导入与教务系统 API 同步。</p>
            </div>

            <div className="p-3 bg-[#F0F2F5] rounded space-y-1.5">
              <h4 className="font-bold text-[#1877F2]">5.2 课程创建与灵活授课对象 (核心创新)</h4>
              <p className="text-[#65676B]"><strong>彻底打破人数上限限制</strong>：授课老师创建课程时，直接勾选行政班级或导入学生名单，系统自动计算应到人数，支持合班与动态分组。</p>
            </div>

            <div className="p-3 bg-[#F0F2F5] rounded space-y-1.5">
              <h4 className="font-bold text-[#1877F2]">5.3 智能排课引擎</h4>
              <p className="text-[#65676B]">支持输入学期周数、每周频次、单次课时长、教室地点，系统自动生成全学期灯塔航线，智能跳过法定节假日，支持调课、补课与停课。</p>
            </div>

            <div className="p-3 bg-[#F0F2F5] rounded space-y-1.5">
              <h4 className="font-bold text-[#1877F2]">5.4 灯塔签到与考勤机制 (定位与停留核心算法)</h4>
              <ul className="list-disc pl-5 space-y-1 text-[#65676B]">
                <li><strong>有效到场</strong>：进入灯塔半径，且停留 ≥ 最低时长（默认 40 分钟），计 1 次。</li>
                <li><strong>迟到</strong>：开课后进入半径且停留满时长，计 0.5 次。</li>
                <li><strong>早退 / 未到场</strong>：计 0 次。</li>
                <li><strong>点亮指数公式</strong>：点亮指数 = (有效到场人数 / 应到人数) × 100%。</li>
                <li><strong>到课率公式</strong>：到课率 = (有效到场灯塔数 + 0.5 × 迟到灯塔数) / 应出勤灯塔总数 × 100%。</li>
                <li><strong>未到学生实时追踪</strong>：仅在管理端地图呈现未到学生红点及距离灯塔米数，支持辅导员一键催签。</li>
              </ul>
            </div>

            <div className="p-3 bg-[#F0F2F5] rounded space-y-1.5">
              <h4 className="font-bold text-[#1877F2]">5.5 课程资产库</h4>
              <p className="text-[#65676B]">按章节与类型归类课件、作业、试卷、参考书与通知。具备版本管理能力，期末支持一键导出打包。</p>
            </div>

            <div className="p-3 bg-[#F0F2F5] rounded space-y-1.5">
              <h4 className="font-bold text-[#1877F2]">5.6 聊天信箱与课堂互动</h4>
              <p className="text-[#65676B]">发言生成“信件”，气泡集中展示，支持关联资产库知识点、匿名发问与快速随堂投票。</p>
            </div>

            <div className="p-3 bg-[#F0F2F5] rounded space-y-1.5">
              <h4 className="font-bold text-[#1877F2]">5.7 数据统计与跨校对比</h4>
              <p className="text-[#65676B]">
                <strong>专业星群指数</strong> = 到课率×40% + 灯塔亮度×30% + 课程完成度×20% + 教学活跃度×10%。
              </p>
            </div>

            <div className="p-3 bg-[#F0F2F5] rounded space-y-1.5">
              <h4 className="font-bold text-[#1877F2]">5.8 游戏化与身份名片体系</h4>
              <p className="text-[#65676B]">教师领航员名片（教学经验值、勋章）；学生星航者名片（学业星等级、到课率、积分排行榜：有效到场+10, 迟到-5, 缺勤-20, 作业+5）。</p>
            </div>
          </div>
        </section>

        {/* 6. 页面与交互设计 */}
        <section id="sec-6" className="space-y-3 pb-6 border-b border-[#E4E6EB]">
          <h2 className="text-base font-extrabold text-[#050505] flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#1877F2] rounded-full inline-block" />
            <span>6. 页面与交互设计（Facebook 设计语言）</span>
          </h2>
          <div className="space-y-2 text-xs text-[#050505]">
            <p><strong>设计规范约束：</strong>背景色 #F0F2F5，内容区白色 #FFFFFF，分割线 1px #E4E6EB，主色 #1877F2，字体 Roboto/系统无衬线，直角按钮，无重叠卡片式结构，星图地图全宽无圆角。</p>
            <p>包含四大核心线框页面：<strong>星球入口页</strong>、<strong>学生星图首页</strong>、<strong>教师领航员工作台</strong>与<strong>课程资产库</strong>。</p>
          </div>
        </section>

        {/* 7. 数据模型 */}
        <section id="sec-7" className="space-y-3 pb-6 border-b border-[#E4E6EB]">
          <h2 className="text-base font-extrabold text-[#050505] flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#1877F2] rounded-full inline-block" />
            <span>7. 数据模型（核心 8 大表结构）</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-[#F0F2F5] rounded">
              <span className="font-bold text-[#1877F2]">1. College (院系)</span>
              <p className="text-[11px] text-[#65676B]">college_id, university_id, name, supervisor_id</p>
            </div>
            <div className="p-2.5 bg-[#F0F2F5] rounded">
              <span className="font-bold text-[#1877F2]">2. Class (班级)</span>
              <p className="text-[11px] text-[#65676B]">class_id, college_id, major, grade, class_name</p>
            </div>
            <div className="p-2.5 bg-[#F0F2F5] rounded">
              <span className="font-bold text-[#1877F2]">3. Student (学生)</span>
              <p className="text-[11px] text-[#65676B]">student_id, class_id, student_no, name, phone</p>
            </div>
            <div className="p-2.5 bg-[#F0F2F5] rounded">
              <span className="font-bold text-[#1877F2]">4. Course (课程)</span>
              <p className="text-[11px] text-[#65676B]">course_id, teacher_id, name, semester, week_count, default_radius</p>
            </div>
            <div className="p-2.5 bg-[#F0F2F5] rounded">
              <span className="font-bold text-[#1877F2]">5. CourseClass (课程-班级关联)</span>
              <p className="text-[11px] text-[#65676B]">course_id, class_id, student_ids[]</p>
            </div>
            <div className="p-2.5 bg-[#F0F2F5] rounded">
              <span className="font-bold text-[#1877F2]">6. Lighthouse (灯塔)</span>
              <p className="text-[11px] text-[#65676B]">lighthouse_id, week_num, lat, lng, radius, min_duration, status</p>
            </div>
            <div className="p-2.5 bg-[#F0F2F5] rounded">
              <span className="font-bold text-[#1877F2]">7. AttendanceRecord (签到记录)</span>
              <p className="text-[11px] text-[#65676B]">record_id, lighthouse_id, student_id, enter_time, stay_duration, status</p>
            </div>
            <div className="p-2.5 bg-[#F0F2F5] rounded">
              <span className="font-bold text-[#1877F2]">8. UserProfile (身份名片)</span>
              <p className="text-[11px] text-[#65676B]">user_id, teacher_profile, student_profile, badges, score</p>
            </div>
          </div>
        </section>

        {/* 8. 异常与边界 */}
        <section id="sec-8" className="space-y-2 pb-6 border-b border-[#E4E6EB] text-xs">
          <h2 className="text-base font-extrabold text-[#050505] flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#1877F2] rounded-full inline-block" />
            <span>8. 异常与边界策略</span>
          </h2>
          <p><strong>定位与隐私</strong>：仅在开课前 15 分钟至下课期间获取定位；未到学生位置仅教师、辅导员可见。</p>
          <p><strong>请假与调课</strong>：学生提前请假经审批后不计入应到基数；调课保留历史记录并建立新灯塔。</p>
          <p><strong>数据安全</strong>：跨校对比数据一律脱敏，仅呈现聚合指标。</p>
        </section>

        {/* 9. 成功指标 */}
        <section id="sec-9" className="space-y-2 pb-6 border-b border-[#E4E6EB] text-xs">
          <h2 className="text-base font-extrabold text-[#050505] flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#1877F2] rounded-full inline-block" />
            <span>9. 成功指标（KPI）</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div className="p-2 bg-[#F0F2F5] rounded text-center">
              <span className="text-[10.5px] text-[#65676B] block">教师课程创建率</span>
              <span className="text-sm font-black text-[#1877F2]">≥ 90%</span>
            </div>
            <div className="p-2 bg-[#F0F2F5] rounded text-center">
              <span className="text-[10.5px] text-[#65676B] block">灯塔签到完成率</span>
              <span className="text-sm font-black text-[#31A24C]">≥ 85%</span>
            </div>
            <div className="p-2 bg-[#F0F2F5] rounded text-center">
              <span className="text-[10.5px] text-[#65676B] block">未到学生定位率</span>
              <span className="text-sm font-black text-[#1877F2]">≥ 80%</span>
            </div>
            <div className="p-2 bg-[#F0F2F5] rounded text-center">
              <span className="text-[10.5px] text-[#65676B] block">学生到课率提升</span>
              <span className="text-sm font-black text-[#31A24C]">≥ 15%</span>
            </div>
            <div className="p-2 bg-[#F0F2F5] rounded text-center">
              <span className="text-[10.5px] text-[#65676B] block">资产库上传率</span>
              <span className="text-sm font-black text-[#1877F2]">≥ 70%</span>
            </div>
            <div className="p-2 bg-[#F0F2F5] rounded text-center">
              <span className="text-[10.5px] text-[#65676B] block">跨校高校覆盖</span>
              <span className="text-sm font-black text-[#1877F2]">≥ 100 所</span>
            </div>
          </div>
        </section>

        {/* 10. 附录与术语表 */}
        <section id="sec-10" className="space-y-2 pb-6 border-b border-[#E4E6EB] text-xs">
          <h2 className="text-base font-extrabold text-[#050505] flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#1877F2] rounded-full inline-block" />
            <span>10. 附录：术语表</span>
          </h2>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <p><strong>星系</strong>：大学</p>
            <p><strong>星区</strong>：院系</p>
            <p><strong>星座</strong>：专业</p>
            <p><strong>航线</strong>：一学期课程灯塔的串联</p>
            <p><strong>灯塔</strong>：单次课程活动单元</p>
            <p><strong>星航者</strong>：学生</p>
            <p><strong>领航员</strong>：授课老师</p>
            <p><strong>星区守护者</strong>：院系辅导员 / 教导员</p>
            <p><strong>点亮指数</strong>：灯塔签到率指标</p>
            <p><strong>星徽</strong>：荣誉勋章</p>
          </div>
        </section>

        {/* 11. 总结 */}
        <section id="sec-11" className="space-y-2 text-xs">
          <h2 className="text-base font-extrabold text-[#050505] flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#1877F2] rounded-full inline-block" />
            <span>11. 总结</span>
          </h2>
          <p className="leading-relaxed text-[#65676B]">
            Stella 学海星图将大学课程管理从“工具”升级为“学术星图”。它以地图为底座，以灯塔签到为核心，以灵活名单和智能排课解决真实教学场景，以课程资产库沉淀知识，以师生双成就体系激发动力，以院系和跨校对比创造数据价值。
          </p>
          <div className="p-3 bg-[#F0F2F5] text-center font-bold text-[#1877F2] rounded">
            “每一堂课，都是一座灯塔；每一学期，都是一条星座。”
          </div>
        </section>

      </div>
    </div>
  );
};
