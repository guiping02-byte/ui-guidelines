import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "蓝色设计系统看板",
  description: "可实时调整品牌色号的小程序 UI 设计系统预览板。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
