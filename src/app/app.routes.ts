import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SourceComponent } from './source/source.component';
import { PlayerComponent } from './player/player.component';
import { EnhanceComponent } from './enhance/enhance.component';
import { ChannelsComponent } from './channels/channels.component';
import { LookComponent } from './look/look.component';
import { ControlComponent } from './control/control.component';
import { CastComponent } from './cast/cast.component';
import { NetworkComponent } from './network/network.component';
import { SyncComponent } from './sync/sync.component';
import { AppSettingsComponent } from './app-settings/app-settings.component';
import { DebugComponent } from './debug/debug.component';
import { FileComponent } from './file/file.component';

/**
 * 11 个设置分类与 App 新版设置页一一对应（顺序同 App）；旧地址重定向到内容所在的新分类。
 * 重定向不预渲染（见 app.routes.server.ts），只在面板内跳转时生效。
 */
export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full', data: { title: '首页' } },
  { path: 'source', component: SourceComponent, data: { title: 'TV.settings_category_source' } },
  { path: 'player', component: PlayerComponent, data: { title: 'TV.settings_category_player' } },
  { path: 'enhance', component: EnhanceComponent, data: { title: 'TV.settings_category_enhance' } },
  { path: 'channels', component: ChannelsComponent, data: { title: 'TV.settings_category_channels' } },
  { path: 'look', component: LookComponent, data: { title: 'TV.settings_category_look' } },
  { path: 'control', component: ControlComponent, data: { title: 'TV.settings_category_control' } },
  { path: 'cast', component: CastComponent, data: { title: 'TV.settings_category_cast' } },
  { path: 'network', component: NetworkComponent, data: { title: 'TV.settings_category_network' } },
  { path: 'sync', component: SyncComponent, data: { title: 'TV.settings_category_sync' } },
  { path: 'app', component: AppSettingsComponent, data: { title: 'TV.settings_category_app' } },
  { path: 'debug', component: DebugComponent, data: { title: 'TV.settings_category_debug' } },
  { path: 'file', component: FileComponent, data: { title: '文件' } },

  // 旧地址
  { path: 'sources', redirectTo: 'source' },
  { path: 'epg', redirectTo: 'source' },
  { path: 'ui', redirectTo: 'channels' },
  { path: 'theme', redirectTo: 'look' },
  { path: 'services', redirectTo: 'cast' },
  { path: 'webview', redirectTo: 'player' },
  { path: 'general', redirectTo: 'app' },
  { path: 'update', redirectTo: 'app' },
  { path: 'backup', redirectTo: 'sync' },
  { path: 'log', redirectTo: 'debug' },
];
