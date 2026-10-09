import { Component, inject, effect, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfigsService, AppApi, IptvSource, IptvSourceList, AppConfigs, EpgSource, CloudSyncProvider } from '../api';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TextareaWithLinesComponent } from '../common/textarea-with-lines/textarea-with-lines.component';
import { FILE_PICKER_KEY } from '../file/file.component';
@Component({
    selector: 'app-home',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatRadioModule,
        MatCheckboxModule,
        MatIconModule,
        MatSelectModule,
        MatSnackBarModule,
        TranslateModule,
        TextareaWithLinesComponent
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    host: {
        'animate.enter': 'enter',
        'animate.leave': 'leave'
    }
})
export class HomeComponent {

    configsService = inject(ConfigsService);
    snackBar = inject(MatSnackBar);
    breakpointObserver = inject(BreakpointObserver);
    translate = inject(TranslateService);

    isSmallScreen = false;
    isSubscriptionNameTouched = false;
    isEpgSourceNameTouched = false;

    private getDefaultName(lang?: string) {
        const l = lang || this.translate.currentLang || 'en';
        return this.translate.instant('HOME.ADDED_AT', { date: new Date().toLocaleString(l) });
    }

    subscription = {
        type: 'remote',
        name: '',
        userName: '',
        password: '',
        format: 'm3u_plus',
        url: '',
        ua: '',
        mac: '',
        protocol: 'auto',
        port: undefined as number | undefined
    };

    /** 网络协议：auto/http 走普通 HTTP，其余走对应协议客户端 */
    sourceProtocols = [
        { value: 'auto', label: 'SUBSCRIBE.PROTOCOL_AUTO' },
        { value: 'http', label: 'SUBSCRIBE.PROTOCOL_HTTP' },
        { value: 'ftp', label: 'SUBSCRIBE.PROTOCOL_FTP' },
        { value: 'ftps', label: 'SUBSCRIBE.PROTOCOL_FTPS' },
        { value: 'smb', label: 'SUBSCRIBE.PROTOCOL_SMB' },
        { value: 'webdav', label: 'SUBSCRIBE.PROTOCOL_WEBDAV' },
        { value: 'webdavs', label: 'SUBSCRIBE.PROTOCOL_WEBDAVS' },
    ];
    /** 地址 scheme 即为网络协议的订阅源 */
    private static readonly NETWORK_SCHEME = /^(ftp|ftps|smb|smb2|cifs|webdav|webdavs|dav|davs):\/\//i;

    epgSource = {
        name: '',
        url: ''
    };

    info = {
        applicationId: "",
        flavor: "",
        buildType: "",
        versionCode: 1,
        versionName: "",
        deviceName: "",
    }
    channelIconUrl = '';

    cookie = '';

    configs: AppConfigs = {};

    channelAliasExample = JSON.stringify({
        __suffix: ['-高码', '-HD'],
        CCTV1: ['CCTV1HD', 'CCTV1 HD'],
    }, null, 2);

    cloudSyncProvider = CloudSyncProvider;

    subscriptionFileName = ''; // Added: Store selected file name

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Small, '(max-width: 600px)']).subscribe(result => {
            this.isSmallScreen = result.matches;
        });

        effect(() => {
            this.configs = this.configsService.data();
            this.channelIconUrl = this.configs.iptvChannelLogoProvider || '';
            this.cookie = this.configs.iptvHybridYangshipinCookie || '';
        });

        if (isPlatformBrowser(this.platformId)) {
            AppApi.getAbout().then(info => {
                this.info = info;
            });

            this.subscription.name = this.getDefaultName();
            this.epgSource.name = this.getDefaultName();

            // 从「文件」页「使用」带回来的本地文件路径
            const pickedPath = sessionStorage.getItem(FILE_PICKER_KEY);
            if (pickedPath) {
                sessionStorage.removeItem(FILE_PICKER_KEY);
                this.subscription.type = 'file';
                this.subscription.url = pickedPath;
                this.isSubscriptionNameTouched = true;
            }

            this.translate.onLangChange.subscribe((event) => {
                if (!this.isSubscriptionNameTouched) {
                    this.subscription.name = this.getDefaultName(event.lang);
                }
                if (!this.isEpgSourceNameTouched) {
                    this.epgSource.name = this.getDefaultName(event.lang);
                }
            });
        }
    }

    /** 是否需要显示 FTP/SMB/WebDAV 的账号密码与端口（显式选择协议，或地址 scheme 即网络协议） */
    get showNetworkProtocolFields(): boolean {
        if (this.subscription.type !== 'remote') return false;
        const protocol = (this.subscription.protocol || 'auto').toLowerCase();
        if (protocol !== 'auto' && protocol !== 'http') return true;
        return HomeComponent.NETWORK_SCHEME.test(this.subscription.url || '');
    }

    /** 端口归一化：空值/非法值视为未配置 */
    private normalizedPort(): number | undefined {
        const port = Number(this.subscription.port);
        return Number.isFinite(port) && port >= 1 && port <= 65535
            ? Math.floor(port)
            : undefined;
    }

    async pushSubscription() {
        var type = 0;
        if (this.subscription.type === 'remote')
            type = 0;
        else if (this.subscription.type === 'xtream')
            type = 2;
        else if (this.subscription.type === 'stalker')
            type = 3;
        else
            type = 1;
        var usrName = undefined;
        var passwrd = undefined;
        var format = undefined;
        var mac = undefined;
        if (type === 2) {
            usrName = this.subscription.userName;
            passwrd = this.subscription.password;
            format = this.subscription.format;
        }
        if (type === 3) {
            mac = this.subscription.mac;
        }
        if (!this.subscription.name) {
            this.subscription.name = this.getDefaultName();
        }
        if (this.subscription.type === 'content') {
            this.subscription.url = (await AppApi.writeFileContentWithDir('file', `iptv_source_local_${Date.now()}.txt`, this.subscription.url)) as unknown as string;
        }
        const iptvsource: IptvSource = {
            name: this.subscription.name,
            url: this.subscription.url,
            sourceType: type,
            userName: usrName,
            password: passwrd,
            format: format,
            transformJs: undefined,
            httpUserAgent: this.subscription.ua,
            mac: mac,
            protocol: this.subscription.protocol?.trim() || undefined,
            port: this.normalizedPort()
        };
        if (this.configs.iptvSourceList === undefined) {
            this.configs.iptvSourceList = { value: [iptvsource] };
        } else {
            this.configs.iptvSourceList = { value: [...this.configs.iptvSourceList.value, iptvsource] };
        }
        this.configsService.updateData(this.configs);
        this.snackBar.open(
            this.translate.instant('HOME.ADD_SUCCESS'),
            this.translate.instant('HOME.CLOSE'),
            { duration: 3000 }
        );
        window.location.reload();
    }

    updateConfig() {
        this.configsService.updateData(this.configs);
        window.location.reload();
    }

    pushEpgSource() {
        const epgSource: EpgSource = {
            name: this.epgSource.name,
            url: this.epgSource.url
        };
        if (this.configs.epgSourceList === undefined) {
            this.configs.epgSourceList = { value: [epgSource] };
        } else {
            this.configs.epgSourceList = { value: [...this.configs.epgSourceList.value, epgSource] };
        }
        this.configsService.updateData(this.configs);
        this.snackBar.open(
            this.translate.instant('HOME.ADD_SUCCESS'),
            this.translate.instant('HOME.CLOSE'),
            { duration: 3000 }
        );
    }

    onSubscriptionFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (!input || !input.files || input.files.length === 0) return;
        const file = input.files[0];
        this.subscriptionFileName = file.name;
        const reader = new FileReader();
        reader.onload = () => {
            this.subscription.url = reader.result as string || '';
            if (!this.isSubscriptionNameTouched) {
                this.subscription.name = file.name;
                this.isSubscriptionNameTouched = true;
            }
        };
        reader.onerror = (err) => {
            console.error('Failed to read file', err);
        };
        reader.readAsText(file);
    }

    selectedFile: File | null = null;
    selectedFileName: string = '';

    onFileSelected(event: any) {
        const file: File = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            this.selectedFileName = file.name;
        }
    }

    async uploadApk() {
        if (!this.selectedFile) return;

        try {
            await AppApi.uploadApk(this.selectedFile);
            this.snackBar.open(
                this.translate.instant('HOME.UPLOAD_SUCCESS'),
                this.translate.instant('HOME.CLOSE'),
                { duration: 3000 }
            );
            this.selectedFile = null;
            this.selectedFileName = '';
        } catch (e) {
            console.error(e);
            this.snackBar.open(
                this.translate.instant('HOME.UPLOAD_FAILED'),
                this.translate.instant('HOME.CLOSE'),
                { duration: 3000 }
            );
        }
    }
}
