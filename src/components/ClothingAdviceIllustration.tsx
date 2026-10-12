import React, { useState } from 'react';
import { Shirt, Sparkles, ChevronRight, Info } from 'lucide-react';

interface ClothingAdviceIllustrationProps {
  tempStr?: string;
  adviceText?: string;
}

interface ClothingItem {
  id: string;
  name: string;
  category: string;
  tip: string;
  colorName: string;
  illustration: React.ReactNode;
}

// 1. Vector Clothing Illustrations
const TrenchCoatSVG = () => (
  <svg viewBox="0 0 64 64" className="w-10 h-10 drop-shadow-xs" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Collar / Lapel */}
    <path d="M22 10 L32 24 L42 10 L35 8 L29 8 Z" fill="#D4A373" stroke="#8D5B2A" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M22 10 L28 22 L20 22 Z" fill="#C5925E" stroke="#8D5B2A" strokeWidth="1.2" />
    <path d="M42 10 L36 22 L44 22 Z" fill="#C5925E" stroke="#8D5B2A" strokeWidth="1.2" />
    {/* Body */}
    <path d="M20 22 L17 56 L47 56 L44 22 Z" fill="#E6CCB2" stroke="#8D5B2A" strokeWidth="1.5" strokeLinejoin="round" />
    {/* Overlapping flap */}
    <path d="M28 22 L25 56" stroke="#8D5B2A" strokeWidth="1.5" strokeDasharray="1 1" />
    <path d="M34 22 L31 56" stroke="#8D5B2A" strokeWidth="1.5" />
    {/* Belt */}
    <rect x="18" y="34" width="28" height="4" rx="1" fill="#BB8551" stroke="#6F4518" strokeWidth="1" />
    <rect x="30" y="33" width="5" height="6" rx="0.5" fill="#EAE0D5" stroke="#6F4518" strokeWidth="1" />
    {/* Sleeves */}
    <path d="M20 14 L10 32 L15 35 L22 22 Z" fill="#D4A373" stroke="#8D5B2A" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M44 14 L54 32 L49 35 L42 22 Z" fill="#D4A373" stroke="#8D5B2A" strokeWidth="1.5" strokeLinejoin="round" />
    {/* Sleeve straps */}
    <line x1="11" y1="30" x2="15" y2="32" stroke="#6F4518" strokeWidth="1.2" />
    <line x1="53" y1="30" x2="49" y2="32" stroke="#6F4518" strokeWidth="1.2" />
    {/* Buttons */}
    <circle cx="28" cy="28" r="1.5" fill="#583101" />
    <circle cx="27" cy="44" r="1.5" fill="#583101" />
    <circle cx="26" cy="50" r="1.5" fill="#583101" />
  </svg>
);

const SweaterSVG = () => (
  <svg viewBox="0 0 64 64" className="w-10 h-10 drop-shadow-xs" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Ribbed Hem / Cuffs fill */}
    <path d="M21 16 C26 21 38 21 43 16 L49 24 L45 28 L43 23 L43 50 L21 50 L21 23 L19 28 L15 24 Z" fill="#9381FF" />
    {/* Body */}
    <path d="M21 20 L43 20 L44 50 L20 50 Z" fill="#B8B8FF" stroke="#6957E6" strokeWidth="1.5" strokeLinejoin="round" />
    {/* Collar ribbing */}
    <path d="M22 16 C27 21 37 21 42 16 C39 13 25 13 22 16 Z" fill="#7866EE" stroke="#5643D8" strokeWidth="1.2" />
    {/* Sleeves */}
    <path d="M21 20 L11 36 L16 40 L22 26 Z" fill="#B8B8FF" stroke="#6957E6" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M43 20 L53 36 L48 40 L42 26 Z" fill="#B8B8FF" stroke="#6957E6" strokeWidth="1.5" strokeLinejoin="round" />
    {/* Cuffs and Bottom Ribbing */}
    <rect x="20" y="47" width="24" height="4" rx="1" fill="#7866EE" stroke="#5643D8" strokeWidth="1" />
    <path d="M11 34 L15 38 L16 36 L12 32 Z" fill="#7866EE" />
    <path d="M53 34 L49 38 L48 36 L52 32 Z" fill="#7866EE" />
    {/* Knit texture lines */}
    <line x1="28" y1="26" x2="28" y2="44" stroke="#8F80F4" strokeWidth="1" strokeDasharray="2 2" />
    <line x1="36" y1="26" x2="36" y2="44" stroke="#8F80F4" strokeWidth="1" strokeDasharray="2 2" />
  </svg>
);

const LongSleeveShirtSVG = () => (
  <svg viewBox="0 0 64 64" className="w-10 h-10 drop-shadow-xs" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Collar */}
    <path d="M24 14 L32 20 L40 14 L35 11 L29 11 Z" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.2" />
    {/* Body */}
    <path d="M22 18 L19 52 L45 52 L42 18 Z" fill="#F8FAFC" stroke="#64748B" strokeWidth="1.5" strokeLinejoin="round" />
    {/* Placket */}
    <line x1="32" y1="20" x2="32" y2="52" stroke="#94A3B8" strokeWidth="1.5" />
    {/* Pocket */}
    <rect x="24" y="26" width="6" height="7" rx="0.5" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
    {/* Sleeves */}
    <path d="M22 18 L12 38 L16 40 L23 24 Z" fill="#F8FAFC" stroke="#64748B" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M42 18 L52 38 L48 40 L41 24 Z" fill="#F8FAFC" stroke="#64748B" strokeWidth="1.5" strokeLinejoin="round" />
    {/* Cuffs */}
    <rect x="12" y="37" width="5" height="3" rx="0.5" fill="#CBD5E1" stroke="#64748B" strokeWidth="1" />
    <rect x="47" y="37" width="5" height="3" rx="0.5" fill="#CBD5E1" stroke="#64748B" strokeWidth="1" />
    {/* Buttons */}
    <circle cx="32" cy="26" r="1.2" fill="#475569" />
    <circle cx="32" cy="34" r="1.2" fill="#475569" />
    <circle cx="32" cy="42" r="1.2" fill="#475569" />
  </svg>
);

const TrousersSVG = () => (
  <svg viewBox="0 0 64 64" className="w-10 h-10 drop-shadow-xs" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Waistband */}
    <rect x="20" y="10" width="24" height="4" rx="1" fill="#334155" stroke="#1E293B" strokeWidth="1.2" />
    {/* Belt Loops */}
    <line x1="24" y1="10" x2="24" y2="14" stroke="#64748B" strokeWidth="1" />
    <line x1="32" y1="10" x2="32" y2="14" stroke="#64748B" strokeWidth="1" />
    <line x1="40" y1="10" x2="40" y2="14" stroke="#64748B" strokeWidth="1" />
    {/* Legs */}
    <path
      d="M20 14 L23 54 L30 54 L32 30 L34 54 L41 54 L44 14 Z"
      fill="#475569"
      stroke="#1E293B"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Fly & Pockets */}
    <path d="M32 14 L32 26" stroke="#1E293B" strokeWidth="1.2" />
    <path d="M22 16 C25 18 26 21 26 24" stroke="#64748B" strokeWidth="1" />
    <path d="M42 16 C39 18 38 21 38 24" stroke="#64748B" strokeWidth="1" />
    {/* Creases */}
    <line x1="26.5" y1="28" x2="26.5" y2="52" stroke="#334155" strokeWidth="1" />
    <line x1="37.5" y1="28" x2="37.5" y2="52" stroke="#334155" strokeWidth="1" />
    {/* Hem cuffs */}
    <rect x="23" y="52" width="7" height="3" rx="0.5" fill="#334155" stroke="#1E293B" strokeWidth="1" />
    <rect x="34" y="52" width="7" height="3" rx="0.5" fill="#334155" stroke="#1E293B" strokeWidth="1" />
  </svg>
);

const DownJacketSVG = () => (
  <svg viewBox="0 0 64 64" className="w-10 h-10 drop-shadow-xs" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Hood */}
    <path d="M22 16 C24 8 40 8 42 16 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="1.2" />
    {/* Puffy Body */}
    <rect x="18" y="18" width="28" height="36" rx="4" fill="#2563EB" stroke="#1D4ED8" strokeWidth="1.5" />
    {/* Baffles */}
    <line x1="18" y1="27" x2="46" y2="27" stroke="#1D4ED8" strokeWidth="1.5" />
    <line x1="18" y1="36" x2="46" y2="36" stroke="#1D4ED8" strokeWidth="1.5" />
    <line x1="18" y1="45" x2="46" y2="45" stroke="#1D4ED8" strokeWidth="1.5" />
    {/* Front Zipper */}
    <line x1="32" y1="16" x2="32" y2="54" stroke="#93C5FD" strokeWidth="1.5" />
    {/* Puffy Sleeves */}
    <path d="M18 20 C12 26 10 36 12 44 L17 44 C15 36 17 28 20 22 Z" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="1.2" />
    <path d="M46 20 C52 26 54 36 52 44 L47 44 C49 36 47 28 44 22 Z" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="1.2" />
  </svg>
);

const TShirtSVG = () => (
  <svg viewBox="0 0 64 64" className="w-10 h-10 drop-shadow-xs" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Collar */}
    <path d="M24 14 C28 19 36 19 40 14 C37 12 27 12 24 14 Z" fill="#0EA5E9" stroke="#0284C7" strokeWidth="1.2" />
    {/* Body */}
    <path d="M22 16 L20 48 L44 48 L42 16 Z" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" strokeLinejoin="round" />
    {/* Short Sleeves */}
    <path d="M22 16 L12 26 L16 30 L23 22 Z" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M42 16 L52 26 L48 30 L41 22 Z" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" strokeLinejoin="round" />
    {/* Pocket or Motif */}
    <rect x="25" y="24" width="5" height="6" rx="0.5" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1" />
  </svg>
);

export const ClothingAdviceIllustration: React.FC<ClothingAdviceIllustrationProps> = ({
  tempStr = '16°C',
  adviceText = '气温偏冷，推荐风衣、薄毛衣或保暖厚长袖，随时注意早晚保暖。',
}) => {
  const temp = parseInt(tempStr) || 16;
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  // Derive outfit items and theme based on current temperature
  const getOutfitScheme = () => {
    if (temp < 12) {
      return {
        levelBadge: '寒冷体感 · 保暖防寒',
        levelColor: 'bg-indigo-50 border-indigo-200 text-indigo-700',
        items: [
          {
            id: 'down',
            name: '加厚羽绒服',
            category: '防寒外套',
            tip: '锁温抗风，抵御低温与冷空气',
            colorName: '克莱因蓝',
            illustration: <DownJacketSVG />,
          },
          {
            id: 'sweater',
            name: '羊毛毛衣',
            category: '保暖中层',
            tip: '密织羊毛针织，贴身锁住体温',
            colorName: '香芋紫',
            illustration: <SweaterSVG />,
          },
          {
            id: 'pants',
            name: '加绒保暖裤',
            category: '下装防寒',
            tip: '防风挺括外层，内里加绒蓄热',
            colorName: '深碳灰',
            illustration: <TrousersSVG />,
          },
        ],
      };
    } else if (temp < 18) {
      // 12°C - 17°C (like the 16°C in user's screenshot!)
      return {
        levelBadge: '偏冷体感 · 适宜2~3件叠穿',
        levelColor: 'bg-blue-50 border-blue-200 text-[#1877F2]',
        items: [
          {
            id: 'trench',
            name: '英伦风衣',
            category: '防风外搭',
            tip: '长款过膝挡风，早晚出行必备',
            colorName: '经典卡其',
            illustration: <TrenchCoatSVG />,
          },
          {
            id: 'sweater',
            name: '针织薄毛衣',
            category: '舒适中层',
            tip: '轻柔针织触感，体感温润不闷',
            colorName: '雾霾蓝紫',
            illustration: <SweaterSVG />,
          },
          {
            id: 'shirt',
            name: '保暖长袖',
            category: '贴身打底',
            tip: '纯棉透气厚长袖，亲肤温软',
            colorName: '浅灰白',
            illustration: <LongSleeveShirtSVG />,
          },
          {
            id: 'pants',
            name: '直筒休闲裤',
            category: '利落搭下装',
            tip: '防风微弹面料，舒适好活动',
            colorName: '藏青灰',
            illustration: <TrousersSVG />,
          },
        ],
      };
    } else if (temp < 24) {
      // 18°C - 23°C
      return {
        levelBadge: '微凉宜人 · 休闲轻装',
        levelColor: 'bg-emerald-50 border-emerald-200 text-emerald-700',
        items: [
          {
            id: 'shirt',
            name: '休闲长袖衬衫',
            category: '早晚外搭',
            tip: '单穿或内搭短袖敞开穿均可',
            colorName: '清爽浅蓝',
            illustration: <LongSleeveShirtSVG />,
          },
          {
            id: 'tshirt',
            name: '透气纯棉T恤',
            category: '亲肤打底',
            tip: '高支纯棉，出汗吸湿排汗快',
            colorName: '天蓝色',
            illustration: <TShirtSVG />,
          },
          {
            id: 'pants',
            name: '轻便长裤',
            category: '下装搭配',
            tip: '轻薄棉质休闲裤，透气清爽',
            colorName: '深石灰',
            illustration: <TrousersSVG />,
          },
        ],
      };
    } else {
      // ≥ 24°C
      return {
        levelBadge: '温暖晴热 · 清凉透气',
        levelColor: 'bg-amber-50 border-amber-200 text-amber-700',
        items: [
          {
            id: 'tshirt',
            name: '速干短袖T恤',
            category: '清凉上衣',
            tip: '轻薄透气面料，防晒防闷热',
            colorName: '晴空蓝',
            illustration: <TShirtSVG />,
          },
          {
            id: 'shirt',
            name: '防晒薄开衫',
            category: '随身备用',
            tip: '室内空调房或暴晒时披上防晒',
            colorName: '雪白',
            illustration: <LongSleeveShirtSVG />,
          },
          {
            id: 'pants',
            name: '透气休闲长裤',
            category: '轻薄下装',
            tip: '亚麻或混纺面料，防晒且透风',
            colorName: '浅卡其',
            illustration: <TrousersSVG />,
          },
        ],
      };
    }
  };

  const scheme = getOutfitScheme();

  return (
    <div
      id="clothing-advice-illustration-card"
      className="relative z-10 bg-white border border-[#E4E6EB] rounded-md p-2.5 shadow-2xs space-y-2 select-none"
    >
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <div className="w-5 h-5 rounded bg-blue-50 border border-blue-200 text-[#1877F2] flex items-center justify-center">
            <Shirt size={12} className="stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-black text-[#050505]">穿衣推荐</span>
          <span className="text-[9px] text-gray-400 font-normal">|</span>
          <span className="text-[9.5px] text-[#65676B] font-medium">当前气温 {tempStr}</span>
        </div>

        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${scheme.levelColor}`}>
          {scheme.levelBadge}
        </span>
      </div>

      {/* 2. Visual Clothing Illustrations Grid (服装插画) */}
      <div className="grid grid-cols-4 gap-1.5 pt-0.5">
        {scheme.items.map((item, itemIdx) => {
          const isSelected = selectedItem === item.id;
          return (
            <div
              key={`cloth-item-${item.id}-${itemIdx}`}
              onClick={() => setSelectedItem(isSelected ? null : item.id)}
              className={`bg-[#F0F2F5]/80 hover:bg-blue-50/70 border ${
                isSelected ? 'border-[#1877F2] bg-blue-50/80 ring-1 ring-[#1877F2]/30' : 'border-[#E4E6EB]'
              } rounded-md p-1.5 flex flex-col items-center justify-between text-center transition-all cursor-pointer shadow-2xs min-h-[76px]`}
              title={`${item.name} · ${item.tip}`}
            >
              {/* Illustration graphic */}
              <div className="w-9 h-9 flex items-center justify-center shrink-0">
                {item.illustration}
              </div>

              {/* Text label */}
              <div className="w-full mt-1">
                <span className="text-[9.5px] font-black text-[#050505] block leading-tight truncate">
                  {item.name}
                </span>
                <span className="text-[8px] text-[#65676B] block leading-none mt-0.5 truncate">
                  {item.category}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Detailed Text Advice (文字展示) */}
      <div className="bg-[#F0F2F5]/90 border border-[#E4E6EB] rounded p-2 flex items-start space-x-1.5">
        <span className="text-xs shrink-0 mt-0.5">👔</span>
        <div className="flex-1 min-w-0">
          <p className="text-[9.5px] text-[#050505] font-medium leading-relaxed">
            {selectedItem
              ? scheme.items.find((i) => i.id === selectedItem)?.tip
              : adviceText}
          </p>
          <div className="flex flex-wrap items-center gap-1 mt-1">
            <span className="text-[8.5px] bg-white border border-[#E4E6EB] text-[#1877F2] px-1 py-0.2 rounded font-bold">
              早晚温差防风
            </span>
            <span className="text-[8.5px] bg-white border border-[#E4E6EB] text-emerald-700 px-1 py-0.2 rounded font-bold">
              多层分体叠穿
            </span>
            <span className="text-[8.5px] bg-white border border-[#E4E6EB] text-gray-600 px-1 py-0.2 rounded">
              点击插画查看搭配说明
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
