import { Component, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { filter, map, mergeMap } from 'rxjs/operators';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { HttpService } from './request';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, MatSidenavModule, MatListModule, TranslateModule, MatButtonModule, MatIconModule, MatToolbarModule, MatMenuModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'mytv';
  isDarkMode = false;

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private titleService = inject(Title);
  private currentTitleKey: string = '';

  menuItems = [
    { name: '首页', route: '/' },
    { name: '通用', route: '/general' },
    { name: '订阅源', route: '/sources' },
    { name: '节目单', route: '/epg' },
    { name: '界面', route: '/ui' },
    { name: '主题', route: '/theme' },
    { name: '控制', route: '/control' },
    { name: '播放器', route: '/player' },
    { name: 'WebView', route: '/webview' },
    { name: '更新', route: '/update' },
    { name: '网络', route: '/network' },
    { name: '云同步', route: '/sync' },
    { name: '调试', route: '/debug' },
    { name: '日志', route: '/log' }
  ];

  private translate = inject(TranslateService);
  private httpService = inject(HttpService);
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);

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
