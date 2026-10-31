import { Game, GAME_STATES } from './core/Game.js';
import { SaveManager } from './core/SaveManager.js';
import * as dom from './ui/dom.js';
import './styles.css';

let game = new Game();
const saveManager = new SaveManager(window.localStorage);

const app = document.getElementById('app');

const els = {
  map: document.getElementById('map'),
  messages: document.getElementById('messages'),
  healthBar: document.getElementById('health-bar'),
  healthText: document.getElementById('health-text'),
  position: document.getElementById('position'),
  objective: document.getElementById('objective'),
  inventory: document.getElementById('inventory'),
  commandForm: document.getElementById('command-form'),
  commandInput: document.getElementById('command-input'),
  endTitle: document.getElementById('end-title'),
  endMessage: document.getElementById('end-message'),
};

function refresh() {
  dom.renderMap(game.world, game.player, els.map);
  dom.renderHud(game, {
    healthBar: els.healthBar,
    healthText: els.healthText,
    position: els.position,
  });
  dom.renderInventory(game, els.inventory);
  els.objective.textContent = game.objective;
}

function refreshMessages() {
  dom.renderMessages(game, els.messages);
}

function showEnd(title, message) {
  els.endTitle.textContent = title;
  els.endMessage.textContent = message;
  dom.activateScreen(app, 'screen-end');
}

function maybeShake(healthBefore) {
  if (game.player.health < healthBefore) dom.triggerShake(els.map);
  refresh();
  refreshMessages();
  if (game.state === GAME_STATES.WON) {
    showEnd('🎉 冒险成功', '你找到了魔法水晶，守护了这片森林！');
  } else if (game.state === GAME_STATES.LOST) {
    showEnd('💀 冒险失败', '你在探索中倒下了……再试一次吧！');
  }
}

function runCommand(command) {
  if (!game.player || game.state !== GAME_STATES.PLAYING) return;
  const healthBefore = game.player.health;
  game.processCommand(command);
  maybeShake(healthBefore);
}

function useItemByIndex(index) {
  if (!game.player || game.state !== GAME_STATES.PLAYING) return;
  const healthBefore = game.player.health;
  game.useItemByIndex(index);
  maybeShake(healthBefore);
}

function startGame() {
  // 每局使用不同的伪随机种子，让世界独一无二
  game.world.seed = Math.floor(Math.random() * 1_000_000);
  game.start();
  dom.activateScreen(app, 'screen-game');
  refresh();
  refreshMessages();
}

function loadGame() {
  const data = saveManager.load();
  if (!data) {
    dom.appendMessage('⚠️ 没有找到可读取的存档。', els.messages);
    return;
  }
  game = Game.restore(data);
  dom.activateScreen(app, 'screen-game');
  refresh();
  refreshMessages();
}

document.getElementById('btn-start').addEventListener('click', startGame);
document.getElementById('btn-again').addEventListener('click', startGame);

document.getElementById('btn-restart').addEventListener('click', startGame);
document.getElementById('btn-save').addEventListener('click', () => {
  saveManager.save(game.toJSON());
  dom.appendMessage('💾 已保存游戏进度。', els.messages);
});
document.getElementById('btn-load').addEventListener('click', loadGame);

document.getElementById('btn-fullscreen-welcome').addEventListener('click', () => {
  dom.toggleFullscreen(document.documentElement);
});
document.getElementById('btn-fullscreen-game').addEventListener('click', () => {
  dom.toggleFullscreen(document.documentElement);
});

// 屏幕方向键（也支持触屏点击）
app.querySelectorAll('[data-command]').forEach((button) => {
  button.addEventListener('click', () => runCommand(button.dataset.command));
});

// 文本指令输入
els.commandForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = els.commandInput.value.trim();
  els.commandInput.value = '';
  if (text) runCommand(text);
});

// 键盘控制与滑动手势
dom.bindKeys({ onCommand: runCommand, onUseIndex: useItemByIndex });
dom.bindSwipe(els.map, runCommand);