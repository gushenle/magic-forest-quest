import { describe, it, expect } from 'vitest';
import { Game, GAME_STATES } from '../src/core/Game.js';
import { World } from '../src/core/World.js';
import { createPotion, createKey, ITEM_NAMES } from '../src/core/definitions.js';

function makeGame(seed = 1) {
  return new Game({ world: new World({ width: 6, height: 5, seed }) });
}

describe('Game 状态与流程', () => {
  it('初始处于欢迎状态', () => {
    const game = makeGame();
    expect(game.state).toBe(GAME_STATES.WELCOME);
  });

  it('start() 生成世界并把玩家放到起点', () => {
    const game = makeGame();
    game.start();
    expect(game.state).toBe(GAME_STATES.PLAYING);
    expect(game.player.x).toBe(game.world.start.x);
    expect(game.player.y).toBe(game.world.start.y);
    expect(game.messages.length).toBeGreaterThan(0);
  });

  it('非进行中状态忽略指令', () => {
    const game = makeGame();
    game.processCommand('look');
    expect(game.messages).toEqual([]);
  });

  it('移动指令改变玩家位置', () => {
    const game = makeGame();
    game.start();
    game.processCommand('east');
    expect(game.player.x).toBe(1);
    expect(game.player.y).toBe(game.world.start.y);
  });

  it('越界移动被拒绝', () => {
    const game = makeGame();
    game.start();
    game.processCommand('south'); // 起点已在最底行
    expect(game.player.x).toBe(0);
    expect(game.player.y).toBe(game.world.start.y);
  });

  it('重新开始会重置玩家状态', () => {
    const game = makeGame(5);
    game.start();
    game.processCommand('east');
    game.player.takeDamage(100);
    game.processCommand('look');
    expect(game.state).toBe(GAME_STATES.LOST);

    game.start();
    expect(game.state).toBe(GAME_STATES.PLAYING);
    expect(game.player.health).toBe(100);
    expect(game.player.inventory).toEqual([]);
    expect(game.player.position).toEqual({ x: game.world.start.x, y: game.world.start.y });
  });
});

describe('Game 玩法', () => {
  it('拾取当前位置的物品', () => {
    const game = makeGame(5);
    game.start();
    const location = game.world.itemLocations[0];
    game.player.setPosition(location.x, location.y);
    const before = game.player.inventory.length;
    game.processCommand('pick');
    expect(game.player.inventory.length).toBeGreaterThan(before);
    expect(location.hasItems).toBe(false);
  });

  it('使用名称使用物品（药水恢复生命）', () => {
    const game = makeGame(5);
    game.start();
    game.player.takeDamage(20);
    game.player.addItem(createPotion());
    const before = game.player.health;
    game.processCommand('use 治愈药水');
    expect(game.player.health).toBeGreaterThan(before);
  });

  it('按索引使用物品', () => {
    const game = makeGame(5);
    game.start();
    game.player.takeDamage(20);
    game.player.addItem(createPotion());
    const before = game.player.health;
    game.useItemByIndex(0);
    expect(game.player.health).toBeGreaterThan(before);
  });

  it('使用钥匙解锁城堡', () => {
    const game = makeGame(5);
    game.start();
    game.player.addItem(createKey());
    game.processCommand('use 城堡钥匙');
    expect(game.world.goal.walkable).toBe(true);
  });

  it('拾取水晶后判定获胜', () => {
    const game = makeGame(5);
    game.start();
    const crystal = game.world.goal.items.find((item) => item.name === ITEM_NAMES.CRYSTAL);
    game.player.addItem(crystal);
    game.world.goal.removeItem(crystal);
    game.processCommand('look');
    expect(game.state).toBe(GAME_STATES.WON);
    expect(game.isOver).toBe(true);
  });

  it('生命值归零判定失败', () => {
    const game = makeGame(5);
    game.start();
    game.player.takeDamage(100);
    game.processCommand('look');
    expect(game.state).toBe(GAME_STATES.LOST);
    expect(game.isOver).toBe(true);
  });

  it('未知指令给出提示', () => {
    const game = makeGame();
    game.start();
    game.processCommand('dance');
    expect(game.messages.some((message) => message.includes('未知指令'))).toBe(true);
  });
});

describe('Game 序列化', () => {
  it('通过 toJSON / restore 完整还原', () => {
    const game = makeGame(5);
    game.start();
    game.processCommand('east');
    game.processCommand('pick');
    const data = game.toJSON();
    const restored = Game.restore(data);
    expect(restored.state).toBe(GAME_STATES.PLAYING);
    expect(restored.player.position).toEqual(game.player.position);
    expect(restored.player.inventory.map((item) => item.name)).toEqual(
      game.player.inventory.map((item) => item.name),
    );
    expect(restored.world.itemCount).toBe(game.world.itemCount);
  });
});