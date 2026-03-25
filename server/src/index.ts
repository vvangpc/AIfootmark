import express from "express";
import cors from "cors";
import { getSupabaseClient } from './storage/database/supabase-client';
import { z } from 'zod';

const app = express();
const port = process.env.PORT || 9091;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/api/v1/health', (req, res) => {
  console.log('Health check success');
  res.status(200).json({ status: 'ok' });
});

// ========== 心愿清单 API ==========

/**
 * 获取心愿清单列表
 * GET /api/v1/wish-places
 * Query: isVisited?: boolean
 */
app.get('/api/v1/wish-places', async (req, res) => {
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
app.post('/api/v1/wish-places', async (req, res) => {
  try {
    const client = getSupabaseClient();
    const { name, distance, sceneryFeatures, notes } = req.body;
    
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Name is required' });
    }
    
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
app.put('/api/v1/wish-places/:id', async (req, res) => {
  try {
    const client = getSupabaseClient();
    const { id } = req.params;
    const { name, distance, sceneryFeatures, notes } = req.body;
    
    const updateData: any = { updated_at: new Date().toISOString() };
    if (name !== undefined) updateData.name = name;
    if (distance !== undefined) updateData.distance = distance;
    if (sceneryFeatures !== undefined) updateData.scenery_features = sceneryFeatures;
    if (notes !== undefined) updateData.notes = notes;
    
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
app.delete('/api/v1/wish-places/:id', async (req, res) => {
  try {
    const client = getSupabaseClient();
    const { id } = req.params;
    
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

/**
 * 打卡心愿（将心愿转化为足迹）
 * POST /api/v1/wish-places/:id/check-in
 * Body: visitedAt?: string (ISO date string)
 */
app.post('/api/v1/wish-places/:id/check-in', async (req, res) => {
  try {
    const client = getSupabaseClient();
    const { id } = req.params;
    const { visitedAt } = req.body;
    
    // 获取心愿详情
    const { data: wishPlace, error: fetchError } = await client
      .from('wish_places')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !wishPlace) {
      return res.status(404).json({ error: 'Wish place not found' });
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
        wish_place_id: id,
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
      .eq('id', id);
    
    if (updateError) {
      console.error('Error updating wish place:', updateError);
      // 回滚：删除刚创建的足迹
      await client.from('footprints').delete().eq('id', footprint.id);
      return res.status(500).json({ error: 'Failed to update wish place' });
    }
    
    res.status(201).json(footprint);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== 足迹记录 API ==========

/**
 * 获取足迹记录列表
 * GET /api/v1/footprints
 * Query: startDate?: string, endDate?: string (ISO date string)
 */
app.get('/api/v1/footprints', async (req, res) => {
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
app.post('/api/v1/footprints', async (req, res) => {
  try {
    const client = getSupabaseClient();
    const { name, distance, sceneryFeatures, notes, visitedAt } = req.body;
    
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const { data, error } = await client
      .from('footprints')
      .insert({
        name,
        distance: distance || null,
        scenery_features: sceneryFeatures || null,
        notes: notes || null,
        visited_at: visitedAt || new Date().toISOString(),
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
app.put('/api/v1/footprints/:id', async (req, res) => {
  try {
    const client = getSupabaseClient();
    const { id } = req.params;
    const { name, distance, sceneryFeatures, notes, visitedAt } = req.body;
    
    const updateData: any = { updated_at: new Date().toISOString() };
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
app.delete('/api/v1/footprints/:id', async (req, res) => {
  try {
    const client = getSupabaseClient();
    const { id } = req.params;
    
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

// ========== 统计 API ==========

/**
 * 获取统计数据
 * GET /api/v1/stats
 */
app.get('/api/v1/stats', async (req, res) => {
  try {
    const client = getSupabaseClient();
    
    // 获取心愿统计
    const { count: totalWishes, error: wishError } = await client
      .from('wish_places')
      .select('*', { count: 'exact', head: true });
    
    const { count: visitedWishes, error: visitedError } = await client
      .from('wish_places')
      .select('*', { count: 'exact', head: true })
      .eq('is_visited', true);
    
    // 获取足迹统计
    const { count: totalFootprints, error: footprintError } = await client
      .from('footprints')
      .select('*', { count: 'exact', head: true });
    
    if (wishError || visitedError || footprintError) {
      console.error('Error fetching stats:', { wishError, visitedError, footprintError });
      return res.status(500).json({ error: 'Failed to fetch stats' });
    }
    
    res.json({
      totalWishes: totalWishes || 0,
      visitedWishes: visitedWishes || 0,
      unvisitedWishes: (totalWishes || 0) - (visitedWishes || 0),
      totalFootprints: totalFootprints || 0,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 获取时间统计数据
 * GET /api/v1/stats/time
 * 返回按年、月、周统计的足迹数量
 */
app.get('/api/v1/stats/time', async (req, res) => {
  try {
    const client = getSupabaseClient();
    const now = new Date();
    
    // 获取所有足迹数据
    const { data: footprints, error } = await client
      .from('footprints')
      .select('visited_at');
    
    if (error) {
      console.error('Error fetching footprints for stats:', error);
      return res.status(500).json({ error: 'Failed to fetch time stats' });
    }
    
    // 计算本周开始时间（周一）
    const weekStart = new Date(now);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);
    
    // 计算本月开始时间
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // 计算本年开始时间
    const yearStart = new Date(now.getFullYear(), 0, 1);
    
    // 按时间段统计
    let weekCount = 0;
    let monthCount = 0;
    let yearCount = 0;
    
    // 按月统计（最近12个月）
    const monthlyStats: { month: string; count: number }[] = [];
    const monthMap = new Map<string, number>();
    
    footprints?.forEach((fp: any) => {
      const visitedDate = new Date(fp.visited_at);
      
      // 周统计
      if (visitedDate >= weekStart) weekCount++;
      // 月统计
      if (visitedDate >= monthStart) monthCount++;
      // 年统计
      if (visitedDate >= yearStart) yearCount++;
      
      // 按月分组统计
      const monthKey = `${visitedDate.getFullYear()}-${String(visitedDate.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1);
    });
    
    // 生成最近12个月的统计
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyStats.push({
        month: key,
        count: monthMap.get(key) || 0,
      });
    }
    
    res.json({
      week: weekCount,
      month: monthCount,
      year: yearCount,
      monthlyStats,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== 数据导入导出 API ==========

/**
 * 导出所有数据
 * GET /api/v1/export
 */
app.get('/api/v1/export', async (req, res) => {
  try {
    const client = getSupabaseClient();
    
    // 获取所有心愿
    const { data: wishPlaces, error: wishError } = await client
      .from('wish_places')
      .select('*');
    
    if (wishError) {
      console.error('Error exporting wish places:', wishError);
      return res.status(500).json({ error: 'Failed to export wish places' });
    }
    
    // 获取所有足迹
    const { data: footprints, error: footprintError } = await client
      .from('footprints')
      .select('*');
    
    if (footprintError) {
      console.error('Error exporting footprints:', footprintError);
      return res.status(500).json({ error: 'Failed to export footprints' });
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
 * Body: { wishPlaces: [], footprints: [] }
 */
app.post('/api/v1/import', async (req, res) => {
  try {
    const client = getSupabaseClient();
    const { wishPlaces, footprints } = req.body;
    
    let importedWishes = 0;
    let importedFootprints = 0;
    
    // 导入心愿
    if (wishPlaces && Array.isArray(wishPlaces)) {
      for (const wish of wishPlaces) {
        try {
          await client
            .from('wish_places')
            .insert({
              name: wish.name,
              distance: wish.distance || null,
              scenery_features: wish.scenery_features || null,
              notes: wish.notes || null,
              is_visited: wish.is_visited || false,
            });
          importedWishes++;
        } catch (e) {
          console.error('Error importing wish:', e);
        }
      }
    }
    
    // 导入足迹
    if (footprints && Array.isArray(footprints)) {
      for (const footprint of footprints) {
        try {
          await client
            .from('footprints')
            .insert({
              name: footprint.name,
              distance: footprint.distance || null,
              scenery_features: footprint.scenery_features || null,
              notes: footprint.notes || null,
              visited_at: footprint.visited_at || new Date().toISOString(),
            });
          importedFootprints++;
        } catch (e) {
          console.error('Error importing footprint:', e);
        }
      }
    }
    
    res.json({
      success: true,
      imported: {
        wishPlaces: importedWishes,
        footprints: importedFootprints,
      },
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
app.delete('/api/v1/data', async (req, res) => {
  try {
    const client = getSupabaseClient();
    
    // 删除所有足迹
    const { error: footprintError } = await client
      .from('footprints')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // 删除所有
    
    // 删除所有心愿
    const { error: wishError } = await client
      .from('wish_places')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // 删除所有
    
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

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}/`);
});
