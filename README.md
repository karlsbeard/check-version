# rsbuild-plugin-version-check

> 自动检测应用版本更新并友好提示用户刷新

[![npm version](https://img.shields.io/npm/v/rsbuild-plugin-version-check.svg)](https://www.npmjs.com/package/rsbuild-plugin-version-check)
[![License](https://img.shields.io/npm/l/rsbuild-plugin-version-check.svg)](./LICENSE.md)

## 特性

- ✅ **自动检测** - 每 5 分钟自动检查版本更新
- ✅ **零配置** - 开箱即用
- ✅ **非侵入式** - 用户自主选择刷新时机
- ✅ **强制刷新** - 清除所有缓存（模拟 Cmd+Shift+R）
- ✅ **完全可定制** - 支持自定义所有选项
- ✅ **TypeScript** - 完整的类型支持

## 安装

```bash
pnpm add rsbuild-plugin-version-check
# or
npm install rsbuild-plugin-version-check
```

## 快速开始

### 1. 配置 Rsbuild

```typescript
// rsbuild.config.ts
import { defineConfig } from '@rsbuild/core'
import { rsbuildVersionPlugin } from 'rsbuild-plugin-version-check'

export default defineConfig({
  plugins: [
    rsbuildVersionPlugin(), // 添加这一行即可
  ],
})
```

每次构建时会自动在 `dist/` 目录生成 `version.json`。

### 2. 集成到 Vue 应用

#### 方式 A：使用 Vue 插件（推荐）

```typescript
// src/main.ts
import { createApp } from 'vue'
import { createVersionCheck } from 'rsbuild-plugin-version-check/vue'
import App from './App.vue'

const app = createApp(App)

app.use(createVersionCheck({
  onUpdateAvailable: ({ latestVersion }) => {
    // 显示你自己的通知组件
    console.log(`新版本 ${latestVersion} 可用`)
  }
}))

app.mount('#app')
```

#### 方式 B：手动集成

```typescript
// src/App.vue
<script setup>
import { onMounted } from 'vue'
import { initVersionCheck, initializeVersion } from 'rsbuild-plugin-version-check'

onMounted(async () => {
  await initializeVersion()

  const cleanup = initVersionCheck({
    onUpdateAvailable: ({ latestVersion }) => {
      // 处理更新通知
    }
  })

  // 组件卸载时清理
  onUnmounted(cleanup)
})
</script>
```

## API 文档

### Rsbuild 插件

```typescript
rsbuildVersionPlugin(options?: RsbuildVersionPluginOptions)
```

**选项：**

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `filename` | `string` | `'version.json'` | 输出文件名 |
| `versionInfo` | `(pkg) => object` | - | 自定义版本信息生成器 |
| `debug` | `boolean` | `false` | 启用调试日志 |

**示例：**

```typescript
rsbuildVersionPlugin({
  filename: 'app-version.json',
  versionInfo: packageJson => ({
    version: packageJson.version,
    buildTime: new Date().toISOString(),
    gitCommit: process.env.GIT_COMMIT,
    environment: process.env.NODE_ENV,
  }),
  debug: true,
})
```

### Vue 插件

```typescript
createVersionCheck(options?: VueVersionCheckOptions)
```

**选项：**

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `checkInterval` | `number` | `300000` | 检查间隔（毫秒），默认 5 分钟 |
| `initialDelay` | `number` | `10000` | 初始检查延迟（毫秒），默认 10 秒 |
| `versionUrl` | `string` | `'/version.json'` | 版本文件 URL |
| `storageKey` | `string` | `'app_version'` | LocalStorage 键名 |
| `onUpdateAvailable` | `function` | - | 更新回调函数 |
| `autoStart` | `boolean` | `true` | 自动启动检查 |

**示例：**

```typescript
app.use(createVersionCheck({
  checkInterval: 2 * 60 * 1000, // 每 2 分钟检查一次
  onUpdateAvailable: ({ currentVersion, latestVersion }) => {
    if (confirm(`发现新版本 ${latestVersion}，是否立即刷新？`)) {
      window.location.reload()
    }
  },
}))
```

### Composition API

```typescript
import { useVersionCheck } from 'rsbuild-plugin-version-check/vue'

const versionCheck = useVersionCheck()

// 立即检查
await versionCheck.checkNow()

// 启动/停止
versionCheck.start()
versionCheck.stop()
```

### 工具函数

```typescript
import {
  checkForUpdates,
  forceReload,
  getCurrentVersion
} from 'rsbuild-plugin-version-check'

// 强制刷新（清除缓存）
forceReload()

// 手动检查更新
const result = await checkForUpdates()
if (result.hasUpdate) {
  console.log('新版本:', result.latestVersion)
}

// 获取当前版本
const version = getCurrentVersion()
```

## 高级用法

### 集成 UI 库通知

使用任何你喜欢的 UI 库来展示更新通知：

```typescript
import { createVersionCheck, forceReload } from 'rsbuild-plugin-version-check/vue'
// 示例：使用你的 UI 库通知组件
import { notification } from 'your-ui-library'

app.use(createVersionCheck({
  onUpdateAvailable: ({ latestVersion }) => {
    notification.info({
      title: '新版本可用',
      message: `版本 ${latestVersion} 已发布，建议刷新获取最新功能`,
      duration: 0,
      showClose: true,
      onClose: () => forceReload(),
    })
  }
}))
```

### Element Plus 集成示例

```typescript
import { createVersionCheck, forceReload } from 'rsbuild-plugin-version-check/vue'
import { ElNotification } from 'element-plus'

app.use(createVersionCheck({
  onUpdateAvailable: ({ latestVersion }) => {
    ElNotification({
      title: '新版本可用',
      message: `版本 ${latestVersion}，点击刷新`,
      type: 'info',
      duration: 0,
      onClick: () => forceReload(),
    })
  }
}))
```

### 自定义通知组件

创建你自己的通知 UI：

```vue
<!-- VersionNotification.vue -->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { forceReload, useVersionCheck } from 'rsbuild-plugin-version-check/vue'

const show = ref(false)
const version = ref('')
const versionCheck = useVersionCheck()

onMounted(async () => {
  const result = await versionCheck.checkNow()
  if (result.hasUpdate) {
    show.value = true
    version.value = result.latestVersion
  }
})

function refresh() {
  forceReload()
}

function close() {
  show.value = false
}
</script>

<template>
  <div v-if="show" class="version-notification">
    <p>发现新版本 {{ version }}！</p>
    <button @click="refresh">
      立即刷新
    </button>
    <button @click="close">
      稍后
    </button>
  </div>
</template>
```

### 不使用 Vue 插件

如果你想完全手动控制：

```typescript
import { forceReload, initVersionCheck } from 'rsbuild-plugin-version-check'

const cleanup = initVersionCheck({
  checkInterval: 5 * 60 * 1000,
  onUpdateAvailable: ({ latestVersion }) => {
    // 显示你的通知
    if (confirm(`新版本 ${latestVersion} 可用，是否刷新？`)) {
      forceReload()
    }
  }
})

// 清理时调用
cleanup()
```

## 部署配置

### 防止 version.json 被缓存

**Nginx:**

```nginx
location = /version.json {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires "0";
}
```

**CDN:** 配置 CDN 跳过 `version.json` 缓存或设置 TTL 为 1 分钟。

## 工作原理

1. **构建时**: Rsbuild 插件从 `package.json` 读取版本号并生成 `version.json`
2. **运行时**: 应用启动后获取 `version.json` 并存储到 localStorage
3. **定期检查**: 每 5 分钟对比 localStorage 中的版本与服务器版本
4. **更新检测**: 如果版本不一致，调用 `onUpdateAvailable` 回调
5. **用户操作**: 用户通过你的自定义 UI 决定何时刷新

## 常见问题

**Q: 多久检查一次？**
A: 默认 5 分钟。可通过 `checkInterval` 配置。

**Q: 支持微前端吗？**
A: 支持，每个子应用可以独立进行版本检查。

**Q: 可以禁用自动检查吗？**
A: 可以，设置 `autoStart: false` 并手动调用 `versionCheck.start()`。

**Q: version.json 被缓存怎么办？**
A: 插件会添加时间戳参数防止缓存，同时建议配置服务器禁用缓存（见部署配置）。

**Q: 可以自定义版本信息吗？**
A: 可以，使用 `versionInfo` 选项自定义生成逻辑。

## 完整示例

查看 [examples](./examples) 目录获取完整示例项目。

## 许可证

[MIT](./LICENSE.md)

## 贡献

欢迎提交 Issue 和 Pull Request！
