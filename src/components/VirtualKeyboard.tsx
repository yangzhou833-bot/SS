import React, { useState } from 'react';
import {
  Delete,
  CornerDownLeft,
  Globe,
  Smile,
  Mic,
  ChevronDown,
  ArrowUp,
  Space,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VirtualKeyboardProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyPress: (char: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  onSpace: () => void;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  isOpen,
  onClose,
  onKeyPress,
  onDelete,
  onSubmit,
  onSpace,
}) => {
  const [isUppercase, setIsUppercase] = useState(false);
  const [keyboardMode, setKeyboardMode] = useState<'pinyin' | '123' | 'emoji'>('pinyin');

  if (!isOpen) return null;

  const pinyinRow1 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
  const pinyinRow2 = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
  const pinyinRow3 = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];

  const numRow1 = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  const numRow2 = ['-', '/', ':', ';', '(', ')', '$', '&', '@', '"'];
  const numRow3 = ['.', ',', '?', '!', "'", '#', '%', '*', '+', '='];

  const emojis = [
    '😊', '😂', '🤣', '❤️', '👍', '🙏', '🔥', '✨',
    '😍', '🥰', '😘', '👏', '🤝', '🎉', '🌟', '☕',
    '😎', '🤔', '🥺', '😭', '💪', '👌', '⚡', '🏖️'
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-60 bg-[#D1D5DB] pb-6 pt-2 px-1.5 shadow-[0_-8px_30px_rgba(0,0,0,0.2)] select-none border-t border-gray-300 font-sans animate-in slide-in-from-bottom duration-200">
      {/* Top Accessory Bar */}
      <div className="flex items-center justify-between px-3 pb-2 text-gray-600 text-xs font-semibold">
        <div className="flex items-center space-x-2">
          <span className="bg-white/80 px-2 py-0.5 rounded-md text-[11px] text-gray-700 shadow-2xs">
            {keyboardMode === 'pinyin' ? '中文 拼音 9键/全键盘' : keyboardMode === '123' ? '数字/符号' : '表情符号'}
          </span>
        </div>
        <button
          onClick={onClose}
          className="flex items-center space-x-1 bg-white/80 px-2.5 py-1 rounded-md text-[11px] font-bold text-gray-700 active:bg-gray-200 cursor-pointer shadow-2xs"
          title="收起键盘"
        >
          <ChevronDown size={14} />
          <span>收起</span>
        </button>
      </div>

      {/* Main Keys Container */}
      <div className="space-y-2 max-w-lg mx-auto">
        {keyboardMode === 'pinyin' && (
          <>
            {/* Row 1 */}
            <div className="flex justify-center space-x-1.5">
              {pinyinRow1.map((k) => (
                <button
                  key={`p1-${k}`}
                  onClick={() => onKeyPress(isUppercase ? k.toUpperCase() : k)}
                  className="flex-1 max-w-[36px] h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-base font-medium text-gray-900 active:bg-gray-300 transition-colors cursor-pointer"
                >
                  {isUppercase ? k.toUpperCase() : k}
                </button>
              ))}
            </div>

            {/* Row 2 */}
            <div className="flex justify-center space-x-1.5 px-2">
              {pinyinRow2.map((k) => (
                <button
                  key={`p2-${k}`}
                  onClick={() => onKeyPress(isUppercase ? k.toUpperCase() : k)}
                  className="flex-1 max-w-[36px] h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-base font-medium text-gray-900 active:bg-gray-300 transition-colors cursor-pointer"
                >
                  {isUppercase ? k.toUpperCase() : k}
                </button>
              ))}
            </div>

            {/* Row 3 with Shift and Delete */}
            <div className="flex justify-center space-x-1.5">
              {/* Shift */}
              <button
                onClick={() => setIsUppercase(!isUppercase)}
                className={`w-11 h-10 rounded-lg shadow-sm flex items-center justify-center font-bold text-sm cursor-pointer transition-colors ${
                  isUppercase ? 'bg-white text-[#1877F2]' : 'bg-[#AEB3BE] text-gray-800'
                }`}
              >
                <ArrowUp size={18} />
              </button>

              {pinyinRow3.map((k) => (
                <button
                  key={`p3-${k}`}
                  onClick={() => onKeyPress(isUppercase ? k.toUpperCase() : k)}
                  className="flex-1 max-w-[36px] h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-base font-medium text-gray-900 active:bg-gray-300 transition-colors cursor-pointer"
                >
                  {isUppercase ? k.toUpperCase() : k}
                </button>
              ))}

              {/* Delete */}
              <button
                onClick={onDelete}
                className="w-11 h-10 bg-[#AEB3BE] rounded-lg shadow-sm flex items-center justify-center text-gray-800 active:bg-gray-400 cursor-pointer"
              >
                <Delete size={18} />
              </button>
            </div>
          </>
        )}

        {keyboardMode === '123' && (
          <>
            {/* Number Row 1 */}
            <div className="flex justify-center space-x-1.5">
              {numRow1.map((k) => (
                <button
                  key={`n1-${k}`}
                  onClick={() => onKeyPress(k)}
                  className="flex-1 max-w-[36px] h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-base font-medium text-gray-900 active:bg-gray-300 transition-colors cursor-pointer"
                >
                  {k}
                </button>
              ))}
            </div>
            {/* Number Row 2 */}
            <div className="flex justify-center space-x-1.5">
              {numRow2.map((k) => (
                <button
                  key={`n2-${k}`}
                  onClick={() => onKeyPress(k)}
                  className="flex-1 max-w-[36px] h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-base font-medium text-gray-900 active:bg-gray-300 transition-colors cursor-pointer"
                >
                  {k}
                </button>
              ))}
            </div>
            {/* Number Row 3 */}
            <div className="flex justify-center space-x-1.5">
              {numRow3.map((k) => (
                <button
                  key={`n3-${k}`}
                  onClick={() => onKeyPress(k)}
                  className="flex-1 max-w-[36px] h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-base font-medium text-gray-900 active:bg-gray-300 transition-colors cursor-pointer"
                >
                  {k}
                </button>
              ))}
              <button
                onClick={onDelete}
                className="w-11 h-10 bg-[#AEB3BE] rounded-lg shadow-sm flex items-center justify-center text-gray-800 active:bg-gray-400 cursor-pointer"
              >
                <Delete size={18} />
              </button>
            </div>
          </>
        )}

        {keyboardMode === 'emoji' && (
          <div className="grid grid-cols-8 gap-1.5 bg-white/70 p-2 rounded-xl h-32 overflow-y-auto">
            {emojis.map((em, idx) => (
              <button
                key={idx}
                onClick={() => onKeyPress(em)}
                className="h-9 rounded-lg bg-white shadow-2xs flex items-center justify-center text-xl hover:scale-110 active:scale-95 cursor-pointer"
              >
                {em}
              </button>
            ))}
          </div>
        )}

        {/* Bottom Function Row (123, Emoji, Space, Search/Send) */}
        <div className="flex justify-center space-x-1.5 pt-1">
          {/* Mode Switch: 123 / 中文 */}
          <button
            onClick={() => setKeyboardMode(keyboardMode === 'pinyin' ? '123' : 'pinyin')}
            className="w-13 h-10 bg-[#AEB3BE] rounded-lg shadow-sm flex items-center justify-center text-xs font-bold text-gray-900 active:bg-gray-400 cursor-pointer"
          >
            {keyboardMode === 'pinyin' ? '123' : '中文'}
          </button>

          {/* Emoji Toggle */}
          <button
            onClick={() => setKeyboardMode(keyboardMode === 'emoji' ? 'pinyin' : 'emoji')}
            className="w-10 h-10 bg-[#AEB3BE] rounded-lg shadow-sm flex items-center justify-center text-gray-800 active:bg-gray-400 cursor-pointer"
          >
            <Smile size={18} />
          </button>

          {/* Spacebar */}
          <button
            onClick={onSpace}
            className="flex-1 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-xs font-bold text-gray-700 active:bg-gray-300 transition-colors cursor-pointer"
          >
            空格 (Space)
          </button>

          {/* Return / Send Button */}
          <button
            onClick={onSubmit}
            className="w-18 h-10 bg-[#1877F2] hover:bg-blue-600 active:scale-95 rounded-lg shadow-sm flex items-center justify-center text-xs font-bold text-white transition-all cursor-pointer"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
};
