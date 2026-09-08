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
  };
  if (hasToken) {
    headers['Authorization'] = `token ${token}`;
  }

  try {
    const apiUrl = `https://api.github.com/users/${encodeURIComponent(username)}`;
    const response = await fetch(apiUrl, { headers });

    // 处理 404
    if (response.status === 404) {
      return new Response(JSON.stringify({ error: '没有找到这个 GitHub 用户。' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 处理 403
    if (response.status === 403) {
      let rawMessage = '';
      try {
        const errorData = await response.json();
        rawMessage = errorData.message || '';
      } catch (_) {
        rawMessage = response.statusText || '';
      }

      let userFriendly = '';
      if (hasToken) {
        userFriendly = '已配置令牌但请求被拒。请检查：\n1. 令牌是否有效且未过期\n2. 是否达到 5000 次/小时限制\n3. 若未设置任何权限，仅读取公开信息无需额外授权';
      } else {
        userFriendly = '未配置认证令牌，GitHub 未认证请求限制为 60 次/小时。\n建议：等待一小时后恢复，或在 Cloudflare Pages 环境变量中设置 GITHUB_TOKEN 提升限额至 5000 次/小时。';
      }

      // 如果原始消息包含具体信息，拼接在后面
      const finalMessage = rawMessage ? `${userFriendly}\n（API 返回：${rawMessage}）` : userFriendly;

      return new Response(JSON.stringify({ error: finalMessage }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 其他非 2xx 状态
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
