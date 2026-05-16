import { DailyRecord, UserGoals } from '@/types';

const STORAGE_KEYS = {
  RECORDS: 'lean-sleep-records',
  GOALS: 'lean-sleep-goals',
};

// 每日记录操作
export const recordsStorage = {
  // 获取所有记录
  getAll: (): DailyRecord[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.RECORDS);
    return data ? JSON.parse(data) : [];
  },

  // 保存所有记录
  saveAll: (records: DailyRecord[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  },

  // 获取单条记录
  get: (date: string): DailyRecord | null => {
    const records = recordsStorage.getAll();
    return records.find(r => r.date === date) || null;
  },

  // 添加或更新记录
  save: (record: DailyRecord): void => {
    const records = recordsStorage.getAll();
    const index = records.findIndex(r => r.date === record.date);
    if (index >= 0) {
      records[index] = record;
    } else {
      records.push(record);
    }
    // 按日期排序
    records.sort((a, b) => a.date.localeCompare(b.date));
    recordsStorage.saveAll(records);
  },

  // 删除记录
  delete: (date: string): void => {
    const records = recordsStorage.getAll().filter(r => r.date !== date);
    recordsStorage.saveAll(records);
  },
};

// 用户目标操作
export const goalsStorage = {
  get: (): UserGoals | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STORAGE_KEYS.GOALS);
    return data ? JSON.parse(data) : null;
  },

  save: (goals: UserGoals): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  },

  clear: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.GOALS);
  },
};