import { Component, HostListener, inject, PLATFORM_ID, OnInit, DOCUMENT } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd, ActivatedRoute, IsActiveMatchOptions } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { filter, map, mergeMap } from 'rxjs/operators';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { HttpService } from './request';
import { SettingsSearchService } from './settings-search/settings-search.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatSidenavModule, TranslateModule, MatButtonModule, MatIconModule, MatToolbarModule, MatMenuModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'mytv';
  isDarkMode = false;
  /** ≥1024px：侧边导航常驻；以下收进抽屉，顶栏显示当前页名 */
  isWide = false;

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private titleService = inject(Title);
  currentTitleKey: string = '';

  // 按路径精确匹配高亮当前页，忽略 ?lang= 等查询参数
  activeOptions: IsActiveMatchOptions = { paths: 'exact', queryParams: 'ignored', matrixParams: 'ignored', fragment: 'ignored' };

  // 与 App 新版设置页的分类、分组、顺序一致；文件是面板独有，放在系统组末尾
  menuGroups = [
    {
      name: '',
      items: [
        { name: '首页', route: '/', icon: 'home' },
      ]
    },
    {
      name: 'TV.settings_group_watch',
      items: [
        { name: 'TV.settings_category_source', route: '/source', icon: 'subscriptions' },
        { name: 'TV.settings_category_player', route: '/player', icon: 'play_circle' },
        { name: 'TV.settings_category_enhance', route: '/enhance', icon: 'auto_awesome' },
        { name: 'TV.settings_category_channels', route: '/channels', icon: 'format_list_bulleted' },
      ]
    },
    {
      name: 'TV.settings_group_personalize',
      items: [
        { name: 'TV.settings_category_look', route: '/look', icon: 'palette' },
        { name: 'TV.settings_category_control', route: '/control', icon: 'gamepad' },
      ]
    },
    {
      name: 'TV.settings_group_connect',
      items: [
        { name: 'TV.settings_category_cast', route: '/cast', icon: 'cast' },
        { name: 'TV.settings_category_network', route: '/network', icon: 'wifi' },
        { name: 'TV.settings_category_sync', route: '/sync', icon: 'cloud_sync' },
      ]
    },
    {
      name: 'TV.settings_group_system',
      items: [
        { name: 'TV.settings_category_app', route: '/app', icon: 'devices' },
        { name: 'TV.settings_category_debug', route: '/debug', icon: 'help_outline' },
        { name: '文件', route: '/file', icon: 'folder' },
      ]
    },
  ];

  private translate = inject(TranslateService);
  private settingsSearch = inject(SettingsSearchService);
  private httpService = inject(HttpService);
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private breakpointObserver = inject(BreakpointObserver);

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map(route => {
        while (route.firstChild) route = route.firstChild;
        return route;
      }),
      filter(route => route.outlet === 'primary'),
      mergeMap(route => route.data)
    ).subscribe(event => {
      if (event['title']) {
        this.currentTitleKey = event['title'];
        this.updateTitle();
      }
    });

    this.translate.onLangChange.subscribe((event) => {
      this.updateTitle();
      this.updateDirection(event.lang);
    });
  }

  updateTitle() {
    if (this.currentTitleKey) {
      this.translate.get([this.currentTitleKey, 'mytv']).subscribe(translations => {
        const title = translations[this.currentTitleKey];
        const appName = translations['mytv'];
        this.titleService.setTitle(`${title} - ${appName}`);
      });
    }
  }

  constructor() {
    this.breakpointObserver.observe('(min-width: 1024px)')
      .pipe(takeUntilDestroyed())
      .subscribe(state => this.isWide = state.matches);

    this.translate.addLangs(['en', 'zh', 'ar']);
    this.translate.setFallbackLang('en');

    let lang = 'en';
    
    if (isPlatformBrowser(this.platformId)) {
      const browserLang = this.translate.getBrowserLang();
      if (browserLang?.match(/en|zh|ar/)) {
        lang = browserLang;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const queryLang = urlParams.get('lang');
      if (queryLang && ['en', 'zh', 'ar'].includes(queryLang)) {
        lang = queryLang;
      }

      // Initialize theme
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        this.isDarkMode = savedTheme === 'dark';
      } else {
        this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      this.applyTheme();
    }

    this.translate.use(lang);
    this.updateDirection(lang);
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
  }

  openSearch(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.settingsSearch.open();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.openSearch();
    }
  }

  private updateDirection(lang: string) {
    if (isPlatformBrowser(this.platformId)) {
      const dir = lang === 'ar' ? 'rtl' : 'ltr';
      this.document.documentElement.setAttribute('dir', dir);
      this.document.documentElement.setAttribute('lang', lang);
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    }
  }

  private applyTheme() {
    if (this.isDarkMode) {
      this.document.body.classList.add('dark-mode');
      this.document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      this.document.body.classList.remove('dark-mode');
      this.document.documentElement.removeAttribute('data-theme');
    }
  }
}
