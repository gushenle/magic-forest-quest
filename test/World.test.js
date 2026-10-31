import { describe, it, expect } from 'vitest';
import { World } from '../src/core/World.js';
import { ITEM_NAMES } from '../src/core/definitions.js';

describe('World', () => {
  it('生成正确维度的二维网格', () => {
    const world = new World({ width: 5, height: 4, seed: 9 }).generate();
    expect(world.grid).toHaveLength(4);
    expect(world.grid[0]).toHaveLength(5);
  });

  it('设置起点与终点（城堡默认上锁且包含水晶）', () => {
    const world = new World({ width: 5, height: 4, seed: 9 }).generate();
    expect([world.start.x, world.start.y]).toEqual([0, 3]);
    expect([world.goal.x, world.goal.y]).toEqual([4, 0]);
    expect(world.goal.walkable).toBe(false);
    expect(world.goal.items.map((item) => item.name)).toContain(ITEM_NAMES.CRYSTAL);
  });

  it('getLocation 在越界时返回 null', () => {
    const world = new World({ width: 3, height: 3, seed: 1 }).generate();
    expect(world.getLocation(-1, 0)).toBeNull();
    expect(world.getLocation(3, 0)).toBeNull();
    expect(world.getLocation(0, 3)).toBeNull();
    expect(world.getLocation(1, 1)).not.toBeNull();
  });

  it('isWalkable 判断能否通过', () => {
    const world = new World({ width: 5, height: 4, seed: 9 }).generate();
    expect(world.isWalkable(world.start.x, world.start.y)).toBe(true);
    expect(world.isWalkable(world.goal.x, world.goal.y)).toBe(false);
  });

  it('walkableLocations / itemLocations / itemCount 函数式统计', () => {
    const world = new World({ width: 6, height: 5, seed: 4 }).generate();
    expect(world.walkableLocations).toHaveLength(world.grid.flat().filter((l) => l && l.walkable).length);
    expect(world.itemLocations.length).toBeGreaterThan(0);
    expect(world.itemCount).toBeGreaterThan(0);
  });

  it('序列化并从快照还原', () => {
    const world = new World({ width: 6, height: 5, seed: 12 }).generate();
    const restored = World.restore(world.toJSON());
    expect(restored.width).toBe(6);
    expect(restored.height).toBe(5);
    expect(restored.seed).toBe(12);
    expect(restored.itemCount).toBe(world.itemCount);
    expect(restored.goal.symbol).toBe('🏰');
    expect(restored.goal.walkable).toBe(world.goal.walkable);
  });
});