// functions/api/github.js
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const username = url.searchParams.get('username');

  if (!username) {
    return new Response(JSON.stringify({ error: '缺少 username 参数' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const token = env.GITHUB_TOKEN || '';
  const hasToken = !!token;

  const headers = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'gh-profile-radar (https://gh-profile-radar.pages.dev)'
  };
  if (hasToken) {
    headers['Authorization'] = `token ${token}`;
  }

  try {
    const apiUrl = `https://api.github.com/users/${encodeURIComponent(username)}`;
    const response = await fetch(apiUrl, { headers });

    // 如果是 403，尝试提取详细信息
    if (response.status === 403) {
      let rawMessage = '';
      let rateLimitInfo = '';

      // 尝试读取响应体
      try {
        const errorData = await response.json();
        rawMessage = errorData.message || '';
      } catch (_) {
        rawMessage = response.statusText || '';
      }

      // 读取速率限制头部（如果存在）
      const limit = response.headers.get('X-RateLimit-Limit');
      const remaining = response.headers.get('X-RateLimit-Remaining');
      const reset = response.headers.get('X-RateLimit-Reset');
      if (limit && remaining) {
        rateLimitInfo = `限额 ${limit} 次/小时，剩余 ${remaining} 次`;
        if (reset) {
          const resetDate = new Date(parseInt(reset) * 1000);
          rateLimitInfo += `，重置时间 ${resetDate.toLocaleString()}`;
        }
      }

      // 构建用户友好信息
      let userFriendly = '';
      if (hasToken) {
        if (rawMessage.toLowerCase().includes('rate limit') || (rateLimitInfo && parseInt(remaining) === 0)) {
          userFriendly = `已认证但频率限制已用完（${rateLimitInfo}）。请等待重置后再试。`;
        } else {
          userFriendly = `已配置令牌但请求仍被拒绝。这通常是因为 Cloudflare 出口 IP 被 GitHub 临时限制（次要速率限制）。\n建议：\n1. 等待 5～30 分钟自动恢复；\n2. 尝试更换 Cloudflare Pages 的部署区域（项目设置 → Region）；\n3. 若持续存在，可联系 GitHub 支持或使用其他代理出口。`;
          if (rateLimitInfo) {
            userFriendly += `\n（GitHub 头部信息：${rateLimitInfo}，但请求依然被拒，表明 IP 级别限制已触发）`;
          }
        }
      } else {
        userFriendly = `未配置认证令牌，GitHub 未认证请求限制为 60 次/小时。\n建议：等待一小时后恢复，或在 Cloudflare Pages 环境变量中设置 GITHUB_TOKEN 提升限额至 5000 次/小时。`;
      }

      const finalMessage = rawMessage ? `${userFriendly}\n（API 返回：${rawMessage}）` : userFriendly;

      return new Response(JSON.stringify({ error: finalMessage }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 处理 404
    if (response.status === 404) {
      return new Response(JSON.stringify({ error: '没有找到这个 GitHub 用户。' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 其他错误
    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: `GitHub API 异常 (${response.status}): ${errorText}` }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userData = await response.json();
    return new Response(JSON.stringify(userData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || '代理请求失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
