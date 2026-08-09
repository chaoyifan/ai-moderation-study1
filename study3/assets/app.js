(() => {
  "use strict";

  const STUDY = document.body.dataset.study;
  const GOVERNANCE = document.body.dataset.governance;
  const MODERATOR = document.body.dataset.moderator;
  const VALID_GOVERNANCE = new Set(["reminder", "removal"]);
  const VALID_MODERATORS = {
    recognition: new Set(["ordinary", "recognized"]),
    feedback: new Set(["unavailable", "available"]),
  };
  if (!VALID_GOVERNANCE.has(GOVERNANCE) || !VALID_MODERATORS[STUDY]?.has(MODERATOR)) {
    document.body.innerHTML = '<main class="routeError"><h1>页面不可用</h1><p>请从问卷系统提供的专属链接进入。</p></main>';
    return;
  }

  const COPY = {
    generated: `周末博物馆攻略｜半日看展路线

如果周末想安排一次轻松的看展，可以先到城市历史博物馆，从常设展开始。上午人相对少，先看二层的城市记忆展，再到一层的临时展厅。

我通常会提前在官方账号预约，并把最想看的三个展品记在备忘录里。进馆后先拿导览图，按照楼层顺序参观，避免来回走动。

中午可以在附近简餐，下午再去步行十分钟左右的美术馆。两馆之间不用赶时间，全程预留四小时更合适。记得带身份证，出发前确认开放时间和是否需要预约。如果时间充裕，也可以在馆内咖啡区休息一会儿，再慢慢逛逛文创商店。`,
    rule: "系统检测到该内容在创作过程中使用了生成式AI，但发布时未添加AI内容声明。根据平台AI内容透明规则，此类内容需要说明生成式AI的使用。",
  };

  const DECLARATIONS = [
    { value: "none", label: "无" },
    { value: "original", label: "内容为自主创作" },
    { value: "repost", label: "内容为转载" },
    { value: "ai", label: "内容由AI生成" },
    { value: "fiction", label: "内容为虚构演绎" },
  ];

  const params = new URLSearchParams(location.search);
  const cleanPid = (params.get("pid") || `S3-${cryptoRandom(10)}`)
    .replace(/[^a-zA-Z0-9_.-]/g, "")
    .slice(0, 64) || `S3-${cryptoRandom(10)}`;
  const returnUrl = safeReturnUrl(params.get("returnUrl"));
  const storageKey = `aiModerationStudy3:${STUDY}:${GOVERNANCE}:${MODERATOR}:${cleanPid}`;
  const previous = readState();

  const state = {
    screen: "experience",
    generated: true,
    draft: COPY.generated,
    declarationChoice: previous?.declarationChoice || "none",
    menuOpen: false,
    published: Boolean(previous?.published),
    initialDisclosure: previous?.initialDisclosure || null,
    treatmentShown: Boolean(previous?.treatmentShown),
    moderatorShown: Boolean(previous?.moderatorShown),
    feedbackOpened: Boolean(previous?.feedbackOpened),
    feedbackSubmitted: Boolean(previous?.feedbackSubmitted),
    feedbackOpen: false,
    completed: Boolean(previous?.completed),
    completionCode: previous?.completionCode || `CM3-${cryptoRandom(8).toUpperCase()}`,
    timestamps: previous?.timestamps || { openedAt: new Date().toISOString() },
  };

  function cryptoRandom(length) {
    const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
  }

  function safeReturnUrl(value) {
    if (!value) return null;
    try {
      const url = new URL(value);
      return ["https:", "http:"].includes(url.protocol) ? url : null;
    } catch {
      return null;
    }
  }

  function readState() {
    try {
      return JSON.parse(localStorage.getItem(storageKey));
    } catch {
      return null;
    }
  }

  function publicState(eventName) {
    return {
      source: `ai-moderation-study3-${STUDY}`,
      event: eventName,
      pid: cleanPid,
      study: STUDY,
      governance: GOVERNANCE,
      moderator: MODERATOR,
      screen: state.screen,
      generated: state.generated,
      declarationChoice: state.declarationChoice,
      initialDisclosure: state.initialDisclosure,
      published: state.published,
      treatmentShown: state.treatmentShown,
      moderatorShown: state.moderatorShown,
      feedbackOpened: state.feedbackOpened,
      feedbackSubmitted: state.feedbackSubmitted,
      completed: state.completed,
      completionCode: state.completionCode,
      timestamps: state.timestamps,
    };
  }

  function save(eventName = "state") {
    // Deliberately omit edited post text from the stored payload.
    const stored = publicState(eventName);
    try {
      localStorage.setItem(storageKey, JSON.stringify(stored));
    } catch {}
    try {
      window.parent?.postMessage(publicState(eventName), "*");
    } catch {}
  }

  const root = document.getElementById("root");

  function render() {
    root.innerHTML = experienceScreen();
    wireEvents();
  }

  function experienceScreen() {
    return `
      <div class="appShell">
        ${topbar()}
        <main class="microblogFrame" id="experience">
          ${leftRail()}
          <section class="mainColumn">
            ${composerCard()}
            ${feed()}
          </section>
          ${rightRail()}
        </main>
      </div>`;
  }

  function topbar() {
    return `<header class="topbar">
      <div class="brandLockup"><span class="brandMark small">澄</span><span><strong>澄明社区</strong><small>研究模拟平台</small></span></div>
      <input class="microSearch" aria-label="模拟搜索" value="搜索模拟内容" readonly>
      <nav class="microNav" aria-label="顶部导航"><a class="active" href="#experience">首页</a><a href="#experience">热门</a><a href="#experience">视频</a><a href="#experience">消息</a></nav>
    </header>`;
  }

  function leftRail() {
    return `<aside class="leftRail" aria-label="模拟频道导航">
      <h2>首页</h2>
      <nav>
        <a class="active" href="#experience">☷&nbsp; 全部关注</a>
        <a href="#feed">◉&nbsp; 最新动态</a>
        <a href="#feed">♙&nbsp; 特别关注</a>
        <a href="#feed">♙&nbsp; 好友圈</a>
      </nav>
      <div class="railDivider"></div>
      <p class="railTitle">自定义分组</p>
      <a class="secondaryLink" href="#feed">•&nbsp; 新闻资讯</a>
      <a class="secondaryLink" href="#feed">•&nbsp; 生活健康</a>
      <a class="secondaryLink" href="#feed">•&nbsp; 城市气象</a>
    </aside>`;
  }

  function rightRail() {
    const topics = [
      ["开学季书单", "267172"], ["城市夜跑路线", "61403"], ["强对流天气提醒", "48859"],
      ["周末展览推荐", "62931"], ["体检报告怎么看", "82688"], ["夏日防晒误区", "63965"],
      ["旧物改造灵感", "66501"], ["通勤播客清单", "62965"], ["社区花园开放", "343814"], ["新上映纪录片", "382032"],
    ];
    return `<aside class="rightRail">
      <section><div class="railSectionTitle"><h3>社区热搜</h3><span>⟳ 点击刷新</span></div>
      <div class="trendTabs"><span class="active">我的</span><span>热搜</span></div>
      <ol class="trendList">${topics.map((x, i) => `<li><b>${i + 1}</b><span>${x[0]}</span><small>${x[1]}</small></li>`).join("")}</ol></section>
      <section class="researchNotice"><strong>研究环境提示</strong>以上频道、热搜与互动数据均为固定模拟内容，不代表真实平台或真实用户。</section>
    </aside>`;
  }

  function composerCard() {
    const editorValue = state.published ? "" : escapeHtml(state.draft);
    return `<section class="composerCard" aria-label="发布新帖子">
      <div class="composerPrompt">有什么新鲜事想分享给大家？</div>
      <div class="postEditorArea">
        <textarea id="postEditor" class="postEditor" aria-label="帖子正文" placeholder="有什么新鲜事想分享给大家？" ${state.published ? "readonly" : ""}>${editorValue}</textarea>
        <div class="declarationPicker">
          <button id="declarationTrigger" type="button" class="declarationTrigger ${state.declarationChoice !== "none" ? "hasSelection" : ""}" aria-haspopup="menu" aria-expanded="${state.menuOpen}">
            内容声明 <span aria-hidden="true">⌄</span>
          </button>
          ${state.menuOpen && !state.published ? declarationMenu() : ""}
        </div>
      </div>
      <div class="composerActions">
        <div class="composerTools" aria-label="模拟发帖工具"><span>☺ 表情</span><span>▧ 图片</span><span># 话题</span><span>⚡ 头条文章</span><span>••• 更多</span></div>
        <button type="button" class="visibilityTrigger" aria-label="帖子可见范围：公开">◷ 公开⌄</button>
        <button id="publish" class="primaryButton composerPublishButton" ${state.published ? "disabled" : ""}>发布</button>
      </div>
    </section>`;
  }

  function declarationMenu() {
    return `<div class="declarationMenu" role="menu" aria-label="内容声明选项">
      <div class="declarationMenuHeader"><b>内容声明</b><span title="选择与本次内容相符的声明">?</span></div>
      <div class="declarationGrid">${DECLARATIONS.map((item) => `
        <button type="button" class="declarationOption" role="menuitemradio" aria-checked="${state.declarationChoice === item.value}" data-declaration="${item.value}">${item.label}</button>`).join("")}</div>
    </div>`;
  }

  function feed() {
    return `<section id="feed" class="ambientFeed" aria-label="社区已发布动态">
      ${state.published ? participantResult() : ""}
      ${ambientPostScientist()}
      ${ambientPostPoll()}
      ${ambientPostWeather()}
      ${state.published ? returnRow() : ""}
    </section>`;
  }

  function participantResult() {
    const disclosed = state.initialDisclosure === "disclosed";
    const treatmentEligible = !disclosed;
    const removed = treatmentEligible && GOVERNANCE === "removal";
    const reminder = treatmentEligible && GOVERNANCE === "reminder";
    return `<article class="feedCard participantPost" aria-label="你刚发布的帖子">
      <div class="feedAuthor"><div class="avatar smallAvatar">学</div><div><b>日常记录员</b><span>刚刚 · 来自网页端</span></div></div>
      ${removed
        ? `<div class="removedPost"><span aria-hidden="true">×</span><h2>该内容已被移除</h2><p>帖子当前不在公开页面展示。</p></div>`
        : `${disclosed ? `<span class="disclosureBadge">AI生成或辅助</span>` : ""}<p class="postText">${escapeHtml(state.draft).replace(/\n/g, "<br>")}</p><div class="postActions"><span>转发 0</span><span>评论 0</span><span>喜欢 0</span></div>`}
    </article>
    ${(removed || reminder) ? `${treatmentNotice(removed ? "removal" : "reminder")}${moderatorPanel()}` : ""}`;
  }

  function treatmentNotice(type) {
    const isRemoval = type === "removal";
    return `<aside class="statusCard treatmentNotice" role="status" aria-live="polite">
      <div class="noticeHeading"><span class="statusIcon ${isRemoval ? "danger" : "warning"}" aria-hidden="true">${isRemoval ? "×" : "!"}</span><div><p class="eyebrow">平台通知</p><h2>${isRemoval ? "帖子已被移除" : "请补充AI内容声明"}</h2></div></div>
      <p class="ruleText">${COPY.rule}</p>
      <p class="consequenceBox">${isRemoval ? "帖子已从公开页面移除。补充AI内容声明后可重新提交。" : "帖子仍保持发布状态。建议补充AI内容声明。"}</p>
    </aside>`;
  }

  function moderatorPanel() {
    if (STUDY === "recognition") return recognitionPanel();
    if (STUDY === "feedback") return feedbackPanel();
    return "";
  }

  function recognitionPanel() {
    const recognized = MODERATOR === "recognized";
    return `<aside class="statusCard moderatorCard recognitionCard" aria-label="创作者账号状态">
      <div class="creatorStatusHeading"><span class="creatorAvatar" aria-hidden="true">学</span><div><p class="eyebrow">创作者账号状态</p><h2>日常记录员 ${recognized ? '<span class="qualityCreatorBadge">优质创作者</span>' : ""}</h2></div></div>
      <p class="moderatorText">${recognized ? "平台已授予该账号优质创作者标识。" : "该账号当前显示为普通创作者账号。"}</p>
    </aside>`;
  }

  function feedbackPanel() {
    const available = MODERATOR === "available";
    return `<aside class="statusCard moderatorCard feedbackCard" aria-label="本次处理记录">
      <div class="feedbackPanelRow"><div><p class="eyebrow">本次处理记录</p><h2>AI内容声明处理</h2></div>
      ${available ? '<button id="openFeedback" type="button" class="secondaryButton">提交反馈</button>' : ""}</div>
      ${state.feedbackSubmitted ? '<p class="feedbackConfirmation" role="status">反馈已记录。</p>' : ""}
      ${state.feedbackOpen ? feedbackDialog() : ""}
    </aside>`;
  }

  function feedbackDialog() {
    return `<div class="feedbackDialog" role="dialog" aria-modal="true" aria-labelledby="feedbackTitle">
      <div class="feedbackDialogPanel">
        <h2 id="feedbackTitle">提交反馈</h2>
        <p>请简要说明你对本次处理的疑问或意见（选填）。</p>
        <textarea id="feedbackText" maxlength="500" aria-label="反馈内容"></textarea>
        <div class="feedbackDialogActions"><button id="cancelFeedback" type="button" class="textButton">取消</button><button id="submitFeedback" type="button" class="primaryButton">提交</button></div>
      </div>
    </div>`;
  }

  function returnRow() {
    return `<div class="feedReturnRow"><button id="returnSurvey" class="primaryButton returnButton">返回问卷</button><p>完成码：<strong>${state.completionCode}</strong></p></div>`;
  }

  function ambientPostScientist() {
    return `<article class="feedCard ambientPost">
      <div class="feedAuthor"><div class="avatar smallAvatar ambientAvatar">岳</div><div><div class="ambientAuthor"><b>海岳新闻</b><span class="verifiedBadge">V</span><span class="authorMark">✺</span></div><span>23小时前 · 来自视频号</span></div><button class="postMenu" aria-label="更多操作">⌄</button></div>
      <p class="postText ambientText"><span class="ambientTopic">#青年科研工作者的一天#</span> 从校园实验室到国家重点项目，38岁的周越把十多年时间都用在高可信软件研究上。记者见到他时，他刚结束一场学生讨论会。“把复杂的技术讲给更多人听，也是研究的一部分。”</p>
      <div class="ambientMedia scientistMedia"><span class="mediaKicker">人物</span><b>把复杂的技术讲给更多人听</b><span class="mediaPlay">▶</span><span class="mediaMeta"><span>155万次观看</span><span>01:26</span></span></div>
      <div class="postActions"><span>↗ 转发 28</span><span>▢ 评论 349</span><span>♡ 喜欢 3979</span></div>
    </article>`;
  }

  function ambientPostPoll() {
    return `<article class="feedCard ambientPost">
      <div class="feedAuthor"><div class="avatar smallAvatar ambientAvatar rose">财</div><div><div class="ambientAuthor"><b>壹号财经日报</b><span class="verifiedBadge">V</span><span class="authorMark">✺</span></div><span>2小时前</span></div><button class="postMenu" aria-label="更多操作">⌄</button></div>
      <p class="postText ambientText">小调查：你会定期体检吗？ <span class="ambientTopic">#慢性炎症至少关联8种健康风险#</span></p>
      <div class="ambientPoll"><p>你会定期体检吗？</p><button type="button">会</button><button type="button">不会</button><small>64人参与 · 还有2天结束</small></div>
      <div class="postActions"><span>↗ 转发 12</span><span>▢ 评论 86</span><span>♡ 喜欢 268</span></div>
    </article>`;
  }

  function ambientPostWeather() {
    return `<article class="feedCard ambientPost">
      <div class="feedAuthor"><div class="avatar smallAvatar ambientAvatar blue">辟</div><div><div class="ambientAuthor"><b>澄明辟谣</b><span class="verifiedBadge">V</span><span class="authorMark">✺</span></div><span>24分钟前 · 来自网页版</span></div><button class="postMenu" aria-label="更多操作">⌄</button></div>
      <p class="postText ambientText"><span class="ambientTopic">#高温天气防暑指南#</span> “桑拿天”等同于高温天吗？高温与高湿同时出现时，人体散热会更困难，但两者不能简单画等号。</p>
      <div class="quotedPost"><b>@城市气象观察 <span class="verifiedInline">V</span></b><p>本周中伏仍将持续，部分地区午后湿度较高。户外活动请及时补水，避免长时间暴晒。</p><div class="ambientMedia heatMedia"><span class="mediaKicker">气象科普</span><b>高温高湿天气如何科学防暑</b><span class="mediaPlay">▶</span><span class="mediaMeta"><span>93万次观看</span><span>02:02</span></span></div></div>
      <div class="postActions"><span>↗ 转发 8</span><span>▢ 评论 41</span><span>♡ 喜欢 303</span></div>
    </article>`;
  }

  function escapeHtml(value) {
    return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  }

  function wireEvents() {
    const editor = document.getElementById("postEditor");
    editor?.addEventListener("input", (event) => {
      state.draft = event.target.value;
    });
    editor?.addEventListener("blur", () => save("draft_saved"));

    document.getElementById("declarationTrigger")?.addEventListener("click", () => {
      if (state.published) return;
      state.menuOpen = !state.menuOpen;
      render();
      if (state.menuOpen) document.querySelector(".declarationOption")?.focus();
    });

    document.querySelectorAll("[data-declaration]").forEach((button) => {
      button.addEventListener("click", () => {
        state.declarationChoice = button.dataset.declaration;
        state.menuOpen = false;
        save("declaration_selected");
        render();
      });
    });

    document.getElementById("publish")?.addEventListener("click", () => {
      if (!state.draft.trim() || state.published) return;
      state.published = true;
      state.initialDisclosure = state.declarationChoice === "ai" ? "disclosed" : "undisclosed";
      state.treatmentShown = state.initialDisclosure === "undisclosed";
      state.moderatorShown = state.initialDisclosure === "undisclosed";
      state.timestamps.publishedAt = new Date().toISOString();
      save("published");
      render();
      document.querySelector(".participantPost")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    document.getElementById("openFeedback")?.addEventListener("click", () => {
      state.feedbackOpen = true;
      state.feedbackOpened = true;
      state.timestamps.feedbackOpenedAt = new Date().toISOString();
      save("feedback_opened");
      render();
      document.getElementById("feedbackText")?.focus();
    });

    document.getElementById("cancelFeedback")?.addEventListener("click", () => {
      state.feedbackOpen = false;
      save("feedback_cancelled");
      render();
    });

    document.getElementById("submitFeedback")?.addEventListener("click", () => {
      state.feedbackOpen = false;
      state.feedbackSubmitted = true;
      state.timestamps.feedbackSubmittedAt = new Date().toISOString();
      // Feedback text is deliberately not retained or transmitted.
      save("feedback_submitted");
      render();
    });

    document.getElementById("returnSurvey")?.addEventListener("click", () => {
      state.completed = true;
      state.timestamps.completedAt = new Date().toISOString();
      save("completed");
      if (returnUrl) {
        returnUrl.searchParams.set("pid", cleanPid);
        returnUrl.searchParams.set("siteComplete", "1");
        returnUrl.searchParams.set("completionCode", state.completionCode);
        location.assign(returnUrl.toString());
      } else {
        const button = document.getElementById("returnSurvey");
        button.textContent = "已完成，请返回问卷页面";
        button.disabled = true;
      }
    });
  }

  save("opened");
  render();
})();
