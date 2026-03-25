/**
 * 通用校验工具
 * 用于路由层的参数校验
 */

import { z } from 'zod';

// UUID 校验 Schema
export const uuidSchema = z.string().uuid();

/**
 * 校验 UUID 格式
 * @param id 要校验的 ID 字符串
 * @returns 校验结果
 */
export function validateUUID(id: string | string[]): { success: boolean; error?: string } {
  const idStr = Array.isArray(id) ? id[0] : id;
  const result = uuidSchema.safeParse(idStr);
  if (!result.success) {
    return { success: false, error: 'Invalid ID format. Must be a valid UUID.' };
  }
  return { success: true };
}

/**
 * 获取字符串形式的 ID（处理 string | string[] 类型）
 */
export function getIdString(id: string | string[]): string {
  return Array.isArray(id) ? id[0] : id;
}

/**
 * 创建带 ID 校验的路由处理器包装函数
 * 用于包装需要校验 :id 参数的路由
 */
export function withIdValidation<T>(
  handler: (req: T, id: string) => Promise<void>
) {
  return async (req: T & { params: { id: string } }, res: any) => {
    const validation = validateUUID(req.params.id);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error });
    }
    return handler(req, req.params.id);
  };
}
