import { describe, it, expect } from 'vitest';
import { Player } from '../src/core/Player.js';
import { createPotion } from '../src/core/definitions.js';

describe('Player', () => {
  it('以默认值初始化玩家', () => {
    const player = new Player({});
    expect(player.name).toBe('勇者');
    expect(player.x).toBe(0);
    expect(player.y).toBe(0);
    expect(player.health).toBe(100);
    expect(player.maxHealth).toBe(100);
    expect(player.inventory).toEqual([]);
  });

  it('移动与设置位置', () => {
    const player = new Player({ x: 1, y: 1 });
    player.move(0, -1);
    expect(player.position).toEqual({ x: 1, y: 0 });
    player.setPosition(3, 4);
    expect(player.position).toEqual({ x: 3, y: 4 });
  });

  it('受伤会被钳制到 0 并更新存活状态', () => {
    const player = new Player({ health: 100 });
    player.takeDamage(30);
    expect(player.health).toBe(70);
    player.takeDamage(999);
    expect(player.health).toBe(0);
    expect(player.isAlive).toBe(false);
  });

  it('治疗不会超过最大生命值', () => {
    const player = new Player({ health: 90, maxHealth: 100 });
    player.heal(50);
    expect(player.health).toBe(100);
  });

  it('物品栏的增删与查询', () => {
    const potion = createPotion();
    const player = new Player({});
    player.addItem(potion);
    expect(player.hasItem('治愈药水')).toBe(true);
    expect(player.getItem('治愈药水')).toBe(potion);
    expect(player.getItem('不存在')).toBeUndefined();
    player.removeItem(potion);
    expect(player.hasItem('治愈药水')).toBe(false);
  });

  it('序列化并从快照还原（物品动作可通过工厂重建）', () => {
    const player = new Player({ name: '勇者', x: 2, y: 3, health: 45, maxHealth: 100 });
    player.addItem(createPotion());
    const restored = Player.restore(player.toJSON());
    expect(restored.name).toBe('勇者');
    expect(restored.position).toEqual({ x: 2, y: 3 });
    expect(restored.health).toBe(45);
    expect(restored.hasItem('治愈药水')).toBe(true);
    restored.getItem('治愈药水').use('drink', { player: restored });
    expect(restored.health).toBe(75);
  });
});