# Study 2 条件映射（研究团队内部使用）

| 路径 | 条件 | 处理 |
|---|---|---|
| `/study2/c7m4/` | 正常发布（基准） | 首次未披露者的帖子正常进入信息流；不显示成功提示或治理通知 |
| `/study2/t9p2/` | AI声明提醒 | 帖子保留；显示统一规则解释与声明提醒 |
| `/study2/v5r8/` | 帖子删除 | 帖子从信息流移除；显示统一规则解释与删除后果 |

条件由每条路径的 `body[data-condition]` 固定，不读取任何 `condition` 查询参数。问卷平台只传递匿名 `pid` 与可选的 `returnUrl`。

## 数据接口

- localStorage 键：`aiModerationStudy2:{pid}`
- postMessage `source`：`ai-moderation-study2`
- 核心字段：`pid`、`condition`、`declarationChoice`、`initialDisclosure`、`published`、`treatmentShown`、`completed`、`completionCode`、`timestamps`
- 网站不保存参与者编辑后的帖子正文。
