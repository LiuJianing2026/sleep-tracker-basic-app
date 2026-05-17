'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabaseClient';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 获取当前用户
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    // 监听登录状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">LeanSleep Tracker</h1>
          <p className="text-gray-600">减脂睡眠记录仪</p>
        </div>

        {/* 用户信息区域 */}
        <div className="mb-4">
          {loading ? (
            <Card className="bg-gray-100">
              <p className="text-center text-gray-500 py-3">加载中...</p>
            </Card>
          ) : user ? (
            <Card>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">当前用户</p>
                    <p className="font-medium text-gray-900">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  退出
                </button>
              </div>
            </Card>
          ) : (
            <Link href="/login">
              <Button className="w-full">
                登录 / 注册
              </Button>
            </Link>
          )}
        </div>

        <Card>
          <div className="space-y-3">
            <Link href="/dashboard" className="block">
              <Button className="w-full" size="lg">
                📊 查看看板
              </Button>
            </Link>
            <Link href="/record" className="block">
              <Button variant="secondary" className="w-full" size="lg">
                ✏️ 今日记录
              </Button>
            </Link>
            <Link href="/history" className="block">
              <Button variant="outline" className="w-full" size="lg">
                📅 历史记录
              </Button>
            </Link>
            <Link href="/stats" className="block">
              <Button variant="outline" className="w-full" size="lg">
                🎴 数据卡片
              </Button>
            </Link>
            <Link href="/settings" className="block">
              <Button variant="outline" className="w-full" size="lg">
                ⚙️ 目标设置
              </Button>
            </Link>
          </div>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>数据保存在 {user ? 'Supabase 云端' : '本地浏览器'}中</p>
        </div>
      </div>
    </div>
  );
}