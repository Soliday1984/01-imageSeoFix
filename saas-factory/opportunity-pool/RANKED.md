# Ranked Opportunity Pool

Generated from `opportunities.json` on 2026-10-15.
Score combines pain, reach, build speed, willingness to pay, recurring value, SEO, margin and defensibility, then subtracts execution risk.

| Rank | Score | Stage | Opportunity | Buyer | Price | MVP | Primary channel |
| ---: | ---: | --- | --- | --- | --- | ---: | --- |
| 1 | 81.2 | validate-next | Shopify Product CSV Validator and Repair | Shopify merchants and migration freelancers | $19 one-time / $39 monthly | 4d | Shopify CSV error keywords |
| 2 | 80.4 | building | AI Crawler Regression Monitor | SEO agencies and B2B SaaS marketers | $29/$79 monthly | 7d | SEO agency outreach |
| 3 | 74.4 | research | SSL, DNS and Domain Expiry Monitor | Small agencies managing 10-100 client sites | $19/$49 monthly | 6d | agency outreach |
| 4 | 72.8 | research | Browser Extension Permission and Policy Monitor | Companies approving browser extensions for staff | $49/$149 monthly | 8d | IT consultant outreach |
| 5 | 71.6 | research | SEO-Critical Website Change Monitor | SEO freelancers and small agencies | $29/$79 monthly | 7d | SEO agency outreach |
| 6 | 70.4 | research | E-commerce Size Chart Builder and Validator | Small apparel merchants | $19/$39 monthly | 8d | Shopify merchant outreach |
| 7 | 69.6 | validate-next | Google Takeout Photo Metadata Fixer | Users moving Google Photos archives | $19-$39 one-time | 7d | Google Takeout metadata keywords |
| 8 | 68 | research | SaaS Help Center AI Answer Widget | 1-20 person B2B SaaS with self-hosted HTML docs (Docusaurus/MkDocs/custom) and email support, not using a help desk's bundled AI | $39 monthly (Docapta Pro) + ~300-page tier to test | 3d | Docusaurus showcase and docs-site founder outreach |
| 9 | 66.8 | research | IELTS Writing Error Pattern Coach | IELTS candidates with repeated writing mistakes | $15/$29 monthly | 8d | IELTS writing keywords |
| 10 | 65.2 | research | Email Attachment Auto Router | Small offices receiving repetitive PDF attachments | $19/$49 monthly | 9d | small business outreach |
| 11 | 64.8 | research | App Store Screenshot Localizer | Indie mobile app developers | $29 one-time / $19 monthly | 8d | App Store screenshot keywords |
| 12 | 64.4 | research | Country-Specific Passport Photo Checker | Travelers and visa applicants | $9-$19 one-time | 7d | country passport photo keywords |
| 13 | 63.6 | research | Visa Interview Practice Simulator | Applicants preparing for a specific visa interview | $19-$49 one-time | 7d | specific visa interview keywords |
| 14 | 61.2 | research | WordPress Site-Content AI Chatbot Plugin | WordPress site owners and small agencies running content or service sites | Free plugin + $19/$39 monthly | 8d | WordPress.org plugin directory |
| 15 | 60.4 | research | Snapchat Memories Export Fixer | Users exporting Snapchat memories | $19-$39 one-time | 6d | Snapchat export keywords |
| 16 | 57.6 | research | Niche Game Build and Loadout Calculator | Competitive players of one underserved game | Ads + $5 monthly pro | 8d | game build keywords |
| 17 | 55.6 | research | New Game Interactive Map Launch Kit | Players of newly released exploration games | Ads + $5-$15 supporter plan | 10d | launch-window game keywords |
| 18 | 53.2 | discovered | Shopify Store FAQ AI Chatbot | Small Shopify merchants with recurring shipping, sizing and return questions | $19/$39 monthly | 9d | Shopify App Store |
| 19 | 49.2 | hold | Private In-Browser Media Converter | Privacy-sensitive users converting small media files | $19 one-time | 10d | format converter keywords |
| 20 | 30.8 | avoid | AI Humanizer / Detector Bypass | Students and bulk content publishers | $10 monthly | 4d | high-competition SEO |
| 21 | 26.4 | avoid | Generic AI Assistant Wrapper | Everyone | $9 monthly | 3d | high-competition SEO |
| 22 | 26 | avoid | Generic AI Headshot Generator | General consumers | $19 one-time | 7d | paid social |

## Next Validation Queue

### Shopify Product CSV Validator and Repair (81.2)

- Job: 在导入前发现 CSV 字段、图片、variant、handle 和 alt text 错误，避免批量破坏商品目录
- Offer: 本地预检、错误定位、自动修复、可直接回导 Shopify 的 CSV
- Experiment: 收集 10 份脱敏失败 CSV，人工给出错误报告和修复版，价格页测试 $19
- Pass: 7 份可正确诊断，3 位用户下载修复版，1 笔付款
- Kill: 真实 CSV 差异导致无法稳定回导，或 20 位目标用户均只使用 Shopify 支持

### SSL, DNS and Domain Expiry Monitor (74.4)

- Job: 在证书、域名或 DNS 变更导致客户网站中断前收到可执行告警
- Offer: 批量监控、客户分组、白标周报、Slack/email 告警
- Experiment: 导入 10 家 agency 的公开域名，发送一次风险样例报告和 $49 白标方案
- Pass: 3 家愿意导入客户域名，1 家付费
- Kill: 竞品免费层完全覆盖需求，白标/多客户价值无法成交

### Browser Extension Permission and Policy Monitor (72.8)

- Job: 持续发现已批准扩展新增危险权限、所有权变化或商店下架风险
- Offer: 组织清单、权限 diff、风险告警、审计证据导出
- Experiment: 为 10 家小企业公开技术栈生成扩展风险样例，访谈 MSP/IT 顾问
- Pass: 3 位 IT 顾问确认季度审计痛点，1 个 $49 试点
- Kill: 无法合法稳定获得扩展变更数据，或买方要求企业认证超出 MVP

### SEO-Critical Website Change Monitor (71.6)

- Job: 在 title、canonical、robots、schema 或正文被意外改坏时立即发现
- Offer: 关键字段 diff、影响说明、客户报告和一键复测
- Experiment: 监控 20 个 agency 客户站点两周，发送真实变更告警并测试 $29 方案
- Pass: 产生 3 条有价值告警，2 家要求继续，1 家付款
- Kill: 告警噪声无法控制，或买方已有同类工具且不愿切换

### E-commerce Size Chart Builder and Validator (70.4)

- Job: 把供应商尺寸数据转换成移动端可读且单位正确的尺码表，减少退货
- Offer: CSV 导入、单位转换、品牌模板、Shopify 嵌入和一致性检查
- Experiment: 为 10 家独立服装店重做现有尺码表，测量安装意愿与 $19 价格
- Pass: 5 家安装，2 家愿意持续付费
- Kill: 需要 Shopify App 审核才能交付核心价值，或免费主题组件足够好

