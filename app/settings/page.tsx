'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabaseClient';

export default function SettingsPage() {
  const [goals, setGoals] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // 表单状态
  const [startWeight, setStartWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [startDate, setStartDate] = useState('');
  const [expectedWeeks, setExpectedWeeks] = useState('');
  const [dailyCalorieTarget, setDailyCalorieTarget] = useState('');

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
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

      // 2. 获取用户目标
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('获取目标失败:', error);
      }

      if (data) {
        setGoals(data);
        setStartWeight(data.start_weight.toString());
        setTargetWeight(data.target_weight.toString());
        setStartDate(data.start_date);
        setExpectedWeeks(data.expected_weeks.toString());
        setDailyCalorieTarget(data.daily_calorie_target.toString());
      }

    } catch (err) {
      console.error('加载目标错误:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 1. 获取当前用户
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        setMessage({ type: 'error', text: `获取用户失败: ${userError.message}` });
        return;
      }

      if (!user) {
        setMessage({ type: 'error', text: '请先登录' });
        return;
      }

      const goalData = {
        user_id: user.id,
        start_weight: parseFloat(startWeight),
        target_weight: parseFloat(targetWeight),
        start_date: startDate,
        expected_weeks: parseInt(expectedWeeks),
        daily_calorie_target: parseInt(dailyCalorieTarget),
      };

      // 2. 使用 upsert 保存（有则更新，无则插入）
      const { data, error } = await supabase
        .from('user_settings')
        .upsert(goalData, {
          onConflict: 'user_id',
          ignoreDuplicates: false,
        })
        .select()
        .single();

      if (error) {
        setMessage({ type: 'error', text: `保存失败: ${error.message}` });
        return;
      }

      setGoals(data);
      setMessage({ type: 'success', text: '设置已保存！' });

      setTimeout(() => setMessage(null), 3000);

    } catch (err: any) {
      setMessage({ type: 'error', text: `错误: ${err.message}` });
    }
  };

  const handleClear = async () => {
    if (!confirm('确定要清除所有目标设置吗？')) {
      return;
    }

    try {
      // 1. 获取当前用户
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        setMessage({ type: 'error', text: `获取用户失败: ${userError.message}` });
        return;
      }

      if (!user) {
        setMessage({ type: 'error', text: '请先登录' });
        return;
      }

      // 2. 删除目标设置
      const { error } = await supabase
        .from('user_settings')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        setMessage({ type: 'error', text: `删除失败: ${error.message}` });
        return;
      }

      setGoals(null);
      setStartWeight('');
      setTargetWeight('');
      setStartDate('');
      setExpectedWeeks('');
      setDailyCalorieTarget('');
      setMessage({ type: 'success', text: '设置已清除' });

      setTimeout(() => setMessage(null), 3000);

    } catch (err: any) {
      setMessage({ type: 'error', text: `错误: ${err.message}` });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">目标设置</h1>
            <p className="text-gray-600 mt-1">设置你的减脂目标</p>
          </div>
          <Link href="/">
            <Button variant="outline">返回首页</Button>
          </Link>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 起始体重 */}
            <Input
              label="起始体重 (kg)"
              type="number"
              step="0.1"
              placeholder="例如：75.5"
              value={startWeight}
              onChange={(e) => setStartWeight(e.target.value)}
              required
            />

            {/* 目标体重 */}
            <Input
              label="目标体重 (kg)"
              type="number"
              step="0.1"
              placeholder="例如：68"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              required
            />

            {/* 开始日期 */}
            <Input
              label="开始日期"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />

            {/* 预计周数 */}
            <Input
              label="预计周数"
              type="number"
              placeholder="例如：12"
              value={expectedWeeks}
              onChange={(e) => setExpectedWeeks(e.target.value)}
              required
            />

            {/* 每日热量目标 */}
            <Input
              label="每日热量目标 (大卡)"
              type="number"
              placeholder="例如：1800"
              value={dailyCalorieTarget}
              onChange={(e) => setDailyCalorieTarget(e.target.value)}
              required
            />

            {/* 当前目标预览 */}
            {goals && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">当前目标预览：</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">起始：</span>
                    <span className="text-gray-900">{goals.start_weight} kg</span>
                  </div>
                  <div>
                    <span className="text-gray-500">目标：</span>
                    <span className="text-gray-900">{goals.target_weight} kg</span>
                  </div>
                  <div>
                    <span className="text-gray-500">需要减重：</span>
                    <span className="text-gray-900">{(goals.start_weight - goals.target_weight).toFixed(1)} kg</span>
                  </div>
                  <div>
                    <span className="text-gray-500">预计速度：</span>
                    <span className="text-gray-900">{((goals.start_weight - goals.target_weight) / goals.expected_weeks).toFixed(2)} kg/周</span>
                  </div>
                </div>
              </div>
            )}

            {/* 按钮组 */}
            <div className="flex gap-4">
              <Button type="submit" className="flex-1">
                保存设置
              </Button>
              {goals && (
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleClear}
                >
                  清除设置
                </Button>
              )}
            </div>

            {/* 提示消息 */}
            {message && (
              <div className={`p-3 rounded-lg text-center ${
                message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {message.text}
              </div>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
}