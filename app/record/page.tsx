'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabaseClient';

export default function RecordPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState('');
  const [morningWeight, setMorningWeight] = useState('');
  const [eveningWeight, setEveningWeight] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [sleepQuality, setSleepQuality] = useState('');
  const [dietExecution, setDietExecution] = useState('');
  const [water, setWater] = useState('');
  const [exerciseType, setExerciseType] = useState('');
  const [exerciseDuration, setExerciseDuration] = useState('');
  const [note, setNote] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'jin'>('kg');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const qualityOptions = [
    { value: 1, label: '很差', emoji: '😫', color: 'from-red-300 to-red-400' },
    { value: 2, label: '较差', emoji: '😕', color: 'from-orange-300 to-orange-400' },
    { value: 3, label: '一般', emoji: '😐', color: 'from-yellow-300 to-yellow-400' },
    { value: 4, label: '较好', emoji: '😊', color: 'from-lime-300 to-lime-400' },
    { value: 5, label: '很好', emoji: '😴', color: 'from-green-300 to-green-400' },
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!morningWeight && !eveningWeight) {
      newErrors.weight = '请至少填写早晨体重或晚上体重';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('开始保存');

    if (!validate()) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        setMessage({ type: 'error', text: `获取用户信息失败: ${userError.message}` });
        setLoading(false);
        return;
      }

      if (!user) {
        setMessage({ type: 'error', text: '请先登录后再记录数据' });
        setLoading(false);
        return;
      }

      const recordData = {
        user_id: user.id,
        record_date: date,
        weight: (morningWeight || eveningWeight)
          ? (weightUnit === 'jin' ? parseFloat(morningWeight || eveningWeight) * 0.5 : parseFloat(morningWeight || eveningWeight))
          : null,
        morning_weight: morningWeight ? (weightUnit === 'jin' ? parseFloat(morningWeight) * 0.5 : parseFloat(morningWeight)) : null,
        evening_weight: eveningWeight ? (weightUnit === 'jin' ? parseFloat(eveningWeight) * 0.5 : parseFloat(eveningWeight)) : null,
        sleep_hours: parseFloat(sleepHours),
        sleep_quality: parseInt(sleepQuality),
        diet_execution: parseFloat(dietExecution),
        water: parseFloat(water),
        exercise_type: exerciseType || null,
        exercise_duration: exerciseDuration ? parseInt(exerciseDuration) : null,
        note: note || null,
      };

      const { data, error } = await supabase
        .from('daily_records')
        .upsert(recordData, {
          onConflict: 'user_id,record_date',
          ignoreDuplicates: false,
        })
        .select()
        .single();

      if (error) {
        setMessage({ type: 'error', text: `保存失败: ${error.message}` });
        return;
      }

      setMessage({ type: 'success', text: '记录保存成功！' });

      setWeight('');
      setMorningWeight('');
      setEveningWeight('');
      setSleepHours('');
      setSleepQuality('');
      setDietExecution('');
      setWater('');
      setExerciseType('');
      setExerciseDuration('');
      setNote('');

      setTimeout(() => setMessage(null), 3000);

    } catch (err: any) {
      setMessage({ type: 'error', text: `错误: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

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
              <span className="text-gradient">今日记录</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">记录你的减脂和睡眠数据</p>
          </div>
          <Link href="/">
            <Button variant="ghost">返回首页</Button>
          </Link>
        </div>

        <Card className="glass border-0 shadow-soft-lg animate-scale-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="日期"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">体重单位</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setWeightUnit('kg')}
                    className={`px-3 py-1 text-xs rounded-lg transition-all ${
                      weightUnit === 'kg' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    kg
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeightUnit('jin')}
                    className={`px-3 py-1 text-xs rounded-lg transition-all ${
                      weightUnit === 'jin' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    斤
                  </button>
                </div>
              </div>
            </div>

            <Input
              label="早晨体重"
              type="number"
              step="0.1"
              placeholder={`例如：${weightUnit === 'kg' ? '75.5' : '151'}`}
              value={morningWeight}
              onChange={(e) => setMorningWeight(e.target.value)}
              hint={`保存时自动转换为 kg`}
            />

            <Input
              label="晚上体重"
              type="number"
              step="0.1"
              placeholder={`例如：${weightUnit === 'kg' ? '74.8' : '149.6'}`}
              value={eveningWeight}
              onChange={(e) => setEveningWeight(e.target.value)}
              hint={`保存时自动转换为 kg`}
            />

            {errors.weight && (
              <p className="text-sm text-red-500 mt-1">{errors.weight}</p>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
              {weightUnit === 'kg' ? '1 斤 = 0.5 kg' : '保存时自动转换为 kg'}
            </p>

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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                睡眠质量
              </label>
              <div className="grid grid-cols-5 gap-3">
                {qualityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSleepQuality(option.value.toString())}
                    className={`
                      relative overflow-hidden rounded-2xl p-3 text-center transition-all duration-200
                      ${sleepQuality === option.value.toString()
                        ? `bg-gradient-to-br ${option.color} text-white shadow-lg scale-105`
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <span className="text-2xl block mb-1">{option.emoji}</span>
                    <span className="text-xs font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
              {errors.sleepQuality && (
                <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.sleepQuality}
                </p>
              )}
            </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                今日总结（选填）
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="例如：今天状态很好，继续保持..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none input-focus resize-none transition-all"
              />
            </div>

            <Button type="submit" className="w-full btn-hover shadow-soft" loading={loading}>
              {loading ? '保存中...' : '保存记录'}
            </Button>

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