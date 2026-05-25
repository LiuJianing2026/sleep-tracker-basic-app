'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function TestPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [authInfo, setAuthInfo] = useState<any>(null);
  const [recordsCount, setRecordsCount] = useState<number | null>(null);

  useEffect(() => {
    runTest();
  }, []);

  const runTest = async () => {
    try {
      setStatus('loading');
      setMessage('正在连接 Supabase...');

      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!url || !key) {
        setStatus('error');
        setMessage('环境变量未正确配置，请检查 .env.local 文件');
        return;
      }

      setMessage('环境变量已加载，正在测试连接...');

      if (!supabase) {
        setStatus('error');
        setMessage('Supabase 客户端初始化失败');
        return;
      }

      setMessage('客户端已初始化，正在查询表...');

      const { count, error } = await supabase
        .from('daily_records')
        .select('*', { count: 'exact', head: true });

      if (error) {
        setStatus('error');
        setMessage(`查询失败: ${error.message}`);
        return;
      }

      setRecordsCount(count);

      const { data: { user } } = await supabase.auth.getUser();
      setAuthInfo(user);

      setStatus('success');
      setMessage('连接成功！');

    } catch (err: any) {
      setStatus('error');
      setMessage(`错误: ${err.message}`);
    }
  };

  const StatusBadge = () => {
    const styles = {
      loading: 'bg-yellow-100 text-yellow-800',
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {status === 'loading' ? '测试中' : status === 'success' ? '成功' : '失败'}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Supabase 连接测试</h1>
          <p className="text-gray-600 mt-1">测试 Next.js 与 Supabase 的连接状态</p>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">连接状态</h2>
              <StatusBadge />
            </div>
            <p className="text-gray-700">{message}</p>
          </div>

          {status === 'success' && (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">测试详情</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">环境变量 URL</span>
                    <span className="text-green-600">已加载</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">环境变量 Anon Key</span>
                    <span className="text-green-600">已加载</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">客户端初始化</span>
                    <span className="text-green-600">成功</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">daily_records 表</span>
                    <span className="text-green-600">可访问</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">记录数量</span>
                    <span className="font-medium">{recordsCount ?? 0} 条</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">登录状态</h2>
                {authInfo ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">用户 ID</span>
                      <span className="font-mono text-xs">{authInfo.id}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">邮箱</span>
                      <span>{authInfo.email}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">当前未登录（这是正常的，因为还没有实现登录功能）</p>
                )}
              </div>
            </>
          )}

          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">可能的原因：</h3>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                <li>.env.local 文件不存在或配置错误</li>
                <li>Supabase 项目 URL 或 Anon Key 不正确</li>
                <li>Supabase 表未创建或 SQL 未执行</li>
                <li>网络连接问题</li>
              </ul>
            </div>
          )}

          <button
            onClick={runTest}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            重新测试
          </button>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-blue-500 hover:underline">返回首页</a>
        </div>
      </div>
    </div>
  );
}