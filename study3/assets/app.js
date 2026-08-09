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
    document.body.innerHTML = '<main class="routeError"><h1>é¡µé¢ä¸å¯ç”¨</h1><p>è¯·ä»é—®å·ç³»ç»Ÿæä¾›çš„ä¸“å±é“¾æ¥è¿›å…¥ã€‚</p></main>';
    return;
  }

  const COPY = {
    generated: `å‘¨æœ«åšç‰©é¦†æ”»ç•¥ï½œåŠæ—¥çœ‹å±•è·¯çº¿

å¦‚æœå‘¨æœ«æƒ³å®‰æ’ä¸€æ¬¡è½»æ¾çš„çœ‹å±•ï¼Œå¯ä»¥å…ˆåˆ°åŸå¸‚å†å²åšç‰©é¦†ï¼Œä»å¸¸è®¾å±•å¼€å§‹ã€‚ä¸Šåˆäººç›¸å¯¹å°‘ï¼Œå…ˆçœ‹äºŒå±‚çš„åŸå¸‚è®°å¿†å±•ï¼Œå†åˆ°ä¸€å±‚çš„ä¸´æ—¶å±•å…ã€‚

æˆ‘é€šå¸¸ä¼šæå‰åœ¨å®˜æ–¹è´¦å·é¢„çº¦ï¼Œå¹¶æŠŠæœ€æƒ³çœ‹çš„ä¸‰ä¸ªå±•å“è®°åœ¨å¤‡å¿˜å½•é‡Œã€‚è¿›é¦†åå…ˆæ‹¿å¯¼è§ˆå›¾ï¼ŒæŒ‰ç…§æ¥¼å±‚é¡ºåºå‚è§‚ï¼Œé¿å…æ¥å›èµ°åŠ¨ã€‚

ä¸­åˆå¯ä»¥åœ¨é™„è¿‘ç®€é¤ï¼Œä¸‹åˆå†å»æ­¥è¡Œååˆ†é’Ÿå·¦å³çš„ç¾æœ¯é¦†ã€‚ä¸¤é¦†ä¹‹é—´ä¸ç”¨èµ¶æ—¶é—´ï¼Œå…¨ç¨‹é¢„ç•™å››å°æ—¶æ›´åˆé€‚ã€‚è®°å¾—å¸¦èº«ä»½è¯ï¼Œå‡ºå‘å‰ç¡®è®¤å¼€æ”¾æ—¶é—´å’Œæ˜¯å¦éœ€è¦é¢„çº¦ã€‚å¦‚æœæ—¶é—´å……è£•ï¼Œä¹Ÿå¯ä»¥åœ¨é¦†å†…å’–å•¡åŒºä¼‘æ¯ä¸€ä¼šå„¿ï¼Œå†æ…¢æ…¢é€›é€›æ–‡åˆ›å•†åº—ã€‚`,
    rule: "ç³»ç»Ÿæ£€æµ‹åˆ°è¯¥å†…å®¹åœ¨åˆ›ä½œè¿‡ç¨‹ä¸­ä½¿ç”¨äº†ç”Ÿæˆå¼AIï¼Œä½†å‘å¸ƒæ—¶æœªæ·»åŠ AIå†…å®¹å£°æ˜ã€‚æ ¹æ®å¹³å°AIå†…å®¹é€æ˜è§„åˆ™ï¼Œæ­¤ç±»å†…å®¹éœ€è¦è¯´æ˜ç”Ÿæˆå¼AIçš„ä½¿ç”¨ã€‚",
  };

  const DECLARATIONS = [
    { value: "none", label: "æ— " },
    { value: "original", label: "å†…å®¹ä¸ºè‡ªä¸»åˆ›ä½œ" },
    { value: "repost", label: "å†…å®¹ä¸ºè½¬è½½" },
    { value: "ai", label: "å†…å®¹ç”±AIç”Ÿæˆ" },
    { value: "fiction", label: "å†…å®¹ä¸ºè™šæ„æ¼”ç»" },
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
      <div class="brandLockup"><span class="brandMark small">æ¾„</span><span><strong>æ¾„æ˜ç¤¾åŒº</strong><small>ç ”ç©¶æ¨¡æ‹Ÿå¹³å°</small></span></div>
      <input class="microSearch" aria-label="æ¨¡æ‹Ÿæœç´¢" value="æœç´¢æ¨¡æ‹Ÿå†…å®¹" readonly>
      <nav class="microNav" aria-label="é¡¶éƒ¨å¯¼èˆª"><a class="active" href="#experience">é¦–é¡µ</a><a href="#experience">çƒ­é—¨</a><a href="#experience">è§†é¢‘</a><a href="#experience">æ¶ˆæ¯</a></nav>
    </header>`;
  }

  function leftRail() {
    return `<aside class="leftRail" aria-label="æ¨¡æ‹Ÿé¢‘é“å¯¼èˆª">
      <h2>é¦–é¡µ</h2>
      <nav>
        <a class="active" href="#experience">â˜·&nbsp; å…¨éƒ¨å…³æ³¨</a>
        <a href="#feed">â—‰&nbsp; æœ€æ–°åŠ¨æ€</a>
        <a href="#feed">â™™&nbsp; ç‰¹åˆ«å…³æ³¨</a>
        <a href="#feed">â™™&nbsp; å¥½å‹åœˆ</a>
      </nav>
      <div class="railDivider"></div>
      <p class="railTitle">è‡ªå®šä¹‰åˆ†ç»„</p>
      <a class="secondaryLink" href="#feed">â€¢&nbsp; æ–°é—»èµ„è®¯</a>
      <a class="secondaryLink" href="#feed">â€¢&nbsp; ç”Ÿæ´»å¥åº·</a>
      <a class="secondaryLink" href="#feed">â€¢&nbsp; åŸå¸‚æ°”è±¡</a>
    </aside>`;
  }

  function rightRail() {
    const topics = [
      ["å¼€å­¦å­£ä¹¦å•", "267172"], ["åŸå¸‚å¤œè·‘è·¯çº¿", "61403"], ["å¼ºå¯¹æµå¤©æ°”æé†’", "48859"],
      ["å‘¨æœ«å±•è§ˆæ¨è", "62931"], ["ä½“æ£€æŠ¥å‘Šæ€ä¹ˆçœ‹", "82688"], ["å¤æ—¥é˜²æ™’è¯¯åŒº", "63965"],
      ["æ—§ç‰©æ”¹é€ çµæ„Ÿ", "66501"], ["é€šå‹¤æ’­å®¢æ¸…å•", "62965"], ["ç¤¾åŒºèŠ±å›­å¼€æ”¾", "343814"], ["æ–°ä¸Šæ˜ çºªå½•ç‰‡", "382032"],
    ];
    return `<aside class="rightRail">
      <section><div class="railSectionTitle"><h3>ç¤¾åŒºçƒ­æœ</h3><span>âŸ³ ç‚¹å‡»åˆ·æ–°</span></div>
      <div class="trendTabs"><span class="active">æˆ‘çš„</span><span>çƒ­æœ</span></div>
      <ol class="trendList">${topics.map((x, i) => `<li><b>${i + 1}</b><span>${x[0]}</span><small>${x[1]}</small></li>`).join("")}</ol></section>
      <section class="researchNotice"><strong>ç ”ç©¶ç¯å¢ƒæç¤º</strong>ä»¥ä¸Šé¢‘é“ã€çƒ­æœä¸äº’åŠ¨æ•°æ®å‡ä¸ºå›ºå®šæ¨¡æ‹Ÿå†…å®¹ï¼Œä¸ä»£è¡¨çœŸå®å¹³å°æˆ–çœŸå®ç”¨æˆ·ã€‚</section>
    </aside>`;
  }

  function composerCard() {
    const editorValue = state.published ? "" : escapeHtml(state.draft);
    return `<section class="composerCard" aria-label="å‘å¸ƒæ–°å¸–å­">
      <div class="composerPrompt">æœ‰ä»€ä¹ˆæ–°é²œäº‹æƒ³åˆ†äº«ç»™å¤§å®¶ï¼Ÿ</div>
      <div class="postEditorArea">
        <textarea id="postEditor" class="postEditor" aria-label="å¸–å­æ­£æ–‡" placeholder="æœ‰ä»€ä¹ˆæ–°é²œäº‹æƒ³åˆ†äº«ç»™å¤§å®¶ï¼Ÿ" ${state.published ? "readonly" : ""}>${editorValue}</textarea>
        <div class="declarationPicker">
          <button id="declarationTrigger" type="button" class="declarationTrigger ${state.declarationChoice !== "none" ? "hasSelection" : ""}" aria-haspopup="menu" aria-expanded="${state.menuOpen}">
            å†…å®¹å£°æ˜ <span aria-hidden="true">âŒ„</span>
          </button>
          ${state.menuOpen && !state.published ? declarationMenu() : ""}
        </div>
      </div>
      <div class="composerActions">
        <div class="composerTools" aria-label="æ¨¡æ‹Ÿå‘å¸–å·¥å…·"><span>â˜º è¡¨æƒ…</span><span>â–§ å›¾ç‰‡</span><span># è¯é¢˜</span><span>âš¡ å¤´æ¡æ–‡ç« </span><span>â€¢â€¢â€¢ æ›´å¤š</span></div>
        <button type="button" class="visibilityTrigger" aria-label="å¸–å­å¯è§èŒƒå›´ï¼šå…¬å¼€">â—· å…¬å¼€âŒ„</button>
        <button id="publish" class="primaryButton composerPublishButton" ${state.published ? "disabled" : ""}>å‘å¸ƒ</button>
      </div>
    </section>`;
  }

  function declarationMenu() {
    return `<div class="declarationMenu" role="menu" aria-label="å†…å®¹å£°æ˜é€‰é¡¹">
      <div class="declarationMenuHeader"><b>å†…å®¹å£°æ˜</b><span title="é€‰æ‹©ä¸æœ¬æ¬¡å†…å®¹ç›¸ç¬¦çš„å£°æ˜">?</span></div>
      <div class="declarationGrid">${DECLARATIONS.map((item) => `
        <button type="button" class="declarationOption" role="menuitemradio" aria-checked="${state.declarationChoice === item.value}" data-declaration="${item.value}">${item.label}</button>`).join("")}</div>
    </div>`;
  }

  function feed() {
    return `<section id="feed" class="ambientFeed" aria-label="ç¤¾åŒºå·²å‘å¸ƒåŠ¨æ€">
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
    return `<article class="feedCard participantPost" aria-label="ä½ åˆšå‘å¸ƒçš„å¸–å­">
      <div class="feedAuthor"><div class="avatar smallAvatar">å­¦</div><div><b>æ—¥å¸¸è®°å½•å‘˜</b><span>åˆšåˆš Â· æ¥è‡ªç½‘é¡µç«¯</span></div></div>
      ${removed
        ? `<div class="removedPost"><span aria-hidden="true">Ã—</span><h2>è¯¥å†…å®¹å·²è¢«ç§»é™¤</h2><p>å¸–å­å½“å‰ä¸åœ¨å…¬å¼€é¡µé¢å±•ç¤ºã€‚</p></div>`
        : `${disclosed ? `<span class="disclosureBadge">AIç”Ÿæˆæˆ–è¾…åŠ©</span>` : ""}<p class="postText">${escapeHtml(state.draft).replace(/\n/g, "<br>")}</p><div class="postActions"><span>è½¬å‘ 0</span><span>è¯„è®º 0</span><span>å–œæ¬¢ 0</span></div>`}
    </article>
    ${(removed || reminder) ? `${treatmentNotice(removed ? "removal" : "reminder")}${moderatorPanel()}` : ""}`;
  }

  function treatmentNotice(tyç¿t¶‰ËkºwµçffF"²F—7Æ“¢w&–C²Æ6RÖ—FV×3¢6VçFW#²v–GFƒ¢C‡ƒ²†V–v‡C¢C‡ƒ²fÆWƒ¢æöæS²&÷&FW"×&F—W3¢SS²6öÆ÷#¢6ffc²&6¶w&÷VæC¢Æ–æV"Öw&F–VçBƒCVFVrÂ6ffCSrÂ6fcsƒ“²föçB×6—¦S¢‡ƒ²föçB×vV–v‡C¢s²Ğ¢æÖ&–VçDfF"ç&÷6R²&6¶w&÷VæC¢Æ–æV"Öw&F–VçBƒCVFVrÂ6F#–#2Â6#cFcsR“²Ğ¢æÖ&–VçDfF"æ&ÇVR²&6¶w&÷VæC¢Æ–æV"Öw&F–VçBƒCVFVrÂ3c†VS‚Â3#3s6#r“²Ğ¢æÖ&–VçDWF†÷"²F—7Æ“¢fÆWƒ²Æ–vâÖ—FV×3¢6VçFW#²v¢Wƒ²Ğ¢çfW&–f–VD&FvRÂçfW&–f–VD–æÆ–æR²F—7Æ“¢–æÆ–æRÖw&–C²Æ6RÖ—FV×3¢6VçFW#²v–GFƒ¢wƒ²†V–v‡C¢wƒ²&÷&FW"×&F—W3¢SS²6öÆ÷#¢6ffb–×÷'FçC²&6¶w&÷VæC¢6fc6#SS²föçB×6—¦S¢‚–×÷'FçC²föçB×vV–v‡C¢s²Ğ¢çfW&–f–VD–æÆ–æR²v–GFƒ¢gƒ²†V–v‡C¢gƒ²Ğ¢æWF†÷$Ö&²²6öÆ÷#¢6c6ƒ–×÷'FçC²föçB×6—¦S¢G‚–×÷'FçC²Ğ¢ç÷7DÖVçR²Ö&v–âÖÆVgC¢WFó²Æ–vâ×6VÆc¢fÆW‚×7F'C²&÷&FW#¢²6öÆ÷#¢3sss²&6¶w&÷VæC¢G&ç7&VçC²föçB×6—¦S¢‡ƒ²Ğ¢ç÷7EFW‡B²Ö&v–ã¢cƒ²föçB×6—¦S¢gƒ²Æ–æRÖ†V–v‡C¢ãsS²v†—FR×76S¢æ÷&ÖÃ²Ğ¢æÖ&–VçEF÷–2²6öÆ÷#¢6c#fC#²Ğ¢æF—66Æ÷7W&T&FvR²F—7Æ“¢–æÆ–æRÖfÆWƒ²Ö&v–ã¢'‚cƒ²FF–æs¢W‚—ƒ²&÷&FW"×&F—W3¢““—ƒ²6öÆ÷#¢6cV²&6¶w&÷VæC¢f"‚ÒÖ÷&ævR×6ögB“²föçB×6—¦S¢'ƒ²föçB×vV–v‡C¢s²Ğ¢ç÷7D7F–öç2²F—7Æ“¢fÆWƒ²§W7F–g’Ö6öçFVçC¢76RÖ&÷VæC²Ö&v–ã¢#G‚Ó#G‚²FF–æs¢G‚'ƒ²&÷&FW"×F÷¢‚6öÆ–Bf"‚ÒÖÆ–æR“²6öÆ÷#¢3ƒƒƒ²föçB×6—¦S¢7ƒ²Ğ¢æÖ&–VçDÖVF–²÷6—F–öã¢&VÆF—fS²F—7Æ“¢w&–C²Æ–vâÖ6öçFVçC¢6VçFW#²§W7F–g’Ö—FV×3¢6VçFW#²v¢‡ƒ²†V–v‡C¢#CWƒ²Ö&v–ã¢G‚cƒ²FF–æs¢#'ƒ²÷fW&fÆ÷s¢†–FFVã²&÷&FW"×&F—W3¢‡ƒ²6öÆ÷#¢6ffc²FW‡BÖÆ–vã¢6VçFW#²Ğ¢æÖ&–VçDÖVF–£¦&Vf÷&R²6öçFVçC¢"#²÷6—F–öã¢'6öÇWFS²–ç6WC¢²&6¶w&÷VæC¢Æ–æV"Öw&F–VçB‡G&ç7&VçB3RRÂ&v&ƒÃÃÂãc"’“²Ğ¢æÖ&–VçDÖVF–â¢²÷6—F–öã¢&VÆF—fS²¢Ö–æFWƒ¢²Ğ¢æÖ&–VçDÖVF–â"²Ö‚×v–GFƒ¢Cƒ²föçB×6—¦S¢#Gƒ²Æ–æRÖ†V–v‡C¢ã3S²Ğ¢ç66–VçF—7DÖVF–²&6¶w&÷VæC¢&F–ÂÖw&F–VçB†6—&6ÆRBSR3‚RÂ66“ƒR"RÂG&ç7&VçB2R’ÂÆ–æV"Öw&F–VçBƒ“FVrÂG&ç7&VçB3bRÂ33“C#Cr3rRc2RÂG&ç7&VçBcBR’ÂÆ–æV"Öw&F–VçBƒ3VFVrÂ3S#&RÂ3V#Cc3rS"RÂ3C’“²Ğ¢æ†VDÖVF–²†V–v‡C¢#Wƒ²Ö&v–âÖÆVgC¢²&6¶w&÷VæC¢&F–ÂÖw&F–VçB†6—&6ÆRBs"R#"RÂ6ffcbrRÂG&ç7&VçB‚R’ÂÆ–æV"Öw&F–VçBƒFVrÂ3VC“6B#‚RÂG&ç7&VçB#’R’ÂÆ–æV"Öw&F–VçBƒSVFVrÂ3s&FCÂ6S&3v2c"RÂ3†F“V"“²Ğ¢æÖVF–¶–6¶W"²FF–æs¢G‚—ƒ²&÷&FW#¢‚6öÆ–B&v&ƒ#SRÃ#SRÃ#SRÂãc"“²&÷&FW"×&F—W3¢““—ƒ²föçB×6—¦S¢'ƒ²Ğ¢æÖVF–Æ’²F—7Æ“¢w&–C²Æ6RÖ—FV×3¢6VçFW#²v–GFƒ¢C‡ƒ²†V–v‡C¢C‡ƒ²FF–ærÖÆVgC¢7ƒ²&÷&FW"×&F—W3¢SS²6öÆ÷#¢f"‚ÒÖ÷&ævR“²&6¶w&÷VæC¢&v&ƒ#SRÃ#SRÃ#SRÂãƒR“²föçB×6—¦S¢—ƒ²Ğ¢æÖVF–ÖWF²÷6—F–öã¢'6öÇWFR–×÷'FçC²&–v‡C¢Gƒ²&÷GFöÓ¢ƒ²ÆVgC¢Gƒ²F—7Æ“¢fÆWƒ²§W7F–g’Ö6öçFVçC¢76RÖ&WGvVVã²6öÆ÷#¢6ffc²föçB×6—¦S¢'ƒ²Ğ¢æÖ&–VçEöÆÂ²F—7Æ“¢w&–C²v¢ƒ²Ö&v–ã¢G‚cƒ²FF–æs¢g‚‡‚'ƒ²&÷&FW"×&F—W3¢wƒ²&6¶w&÷VæC¢6cvcvcƒ²Ğ¢æÖ&–VçEöÆÂ²Ö&v–ã¢'ƒ²6öÆ÷#¢3SSS²Ğ¢æÖ&–VçEöÆÂ'WGFöâ²Ö–âÖ†V–v‡C¢Cƒ²&÷&FW#¢‚6öÆ–B6SFSFSc²&÷&FW"×&F—W3¢Wƒ²6öÆ÷#¢3SSS²&6¶w&÷VæC¢6ffc²7W'6÷#¢FVfVÇC²Ğ¢æÖ&–VçEöÆÂ6ÖÆÂ²6öÆ÷#¢3“““²Ğ¢çV÷FVE÷7B²Ö&v–ã¢G‚cƒ²FF–æs¢Wƒ²&÷&FW"×&F—W3¢wƒ²&6¶w&÷VæC¢6cvcvcƒ²Ğ¢çV÷FVE÷7Bâ"²F—7Æ“¢fÆWƒ²Æ–vâÖ—FV×3¢6VçFW#²v¢Wƒ²Ğ¢çV÷FVE÷7Bâ²Ö&v–ã¢‡‚²6öÆ÷#¢3SSS²Æ–æRÖ†V–v‡C¢ãcS²Ğ ¢ç&VÖ÷fVE÷7B²F—7Æ“¢w&–C²Æ6RÖ—FV×3¢6VçFW#²Æ–vâÖ6öçFVçC¢6VçFW#²Ö–âÖ†V–v‡C¢#cƒ²Ö&v–ã¢#‚cƒ²FF–æs¢3gƒ²&÷&FW#¢‚F6†VB63–3F&C²&÷&FW"×&F—W3¢‡ƒ²&6¶w&÷VæC¢6cFc&Vc²FW‡BÖÆ–vã¢6VçFW#²Ğ¢ç&VÖ÷fVE÷7Bâ7â²F—7Æ“¢w&–C²Æ6RÖ—FV×3¢6VçFW#²v–GFƒ¢Sgƒ²†V–v‡C¢Sgƒ²&÷&FW"×&F—W3¢SS²6öÆ÷#¢f"‚ÒÖFævW"“²&6¶w&÷VæC¢f"‚ÒÖFævW"×6ögB“²föçB×6—¦S¢3Gƒ²Ğ¢ç&VÖ÷fVE÷7Bƒ"²Ö&v–ã¢g‚²föçB×6—¦S¢#'ƒ²Ğ¢ç&VÖ÷fVE÷7B²Ö&v–ã¢‡‚²6öÆ÷#¢3ƒƒƒ²Ğ¢ç7FGW46&B²FF–æs¢#‚#Gƒ²Ğ¢ææ÷F–6T†VF–ær²F—7Æ“¢fÆWƒ²Æ–vâÖ—FV×3¢6VçFW#²v¢7ƒ²Ğ¢ææ÷F–6T†VF–æræW–V'&÷r²Ö&v–ã¢²Ğ¢ææ÷F–6T†VF–ærƒ"²Ö&v–ã¢'‚²föçB×6—¦S¢#ƒ²Ğ¢ç7FGW4–6öâ²F—7Æ“¢w&–C²Æ6RÖ—FV×3¢6VçFW#²v–GFƒ¢CGƒ²†V–v‡C¢CGƒ²fÆWƒ¢æöæS²&÷&FW"×&F—W3¢SS²föçB×6—¦S¢#Gƒ²föçB×vV–v‡C¢“²Ğ¢ç7FGW4–6öâçv&æ–ær²6öÆ÷#¢f"‚ÒÖ÷&ævR“²&6¶w&÷VæC¢f"‚ÒÖ÷&ævR×6ögB“²Ğ¢ç7FGW4–6öâæFævW"²6öÆ÷#¢f"‚ÒÖFævW"“²&6¶w&÷VæC¢f"‚ÒÖFævW"×6ögB“²Ğ¢ç'VÆUFW‡B²Ö&v–ã¢w‚²FF–ær×F÷¢Wƒ²&÷&FW"×F÷¢‚6öÆ–Bf"‚ÒÖÆ–æR“²6öÆ÷#¢3SSS²föçB×6—¦S¢Gƒ²Æ–æRÖ†V–v‡C¢ãs²Ğ¢æ6öç6WVVæ6T&÷‚²Ö&v–ã¢G‚²FF–æs¢7‚Gƒ²&÷&FW"ÖÆVgC¢G‚6öÆ–Bf"‚ÒÖ÷&ævR“²6öÆ÷#¢36#CƒC#²&6¶w&÷VæC¢6ffc†c²föçB×6—¦S¢7ƒ²Æ–æRÖ†V–v‡C¢ãcS²Ğ¢æÖöFW&F÷$6&B²Ö&v–â×F÷¢²Ğ¢æ7&VF÷%7FGW4†VF–ær²F—7Æ“¢fÆWƒ²Æ–vâÖ—FV×3¢6VçFW#²v¢7ƒ²Ğ¢æ7&VF÷%7FGW4†VF–ærƒ"ÂæfVVF&6µæVÅ&÷rƒ"²Ö&v–ã¢7‚²föçB×6—¦S¢—ƒ²Ğ¢æ7&VF÷$fF"²F—7Æ“¢w&–C²Æ6RÖ—FV×3¢6VçFW#²v–GFƒ¢CGƒ²†V–v‡C¢CGƒ²fÆWƒ¢æöæS²&÷&FW"×&F—W3¢SS²6öÆ÷#¢6ffc²&6¶w&÷VæC¢Æ–æV"Öw&F–VçBƒCVFVrÂ6ffCSrÂ6fcsƒ“²föçB×vV–v‡C¢s²Ğ¢çVÆ—G”7&VF÷$&FvR²F—7Æ“¢–æÆ–æRÖfÆWƒ²Æ–vâÖ—FV×3¢6VçFW#²Ö–âÖ†V–v‡C¢#Wƒ²Ö&v–âÖÆVgC¢wƒ²FF–æs¢7‚—ƒ²&÷&FW#¢‚6öÆ–B6c#ƒs²&÷&FW"×&F—W3¢““—ƒ²6öÆ÷#¢6ƒV#²&6¶w&÷VæC¢6ffcFSS²föçB×6—¦S¢'ƒ²fW'F–6ÂÖÆ–vã¢Ö–FFÆS²Ğ¢æÖöFW&F÷%FW‡B²Ö&v–ã¢W‚²FF–ær×F÷¢Gƒ²&÷&FW"×F÷¢‚6öÆ–Bf"‚ÒÖÆ–æR“²6öÆ÷#¢3ccc²föçB×6—¦S¢Gƒ²Æ–æRÖ†V–v‡C¢ãs²Ğ¢æfVVF&6µæVÅ&÷r²F—7Æ“¢fÆWƒ²Æ–vâÖ—FV×3¢6VçFW#²§W7F–g’Ö6öçFVçC¢76RÖ&WGvVVã²v¢‡ƒ²Ğ¢ç6V6öæF'”'WGFöâ²Ö–âÖ†V–v‡C¢3‡ƒ²FF–æs¢‡‚wƒ²&÷&FW#¢‚6öÆ–Bf"‚ÒÖ÷&ævR“²&÷&FW"×&F—W3¢#ƒ²6öÆ÷#¢f"‚ÒÖ÷&ævRÖF&²“²&6¶w&÷VæC¢6ffc²föçB×vV–v‡C¢s²Ğ¢ç6V6öæF'”'WGFöã¦†÷fW"²&6¶w&÷VæC¢f"‚ÒÖ÷&ævR×6ögB“²Ğ¢æfVVF&6´6öæf—&ÖF–öâ²Ö&v–ã¢W‚²FF–ær×F÷¢Gƒ²&÷&FW"×F÷¢‚6öÆ–Bf"‚ÒÖÆ–æR“²6öÆ÷#¢3FSscVS²föçB×6—¦S¢Gƒ²Ğ¢æfVVF&6´F–Æör²÷6—F–öã¢f—†VC²¢Ö–æFWƒ¢²–ç6WC¢²F—7Æ“¢w&–C²Æ6RÖ—FV×3¢6VçFW#²FF–æs¢#ƒ²&6¶w&÷VæC¢&v&ƒÂÂÂãC"“²Ğ¢æfVVF&6´F–ÆöuæVÂ²v–GFƒ¢Ö–âƒS#‚ÂR“²FF–æs¢#Gƒ²&÷&FW"×&F—W3¢‡ƒ²&6¶w&÷VæC¢6ffc²&÷‚×6†F÷s¢‡‚c‚&v&ƒÂÂÂã#B“²Ğ¢æfVVF&6´F–ÆöuæVÂƒ"²Ö&v–ã¢²föçB×6—¦S¢#ƒ²Ğ¢æfVVF&6´F–ÆöuæVÂ²Ö&v–ã¢‚7ƒ²6öÆ÷#¢3ccc²föçB×6—¦S¢Gƒ²Æ–æRÖ†V–v‡C¢ãcS²Ğ¢æfVVF&6´F–ÆöuæVÂFW‡F&V²F—7Æ“¢&Æö6³²v–GFƒ¢S²Ö–âÖ†V–v‡C¢3ƒ²FF–æs¢'ƒ²&W6—¦S¢fW'F–6Ã²&÷&FW#¢‚6öÆ–B6CfCfCc²&÷&FW"×&F—W3¢Wƒ²Æ–æRÖ†V–v‡C¢ãc²Ğ¢æfVVF&6´F–Æöt7F–öç2²F—7Æ“¢fÆWƒ²§W7F–g’Ö6öçFVçC¢fÆW‚ÖVæC²v¢ƒ²Ö&v–â×F÷¢Wƒ²Ğ¢æfVVF&6´F–Æöt7F–öç2ç&–Ö'”'WGFöâ²Ö–âÖ†V–v‡C¢3‡ƒ²Ö&v–ã¢²FF–æs¢‡‚—ƒ²&÷&FW"×&F—W3¢#ƒ²Ğ¢çFW‡D'WGFöâ²Ö–âÖ†V–v‡C¢3‡ƒ²FF–æs¢‡‚wƒ²&÷&FW#¢²6öÆ÷#¢3ccc²&6¶w&÷VæC¢G&ç7&VçC²Ğ¢çFW‡D'WGFöã¦†÷fW"²&6¶w&÷VæC¢6cVcVcS²Ğ¢æfVVE&WGW&å&÷r²FF–æs¢g‚#ƒ²FW‡BÖÆ–vã¢&–v‡C²Ğ¢æfVVE&WGW&å&÷rç&WGW&ä'WGFöâ²Ö&v–ã¢²Ğ¢æfVVE&WGW&å&÷r²Ö&v–ã¢‡‚²6öÆ÷#¢3“““²föçB×6—¦S¢'ƒ²Ğ¢æfVVE&WGW&å&÷r7G&öær²6öÆ÷#¢3SSS²föçBÖfÖ–Ç“¢6öç6öÆ2ÂÖöæ÷76S²Ğ ¢æÆæF–æu6†VÆÂ²F—7Æ“¢w&–C²Æ6RÖ—FV×3¢6VçFW#²Ö–âÖ†V–v‡C¢fƒ²FF–æs¢#Gƒ²&6¶w&÷VæC¢Æ–æV"Öw&F–VçB‡&v&ƒ#SRÃ3ÃÂã‚’ÂG&ç7&VçBƒ‚’Âf"‚ÒÖ6çf2“²Ğ¢æÆæF–æt6&B²v–GFƒ¢Ö–âƒsƒ‚ÂR“²FF–æs¢S'ƒ²&÷&FW#¢‚6öÆ–B6SVSVSS²&÷&FW"×F÷¢7‚6öÆ–Bf"‚ÒÖ÷&ævR“²&÷&FW"×&F—W3¢Wƒ²&6¶w&÷VæC¢6ffc²FW‡BÖÆ–vã¢6VçFW#²Ğ¢æÆæF–æt6&Bæ'&æDÖ&²²Ö&v–ã¢WFò#'ƒ²Ğ¢æÆæF–ætÆVB²Ö&v–ã¢g‚WFò#‡ƒ²Ğ¢æ–æfôw&–B²F—7Æ“¢w&–C²w&–B×FV×ÆFRÖ6öÇVÖç3¢&WVBƒ2Âg"“²Ö&v–ã¢#‡‚²&÷&FW"×F÷¢‚6öÆ–Bf"‚ÒÖÆ–æR“²&÷&FW"Ö&÷GFöÓ¢‚6öÆ–Bf"‚ÒÖÆ–æR“²FW‡BÖÆ–vã¢ÆVgC²Ğ¢æ–æfôw&–BF—b²F—7Æ“¢w&–C²v¢‡ƒ²FF–æs¢‡ƒ²Ğ¢æ–æfôw&–BF—b²F—b²&÷&FW"ÖÆVgC¢‚6öÆ–Bf"‚ÒÖÆ–æR“²Ğ¢æ–æfôw&–B"²6öÆ÷#¢f"‚ÒÖ÷&ævRÖF&²“²Ğ¢æ–æfôw&–B7â²6öÆ÷#¢3sss²föçB×6—¦S¢7ƒ²Æ–æRÖ†V–v‡C¢ãc²Ğ¢æ6†V6µ&÷r²F—7Æ“¢fÆWƒ²Æ–vâÖ—FV×3¢fÆW‚×7F'C²v¢'ƒ²FF–æs¢gƒ²&÷&FW"×&F—W3¢Gƒ²&6¶w&÷VæC¢6cfcvc3²FW‡BÖÆ–vã¢ÆVgC²Æ–æRÖ†V–v‡C¢ãc²Ğ¢æ6†V6µ&÷r–çWB²v–GFƒ¢‡ƒ²†V–v‡C¢‡ƒ²fÆWƒ¢æöæS²Ö&v–â×F÷¢7ƒ²66VçBÖ6öÆ÷#¢f"‚ÒÖ÷&ævR“²Ğ¢ç&÷WFTW'&÷"²v–GFƒ¢Ö–âƒc#‚Â6Æ2ƒRÒ3'‚’“²Ö&v–ã¢‡f‚WFó²FF–æs¢C'ƒ²&÷&FW"×F÷¢7‚6öÆ–Bf"‚ÒÖ÷&ævR“²&6¶w&÷VæC¢6ffc²FW‡BÖÆ–vã¢6VçFW#²Ğ ¤ÖVF–†Ö‚×v–GFƒ¢ƒ‚’°¢æÖ–7&ö&Æötg&ÖR²w&–B×FV×ÆFRÖ6öÇVÖç3¢##‡‚Ö–æÖ‚ƒÂƒ‚“²Ö‚×v–GFƒ¢Cƒ²FF–æs¢ƒ²Ğ¢ç&–v‡E&–Â²F—7Æ“¢æöæS²Ğ§Ğ¤ÖVF–†Ö‚×v–GFƒ¢“c‚’°¢æÖ–7&ö&Æötg&ÖR²F—7Æ“¢&Æö6³²v–GFƒ¢S²Ö‚×v–GFƒ¢ƒƒ²Ö&v–ã¢‚WFó²FF–æs¢ƒ²Ğ¢æÆVgE&–Â²F—7Æ“¢æöæS²Ğ¢æÖ–ä6öÇVÖâ²v–GFƒ¢S²Ğ§Ğ¤ÖVF–†Ö‚×v–GFƒ¢s#‚’°¢çF÷&"²†V–v‡C¢cƒ²FF–æs¢'ƒ²v¢ƒ²Ğ¢æ'&æDÆö6·W²Ö–â×v–GFƒ¢²Ğ¢æ'&æDÆö6·W6ÖÆÂ²F—7Æ“¢æöæS²Ğ¢æÖ–7&ôæb²†V–v‡C¢S‡ƒ²v¢²Ğ¢æÖ–7&ôæb²Ö–â×v–GFƒ¢C‡ƒ²†V–v‡C¢S‡ƒ²Ğ¢æÖ–7&õ6V&6‚²F—7Æ“¢æöæS²Ğ¢æ6ö×÷6W$6&B²FF–æs¢Gƒ²Ğ¢ç÷7DVF—F÷"²†V–v‡C¢c‡ƒ²FF–æs¢'‚'‚C'ƒ²Ğ¢æ6ö×÷6W%FööÇ2²v¢Wƒ²Ğ¢æ6ö×÷6W%FööÇ27ã¦çF‚Ö6†–ÆB†â³B’²F—7Æ“¢æöæS²Ğ¢æfVVD6&B²FF–æs¢w‚g‚²Ğ¢ç÷7EFW‡BÂæF—66Æ÷7W&T&FvR²Ö&v–âÖÆVgC¢²Ğ¢ç÷7D7F–öç2²Ö&v–â×&–v‡C¢Ógƒ²Ö&v–âÖÆVgC¢Ógƒ²Ğ¢æÖ&–VçDÖVF–ÂæÖ&–VçEöÆÂÂçV÷FVE÷7BÂç&VÖ÷fVE÷7B²Ö&v–âÖÆVgC¢²Ğ¢æÖ&–VçDÖVF–²†V–v‡C¢“ƒ²Ğ¢æ†VDÖVF–²†V–v‡C¢sWƒ²Ğ¢æfVVE&WGW&å&÷r²FF–ærÖ–æÆ–æS¢'ƒ²Ğ¢çVÆ—G”7&VF÷$&FvR²F—7Æ“¢fÆWƒ²v–GFƒ¢f—BÖ6öçFVçC²Ö&v–ã¢w‚²Ğ¢æÆæF–æt6&B²FF–æs¢3'‚#'ƒ²Ğ¢æ–æfôw&–B²w&–B×FV×ÆFRÖ6öÇVÖç3¢g#²Ğ¢æ–æfôw&–BF—b²F—b²&÷&FW"×F÷¢‚6öÆ–Bf"‚ÒÖÆ–æR“²&÷&FW"ÖÆVgC¢²Ğ§Ğ¤ÖVF–†Ö‚×v–GFƒ¢S#‚’°¢æ'&æDÆö6·W7G&öær²föçB×6—¦S¢Wƒ²Ğ¢æÖ–7&ôæb²F—7Æ“¢æöæS²Ğ¢æ6ö×÷6W%FööÇ27ã¦çF‚Ö6†–ÆB†â³"’²F—7Æ“¢æöæS²Ğ¢æ6ö×÷6W$7F–öç2²v¢wƒ²Ğ¢æFV6Æ&F–öäÖVçR²÷6—F–öã¢f—†VC²F÷¢ƒgƒ²&–v‡C¢'ƒ²ÆVgC¢'ƒ²v–GFƒ¢WFó²Ğ¢æFV6Æ&F–öäÖVçS£¦gFW"²F—7Æ“¢æöæS²Ğ¢æFV6Æ&F–öäw&–B²w&–B×FV×ÆFRÖ6öÇVÖç3¢g#²Ğ¢çf—6–&–Æ—G•G&–vvW"²föçB×6—¦S¢7ƒ²Ğ¢æ6ö×÷6W%V&Æ—6„'WGFöâ²Ö–â×v–GFƒ¢s'ƒ²FF–ærÖ–æÆ–æS¢wƒ²Ğ§Ğ¤ÖVF–‡&VfW'2×&VGV6VBÖÖ÷F–öã¢&VGV6R’°¢‡FÖÂ²67&öÆÂÖ&V†f–÷#¢WFó²Ğ¢¢Â££¦&Vf÷&RÂ££¦gFW"²G&ç6—F–öã¢æöæR–×÷'FçC²Ğ§Ğ 