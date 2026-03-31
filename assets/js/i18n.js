(function () {
  const STORAGE_LANG_KEY = "sg_site_language";
  const STORAGE_CACHE_KEY = "sg_site_translation_cache_v2";
  const SUPPORTED_LANGUAGES = ["en", "zh-CN"];
  const TRANSLATION_ENDPOINT =
    window.TRANSLATION_ENDPOINT || "https://translate.argosopentech.com/translate";
  const ATTRIBUTE_NAMES = ["placeholder", "aria-label", "title", "content"];
  const ATTR_SELECTOR =
    "[placeholder],[aria-label],[title],meta[name='description']";

  const languageSelect = document.querySelector("#language-switch");
  if (!languageSelect) {
    return;
  }

  const textOriginalMap = new WeakMap();
  const attrOriginalMap = new WeakMap();
  const pendingMap = new Map();
  let warnedUnavailable = false;
  const MANUAL_TRANSLATIONS = [
    ["Personal website for sharing projects, writing, and contact information.", "用于分享项目、写作与联系方式的个人网站。"],
    ["Simon Guo | Personal Website", "Simon Guo | 个人网站"],
    ["Menu", "菜单"],
    ["Home", "首页"],
    ["About", "关于"],
    ["Projects", "项目"],
    ["Blog", "博客"],
    ["Contact", "联系"],
    ["Building thoughtful software and sharing what I learn along the way.", "持续构建有价值的软件，并分享一路上的学习与思考。"],
    ["Software engineer focused on practical systems, clean implementation, and steady iteration from idea to delivery.", "软件工程师，专注于实用系统、清晰实现，以及从想法到交付的稳定迭代。"],
    ["View Projects", "查看项目"],
    ["View Blog", "查看博客"],
    ["Background, technical interests, and how I approach engineering work.", "我的背景、技术兴趣，以及我如何开展工程实践。"],
    ["Read more", "继续阅读"],
    ["Selected work with context, technical scope, and implementation details.", "展示精选工作，包含背景、技术范围与实现细节。"],
    ["Explore projects", "浏览项目"],
    ["Small thought cards for notes on ideas, learnings, and experiments.", "以卡片形式记录想法、学习收获与实验过程。"],
    ["Read blog cards", "阅读博客卡片"],
    ["Reach out for collaboration, project discussion, or technical exchange.", "欢迎联系我进行合作、项目讨论或技术交流。"],
    ["Get in touch", "联系我"],
    ["Simon Guo. Built with HTML, CSS, and JavaScript.", "Simon Guo。使用 HTML、CSS 与 JavaScript 构建。"],
    ["Learn more about Simon Guo.", "了解更多关于 Simon Guo 的信息。"],
    ["About | Simon Guo", "关于 | Simon Guo"],
    ["Who I Am", "我是谁"],
    ["Engineer with a product-minded approach to building reliable and user-focused software.", "我是一名工程师，采用产品思维构建可靠且以用户为中心的软件。"],
    ["Current Focus", "当前关注"],
    ["Product engineering, AI-enabled workflows, and applied automation.", "产品工程、AI 增强工作流与自动化落地。"],
    ["Core Skills", "核心技能"],
    ["JavaScript/TypeScript, frontend systems, backend APIs, and DevOps.", "JavaScript/TypeScript、前端系统、后端 API 与 DevOps。"],
    ["Outside Work", "工作之外"],
    ["Writing, continuous learning, and long-form technical side projects.", "写作、持续学习，以及长期技术 side project。"],
    ["Projects by Simon Guo.", "Simon Guo 的项目页。"],
    ["Projects | Simon Guo", "项目 | Simon Guo"],
    ["Selected Work", "精选工作"],
    ["Highlights of recent work, including impact, stack, and deliverables.", "近期工作的亮点，包括影响、技术栈与交付成果。"],
    ["Personal Website", "个人网站"],
    ["Designed and built a responsive multi-page personal website hosted on GitHub Pages, with reusable components and automated deployment.", "设计并实现了部署在 GitHub Pages 上的响应式多页面个人网站，具备可复用组件与自动化部署流程。"],
    ["Repo", "仓库"],
    ["Coming Soon", "即将更新"],
    ["Project Slot 2", "项目位 2"],
    ["Reserved for a future featured project.", "预留给未来的重点项目。"],
    ["In Progress", "进行中"],
    ["Project Slot 3", "项目位 3"],
    ["Contact Simon Guo.", "联系 Simon Guo。"],
    ["Contact | Simon Guo", "联系 | Simon Guo"],
    ["Let’s Build Something Useful", "一起做点有价值的事情"],
    ["I am always open to discussing software development opportunities, technical collaboration, and creative side projects.", "我始终欢迎围绕软件开发机会、技术协作与创意 side project 的交流。"],
    ["Email", "邮箱"],
    ["GitHub", "GitHub"],
    ["LinkedIn", "LinkedIn"],
    ["Short blog cards by Simon Guo.", "Simon Guo 的短博客卡片。"],
    ["Blog | Simon Guo", "博客 | Simon Guo"],
    ["Thought Cards", "想法卡片"],
    ["Blog cards are managed from this repository and automatically rendered here. Add content via the repo workflow, then commit and deploy.", "博客卡片由仓库管理，并自动渲染到这里。通过仓库流程添加内容后，提交并部署即可。"],
    ["Blog cards are managed from this repository and automatically rendered here.", "博客卡片由仓库管理，并自动渲染到这里。"],
    ["Latest Notes", "最新笔记"],
    ["This page shows short notes and updates from ongoing work, learnings, and experiments.", "此页面展示来自持续工作、学习与实验的简短笔记与更新。"],
    ["Cards", "卡片"],
    ["No cards available yet.", "暂时还没有卡片内容。"],
    ["Contact Me", "联系我"],
    ["View Resume", "查看简历"],
  ];

  const currentLanguage = getInitialLanguage();
  languageSelect.value = currentLanguage;

  languageSelect.addEventListener("change", async () => {
    const nextLanguage = languageSelect.value;
    localStorage.setItem(STORAGE_LANG_KEY, nextLanguage);
    setLanguageInUrl(nextLanguage);
    await applyLanguage(nextLanguage);
  });

  window.__applySiteLanguage = () => applyLanguage(languageSelect.value);
  applyLanguage(currentLanguage);

  function getInitialLanguage() {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("lang");
    if (fromUrl && SUPPORTED_LANGUAGES.includes(fromUrl)) {
      localStorage.setItem(STORAGE_LANG_KEY, fromUrl);
      return fromUrl;
    }

    const fromStorage = localStorage.getItem(STORAGE_LANG_KEY);
    if (fromStorage && SUPPORTED_LANGUAGES.includes(fromStorage)) {
      return fromStorage;
    }

    const browserLanguage = (navigator.language || "en").toLowerCase();
    if (browserLanguage.startsWith("zh")) {
      return "zh-CN";
    }
    return "en";
  }

  function setLanguageInUrl(language) {
    const url = new URL(window.location.href);
    if (language === "en") {
      url.searchParams.delete("lang");
    } else {
      url.searchParams.set("lang", language);
    }
    window.history.replaceState({}, "", url.toString());
  }

  async function applyLanguage(targetLanguage) {
    document.documentElement.lang = targetLanguage;

    const textTargets = collectTextNodeTargets();
    const attrTargets = collectAttributeTargets();
    const allTargets = [...textTargets, ...attrTargets];

    for (const target of allTargets) {
      const sourceLanguage = getSourceLanguage(target.node);
      if (!SUPPORTED_LANGUAGES.includes(sourceLanguage)) {
        continue;
      }

      const original = getOriginal(target);
      if (target.type === "text") {
        const parts = splitTextParts(original);
        if (!parts.core || isProbablyNonTranslatable(parts.core)) {
          continue;
        }

        if (sourceLanguage === targetLanguage) {
          applyValue(target, parts.core);
          continue;
        }

        const translated = await translateText(parts.core, sourceLanguage, targetLanguage);
        applyValue(target, translated || parts.core);
        continue;
      }

      if (!original || isProbablyNonTranslatable(original)) {
        continue;
      }

      if (sourceLanguage === targetLanguage) {
        applyValue(target, original);
        continue;
      }

      const translated = await translateText(original, sourceLanguage, targetLanguage);
      applyValue(target, translated || original);
    }
  }

  function collectTextNodeTargets() {
    const targets = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let current = walker.nextNode();

    while (current) {
      const parent = current.parentElement;
      if (
        parent &&
        !parent.closest("[data-no-translate]") &&
        parent.tagName !== "SCRIPT" &&
        parent.tagName !== "STYLE" &&
        parent.tagName !== "NOSCRIPT" &&
        parent.tagName !== "TEMPLATE" &&
        !parent.isContentEditable
      ) {
        targets.push({
          type: "text",
          node: current,
          key: "text",
        });
      }
      current = walker.nextNode();
    }

    const titleNode = document.querySelector("title");
    if (titleNode) {
      targets.push({
        type: "title",
        node: titleNode,
        key: "title",
      });
    }

    return targets;
  }

  function collectAttributeTargets() {
    return Array.from(document.querySelectorAll(ATTR_SELECTOR))
      .filter((node) => !node.closest("[data-no-translate]"))
      .flatMap((node) =>
        ATTRIBUTE_NAMES.filter((attributeName) => node.hasAttribute(attributeName)).map(
          (attributeName) => ({
            type: "attribute",
            node,
            key: attributeName,
          })
        )
      );
  }

  function getSourceLanguage(node) {
    const sourceElement = node instanceof Element ? node : node.parentElement;
    const closest = sourceElement ? sourceElement.closest("[data-source-lang]") : null;
    const declared =
      (closest && closest.getAttribute("data-source-lang")) ||
      document.documentElement.getAttribute("data-source-lang") ||
      "en";
    return normalizeLanguage(declared);
  }

  function getOriginal(target) {
    if (target.type === "text") {
      const node = target.node;
      const original = textOriginalMap.get(node);
      if (typeof original === "string") {
        return original;
      }
      const current = node.textContent || "";
      textOriginalMap.set(node, current);
      return current;
    }

    const node = target.node;
    const key = target.key;
    const current = readValue(target);
    const existing = attrOriginalMap.get(node) || {};
    if (typeof existing[key] === "string") {
      return existing[key];
    }

    existing[key] = current;
    attrOriginalMap.set(node, existing);
    return current;
  }

  function readValue(target) {
    if (target.type === "text") {
      return target.node.textContent || "";
    }
    if (target.type === "title") {
      return target.node.textContent || "";
    }
    if (target.key === "content") {
      return target.node.getAttribute("content") || "";
    }
    return target.node.getAttribute(target.key) || "";
  }

  function applyValue(target, translated) {
    if (target.type === "text") {
      const original = getOriginal(target);
      const parts = splitTextParts(original);
      target.node.textContent = `${parts.leading}${translated}${parts.trailing}`;
      return;
    }

    if (target.type === "title") {
      target.node.textContent = translated;
      return;
    }

    if (target.key === "content") {
      target.node.setAttribute("content", translated);
      return;
    }

    target.node.setAttribute(target.key, translated);
  }

  function normalizeLanguage(value) {
    const lower = String(value || "en").toLowerCase();
    if (lower.startsWith("zh")) {
      return "zh-CN";
    }
    return "en";
  }

  function isProbablyNonTranslatable(value) {
    const trimmed = value.trim();
    if (!trimmed) {
      return true;
    }

    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("./") ||
      trimmed.startsWith("../") ||
      trimmed.includes("@") ||
      /^[\d\s/:\-.]+$/.test(trimmed)
    ) {
      return true;
    }

    return false;
  }

  function splitTextParts(value) {
    const match = String(value || "").match(/^(\s*)([\s\S]*?)(\s*)$/);
    if (!match) {
      return { leading: "", core: String(value || ""), trailing: "" };
    }
    return {
      leading: match[1],
      core: match[2],
      trailing: match[3],
    };
  }

  async function translateText(text, sourceLanguage, targetLanguage) {
    const normalizedSource = normalizeLanguage(sourceLanguage);
    const normalizedTarget = normalizeLanguage(targetLanguage);
    if (normalizedSource === normalizedTarget) {
      return text;
    }

    const manual = lookupManualTranslation(text, normalizedSource, normalizedTarget);
    if (manual) {
      return manual;
    }

    const cache = loadCache();
    const cacheKey = `${normalizedSource}::${normalizedTarget}::${text}`;
    if (cache[cacheKey]) {
      return cache[cacheKey];
    }

    const pendingKey = cacheKey;
    if (pendingMap.has(pendingKey)) {
      return pendingMap.get(pendingKey);
    }

    const pending = doTranslate(text, normalizedSource, normalizedTarget)
      .then((translated) => {
        cache[cacheKey] = translated;
        saveCache(cache);
        pendingMap.delete(pendingKey);
        return translated;
      })
      .catch(() => {
        pendingMap.delete(pendingKey);
        return text;
      });

    pendingMap.set(pendingKey, pending);
    return pending;
  }

  async function doTranslate(text, sourceLanguage, targetLanguage) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    try {
      const response = await fetch(TRANSLATION_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: text,
          source: toApiLanguage(sourceLanguage),
          target: toApiLanguage(targetLanguage),
          format: "text",
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        return fallbackWhenUnavailable(text);
      }

      const data = await response.json();
      const translated = String(data.translatedText || "").trim();
      return translated || text;
    } catch (_error) {
      return fallbackWhenUnavailable(text);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  function toApiLanguage(language) {
    if (language === "zh-CN") {
      return "zh";
    }
    return "en";
  }

  function fallbackWhenUnavailable(text) {
    if (!warnedUnavailable) {
      warnedUnavailable = true;
      console.warn(
        "[i18n] Translation endpoint unavailable. Using source text fallback. Configure window.TRANSLATION_ENDPOINT for reliability."
      );
    }
    return text;
  }

  function lookupManualTranslation(text, sourceLanguage, targetLanguage) {
    const normalizedText = normalizeWhitespace(text);
    if (!normalizedText) {
      return "";
    }

    for (const pair of MANUAL_TRANSLATIONS) {
      const en = normalizeWhitespace(pair[0]);
      const zh = normalizeWhitespace(pair[1]);
      if (sourceLanguage === "en" && targetLanguage === "zh-CN" && normalizedText === en) {
        return pair[1];
      }
      if (
        sourceLanguage === "zh-CN" &&
        targetLanguage === "en" &&
        normalizedText === zh
      ) {
        return pair[0];
      }
    }

    return "";
  }

  function normalizeWhitespace(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function loadCache() {
    const raw = localStorage.getItem(STORAGE_CACHE_KEY);
    if (!raw) {
      return {};
    }
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    } catch (_error) {
      return {};
    }
    return {};
  }

  function saveCache(cache) {
    localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(cache));
  }
})();
