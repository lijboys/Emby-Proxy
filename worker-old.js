// ===================== 配置区域 =====================
const ENABLE_IMAGE_CACHE = true; 
const BLOCK_MSG = 'Access Denied: Please use custom domain.';
// ====================================================

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request);
  }
};

async function handleRequest(request) {
  const url = new URL(request.url);

  // 安全策略：禁止默认 workers.dev 域名访问
  if (url.hostname.endsWith('.workers.dev') || url.hostname.endsWith('.pages.dev')) {
    // 注意：Pages 默认域名是 .pages.dev，这里也顺手禁了，强制用自定义域名
    // 如果你刚开始调试想放行，可以注释掉这行
    return new Response(BLOCK_MSG, { status: 403 });
  }

  // CORS 处理
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

  // 解析目标地址
  // 格式：https://你的域名/https://emby.server.com:8096
  const targetPath = url.pathname.slice(1) + url.search;
  
  if (!targetPath || !targetPath.startsWith('http')) {
    return new Response('使用方式: https://你的自定义域名/https://emby服务器地址', {status: 400});
  }

  let targetUrl;
  try {
    targetUrl = new URL(targetPath);
  } catch(e) {
    return new Response('无效的目标地址', {status: 400});
  }

  // WebSocket 处理
  if (request.headers.get('Upgrade') === 'websocket') {
    return handleWebSocket(request, targetUrl);
  }

  // HTTP 请求转发
  const newRequest = new Request(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: 'manual' 
  });

  newRequest.headers.set('Host', targetUrl.host);
  newRequest.headers.set('X-Forwarded-For', request.headers.get('CF-Connecting-IP'));
  newRequest.headers.delete('Referer'); 

  // 图片缓存逻辑
  const isImage = targetUrl.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) || 
                  targetPath.includes('/Images/') || 
                  targetPath.includes('/Primary');

  if (ENABLE_IMAGE_CACHE && isImage && request.method === 'GET') {
    const cache = caches.default;
    const cachedResponse = await cache.match(newRequest);
    if (cachedResponse) return cachedResponse; 
  }

  try {
    const response = await fetch(newRequest);
    const newHeaders = new Headers(response.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*'); 

    if (ENABLE_IMAGE_CACHE && isImage && response.status === 200) {
      newHeaders.set('Cache-Control', 'public, max-age=86400');
      const responseToCache = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
      const responseForClient = responseToCache.clone();
      // 注意：Pages 环境下 caches.default 可能表现略有不同，但通常兼容
      ctx.waitUntil(caches.default.put(newRequest, responseToCache));
      return responseForClient;
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });

  } catch (e) {
    return new Response(`反代连接失败: ${e.message}`, { status: 500 });
  }
}

async function handleWebSocket(request, targetUrl) {
  const wsProtocol = targetUrl.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsTargetUrl = `${wsProtocol}//${targetUrl.host}${targetUrl.pathname}${targetUrl.search}`;
  const clientSocket = new WebSocketPair();
  const [client, server] = Object.values(clientSocket);

  try {
    const targetSocket = new WebSocket(wsTargetUrl);
    targetSocket.accept();
    targetSocket.addEventListener('message', e => server.send(e.data));
    server.addEventListener('message', e => targetSocket.send(e.data));
    targetSocket.addEventListener('close', e => server.close(e.code, e.reason));
    server.addEventListener('close', e => targetSocket.close(e.code, e.reason));
    targetSocket.addEventListener('error', e => server.close(1011, e.message));
    server.addEventListener('error', e => targetSocket.close(1011, e.message));
  } catch (e) { return new Response(null, { status: 500 }); }
  return new Response(null, { status: 101, webSocket: client });
}
