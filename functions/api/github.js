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
      let errorMessage = 'GitHub API 拒绝访问。';
      let rateLimitInfo = '';
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
          // 检测是否为速率限制
          if (errorMessage.toLowerCase().includes('rate limit')) {
            if (hasToken) {
              rateLimitInfo = '已认证，但可能触及了频率限制（5000次/小时），请稍后再试，或检查令牌是否有效。';
            } else {
              rateLimitInfo = '未认证请求频率限制为 60 次/小时，请等待一小时恢复，或配置 GITHUB_TOKEN 环境变量提升限额至 5000 次/小时。';
            }
          }
        }
      } catch (_) {
        // 解析失败则忽略
      }

      const finalMessage = rateLimitInfo || errorMessage;
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
