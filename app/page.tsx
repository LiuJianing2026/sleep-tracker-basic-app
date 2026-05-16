import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">LeanSleep Tracker</h1>
          <p className="text-gray-600">减脂睡眠记录仪</p>
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
          <p>数据保存在本地浏览器中</p>
        </div>
      </div>
    </div>
  );
}