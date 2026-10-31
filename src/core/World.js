import { Location } from './Location.js';
import { generateMap, TILE_TYPE, MAP_ITEMS } from './mapGenerator.js';
import {
  createPotion,
  createSword,
  createKey,
  createCrystal,
  createMonster,
  createSwamp,
  createItemByName,
  createDangerByName,
} from './definitions.js';

const TILE_NAMES = {
  [TILE_TYPE.FOREST]: '幽暗森林',
  [TILE_TYPE.SWAMP]: '剧毒沼泽',
  [TILE_TYPE.MONSTER]: '怪物巢穴',
};

const TILE_SYMBOLS = {
  [TILE_TYPE.FOREST]: '🌲',
  [TILE_TYPE.SWAMP]: '🫧',
  [TILE_TYPE.MONSTER]: '👹',
};

/**
 * 世界类：代表游戏世界，包含生成地图的方法。
 * 地图是一个二维的 Location 对象数组。
 */
export class World {
  constructor({ width = 9, height = 7, seed = 20261027 } = {}) {
    this.width = width;
    this.height = height;
    this.seed = seed;
    this.grid = [];
    this.start = null;
    this.goal = null;
  }

  /** 生成游戏地图（二维 Location 数组）。 */
  generate() {
    const specs = [...generateMap(this.width, this.height, this.seed)];
    this.grid = [];

    for (let y = 0; y < this.height; y += 1) {
      const row = [];
      for (let x = 0; x < this.width; x += 1) {
        const spec = specs.find((candidate) => candidate.x === x && candidate.y === y);
        const location = this._buildLocation(spec);
        row.push(location);
        if (spec.isStart) this.start = location;
        if (spec.isGoal) this.goal = location;
      }
      this.grid.push(row);
    }
    return this;
  }

  _buildLocation(spec) {
    if (spec.isGoal) {
      const castle = new Location({
        x: spec.x,
        y: spec.y,
        name: '魔法城堡',
        description: '存放魔法水晶的城堡，需要钥匙才能打开大门。',
        symbol: '🏰',
        walkable: false,
      });
      castle.addItem(createCrystal());
      return castle;
    }

    const location = new Location({
      x: spec.x,
      y: spec.y,
      name: TILE_NAMES[spec.type],
      description: '一片安静的森林空地，树影斑驳，虫鸣阵阵。',
      symbol: TILE_SYMBOLS[spec.type],
      walkable: true,
    });

    if (spec.type === TILE_TYPE.MONSTER) location.setDanger(createMonster());
    if (spec.type === TILE_TYPE.SWAMP) location.setDanger(createSwamp());

    if (spec.item === MAP_ITEMS.POTION) location.addItem(createPotion());
    if (spec.item === MAP_ITEMS.SWORD) location.addItem(createSword());
    if (spec.item === MAP_ITEMS.KEY) location.addItem(createKey());

    return location;
  }

  getLocation(x, y) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return null;
    return this.grid[y][x];
  }

  isWalkable(x, y) {
    const location = this.getLocation(x, y);
    return location !== null && location.walkable;
  }

  /** 函数式风格：所有可通过的地点。 */
  get walkableLocations() {
    return this.grid.flat().filter((location) => location && location.walkable);
  }

  /** 函数式风格：所有含有物品的地点。 */
  get itemLocations() {
    return this.grid.flat().filter((location) => location && location.hasItems);
  }

  /** 函数式风格：世界中物品数量（reduce 示例）。 */
  get itemCount() {
    return this.grid
      .flat()
      .reduce((count, location) => count + (location ? location.items.length : 0), 0);
  }

  /** 返回可序列化的纯数据快照。 */
  toJSON() {
    return {
      width: this.width,
      height: this.height,
      seed: this.seed,
      start: this.start ? { x: this.start.x, y: this.start.y } : null,
      goal: this.goal ? { x: this.goal.x, y: this.goal.y } : null,
      grid: this.grid.map((row) =>
        row.map((location) => (location
          ? {
            x: location.x,
            y: location.y,
            name: location.name,
            description: location.description,
            symbol: location.symbol,
            walkable: location.walkable,
            items: location.items.map((item) => item.name),
            danger: location.danger ? location.danger.name : null,
          }
          : null)),
      ),
    };
  }

  /** 从纯数据快照重建世界。 */
  static restore(data) {
    const world = new World({ width: data.width, height: data.height, seed: data.seed });
    world.grid = data.grid.map((row) =>
      row.map((cell) => {
        if (!cell) return null;
        const location = new Location({
          x: cell.x,
          y: cell.y,
          name: cell.name,
          description: cell.description,
          symbol: cell.symbol,
          walkable: cell.walkable,
        });
        cell.items.forEach((name) => {
          const item = createItemByName(name);
          if (item) location.addItem(item);
        });
        if (cell.danger) location.setDanger(createDangerByName(cell.danger));
        return location;
      }));
    if (data.start) world.start = world.getLocation(data.start.x, data.start.y);
    if (data.goal) world.goal = world.getLocation(data.goal.x, data.goal.y);
    return world;
  }
}