import { Router, type Request, type Response } from 'express';
import { getSupabaseClient } from '../storage/database/supabase-client';

const router = Router();

/**
 * 获取统计数据
 * GET /api/v1/stats
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const client = getSupabaseClient();
    
    // 使用 Promise.all 并行获取统计数据
    const [
      { count: totalWishes, error: wishError },
      { count: visitedWishes, error: visitedError },
      { count: totalFootprints, error: footprintError },
    ] = await Promise.all([
      client.from('wish_places').select('*', { count: 'exact', head: true }),
      client.from('wish_places').select('*', { count: 'exact', head: true }).eq('is_visited', true),
      client.from('footprints').select('*', { count: 'exact', head: true }),
    ]);
    
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
 * 
 * 优化：使用 SQL GROUP BY 在数据库层进行统计，避免全量数据拉取
 */
router.get('/time', async (req: Request, res: Response) => {
  try {
    const client = getSupabaseClient();
    const now = new Date();
    
    // 计算时间边界
    const weekStart = new Date(now);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);
    
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    
    // 使用 SQL 函数进行分组统计，让数据库完成计算
    // Supabase 支持调用 RPC 函数，这里使用 SQL 查询
    const { data: monthlyData, error: monthlyError } = await client
      .rpc('get_monthly_footprint_stats');
    
    // 如果 RPC 函数不存在，回退到优化过的查询方式
    if (monthlyError && monthlyError.code === 'PGRST202') {
      // 回退方案：使用数据库聚合函数
      return await fallbackTimeStats(req, res, client, weekStart, monthStart, yearStart);
    }
    
    if (monthlyError) {
      console.error('Error fetching monthly stats:', monthlyError);
      return res.status(500).json({ error: 'Failed to fetch time stats' });
    }
    
    // 从 RPC 结果计算周、月、年统计
    let weekCount = 0;
    let monthCount = 0;
    let yearCount = 0;
    
    const monthMap = new Map<string, number>();
    monthlyData?.forEach((item: { month: string; count: number }) => {
      monthMap.set(item.month, item.count);
      
      const itemDate = new Date(item.month + '-01');
      if (itemDate >= weekStart) {
        // 注意：这里简化了周统计，实际可能需要更精确的计算
      }
      if (itemDate >= monthStart) monthCount += item.count;
      if (itemDate >= yearStart) yearCount += item.count;
    });
    
    // 生成最近12个月的统计
    const monthlyStats: { month: string; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyStats.push({
        month: key,
        count: monthMap.get(key) || 0,
      });
    }
    
    // 精确计算周统计（需要单独查询）
    const { count: weekCountExact, error: weekError } = await client
      .from('footprints')
      .select('*', { count: 'exact', head: true })
      .gte('visited_at', weekStart.toISOString());
    
    if (weekError) {
      console.error('Error fetching week stats:', weekError);
    }
    
    res.json({
      week: weekCountExact || 0,
      month: monthCount,
      year: yearCount,
      monthlyStats,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 回退方案：使用优化的查询方式获取时间统计
 * 使用 count 查询代替全量数据拉取
 */
async function fallbackTimeStats(
  req: Request, 
  res: Response, 
  client: ReturnType<typeof getSupabaseClient>,
  weekStart: Date,
  monthStart: Date,
  yearStart: Date
) {
  try {
    const now = new Date();
    
    // 并行查询各时间段数量（使用 count 聚合）
    const [
      { count: weekCount, error: weekError },
      { count: monthCount, error: monthError },
      { count: yearCount, error: yearError },
    ] = await Promise.all([
      client.from('footprints').select('*', { count: 'exact', head: true })
        .gte('visited_at', weekStart.toISOString()),
      client.from('footprints').select('*', { count: 'exact', head: true })
        .gte('visited_at', monthStart.toISOString()),
      client.from('footprints').select('*', { count: 'exact', head: true })
        .gte('visited_at', yearStart.toISOString()),
    ]);
    
    if (weekError || monthError || yearError) {
      console.error('Error fetching time stats:', { weekError, monthError, yearError });
      return res.status(500).json({ error: 'Failed to fetch time stats' });
    }
    
    // 按月统计：只查询 visited_at 字段，减少数据传输量
    const { data: footprints, error: monthlyError } = await client
      .from('footprints')
      .select('visited_at')
      .gte('visited_at', new Date(now.getFullYear() - 1, now.getMonth(), 1).toISOString())
      .order('visited_at', { ascending: false });
    
    if (monthlyError) {
      console.error('Error fetching monthly data:', monthlyError);
      return res.status(500).json({ error: 'Failed to fetch time stats' });
    }
    
    // 在内存中进行月份分组（数据量已大幅减少：仅最近一年）
    const monthMap = new Map<string, number>();
    footprints?.forEach((fp: { visited_at: string }) => {
      const visitedDate = new Date(fp.visited_at);
      const monthKey = `${visitedDate.getFullYear()}-${String(visitedDate.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1);
    });
    
    // 生成最近12个月的统计
    const monthlyStats: { month: string; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyStats.push({
        month: key,
        count: monthMap.get(key) || 0,
      });
    }
    
    res.json({
      week: weekCount || 0,
      month: monthCount || 0,
      year: yearCount || 0,
      monthlyStats,
    });
  } catch (error) {
    console.error('Error in fallback time stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default router;
