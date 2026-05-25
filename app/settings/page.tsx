'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabaseClient';
import { formatWeight, parseWeightInput } from '@/lib/calculations';

export default function SettingsPage() {
  const [goals, setGoals] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [startWeight, setStartWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [startDate, setStartDate] = useState('');
  const [expectedWeeks, setExpectedWeeks] = useState('');
  const [dailyCalorieTarget, setDailyCalorieTarget] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'jin'>('kg');

  const loadGoals = async () => {
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
        const unit = (data.weight_unit as 'kg' | 'jin') || 'kg';
        setStartWeight(formatWeight(data.start_weight, unit));
        setTargetWeight(formatWeight(data.target_weight, unit));
        setStartDate(data.start_date);
        setExpectedWeeks(data.expected_weeks.toString());
        setDailyCalorieTarget(data.daily_calorie_target.toString());
        setWeightUnit(unit);
      }

    } catch (err) {
      console.error('加载目标错误:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  useEffect(() => {
    if (startWeight && targetWeight) {
      const currentStart = parseFloat(startWeight);
      const currentTarget = parseFloat(targetWeight);
      if (!isNaN(currentStart)) {
        setStartWeight((currentStart * (weightUnit === 'jin' ? 2 : 0.5)).toFixed(1));
      }
      if (!isNaN(currentTarget)) {
        setTargetWeight((currentTarget * (weightUnit === 'jin' ? 2 : 0.5)).toFixed(1));
      }
    }
  }, [weightUnit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        setMessage({ type: 'error', text: `获取用户失败: ${userError.message}` });
        setSaving(false);
        return;
      }

      if (!user) {
        setMessage({ type: 'error', text: '请先登录' });
        setSaving(false);
        return;
      }

      const goalData = {
        user_id: user.id,
        start_weight: parseWeightInput(startWeight, weightUnit),
        target_weight: parseWeightInput(targetWeight, weightUnit),
        start_date: startDate,
        expected_weeks: parseInt(expectedWeeks),
        daily_calorie_target: parseInt(dailyCalorieTarget),
        weight_unit: weightUnit,
      };

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
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (!confirm('确定要清除所有目标设置吗？')) {
      return;
    }

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        setMessage({ type: 'error', text: `获取用户失败: ${userError.message}` });
        return;
      }

      if (!user) {
        setMessage({ type: 'error', text: '请先登录' });
        return;
      }

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-soft text-gray-500 dark:text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* 背景装饰 */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -left-20 w-96 h-96 bg-gradient-to-br from-orange-200/30 to-red-200/30 rounded-full blur-3xl animate-gradient" />
        <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-gradient-to-br from-teal-200/30 to-green-200/30 rounded-full blur-3xl animate-gradient" style={{ animationDelay: '4s' }} />
      </div>

      <div className="max-w-2xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight">
              <span className="text-gradient">目标设置</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">设置你的减脂目标</p>
          </div>
          <Link href="/">
            <Button variant="ghost">返回首页</Button>
          </Link>
        </div>

        <Card className="glass border-0 shadow-soft-lg animate-scale-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label={`起始体重 (${weightUnit === 'kg' ? 'kg' : '斤'})`}
              type="number"
              step="0.1"
              placeholder={weightUnit === 'kg' ? '例如：75.5' : '例如：151'}
              value={startWeight}
              onChange={(e) => setStartWeight(e.target.value)}
              required
            />

            <Input
              label={`目标体重 (${weightUnit === 'kg' ? 'kg' : '斤'})`}
              type="number"
              step="0.1"
              placeholder={weightUnit === 'kg' ? '例如：68' : '例如：136'}
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              required
            />

            <Input
              label="开始日期"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />

            <Input
              label="预计周数"
              type="number"
              placeholder="例如：12"
              value={expectedWeeks}
              onChange={(e) => setExpectedWeeks(e.target.value)}
              required
            />

            <Input
              label="每日热量目标 (大卡)"
              type="number"
              placeholder="例如：1800"
              value={dailyCalorieTarget}
              onChange={(e) => setDailyCalorieTarget(e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                体重显示单位
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setWeightUnit('kg')}
                  className={`flex-1 py-3 rounded-2xl font-medium transition-all ${
                    weightUnit === 'kg'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  kg（公斤）
                </button>
                <button
                  type="button"
                  onClick={() => setWeightUnit('jin')}
                  className={`flex-1 py-3 rounded-2xl font-medium transition-all ${
                    weightUnit === 'jin'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  斤
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                选择后，所有页面的体重显示将使用此单位
              </p>
            </div>

            {goals && (
              <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-3xl p-5 border border-orange-100 dark:border-orange-800/30">
                <p className="text-sm font-semibold text-orange-800 dark:text-orange-300 mb-4">当前目标预览：</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">起始</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{formatWeight(goals.start_weight, weightUnit)} {weightUnit === 'kg' ? 'kg' : '斤'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">目标</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{formatWeight(goals.target_weight, weightUnit)} {weightUnit === 'kg' ? 'kg' : '斤'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">需要减重</span>
                    <span className="font-semibold text-orange-500">{formatWeight(goals.start_weight - goals.target_weight, weightUnit)} {weightUnit === 'kg' ? 'kg' : '斤'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">预计速度</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{formatWeight((goals.start_weight - goals.target_weight) / goals.expected_weeks, weightUnit)} {weightUnit === 'kg' ? 'kg' : '斤'}/周</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" className="flex-1 btn-hover" loading={saving}>
                {saving ? '保存中...' : '保存设置'}
              </Button>
              {goals && (
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleClear}
                  className="btn-hover"
                >
                  清除设置
                </Button>
              )}
            </div>

            {message && (
              <div className={`p-4 rounded-2xl text-center transition-all ${
                message.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
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