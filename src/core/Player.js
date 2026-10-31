import { createItemByName } from './definitions.js';

/**
 * 玩家类：保存当前位置、物品栏、生命值等玩家专属信息。
 */
export class Player {
  constructor({ name = '勇者', x = 0, y = 0, health = 100, maxHealth = 100 }) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.health = health;
    this.maxHealth = maxHealth;
    this.inventory = []; // Item[]
  }

  get position() {
    return { x: this.x, y: this.y };
  }

  get isAlive() {
    return this.health > 0;
  }

  move(dx, dy) {
    this.x += dx;
    this.y += dy;
    return this;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  addItem(item) {
    this.inventory.push(item);
    return this;
  }

  removeItem(item) {
    this.inventory = this.inventory.filter((candidate) => candidate !== item);
    return this;
  }

  hasItem(name) {
    return this.inventory.some((item) => item.name === name);
  }

  getItem(name) {
    return this.inventory.find((item) => item.name === name);
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    return this;
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
    return this;
  }

  /** 返回可序列化的纯数据快照。 */
  toJSON() {
    return {
      name: this.name,
      x: this.x,
      y: this.y,
      health: this.health,
      maxHealth: this.maxHealth,
      inventory: this.inventory.map((item) => item.name),
    };
  }

  /** 从纯数据快照重建玩家（物品动作通过定义工厂重建）。 */
  static restore(data) {
    const player = new Player({
      name: data.name,
      x: data.x,
      y: data.y,
      health: data.health,
      maxHealth: data.maxHealth,
    });
    data.inventory.forEach((name) => {
      const item = createItemByName(name);
      if (item) player.addItem(item);
    });
    return player;
  }
}