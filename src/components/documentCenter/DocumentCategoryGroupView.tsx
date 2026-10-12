import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  Plus,
  MoreHorizontal,
  Folder,
  Image as ImageIcon,
  FileText,
  Sparkles,
  Layers,
  ChevronRight,
  HardDrive,
  Users,
  CheckCircle2,
  Lock,
  ExternalLink,
  Search,
  Shield,
  Send,
  Zap,
} from 'lucide-react';
import {
  PhotoAlbum,
  DocumentFolder,
  DocumentAsset,
} from '../../data/documentCenterData';

interface DocumentCategoryGroupViewProps {
  userAlbums?: PhotoAlbum[];
  groupSyncedAlbums?: PhotoAlbum[];
  userFolders?: DocumentFolder[];
  groupSyncedFolders?: DocumentFolder[];
  onOpenAlbum: (album: PhotoAlbum) => void;
  onOpenFolder: (folder: DocumentFolder) => void;
  onOpenGroupAssets: (convId: string, groupName: string, avatar?: string) => void;
  onCreateNewAlbum: () => void;
  onCreateNewFolder: () => void;
  onPreviewAsset?: (asset: DocumentAsset) => void;
}

export const DocumentCategoryGroupView: React.FC<DocumentCategoryGroupViewProps> = ({
  userAlbums = [],
  groupSyncedAlbums = [],
  userFolders = [],
  groupSyncedFolders = [],
  onOpenAlbum,
  onOpenFolder,
  onOpenGroupAssets,
  onCreateNewAlbum,
  onCreateNewFolder,
}) => {
  // Circles / Group Filter dropdown
  const [selectedCircle, setSelectedCircle] = useState<string>('all');
  const [isCircleDropdownOpen, setIsCircleDropdownOpen] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);

  // Extract unique group circles from synced albums/folders
  const groupCircles = useMemo(() => {
    const map = new Map<string, { id: string; name: string; avatar?: string }>();

    groupSyncedAlbums.forEach((a) => {
      if (a.groupSourceId) {
        map.set(a.groupSourceId, {
          id: a.groupSourceId,
          name: a.name,
          avatar: a.groupAvatar,
        });
      }
    });

    groupSyncedFolders.forEach((f) => {
      if (f.groupSourceId && !map.has(f.groupSourceId)) {
        map.set(f.groupSourceId, {
          id: f.groupSourceId,
          name: f.name.replace(' 共享文档', ''),
          avatar: f.groupAvatar,
        });
      }
    });

    return Array.from(map.values());
  }, [groupSyncedAlbums, groupSyncedFolders]);

  // Active circle label
  const currentCircleLabel = useMemo(() => {
    if (selectedCircle === 'all') return '全部空间与圈子';
    if (selectedCircle === 'personal') return '个人专属私密空间';
    const found = groupCircles.find((c) => c.id === selectedCircle);
    return found ? found.name : '全部空间';
  }, [selectedCircle, groupCircles]);

  // Calculate top summary stats
  const totalDocCount = useMemo(() => {
    return (
      userFolders.reduce((acc, f) => acc + f.fileCount, 0) +
      groupSyncedFolders.reduce((acc, f) => acc + f.fileCount, 0)
    );
  }, [userFolders, groupSyncedFolders]);

  const totalAlbumCount = useMemo(() => {
    return (
      userAlbums.reduce((acc, a) => acc + a.photoCount, 0) +
      groupSyncedAlbums.reduce((acc, a) => acc + a.photoCount, 0)
    );
  }, [userAlbums, groupSyncedAlbums]);

  return (
    <div className="space-y-6 pb-12 pt-1 px-1">
      {/* =================================================================== */}
      {/* 1. TOP BAR (空间切换下拉框 + 蓝色加号按钮)                         */}
      {/* =================================================================== */}
      <div className="flex items-center justify-between relative z-20">
        {/* Dropdown Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsCircleDropdownOpen(!isCircleDropdownOpen)}
            className="flex items-center space-x-2 px-3 py-1.5 -ml-2 rounded-2xl hover:bg-white/80 transition-colors cursor-pointer"
          >
            <h1 className="text-2xl font-black text-[#050505] tracking-tight">
              {currentCircleLabel}
            </h1>
            <ChevronDown size={18} className="text-[#050505] stroke-[2.5]" />
          </button>

          {/* Circle Switcher Menu */}
          {isCircleDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setIsCircleDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-3xl p-2 border border-gray-200/90 shadow-xl z-30 animate-in fade-in zoom-in-95 duration-150 font-sans">
                <div className="p-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  切换所属空间 / 群聊圈子
                </div>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCircle('all');
                      setIsCircleDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-bold transition-colors cursor-pointer ${
                      selectedCircle === 'all'
                        ? 'bg-blue-50 text-[#1877F2]'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-100/70 text-[#1877F2] flex items-center justify-center">
                        <Layers size={16} />
                      </div>
                      <span>全部圈子与个人空间</span>
                    </div>
                    {selectedCircle === 'all' && <CheckCircle2 size={16} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCircle('personal');
                      setIsCircleDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-bold transition-colors cursor-pointer ${
                      selectedCircle === 'personal'
                        ? 'bg-blue-50 text-[#1877F2]'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                        <Lock size={16} />
                      </div>
                      <span>个人私密专属空间</span>
                    </div>
                    {selectedCircle === 'personal' && <CheckCircle2 size={16} />}
                  </button>

                  {groupCircles.map((circle) => (
                    <button
                      key={`dd-circle-${circle.id}`}
                      type="button"
                      onClick={() => {
                        setSelectedCircle(circle.id);
                        setIsCircleDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-bold transition-colors cursor-pointer ${
                        selectedCircle === circle.id
                          ? 'bg-blue-50 text-[#1877F2]'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={
                            circle.avatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
                          }
                          alt={circle.name}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-xl object-cover ring-1 ring-gray-200"
                        />
                        <span className="truncate max-w-[150px]">{circle.name}</span>
                      </div>
                      {selectedCircle === circle.id && <CheckCircle2 size={16} />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
              className="w-10 h-10 rounded-full bg-[#1877F2] hover:bg-[#166FE5] text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
              title="新建相册或文件夹"
            >
              <Plus size={20} className="stroke-[2.5]" />
            </button>

            {isCreateMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsCreateMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-3xl p-2 border border-gray-200 shadow-xl z-30 animate-in fade-in zoom-in-95 duration-150 space-y-1 font-sans">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateMenuOpen(false);
                      onCreateNewAlbum();
                    }}
                    className="w-full flex items-center space-x-2.5 p-2.5 rounded-2xl hover:bg-gray-100 text-xs font-bold text-[#050505] cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <ImageIcon size={16} />
                    </div>
                    <span>新建个人相册</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateMenuOpen(false);
                      onCreateNewFolder();
                    }}
                    className="w-full flex items-center space-x-2.5 p-2.5 rounded-2xl hover:bg-gray-100 text-xs font-bold text-[#050505] cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-xl bg-blue-50 text-[#1877F2] flex items-center justify-center">
                      <Folder size={16} />
                    </div>
                    <span>新建文档文件夹</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. STAT SUMMARY 2x2 GRID (Screen 2 顶层四宫格数据概览)            */}
      {/* =================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Card 1: Documents */}
        <div className="p-4 rounded-3xl bg-white border border-gray-200/80 shadow-2xs flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <FileText size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <h4 className="text-xs font-black text-[#050505]">文档与合同</h4>
            <p className="text-[11px] font-semibold text-[#65676B]">{totalDocCount} 份已同步</p>
          </div>
        </div>

        {/* Card 2: Albums */}
        <div className="p-4 rounded-3xl bg-white border border-gray-200/80 shadow-2xs flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#1877F2] flex items-center justify-center shrink-0 border border-blue-100">
            <ImageIcon size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <h4 className="text-xs font-black text-[#050505]">相册与媒体</h4>
            <p className="text-[11px] font-semibold text-[#65676B]">{totalAlbumCount} 张高清原图</p>
          </div>
        </div>

        {/* Card 3: AI Intelligence */}
        <div className="p-4 rounded-3xl bg-white border border-gray-200/80 shadow-2xs flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <Sparkles size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <h4 className="text-xs font-black text-[#050505]">AI 语义归类</h4>
            <p className="text-[11px] font-semibold text-[#65676B]">8 大语义分类簇</p>
          </div>
        </div>

        {/* Card 4: Cloud Storage */}
        <div className="p-4 rounded-3xl bg-white border border-gray-200/80 shadow-2xs flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <HardDrive size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <h4 className="text-xs font-black text-[#050505]">云端已用空间</h4>
            <p className="text-[11px] font-semibold text-[#65676B]">4.2 GB / 50 GB</p>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. GROUP CIRCLE SECTIONS (群组自动同步专属目录，带群组头像遮罩)      */}
      {/* =================================================================== */}
      {selectedCircle !== 'personal' && (
        <div className="space-y-6">
          {groupCircles
            .filter((c) => selectedCircle === 'all' || selectedCircle === c.id)
            .map((circle) => {
              const circleAlbums = groupSyncedAlbums.filter(
                (a) => a.groupSourceId === circle.id
              );
              const circleFolders = groupSyncedFolders.filter(
                (f) => f.groupSourceId === circle.id
              );

              return (
                <section
                  key={`sec-circle-${circle.id}`}
                  className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-2xs space-y-4"
                >
                  {/* Section Title with Group Avatar & Indicator */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => onOpenGroupAssets(circle.id, circle.name, circle.avatar)}
                      className="group flex items-center space-x-2.5 text-left cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-blue-100 shadow-2xs">
                        <img
                          src={
                            circle.avatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
                          }
                          alt={circle.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-[#050505] tracking-tight group-hover:text-[#1877F2] transition-colors flex items-center space-x-1.5">
                          <span>{circle.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-[#1877F2] font-black border border-blue-100">
                            群组自动同步
                          </span>
                          <ChevronRight
                            size={16}
                            className="text-gray-400 group-hover:translate-x-0.5 transition-transform"
                          />
                        </h3>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenGroupAssets(circle.id, circle.name, circle.avatar)}
                      className="text-xs font-bold text-[#1877F2] hover:underline cursor-pointer"
                    >
                      进入群资产中心
                    </button>
                  </div>

                  {/* Sub-presets row */}
                  <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
                    <button
                      type="button"
                      onClick={() => onOpenGroupAssets(circle.id, circle.name, circle.avatar)}
                      className="shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 text-xs font-black hover:bg-amber-100 transition-colors border border-amber-100 cursor-pointer"
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>相片与媒体 ({circleAlbums.reduce((a, b) => a + b.photoCount, 0)})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenGroupAssets(circle.id, circle.name, circle.avatar)}
                      className="shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-[#1877F2] text-xs font-black hover:bg-blue-100 transition-colors border border-blue-100 cursor-pointer"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#1877F2]" />
                      <span>共享文件 ({circleFolders.reduce((a, b) => a + b.fileCount, 0)})</span>
                    </button>
                  </div>

                  {/* Grid Cards with Group Avatar Mask Overlay Badge */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {circleAlbums.map((album) => (
                      <div
                        key={`grp-album-${album.id}`}
                        onClick={() => onOpenGroupAssets(circle.id, circle.name, circle.avatar)}
                        className="group relative p-4 rounded-3xl bg-white hover:bg-blue-50/40 border border-gray-200/80 hover:border-[#1877F2]/50 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between min-h-[118px]"
                      >
                        <div className="flex items-start justify-between">
                          {/* Group Avatar Mask on Album Thumbnail */}
                          <div className="relative">
                            <div className="w-11 h-11 rounded-2xl overflow-hidden ring-2 ring-amber-100 shadow-2xs">
                              <img
                                src={circle.avatar}
                                alt={album.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            {/* Avatar Mask Badge */}
                            <div className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px] font-black ring-2 ring-white shadow-2xs">
                              群相册
                            </div>
                          </div>
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white shadow-2xs" />
                        </div>

                        <div className="mt-3">
                          <h4 className="text-xs font-black text-[#050505] truncate group-hover:text-[#1877F2] transition-colors">
                            {album.name}
                          </h4>
                          <p className="text-[11px] text-[#65676B] font-semibold mt-0.5 flex items-center justify-between">
                            <span>{album.photoCount} 张相片</span>
                            <span className="text-[9.5px] px-1.5 py-0.2 rounded-md bg-amber-50 text-amber-700 font-bold">
                              群同步
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}

                    {circleFolders.map((folder) => (
                      <div
                        key={`grp-folder-${folder.id}`}
                        onClick={() => onOpenGroupAssets(circle.id, circle.name, circle.avatar)}
                        className="group relative p-4 rounded-3xl bg-white hover:bg-blue-50/40 border border-gray-200/80 hover:border-[#1877F2]/50 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between min-h-[118px]"
                      >
                        <div className="flex items-start justify-between">
                          {/* Group Avatar Mask on Folder Thumbnail */}
                          <div className="relative">
                            <div className="w-11 h-11 rounded-2xl overflow-hidden ring-2 ring-emerald-100 shadow-2xs">
                              <img
                                src={circle.avatar}
                                alt={folder.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-[#42B72A] text-white flex items-center justify-center text-[9px] font-black ring-2 ring-white shadow-2xs">
                              群文档
                            </div>
                          </div>
                          <span className="w-2.5 h-2.5 rounded-full bg-[#42B72A] ring-2 ring-white shadow-2xs" />
                        </div>

                        <div className="mt-3">
                          <h4 className="text-xs font-black text-[#050505] truncate group-hover:text-[#1877F2] transition-colors">
                            {folder.name}
                          </h4>
                          <p className="text-[11px] text-[#65676B] font-semibold mt-0.5 flex items-center justify-between">
                            <span>{folder.fileCount} 份文档</span>
                            <span className="text-[9.5px] px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 font-bold">
                              群同步
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. 个人专属私密空间 (Personal Vault / User-Created Directories)    */}
      {/* =================================================================== */}
      {(selectedCircle === 'all' || selectedCircle === 'personal') && (
        <section className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-2xs">
                <Lock size={16} />
              </div>
              <div>
                <h3 className="text-base font-black text-[#050505] tracking-tight flex items-center space-x-1.5">
                  <span>个人专属私密空间</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-black border border-purple-100">
                    仅个人可见
                  </span>
                </h3>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onCreateNewAlbum}
                className="text-xs font-bold text-[#1877F2] hover:underline cursor-pointer"
              >
                + 新建相册
              </button>
              <span className="text-gray-300">·</span>
              <button
                type="button"
                onClick={onCreateNewFolder}
                className="text-xs font-bold text-[#1877F2] hover:underline cursor-pointer"
              >
                + 新建文件夹
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {userAlbums.map((album) => (
              <div
                key={`usr-album-${album.id}`}
                onClick={() => onOpenAlbum(album)}
                className="group relative p-4 rounded-3xl bg-white hover:bg-purple-50/30 border border-gray-200/80 hover:border-purple-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between min-h-[118px]"
              >
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-2xs border border-purple-100">
                    <ImageIcon size={22} className="stroke-[2.2]" />
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 ring-2 ring-white shadow-2xs" />
                </div>
                <div className="mt-3">
                  <h4 className="text-xs font-black text-[#050505] truncate group-hover:text-[#1877F2] transition-colors">
                    {album.name}
                  </h4>
                  <p className="text-[11px] text-[#65676B] font-semibold mt-0.5 flex items-center justify-between">
                    <span>{album.photoCount} 张相片</span>
                    <span className="text-[9.5px] px-1.5 py-0.2 rounded-md bg-purple-50 text-purple-700 font-bold">
                      个人私密
                    </span>
                  </p>
                </div>
              </div>
            ))}

            {userFolders.map((folder) => (
              <div
                key={`usr-folder-${folder.id}`}
                onClick={() => onOpenFolder(folder)}
                className="group relative p-4 rounded-3xl bg-white hover:bg-blue-50/30 border border-gray-200/80 hover:border-blue-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between min-h-[118px]"
              >
                <div className="flex items-start justify-between">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-2xs"
                    style={{ backgroundColor: folder.color || '#1877F2' }}
                  >
                    <Folder size={22} className="stroke-[2.2]" />
                  </div>
                  <span
                    className="w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-2xs"
                    style={{ backgroundColor: folder.color || '#1877F2' }}
                  />
                </div>
                <div className="mt-3">
                  <h4 className="text-xs font-black text-[#050505] truncate group-hover:text-[#1877F2] transition-colors">
                    {folder.name}
                  </h4>
                  <p className="text-[11px] text-[#65676B] font-semibold mt-0.5 flex items-center justify-between">
                    <span>{folder.fileCount} 份文件</span>
                    <span className="text-[9.5px] px-1.5 py-0.2 rounded-md bg-blue-50 text-[#1877F2] font-bold">
                      个人专属
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
