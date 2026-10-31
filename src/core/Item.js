/**
 * 物品类：拥有名称、描述与图形符号，以及一个「动作名 -> 箭头函数」的映射。
 * 玩家选择对某物品执行动作时，调用对应的箭头函数。
 */
export class Item {
  constructor({ name, description, symbol = '📦' }) {
    this.name = name;
    this.description = description;
    this.symbol = symbol;
    /** @type {Map<string, Function>} 动作名到箭头函数的映射 */
    this.actions = new Map();
  }

  /** 注册一个新的可用动作（值必须是箭头函数）。 */
  addAction(actionName, action) {
    this.actions.set(actionName, action);
    return this;
  }

  hasAction(actionName) {
    return this.actions.has(actionName);
  }

  listActions() {
    return [...this.actions.keys()];
  }

  /**
   * 使用该物品的某个动作。
   * @param {string} actionName 动作名
   * @param {object} context 传给动作的上下文（如 player、game）
   */
  use(actionName, context = {}) {
    const action = this.actions.get(actionName);
    if (!action) {
      throw new Error(`物品「${this.name}」没有名为「${actionName}」的动作`);
    }
    return action(context);
  }
}