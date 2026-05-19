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
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navItems = [
    { href: '/dashboard', icon: '📊', label: '查看看板', variant: 'primary' as const },
    { href: '/record', icon: '✏️', label: '今日记录', variant: 'secondary' as const },
    { href: '/history', icon: '📅', label: '历史记录', variant: 'outline' as const },
    { href: '/stats', icon: '🎴', label: '数据卡片', variant: 'outline' as const },
    { href: '/settings', icon: '⚙️', label: '目标设置', variant: 'outline' as const },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      {/* 背景装饰 */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-gradient-to-br from-orange-200/30 to-red-200/30 rounded-full blur-3xl animate-gradient" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-gradient-to-br from-teal-200/30 to-green-200/30 rounded-full blur-3xl animate-gradient" style={{ animationDelay: '4s' }} />
      </div>

      <div className="w-full max-w-md animate-fade-in-up">
        {/* 标题区域 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 font-display tracking-tight">
            <span className="text-gradient">LeanSleep</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            减脂 · 睡眠 · 进步
          </p>
        </div>

        {/* 用户信息卡片 */}
        <div className="mb-6 animate-scale-in" style={{ animationDelay: '0.1s' }}>
          {loading ? (
            <Card className="glass border-0">
              <div className="flex items-center justify-center py-4">
                <div className="animate-pulse-soft text-gray-500">加载中...</div>
              </div>
            </Card>
          ) : user ? (
            <Card className="glass border-0">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center text-white font-bold text-lg shadow-soft">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">欢迎回来</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm font-medium transition-all hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  退出
                </button>
              </div>
            </Card>
          ) : (
            <Link href="/login">
              <Button className="w-full btn-hover shadow-soft-lg">
                登录 / 注册
              </Button>
            </Link>
          )}
        </div>

        {/* 导航卡片 */}
        <Card className="glass border-0 p-4 shadow-soft-lg animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <div className="space-y-3">
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className="block animate-fade-in"
                style={{ animationDelay: `${0.3 + index * 0.08}s` }}
              >
                <Button
                  variant={item.variant}
                  className="w-full btn-hover"
                  size="lg"
                >
                  <span className="mr-3 text-xl">{item.icon}</span>
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </Card>

        {/* 底部信息 */}
        <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            数据保存在 <span className="text-primary font-medium">{user ? 'Supabase 云端' : '本地浏览器'}</span> 中
          </p>
        </div>
      </div>
    </div>
  );
}