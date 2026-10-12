/**
 * Haptic Feedback Engine (UIImpactFeedbackGenerator Simulation & Web Vibration API)
 * Provides 3 distinct precision haptic levels:
 * - 轻触 (Light / Selection): Subtle 12ms tick
 * - 成功 (Success): Two-pulse confirmation rhythm [20, 35, 25]
 * - 警告 (Warning): Urgent vibration burst [45, 30, 60]
 */

export type HapticType =
  | 'light'
  | 'success'
  | 'warning'
  | 'medium'
  | 'heavy'
  | 'selection'
  | 'tick'
  | 'burst'
  | 'spring';

class HapticsEngine {
  private isEnabled: boolean = true;

  constructor() {
    try {
      const saved = localStorage.getItem('stellar_haptics_enabled');
      if (saved !== null) {
        this.isEnabled = saved === 'true';
      }
    } catch {
      this.isEnabled = true;
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    try {
      localStorage.setItem('stellar_haptics_enabled', String(enabled));
    } catch {}
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Ultra-short crisp micro-tick (8-10ms)
   */
  public tick(durationMs: number = 8) {
    if (!this.isEnabled || typeof window === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate(Math.max(4, Math.min(30, durationMs)));
    } catch {}
  }

  /**
   * Progressive step pulse for long-press charging states (e.g. 1, 2, 3, 4)
   */
  public stepPulse(step: number = 1) {
    if (!this.isEnabled || typeof window === 'undefined' || !navigator.vibrate) return;
    try {
      const vibrationDurations = [10, 16, 24, 38];
      const dur = vibrationDurations[Math.min(step - 1, vibrationDurations.length - 1)] || 14;
      navigator.vibrate(dur);
    } catch {}
  }

  /**
   * Burst tactile rhythm for emoji explosion / combos
   */
  public burst() {
    if (!this.isEnabled || typeof window === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate([15, 20, 25, 15, 30]);
    } catch {}
  }

  /**
   * Spring release tactile confirmation when releasing a charged emoji
   */
  public springRelease() {
    if (!this.isEnabled || typeof window === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate([18, 15, 35]);
    } catch {}
  }

  /**
   * Trigger haptic feedback corresponding to UIImpactFeedbackGenerator
   */
  public trigger(type: HapticType = 'light') {
    if (!this.isEnabled) return;
    if (typeof window === 'undefined') return;

    if (navigator.vibrate) {
      try {
        switch (type) {
          case 'tick':
            navigator.vibrate(8);
            break;
          case 'light':
          case 'selection':
            // 轻触: 12ms 纯净触感
            navigator.vibrate(12);
            break;
          case 'medium':
            navigator.vibrate(25);
            break;
          case 'heavy':
            navigator.vibrate(45);
            break;
          case 'burst':
            navigator.vibrate([15, 20, 25, 15, 30]);
            break;
          case 'spring':
            navigator.vibrate([18, 15, 35]);
            break;
          case 'success':
            // 成功: 悦动双击反馈 [20ms 震, 35ms 停, 25ms 震]
            navigator.vibrate([20, 35, 25]);
            break;
          case 'warning':
            // 警告: 紧促三档警示反馈 [45ms 震, 30ms 停, 60ms 震]
            navigator.vibrate([45, 30, 60]);
            break;
          default:
            navigator.vibrate(15);
            break;
        }
      } catch {
        // Safe fail on restricted contexts
      }
    }
  }
}

export const haptics = new HapticsEngine();
