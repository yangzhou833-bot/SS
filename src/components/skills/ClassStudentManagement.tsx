import React, { useState } from 'react';
import {
  Users,
  Plus,
  QrCode,
  Search,
  Copy,
  RefreshCw,
  UserPlus,
  Check,
  CheckCircle2,
  AlertTriangle,
  Download,
  Share2,
  Camera,
  Scan,
  Building2,
  Phone,
  Home,
  X,
  Filter,
  Trash2,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Clock,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export interface ClassStudentItem {
  id: string;
  name: string;
  studentId: string;
  avatar: string;
  status: 'active' | 'warning' | 'leave';
  attendanceRate: number;
  dorm: string;
  phone: string;
  gender: 'male' | 'female';
  stellarCode: string;
  joinDate: string;
  joinMethod: 'stellar_code' | 'qr_scan' | 'plus_invite' | 'system_import';
  notes?: string;
}

export interface ManagedClassInfo {
  id: string;
  name: string;
  shortCode: string;
  stellarCode: string;
  counselor: string;
  dept: string;
  headcount: number;
  attendanceAvg: number;
}

interface ClassStudentManagementProps {
  counselorName?: string;
  counselorRankTag?: string;
  showToast: (msg: string) => void;
  initialClassList?: Array<{ id: string; name: string; shortCode?: string; count?: number; dept?: string }>;
}

const DEFAULT_MANAGED_CLASSES: ManagedClassInfo[] = [
  {
    id: 'cls-c1',
    name: '2024级 计算机科学一班',
    shortCode: 'CS-2401',
    stellarCode: 'ST-CS2401-8869',
    counselor: '李明 专职辅导员',
    dept: '计算机科学与技术学院',
    headcount: 32,
    attendanceAvg: 98.4,
  },
  {
    id: 'cls-c2',
    name: '2024级 计算机科学二班',
    shortCode: 'CS-2402',
    stellarCode: 'ST-CS2402-4192',
    counselor: '李明 专职辅导员',
    dept: '计算机科学与技术学院',
    headcount: 30,
    attendanceAvg: 95.8,
  },
  {
    id: 'cls-c3',
    name: '2024级 人工智能英才班',
    shortCode: 'AI-2401',
    stellarCode: 'ST-AI2401-6731',
    counselor: '李明 专职辅导员',
    dept: '计算机科学与技术学院',
    headcount: 28,
    attendanceAvg: 99.1,
  },
];

const INITIAL_CLASS_STUDENTS: ClassStudentItem[] = [
  {
    id: 'st-01',
    name: '陈志强',
    studentId: '2024CS0801',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    status: 'active',
    attendanceRate: 98,
    dorm: '南区 4#502',
    phone: '13812345001',
    gender: 'male',
    stellarCode: 'ST-STU-0801',
    joinDate: '2024-09-01',
    joinMethod: 'stellar_code',
    notes: '班级骨干，上机实验全勤',
  },
  {
    id: 'st-02',
    name: '邓雅文',
    studentId: '2024CS0802',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    status: 'leave',
    attendanceRate: 95,
    dorm: '北区 2#301',
    phone: '13812345002',
    gender: 'female',
    stellarCode: 'ST-STU-0802',
    joinDate: '2024-09-01',
    joinMethod: 'qr_scan',
    notes: '本周事假半天已批复销假',
  },
  {
    id: 'st-03',
    name: '高海峰',
    studentId: '2024CS0803',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    status: 'active',
    attendanceRate: 100,
    dorm: '南区 4#503',
    phone: '13812345003',
    gender: 'male',
    stellarCode: 'ST-STU-0803',
    joinDate: '2024-09-02',
    joinMethod: 'plus_invite',
    notes: '学习委员，高数辅导小组长',
  },
  {
    id: 'st-04',
    name: '林雨彤',
    studentId: '2024CS0804',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    status: 'active',
    attendanceRate: 99,
    dorm: '北区 2#302',
    phone: '13812345004',
    gender: 'female',
    stellarCode: 'ST-STU-0804',
    joinDate: '2024-09-01',
    joinMethod: 'stellar_code',
    notes: '计科一班班长，协调学工事务',
  },
  {
    id: 'st-05',
    name: '赵天佑',
    studentId: '2024CS0805',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    status: 'active',
    attendanceRate: 96,
    dorm: '南区 4#501',
    phone: '13812345005',
    gender: 'male',
    stellarCode: 'ST-STU-0805',
    joinDate: '2024-09-03',
    joinMethod: 'qr_scan',
    notes: '算法竞赛院队主力队员',
  },
  {
    id: 'st-06',
    name: '钱思敏',
    studentId: '2024CS0806',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    status: 'active',
    attendanceRate: 97,
    dorm: '北区 1#405',
    phone: '13812345006',
    gender: 'female',
    stellarCode: 'ST-STU-0806',
    joinDate: '2024-09-02',
    joinMethod: 'stellar_code',
    notes: '文体委员，组织班级晨跑打卡',
  },
  {
    id: 'st-07',
    name: '孙雷',
    studentId: '2024CS0812',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    status: 'warning',
    attendanceRate: 68,
    dorm: '南区 5#204',
    phone: '13812345012',
    gender: 'male',
    stellarCode: 'ST-STU-0812',
    joinDate: '2024-09-01',
    joinMethod: 'system_import',
    notes: '连续大课缺勤，已下发约谈通知函',
  },
  {
    id: 'st-08',
    name: '楚云舒',
    studentId: '2024CS0808',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    status: 'active',
    attendanceRate: 100,
    dorm: '北区 2#304',
    phone: '13812345008',
    gender: 'female',
    stellarCode: 'ST-STU-0808',
    joinDate: '2024-09-02',
    joinMethod: 'plus_invite',
    notes: '心理联络员，关注寝室生活心理健康',
  },
  {
    id: 'st-09',
    name: '冯嘉伟',
    studentId: '2024CS0807',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    status: 'active',
    attendanceRate: 94,
    dorm: '南区 4#504',
    phone: '13812345007',
    gender: 'male',
    stellarCode: 'ST-STU-0807',
    joinDate: '2024-09-03',
    joinMethod: 'qr_scan',
    notes: '开源社团活跃成员',
  },
  {
    id: 'st-10',
    name: '魏子墨',
    studentId: '2024CS0809',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    status: 'active',
    attendanceRate: 93,
    dorm: '南区 3#102',
    phone: '13812345009',
    gender: 'male',
    stellarCode: 'ST-STU-0809',
    joinDate: '2024-09-04',
    joinMethod: 'stellar_code',
    notes: '实验室值日生',
  },
  {
    id: 'st-11',
    name: '蒋思琪',
    studentId: '2024CS0810',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
    status: 'active',
    attendanceRate: 98,
    dorm: '北区 1#402',
    phone: '13812345010',
    gender: 'female',
    stellarCode: 'ST-STU-0810',
    joinDate: '2024-09-01',
    joinMethod: 'plus_invite',
    notes: '团支书，负责青年大学习统筹',
  },
  {
    id: 'st-12',
    name: '沈一鸣',
    studentId: '2024CS0811',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    status: 'active',
    attendanceRate: 92,
    dorm: '南区 4#505',
    phone: '13812345011',
    gender: 'male',
    stellarCode: 'ST-STU-0811',
    joinDate: '2024-09-02',
    joinMethod: 'qr_scan',
    notes: '课外科技竞赛团队成员',
  },
];

// Candidates pool for Stellar Code search & QR simulation join
const CANDIDATE_STUDENTS: Array<Omit<ClassStudentItem, 'id' | 'joinDate' | 'joinMethod'>> = [
  {
    name: '韩晓雪',
    studentId: '2024CS0815',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    status: 'active',
    attendanceRate: 99,
    dorm: '北区 3#205',
    phone: '13912345015',
    gender: 'female',
    stellarCode: 'ST-STU-0815',
    notes: '大一转专业新生，转入计算机科学',
  },
  {
    name: '陆子豪',
    studentId: '2024CS0816',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    status: 'active',
    attendanceRate: 97,
    dorm: '南区 6#402',
    phone: '13912345016',
    gender: 'male',
    stellarCode: 'ST-STU-0816',
    notes: 'ACM校集训队预备队员',
  },
  {
    name: '郑浩然',
    studentId: '2024CS0817',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    status: 'active',
    attendanceRate: 96,
    dorm: '南区 5#310',
    phone: '13912345017',
    gender: 'male',
    stellarCode: 'ST-STU-0817',
    notes: '校园极客马拉松一等奖',
  },
  {
    name: '白雨薇',
    studentId: '2024CS0818',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    status: 'active',
    attendanceRate: 100,
    dorm: '北区 1#503',
    phone: '13912345018',
    gender: 'female',
    stellarCode: 'ST-STU-0818',
    notes: '学术英语竞赛国家级优胜奖',
  },
];

export const ClassStudentManagement: React.FC<ClassStudentManagementProps> = ({
  counselorName = '李明',
  counselorRankTag = '专职辅导员',
  showToast,
  initialClassList,
}) => {
  // Managed classes state
  const [classes, setClasses] = useState<ManagedClassInfo[]>(() => {
    if (initialClassList && initialClassList.length > 0) {
      return initialClassList.map((c, idx) => ({
        id: c.id || `cls-${idx}`,
        name: c.name,
        shortCode: c.shortCode || `CS-240${idx + 1}`,
        stellarCode: `ST-${c.shortCode || `CS-240${idx + 1}`}-${7000 + idx * 317}`,
        counselor: `${counselorName} ${counselorRankTag}`,
        dept: c.dept || '计算机科学与技术学院',
        headcount: c.count || 32,
        attendanceAvg: 97.5,
      }));
    }
    return DEFAULT_MANAGED_CLASSES;
  });

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'cls-c1');
  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  // Students list state
  const [students, setStudents] = useState<ClassStudentItem[]>(INITIAL_CLASS_STUDENTS);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'warning' | 'leave'>('all');

  // Modal: Add / Invite Student
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteModalTab, setInviteModalTab] = useState<'stellar' | 'qrcode' | 'manual'>('stellar');

  // Stellar Search state
  const [stellarSearchCode, setStellarSearchCode] = useState('');
  const [stellarMatchedStudent, setStellarMatchedStudent] = useState<typeof CANDIDATE_STUDENTS[0] | null>(null);

  // QR Scan simulation state
  const [isScanningActive, setIsScanningActive] = useState(false);
  const [scannedSuccessStudent, setScannedSuccessStudent] = useState<ClassStudentItem | null>(null);

  // Manual addition form state
  const [manualName, setManualName] = useState('');
  const [manualStudentId, setManualStudentId] = useState('');
  const [manualDorm, setManualDorm] = useState('南区 4#506');
  const [manualPhone, setManualPhone] = useState('');
  const [manualGender, setManualGender] = useState<'male' | 'female'>('male');

  // Student Detail Modal state
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<ClassStudentItem | null>(null);

  // Filtered student list
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.dorm.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.stellarCode.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && s.status === statusFilter;
  });

  // Copy Stellar Code
  const handleCopyStellarCode = () => {
    navigator.clipboard?.writeText(currentClass.stellarCode);
    showToast(`📋 已复制班级 Stellar 代码：${currentClass.stellarCode}！可发至班级微信群/年级通知群`);
  };

  // Regenerate Stellar Code
  const handleRegenerateStellarCode = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newCode = `ST-${currentClass.shortCode}-${randomSuffix}`;
    setClasses((prev) =>
      prev.map((c) => (c.id === currentClass.id ? { ...c, stellarCode: newCode } : c))
    );
    showToast(`🔄 班级 Stellar 代码已重新生成为：【${newCode}】！旧代码已自动注销安全失效`);
  };

  // Search by Stellar Code / Student ID
  const handleSearchStellarCode = () => {
    const query = stellarSearchCode.trim().toUpperCase();
    if (!query) {
      showToast('⚠️ 请输入学生学号、姓名或 Stellar 码后进行搜索');
      return;
    }

    // Check if student already in class
    const alreadyExists = students.some(
      (s) => s.studentId.toUpperCase() === query || s.name === query || s.stellarCode.toUpperCase() === query
    );
    if (alreadyExists) {
      showToast('ℹ️ 该学生已在当前班级花名册中，无需重复加入！');
      return;
    }

    // Search from candidates pool
    const matched = CANDIDATE_STUDENTS.find(
      (c) =>
        c.studentId.toUpperCase().includes(query) ||
        c.name.includes(query) ||
        c.stellarCode.toUpperCase().includes(query)
    ) || {
      name: query.length <= 4 ? query : '新录入学生',
      studentId: query.startsWith('2024') ? query : `2024CS${Math.floor(820 + Math.random() * 80)}`,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      status: 'active',
      attendanceRate: 98,
      dorm: '南区 6#302',
      phone: '13812345088',
      gender: 'male' as const,
      stellarCode: query.startsWith('ST-') ? query : `ST-STU-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: '通过班级 Stellar 搜索校验认证',
    };

    setStellarMatchedStudent(matched);
    showToast(`🎯 已检索到学生【${matched.name}】(${matched.studentId})，请确认加入！`);
  };

  // Confirm adding matched student via Stellar Code
  const handleConfirmAddStellarStudent = () => {
    if (!stellarMatchedStudent) return;
    const newStudent: ClassStudentItem = {
      id: `st-${Date.now()}`,
      ...stellarMatchedStudent,
      joinDate: '2026-09-03',
      joinMethod: 'stellar_code',
    };

    setStudents((prev) => [newStudent, ...prev]);
    setClasses((prev) =>
      prev.map((c) => (c.id === currentClass.id ? { ...c, headcount: c.headcount + 1 } : c))
    );
    showToast(`🎉 成功！学生【${newStudent.name}】已通过 Stellar 代码加入【${currentClass.name}】！`);
    setStellarMatchedStudent(null);
    setStellarSearchCode('');
    setIsInviteModalOpen(false);
  };

  // Simulate scanning QR Code
  const handleStartSimulatedScan = (candidateIndex: number = 0) => {
    setIsScanningActive(true);
    setTimeout(() => {
      setIsScanningActive(false);
      const candidate = CANDIDATE_STUDENTS[candidateIndex % CANDIDATE_STUDENTS.length];
      const newStudent: ClassStudentItem = {
        id: `st-qr-${Date.now()}`,
        ...candidate,
        joinDate: '2026-09-03',
        joinMethod: 'qr_scan',
      };
      setScannedSuccessStudent(newStudent);
      setStudents((prev) => [newStudent, ...prev]);
      setClasses((prev) =>
        prev.map((c) => (c.id === currentClass.id ? { ...c, headcount: c.headcount + 1 } : c))
      );
      showToast(`📸 扫码识别成功！学生【${newStudent.name}】(${newStudent.studentId}) 已通过班级二维码加入！`);
    }, 1200);
  };

  // Manual Add Student
  const handleManualAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) {
      showToast('⚠️ 请填写学生真实姓名');
      return;
    }

    const assignedId = manualStudentId.trim() || `2024CS08${Math.floor(30 + Math.random() * 60)}`;
    const newStudent: ClassStudentItem = {
      id: `st-manual-${Date.now()}`,
      name: manualName.trim(),
      studentId: assignedId,
      avatar:
        manualGender === 'female'
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      status: 'active',
      attendanceRate: 100,
      dorm: manualDorm.trim() || '南区 4#506',
      phone: manualPhone.trim() || '13812345099',
      gender: manualGender,
      stellarCode: `ST-STU-${assignedId.slice(-4)}`,
      joinDate: '2026-09-03',
      joinMethod: 'plus_invite',
      notes: '辅导员直接添加录入',
    };

    setStudents((prev) => [newStudent, ...prev]);
    setClasses((prev) =>
      prev.map((c) => (c.id === currentClass.id ? { ...c, headcount: c.headcount + 1 } : c))
    );
    showToast(`✅ 已通过「+号卡片」将学生【${newStudent.name}】成功添加到班级！已发送通知`);
    setManualName('');
    setManualStudentId('');
    setManualPhone('');
    setIsInviteModalOpen(false);
  };

  // Remove student from class
  const handleRemoveStudent = (studentId: string, studentName: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    setClasses((prev) =>
      prev.map((c) => (c.id === currentClass.id ? { ...c, headcount: Math.max(0, c.headcount - 1) } : c))
    );
    setSelectedStudentDetail(null);
    showToast(`🗑️ 学生【${studentName}】已从当前班级底册移出`);
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-150">
      {/* ================= HEADER: CLASS SELECTOR & STELLAR CODE BANNER ================= */}
      <div className="bg-white border border-[#E4E6EB] rounded-md p-3 shadow-2xs space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4E6EB] pb-2.5">
          <div>
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-[#1877F2]" />
              <h2 className="text-sm font-black text-[#050505] tracking-tight">辅导员 · 班级学生管理中心</h2>
              <span className="px-1.5 py-0.2 bg-[#E7F3FF] text-[#1877F2] text-[9.5px] font-bold rounded-2xs border border-[#1877F2]/30 font-mono">
                {counselorRankTag}
              </span>
            </div>
            <p className="text-[10px] text-[#65676B] mt-0.5">
              管辖辅导员：<strong className="text-[#050505]">{counselorName}</strong> · 班级学生小方块档案卡片 · 支持代码与扫码加入
            </p>
          </div>

          {/* Class Switcher */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-[10px] font-bold text-[#65676B] shrink-0">当前负责班级：</span>
            <div className="relative">
              <select
                id="select-counselor-class"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="text-xs font-bold text-[#050505] bg-[#FAFBFD] border border-[#E4E6EB] rounded-xs px-2.5 py-1 pr-7 focus:outline-none focus:border-[#1877F2] cursor-pointer shadow-2xs"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.shortCode})
                  </option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-2.5 text-[#65676B] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ================= CLASS STATS & STELLAR CODE ACTIONS BAR ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-0.5">
          {/* Card A: Stellar 班级专属识别代码 */}
          <div className="p-2.5 bg-[#FAFBFD] border border-[#E4E6EB] rounded-xs flex items-center justify-between">
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1877F2] animate-pulse" />
                <span className="text-[10px] font-bold text-[#65676B]">班级 Stellar 代码</span>
                <span className="text-[8px] bg-[#E7F3FF] text-[#1877F2] px-1 py-0.2 rounded-2xs font-bold border border-[#1877F2]/20">
                  通行加入码
                </span>
              </div>
              <div className="font-mono font-black text-xs text-[#1877F2] tracking-wider truncate">
                {currentClass.stellarCode}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                id="copy-stellar-code-btn"
                onClick={handleCopyStellarCode}
                className="p-1.5 bg-white hover:bg-[#E7F3FF] text-[#1877F2] border border-[#E4E6EB] hover:border-[#1877F2] rounded-xs cursor-pointer transition-colors shadow-2xs"
                title="一键复制 Stellar 代码"
              >
                <Copy size={12} />
              </button>
              <button
                type="button"
                id="refresh-stellar-code-btn"
                onClick={handleRegenerateStellarCode}
                className="p-1.5 bg-white hover:bg-gray-50 text-[#65676B] hover:text-[#050505] border border-[#E4E6EB] rounded-xs cursor-pointer transition-colors shadow-2xs"
                title="重新生成班级代码"
              >
                <RefreshCw size={12} />
              </button>
            </div>
          </div>

          {/* Card B: 班级二维码入口 */}
          <div className="p-2.5 bg-[#FAFBFD] border border-[#E4E6EB] rounded-xs flex items-center justify-between">
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-1.5">
                <QrCode size={13} className="text-[#1877F2]" />
                <span className="text-[10px] font-bold text-[#65676B]">班级专属二维码</span>
              </div>
              <p className="text-[10px] text-[#050505] font-bold truncate">
                支持微信/客户端扫码加入
              </p>
            </div>
            <button
              type="button"
              id="open-qr-modal-btn"
              onClick={() => {
                setInviteModalTab('qrcode');
                setIsInviteModalOpen(true);
              }}
              className="px-2 py-1 bg-[#1877F2] hover:bg-[#166FE5] text-white text-[10px] font-bold rounded-xs cursor-pointer transition-colors flex items-center gap-1 shadow-2xs shrink-0"
            >
              <QrCode size={11} />
              <span>展示二维码</span>
            </button>
          </div>

          {/* Card C: 班级人数与到课率 */}
          <div className="p-2.5 bg-[#FAFBFD] border border-[#E4E6EB] rounded-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Users size={13} className="text-emerald-600" />
                <span className="text-[10px] font-bold text-[#65676B]">班级在册花名册</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xs text-[#050505]">{students.length} 名学生</span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded-2xs border border-emerald-200">
                  出勤率 98.4%
                </span>
              </div>
            </div>
            <button
              type="button"
              id="top-add-student-btn"
              onClick={() => {
                setInviteModalTab('stellar');
                setIsInviteModalOpen(true);
              }}
              className="px-2 py-1 bg-[#E7F3FF] hover:bg-[#D8EBFF] text-[#1877F2] text-[10px] font-bold rounded-xs border border-[#1877F2]/30 cursor-pointer transition-colors flex items-center gap-1 shadow-2xs shrink-0"
            >
              <Plus size={11} />
              <span>添加学生</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= SEARCH & STATUS FILTER TOOLBAR ================= */}
      <div className="bg-white border border-[#E4E6EB] rounded-md p-2 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search size={13} className="absolute left-2.5 top-2 text-[#65676B]" />
          <input
            type="text"
            id="search-student-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索姓名、学号、寝室或Stellar码..."
            className="w-full text-xs pl-8 pr-2.5 py-1 bg-[#FAFBFD] border border-[#E4E6EB] rounded-xs focus:outline-none focus:border-[#1877F2] text-[#050505]"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-2 text-[#65676B] hover:text-[#050505]"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Filter tags */}
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-0.5 sm:pb-0">
          {[
            { key: 'all', label: '全部学生', count: students.length },
            { key: 'active', label: '正常在籍', count: students.filter((s) => s.status === 'active').length },
            { key: 'warning', label: '旷课预警', count: students.filter((s) => s.status === 'warning').length },
            { key: 'leave', label: '请假在审', count: students.filter((s) => s.status === 'leave').length },
          ].map((tab) => {
            const isSelected = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key as any)}
                className={`px-2 py-0.8 text-[10px] font-bold rounded-xs border transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#1877F2] text-white border-[#1877F2] shadow-2xs'
                    : 'bg-[#FAFBFD] text-[#65676B] border-[#E4E6EB] hover:border-[#1877F2]/40 hover:bg-white'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[8.5px] px-1 py-0.2 rounded-2xs ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#E4E6EB] text-[#65676B]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= STUDENT SMALL SQUARE CARDS GRID (学生小方块卡片网格) ================= */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <div className="text-xs font-bold text-[#050505] flex items-center gap-1.5">
            <span>学生小方块卡片清单</span>
            <span className="text-[10px] text-[#65676B] font-normal">
              (共 {filteredStudents.length} 人 · 点击卡片查看学生详细学籍信息)
            </span>
          </div>
          <div className="text-[9.5px] text-[#1877F2] font-mono font-bold flex items-center gap-1">
            <Sparkles size={11} />
            <span>Facebook 直角线框高密度卡片</span>
          </div>
        </div>

        {/* The Grid: Starts with the prominent "+" Square Card */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
          {/* ================= THE "+" SQUARE CARD: CLICK TO INVITE/ADD ================= */}
          <button
            type="button"
            id="plus-invite-square-card"
            onClick={() => {
              setInviteModalTab('stellar');
              setIsInviteModalOpen(true);
            }}
            className="aspect-square min-h-[142px] border-2 border-dashed border-[#1877F2]/50 hover:border-[#1877F2] bg-[#FAFBFD] hover:bg-[#E7F3FF]/40 rounded-md p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer shadow-2xs hover:shadow-xs group relative"
            title="点击添加或邀请学生加入"
          >
            {/* Pulsing glow ring */}
            <div className="w-10 h-10 rounded-full bg-[#E7F3FF] group-hover:bg-[#1877F2] text-[#1877F2] group-hover:text-white flex items-center justify-center transition-all shadow-2xs mb-2 group-hover:scale-110">
              <Plus size={20} className="stroke-[2.5]" />
            </div>

            <span className="text-xs font-black text-[#050505] group-hover:text-[#1877F2] transition-colors leading-tight">
              + 邀请加入学生
            </span>

            <span className="text-[9.5px] text-[#65676B] mt-1 group-hover:text-[#1877F2]/90 leading-tight">
              点击 + 号卡片
            </span>

            <div className="mt-2 flex items-center gap-1">
              <span className="px-1.5 py-0.2 bg-white group-hover:bg-white text-[#1877F2] font-mono text-[8px] font-bold rounded-2xs border border-[#1877F2]/30 shadow-2xs">
                Stellar码 / 扫码
              </span>
            </div>
          </button>

          {/* ================= STUDENT SQUARE CARDS ================= */}
          {filteredStudents.map((stu, index) => {
            const isWarning = stu.status === 'warning';
            const isLeave = stu.status === 'leave';

            return (
              <div
                key={`student-${stu.id}-${index}`}
                id={`student-card-${stu.studentId}`}
                onClick={() => setSelectedStudentDetail(stu)}
                className={`aspect-square min-h-[142px] bg-white border rounded-md p-2.5 flex flex-col justify-between items-center text-center relative shadow-2xs hover:shadow-xs transition-all cursor-pointer group ${
                  isWarning
                    ? 'border-rose-300 hover:border-rose-500 bg-rose-50/20'
                    : isLeave
                    ? 'border-amber-300 hover:border-amber-500 bg-amber-50/20'
                    : 'border-[#E4E6EB] hover:border-[#1877F2]'
                }`}
              >
                {/* Top Row: Index Badge & Status Dot */}
                <div className="w-full flex items-center justify-between text-[9px]">
                  <span className="font-mono text-[#65676B] font-bold">
                    #{String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex items-center gap-1">
                    {isWarning ? (
                      <span className="px-1 py-0.2 rounded-2xs bg-rose-100 text-rose-700 text-[8px] font-bold border border-rose-200">
                        预警
                      </span>
                    ) : isLeave ? (
                      <span className="px-1 py-0.2 rounded-2xs bg-amber-100 text-amber-800 text-[8px] font-bold border border-amber-200">
                        请假
                      </span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-[#42B72A]" title="正常在籍" />
                    )}
                  </div>
                </div>

                {/* Center: Avatar & Name */}
                <div className="flex flex-col items-center my-auto">
                  <div className="relative mb-1">
                    <img
                      src={stu.avatar}
                      alt={stu.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#E4E6EB] group-hover:scale-105 transition-transform shadow-2xs"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white ${
                        isWarning ? 'bg-rose-500' : isLeave ? 'bg-amber-400' : 'bg-[#42B72A]'
                      }`}
                    />
                  </div>
                  <h4 className="text-xs font-black text-[#050505] group-hover:text-[#1877F2] transition-colors truncate max-w-[85px]">
                    {stu.name}
                  </h4>
                  <span className="font-mono text-[9px] text-[#65676B] truncate max-w-[90px]">
                    {stu.studentId}
                  </span>
                </div>

                {/* Bottom: Attendance Pill & Dorm Tag */}
                <div className="w-full space-y-0.5 pt-1 border-t border-[#E4E6EB]/60">
                  <div className="flex items-center justify-between text-[8.5px]">
                    <span
                      className={`font-bold font-mono ${
                        stu.attendanceRate < 80 ? 'text-rose-600' : 'text-emerald-700'
                      }`}
                    >
                      到课 {stu.attendanceRate}%
                    </span>
                    <span className="text-[#65676B] truncate max-w-[50px] font-medium" title={stu.dorm}>
                      {stu.dorm.replace('南区 ', '').replace('北区 ', '')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredStudents.length === 0 && (
          <div className="bg-white border border-[#E4E6EB] rounded-md p-6 text-center space-y-2">
            <Users size={24} className="mx-auto text-[#65676B] opacity-50" />
            <p className="text-xs text-[#65676B] font-bold">没有匹配到符合条件的学生</p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="text-xs text-[#1877F2] font-bold hover:underline"
            >
              清除筛选条件
            </button>
          </div>
        )}
      </div>

      {/* ================= MODAL: ADD / INVITE STUDENT (3 MODES) ================= */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white border border-[#E4E6EB] rounded-md w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-lg space-y-3 p-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2.5">
              <div className="flex items-center gap-2">
                <UserPlus size={16} className="text-[#1877F2]" />
                <h3 className="text-sm font-black text-[#050505]">
                  添加学生进入【{currentClass.name}】
                </h3>
              </div>
              <button
                type="button"
                id="close-invite-modal-btn"
                onClick={() => {
                  setIsInviteModalOpen(false);
                  setStellarMatchedStudent(null);
                  setScannedSuccessStudent(null);
                }}
                className="p-1 text-[#65676B] hover:text-[#050505] rounded-xs hover:bg-[#F0F2F5] cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* 3 Tabs Header */}
            <div className="grid grid-cols-3 gap-1 bg-[#F0F2F5] p-1 rounded-xs">
              <button
                type="button"
                id="invite-tab-stellar"
                onClick={() => setInviteModalTab('stellar')}
                className={`py-1.5 px-2 text-xs font-bold rounded-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  inviteModalTab === 'stellar'
                    ? 'bg-white text-[#1877F2] shadow-2xs'
                    : 'text-[#65676B] hover:text-[#050505]'
                }`}
              >
                <Sparkles size={13} />
                <span>Stellar 代码加入</span>
              </button>
              <button
                type="button"
                id="invite-tab-qrcode"
                onClick={() => setInviteModalTab('qrcode')}
                className={`py-1.5 px-2 text-xs font-bold rounded-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  inviteModalTab === 'qrcode'
                    ? 'bg-white text-[#1877F2] shadow-2xs'
                    : 'text-[#65676B] hover:text-[#050505]'
                }`}
              >
                <QrCode size={13} />
                <span>扫描班级二维码</span>
              </button>
              <button
                type="button"
                id="invite-tab-manual"
                onClick={() => setInviteModalTab('manual')}
                className={`py-1.5 px-2 text-xs font-bold rounded-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  inviteModalTab === 'manual'
                    ? 'bg-white text-[#1877F2] shadow-2xs'
                    : 'text-[#65676B] hover:text-[#050505]'
                }`}
              >
                <Plus size={13} />
                <span>快速直接录入</span>
              </button>
            </div>

            {/* ================= TAB 1: STELLAR CODE SEARCH & JOIN ================= */}
            {inviteModalTab === 'stellar' && (
              <div className="space-y-3">
                {/* Current Class Stellar Code Display Card */}
                <div className="bg-[#FAFBFD] border border-[#E4E6EB] p-3 rounded-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#050505] flex items-center gap-1.5">
                      <Sparkles size={13} className="text-[#1877F2]" />
                      <span>班级当前生成的专属 Stellar 代码</span>
                    </span>
                    <span className="text-[9px] text-[#1877F2] font-bold bg-[#E7F3FF] px-1.5 py-0.2 rounded-2xs border border-[#1877F2]/20">
                      实时有效
                    </span>
                  </div>

                  {/* Large Stellar Code Display */}
                  <div className="bg-white border-2 border-dashed border-[#1877F2]/40 rounded-xs p-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
                    <div>
                      <div className="font-mono font-black text-lg text-[#1877F2] tracking-wider">
                        {currentClass.stellarCode}
                      </div>
                      <p className="text-[10px] text-[#65676B] mt-0.5">
                        学生在个人端输入此代码即可即时核验并加入【{currentClass.name}】
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={handleCopyStellarCode}
                        className="px-2.5 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-bold rounded-xs cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <Copy size={12} />
                        <span>一键复制</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRegenerateStellarCode}
                        className="p-1.5 bg-[#FAFBFD] hover:bg-gray-100 text-[#65676B] border border-[#E4E6EB] rounded-xs cursor-pointer"
                        title="重新生成班级代码"
                      >
                        <RefreshCw size={13} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Search & Match by Stellar Code or Student ID */}
                <div className="border border-[#E4E6EB] p-3 rounded-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#050505] block">
                      通过 Stellar 代码 / 学号检索学生加入：
                    </label>
                    <span className="text-[9.5px] text-[#65676B]">辅导员代查或代录</span>
                  </div>

                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      id="stellar-search-input"
                      value={stellarSearchCode}
                      onChange={(e) => setStellarSearchCode(e.target.value)}
                      placeholder="输入学生学号 (如 2024CS0815) 或 Stellar 码..."
                      className="flex-1 text-xs px-2.5 py-1.5 bg-[#FAFBFD] border border-[#E4E6EB] rounded-xs focus:outline-none focus:border-[#1877F2]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSearchStellarCode();
                        }
                      }}
                    />
                    <button
                      type="button"
                      id="submit-stellar-search-btn"
                      onClick={handleSearchStellarCode}
                      className="px-3 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-bold rounded-xs cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <Search size={12} />
                      <span>检索代码</span>
                    </button>
                  </div>

                  {/* Quick Preset Candidates to Click */}
                  <div className="text-[10px] text-[#65676B] flex items-center gap-1 flex-wrap">
                    <span>快捷测试候选学生：</span>
                    {CANDIDATE_STUDENTS.map((c, cIdx) => (
                      <button
                        key={`candidate-stu-${c.studentId}-${cIdx}`}
                        type="button"
                        onClick={() => {
                          setStellarSearchCode(c.studentId);
                          setStellarMatchedStudent(c);
                        }}
                        className="px-1.5 py-0.5 bg-[#F0F2F5] hover:bg-[#E7F3FF] text-[#1877F2] rounded-2xs font-mono font-bold border border-[#E4E6EB] cursor-pointer"
                      >
                        {c.name} ({c.studentId})
                      </button>
                    ))}
                  </div>

                  {/* Matched Student Result Card */}
                  {stellarMatchedStudent && (
                    <div className="bg-emerald-50/50 border border-emerald-300 rounded-xs p-2.5 space-y-2 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 size={13} className="text-emerald-600" />
                          <span>已识别有效学生信息 (Stellar 代码已通过安全校验)</span>
                        </span>
                        <span className="text-[9px] font-mono text-emerald-700 font-bold bg-white px-1.5 py-0.2 rounded-2xs border border-emerald-200">
                          {stellarMatchedStudent.stellarCode}
                        </span>
                      </div>

                      <div className="bg-white p-2 border border-emerald-200 rounded-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={stellarMatchedStudent.avatar}
                            alt={stellarMatchedStudent.name}
                            className="w-9 h-9 rounded-full object-cover border border-[#E4E6EB]"
                          />
                          <div>
                            <div className="text-xs font-black text-[#050505]">
                              {stellarMatchedStudent.name}{' '}
                              <span className="font-mono text-[10px] text-[#65676B]">
                                ({stellarMatchedStudent.studentId})
                              </span>
                            </div>
                            <div className="text-[9.5px] text-[#65676B]">
                              寝室: {stellarMatchedStudent.dorm} · 电话: {stellarMatchedStudent.phone}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          id="confirm-stellar-join-btn"
                          onClick={handleConfirmAddStellarStudent}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xs cursor-pointer shadow-2xs flex items-center gap-1"
                        >
                          <Check size={12} />
                          <span>确认加入班级</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================= TAB 2: SCAN CLASS QR CODE TO JOIN ================= */}
            {inviteModalTab === 'qrcode' && (
              <div className="space-y-3">
                <div className="bg-[#FAFBFD] border border-[#E4E6EB] p-3 rounded-xs flex flex-col sm:flex-row items-center gap-3">
                  {/* High Contrast 2D QR Code SVG */}
                  <div className="p-2.5 bg-white border border-[#E4E6EB] rounded-xs shadow-2xs shrink-0 flex flex-col items-center">
                    <svg
                      viewBox="0 0 140 140"
                      width="120"
                      height="120"
                      className="rounded-xs"
                      shapeRendering="crispEdges"
                    >
                      {/* Background */}
                      <rect width="140" height="140" fill="#ffffff" />
                      {/* Top-Left Corner Finder Pattern */}
                      <rect x="10" y="10" width="35" height="35" fill="#1877F2" />
                      <rect x="15" y="15" width="25" height="25" fill="#ffffff" />
                      <rect x="20" y="20" width="15" height="15" fill="#1877F2" />
                      {/* Top-Right Corner Finder Pattern */}
                      <rect x="95" y="10" width="35" height="35" fill="#1877F2" />
                      <rect x="100" y="15" width="25" height="25" fill="#ffffff" />
                      <rect x="105" y="20" width="15" height="15" fill="#1877F2" />
                      {/* Bottom-Left Corner Finder Pattern */}
                      <rect x="10" y="95" width="35" height="35" fill="#1877F2" />
                      <rect x="15" y="100" width="25" height="25" fill="#ffffff" />
                      <rect x="20" y="105" width="15" height="15" fill="#1877F2" />
                      {/* Random high-density data dots */}
                      <rect x="50" y="15" width="6" height="6" fill="#1C1E21" />
                      <rect x="62" y="15" width="6" height="6" fill="#1C1E21" />
                      <rect x="74" y="22" width="6" height="6" fill="#1C1E21" />
                      <rect x="55" y="30" width="6" height="6" fill="#1877F2" />
                      <rect x="70" y="35" width="6" height="6" fill="#1C1E21" />
                      <rect x="18" y="55" width="6" height="6" fill="#1C1E21" />
                      <rect x="30" y="55" width="6" height="6" fill="#1C1E21" />
                      <rect x="25" y="70" width="6" height="6" fill="#1C1E21" />
                      <rect x="38" y="78" width="6" height="6" fill="#1877F2" />
                      {/* Center Campus Emblem Box */}
                      <rect x="52" y="52" width="36" height="36" fill="#ffffff" stroke="#1877F2" strokeWidth="2" />
                      <text
                        x="70"
                        y="74"
                        fill="#1877F2"
                        fontSize="12"
                        fontWeight="900"
                        textAnchor="middle"
                        fontFamily="sans-serif"
                      >
                        CS
                      </text>
                      {/* Right Data Dots */}
                      <rect x="95" y="55" width="6" height="6" fill="#1C1E21" />
                      <rect x="110" y="55" width="6" height="6" fill="#1C1E21" />
                      <rect x="102" y="70" width="6" height="6" fill="#1877F2" />
                      <rect x="120" y="78" width="6" height="6" fill="#1C1E21" />
                      {/* Bottom Data Dots */}
                      <rect x="55" y="95" width="6" height="6" fill="#1C1E21" />
                      <rect x="68" y="105" width="6" height="6" fill="#1877F2" />
                      <rect x="80" y="98" width="6" height="6" fill="#1C1E21" />
                      <rect x="95" y="112" width="6" height="6" fill="#1C1E21" />
                      <rect x="115" y="105" width="6" height="6" fill="#1C1E21" />
                      <rect x="108" y="120" width="6" height="6" fill="#1877F2" />
                    </svg>
                    <span className="text-[8.5px] font-mono text-[#65676B] mt-1">班级直通二维码</span>
                  </div>

                  {/* QR Description & Actions */}
                  <div className="space-y-2 flex-1 text-center sm:text-left">
                    <div>
                      <h4 className="text-xs font-black text-[#050505]">{currentClass.name}</h4>
                      <p className="text-[10px] text-[#65676B] mt-0.5">
                        管辖辅导员: {counselorName} · 代码: {currentClass.stellarCode}
                      </p>
                    </div>

                    <div className="bg-white border border-[#E4E6EB] p-2 rounded-xs text-[10px] text-[#65676B] space-y-1">
                      <p className="font-bold text-[#050505]">📱 加入方式说明：</p>
                      <p>1. 学生使用手机微信、企业微信或智慧校园客户端「扫一扫」；</p>
                      <p>2. 系统自动识别班级代码并授权提交学籍档案，即时并入班级花名册。</p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
                      <button
                        type="button"
                        onClick={() => {
                          showToast('📥 已下载高清班级二维码矢量图 (可直接用于迎新展板张贴)！');
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-gray-50 text-[#050505] border border-[#E4E6EB] text-[10px] font-bold rounded-xs cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <Download size={11} />
                        <span>下载二维码</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(
                            `https://campus.stellar.edu/join?class=${currentClass.shortCode}&code=${currentClass.stellarCode}`
                          );
                          showToast('🔗 已复制班级加入直达链接！');
                        }}
                        className="px-2.5 py-1 bg-[#E7F3FF] hover:bg-[#D8EBFF] text-[#1877F2] border border-[#1877F2]/30 text-[10px] font-bold rounded-xs cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <Share2 size={11} />
                        <span>复制直达链接</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Simulated QR Code Scan by Counselor / Student */}
                <div className="border border-[#E4E6EB] p-3 rounded-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#050505] flex items-center gap-1.5">
                      <Camera size={13} className="text-[#1877F2]" />
                      <span>现场扫码体验 / 辅导员扫码识读入库</span>
                    </span>
                    <span className="text-[9px] text-[#65676B]">模拟相机/扫码枪交互</span>
                  </div>

                  <div className="bg-[#FAFBFD] p-3 rounded-xs border border-[#E4E6EB] text-center space-y-2">
                    <p className="text-[10.5px] text-[#65676B]">
                      点击下方按钮即可模拟“学生现场出示校园卡二维码”或“扫描班级二维码”瞬间被识别入库流程：
                    </p>

                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        id="simulate-scan-btn"
                        onClick={() => handleStartSimulatedScan(0)}
                        disabled={isScanningActive}
                        className={`px-3 py-1.5 rounded-xs text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                          isScanningActive
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-[#1877F2] hover:bg-[#166FE5] text-white'
                        }`}
                      >
                        <Scan size={13} className={isScanningActive ? 'animate-spin' : ''} />
                        <span>{isScanningActive ? '扫描识别中...' : '模拟扫码识别学生加入'}</span>
                      </button>
                    </div>

                    {scannedSuccessStudent && (
                      <div className="bg-emerald-50 border border-emerald-300 rounded-xs p-2 text-xs text-emerald-800 font-bold flex items-center justify-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        <span>已通过扫码成功添加：{scannedSuccessStudent.name} ({scannedSuccessStudent.studentId})</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 3: MANUAL DIRECT ADDITION ================= */}
            {inviteModalTab === 'manual' && (
              <form onSubmit={handleManualAddStudent} className="space-y-3">
                <div className="bg-[#FAFBFD] border border-[#E4E6EB] p-2.5 rounded-xs text-[10.5px] text-[#65676B]">
                  💡 辅导员可直接输入转专业、新入学或借读学生信息，提交后自动分配班级学籍卡片并生成专属 Stellar 码。
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <label className="font-bold text-[#050505] block mb-1">学生真实姓名 *</label>
                    <input
                      type="text"
                      required
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      placeholder="如：周雨菲"
                      className="w-full px-2.5 py-1.5 bg-[#FAFBFD] border border-[#E4E6EB] rounded-xs focus:outline-none focus:border-[#1877F2]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#050505] block mb-1">学号 (留空自动生成)</label>
                    <input
                      type="text"
                      value={manualStudentId}
                      onChange={(e) => setManualStudentId(e.target.value)}
                      placeholder="如：2024CS0820"
                      className="w-full px-2.5 py-1.5 bg-[#FAFBFD] border border-[#E4E6EB] rounded-xs focus:outline-none focus:border-[#1877F2] font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#050505] block mb-1">性别</label>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          checked={manualGender === 'male'}
                          onChange={() => setManualGender('male')}
                        />
                        <span>男生</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          checked={manualGender === 'female'}
                          onChange={() => setManualGender('female')}
                        />
                        <span>女生</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-[#050505] block mb-1">宿舍寝室号</label>
                    <input
                      type="text"
                      value={manualDorm}
                      onChange={(e) => setManualDorm(e.target.value)}
                      placeholder="如：南区 4#506"
                      className="w-full px-2.5 py-1.5 bg-[#FAFBFD] border border-[#E4E6EB] rounded-xs focus:outline-none focus:border-[#1877F2]"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="font-bold text-[#050505] block mb-1">联系电话</label>
                    <input
                      type="tel"
                      value={manualPhone}
                      onChange={(e) => setManualPhone(e.target.value)}
                      placeholder="如：13812345678"
                      className="w-full px-2.5 py-1.5 bg-[#FAFBFD] border border-[#E4E6EB] rounded-xs focus:outline-none focus:border-[#1877F2] font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E4E6EB] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-3 py-1.5 bg-white border border-[#E4E6EB] text-[#65676B] text-xs font-bold rounded-xs cursor-pointer hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    id="submit-manual-student-btn"
                    className="px-4 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-bold rounded-xs cursor-pointer shadow-2xs flex items-center gap-1"
                  >
                    <Check size={13} />
                    <span>立即录入班级</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL: STUDENT DETAIL CARD ================= */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white border border-[#E4E6EB] rounded-md w-full max-w-md shadow-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
              <div className="flex items-center gap-2">
                <Users size={15} className="text-[#1877F2]" />
                <h3 className="text-sm font-black text-[#050505]">学生学籍档案详情</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentDetail(null)}
                className="p-1 text-[#65676B] hover:text-[#050505] rounded-xs hover:bg-[#F0F2F5] cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Profile Row */}
            <div className="flex items-center gap-3 bg-[#FAFBFD] p-3 rounded-xs border border-[#E4E6EB]">
              <img
                src={selectedStudentDetail.avatar}
                alt={selectedStudentDetail.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-[#1877F2] shadow-2xs"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-base font-black text-[#050505]">{selectedStudentDetail.name}</h4>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-2xs font-mono font-bold bg-[#E7F3FF] text-[#1877F2] border border-[#1877F2]/30">
                    {selectedStudentDetail.studentId}
                  </span>
                </div>
                <p className="text-[11px] text-[#65676B]">{currentClass.name}</p>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span
                    className={`font-bold font-mono ${
                      selectedStudentDetail.attendanceRate < 80 ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    出勤率: {selectedStudentDetail.attendanceRate}%
                  </span>
                  <span className="text-[#CED0D4]">|</span>
                  <span className="text-[#65676B]">寝室: {selectedStudentDetail.dorm}</span>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2.5 border border-[#E4E6EB] rounded-xs">
              <div className="space-y-0.5">
                <span className="text-[#65676B] block">联系电话:</span>
                <span className="font-mono font-bold text-[#050505]">{selectedStudentDetail.phone}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[#65676B] block">加入班级方式:</span>
                <span className="font-bold text-[#1877F2]">
                  {selectedStudentDetail.joinMethod === 'stellar_code'
                    ? 'Stellar 代码验证加入'
                    : selectedStudentDetail.joinMethod === 'qr_scan'
                    ? '扫描班级二维码加入'
                    : selectedStudentDetail.joinMethod === 'plus_invite'
                    ? '+号卡片直接添加'
                    : '系统初始花名册导入'}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[#65676B] block">个人 Stellar 通行码:</span>
                <span className="font-mono text-[#1877F2] font-bold">{selectedStudentDetail.stellarCode}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[#65676B] block">入班确认日期:</span>
                <span className="font-mono text-[#050505]">{selectedStudentDetail.joinDate}</span>
              </div>
              {selectedStudentDetail.notes && (
                <div className="col-span-2 pt-1 border-t border-[#E4E6EB]">
                  <span className="text-[#65676B] block">辅导员学籍备注:</span>
                  <span className="text-[#050505] font-medium">{selectedStudentDetail.notes}</span>
                </div>
              )}
            </div>

            {/* Actions footer */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => handleRemoveStudent(selectedStudentDetail.id, selectedStudentDetail.name)}
                className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold rounded-xs cursor-pointer flex items-center gap-1"
              >
                <Trash2 size={12} />
                <span>移出班级</span>
              </button>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    showToast(`📞 已向学生【${selectedStudentDetail.name}】(${selectedStudentDetail.phone}) 发起辅导员学工短信/微信约谈提醒！`);
                  }}
                  className="px-2.5 py-1 bg-[#FAFBFD] hover:bg-gray-100 border border-[#E4E6EB] text-[#050505] text-xs font-bold rounded-xs cursor-pointer flex items-center gap-1"
                >
                  <Phone size={12} />
                  <span>约谈通知</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStudentDetail(null)}
                  className="px-3 py-1 bg-[#1877F2] text-white text-xs font-bold rounded-xs cursor-pointer hover:bg-[#166FE5]"
                >
                  完成查看
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
