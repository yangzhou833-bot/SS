import React, { useState } from 'react';
import {
  Sparkles,
  X,
  CheckCircle2,
  FolderInput,
  ArrowRight,
  FileText,
  Image as ImageIcon,
  Receipt,
  FileCheck2,
  CreditCard,
  Camera,
  Layers,
  Loader2,
} from 'lucide-react';
import { DocumentAsset, AI_CATEGORIES, AICategoryType } from '../../data/documentCenterData';

interface AiAutoArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  unclassifiedAssets: DocumentAsset[];
  onConfirmArchive: (mappings: { assetId: string; targetCategory: AICategoryType }[]) => void;
  onShowToast?: (msg: string) => void;
  showToast?: (msg: string) => void;
}

export const AiAutoArchiveModal: React.FC<AiAutoArchiveModalProps> = ({
  isOpen,
  onClose,
  unclassifiedAssets,
  onConfirmArchive,
  onShowToast,
  showToast,
}) => {
  const triggerToast = (msg: string) => {
    if (onShowToast) onShowToast(msg);
    else if (showToast) showToast(msg);
  };
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>(() =>
    unclassifiedAssets.map((a) => a.id)
  );

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedAssetIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExecuteArchive = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const mappings = unclassifiedAssets
        .filter((a) => selectedAssetIds.includes(a.id))
        .map((a) => ({
          assetId: a.id,
          targetCategory: a.aiCategory,
        }));

      onConfirmArchive(mappings);
      setIsProcessing(false);
      onClose();
      triggerToast(`✨ 智能归档完成！已成功将 ${mappings.length} 份文件归类至建议文件夹`);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 font-sans">
      <div className="bg-white w-full max-w-xl rounded-3xl p-5 shadow-2xl border border-gray-100 flex flex-col max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-2xs">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#050505]">Stellar AI 一键智能归档</h3>
              <p className="text-[10px] text-[#65676B]">
                按内容类型自动识别语义并归档至推荐文件夹
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Overview Banner */}
        <div className="my-3 p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/80 flex items-center justify-between text-xs">
          <div className="space-y-0.5">
            <span className="font-bold text-[#1877F2]">AI 智能识别完成</span>
            <p className="text-[11px] text-gray-600">
              共检测到 <span className="font-bold text-[#050505]">{unclassifiedAssets.length}</span>{' '}
              个待归档文件，建议自动归纳为{' '}
              <span className="font-bold text-[#1877F2]">
                {new Set(unclassifiedAssets.map((a) => a.aiCategory)).size}
              </span>{' '}
              个分类
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (selectedAssetIds.length === unclassifiedAssets.length) {
                setSelectedAssetIds([]);
              } else {
                setSelectedAssetIds(unclassifiedAssets.map((a) => a.id));
              }
            }}
            className="px-2.5 py-1 rounded-full bg-white text-[11px] font-bold text-[#1877F2] shadow-2xs cursor-pointer hover:bg-blue-50 transition-colors"
          >
            {selectedAssetIds.length === unclassifiedAssets.length ? '取消全选' : '全选'}
          </button>
        </div>

        {/* Proposed Mapping List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar py-1">
          {unclassifiedAssets.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              所有文件均已归档完毕，暂无未分类资产
            </div>
          ) : (
            unclassifiedAssets.map((asset) => {
              const catMeta = AI_CATEGORIES.find((c) => c.id === asset.aiCategory);
              const isSelected = selectedAssetIds.includes(asset.id);

              return (
                <div
                  key={asset.id}
                  onClick={() => toggleSelect(asset.id)}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#1877F2] ring-1 ring-[#1877F2] shadow-2xs'
                      : 'bg-gray-50/60 border-gray-200/80 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        isSelected ? 'bg-[#1877F2] text-white' : 'border border-gray-300 bg-white'
                      }`}
                    >
                      {isSelected && <CheckCircle2 size={13} />}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#050505] truncate">{asset.title}</h4>
                      <p className="text-[10px] text-gray-500 flex items-center space-x-1 mt-0.5">
                        <span>来源: {asset.source.name}</span>
                        <span>·</span>
                        <span>{asset.size || '1.5 MB'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0 pl-2">
                    <ArrowRight size={12} className="text-gray-400" />
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-bold truncate max-w-[130px]"
                      style={{
                        backgroundColor: `${catMeta?.color || '#1877F2'}15`,
                        color: catMeta?.color || '#1877F2',
                      }}
                    >
                      {catMeta?.suggestedTargetName || '智能归档目录'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between shrink-0">
          <span className="text-xs text-gray-500">
            已勾选 <span className="font-bold text-[#050505]">{selectedAssetIds.length}</span> 项
          </span>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-600 cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              disabled={selectedAssetIds.length === 0 || isProcessing}
              onClick={handleExecuteArchive}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 transition-all"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>归档处理中...</span>
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  <span>确认一键归档 ({selectedAssetIds.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
