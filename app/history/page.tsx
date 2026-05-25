'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabaseClient';
import { formatWeight } from '@/lib/calculations';

export default function HistoryPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'jin'>('kg');

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
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

      const { data: settings } = await supabase
        .from('user_settings')
        .select('weight_unit')
        .eq('user_id', user.id)
        .single();

      if (settings?.weight_unit) {
        setWeightUnit(settings.weight_unit as 'kg' | 'jin');
      }

      const { data, error } = await supabase
        .from('daily_records')
        .select('*')
        .eq('user_id', user.id)
        .order('record_date', { ascending: false })
        .limit(30);

      if (error) {
        console.error('读取记录失败:', error);
      } else {
        setRecords(data || []);
      }

    } catch (err) {
      console.error('加载记录错误:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条记录吗？')) {
      return;
    }

    const { error } = await supabase
      .from('daily_records')
      .delete()
      .eq('id', id);

    if (error) {
      alert(`删除失败: ${error.message}`);
    } else {
      loadRecords();
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(records, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lean-sleep-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  };

  const getQualityEmoji = (quality: number) => {
    const emojis = ['😫', '😕', '😐', '😊', '😴'];
    return emojis[quality - 1] || '😐';
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* 背景装饰 */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-gradient-to-br from-orange-200/30 to-red-200/30 rounded-full blur-3xl animate-gradient" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-gradient-to-br from-teal-200/30 to-green-200/30 rounded-full blur-3xl animate-gradient" style={{ animationDelay: '4s' }} />
      </div>

      <div className="max-w-3xl mx-auto">
        {/* 头部 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight">
              <span className="text-gradient">历史记录</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">共 {records.length} 条记录</p>
          </div>
          <div className="flex gap-3">
            <Link href="/">
              <Button variant="ghost">返回首页</Button>
            </Link>
            {records.length > 0 && (
              <Button onClick={handleExport} variant="secondary">导出数据</Button>
            )}
          </div>
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
              <p className="text-gray-600 dark:text-gray-400 mb-4">暂无记录</p>
              <Link href="/record">
                <Button className="btn-hover">开始记录</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {records.map((record, index) => (
              <Card
                key={record.id}
                className="glass border-0 shadow-soft card-hover animate-scale-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center text-white font-bold shadow-soft">
                        {getQualityEmoji(record.sleep_quality)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 font-display">
                          {formatDate(record.record_date)}
                        </h3>
                        {record.note && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">"{record.note}"</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                      <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">早晨体重</p>
                        <p className="text-lg font-bold text-orange-500">
                          {record.morning_weight ? formatWeight(record.morning_weight, weightUnit) : '-'} 
                          <span className="text-sm text-gray-500">{weightUnit === 'kg' ? 'kg' : '斤'}</span>
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-2xl p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">晚上体重</p>
                        <p className="text-lg font-bold text-amber-500">
                          {record.evening_weight ? formatWeight(record.evening_weight, weightUnit) : '-'} 
                          <span className="text-sm text-gray-500">{weightUnit === 'kg' ? 'kg' : '斤'}</span>
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-teal-50 to-green-50 dark:from-teal-900/20 dark:to-green-900/20 rounded-2xl p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">睡眠</p>
                        <p className="text-lg font-bold text-teal-500">{record.sleep_hours} <span className="text-sm text-gray-500">h</span></p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">执行率</p>
                        <p className="text-lg font-bold text-purple-500">{record.diet_execution}<span className="text-sm text-gray-500">%</span></p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">饮水</p>
                        <p className="text-lg font-bold text-blue-500">{record.water}<span className="text-sm text-gray-500">ml</span></p>
                      </div>
                    </div>

                    {record.exercise_type && (
                      <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="text-lg">🏃</span>
                        <span className="font-medium">{record.exercise_type}</span>
                        {record.exercise_duration && (
                          <span className="text-gray-500">· {record.exercise_duration} 分钟</span>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(record.id)}
                    className="flex-shrink-0 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium"
                  >
                    删除
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}