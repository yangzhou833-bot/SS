// Mock Location Adapter for Transport Mode Demo & Testing
import { LocationSample } from '../types';
import { globalTransportEngine } from './transportModeEngine';

export type DemoScenarioKey =
  | 'stationary'
  | 'walking'
  | 'bicycle'
  | 'car'
  | 'traffic_jam_car'
  | 'gps_drift'
  | 'low_accuracy'
  | 'ambiguous_moving';

export interface DemoScenarioConfig {
  key: DemoScenarioKey;
  name: string;
  targetSpeedKmh: number;
  roadType: 'motorway' | 'primary_road' | 'secondary_road' | 'bike_path' | 'pedestrian_path' | 'park' | 'unknown';
  accuracyMeters: number;
  description: string;
  expectedMode: string;
  expectedConfidenceRange: string;
  isDrift?: boolean;
}

export const DEMO_SCENARIOS: Record<DemoScenarioKey, DemoScenarioConfig> = {
  stationary: {
    key: 'stationary',
    name: '模拟静止 (0 km/h)',
    targetSpeedKmh: 0.0,
    roadType: 'unknown',
    accuracyMeters: 8,
    description: '模拟用户在室内或停止不动，平滑速度 <= 1.5 km/h 持续保持',
    expectedMode: '静止',
    expectedConfidenceRange: '85% ~ 100%',
  },
  walking: {
    key: 'walking',
    name: '模拟步行 (5 km/h)',
    targetSpeedKmh: 5.2,
    roadType: 'pedestrian_path',
    accuracyMeters: 10,
    description: '模拟在公园人行步道上匀速步行，中位速度 5.2 km/h，方向小幅自然摆动',
    expectedMode: '步行',
    expectedConfidenceRange: '80% ~ 95%',
  },
  bicycle: {
    key: 'bicycle',
    name: '模拟自行车 (18 km/h)',
    targetSpeedKmh: 18.5,
    roadType: 'bike_path',
    accuracyMeters: 12,
    description: '模拟在非机动车道或市政道路骑行，连续平滑时速 18.5 km/h，方向稳定',
    expectedMode: '自行车',
    expectedConfidenceRange: '80% ~ 92%',
  },
  car: {
    key: 'car',
    name: '模拟汽车 (45 km/h)',
    targetSpeedKmh: 45.0,
    roadType: 'primary_road',
    accuracyMeters: 8,
    description: '模拟在城市主干道快速行驶，时速 45 km/h，机动车加速与高平滑度特征显著',
    expectedMode: '汽车',
    expectedConfidenceRange: '88% ~ 98%',
  },
  traffic_jam_car: {
    key: 'traffic_jam_car',
    name: '模拟拥堵汽车 (8 km/h)',
    targetSpeedKmh: 8.0,
    roadType: 'primary_road',
    accuracyMeters: 10,
    description: '主干道低速缓行 8 km/h，伴随红绿灯停车与起步加减速，绝不误判为步行',
    expectedMode: '汽车 / 移动中',
    expectedConfidenceRange: '68% ~ 78%',
  },
  gps_drift: {
    key: 'gps_drift',
    name: '模拟 GPS 漂移 (瞬时跳跃)',
    targetSpeedKmh: 45.0,
    roadType: 'primary_road',
    accuracyMeters: 45,
    description: '注入异常跳跃和粗糙采样，清洗模块自动过滤极端漂移，维持原可靠状态',
    expectedMode: '过滤漂移 / 维持原态',
    expectedConfidenceRange: '自动清洗过滤',
    isDrift: true,
  },
  low_accuracy: {
    key: 'low_accuracy',
    name: '模拟低精度定位 (误差85m)',
    targetSpeedKmh: 15.0,
    roadType: 'secondary_road',
    accuracyMeters: 85,
    description: '模拟高楼林立导致 GPS 精度下降（误差 85m），系统主动降低置信度并平滑降级',
    expectedMode: '移动中',
    expectedConfidenceRange: '45% ~ 65%',
  },
  ambiguous_moving: {
    key: 'ambiguous_moving',
    name: '模拟低置信度移动 (8.5 km/h)',
    targetSpeedKmh: 8.5,
    roadType: 'unknown',
    accuracyMeters: 35,
    description: '步骑边界模糊区间且置信度未达 70%，系统严格遵循规则仅展示「移动中」',
    expectedMode: '移动中',
    expectedConfidenceRange: '< 70% (泛化展示)',
  },
};

export class MockLocationAdapter {
  private activeScenario: DemoScenarioKey = 'walking';
  private timer: any = null;
  private currentLat: number = 36.0611;
  private currentLng: number = 103.8343;
  private currentHeading: number = 45;
  private listeners: Array<() => void> = [];
  private isAutoRunning: boolean = true;
  private tickIntervalMs: number = 5000; // 5 seconds per sample

  constructor() {
    this.loadPersistedScenario();
    this.seedInitialSamples(this.activeScenario);
    this.startSimulation();
  }

  private loadPersistedScenario() {
    try {
      const saved = localStorage.getItem('stellar_demo_scenario');
      if (saved && DEMO_SCENARIOS[saved as DemoScenarioKey]) {
        this.activeScenario = saved as DemoScenarioKey;
      }
    } catch {
      // ignore
    }
  }

  public getActiveScenario(): DemoScenarioKey {
    return this.activeScenario;
  }

  public getActiveScenarioConfig(): DemoScenarioConfig {
    return DEMO_SCENARIOS[this.activeScenario];
  }

  public setScenario(key: DemoScenarioKey, reseed: boolean = true) {
    if (!DEMO_SCENARIOS[key]) return;
    this.activeScenario = key;
    try {
      localStorage.setItem('stellar_demo_scenario', key);
    } catch {
      // ignore
    }

    if (reseed) {
      this.seedInitialSamples(key);
    }
    this.notifyListeners();
  }

  // Pre-seed 6 realistic historical samples across the last 60 seconds
  public seedInitialSamples(scenarioKey: DemoScenarioKey) {
    globalTransportEngine.resetSamples();
    const config = DEMO_SCENARIOS[scenarioKey];
    const now = Date.now();
    const count = 6;
    const intervalSec = 8;

    let baseLat = 36.0611;
    let baseLng = 103.8343;
    let heading = 60;

    for (let i = count - 1; i >= 0; i--) {
      const timestamp = now - i * intervalSec * 1000;
      let targetSpeed = config.targetSpeedKmh;

      // Add realistic jitter
      if (scenarioKey === 'walking') {
        targetSpeed += (Math.sin(i) * 0.4);
        heading += (Math.cos(i) * 8);
      } else if (scenarioKey === 'bicycle') {
        targetSpeed += (Math.sin(i) * 1.2);
        heading += (Math.cos(i) * 3);
      } else if (scenarioKey === 'car') {
        targetSpeed += (Math.sin(i) * 2.5);
      } else if (scenarioKey === 'traffic_jam_car') {
        // Stop and go simulation: [0, 4, 12, 10, 2, 8]
        const trafficSeq = [0, 4, 14, 9, 2, 8];
        targetSpeed = trafficSeq[i % trafficSeq.length];
      } else if (scenarioKey === 'stationary') {
        targetSpeed = 0;
      }

      const speedMps = targetSpeed / 3.6;
      const moveDistanceMeters = speedMps * intervalSec;

      // Move coordinates along heading
      const rad = (heading * Math.PI) / 180;
      baseLat += (moveDistanceMeters * Math.cos(rad)) / 111320;
      baseLng += (moveDistanceMeters * Math.sin(rad)) / (111320 * Math.cos((baseLat * Math.PI) / 180));

      const sample: LocationSample = {
        latitude: baseLat,
        longitude: baseLng,
        timestamp,
        speedMps,
        accuracyMeters: config.accuracyMeters + (Math.random() * 2 - 1),
        heading,
        roadType: config.roadType,
        source: 'mock',
      };

      globalTransportEngine.addSample(sample);
    }

    this.currentLat = baseLat;
    this.currentLng = baseLng;
    this.currentHeading = heading;
  }

  // Generate a live next step
  public tick() {
    const config = DEMO_SCENARIOS[this.activeScenario];
    const now = Date.now();
    let targetSpeed = config.targetSpeedKmh;

    if (config.isDrift) {
      // Injected abnormal spike
      const driftSample: LocationSample = {
        latitude: this.currentLat + 0.05, // Sudden 5km jump!
        longitude: this.currentLng + 0.05,
        timestamp: now,
        speedMps: 220 / 3.6,
        accuracyMeters: 80,
        roadType: 'unknown',
        source: 'mock',
      };
      globalTransportEngine.addSample(driftSample);
      this.notifyListeners();
      return;
    }

    if (this.activeScenario === 'walking') {
      targetSpeed += (Math.random() * 0.6 - 0.3);
      this.currentHeading += (Math.random() * 10 - 5);
    } else if (this.activeScenario === 'bicycle') {
      targetSpeed += (Math.random() * 1.5 - 0.75);
      this.currentHeading += (Math.random() * 4 - 2);
    } else if (this.activeScenario === 'car') {
      targetSpeed += (Math.random() * 3.0 - 1.5);
      this.currentHeading += (Math.random() * 2 - 1);
    } else if (this.activeScenario === 'traffic_jam_car') {
      // Stop and go oscillation
      const step = Math.floor(now / 5000) % 4;
      if (step === 0) targetSpeed = 0;
      else if (step === 1) targetSpeed = 6;
      else if (step === 2) targetSpeed = 14;
      else targetSpeed = 4;
    } else if (this.activeScenario === 'stationary') {
      targetSpeed = 0;
    }

    const speedMps = Math.max(0, targetSpeed / 3.6);
    const intervalSec = this.tickIntervalMs / 1000;
    const moveDistMeters = speedMps * intervalSec;

    const rad = (this.currentHeading * Math.PI) / 180;
    this.currentLat += (moveDistMeters * Math.cos(rad)) / 111320;
    this.currentLng += (moveDistMeters * Math.sin(rad)) / (111320 * Math.cos((this.currentLat * Math.PI) / 180));

    const sample: LocationSample = {
      latitude: this.currentLat,
      longitude: this.currentLng,
      timestamp: now,
      speedMps,
      accuracyMeters: config.accuracyMeters + (Math.random() * 2 - 1),
      heading: this.currentHeading,
      roadType: config.roadType,
      source: 'mock',
    };

    globalTransportEngine.addSample(sample);
    this.notifyListeners();
  }

  public startSimulation() {
    if (this.timer) clearInterval(this.timer);
    this.isAutoRunning = true;
    this.timer = setInterval(() => {
      this.tick();
    }, this.tickIntervalMs);
  }

  public stopSimulation() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isAutoRunning = false;
    this.notifyListeners();
  }

  public toggleSimulation() {
    if (this.isAutoRunning) {
      this.stopSimulation();
    } else {
      this.startSimulation();
      this.notifyListeners();
    }
  }

  public getIsAutoRunning(): boolean {
    return this.isAutoRunning;
  }

  public getCurrentCoordinates(): { lat: number; lng: number } {
    return { lat: this.currentLat, lng: this.currentLng };
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch {
        // ignore
      }
    });
  }
}

// Singleton Mock Adapter Instance
export const globalMockLocationAdapter = new MockLocationAdapter();
