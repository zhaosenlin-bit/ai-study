# 讯飞星火/语音 Key 获取与环境变量

本项目可能用到三类讯飞能力：

- 星火大模型：文本对话、诊断分析、讲解生成。
- 语音识别 ASR：学生朗读、英语跟读、课堂语音转文字。
- 语音合成 TTS：AI 伙伴把提示读出来。

## 1. 去哪里获取

官方入口：

- 讯飞开放平台：https://www.xfyun.cn/
- 在线语音合成文档：https://www.xfyun.cn/doc/tts/online_tts/API.html
- 语音听写流式版文档：https://www.xfyun.cn/doc/asr/voicedictation/API.html
- 大模型多语种语音识别文档：https://www.xfyun.cn/doc/spark/spark_mul_cn_iat.html
- 超拟人语音合成文档：https://www.xfyun.cn/doc/spark/super%20smart-tts.html

## 2. 获取步骤

1. 登录讯飞开放平台账号。
2. 完成个人或企业实名认证。
3. 进入对应产品页，领取免费额度或购买套餐。
4. 进入控制台，创建 WebAPI 平台应用。
5. 在应用里添加需要的服务，例如星火大模型、语音听写、在线语音合成、超拟人语音合成。
6. 打开对应服务页，复制鉴权信息。

常见鉴权信息：

```text
APPID
APIKey
APISecret
```

在线语音合成部分接口还可能提供：

```text
APIPassword
```

以当前选用的具体接口文档为准。

## 3. 本项目环境变量命名

不要把真实 Key 写进代码或提交到 Git。

```bash
IFLYTEK_APP_ID=
IFLYTEK_API_KEY=
IFLYTEK_API_SECRET=
IFLYTEK_API_PASSWORD=

SPARK_APP_ID=
SPARK_API_KEY=
SPARK_API_SECRET=

IFLYTEK_ASR_ENABLED=false
IFLYTEK_TTS_ENABLED=false
```

## 4. MVP 建议

初赛 MVP 不要让语音能力卡住主流程：

1. 星火文本能力优先接通。
2. 语音识别和语音合成作为加分项。
3. 如果 Key 或额度暂时不稳定，前端保留语音按钮，后端返回 mock 文本和 mock 音频路径。
4. 真实 Key 只放本地 `.env` 或部署平台环境变量里。
