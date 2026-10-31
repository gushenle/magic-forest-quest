/**
 * 地图生成器：利用伪随机数生成器（mulberry32）以生成器（function*）产出地图单元，
 * 使相同种子生成完全相同的世界，使每局游戏独一无二。
 */

export const TILE_TYPE = {
  FOREST: 'forest',
  SWAMP: 'swamp',
  MONSTER: 'monster',
};

export const MAP_ITEMS = {
  POTION: 'potion',
  SWORD: 'sword',
  KEY: 'key',
};

/** 简单的伪随机数生成器（mulberry32），返回 [0,1) 之间的随机数。 */
export function createRandom(seed = 1) {
  let state = seed >>> 0;
  return function nextRandom() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 生成器：对可迭代对象进行带下标的枚举，产出 [index, value]。
 * 演示生成器与「值 + 下标」的迭代模式。
 */
export function* enumerate(iterable) {
  let index = 0;
  for (const value of iterable) {
    yield [index, value];
    index += 1;
  }
}

/**
 * 生成器：产出被 Fisher-Yates 洗牌后的数组副本（不修改原数组）。
 */
export function* shuffled(array, rng) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  yield* copy;
}

/**
 * 生成器：产出地图单元描述，按行优先顺序。
 * @yields {{x:number, y:number, type:string, item:string|null, isStart:boolean, isGoal:boolean}}
 */
export function* generateMap(width, height, seed = 1) {
  const rng = createRandom(seed);
  const start = { x: 0, y: height - 1 };
  const goal = { x: width - 1, y: 0 };

  // 预先确定每个格子的地形类型，并避开起点与终点
  const terrain = new Map();
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const key = `${x},${y}`;
      const isStart = x === start.x && y === start.y;
      const isGoal = x === goal.x && y === goal.y;

      let type = TILE_TYPE.FOREST;
      if (!isStart && !isGoal) {
        const roll = rng();
        if (roll < 0.12) type = TILE_TYPE.SWAMP;
        else if (roll < 0.2) type = TILE_TYPE.MONSTER;
      }
      terrain.set(key, { x, y, type, isStart, isGoal, item: null });
    }
  }

  // 把物品随机放置到空白森林格中（优先保证钥匙、剑、药水）
  const itemPool = [
    MAP_ITEMS.POTION,
    MAP_ITEMS.SWORD,
    MAP_ITEMS.KEY,
    MAP_ITEMS.POTION,
    MAP_ITEMS.POTION,
  ];
  const freeCells = [...shuffled(
    [...terrain.values()].filter(
      (cell) => !cell.isStart && !cell.isGoal && cell.type === TILE_TYPE.FOREST,
    ),
    rng,
  )];

  for (const [index, item] of enumerate(itemPool)) {
    if (index >= freeCells.length) break;
    freeCells[index].item = item;
  }

  // 按行优先顺序产出
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      yield terrain.get(`${x},${y}`);
    }
  }
}