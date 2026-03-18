import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "时间管理 - 让行程连贯有意义",
  description: "极简时间管理工具，帮助用户规划每日行程",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}