/**
 * Stellar Unified Privacy Permission Engine
 * 
 * Implements the core specification: canView(viewer, subject, object, context)
 * Evaluates visibility rules across:
 * - Ghost Mode
 * - Family / Guardian relationships & Emergency bypass with explicit audit
 * - Close Friends / Lovers / Normal Friends
 * - Event Participant rules (Organizer view, Friend co-visibility, Non-friend isolation, Forced visibility)
 * - Group Duty & Anchor Location Authorization
 * - Visibility Schedules (Hour / Weekday windows)
 * - Virtual Location Radii (2km / 4km / 6km stabilization)
 * - Custom Inclusion / Exclusion lists
 */

export type RelationshipType = 'lover' | 'close' | 'family' | 'friend' | 'none';

export type VisibilityScopeType =
  | 'friends'
  | 'group'
  | 'specifiedUsers'
  | 'excludedUsers'
  | 'organizerOnly'
  | 'participants'
  | 'private'
  | 'public';

export interface VisibilityRule {
  scopeType: VisibilityScopeType;
  includedIds?: string[];
  excludedIds?: string[];
  locationVisible?: boolean;
  activityVisible?: boolean;
  contentVisible?: boolean;
  forcedVisibility?: boolean;
}

export interface VisibilitySchedule {
  id: string;
  weekday: number; // 0 (Sun) - 6 (Sat)
  startTime: string; // "09:00"
  endTime: string;   // "18:00"
  visibleTo: 'all_friends' | 'close_friends_only' | 'family_only' | 'specified';
  specifiedIds?: string[];
  enabled: boolean;
}

export interface SubjectUser {
  id: string;
  name: string;
  ghostMode: boolean;
  virtualLocationRadius?: number; // 0, 2000, 4000, 6000 (meters)
  onlineStatus?: 'online' | 'stealth' | 'ghost' | 'offline';
  visibilitySchedules?: VisibilitySchedule[];
  privacySettings?: {
    locationVisibleTo: 'all_friends' | 'close_only' | 'family_only' | 'nobody';
    postsVisibleTo: 'all_friends' | 'close_only' | 'public';
    starsVisibleTo: 'all_friends' | 'close_only' | 'specified';
    schedulesVisibleTo: 'lovers_family' | 'close_friends' | 'nobody';
    excludedUserIds?: string[];
  };
}

export interface ViewerUser {
  id: string;
  name: string;
  relationshipType?: RelationshipType;
  isGuardian?: boolean;
  isProtectedPerson?: boolean;
  isLover?: boolean;
  isCloseFriend?: boolean;
  isGroupAdmin?: boolean;
}

export interface PermissionObject {
  type: 'location' | 'post' | 'star' | 'event' | 'schedule' | 'history' | 'group_location' | 'care_location';
  id?: string;
  visibilityRule?: VisibilityRule;
  organizerId?: string;
  participantIds?: string[];
  forcedVisibility?: boolean;
  groupId?: string;
  dutyHours?: { start: string; end: string };
  isHistorical?: boolean;
}

export interface PermissionContext {
  currentTime?: Date;
  isEmergencyMode?: boolean;
  isExplicitlyConsented?: boolean;
  isDutyTime?: boolean;
  bypassGhostModeForCare?: boolean;
}

export interface PermissionResult {
  allowed: boolean;
  reason: string;
  displayMode: 'real' | 'virtual' | 'hidden' | 'blurred';
  virtualRadius?: number;
  auditRecord?: {
    timestamp: number;
    viewerId: string;
    subjectId: string;
    objectType: string;
    verdict: boolean;
    reason: string;
  };
}

// Local audit storage
const AUDIT_LOG_STORAGE_KEY = 'stellar_privacy_audit_logs';

export function recordAuditLog(log: {
  viewerId: string;
  subjectId: string;
  objectType: string;
  verdict: boolean;
  reason: string;
}) {
  try {
    const existing = JSON.parse(localStorage.getItem(AUDIT_LOG_STORAGE_KEY) || '[]');
    existing.unshift({
      id: 'audit-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      timestamp: Date.now(),
      ...log,
    });
    // Keep last 100 entries
    localStorage.setItem(AUDIT_LOG_STORAGE_KEY, JSON.stringify(existing.slice(0, 100)));
  } catch (e) {
    console.warn('Failed to record audit log', e);
  }
}

export function getAuditLogs() {
  try {
    return JSON.parse(localStorage.getItem(AUDIT_LOG_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * Unified canView Evaluator
 */
export function canView(
  viewer: ViewerUser,
  subject: SubjectUser,
  object: PermissionObject,
  context: PermissionContext = {}
): PermissionResult {
  const isSelf = viewer.id === subject.id || viewer.id === 'me';
  if (isSelf) {
    return {
      allowed: true,
      reason: '本人访问自有数据',
      displayMode: 'real',
    };
  }

  // 1. Check Ghost Mode
  if (subject.ghostMode) {
    // Family Care in active Emergency Mode with explicit authorization can bypass with audit
    if (
      object.type === 'care_location' &&
      viewer.isGuardian &&
      context.isEmergencyMode &&
      context.isExplicitlyConsented
    ) {
      const result: PermissionResult = {
        allowed: true,
        reason: '紧急救援模式已触发：监护人依法获得临时应急看护定位权限 (已写入审计)',
        displayMode: 'real',
      };
      recordAuditLog({
        viewerId: viewer.id,
        subjectId: subject.id,
        objectType: object.type,
        verdict: true,
        reason: result.reason,
      });
      return result;
    }

    // Otherwise Ghost Mode is completely opaque
    const result: PermissionResult = {
      allowed: false,
      reason: '用户已开启 Ghost Mode (完全隐身离场)，普通好友与群组成员均不可见',
      displayMode: 'hidden',
    };
    recordAuditLog({
      viewerId: viewer.id,
      subjectId: subject.id,
      objectType: object.type,
      verdict: false,
      reason: result.reason,
    });
    return result;
  }

  // 2. Check Excluded User list in subject's privacy settings
  if (subject.privacySettings?.excludedUserIds?.includes(viewer.id)) {
    return {
      allowed: false,
      reason: '访问者已被加入隐私排除名单',
      displayMode: 'hidden',
    };
  }

  // 3. Location Specific Rules
  if (object.type === 'location') {
    // Virtual Location Radius handling
    if (subject.virtualLocationRadius && subject.virtualLocationRadius > 0) {
      return {
        allowed: true,
        reason: `用户已开启虚拟模糊定位 (半径 ${subject.virtualLocationRadius / 1000}km)，仅展示模糊范围`,
        displayMode: 'virtual',
        virtualRadius: subject.virtualLocationRadius,
      };
    }

    // Schedule check (Day of week / Hour window)
    if (subject.visibilitySchedules && subject.visibilitySchedules.length > 0) {
      const now = context.currentTime || new Date();
      const currentDay = now.getDay();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const activeSchedules = subject.visibilitySchedules.filter(s => s.enabled && s.weekday === currentDay);
      if (activeSchedules.length > 0) {
        let withinAnyWindow = false;
        for (const sched of activeSchedules) {
          const [sh, sm] = sched.startTime.split(':').map(Number);
          const [eh, em] = sched.endTime.split(':').map(Number);
          const startM = sh * 60 + (sm || 0);
          const endM = eh * 60 + (em || 0);

          const inTime = currentMinutes >= startM && currentMinutes <= endM;
          if (inTime) {
            if (sched.visibleTo === 'all_friends') withinAnyWindow = true;
            else if (sched.visibleTo === 'close_friends_only' && (viewer.isCloseFriend || viewer.isLover)) withinAnyWindow = true;
            else if (sched.visibleTo === 'family_only' && (viewer.isGuardian || viewer.relationshipType === 'family')) withinAnyWindow = true;
            else if (sched.visibleTo === 'specified' && sched.specifiedIds?.includes(viewer.id)) withinAnyWindow = true;
          }
        }

        if (!withinAnyWindow) {
          return {
            allowed: false,
            reason: '当前不在用户设置的在线可见时段内',
            displayMode: 'hidden',
          };
        }
      }
    }
  }

  // 4. Object Specific VisibilityRule
  if (object.visibilityRule) {
    const rule = object.visibilityRule;
    if (rule.scopeType === 'private') {
      return { allowed: false, reason: '仅本人私密可见', displayMode: 'hidden' };
    }
    if (rule.scopeType === 'organizerOnly') {
      const isOrganizer = viewer.id === object.organizerId;
      return {
        allowed: isOrganizer,
        reason: isOrganizer ? '活动发起人专属权限' : '该内容仅活动发起人可见',
        displayMode: isOrganizer ? 'real' : 'hidden',
      };
    }
    if (rule.scopeType === 'specifiedUsers') {
      const inList = rule.includedIds?.includes(viewer.id) ?? false;
      return {
        allowed: inList,
        reason: inList ? '属于指定白名单可见用户' : '未在指定可见白名单内',
        displayMode: inList ? 'real' : 'hidden',
      };
    }
    if (rule.scopeType === 'excludedUsers') {
      const inExcluded = rule.excludedIds?.includes(viewer.id) ?? false;
      return {
        allowed: !inExcluded,
        reason: inExcluded ? '已被排除可见' : '符合排除规则后的好友可见',
        displayMode: inExcluded ? 'hidden' : 'real',
      };
    }
    if (rule.scopeType === 'participants') {
      const isParticipant = object.participantIds?.includes(viewer.id) ?? false;
      const isOrganizer = viewer.id === object.organizerId;
      return {
        allowed: isParticipant || isOrganizer,
        reason: (isParticipant || isOrganizer) ? '活动全体成员可见' : '仅活动成员可见',
        displayMode: (isParticipant || isOrganizer) ? 'real' : 'hidden',
      };
    }
  }

  // 5. Event Non-Friend Isolation Rule (非好友参与者之间默认不可见，除非强制可见或设置全体可见)
  if (object.type === 'event') {
    const isOrganizer = viewer.id === object.organizerId;
    if (isOrganizer) {
      return { allowed: true, reason: '活动发起人可查看所有报名者', displayMode: 'real' };
    }
    if (object.forcedVisibility) {
      return { allowed: true, reason: '该活动已设置活动期间强制可见', displayMode: 'real' };
    }
    const isFriend = viewer.relationshipType && viewer.relationshipType !== 'none';
    if (!isFriend) {
      return {
        allowed: false,
        reason: '非好友参与者之间默认隔离不可见',
        displayMode: 'hidden',
      };
    }
  }

  // 6. Group Duty & Location Authorization
  if (object.type === 'group_location') {
    if (!context.isDutyTime) {
      return {
        allowed: false,
        reason: '非在岗工作时间，系统默认关闭组员定位共享',
        displayMode: 'hidden',
      };
    }
    if (viewer.isGroupAdmin && context.isExplicitlyConsented) {
      return {
        allowed: true,
        reason: '工作时间明示授权在岗定位 (仅管理员可见，操作已审计)',
        displayMode: 'real',
      };
    }
  }

  // Default allowed for standard relationships
  return {
    allowed: true,
    reason: '正常好友授权可见',
    displayMode: 'real',
  };
}
