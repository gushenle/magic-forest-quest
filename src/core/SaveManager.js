/**
 * 存档管理器：借助 Web Storage API（localStorage）保存与读取游戏状态。
 * 存储对象由外部注入，便于在单元测试中 mock。
 */
export class SaveManager {
  constructor(storage, key = 'adventure-game-save') {
    this.storage = storage;
    this.key = key;
  }

  /** 保存纯数据快照（JSON 序列化后写入存储）。 */
  save(data) {
    this.storage.setItem(this.key, JSON.stringify(data));
  }

  /** 读取并解析存档，若不存在或解析失败返回 null。 */
  load() {
    const raw = this.storage.getItem(this.key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  hasSave() {
    return this.storage.getItem(this.key) !== null;
  }

  clear() {
    this.storage.removeItem(this.key);
  }
}