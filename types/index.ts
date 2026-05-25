// 每日记录
export interface DailyRecord {
  id: string;              // 唯一标识 (YYYY-MM-DD)
  date: string;            // 日期
  weight: number;          // 体重 (kg)
  morning_weight?: number; // 早晨体重 (kg)
  evening_weight?: number; // 晚上体重 (kg)
  sleepHours: number;      // 睡眠时长 (小时)
  sleepQuality: number;    // 睡眠质量评分 (1-5)
  dietExecution: number;   // 饮食执行率 (%)
  water: number;           // 饮水量 (ml)
  exercise?: {
    type?: string;         // 运动类型
    duration?: number;     // 时长 (分钟)
  };
  note?: string;           // 一句话总结
  photoUrl?: string;       // 对比照片
}

// 用户目标设置
export interface UserGoals {
  startWeight: number;           // 起始体重
  targetWeight: number;          // 目标体重
  startDate: string;             // 开始日期
  expectedWeeks: number;         // 预计周数
  dailyCalorieTarget: number;    // 每日热量目标
}

// 统计数据
export interface Stats {
  currentWeight: number;         // 当前体重
  totalLost: number;             // 累计减重
  remaining: number;             // 距离目标
  weeklyAvgWeight: number;       // 7日平均体重
  weeklyLost: number;            // 本周减重
  avgSleep: number;              // 平均睡眠时长
  avgDietExecution: number;      // 平均执行率
  streakDays: number;            // 连续记录天数
  estimatedReachDate: string;    // 预计达标日期
}