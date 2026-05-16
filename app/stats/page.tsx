'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { WeeklyCard } from '@/components/cards/WeeklyCard';
import { MonthlyCard } from '@/components/cards/MonthlyCard';
import { recordsStorage, goalsStorage } from '@/lib/storage';
import { DailyRecord } from '@/types';

export default function StatsPage() {
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [goals, setGoals] = useState<any>(null);

  useEffect(() => {
    const loadedRecords = recordsStorage.getAll();
    const loadedGoals = goalsStorage.get();
    setRecords(loadedRecords);
    setGoals(loadedGoals);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">数据展示卡片</h1>
            <p className="text-gray-600 mt-1">适用于视频展示和分享</p>
          </div>
          <Link href="/">
            <Button variant="outline">返回首页</Button>
          </Link>
        </div>

        {records.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">暂无数据，请先记录</p>
              <Link href="/record">
                <Button>开始记录</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* 使用说明 */}
            <Card className="bg-blue-50 border-blue-200">
              <div className="space-y-2">
                <p className="font-medium text-blue-900">使用说明：</p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 点击卡片区域可全屏显示</li>
                  <li>• 使用截图工具截取卡片即可用于视频</li>
                  <li>• 周报显示本周数据，月报显示本月数据</li>
                  <li>• 右下角有 LeanSleep Tracker 水印</li>
                </ul>
              </div>
            </Card>

            {/* 卡片展示区 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">周报卡片</h2>
              <div className="flex justify-center bg-gray-100 rounded-xl p-8">
                <WeeklyCard records={records} goals={goals} />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">月报卡片</h2>
              <div className="flex justify-center bg-gray-100 rounded-xl p-8">
                <MonthlyCard records={records} goals={goals} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}