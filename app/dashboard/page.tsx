'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/cards/StatCard';
import { WeightChart } from '@/components/charts/WeightChart';
import { SleepChart } from '@/components/charts/SleepChart';
import { recordsStorage, goalsStorage } from '@/lib/storage';
import { calculateStats, getProgressPercent } from '@/lib/calculations';
import { DailyRecord } from '@/types';

export default function DashboardPage() {
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [progress, setProgress] = useState(0);

  // 加载数据
  const loadData = () => {
    const loadedRecords = recordsStorage.getAll();
    const goals = goalsStorage.get();

    setRecords(loadedRecords);

    if (goals && loadedRecords.length > 0) {
      const calculatedStats = calculateStats(loadedRecords, goals);
      setStats(calculatedStats);
      setProgress(getProgressPercent(loadedRecords, goals));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 图表数据
  const chartData = records.slice(-14).map(r => ({
    date: r.date,
    weight: r.weight,
    sleepHours: r.sleepHours,
  }));

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">暂无数据</p>
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