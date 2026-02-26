/**
 * 🎬 Emby-Cloudflare-Proxy (v8.03 容错备注版)
 * @description 动态寻址 + 智能缓存 + 端口找回 + 白名单支持智能剥离URL
 */

// ====================================================
// 默认配置
const DEFAULT_CONFIG = {
  admin_password: 'admin', 
  tg_token: '',            
  tg_chat_id: '',          
  tg_title: '#🎬Emby代理', 
  cf_account_id: '',       
  cf_api_token: '',        
  enable_whitelist: false, 
  blacklist: [],           
  whitelist: [],
  custom_html: `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>🚀 使用指南</title><style>body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f4f5f7; color: #333; padding: 20px; } .container { max-width: 800px; margin: 0 auto; background: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); } h1, h2 { color: #0066ff; } .code-block { background: #fdf6f7; border-left: 4px solid #0066ff; padding: 12px; margin: 15px 0; border-radius: 4px; font-family: monospace; color: #d63384; font-size: 15px; overflow-x: auto; white-space: nowrap; } .warning-box { background: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px; padding: 20px; margin-top: 40px; color: #c53030; font-weight: bold; line-height: 1.8; }</style></head><body><div class="container"><h1>🚀 使用指南</h1><h2>通用格式</h2><div class="code-block">https://{{HOST}}/你的域名:端口</div><div class="code-block">https://{{HOST}}/http://你的域名:端口</div><div class="code-block">https://{{HOST}}/https://你的域名:端口</div><h2>HTTP 示例</h2><div class="code-block">https://{{HOST}}/http://emby.com</div><h2>HTTPS 示例</h2><div class="code-block">https://{{HOST}}/https://emby.com</div><div class="warning-box"><p>⚠️ 严正警告：务必手动测试是否可用。禁止恶意占用资源！</p></div></div></body></html>`
};
// ====================================================

let configCache = null;
let lastCacheTime = 0;
const knownIPs = new Set(); 

const STATIC_REGEX = /(\.(jpg|jpeg|png|gif|svg|webp)|(\/Images\/(Primary|Backdrop|Logo|Thumb|Banner|Art)))/i;
const API_CACHE_REGEX = /(\/Items\/Resume|\/Users\/.*\/Items)/i;
const VIDEO_REGEX = /(\/Videos\/|\/Items\/.*\/Download|\/Items\/.*\/Stream)/i;

export default {
  async fetch(request, env, ctx) { return handleRequest(request, env, ctx); },
  async scheduled(controller, env, ctx) { ctx.waitUntil(handleScheduled(env)); }
};

// ==========================================
// 定时任务执行逻辑
// ==========================================
async function handleScheduled(env) {
  if (!env.kv) return;
  let kvConfig = null;
  try {
    const kvData = await env.kv.get('CONFIG');
    if (kvData) kvConfig = JSON.parse(kvData);
  } catch (e) {}
  const config = { ...DEFAULT_CONFIG, ...(kvConfig || {}) };

  if (!config.tg_token || !config.tg_chat_id || !config.cf_account_id || !config.cf_api_token) return;

  const requests = await getWorkerUsage(config.cf_account_id, config.cf_api_token);
  if (requests === null) return;

  const percent = ((requests / 100000) * 100).toFixed(2);
  const beijingTime = new Date(new Date().getTime() + 8 * 3600 * 1000).toISOString().replace('T', ' ').split('.')[0];
  const statusIcon = requests > 80000 ? '🚨' : '✅';
  const title = config.tg_title || '#🎬Emby代理';

  const text = `
<b>${title} 定时额度播报</b>

📌 <b>状态:</b> ${statusIcon} 运行正常
📅 <b>时间:</b> ${beijingTime}
📊 <b>请求用量:</b> ${requests}/100000 ${percent}%
💡 <i>提示: CF每日免费额度(10万)按UTC时间0点重置。</i>
  `.trim();

  try {
    await fetch(`https://api.telegram.org/bot${config.tg_token}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: config.tg_chat_id, text: text, parse_mode: 'HTML' })
    });
  } catch (e) {}
}

// ==========================================
// 核心请求处理逻辑
// ==========================================
async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);

  let rawAdmin = env.admin || '/emby-admin';
  if (!rawAdmin.startsWith('/')) rawAdmin = '/' + rawAdmin;
  const adminRoute = rawAdmin;

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

  // 🔮 v8.03 黑科技：名单智能匹配校验器
  const checkMatch = (list, ip, host) => {
    if (!list || !Array.isArray(list)) return false;
    for (let item of list) {
      let line = item.trim();
      // 忽略空行和以 # 或 // 开头的注释行
      if (!line || line.startsWith('#') || line.startsWith('//')) continue;
      // 智能清洗：自动去掉 https:// 以及端口，提取纯域名或 IP
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

  if (config.tg_token && config.tg_chat_id && clientIP !== 'Unknown' && !knownIPs.has(clientIP)) {
    knownIPs.add(clientIP);
    ctx.waitUntil((async () => {
      const cache = caches.default;
      const ipCacheKey = new Request(`https://${url.hostname}/_internal/tg_notify/${clientIP}`);
      const hasNotified = await cache.match(ipCacheKey);
      if (!hasNotified) {
        const dummyRes = new Response('ok', { headers: { 'Cache-Control': 'public, max-age=43200' } });
        await cache.put(ipCacheKey, dummyRes);
        await sendTelegramMessage(request, clientIP, url.hostname, targetUrl.host, config);
      }
    })());
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
    return new Response(JSON.stringify({ error: `服务器错误: ${e.message}` }), { status: 502, headers: { 'Content-Type': 'application/json' } });
  }
}

async function getWorkerUsage(accountId, apiToken) {
  if (!accountId || !apiToken) return null;
  const now = new Date();
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
  const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999)).toISOString();

  const query = `query { viewer { accounts(filter: {accountTag: "${accountId}"}) { workersInvocationsAdaptive(limit: 1, filter: { datetime_geq: "${startOfDay}", datetime_leq: "${endOfDay}" }) { sum { requests } } } } }`;
  try {
    const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST', headers: { 'Authorization': `Bearer ${apiToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ query })
    });
    const data = await res.json();
    return data?.data?.viewer?.accounts[0]?.workersInvocationsAdaptive[0]?.sum?.requests || 0;
  } catch (e) { return null; }
}

// ==========================================
// 后台路由与 API 处理函数
// ==========================================
async function handleAdminRoute(request, env, url, adminRoute) {
  if (!env.kv) return new Response('未绑定 KV，请检查名称是否为小写 kv。', { status: 500, headers: {'Content-Type': 'text/plain;charset=utf-8'} });

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

  if (url.pathname === `${adminRoute}/api/stats` && request.method === 'GET') {
    const usage = await getWorkerUsage(currentConfig.cf_account_id, currentConfig.cf_api_token);
    return new Response(JSON.stringify({ usage: usage !== null ? usage : -1 }), { headers: { 'Content-Type': 'application/json' }});
  }

  if (url.pathname === `${adminRoute}/api/test-tg` && request.method === 'POST') {
    const body = await request.json();
    const testConfig = { ...currentConfig, tg_token: body.tg_token, tg_chat_id: body.tg_chat_id, tg_title: body.tg_title };
    // 保护隐私：已替换为虚假的测试目标地址
    const res = await sendTelegramMessage(request, '127.0.0.1', url.hostname, 'emby.example.com:8443', testConfig, true);
    return new Response(JSON.stringify({ success: res }));
  }

  return new Response(ADMIN_PANEL_HTML(adminRoute), { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
}

// ==========================================
// Telegram 通知发送器
// ==========================================
async function sendTelegramMessage(request, ip, proxyHost, targetHost, config, isTest = false) {
  if (!config.tg_token || !config.tg_chat_id) return false;
  
  const cf = request.cf || {};
  const country = cf.country || 'Unknown';
  const city = cf.city || '';
  const location = `${country} ${city}`.trim();
  const asn = cf.asn ? `AS${cf.asn}` : '';
  const asOrg = cf.asOrganization || 'Unknown';
  const ua = request.headers.get('User-Agent') || 'Unknown';
  const beijingTime = new Date(new Date().getTime() + 8 * 3600 * 1000).toISOString().replace('T', ' ').split('.')[0];
  
  const type = isTest ? '#测试通知' : '#新设备连接';
  const title = config.tg_title || '#🎬Emby代理';
  
  let usageStr = "未配置 CF Token";
  const requests = await getWorkerUsage(config.cf_account_id, config.cf_api_token);
  if (requests !== null) {
    const percent = ((requests / 100000) * 100).toFixed(2);
    usageStr = `${requests}/100000 ${percent}%`;
  }

  const text = `
<b>${title} 日志通知</b>

📌 <b>类型:</b> ${type}
🌐 <b>IP:</b> <code>${ip}</code>
📍 <b>位置:</b> ${location}
🏢 <b>ASN:</b> ${asn} ${asOrg}
🔗 <b>域名:</b> ${proxyHost}
🎯 <b>目标:</b> <code>${targetHost}</code>
🤖 <b>UA:</b> ${ua}
📅 <b>时间:</b> ${beijingTime}
📊 <b>请求用量:</b> ${usageStr}
  `.trim();

  try {
    const res = await fetch(`https://api.telegram.org/bot${config.tg_token}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: config.tg_chat_id, text: text, parse_mode: 'HTML' })
    });
    return res.ok;
  } catch (e) { return false; }
}

// ==========================================
// 前端 HTML 模板区
// ==========================================
const ADMIN_LOGIN_HTML = (route) => `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>管理后台登录</title>
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
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Emby 反代控制台</title>
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
  <div id="app" class="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
    
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-slate-200 pb-6 mb-8 gap-4">
      <div>
        <h1 class="text-4xl font-extrabold text-blue-600 tracking-tight">🎬 Proxy Panel</h1>
        <p class="text-slate-500 mt-2 flex items-center gap-2">
          <span class="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-md font-semibold">v8.03 容错备注版</span>
          <span>运行状态监控与全局设置</span>
        </p>
      </div>
      <button @click="save" class="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all active:scale-95 flex items-center gap-2">
        <svg v-if="saving" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <span v-if="saving">正在保存...</span>
        <span v-else>💾 保存所有设置</span>
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-xl shadow-blue-500/10 p-6 text-white relative overflow-hidden">
        <div class="absolute -right-6 -top-6 opacity-10">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
        </div>
        <h3 class="text-blue-100 font-medium mb-2 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          今日请求用量 (UTC)
        </h3>
        <div class="text-4xl font-extrabold flex items-baseline gap-2 mt-4">
          <span v-if="loadingStats" class="animate-pulse">查询中...</span>
          <span v-else-if="stats === -1" class="text-xl">待配置 Token</span>
          <span v-else>{{ stats.toLocaleString() }} <span class="text-lg font-normal text-blue-200">/ 10万</span></span>
        </div>
        <div v-if="stats !== -1 && !loadingStats" class="mt-5 bg-black/20 rounded-full h-2 w-full overflow-hidden">
          <div class="bg-white h-full rounded-full transition-all duration-1000 ease-out" :style="{ width: Math.min((stats / 100000) * 100, 100) + '%' }"></div>
        </div>
      </div>
      
      <div class="col-span-1 md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center">
        <div class="w-full">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-slate-800 text-lg flex items-center gap-2">
              <span class="text-xl">🔐</span> 当前后台暗号
            </h3>
            <span class="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg font-mono text-sm border border-slate-200">{{route}}</span>
          </div>
          <p class="text-slate-500 text-sm mb-4">如需修改暗号，请在 CF 的 <span class="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">变量和机密</span> 中修改 <b>admin</b> 的值。</p>
          <div class="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
             <p class="text-blue-800 text-sm flex items-start gap-2">
               <span class="text-base mt-0.5">⏰</span>
               <span><b>定时播报开启指南：</b>在 CF 触发器中添加 Cron 表达式 <code class="font-bold bg-white px-1.5 rounded text-blue-600 border border-blue-200">0 12 * * *</code> (即北京时间每天 20:00 推送)。</span>
             </p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-6">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">⚙️</div>
          <h2 class="text-xl font-bold text-slate-800">系统核心与监控</h2>
        </div>
        <div class="space-y-5">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">🔑 管理后台密码</label>
            <input v-model="c.admin_password" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-700">
          </div>
          <div class="pt-4 border-t border-slate-100"></div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">☁️ CF Account ID</label>
            <input v-model="c.cf_account_id" type="text" placeholder="用于拉取额度统计数据..." class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono text-sm text-slate-700">
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">🔑 CF API Token</label>
            <input v-model="c.cf_api_token" type="password" placeholder="需具备「账户分析 - 读取」权限..." class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono text-sm text-slate-700">
          </div>
        </div>
      </div>

      <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-6">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-500 text-xl">📱</div>
          <h2 class="text-xl font-bold text-slate-800">Telegram 消息推送</h2>
        </div>
        <div class="space-y-5">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">🏷️ 通知标题 (自定义你的品牌)</label>
            <input v-model="c.tg_title" type="text" placeholder="例: #🎬Emby代理 或 #天诚订阅器" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all text-sm text-slate-700 font-bold">
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">🤖 Bot Token</label>
            <input v-model="c.tg_token" type="password" placeholder="例: 123456:ABCDEFG..." class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all font-mono text-sm text-slate-700">
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">💬 Chat ID</label>
            <div class="flex gap-3">
              <input v-model="c.tg_chat_id" type="text" placeholder="接收消息的用户 ID" class="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all font-mono text-sm text-slate-700">
              <button @click="testTg" class="bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-200 px-5 rounded-xl text-sm font-bold whitespace-nowrap transition-all shadow-sm">发信测试</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-8">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 text-xl">🌐</div>
        <h2 class="text-xl font-bold text-slate-800">首页伪装页 HTML 自定义</h2>
      </div>
      <p class="text-sm text-slate-500 mb-4">当直接访问根目录或未匹配路径时返回。您可以使用 <code class="bg-slate-100 text-purple-600 px-1.5 py-0.5 rounded font-mono">{{HOST}}</code> 作为当前域名的占位符，系统会自动替换。</p>
      <textarea v-model="c.custom_html" rows="12" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 focus:bg-white focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none transition-all font-mono text-[13px] leading-relaxed text-slate-700 resize-y" placeholder="在此粘贴你的 HTML 源代码..."></textarea>
    </div>

    <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 transition-all duration-300">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" :class="{'mb-6': true}">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 text-xl">🛡️</div>
          <h2 class="text-xl font-bold text-slate-800">网络安全与访问管控</h2>
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
          <p class="text-xs text-slate-400 mt-2">支持换行、空行及中文备注，填入的链接会自动剥离端口与 http。</p>
        </div>
        
        <transition name="fade">
          <div class="group" v-if="c.enable_whitelist">
            <label class="flex justify-between text-sm font-semibold text-slate-700 mb-2">
              <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-400"></span> 白名单 (放行)</span>
            </label>
            <textarea v-model="whitelistText" rows="12" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all font-mono text-sm leading-relaxed text-slate-700 resize-y" placeholder="# 我的公益服1\nemby.example.com\n\n# 可以直接贴全链，系统会自动处理\nhttps://demo.emby.media:8443"></textarea>
            <p class="text-xs text-slate-400 mt-2">仅当开启「强制白名单模式」时生效，非名单内请求一律拒绝。</p>
          </div>
        </transition>
      </div>
    </div>
    
  </div>

  <script>
    const { createApp, ref, computed, onMounted } = Vue;
    createApp({
      setup() {
        const c = ref({ tg_token:'', tg_chat_id:'', tg_title:'', admin_password:'', cf_account_id:'', cf_api_token:'', custom_html:'', enable_whitelist:false, blacklist:[], whitelist:[] });
        const saving = ref(false);
        const stats = ref(-1);
        const loadingStats = ref(true);
        const route = '${route}';
        
        const blacklistText = computed({
          get: () => (c.value.blacklist || []).join('\\n'),
          set: (v) => c.value.blacklist = v.split('\\n')
        });
        const whitelistText = computed({
          get: () => (c.value.whitelist || []).join('\\n'),
          set: (v) => c.value.whitelist = v.split('\\n')
        });

        const loadStats = async () => {
          loadingStats.value = true;
          try {
            const res = await fetch(route + '/api/stats');
            if(res.ok) { const data = await res.json(); stats.value = data.usage; }
          } catch(e) {}
          loadingStats.value = false;
        };

        onMounted(async () => {
          const res = await fetch(route + '/api/config');
          if(res.ok) {
            const data = await res.json();
            c.value = { ...c.value, ...data };
          }
          await loadStats();
        });

        const save = async () => {
          saving.value = true;
          await fetch(route + '/api/config', { method:'POST', body: JSON.stringify(c.value) });
          setTimeout(()=> { saving.value = false; alert('✨ 设置已成功保存！'); loadStats(); }, 500);
        };

        const testTg = async () => {
          if(!c.value.tg_token || !c.value.tg_chat_id) return alert('⚠️ 请先填写 Token 和 Chat ID');
          const res = await fetch(route + '/api/test-tg', { method:'POST', body: JSON.stringify(c.value) });
          const data = await res.json();
          alert(data.success ? '✅ 测试消息已发送，请打开 TG 查收！' : '❌ 发送失败，请检查配置信息是否正确。');
        };

        return { c, saving, blacklistText, whitelistText, save, testTg, stats, loadingStats, route }
      }
    }).mount('#app');
  </script>
</body>
</html>
`;