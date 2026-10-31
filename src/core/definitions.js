import { Item } from './Item.js';
import { Danger } from './Danger.js';

/** 所有普通物品的名字常量。 */
export const ITEM_NAMES = {
  POTION: '治愈药水',
  SWORD: '勇者之剑',
  KEY: '城堡钥匙',
  CRYSTAL: '魔法水晶',
};

/** 所有危险的名字常量。 */
export const DANGER_NAMES = {
  MONSTER: '洞穴怪物',
  SWAMP: '剧毒沼泽',
};

export function createPotion() {
  return new Item({
    name: ITEM_NAMES.POTION,
    description: '喝下后恢复 30 点生命值。',
    symbol: '🧪',
  }).addAction('drink', ({ player }) => {
    const recovered = Math.min(30, player.maxHealth - player.health);
    player.heal(30);
    return `你喝下治愈药水，恢复了 ${recovered} 点生命值。`;
  });
}

export function createSword() {
  return new Item({
    name: ITEM_NAMES.SWORD,
    description: '锋利的宝剑，能自动击退前来攻击的怪物。',
    symbol: '⚔️',
  }).addAction('wield', () => '你手握勇者之剑，剑身折射出凛冽的寒光。');
}

export function createKey() {
  return new Item({
    name: ITEM_NAMES.KEY,
    description: '打开城堡大门的钥匙。',
    symbol: '🗝️',
  }).addAction('unlock', ({ game }) => game.unlockCastle());
}

export function createCrystal() {
  return new Item({
    name: ITEM_NAMES.CRYSTAL,
    description: '散发着蓝色光芒的魔法水晶，是本次冒险的目标。',
    symbol: '💎',
  }).addAction('hold', () => '水晶在你手中熠熠生辉，你感受到一股温暖的力量。');
}

export function createMonster() {
  return new Danger({
    name: DANGER_NAMES.MONSTER,
    description: '一只凶猛的洞穴怪物，会攻击靠近它的人。',
    symbol: '👹',
  }).setEffect((player) => {
    if (player.hasItem(ITEM_NAMES.SWORD)) {
      return '怪物扑了上来，但你挥剑将其击退，毫发无损！';
    }
    player.takeDamage(30);
    return '怪物袭击了你，你损失了 30 点生命值！';
  });
}

export function createSwamp() {
  return new Danger({
    name: DANGER_NAMES.SWAMP,
    description: '一片冒着绿色毒气的沼泽，随时可能把人吞没。',
    symbol: '🫧',
  }).setEffect((player) => {
    player.takeDamage(15);
    return '你陷入了剧毒沼泽，损失了 15 点生命值！';
  });
}

const ITEM_FACTORIES = {
  [ITEM_NAMES.POTION]: createPotion,
  [ITEM_NAMES.SWORD]: createSword,
  [ITEM_NAMES.KEY]: createKey,
  [ITEM_NAMES.CRYSTAL]: createCrystal,
};

const DANGER_FACTORIES = {
  [DANGER_NAMES.MONSTER]: createMonster,
  [DANGER_NAMES.SWAMP]: createSwamp,
};

/** 按名字重建物品（用于读档还原）。 */
export function createItemByName(name) {
  const factory = ITEM_FACTORIES[name];
  return factory ? factory() : null;
}

/** 按名字重建危险（用于读档还原）。 */
export function createDangerByName(name) {
  const factory = DANGER_FACTORIES[name];
  return factory ? factory() : null;
}