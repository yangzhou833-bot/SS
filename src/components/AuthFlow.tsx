import React, { useState, useEffect } from 'react';
import {
  CircleX,
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  ShieldCheck,
  Check,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  User,
  Camera,
  Sparkles,
  RefreshCw,
  KeyRound,
  Globe,
  HelpCircle,
  AlertCircle,
  FileText,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Zap,
  Plus,
  X,
  Layers,
  Compass,
  Smile,
  Heart,
  Share2,
  Info,
  ExternalLink,
} from 'lucide-react';
import { ProfileData } from '../types';

interface AuthFlowProps {
  onSuccess: (profileUpdates: Partial<ProfileData>) => void;
  onBypass: () => void;
  showToast: (msg: string) => void;
  initialProfile: ProfileData;
}

type AuthMode = 
  | 'pwd-login'      // 账号密码登录
  | 'sms-login'      // 手机短信免密登录
  | 'register'       // 新用户多步注册
  | 'recent'         // Facebook 最近登录账号列表
  | 'recovery'       // 忘记密码/找回账号
  | 'oauth'          // 第三方授权
  | 'success';       // 激活成功入驻

// Third-party social SVG icons matching Facebook UI
const FacebookIcon = () => (
  <svg className="w-5 h-5 fill-[#1877F2]" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const WeChatIcon = () => (
  <svg className="w-5 h-5 text-[#07C160]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 10c0-2.76-2.91-5-6.5-5S2 7.24 2 10c0 1.63 1.01 3.07 2.58 4.03L4 16.5l2.5-.95c.78.26 1.62.45 2.5.45.64 0 1.25-.1 1.83-.24C11.53 14.54 13 12.44 13 10c0 0 0 0 0 0z" />
    <path d="M22 14c0-2.21-2.33-4-5.2-4-.38 0-.75.04-1.11.12C16.54 11.1 17 12.25 17 13.5c0 2.21-1.61 4.14-3.96 4.79l1.46.71-.8.92 1.95-.51c.64.19 1.3.29 1.95.29 2.87 0 5.2-1.79 5.2-4z" />
  </svg>
);

const QQIcon = () => (
  <svg className="w-5 h-5 text-[#1877F2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
    <path d="M12 6a3 3 0 013 3c0 2-3 4-3 4s-3-2-3-3a3 3 0 013-3z" />
  </svg>
);

const DouyinIcon = () => (
  <svg className="w-5 h-5 text-[#050505]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const presetAvatars = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
];

export const AuthFlow: React.FC<AuthFlowProps> = ({
  onSuccess,
  onBypass,
  showToast,
  initialProfile,
}) => {
  const [authMode, setAuthMode] = useState<AuthMode>('pwd-login');
  const [history, setHistory] = useState<AuthMode[]>([]);

  // Navigation Helper
  const navigateTo = (mode: AuthMode) => {
    setHistory((prev) => [...prev, authMode]);
    setAuthMode(mode);
  };

  const goBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory((h) => h.slice(0, -1));
      setAuthMode(prev);
    } else {
      setAuthMode('pwd-login');
    }
  };

  // Login Form States
  const [loginAccount, setLoginAccount] = useState('alexia.vance@stellar.net');
  const [loginPassword, setLoginPassword] = useState('••••••••••••');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // SMS Login States
  const [smsPhone, setSmsPhone] = useState('18190972878');
  const [smsCode, setSmsCode] = useState('');
  const [smsCountdown, setSmsCountdown] = useState(0);
  const [sentSmsCode, setSentSmsCode] = useState<string | null>(null);

  // Registration Multi-Step Wizard States
  const [regStep, setRegStep] = useState<1 | 2 | 3>(1);
  const [regType, setRegType] = useState<'phone' | 'email'>('phone');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regVerifyCode, setRegVerifyCode] = useState('');
  const [regCountdown, setRegCountdown] = useState(0);
  const [sentRegCode, setSentRegCode] = useState<string | null>(null);

  // Reg Step 2: Password & Security
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Reg Step 3: Profile Setup
  const [regNickname, setRegNickname] = useState('星旅者 · Alexia');
  const [regBio, setRegBio] = useState('探索同城星云，记录每一个心动足迹。');
  const [regGender, setRegGender] = useState('男性');
  const [regBirthday, setRegBirthday] = useState('1998-10-12');
  const [regAvatar, setRegAvatar] = useState(presetAvatars[0]);
  const [regVisibility, setRegVisibility] = useState<'all' | 'contacts' | 'ghost'>('contacts');
  const [regLayers, setRegLayers] = useState<string[]>([
    'friends',
    'activities',
    'stars',
    'family',
    'life',
  ]);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);

  // Terms Agreement
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  // OAuth States
  const [oauthProvider, setOauthProvider] = useState<'facebook' | 'wechat' | 'qq' | 'douyin' | null>(null);

  // Recovery States
  const [recoveryAccount, setRecoveryAccount] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recoveryCountdown, setRecoveryCountdown] = useState(0);
  const [sentRecoveryCode, setSentRecoveryCode] = useState<string | null>(null);
  const [recoveryNewPassword, setRecoveryNewPassword] = useState('');

  // Recent Logins List (Facebook style)
  const [recentAccounts, setRecentAccounts] = useState([
    {
      id: 'rec-1',
      name: 'Alexia Vance',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      account: 'alexia.vance@stellar.net',
      badge: '上次登录',
    },
    {
      id: 'rec-2',
      name: 'Marcus Vance',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      account: 'marcus@stellar.net',
      badge: '看护组账号',
    },
  ]);

  // Selected Quick Login Account
  const [quickLoginTarget, setQuickLoginTarget] = useState<typeof recentAccounts[0] | null>(null);
  const [quickLoginPassword, setQuickLoginPassword] = useState('');

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, text: '无', color: '#E4E6EB', width: '0%' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 1, text: '较弱', color: '#FA383E', width: '25%' };
    if (score <= 2) return { score: 2, text: '一般', color: '#F5A623', width: '50%' };
    if (score <= 4) return { score: 3, text: '良好', color: '#1877F2', width: '75%' };
    return { score: 4, text: '极强', color: '#42B72A', width: '100%' };
  };

  const passwordStrength = getPasswordStrength(regPassword);

  // Countdowns
  useEffect(() => {
    let t: NodeJS.Timeout;
    if (smsCountdown > 0) t = setInterval(() => setSmsCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [smsCountdown]);

  useEffect(() => {
    let t: NodeJS.Timeout;
    if (regCountdown > 0) t = setInterval(() => setRegCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [regCountdown]);

  useEffect(() => {
    let t: NodeJS.Timeout;
    if (recoveryCountdown > 0) t = setInterval(() => setRecoveryCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [recoveryCountdown]);

  // Code dispatchers
  const handleGetSmsCode = () => {
    if (!smsPhone || smsPhone.length < 11) {
      showToast('⚠️ 请输入有效的11位手机号码');
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSentSmsCode(code);
    setSmsCountdown(60);
    showToast(`✉️ 动态验证码已发送！演示验证码：[ ${code} ]`);
  };

  const handleGetRegCode = () => {
    const target = regType === 'phone' ? regPhone : regEmail;
    if (!target) {
      showToast(regType === 'phone' ? '⚠️ 请输入手机号' : '⚠️ 请输入邮箱');
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSentRegCode(code);
    setRegCountdown(60);
    showToast(`✉️ 注册验证码已发送！演示验证码：[ ${code} ]`);
  };

  const handleGetRecoveryCode = () => {
    if (!recoveryAccount) {
      showToast('⚠️ 请输入绑定的手机号或邮箱');
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSentRecoveryCode(code);
    setRecoveryCountdown(60);
    showToast(`🔒 找回验证码已发送！演示验证码：[ ${code} ]`);
  };

  // Submit Handlers
  const handlePasswordLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!agreeTerms) {
      showToast('⚠️ 请先阅读并同意《服务协议》与《隐私政策》');
      return;
    }
    if (!loginAccount.trim()) {
      showToast('⚠️ 请输入手机号或邮箱账号');
      return;
    }
    if (!loginPassword.trim()) {
      showToast('⚠️ 请输入登录密码');
      return;
    }
    showToast('✨ 账号凭证验证通过，正在同步星图云端状态...');
    setTimeout(() => {
      onSuccess({
        operatorName: initialProfile.operatorName || 'Alexia Vance',
        emailAddress: loginAccount.includes('@') ? loginAccount : undefined,
        phoneNumber: !loginAccount.includes('@') ? loginAccount : undefined,
      });
    }, 600);
  };

  const handleSmsLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!agreeTerms) {
      showToast('⚠️ 请先阅读并同意《服务协议》与《隐私政策》');
      return;
    }
    if (!smsPhone) {
      showToast('⚠️ 请输入手机号');
      return;
    }
    if (!smsCode) {
      showToast('⚠️ 请输入短信验证码');
      return;
    }
    if (smsCode !== sentSmsCode && smsCode !== '888888') {
      showToast('❌ 验证码错误，请输入正确的验证码');
      return;
    }
    showToast('✅ 手机快捷验证通过！');
    setTimeout(() => {
      onSuccess({
        phoneNumber: smsPhone,
        operatorName: '星旅者 · ' + smsPhone.slice(-4),
      });
    }, 600);
  };

  const handleRegStep1Submit = () => {
    if (!agreeTerms) {
      showToast('⚠️ 请先勾选同意用户协议与隐私条款');
      return;
    }
    const target = regType === 'phone' ? regPhone : regEmail;
    if (!target) {
      showToast(regType === 'phone' ? '⚠️ 请输入手机号' : '⚠️ 请输入邮箱');
      return;
    }
    if (!regVerifyCode) {
      showToast('⚠️ 请输入验证码');
      return;
    }
    if (regVerifyCode !== sentRegCode && regVerifyCode !== '888888') {
      showToast('❌ 验证码不正确');
      return;
    }
    showToast('✓ 身份验证成功，请设定安全密码');
    setRegStep(2);
  };

  const handleRegStep2Submit = () => {
    if (!regPassword || regPassword.length < 6) {
      showToast('⚠️ 密码长度不能少于 6 位');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      showToast('⚠️ 两次输入的密码不一致');
      return;
    }
    showToast('✓ 密码加密配置就绪，请完善星历档案');
    setRegStep(3);
  };

  const handleRegStep3Finish = () => {
    if (!regNickname.trim()) {
      showToast('⚠️ 请输入您的个性昵称');
      return;
    }
    showToast('🌌 正在为您生成漫游证书并初始化星图...');
    setTimeout(() => {
      navigateTo('success');
    }, 600);
  };

  const handleSuccessEnter = () => {
    onSuccess({
      operatorName: regNickname,
      aboutYou: regBio,
      gender: regGender,
      birthday: regBirthday,
      relationshipStatus: regVisibility === 'all' ? '公开' : regVisibility === 'contacts' ? '仅好友可见' : '隐身模式',
      avatar: regAvatar,
      initialLayers: regLayers,
    } as any);
  };

  // Quick Simulations
  const handleSimulateLogin = () => {
    setLoginAccount('alexia.vance@stellar.net');
    setLoginPassword('StellarSecure#2026');
    showToast('⚡ [极速测试] 已填入测试账号与密码，正在验证登录...');
    setTimeout(() => {
      onSuccess({
        operatorName: 'Alexia Vance',
        emailAddress: 'alexia.vance@stellar.net',
      });
    }, 700);
  };

  const handleSimulateReg = () => {
    setRegPhone('18188886666');
    setRegVerifyCode('888888');
    setRegPassword('Stellar#2026');
    setRegConfirmPassword('Stellar#2026');
    setRegNickname('星云领航员 · Nova');
    setRegBio('探索城市脉络，记录星轨微光。');
    setRegAvatar(presetAvatars[1]);
    showToast('⚡ [极速测试] 已自动完成全流程数据填入，正在进入注册成功屏...');
    setTimeout(() => {
      navigateTo('success');
    }, 800);
  };

  const handleQuickAccountClick = (acc: typeof recentAccounts[0]) => {
    setQuickLoginTarget(acc);
    setQuickLoginPassword('••••••••');
    showToast(`⚡ 正在以【${acc.name}】身份快速登录...`);
    setTimeout(() => {
      onSuccess({
        operatorName: acc.name,
        avatar: acc.avatar,
        emailAddress: acc.account,
      });
    }, 600);
  };

  return (
    <div className="w-full h-full bg-[#F0F2F5] text-[#050505] flex flex-col justify-between overflow-hidden relative select-none font-sans">
      {/* Top Header Bar */}
      <header className="h-14 bg-white border-b border-[#E4E6EB] px-4 flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center space-x-2">
          {authMode !== 'pwd-login' && authMode !== 'success' ? (
            <button
              type="button"
              onClick={goBack}
              className="w-8 h-8 rounded-full bg-[#E7F3FF] hover:bg-[#D8ECFF] flex items-center justify-center text-[#1877F2] cursor-pointer transition-colors active:scale-95 shadow-2xs"
              title="返回"
            >
              <ChevronLeft size={20} className="stroke-[2.8] text-[#1877F2]" />
            </button>
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-black text-xl shadow-xs">
              f
            </div>
          )}

          <div className="flex items-center space-x-1.5">
            <span className="text-xl font-black text-[#1877F2] tracking-tight">
              stellar
            </span>
          </div>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onBypass}
            className="px-3.5 py-1.5 bg-[#E7F3FF] hover:bg-[#D8ECFF] text-[#1877F2] rounded-full text-xs font-bold cursor-pointer transition-all active:scale-95 flex items-center space-x-1"
          >
            <Zap size={13} className="text-[#1877F2] fill-[#1877F2]" />
            <span>免密快速体验</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar flex flex-col justify-start items-center">
        <div className="w-full max-w-md my-auto space-y-3">
          
          {/* ========================================================================= */}
          {/* MODE 1: PASSWORD LOGIN                                                    */}
          {/* ========================================================================= */}
          {authMode === 'pwd-login' && (
            <div className="bg-white rounded-3xl p-5 space-y-4 animate-fadeIn text-left">
              
              {/* Tab Selector: Account Password vs SMS Login */}
              <div className="grid grid-cols-2 border-b border-[#E4E6EB] text-center text-sm font-bold pb-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('pwd-login')}
                  className="pb-2 text-[#1877F2] border-b-2 border-[#1877F2] cursor-pointer"
                >
                  账号密码登录
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('sms-login')}
                  className="pb-2 text-[#65676B] hover:text-[#050505] cursor-pointer"
                >
                  手机免密登录
                </button>
              </div>

              {/* Headline */}
              <div className="space-y-1 pt-1">
                <h1 className="text-xl font-black text-[#050505] tracking-tight">登录到 Stellar 星图</h1>
                <p className="text-xs text-[#65676B] font-normal leading-relaxed">
                  连接近邻伙伴与家人，探索同城高能动态与星空盲盒。
                </p>
              </div>

              {/* Recent Account Quick Strip (If any) */}
              {recentAccounts.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#65676B]">
                    <span>近期已保存账号 (点击一键登录):</span>
                    <button
                      type="button"
                      onClick={() => setAuthMode('recent')}
                      className="text-[#1877F2] hover:underline cursor-pointer font-semibold"
                    >
                      管理账号
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {recentAccounts.slice(0, 2).map((acc) => (
                      <div
                        key={`quick-acc-${acc.id}`}
                        onClick={() => handleQuickAccountClick(acc)}
                        className="flex items-center space-x-2.5 bg-white border border-[#E4E6EB] hover:border-[#1877F2] rounded-2xl p-2.5 cursor-pointer transition-all shrink-0 group shadow-xs"
                      >
                        <img src={acc.avatar} alt={acc.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                        <div className="text-left overflow-hidden">
                          <div className="text-xs font-bold text-[#050505] group-hover:text-[#1877F2] truncate">
                            {acc.name}
                          </div>
                          <div className={`text-[10px] ${acc.badge === '上次登录' ? 'text-emerald-500' : 'text-[#65676B]'} font-semibold truncate`}>
                            {acc.badge}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handlePasswordLogin} className="space-y-3.5 pt-1">
                <div>
                  <label className="block text-xs font-bold text-[#050505] mb-1.5">
                    手机号 / 电子邮箱 / 星纪元号
                  </label>
                  <input
                    type="text"
                    value={loginAccount}
                    onChange={(e) => setLoginAccount(e.target.value)}
                    placeholder="请输入登录手机号或邮箱"
                    className="w-full bg-[#F8F9FA] border border-[#E4E6EB] focus:border-[#1877F2] focus:bg-white rounded-2xl px-4 py-2.5 text-sm text-[#050505] outline-none transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#050505]">
                      登录密码
                    </label>
                    <button
                      type="button"
                      onClick={() => setAuthMode('recovery')}
                      className="text-xs text-[#1877F2] hover:underline font-semibold cursor-pointer"
                    >
                      忘记密码？
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="请输入密码"
                      className="w-full bg-[#F8F9FA] border border-[#E4E6EB] focus:border-[#1877F2] focus:bg-white rounded-2xl pl-4 pr-10 py-2.5 text-sm text-[#050505] outline-none transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#65676B] hover:text-[#050505] cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Remember me & Auto Login */}
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 accent-[#1877F2] rounded-md cursor-pointer"
                    />
                    <span className="text-xs text-[#050505] font-medium">记住密码并自动登录</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleSimulateLogin}
                    className="text-xs font-bold text-[#1877F2] hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <Zap size={13} className="fill-[#1877F2] text-[#1877F2]" />
                    <span>极速模拟填充</span>
                  </button>
                </div>

                {/* Terms Agreement Checkbox */}
                <div className="flex items-center space-x-1.5">
                  <input
                    type="checkbox"
                    id="terms-check"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 accent-[#1877F2] rounded-md cursor-pointer shrink-0"
                  />
                  <label htmlFor="terms-check" className="text-xs text-[#65676B] cursor-pointer select-none">
                    我已阅读并同意
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsTermsModalOpen(true);
                      }}
                      className="text-[#1877F2] hover:underline font-semibold mx-0.5"
                    >
                      《服务协议》
                    </button>
                    与
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsTermsModalOpen(true);
                      }}
                      className="text-[#1877F2] hover:underline font-semibold mx-0.5"
                    >
                      《隐私政策》
                    </button>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-[#4E58E5] via-[#5252F4] to-[#6055E8] hover:opacity-95 text-white text-base font-bold rounded-2xl cursor-pointer transition-all active:scale-[0.99] shadow-md shadow-indigo-500/20 tracking-widest flex items-center justify-center"
                  >
                    登 录
                  </button>
                </div>
              </form>

              {/* Divider */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-[#E4E6EB]"></div>
                <span className="flex-shrink mx-3 text-xs text-[#8A8D91] font-medium">
                  或通过以下方式登录
                </span>
                <div className="flex-grow border-t border-[#E4E6EB]"></div>
              </div>

              {/* Social Login 3 Columns Grid (WeChat, QQ, Douyin) */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setOauthProvider('wechat');
                    navigateTo('oauth');
                  }}
                  className="py-3 bg-[#F8F9FA] hover:bg-[#F0F2F5] rounded-2xl flex flex-col items-center justify-center transition-all group cursor-pointer"
                  title="微信账号登录"
                >
                  <CircleX className="w-6 h-6 text-emerald-500 stroke-[2.2]" />
                  <span className="text-xs font-bold text-[#050505] mt-1.5">微信</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOauthProvider('qq');
                    navigateTo('oauth');
                  }}
                  className="py-3 bg-[#F8F9FA] hover:bg-[#F0F2F5] rounded-2xl flex flex-col items-center justify-center transition-all group cursor-pointer"
                  title="QQ 账号登录"
                >
                  <CircleX className="w-6 h-6 text-sky-500 stroke-[2.2]" />
                  <span className="text-xs font-bold text-[#050505] mt-1.5">QQ</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOauthProvider('douyin');
                    navigateTo('oauth');
                  }}
                  className="py-3 bg-[#F8F9FA] hover:bg-[#F0F2F5] rounded-2xl flex flex-col items-center justify-center transition-all group cursor-pointer"
                  title="抖音账号登录"
                >
                  <CircleX className="w-6 h-6 text-black stroke-[2.2]" />
                  <span className="text-xs font-bold text-[#050505] mt-1.5">抖音</span>
                </button>
              </div>

              {/* Create New Account Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRegStep(1);
                    navigateTo('register');
                  }}
                  className="w-full py-2.5 bg-white border-2 border-[#1877F2] hover:bg-[#E7F3FF]/40 text-[#1877F2] text-sm font-bold rounded-full cursor-pointer transition-all active:scale-[0.99] flex items-center justify-center space-x-1 tracking-tight"
                >
                  <Plus size={16} className="stroke-[2.5]" />
                  <span>创建新账号 (注册)</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODE 2: SMS QUICK LOGIN                                                  */}
          {/* ========================================================================= */}
          {authMode === 'sms-login' && (
            <div className="bg-white rounded-3xl p-5 space-y-4 animate-fadeIn text-left">
              {/* Tab Selector */}
              <div className="grid grid-cols-2 border-b border-[#E4E6EB] text-center text-sm font-bold pb-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('pwd-login')}
                  className="pb-2 text-[#65676B] hover:text-[#050505] cursor-pointer"
                >
                  账号密码登录
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('sms-login')}
                  className="pb-2 text-[#1877F2] border-b-2 border-[#1877F2] cursor-pointer"
                >
                  手机免密登录
                </button>
              </div>

              {/* Headline */}
              <div className="space-y-1 pt-1">
                <h1 className="text-xl font-black text-[#050505] tracking-tight">手机号码快捷登录</h1>
                <p className="text-xs text-[#65676B] font-normal leading-relaxed">
                  未注册手机验证通过后将自动为您创建专属星纪元身份。
                </p>
              </div>

              <form onSubmit={handleSmsLogin} className="space-y-3.5 pt-1 text-left">
                <div>
                  <label className="block text-xs font-bold text-[#050505] mb-1.5">
                    中国大陆手机号码 (CHINA +86)
                  </label>
                  <div className="flex items-center bg-[#F8F9FA] border border-[#E4E6EB] focus-within:border-[#1877F2] focus-within:bg-white rounded-2xl overflow-hidden transition-all">
                    <span className="px-4 py-2.5 text-sm font-bold text-[#050505] border-r border-[#E4E6EB] select-none">
                      +86
                    </span>
                    <input
                      type="tel"
                      maxLength={11}
                      value={smsPhone}
                      onChange={(e) => setSmsPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="18190972878"
                      className="flex-1 bg-transparent px-4 py-2.5 text-sm text-[#050505] outline-none font-sans font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#050505] mb-1.5">
                    短信验证码 (SMS CODE)
                  </label>
                  <div className="flex space-x-2.5">
                    <input
                      type="text"
                      maxLength={6}
                      value={smsCode}
                      onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="6位验证码"
                      className="flex-1 bg-[#F8F9FA] border border-[#E4E6EB] focus:border-[#1877F2] focus:bg-white rounded-2xl px-4 py-2.5 text-sm text-[#050505] outline-none font-sans"
                    />
                    <button
                      type="button"
                      disabled={smsCountdown > 0}
                      onClick={handleGetSmsCode}
                      className={`px-5 py-2.5 text-xs font-bold rounded-2xl border transition-all cursor-pointer shrink-0 ${
                        smsCountdown > 0
                          ? 'bg-[#F0F2F5] text-[#8A8D91] border-[#E4E6EB]'
                          : 'bg-white text-[#1877F2] border-[#1877F2] hover:bg-[#E7F3FF]'
                      }`}
                    >
                      {smsCountdown > 0 ? `${smsCountdown}s` : '获取验证码'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-xs text-[#65676B]">演示可用万能码：888888</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSmsPhone('18190972878');
                      setSmsCode('888888');
                      showToast('⚡ 已自动填充测试手机与万能验证码');
                    }}
                    className="text-xs font-bold text-[#1877F2] hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <Zap size={13} className="fill-[#1877F2] text-[#1877F2]" />
                    <span>极速填充</span>
                  </button>
                </div>

                {/* Terms Agreement */}
                <div className="flex items-center space-x-1.5">
                  <input
                    type="checkbox"
                    id="terms-check-sms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 accent-[#1877F2] rounded-md cursor-pointer shrink-0"
                  />
                  <label htmlFor="terms-check-sms" className="text-xs text-[#65676B] cursor-pointer select-none">
                    我已阅读并同意
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsTermsModalOpen(true);
                      }}
                      className="text-[#1877F2] hover:underline font-semibold mx-0.5"
                    >
                      《服务协议》
                    </button>
                    与
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsTermsModalOpen(true);
                      }}
                      className="text-[#1877F2] hover:underline font-semibold mx-0.5"
                    >
                      《隐私政策》
                    </button>
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#0066FF] hover:bg-[#0055EE] text-white text-base font-bold rounded-2xl cursor-pointer transition-all active:scale-[0.99] shadow-md shadow-blue-500/25 tracking-wide flex items-center justify-center"
                  >
                    立即验证并登录
                  </button>
                </div>
              </form>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRegStep(1);
                    navigateTo('register');
                  }}
                  className="w-full py-3 bg-[#42B72A] hover:bg-[#36A420] text-white text-sm font-bold rounded-2xl cursor-pointer transition-all active:scale-[0.99] shadow-sm flex items-center justify-center space-x-1 tracking-tight"
                >
                  <Plus size={16} className="stroke-[2.5]" />
                  <span>创建新账号 (注册)</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODE 3: MULTI-STEP REGISTRATION WIZARD (FACEBOOK WIZARD)                 */}
          {/* ========================================================================= */}
          {authMode === 'register' && (
            <div className="bg-white border border-[#E4E6EB] rounded-md p-4 sm:p-5 shadow-2xs space-y-4 animate-fadeIn">
              
              {/* Stepper Progress Header */}
              <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-3">
                <div className="text-left">
                  <span className="text-[10px] font-bold text-[#1877F2] uppercase tracking-wider">
                    注册向导 · STEP 0{regStep} / 03
                  </span>
                  <h2 className="text-sm font-black text-[#050505]">
                    {regStep === 1 && '1. 验证手机或电子邮箱'}
                    {regStep === 2 && '2. 设定身份密钥与密码'}
                    {regStep === 3 && '3. 完善星历资料与图层'}
                  </h2>
                </div>
                <div className="flex items-center space-x-1.5">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black border ${
                        regStep === step
                          ? 'bg-[#1877F2] text-white border-[#1877F2] shadow-xs'
                          : regStep > step
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-400'
                          : 'bg-[#F0F2F5] text-[#8A8D91] border-[#E4E6EB]'
                      }`}
                    >
                      {regStep > step ? <Check size={13} className="stroke-[2.5]" /> : step}
                    </div>
                  ))}
                </div>
              </div>

              {/* STEP 1: Phone / Email Verification */}
              {regStep === 1 && (
                <div className="space-y-3 text-left animate-fadeIn">
                  {/* Toggle Phone vs Email */}
                  <div className="grid grid-cols-2 border border-[#E4E6EB] rounded-md p-1 bg-[#F0F2F5]">
                    <button
                      type="button"
                      onClick={() => setRegType('phone')}
                      className={`py-1.5 text-xs font-bold rounded-sm transition-colors cursor-pointer ${
                        regType === 'phone' ? 'bg-white text-[#1877F2] shadow-2xs' : 'text-[#65676B]'
                      }`}
                    >
                      手机号码注册
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegType('email')}
                      className={`py-1.5 text-xs font-bold rounded-sm transition-colors cursor-pointer ${
                        regType === 'email' ? 'bg-white text-[#1877F2] shadow-2xs' : 'text-[#65676B]'
                      }`}
                    >
                      电子邮箱注册
                    </button>
                  </div>

                  {regType === 'phone' ? (
                    <div>
                      <label className="block text-[11px] font-bold text-[#65676B] mb-1">
                        手机号码 (CHINA +86)
                      </label>
                      <input
                        type="tel"
                        maxLength={11}
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="请输入11位大陆手机号"
                        className="w-full bg-white border border-[#CCD0D5] focus:border-[#1877F2] focus:ring-1 focus:ring-[#1877F2] rounded-md px-3 py-2 text-sm text-[#050505] outline-none font-mono"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-bold text-[#65676B] mb-1">
                        电子邮箱地址 (EMAIL)
                      </label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="yourname@domain.com"
                        className="w-full bg-white border border-[#CCD0D5] focus:border-[#1877F2] focus:ring-1 focus:ring-[#1877F2] rounded-md px-3 py-2 text-sm text-[#050505] outline-none font-mono"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-[#65676B] mb-1">
                      验证码 (VERIFICATION CODE)
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={regVerifyCode}
                        onChange={(e) => setRegVerifyCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="6位验证码"
                        className="flex-1 bg-white border border-[#CCD0D5] focus:border-[#1877F2] focus:ring-1 focus:ring-[#1877F2] rounded-md px-3 py-2 text-sm text-[#050505] outline-none font-mono text-center tracking-widest"
                      />
                      <button
                        type="button"
                        disabled={regCountdown > 0}
                        onClick={handleGetRegCode}
                        className={`px-3 py-2 text-xs font-bold rounded-md border transition-colors cursor-pointer shrink-0 ${
                          regCountdown > 0
                            ? 'bg-[#F0F2F5] text-[#8A8D91] border-[#E4E6EB]'
                            : 'bg-white text-[#1877F2] border-[#1877F2] hover:bg-[#E7F3FF]'
                        }`}
                      >
                        {regCountdown > 0 ? `${regCountdown}s` : '获取验证码'}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#65676B] pt-0.5">
                    <span>测试万能码：888888</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (regType === 'phone') setRegPhone('18188889999');
                        else setRegEmail('explorer@stellar.net');
                        setRegVerifyCode('888888');
                        showToast('⚡ 已填入测试凭证与验证码');
                      }}
                      className="text-[#1877F2] hover:underline font-bold cursor-pointer"
                    >
                      极速填入
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleRegStep1Submit}
                    className="w-full py-2.5 bg-[#1877F2] hover:bg-[#166FE5] text-white text-sm font-black rounded-md border border-[#1877F2] cursor-pointer transition-all active:scale-[0.99] shadow-2xs flex items-center justify-center space-x-1"
                  >
                    <span>下一步：设置密码</span>
                    <ChevronRight size={15} />
                  </button>
                </div>
              )}

              {/* STEP 2: Password & Security Check */}
              {regStep === 2 && (
                <div className="space-y-3.5 text-left animate-fadeIn">
                  <div>
                    <label className="block text-[11px] font-bold text-[#65676B] mb-1">
                      设置登录密码 (6位以上字母/数字组合)
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="请输入安全密码"
                        className="w-full bg-white border border-[#CCD0D5] focus:border-[#1877F2] focus:ring-1 focus:ring-[#1877F2] rounded-md pl-3 pr-9 py-2 text-sm text-[#050505] outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#65676B] cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    <div className="mt-1.5 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-[#65676B]">密码强度:</span>
                        <span style={{ color: passwordStrength.color }} className="font-bold">
                          {passwordStrength.text}
                        </span>
                      </div>
                      <div className="w-full h-1 bg-[#E4E6EB] rounded-full overflow-hidden">
                        <div
                          style={{ width: passwordStrength.width, backgroundColor: passwordStrength.color }}
                          className="h-full transition-all duration-300"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#65676B] mb-1">
                      确认登录密码 (CONFIRM PASSWORD)
                    </label>
                    <input
                      type="password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="请再次输入相同密码"
                      className="w-full bg-white border border-[#CCD0D5] focus:border-[#1877F2] focus:ring-1 focus:ring-[#1877F2] rounded-md px-3 py-2 text-sm text-[#050505] outline-none font-mono"
                    />
                  </div>

                  <div className="p-2.5 bg-[#F7F8FA] border border-[#E4E6EB] rounded-md text-[11px] text-[#65676B] flex items-start space-x-2">
                    <ShieldCheck size={15} className="text-[#1877F2] shrink-0 mt-0.5" />
                    <span>Stellar 采用端对端多重哈希校验，保障您的地理坐标与私信交流安全。</span>
                  </div>

                  <div className="flex space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setRegStep(1)}
                      className="w-1/3 py-2.5 bg-white hover:bg-[#F0F2F5] text-[#050505] text-xs font-bold rounded-md border border-[#E4E6EB] cursor-pointer shadow-2xs"
                    >
                      上一步
                    </button>
                    <button
                      type="button"
                      onClick={handleRegStep2Submit}
                      className="flex-1 py-2.5 bg-[#1877F2] hover:bg-[#166FE5] text-white text-sm font-black rounded-md border border-[#1877F2] cursor-pointer transition-all active:scale-[0.99] shadow-2xs flex items-center justify-center space-x-1"
                    >
                      <span>下一步：档案资料</span>
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Profile Setup */}
              {regStep === 3 && (
                <div className="space-y-3.5 text-left animate-fadeIn">
                  {/* Avatar Picker Quick Strip */}
                  <div className="flex items-center space-x-3 p-3 bg-[#F7F8FA] border border-[#E4E6EB] rounded-md">
                    <img
                      src={regAvatar}
                      alt="avatar"
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#1877F2] shadow-xs shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#65676B] mb-1">
                        <span>选择星空化身:</span>
                        <button
                          type="button"
                          onClick={() => setIsAvatarPickerOpen(true)}
                          className="text-[#1877F2] hover:underline cursor-pointer"
                        >
                          更多头像
                        </button>
                      </div>
                      <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
                        {presetAvatars.slice(0, 5).map((av, idx) => (
                          <img
                            key={`strip-av-${idx}`}
                            src={av}
                            onClick={() => setRegAvatar(av)}
                            alt="avatar preset"
                            className={`w-7 h-7 rounded-full object-cover cursor-pointer border transition-transform ${
                              regAvatar === av ? 'border-[#1877F2] scale-110 shadow-xs' : 'border-[#E4E6EB] opacity-75'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#65676B] mb-1">
                      个性昵称 (NICKNAME)
                    </label>
                    <input
                      type="text"
                      value={regNickname}
                      onChange={(e) => setRegNickname(e.target.value)}
                      placeholder="如何称呼您"
                      className="w-full bg-white border border-[#CCD0D5] focus:border-[#1877F2] focus:ring-1 focus:ring-[#1877F2] rounded-md px-3 py-2 text-sm text-[#050505] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-[#65676B] mb-1">性别</label>
                      <select
                        value={regGender}
                        onChange={(e) => setRegGender(e.target.value)}
                        className="w-full bg-white border border-[#CCD0D5] rounded-md px-2.5 py-2 text-xs text-[#050505] outline-none"
                      >
                        <option value="男性">男性</option>
                        <option value="女性">女性</option>
                        <option value="保密">保密</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#65676B] mb-1">生日</label>
                      <input
                        type="date"
                        value={regBirthday}
                        onChange={(e) => setRegBirthday(e.target.value)}
                        className="w-full bg-white border border-[#CCD0D5] rounded-md px-2.5 py-1.5 text-xs text-[#050505] outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#65676B] mb-1">
                      个性签名 (BIO)
                    </label>
                    <input
                      type="text"
                      value={regBio}
                      onChange={(e) => setRegBio(e.target.value)}
                      placeholder="写下一句探索宣言..."
                      className="w-full bg-white border border-[#CCD0D5] focus:border-[#1877F2] focus:ring-1 focus:ring-[#1877F2] rounded-md px-3 py-2 text-xs text-[#050505] outline-none"
                    />
                  </div>

                  <div className="flex space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setRegStep(2)}
                      className="w-1/3 py-2.5 bg-white hover:bg-[#F0F2F5] text-[#050505] text-xs font-bold rounded-md border border-[#E4E6EB] cursor-pointer shadow-2xs"
                    >
                      上一步
                    </button>
                    <button
                      type="button"
                      onClick={handleRegStep3Finish}
                      className="flex-1 py-2.5 bg-[#42B72A] hover:bg-[#36A420] text-white text-sm font-black rounded-md border border-[#42B72A] cursor-pointer transition-all active:scale-[0.99] shadow-2xs flex items-center justify-center space-x-1"
                    >
                      <Sparkles size={15} />
                      <span>完成注册并启程</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODE 4: RECENT ACCOUNTS MANAGEMENT (FACEBOOK STYLE)                       */}
          {/* ========================================================================= */}
          {authMode === 'recent' && (
            <div className="bg-white border border-[#E4E6EB] rounded-md p-4 sm:p-5 shadow-2xs space-y-4 animate-fadeIn text-left">
              <div className="border-b border-[#E4E6EB] pb-2">
                <h1 className="text-base font-black text-[#050505]">管理已保存的账号</h1>
                <p className="text-xs text-[#65676B]">点击账号即可使用其已存凭证快速登录。</p>
              </div>

              <div className="space-y-2">
                {recentAccounts.map((acc) => (
                  <div
                    key={`manage-acc-${acc.id}`}
                    className="flex items-center justify-between p-2.5 bg-[#F7F8FA] border border-[#E4E6EB] hover:border-[#1877F2] rounded-md transition-colors group"
                  >
                    <div
                      onClick={() => handleQuickAccountClick(acc)}
                      className="flex items-center space-x-3 flex-1 cursor-pointer"
                    >
                      <img src={acc.avatar} alt={acc.name} className="w-10 h-10 rounded-full object-cover border border-[#E4E6EB]" />
                      <div>
                        <div className="text-sm font-bold text-[#050505] group-hover:text-[#1877F2]">
                          {acc.name}
                        </div>
                        <div className="text-xs text-[#65676B]">{acc.account}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setRecentAccounts((prev) => prev.filter((a) => a.id !== acc.id));
                        showToast(`已从快捷列表中移除 ${acc.name}`);
                      }}
                      className="p-1.5 text-[#8A8D91] hover:text-red-500 rounded-full hover:bg-white cursor-pointer transition-colors"
                      title="移除记录"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-[#E4E6EB]">
                <button
                  type="button"
                  onClick={() => setAuthMode('pwd-login')}
                  className="w-full py-2.5 bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-bold rounded-md cursor-pointer"
                >
                  使用其他账号登录
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODE 5: ACCOUNT RECOVERY (PASSWORD FORGOTTEN)                            */}
          {/* ========================================================================= */}
          {authMode === 'recovery' && (
            <div className="bg-white border border-[#E4E6EB] rounded-md p-4 sm:p-5 shadow-2xs space-y-4 animate-fadeIn text-left">
              <div className="border-b border-[#E4E6EB] pb-2">
                <h1 className="text-base font-black text-[#050505]">找回密码与身份验证</h1>
                <p className="text-xs text-[#65676B]">请输入您注册时绑定的手机号码或电子邮箱。</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#65676B] mb-1">
                    绑定手机 / 邮箱
                  </label>
                  <input
                    type="text"
                    value={recoveryAccount}
                    onChange={(e) => setRecoveryAccount(e.target.value)}
                    placeholder="请输入绑定的手机号或邮箱"
                    className="w-full bg-white border border-[#CCD0D5] focus:border-[#1877F2] focus:ring-1 focus:ring-[#1877F2] rounded-md px-3 py-2 text-sm text-[#050505] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#65676B] mb-1">
                    安全验证码
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={recoveryCode}
                      onChange={(e) => setRecoveryCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="6位验证码"
                      className="flex-1 bg-white border border-[#CCD0D5] focus:border-[#1877F2] focus:ring-1 focus:ring-[#1877F2] rounded-md px-3 py-2 text-sm text-[#050505] outline-none font-mono text-center tracking-widest"
                    />
                    <button
                      type="button"
                      disabled={recoveryCountdown > 0}
                      onClick={handleGetRecoveryCode}
                      className={`px-3 py-2 text-xs font-bold rounded-md border transition-colors cursor-pointer shrink-0 ${
                        recoveryCountdown > 0
                          ? 'bg-[#F0F2F5] text-[#8A8D91] border-[#E4E6EB]'
                          : 'bg-white text-[#1877F2] border-[#1877F2] hover:bg-[#E7F3FF]'
                      }`}
                    >
                      {recoveryCountdown > 0 ? `${recoveryCountdown}s` : '获取验证码'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#65676B] mb-1">
                    设置新密码 (NEW PASSWORD)
                  </label>
                  <input
                    type="password"
                    value={recoveryNewPassword}
                    onChange={(e) => setRecoveryNewPassword(e.target.value)}
                    placeholder="请输入新的安全密码"
                    className="w-full bg-white border border-[#CCD0D5] focus:border-[#1877F2] focus:ring-1 focus:ring-[#1877F2] rounded-md px-3 py-2 text-sm text-[#050505] outline-none font-mono"
                  />
                </div>

                <div className="pt-1 flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setAuthMode('pwd-login')}
                    className="w-1/3 py-2.5 bg-white hover:bg-[#F0F2F5] text-[#050505] text-xs font-bold rounded-md border border-[#E4E6EB] cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!recoveryAccount || !recoveryCode || !recoveryNewPassword) {
                        showToast('⚠️ 请填写完整验证信息与新密码');
                        return;
                      }
                      showToast('✅ 密码重置成功！正在为您自动登录...');
                      setTimeout(() => {
                        onSuccess({
                          operatorName: 'Alexia Vance',
                          emailAddress: recoveryAccount.includes('@') ? recoveryAccount : undefined,
                        });
                      }, 700);
                    }}
                    className="flex-1 py-2.5 bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-black rounded-md border border-[#1877F2] cursor-pointer"
                  >
                    重置并登录
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODE 6: OAUTH AUTHORIZATION DIALOG                                        */}
          {/* ========================================================================= */}
          {authMode === 'oauth' && (
            <div className="bg-white border border-[#E4E6EB] rounded-md p-4 sm:p-5 shadow-2xs space-y-4 animate-fadeIn text-left">
              <div className="flex items-center space-x-3 border-b border-[#E4E6EB] pb-3">
                <div className="w-10 h-10 rounded-full bg-[#F0F2F5] border border-[#E4E6EB] flex items-center justify-center">
                  {oauthProvider === 'facebook' && <FacebookIcon />}
                  {oauthProvider === 'wechat' && <WeChatIcon />}
                  {oauthProvider === 'qq' && <QQIcon />}
                  {oauthProvider === 'douyin' && <DouyinIcon />}
                </div>
                <div>
                  <h1 className="text-sm font-black text-[#050505]">
                    {oauthProvider === 'facebook' && 'Facebook 授权登录'}
                    {oauthProvider === 'wechat' && '微信快捷登录'}
                    {oauthProvider === 'qq' && 'QQ 快捷登录'}
                    {oauthProvider === 'douyin' && '抖音快捷登录'}
                  </h1>
                  <p className="text-xs text-[#65676B]">Stellar 将获得以下权限以同步您的档案:</p>
                </div>
              </div>

              <div className="space-y-2 bg-[#F7F8FA] border border-[#E4E6EB] rounded-md p-3 text-xs text-[#050505]">
                <div className="flex items-center space-x-2">
                  <Check size={14} className="text-emerald-600 font-bold" />
                  <span>获取您的公开个人资料（昵称、头像、地区）</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check size={14} className="text-emerald-600 font-bold" />
                  <span>同步好友关系链并智能标定近邻好友</span>
                </div>
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('pwd-login')}
                  className="w-1/3 py-2.5 bg-white hover:bg-[#F0F2F5] text-[#050505] text-xs font-bold rounded-md border border-[#E4E6EB] cursor-pointer"
                >
                  拒绝
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showToast(`✓ 已同意 ${oauthProvider} 授权，正在同步档案...`);
                    setTimeout(() => {
                      onSuccess({
                        operatorName:
                          oauthProvider === 'facebook'
                            ? 'Alexia (Facebook)'
                            : oauthProvider === 'wechat'
                            ? '微信星旅者'
                            : '极光领航员',
                        avatar: presetAvatars[3],
                      });
                    }, 600);
                  }}
                  className="flex-1 py-2.5 bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-black rounded-md border border-[#1877F2] cursor-pointer"
                >
                  同意并授权
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODE 7: REGISTRATION SUCCESS CARD                                        */}
          {/* ========================================================================= */}
          {authMode === 'success' && (
            <div className="bg-white border border-[#E4E6EB] rounded-md p-5 sm:p-6 shadow-2xs space-y-4 animate-fadeIn text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-500 mx-auto flex items-center justify-center text-emerald-600 shadow-sm">
                <CheckCircle2 size={32} />
              </div>

              <div className="space-y-1">
                <h1 className="text-lg font-black text-[#050505]">🎉 恭喜！星图身份已激活</h1>
                <p className="text-xs text-[#65676B]">
                  您的星历档案已完成端对端哈希加密并同步至云端。
                </p>
              </div>

              {/* Profile Card Preview */}
              <div className="p-3 bg-[#F7F8FA] border border-[#E4E6EB] rounded-md text-left flex items-center space-x-3 shadow-2xs">
                <img
                  src={regAvatar}
                  alt="avatar"
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#1877F2]"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-black text-[#050505] truncate">{regNickname}</div>
                  <div className="text-xs text-[#65676B] truncate">{regBio}</div>
                  <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                    ● 星纪元状态: 在线 · 探索中
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSuccessEnter}
                className="w-full py-3 bg-[#1877F2] hover:bg-[#166FE5] text-white text-sm font-black rounded-md border border-[#1877F2] cursor-pointer transition-all active:scale-[0.99] shadow-xs tracking-wide"
              >
                立即进入地图探索 🚀
              </button>
            </div>
          )}

        </div>
      </main>

      {/* Footer with Language Bar */}
      <footer className="bg-white border-t border-[#E4E6EB] py-2.5 px-3 text-center shrink-0 z-30 space-y-1">
        <div className="flex items-center justify-center space-x-2 text-[11px] text-[#65676B]">
          <span className="text-[#050505] font-bold">中文(简体)</span>
          <span className="text-[#CCD0D5]">•</span>
          <span className="hover:underline cursor-pointer">English (US)</span>
          <span className="text-[#CCD0D5]">•</span>
          <span className="hover:underline cursor-pointer">繁體中文(台灣)</span>
          <span className="text-[#CCD0D5]">•</span>
          <span className="hover:underline cursor-pointer">日本語</span>
        </div>
        <div className="text-[10px] text-[#8A8D91]">
          Meta · Stellar © 2026 · Facebook Straight-Edge UI Framework
        </div>
      </footer>

      {/* Avatar Picker Modal */}
      {isAvatarPickerOpen && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-[#E4E6EB] rounded-md max-w-sm w-full p-4 shadow-xl space-y-3 text-left">
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
              <h3 className="text-sm font-black text-[#050505]">挑选您的星空化身</h3>
              <button
                type="button"
                onClick={() => setIsAvatarPickerOpen(false)}
                className="p-1 text-[#65676B] hover:text-[#050505]"
              >
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {presetAvatars.map((av, idx) => (
                <img
                  key={`picker-av-${idx}`}
                  src={av}
                  alt={`preset-${idx}`}
                  onClick={() => {
                    setRegAvatar(av);
                    setIsAvatarPickerOpen(false);
                  }}
                  className={`w-full aspect-square object-cover rounded-full cursor-pointer border-2 transition-transform ${
                    regAvatar === av ? 'border-[#1877F2] scale-105 shadow-md' : 'border-transparent hover:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Terms & Privacy Modal */}
      {isTermsModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-[#E4E6EB] rounded-md max-w-md w-full p-4.5 shadow-xl space-y-3 text-left max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2 shrink-0">
              <div className="flex items-center space-x-2">
                <FileText size={16} className="text-[#1877F2]" />
                <h3 className="text-sm font-black text-[#050505]">服务协议与隐私权规范</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTermsModalOpen(false)}
                className="p-1 text-[#65676B] hover:text-[#050505]"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 text-xs text-[#65676B] leading-relaxed custom-scrollbar pr-1">
              <p className="font-bold text-[#050505]">1. 欢迎使用 Stellar 星图网络</p>
              <p>
                Stellar 提供近邻互动、家人安心守护及同城盲盒探索。我们在传输和存储您的空间地理信息时采用严格的端对端多重哈希验证机制。
              </p>
              <p className="font-bold text-[#050505]">2. 位置权限与隐身保护</p>
              <p>
                您可以随时在设置中心开启「隐身模式」或调整图层共享范围。未经您的授权，系统不会将精确定位数据泄露给第三方商业机构。
              </p>
              <p className="font-bold text-[#050505]">3. 账号安全责任</p>
              <p>
                请妥善保管您的登录密钥及验证短信。为防范冒名登录，若在非信任设备上登录，系统将触发二次多因子防护。
              </p>
            </div>
            <div className="pt-2 border-t border-[#E4E6EB] shrink-0">
              <button
                type="button"
                onClick={() => setIsTermsModalOpen(false)}
                className="w-full py-2 bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-bold rounded-md"
              >
                我已了解并关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
