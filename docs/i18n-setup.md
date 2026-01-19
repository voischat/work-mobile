# Vue I18n Setup with YAML

本项目已配置 Vue I18n 支持，使用 YAML 格式存储翻译文件。

## 📁 文件结构

```
src/
├── locales/
│   ├── en.yaml      # 英文翻译
│   └── zh-CN.yaml   # 简体中文翻译
├── i18n.ts          # i18n 配置
└── main.ts          # 应用入口（已配置 i18n）
```

## 🚀 使用方法

### 1. 在组件中使用（Composition API）

```vue
<script setup lang="ts">
// useI18n 已通过 auto-import 自动导入
const { t, locale } = useI18n()
</script>

<template>
  <div>
    <!-- 使用 t() 函数翻译 -->
    <h1>{{ t('hello') }}</h1>
    <button>{{ t('login') }}</button>

    <!-- 切换语言 -->
    <select v-model="locale">
      <option value="zh-CN">
        中文
      </option>
      <option value="en">
        English
      </option>
    </select>
  </div>
</template>
```

### 2. 在模板中使用（$t 语法）

```vue
<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
    <button>{{ $t('logout') }}</button>
  </div>
</template>
```

### 3. 添加新的翻译

在 `src/locales/` 目录下编辑对应的 YAML 文件：

**src/locales/zh-CN.yaml:**

```yaml
hello: 你好
welcome: 欢迎
login: 登录

# 用户相关
user:
  profile: 用户资料
  settings: 设置
```

**src/locales/en.yaml:**

```yaml
hello: Hello
welcome: Welcome
login: Login

# User related
user:
  profile: User Profile
  settings: Settings
```

使用嵌套的 key：

```vue
<template>
  <div>{{ t('user.profile') }}</div>
</template>
```

### 4. 在 Vue 组件的 `<i18n>` 块中使用

```vue
<script setup lang="ts">
const { t } = useI18n({
  inheritLocale: true,
  useScope: 'local'
})
</script>

<template>
  <div>{{ t('componentSpecific') }}</div>
</template>

<!-- 组件级别的翻译 -->
<i18n lang="yaml">
en:
  componentSpecific: This is component specific
zh-CN:
  componentSpecific: 这是组件特定的
</i18n>
```

## 🔧 配置说明

### Vite 配置

`vite.config.ts` 已配置 `@intlify/unplugin-vue-i18n`：

```ts
VueI18n({
  include: [path.resolve(__dirname, './src/locales/**')]
})
```

这会自动处理 `src/locales/` 下的所有翻译文件（支持 `.json`, `.yaml`, `.yml` 等格式）。

### ESLint 配置

已启用 `@intlify/eslint-plugin-vue-i18n` 来检测：

- 硬编码的文本（应该使用 i18n）
- 缺失的翻译 key
- 未使用的翻译 key
- 重复的 key

运行 `pnpm lint` 查看所有需要国际化的文本。

### TypeScript 支持

`tsconfig.json` 已添加类型支持：

```json
{
  "compilerOptions": {
    "types": [
      "@intlify/unplugin-vue-i18n/messages"
    ]
  }
}
```

## 📚 相关文档

- [Vue I18n 官方文档](https://vue-i18n.intlify.dev/)
- [unplugin-vue-i18n](https://github.com/intlify/bundle-tools/tree/main/packages/unplugin-vue-i18n)
- [eslint-plugin-vue-i18n](https://eslint-plugin-vue-i18n.intlify.dev/)
