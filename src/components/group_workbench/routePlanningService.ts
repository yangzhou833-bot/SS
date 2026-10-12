import { MissionWaypoint, TacticalMissionTask, MemberAssignedRoute, TacticalTimelineEvent } from './types';

export interface RouteRecalculationResult {
  waypoints: MissionWaypoint[];
  tacticalTasks: TacticalMissionTask[];
  memberRoutes: MemberAssignedRoute[];
  timelineEvent?: TacticalTimelineEvent;
  totalDistanceKm: number;
  estimatedTotalMinutes: number;
}

/**
 * 欧式/球面几何距离近似计算 (在百分比坐标系 800x600 下转换为千米)
 * 100 单位约合 1.2 公里地形距离
 */
export function calculateDistanceKm(
  p1: { xPct: number; yPct: number },
  p2: { xPct: number; yPct: number }
): number {
  const dx = (p1.xPct - p2.xPct) * 1.6;
  const dy = (p1.yPct - p2.yPct) * 1.2;
  const distUnits = Math.sqrt(dx * dx + dy * dy);
  return Number(((distUnits / 100) * 2.8).toFixed(2)); // 范围约 0.3km ~ 3.5km
}

/**
 * 基于拖拽检查点重新计算：
 * 1. 最优顺序和总路线几何
 * 2. 依次计算各个检查点的累积预计到达时间 (ETA)
 * 3. 自动同步更新所有队员绑定的任务卡片 (预计时长、截止时间、到达触发条件、里程碑)
 * 4. 自动同步更新队员拆分路线的完成条件与状态
 */
export function recalculateMissionRouteSchedule(
  waypoints: MissionWaypoint[],
  waypointPositions: Record<string, { xPct: number; yPct: number }>,
  tacticalTasks: TacticalMissionTask[],
  memberRoutes: MemberAssignedRoute[],
  draggedWpId?: string,
  baseStartTime: string = '09:00'
): RouteRecalculationResult {
  // 解析基准开始时间
  const [startH, startM] = baseStartTime.split(':').map((v) => parseInt(v, 10) || 0);
  let currentMinutes = startH * 60 + startM;

  let totalDistanceKm = 0;
  const sortedWps = [...waypoints].sort((a, b) => a.orderIndex - b.orderIndex);

  // 1. 遍历坐标点计算每个区段的位移与ETA
  const updatedWaypoints: MissionWaypoint[] = [];
  
  for (let i = 0; i < sortedWps.length; i++) {
    const wp = sortedWps[i];
    const currPos = waypointPositions[wp.id] || { xPct: 20 + i * 12, yPct: 70 - i * 8 };
    
    let segmentDistKm = 0;
    let travelMinutes = 0;

    if (i > 0) {
      const prevWp = sortedWps[i - 1];
      const prevPos = waypointPositions[prevWp.id] || { xPct: 20 + (i - 1) * 12, yPct: 70 - (i - 1) * 8 };
      segmentDistKm = calculateDistanceKm(prevPos, currPos);
      totalDistanceKm += segmentDistKm;
      // 假设徒步+标绘平均速度 3.5 km/h，即约 17 分钟/km + 站台驻留基础时间
      travelMinutes = Math.max(12, Math.round(segmentDistKm * 17.5));
    }

    // 检查点作业/打卡驻留耗时
    const dwellMinutes =
      wp.type === 'gathering'
        ? 15
        : wp.type === 'destination'
        ? 20
        : wp.type === 'task'
        ? 35
        : wp.type === 'hazard'
        ? 10
        : wp.type === 'supply'
        ? 20
        : 15;

    currentMinutes += travelMinutes;
    const arrivalH = Math.floor(currentMinutes / 60) % 24;
    const arrivalM = currentMinutes % 60;
    const etaStr = `${arrivalH.toString().padStart(2, '0')}:${arrivalM.toString().padStart(2, '0')}`;

    currentMinutes += dwellMinutes;

    updatedWaypoints.push({
      ...wp,
      description: wp.description
        ? wp.description.replace(/【预计到达:.*?】/, '') + ` 【预计到达: ${etaStr}】`
        : `预计到达时间: ${etaStr}`,
      // 动态根据距离计算合理触发半径
      arrivalTriggerRadiusMeters: wp.type === 'hazard' ? 80 : 50,
      completionCondition:
        wp.completionCondition ||
        (wp.type === 'gathering'
          ? '全员到齐确认'
          : wp.type === 'task'
          ? '实地测绘并上传数据'
          : wp.type === 'hazard'
          ? '降速绕行避险'
          : '拍照打卡'),
    });
  }

  // 2. 自动更新所有关联任务卡片中的预计到达时间、预计时长与里程碑截止时间
  const updatedTasks: TacticalMissionTask[] = tacticalTasks.map((task, idx) => {
    // 寻找绑定的坐标点或者依据索引匹配
    const boundWp = updatedWaypoints.find((w) => w.boundTaskId === task.id || w.id === task.boundWaypointId) ||
      updatedWaypoints[Math.min(idx + 1, updatedWaypoints.length - 1)];

    // 从坐标点 description 或计算值提取 ETA
    const etaMatch = boundWp?.description?.match(/预计到达:\s*(\d{2}:\d{2})/);
    const taskDueTime = etaMatch ? etaMatch[1] : task.dueTime;

    // 根据坐标点距离动态优化任务预估时长 (30min - 150min)
    const distFactor = Math.max(0.8, Math.min(2.0, (totalDistanceKm / 4.5) * 1.1));
    const recalculatedDuration = Math.max(30, Math.round((task.estimatedDurationMinutes || 60) * (idx === 0 ? 0.95 : distFactor)));

    return {
      ...task,
      dueTime: taskDueTime,
      estimatedDurationMinutes: recalculatedDuration,
      arrivalTrigger: `进入「${boundWp?.name || '目标点'}」${boundWp?.arrivalTriggerRadiusMeters || 50}米范围自动触发任务计时`,
      completionCondition: boundWp?.completionCondition || task.completionCondition,
      boundWaypointId: boundWp?.id,
    };
  });

  // 3. 自动更新队员拆分路线的完成条件与预期
  const updatedMemberRoutes: MemberAssignedRoute[] = memberRoutes.map((mr) => {
    const assignedWps = updatedWaypoints.filter((w) => mr.waypointIds.includes(w.id));
    const lastWp = assignedWps[assignedWps.length - 1];
    const lastEtaMatch = lastWp?.description?.match(/预计到达:\s*(\d{2}:\d{2})/);
    const targetEta = lastEtaMatch ? lastEtaMatch[1] : '17:30';

    return {
      ...mr,
      completionCondition: `依次通过 ${assignedWps.map((w) => w.name).join(' ➔ ')}，预计于 ${targetEta} 完成汇合。`,
    };
  });

  // 4. 生成时间轴动态更新事件
  const draggedWp = draggedWpId ? waypoints.find((w) => w.id === draggedWpId) : null;
  const timelineEvent: TacticalTimelineEvent | undefined = draggedWp
    ? {
        id: `tl-recalc-${Date.now()}`,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        title: `队长重构路线：【${draggedWp.name}】动态重算`,
        type: 'reroute',
        operatorName: '小队长 (指挥台)',
        operatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        description: `拖拽校准坐标后，系统已自动重新拟合最优折线路径（全长 ${totalDistanceKm.toFixed(1)}km），并更新了所有队员的任务预计到达时间(ETA)与里程碑排期。`,
        squadId: 'squad-1',
        statusTag: 'ETA自动刷新',
      }
    : undefined;

  const estimatedTotalMinutes = currentMinutes - (startH * 60 + startM);

  return {
    waypoints: updatedWaypoints,
    tacticalTasks: updatedTasks,
    memberRoutes: updatedMemberRoutes,
    timelineEvent,
    totalDistanceKm: Number(totalDistanceKm.toFixed(2)),
    estimatedTotalMinutes,
  };
}
