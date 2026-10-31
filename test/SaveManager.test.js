import { describe, it, expect } from 'vitest';
import { SaveManager } from '../src/core/SaveManager.js';

/** 内存版 Web Storage mock，模拟 localStorage 的接口。 */
function fakeStorage() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
  };
}

describe('SaveManager', () => {
  it('保存并读取数据', () => {
    const saveManager = new SaveManager(fakeStorage());
    saveManager.save({ health: 55 });
    expect(saveManager.hasSave()).toBe(true);
    expect(saveManager.load()).toEqual({ health: 55 });
  });

  it('无存档时返回 null', () => {
    const saveManager = new SaveManager(fakeStorage());
    expect(saveManager.hasSave()).toBe(false);
    expect(saveManager.load()).toBeNull();
  });

  it('非法 JSON 时返回 null', () => {
    const storage = fakeStorage();
    const saveManager = new SaveManager(storage);
    storage.setItem('adventure-game-save', '{bad json');
    expect(saveManager.load()).toBeNull();
  });

  it('清除存档', () => {
    const saveManager = new SaveManager(fakeStorage());
    saveManager.save({ health: 55 });
    saveManager.clear();
    expect(saveManager.hasSave()).toBe(false);
  });
});