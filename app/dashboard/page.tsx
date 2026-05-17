'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/cards/StatCard';
import { WeightChart } from '@/components/charts/WeightChart';
import { SleepChart } from '@/components/charts/SleepChart';
import { supabase } from '@/lib/supabaseClient';

export default function DashboardPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [goals, setGoals] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // 加载数据
  const loadData = async () => {
    setLoading(true);

    try {
      // 1. 获取当前用户
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

      // 2. 获取用户目标
      const { data: goalsData } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setGoals(goalsData);

      // 3. 获取所有记录，按日期正序排列
      const { data: recordsData } = await supabase
        .from('daily_records')
        .select('*')
        .eq('user_id', user.id)
        .order('record_date', { ascending: true });

      if (recordsData) {
        setRecords(recordsData);

        // 4. 计算统计数据
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

  // 图表数据
  const chartData = records.slice(-14).map(r => ({
    date: r.record_date,
    weight: r.weight,
    sleepHours: r.sleep_hours,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">请先登录</p>
          <Link href="/login">
            <Button>去登录</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-gray-500 mb-4">数据不足，继续记录后生成报告</p>
          <p className="text-sm text-gray-400 mb-4">至少需要 1 条记录</p>
          <Link href="/record">
            <Button>开始记录</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">减脂睡眠看板</h1>
            <p className="text-gray-600 mt-1">追踪你的减脂进度</p>
          </div>
          <Link href="/record">
            <Button>今日记录</Button>
          </Link>
        </div>

        {/* 进度条 */}
        {goals && (
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">减脂进度</span>
              <span className="text-sm text-gray-500">{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>起始 {stats.currentWeight + stats.totalLost}kg</span>
              <span>目标 {stats.remaining > 0 ? stats.currentWeight - stats.remaining : stats.currentWeight}kg</span>
            </div>
          </Card>
        )}

        {/* 核心指标 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="当前体重"
            value={stats.currentWeight}
            unit="kg"
          />
          <StatCard
            title="累计减重"
            value={stats.totalLost}
            unit="kg"
            trend={{ value: stats.totalLost, label: '累计' }}
          />
          <StatCard
            title="距离目标"
            value={stats.remaining}
            unit="kg"
          />
          <StatCard
            title="7日平均"
            value={stats.weeklyAvgWeight}
            unit="kg"
          />
        </div>

        {/* 第二排指标 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="本周减重"
            value={stats.weeklyLost}
            unit="kg"
          />
          <StatCard
            title="平均睡眠"
            value={stats.avgSleep}
            unit="小时"
          />
          <StatCard
            title="平均执行率"
            value={stats.avgDietExecution}
            unit="%"
          />
          <StatCard
            title="连续记录"
            value={stats.streakDays}
            unit="天"
          />
        </div>

        {/* 图表区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <WeightChart data={chartData} />
          <SleepChart data={chartData} />
        </div>

        {/* 预计达标日期 */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">预计达标日期</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">{stats.estimatedReachDate}</p>
            </div>
            <div className="text-2xl">🎯</div>
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
  };
};

const getProgressPercent = (records: any[], goals: any): number => {
  if (!goals || goals.start_weight === goals.target_weight) return 0;

  const totalToLose = goals.start_weight - goals.target_weight;
  const lost = getTotalLost(records, goals);

  const percent = (lost / totalToLose) * 100;
  return Math.max(0, Math.min(100, percent));
};