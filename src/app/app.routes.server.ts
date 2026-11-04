import { RenderMode, ServerRoute } from '@angular/ssr';

/** 旧地址只做重定向，不预渲染（客户端路由里跳到新分类）；其余页面全部预渲染 */
const REDIRECTS = ['sources', 'epg', 'ui', 'theme', 'services', 'webview', 'general', 'update', 'backup', 'log'];

export const serverRoutes: ServerRoute[] = [
  ...REDIRECTS.map((path): ServerRoute => ({ path, renderMode: RenderMode.Client })),
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
