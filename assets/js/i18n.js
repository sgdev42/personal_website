(function () {
  const STORAGE_LANG_KEY = "sg_site_language";
  const STORAGE_CACHE_KEY = "sg_site_translation_cache_v1";
  const SOURCE_LANG = "en";
  const SUPPORTED_LANGUAGES = ["en", "zh-CN", "fr", "ja"];
  const TRANSLATION_ENDPOINT =
    window.TRANSLATION_ENDPOINT || "https://translate.argosopentech.com/translate";
  const shouldTranslateSelector = [
    "h1",
    "h2",
    "h3",
    "p",
    "small",
    "label",
    "button",
    "a",
    "title",
    "meta[name='description']",
  ].join(", ");

  const languageSelect = document.querySelector("#language-switch");
  if (!languageSelect) {
    return;
  }

  const fallbackDictionary = {
    "Home": {
      "zh-CN": "首页",
      fr: "Accueil",
      ja: "ホーム",
    },
    "About": {
      "zh-CN": "关于",
      fr: "A propos",
      ja: "自己紹介",
    },
    "Projects": {
      "zh-CN": "项目",
      fr: "Projets",
      ja: "プロジェクト",
    },
    "Blog": {
      "zh-CN": "博客",
      fr: "Blog",
      ja: "ブログ",
    },
    "Contact": {
      "zh-CN": "联系",
      fr: "Contact",
      ja: "連絡先",
    },
    "Menu": {
      "zh-CN": "菜单",
      fr: "Menu",
      ja: "メニュー",
    },
    "View Projects": {
      "zh-CN": "查看项目",
      fr: "Voir les projets",
      ja: "プロジェクトを見る",
    },
    "View Blog": {
      "zh-CN": "浏览博客卡片",
      fr: "Voir le blog",
      ja: "ブログを見る",
    },
    "Read more": {
      "zh-CN": "继续阅读",
      fr: "Lire plus",
      ja: "続きを読む",
    },
    "Explore projects": {
      "zh-CN": "查看项目",
      fr: "Explorer les projets",
      ja: "プロジェクトを見る",
    },
    "Read blog cards": {
      "zh-CN": "阅读博客卡片",
      fr: "Lire les cartes du blog",
      ja: "ブログカードを読む",
    },
    "Get in touch": {
      "zh-CN": "联系我",
      fr: "Me contacter",
      ja: "連絡する",
    },
    "Selected Work": {
      "zh-CN": "精选项目",
      fr: "Selection de projets",
      ja: "主な実績",
    },
    "Coming Soon": {
      "zh-CN": "即将更新",
      fr: "Bientot",
      ja: "近日公開",
    },
    "In Progress": {
      "zh-CN": "进行中",
      fr: "En cours",
      ja: "進行中",
    },
    "Repo": {
      "zh-CN": "仓库",
      fr: "Depot",
      ja: "リポジトリ",
    },
    "Thought Cards": {
      "zh-CN": "想法卡片",
      fr: "Cartes d'idees",
      ja: "思考カード",
    },
    "Create a Card": {
      "zh-CN": "创建卡片",
      fr: "Creer une carte",
      ja: "カードを作成",
    },
    "Cards": {
      "zh-CN": "卡片列表",
      fr: "Cartes",
      ja: "カード一覧",
    },
    "Title": {
      "zh-CN": "标题",
      fr: "Titre",
      ja: "タイトル",
    },
    "Thought": {
      "zh-CN": "内容",
      fr: "Idee",
      ja: "内容",
    },
    "Tags (comma separated)": {
      "zh-CN": "标签（用逗号分隔）",
      fr: "Etiquettes (separees par des virgules)",
      ja: "タグ（カンマ区切り）",
    },
    "Add Card": {
      "zh-CN": "添加卡片",
      fr: "Ajouter",
      ja: "カードを追加",
    },
    "Remove": {
      "zh-CN": "删除",
      fr: "Supprimer",
      ja: "削除",
    },
    "Who I Am": {
      "zh-CN": "我是谁",
      fr: "Qui je suis",
      ja: "私について",
    },
    "Current Focus": {
      "zh-CN": "当前关注",
      fr: "Axes actuels",
      ja: "現在の注力領域",
    },
    "Core Skills": {
      "zh-CN": "核心能力",
      fr: "Competences principales",
      ja: "主要スキル",
    },
    "Outside Work": {
      "zh-CN": "工作之外",
      fr: "En dehors du travail",
      ja: "仕事以外",
    },
  };

  const currentLanguage = getInitialLanguage();
  languageSelect.value = currentLanguage;

  languageSelect.addEventListener("change", async () => {
    const nextLanguage = languageSelect.value;
    localStorage.setItem(STORAGE_LANG_KEY, nextLanguage);
    setLanguageInUrl(nextLanguage);
    await applyLanguage(nextLanguage);
  });

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

    const fromBrowser = (navigator.language || SOURCE_LANG).toLowerCase();
    if (fromBrowser.startsWith("zh")) {
      return "zh-CN";
    }
    if (fromBrowser.startsWith("fr")) {
      return "fr";
    }
    if (fromBrowser.startsWith("ja")) {
      return "ja";
    }
    return SOURCE_LANG;
  }

  function setLanguageInUrl(language) {
    const url = new URL(window.location.href);
    if (language === SOURCE_LANG) {
      url.searchParams.delete("lang");
    } else {
      url.searchParams.set("lang", language);
    }
    window.history.replaceState({}, "", url.toString());
  }

  async function applyLanguage(language) {
    document.documentElement.lang = language;
    const nodes = collectTranslatableNodes();

    if (language === SOURCE_LANG) {
      nodes.forEach((node) => {
        restoreOriginal(node);
      });
      return;
    }

    for (const node of nodes) {
      const original = getOriginal(node);
      if (!original || isProbablyNonTranslatable(original)) {
        continue;
      }

      const translated = await translateText(original, language);
      applyTranslated(node, translated || original);
    }
  }

  function collectTranslatableNodes() {
    const allNodes = Array.from(document.querySelectorAll(shouldTranslateSelector));
    return allNodes.filter((node) => {
      if (!(node instanceof HTMLElement)) {
        return node.tagName === "TITLE" || node.tagName === "META";
      }

      if (node.closest("[data-no-translate]")) {
        return false;
      }
      if (node.classList.contains("brand")) {
        return false;
      }
      if (node.hasAttribute("data-no-translate")) {
        return false;
      }
      return true;
    });
  }

  function getOriginal(node) {
    const attrValue = getNodeText(node);
    if (!node.dataset) {
      return attrValue;
    }

    if (!node.dataset.i18nOriginal) {
      node.dataset.i18nOriginal = attrValue;
    }
    return node.dataset.i18nOriginal;
  }

  function restoreOriginal(node) {
    const original = getOriginal(node);
    applyTranslated(node, original);
  }

  function applyTranslated(node, value) {
    if (node.tagName === "TITLE") {
      node.textContent = value;
      return;
    }

    if (node.tagName === "META") {
      node.setAttribute("content", value);
      return;
    }

    node.textContent = value;
  }

  function getNodeText(node) {
    if (node.tagName === "TITLE") {
      return node.textContent || "";
    }

    if (node.tagName === "META") {
      return node.getAttribute("content") || "";
    }

    return node.textContent || "";
  }

  function isProbablyNonTranslatable(value) {
    const trimmed = value.trim();
    if (!trimmed) {
      return true;
    }

    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.includes("@") ||
      /^[\d\s/:\-.]+$/.test(trimmed)
    ) {
      return true;
    }

    return false;
  }

  async function translateText(text, targetLanguage) {
    const fallbackValue = fromFallbackDictionary(text, targetLanguage);
    if (fallbackValue) {
      return fallbackValue;
    }

    const cache = loadCache();
    const cacheKey = `${SOURCE_LANG}::${targetLanguage}::${text}`;
    const cached = cache[cacheKey];
    if (cached) {
      return cached;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);
      const targetCode = normalizeTargetLanguage(targetLanguage);
      const response = await fetch(TRANSLATION_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: text,
          source: SOURCE_LANG,
          target: targetCode,
          format: "text",
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        return fallbackValue || text;
      }

      const data = await response.json();
      const translated =
        typeof data.translatedText === "string" && data.translatedText.trim()
          ? data.translatedText.trim()
          : text;

      cache[cacheKey] = translated;
      saveCache(cache);
      return translated;
    } catch (_error) {
      return fallbackValue || text;
    }
  }

  function fromFallbackDictionary(text, targetLanguage) {
    const key = text.trim();
    if (!key) {
      return "";
    }
    const map = fallbackDictionary[key];
    if (!map) {
      return "";
    }
    return map[targetLanguage] || "";
  }

  function normalizeTargetLanguage(language) {
    if (language === "zh-CN") {
      return "zh";
    }
    return language;
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
