-- =====================================================
-- Migration: 001_check_in_wish_rpc.sql
-- Description: 创建打卡心愿的 RPC 函数，实现原子事务
-- Author: 足迹小本本团队
-- =====================================================

-- 创建打卡心愿函数
-- 功能：在单个事务中完成足迹创建和心愿状态更新
-- 参数：
--   p_wish_id: 心愿ID (UUID)
--   p_visited_at: 打卡时间 (可选，默认为当前时间)
-- 返回：新创建的足迹记录 (JSONB)

CREATE OR REPLACE FUNCTION check_in_wish(
  p_wish_id UUID,
  p_visited_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wish RECORD;
  v_footprint RECORD;
BEGIN
  -- 1. 获取并锁定心愿记录（防止并发打卡）
  SELECT * INTO v_wish 
  FROM wish_places 
  WHERE id = p_wish_id 
  FOR UPDATE;
  
  -- 检查心愿是否存在
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wish place not found';
  END IF;
  
  -- 检查是否已打卡
  IF v_wish.is_visited THEN
    RAISE EXCEPTION 'Wish place already checked in';
  END IF;

  -- 2. 插入足迹记录
  INSERT INTO footprints (
    name, 
    distance, 
    scenery_features, 
    notes, 
    visited_at, 
    wish_place_id
  )
  VALUES (
    v_wish.name, 
    v_wish.distance, 
    v_wish.scenery_features, 
    v_wish.notes, 
    COALESCE(p_visited_at, NOW()), 
    p_wish_id
  )
  RETURNING * INTO v_footprint;

  -- 3. 更新心愿状态为已打卡
  UPDATE wish_places 
  SET 
    is_visited = true, 
    updated_at = NOW() 
  WHERE id = p_wish_id;

  -- 4. 返回新创建的足迹记录
  RETURN row_to_json(v_footprint)::JSONB;
END;
$$;

-- 添加函数注释
COMMENT ON FUNCTION check_in_wish(UUID, TIMESTAMPTZ) IS 
'打卡心愿：在单个事务中创建足迹并更新心愿状态。原子操作，保证数据一致性。';

-- 授权（根据实际需求调整）
-- GRANT EXECUTE ON FUNCTION check_in_wish(UUID, TIMESTAMPTZ) TO authenticated;
-- GRANT EXECUTE ON FUNCTION check_in_wish(UUID, TIMESTAMPTZ) TO anon;
