import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";

/* Outfit - 现代圆润，适合标题 */
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

/* Inter - 清晰易读，适合正文 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LeanSleep Tracker - 减脂睡眠记录仪",
  description: "追踪你的减脂进度和睡眠质量，实现健康目标",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${outfit.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}