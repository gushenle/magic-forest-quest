/**
 * UI 渲染与事件绑定模块：所有对 DOM 的操作都集中在这里，
 * 便于在单元测试中用 jsdom / mock 覆盖依赖 Web API 的代码。
 */

const KEY_TO_COMMAND = {
  ArrowUp: 'north',
  ArrowDown: 'south',
  ArrowLeft: 'west',
  ArrowRight: 'east',
  w: 'north',
  s: 'south',
  a: 'west',
  d: 'east',
  W: 'north',
  S: 'south',
  A: 'west',
  D: 'east',
  e: 'pick',
  E: 'pick',
  i: 'inventory',
  I: 'inventory',
  l: 'look',
  L: 'look',
  h: 'help',
  H: 'help',
};

/** 清空元素的所有子节点。 */
export function clear(element) {
  element.replaceChildren();
  return element;
}

/** 渲染二维地图（按行 + flex 布局，行数/列数由游戏世界决定，无需内联样式）。 */
export function renderMap(world, player, container) {
  clear(container);
  for (let y = 0; y < world.height; y += 1) {
    const row = document.createElement('div');
    row.className = 'map__row';
    row.setAttribute('role', 'row');

    for (let x = 0; x < world.width; x += 1) {
      const location = world.getLocation(x, y);
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.setAttribute('role', 'gridcell');
      tile.dataset.x = String(x);
      tile.dataset.y = String(y);

      const isPlayer = player && player.x === x && player.y === y;
      if (isPlayer) tile.classList.add('tile--player');
      if (!isPlayer && location.hasDanger) tile.classList.add('tile--danger');
      if (location.walkable) tile.classList.add('tile--walkable');
      else tile.classList.add('tile--blocked');

      const symbol = document.createElement('span');
      symbol.className = 'tile__symbol';
      symbol.textContent = isPlayer ? '🧙' : location.symbol;
      tile.appendChild(symbol);

      if (location.hasItems) {
        const badge = document.createElement('span');
        badge.className = 'tile__item';
        badge.textContent = location.items[0].symbol;
        tile.appendChild(badge);
      }

      row.appendChild(tile);
    }
    container.appendChild(row);
  }
  return container;
}

/** 更新 HUD：生命值、位置等（只设置 content/属性与类，不做内联样式）。 */
export function renderHud(game, els) {
  const { player } = game;
  if (els.healthBar && player) {
    els.healthBar.max = player.maxHealth;
    els.healthBar.value = player.health;
    els.healthBar.classList.toggle('health--low', player.health <= 30);
  }
  if (els.healthText && player) {
    els.healthText.textContent = `${player.health} / ${player.maxHealth}`;
  }
  if (els.position && player) {
    els.position.textContent = `位置 (${player.x}, ${player.y})`;
  }
  return els;
}

/** 渲染背包栏。 */
export function renderInventory(game, container) {
  clear(container);
  const items = game.player ? game.player.inventory : [];
  if (items.length === 0) {
    const empty = document.createElement('span');
    empty.className = 'inventory__empty';
    empty.textContent = '空';
    container.appendChild(empty);
    return container;
  }
  items.forEach((item, index) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'inventory__item';
    chip.dataset.index = String(index);
    chip.title = item.description;
    chip.textContent = `${index + 1}. ${item.symbol} ${item.name}`;
    container.appendChild(chip);
  });
  return container;
}

/** 向消息日志追加一条消息。 */
export function appendMessage(message, logElement) {
  const entry = document.createElement('p');
  entry.className = 'message';
  entry.textContent = message;
  logElement.appendChild(entry);
  logElement.scrollTop = logElement.scrollHeight;
  return entry;
}

/** 用游戏的全部消息重绘日志。 */
export function renderMessages(game, logElement) {
  clear(logElement);
  game.messages.forEach((message) => appendMessage(message, logElement));
  return logElement;
}

/** 切换某个画面（id 匹配的 .screen 会获得 .screen--active）。 */
export function activateScreen(root, screenId) {
  root.querySelectorAll('.screen').forEach((screen) => {
    screen.classList.toggle('screen--active', screen.id === screenId);
  });
  return root;
}

/** 切换到全屏/退出全屏（依赖 Web Fullscreen API）。 */
export function toggleFullscreen(target = document.documentElement) {
  if (!document.fullscreenElement) {
    return typeof target.requestFullscreen === 'function'
      ? target.requestFullscreen()
      : Promise.resolve();
  }
  return typeof document.exitFullscreen === 'function'
    ? document.exitFullscreen()
    : Promise.resolve();
}

/** 触发地图的抖动动画（受伤反馈，通过增删 CSS 类实现）。 */
export function triggerShake(element) {
  element.classList.remove('map--shake');
  void element.offsetWidth;
  element.classList.add('map--shake');
  return element;
}

/** 绑定键盘事件：命名按键触发指令，数字键触发「按索引使用物品」。 */
export function bindKeys({ onCommand, onUseIndex }) {
  function handler(event) {
    if (KEY_TO_COMMAND[event.key]) {
      event.preventDefault();
      onCommand(KEY_TO_COMMAND[event.key]);
      return;
    }
    if (/^[1-9]$/.test(event.key) && onUseIndex) {
      event.preventDefault();
      onUseIndex(Number(event.key) - 1);
    }
  }
  window.addEventListener('keydown', handler);
  return {
    unbind() {
      window.removeEventListener('keydown', handler);
    },
  };
}

/** 绑定滑动（touch）手势：把上下左右滑动映射为移动指令。 */
export function bindSwipe(element, onCommand) {
  const THRESHOLD = 30;
  let startX = 0;
  let startY = 0;
  let tracking = false;

  function handleStart(x, y) {
    startX = x;
    startY = y;
    tracking = true;
  }

  function handleEnd(x, y) {
    if (!tracking) return;
    tracking = false;
    const dx = x - startX;
    const dy = y - startY;
    if (Math.abs(dx) < THRESHOLD && Math.abs(dy) < THRESHOLD) return;
    if (Math.abs(dx) > Math.abs(dy)) onCommand(dx > 0 ? 'east' : 'west');
    else onCommand(dy > 0 ? 'south' : 'north');
  }

  function onTouchStart(event) {
    const touch = event.touches[0];
    handleStart(touch.clientX, touch.clientY);
  }

  function onTouchEnd(event) {
    const touch = event.changedTouches[0];
    handleEnd(touch.clientX, touch.clientY);
  }

  element.addEventListener('touchstart', onTouchStart, { passive: true });
  element.addEventListener('touchend', onTouchEnd, { passive: true });

  return {
    unbind() {
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchend', onTouchEnd);
    },
  };
}