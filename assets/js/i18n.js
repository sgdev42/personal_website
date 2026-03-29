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
