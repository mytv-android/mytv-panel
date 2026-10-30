/**
 * 面板设置搜索索引：一条对应页面里一个可见的设置行。
 * key 只用于稳定标识；labelKey / descKey / pageKey 都是 i18n key，搜索时按当前语言解析。
 */
export interface SettingsSearchEntry {
  key: string;
  route: string;
  labelKey: string;
  descKey?: string;
  pageKey: string;
}

export const SETTINGS_SEARCH_INDEX: SettingsSearchEntry[] = [
  // 通用 /general
  { key: 'general.GENERAL.BOOT_LAUNCH', route: '/general', labelKey: 'GENERAL.BOOT_LAUNCH', pageKey: '通用' },
  { key: 'general.GENERAL.BOOT_SILENT_SERVICE', route: '/general', labelKey: 'GENERAL.BOOT_SILENT_SERVICE', descKey: 'GENERAL.BOOT_SILENT_SERVICE_DESC', pageKey: '通用' },
  { key: 'general.GENERAL.STARTUP_SCREEN', route: '/general', labelKey: 'GENERAL.STARTUP_SCREEN', pageKey: '通用' },
  { key: 'general.GENERAL.PIP', route: '/general', labelKey: 'GENERAL.PIP', pageKey: '通用' },
  { key: 'general.GENERAL.BACKGROUND_PLAY', route: '/general', labelKey: 'GENERAL.BACKGROUND_PLAY', descKey: 'GENERAL.BACKGROUND_PLAY_DESC', pageKey: '通用' },
  { key: 'general.GENERAL.CAST_RECEIVER', route: '/general', labelKey: 'GENERAL.CAST_RECEIVER', descKey: 'GENERAL.CAST_RECEIVER_DESC', pageKey: '通用' },
  { key: 'general.GENERAL.CACHE_PATH_EXTERNAL', route: '/general', labelKey: 'GENERAL.CACHE_PATH_EXTERNAL', descKey: 'GENERAL.CACHE_PATH_EXTERNAL_DESC', pageKey: '通用' },

  // 订阅源 /sources
  { key: 'subscribe.SUBSCRIBE.CACHE_TIME', route: '/sources', labelKey: 'SUBSCRIBE.CACHE_TIME', pageKey: '订阅源' },
  { key: 'subscribe.SUBSCRIBE.HIDDEN_GROUPS', route: '/sources', labelKey: 'SUBSCRIBE.HIDDEN_GROUPS', pageKey: '订阅源' },
  { key: 'subscribe.SUBSCRIBE.HIDDEN_CHANNELS', route: '/sources', labelKey: 'SUBSCRIBE.HIDDEN_CHANNELS', pageKey: '订阅源' },
  { key: 'subscribe.HOME.CHANNEL_ALIAS', route: '/sources', labelKey: 'HOME.CHANNEL_ALIAS', pageKey: '订阅源' },
  { key: 'subscribe.SUBSCRIBE.MERGE_SIMILAR', route: '/sources', labelKey: 'SUBSCRIBE.MERGE_SIMILAR', pageKey: '订阅源' },
  { key: 'subscribe.HOME.CHANNEL_ICON_PROVIDER', route: '/sources', labelKey: 'HOME.CHANNEL_ICON_PROVIDER', pageKey: '订阅源' },
  { key: 'subscribe.SUBSCRIBE.ICON_OVERRIDE', route: '/sources', labelKey: 'SUBSCRIBE.ICON_OVERRIDE', pageKey: '订阅源' },
  { key: 'subscribe.SUBSCRIBE.GROUP_CONFIG_ENABLE', route: '/sources', labelKey: 'SUBSCRIBE.GROUP_CONFIG_ENABLE', descKey: 'SUBSCRIBE.GROUP_CONFIG_ENABLE_DESC', pageKey: '订阅源' },
  { key: 'subscribe.SUBSCRIBE.PLTV_TO_TVOD', route: '/sources', labelKey: 'SUBSCRIBE.PLTV_TO_TVOD', pageKey: '订阅源' },
  { key: 'subscribe.SUBSCRIBE.ENCRYPTED_GROUP', route: '/sources', labelKey: 'SUBSCRIBE.ENCRYPTED_GROUP', descKey: 'SUBSCRIBE.ENCRYPTED_GROUP_DESC', pageKey: '订阅源' },
  { key: 'subscribe.SUBSCRIBE.AUTO_ADD_WEB_SOURCE', route: '/sources', labelKey: 'SUBSCRIBE.AUTO_ADD_WEB_SOURCE', pageKey: '订阅源' },
  { key: 'subscribe.HOME.YANGSHIPIN_COOKIE', route: '/sources', labelKey: 'HOME.YANGSHIPIN_COOKIE', pageKey: '订阅源' },

  // 节目单 /epg
  { key: 'epg.EPG.ENABLE', route: '/epg', labelKey: 'EPG.ENABLE', descKey: 'EPG.ENABLE_DESC', pageKey: '节目单' },
  { key: 'epg.EPG.ALWAYS_SHOW_IN_CLASSIC', route: '/epg', labelKey: 'EPG.ALWAYS_SHOW_IN_CLASSIC', descKey: 'EPG.ALWAYS_SHOW_IN_CLASSIC_DESC', pageKey: '节目单' },
  { key: 'epg.EPG.FOLLOW_SOURCE', route: '/epg', labelKey: 'EPG.FOLLOW_SOURCE', descKey: 'EPG.FOLLOW_SOURCE_DESC', pageKey: '节目单' },
  { key: 'epg.EPG.LOAD_ALL', route: '/epg', labelKey: 'EPG.LOAD_ALL', descKey: 'EPG.LOAD_ALL_DESC', pageKey: '节目单' },
  { key: 'epg.EPG.CUSTOM_EPG', route: '/epg', labelKey: 'EPG.CUSTOM_EPG', pageKey: '节目单' },
  { key: 'epg.EPG.REFRESH_THRESHOLD', route: '/epg', labelKey: 'EPG.REFRESH_THRESHOLD', descKey: 'EPG.REFRESH_THRESHOLD_DESC', pageKey: '节目单' },

  // 界面 /ui
  { key: 'ui.UI.SHOW_EPG_PROGRAMME_PROGRESS', route: '/ui', labelKey: 'UI.SHOW_EPG_PROGRAMME_PROGRESS', descKey: 'UI.SHOW_EPG_PROGRAMME_PROGRESS_DESC', pageKey: '界面' },
  { key: 'ui.UI.SHOW_EPG_PROGRAMME_PERMANENT_PROGRESS', route: '/ui', labelKey: 'UI.SHOW_EPG_PROGRAMME_PERMANENT_PROGRESS', descKey: 'UI.SHOW_EPG_PROGRAMME_PERMANENT_PROGRESS_DESC', pageKey: '界面' },
  { key: 'ui.UI.SHOW_CHANNEL_LOGO', route: '/ui', labelKey: 'UI.SHOW_CHANNEL_LOGO', pageKey: '界面' },
  { key: 'ui.UI.SHOW_REPLAY_BADGE', route: '/ui', labelKey: 'UI.SHOW_REPLAY_BADGE', descKey: 'UI.SHOW_REPLAY_BADGE_DESC', pageKey: '界面' },
  { key: 'ui.UI.SHOW_CHANNEL_PREVIEW', route: '/ui', labelKey: 'UI.SHOW_CHANNEL_PREVIEW', pageKey: '界面' },
  { key: 'ui.UI.CHANNEL_PREVIEW_PARALLEL_COUNT', route: '/ui', labelKey: 'UI.CHANNEL_PREVIEW_PARALLEL_COUNT', descKey: 'UI.CHANNEL_PREVIEW_PARALLEL_COUNT_DESC', pageKey: '界面' },
  { key: 'ui.UI.LIST_ANIMATION', route: '/ui', labelKey: 'UI.LIST_ANIMATION', descKey: 'UI.LIST_ANIMATION_DESC', pageKey: '界面' },
  { key: 'ui.UI.LAZY_RENDER', route: '/ui', labelKey: 'UI.LAZY_RENDER', descKey: 'UI.LAZY_RENDER_DESC', pageKey: '界面' },
  { key: 'ui.UI.LAZY_RENDER_PARALLEL_COUNT', route: '/ui', labelKey: 'UI.LAZY_RENDER_PARALLEL_COUNT', pageKey: '界面' },
  { key: 'ui.UI.LAZY_RENDER_INTERVAL', route: '/ui', labelKey: 'UI.LAZY_RENDER_INTERVAL', pageKey: '界面' },
  { key: 'ui.UI.USE_CLASSIC_PANEL_SCREEN', route: '/ui', labelKey: 'UI.USE_CLASSIC_PANEL_SCREEN', descKey: 'UI.USE_CLASSIC_PANEL_SCREEN_DESC', pageKey: '界面' },
  { key: 'ui.UI.CLASSIC_SHOW_SOURCE_LIST', route: '/ui', labelKey: 'UI.CLASSIC_SHOW_SOURCE_LIST', descKey: 'UI.CLASSIC_SHOW_SOURCE_LIST_DESC', pageKey: '界面' },
  { key: 'ui.UI.CLASSIC_SHOW_CHANNEL_INFO', route: '/ui', labelKey: 'UI.CLASSIC_SHOW_CHANNEL_INFO', descKey: 'UI.CLASSIC_SHOW_CHANNEL_INFO_DESC', pageKey: '界面' },
  { key: 'ui.UI.CLASSIC_SHOW_CHANNEL_NO', route: '/ui', labelKey: 'UI.CLASSIC_SHOW_CHANNEL_NO', descKey: 'UI.CLASSIC_SHOW_CHANNEL_NO_DESC', pageKey: '界面' },
  { key: 'ui.UI.CLASSIC_SHOW_ALL_CHANNELS', route: '/ui', labelKey: 'UI.CLASSIC_SHOW_ALL_CHANNELS', descKey: 'UI.CLASSIC_SHOW_ALL_CHANNELS_DESC', pageKey: '界面' },
  { key: 'ui.UI.TIME_SHOW_MODE', route: '/ui', labelKey: 'UI.TIME_SHOW_MODE', pageKey: '界面' },
  { key: 'ui.UI.DENSITY_SCALE_RATIO', route: '/ui', labelKey: 'UI.DENSITY_SCALE_RATIO', pageKey: '界面' },
  { key: 'ui.UI.FONT_SCALE_RATIO', route: '/ui', labelKey: 'UI.FONT_SCALE_RATIO', pageKey: '界面' },
  { key: 'ui.UI.SCREEN_ORIENTATION', route: '/ui', labelKey: 'UI.SCREEN_ORIENTATION', descKey: 'UI.SCREEN_ORIENTATION_DESC', pageKey: '界面' },
  { key: 'ui.UI.FOCUS_OPTIMIZE', route: '/ui', labelKey: 'UI.FOCUS_OPTIMIZE', descKey: 'UI.FOCUS_OPTIMIZE_DESC', pageKey: '界面' },
  { key: 'ui.IPTV.CHANNEL_FAVORITE_ENABLE', route: '/ui', labelKey: 'IPTV.CHANNEL_FAVORITE_ENABLE', descKey: 'IPTV.CHANNEL_FAVORITE_ENABLE_DESC', pageKey: '界面' },
  { key: 'ui.IPTV.CHANNEL_RECENT_ENABLE', route: '/ui', labelKey: 'IPTV.CHANNEL_RECENT_ENABLE', descKey: 'IPTV.CHANNEL_RECENT_ENABLE_DESC', pageKey: '界面' },

  // 播放器 /player
  { key: 'player.PLAYER.CORE', route: '/player', labelKey: 'PLAYER.CORE', pageKey: '播放器' },
  { key: 'player.PLAYER.RENDER_MODE', route: '/player', labelKey: 'PLAYER.RENDER_MODE', pageKey: '播放器' },
  { key: 'player.PLAYER.DECODER_CONFIG', route: '/player', labelKey: 'PLAYER.DECODER_CONFIG', descKey: 'PLAYER.DECODER_CONFIG_DESC', pageKey: '播放器' },
  { key: 'player.PLAYER.DECODER_CONFIG_REGEX_LIST', route: '/player', labelKey: 'PLAYER.DECODER_CONFIG_REGEX_LIST', pageKey: '播放器' },
  { key: 'player.PLAYER.FORCE_SOFT_DECODE', route: '/player', labelKey: 'PLAYER.FORCE_SOFT_DECODE', descKey: 'PLAYER.FORCE_SOFT_DECODE_DESC', pageKey: '播放器' },
  { key: 'player.PLAYER.MEDIA3_SOFT_DECODE_AUDIO_ONLY', route: '/player', labelKey: 'PLAYER.MEDIA3_SOFT_DECODE_AUDIO_ONLY', descKey: 'PLAYER.MEDIA3_SOFT_DECODE_AUDIO_ONLY_DESC', pageKey: '播放器' },
  { key: 'player.PLAYER.AUDIO_SCREENSAVER', route: '/player', labelKey: 'PLAYER.AUDIO_SCREENSAVER', descKey: 'PLAYER.AUDIO_SCREENSAVER_DESC', pageKey: '播放器' },
  { key: 'player.PLAYER.AAC_PREFER', route: '/player', labelKey: 'PLAYER.AAC_PREFER', descKey: 'PLAYER.AAC_PREFER_DESC', pageKey: '播放器' },
  { key: 'player.PLAYER.MEDIA3_TUNNELED', route: '/player', labelKey: 'PLAYER.MEDIA3_TUNNELED', descKey: 'PLAYER.MEDIA3_TUNNELED_DESC', pageKey: '播放器' },
  { key: 'player.PLAYER.SUPER_RESOLUTION', route: '/player', labelKey: 'PLAYER.SUPER_RESOLUTION', descKey: 'PLAYER.SUPER_RESOLUTION_DESC', pageKey: '播放器' },
  { key: 'player.PLAYER.FRAME_INTERPOLATION', route: '/player', labelKey: 'PLAYER.FRAME_INTERPOLATION', descKey: 'PLAYER.FRAME_INTERPOLATION_DESC', pageKey: '播放器' },
  { key: 'player.PLAYER.INTERPOLATION_TARGET_FPS', route: '/player', labelKey: 'PLAYER.INTERPOLATION_TARGET_FPS', descKey: 'PLAYER.INTERPOLATION_TARGET_FPS_DESC', pageKey: '播放器' },
  { key: 'player.PLAYER.AI_EXECUTION_BACKEND', route: '/player', labelKey: 'PLAYER.AI_EXECUTION_BACKEND', descKey: 'PLAYER.AI_EXECUTION_BACKEND_DESC', pageKey: '播放器' },
  { key: 'player.PLAYER.STOP_PREVIOUS_MEDIA_ITEM', route: '/player', labelKey: 'PLAYER.STOP_PREVIOUS_MEDIA_ITEM', pageKey: '播放器' },
  { key: 'player.PLAYER.FIT_FRAME_RATE', route: '/player', labelKey: 'PLAYER.FIT_FRAME_RATE', descKey: 'PLAYER.FIT_FRAME_RATE_DESC', pageKey: '播放器' },
  { key: 'player.PLAYER.FRAME_RATE_FALLBACK', route: '/player', labelKey: 'PLAYER.FRAME_RATE_FALLBACK', descKey: 'PLAYER.FRAME_RATE_FALLBACK_DESC', pageKey: '播放器' },
  { key: 'player.PLAYER.BETTER_DETECTION', route: '/player', labelKey: 'PLAYER.BETTER_DETECTION', descKey: 'PLAYER.BETTER_DETECTION_DESC', pageKey: '播放器' },
  { key: 'player.PLAYER.EXTRACT_HEADER_FROM_LINK', route: '/player', labelKey: 'PLAYER.EXTRACT_HEADER_FROM_LINK', descKey: 'PLAYER.EXTRACT_HEADER_FROM_LINK_DESC', pageKey: '播放器' },
  { key: 'player.PLAYER.DISPLAY_MODE', route: '/player', labelKey: 'PLAYER.DISPLAY_MODE', pageKey: '播放器' },
  { key: 'player.PLAYER.SEEK_TO_MODE', route: '/player', labelKey: 'PLAYER.SEEK_TO_MODE', pageKey: '播放器' },
  { key: 'player.PLAYER.EPG_TIMELINE', route: '/player', labelKey: 'PLAYER.EPG_TIMELINE', descKey: 'PLAYER.EPG_TIMELINE_DESC', pageKey: '播放器' },
  { key: 'player.PLAYER.LOAD_TIMEOUT', route: '/player', labelKey: 'PLAYER.LOAD_TIMEOUT', descKey: 'PLAYER.LOAD_TIMEOUT_DESC', pageKey: '播放器' },
  { key: 'player.PLAYER.BUFFER_TIME', route: '/player', labelKey: 'PLAYER.BUFFER_TIME', descKey: 'PLAYER.BUFFER_TIME_DESC', pageKey: '播放器' },
  { key: 'player.PLAYER.STALL_RETRY', route: '/player', labelKey: 'PLAYER.STALL_RETRY', descKey: 'PLAYER.STALL_RETRY_DESC', pageKey: '播放器' },
  { key: 'player.PLAYER.RTSP_TRANSPORT', route: '/player', labelKey: 'PLAYER.RTSP_TRANSPORT', pageKey: '播放器' },
  { key: 'player.PLAYER.VOLUME_BALANCE_LEVEL', route: '/player', labelKey: 'PLAYER.VOLUME_BALANCE_LEVEL', descKey: 'PLAYER.VOLUME_BALANCE_LEVEL_DESC', pageKey: '播放器' },
  { key: 'player.PLAYER.ASR_REAL_TIME', route: '/player', labelKey: 'PLAYER.ASR_REAL_TIME', descKey: 'PLAYER.ASR_REAL_TIME_DESC', pageKey: '播放器' },
  { key: 'player.PLAYER.ASR_MODEL', route: '/player', labelKey: 'PLAYER.ASR_MODEL', descKey: 'PLAYER.ASR_MODEL_DESC', pageKey: '播放器' },
  { key: 'player.PLAYER.ASR_GEMINI_API_KEY', route: '/player', labelKey: 'PLAYER.ASR_GEMINI_API_KEY', descKey: 'PLAYER.ASR_GEMINI_API_KEY_DESC', pageKey: '播放器' },
  { key: 'player.PLAYER.ASR_GEMINI_ENDPOINT', route: '/player', labelKey: 'PLAYER.ASR_GEMINI_ENDPOINT', descKey: 'PLAYER.ASR_GEMINI_ENDPOINT_DESC', pageKey: '播放器' },
  { key: 'player.PLAYER.ASR_ALIYUN_API_KEY', route: '/player', labelKey: 'PLAYER.ASR_ALIYUN_API_KEY', descKey: 'PLAYER.ASR_ALIYUN_API_KEY_DESC', pageKey: '播放器' },
  { key: 'player.PLAYER.ASR_ALIYUN_ENDPOINT', route: '/player', labelKey: 'PLAYER.ASR_ALIYUN_ENDPOINT', descKey: 'PLAYER.ASR_ALIYUN_ENDPOINT_DESC', pageKey: '播放器' },
  { key: 'player.PLAYER.ASR_SONIOX_API_KEY', route: '/player', labelKey: 'PLAYER.ASR_SONIOX_API_KEY', descKey: 'PLAYER.ASR_SONIOX_API_KEY_DESC', pageKey: '播放器' },
  { key: 'player.PLAYER.ASR_MODE', route: '/player', labelKey: 'PLAYER.ASR_MODE', descKey: 'PLAYER.ASR_MODE_DESC', pageKey: '播放器' },
  { key: 'player.PLAYER.ASR_LEAD_TIME', route: '/player', labelKey: 'PLAYER.ASR_LEAD_TIME', descKey: 'PLAYER.ASR_LEAD_TIME_DESC', pageKey: '播放器' },
  { key: 'player.PLAYER.ASR_SILENCE_THRESHOLD', route: '/player', labelKey: 'PLAYER.ASR_SILENCE_THRESHOLD', descKey: 'PLAYER.ASR_SILENCE_THRESHOLD_DESC', pageKey: '播放器' },
  { key: 'player.PLAYER.ASR_VAD_TYPE', route: '/player', labelKey: 'PLAYER.ASR_VAD_TYPE', descKey: 'PLAYER.ASR_VAD_TYPE_DESC', pageKey: '播放器' },
  { key: 'player.PLAYER.ASR_AUTO_STREAMING_FALLBACK', route: '/player', labelKey: 'PLAYER.ASR_AUTO_STREAMING_FALLBACK', descKey: 'PLAYER.ASR_AUTO_STREAMING_FALLBACK_DESC', pageKey: '播放器' },
  { key: 'player.PLAYER.ASR_TRANSLATION_ENGINE', route: '/player', labelKey: 'PLAYER.ASR_TRANSLATION_ENGINE', descKey: 'PLAYER.ASR_TRANSLATION_ENGINE_DESC', pageKey: '播放器' },
  { key: 'player.PLAYER.ASR_TARGET_LANG', route: '/player', labelKey: 'PLAYER.ASR_TARGET_LANG', descKey: 'PLAYER.ASR_TARGET_LANG_DESC', pageKey: '播放器' },
  { key: 'player.PLAYER.TRANSLATION_HIDE_ORIGINAL', route: '/player', labelKey: 'PLAYER.TRANSLATION_HIDE_ORIGINAL', descKey: 'PLAYER.TRANSLATION_HIDE_ORIGINAL_DESC', pageKey: '播放器' },
  { key: 'player.PLAYER.TRANSLATION_FONT_SCALE', route: '/player', labelKey: 'PLAYER.TRANSLATION_FONT_SCALE', descKey: 'PLAYER.TRANSLATION_FONT_SCALE_DESC', pageKey: '播放器' },
  { key: 'player.PLAYER.TRANSLATION_COLOR', route: '/player', labelKey: 'PLAYER.TRANSLATION_COLOR', descKey: 'PLAYER.TRANSLATION_COLOR_DESC', pageKey: '播放器' },
  { key: 'player.PLAYER.ASR_TENCENT_SECRET_ID', route: '/player', labelKey: 'PLAYER.ASR_TENCENT_SECRET_ID', pageKey: '播放器' },
  { key: 'player.PLAYER.ASR_TENCENT_SECRET_KEY', route: '/player', labelKey: 'PLAYER.ASR_TENCENT_SECRET_KEY', pageKey: '播放器' },
  { key: 'player.PLAYER.ASR_BAIDU_APP_ID', route: '/player', labelKey: 'PLAYER.ASR_BAIDU_APP_ID', pageKey: '播放器' },
  { key: 'player.PLAYER.ASR_BAIDU_SECRET_KEY', route: '/player', labelKey: 'PLAYER.ASR_BAIDU_SECRET_KEY', pageKey: '播放器' },
  { key: 'player.PLAYER.ASR_MTRANSERVER_URL', route: '/player', labelKey: 'PLAYER.ASR_MTRANSERVER_URL', pageKey: '播放器' },
  { key: 'player.PLAYER.ASR_MTRANSERVER_TOKEN', route: '/player', labelKey: 'PLAYER.ASR_MTRANSERVER_TOKEN', pageKey: '播放器' },
  { key: 'player.PLAYER.ASR_YOUDAO_APP_KEY', route: '/player', labelKey: 'PLAYER.ASR_YOUDAO_APP_KEY', pageKey: '播放器' },
  { key: 'player.PLAYER.ASR_YOUDAO_APP_SECRET', route: '/player', labelKey: 'PLAYER.ASR_YOUDAO_APP_SECRET', pageKey: '播放器' },
  { key: 'player.PLAYER.ASR_MICROSOFT_KEY', route: '/player', labelKey: 'PLAYER.ASR_MICROSOFT_KEY', pageKey: '播放器' },
  { key: 'player.PLAYER.ASR_MICROSOFT_REGION', route: '/player', labelKey: 'PLAYER.ASR_MICROSOFT_REGION', descKey: 'PLAYER.ASR_MICROSOFT_REGION_DESC', pageKey: '播放器' },
  { key: 'player.PLAYER.DNS', route: '/player', labelKey: 'PLAYER.DNS', descKey: 'PLAYER.DNS_DESC', pageKey: '播放器' },
  { key: 'player.PLAYER.PROXY', route: '/player', labelKey: 'PLAYER.PROXY', pageKey: '播放器' },
  { key: 'player.PLAYER.PROXY_RULES', route: '/player', labelKey: 'PLAYER.PROXY_RULES', pageKey: '播放器' },
  { key: 'player.HOME.USER_AGENT', route: '/player', labelKey: 'HOME.USER_AGENT', pageKey: '播放器' },
  { key: 'player.HOME.CUSTOM_HEADERS', route: '/player', labelKey: 'HOME.CUSTOM_HEADERS', pageKey: '播放器' },

  // 控制 /control
  { key: 'control.CONTROL.CHANNEL_LOOP', route: '/control', labelKey: 'CONTROL.CHANNEL_LOOP', pageKey: '控制' },
  { key: 'control.CONTROL.CROSS_GROUP', route: '/control', labelKey: 'CONTROL.CROSS_GROUP', pageKey: '控制' },
  { key: 'control.CONTROL.CHANNEL_CHANGE_SHOW_INFO', route: '/control', labelKey: 'CONTROL.CHANNEL_CHANGE_SHOW_INFO', descKey: 'CONTROL.CHANNEL_CHANGE_SHOW_INFO_DESC', pageKey: '控制' },
  { key: 'control.CONTROL.KEY_UP', route: '/control', labelKey: 'CONTROL.KEY_UP', pageKey: '控制' },
  { key: 'control.CONTROL.KEY_DOWN', route: '/control', labelKey: 'CONTROL.KEY_DOWN', pageKey: '控制' },
  { key: 'control.CONTROL.KEY_LEFT', route: '/control', labelKey: 'CONTROL.KEY_LEFT', pageKey: '控制' },
  { key: 'control.CONTROL.KEY_RIGHT', route: '/control', labelKey: 'CONTROL.KEY_RIGHT', pageKey: '控制' },
  { key: 'control.CONTROL.KEY_SELECT', route: '/control', labelKey: 'CONTROL.KEY_SELECT', pageKey: '控制' },

  // WebView /webview
  { key: 'webview.WEBVIEW.CORE', route: '/webview', labelKey: 'WEBVIEW.CORE', pageKey: 'WebView' },
  { key: 'webview.WEBVIEW.REPLACE_SYSTEM', route: '/webview', labelKey: 'WEBVIEW.REPLACE_SYSTEM', descKey: 'WEBVIEW.REPLACE_SYSTEM_HINT', pageKey: 'WebView' },
  { key: 'webview.WEBVIEW.LOAD_TIMEOUT', route: '/webview', labelKey: 'WEBVIEW.LOAD_TIMEOUT', pageKey: 'WebView' },
  { key: 'webview.WEBVIEW.LOADING_STYLE', route: '/webview', labelKey: 'WEBVIEW.LOADING_STYLE', descKey: 'WEBVIEW.LOADING_STYLE_HINT', pageKey: 'WebView' },
  { key: 'webview.WEBVIEW.RESOLUTION', route: '/webview', labelKey: 'WEBVIEW.RESOLUTION', descKey: 'WEBVIEW.RESOLUTION_HINT', pageKey: 'WebView' },
  { key: 'webview.WEBVIEW.UA_PRESET', route: '/webview', labelKey: 'WEBVIEW.UA_PRESET', descKey: 'WEBVIEW.UA_PRESET_HINT', pageKey: 'WebView' },
  { key: 'webview.WEBVIEW.LOAD_IMAGE', route: '/webview', labelKey: 'WEBVIEW.LOAD_IMAGE', pageKey: 'WebView' },
  { key: 'webview.WEBVIEW.LAYER_ACCEL', route: '/webview', labelKey: 'WEBVIEW.LAYER_ACCEL', descKey: 'WEBVIEW.LAYER_ACCEL_HINT', pageKey: 'WebView' },

  // 网络 /network
  { key: 'network.NETWORK.RETRY_COUNT', route: '/network', labelKey: 'NETWORK.RETRY_COUNT', descKey: 'NETWORK.RETRY_COUNT_HINT', pageKey: '网络' },
  { key: 'network.NETWORK.RETRY_INTERVAL', route: '/network', labelKey: 'NETWORK.RETRY_INTERVAL', descKey: 'NETWORK.RETRY_INTERVAL_HINT', pageKey: '网络' },

  // 云同步 /sync
  { key: 'backup.SYNC.AUTO_PULL', route: '/sync', labelKey: 'SYNC.AUTO_PULL', pageKey: '云同步' },
  { key: 'backup.HOME.PROVIDER', route: '/sync', labelKey: 'HOME.PROVIDER', pageKey: '云同步' },
  { key: 'backup.HOME.GITHUB_GIST_ID', route: '/sync', labelKey: 'HOME.GITHUB_GIST_ID', pageKey: '云同步' },
  { key: 'backup.HOME.GITHUB_GIST_TOKEN', route: '/sync', labelKey: 'HOME.GITHUB_GIST_TOKEN', pageKey: '云同步' },
  { key: 'backup.HOME.GITEE_GIST_ID', route: '/sync', labelKey: 'HOME.GITEE_GIST_ID', pageKey: '云同步' },
  { key: 'backup.HOME.GITEE_GIST_TOKEN', route: '/sync', labelKey: 'HOME.GITEE_GIST_TOKEN', pageKey: '云同步' },
  { key: 'backup.HOME.NETWORK_URL', route: '/sync', labelKey: 'HOME.NETWORK_URL', pageKey: '云同步' },
  { key: 'backup.HOME.LOCAL_FILE_PATH', route: '/sync', labelKey: 'HOME.LOCAL_FILE_PATH', pageKey: '云同步' },
  { key: 'backup.HOME.WEBDAV_URL', route: '/sync', labelKey: 'HOME.WEBDAV_URL', pageKey: '云同步' },
  { key: 'backup.HOME.WEBDAV_USERNAME', route: '/sync', labelKey: 'HOME.WEBDAV_USERNAME', pageKey: '云同步' },
  { key: 'backup.HOME.WEBDAV_PASSWORD', route: '/sync', labelKey: 'HOME.WEBDAV_PASSWORD', pageKey: '云同步' },

  // 更新 /update
  { key: 'update.UPDATE.CHANNEL', route: '/update', labelKey: 'UPDATE.CHANNEL', pageKey: '更新' },
  { key: 'update.UPDATE.FORCE_REMIND', route: '/update', labelKey: 'UPDATE.FORCE_REMIND', pageKey: '更新' },

  // 调试 /debug
  { key: 'debug.DEBUG.SHOW_FPS', route: '/debug', labelKey: 'DEBUG.SHOW_FPS', pageKey: '调试' },
  { key: 'debug.DEBUG.SHOW_PLAYER_METADATA', route: '/debug', labelKey: 'DEBUG.SHOW_PLAYER_METADATA', pageKey: '调试' },
  { key: 'debug.DEBUG.SHOW_LAYOUT_GRIDS', route: '/debug', labelKey: 'DEBUG.SHOW_LAYOUT_GRIDS', pageKey: '调试' },

  // 主题 /theme
  { key: 'theme.THEME_MODE', route: '/theme', labelKey: 'THEME_MODE', pageKey: '主题' },
  { key: 'theme.THEME_COLOR_PROVIDER', route: '/theme', labelKey: 'THEME_COLOR_PROVIDER', pageKey: '主题' },
  { key: 'theme.THEME_NAME', route: '/theme', labelKey: 'THEME_NAME', pageKey: '主题' },
  { key: 'theme.THEME_BACKGROUND', route: '/theme', labelKey: 'THEME_BACKGROUND', pageKey: '主题' },
  { key: 'theme.THEME_TEXTURE', route: '/theme', labelKey: 'THEME_TEXTURE', pageKey: '主题' },
  { key: 'theme.THEME_TEXTURE_ALPHA', route: '/theme', labelKey: 'THEME_TEXTURE_ALPHA', pageKey: '主题' },
];
