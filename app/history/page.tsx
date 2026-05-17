'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabaseClient';

export default function HistoryPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
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

      // 2. 读取当前用户的记录，按日期倒序排列，限制最近 30 条
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

  // 删除记录
  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这条记录吗？')) {
      const { error } = await supabase
        .from('daily_records')
        .delete()
        .eq('id', id);

      if (error) {
        alert(`删除失败: ${error.message}`);
      } else {
        // 重新加载记录
        loadRecords();
      }
    }
  };

  // 导出数据
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">历史记录</h1>
            <p className="text-gray-600 mt-1">共 {records.length} 条记录</p>
          </div>
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="outline">返回首页</Button>
            </Link>
            {records.length > 0 && (
              <Button onClick={handleExport}>导出数据</Button>
            )}
          </div>
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
              <p className="text-gray-500 mb-4">暂无记录</p>
              <Link href="/record">
                <Button>开始记录</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <Card key={record.id}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-semibold text-gray-900">{formatDate(record.record_date)}</h3>
                      <span className="text-sm text-gray-500">{record.note}</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">体重</p>
                        <p className="font-medium text-gray-900">{record.weight} kg</p>
                      </div>
                      <div>
                        <p className="text-gray-500">睡眠</p>
                        <p className="font-medium text-gray-900">{record.sleep_hours} 小时</p>
                      </div>
                      <div>
                        <p className="text-gray-500">执行率</p>
                        <p className="font-medium text-gray-900">{record.diet_execution}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">饮水</p>
                        <p className="font-medium text-gray-900">{record.water} ml</p>
                      </div>
                    </div>

                    {record.exercise_type && (
                      <div className="mt-3 text-sm">
                        <span className="text-gray-500">运动：</span>
                        <span className="text-gray-900">
                          {record.exercise_type}
                          {record.exercise_duration && ` (${record.exercise_duration}分钟)`}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(record.id)}
                    className="ml-4 text-red-500 hover:text-red-700 text-sm"
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