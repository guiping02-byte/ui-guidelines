import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "红色母婴 UI 设计系统看板",
  description: "可实时修改品牌、价格、促销、会员与关怀色号的母婴小程序 UI 设计系统看板。",
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
