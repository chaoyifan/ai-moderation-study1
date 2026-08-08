(() => {
  "use strict";

  const CONDITION = document.body.dataset.condition;
  const VALID_CONDITIONS = new Set(["control", "reminder", "removal"]);
  if (!VALID_CONDITIONS.has(CONDITION)) {
    document.body.innerHTML = '<main class="routeError"><h1>页面不可用</h1><p>请从问卷系统提供的专属链接进入。</p></main>';
    return;
  }

  const COPY = {
    prompt: "请写一篇适合发布在社区平台的学习效率经验分享，包含一个具体方法、执行步骤和实用提醒，语气自然。",
    generated: `最近在尝试“25分钟专注 + 5分钟休息”的方法，最大的变化不是一天能做更多事，而是开始一项任务时没那么容易拖延了。

我的做法是先把当天要完成的事情拆成几步，每轮只写一个具体目标，比如“读完两页并记下三个要点”，而不是笼统地写“复习”。开始计时前，我会把手机调成免打扰，关掉暂时用不到的网页。

25分钟结束后一定离开座位休息5分钟，可以接水、活动一下，但尽量不刷短视频。连续完成三轮后，再用十分钟检查哪些任务估时不准，并调整下一轮安排。

这个方法不适合所有任务。如果需要长时间进入状态，可以把一轮延长到40分钟。关键不是严格卡点，而是让开始、专注和复盘都有清楚的边界。`,
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
  const cleanPid = (params.get("pid") || `S2-${cryptoRandom(10)}`)
    .replace(/[^a-zA-Z0-9_.-]/g, "")
    .slice(0, 64) || `S2-${cryptoRandom(10)}`;
  const returnUrl = safeReturnUrl(params.get("returnUrl"));
  const storageKey = `aiModerationStudy2:${cleanPid}`;
  const previous = readState();

  const state = {
    screen: previous?.screen === "experience" ? "experience" : "consent",
    generated: Boolean(previous?.generated),
    draft: COPY.generated,
    declarationChoice: previous?.declarationChoice || "none",
    menuOpen: false,
    published: Boolean(previous?.published),
    initialDisclosure: previous?.initialDisclosure || null,
    treatmentShown: Boolean(previous?.treatmentShown),
    completed: Boolean(previous?.completed),
    completionCode: previous?.completionCode || `CM2-${cryptoRandom(8).toUpperCase()}`,
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
      source: "ai-moderation-study2",
      event: eventName,
      pid: cleanPid,
      condition: CONDITION,
      screen: state.screen,
      generated: state.generated,
      declarationChoice: state.declarationChoice,
      initialDisclosure: state.initialDisclosure,
      published: state.published,
      treatmentShown: state.treatmentShown,
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
    root.innerHTML = state.screen === "consent" ? consentScreen() : experienceScreen();
    wireEvents();
  }

  function consentScreen() {
    return `
      <main class="landingShell">
        <section class="landingCard" aria-labelledby="welcome-title">
          <div class="brandMark" aria-hidden="true">澄</div>
          <p class="eyebrow">内容平台体验研究</p>
          <h1 id="welcome-title">开始前说明</h1>
          <p class="landingLead">你将使用模拟AI生成一篇学习效率经验，编辑后发布到虚构社区平台。请按照你的真实想法操作。</p>
          <div class="infoGrid">
            <div><b>研究性质</b><span>所有页面均为研究模拟，不属于真实平台。</span></div>
            <div><b>数据范围</b><span>仅记录流程状态、时间和匿名参与编号。</span></div>
            <div><b>退出权利</b><span>你可随时关闭页面，不会产生额外影响。</span></div>
          </div>
          <label class="checkRow"><input id="consent" type="checkbox"><span>我已阅读以上说明，自愿继续参与本次模拟体验。</span></label>
          <button id="enter" class="primaryButton" disabled>进入创作任务</button>
        </section>
      </main>`;
  }

  function experienceScreen() {
    return `
      <div class="appShell">
        ${topbar()}
        <main class="microblogFrame" id="experience">
          ${leftRail()}
          <section class="mainColumn">
            ${!state.generated ? generationCard() : composerCard()}
            ${state.generated ? feed() : ""}
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

  function generationCard() {
    return `<section class="generationCard" aria-labelledby="task-title">
      <p class="eyebrow">任务 01</p>
      <h1 id="task-title">生成内容草稿</h1>
      <p class="lead">系统已准备固定提示词。所有参与者将获得完全相同的AI生成结果。</p>
      <div class="promptBox"><span>发送给模拟AI的提示词</span><p>${COPY.prompt}</p></div>
      <p class="fixedOutputNote">本研究采用固定输出，点击生成不会调用真实AI服务。</p>
      <button id="generate" class="primaryButton">生成内容</button>
    </section>`;
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
    const removed = treatmentEligible && CONDITION === "removal";
    const reminder = treatmentEligible && CONDITION === "reminder";
    return `<article class="feedCard participantPost" aria-label="你刚发布的帖子">
      <div class="feedAuthor"><div class="avatar smallAvatar">学</div><div><b>日常记录员</b><span>刚刚 · 来自网页端</span></div></div>
      ${removed
        ? `<div class="removedPost"><span aria-hidden="true">×</span><h2>该内容已被移除</h2><p>帖子当前不在公开页面展示。</p></div>`
        : `${disclosed ? `<span class="disclosureBadge">AI生成或辅助</span>` : ""}<p class="postText">${escapeHtml(state.draft).replace(/\n/g, "<br>")}</p><div class="postActions"><span>转发 0</span><span>评论 0</span><span>喜欢 0</span></div>`}
    </article>
    ${(removed || reminder) ? treatmentNotice(removed ? "removal" : "reminder") : ""}`;
  }

  function treatmentNotice(type) {
    const isRemoval = type === "removal";
    return `<aside class="statusCard treatmentNotice" role="status" aria-live="polite">
      <div class="noticeHeading"><span class="statusIcon ${isRemoval ? "danger" : "warning"}" aria-hidden="true">${isRemoval ? "×" : "!"}</span><div><p class="eyebrow">平台通知</p><h2>${isRemoval ? "帖子已被移除" : "请补充AI内容声明"}</h2></div></div>
      <p class="ruleText">${COPY.rule}</p>
      <p class="consequenceBox">${isRemoval ? "帖子已从公开页面移除。补充AI内容声明后可重新提交。" : "帖子仍保持发布状态。建议补充AI内容声明。"}</p>
    </aside>`;
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
    const consent = document.getElementById("consent");
    const enter = document.getElementById("enter");
    if (consent && enter) {
      consent.addEventListener("change", () => { enter.disabled = !consent.checked; });
      enter.addEventListener("click", () => {
        state.screen = "experience";
        state.timestamps.consentedAt = new Date().toISOString();
        save("consented");
        render();
      });
    }

    document.getElementById("generate")?.addEventListener("click", () => {
      state.generated = true;
      state.draft = COPY.generated;
      state.timestamps.generatedAt = new Date().toISOString();
      save("generated");
      render();
      document.getElementById("postEditor")?.focus();
    });

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
      state.treatmentShown = state.initialDisclosure === "undisclosed" && CONDITION !== "control";
      state.timestamps.publishedAt = new Date().toISOString();
      save("published");
      render();
      document.querySelector(".participantPost")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
