import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '缺少 Supabase 环境变量。请确保 .env.local 中包含:\n' +
    '  NEXT_PUBLIC_SUPABASE_URL\n' +
    '  NEXT_PUBLIC_SUPABASE_ANON_KEY\n' +
    '参考 .env.example 文件配置。'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);