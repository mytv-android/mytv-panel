const fs = require('fs');
const path = require('path');

// 读取 Angular zh.json
const angularZh = JSON.parse(fs.readFileSync('public/i18n/zh.json', 'utf8'));

// 读取 Android strings.xml
const androidStrings = fs.readFileSync('../mytv-android/tv/src/main/res/values/strings.xml', 'utf8');

// 解析 Android strings.xml 到 Map
const androidMap = new Map();
const stringRegex = /<string name="([^"]+)">([^<]*(?:<[^>]+>[^<]*)*)<\/string>/g;
let match;
while ((match = stringRegex.exec(androidStrings)) !== null) {
  const key = match[1];
  let value = match[2];
  // 移除 XML 转义和格式化字符
  value = value
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
    .replace(/%1\$d/g, '')
    .replace(/%2\$d/g, '')
    .replace(/%1\$s/g, '')
    .replace(/%2\$s/g, '')
    .replace(/%3\$s/g, '')
    .replace(/%4\$s/g, '')
    .replace(/%.2f/g, '')
    .replace(/%d/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  androidMap.set(key, value);
}

// 命名映射规则
function tryMapKeys(angularKey) {
  const patterns = [];

  // 特殊映射
  const specialMap = {
    'PLAYER.CORE': 'ui_player_view_player_core',
    'PLAYER.RENDER_MODE': 'ui_player_view_render_mode',
    'PLAYER.FORCE_SOFT_DECODE': 'ui_player_view_force_soft_decode',
    'PLAYER.FORCE_SOFT_DECODE_DESC': 'ui_player_view_force_soft_decode_desc',
    'PLAYER.STOP_PREVIOUS_MEDIA_ITEM': 'ui_player_view_stop_previous_media_item',
    'PLAYER.FIT_FRAME_RATE': 'ui_player_view_fit_frame_rate',
    'PLAYER.FIT_FRAME_RATE_DESC': 'ui_player_view_fit_frame_rate_desc',
    'PLAYER.BETTER_DETECTION': 'video_player_support_better_detection',
    'PLAYER.BETTER_DETECTION_DESC': 'video_player_support_better_detection_desc',
    'PLAYER.EXTRACT_HEADER_FROM_LINK': 'ui_player_view_extract_header_from_link',
    'PLAYER.EXTRACT_HEADER_FROM_LINK_DESC': 'ui_player_view_extract_header_from_link_desc',
    'PLAYER.DISPLAY_MODE': 'ui_player_view_display_mode',
    'PLAYER.SEEK_TO_MODE': 'ui_player_view_seekto_mode',
    'PLAYER.LOAD_TIMEOUT': 'ui_player_view_load_timeout',
    'PLAYER.LOAD_TIMEOUT_DESC': 'ui_player_view_load_timeout_desc',
    'PLAYER.BUFFER_TIME': 'ui_player_view_buffer_time',
    'PLAYER.BUFFER_TIME_DESC': 'ui_player_view_buffer_time_desc',
    'PLAYER.RTSP_TRANSPORT': 'ui_player_view_rtsp_transport',
    'PLAYER.DECODER_CONFIG': 'ui_player_view_player_config',
    'PLAYER.DNS': 'ui_player_view_dns',
    'PLAYER.DNS_DESC': 'ui_player_view_dns_desc',
    'PLAYER.PROXY': 'ui_player_view_proxy',
    'PLAYER.PROXY_RULES': 'ui_player_view_proxy_rules',
    'PLAYER.PROXY_RULES_COUNT': 'ui_player_view_proxy_rules_count',
    'PLAYER.VOLUME_BALANCE_LEVEL': 'ui_player_view_volume_normalization',
    'PLAYER.VOLUME_BALANCE_LEVEL_DESC': 'ui_player_view_volume_normalization_desc',
    'PLAYER.ASR_REAL_TIME': 'ui_player_view_real_time_asr',
    'PLAYER.ASR_REAL_TIME_DESC': 'ui_player_view_real_time_asr_desc',
    'PLAYER.ASR_MODEL': 'ui_player_view_asr_recognition_model',
    'PLAYER.ASR_MODEL_DESC': 'ui_player_view_asr_recognition_model_desc',
    'PLAYER.ASR_MODE': 'ui_player_view_asr_leading_subtitles',
    'PLAYER.ASR_MODE_DESC': 'ui_player_view_asr_leading_subtitles_desc',
    'PLAYER.ASR_LEAD_TIME': 'ui_player_view_asr_lead_time',
    'PLAYER.ASR_LEAD_TIME_DESC': 'ui_player_view_asr_lead_time_desc',
    'PLAYER.ASR_SILENCE_THRESHOLD': 'ui_player_view_asr_silence_threshold',
    'PLAYER.ASR_SILENCE_THRESHOLD_DESC': 'ui_player_view_asr_silence_threshold_desc',
    'PLAYER.ASR_TRANSLATION_ENGINE': 'ui_player_view_asr_translation_engine',
    'PLAYER.ASR_TRANSLATION_ENGINE_DESC': 'ui_player_view_asr_translation_desc',
    'PLAYER.ASR_TENCENT': 'ui_player_view_asr_translation_engine_tencent',
    'PLAYER.ASR_BAIDU': 'ui_player_view_asr_translation_engine_baidu',
    'PLAYER.ASR_MTRANSERVER': 'ui_player_view_asr_translation_engine_mtranserver',
    'PLAYER.ASR_TARGET_LANG': 'ui_player_view_asr_translation_target_lang',
    'PLAYER.ASR_TARGET_LANG_DESC': 'ui_player_view_asr_translation_target_lang_desc',
    'PLAYER.ASR_TENCENT_SECRET_ID': 'ui_player_view_asr_translation_tencent_secret_id',
    'PLAYER.ASR_TENCENT_SECRET_KEY': 'ui_player_view_asr_translation_tencent_secret_key',
    'PLAYER.ASR_BAIDU_APP_ID': 'ui_player_view_asr_translation_baidu_app_id',
    'PLAYER.ASR_BAIDU_SECRET_KEY': 'ui_player_view_asr_translation_baidu_secret_key',
    'PLAYER.ASR_MTRANSERVER_URL': 'ui_player_view_asr_translation_mtranserver_url',
    'PLAYER.ASR_MTRANSERVER_TOKEN': 'ui_player_view_asr_translation_mtranserver_token',

    'GENERAL.BOOT_LAUNCH': 'ui_channel_view_boot_start',
    'GENERAL.STARTUP_SCREEN': 'ui_app_startup_page',
    'GENERAL.PIP': 'ui_channel_view_picture_in_picture',

    'EPG.ENABLE': 'ui_epg_enable',
    'EPG.ENABLE_DESC': 'ui_epg_enable_desc',
    'EPG.ALWAYS_SHOW_IN_CLASSIC': 'ui_epg_always_show_in_classic_channel_screen',
    'EPG.ALWAYS_SHOW_IN_CLASSIC_DESC': 'ui_epg_always_show_in_classic_channel_screen_desc',
    'EPG.FOLLOW_SOURCE': 'ui_epg_source_follow_iptv',
    'EPG.FOLLOW_SOURCE_DESC': 'ui_epg_source_follow_iptv_desc',
    'EPG.LOAD_ALL': 'ui_epg_source_load_all',
    'EPG.LOAD_ALL_DESC': 'ui_epg_source_load_all_desc',
    'EPG.CUSTOM_EPG': 'ui_epg_source_custom',
    'EPG.REFRESH_THRESHOLD': 'ui_epg_refresh_time_threshold',
    'EPG.REFRESH_THRESHOLD_ALWAYS_DESC': 'ui_epg_refresh_time_on_startup_threshold_desc',

    'UI.SHOW_EPG_PROGRAMME_PROGRESS': 'ui_show_epg_programme_progress',
    'UI.SHOW_EPG_PROGRAMME_PROGRESS_DESC': 'ui_show_epg_programme_progress_desc',
    'UI.SHOW_EPG_PROGRAMME_PERMANENT_PROGRESS': 'ui_show_epg_programme_permanent_progress',
    'UI.SHOW_EPG_PROGRAMME_PERMANENT_PROGRESS_DESC': 'ui_show_epg_programme_permanent_progress_desc',
    'UI.SHOW_CHANNEL_LOGO': 'ui_show_channel_logo',
    'UI.SHOW_REPLAY_BADGE': 'ui_show_replay_badge',
    'UI.SHOW_REPLAY_BADGE_DESC': 'ui_show_replay_badge_desc',
    'UI.SHOW_CHANNEL_PREVIEW': 'ui_show_channel_preview',
    'UI.USE_CLASSIC_PANEL_SCREEN': 'ui_use_classic_panel_screen',
    'UI.USE_CLASSIC_PANEL_SCREEN_DESC': 'ui_use_classic_panel_screen_desc',
    'UI.CLASSIC_SHOW_SOURCE_LIST': 'ui_classic_show_source_list',
    'UI.CLASSIC_SHOW_SOURCE_LIST_DESC': 'ui_classic_show_source_list_desc',
    'UI.CLASSIC_SHOW_CHANNEL_INFO': 'ui_classic_show_channel_info',
    'UI.CLASSIC_SHOW_CHANNEL_INFO_DESC': 'ui_classic_show_channel_info_desc',
    'UI.CLASSIC_SHOW_CHANNEL_NO': 'ui_classic_show_channel_no',
    'UI.CLASSIC_SHOW_CHANNEL_NO_DESC': 'ui_classic_show_channel_no_desc',
    'UI.CLASSIC_SHOW_ALL_CHANNELS': 'ui_classic_show_all_channels',
    'UI.CLASSIC_SHOW_ALL_CHANNELS_DESC': 'ui_classic_show_all_channels_desc',
    'UI.TIME_SHOW_MODE': 'ui_time_show_mode',
    'UI.SCREEN_AUTO_CLOSE_DELAY': 'ui_screen_auto_close_delay',
    'UI.SCREEN_AUTO_CLOSE_DELAY_NEVER': 'ui_screen_auto_close_delay_never',
    'UI.DENSITY_SCALE_RATIO': 'ui_density_scale_ratio',
    'UI.FONT_SCALE_RATIO': 'ui_font_scale_ratio',
    'UI.FOCUS_OPTIMIZE': 'ui_focus_optimize',
    'UI.FOCUS_OPTIMIZE_DESC': 'ui_focus_optimize_desc',

    'CONTROL.DIGITAL_SELECT': 'ui_channel_no_select',
    'CONTROL.CHANNEL_LOOP': 'ui_channel_list_loop',
    'CONTROL.CROSS_GROUP': 'ui_channel_change_cross_group',
    'CONTROL.KEY_BEHAVIOR': 'ui_control_action_settings',

    'WEBVIEW.CORE': 'ui_player_view_webview_core',
    'WEBVIEW.REPLACE_SYSTEM': 'ui_replace_system_webview',
    'WEBVIEW.REPLACE_SYSTEM_HINT': 'ui_replace_system_webview_desc',
    'WEBVIEW.LOAD_TIMEOUT': 'ui_webview_load_timeout',

    'UPDATE.CHANNEL': 'ui_channel_view_update_channel',
    'UPDATE.FORCE_REMIND': 'ui_channel_view_force_remind',

    'NETWORK.RETRY_COUNT': 'ui_network_retry_count',
    'NETWORK.RETRY_COUNT_HINT': 'ui_network_retry_count_desc',
    'NETWORK.RETRY_INTERVAL': 'ui_network_retry_interval',
    'NETWORK.RETRY_INTERVAL_HINT': 'ui_network_retry_interval_desc',

    'SUBSCRIBE.CACHE_TIME': 'ui_subscription_source_cache_time',
    'SUBSCRIBE.HIDDEN_GROUPS': 'ui_channel_group_manage',
    'SUBSCRIBE.HIDDEN_CHANNELS': 'ui_channel_hidden_list',
    'SUBSCRIBE.MERGE_SIMILAR': 'ui_similar_channel_merge',
    'SUBSCRIBE.ICON_OVERRIDE': 'ui_channel_logo_override',
    'SUBSCRIBE.PLTV_TO_TVOD': 'ui_iptv_pltv_to_tvod',
    'SUBSCRIBE.AUTO_ADD_WEB_SOURCE': 'ui_auto_add_web_source',
    'SUBSCRIBE.HTTP_PROXY': 'ui_iptv_source_proxy',

    'IPTV.CHANNEL_FAVORITE_ENABLE': 'iptv_channel_favorite_enable',
    'IPTV.CHANNEL_FAVORITE_ENABLE_DESC': 'iptv_channel_favorite_enable_desc',
    'IPTV.CHANNEL_RECENT_ENABLE': 'iptv_channel_recent_enable',
    'IPTV.CHANNEL_RECENT_ENABLE_DESC': 'iptv_channel_recent_enable_desc',

    'SYNC.AUTO_PULL': 'cloud_sync_auto_pull',
    'SYNC.PROVIDER': 'cloud_sync_provider',

    'DEBUG.SHOW_FPS': 'ui_debug_show_fps',
    'DEBUG.SHOW_PLAYER_METADATA': 'ui_debug_show_player_metadata',
    'DEBUG.SHOW_LAYOUT_GRIDS': 'ui_debug_show_layout_grids',

    'HOME.APP_ID': 'ui_about_app_id',
    'HOME.DEVICE_NAME': 'ui_about_device_name',
    'HOME.DEVICE_ID': 'ui_about_device_id',
    'HOME.YANGSHIPIN_COOKIE': 'ui_iptv_hybrid_yangshipin_cookie',
    'HOME.USER_AGENT': 'ui_player_view_user_agent',
    'HOME.CUSTOM_HEADERS': 'ui_player_view_custom_headers',
    'HOME.GITHUB_GIST_ID': 'cloud_sync_github_gist_id',
    'HOME.GITHUB_GIST_TOKEN': 'cloud_sync_github_gist_token',
    'HOME.GITEE_GIST_ID': 'cloud_sync_gitee_gist_id',
    'HOME.GITEE_GIST_TOKEN': 'cloud_sync_gitee_gist_token',
    'HOME.LOCAL_FILE_PATH': 'cloud_sync_local_file_path',
    'HOME.WEBDAV_URL': 'cloud_sync_webdav_url',
    'HOME.WEBDAV_USERNAME': 'cloud_sync_webdav_username',
    'HOME.WEBDAV_PASSWORD': 'cloud_sync_webdav_password',
    'HOME.NETWORK_URL': 'cloud_sync_network_url',

    'THEME_MODE': 'app_theme_mode',
    'THEME_COLOR_PROVIDER': 'app_theme_color',
    'THEME_MODE_LIGHT': 'app_theme_light',
    'THEME_MODE_DARK': 'app_theme_dark',
    'THEME_MODE_SYSTEM': 'app_theme_system',
    'THEME_COLOR_PROVIDER_BUILTIN': 'app_theme_color_follow_system',
    'THEME_COLOR_PROVIDER_WALLPAPER': 'app_theme_color_follow_app_background',
    'THEME_COLOR_PROVIDER_PLAIN': 'app_theme_color_pure',

    'SETTINGS.VIDEO_PLAYER_CORE.MEDIA3': 'ui_video_player_core_media3_desc',
    'SETTINGS.VIDEO_PLAYER_CORE.IJK': 'ui_video_player_core_ijk_desc',
    'SETTINGS.VIDEO_PLAYER_CORE.VLC': 'ui_video_player_core_vlc_desc',
  };

  if (specialMap[angularKey]) {
    patterns.push(specialMap[angularKey]);
  }

  return patterns;
}

// 扁平化 Angular JSON
function flattenObject(obj, prefix = '') {
  const result = {};
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(result, flattenObject(obj[key], fullKey));
    } else {
      result[fullKey] = obj[key];
    }
  }
  return result;
}

const flatAngular = flattenObject(angularZh);

// 比对结果
const mismatches = [];
const notFound = [];

for (const [angularKey, angularValue] of Object.entries(flatAngular)) {
  if (typeof angularValue !== 'string') continue;

  const possibleKeys = tryMapKeys(angularKey);

  if (possibleKeys.length === 0) {
    // 没有特殊映射，跳过
    continue;
  }

  let found = false;
  let androidValue = null;
  let matchedKey = null;

  for (const androidKey of possibleKeys) {
    if (androidMap.has(androidKey)) {
      found = true;
      androidValue = androidMap.get(androidKey);
      matchedKey = androidKey;
      break;
    }
  }

  if (!found) {
    notFound.push({
      key: angularKey,
      value: angularValue,
      attempted: possibleKeys
    });
  } else {
    // 清理 Angular 值用于比对
    const cleanAngular = angularValue
      .replace(/\{\{[^}]+\}}/g, '') // 移除 {{变量}}
      .replace(/\s+/g, ' ')
      .trim();

    const cleanAndroid = androidValue
      .replace(/\s+/g, ' ')
      .trim();

    if (cleanAngular !== cleanAndroid && cleanAngular !== '' && cleanAndroid !== '') {
      mismatches.push({
        key: angularKey,
        angularValue: angularValue,
        androidKey: matchedKey,
        androidValue: androidMap.get(matchedKey)
      });
    }
  }
}

// 输出报告
console.log('='.repeat(80));
console.log('翻译比对报告');
console.log('='.repeat(80));
console.log();

if (mismatches.length > 0) {
  console.log('【不匹配的翻译】');
  console.log();
  for (const item of mismatches) {
    console.log(`❌ ${item.key}`);
    console.log(`   Angular: "${item.angularValue}"`);
    console.log(`   Android (${item.androidKey}): "${item.androidValue}"`);
    console.log();
  }
} else {
  console.log('✅ 所有已映射的翻译均匹配！');
  console.log();
}

if (notFound.length > 0) {
  console.log('【Android 中未找到对应字符串】');
  console.log();
  for (const item of notFound) {
    console.log(`❓ ${item.key}`);
    console.log(`   Angular: "${item.value}"`);
    console.log(`   尝试的 Android key: ${item.attempted.join(', ')}`);
    console.log();
  }
}

console.log('='.repeat(80));
console.log(`统计：不匹配 ${mismatches.length} 项，未找到 ${notFound.length} 项`);
console.log('='.repeat(80));
