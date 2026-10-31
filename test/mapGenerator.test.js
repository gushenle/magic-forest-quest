import { describe, it, expect } from 'vitest';
import {
  createRandom,
  enumerate,
  shuffled,
  generateMap,
  TILE_TYPE,
  MAP_ITEMS,
} from '../src/core/mapGenerator.js';

describe('createRandom', () => {
  it('相同种子产生相同序列', () => {
    const a = createRandom(42);
    const b = createRandom(42);
    expect(a()).toBe(b());
    expect(a()).toBe(b());
    expect(a()).toBe(b());
  });

  it('产生位于 [0, 1) 区间的值', () => {
    const rng = createRandom(1);
    for (let i = 0; i < 100; i += 1) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('enumerate', () => {
  it('产出 [下标, 值] 对', () => {
    expect([...enumerate(['a', 'b', 'c'])]).toEqual([
      [0, 'a'],
      [1, 'b'],
      [2, 'c'],
    ]);
  });
});

describe('shuffled', () => {
  it('返回相同元素的排列且不修改原数组', () => {
    const rng = createRandom(7);
    const original = [1, 2, 3, 4, 5];
    const result = [...shuffled(original, rng)];
    expect(result).toHaveLength(5);
    expect([...result].sort()).toEqual([1, 2, 3, 4, 5]);
    expect(original).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('generateMap', () => {
  it('产出 width * height 个单元', () => {
    const cells = [...generateMap(5, 4, 1)];
    expect(cells).toHaveLength(20);
  });

  it('将起点放在左下角、终点放在右上角', () => {
    const cells = [...generateMap(6, 5, 1)];
    const start = cells.find((cell) => cell.isStart);
    const goal = cells.find((cell) => cell.isGoal);
    expect([start.x, start.y]).toEqual([0, 4]);
    expect([goal.x, goal.y]).toEqual([5, 0]);
  });

  it('相同种子生成完全相同的地图', () => {
    const a = [...generateMap(6, 5, 3)];
    const b = [...generateMap(6, 5, 3)];
    expect(a).toEqual(b);
  });

  it('不同种子生成不同的地图', () => {
    const a = [...generateMap(8, 6, 11)];
    const b = [...generateMap(8, 6, 12)];
    expect(a).not.toEqual(b);
  });

  it('不会在起点与终点放置危险或物品', () => {
    const cells = [...generateMap(9, 7, 5)];
    const start = cells.find((cell) => cell.isStart);
    const goal = cells.find((cell) => cell.isGoal);
    expect([TILE_TYPE.SWAMP, TILE_TYPE.MONSTER]).not.toContain(start.type);
    expect([TILE_TYPE.SWAMP, TILE_TYPE.MONSTER]).not.toContain(goal.type);
    expect(start.item).toBeNull();
  });

  it('至少放置钥匙、剑与药水各一件', () => {
    const cells = [...generateMap(9, 7, 5)];
    const items = cells.map((cell) => cell.item).filter(Boolean);
    expect(items).toContain(MAP_ITEMS.KEY);
    expect(items).toContain(MAP_ITEMS.SWORD);
    expect(items).toContain(MAP_ITEMS.POTION);
  });
});