# Opportunity Experiment

第 1 轮只做案头验证（SERP、竞品、公开讨论、样本规模），没有外联、没有建演示机器人、没有收钱。

## 基本信息

- Opportunity ID: `saas-help-center-ai-answers`
- 日期: 2026-10-15
- 负责人: Claude (Opus 5.5)
- 当前阶段: `research`（本轮后不变）
- 本轮最危险假设: 小型 SaaS 愿意为「只基于自家文档回答」的挂件按月付费，而不是用帮助台自带的 AI 或免费层

## 关键发现

1. **这不是新产品，是 Docapta 的第二个客户细分。** Docapta 已上线 $39/月正式订阅（2026-10-12 开放注册），PRODUCT.md 的用户就写着「small software teams with public HTML documentation」。外部付款仍为 0。按机会池「最多两个产品处于 building/live-validation」的规则，不应另起一个产品，应在 Docapta 上加一个 SaaS 帮助中心落地页和名单来验证。
2. **Docapta 的 50 页上限装不下典型的 SaaS 帮助中心。** 抽查 4 个小型 SaaS 的公开文档 sitemap：Tally 197 个帮助页、Simple Analytics 116、Buttondown 281、Kit 411。4 个全部超过 50 页。这是付款门和交付门的硬伤，不改额度就没法卖给这个细分。样本只有 4 个且都是知名独立 SaaS，结论方向可靠，具体数字不代表平均值。
3. **价格空档真实存在。** 帮助台自带 AI 都按次收费：Intercom Fin $0.99/次、Help Scout AI Answers $0.75/次（均为官网价格）。文档平台的 AI 要高价套餐：Mintlify 的 AI 助手只在 Pro 套餐里，每个回答 25 credits；GitBook 的 AI 助手在 Ultimate 套餐（第三方汇总为 $249/站/月，未在官网核实）。Docapta 每次问答成本估算约 $0.006，按月固定收费有明显价格优势。
4. **但自助型竞品已经占住同价位。** DocsBot Personal $49/月给 5,000 个来源页和 5,000 次 AI 额度；Chatbase Hobby $32/月（按年付）给 700 次额度。Docapta $39 的 50 页 / 500 次在额度上明显吃亏，差异只能靠「只答文档、必带来源、答不出转人工、无超额收费」。
5. **SEO 不是这个细分的主渠道。** 第 2 次 openSEO 批量查询的 16 个长尾词里只有 4 个有数据：help scout ai 50/月（CPC $130.88）、intercom fin pricing 50/月、ai help center 30/月、ai documentation assistant 10/月（KD 79）。intercom fin alternative、docsbot alternative、kapa ai alternative、chatbot for docs 等 12 个词无数据。只能靠直接触达。
6. **答错的风险比答不出大。** Cursor 的 AI 客服编造「单设备登录政策」导致用户退订（HN 1,511 分）。kapa.ai 创始人在 HN 说文档机器人「deceptively hard to get right in production」。Docapta 已有的来源校验和转人工是卖点，也是必须守住的底线。

## 四道门

| 门 | 结果 | 依据 |
|---|---|---|
| 需求门 | 部分通过 | 2 条独立用户/创始人原话（HN 44324884：B2B 团队大量重复问题本可读文档解决；Castro 创始人支持邮件压垮自己，HN 348 分）。第 3 条来自厂商发布帖，不算独立。Fin 的抱怨都是转引，没有拿到原帖（本环境打不开 Reddit） |
| 触达门 | 可通过（名单未筛） | Docusaurus 官方 showcase 有 32 个商业产品文档站（排除开源标签），可作首批 30 家名单来源；再排除已用 Intercom/Help Scout/Zendesk/Mintlify Pro/GitBook Ultimate 自带 AI 的 |
| 付款门 | 未通过 | 没有价格测试；50 页上限不匹配 116–411 页的帮助中心 |
| 交付门 | 有条件通过 | Docapta 已上线，成本上限、Turnstile、来源校验都在；只要把页数额度提到 300 页左右，3 天内能出细分落地页。需在 2026-11-01 AI Search 开始计费前复核入库成本 |

## 用户与场景

- 目标用户: 1–20 人的 B2B SaaS，文档是自建 HTML（Docusaurus、MkDocs、Hugo 或自写），支持靠邮件，没在用帮助台自带 AI
- 触发时刻: 发布新功能或涨价后，同类安装/配置/计费问题在邮件里重复出现
- 当前替代方案: 人工回邮件；帮助台 AI 按次付费；DocsBot/Chatbase 自助机器人
- 不解决的损失: 创始人/工程师时间被重复问题占用；访客找不到答案直接流失
- 首批可触达名单/社区/关键词: Docusaurus showcase 32 个商业产品文档站；MkDocs Material 用户；Indie Hackers；HN Show HN 帖子里带文档站的产品；关键词 intercom fin pricing、help scout ai、ai help center

## 实验（下一轮，需要授权后执行）

- 提供的最小结果: 在 Docapta 加 `/for/saas-help-center` 落地页；给 10 家筛过的目标各做一个演示机器人，附 10 个真实问题、答案和来源核对
- 样本来源: Docusaurus showcase 名单筛选后的 10 家
- 定价与 CTA: 先测 $39（现有 Pro）和一个 300 页档位，价格页上明确「无按次收费、无超额收费」
- 时间上限: 14 天
- 成本上限: 每个演示机器人沿用 Docapta 现有每日 25 次、每访客 6 次限额
- 流量和 AI 调用限额: 同上；不开放免费无限试用
- 对外发送需 Sunny 明确授权

## 原始结果

- 定向访问: 0（本轮未执行）
- 有效对话: 0
- 上传/运行: 0
- 成功交付: 0
- 升级点击: 0
- 付款: 0
- 退款: 0
- 单次交付成本: 估算约 $0.006/次问答（来自 Docapta 价格方案，未实测）
- 用户原话: 见需求门的 HN 链接

## 决策

- 结论: `repeat`。不另做产品，下一轮作为 Docapta 细分做外联验证
- 证据是否达到 passGate: 否
- 最大失败原因: 50 页额度与目标客户文档规模不匹配；付款意愿未测
- 下一次只改什么: 先决定 Docapta 是否加一个 ≥300 页的档位，再用同一份演示流程外联 10 家
- `opportunities.json` 需要更新的阶段/评分/证据: 阶段保持 `research`；SEO 3→2（长尾几乎无量）；mvpDays 5→3（复用已上线的 Docapta）；补充竞品价格、样本规模、HN 证据和本记录链接

## 来源（2026-10-15 读取）

- https://docsbot.ai/pricing
- https://www.chatbase.co/pricing
- https://www.intercom.com/pricing
- https://www.helpscout.com/pricing/
- https://www.mintlify.com/pricing
- https://news.ycombinator.com/item?id=44324884
- https://news.ycombinator.com/item?id=48799929
- https://news.ycombinator.com/item?id=43683012
- https://news.ycombinator.com/item?id=44508459
- https://github.com/facebook/docusaurus/blob/main/website/src/data/users.tsx
- https://app.openseo.so/p/97d124af-dac1-46bd-b242-df46301de83a/keywords
- 各帮助中心 sitemap：https://tally.so/sitemap.xml 、https://docs.simpleanalytics.com/sitemap.xml 、https://docs.buttondown.com/sitemap.xml 、https://help.convertkit.com/sitemap.xml
