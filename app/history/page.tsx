'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { recordsStorage } from '@/lib/storage';
import { DailyRecord } from '@/types';

export default function HistoryPage() {
  const [records, setRecords] = useState<DailyRecord[]>([]);

  useEffect(() => {
    const loadedRecords = recordsStorage.getAll();
    setRecords(loadedRecords.reverse()); // 按日期倒序显示
  }, []);

  // 删除记录
  const handleDelete = (date: string) => {
    if (confirm('确定要删除这条记录吗？')) {
      recordsStorage.delete(date);
      const updatedRecords = recordsStorage.getAll().reverse();
      setRecords(updatedRecords);
    }
  };

  // 导出数据
  const handleExport = () => {
    const dataStr = JSON.stringify(records.reverse(), null, 2);
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

        {records.length === 0 ? (
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
              <Card key={record.date}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-semibold text-gray-900">{formatDate(record.date)}</h3>
                      <span className="text-sm text-gray-500">{record.note}</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">体重</p>
                        <p className="font-medium text-gray-900">{record.weight} kg</p>
                      </div>
                      <div>
                        <p className="text-gray-500">睡眠</p>
                        <p className="font-medium text-gray-900">{record.sleepHours} 小时</p>
                      </div>
                      <div>
                        <p className="text-gray-500">执行率</p>
                        <p className="font-medium text-gray-900">{record.dietExecution}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">饮水</p>
                        <p className="font-medium text-gray-900">{record.water} ml</p>
                      </div>
                    </div>

                    {record.exercise && (
                      <div className="mt-3 text-sm">
                        <span className="text-gray-500">运动：</span>
                        <span className="text-gray-900">
                          {record.exercise.type}
                          {record.exercise.duration && ` (${record.exercise.duration}分钟)`}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(record.date)}
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