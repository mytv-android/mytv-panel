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
    styleUrl: './home.component.css'
})
export class HomeComponent {
    
    configsService = inject(ConfigsService);
    snackBar = inject(MatSnackBar);
    breakpointObserver = inject(BreakpointObserver);
    translate = inject(TranslateService);

    isSmallScreen = false;

    initName = this.translate.instant('添加于', { date: new Date().toLocaleString() });

    subscription = {
        type: 'remote',
        name: this.initName,
        userName: '',
        password: '',
        format: 'm3u_plus',
        url: '',
        ua: '',
        mac: ''
    };

    epgSource = {
        name: this.initName,
        url: ''
    };

    info = {
        applicationId: "",
        flavor: "",
        buildType: "",
        versionCode: 1,
        versionName: "",
        deviceName: "",
        deviceId: ""
    }
    channelIconUrl = '';

    cookie = '';

    channelAlias = '';

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
            AppApi.getChannelAlias().then(alias => {
                this.channelAlias = alias;
            }); 
            AppApi.getAbout().then(info => {
                this.info = info;
            });
        }
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
            const dateStr = new Date().toLocaleString();
            this.subscription.name = this.translate.instant('HOME.ADDED_AT', { date: dateStr });
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
            mac: mac
        };
        if (this.configs.iptvSourceList === undefined) {
            this.configs.iptvSourceList = { value: [iptvsource] };
        } else {
            this.configs.iptvSourceList = { value: [...this.configs.iptvSourceList.value, iptvsource] };
        }
        this.configsService.updateData(this.configs);
        window.location.reload();
    }

    updateConfig() {
        this.configsService.updateData(this.configs);
        window.location.reload();
    }

    pushAlias() {
        AppApi.changeChannelAlias(this.channelAlias).then(() => {
            this.snackBar.open(
                this.translate.instant('HOME.PUSH_SUCCESS'), 
                this.translate.instant('HOME.CLOSE'), 
                { duration: 3000 }
            );
        }).catch(() => {
            this.snackBar.open(
                this.translate.instant('HOME.PUSH_FAILED'), 
                this.translate.instant('HOME.CLOSE'), 
                { duration: 3000 }
            );
        });
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
    }

    onSubscriptionFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (!input || !input.files || input.files.length === 0) return;
        const file = input.files[0];
        this.subscriptionFileName = file.name;
        const reader = new FileReader();
        reader.onload = () => {
            this.subscription.url = reader.result as string || '';
            if (this.subscription.name === this.initName) {
                this.subscription.name = file.name;
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
