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

    getChannelAlias() {
        return RequestUtil.get<string>(`${prefix}api/channel-alias`)
    },
    changeChannelAlias(alias: string) {
        return RequestUtil.post(`${prefix}api/channel-alias`, alias, undefined, false)
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
    appLastLatestVersion?: string
    appAgreementAgreed?: boolean
    appStartupScreen?: string
    debugDeveloperMode?: boolean
    debugShowFps?: boolean
    debugShowVideoPlayerMetadata?: boolean
    debugShowLayoutGrids?: boolean
    iptvSourceCacheTime?: number
    iptvSourceCurrentIdx?: number
    iptvSourceList?: IptvSourceList
    iptvChannelGroupHiddenList?: Set<string>
    iptvHybridMode?: IptvHybridMode
    iptvHybridYangshipinCookie?: string
    iptvSimilarChannelMerge?: boolean
    iptvChannelLogoProvider?: string
    iptvChannelLogoOverride?: boolean
    iptvPLTVToTVOD?: boolean
    iptvChannelFavoriteEnable?: boolean
    iptvChannelHistoryEnable?: boolean
    iptvChannelFavoriteListVisible?: boolean
    iptvChannelFavoriteList?: ChannelFavoriteList
    iptvChannelHistoryList?: ChannelList
    iptvChannelLastPlay?: Channel
    iptvChannelLinePlayableHostList?: Set<string>
    iptvChannelLinePlayableUrlList?: Set<string>
    iptvChannelNoSelectEnable?: boolean
    iptvChannelChangeListLoop?: boolean
    iptvChannelChangeCrossGroup?: boolean
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
    uiShowChannelPreview?: boolean
    uiUseClassicPanelScreen?: boolean
    uiDensityScaleRatio?: number
    uiFontScaleRatio?: number
    uiVideoPlayerSubtitle?: VideoPlayerSubtitleStyle
    uiTimeShowMode?: UiTimeShowMode
    uiClassicShowSourceList?: boolean
    uiClassicShowChannelInfo?: boolean
    uiClassicShowAllChannels?: boolean
    uiFocusOptimize?: boolean
    uiScreenAutoCloseDelay?: number
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
    videoPlayerCore?: VideoPlayerCore
    webViewCore?: WebViewCore
    replaceSystemWebView?: boolean
    videoPlayerRenderMode?: VideoPlayerRenderMode
    videoPlayerRtspTransport?: RtspTransport
    videoPlayerUserAgent?: string
    videoPlayerHeaders?: string
    videoPlayerLoadTimeout?: number
    webViewLoadTimeout?: number
    videoPlayerBufferTime?: number
    videoPlayerDisplayMode?: VideoPlayerDisplayMode
    videoPlayerForceSoftDecode?: boolean
    videoPlayerStopPreviousMediaItem?: boolean
    videoPlayerSeekToMode?: VideoPlayerSeekToMode
    videoPlayerSkipMultipleFramesOnSameVSync?: boolean
    videoPlayerFitFrameRate?: boolean
    videoPlayerApplyBetterDetection?: boolean
    videoPlayerExtractHeaderFromLink?: boolean
    videoPlayerVolumeNormalization?: boolean
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
    mac?: string
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

export const VideoPlayerDisplayModeLabels: { [key in VideoPlayerDisplayMode]: string } = {
    [VideoPlayerDisplayMode.ORIGINAL]: 'SETTINGS.VIDEO_PLAYER_DISPLAY_MODE.ORIGINAL',
    [VideoPlayerDisplayMode.FILL]: 'SETTINGS.VIDEO_PLAYER_DISPLAY_MODE.FILL',
    [VideoPlayerDisplayMode.CROP]: 'SETTINGS.VIDEO_PLAYER_DISPLAY_MODE.CROP',
    [VideoPlayerDisplayMode.FOUR_THREE]: 'SETTINGS.VIDEO_PLAYER_DISPLAY_MODE.FOUR_THREE',
    [VideoPlayerDisplayMode.SIXTEEN_NINE]: 'SETTINGS.VIDEO_PLAYER_DISPLAY_MODE.SIXTEEN_NINE',
    [VideoPlayerDisplayMode.WIDE]: 'SETTINGS.VIDEO_PLAYER_DISPLAY_MODE.WIDE',
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
