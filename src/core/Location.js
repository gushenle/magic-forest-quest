/**
 * 地点类：代表游戏世界中的一个格子。
 * 包含坐标、名称、描述、图形符号，以及其中的物品与危险。
 */
export class Location {
  constructor({ x, y, name, description, symbol = '🌲', walkable = true }) {
    this.x = x;
    this.y = y;
    this.name = name;
    this.description = description;
    this.symbol = symbol;
    this.walkable = walkable;
    this.items = []; // Item[]
    this.danger = null; // Danger | null
  }

  get hasDanger() {
    return this.danger !== null;
  }

  get hasItems() {
    return this.items.length > 0;
  }

  addItem(item) {
    this.items.push(item);
    return this;
  }

  removeItem(item) {
    this.items = this.items.filter((candidate) => candidate !== item);
    return this;
  }

  removeItemByName(name) {
    this.items = this.items.filter((candidate) => candidate.name !== name);
    return this;
  }

  setDanger(danger) {
    this.danger = danger;
    return this;
  }
}