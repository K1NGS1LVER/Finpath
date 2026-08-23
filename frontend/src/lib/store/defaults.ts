// ============================================================
// Store defaults + persistence plumbing shared by the slices.
// ============================================================

import { createJSONStorage } from 'zustand/middleware';
import type { FinancialProfile } from '../types';

export const DEBT_GOAL_ID = 'goal-debt-payoff';

/** Default empty profile */
export const defaultProfile: FinancialProfile = {
  onboarded: false,
  income: {
    primary: 0,
    secondary: 0,
    passive: 0,
    variablePercent: 0,
    variable: 0,
    total: 0,
    primaryIncrement: 0,
    secondaryIncrement: 0,
    passiveIncrement: 0,
    netRate: 1.0,
    netMonthly: 0,
  },
  expenses: {
    rent: 0,
    food: 0,
    transport: 0,
    utilities: 0,
    entertainment: 0,
    other: 0,
    total: 0,
  },
  debts: { items: [], totalMonthly: 0 },
  savings: 0,
  investments: 0,
  emergencyFund: 0,
  goals: [],
  healthScore: null,
  plan: null,
  chatHistory: [],
  currency: 'INR',
  strategy: 'avalanche',
  monthlySurplusReserve: 0,
  pendingGoalDecisions: [],
  lastUpdated: Date.now(),
  investmentReturnRate: 12,
  storageMode: 'local',
  debtGoalDeleted: false,
  milestones: [],
  demoMode: false,
  dreams: [],
  ageYears: undefined,
};

const memoryStorage = new Map<string, string>();

const isLocalStorageAvailable = (): boolean => {
  try {
    return (
      typeof window !== 'undefined' &&
      typeof window.localStorage !== 'undefined' &&
      window.localStorage !== null
    );
  } catch {
    return false;
  }
};

export const safeStorage = createJSONStorage(() => ({
  getItem: (name: string): string | null => {
    try {
      if (isLocalStorageAvailable()) {
        return window.localStorage.getItem(name);
      }
    } catch (e) {
      console.warn('localStorage.getItem failed, falling back to memory storage', e);
    }
    return memoryStorage.get(name) ?? null;
  },
  setItem: (name: string, value: string): void => {
    try {
      if (isLocalStorageAvailable()) {
        window.localStorage.setItem(name, value);
        return;
      }
    } catch (e) {
      console.warn(
        'localStorage.setItem failed (quota exceeded?), falling back to memory storage',
        e,
      );
    }
    memoryStorage.set(name, value);
  },
  removeItem: (name: string): void => {
    try {
      if (isLocalStorageAvailable()) {
        window.localStorage.removeItem(name);
        return;
      }
    } catch (e) {
      console.warn('localStorage.removeItem failed', e);
    }
    memoryStorage.delete(name);
  },
}));
