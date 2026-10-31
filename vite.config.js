import { defineConfig } from 'vitest/config';

export default defineConfig({
  // GitHub Pages 部署在 https://<用户>.github.io/<仓库名>/ 子路径下，
  // 构建时由 CI 注入 GHP_BASE=/<仓库名>/，本地开发默认使用根路径。
  base: process.env.GHP_BASE || '/',
  test: {
    environment: 'node',
    include: ['test/**/*.test.js'],
  },
});