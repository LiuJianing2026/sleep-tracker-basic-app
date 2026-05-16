'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { recordsStorage } from '@/lib/storage';
import { DailyRecord } from '@/types';

export default function RecordPage() {
  // 表单状态
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [sleepQuality, setSleepQuality] = useState('');
  const [dietExecution, setDietExecution] = useState('');
  const [water, setWater] = useState('');
  const [exerciseType, setExerciseType] = useState('');
  const [exerciseDuration, setExerciseDuration] = useState('');
  const [note, setNote] = useState('');

  // 错误提示
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 睡眠质量选项
  const qualityOptions = [
    { value: 1, label: '很差 😫' },
    { value: 2, label: '较差 😕' },
    { value: 3, label: '一般 😐' },
    { value: 4, label: '较好 😊' },
    { value: 5, label: '很好 😴' },
  ];

  // 表单验证
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!weight || parseFloat(weight) <= 0 || parseFloat(weight) > 300) {
      newErrors.weight = '请输入有效的体重（1-300kg）';
    }
    if (!sleepHours || parseFloat(sleepHours) < 0 || parseFloat(sleepHours) > 24) {
      newErrors.sleepHours = '请输入有效的睡眠时长（0-24小时）';
    }
    if (!sleepQuality) {
      newErrors.sleepQuality = '请选择睡眠质量';
    }
    if (!dietExecution || parseFloat(dietExecution) < 0 || parseFloat(dietExecution) > 100) {
      newErrors.dietExecution = '请输入有效的执行率（0-100%）';
    }
    if (!water || parseFloat(water) < 0 || parseFloat(water) > 10000) {
      newErrors.water = '请输入有效的饮水量（0-10000ml）';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表单
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const record: DailyRecord = {
      id: date,
      date,
      weight: parseFloat(weight),
      sleepHours: parseFloat(sleepHours),
      sleepQuality: parseInt(sleepQuality),
      dietExecution: parseFloat(dietExecution),
      water: parseFloat(water),
      exercise: exerciseType ? {
        type: exerciseType,
        duration: exerciseDuration ? parseInt(exerciseDuration) : undefined,
      } : undefined,
      note: note || undefined,
    };

    recordsStorage.save(record);
    setMessage({ type: 'success', text: '记录保存成功！' });

    // 清空表单，但保留日期
    setWeight('');
    setSleepHours('');
    setSleepQuality('');
    setDietExecution('');
    setWater('');
    setExerciseType('');
    setExerciseDuration('');
    setNote('');

    // 3秒后隐藏消息
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">今日记录</h1>
          <p className="text-gray-600 mt-1">记录你的减脂和睡眠数据</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 日期 */}
            <Input
              label="日期"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            {/* 体重 */}
            <Input
              label="体重 (kg)"
              type="number"
              step="0.1"
              placeholder="例如：75.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              error={errors.weight}
              required
            />

            {/* 睡眠时长 */}
            <Input
              label="睡眠时长（小时）"
              type="number"
              step="0.5"
              placeholder="例如：7.5"
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
              error={errors.sleepHours}
              required
            />

            {/* 睡眠质量 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                睡眠质量
              </label>
              <div className="grid grid-cols-5 gap-2">
                {qualityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSleepQuality(option.value.toString())}
                    className={`
                      px-3 py-2 rounded-lg text-center text-sm transition-all
                      ${sleepQuality === option.value.toString()
                        ? 'bg-blue-500 text-white ring-2 ring-blue-500 ring-offset-2'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {errors.sleepQuality && (
                <p className="text-sm text-red-500 mt-1">{errors.sleepQuality}</p>
              )}
            </div>

            {/* 饮食执行率 */}
            <Input
              label="饮食执行率 (%)"
              type="number"
              step="1"
              min="0"
              max="100"
              placeholder="例如：90"
              value={dietExecution}
              onChange={(e) => setDietExecution(e.target.value)}
              error={errors.dietExecution}
              required
            />

            {/* 饮水量 */}
            <Input
              label="饮水量 (ml)"
              type="number"
              step="100"
              placeholder="例如：2000"
              value={water}
              onChange={(e) => setWater(e.target.value)}
              error={errors.water}
              required
            />

            {/* 运动记录 */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="运动类型（选填）"
                placeholder="例如：跑步、游泳"
                value={exerciseType}
                onChange={(e) => setExerciseType(e.target.value)}
              />
              <Input
                label="运动时长（分钟）"
                type="number"
                placeholder="例如：30"
                value={exerciseDuration}
                onChange={(e) => setExerciseDuration(e.target.value)}
              />
            </div>

            {/* 注记 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                今日总结（选填）
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="例如：今天状态很好，继续保持..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 提交按钮 */}
            <Button type="submit" className="w-full" size="lg">
              保存记录
            </Button>

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