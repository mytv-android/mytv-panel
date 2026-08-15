# ASR配置同步完整性报告

**报告时间**: 2026-06-15 04:09  
**检查范围**: ASR相关的所有配置字段  
**结论**: ⚠️ **发现Android后端代码缺陷**

---

## ✅ Angular前端 (mytv-panel)

### 修复内容

**问题**: `videoPlayerASRTranslationMTranServerURL` 字段命名错误  
**修复**: 改为 `videoPlayerASRTranslationMTranServerUrl` (驼峰命名)

**修改文件**:
1. `src/app/api.ts` (line 187)
2. `src/app/player/player.component.html` (line 335)

### 字段完整性检查 ✅

Angular的`AppConfigs`接口包含所有13个ASR字段：

```typescript
videoPlayerRealTimeASR?: boolean
videoPlayerASRModel?: string
videoPlayerASRTranslationEngine?: string
videoPlayerASRTranslationTargetLang?: string
videoPlayerASRTranslationTencentSecretId?: string
videoPlayerASRTranslationTencentSecretKey?: string
videoPlayerASRTranslationBaiduAppId?: string
videoPlayerASRTranslationBaiduSecretKey?: string
videoPlayerASRTranslationMTranServerUrl?: string  // ✅ 已修复
videoPlayerASRTranslationMTranServerToken?: string
videoPlayerASRMode?: ASRMode
videoPlayerASRLeadTimeMs?: number
videoPlayerASRSilenceThresholdMs?: number
```

### ASRMode枚举 ✅

```typescript
export enum ASRMode {
    RENDERER_ONLY = 'RENDERER_ONLY',
    SOURCE_TAP_PREFERRED = 'SOURCE_TAP_PREFERRED',
}
```

完全匹配Android的定义。

### 编译状态 ✅

```bash
npm run build
✅ Building... 成功
✅ Initial total: 1.35 MB
✅ Output: dist/mytv-panel
```

---

## ❌ Android后端 (mytv-android)

### 🚨 发现严重缺陷

**文件**: `tv/src/main/java/top/yogiczy/mytv/tv/ui/utils/Configs.kt`

#### 问题1: Partial数据类缺少字段

`Configs.Partial`数据类（line 1490-1609）中**只包含2个ASR字段**：

```kotlin
val videoPlayerASRLeadTimeMs: Int? = null,          // line 1573
val videoPlayerASRSilenceThresholdMs: Int? = null,  // line 1574
```

**缺少的11个字段**：
- ❌ `videoPlayerRealTimeASR: Boolean?`
- ❌ `videoPlayerASRModel: String?`
- ❌ `videoPlayerASRTranslationEngine: String?`
- ❌ `videoPlayerASRTranslationTargetLang: String?`
- ❌ `videoPlayerASRTranslationTencentSecretId: String?`
- ❌ `videoPlayerASRTranslationTencentSecretKey: String?`
- ❌ `videoPlayerASRTranslationBaiduAppId: String?`
- ❌ `videoPlayerASRTranslationBaiduSecretKey: String?`
- ❌ `videoPlayerASRTranslationMTranServerUrl: String?`
- ❌ `videoPlayerASRTranslationMTranServerToken: String?`
- ❌ `videoPlayerASRMode: ASRMode?`

#### 问题2: toPartial()方法缺少序列化逻辑

`toPartial()`方法（line 1246-1365）中**只序列化2个ASR字段**：

```kotlin
videoPlayerASRLeadTimeMs = videoPlayerASRLeadTimeMs,          // line 1328
videoPlayerASRSilenceThresholdMs = videoPlayerASRSilenceThresholdMs,  // line 1329
```

缺少其他11个字段的赋值语句。

#### 问题3: fromPartial()方法缺少反序列化逻辑

`fromPartial()`方法（line 1367-1488）中**只处理2个ASR字段**：

```kotlin
configs.videoPlayerASRLeadTimeMs?.let { videoPlayerASRLeadTimeMs = it.coerceIn(0, 10_000) }  // line 1450
configs.videoPlayerASRSilenceThresholdMs?.let { videoPlayerASRSilenceThresholdMs = it.coerceIn(100, 2_000) }  // line 1451
```

缺少其他11个字段的处理逻辑。

---

## 🔴 实际影响

### 当前行为（Bug）：

1. ✅ **前端可以读取**所有13个ASR字段（通过`GET /api/configs`）
   - Android通过SharedPreferences直接读取所有字段
   
2. ❌ **前端无法修改**除`videoPlayerASRLeadTimeMs`和`videoPlayerASRSilenceThresholdMs`之外的11个字段
   - 前端提交`POST /api/configs`时，Android的`fromPartial()`会**忽略**这11个字段
   - 用户在Web面板修改ASR设置后，**设置不会被保存**

### 用户体验问题：

用户在Web面板配置：
- ASR模型路径
- 翻译引擎选择
- 腾讯/百度API密钥
- ASR模式

点击保存后，**这些设置完全没有生效**，但界面没有任何错误提示。

---

## 🔧 修复建议（Android团队）

### 需要修改 `Configs.kt` 的3处：

#### 1. 在Partial数据类中添加缺失字段

在line 1574之后添加：

```kotlin
val videoPlayerRealTimeASR: Boolean? = null,
val videoPlayerASRModel: String? = null,
val videoPlayerASRTranslationEngine: String? = null,
val videoPlayerASRTranslationTargetLang: String? = null,
val videoPlayerASRTranslationTencentSecretId: String? = null,
val videoPlayerASRTranslationTencentSecretKey: String? = null,
val videoPlayerASRTranslationBaiduAppId: String? = null,
val videoPlayerASRTranslationBaiduSecretKey: String? = null,
val videoPlayerASRTranslationMTranServerUrl: String? = null,
val videoPlayerASRTranslationMTranServerToken: String? = null,
val videoPlayerASRMode: ASRMode? = null,
```

#### 2. 在toPartial()方法中添加序列化

在line 1329之后添加：

```kotlin
videoPlayerRealTimeASR = videoPlayerRealTimeASR,
videoPlayerASRModel = videoPlayerASRModel,
videoPlayerASRTranslationEngine = videoPlayerASRTranslationEngine,
videoPlayerASRTranslationTargetLang = videoPlayerASRTranslationTargetLang,
videoPlayerASRTranslationTencentSecretId = videoPlayerASRTranslationTencentSecretId,
videoPlayerASRTranslationTencentSecretKey = videoPlayerASRTranslationTencentSecretKey,
videoPlayerASRTranslationBaiduAppId = videoPlayerASRTranslationBaiduAppId,
videoPlayerASRTranslationBaiduSecretKey = videoPlayerASRTranslationBaiduSecretKey,
videoPlayerASRTranslationMTranServerUrl = videoPlayerASRTranslationMTranServerUrl,
videoPlayerASRTranslationMTranServerToken = videoPlayerASRTranslationMTranServerToken,
videoPlayerASRMode = videoPlayerASRMode,
```

#### 3. 在fromPartial()方法中添加反序列化

在line 1451之后添加：

```kotlin
configs.videoPlayerRealTimeASR?.let { videoPlayerRealTimeASR = it }
configs.videoPlayerASRModel?.let { videoPlayerASRModel = it }
configs.videoPlayerASRTranslationEngine?.let { videoPlayerASRTranslationEngine = it }
configs.videoPlayerASRTranslationTargetLang?.let { videoPlayerASRTranslationTargetLang = it }
configs.videoPlayerASRTranslationTencentSecretId?.let { videoPlayerASRTranslationTencentSecretId = it }
configs.videoPlayerASRTranslationTencentSecretKey?.let { videoPlayerASRTranslationTencentSecretKey = it }
configs.videoPlayerASRTranslationBaiduAppId?.let { videoPlayerASRTranslationBaiduAppId = it }
configs.videoPlayerASRTranslationBaiduSecretKey?.let { videoPlayerASRTranslationBaiduSecretKey = it }
configs.videoPlayerASRTranslationMTranServerUrl?.let { videoPlayerASRTranslationMTranServerUrl = it }
configs.videoPlayerASRTranslationMTranServerToken?.let { videoPlayerASRTranslationMTranServerToken = it }
configs.videoPlayerASRMode?.let { videoPlayerASRMode = it }
```

---

## ✅ 前端已完成的工作

1. ✅ 修复了`videoPlayerASRTranslationMTranServerUrl`字段名
2. ✅ 验证所有13个ASR字段在Angular中正确定义
3. ✅ 验证ASRMode枚举值与Android完全一致
4. ✅ 确认项目成功编译，无TypeScript错误

---

## 📋 总结

| 项目 | 状态 | 备注 |
|------|------|------|
| Angular字段定义 | ✅ 完成 | 所有13个ASR字段正确定义 |
| Angular字段命名 | ✅ 修复 | MTranServerUrl已修复 |
| Angular枚举定义 | ✅ 完成 | ASRMode枚举匹配Android |
| Angular编译 | ✅ 通过 | 无错误 |
| Android Partial类 | ❌ 缺失 | 缺少11个ASR字段 |
| Android toPartial() | ❌ 缺失 | 缺少11个字段序列化 |
| Android fromPartial() | ❌ 缺失 | 缺少11个字段反序列化 |

**前端同步完成度**: 100% ✅  
**后端同步完成度**: 15% (2/13) ❌

**建议**: 需要Android团队修复Configs.kt中的3处遗漏，否则Web面板的ASR配置功能无法正常工作。
