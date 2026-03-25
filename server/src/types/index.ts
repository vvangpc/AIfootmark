/**
 * 共享类型定义
 * 前后端共用的数据类型，确保类型安全
 */

// ========== 心愿清单类型 ==========

export interface WishPlace {
  id: string;
  name: string;
  distance: string | null;
  scenery_features: string | null;
  notes: string | null;
  is_visited: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface InsertWishPlace {
  name: string;
  distance?: string | null;
  sceneryFeatures?: string | null;
  notes?: string | null;
}

export interface UpdateWishPlace {
  name?: string;
  distance?: string | null;
  sceneryFeatures?: string | null;
  notes?: string | null;
  isVisited?: boolean;
}

// ========== 足迹记录类型 ==========

export interface Footprint {
  id: string;
  name: string;
  distance: string | null;
  scenery_features: string | null;
  notes: string | null;
  visited_at: string;
  wish_place_id: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface InsertFootprint {
  name: string;
  distance?: string | null;
  sceneryFeatures?: string | null;
  notes?: string | null;
  visitedAt?: string;
  wishPlaceId?: string | null;
}

export interface UpdateFootprint {
  name?: string;
  distance?: string | null;
  sceneryFeatures?: string | null;
  notes?: string | null;
  visitedAt?: string;
}

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
    wishPlaces: WishPlace[];
    footprints: Footprint[];
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
    path?: string[];
  }>;
}
