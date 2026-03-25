import { Router, type Request, type Response } from 'express';
import { getSupabaseClient } from '../storage/database/supabase-client';
import { insertFootprintSchema, updateFootprintSchema } from '../storage/database/shared/schema';
import { validateUUID, getIdString } from '../utils/validation';
import { z } from 'zod';

const router = Router();

// 打卡请求校验
const checkInSchema = z.object({
  visitedAt: z.string().datetime({ offset: true }).optional(),
});

/**
 * 获取足迹记录列表
 * GET /api/v1/footprints
 * Query: startDate?: string, endDate?: string (ISO date string)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const client = getSupabaseClient();
    const { startDate, endDate } = req.query;
    
    let query = client
      .from('footprints')
      .select('*')
      .order('visited_at', { ascending: false });
    
    // 按时间范围过滤
    if (startDate) {
      query = query.gte('visited_at', startDate as string);
    }
    if (endDate) {
      query = query.lte('visited_at', endDate as string);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching footprints:', error);
      return res.status(500).json({ error: 'Failed to fetch footprints' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 创建足迹记录
 * POST /api/v1/footprints
 * Body: name: string, distance?: string, sceneryFeatures?: string, notes?: string, visitedAt?: string
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    // 使用 Zod Schema 进行参数校验
    const validation = insertFootprintSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.error.issues 
      });
    }
    
    const { name, distance, sceneryFeatures, notes, visitedAt, wishPlaceId } = validation.data;
    const client = getSupabaseClient();
    
    const { data, error } = await client
      .from('footprints')
      .insert({
        name,
        distance: distance || null,
        scenery_features: sceneryFeatures || null,
        notes: notes || null,
        visited_at: visitedAt || new Date().toISOString(),
        wish_place_id: wishPlaceId || null,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating footprint:', error);
      return res.status(500).json({ error: 'Failed to create footprint' });
    }
    
    res.status(201).json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 更新足迹记录
 * PUT /api/v1/footprints/:id
 * Body: name?: string, distance?: string, sceneryFeatures?: string, notes?: string, visitedAt?: string
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    // UUID 校验
    const idValidation = validateUUID(req.params.id);
    if (!idValidation.success) {
      return res.status(400).json({ error: idValidation.error });
    }
    
    // 使用 Zod Schema 进行参数校验
    const validation = updateFootprintSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.error.issues 
      });
    }
    
    const client = getSupabaseClient();
    const id = getIdString(req.params.id);
    
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    const { name, distance, sceneryFeatures, notes, visitedAt } = validation.data;
    
    if (name !== undefined) updateData.name = name;
    if (distance !== undefined) updateData.distance = distance;
    if (sceneryFeatures !== undefined) updateData.scenery_features = sceneryFeatures;
    if (notes !== undefined) updateData.notes = notes;
    if (visitedAt !== undefined) updateData.visited_at = visitedAt;
    
    const { data, error } = await client
      .from('footprints')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating footprint:', error);
      return res.status(500).json({ error: 'Failed to update footprint' });
    }
    
    if (!data) {
      return res.status(404).json({ error: 'Footprint not found' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 删除足迹记录
 * DELETE /api/v1/footprints/:id
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    // UUID 校验
    const idValidation = validateUUID(req.params.id);
    if (!idValidation.success) {
      return res.status(400).json({ error: idValidation.error });
    }
    
    const client = getSupabaseClient();
    const id = getIdString(req.params.id);
    
    const { error } = await client
      .from('footprints')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting footprint:', error);
      return res.status(500).json({ error: 'Failed to delete footprint' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 打卡心愿（将心愿转化为足迹）
 * POST /api/v1/footprints/check-in/:wishId
 * Body: visitedAt?: string (ISO date string)
 * 
 * 事务保证：
 * - 优先使用 Supabase RPC 函数 'check_in_wish' 实现原子操作
 * - 如果 RPC 函数不存在，回退到手动事务（带回滚）
 */
router.post('/check-in/:wishId', async (req: Request, res: Response) => {
  try {
    // UUID 校验
    const idValidation = validateUUID(req.params.wishId);
    if (!idValidation.success) {
      return res.status(400).json({ error: idValidation.error });
    }
    
    // 请求体校验
    const validation = checkInSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.error.issues 
      });
    }
    
    const client = getSupabaseClient();
    const wishId = getIdString(req.params.wishId);
    const { visitedAt } = validation.data;
    
    // 尝试使用 RPC 函数（推荐方式，需要先在 Supabase 中创建）
    // 参见：server/migrations/001_check_in_wish_rpc.sql
    const { data: rpcResult, error: rpcError } = await client.rpc('check_in_wish', {
      p_wish_id: wishId,
      p_visited_at: visitedAt || null,
    });
    
    // RPC 函数存在且调用成功
    if (!rpcError) {
      return res.status(201).json(rpcResult);
    }
    
    // RPC 函数不存在，回退到手动事务
    if (rpcError.code === 'PGRST202') {
      console.log('RPC function check_in_wish not found, falling back to manual transaction');
      return await manualCheckIn(res, client, wishId, visitedAt);
    }
    
    // RPC 函数存在但执行出错（业务错误）
    if (rpcError.message?.includes('not found')) {
      return res.status(404).json({ error: 'Wish place not found' });
    }
    if (rpcError.message?.includes('already checked in')) {
      return res.status(400).json({ error: 'Wish place already checked in' });
    }
    
    console.error('RPC check_in_wish error:', rpcError);
    return res.status(500).json({ error: 'Failed to check in wish place' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 手动打卡实现（带回滚）
 * 当 RPC 函数不可用时的回退方案
 */
async function manualCheckIn(
  res: Response,
  client: ReturnType<typeof getSupabaseClient>,
  wishId: string,
  visitedAt?: string
) {
  // 获取心愿详情
  const { data: wishPlace, error: fetchError } = await client
    .from('wish_places')
    .select('*')
    .eq('id', wishId)
    .single();
  
  if (fetchError || !wishPlace) {
    return res.status(404).json({ error: 'Wish place not found' });
  }
  
  // 检查是否已打卡
  if (wishPlace.is_visited) {
    return res.status(400).json({ error: 'Wish place already checked in' });
  }
  
  // 创建足迹记录
  const { data: footprint, error: createError } = await client
    .from('footprints')
    .insert({
      name: wishPlace.name,
      distance: wishPlace.distance,
      scenery_features: wishPlace.scenery_features,
      notes: wishPlace.notes,
      visited_at: visitedAt || new Date().toISOString(),
      wish_place_id: wishId,
    })
    .select()
    .single();
  
  if (createError) {
    console.error('Error creating footprint:', createError);
    return res.status(500).json({ error: 'Failed to create footprint' });
  }
  
  // 更新心愿状态为已打卡
  const { error: updateError } = await client
    .from('wish_places')
    .update({ 
      is_visited: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', wishId);
  
  if (updateError) {
    console.error('Error updating wish place:', updateError);
    // 回滚：删除刚创建的足迹
    await client.from('footprints').delete().eq('id', footprint.id);
    return res.status(500).json({ error: 'Failed to update wish place' });
  }
  
  res.status(201).json(footprint);
}

export default router;
