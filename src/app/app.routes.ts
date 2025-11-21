import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { GeneralComponent } from './general/general.component';
import { LogComponent } from './log/log.component';
import { BackupComponent } from './backup/backup.component';
import { DebugComponent } from './debug/debug.component';
import { ThemeComponent } from './theme/theme.component';
import { UpdateComponent } from './update/update.component';
import { NetworkComponent } from './network/network.component';
import { WebviewComponent } from './webview/webview.component';
import { PlayerComponent } from './player/player.component';
import { ControlComponent } from './control/control.component';
import { UiComponent } from './ui/ui.component';
import { EpgComponent } from './epg/epg.component';
import { SubscribeComponent } from './subscribe/subscribe.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full', data: { title: '首页' } },
  { path: 'general', component: GeneralComponent, data: { title: '通用' } },
  { path: 'sources', component: SubscribeComponent, data: { title: '订阅源' } },
  { path: 'epg', component: EpgComponent, data: { title: '节目单' } },
  { path: 'ui', component: UiComponent, data: { title: '界面' } },
  { path: 'log', component: LogComponent, data: { title: '日志' } },
  { path: 'sync', component: BackupComponent, data: { title: '云同步' } },
  { path: 'debug', component: DebugComponent, data: { title: '调试' } },
  { path: 'theme', component: ThemeComponent, data: { title: '主题' } },
  { path: 'control', component: ControlComponent, data: { title: '控制' } },
  { path: 'update', component: UpdateComponent, data: { title: '更新' } },
  { path: 'network', component: NetworkComponent, data: { title: '网络' } },
  { path: 'webview', component: WebviewComponent, data: { title: 'WebView' } },
  { path: 'player', component: PlayerComponent, data: { title: '播放器' } },
];
