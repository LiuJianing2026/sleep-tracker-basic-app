'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { goalsStorage } from '@/lib/storage';
import { UserGoals } from '@/types';

export default function SettingsPage() {
  const [goals, setGoals] = useState<UserGoals | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 表单状态
  const [startWeight, setStartWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [startDate, setStartDate] = useState('');
  const [expectedWeeks, setExpectedWeeks] = useState('');
  const [dailyCalorieTarget, setDailyCalorieTarget] = useState('');

  useEffect(() => {
    const loadedGoals = goalsStorage.get();
    setGoals(loadedGoals);

    if (loadedGoals) {
      setStartWeight(loadedGoals.startWeight.toString());
      setTargetWeight(loadedGoals.targetWeight.toString());
      setStartDate(loadedGoals.startDate);
      setExpectedWeeks(loadedGoals.expectedWeeks.toString());
      setDailyCalorieTarget(loadedGoals.dailyCalorieTarget.toString());
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newGoals: UserGoals = {
      startWeight: parseFloat(startWeight),
      targetWeight: parseFloat(targetWeight),
      startDate,
      expectedWeeks: parseInt(expectedWeeks),
      dailyCalorieTarget: parseInt(dailyCalorieTarget),
    };

    goalsStorage.save(newGoals);
    setGoals(newGoals);
    setMessage({ type: 'success', text: '设置已保存！' });

    setTimeout(() => setMessage(null), 3000);
  };

  const handleClear = () => {
    if (confirm('确定要清除所有目标设置吗？')) {
      goalsStorage.clear();
      setGoals(null);
      setStartWeight('');
      setTargetWeight('');
      setStartDate('');
      setExpectedWeeks('');
      setDailyCalorieTarget('');
      setMessage({ type: 'success', text: '设置已清除' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

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
                    <span className="text-gray-900">{goals.startWeight} kg</span>
                  </div>
                  <div>
                    <span className="text-gray-500">目标：</span>
                    <span className="text-gray-900">{goals.targetWeight} kg</span>
                  </div>
                  <div>
                    <span className="text-gray-500">需要减重：</span>
                    <span className="text-gray-900">{(goals.startWeight - goals.targetWeight).toFixed(1)} kg</span>
                  </div>
                  <div>
                    <span className="text-gray-500">预计速度：</span>
                    <span className="text-gray-900">{((goals.startWeight - goals.targetWeight) / goals.expectedWeeks).toFixed(2)} kg/周</span>
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