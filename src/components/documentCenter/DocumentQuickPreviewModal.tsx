import React, { useState } from 'react';
import {
  X,
  Download,
  Share2,
  Bookmark,
  FileText,
  CreditCard,
  Receipt,
  FileCheck2,
  FileSpreadsheet,
  Image as ImageIcon,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  ShieldCheck,
  Camera,
  Layers,
  Calendar,
  User,
  Info,
  FolderInput,
} from 'lucide-react';
import { DocumentAsset } from '../../data/documentCenterData';

interface DocumentQuickPreviewModalProps {
  asset: DocumentAsset | null;
  onClose: () => void;
  onShowToast?: (msg: string) => void;
  showToast?: (msg: string) => void;
  onSaveToPersonal?: (asset: DocumentAsset) => void;
  onSaveToPersonalAlbum?: (asset: DocumentAsset, albumId: string) => void;
  onSaveToPersonalFolder?: (asset: DocumentAsset, folderId: string) => void;
  userAlbums?: any[];
  userFolders?: any[];
}

export const DocumentQuickPreviewModal: React.FC<DocumentQuickPreviewModalProps> = ({
  asset,
  onClose,
  onShowToast,
  showToast,
  onSaveToPersonal,
  onSaveToPersonalAlbum,
  onSaveToPersonalFolder,
  userAlbums,
  userFolders,
}) => {
  const triggerToast = (msg: string) => {
    if (onShowToast) onShowToast(msg);
    else if (showToast) showToast(msg);
  };
  const [activeTab, setActiveTab] = useState<'preview' | 'ocr' | 'metadata'>('preview');
  const [copiedOcr, setCopiedOcr] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);

  if (!asset) return null;

  const isImage =
    asset.type === 'photo' ||
    asset.fileExtension === 'jpg' ||
    asset.fileExtension === 'png' ||
    asset.url?.includes('images.unsplash.com');

  const isExcel =
    asset.fileExtension === 'xlsx' ||
    asset.title.endsWith('.xlsx') ||
    asset.title.endsWith('.csv') ||
    Boolean(asset.previewData?.sheetRows);

  const isInvoice = asset.aiCategory === 'invoices' || Boolean(asset.previewData?.invoiceAmount);
  const isContract = asset.aiCategory === 'contracts' || Boolean(asset.previewData?.contractParty);
  const isCertificate =
    asset.aiCategory === 'certificates' || Boolean(asset.previewData?.certificateIssuer);

  const totalPages = asset.previewData?.pdfPages || 4;

  const handleCopyOcr = () => {
    const textToCopy =
      asset.previewData?.ocrText ||
      `【Stellar AI 智能文字提取】\n文件名：${asset.title}\n归档时间：${asset.date}\n发送者：${asset.author || asset.source.name}\n分类标签：${asset.aiTags.join(', ')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedOcr(true);
    triggerToast('✨ 已成功复制 OCR 提取文字到剪贴板！');
    setTimeout(() => setCopiedOcr(false), 2000);
  };

  const handleDownload = () => {
    triggerToast(`正在下载文件：${asset.title} ⬇️`);
  };

  const handleShare = () => {
    triggerToast(`已生成「${asset.title}」的加密分享口令已复制！`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150 font-sans">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <header className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isInvoice
                  ? 'bg-emerald-50 text-emerald-600'
                  : isContract
                  ? 'bg-amber-50 text-amber-600'
                  : isCertificate
                  ? 'bg-blue-50 text-blue-600'
                  : isExcel
                  ? 'bg-emerald-50 text-emerald-600'
                  : isImage
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-blue-50 text-[#1877F2]'
              }`}
            >
              {isInvoice ? (
                <Receipt size={20} />
              ) : isContract ? (
                <FileCheck2 size={20} />
              ) : isCertificate ? (
                <CreditCard size={20} />
              ) : isExcel ? (
                <FileSpreadsheet size={20} />
              ) : isImage ? (
                <ImageIcon size={20} />
              ) : (
                <FileText size={20} />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-xs font-black text-[#050505] truncate max-w-[220px] sm:max-w-[340px]">
                  {asset.title}
                </h3>
                {asset.fileExtension && (
                  <span className="text-[9px] uppercase px-1.5 py-0.2 rounded-md bg-gray-100 font-mono text-gray-600 font-bold shrink-0">
                    {asset.fileExtension}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[#65676B] flex items-center space-x-1.5 mt-0.5">
                <span>{asset.size || '2.4 MB'}</span>
                <span>·</span>
                <span>来源: {asset.source.name}</span>
                <span>·</span>
                <span>{asset.date}</span>
              </p>
            </div>
          </div>

          {/* Quick actions & Close button */}
          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              type="button"
              onClick={handleShare}
              title="分享文件"
              className="w-8 h-8 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Share2 size={14} />
            </button>
            <button
              type="button"
              onClick={handleDownload}
              title="下载文件"
              className="w-8 h-8 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Download size={14} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </header>

        {/* View Mode Tabs (Preview / OCR / Metadata) */}
        <div className="px-4 py-2 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-white text-[#1877F2] shadow-2xs'
                  : 'text-[#65676B] hover:text-[#050505]'
              }`}
            >
              实时预览
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ocr')}
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                activeTab === 'ocr'
                  ? 'bg-white text-[#1877F2] shadow-2xs'
                  : 'text-[#65676B] hover:text-[#050505]'
              }`}
            >
              <Sparkles size={12} />
              <span>AI 文字提取 (OCR)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('metadata')}
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                activeTab === 'metadata'
                  ? 'bg-white text-[#1877F2] shadow-2xs'
                  : 'text-[#65676B] hover:text-[#050505]'
              }`}
            >
              属性与来源
            </button>
          </div>

          {/* Zoom / Page controls for preview mode */}
          {activeTab === 'preview' && (
            <div className="flex items-center space-x-1 text-gray-500 text-[11px]">
              {!isImage && (
                <span className="hidden sm:inline-block mr-1">
                  第 {currentPage} / {totalPages} 页
                </span>
              )}
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(75, z - 15))}
                className="w-6 h-6 rounded bg-white hover:bg-gray-100 flex items-center justify-center border border-gray-200"
              >
                <ZoomOut size={12} />
              </button>
              <span className="w-8 text-center text-[10px] font-mono">{zoomLevel}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(150, z + 15))}
                className="w-6 h-6 rounded bg-white hover:bg-gray-100 flex items-center justify-center border border-gray-200"
              >
                <ZoomIn size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#F9FAFB]">
          {/* TAB 1: PREVIEW */}
          {activeTab === 'preview' && (
            <div
              className="transition-all duration-150 origin-top"
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            >
              {/* Specialized Invoices Layout */}
              {isInvoice && (
                <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                    <div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                        全国统一电子增值税发票
                      </span>
                      <h4 className="text-sm font-black text-[#050505] mt-1">{asset.title}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500">报销金额</p>
                      <p className="text-base font-black text-emerald-600 font-mono">
                        {asset.previewData?.invoiceAmount || '¥ 3,485.50'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-emerald-50/50 p-3 rounded-xl">
                    <div>
                      <span className="text-gray-500">发票号码：</span>
                      <span className="font-mono font-bold text-gray-800">
                        {asset.previewData?.invoiceNo || 'FP-20260816-8921'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">开票日期：</span>
                      <span className="font-bold text-gray-800">
                        {asset.previewData?.invoiceDate || asset.date}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">报销人：</span>
                      <span className="font-bold text-gray-800">{asset.author || 'Alex Mercer'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">审核状态：</span>
                      <span className="font-bold text-emerald-600">已核验通过 · 允许入账</span>
                    </div>
                  </div>

                  {asset.previewData?.sheetRows && (
                    <div className="border border-gray-100 rounded-xl overflow-hidden text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-[10px] border-b border-gray-100">
                          <tr>
                            <th className="p-2">日期</th>
                            <th className="p-2">报销项目</th>
                            <th className="p-2">金额</th>
                            <th className="p-2">类别</th>
                            <th className="p-2">状态</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {asset.previewData.sheetRows.map((row) => (
                            <tr key={row.id} className="hover:bg-gray-50/60">
                              <td className="p-2 text-gray-600 text-[11px]">{row.col1}</td>
                              <td className="p-2 font-bold text-[#050505] text-[11px]">{row.col2}</td>
                              <td className="p-2 font-mono font-bold text-emerald-600 text-[11px]">
                                {row.col3}
                              </td>
                              <td className="p-2 text-gray-500 text-[11px]">{row.col4}</td>
                              <td className="p-2">
                                <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[9px] font-bold">
                                  {row.status || '已核销'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Specialized Contracts Layout */}
              {isContract && (
                <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-xs space-y-4 font-serif">
                  <div className="flex items-center justify-between border-b border-amber-100 pb-3 font-sans">
                    <div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold">
                        电子签署有效法律文件
                      </span>
                      <h4 className="text-sm font-black text-[#050505] mt-1 font-sans">
                        {asset.title}
                      </h4>
                    </div>
                    <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-amber-50 rounded-xl text-amber-700 text-xs font-bold font-sans">
                      <ShieldCheck size={14} />
                      <span>{asset.previewData?.contractStatus || '双方已签署'}</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-700 leading-relaxed font-sans whitespace-pre-wrap bg-amber-50/20 p-4 rounded-xl border border-amber-100/60 max-h-80 overflow-y-auto">
                    {asset.previewData?.docContent ||
                      `【商业技术合作与保密协议】\n\n甲方：Stellar Tech Limited\n乙方：${asset.author || 'Alex Mercer'}\n\n双方本着诚信合作之原则，针对核心地图空间计算组件及分布式算法达成如下法律条款...\n- 双方约定保密期为签署之日起永久有效。\n- 争议解决由兰州仲裁委员会依其仲裁规则仲裁。`}
                  </div>
                </div>
              )}

              {/* Specialized Certificates Layout */}
              {isCertificate && (
                <div className="bg-white p-5 rounded-2xl border-2 border-blue-200 shadow-xs space-y-4 relative overflow-hidden">
                  <div className="absolute top-2 right-2 opacity-5 pointer-events-none">
                    <ShieldCheck size={160} />
                  </div>
                  <div className="flex items-center space-x-2 pb-2 border-b border-blue-100">
                    <CreditCard size={18} className="text-[#1877F2]" />
                    <span className="text-xs font-black text-[#050505]">
                      官方资质与专业证书在线档案
                    </span>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-blue-50/80 to-indigo-50/50 rounded-2xl border border-blue-100 space-y-3">
                    <div className="text-center py-2">
                      <span className="text-[11px] tracking-wider text-blue-700 font-bold uppercase">
                        CERTIFICATE OF QUALIFICATION
                      </span>
                      <h4 className="text-sm font-black text-[#050505] mt-0.5">{asset.title}</h4>
                    </div>

                    <div className="text-xs space-y-1.5 text-gray-700">
                      <div>
                        <span className="font-bold text-[#050505]">持证人 / 所属：</span>
                        <span>{asset.author || 'Alex Mercer'}</span>
                      </div>
                      <div>
                        <span className="font-bold text-[#050505]">颁发机构：</span>
                        <span>{asset.previewData?.certificateIssuer || '国家信息化鉴定委员会'}</span>
                      </div>
                      <div>
                        <span className="font-bold text-[#050505]">有效期限：</span>
                        <span>{asset.previewData?.validUntil || '长期有效'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Photos & Images Layout */}
              {isImage && (
                <div className="space-y-3">
                  <div className="rounded-2xl overflow-hidden border border-gray-200 bg-black flex items-center justify-center max-h-[420px]">
                    <img
                      src={asset.url || asset.thumbnail}
                      alt={asset.title}
                      className="max-w-full max-h-[420px] object-contain"
                    />
                  </div>

                  {asset.previewData?.exif && (
                    <div className="p-3 bg-white rounded-2xl border border-gray-200/80 text-xs space-y-1.5">
                      <div className="flex items-center space-x-1 font-bold text-[#050505]">
                        <Camera size={14} className="text-[#1877F2]" />
                        <span>摄影器材与 EXIF 拍摄参数</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-gray-600 pt-1">
                        <div>
                          相机：
                          <span className="font-bold text-gray-800">
                            {asset.previewData.exif.camera}
                          </span>
                        </div>
                        <div>
                          镜头：
                          <span className="font-bold text-gray-800">
                            {asset.previewData.exif.lens}
                          </span>
                        </div>
                        <div>
                          光圈快门：
                          <span className="font-bold text-gray-800">
                            {asset.previewData.exif.aperture} · {asset.previewData.exif.shutter}
                          </span>
                        </div>
                        <div>
                          感光度：
                          <span className="font-bold text-gray-800">
                            ISO {asset.previewData.exif.iso}
                          </span>
                        </div>
                        <div>
                          分辨率：
                          <span className="font-bold text-gray-800">
                            {asset.previewData.exif.resolution}
                          </span>
                        </div>
                        <div className="col-span-2 sm:col-span-1 truncate">
                          拍摄地：
                          <span className="font-bold text-gray-800">
                            {asset.previewData.exif.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Standard Document / PDF Layout */}
              {!isInvoice && !isContract && !isCertificate && !isImage && (
                <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
                  <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-[#050505]">{asset.title}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Stellar 高精度文档在线解析引擎 · 渲染格式：{asset.fileExtension || 'PDF'}
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-[#1877F2] font-bold">
                      在线阅读
                    </span>
                  </div>

                  <div className="text-xs text-gray-800 leading-relaxed font-sans whitespace-pre-wrap min-h-[160px]">
                    {asset.previewData?.docContent ||
                      `# ${asset.title}\n\n## 1. 概述与目的\n本文档已通过 Stellar 文档中心加密云同步，支持多端自适应渲染。\n\n## 2. 核心内容要点\n- 来源群聊：${asset.source.name}\n- 上传作者：${asset.author || '成员'}\n- 标签分类：${asset.aiTags.join(' · ')}\n\n此文档完整内容已就绪，您可以点击下方下载原文件查看更多图表与批注。`}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AI OCR TEXT */}
          {activeTab === 'ocr' && (
            <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center space-x-1.5">
                  <Sparkles size={16} className="text-[#1877F2]" />
                  <h4 className="text-xs font-black text-[#050505]">
                    AI 深度视觉文字识别 (OCR 结果)
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={handleCopyOcr}
                  className="px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-[#1877F2] text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  {copiedOcr ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedOcr ? '已复制' : '一键复制文字'}</span>
                </button>
              </div>

              <textarea
                readOnly
                value={
                  asset.previewData?.ocrText ||
                  `【文件名称】: ${asset.title}\n【文件来源】: ${asset.source.name} (${asset.date})\n【提取文本】:\n${
                    asset.previewData?.docContent ||
                    'Stellar AI 引擎已提取本文件全部关键信息、标题、表格数值与签署存证签名。'
                  }`
                }
                rows={10}
                className="w-full text-xs text-gray-800 bg-[#F9FAFB] p-3.5 rounded-xl border border-gray-200/80 outline-none resize-none font-mono leading-relaxed"
              />
            </div>
          )}

          {/* TAB 3: METADATA */}
          {activeTab === 'metadata' && (
            <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs space-y-3 text-xs">
              <h4 className="font-black text-[#050505] pb-2 border-b border-gray-100">
                资产元数据与安全属性
              </h4>
              <div className="grid grid-cols-2 gap-3 text-gray-600">
                <div className="p-2.5 rounded-xl bg-gray-50">
                  <span className="text-[10px] text-gray-400 block">文件标识 (Asset ID)</span>
                  <span className="font-mono font-bold text-gray-800 text-[11px]">{asset.id}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50">
                  <span className="text-[10px] text-gray-400 block">文件格式</span>
                  <span className="font-bold text-gray-800 uppercase">
                    {asset.fileExtension || asset.type}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50">
                  <span className="text-[10px] text-gray-400 block">文件大小</span>
                  <span className="font-bold text-gray-800">{asset.size || '2.4 MB'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50">
                  <span className="text-[10px] text-gray-400 block">同步归档时间</span>
                  <span className="font-bold text-gray-800">{asset.date}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50">
                  <span className="text-[10px] text-gray-400 block">同步来源</span>
                  <span className="font-bold text-gray-800">{asset.source.name}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50">
                  <span className="text-[10px] text-gray-400 block">智能分类类别</span>
                  <span className="font-bold text-[#1877F2]">{asset.aiCategory}</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[10px] text-gray-400 block mb-1">AI 识别标签</span>
                <div className="flex flex-wrap gap-1.5">
                  {asset.aiTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-blue-50 text-[#1877F2] text-[10px] font-bold"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <footer className="px-4 py-3 border-t border-gray-100 bg-white flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => {
              if (onSaveToPersonal) onSaveToPersonal(asset);
              else triggerToast(`已将「${asset.title}」存入个人收藏`);
            }}
            className="px-3.5 py-2 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] text-xs font-bold text-[#050505] flex items-center space-x-1.5 cursor-pointer transition-colors"
          >
            <FolderInput size={14} className="text-[#1877F2]" />
            <span>存入个人目录</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-600 transition-colors cursor-pointer"
            >
              关闭
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="px-5 py-2 rounded-full bg-[#1877F2] hover:bg-blue-600 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Download size={14} />
              <span>下载源文件</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
