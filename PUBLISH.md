# 发布指南

## 构建与发布步骤

### 1. 安装依赖

```bash
pnpm install
```

### 2. 构建包

```bash
pnpm build
```

这将生成：
- `dist/index.js` - 主入口（Rsbuild 插件 + 工具函数）
- `dist/vue.js` - Vue 插件
- `dist/index.d.ts` - TypeScript 类型定义
- `dist/vue.d.ts` - Vue 插件类型定义

### 3. 测试本地包

在其他项目中测试：

```bash
# 在 check-version 目录
pnpm link --global

# 在你的项目中
pnpm link --global @jd/rsbuild-plugin-version-check
```

### 4. 发布到 npm

#### 首次发布

```bash
# 登录 npm（如果还没登录）
npm login

# 发布
npm publish --access public
```

#### 后续更新

```bash
# 更新版本号
pnpm release  # 或手动: npm version patch/minor/major

# 发布
npm publish
```

## 在其他项目中使用

### 安装

```bash
pnpm add @jd/rsbuild-plugin-version-check
```

### 配置

**Rsbuild:**

```typescript
// rsbuild.config.ts
import { rsbuildVersionPlugin } from '@jd/rsbuild-plugin-version-check'

export default defineConfig({
  plugins: [
    rsbuildVersionPlugin(),
  ],
})
```

**Vue:**

```typescript
// main.ts
import { createVersionCheck } from '@jd/rsbuild-plugin-version-check/vue'

app.use(createVersionCheck({
  onUpdateAvailable: ({ latestVersion }) => {
    // 显示你的通知
  }
}))
```

## 注意事项

1. **包名**: 如果发布到 JD 内部 npm，确保包名为 `@jd/rsbuild-plugin-version-check`
2. **访问权限**: 首次发布时使用 `--access public` 使包公开可用
3. **版本管理**: 遵循语义化版本规范（Semantic Versioning）
4. **测试**: 发布前务必在实际项目中测试

## 版本升级

- `patch`: Bug 修复 (1.0.0 → 1.0.1)
- `minor`: 新功能（向后兼容） (1.0.0 → 1.1.0)
- `major`: 破坏性更改 (1.0.0 → 2.0.0)

```bash
npm version patch  # 小版本
npm version minor  # 中版本
npm version major  # 大版本
```
