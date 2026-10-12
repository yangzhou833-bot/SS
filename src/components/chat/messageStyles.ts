import { useEffect, useState } from 'react';

export interface MessageAppearance { id: string; alignment: 'left' | 'center' | 'right' }
export const MESSAGE_STYLES = [
  ['stellar', 'Stellar 霓虹'],
  ['lime', '荧光绿'], ['blue', '电光蓝'], ['pink', '果冻粉'], ['black', '黑白'],
  ['outline', '白描'], ['yellow', '柠檬黄'], ['cloud', '云朵'], ['red', '朱红'],
  ['purple', '葡萄'], ['checker', '棋盘格'], ['tape', '纸胶带'], ['pixel', '像素'],
  ['brush', '涂鸦'], ['chrome', '水银'], ['candy', '糖果'], ['orange', '橘子'],
  ['mint', '薄荷'], ['sky', '晴空'], ['night', '午夜'], ['lemon', '柠檬糖'],
  ['stamp', '邮票'], ['bubble', '气泡'], ['comic', '漫画'], ['shadow', '重影'],
  ['aurora', '极光玻璃'], ['ink', '墨色丝绒'], ['porcelain', '瓷白'],
  ['sakura', '樱花胶片'], ['cobalt', '钴蓝珐琅'], ['mono', '印刷黑白'],
  ['pixel-sky', '掌机蓝'], ['pixel-peach', '街机桃'], ['pixel-mint', '薄荷像素'],
] as const;
export const MESSAGE_STYLE_PREVIEWS: Record<typeof MESSAGE_STYLES[number][0], { text: string; font: string }> = {
  stellar: { text: '此刻，想和你说\nHey, you!', font: '通透粗体' },
  lime: { text: '一起出发！\nLet’s go', font: '圆润粗体' },
  blue: { text: '马上到\nSee you!', font: '紧凑粗体' },
  pink: { text: '今天超开心\nSo happy ♡', font: '果冻圆体' },
  black: { text: '晚上见\n20:30', font: '利落黑体' },
  outline: { text: '等你呀\nHey you!', font: '手写楷体' },
  yellow: { text: '去晒太阳\nGood day ☀', font: '活力圆体' },
  cloud: { text: '慢慢来\nTake it easy', font: '轻盈黑体' },
  red: { text: '就现在！\nReady?', font: '紧凑粗体' },
  purple: { text: '有点想你\nMiss you', font: '圆润粗体' },
  checker: { text: '下一站见\nNext stop', font: '棋盘像素字' },
  tape: { text: '记得带伞\nRain check', font: '纸感宋体' },
  pixel: { text: '好友上线\nHello 01', font: '终端像素字' },
  brush: { text: '随便走走\nFree time', font: '涂鸦楷体' },
  chrome: { text: '闪亮登场\nShine!', font: '光泽黑体' },
  candy: { text: '给你一颗糖\nSweet ♡', font: '甜甜圆体' },
  orange: { text: '吃点好的\nLunch time', font: '饱满粗体' },
  mint: { text: '吹吹晚风\nBreathe', font: '清爽黑体' },
  sky: { text: '天气真好\nBlue sky ☁', font: '轻盈黑体' },
  night: { text: '晚安啦\nGood night', font: '星空像素字' },
  lemon: { text: '酸酸甜甜\nFresh!', font: '清甜圆体' },
  stamp: { text: '给远方的你\nDear friend', font: '信笺宋体' },
  bubble: { text: '冒个泡\nHey!', font: '圆润粗体' },
  comic: { text: '好戏开场\nAction!', font: '漫画粗体' },
  shadow: { text: '再见一面\nAgain!', font: '立体粗体' },
  aurora: { text: '一起看流星\nMake a wish', font: '通透黑体' },
  ink: { text: '先去读书\nQuiet time', font: '沉静黑体' },
  porcelain: { text: '茶已经好了\nTea time', font: '温润宋体' },
  sakura: { text: '花开的时候\nSpring ♡', font: '柔和楷体' },
  cobalt: { text: '等一个晴天\nStay blue', font: '利落黑体' },
  mono: { text: '今天的约定\nNotes 02', font: '印刷宋体' },
  'pixel-sky': { text: '一起出发\nLet’s go!', font: '掌机方格字' },
  'pixel-peach': { text: '咖啡见 ☕\n15:30', font: '街机活泼字' },
  'pixel-mint': { text: '今天超开心\nLevel up!', font: '清晰像素字' },
};
const STORAGE_KEY = 'stellar_message_appearance';
const EVENT = 'stellar-message-appearance';
export function readMessageAppearance(): MessageAppearance {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (value && MESSAGE_STYLES.some(([id]) => id === value.id) && ['left', 'center', 'right'].includes(value.alignment)) return value;
  } catch {}
  return { id: 'lime', alignment: 'center' };
}
export function useMessageAppearance() {
  const [appearance, setAppearance] = useState(readMessageAppearance);
  useEffect(() => {
    const refresh = () => setAppearance(readMessageAppearance());
    window.addEventListener(EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => { window.removeEventListener(EVENT, refresh); window.removeEventListener('storage', refresh); };
  }, []);
  const update = (next: MessageAppearance) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
    setAppearance(next);
    window.dispatchEvent(new Event(EVENT));
  };
  return [appearance, update] as const;
}
