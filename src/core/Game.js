import { Player } from './Player.js';
import { World } from './World.js';
import { ITEM_NAMES } from './definitions.js';

export const GAME_STATES = {
  WELCOME: 'welcome',
  PLAYING: 'playing',
  WON: 'won',
  LOST: 'lost',
};

/** 方向名称到坐标偏移的映射。 */
export const DIRECTIONS = {
  north: { dx: 0, dy: -1 },
  south: { dx: 0, dy: 1 },
  west: { dx: -1, dy: 0 },
  east: { dx: 1, dy: 0 },
};

/**
 * 总游戏类：控制游戏的状态与流程（开始、进行、结束），
 * 读取玩家指令并执行动作，检查胜负条件。
 */
export class Game {
  constructor({ world = new World(), player = null } = {}) {
    this.world = world;
    this.player = player;
    this.state = GAME_STATES.WELCOME;
    this.objective =
      '在魔法森林中找到并拾取魔法水晶 💎。小心怪物与沼泽，找到钥匙打开城堡！';
    this.messages = [];
  }

  get isOver() {
    return this.state === GAME_STATES.WON || this.state === GAME_STATES.LOST;
  }

  /** 开始游戏：生成世界并放置玩家。 */
  start() {
    this.world.generate();
    this.player = new Player({
      name: '勇者',
      x: this.world.start.x,
      y: this.world.start.y,
      health: 100,
      maxHealth: 100,
    });
    this.state = GAME_STATES.PLAYING;
    this.messages = [`欢迎，${this.player.name}！${this.objective}`];
    this.messages.push(this.describeLocation(this.player.x, this.player.y));
    return this;
  }

  /** 按索引使用背包中的物品（对应数字键）。 */
  useItemByIndex(index) {
    const item = this.player.inventory[index];
    if (!item) {
      this._push('该位置没有物品。');
    } else {
      this._useItem(item);
    }
    this._checkWinLoss();
    return this.messages;
  }

  /**
   * 读取并处理玩家指令，执行动作并更新状态。
   * @param {string} rawCommand 玩家输入的指令
   */
  processCommand(rawCommand) {
    if (this.state !== GAME_STATES.PLAYING) return this.messages;

    const command = String(rawCommand).trim().toLowerCase();
    const [verb, ...rest] = command.split(/\s+/);
    const target = rest.join(' ');

    switch (verb) {
      case 'north':
      case 'n':
      case 'up':
      case 'w':
        this._move(DIRECTIONS.north);
        break;
      case 'south':
      case 's':
      case 'down':
        this._move(DIRECTIONS.south);
        break;
      case 'west':
      case 'left':
      case 'a':
        this._move(DIRECTIONS.west);
        break;
      case 'east':
      case 'right':
      case 'd':
        this._move(DIRECTIONS.east);
        break;
      case 'pick':
      case 'take':
      case 'grab':
        this._pickUp();
        break;
      case 'use':
        this._useByName(target);
        break;
      case 'look':
      case 'examine':
        this._look();
        break;
      case 'inventory':
      case 'i':
        this._showInventory();
        break;
      case 'help':
      case 'h':
        this._help();
        break;
      default:
        this._push(`未知指令：「${rawCommand}」。输入 help 查看帮助。`);
    }

    this._checkWinLoss();
    return this.messages;
  }

  /** 解锁城堡大门（由钥匙的 unlock 动作调用）。 */
  unlockCastle() {
    if (!this.world.goal || this.world.goal.walkable) {
      return '城堡的大门已经是打开的状态。';
    }
    this.world.goal.walkable = true;
    return '你转动了钥匙，远处城堡的大门轰然打开！';
  }

  /** 结束游戏并返回最终状态。 */
  end() {
    this._checkWinLoss();
    return this.state;
  }

  describeLocation(x, y) {
    const location = this.world.getLocation(x, y);
    if (!location) return '你的眼前一片虚无……';
    let text = `${location.symbol} ${location.name}：${location.description}`;
    if (location.hasItems) {
      text += ` 地上有：${location.items.map((item) => `${item.symbol}${item.name}`).join('、')}。`;
    }
    if (location.hasDanger) {
      text += ` 危险：${location.danger.name}！`;
    }
    return text;
  }

  /** 返回可序列化的纯数据快照。 */
  toJSON() {
    return {
      state: this.state,
      objective: this.objective,
      world: this.world.toJSON(),
      player: this.player ? this.player.toJSON() : null,
    };
  }

  /** 从纯数据快照重建游戏。 */
  static restore(data) {
    const world = World.restore(data.world);
    const player = data.player ? Player.restore(data.player) : null;
    const game = new Game({ world, player });
    game.state = data.state;
    game.objective = data.objective;
    game.messages = ['已读取存档，继续你的冒险。'];
    return game;
  }

  _move(direction) {
    const x = this.player.x + direction.dx;
    const y = this.player.y + direction.dy;
    const location = this.world.getLocation(x, y);

    if (!location) {
      this._push('前方是世界的边界，你无法继续前进。');
      return;
    }
    if (!location.walkable) {
      if (location === this.world.goal) {
        this._push(`城堡的大门紧锁，你需要一把 ${ITEM_NAMES.KEY} 才能打开它。`);
      } else {
        this._push('此路不通。');
      }
      return;
    }

    this.player.setPosition(x, y);

    if (location.hasDanger) {
      this._push(location.danger.apply(this.player));
    }

    this._push(this.describeLocation(x, y));
  }

  _pickUp() {
    const location = this.world.getLocation(this.player.x, this.player.y);
    if (!location.hasItems) {
      this._push('这里没有什么可以拾取的东西。');
      return;
    }
    [...location.items].forEach((item) => {
      this.player.addItem(item);
      location.removeItem(item);
      this._push(`你拾取了「${item.name}」。`);
    });
  }

  _useByName(target) {
    if (!target) {
      this._push('用法：use <物品名>。例如 use 治愈药水。');
      return;
    }
    const item = this.player.getItem(target);
    if (!item) {
      this._push(`你的背包里没有「${target}」。`);
      return;
    }
    this._useItem(item);
  }

  _useItem(item) {
    const actionName = item.listActions()[0];
    if (!actionName) {
      this._push(`「${item.name}」没有任何可用的动作。`);
      return;
    }
    this._push(item.use(actionName, { player: this.player, game: this }));
  }

  _look() {
    this._push(this.describeLocation(this.player.x, this.player.y));
  }

  _showInventory() {
    if (this.player.inventory.length === 0) {
      this._push('你的背包是空的。');
      return;
    }
    const list = this.player.inventory
      .map((item, index) => `${index + 1}. ${item.symbol} ${item.name}`)
      .join('  ');
    this._push(`背包：${list}`);
  }

  _help() {
    this._push('方向键 / WASD 移动 · E 拾取 · 数字键使用对应物品 · I 查看背包 · L 观察四周');
  }

  _checkWinLoss() {
    if (this.player.hasItem(ITEM_NAMES.CRYSTAL)) {
      this.state = GAME_STATES.WON;
      this._push('🎉 你拾取了魔法水晶，成功完成了冒险！');
      return;
    }
    if (!this.player.isAlive) {
      this.state = GAME_STATES.LOST;
      this._push('💀 你的生命值归零，冒险失败了……');
    }
  }

  _push(message) {
    this.messages.push(message);
  }
}