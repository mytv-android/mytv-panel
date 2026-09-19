import { Injectable, signal, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RequestUtil } from './request';

const prefix = '/' //  'http://192.168.6.124:10591/' //

export const AppApi = {
    getAbout() {
        return RequestUtil.get<AppAbout>(`${prefix}api/about`)
    },

    getLogs() {
        return RequestUtil.get<AppLog[]>(`${prefix}api/logs`)
    },

    getLogcat() {
        return RequestUtil.getText(`${prefix}api/logcat`)
    },

    getConfigs() {
        return RequestUtil.get<AppConfigs>(`${prefix}api/configs`)
    },

    changeConfig(config: AppConfigs) {
        return RequestUtil.post(`${prefix}api/configs`, config)
    },

    getFileContent(path: string) {
        return RequestUtil.getText(`${prefix}api/file/content`, { path })
    },

    writeFileContent(path: string, content: string) {
        return RequestUtil.post<string>(`${prefix}api/file/content`, { path, content }, undefined, false)
    },

    writeFileContentWithDir(dir: string, filename: string, content: string) {
        return RequestUtil.post<string>(`${prefix}api/file/content-with-dir`, { dir, filename, content }, undefined, false)
    },

    uploadApk(file: File) {
        const formData = new FormData()
        formData.append('filename', file)
        return RequestUtil.post(`${prefix}api/upload/apk`, formData, undefined, false)
    },

    getCloudSyncData() {
        return RequestUtil.get<CloudSyncData>(`${prefix}api/cloud-sync/data`)
    },

    pushCloudSyncData(data: CloudSyncData) {
        return RequestUtil.post(`${prefix}api/cloud-sync/data`, data)
    },
}

export interface AppAbout {
    applicationId: string
    flavor: string
    buildType: string
    versionCode: number
    versionName: string
    deviceName: string
    deviceId: string
}

export interface AppLog {
    level: string
    tag: string
    message: string
    cause?: string
    time: number
}

export interface AppConfigs {
    appBootLaunch?: boolean
    appPipEnable?: boolean
    appBackgroundPlayEnable?: boolean  // NEW: 后台播放（听电视），与画中画互斥
    appLastLatestVersion?: string
    appAgreementAgreed?: boolean
    appStartupScreen?: string
    appBackupEnable?: boolean  // NEW: 启用系统备份
    debugDeveloperMode?: boolean
    debugShowFps?: boolean
    debugShowVideoPlayerMetadata?: boolean
    debugShowLayoutGrids?: boolean
    iptvSourceCacheTime?: number
    iptvSourceCurrentIdx?: number
    iptvSourceList?: IptvSourceList
    iptvChannelGroupHiddenList?: Set<string>
    iptvChannelHiddenList?: Set<string>
    iptvChannelGroupEncrypted?: boolean  // NEW: 订阅源分组加密
    iptvHybridMode?: IptvHybridMode
    iptvHybridYangshipinCookie?: string
    iptvSimilarChannelMerge?: boolean
    iptvChannelLogoProvider?: string
    iptvChannelLogoOverride?: boolean
    iptvChannelNameAlias?: string  // 频道名映射表（JSON 字符串，默认 R.raw.channel_name_alias）
    iptvPLTVToTVOD?: boolean
    iptvChannelFavoriteEnable?: boolean
    iptvChannelHistoryEnable?: boolean
    iptvChannelFavoriteListVisible?: boolean
    iptvChannelHistoryListVisible?: boolean
    iptvChannelFavoriteList?: ChannelFavoriteList
    iptvChannelHistoryList?: ChannelList
    iptvChannelLastPlay?: Channel
    iptvChannelLastPlayLineIdx?: number  // NEW: 上一次播放频道线路索引
    iptvChannelLinePlayableHostList?: Set<string>
    iptvChannelLinePlayableUrlList?: Set<string>
    iptvChannelNoSelectEnable?: boolean
    iptvChannelChangeListLoop?: boolean
    iptvChannelChangeCrossGroup?: boolean
    iptvChannelChangeShowInfoPanel?: boolean  // NEW: 换台时显示频道信息面板
    epgEnable?: boolean
    epgSourceCurrent?: EpgSource
    epgSourceList?: EpgSourceList
    epgRefreshTimeThreshold?: number
    epgSourceFollowIptv?: boolean
    epgSourceLoadAll?: boolean
    alwaysShowEPGInClassicChannelScreen?: boolean
    epgChannelReserveList?: EpgProgrammeReserveList
    uiShowEpgProgrammeProgress?: boolean
    uiShowEpgProgrammePermanentProgress?: boolean
    uiShowChannelLogo?: boolean
    uiShowReplayBadge?: boolean  // NEW: 显示回放标志
    uiShowChannelPreview?: boolean
    channelPreviewParallelCount?: number  // NEW: 频道预览并行抓帧数
    uiLazyRender?: boolean  // NEW: 列表懒渲染
    uiLazyRenderParallelCount?: number  // NEW: 列表懒渲染并行数
    uiLazyRenderInterval?: number  // NEW: 列表懒渲染间隔(ms)
    uiListAnimation?: boolean  // NEW: 列表项动画
    uiUseClassicPanelScreen?: boolean
    uiDensityScaleRatio?: number
    uiFontScaleRatio?: number
    uiVideoPlayerSubtitle?: VideoPlayerSubtitleStyle
    uiTimeShowMode?: UiTimeShowMode
    uiClassicShowSourceList?: boolean
    uiClassicShowChannelInfo?: boolean
    uiClassicShowChannelNo?: boolean  // NEW: 经典选台界面单独显示频道号
    uiClassicShowAllChannels?: boolean
    uiFocusOptimize?: boolean
    uiScreenAutoCloseDelay?: number
    uiMultiViewSchemeList?: MultiViewSchemeList  // NEW: 多屏同播方案列表
    keyDownEventUp?: KeyDownAction
    keyDownEventDown?: KeyDownAction
    keyDownEventLeft?: KeyDownAction
    keyDownEventRight?: KeyDownAction
    keyDownEventSelect?: KeyDownAction
    keyDownEventLongUp?: KeyDownAction
    keyDownEventLongDown?: KeyDownAction
    keyDownEventLongLeft?: KeyDownAction
    keyDownEventLongRight?: KeyDownAction
    keyDownEventLongSelect?: KeyDownAction
    updateForceRemind?: boolean
    updateChannel?: string
    globalVideoPlayerCore?: VideoPlayerCore
    webViewCore?: WebViewCore
    replaceSystemWebView?: boolean
    videoPlayerRenderMode?: VideoPlayerRenderMode
    videoPlayerRtspTransport?: RtspTransport
    videoPlayerDecoderConfig?: number
    videoPlayerDecoderConfigRegexList?: VideoPlayerDecoderConfigList
    videoPlayerDecoderConfigDeviceList?: VideoPlayerDecoderConfigList  // NEW: 播放器设备解码配置列表
    videoPlayerDns?: string
    videoPlayerProxy?: string
    videoPlayerProxyRuleList?: VideoPlayerProxyRuleList
    videoPlayerUserAgent?: string
    videoPlayerHeaders?: string
    videoPlayerLoadTimeout?: number
    webViewLoadTimeout?: number
    videoPlayerBufferTime?: number
    videoPlayerDisplayMode?: VideoPlayerDisplayMode
    globalVideoPlayerForceSoftDecode?: boolean
    globalVideoPlayerMedia3SoftDecodeAudioOnly?: boolean  // NEW: Media3软解仅用于音频
    globalVideoPlayerSuperResolution?: boolean
    globalVideoPlayerSuperResolutionMode?: VideoPlayerSuperResolutionMode
    globalVideoPlayerFrameInterpolation?: boolean
    globalVideoPlayerFrameInterpolationMode?: VideoPlayerFrameInterpolationMode
    globalVideoPlayerInterpolationTargetFps?: VideoPlayerInterpolationTargetFps
    globalVideoPlayerAiExecutionBackend?: VideoPlayerAiExecutionBackend
    videoPlayerStopPreviousMediaItem?: boolean
    videoPlayerSeekToMode?: VideoPlayerSeekToMode
    videoPlayerSkipMultipleFramesOnSameVSync?: boolean
    videoPlayerFitFrameRate?: boolean
    videoPlayerFrameRateFallback?: VideoPlayerFrameRateFallback  // NEW: 帧率适配回退刷新率
    videoPlayerApplyBetterDetection?: boolean
    videoPlayerExtractHeaderFromLink?: boolean
    videoPlayerVolumeNormalization?: boolean  // 保留向后兼容的布尔值
    videoPlayerVolumeBalanceLevel?: AudioBalanceLevel  // NEW: 音量均衡等级（替代简单布尔值）
    videoPlayerRealTimeASR?: boolean  // NEW: 实时ASR语音识别
    videoPlayerASRModel?: string  // NEW: ASR识别模型
    videoPlayerASRTranslationEngine?: ASRTranslationEngine  // NEW: ASR翻译引擎 (Tencent/Baidu/MTranServer)
    videoPlayerASRTranslationTargetLang?: string  // NEW: ASR翻译目标语言
    videoPlayerASRTranslationTencentSecretId?: string  // NEW: ASR翻译腾讯 SecretId
    videoPlayerASRTranslationTencentSecretKey?: string  // NEW: ASR翻译腾讯 SecretKey
    videoPlayerASRTranslationBaiduAppId?: string  // NEW: ASR翻译百度 AppId
    videoPlayerASRTranslationBaiduSecretKey?: string  // NEW: ASR翻译百度 SecretKey
    videoPlayerASRTranslationMTranServerUrl?: string  // NEW: ASR翻译MTranServer URL
    videoPlayerASRTranslationMTranServerToken?: string  // NEW: ASR翻译MTranServer Token
    videoPlayerASRMode?: ASRMode  // NEW: ASR 模式
    videoPlayerASRLeadTimeMs?: number  // NEW: ASR 领先字幕显示提前量（毫秒）
    videoPlayerASRAutoStreamingFallback?: boolean  // NEW: ASR 非领先路径自动优先流式模型
    videoPlayerASRSilenceThresholdMs?: number  // NEW: ASR 断句静音阈值（毫秒）
    videoPlayerASRVadType?: string  // NEW: ASR VAD 后端类型 (silero/ten)
    videoPlayerASRGeminiApiKey?: string  // NEW: ASR Gemini Live Translate API Key
    videoPlayerASRGeminiEndpoint?: string  // NEW: ASR Gemini Live Translate 端点
    themeAppCurrent?: AppThemeDef
    themeMode?: number
    themeColorProvider?: number
    cloudSyncAutoPull?: boolean
    cloudSyncProvider?: CloudSyncProvider
    cloudSyncGithubGistId?: string
    cloudSyncGithubGistToken?: string
    cloudSyncGiteeGistId?: string
    cloudSyncGiteeGistToken?: string
    cloudSyncNetworkUrl?: string
    cloudSyncLocalFilePath?: string
    cloudSyncWebDavUrl?: string
    cloudSyncWebDavUsername?: string
    cloudSyncWebDavPassword?: string
    networkRetryCount?: number
    networkRetryInterval?: number
    classicPanelLastSelectedGroupName?: string
}

export interface ChannelList {
    value: Channel[]
}

export interface VideoPlayerSubtitleStyle {
    useSystemDefault: boolean
    isApplyEmbeddedStyles: boolean
    textSize: number
    bottomPaddingFraction?: number  // 字幕底部留白占视频高度的比例 (0.0 = 贴底, 0.5 = 屏幕中部)
    style: CaptionStyleCompat
}

export interface CaptionStyleCompat {
    foregroundColor: number
    backgroundColor: number
    windowColor: number
    edgeType: number
    edgeColor: number
}
export enum KeyDownAction {
    ChangeCurrentChannelToPrev = 'ChangeCurrentChannelToPrev',
    ChangeCurrentChannelToNext = 'ChangeCurrentChannelToNext',
    ChangeCurrentChannelLineIdxToPrev = 'ChangeCurrentChannelLineIdxToPrev',
    ChangeCurrentChannelLineIdxToNext = 'ChangeCurrentChannelLineIdxToNext',
    ToIptvSourceScreen = 'ToIptvSourceScreen',
    ToChannelScreen = 'ToChannelScreen',
    ToQuickOpScreen = 'ToQuickOpScreen',
    ToEpgScreen = 'ToEpgScreen',
    ToChannelLineScreen = 'ToChannelLineScreen',
    ToVideoPlayerControllerScreen = 'ToVideoPlayerControllerScreen',
    NoAction = 'NoAction',
    SeekForward = 'SeekForward',
    SeekBackward = 'SeekBackward',
}

export interface VideoPlayerDecoderConfigList {
    list: VideoPlayerDecoderConfigs[];
}

export interface VideoPlayerDecoderConfigs {
    pattern: string;
    core: VideoPlayerCore;
    forceSoftDecode: boolean;
}

export const KeyDownActionLabels: { [key in KeyDownAction]: string } = {
    [KeyDownAction.ChangeCurrentChannelToPrev]: 'SETTINGS.KEY_DOWN_ACTION.ChangeCurrentChannelToPrev',
    [KeyDownAction.ChangeCurrentChannelToNext]: 'SETTINGS.KEY_DOWN_ACTION.ChangeCurrentChannelToNext',
    [KeyDownAction.ChangeCurrentChannelLineIdxToPrev]: 'SETTINGS.KEY_DOWN_ACTION.ChangeCurrentChannelLineIdxToPrev',
    [KeyDownAction.ChangeCurrentChannelLineIdxToNext]: 'SETTINGS.KEY_DOWN_ACTION.ChangeCurrentChannelLineIdxToNext',
    [KeyDownAction.ToIptvSourceScreen]: 'SETTINGS.KEY_DOWN_ACTION.ToIptvSourceScreen',
    [KeyDownAction.ToChannelScreen]: 'SETTINGS.KEY_DOWN_ACTION.ToChannelScreen',
    [KeyDownAction.ToQuickOpScreen]: 'SETTINGS.KEY_DOWN_ACTION.ToQuickOpScreen',
    [KeyDownAction.ToEpgScreen]: 'SETTINGS.KEY_DOWN_ACTION.ToEpgScreen',
    [KeyDownAction.ToChannelLineScreen]: 'SETTINGS.KEY_DOWN_ACTION.ToChannelLineScreen',
    [KeyDownAction.ToVideoPlayerControllerScreen]: 'SETTINGS.KEY_DOWN_ACTION.ToVideoPlayerControllerScreen',
    [KeyDownAction.NoAction]: 'SETTINGS.KEY_DOWN_ACTION.NoAction',
    [KeyDownAction.SeekForward]: 'SETTINGS.KEY_DOWN_ACTION.SeekForward',
    [KeyDownAction.SeekBackward]: 'SETTINGS.KEY_DOWN_ACTION.SeekBackward',
}
export enum WebViewCore {
    SYSTEM = 'SYSTEM',
    X5 = 'X5',
}

export const WebViewCoreLabels: { [key in WebViewCore]: string } = {
    [WebViewCore.SYSTEM]: 'SETTINGS.WEB_VIEW_CORE.SYSTEM',
    [WebViewCore.X5]: 'SETTINGS.WEB_VIEW_CORE.X5',
}
export enum RtspTransport {
    TCP = 'TCP',
    UDP = 'UDP',
}

export const RtspTransportLabels: { [key in RtspTransport]: string } = {
    [RtspTransport.TCP]: 'SETTINGS.RTSP_TRANSPORT.TCP',
    [RtspTransport.UDP]: 'SETTINGS.RTSP_TRANSPORT.UDP',
}
export enum VideoPlayerSeekToMode {
    RELOAD_URL = 'RELOAD_URL',
    SEEK_TO = 'SEEK_TO',
}

export const VideoPlayerSeekToModeLabels: { [key in VideoPlayerSeekToMode]: string } = {
    [VideoPlayerSeekToMode.RELOAD_URL]: 'SETTINGS.VIDEO_PLAYER_SEEK_TO_MODE.RELOAD_URL',
    [VideoPlayerSeekToMode.SEEK_TO]: 'SETTINGS.VIDEO_PLAYER_SEEK_TO_MODE.SEEK_TO',
}

export enum IptvHybridMode {
    DISABLE = 'DISABLE',
    IPTV_FIRST = 'IPTV_FIRST',
    HYBRID_FIRST = 'HYBRID_FIRST',
}

export const IptvHybridModeLabels: { [key in IptvHybridMode]: string } = {
    [IptvHybridMode.DISABLE]: 'SETTINGS.IPTV_HYBRID_MODE.DISABLE',
    [IptvHybridMode.IPTV_FIRST]: 'SETTINGS.IPTV_HYBRID_MODE.IPTV_FIRST',
    [IptvHybridMode.HYBRID_FIRST]: 'SETTINGS.IPTV_HYBRID_MODE.HYBRID_FIRST',
}

export interface IptvSource {
    name: string
    url: string
    sourceType: number
    userName?: string
    password?: string
    format?: string
    transformJs?: string
    httpUserAgent?: string
    httpProxy?: string
    mac?: string
    epg?: string
    disableChannelPreview?: boolean
    disableDelayDetection?: boolean
    autoRefresh?: number
}

export interface IptvSourceList {
    value: IptvSource[]
}

export interface EpgSource {
    name: string
    url: string
}

export interface EpgSourceList {
    value: EpgSource[]
}

export interface EpgProgrammeReserve {
    channel: string
    programme: string
    startAt: number
    endAt: number
}

export interface EpgProgrammeReserveList {
    value: EpgProgrammeReserve[]
}

export enum UiTimeShowMode {
    HIDDEN = 'HIDDEN',
    ALWAYS = 'ALWAYS',
    EVERY_HOUR = 'EVERY_HOUR',
    HALF_HOUR = 'HALF_HOUR',
}

export const UiTimeShowModeLabels: { [key in UiTimeShowMode]: string } = {
    [UiTimeShowMode.HIDDEN]: 'SETTINGS.TIME_SHOW_MODE.HIDDEN',
    [UiTimeShowMode.ALWAYS]: 'SETTINGS.TIME_SHOW_MODE.ALWAYS',
    [UiTimeShowMode.EVERY_HOUR]: 'SETTINGS.TIME_SHOW_MODE.EVERY_HOUR',
    [UiTimeShowMode.HALF_HOUR]: 'SETTINGS.TIME_SHOW_MODE.HALF_HOUR',
}

export enum VideoPlayerCore {
    MEDIA3 = 'MEDIA3',
    IJK = 'IJK',
    VLC = 'VLC',
}

export const VideoPlayerCoreLabels: { [key in VideoPlayerCore]: string } = {
    [VideoPlayerCore.MEDIA3]: 'SETTINGS.VIDEO_PLAYER_CORE.MEDIA3',
    [VideoPlayerCore.IJK]: 'SETTINGS.VIDEO_PLAYER_CORE.IJK',
    [VideoPlayerCore.VLC]: 'SETTINGS.VIDEO_PLAYER_CORE.VLC',
}

export enum VideoPlayerDecoderConfig {
    NONE = 0,
    HOST = 1,
    URL = 2,
}

export const VideoPlayerDecoderConfigLabels: { [key in VideoPlayerDecoderConfig]: string } = {
    [VideoPlayerDecoderConfig.NONE]: 'SETTINGS.VIDEO_PLAYER_DECODER_CONFIG.NONE',
    [VideoPlayerDecoderConfig.HOST]: 'SETTINGS.VIDEO_PLAYER_DECODER_CONFIG.HOST',
    [VideoPlayerDecoderConfig.URL]: 'SETTINGS.VIDEO_PLAYER_DECODER_CONFIG.URL',
}

export interface VideoPlayerProxyRule {
    pattern: string
    proxy: string
}

export interface VideoPlayerProxyRuleList {
    list: VideoPlayerProxyRule[]
}

export enum VideoPlayerRenderMode {
    SURFACE_VIEW = 'SURFACE_VIEW',
    TEXTURE_VIEW = 'TEXTURE_VIEW',
}

export const VideoPlayerRenderModeLabels: { [key in VideoPlayerRenderMode]: string } = {
    [VideoPlayerRenderMode.SURFACE_VIEW]: 'SETTINGS.VIDEO_PLAYER_RENDER_MODE.SURFACE_VIEW',
    [VideoPlayerRenderMode.TEXTURE_VIEW]: 'SETTINGS.VIDEO_PLAYER_RENDER_MODE.TEXTURE_VIEW',
}

export enum VideoPlayerDisplayMode {
    ORIGINAL = 'ORIGINAL',
    FILL = 'FILL',
    CROP = 'CROP',
    FOUR_THREE = 'FOUR_THREE',
    SIXTEEN_NINE = 'SIXTEEN_NINE',
    WIDE = 'WIDE',
}

export enum VideoPlayerSuperResolutionMode {
    OFF = 'OFF',
    GPU_SPATIAL = 'GPU_SPATIAL',
    ANIME4K = 'ANIME4K',
    GPU_FSR = 'GPU_FSR',
    AI_LITE = 'AI_LITE',
    REAL_ESRGAN_VULKAN = 'REAL_ESRGAN_VULKAN',
}

export enum VideoPlayerFrameInterpolationMode {
    OFF = 'OFF',
    GPU_BLEND = 'GPU_BLEND',
    RIFE_VULKAN = 'RIFE_VULKAN',
}

export enum VideoPlayerInterpolationTargetFps {
    AUTO = 'AUTO',
    FPS_30 = 'FPS_30',
    FPS_50 = 'FPS_50',
    FPS_60 = 'FPS_60',
    FPS_120 = 'FPS_120',
}

export enum VideoPlayerAiExecutionBackend {
    AUTO = 'AUTO',
    NNAPI = 'NNAPI',
    CPU = 'CPU',
}

export const VideoPlayerDisplayModeLabels: { [key in VideoPlayerDisplayMode]: string } = {
    [VideoPlayerDisplayMode.ORIGINAL]: 'SETTINGS.VIDEO_PLAYER_DISPLAY_MODE.ORIGINAL',
    [VideoPlayerDisplayMode.FILL]: 'SETTINGS.VIDEO_PLAYER_DISPLAY_MODE.FILL',
    [VideoPlayerDisplayMode.CROP]: 'SETTINGS.VIDEO_PLAYER_DISPLAY_MODE.CROP',
    [VideoPlayerDisplayMode.FOUR_THREE]: 'SETTINGS.VIDEO_PLAYER_DISPLAY_MODE.FOUR_THREE',
    [VideoPlayerDisplayMode.SIXTEEN_NINE]: 'SETTINGS.VIDEO_PLAYER_DISPLAY_MODE.SIXTEEN_NINE',
    [VideoPlayerDisplayMode.WIDE]: 'SETTINGS.VIDEO_PLAYER_DISPLAY_MODE.WIDE',
}

export enum VideoPlayerFrameRateFallback {
    SYSTEM_DEFAULT = 'SYSTEM_DEFAULT',
    HZ_50 = 'HZ_50',
    HZ_59_94 = 'HZ_59_94',
    HZ_60 = 'HZ_60',
}

export const VideoPlayerFrameRateFallbackLabels: { [key in VideoPlayerFrameRateFallback]: string } = {
    [VideoPlayerFrameRateFallback.SYSTEM_DEFAULT]: 'SETTINGS.VIDEO_PLAYER_FRAME_RATE_FALLBACK.SYSTEM_DEFAULT',
    [VideoPlayerFrameRateFallback.HZ_50]: 'SETTINGS.VIDEO_PLAYER_FRAME_RATE_FALLBACK.HZ_50',
    [VideoPlayerFrameRateFallback.HZ_59_94]: 'SETTINGS.VIDEO_PLAYER_FRAME_RATE_FALLBACK.HZ_59_94',
    [VideoPlayerFrameRateFallback.HZ_60]: 'SETTINGS.VIDEO_PLAYER_FRAME_RATE_FALLBACK.HZ_60',
}

export enum CloudSyncProvider {
    GITHUB_GIST = 'GITHUB_GIST',
    GITEE_GIST = 'GITEE_GIST',
    NETWORK_URL = 'NETWORK_URL',
    LOCAL_FILE = 'LOCAL_FILE',
    WEBDAV = 'WEBDAV',
}

export enum AppStartupScreen {
    Dashboard = 'Dashboard',
    Live = 'Live',
    EpgGuide = 'EpgGuide',
    Channels = 'Channels',
    Favorites = 'Favorites',
    Search = 'Search',
    MultiView = 'MultiView',
}

export const AppStartupScreenLabels: { [key in AppStartupScreen]: string } = {
    [AppStartupScreen.Dashboard]: 'GENERAL.STARTUP_SCREENS.Dashboard',
    [AppStartupScreen.Live]: 'GENERAL.STARTUP_SCREENS.Live',
    [AppStartupScreen.EpgGuide]: 'GENERAL.STARTUP_SCREENS.EpgGuide',
    [AppStartupScreen.Channels]: 'GENERAL.STARTUP_SCREENS.Channels',
    [AppStartupScreen.Favorites]: 'GENERAL.STARTUP_SCREENS.Favorites',
    [AppStartupScreen.Search]: 'GENERAL.STARTUP_SCREENS.Search',
    [AppStartupScreen.MultiView]: 'GENERAL.STARTUP_SCREENS.MultiView',
}

export interface AppThemeDef {
    name: string
    background: string
    texture?: string
    textureAlpha?: string
}

export interface Channel {
    name: string
    standardName: string
    epgName: string
    lineList: any
    logo?: string
    index: number
}

export interface ChannelFavoriteList {
    value: { channel: Channel, iptvSourceName: string, groupName: string }[]
}

export interface CloudSyncData {
    version: string
    syncAt: number
    syncFrom: string
}

export enum AudioBalanceLevel {
    Off = 'Off',
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
}

export const AudioBalanceLevelLabels: { [key in AudioBalanceLevel]: string } = {
    [AudioBalanceLevel.Off]: 'SETTINGS.AUDIO_BALANCE_LEVEL.Off',
    [AudioBalanceLevel.Low]: 'SETTINGS.AUDIO_BALANCE_LEVEL.Low',
    [AudioBalanceLevel.Medium]: 'SETTINGS.AUDIO_BALANCE_LEVEL.Medium',
    [AudioBalanceLevel.High]: 'SETTINGS.AUDIO_BALANCE_LEVEL.High',
}

export enum ASRMode {
    RENDERER_ONLY = 'RENDERER_ONLY',
    SOURCE_TAP_PREFERRED = 'SOURCE_TAP_PREFERRED',
}

export const ASRModeLabels: { [key in ASRMode]: string } = {
    [ASRMode.RENDERER_ONLY]: 'SETTINGS.ASR_MODE.RENDERER_ONLY',
    [ASRMode.SOURCE_TAP_PREFERRED]: 'SETTINGS.ASR_MODE.SOURCE_TAP_PREFERRED',
}

export enum ASRVadType {
    SILERO = 'silero',
    TEN = 'ten',
}

export const ASRVadTypeLabels: { [key in ASRVadType]: string } = {
    [ASRVadType.SILERO]: 'SETTINGS.ASR_VAD_TYPE.SILERO',
    [ASRVadType.TEN]: 'SETTINGS.ASR_VAD_TYPE.TEN',
}

export enum ASRTranslationEngine {
    NONE = '',
    TENCENT = 'tencent',
    BAIDU = 'baidu',
    MTRANSERVER = 'mtranserver',
}

export const ASRTranslationEngineLabels: { [key in ASRTranslationEngine]: string } = {
    [ASRTranslationEngine.NONE]: 'PLAYER.ASR_NO_TRANSLATION',
    [ASRTranslationEngine.TENCENT]: 'PLAYER.ASR_TENCENT',
    [ASRTranslationEngine.BAIDU]: 'PLAYER.ASR_BAIDU',
    [ASRTranslationEngine.MTRANSERVER]: 'PLAYER.ASR_MTRANSERVER',
}

export interface MultiViewScheme {
    id: string
    name: string
    channelList: Channel[]
    updatedAt: number
}

export interface MultiViewSchemeList {
    value: MultiViewScheme[]
}


@Injectable({
    providedIn: 'root'
})
export class ConfigsService {
    data = signal<AppConfigs>({})

    async refresh() {
        const data = await AppApi.getConfigs()
        this.data.set(data)
    }
    async updateData(data: AppConfigs) {
        this.data.set(data)
        await this.update()
    }
    async update() {
        await AppApi.changeConfig(this.data())
        await this.refresh()
    }

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        if (isPlatformBrowser(this.platformId)) {
            this.refresh()
        }
    }
}
