/**
 * 🎬 Emby-Cloudflare-Proxy (v1.5.0-slim)
 * @description 美观版：轻量管理后台、TG推送、黑白名单
 */

// ==========================================
// 🎨 模块 1：前端模板库 (HTML_TEMPLATES)
// ==========================================
const HTML_TEMPLATES = {
  // 引导页（与原版相同）
  guide: (host) => `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🚀 使用指南</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f4f5f7; color: #333; padding: 20px; }
    .container { max-width: 800px; margin: 0 auto; background: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    h1, h2 { color: #0066ff; }
    .code-block { background: #fdf6f7; border-left: 4px solid #0066ff; padding: 12px; margin: 15px 0; border-radius: 4px; font-family: monospace; color: #d63384; font-size: 15px; overflow-x: auto; white-space: nowrap; }
    .warning-box { background: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px; padding: 20px; margin-top: 40px; color: #c53030; font-weight: bold; line-height: 1.8; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 使用指南</h1>
    <h2>通用格式</h2>
    <div class="code-block">https://${host}/你的域名:端口</div>
    <div class="code-block">https://${host}/http://你的域名:端口</div>
    <div class="code-block">https://${host}/https://你的域名:端口</div>
    <h2>HTTP 示例</h2>
    <div class="code-block">https://${host}/http://emby.com</div>
    <h2>HTTPS 示例</h2>
    <div class="code-block">https://${host}/https://emby.com</div>
    <div class="warning-box">
      <p>⚠️ 严正警告：务必手动测试是否可用。禁止恶意占用资源！</p>
    </div>
  </div>
</body>
</html>
`,

  // 用量报告卡片页
  logViewer: (data) => `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>📊 每日用量报表</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    body { font-family: 'Inter', sans-serif; }
  </style>
</head>
<body class="bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center min-h-screen p-4">
  <div class="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white/30">
    <div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white text-center">
      <div class="text-6xl mb-4">${data.status === '🚨' ? '🚨' : '📊'}</div>
      <h2 class="text-3xl font-bold tracking-wide">每日用量报表</h2>
      <p class="text-blue-200 text-sm mt-2 opacity-90">${data.time}</p>
    </div>
    <div class="p-8 space-y-6">
      <div class="flex justify-between items-center border-b border-gray-100 pb-4">
        <span class="text-gray-500 font-medium">今日累计请求</span>
        <span class="font-mono font-bold text-2xl text-gray-800">${data.requests.toLocaleString()} <span class="text-sm text-gray-400 font-normal">/ 100k</span></span>
      </div>
      <div>
        <div class="flex justify-between text-sm text-gray-600 mb-2">
          <span>已用额度</span>
          <span class="font-semibold">${data.percent}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div class="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-1000" style="width: ${Math.min(data.percent, 100)}%"></div>
        </div>
      </div>
      <div class="bg-blue-50/50 rounded-xl p-4 text-center">
        <p class="text-blue-800 text-sm">
          🎯 剩余额度 <span class="font-bold text-lg">${(100000 - data.requests).toLocaleString()}</span> 次调用
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`,

  // 登录页
  login: (route) => `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>控制台登录</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center h-screen">
  <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl w-96 p-8 border border-white/30">
    <h2 class="text-3xl font-extrabold text-center text-blue-600 mb-8">🎬 代理控制台</h2>
    <div class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">管理员密码</label>
        <input type="password" id="pwd" class="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="输入密码..." @keyup.enter="login">
      </div>
      <button onclick="login()" class="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg transition-all active:scale-[0.98]">登 录</button>
    </div>
    <p id="err" class="text-red-500 text-sm mt-4 text-center hidden bg-red-50 py-2 rounded-lg">🔒 密码错误，请重试</p>
  </div>
  <script>
    async function login() {
      const p = document.getElementById('pwd').value;
      const res = await fetch('${route}/api/login', { method: 'POST', body: JSON.stringify({password: p}) });
      if(res.ok) location.reload(); 
      else document.getElementById('err').classList.remove('hidden');
    }
  </script>
</body>
</html>
`,

  // 管理后台主界面
  admin: (route) => `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>反代控制台 · 精简版</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body { font-family: 'Inter', sans-serif; background: #f8fafc; }
    .glass-card { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.3); }
  </style>
</head>
<body class="antialiased">
  <div id="app" class="max-w-6xl mx-auto py-10 px-4 sm:px-6">
    <!-- 头部 -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-blue-600">🎬 Proxy Panel</h1>
        <p class="text-slate-500 mt-1 text-sm">轻量管理 · 黑白名单 · 用量报告</p>
      </div>
      <button @click="save" class="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 shadow-lg transition-all flex items-center gap-2">
        <svg v-if="saving" class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <span v-if="saving">保存中...</span>
        <span v-else>💾 保存设置</span>
      </button>
    </div>

    <!-- 用量卡片 -->
    <div class="glass-card rounded-2xl shadow-xl p-6 mb-8">
      <h3 class="text-slate-600 font-medium mb-4 flex items-center gap-2">📊 今日用量 (UTC)</h3>
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="flex-1">
          <div class="text-4xl font-bold text-slate-800">
            <span v-if="loadingStats" class="animate-pulse text-slate-400">查询中...</span>
            <span v-else-if="stats === -1" class="text-xl text-slate-500">待配置 Token</span>
            <span v-else>{{ stats.toLocaleString() }} <span class="text-lg font-normal text-slate-400">/ 10万</span></span>
          </div>
        </div>
        <div class="w-full md:w-64" v-if="stats !== -1 && !loadingStats">
          <div class="flex justify-between text-sm text-slate-600 mb-1">
            <span>已用 {{ ((stats/100000)*100).toFixed(1) }}%</span>
            <span>剩余 {{ (100000 - stats).toLocaleString() }}</span>
          </div>
          <div class="w-full bg-slate-200 rounded-full h-2.5">
            <div class="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full transition-all duration-700" :style="{ width: Math.min((stats / 100000) * 100, 100) + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 配置表单：两列布局 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 核心配置 -->
      <div class="glass-card rounded-2xl shadow-sm p-6 space-y-5">
        <h2 class="text-lg font-semibold text-slate-800 flex items-center gap-2">⚙️ 核心配置</h2>
        <div>
          <label class="block text-sm font-medium text-slate-600 mb-1">后台密码</label>
          <input v-model="c.admin_password" type="text" class="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none">
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-600 mb-1">CF Account ID</label>
          <input v-model="c.cf_account_id" type="text" class="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm">
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-600 mb-1">CF API Token</label>
          <input v-model="c.cf_api_token" type="password" class="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm">
        </div>
        <div class="pt-2 border-t border-slate-100">
          <h3 class="font-medium text-slate-700 mb-3">📱 Telegram 用量推送</h3>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-slate-500 mb-1">Bot Token</label>
              <input v-model="c.tg_token" type="password" class="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm">
            </div>
            <div>
              <label class="block text-xs text-slate-500 mb-1">Chat ID</label>
              <input v-model="c.tg_chat_id" type="text" class="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm">
            </div>
          </div>
          <div class="mt-2">
            <label class="block text-xs text-slate-500 mb-1">通知标题</label>
            <input v-model="c.tg_title" type="text" class="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm">
          </div>
        </div>
      </div>

      <!-- 安全管控 -->
      <div class="glass-card rounded-2xl shadow-sm p-6 space-y-5">
        <h2 class="text-lg font-semibold text-slate-800 flex items-center gap-2">🛡️ 安全管控</h2>
        <div class="flex items-center gap-2">
          <input type="checkbox" v-model="c.enable_whitelist" class="w-4 h-4 text-blue-600 rounded border-slate-300">
          <label class="text-sm font-medium text-slate-700">强制白名单模式</label>
        </div>
        <div class="grid gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">黑名单</label>
            <textarea v-model="blacklistText" rows="4" class="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 font-mono text-sm" placeholder="每行一个IP或域名"></textarea>
          </div>
          <div v-if="c.enable_whitelist">
            <label class="block text-sm font-medium text-slate-600 mb-1">白名单</label>
            <textarea v-model="whitelistText" rows="4" class="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 font-mono text-sm" placeholder="每行一个IP或域名"></textarea>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">允许的端口</label>
            <input v-model="c.allowed_ports" placeholder="80,443,8096,8920" class="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">允许的域名</label>
            <input v-model="c.allowed_domains" placeholder="emby.example.com" class="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm">
          </div>
        </div>
        <div class="flex items-center gap-2">
          <input type="checkbox" v-model="c.block_sensitive_paths" class="w-4 h-4 text-blue-600 rounded border-slate-300">
          <label class="text-sm font-medium text-slate-700">阻止敏感路径扫描</label>
        </div>
      </div>
    </div>

    <!-- 自定义引导页 HTML（可选） -->
    <div class="glass-card rounded-2xl shadow-sm p-6 mt-6">
      <h2 class="text-lg font-semibold text-slate-800 mb-3">🌐 自定义引导页</h2>
      <textarea v-model="c.custom_html" rows="6" class="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 font-mono text-sm"></textarea>
      <p class="text-xs text-slate-400 mt-2">支持 {{HOST}} 变量自动替换为当前域名</p>
    </div>
  </div>

  <script>
    const { createApp, ref, computed, onMounted } = Vue;
    createApp({
      setup() {
        const c = ref({
          admin_password: '',
          tg_token: '', tg_chat_id: '', tg_title: '#🎬Emby代理',
          cf_account_id: '', cf_api_token: '',
          enable_whitelist: false, blacklist: [], whitelist: [],
          custom_html: '',
          allowed_ports: '80,443,8096,8920',
          allowed_domains: '',
          block_sensitive_paths: true
        });
        const saving = ref(false);
        const stats = ref(-1);
        const loadingStats = ref(true);
        const route = '${route}';

        const blacklistText = computed({
          get: () => (c.value.blacklist || []).join('\\n'),
          set: (v) => c.value.blacklist = v.split('\\n').filter(s => s.trim() !== '')
        });
        const whitelistText = computed({
          get: () => (c.value.whitelist || []).join('\\n'),
          set: (v) => c.value.whitelist = v.split('\\n').filter(s => s.trim() !== '')
        });

        const loadStats = async () => {
          loadingStats.value = true;
          try {
            const res = await fetch(route + '/api/stats');
            if (res.ok) {
              const data = await res.json();
              stats.value = data.usage;
            }
          } catch (e) {}
          loadingStats.value = false;
        };

        onMounted(async () => {
          try {
            const res = await fetch(route + '/api/config');
            if (res.ok) {
              const data = await res.json();
              c.value = { ...c.value, ...data };
            }
          } catch (e) {}
          await loadStats();
        });

        const save = async () => {
          saving.value = true;
          await fetch(route + '/api/config', { method: 'POST', body: JSON.stringify(c.value) });
          setTimeout(() => { saving.value = false; alert('✅ 保存成功'); }, 500);
        };

        return { c, saving, blacklistText, whitelistText, stats, loadingStats, route, save };
      }
    }).mount('#app');
  </script>
</body>
</html>
`
};

// ==========================================
// ⚙️ 模块 2：系统配置与存储 (ConfigManager)
// ==========================================
class ConfigManager {
  static default() {
    return {
      admin_password: 'admin',
      tg_token: '', tg_chat_id: '', tg_title: '#🎬Emby反代',
      cf_account_id: '', cf_api_token: '',
      enable_whitelist: false, blacklist: [], whitelist: [],
      custom_html: HTML_TEMPLATES.guide('{{HOST}}'),
      allowed_ports: '80,443,8096,8920,8443',
      allowed_domains: '',
      block_sensitive_paths: true
    };
  }

  static async get(env) {
    if (globalThis.configCache && (Date.now() - globalThis.lastCacheTime < 60000)) {
      return globalThis.configCache;
    }
    let kvConfig = null;
    if (env.kv) {
      try {
        const kvData = await env.kv.get('CONFIG');
        if (kvData) kvConfig = JSON.parse(kvData);
      } catch (e) {}
    }
    const config = { ...this.default(), ...(kvConfig || {}) };
    globalThis.configCache = config;
    globalThis.lastCacheTime = Date.now();
    return config;
  }

  static async save(env, newConfig) {
    const current = await this.get(env);
    const finalConfig = { ...current, ...newConfig };
    await env.kv.put('CONFIG', JSON.stringify(finalConfig));
    globalThis.configCache = null;
  }
}

// ==========================================
// 📊 模块 3：数据统计服务 (StatsManager)
// ==========================================
class StatsManager {
  static async fetchTodayUsage(accountId, apiToken) {
    if (!accountId || !apiToken) return null;
    const now = new Date();
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
    const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999)).toISOString();
    const query = `query { viewer { accounts(filter: {accountTag: "${accountId}"}) { workersInvocationsAdaptive(limit: 1, filter: { datetime_geq: "${startOfDay}", datetime_leq: "${endOfDay}" }) { sum { requests } } } } }`;

    try {
      const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      return data?.data?.viewer?.accounts[0]?.workersInvocationsAdaptive[0]?.sum?.requests || 0;
    } catch (e) {
      return null;
    }
  }
}

// ==========================================
// 📱 模块 4：消息推送服务 (NotifyManager) 
// ==========================================
class NotifyManager {
  static getBeijingTime() {
    return new Date(Date.now() + 8 * 3600 * 1000).toISOString().replace('T', ' ').split('.')[0];
  }

  static async sendDailyReport(config, env, host) {
    const requests = await StatsManager.fetchTodayUsage(config.cf_account_id, config.cf_api_token);
    if (requests === null) return;
    const percent = ((requests / 100000) * 100).toFixed(2);
    const time = this.getBeijingTime();
    const title = config.tg_title || '#🎬Emby代理';
    const statusIcon = requests > 80000 ? '🚨' : '📊';

    let clickUrl = '';
    if (host) {
      const reportData = { isReport: true, status: statusIcon, requests, percent, time };
      clickUrl = `https://${host}/admin/view-log?d=${btoa(encodeURIComponent(JSON.stringify(reportData)))}`;
    }

    if (config.tg_token && config.tg_chat_id) {
      // 美观的 HTML 消息
      let tgText = `<b>${title} 定时额度播报</b>\n\n`;
      tgText += `📌 <b>状态</b>: ${statusIcon} 运行正常\n`;
      tgText += `📊 <b>今日用量</b>: <code>${requests.toLocaleString()}</code> / 100,000\n`;
      tgText += `📈 <b>占比</b>: ${percent}%\n`;
      tgText += `⏰ <b>时间</b>: ${time}\n`;
      if (clickUrl) {
        tgText += `\n🔗 <a href="${clickUrl}">点击查看详细报表</a>`;
      }
      try {
        await fetch(`https://api.telegram.org/bot${config.tg_token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: config.tg_chat_id,
            text: tgText,
            parse_mode: 'HTML',
            disable_web_page_preview: true
          })
        });
      } catch (e) {}
    }
  }
}

// ==========================================
// 🖥️ 模块 5：管理后台控制 (AdminController) 
// ==========================================
class AdminController {
  static async handle(request, env, url, adminRoute) {
    // 查看用量卡片页面
    if (url.pathname === `${adminRoute}/view-log` && request.method === 'GET') {
      const d = url.searchParams.get('d');
      if (!d) return new Response('参数缺失', { status: 400 });
      try {
        const data = JSON.parse(decodeURIComponent(atob(d)));
        return new Response(HTML_TEMPLATES.logViewer(data), { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
      } catch (e) {
        return new Response('数据解析失败', { status: 400 });
      }
    }

    // 配置 API
    if (url.pathname === `${adminRoute}/api/config`) {
      if (request.method === 'GET') {
        const config = await ConfigManager.get(env);
        return new Response(JSON.stringify(config), { headers: { 'Content-Type': 'application/json' } });
      }
      if (request.method === 'POST') {
        const newConfig = await request.json();
        newConfig.last_host = url.host; // 保存当前域名用于生成报告链接
        await ConfigManager.save(env, newConfig);
        return new Response(JSON.stringify({ success: true }));
      }
    }

    // 登录 API
    if (url.pathname === `${adminRoute}/api/login` && request.method === 'POST') {
      const body = await request.json();
      const config = await ConfigManager.get(env);
      if (body.password === config.admin_password) {
        return new Response(JSON.stringify({ success: true }), {
          headers: {
            'Set-Cookie': `admin_auth=${config.admin_password}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`,
            'Content-Type': 'application/json'
          }
        });
      }
      return new Response(JSON.stringify({ success: false }), { status: 401 });
    }

    // 用量统计 API
    if (url.pathname === `${adminRoute}/api/stats` && request.method === 'GET') {
      const config = await ConfigManager.get(env);
      const usage = await StatsManager.fetchTodayUsage(config.cf_account_id, config.cf_api_token);
      return new Response(JSON.stringify({ usage: usage !== null ? usage : -1 }), { headers: { 'Content-Type': 'application/json' } });
    }

    // 检查 KV 绑定
    if (!env.kv) {
      return new Response('未绑定 KV 存储', { status: 500 });
    }

    // 登录验证
    const cookies = request.headers.get('Cookie') || '';
    const config = await ConfigManager.get(env);
    if (!cookies.includes(`admin_auth=${config.admin_password}`)) {
      if (url.pathname.startsWith(`${adminRoute}/api`)) {
        return new Response('Unauthorized', { status: 401 });
      }
      return new Response(HTML_TEMPLATES.login(adminRoute), { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
    }

    // 返回管理后台主界面
    return new Response(HTML_TEMPLATES.admin(adminRoute), { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
  }
}

// ==========================================
// 🚀 模块 6：核心反代引擎 (ProxyEngine) 
// ==========================================
const STATIC_REGEX = /\.(jpg|jpeg|png|gif|svg|webp|ico|css|js|woff2?|ttf)$/i;
const API_CACHE_REGEX = /\/(Items\/Resume|Users\/.*\/Items|PlaybackInfo|Videos\/.*\/stream)/i;
const VIDEO_REGEX = /\/(Videos\/|Items\/.*\/Download|\/Items\/.*\/Stream|\/Audio\/)/i;
const SENSITIVE_PATH_REGEX = /(\.\.|\/\.(env|git|svn|htaccess)|(wp-|admin|cgi-bin|\.php))/i;

class ProxyEngine {
  static parseTarget(str, url, config) {
    if (!str || str.startsWith('web/') || str.startsWith('emby/')) return null;

    let finalStr = str;
    if (!finalStr.startsWith('http')) {
      if (finalStr.includes(':443') || finalStr.includes(':8443') || finalStr.includes(':8920')) {
        finalStr = 'https://' + finalStr;
      } else {
        finalStr = 'http://' + finalStr;
      }
    }

    try {
      const u = new URL(finalStr);
      const ignoreHosts = ['favicon.ico', 'robots.txt', 'apple-touch-icon.png', 'apple-touch-icon-precomposed.png'];
      if (ignoreHosts.includes(u.hostname.toLowerCase())) return null;

      // 端口检查
      const allowedPorts = (config.allowed_ports || '80,443,8096,8920,8443').split(',').map(p => p.trim());
      const port = u.port || (u.protocol === 'https:' ? '443' : '80');
      if (!allowedPorts.includes(port)) return null;

      // 域名白名单
      if (config.allowed_domains) {
        const domains = config.allowed_domains.split(',').map(d => d.trim()).filter(Boolean);
        if (domains.length > 0) {
          const matched = domains.some(d => u.hostname === d || u.hostname.endsWith('.' + d));
          if (!matched) return null;
        }
      }

      if (u.pathname.startsWith('/System') || u.pathname.startsWith('/Users')) return null;

      return u;
    } catch (e) {
      return null;
    }
  }

  static checkAccess(config, clientIP, targetHost) {
    const isMatch = (list) => {
      if (!Array.isArray(list)) return false;
      for (let item of list) {
        if (!item) continue;
        const clean = item.replace(/^https?:\/\//i, '').split('/')[0].split(':')[0].trim();
        if (clean === clientIP || clean === targetHost) return true;
      }
      return false;
    };

    if (isMatch(config.blacklist)) return { allowed: false, msg: 'Blocked by blacklist' };
    if (config.enable_whitelist && !isMatch(config.whitelist)) return { allowed: false, msg: 'Not in whitelist' };
    return { allowed: true };
  }

  static async rewriteResponseBody(response, proxyOrigin, targetOrigin) {
    const contentType = response.headers.get('Content-Type') || '';
    if (!contentType.includes('json') && !contentType.includes('xml') && !contentType.includes('text')) {
      return response;
    }
    const text = await response.text();
    const escapedTarget = targetOrigin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedTarget, 'g');
    const newText = text.replace(regex, proxyOrigin);
    return new Response(newText, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  }

  static async handle(request, env, ctx, config) {
    const url = new URL(request.url);
    const clientIP = request.headers.get('CF-Connecting-IP') || 'Unknown';

    // 敏感路径拦截
    if (config.block_sensitive_paths && SENSITIVE_PATH_REGEX.test(url.pathname)) {
      return new Response('Forbidden', { status: 403 });
    }

    let targetUrl = this.parseTarget(url.pathname.slice(1) + url.search, url, config);
    if (!targetUrl) {
      const referer = request.headers.get('Referer');
      if (referer) {
        try {
          const refUrl = new URL(referer);
          targetUrl = this.parseTarget(refUrl.pathname.slice(1) + refUrl.search, refUrl, config);
        } catch (e) {}
      }
    }

    if (!targetUrl) {
      const htmlContent = (config.custom_html || HTML_TEMPLATES.guide('{{HOST}}')).replace(/{{HOST}}/g, url.host);
      return new Response(htmlContent, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
    }

    const authResult = this.checkAccess(config, clientIP, targetUrl.hostname);
    if (!authResult.allowed) return new Response(authResult.msg, { status: 403 });

    // WebSocket 
    if (request.headers.get('Upgrade') === 'websocket') {
      const wsTargetUrl = `${targetUrl.protocol === 'https:' ? 'wss:' : 'ws:'}//${targetUrl.host}${targetUrl.pathname}${targetUrl.search}`;
      const [client, server] = Object.values(new WebSocketPair());
      try {
        const targetSocket = new WebSocket(wsTargetUrl);
        targetSocket.accept();
        targetSocket.addEventListener('message', e => server.send(e.data));
        server.addEventListener('message', e => targetSocket.send(e.data));
        targetSocket.addEventListener('close', e => server.close(e.code, e.reason));
        server.addEventListener('close', e => targetSocket.close(e.code, e.reason));
        targetSocket.addEventListener('error', e => server.close(1011, e.message));
        server.addEventListener('error', e => targetSocket.close(1011, e.message));
      } catch (e) {
        return new Response(null, { status: 500 });
      }
      return new Response(null, { status: 101, webSocket: client });
    }

    const newHeaders = new Headers(request.headers);
    newHeaders.set('Host', targetUrl.host);
    newHeaders.set('Origin', targetUrl.origin);
    newHeaders.set('Referer', targetUrl.href);
    newHeaders.set('X-Forwarded-For', clientIP);
    newHeaders.delete('cf-connecting-ip');

    const newRequest = new Request(targetUrl.toString(), {
      method: request.method,
      headers: newHeaders,
      body: request.body,
      redirect: 'manual'
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
      let response = await fetch(newRequest);
      let resHeaders = new Headers(response.headers);
      resHeaders.set('Access-Control-Allow-Origin', '*');

      // 处理重定向
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = resHeaders.get('location');
        if (location) {
          try {
            const locUrl = new URL(location, targetUrl.href);
            if (isVideo && locUrl.hostname !== targetUrl.hostname) {
              const proxyReqHeaders = new Headers();
              if (request.headers.has('Range')) proxyReqHeaders.set('Range', request.headers.get('Range'));
              if (request.headers.has('Accept')) proxyReqHeaders.set('Accept', request.headers.get('Accept'));
              proxyReqHeaders.set('User-Agent', request.headers.get('User-Agent') || 'Mozilla/5.0');
              const externalResponse = await fetch(locUrl.toString(), {
                method: request.method,
                headers: proxyReqHeaders,
                redirect: 'follow',
                cf: { cacheTtl: 0, cacheEverything: false }
              });
              const finalHeaders = new Headers(externalResponse.headers);
              finalHeaders.set('Access-Control-Allow-Origin', '*');
              return new Response(externalResponse.body, { status: externalResponse.status, headers: finalHeaders });
            }
            if (locUrl.hostname === targetUrl.hostname) {
              resHeaders.set('Location', url.origin + '/' + locUrl.href);
            }
          } catch (e) {}
        }
      }

      // 响应体重写
      const proxyOrigin = url.origin;
      const targetOrigin = targetUrl.origin;
      if (response.status === 200 && isGetReq && !isVideo && !isImage) {
        response = await this.rewriteResponseBody(response, proxyOrigin, targetOrigin);
        resHeaders = new Headers(response.headers);
        resHeaders.set('Access-Control-Allow-Origin', '*');
      }

      // 缓存策略
      if (response.status === 200 && isGetReq) {
        if (isImage) {
          resHeaders.set('Cache-Control', targetUrl.search.toLowerCase().includes('tag=') ? 'public, max-age=31536000, immutable' : 'public, max-age=7200');
          resHeaders.delete('Pragma');
          resHeaders.delete('Expires');
          const responseToCache = new Response(response.body, { status: response.status, headers: resHeaders });
          ctx.waitUntil(cache.put(newRequest, responseToCache.clone()));
          return responseToCache;
        } else if (isApiCacheable) {
          resHeaders.set('Cache-Control', 'public, max-age=10');
          const responseToCache = new Response(response.body, { status: response.status, headers: resHeaders });
          ctx.waitUntil(cache.put(newRequest, responseToCache.clone()));
          return responseToCache;
        }
      }

      return new Response(response.body, { status: response.status, statusText: response.statusText, headers: resHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: `代理请求失败: ${e.message}` }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  }
}

// ==========================================
// 🚪 模块 7：Worker 统一入口
// ==========================================
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.hostname.endsWith('.workers.dev') || url.hostname.endsWith('.pages.dev')) {
      return new Response('Access Denied', { status: 403 });
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Max-Age': '86400'
        }
      });
    }

    let rawAdmin = env.admin || '/emby-admin';
    if (!rawAdmin.startsWith('/')) rawAdmin = '/' + rawAdmin;

    if (url.pathname.startsWith(rawAdmin)) {
      return AdminController.handle(request, env, url, rawAdmin);
    } else {
      const config = await ConfigManager.get(env);
      return ProxyEngine.handle(request, env, ctx, config);
    }
  },

  async scheduled(controller, env, ctx) {
    const config = await ConfigManager.get(env);
    if (config.cf_account_id && config.cf_api_token && config.tg_token && config.tg_chat_id) {
      const host = config.last_host || '未知';
      ctx.waitUntil(NotifyManager.sendDailyReport(config, env, host));
    }
  }
};
