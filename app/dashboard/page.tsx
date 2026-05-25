'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/cards/StatCard';
import { WeightChart } from '@/components/charts/WeightChart';
import { SleepChart } from '@/components/charts/SleepChart';
import { supabase } from '@/lib/supabaseClient';
import { formatWeight } from '@/lib/calculations';

export default function DashboardPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [goals, setGoals] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'jin'>('kg');

  const loadData = async () => {
    setLoading(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error('获取用户失败:', userError);
        setLoading(false);
        return;
      }

      if (!user) {
        setLoading(false);
        return;
      }

      setUser(user);

      const { data: goalsData } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setGoals(goalsData);
      if (goalsData?.weight_unit) {
        setWeightUnit(goalsData.weight_unit as 'kg' | 'jin');
      }

      const { data: recordsData } = await supabase
        .from('daily_records')
        .select('*')
        .eq('user_id', user.id)
        .order('record_date', { ascending: true });

      if (recordsData) {
        setRecords(recordsData);

        if (recordsData.length > 0) {
          const calculatedStats = calculateStats(recordsData, goalsData);
          setStats(calculatedStats);
          setProgress(getProgressPercent(recordsData, goalsData));
        }
      }

    } catch (err) {
      console.error('加载数据错误:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const chartData = records.slice(-14).map(r => ({
    date: r.record_date,
    weight: r.weight,
    morning_weight: r.morning_weight,
    evening_weight: r.evening_weight,
    sleepHours: r.sleep_hours,
  }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-soft text-gray-500 dark:text-gray-400">加载中...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold mb-4 font-display">请先登录</h2>
          <Link href="/login">
            <Button>去登录</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md animate-scale-in">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold mb-4 font-display">数据不足</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">继续记录后生成报告，至少需要 1 条记录</p>
          <Link href="/record">
            <Button className="btn-hover">开始记录</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* 背景装饰 */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-200/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-teal-200/20 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight">
              <span className="text-gradient">减脂看板</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">追踪你的减脂进度</p>
          </div>
          <Link href="/record">
            <Button className="btn-hover shadow-soft">
              今日记录
            </Button>
          </Link>
        </div>

        {/* 进度条 */}
        {goals && (
          <Card className="mb-8 glass border-0 shadow-soft-lg animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">减脂进度</span>
              <span className="text-sm font-bold text-gradient">{progress.toFixed(1)}%</span>
            </div>
            <div className="relative w-full h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="absolute inset-0 h-full bg-gradient-to-r from-orange-400 to-red-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
              {/* 闪光效果 */}
              <div
                className="absolute inset-0 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full animate-gradient"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
              <span>起始 {formatWeight(stats.currentWeight + stats.totalLost, weightUnit)}{weightUnit === 'jin' ? '斤' : 'kg'}</span>
              <span>目标 {formatWeight(stats.remaining > 0 ? stats.currentWeight - stats.remaining : stats.currentWeight, weightUnit)}{weightUnit === 'jin' ? '斤' : 'kg'}</span>
            </div>
          </Card>
        )}

        {/* 核心指标 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <StatCard
            title="当前体重"
            value={parseFloat(formatWeight(stats.currentWeight, weightUnit))}
            unit={weightUnit === 'jin' ? '斤' : 'kg'}
            gradient
          />
          <StatCard
            title="累计减重"
            value={parseFloat(formatWeight(stats.totalLost, weightUnit))}
            unit={weightUnit === 'jin' ? '斤' : 'kg'}
            trend={{ value: stats.totalLost, label: '累计' }}
            gradient
          />
          <StatCard
            title="距离目标"
            value={parseFloat(formatWeight(stats.remaining, weightUnit))}
            unit={weightUnit === 'jin' ? '斤' : 'kg'}
            gradient
          />
          <StatCard
            title="7日平均"
            value={parseFloat(formatWeight(stats.weeklyAvgWeight, weightUnit))}
            unit={weightUnit === 'jin' ? '斤' : 'kg'}
            gradient
          />
        </div>

        {/* 第二排指标 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-scale-in" style={{ animationDelay: '0.3s' }}>
          <StatCard
            title="本周减重"
            value={parseFloat(formatWeight(stats.weeklyLost, weightUnit))}
            unit={weightUnit === 'jin' ? '斤' : 'kg'}
            icon="📉"
          />
          <StatCard
            title="平均睡眠"
            value={stats.avgSleep}
            unit="小时"
            icon="😴"
          />
          <StatCard
            title="平均执行率"
            value={stats.avgDietExecution}
            unit="%"
            icon="🥗"
          />
          <StatCard
            title="连续记录"
            value={stats.streakDays}
            unit="天"
            icon="🔥"
          />
        </div>

        {/* 早晚体重对比 */}
        <div className="grid grid-cols-3 gap-4 mb-8 animate-scale-in" style={{ animationDelay: '0.35s' }}>
          <StatCard
            title="今日早 vs 昨日早"
            value={parseFloat(formatWeight(stats.morningVsYesterday, weightUnit))}
            unit={weightUnit === 'jin' ? '斤' : 'kg'}
            icon="📊"
          />
          <StatCard
            title="今日早 vs 昨晚"
            value={parseFloat(formatWeight(stats.morningVsLastEvening, weightUnit))}
            unit={weightUnit === 'jin' ? '斤' : 'kg'}
            icon="📈"
          />
          <StatCard
            title="今晚 vs 今早"
            value={parseFloat(formatWeight(stats.eveningVsMorning, weightUnit))}
            unit={weightUnit === 'jin' ? '斤' : 'kg'}
            icon="📉"
          />
        </div>

        {/* 图表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-scale-in" style={{ animationDelay: '0.4s' }}>
          <div className="card-hover">
            <WeightChart data={chartData} weightUnit={weightUnit} />
          </div>
          <div className="card-hover">
            <SleepChart data={chartData} />
          </div>
        </div>

        {/* 预计达标日期 */}
        <Card className="glass border-0 shadow-soft-lg animate-scale-in" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">预计达标日期</p>
              <p className="text-lg font-bold text-gradient font-display">{stats.estimatedReachDate}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center text-2xl shadow-soft">
              🎯
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ============ 计算函数 ============

const getCurrentWeight = (records: any[]): number => {
  if (records.length === 0) return 0;
  return records[records.length - 1].weight;
};

const getTotalLost = (records: any[], goals: any): number => {
  if (!goals || records.length === 0) return 0;
  return goals.start_weight - getCurrentWeight(records);
};

const getRemaining = (records: any[], goals: any): number => {
  if (!goals || records.length === 0) return 0;
  return getCurrentWeight(records) - goals.target_weight;
};

const getWeeklyAvgWeight = (records: any[]): number => {
  const recent7 = records.slice(-7);
  if (recent7.length === 0) return 0;
  const sum = recent7.reduce((acc, r) => acc + r.weight, 0);
  return Number((sum / recent7.length).toFixed(1));
};

const getWeeklyLost = (records: any[]): number => {
  if (records.length < 2) return 0;

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const thisWeekRecords = records.filter(r => {
    const date = new Date(r.record_date);
    return date >= weekStart;
  });

  if (thisWeekRecords.length < 2) return 0;
  return Number((thisWeekRecords[0].weight - thisWeekRecords[thisWeekRecords.length - 1].weight).toFixed(1));
};

const getAvgSleep = (records: any[]): number => {
  const recent7 = records.slice(-7);
  if (recent7.length === 0) return 0;
  const sum = recent7.reduce((acc, r) => acc + r.sleep_hours, 0);
  return Number((sum / recent7.length).toFixed(1));
};

const getAvgDietExecution = (records: any[]): number => {
  const recent7 = records.slice(-7);
  if (recent7.length === 0) return 0;
  const sum = recent7.reduce((acc, r) => acc + r.diet_execution, 0);
  return Number((sum / recent7.length).toFixed(1));
};

const getWeightComparisons = (records: any[]): any => {
  if (records.length === 0) return { morningVsYesterday: '数据不足', morningVsLastEvening: '数据不足', eveningVsMorning: '数据不足' };

  const latest = records[records.length - 1];
  const yesterday = records.length > 1 ? records[records.length - 2] : null;

  let morningVsYesterday = '数据不足';
  let morningVsLastEvening = '数据不足';
  let eveningVsMorning = '数据不足';

  if (latest.morning_weight && yesterday?.morning_weight) {
    const diff = (yesterday.morning_weight - latest.morning_weight).toFixed(1);
    morningVsYesterday = diff > 0 ? `-${diff}kg` : (diff < 0 ? `+${Math.abs(parseFloat(diff))}kg` : '0kg');
  }

  if (latest.morning_weight && yesterday?.evening_weight) {
    const diff = (yesterday.evening_weight - latest.morning_weight).toFixed(1);
    morningVsLastEvening = diff > 0 ? `-${diff}kg` : (diff < 0 ? `+${Math.abs(parseFloat(diff))}kg` : '0kg');
  }

  if (latest.evening_weight && latest.morning_weight) {
    const diff = (latest.morning_weight - latest.evening_weight).toFixed(1);
    eveningVsMorning = diff > 0 ? `-${diff}kg` : (diff < 0 ? `+${Math.abs(parseFloat(diff))}kg` : '0kg');
  }

  return { morningVsYesterday, morningVsLastEvening, eveningVsMorning };
};

const getStreakDays = (records: any[]): number => {
  if (records.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const sortedRecords = [...records].sort((a, b) => b.record_date.localeCompare(a.record_date));

  for (const record of sortedRecords) {
    const recordDate = new Date(record.record_date);
    recordDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((currentDate.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      streak++;
      currentDate = recordDate;
    } else {
      break;
    }
  }

  return streak;
};

const getEstimatedReachDate = (records: any[], goals: any): string => {
  if (!goals || records.length < 7) return '数据不足';

  const currentWeight = getCurrentWeight(records);
  const remaining = currentWeight - goals.target_weight;

  if (remaining <= 0) return '已达标！';

  const recentRecords = records.slice(-28);
  if (recentRecords.length < 2) return '数据不足';

  const weeklyLoss = (recentRecords[0].weight - recentRecords[recentRecords.length - 1].weight) / 4;

  if (weeklyLoss <= 0) return '无法预测';

  const weeksNeeded = Math.ceil(remaining / weeklyLoss);
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + weeksNeeded * 7);

  return targetDate.toLocaleDateString('zh-CN');
};

const calculateStats = (records: any[], goals: any): any => {
  return {
    currentWeight: getCurrentWeight(records),
    totalLost: getTotalLost(records, goals),
    remaining: getRemaining(records, goals),
    weeklyAvgWeight: getWeeklyAvgWeight(records),
    weeklyLost: getWeeklyLost(records),
    avgSleep: getAvgSleep(records),
    avgDietExecution: getAvgDietExecution(records),
    streakDays: getStreakDays(records),
    estimatedReachDate: getEstimatedReachDate(records, goals),
    ...getWeightComparisons(records),
  };
};

const getProgressPercent = (records: any[], goals: any): number => {
  if (!goals || goals.start_weight === goals.target_weight) return 0;

  const totalToLose = goals.start_weight - goals.target_weight;
  const lost = getTotalLost(records, goals);

  const percent = (lost / totalToLose) * 100;
  return Math.max(0, Math.min(100, percent));
};