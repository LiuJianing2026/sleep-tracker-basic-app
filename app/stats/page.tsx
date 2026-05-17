'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { WeeklyCard } from '@/components/cards/WeeklyCard';
import { MonthlyCard } from '@/components/cards/MonthlyCard';
import { supabase } from '@/lib/supabaseClient';

export default function StatsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [goals, setGoals] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

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
      }

    } catch (err) {
      console.error('加载数据错误:', err);
    } finally {
      setLoading(false);
    }
  };

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

        {loading ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-500">加载中...</p>
            </div>
          </Card>
        ) : !user ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">请先登录</p>
              <Link href="/login">
                <Button>去登录</Button>
              </Link>
            </div>
          </Card>
        ) : records.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">数据不足，继续记录后生成报告</p>
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