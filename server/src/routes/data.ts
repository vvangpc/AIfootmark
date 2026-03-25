import { Router, type Request, type Response } from 'express';
import { getSupabaseClient } from '../storage/database/supabase-client';
import { z } from 'zod';

const router = Router();

// 导入数据校验 Schema
const importDataSchema = z.object({
  wishPlaces: z.array(z.object({
    name: z.string(),
    distance: z.string().optional().nullable(),
    scenery_features: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    is_visited: z.boolean().optional().nullable(),
  })).optional(),
  footprints: z.array(z.object({
    name: z.string(),
    distance: z.string().optional().nullable(),
    scenery_features: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    visited_at: z.string().optional().nullable(),
  })).optional(),
});

/**
 * 导出所有数据
 * GET /api/v1/export
 */
router.get('/export', async (req: Request, res: Response) => {
  try {
    const client = getSupabaseClient();
    
    // 并行获取所有数据
    const [
      { data: wishPlaces, error: wishError },
      { data: footprints, error: footprintError },
    ] = await Promise.all([
      client.from('wish_places').select('*'),
      client.from('footprints').select('*'),
    ]);
    
    if (wishError || footprintError) {
      console.error('Error exporting data:', { wishError, footprintError });
      return res.status(500).json({ error: 'Failed to export data' });
    }
    
    const exportData = {
      version: '1.0',
      exportTime: new Date().toISOString(),
      data: {
        wishPlaces,
        footprints,
      },
    };
    
    res.json(exportData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 导入数据
 * POST /api/v1/import
 * Body: { wishPlaces?: [], footprints?: [] }
 */
router.post('/import', async (req: Request, res: Response) => {
  try {
    // 使用 Zod Schema 进行参数校验
    const validation = importDataSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.error.issues 
      });
    }
    
    const client = getSupabaseClient();
    const { wishPlaces, footprints } = validation.data;
    
    let importedWishes = 0;
    let importedFootprints = 0;
    const errors: string[] = [];
    
    // 批量导入心愿（使用批量插入提高性能）
    if (wishPlaces && wishPlaces.length > 0) {
      const wishData = wishPlaces.map(wish => ({
        name: wish.name,
        distance: wish.distance || null,
        scenery_features: wish.scenery_features || null,
        notes: wish.notes || null,
        is_visited: wish.is_visited || false,
      }));
      
      const { error: wishError } = await client
        .from('wish_places')
        .insert(wishData);
      
      if (wishError) {
        console.error('Error importing wishes:', wishError);
        errors.push(`Failed to import wishes: ${wishError.message}`);
      } else {
        importedWishes = wishPlaces.length;
      }
    }
    
    // 批量导入足迹
    if (footprints && footprints.length > 0) {
      const footprintData = footprints.map(fp => ({
        name: fp.name,
        distance: fp.distance || null,
        scenery_features: fp.scenery_features || null,
        notes: fp.notes || null,
        visited_at: fp.visited_at || new Date().toISOString(),
      }));
      
      const { error: footprintError } = await client
        .from('footprints')
        .insert(footprintData);
      
      if (footprintError) {
        console.error('Error importing footprints:', footprintError);
        errors.push(`Failed to import footprints: ${footprintError.message}`);
      } else {
        importedFootprints = footprints.length;
      }
    }
    
    res.json({
      success: errors.length === 0,
      imported: {
        wishPlaces: importedWishes,
        footprints: importedFootprints,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 清空所有数据
 * DELETE /api/v1/data
 */
router.delete('/data', async (req: Request, res: Response) => {
  try {
    const client = getSupabaseClient();
    
    // 并行删除所有数据
    const [
      { error: footprintError },
      { error: wishError },
    ] = await Promise.all([
      client.from('footprints').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      client.from('wish_places').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
    ]);
    
    if (footprintError || wishError) {
      console.error('Error clearing data:', { footprintError, wishError });
      return res.status(500).json({ error: 'Failed to clear data' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
