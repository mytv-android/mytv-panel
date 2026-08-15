# ASR 翻译引擎设置卡片设计

日期: 2026-06-16  
状态: 已获用户口头批准,待实现计划  
范围: Angular Player 设置页内的 ASR 配置区改造

## 1. 背景

MyTV Panel 是 Angular 21 配置面板。当前 ASR 相关字段已经存在于 `AppConfigs`,并已在 `src/app/player/player.component.html` 中暴露为一组内嵌设置。用户要求:「ASR翻译引擎相关设置参考云同步的面板设计」。

已确认的上下文:

- 云同步面板位于 `src/app/backup/`,使用 `mat-button-toggle-group` 选择 provider,用 `@if` 渲染 provider 专属字段,并通过单个按钮提交配置。
- 当前 ASR UI 位于 Player 页,不是独立路由。
- 用户已选择「原地·整块 ASR 卡片」方案:不新增路由/菜单,在 Player 页内把整个 ASR 区重排为一张云同步风格卡片。
- 用户已选择「单个保存按钮」提交语义:卡片内字段修改只更新本地 `configs`,点击保存后再持久化。

## 2. 目标

在 `src/app/player/` 中将现有 ASR 区改造成一个内嵌卡片:

1. 把实时 ASR 开关、模型路径、ASR 模式、字幕提前量、静音阈值、翻译引擎选择、目标语言、各引擎凭据集中到一个视觉分组里。
2. 把翻译引擎选择从 `mat-select` 下拉改为类似云同步的 `mat-button-toggle-group`。
3. 给翻译引擎引入 TypeScript 枚举和 label map,替代模板里的硬编码字符串比较。
4. 卡片内改为单个「保存」按钮提交,不再每个字段变化后立即 POST。
5. 保持后端 wire value 不变:`''`, `tencent`, `baidu`, `mtranserver`。
6. 保持 Player 页路由和菜单不变。
7. 确保英文、中文、阿拉伯语 i18n 文件均为合法 JSON,且新 key 三语齐全。

## 3. 非目标

本次不做以下事项:

- 不新增 `/asr` 路由、菜单项或独立组件。
- 不迁移音量平衡设置;`videoPlayerVolumeBalanceLevel` 仍保持在 ASR 卡片外。
- 不修改 Android 后端配置同步逻辑;相关后端状态由 `ASR_SYNC_*.md` 记录,本仓库无法验证。
- 不实现语言切换持久化(localStorage)。这是探索中发现的独立 UX 问题。
- 不新增客户端数值钳制。`videoPlayerASRLeadTimeMs` 和 `videoPlayerASRSilenceThresholdMs` 继续由后端/Android 端处理范围。
- 不新增翻译引擎连通性测试接口或按钮;当前 API 没有相应 endpoint。

## 4. 用户体验设计

### 4.1 卡片位置

卡片仍在 Player 页面当前 ASR 区所在位置,即音量平衡设置之后、DNS 设置之前。

### 4.2 卡片结构

卡片使用内嵌 bordered section,而不是新建路由或顶层页面卡片。结构为:

```text
Player 设置页
┌─ ASR 语音识别 ─────────────────┐
│ 实时识别                 [开 ●]  │
│ 模型 [_______________________]  │
│ 模式 [Renderer only ▾]          │
│ 提前量 [500] ms                 │
│ 静音阈值 [650] ms               │
│ 翻译引擎                        │
│ [ 不翻译 ][腾讯][百度][MTran]    │
│ 目标语言 [en]                   │
│ 凭据字段(按引擎显示)             │
│                         [保存]  │
└────────────────────────────────┘
```

### 4.3 条件显示

- 实时 ASR 开关关闭时,显示卡片标题、开关和保存按钮,这样用户可以持久化“关闭实时 ASR”的操作。
- 实时 ASR 开关打开时,显示模型、模式、时序、引擎选择、引擎相关字段和保存按钮。
- 翻译引擎为 `NONE`/空串时,不显示目标语言和凭据字段。
- 翻译引擎为 Tencent 时,显示目标语言、Tencent SecretId、Tencent SecretKey。
- 翻译引擎为 Baidu 时,显示目标语言、Baidu AppId、Baidu SecretKey。
- 翻译引擎为 MTranServer 时,显示目标语言、MTranServer URL、MTranServer Token。

### 4.4 提交行为

卡片内所有字段使用 `[(ngModel)]` 更新本地 `configs`,但不绑定 `(change)=updateConfig()` 或 `(selectionChange)=updateConfig()`。

点击「保存」时调用 `saveAsr()`,由它等待配置持久化完成。保存成功显示 3000ms 成功 snackbar;保存失败显示 3000ms 失败 snackbar。

这意味着:

- 开关和引擎选择会立即影响当前页面的条件渲染。
- 保存按钮始终可见,因此“关闭实时 ASR”也可以通过同一个按钮持久化。
- 未点击保存前,刷新页面或服务刷新配置可能丢失卡片内未保存改动。
- 该行为与云同步面板一致,但与 Player 页其它即时保存设置不同。此差异是用户已确认的设计选择。

### 4.5 响应式

引擎按钮组在小屏时竖排,逻辑复用云同步面板的 `BreakpointObserver` 条件:

- `Breakpoints.Handset`
- `Breakpoints.Small`
- `(max-width: 600px)`

## 5. 数据模型设计

### 5.1 新增枚举

在 `src/app/api.ts` 中新增:

```ts
export enum ASRTranslationEngine {
  NONE = '',
  TENCENT = 'tencent',
  BAIDU = 'baidu',
  MTRANSERVER = 'mtranserver',
}

export const ASRTranslationEngineLabels: Record<ASRTranslationEngine, string> = {
  [ASRTranslationEngine.NONE]: 'PLAYER.ASR_NO_TRANSLATION',
  [ASRTranslationEngine.TENCENT]: 'PLAYER.ASR_TENCENT',
  [ASRTranslationEngine.BAIDU]: 'PLAYER.ASR_BAIDU',
  [ASRTranslationEngine.MTRANSERVER]: 'PLAYER.ASR_MTRANSERVER',
};
```

枚举值必须保持与现有后端值一致,以保证已有配置和 Android 端不受影响。

### 5.2 字段类型调整

将 `AppConfigs` 中:

```ts
videoPlayerASRTranslationEngine?: string
```

调整为:

```ts
videoPlayerASRTranslationEngine?: ASRTranslationEngine
```

这是类型层增强,不改变 JSON 序列化结果。

## 6. 组件设计

### 6.1 `player.component.ts`

需要新增 imports:

- `MatButtonToggleModule`
- `MatSnackBar`, `MatSnackBarModule`
- `BreakpointObserver`, `Breakpoints`
- `TranslateService`
- `ASRTranslationEngine`, `ASRTranslationEngineLabels`

新增成员:

```ts
asrTranslationEngines = Object.values(ASRTranslationEngine);
asrTranslationEngineLabels = ASRTranslationEngineLabels;
asrTranslationEngine = ASRTranslationEngine;
isSmallScreen = false;
```

构造函数中保留现有 `effect()` 同步配置,并新增 breakpoint 订阅。

新增方法:

```ts
async saveAsr() {
  try {
    await this.updateConfig();
    this.snackBar.open(this.translate.instant('PLAYER.ASR_SAVED'), undefined, { duration: 3000 });
  } catch {
    this.snackBar.open(this.translate.instant('PLAYER.ASR_SAVE_FAILED'), undefined, { duration: 3000 });
  }
}
```

`updateConfig()` 保持通用,供 Player 其它即时保存设置和 ASR 保存按钮共同使用。为便于 `saveAsr()` 等待结果,实现时让 `updateConfig()` 返回 `this.configsService.updateData(this.configs)` 的 Promise;现有模板事件和其它方法可以继续忽略这个返回值。

### 6.2 `player.component.html`

替换现有 ASR 区:

- 保留 `PLAYER.ASR_REAL_TIME`, `PLAYER.ASR_REAL_TIME_DESC` 文案。
- 删除 ASR 卡片内部所有字段的自动保存事件。
- 翻译引擎使用 `mat-button-toggle-group`。
- `@if` 比较使用 `asrTranslationEngine.TENCENT` 等枚举常量。
- 密钥字段继续使用 `type="password"`。
- MTranServer URL placeholder 保持 `http://your-server:port`。
- 保存按钮使用 `PLAYER.ASR_SAVE`。

### 6.3 `player.component.css`

新增局部样式:

```css
.asr-card { ... }
.asr-card-title { ... }
.form-row { ... }
.action-container { ... }
.full-width { width: 100%; }
```

样式应与现有 `.setting-item`, `.setting-label`, `.setting-desc` 共存,避免破坏 Player 页其它设置。

## 7. i18n 设计

新增 `PLAYER` 下的 4 个 key,写入 `public/i18n/en.json`, `public/i18n/zh.json`, `public/i18n/ar.json`:

```json
"ASR_CARD_TITLE": "ASR Speech Recognition",
"ASR_SAVE": "Save",
"ASR_SAVED": "Settings saved",
"ASR_SAVE_FAILED": "Failed to save settings"
```

中文:

```json
"ASR_CARD_TITLE": "ASR 语音识别",
"ASR_SAVE": "保存",
"ASR_SAVED": "设置已保存",
"ASR_SAVE_FAILED": "保存设置失败"
```

阿拉伯语:

```json
"ASR_CARD_TITLE": "التعرّف الصوتي ASR",
"ASR_SAVE": "حفظ",
"ASR_SAVED": "تم حفظ الإعدادات",
"ASR_SAVE_FAILED": "فشل حفظ الإعدادات"
```

实现后必须用 JSON parser 校验三份文件合法。特别注意中文文件不能再出现未转义 ASCII 双引号。

## 8. 错误处理与反馈

`ConfigsService.updateData()` is `async` and awaits `AppApi.changeConfig()` plus `refresh()`. `player.component.ts` should make `updateConfig()` return that Promise, so `saveAsr()` can await it.

On success, show `PLAYER.ASR_SAVED`. On failure, catch the error and show `PLAYER.ASR_SAVE_FAILED`. Both snackbars use 3000ms duration. This gives the ASR card better feedback than the existing per-field Player settings without changing the global config service.

## 9. 测试与验收

实现后执行:

1. `node` 解析 `public/i18n/en.json`, `zh.json`, `ar.json`,确认三者均为合法 JSON。
2. `npm run build`,确认 Angular 构建通过。
3. 人工检查 Player 页:
   - ASR 卡片显示在音量平衡后、DNS 前。
   - 关闭实时 ASR 时,下方字段隐藏,但保存按钮仍可见。
   - 打开实时 ASR 时,显示模型、模式、时序、引擎按钮组、保存按钮。
   - 不翻译时不显示目标语言和凭据。
   - Tencent/Baidu/MTranServer 分别显示正确字段。
   - 小屏下引擎按钮组竖排。
   - 点击保存成功后出现成功 toast;保存失败时出现失败 toast。
4. 回归检查:
   - Player 页其它设置仍即时保存。
   - ASR 字段 wire value 仍为 `''`, `tencent`, `baidu`, `mtranserver`。

## 10. 相关已处理问题

探索过程中发现并修复了中文无法切换的直接原因:`public/i18n/zh.json` 中 `CLASSIC_SHOW_SOURCE_LIST_DESC` 含未转义 ASCII 双引号,导致 JSON parse 失败。源码已改为中文全角引号。若运行构建产物,仍需重新 `npm run build` 才会更新 `dist` 中的旧文件。

该修复与 ASR 卡片设计相关,因为后续会继续编辑三语 i18n 文件,需要确保每次修改后都重新校验 JSON 合法性。
