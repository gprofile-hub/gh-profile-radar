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

  // 从环境变量获取令牌
  const token = env.GITHUB_TOKEN || '';

  const headers = {
    'Accept': 'application/vnd.github+json',
  };
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  try {
    const apiUrl = `https://api.github.com/users/${encodeURIComponent(username)}`;
    const response = await fetch(apiUrl, { headers });

    if (response.status === 404) {
      return new Response(JSON.stringify({ error: '没有找到这个 GitHub 用户。' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.message || 'GitHub API 拒绝访问，请检查令牌是否有效。';
      return new Response(JSON.stringify({ error: message }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

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
