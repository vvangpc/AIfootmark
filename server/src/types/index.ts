/**
 * 共享类型定义
 * 
 * 设计原则：
 * 1. 数据库核心类型（WishPlace, Footprint 等）直接从 schema.ts 重导出
 *    避免双重数据源，确保类型与数据库 Schema 保持一致
 * 2. 这里只保留 Drizzle 不负责的、额外的业务类型
 */

// ========== 数据库核心类型（自动推导）==========
// 直接复用 Drizzle/Zod 推导的类型，遵循 DRY 原则
export type { 
  WishPlace, 
  InsertWishPlace, 
  UpdateWishPlace,
  Footprint, 
  InsertFootprint, 
  UpdateFootprint,
} from '../storage/database/shared/schema';

// ========== 统计类型 ==========

export interface Stats {
  totalWishes: number;
  visitedWishes: number;
  unvisitedWishes: number;
  totalFootprints: number;
}

export interface TimeStats {
  week: number;
  month: number;
  year: number;
  monthlyStats: Array<{
    month: string;
    count: number;
  }>;
}

// ========== 导入导出类型 ==========

export interface ExportData {
  version: string;
  exportTime: string;
  data: {
    wishPlaces: import('../storage/database/shared/schema').WishPlace[];
    footprints: import('../storage/database/shared/schema').Footprint[];
  };
}

export interface ImportResult {
  success: boolean;
  imported: {
    wishPlaces: number;
    footprints: number;
  };
  errors?: string[];
}

// ========== API 响应类型 ==========

export interface ApiError {
  error: string;
  details?: Array<{
    code: string;
    message: string;
    path?: (string | number)[];
  }>;
}
