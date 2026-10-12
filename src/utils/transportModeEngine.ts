// Transport Mode Recognition Engine & Mock Location Adapter
import { LocationSample, TransportMode, TransportModeEvaluation, TransportScore, TransportUserSettings } from '../types';

export const TRANSPORT_MODE_LABELS: Record<TransportMode, string> = {
  stationary: '静止',
  walking: '步行',
  bicycle: '自行车',
  car: '汽车',
  moving: '移动中',
  unknown: '暂无法识别',
};

export const TRANSPORT_MODE_ICONS: Record<TransportMode, string> = {
  stationary: '⏱️',
  walking: '🚶',
  bicycle: '🚲',
  car: '🚗',
  moving: '🧭',
  unknown: '❓',
};

export const SPEED_MODELS_KMH: Record<TransportMode, number> = {
  stationary: 0,
  walking: 5.0,
  bicycle: 18.0,
  car: 42.0,
  moving: 15.0,
  unknown: 15.0,
};

// Calculate Haversine distance in meters
export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Calculate Bearing/Heading in degrees (0 - 360)
export function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  return ((θ * 180) / Math.PI + 360) % 360;
}

// Helper: Calculate Median
export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Helper: Calculate Percentile (e.g. 90th percentile)
export function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(Math.floor((percentile / 100) * sorted.length), sorted.length - 1);
  return sorted[index];
}

// Helper: Calculate Variance
export function calculateVariance(values: number[]): number {
  if (values.length <= 1) return 0;
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const sumSq = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0);
  return sumSq / values.length;
}

export class TransportModeEngine {
  private samples: LocationSample[] = [];
  private currentMode: TransportMode = 'stationary';
  private candidateMode: TransportMode | null = null;
  private candidateConsecutiveCount: number = 0;
  private lastEvaluationTime: number = Date.now();
  private modeHoldStartTime: number = Date.now();
  private lowConfidenceStartTime: number | null = null;
  private stationaryStartTime: number | null = null;
  private userSettings: TransportUserSettings = {
    autoRecognitionEnabled: true,
    showTransportMode: true,
    forceMovingOnly: false,
  };
  private isSimulated: boolean = true;
  private isGhostMode: boolean = false;

  constructor() {
    this.loadSettings();
  }

  public setGhostMode(enabled: boolean) {
    this.isGhostMode = enabled;
  }

  public getSettings(): TransportUserSettings {
    return { ...this.userSettings };
  }

  public updateSettings(settings: Partial<TransportUserSettings>) {
    this.userSettings = { ...this.userSettings, ...settings };
    this.saveSettings();
  }

  private loadSettings() {
    try {
      const saved = localStorage.getItem('stellar_transport_settings');
      if (saved) {
        this.userSettings = JSON.parse(saved);
      }
    } catch {
      // ignore
    }
  }

  private saveSettings() {
    try {
      localStorage.setItem('stellar_transport_settings', JSON.stringify(this.userSettings));
    } catch {
      // ignore
    }
  }

  public resetSamples() {
    this.samples = [];
    this.currentMode = 'stationary';
    this.candidateMode = null;
    this.candidateConsecutiveCount = 0;
    this.stationaryStartTime = Date.now();
    this.lowConfidenceStartTime = null;
  }

  // ==========================================
  // 1. Data Cleaning & Sample Ingestion
  // ==========================================
  public addSample(sample: LocationSample): boolean {
    const now = Date.now();
    const cleanSample: LocationSample = {
      ...sample,
      timestamp: sample.timestamp || now,
      source: sample.source || 'mock',
    };

    // Filter rule 1: accuracyMeters > 100 is discarded directly
    if (cleanSample.accuracyMeters !== undefined && cleanSample.accuracyMeters > 100) {
      return false;
    }

    // Filter rule 3: Time interval validity (< 1s or > 60s or backwards)
    if (this.samples.length > 0) {
      const last = this.samples[this.samples.length - 1];
      const deltaSec = (cleanSample.timestamp - last.timestamp) / 1000;
      if (deltaSec < 0.8 || deltaSec > 65) {
        return false;
      }

      // Check distance jump / GPS drift (> 160 km/h unrealistic jump)
      const dist = calculateDistanceMeters(last.latitude, last.longitude, cleanSample.latitude, cleanSample.longitude);
      const computedSpeedKmh = (dist / deltaSec) * 3.6;

      if (computedSpeedKmh > 160 && (cleanSample.accuracyMeters || 0) > 30) {
        // Tagged as GPS drift, discard from clean samples
        return false;
      }

      // Check heading if not provided
      if (cleanSample.heading === undefined && dist > 1.5) {
        cleanSample.heading = calculateBearing(last.latitude, last.longitude, cleanSample.latitude, cleanSample.longitude);
      }

      // Reconcile GPS speed vs computed speed
      if (cleanSample.speedMps !== undefined) {
        const gpsKmh = cleanSample.speedMps * 3.6;
        const diffRatio = Math.abs(gpsKmh - computedSpeedKmh) / Math.max(gpsKmh, 1);
        if (diffRatio > 0.5) {
          // If discrepancy > 50%, smooth using recent window median
          const recentSpeeds = this.samples.slice(-4).map((s) => (s.speedMps || 0) * 3.6);
          if (recentSpeeds.length > 0) {
            cleanSample.speedMps = (calculateMedian([...recentSpeeds, computedSpeedKmh]) / 3.6);
          }
        }
      } else {
        cleanSample.speedMps = computedSpeedKmh / 3.6;
      }
    }

    this.samples.push(cleanSample);

    // Filter rule 6: Retain last 60s - 90s window of valid samples
    const windowCutoff = cleanSample.timestamp - 90 * 1000;
    this.samples = this.samples.filter((s) => s.timestamp >= windowCutoff);

    return true;
  }

  public getSamples(): LocationSample[] {
    return [...this.samples];
  }

  // ==========================================
  // 2. Statistical Metrics Extraction
  // ==========================================
  public calculateMetrics() {
    if (this.samples.length === 0) {
      return {
        smoothedSpeedKmh: 0,
        medianSpeedKmh: 0,
        p90SpeedKmh: 0,
        speedVariance: 0,
        stopRatio: 1.0,
        headingStability: 100,
        gpsQuality: 100,
        sampleCount: 0,
      };
    }

    const speedsKmh = this.samples.map((s) => (s.speedMps || 0) * 3.6);
    const medianSpeedKmh = calculateMedian(speedsKmh);
    const p90SpeedKmh = calculatePercentile(speedsKmh, 90);
    const speedVariance = calculateVariance(speedsKmh);

    // Stop Ratio (speed <= 1.5 km/h)
    const stopCount = speedsKmh.filter((spd) => spd <= 1.5).length;
    const stopRatio = stopCount / speedsKmh.length;

    // Heading Stability (standard deviation of consecutive bearing deltas)
    let headingDeltas: number[] = [];
    for (let i = 1; i < this.samples.length; i++) {
      const h1 = this.samples[i - 1].heading;
      const h2 = this.samples[i].heading;
      if (h1 !== undefined && h2 !== undefined) {
        let diff = Math.abs(h2 - h1);
        if (diff > 180) diff = 360 - diff;
        headingDeltas.push(diff);
      }
    }
    const avgHeadingDiff = headingDeltas.length > 0
      ? headingDeltas.reduce((a, b) => a + b, 0) / headingDeltas.length
      : 0;
    // Lower diff = higher stability score (0-100)
    const headingStability = Math.max(0, Math.min(100, 100 - avgHeadingDiff * 2));

    // GPS Quality Score (0-100) based on accuracy
    const accuracies = this.samples.map((s) => s.accuracyMeters || 15);
    const avgAcc = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
    let gpsQuality = 100;
    if (avgAcc > 50) {
      gpsQuality = Math.max(20, 100 - (avgAcc - 50) * 1.5);
    } else if (avgAcc > 20) {
      gpsQuality = Math.max(70, 100 - (avgAcc - 20));
    }

    // Smoothed Speed: exponential moving average / median mix
    const smoothedSpeedKmh = Number(medianSpeedKmh.toFixed(1));

    return {
      smoothedSpeedKmh,
      medianSpeedKmh: Number(medianSpeedKmh.toFixed(1)),
      p90SpeedKmh: Number(p90SpeedKmh.toFixed(1)),
      speedVariance: Number(speedVariance.toFixed(2)),
      stopRatio: Number(stopRatio.toFixed(2)),
      headingStability: Math.round(headingStability),
      gpsQuality: Math.round(gpsQuality),
      sampleCount: this.samples.length,
    };
  }

  // ==========================================
  // 3. Multi-modal Scoring Model (0 - 100)
  // ==========================================
  public evaluateScores(): {
    scores: Record<TransportMode, number>;
    reasons: Record<TransportMode, string[]>;
    topCandidate: TransportMode;
    topScore: number;
    secondScore: number;
  } {
    const metrics = this.calculateMetrics();
    const { smoothedSpeedKmh, medianSpeedKmh, p90SpeedKmh, speedVariance, stopRatio, headingStability, gpsQuality, sampleCount } = metrics;

    const reasons: Record<TransportMode, string[]> = {
      stationary: [],
      walking: [],
      bicycle: [],
      car: [],
      moving: [],
      unknown: [],
    };

    if (sampleCount < 4) {
      return {
        scores: {
          stationary: smoothedSpeedKmh <= 1.5 ? 80 : 20,
          walking: 40,
          bicycle: 40,
          car: 40,
          moving: 85,
          unknown: 90,
        },
        reasons: {
          stationary: ['样本数不足（<4），暂未达到最小判断窗口'],
          walking: ['样本数不足'],
          bicycle: ['样本数不足'],
          car: ['样本数不足'],
          moving: ['样本数少于 4 个，采用安全泛化“移动中”状态'],
          unknown: ['数据积累中'],
        },
        topCandidate: 'moving',
        topScore: 85,
        secondScore: 40,
      };
    }

    // Latest sample road context
    const latestSample = this.samples[this.samples.length - 1];
    const roadType = latestSample?.roadType || 'secondary_road';

    // -------------------------------------------------------------
    // A. Stationary Scoring (静止)
    // -------------------------------------------------------------
    let stationaryScore = 0;
    if (smoothedSpeedKmh <= 1.5) {
      stationaryScore += 50;
      reasons.stationary.push('平滑速度 <= 1.5 km/h');
      if (stopRatio >= 0.8) {
        stationaryScore += 30;
        reasons.stationary.push(`静止采样占比高 (${Math.round(stopRatio * 100)}%)`);
      }
      if (speedVariance < 0.5) {
        stationaryScore += 15;
      }
      stationaryScore += (gpsQuality / 100) * 5;
    } else if (smoothedSpeedKmh <= 3.0) {
      stationaryScore = Math.max(0, 40 - (smoothedSpeedKmh - 1.5) * 20);
    }

    // -------------------------------------------------------------
    // B. Walking Scoring (步行: 1.5 - 8 km/h)
    // -------------------------------------------------------------
    let walkingScore = 0;
    // 1. Speed Band (45%)
    if (medianSpeedKmh >= 1.5 && medianSpeedKmh <= 8.0) {
      if (medianSpeedKmh >= 2.5 && medianSpeedKmh <= 6.5) {
        walkingScore += 45;
        reasons.walking.push(`中位速度 ${medianSpeedKmh} km/h 符合典型步行区间 (2-7 km/h)`);
      } else {
        walkingScore += 35;
        reasons.walking.push(`速度 ${medianSpeedKmh} km/h 处于步行边界区间`);
      }
      if (p90SpeedKmh <= 10.0) {
        walkingScore += 5;
      }
    } else if (medianSpeedKmh > 8.0 && medianSpeedKmh <= 11.0) {
      walkingScore += Math.max(0, 30 - (medianSpeedKmh - 8.0) * 10);
      reasons.walking.push('速度偏快，处于快走/慢跑边界');
    }

    // 2. Stability (20%)
    if (speedVariance <= 4.0 && stopRatio < 0.5) {
      walkingScore += 20;
      reasons.walking.push('步行节奏稳定平缓');
    } else if (speedVariance <= 8.0) {
      walkingScore += 12;
    }

    // 3. Road Environment (15%)
    if (roadType === 'pedestrian_path' || roadType === 'park') {
      walkingScore += 15;
      reasons.walking.push('位置贴合人行步道/公园步行区');
    } else if (roadType === 'secondary_road' || roadType === 'unknown') {
      walkingScore += 10;
    } else if (roadType === 'motorway') {
      walkingScore -= 25; // Forbidden walking on motorway
    }

    // 4. Movement Pattern & Direction Jitter (10%)
    if (headingStability < 85) {
      walkingScore += 10;
      reasons.walking.push('方向微调频率符合自然步行特征');
    } else {
      walkingScore += 5;
    }

    // 5. GPS Quality (10%)
    walkingScore += (gpsQuality / 100) * 10;

    // -------------------------------------------------------------
    // C. Bicycle Scoring (自行车: 8 - 30 km/h)
    // -------------------------------------------------------------
    let bicycleScore = 0;
    // 1. Speed Band (45%)
    if (medianSpeedKmh >= 8.0 && medianSpeedKmh <= 30.0) {
      if (medianSpeedKmh >= 12.0 && medianSpeedKmh <= 26.0) {
        bicycleScore += 45;
        reasons.bicycle.push(`中位速度 ${medianSpeedKmh} km/h 符合典型骑行区间 (10-28 km/h)`);
      } else {
        bicycleScore += 35;
        reasons.bicycle.push(`速度 ${medianSpeedKmh} km/h 处于骑行扩展区间`);
      }
      if (p90SpeedKmh <= 35.0) {
        bicycleScore += 5;
      }
    } else if (medianSpeedKmh >= 6.0 && medianSpeedKmh < 8.0) {
      bicycleScore += 20;
    } else if (medianSpeedKmh > 30.0 && medianSpeedKmh <= 38.0) {
      bicycleScore += Math.max(0, 30 - (medianSpeedKmh - 30.0) * 3);
    }

    // 2. Stability (20%)
    if (speedVariance <= 15.0 && stopRatio < 0.3) {
      bicycleScore += 20;
      reasons.bicycle.push('骑行速度连续平滑');
    } else {
      bicycleScore += 10;
    }

    // 3. Road Environment (15%)
    if (roadType === 'bike_path') {
      bicycleScore += 15;
      reasons.bicycle.push('位置位于专用自行车/非机动车道');
    } else if (roadType === 'secondary_road' || roadType === 'primary_road') {
      bicycleScore += 12;
      reasons.bicycle.push('处于普通市政道路路段');
    } else if (roadType === 'motorway') {
      bicycleScore -= 20;
    }

    // 4. Movement Pattern (10%)
    if (headingStability >= 75) {
      bicycleScore += 10;
      reasons.bicycle.push('行驶方向整体稳定');
    } else {
      bicycleScore += 5;
    }

    // 5. GPS Quality (10%)
    bicycleScore += (gpsQuality / 100) * 10;

    // -------------------------------------------------------------
    // D. Car Scoring (汽车: >= 25 km/h or congested traffic 3-20 km/h)
    // -------------------------------------------------------------
    let carScore = 0;
    // 1. High Speed Car Band (45%)
    if (medianSpeedKmh >= 25.0) {
      carScore += 45;
      reasons.car.push(`车速 ${medianSpeedKmh} km/h 符合机动车高速巡航区间`);
      if (medianSpeedKmh >= 35.0) {
        carScore += 10; // Boost when > 35 km/h
        reasons.car.push('巡航时速超过 35 km/h，机动车特征显著');
      }
    } else if (medianSpeedKmh >= 18.0 && (roadType === 'motorway' || roadType === 'primary_road')) {
      carScore += 38;
      reasons.car.push(`道路主干线稳定行驶 ${medianSpeedKmh} km/h`);
    } else if (medianSpeedKmh >= 3.0 && medianSpeedKmh <= 20.0) {
      // Low-speed Car Handling (Congested traffic on vehicular road)
      if (roadType === 'motorway' || roadType === 'primary_road') {
        carScore += 35;
        reasons.car.push('主干道缓行/拥堵路况特征匹配');
      } else if (speedVariance > 10.0 || stopRatio > 0.25) {
        carScore += 25;
        reasons.car.push('具备路口红绿灯停车起步与加减速特征');
      }
    }

    // 2. Stability & Acceleration (20%)
    if (headingStability >= 85) {
      carScore += 20;
      reasons.car.push('车道行驶方向高度稳定');
    } else if (headingStability >= 70) {
      carScore += 12;
    }

    // 3. Road Environment (15%)
    if (roadType === 'motorway') {
      carScore += 20;
      reasons.car.push('行驶于封闭快速路/高速路段');
    } else if (roadType === 'primary_road' || roadType === 'secondary_road') {
      carScore += 15;
      reasons.car.push('位置紧密贴合机动车道路网');
    } else if (roadType === 'pedestrian_path' || roadType === 'park') {
      carScore -= 35; // Cars rarely in park trails
    }

    // 4. Movement Pattern & Acceleration Spikes (10%)
    if (p90SpeedKmh > 30.0 || (speedVariance > 12.0 && medianSpeedKmh > 10.0)) {
      carScore += 10;
      reasons.car.push('具有机动车起步加速动力曲线');
    } else {
      carScore += 5;
    }

    // 5. GPS Quality (10%)
    carScore += (gpsQuality / 100) * 10;

    // Normalizing range to 0 - 100
    const clampedScores: Record<TransportMode, number> = {
      stationary: Math.min(100, Math.max(0, Math.round(stationaryScore))),
      walking: Math.min(100, Math.max(0, Math.round(walkingScore))),
      bicycle: Math.min(100, Math.max(0, Math.round(bicycleScore))),
      car: Math.min(100, Math.max(0, Math.round(carScore))),
      moving: 60, // Default baseline for moving
      unknown: 10,
    };

    // Sort candidate modes by score
    const sortedModes = (['stationary', 'walking', 'bicycle', 'car'] as TransportMode[]).sort(
      (a, b) => clampedScores[b] - clampedScores[a]
    );

    const topCandidate = sortedModes[0];
    const topScore = clampedScores[topCandidate];
    const secondScore = clampedScores[sortedModes[1]];

    return {
      scores: clampedScores,
      reasons,
      topCandidate,
      topScore,
      secondScore,
    };
  }

  // ==========================================
  // 4. State Debouncing & Evaluation Cycle
  // ==========================================
  public evaluateCurrentState(): TransportModeEvaluation {
    const now = Date.now();
    const metrics = this.calculateMetrics();
    const { scores, reasons, topCandidate, topScore, secondScore } = this.evaluateScores();

    // Check user manual override (valid for 30 minutes)
    if (this.userSettings.manualOverrideMode && this.userSettings.manualOverrideExpiresAt) {
      if (now < this.userSettings.manualOverrideExpiresAt) {
        const overrideMode = this.userSettings.manualOverrideMode;
        return {
          currentMode: overrideMode,
          displayMode: overrideMode,
          modeLabel: TRANSPORT_MODE_LABELS[overrideMode],
          confidence: 100,
          ...metrics,
          scores,
          topScoreReasons: [`用户手动选择指定为「${TRANSPORT_MODE_LABELS[overrideMode]}」`],
          validSamplesWindowSec: Math.min(90, Math.max(10, Math.round((now - (this.samples[0]?.timestamp || now)) / 1000))),
          isDebouncing: false,
          debounceCountdownSec: 0,
          lastUpdated: now,
          source: this.samples[this.samples.length - 1]?.source || 'mock',
          isSimulated: this.isSimulated,
          userOverride: {
            mode: overrideMode,
            expiresAt: this.userSettings.manualOverrideExpiresAt,
          },
          ghostModeEnabled: this.isGhostMode,
        };
      } else {
        // Expired -> revert to auto
        this.userSettings.manualOverrideMode = undefined;
        this.userSettings.manualOverrideExpiresAt = undefined;
        this.saveSettings();
      }
    }

    // Force moving only setting
    if (this.userSettings.forceMovingOnly) {
      return {
        currentMode: 'moving',
        displayMode: 'moving',
        modeLabel: '移动中',
        confidence: 80,
        ...metrics,
        scores,
        topScoreReasons: ['用户偏好设置：统一只显示为「移动中」'],
        validSamplesWindowSec: 60,
        isDebouncing: false,
        debounceCountdownSec: 0,
        lastUpdated: now,
        source: this.samples[this.samples.length - 1]?.source || 'mock',
        isSimulated: this.isSimulated,
        ghostModeEnabled: this.isGhostMode,
      };
    }

    // Ghost Mode check (if enabled, display is hidden/stealthed for observers)
    if (this.isGhostMode) {
      return {
        currentMode: 'unknown',
        displayMode: 'unknown',
        modeLabel: '隐私已隐藏',
        confidence: 0,
        ...metrics,
        scores,
        topScoreReasons: ['幽灵模式 (Ghost Mode) 开启，完全隐藏交通方式与移动轨迹'],
        validSamplesWindowSec: 0,
        isDebouncing: false,
        debounceCountdownSec: 0,
        lastUpdated: now,
        source: 'gps',
        isSimulated: false,
        ghostModeEnabled: true,
      };
    }

    // Check Stationary condition: speed <= 1.5 km/h continuous >= 30 seconds
    if (metrics.smoothedSpeedKmh <= 1.5) {
      if (!this.stationaryStartTime) {
        this.stationaryStartTime = now;
      }
      const stationaryElapsedSec = (now - this.stationaryStartTime) / 1000;
      if (stationaryElapsedSec >= 30 || this.samples.length < 2) {
        this.currentMode = 'stationary';
        this.candidateMode = null;
        this.candidateConsecutiveCount = 0;
        this.lowConfidenceStartTime = null;
      }
    } else {
      this.stationaryStartTime = null;
    }

    // State Debounce Logic:
    // 1. Candidate mode must have score >= 70 AND lead by >= 10 points
    // 2. Must remain consistent across 2 consecutive windows (15 - 20s apart)
    let isDebouncing = false;
    let debounceCountdownSec = 0;
    const scoreDifference = topScore - secondScore;

    const isQualifiedCandidate = topScore >= 70 && scoreDifference >= 10 && topCandidate !== 'moving';

    if (isQualifiedCandidate) {
      if (topCandidate === this.currentMode) {
        // Already in this mode, reset candidate tracking
        this.candidateMode = null;
        this.candidateConsecutiveCount = 0;
        this.lowConfidenceStartTime = null;
      } else {
        // Transitioning to new mode
        if (this.candidateMode === topCandidate) {
          const timeSinceLastEval = (now - this.lastEvaluationTime) / 1000;
          if (timeSinceLastEval >= 15) {
            this.candidateConsecutiveCount += 1;
            this.lastEvaluationTime = now;
          }

          if (this.candidateConsecutiveCount >= 2) {
            // Confirmed switch!
            this.currentMode = topCandidate;
            this.candidateMode = null;
            this.candidateConsecutiveCount = 0;
            this.modeHoldStartTime = now;
            this.lowConfidenceStartTime = null;
          } else {
            isDebouncing = true;
            debounceCountdownSec = Math.max(1, 15 - Math.round((now - this.lastEvaluationTime) / 1000));
          }
        } else {
          // First time seeing this candidate
          this.candidateMode = topCandidate;
          this.candidateConsecutiveCount = 1;
          this.lastEvaluationTime = now;
          isDebouncing = true;
          debounceCountdownSec = 15;
        }
      }
    } else {
      // Candidate not qualified (score < 70 or gap < 10)
      this.candidateMode = null;
      this.candidateConsecutiveCount = 0;

      // Hysteresis Rule:
      // If current mode score drops to 55 - 69, temporarily hold current mode.
      const currentModeScore = scores[this.currentMode] || 0;
      if (this.currentMode !== 'stationary' && this.currentMode !== 'moving') {
        if (currentModeScore < 55) {
          if (!this.lowConfidenceStartTime) {
            this.lowConfidenceStartTime = now;
          }
          const lowConfidenceSec = (now - this.lowConfidenceStartTime) / 1000;
          if (lowConfidenceSec >= 30) {
            // Drop to safe fallback "moving"
            this.currentMode = 'moving';
            this.lowConfidenceStartTime = null;
          } else {
            isDebouncing = true;
            debounceCountdownSec = Math.max(1, 30 - Math.round(lowConfidenceSec));
          }
        } else {
          // Between 55 and 69 -> hold current mode safely
          this.lowConfidenceStartTime = null;
        }
      }
    }

    // Final Display Mode Determination:
    // Prompt Rule: If confidence < 70%, display ONLY "moving" (移动中)
    let displayMode: TransportMode = this.currentMode;
    let finalConfidence = topScore;

    if (this.currentMode === 'stationary') {
      displayMode = 'stationary';
      finalConfidence = Math.max(85, scores.stationary);
    } else if (this.currentMode === 'moving') {
      displayMode = 'moving';
      finalConfidence = Math.max(65, Math.round((topScore + secondScore) / 2));
    } else {
      // If active mode's current score is < 70%, force display to "moving"
      if (scores[this.currentMode] < 70) {
        displayMode = 'moving';
        finalConfidence = scores[this.currentMode];
      } else {
        displayMode = this.currentMode;
        finalConfidence = scores[this.currentMode];
      }
    }

    const modeLabel = TRANSPORT_MODE_LABELS[displayMode];
    const topScoreReasons = reasons[displayMode] || reasons[topCandidate] || ['数据采集中'];

    const validSamplesWindowSec = this.samples.length > 0
      ? Math.min(90, Math.max(10, Math.round((now - this.samples[0].timestamp) / 1000)))
      : 0;

    return {
      currentMode: this.currentMode,
      displayMode,
      modeLabel,
      confidence: finalConfidence,
      ...metrics,
      scores,
      topScoreReasons,
      sampleCount: this.samples.length,
      validSamplesWindowSec,
      isDebouncing,
      debounceCountdownSec,
      lastUpdated: now,
      source: this.samples[this.samples.length - 1]?.source || 'mock',
      isSimulated: this.isSimulated,
      ghostModeEnabled: false,
    };
  }

  // ==========================================
  // 5. Activity Navigation & ETA Calculation
  // ==========================================
  public calculateNavigationEta(distanceMeters: number, mode?: TransportMode): {
    etaMinutes: number;
    speedKmh: number;
    transportMode: TransportMode;
    formattedEta: string;
  } {
    const activeMode = mode || this.evaluateCurrentState().displayMode;
    const modelSpeedKmh = SPEED_MODELS_KMH[activeMode] || 15.0;
    const speedMps = (modelSpeedKmh * 1000) / 3600;

    const etaSeconds = speedMps > 0 ? distanceMeters / speedMps : 0;
    const etaMinutes = Math.max(1, Math.round(etaSeconds / 60));

    let formattedEta = '';
    if (etaMinutes < 60) {
      formattedEta = `${etaMinutes} 分钟`;
    } else {
      const hours = Math.floor(etaMinutes / 60);
      const mins = etaMinutes % 60;
      formattedEta = mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
    }

    return {
      etaMinutes,
      speedKmh: modelSpeedKmh,
      transportMode: activeMode,
      formattedEta,
    };
  }
}

// Singleton Engine Instance
export const globalTransportEngine = new TransportModeEngine();
