// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import * as dom from '../src/ui/dom.js';
import { World } from '../src/core/World.js';
import { Player } from '../src/core/Player.js';
import { Game } from '../src/core/Game.js';
import { createPotion } from '../src/core/definitions.js';

describe('renderMap', () => {
  it('按行渲染 width * height 个格子', () => {
    const world = new World({ width: 3, height: 2, seed: 1 }).generate();
    const player = new Player({ x: 0, y: 1 });
    const container = document.createElement('div');
    dom.renderMap(world, player, container);
    expect(container.querySelectorAll('.map__row')).toHaveLength(2);
    expect(container.querySelectorAll('.tile')).toHaveLength(6);
  });

  it('标记玩家所在的格子并显示玩家符号', () => {
    const world = new World({ width: 3, height: 2, seed: 1 }).generate();
    const player = new Player({ x: 1, y: 0 });
    const container = document.createElement('div');
    dom.renderMap(world, player, container);
    const playerTile = container.querySelector('.tile--player');
    expect(playerTile).not.toBeNull();
    expect(playerTile.textContent).toContain('🧙');
  });
});

describe('renderHud', () => {
  it('更新生命值与位置', () => {
    const game = new Game({ world: new World({ width: 3, height: 2, seed: 1 }) });
    game.world.generate();
    game.player = new Player({ x: 1, y: 1, health: 55, maxHealth: 100 });
    const progress = document.createElement('progress');
    const text = document.createElement('span');
    const position = document.createElement('span');
    dom.renderHud(game, { healthBar: progress, healthText: text, position });
    expect(Number(progress.value)).toBe(55);
    expect(Number(progress.max)).toBe(100);
    expect(text.textContent).toBe('55 / 100');
    expect(position.textContent).toBe('位置 (1, 1)');
  });

  it('低生命值时添加 health--low 类', () => {
    const game = new Game();
    game.player = new Player({ health: 20, maxHealth: 100 });
    const progress = document.createElement('progress');
    dom.renderHud(game, { healthBar: progress });
    expect(progress.classList.contains('health--low')).toBe(true);
  });
});

describe('renderInventory', () => {
  it('背包为空时显示「空」', () => {
    const game = new Game();
    game.player = new Player({ health: 100 });
    const container = document.createElement('div');
    dom.renderInventory(game, container);
    expect(container.querySelector('.inventory__empty').textContent).toBe('空');
  });

  it('列出背包中的物品', () => {
    const game = new Game();
    game.player = new Player({ health: 100 });
    game.player.addItem(createPotion());
    const container = document.createElement('div');
    dom.renderInventory(game, container);
    const chips = container.querySelectorAll('.inventory__item');
    expect(chips).toHaveLength(1);
    expect(chips[0].textContent).toContain('治愈药水');
  });
});

describe('消息', () => {
  it('appendMessage 追加一条消息', () => {
    const log = document.createElement('div');
    dom.appendMessage('你好', log);
    expect(log.querySelector('.message').textContent).toBe('你好');
  });

  it('renderMessages 清空并重绘全部消息', () => {
    const game = new Game();
    game.messages = ['a', 'b', 'c'];
    const log = document.createElement('div');
    dom.renderMessages(game, log);
    expect(log.querySelectorAll('.message')).toHaveLength(3);
  });
});

describe('activateScreen', () => {
  it('切换画面并更新 active 类', () => {
    const root = document.createElement('div');
    const a = document.createElement('section');
    a.id = 's1';
    a.className = 'screen screen--active';
    const b = document.createElement('section');
    b.id = 's2';
    b.className = 'screen';
    root.append(a, b);
    dom.activateScreen(root, 's2');
    expect(a.classList.contains('screen--active')).toBe(false);
    expect(b.classList.contains('screen--active')).toBe(true);
  });
});

describe('toggleFullscreen（mock Web Fullscreen API）', () => {
  it('未全屏时请求全屏', () => {
    const requestFullscreen = vi.fn();
    const target = { requestFullscreen };
    dom.toggleFullscreen(target);
    expect(requestFullscreen).toHaveBeenCalled();
  });

  it('已全屏时退出全屏', () => {
    const exitFullscreen = vi.fn();
    const originalElement = document.fullscreenElement;
    const originalExit = document.exitFullscreen;
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      value: document.documentElement,
    });
    document.exitFullscreen = exitFullscreen;
    try {
      dom.toggleFullscreen(document.documentElement);
      expect(exitFullscreen).toHaveBeenCalled();
    } finally {
      Object.defineProperty(document, 'fullscreenElement', {
        configurable: true,
        value: originalElement,
      });
      if (originalExit) document.exitFullscreen = originalExit;
      else delete document.exitFullscreen;
    }
  });

  it('缺少 API 时安全返回', async () => {
    const target = {};
    await expect(dom.toggleFullscreen(target)).resolves.toBeUndefined();
  });
});

describe('bindKeys', () => {
  it('把方向键映射为移动指令', () => {
    const onCommand = vi.fn();
    const { unbind } = dom.bindKeys({ onCommand });
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    expect(onCommand).toHaveBeenCalledWith('north');
    unbind();
  });

  it('把数字键映射为按索引使用物品', () => {
    const onUseIndex = vi.fn();
    const { unbind } = dom.bindKeys({ onCommand: vi.fn(), onUseIndex });
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '3' }));
    expect(onUseIndex).toHaveBeenCalledWith(2);
    unbind();
  });

  it('其他按键不触发指令', () => {
    const onCommand = vi.fn();
    const { unbind } = dom.bindKeys({ onCommand });
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(onCommand).not.toHaveBeenCalled();
    unbind();
  });
});

describe('bindSwipe', () => {
  function touchEvent(type, points) {
    const event = new Event(type);
    event.touches = points;
    event.changedTouches = points;
    return event;
  }

  it('把横向滑动映射为方向', () => {
    const onCommand = vi.fn();
    const element = document.createElement('div');
    const { unbind } = dom.bindSwipe(element, onCommand);
    element.dispatchEvent(touchEvent('touchstart', [{ clientX: 0, clientY: 0 }]));
    element.dispatchEvent(touchEvent('touchend', [{ clientX: 60, clientY: 0 }]));
    expect(onCommand).toHaveBeenCalledWith('east');
    unbind();
  });

  it('把纵向滑动映射为方向', () => {
    const onCommand = vi.fn();
    const element = document.createElement('div');
    const { unbind } = dom.bindSwipe(element, onCommand);
    element.dispatchEvent(touchEvent('touchstart', [{ clientX: 0, clientY: 0 }]));
    element.dispatchEvent(touchEvent('touchend', [{ clientX: 0, clientY: -60 }]));
    expect(onCommand).toHaveBeenCalledWith('north');
    unbind();
  });
});