import {
  CostSubLayerKey,
  CostQuickActionKey,
  ComparisonMode,
  LifestylePresetKey,
  RelocationPlan,
} from '../types';
import { DEFAULT_INDEX_WEIGHTS } from './costOfLivingData';

export interface CostOfLivingState {
  activeSubLayer: CostSubLayerKey;
  activeQuickAction: CostQuickActionKey | null;
  selectedRegionId: string;
  comparisonRegionIds: string[];
  comparisonMode: ComparisonMode;
  lifestylePreset: LifestylePresetKey;
  indexWeights: Record<string, number>;
  weightMode: string;
  isDetailDrawerOpen: boolean;
  isComparisonModalOpen: boolean;
  isBudgetSimulatorOpen: boolean;
  isRelocationPlannerOpen: boolean;
  savedRelocationPlans: RelocationPlan[];
}

const INITIAL_STATE: CostOfLivingState = {
  activeSubLayer: 'cost_index',
  activeQuickAction: null,
  selectedRegionId: 'yuzhong', // 默认选中榆中县，便于用户即刻检阅
  comparisonRegionIds: ['yuzhong', 'dujiangyan'], // 默认预设两区域对比
  comparisonMode: 'same_standard',
  lifestylePreset: 'single_comfortable',
  indexWeights: { ...DEFAULT_INDEX_WEIGHTS },
  weightMode: 'balanced',
  isDetailDrawerOpen: false,
  isComparisonModalOpen: false,
  isBudgetSimulatorOpen: false,
  isRelocationPlannerOpen: false,
  savedRelocationPlans: [
    {
      id: 'initial-demo-plan',
      title: '兰州主城 → 迁居至都江堰市方案',
      destinationRegionId: 'dujiangyan',
      destinationRegionName: '都江堰市',
      originRegionName: '兰州市城关区',
      targetLevel: 'county',
      householdSize: 2,
      monthlyIncome: 8500,
      breakdown: {
        movingAndTransport: 2600,
        rentalDepositAndAdvance: 4200,
        furnitureAndAppliances: 2000,
        initialSchoolOrRegistration: 0,
        firstThreeMonthsBuffer: 12500,
        totalInitialCashNeeded: 21300,
      },
      monthlyLocalIncomeVsExpense: {
        estimatedIncome: 8500,
        estimatedExpense: 3800,
        netMonthlySurplus: 4700,
      },
      conclusionTag: '适合立即搬迁',
      conclusionNote: '都江堰居住环境上佳，快铁直通成都，收支结余健康，首期备用金约2.1万元。',
      createdAt: '2026-08-15',
    },
  ],
};

let currentState: CostOfLivingState = { ...INITIAL_STATE };
const listeners = new Set<(state: CostOfLivingState) => void>();

function notify() {
  listeners.forEach((listener) => listener(currentState));
}

export const costOfLivingStore = {
  getState(): CostOfLivingState {
    return currentState;
  },

  subscribe(listener: (state: CostOfLivingState) => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  setActiveSubLayer(subLayer: CostSubLayerKey) {
    currentState = { ...currentState, activeSubLayer: subLayer };
    notify();
  },

  setActiveQuickAction(action: CostQuickActionKey | null) {
    currentState = { ...currentState, activeQuickAction: action };
    notify();
  },

  setSelectedRegionId(regionId: string) {
    currentState = { ...currentState, selectedRegionId: regionId, isDetailDrawerOpen: true };
    notify();
  },

  openDetailDrawer(regionId?: string) {
    currentState = {
      ...currentState,
      selectedRegionId: regionId || currentState.selectedRegionId,
      isDetailDrawerOpen: true,
    };
    notify();
  },

  closeDetailDrawer() {
    currentState = { ...currentState, isDetailDrawerOpen: false };
    notify();
  },

  setComparisonRegions(regionIds: string[]) {
    currentState = { ...currentState, comparisonRegionIds: regionIds.slice(0, 4) };
    notify();
  },

  addRegionToComparison(regionId: string) {
    if (!currentState.comparisonRegionIds.includes(regionId) && currentState.comparisonRegionIds.length < 4) {
      currentState = {
        ...currentState,
        comparisonRegionIds: [...currentState.comparisonRegionIds, regionId],
      };
      notify();
    }
  },

  removeRegionFromComparison(regionId: string) {
    if (currentState.comparisonRegionIds.length > 1) {
      currentState = {
        ...currentState,
        comparisonRegionIds: currentState.comparisonRegionIds.filter((id) => id !== regionId),
      };
      notify();
    }
  },

  setComparisonMode(mode: ComparisonMode) {
    currentState = { ...currentState, comparisonMode: mode };
    notify();
  },

  setLifestylePreset(preset: LifestylePresetKey) {
    currentState = { ...currentState, lifestylePreset: preset };
    notify();
  },

  setIndexWeights(weights: Record<string, number>, mode = 'custom') {
    currentState = { ...currentState, indexWeights: weights, weightMode: mode };
    notify();
  },

  openComparisonModal() {
    currentState = { ...currentState, isComparisonModalOpen: true };
    notify();
  },

  closeComparisonModal() {
    currentState = { ...currentState, isComparisonModalOpen: false };
    notify();
  },

  openBudgetSimulator(targetRegionId?: string) {
    if (targetRegionId) {
      currentState = { ...currentState, selectedRegionId: targetRegionId };
    }
    currentState = { ...currentState, isBudgetSimulatorOpen: true };
    notify();
  },

  closeBudgetSimulator() {
    currentState = { ...currentState, isBudgetSimulatorOpen: false };
    notify();
  },

  openRelocationPlanner(targetRegionId?: string) {
    if (targetRegionId) {
      currentState = { ...currentState, selectedRegionId: targetRegionId };
    }
    currentState = { ...currentState, isRelocationPlannerOpen: true };
    notify();
  },

  closeRelocationPlanner() {
    currentState = { ...currentState, isRelocationPlannerOpen: false };
    notify();
  },

  saveRelocationPlan(plan: RelocationPlan) {
    currentState = {
      ...currentState,
      savedRelocationPlans: [plan, ...currentState.savedRelocationPlans],
    };
    notify();
  },

  deleteRelocationPlan(planId: string) {
    currentState = {
      ...currentState,
      savedRelocationPlans: currentState.savedRelocationPlans.filter((p) => p.id !== planId),
    };
    notify();
  },
};
