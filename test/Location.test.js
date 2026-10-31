import { describe, it, expect } from 'vitest';
import { Location } from '../src/core/Location.js';
import { Item } from '../src/core/Item.js';
import { Danger } from '../src/core/Danger.js';

describe('Location', () => {
  it('以坐标与默认值创建地点', () => {
    const loc = new Location({ x: 1, y: 2, name: '森林' });
    expect(loc.x).toBe(1);
    expect(loc.y).toBe(2);
    expect(loc.name).toBe('森林');
    expect(loc.symbol).toBe('🌲');
    expect(loc.walkable).toBe(true);
    expect(loc.items).toEqual([]);
    expect(loc.danger).toBeNull();
  });

  it('添加与移除物品', () => {
    const loc = new Location({ x: 0, y: 0, name: '空地' });
    const key = new Item({ name: '钥匙' });
    loc.addItem(key);
    expect(loc.hasItems).toBe(true);
    loc.removeItem(key);
    expect(loc.hasItems).toBe(false);
  });

  it('按名称移除物品', () => {
    const loc = new Location({ x: 0, y: 0, name: '空地' });
    loc.addItem(new Item({ name: '药水' }));
    loc.addItem(new Item({ name: '剑' }));
    loc.removeItemByName('药水');
    expect(loc.items.map((item) => item.name)).toEqual(['剑']);
  });

  it('设置危险', () => {
    const loc = new Location({ x: 0, y: 0, name: '沼泽' });
    loc.setDanger(new Danger({ name: '毒气' }));
    expect(loc.hasDanger).toBe(true);
  });
});