/// <reference types="@cloudflare/next-on-pages" />

// 扩展 CloudflareEnv 接口
declare global {
  interface CloudflareEnv {
    DB: D1Database;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    NEXT_PUBLIC_SITE_URL: string;
  }
}

// 确保这个文件被视为模块
export {};