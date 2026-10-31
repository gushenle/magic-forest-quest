import { describe, it, expect } from 'vitest';
import { Danger } from '../src/core/Danger.js';
import { Player } from '../src/core/Player.js';
import { createMonster, createSwamp, createSword } from '../src/core/definitions.js';

describe('Danger', () => {
  it('以名称、描述与符号创建危险', () => {
    const danger = new Danger({ name: '陷阱', description: '地上的尖刺', symbol: '🕳️' });
    expect(danger.name).toBe('陷阱');
    expect(danger.description).toBe('地上的尖刺');
    expect(danger.symbol).toBe('🕳️');
  });

  it('未设置效果时返回中性消息且不伤害玩家', () => {
    const danger = new Danger({ name: '陷阱' });
    const player = new Player({ health: 100 });
    const message = danger.apply(player);
    expect(player.health).toBe(100);
    expect(message).toContain('陷阱');
  });

  it('应用效果函数到玩家身上', () => {
    const danger = new Danger({ name: '火墙' });
    danger.setEffect((player) => {
      player.takeDamage(10);
      return '被烧伤了';
    });
    const player = new Player({ health: 100 });
    expect(danger.apply(player)).toBe('被烧伤了');
    expect(player.health).toBe(90);
  });
});

describe('具体危险', () => {
  it('沼泽造成 15 点伤害', () => {
    const player = new Player({ health: 100 });
    const message = createSwamp().apply(player);
    expect(player.health).toBe(85);
    expect(message).toContain('沼泽');
  });

  it('怪物在无剑时造成 30 点伤害', () => {
    const player = new Player({ health: 100 });
    const message = createMonster().apply(player);
    expect(player.health).toBe(70);
    expect(message).toContain('30');
  });

  it('拥有剑时怪物被击退且不受伤害', () => {
    const player = new Player({ health: 100 });
    player.addItem(createSword());
    const message = createMonster().apply(player);
    expect(player.health).toBe(100);
    expect(message).toContain('击退');
  });
});