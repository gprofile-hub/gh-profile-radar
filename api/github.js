// api/github.js - Vercel Serverless Function
// Compatible with Vercel deployment alongside the existing Cloudflare Pages Functions

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: '缺少 username 参数' });
  }

  const token = process.env.GITHUB_TOKEN || '';
  const hasToken = !!token;

  const headers = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'gh-profile-radar (https://gh-profile-radar.vercel.app)'
  };
  if (hasToken) {
    headers['Authorization'] = `token ${token}`;
  }

  try {
    const apiUrl = `https://api.github.com/users/${encodeURIComponent(username)}`;
    const response = await fetch(apiUrl, { headers });

    // 403 handling
    if (response.status === 403) {
      let rawMessage = '';
      let rateLimitInfo = '';

      try {
        const errorData = await response.json();
        rawMessage = errorData.message || '';
      } catch (_) {
        rawMessage = response.statusText || '';
      }

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

      let userFriendly = '';
      if (hasToken) {
        if (rawMessage.toLowerCase().includes('rate limit') || (rateLimitInfo && parseInt(remaining) === 0)) {
          userFriendly = `已认证但频率限制已用完（${rateLimitInfo}）。请等待重置后再试。`;
        } else {
          userFriendly = `已配置令牌但请求仍被拒绝。这通常是因为 Vercel 出口 IP 被 GitHub 临时限制（次要速率限制）。\n建议：\n1. 等待 5～30 分钟自动恢复；\n2. 若持续存在，可联系 GitHub 支持或使用其他代理出口。`;
          if (rateLimitInfo) {
            userFriendly += `\n（GitHub 头部信息：${rateLimitInfo}）`;
          }
        }
      } else {
        userFriendly = `未配置认证令牌，GitHub 未认证请求限制为 60 次/小时。\n建议：等待一小时后恢复，或在 Vercel 环境变量中设置 GITHUB_TOKEN 提升限额至 5000 次/小时。`;
      }

      const finalMessage = rawMessage ? `${userFriendly}\n（API 返回：${rawMessage}）` : userFriendly;
      return res.status(403).json({ error: finalMessage });
    }

    // 404 handling
    if (response.status === 404) {
      return res.status(404).json({ error: '没有找到这个 GitHub 用户。' });
    }

    // other errors
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `GitHub API 异常 (${response.status}): ${errorText}` });
    }

    const userData = await response.json();
    return res.status(200).json(userData);
  } catch (error) {
    return res.status(500).json({ error: error.message || '代理请求失败' });
  }
}
