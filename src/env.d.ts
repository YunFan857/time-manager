declare namespace NodeJS {
  interface ProcessEnv {
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    NEXT_PUBLIC_SITE_URL: string;
  }
}

// Cloudflare D1 类型
declare global {
  interface D1Database {
    prepare(query: string): D1PreparedStatement;
  }

  interface D1PreparedStatement {
    bind(...values: unknown[]): D1PreparedStatement;
    first<T = unknown>(colName?: string): Promise<T | null>;
    run(): Promise<D1Result>;
    all<T = unknown>(): Promise<D1Result<T>>;
  }

  interface D1Result<T = unknown> {
    results: T[];
    success: boolean;
    meta: {
      changes: number;
      last_row_id: number;
      rows_read: number;
      rows_written: number;
    };
  }
}

export {};