/**
 * 🎬 Emby-Cloudflare-Proxy 
 * @description 巨幕版动态仪表盘 | 毫秒级无感拦截结界 | 智能流量防封与监控喵~
 */

// ==========================================
// 🎨 魔法卷轴 1：前端模板百宝箱 (HTML_TEMPLATES)
// ==========================================
const HTML_TEMPLATES = {
  // 引导页 (敲好看的巨幕动态极速版 ⭐)
  guide: (h,s=-1)=>{const p=s===-1?0:Math.min(s/100000*100,100).toFixed(2),nt=s===-1,sv=nt?'--':s.toLocaleString(),pd=nt?'--':p,pc=nt?'text-slate-500':p<50?'text-emerald-400':p<80?'text-amber-400':'text-rose-400',c=[{bg:'bg-slate-50',bd:'border-slate-200',txt:'text-slate-700',cd:`https://${h}/你的域名:端口`},{bg:'bg-slate-50',bd:'border-slate-200',txt:'text-slate-700',cd:`https://${h}/http://你的域名:端口`},{bg:'bg-slate-50',bd:'border-slate-200',txt:'text-slate-700',cd:`https://${h}/https://你的域名:端口`},{bg:'bg-blue-50/60',bd:'border-blue-100',txt:'text-blue-800',cd:`https://${h}/http://emby.com:80`},{bg:'bg-emerald-50/60',bd:'border-emerald-100',txt:'text-emerald-800',cd:`https://${h}/https://emby.com:443`}];return`<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>🚀 Emby Proxy Gateway</title><script src="https://cdn.tailwindcss.com"></script><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"><style>body{font-family:'Inter',-apple-system,sans-serif;background:#f8fafc;}@keyframes flash{0%,100%{background-color:rgba(59,130,246,0.1);}50%{background-color:rgba(16,185,129,0.2);}}.copy-flash{animation:flash 0.5s ease-out;}</style></head><body class="min-h-screen antialiased flex items-center justify-center p-3 md:p-5 lg:p-6"><div class="max-w-7xl w-full"><div class="bg-white rounded-[28px] md:rounded-[32px] shadow-2xl overflow-hidden border border-slate-200/50"><div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div><div class="grid grid-cols-1 lg:grid-cols-12"><div class="lg:col-span-7 p-6 md:p-8 lg:p-10 bg-white"><div class="flex items-center gap-3.5 mb-6 md:mb-7"><div class="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md"><span class="text-xl md:text-2xl">🚀</span></div><div><div class="flex items-center gap-2"><span class="text-xs font-bold text-blue-600 uppercase tracking-[0.2em]">Emby Proxy</span><span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Gateway</span></div><h1 class="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800 mt-0.5">使用指南</h1></div></div><div class="space-y-5"><div class="space-y-3"><div class="flex items-center gap-2.5"><div class="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-sm">1</div><h2 class="text-sm font-bold text-slate-400 uppercase tracking-wider">专属链接生成器</h2></div><div class="bg-slate-50 border border-slate-200 p-3.5 md:p-4 rounded-xl space-y-3 ml-9 md:ml-10"><input id="gh" type="text" placeholder="粘贴你的 Emby 服务器地址 (例如: http://emby.com:8096)" class="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono transition-all"><div class="relative"><div id="gr" class="bg-blue-50/80 border border-blue-200 p-3 pr-24 rounded-lg font-mono text-sm md:text-base text-blue-700 break-all min-h-[44px] flex items-center transition-all">等待输入...</div><button id="cb" class="absolute right-1.5 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">一键复制</button></div></div></div><div class="space-y-3"><div class="flex items-center gap-2.5"><div class="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">2</div><h2 class="text-sm font-bold text-slate-400 uppercase tracking-wider">通用格式</h2></div><div class="space-y-2 pl-9 md:pl-10">${c.slice(0,3).map(b=>`<div class="${b.bg} ${b.bd} p-3 rounded-xl font-mono text-sm md:text-base ${b.txt} break-all">${b.cd}</div>`).join('')}</div></div><div class="space-y-3"><div class="flex items-center gap-2.5"><div class="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">3</div><h2 class="text-sm font-bold text-slate-400 uppercase tracking-wider">http、https示例</h2></div><div class="space-y-2 pl-9 md:pl-10">${c.slice(3).map(b=>`<div class="${b.bg} ${b.bd} p-3 rounded-xl font-mono text-sm md:text-base ${b.txt} break-all">${b.cd}</div>`).join('')}</div></div></div><div class="mt-6 md:mt-7 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 flex gap-3 items-start"><div class="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0"><span class="text-lg md:text-xl">⚠️</span></div><div class="pt-0.5"><h3 class="font-bold text-amber-900 mb-0.5 text-sm">系统风控预警</h3><p class="text-amber-800/70 text-xs md:text-sm leading-relaxed">务必手动测试是否可用。禁止恶意占用资源！</p></div></div></div><div class="lg:col-span-5 bg-slate-900 p-6 md:p-8 lg:p-10 relative overflow-hidden flex flex-col justify-center"><div class="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-blue-600/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div><div class="relative z-10"><div class="flex items-center justify-between mb-6"><div class="flex items-center gap-2.5"><div class="relative flex h-2.5 w-2.5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span></div><span class="text-slate-300 text-xs md:text-sm font-medium tracking-wide">System Online</span></div><div class="bg-white/10 px-2 py-1 rounded-full border border-white/20"><span class="text-[8px] md:text-[10px] font-bold text-slate-300 uppercase tracking-wider">CF Workers</span></div></div><div class="mb-5"><h3 class="text-white font-bold text-xl md:text-2xl lg:text-3xl mb-1 tracking-tight">请求额度统计</h3><p class="text-slate-400 text-xs md:text-sm">Cloudflare GraphQL API 实时监控</p></div><div class="bg-white/10 rounded-[20px] p-5 mb-5 border border-white/20 shadow-inner"><div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4"><div class="flex-1"><p class="text-slate-400 text-[11px] md:text-xs font-medium uppercase tracking-wider mb-1">已消耗用量</p><div class="flex items-baseline gap-2 flex-wrap"><span class="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight">${sv}</span><span class="text-slate-500 font-medium text-xs md:text-sm">/ 100k</span></div></div><div class="text-left sm:text-right"><p class="text-slate-400 text-[11px] md:text-xs font-medium uppercase tracking-wider mb-1">请求量</p><span class="text-lg md:text-xl lg:text-2xl font-bold ${pc}">${pd}%</span></div></div><div class="relative h-2 bg-slate-700/50 rounded-full overflow-hidden"><div class="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-rose-500/10"></div><div class="absolute top-0 left-0 bottom-0 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500" style="width:${nt?'0%':p+'%'}"></div></div><div class="mt-4 pt-4 border-t border-white/10">${nt?`<div class="flex items-center gap-2.5 text-slate-400"><svg class="w-4 h-4 md:w-5 md:h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg><span class="text-xs md:text-sm">未配置 Cloudflare Token，无法获取节点数据</span></div>`:`<div class="flex items-center gap-2.5 ${p<80?'text-emerald-400':'text-amber-400'}"><svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><span class="text-xs md:text-sm font-medium">${p<80?'系统运行状态良好':'接近负载上限，请关注'}</span></div>`}</div></div><div class="flex items-center justify-between text-slate-500 text-xs"><span>Last updated</span><span class="text-slate-400 font-mono">Just now</span></div></div></div></div></div></div><script>const gh=document.getElementById('gh'),gr=document.getElementById('gr'),cb=document.getElementById('cb');let fn='';const ug=()=>{let v=gh.value.trim();if(!v){gr.innerHTML='<span class="text-blue-400/70">等待输入...</span>';fn='';cb.disabled=true;return;}let p='http://',u=v;if(v.toLowerCase().startsWith('https://')){p='https://';u=v.substring(8);}else if(v.toLowerCase().startsWith('http://')){p='http://';u=v.substring(7);}let h=u.split('/')[0],t=h.split(':')[1];if(!t){t=p==='https://'?'443':'80';}fn='https://${h}/'+p+h.split(':')[0]+':'+t;gr.innerHTML=fn;cb.disabled=false;};gh.addEventListener('input',ug);cb.addEventListener('click',async()=>{if(!fn)return;try{await navigator.clipboard.writeText(fn);cb.innerText='复制成功!';cb.classList.add('bg-emerald-500','hover:bg-emerald-600');gr.classList.add('copy-flash');setTimeout(()=>{cb.innerText='一键复制';cb.classList.remove('bg-emerald-500','hover:bg-emerald-600');gr.classList.remove('copy-flash');},2000);}catch(e){}});ug();</script></body></html>`;},

  // 管理后台登录页 (小锁头防身用 🔒)
  login: (route) => `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>控制台登录</title><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-gray-50 flex items-center justify-center h-screen"><div class="bg-white p-10 rounded-2xl shadow-xl w-96 border border-gray-100"><h2 class="text-3xl font-extrabold text-center text-blue-600 mb-8 tracking-tight">🎬 代理控制台</h2><div class="space-y-6"><div><label class="block text-sm font-medium text-gray-700 mb-2">管理员密码</label><input type="password" id="pwd" class="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="输入密码..." @keyup.enter="login"></div><button onclick="login()" class="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg transition-all active:scale-[0.98]">登 录</button></div><p id="err" class="text-red-500 text-sm mt-4 text-center hidden bg-red-50 py-2 rounded-lg">🔒 密码错误，请重试</p></div><script>async function login(){const p=document.getElementById('pwd').value;const res=await fetch('${route}/api/login',{method:'POST',body:JSON.stringify({password:p})});if(res.ok)location.reload();else document.getElementById('err').classList.remove('hidden');}</script></body></html>`,
      
  // 管理后台主界面 (这里面超多可爱的按钮和设置项哦 ✨)
  admin: (route) => `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>反代控制台</title><script src="https://cdn.tailwindcss.com"></script><script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script><style>::-webkit-scrollbar{width:8px;height:8px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px}::-webkit-scrollbar-thumb:hover{background:#94a3b8}.fade-enter-active,.fade-leave-active{transition:opacity .3s ease,transform .3s ease}.fade-enter-from,.fade-leave-to{opacity:0;transform:translateY(-10px)}</style></head><body class="bg-[#F8FAFC] text-slate-800 antialiased font-sans"><div id="app" class="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8"><div class="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-slate-200 pb-6 mb-8 gap-4"><div><h1 class="text-4xl font-extrabold text-blue-600 tracking-tight">🎬 Proxy Panel</h1><p class="text-slate-500 mt-2 flex items-center gap-2"><span class="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-md font-semibold">v9.7.0 旗舰提速版</span><span>全隐蔽防扫描 · 毫秒级无感拦截 · 智能监控防护</span></p></div><div class="flex gap-3"><button @click="test" class="bg-purple-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-purple-700 transition-all shadow-sm hover:shadow-md">📢 测试系统报表</button><button @click="save" class="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg transition-all active:scale-95 flex items-center gap-2"><svg v-if="saving" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span v-if="saving">保存中...</span><span v-else>💾 保存所有设置</span></button></div></div><div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"><div class="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden"><h3 class="text-blue-100 font-medium mb-2 flex items-center gap-2">📊 今日用量 (UTC)</h3><div class="text-4xl font-extrabold mt-4"><span v-if="loadingStats" class="animate-pulse">数据同步中...</span><span v-else-if="stats === -1" class="text-xl">待配置系统 Token</span><span v-else>{{ stats.toLocaleString() }} <span class="text-lg font-normal text-blue-200">/ 10万</span></span></div><div v-if="stats !== -1 && !loadingStats" class="mt-5 bg-black/20 rounded-full h-2 w-full overflow-hidden"><div class="bg-white h-full rounded-full transition-all duration-1000" :style="{ width: Math.min((stats / 100000) * 100, 100) + '%' }"></div></div></div><div class="col-span-1 md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center"><div class="w-full"><div class="flex items-center justify-between mb-4"><h3 class="font-bold text-slate-800 text-lg mb-1 flex items-center gap-2"><span class="text-xl">🔐</span> 当前管理路径</h3><span class="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg font-mono text-sm border border-slate-200">${route}</span></div><p class="text-slate-500 text-sm mb-4">如需修改管理入口，请在 Cloudflare Workers 的变量管理中调整 <b>admin</b> 的值。</p><div class="bg-blue-50/50 rounded-xl p-4 border border-blue-100"><p class="text-blue-800 text-sm flex items-start gap-2"><span class="text-base mt-0.5">⏰</span><span><b>自动巡航与报表启用指南：</b>请在 CF 触发器中添加 Cron 表达式 <code class="font-bold bg-white px-1.5 rounded text-blue-600 border border-blue-200">0 12 * * *</code> (对应北京时间 20:00 准时播报)。</span></p></div></div></div></div><div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"><div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6"><div><h2 class="text-xl font-bold text-slate-800 flex items-center gap-3 mb-6"><div class="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">⚙️</div>系统核心认证与审计</h2><label class="block text-sm font-semibold text-slate-700 mb-1.5">🔑 后台访问密码</label><input v-model="c.admin_password" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"></div><div class="pt-4 border-t border-slate-100"></div><div><label class="block text-sm font-semibold text-slate-700 mb-1.5">☁️ CF Account ID (用于数据底座)</label><input v-model="c.cf_account_id" type="text" placeholder="用于拉取全局额度统计数据..." class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-indigo-500"></div><div><label class="block text-sm font-semibold text-slate-700 mb-1.5">🔑 CF API Token (只读分析权限)</label><input v-model="c.cf_api_token" type="password" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-indigo-500"></div></div><div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6"><div><h2 class="text-xl font-bold text-slate-800 flex items-center gap-3 mb-6"><div class="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-500 text-xl">📱</div>Telegram 监控报表通道</h2><label class="block text-sm font-semibold text-slate-700 mb-1.5">🏷️ 播报系统抬头 (Title)</label><input v-model="c.tg_title" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-sm focus:ring-2 focus:ring-sky-500"></div><div class="grid grid-cols-2 gap-4"><div><label class="block text-xs font-bold text-slate-500 mb-1">Bot Token 密钥</label><input v-model="c.tg_token" type="password" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500"></div><div><label class="block text-xs font-bold text-slate-500 mb-1">目标 Chat ID</label><input v-model="c.tg_chat_id" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500"></div></div></div></div><div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-8"><h2 class="text-xl font-bold text-slate-800 flex items-center gap-3 mb-6"><div class="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 text-xl">🌐</div>底层伪装与前台静态化托管</h2><textarea v-model="c.custom_html" rows="8" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 font-mono text-[13px] focus:ring-2 focus:ring-purple-400" placeholder="⚠️ 注意：留空此框，系统将自动挂载并渲染带动态进度条的高级仪表盘大屏！&#10;仅当您需要接管前台，使用自定义静态 HTML 作为伪装页时，才在此处填入代码。"></textarea></div><div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-8"><div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"><h2 class="text-xl font-bold text-slate-800 flex items-center gap-3"><div class="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 text-xl">🛡️</div>零信任安全与网络微隔离</h2><label class="flex items-center space-x-3 cursor-pointer p-2.5 pr-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"><div class="relative flex items-center"><input type="checkbox" v-model="c.enable_whitelist" class="peer sr-only"><div class="w-11 h-6 bg-slate-200 peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div></div><span class="font-semibold text-sm text-slate-700">启用强制白名单模式</span></label></div><div class="grid gap-6 transition-all duration-500 ease-in-out" :class="c.enable_whitelist ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:max-w-2xl'"><div><label class="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2"><span class="w-2 h-2 rounded-full bg-red-400"></span>全局黑名单 (实时阻断)</label><textarea v-model="blacklistText" rows="6" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-red-400" placeholder="# 在行首加 # 可以写备注&#10;11.22.33.44&#10;bad-emby.com"></textarea></div><transition name="fade"><div v-if="c.enable_whitelist"><label class="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2"><span class="w-2 h-2 rounded-full bg-emerald-400"></span>核心白名单 (信任放行)</label><textarea v-model="whitelistText" rows="6" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-emerald-400" placeholder="# 我的核心服节点&#10;emby.example.com&#10;&#10;# 系统内置智能正则，可直接贴全链&#10;https://demo.emby.media:8443"></textarea></div></transition></div><div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6"><div><label class="block text-sm font-semibold text-slate-700 mb-1.5">🔌 应用层端口微隔离 (逗号分隔)</label><input v-model="c.allowed_ports" type="text" placeholder="80,443,8096,8920,8443,2096" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-400"></div><div><label class="block text-sm font-semibold text-slate-700 mb-1.5">🌍 信任目标基准域 (留空则全放行)</label><input v-model="c.allowed_domains" type="text" placeholder="emby.example.com" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-400"></div><div class="flex items-center md:col-span-2"><label class="flex items-center space-x-3 cursor-pointer"><input type="checkbox" v-model="c.block_sensitive_paths" class="w-4 h-4 text-blue-600 bg-slate-50 border-slate-200 rounded focus:ring-blue-500"><span class="text-sm font-medium text-slate-700">启用敏感路径隐身防御 (封堵 .env, admin, php 等恶意扫描)</span></label></div></div></div></div><script>const {createApp,ref,computed,onMounted}=Vue;createApp({setup(){const c=ref({admin_password:'',cf_account_id:'',cf_api_token:'',tg_token:'',tg_chat_id:'',tg_title:'',custom_html:'',enable_whitelist:false,blacklist:[],whitelist:[],allowed_ports:'80,443,8096,8920,8443,2096',allowed_domains:'',block_sensitive_paths:true});const saving=ref(false);const stats=ref(-1);const loadingStats=ref(true);const route='${route}';const blacklistText=computed({get:()=>(c.value.blacklist||[]).join('\\n'),set:(v)=>c.value.blacklist=v.split('\\n')});const whitelistText=computed({get:()=>(c.value.whitelist||[]).join('\\n'),set:(v)=>c.value.whitelist=v.split('\\n')});const loadStats=async()=>{loadingStats.value=true;try{const res=await fetch(route+'/api/stats');if(res.ok){const data=await res.json();stats.value=data.usage;}}catch(e){}loadingStats.value=false;};onMounted(async()=>{const res=await fetch(route+'/api/config');if(res.ok)c.value={...c.value,...await res.json()};await loadStats();});const save=async()=>{saving.value=true;await fetch(route+'/api/config',{method:'POST',body:JSON.stringify(c.value)});setTimeout(()=>{saving.value=false;alert('✨ 系统配置热重载成功！');loadStats();},500);};const test=async()=>{await fetch(route+'/api/test-notify',{method:'POST'});alert('✅ 测试调度已触发，请检查您的 TG 接收终端！');};return{c,saving,blacklistText,whitelistText,save,test,stats,loadingStats,route}}}).mount('#app');</script></body></html>`
};


// ==========================================
// ⚙️ 魔法阵 2：系统配置与记忆存储中枢 (ConfigManager) 咕噜咕噜~
// ==========================================
class ConfigManager {
  static default() {
    return {
      admin_password: 'admin', 
      cf_account_id: '', cf_api_token: '', 
      tg_token: '', tg_chat_id: '', tg_title: '#🎬Emby代理',
      enable_whitelist: false, blacklist: [], whitelist: [],
      custom_html: '', last_host: '',
      allowed_ports: '80,443,8096,8920,8443,2096', allowed_domains: '', block_sensitive_paths: true
    };
  }
  static async get(env) {
    if (globalThis.configCache && (Date.now() - globalThis.lastCacheTime < 60000)) return globalThis.configCache;
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
// 📊 魔法阵 3：数据底座与超光速流控引擎 (StatsManager) 哔哔哔！
// ==========================================
class StatsManager {
  static lastUsage = -1;
  static lastFetchTime = 0;

  static async fetchTodayUsage(accountId, apiToken) {
    if (!accountId || !apiToken) return null;
    
    // 🛡️ 贴心的高频缓存小盾牌：保护可怜的 GraphQL API 不被玩坏 (*/ω＼*)
    if (Date.now() - this.lastFetchTime < 300000 && this.lastUsage !== -1) {
      return this.lastUsage;
    }

    const now = new Date();
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
    const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999)).toISOString();
    const query = `query { viewer { accounts(filter: {accountTag: "${accountId}"}) { workersInvocationsAdaptive(limit: 1, filter: { datetime_geq: "${startOfDay}", datetime_leq: "${endOfDay}" }) { sum { requests } } } } }`;
    try {
      const res = await fetch('https://api.cloudflare.com/client/v4/graphql', { 
        method: 'POST', headers: { 'Authorization': `Bearer ${apiToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) 
      });
      const data = await res.json();
      const requests = data?.data?.viewer?.accounts[0]?.workersInvocationsAdaptive[0]?.sum?.requests || 0;
      
      this.lastUsage = requests;
      this.lastFetchTime = Date.now();
      return requests;
    } catch (e) { return null; }
  }
}

// ==========================================
// 📱 魔法阵 4：系统监控与大喇叭播报服务 (NotifyManager) 📢
// ==========================================
class NotifyManager {
  static getBeijingTime() { return new Date(Date.now() + 8 * 3600 * 1000).toISOString().replace('T', ' ').split('.')[0]; }
  
  static async sendDailyReport(config, env, isTest = false) {
    const requests = await StatsManager.fetchTodayUsage(config.cf_account_id, config.cf_api_token) || 0;
    const percent = ((requests / 100000) * 100).toFixed(2);
    const time = this.getBeijingTime();
    const title = config.tg_title || '#🎬Emby代理';
    const statusIcon = requests > 80000 ? '🚨' : '✅';
    
    if (config.tg_token && config.tg_chat_id) {
      const typeStr = isTest ? '⚙️ <b>测试调度任务</b>\n' : '';
      const tgText = `${typeStr}<b>${title} 系统监控日报</b>\n\n📌 运行状态: ${statusIcon} 健康\n📊 全局请求用量: ${requests}/100000 (${percent}%)\n📅 节点时间: ${time}`;
      try { await fetch(`https://api.telegram.org/bot${config.tg_token}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: config.tg_chat_id, text: tgText, parse_mode: 'HTML' }) }); } catch (e) {}
    }
  }
}

// ==========================================
// 🖥️ 魔法阵 5：傲娇的核心控制台路由器 (AdminController) 哼！
// ==========================================
class AdminController {
  static async handle(request, env, url, adminRoute) {
    if (!env.kv) return new Response('FATAL: 呜呜...主人还没有绑定 KV 存储空间，系统没法启动啦！请去 Cloudflare 面板乖乖绑定小写 "kv" 变量哦~ (T_T)', { status: 500, headers: {'Content-Type': 'text/plain;charset=utf-8'} });
    
    const currentConfig = await ConfigManager.get(env);
    if (url.pathname === `${adminRoute}/api/login` && request.method === 'POST') {
      const body = await request.json();
      if (body.password === currentConfig.admin_password) {
        return new Response(JSON.stringify({ success: true }), { headers: { 'Set-Cookie': `admin_auth=${currentConfig.admin_password}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`, 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ success: false }), { status: 401 });
    }
    
    const cookies = request.headers.get('Cookie') || '';
    if (!cookies.includes(`admin_auth=${currentConfig.admin_password}`)) {
      if (url.pathname.startsWith(`${adminRoute}/api`)) return new Response('Unauthorized', { status: 401 });
      return new Response(HTML_TEMPLATES.login(adminRoute), { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
    }
    
    if (url.pathname === `${adminRoute}/api/config` && request.method === 'GET') {
      return new Response(JSON.stringify(currentConfig), { headers: { 'Content-Type': 'application/json' }});
    }
    if (url.pathname === `${adminRoute}/api/config` && request.method === 'POST') {
      const newConfig = await request.json();
      newConfig.last_host = url.host; 
      await ConfigManager.save(env, newConfig);
      return new Response(JSON.stringify({ success: true }));
    }
    if (url.pathname === `${adminRoute}/api/stats` && request.method === 'GET') {
      const usage = await StatsManager.fetchTodayUsage(currentConfig.cf_account_id, currentConfig.cf_api_token);
      return new Response(JSON.stringify({ usage: usage !== null ? usage : -1 }), { headers: { 'Content-Type': 'application/json' }});
    }
    if (url.pathname === `${adminRoute}/api/test-notify` && request.method === 'POST') {
      await NotifyManager.sendDailyReport(currentConfig, env, true);
      return new Response(JSON.stringify({ success: true }));
    }
    
    return new Response(HTML_TEMPLATES.admin(adminRoute), { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
  }
}

// 🛡️ 魔法符文阵：预编译的正则全局常量池 ( •̀ ω •́ )y
const STATIC_REGEX = /\.(jpg|jpeg|png|gif|svg|webp|ico|css|js|woff2?|ttf)$/i;
const API_CACHE_REGEX = /\/(Items\/Resume|Users\/.*\/Items|PlaybackInfo|Videos\/.*\/stream)/i;
const VIDEO_REGEX = /\/(Videos\/|Items\/.*\/Download|\/Items\/.*\/Stream|\/Audio\/)/i;
const SENSITIVE_PATH_REGEX = /(\.\.|\/\.(env|git|svn|htaccess)|(wp-|admin|cgi-bin|\.php))/i;

// ==========================================
// 🚀 魔法阵 6：超厉害的高性能流量代理引擎 (ProxyEngine) 咻~
// ==========================================
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
      if (config.allowed_ports) {
        const port = u.port || (u.protocol === 'https:' ? '443' : '80');
        const allowedPorts = config.allowed_ports.split(',').map(p => p.trim());
        if (!allowedPorts.includes(port)) return null;
      }
      if (config.allowed_domains) {
        const domains = config.allowed_domains.split(',').map(d => d.trim());
        const matched = domains.some(d => u.hostname === d || u.hostname.endsWith('.' + d));
        if (!matched) return null;
      }
      if (u.pathname.startsWith('/System') || u.pathname.startsWith('/Users')) return null;
      return u;
    } catch (e) { return null; }
  }

  static checkAccess(config, clientIP, targetHost) {
    const isMatch = (list) => {
      if (!list || !Array.isArray(list)) return false;
      for (let item of list) {
        let line = item.trim();
        if (!line || line.startsWith('#') || line.startsWith('//')) continue;
        let clean = line.replace(/^https?:\/\//i, '').split('/')[0].split(':')[0].trim();
        if (clean === clientIP || clean === targetHost) return true;
      }
      return false;
    };
    if (isMatch(config.blacklist)) return { allowed: false, msg: 'Blocked by Firewall Policy.' };
    if (config.enable_whitelist && !isMatch(config.whitelist)) return { allowed: false, msg: 'Access Denied: Zero Trust Policy Active.' };
    return { allowed: true };
  }

  static async rewriteResponseBody(response, proxyOrigin, targetOrigin) {
    const contentType = response.headers.get('Content-Type') || '';
    if (!contentType.includes('json') && !contentType.includes('xml') && !contentType.includes('text')) {
      return response;
    }

    // 💥 体积熔断小卫士：绝对不可以让超大包裹撑坏内存肚子鸭！(๑•̀ㅂ•́)و✧
    const contentLength = response.headers.get('Content-Length');
    if (contentLength && parseInt(contentLength) > 4194304) {
      return response;
    }

    try {
      const text = await response.text();
      
      if (text.length > 4194304) {
        const fallbackHeaders = new Headers(response.headers);
        fallbackHeaders.delete('Content-Encoding'); 
        fallbackHeaders.delete('Content-Length');
        return new Response(text, { status: response.status, headers: fallbackHeaders });
      }

      const escapedTarget = targetOrigin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedTarget, 'g');
      const newText = text.replace(regex, proxyOrigin);

      const newHeaders = new Headers(response.headers);
      newHeaders.delete('Content-Encoding'); 
      newHeaders.delete('Content-Length');

      return new Response(newText, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    } catch (e) {
      return response;
    }
  }

  static async handle(request, env, ctx, config, adminRoute) {
    const url = new URL(request.url);
    const clientIP = request.headers.get('CF-Connecting-IP') || 'Unknown';

    // 🛡️ 核心拦截结界：坏蛋路径秒级抹杀！绝对不让奇怪的扫描进来哦！(▼へ▼メ)
    if (config.block_sensitive_paths && SENSITIVE_PATH_REGEX.test(url.pathname)) {
      return new Response('404 Not Found', { status: 404, headers: { 'Content-Type': 'text/plain' } });
    }

    let targetUrl = this.parseTarget(url.pathname.slice(1) + url.search, url, config);
    if (!targetUrl) {
      const referer = request.headers.get('Referer');
      if (referer) {
        try {
          const refUrl = new URL(referer);
          const refTarget = this.parseTarget(refUrl.pathname.slice(1) + refUrl.search, refUrl, config);
          if (refTarget) targetUrl = new URL(url.pathname + url.search, refTarget.origin);
        } catch (e) {}
      }
    }

    // 🌐 幻象伪装引擎：悄悄接管前台，给坏人看假动作，保护底层小秘密~ (✿◡‿◡)
    if (!targetUrl) {
      const stats = await StatsManager.fetchTodayUsage(config.cf_account_id, config.cf_api_token);
      const currentStats = stats !== null ? stats : -1;
      const htmlContent = config.custom_html ? config.custom_html.replace(/{{HOST}}/g, url.host) : HTML_TEMPLATES.guide(url.host, currentStats);
      return new Response(htmlContent, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
    }

    const authResult = this.checkAccess(config, clientIP, targetUrl.hostname);
    if (!authResult.allowed) return new Response(authResult.msg, { status: 403 });

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
      resHeaders.set('Access-Control-Expose-Headers', '*');

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
              finalHeaders.set('Access-Control-Expose-Headers', '*');
              return new Response(externalResponse.body, { status: externalResponse.status, headers: finalHeaders });
            }
            if (locUrl.hostname === targetUrl.hostname) {
              resHeaders.set('Location', url.origin + '/' + locUrl.href);
            }
          } catch (e) {}
        }
      }

      if (request.method === 'POST' && targetUrl.pathname.includes('/PlaybackInfo') && response.status === 200) {
        try {
          const clone = response.clone();
          const json = await clone.json();
          let modified = false;
          if (json.MediaSources && Array.isArray(json.MediaSources)) {
            for (let source of json.MediaSources) {
              if (source.DirectStreamUrl && source.DirectStreamUrl.match(/^https?:\/\//)) {
                if (!source.DirectStreamUrl.startsWith(url.origin)) {
                    source.DirectStreamUrl = `${url.origin}/${source.DirectStreamUrl}`;
                }
                modified = true;
              }
              if (source.TranscodingUrl && source.TranscodingUrl.match(/^https?:\/\//)) {
                if (!source.TranscodingUrl.startsWith(url.origin)) {
                    source.TranscodingUrl = `${url.origin}/${source.TranscodingUrl}`;
                }
                modified = true;
              }
            }
          }
          if (modified) {
            resHeaders.delete('Content-Length'); 
            resHeaders.set('Content-Type', 'application/json');
            return new Response(JSON.stringify(json), { status: 200, headers: resHeaders });
          }
        } catch(e) {}
      }

      const proxyOrigin = url.origin;
      const targetOrigin = targetUrl.origin;
      if (response.status === 200 && isGetReq && !isVideo && !isImage) {
        response = await this.rewriteResponseBody(response, proxyOrigin, targetOrigin);
        resHeaders = new Headers(response.headers);
        resHeaders.set('Access-Control-Allow-Origin', '*');
        resHeaders.set('Access-Control-Expose-Headers', '*');
      }

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
      return new Response(JSON.stringify({ error: `Proxy Error: ${e.message}` }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  }
}

// ==========================================
// 🚪 终极魔法阵 7：边缘节点调度大门 (Main Entry) 欢迎光临~
// ==========================================
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname === '/favicon.ico' || url.pathname === '/apple-touch-icon.png') {
      return new Response(null, { status: 204 });
    }

    // 哒咩！绝对不可以偷用自带的 workers 域名哦，要用专属的自定义域名才行！(乂'ω')
    if (url.hostname.endsWith('.workers.dev') || url.hostname.endsWith('.pages.dev')) {
      return new Response('Access Denied: Please use a custom domain.', { status: 403 });
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Max-Age': '86400',
          'Access-Control-Expose-Headers': '*'
        }
      });
    }

    let rawAdmin = env.admin || '/emby-admin';
    if (!rawAdmin.startsWith('/')) rawAdmin = '/' + rawAdmin;

    // 乖乖站好排队~ 这里是路由分发小助手，管理去左边，业务去右边 (´▽`ʃ♡ƪ)
    if (url.pathname.startsWith(rawAdmin)) {
      return AdminController.handle(request, env, url, rawAdmin);
    } else {
      const config = await ConfigManager.get(env);
      return ProxyEngine.handle(request, env, ctx, config, rawAdmin);
    }
  },

  // ⏰ 滴答滴答~ 自动化计划任务小闹钟响啦 (Cron Task Engine) ヾ(≧▽≦*)o
  async scheduled(controller, env, ctx) {
    const config = await ConfigManager.get(env);
    if (config.cf_account_id && config.cf_api_token) {
      ctx.waitUntil(NotifyManager.sendDailyReport(config, env));
    }
  }
};
