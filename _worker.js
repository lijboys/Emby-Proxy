/**
 * 🎬 Emby-Cloudflare-Proxy (v8.03 极简纯净版)
 * @description  动态寻址 | 智能缓存 | 端口找回 | 容错白名单
 */

// ====================================================
// 默认配置 (极简版)
const DEFAULT_CONFIG = {
  admin_password: 'admin', 
  enable_whitelist: false, 
  blacklist: [],           
  whitelist: [],
  custom_html: `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>🚀 极简代理服务</title><style>body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f4f5f7; color: #333; padding: 20px; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; } .container { background: #fff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); text-align: center; max-width: 500px; } h1 { color: #0066ff; margin-bottom: 20px; } p { color: #666; line-height: 1.6; } .host { font-family: monospace; background: #f0f4f8; padding: 8px 12px; border-radius: 6px; color: #d63384; display: inline-block; margin-top: 15px; }</style></head><body><div class="container"><h1>🎬 Proxy Active</h1><p>代理节点运行正常。<br>请在客户端中按规范拼接目标服务器地址使用。</p><div class="host">https://{{HOST}}/目标地址:端口</div></div></body></html>`
};
// ====================================================

let configCache = null;
let lastCacheTime = 0;

const STATIC_REGEX = /(\.(jpg|jpeg|png|gif|svg|webp)|(\/Images\/(Primary|Backdrop|Logo|Thumb|Banner|Art)))/i;
const API_CACHE_REGEX = /(\/Items\/Resume|\/Users\/.*\/Items)/i;
const VIDEO_REGEX = /(\/Videos\/|\/Items\/.*\/Download|\/Items\/.*\/Stream)/i;

export default {
  async fetch(request, env, ctx) { return handleRequest(request, env, ctx); }
};

// ==========================================
// 核心请求处理逻辑
// ==========================================
async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);

  let rawAdmin = env.admin || '/emby-admin';
  if (!rawAdmin.startsWith('/')) rawAdmin = '/' + rawAdmin;
  const adminRoute = rawAdmin;

  // 拦截后台路由
  if (url.pathname.startsWith(adminRoute)) {
    return handleAdminRoute(request, env, url, adminRoute);
  }

  const now = Date.now();
  if (!configCache || now - lastCacheTime > 60000) {
    let kvConfig = null;
    if (env.kv) {
      try {
        const kvData = await env.kv.get('CONFIG');
        if (kvData) kvConfig = JSON.parse(kvData);
      } catch (e) {}
    }
    configCache = { ...DEFAULT_CONFIG, ...(kvConfig || {}) };
    lastCacheTime = now;
  }
  const config = configCache;

  if (url.hostname.endsWith('.workers.dev') || url.hostname.endsWith('.pages.dev')) {
    return new Response('Access Denied', { status: 403 });
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': '*', 'Access-Control-Max-Age': '86400' } });
  }

  let targetUrl = null;
  const rawPath = url.pathname.slice(1) + url.search;

  function parseTarget(str) {
    if (!str || str.startsWith('web/') || str.startsWith('emby/')) return null;
    let finalStr = str;
    if (!finalStr.startsWith('http')) {
      if (finalStr.includes(':443') || finalStr.includes(':8443') || finalStr.includes(':8920') || url.port === '8443' || url.port === '8920') {
        finalStr = 'https://' + finalStr;
      } else {
        finalStr = 'http://' + finalStr;
      }
    }
    try {
      const u = new URL(finalStr);
      // 🔮 端口防呆找回
      if (!u.port && url.port) {
        u.port = url.port;
      }
      if (u.hostname.includes('.') && !u.pathname.startsWith('/System') && !u.pathname.startsWith('/Users')) return u;
    } catch(e) {}
    return null;
  }

  targetUrl = parseTarget(rawPath);
  if (!targetUrl) {
    const referer = request.headers.get('Referer');
    if (referer) {
      try {
        const refUrl = new URL(referer);
        const refTarget = parseTarget(refUrl.pathname.slice(1) + refUrl.search);
        if (refTarget) targetUrl = new URL(url.pathname + url.search, refTarget.origin);
      } catch(e) {}
    }
  }

  if (!targetUrl) {
    const htmlContent = (config.custom_html || DEFAULT_CONFIG.custom_html).replace(/{{HOST}}/g, url.host);
    return new Response(htmlContent, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
  }

  const clientIP = request.headers.get('CF-Connecting-IP') || 'Unknown';
  const targetHost = targetUrl.hostname;

  // 🔮 名单智能匹配校验器 (支持容错提取)
  const checkMatch = (list, ip, host) => {
    if (!list || !Array.isArray(list)) return false;
    for (let item of list) {
      let line = item.trim();
      if (!line || line.startsWith('#') || line.startsWith('//')) continue;
      let clean = line.replace(/^https?:\/\//i, '').split('/')[0].split(':')[0].trim();
      if (clean === ip || clean === host) return true;
    }
    return false;
  };

  if (checkMatch(config.blacklist, clientIP, targetHost)) {
    return new Response('Blocked by Administrator.', { status: 403 });
  }
  
  if (config.enable_whitelist) {
    if (!checkMatch(config.whitelist, clientIP, targetHost)) {
      return new Response('Not in Whitelist.', { status: 403 });
    }
  }

  if (request.headers.get('Upgrade') === 'websocket') {
    const wsProtocol = targetUrl.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsTargetUrl = `${wsProtocol}//${targetUrl.host}${targetUrl.pathname}${targetUrl.search}`;
    const clientSocket = new WebSocketPair();
    const [client, server] = Object.values(clientSocket);
    try {
      const targetSocket = new WebSocket(wsTargetUrl);
      targetSocket.accept();
      targetSocket.addEventListener('message', event => server.send(event.data));
      server.addEventListener('message', event => targetSocket.send(event.data));
      targetSocket.addEventListener('close', event => server.close(event.code, event.reason));
      server.addEventListener('close', event => targetSocket.close(event.code, event.reason));
      targetSocket.addEventListener('error', e => server.close(1011, e.message));
      server.addEventListener('error', e => targetSocket.close(1011, e.message));
    } catch (e) { return new Response(null, { status: 500 }); }
    return new Response(null, { status: 101, webSocket: client });
  }

  const newHeaders = new Headers(request.headers);
  newHeaders.set('Host', targetUrl.host);
  newHeaders.set('Origin', targetUrl.origin); 
  newHeaders.set('Referer', targetUrl.href);  
  newHeaders.set('X-Forwarded-For', clientIP);
  newHeaders.delete('cf-connecting-ip');
  
  const newRequest = new Request(targetUrl.toString(), {
    method: request.method, headers: newHeaders, body: request.body, redirect: 'manual' 
  });

  const isImage = STATIC_REGEX.test(targetUrl.pathname);
  const isApiCacheable = API_CACHE_REGEX.test(targetUrl.pathname);
  const isVideo = VIDEO_REGEX.test(targetUrl.pathname);
  const isGetReq = request.method === 'GET';

  const cache = caches.default;
  if ((isImage || isApiCacheable) && isGetReq) {
    const cachedResponse = await cache.match(newRequest);
    if (cachedResponse) return cachedResponse;
  }

  try {
    const response = await fetch(newRequest);
    const resHeaders = new Headers(response.headers);
    resHeaders.set('Access-Control-Allow-Origin', '*'); 

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = resHeaders.get('location');
      if (location) {
        try {
          const locUrl = new URL(location, targetUrl.href);
          if (locUrl.hostname === targetUrl.hostname) resHeaders.set('Location', url.origin + '/' + locUrl.href);
        } catch(e) {}
      }
    }

    if (isVideo) {
      resHeaders.set('Connection', 'close');
      return new Response(response.body, { status: response.status, headers: resHeaders });
    }

    if (response.status === 200 && isGetReq) {
      if (isImage) {
        // 🔮 智能缓存识别
        if (targetUrl.search.toLowerCase().includes('tag=')) {
          resHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');
        } else {
          resHeaders.set('Cache-Control', 'public, max-age=7200'); 
        }
        resHeaders.delete('Pragma'); resHeaders.delete('Expires');
        const responseToCache = new Response(response.body, { status: response.status, headers: resHeaders });
        ctx.waitUntil(cache.put(newRequest, responseToCache.clone()));
        return responseToCache;
      } else if (isApiCacheable) {
        resHeaders.set('Cache-Control', `public, max-age=10`);
        const responseToCache = new Response(response.body, { status: response.status, headers: resHeaders });
        ctx.waitUntil(cache.put(newRequest, responseToCache.clone()));
        return responseToCache;
      }
    }
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers: resHeaders });
  } catch (e) {
    return new Response(JSON.stringify({ error: `代理请求失败: ${e.message}` }), { status: 502, headers: { 'Content-Type': 'application/json' } });
  }
}

// ==========================================
// 后台路由与 API 处理函数 (精简版)
// ==========================================
async function handleAdminRoute(request, env, url, adminRoute) {
  if (!env.kv) return new Response('未绑定 KV 存储空间，请在 CF 后台绑定小写的 kv 变量。', { status: 500, headers: {'Content-Type': 'text/plain;charset=utf-8'} });

  let kvConfig = null;
  try {
    const kvData = await env.kv.get('CONFIG');
    if (kvData) kvConfig = JSON.parse(kvData);
  } catch (e) {}
  const currentConfig = { ...DEFAULT_CONFIG, ...(kvConfig || {}) };

  if (url.pathname === `${adminRoute}/api/login` && request.method === 'POST') {
    const body = await request.json();
    if (body.password === currentConfig.admin_password) {
      return new Response(JSON.stringify({ success: true }), { headers: { 'Set-Cookie': `admin_auth=${currentConfig.admin_password}; Path=/; HttpOnly; Max-Age=2592000`, 'Content-Type': 'application/json' }});
    }
    return new Response(JSON.stringify({ success: false, msg: '密码错误' }), { status: 401 });
  }

  const cookies = request.headers.get('Cookie') || '';
  if (!cookies.includes(`admin_auth=${currentConfig.admin_password}`)) {
    if (url.pathname.startsWith(`${adminRoute}/api`)) return new Response('Unauthorized', { status: 401 });
    return new Response(ADMIN_LOGIN_HTML(adminRoute), { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
  }

  if (url.pathname === `${adminRoute}/api/config` && request.method === 'GET') {
    return new Response(JSON.stringify(currentConfig), { headers: { 'Content-Type': 'application/json' }});
  }

  if (url.pathname === `${adminRoute}/api/config` && request.method === 'POST') {
    const newConfig = await request.json();
    await env.kv.put('CONFIG', JSON.stringify({ ...currentConfig, ...newConfig }));
    configCache = null; 
    return new Response(JSON.stringify({ success: true }));
  }

  return new Response(ADMIN_PANEL_HTML(adminRoute), { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
}

// ==========================================
// 前端 HTML 模板区 (精简版)
// ==========================================
const ADMIN_LOGIN_HTML = (route) => `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>纯净代理控制台</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 flex items-center justify-center h-screen">
  <div class="bg-white p-10 rounded-2xl shadow-xl w-96 border border-gray-100">
    <h2 class="text-3xl font-extrabold text-center text-blue-600 mb-8 tracking-tight">🎬 代理控制台</h2>
    <div class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">管理员密码</label>
        <input type="password" id="pwd" class="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="输入您的暗号..." @keyup.enter="login">
      </div>
      <button onclick="login()" class="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg transition-all active:scale-[0.98]">登 录</button>
    </div>
    <p id="err" class="text-red-500 text-sm mt-4 text-center hidden bg-red-50 py-2 rounded-lg">🔒 密码错误，请重试</p>
  </div>
  <script>
    async function login() {
      const p = document.getElementById('pwd').value;
      const res = await fetch('${route}/api/login', { method: 'POST', body: JSON.stringify({password: p}) });
      if(res.ok) location.reload(); else document.getElementById('err').classList.remove('hidden');
    }
  </script>
</body>
</html>
`;

const ADMIN_PANEL_HTML = (route) => `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>纯净代理控制台</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
  <style>
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
    .fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
    .fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-10px); }
  </style>
</head>
<body class="bg-[#F8FAFC] text-slate-800 antialiased font-sans">
  <div id="app" class="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
    
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-slate-200 pb-6 mb-8 gap-4">
      <div>
        <h1 class="text-4xl font-extrabold text-blue-600 tracking-tight">🎬 Proxy Panel</h1>
        <p class="text-slate-500 mt-2 flex items-center gap-2">
          <span class="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-md font-semibold">v8.03 极简纯净版</span>
          <span>轻量 · 极速 · 安全</span>
        </p>
      </div>
      <button @click="save" class="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all active:scale-95 flex items-center gap-2">
        <svg v-if="saving" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <span v-if="saving">正在保存...</span>
        <span v-else>💾 保存设置</span>
      </button>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
      <div>
        <h3 class="font-bold text-slate-800 text-lg flex items-center gap-2 mb-1">
          <span class="text-xl">🔐</span> 当前后台暗号路径: <span class="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg font-mono text-sm border border-slate-200">{{route}}</span>
        </h3>
        <p class="text-slate-500 text-sm">如需修改入口，请在 CF 的 <span class="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">变量和机密</span> 中修改 <b>admin</b> 变量的值。</p>
      </div>
      <div class="w-full md:w-64">
        <label class="block text-sm font-semibold text-slate-700 mb-1.5">🔑 修改登录密码</label>
        <input v-model="c.admin_password" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-700 font-mono text-sm">
      </div>
    </div>

    <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-8">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 text-xl">🌐</div>
        <h2 class="text-xl font-bold text-slate-800">首页伪装页 HTML</h2>
      </div>
      <p class="text-sm text-slate-500 mb-4">使用 <code class="bg-slate-100 text-purple-600 px-1.5 py-0.5 rounded font-mono">{{HOST}}</code> 作为当前域名的占位符，系统会自动替换。</p>
      <textarea v-model="c.custom_html" rows="8" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 focus:bg-white focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none transition-all font-mono text-[13px] leading-relaxed text-slate-700 resize-y" placeholder="在此粘贴 HTML 源代码..."></textarea>
    </div>

    <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 transition-all duration-300">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" :class="{'mb-6': true}">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 text-xl">🛡️</div>
          <h2 class="text-xl font-bold text-slate-800">安全与访问管控</h2>
        </div>
        
        <label class="flex items-center space-x-3 cursor-pointer p-2.5 pr-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all select-none">
          <div class="relative flex items-center">
            <input type="checkbox" v-model="c.enable_whitelist" class="peer sr-only">
            <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </div>
          <span class="font-semibold text-slate-700 text-sm">强制白名单模式</span>
        </label>
      </div>
      
      <div class="grid gap-6 transition-all duration-500 ease-in-out" :class="c.enable_whitelist ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:max-w-2xl'">
        <div class="group">
          <label class="flex justify-between text-sm font-semibold text-slate-700 mb-2">
            <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-red-400"></span> 黑名单 (阻断)</span>
          </label>
          <textarea v-model="blacklistText" rows="6" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none transition-all font-mono text-sm leading-relaxed text-slate-700 resize-y" placeholder="# 在行首加 # 可以写备注\n11.22.33.44\nbad-emby.com"></textarea>
          <p class="text-xs text-slate-400 mt-2">支持空行与中文备注，系统会自动提取纯净域名。</p>
        </div>
        
        <transition name="fade">
          <div class="group" v-if="c.enable_whitelist">
            <label class="flex justify-between text-sm font-semibold text-slate-700 mb-2">
              <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-400"></span> 白名单 (放行)</span>
            </label>
            <textarea v-model="whitelistText" rows="12" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all font-mono text-sm leading-relaxed text-slate-700 resize-y" placeholder="# 我的目标服务器\nhttps://demo.emby.media:8443"></textarea>
            <p class="text-xs text-slate-400 mt-2">开启白名单后，非名单内请求一律拒绝 (403)。</p>
          </div>
        </transition>
      </div>
    </div>
    
  </div>

  <script>
    const { createApp, ref, computed, onMounted } = Vue;
    createApp({
      setup() {
        const c = ref({ admin_password:'', custom_html:'', enable_whitelist:false, blacklist:[], whitelist:[] });
        const saving = ref(false);
        const route = '${route}';
        
        const blacklistText = computed({
          get: () => (c.value.blacklist || []).join('\\n'),
          set: (v) => c.value.blacklist = v.split('\\n')
        });
        const whitelistText = computed({
          get: () => (c.value.whitelist || []).join('\\n'),
          set: (v) => c.value.whitelist = v.split('\\n')
        });

        onMounted(async () => {
          const res = await fetch(route + '/api/config');
          if(res.ok) {
            const data = await res.json();
            c.value = { ...c.value, ...data };
          }
        });

        const save = async () => {
          saving.value = true;
          await fetch(route + '/api/config', { method:'POST', body: JSON.stringify(c.value) });
          setTimeout(()=> { saving.value = false; alert('✨ 设置已成功保存！'); }, 500);
        };

        return { c, saving, blacklistText, whitelistText, save, route }
      }
    }).mount('#app');
  </script>
</body>
</html>
`;
