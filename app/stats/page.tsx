'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { WeeklyCard } from '@/components/cards/WeeklyCard';
import { MonthlyCard } from '@/components/cards/MonthlyCard';
import { supabase } from '@/lib/supabaseClient';
import { formatWeight } from '@/lib/calculations';

export default function StatsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [goals, setGoals] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'jin'>('kg');

  useEffect(() => {
    loadData();
  }, []);

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
      }

    } catch (err) {
      console.error('加载数据错误:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* 背景装饰 */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-gradient-to-br from-orange-200/30 to-red-200/30 rounded-full blur-3xl animate-gradient" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-gradient-to-br from-teal-200/30 to-green-200/30 rounded-full blur-3xl animate-gradient" style={{ animationDelay: '4s' }} />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight">
              <span className="text-gradient">数据卡片</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">适用于视频展示和分享</p>
          </div>
          <Link href="/">
            <Button variant="ghost">返回首页</Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse-soft text-gray-500 dark:text-gray-400">加载中...</div>
          </div>
        ) : !user ? (
          <Card className="glass border-0 shadow-soft">
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🔐</div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">请先登录</p>
              <Link href="/login">
                <Button>去登录</Button>
              </Link>
            </div>
          </Card>
        ) : records.length === 0 ? (
          <Card className="glass border-0 shadow-soft">
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">数据不足，继续记录后生成报告</p>
              <Link href="/record">
                <Button className="btn-hover">开始记录</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-12">
            {/* 使用说明 */}
            <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800/30 shadow-soft animate-fade-in">
              <div className="space-y-2">
                <p className="font-semibold text-orange-800 dark:text-orange-300">使用说明：</p>
                <ul className="text-sm text-orange-700 dark:text-orange-400 space-y-1">
                  <li>• 使用截图工具截取卡片即可用于视频</li>
                  <li>• 周报显示本周数据，月报显示本月数据</li>
                  <li>• 右下角有 LeanSleep Tracker 水印</li>
                  <li>• 卡片采用渐变背景，适合各类视频风格</li>
                </ul>
              </div>
            </Card>

            {/* 卡片展示区 */}
            <div className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <h2 className="text-xl font-semibold font-display text-gray-900 dark:text-gray-100 mb-6 text-center">周报卡片</h2>
              <div className="flex justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 sm:p-12 shadow-inner">
                <WeeklyCard records={records} goals={goals} weightUnit={weightUnit} />
              </div>
            </div>

            <div className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-xl font-semibold font-display text-gray-900 dark:text-gray-100 mb-6 text-center">月报卡片</h2>
              <div className="flex justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 sm:p-12 shadow-inner">
                <MonthlyCard records={records} goals={goals} weightUnit={weightUnit} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}