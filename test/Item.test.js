import { describe, it, expect } from 'vitest';
import { Item } from '../src/core/Item.js';

describe('Item', () => {
  it('以名称、描述与符号创建物品', () => {
    const item = new Item({ name: '城堡钥匙', description: '开门的钥匙', symbol: '🗝️' });
    expect(item.name).toBe('城堡钥匙');
    expect(item.description).toBe('开门的钥匙');
    expect(item.symbol).toBe('🗝️');
  });

  it('注册箭头函数动作并列出名称', () => {
    const item = new Item({ name: '药水' });
    item.addAction('drink', () => 'gulp');
    item.addAction('throw', () => 'splash');
    expect(item.listActions()).toEqual(['drink', 'throw']);
    expect(item.hasAction('drink')).toBe(true);
    expect(item.hasAction('fly')).toBe(false);
  });

  it('调用匹配的动作并传入上下文', () => {
    const item = new Item({ name: '药水' });
    item.addAction('drink', ({ amount }) => amount * 2);
    expect(item.use('drink', { amount: 21 })).toBe(42);
  });

  it('使用未知动作时抛出错误', () => {
    const item = new Item({ name: '石头' });
    expect(() => item.use('fly')).toThrow();
  });
});