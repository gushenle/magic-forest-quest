/**
 * 危险类：代表地图上的威胁（怪物、沼泽等）。
 * 当玩家到达危险所在地时，调用其效果函数对玩家施加影响。
 */
export class Danger {
  constructor({ name, description, symbol = '⚠️' }) {
    this.name = name;
    this.description = description;
    this.symbol = symbol;
    this._effect = null;
  }

  /** 设置应用到玩家身上的效果函数。 */
  setEffect(effect) {
    this._effect = effect;
    return this;
  }

  /**
   * 对玩家施加危险效果。
   * @param {import('./Player.js').Player} player
   * @returns {string} 施加后返回给玩家的消息
   */
  apply(player) {
    if (!this._effect) {
      return `你遇到了「${this.name}」，但似乎什么也没发生。`;
    }
    return this._effect(player);
  }
}