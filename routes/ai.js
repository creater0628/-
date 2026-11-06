const express = require('express');
const router = express.Router();

// 通义千问接口地址：默认使用百炼控制台 API Key 页"按量付费 Base URL"的业务空间专属域名
// 注：旧域名 dashscope.aliyuncs.com 自 2026-09-30 起进入维护状态、不再支持新特性，新业务应使用专属域名
// 如需换平台（如 ModelScope 免费推理），在 .env 里设置 QWEN_BASE_URL 即可，不用改代码
const BASE_URL = process.env.QWEN_BASE_URL
    || 'https://ws-aasgbtdqgwt09zua.cn-beijing.maas.aliyuncs.com/compatible-mode/v1';
const DASHSCOPE_URL = BASE_URL + '/chat/completions';

// 可调参数：模型名与限流重试策略
// qwen-plus / qwen-max / qwen-flash 当前账号返回 403 AccessDenied.Unpurchased（未开通），
// qwen-turbo 有权限（返回 429 而非 403，说明鉴权通过）。开通其它模型后可改这里。
const MODEL = process.env.QWEN_MODEL || 'qwen-turbo';
const SYSTEM_PROMPT = '你是三角洲行动最高指挥官，天际港全权由您负责。';

// 百炼对免费额度账号采用"动态限流"，零消费档位的 RPM/TPM 很低，
// 撞上 429 属正常现象。这里做指数退避重试，避免演示时一次失败就报错。
const MAX_RETRY = 3;
const RETRY_DELAYS = [3000, 8000, 15000];   // 第1/2/3次重试前的等待毫秒数
const sleep = ms => new Promise(r => setTimeout(r, ms));

router.post('/chat', async function (req, res) {
    try {
        // 1) 前置校验：Key 是否已配置（占位符含中文会让 HTTP 头编码失败，提前拦下并给可读提示）
        const apiKey = process.env.DASHSCOPE_API_KEY;
        if (!apiKey || apiKey.includes('请把你的密钥')) {
            return res.status(500).json({
                error: '未配置有效的 API Key：请在项目根目录 .env 文件里，把 DASHSCOPE_API_KEY 换成你的阿里云百炼真实 Key（形如 sk-xxxx），然后重启服务'
            });
        }

        // 2) 前置校验：前端是否传了消息
        const message = (req.body && req.body.message ? String(req.body.message) : '').trim();
        if (!message) {
            return res.status(400).json({ error: '缺少 message 字段' });
        }

        // 3) 调用通义千问，遇 429/5xx 自动退避重试
        let lastError = null;
        for (let attempt = 0; attempt <= MAX_RETRY; attempt++) {
            if (attempt > 0) {
                await sleep(RETRY_DELAYS[attempt - 1]);
                console.log(`[ai] 第 ${attempt} 次重试（上次为 ${lastError.status}）…`);
            }

            const r = await fetch(DASHSCOPE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + apiKey
                },
                body: JSON.stringify({
                    model: MODEL,
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        { role: 'user', content: message }
                    ]
                })
            });

            const data = await r.json().catch(() => ({}));

            // 成功
            if (r.ok && data.choices && data.choices[0] && data.choices[0].message) {
                return res.json({
                    reply: data.choices[0].message.content,
                    model: MODEL,
                    retried: attempt
                });
            }

            // 限流或服务端临时故障 -> 值得重试
            const retryable = (r.status === 429 || r.status >= 500);
            const msg = (data && data.error && (data.error.message || data.error.code))
                || ('通义千问返回状态 ' + r.status);

            if (retryable && attempt < MAX_RETRY) {
                lastError = { status: r.status, msg };
                continue;
            }

            // 不可重试的错误（401 Key无效 / 403 模型未开通 / 400 参数错），或重试已用尽
            return res.status(r.status === 429 ? 503 : r.status).json({
                error: msg,
                hint: r.status === 403
                    ? '当前账号未开通模型「' + MODEL + '」。请到百炼控制台「模型广场」找到该模型并开通，或在 .env 里设置 QWEN_MODEL 改用已开通的模型'
                    : (r.status === 429
                        ? '已达账号限流上限（免费额度账号为动态限流，零消费档位额度很低）。稍后再试，或在控制台「模型限额」页查看当前 RPM/TPM 配额'
                        : undefined),
                model: MODEL,
                retried: attempt
            });
        }
    } catch (e) {
        // 网络不通、超时等异常
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
