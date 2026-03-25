import { Router, type Request, type Response } from 'express';
import { getSupabaseClient } from '../storage/database/supabase-client';
import { insertWishPlaceSchema, updateWishPlaceSchema } from '../storage/database/shared/schema';
import { validateUUID, getIdString } from '../utils/validation';

const router = Router();

/**
 * 获取心愿清单列表
 * GET /api/v1/wish-places
 * Query: isVisited?: boolean
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const client = getSupabaseClient();
    const { isVisited } = req.query;
    
    let query = client
      .from('wish_places')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (isVisited !== undefined) {
      query = query.eq('is_visited', isVisited === 'true');
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching wish places:', error);
      return res.status(500).json({ error: 'Failed to fetch wish places' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 创建心愿
 * POST /api/v1/wish-places
 * Body: name: string, distance?: string, sceneryFeatures?: string, notes?: string
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    // 使用 Zod Schema 进行参数校验
    const validation = insertWishPlaceSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.error.issues 
      });
    }
    
    const { name, distance, sceneryFeatures, notes } = validation.data;
    const client = getSupabaseClient();
    
    const { data, error } = await client
      .from('wish_places')
      .insert({
        name,
        distance: distance || null,
        scenery_features: sceneryFeatures || null,
        notes: notes || null,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating wish place:', error);
      return res.status(500).json({ error: 'Failed to create wish place' });
    }
    
    res.status(201).json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 更新心愿
 * PUT /api/v1/wish-places/:id
 * Body: name?: string, distance?: string, sceneryFeatures?: string, notes?: string
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    // UUID 校验
    const idValidation = validateUUID(req.params.id);
    if (!idValidation.success) {
      return res.status(400).json({ error: idValidation.error });
    }
    
    // 使用 Zod Schema 进行参数校验
    const validation = updateWishPlaceSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.error.issues 
      });
    }
    
    const client = getSupabaseClient();
    const id = getIdString(req.params.id);
    
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    const { name, distance, sceneryFeatures, notes, isVisited } = validation.data;
    
    if (name !== undefined) updateData.name = name;
    if (distance !== undefined) updateData.distance = distance;
    if (sceneryFeatures !== undefined) updateData.scenery_features = sceneryFeatures;
    if (notes !== undefined) updateData.notes = notes;
    if (isVisited !== undefined) updateData.is_visited = isVisited;
    
    const { data, error } = await client
      .from('wish_places')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating wish place:', error);
      return res.status(500).json({ error: 'Failed to update wish place' });
    }
    
    if (!data) {
      return res.status(404).json({ error: 'Wish place not found' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 删除心愿
 * DELETE /api/v1/wish-places/:id
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
      .from('wish_places')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting wish place:', error);
      return res.status(500).json({ error: 'Failed to delete wish place' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
