import { pgTable, serial, varchar, text, timestamp, boolean, integer, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { createSchemaFactory } from "drizzle-zod"
import { z } from "zod"

// 系统健康检查表（禁止删除或修改）
export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 心愿清单表 - 想去的地方
export const wishPlaces = pgTable(
  "wish_places",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 255 }).notNull(), // 地点名称
    distance: varchar("distance", { length: 100 }), // 距离（如"约50公里"）
    sceneryFeatures: text("scenery_features"), // 风景特征
    notes: text("notes"), // 备注
    isVisited: boolean("is_visited").default(false).notNull(), // 是否已打卡
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
  },
  (table) => [
    index("wish_places_created_at_idx").on(table.createdAt),
    index("wish_places_is_visited_idx").on(table.isVisited),
  ]
);

// 足迹记录表 - 去过的地方
export const footprints = pgTable(
  "footprints",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 255 }).notNull(), // 地点名称
    distance: varchar("distance", { length: 100 }), // 距离
    sceneryFeatures: text("scenery_features"), // 风景特征
    notes: text("notes"), // 备注
    visitedAt: timestamp("visited_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(), // 打卡时间
    wishPlaceId: varchar("wish_place_id", { length: 36 }), // 关联的心愿ID（可选）
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
  },
  (table) => [
    index("footprints_visited_at_idx").on(table.visitedAt),
    index("footprints_wish_place_id_idx").on(table.wishPlaceId),
  ]
);

// 使用 createSchemaFactory 配置 date coercion（处理前端 string → Date 转换）
const { createInsertSchema: createCoercedInsertSchema } = createSchemaFactory({
  coerce: { date: true },
});

// ========== 心愿清单 Zod Schemas ==========
export const insertWishPlaceSchema = createCoercedInsertSchema(wishPlaces).pick({
  name: true,
  distance: true,
  sceneryFeatures: true,
  notes: true,
});

export const updateWishPlaceSchema = createCoercedInsertSchema(wishPlaces)
  .pick({
    name: true,
    distance: true,
    sceneryFeatures: true,
    notes: true,
    isVisited: true,
  })
  .partial();

// ========== 足迹记录 Zod Schemas ==========
export const insertFootprintSchema = createCoercedInsertSchema(footprints).pick({
  name: true,
  distance: true,
  sceneryFeatures: true,
  notes: true,
  visitedAt: true,
  wishPlaceId: true,
});

export const updateFootprintSchema = createCoercedInsertSchema(footprints)
  .pick({
    name: true,
    distance: true,
    sceneryFeatures: true,
    notes: true,
    visitedAt: true,
  })
  .partial();

// ========== TypeScript Types ==========
export type WishPlace = typeof wishPlaces.$inferSelect;
export type InsertWishPlace = z.infer<typeof insertWishPlaceSchema>;
export type UpdateWishPlace = z.infer<typeof updateWishPlaceSchema>;

export type Footprint = typeof footprints.$inferSelect;
export type InsertFootprint = z.infer<typeof insertFootprintSchema>;
export type UpdateFootprint = z.infer<typeof updateFootprintSchema>;
