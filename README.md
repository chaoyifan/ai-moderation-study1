# AI内容治理实验 Study 1

去品牌化互动式内容平台，用于检验“正常发布 / AI声明提醒 / 帖子删除”对创作者反应的影响。

## GitHub Pages 正式入口

- 正常发布：`https://chaoyifan.github.io/ai-moderation-study1/n7k3/`
- AI声明提醒：`https://chaoyifan.github.io/ai-moderation-study1/p4m8/`
- 帖子删除：`https://chaoyifan.github.io/ai-moderation-study1/r9q2/`

三个入口在处理呈现前使用同一套页面、AI提示词和固定输出，网址不包含实验条件名称，且URL参数不能改变条件。

## 本地验证

```powershell
pnpm install
pnpm run test:pages
pnpm run lint
```

网站仅记录匿名流程字段，不包含问卷量表，也不收集姓名、手机号或真实社交账号等直接身份信息。
