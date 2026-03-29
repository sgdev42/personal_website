const yearNode = document.querySelector("#year");
if (yearNode) {
  yearNode.textContent = new Date().getFullYear().toString();
}

const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#site-nav");

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    siteNav.classList.toggle("is-open", !expanded);
  });
}

const revealNodes = document.querySelectorAll(".reveal");
if (revealNodes.length > 0) {
  revealNodes.forEach((node, index) => {
    node.style.transitionDelay = `${Math.min(index * 60, 240)}ms`;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealNodes.forEach((node) => observer.observe(node));
}

const blogForm = document.querySelector("#blog-form");
const blogList = document.querySelector("#blog-list");
const storageKey = "sg_personal_site_blog_cards";
const pageLang = document.documentElement.lang || "en";
const normalizedLang = pageLang.toLowerCase();

const uiLabels = {
  en: {
    emptyText: "No cards yet. Add your first thought above.",
    removeLabel: "Remove",
  },
  "zh-cn": {
    emptyText: "还没有卡片。先写下你的第一条想法。",
    removeLabel: "删除",
  },
  fr: {
    emptyText: "Aucune carte pour le moment. Ajoutez votre premiere idee.",
    removeLabel: "Supprimer",
  },
  ja: {
    emptyText: "まだカードがありません。最初のメモを追加してください。",
    removeLabel: "削除",
  },
};

const defaultCardsByLang = {
  en: [
    {
      title: "First week of building this site",
      excerpt: "Set up a clean structure for Pages deployment and made the layout easier to scale.",
      tags: "website, devlog",
      date: "2026-03-28",
    },
  ],
  "zh-cn": [
    {
      title: "个人网站第一周",
      excerpt: "完成了 GitHub Pages 基础框架，并建立了后续扩展的页面结构。",
      tags: "网站, 开发记录",
      date: "2026-03-28",
    },
  ],
  fr: [
    {
      title: "Premiere semaine sur ce site",
      excerpt: "J'ai pose une base claire pour le deploiement GitHub Pages et les futures evolutions.",
      tags: "site web, journal dev",
      date: "2026-03-28",
    },
  ],
  ja: [
    {
      title: "個人サイトの最初の1週間",
      excerpt: "GitHub Pages 向けの土台を作り、今後の拡張がしやすい構成にしました。",
      tags: "webサイト, 開発ログ",
      date: "2026-03-28",
    },
  ],
};

const defaultLabels = uiLabels.en;
const activeLabels = uiLabels[normalizedLang] || defaultLabels;
const emptyText = activeLabels.emptyText;
const removeLabel = activeLabels.removeLabel;

const defaultEnglishCards = defaultCardsByLang.en;
const defaultChineseCards = defaultCardsByLang["zh-cn"];
const defaultFrenchCards = defaultCardsByLang.fr;
const defaultJapaneseCards = defaultCardsByLang.ja;

const defaultCards = {
  en: defaultEnglishCards,
  "zh-cn": defaultChineseCards,
  fr: defaultFrenchCards,
  ja: defaultJapaneseCards,
};

const languageBucket = defaultCards[normalizedLang] ? normalizedLang : "en";
const fallbackCards = defaultCards[languageBucket];

const defaultCard = [
  {
    title: "First week of building this site",
    excerpt: "Set up a clean structure for Pages deployment and made the layout easier to scale.",
    tags: "website, devlog",
    date: "2026-03-28",
  },
];

if (blogForm && blogList) {
  const storageKeyByLang = `${storageKey}_${languageBucket}`;
  const initialCards = fallbackCards || defaultCard;
  let cards = loadCards(storageKeyByLang, initialCards);

  renderCards(cards);

  blogForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(blogForm);
    const title = String(formData.get("title") || "").trim();
    const excerpt = String(formData.get("excerpt") || "").trim();
    const tags = String(formData.get("tags") || "").trim();

    if (!title || !excerpt) {
      return;
    }

    const entry = {
      title,
      excerpt,
      tags,
      date: new Date().toISOString().slice(0, 10),
    };

    cards = [entry, ...cards];
    saveCards(storageKeyByLang, cards);
    renderCards(cards);
    blogForm.reset();
  });

  blogList.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (!target.matches("[data-remove-index]")) {
      return;
    }

    const indexValue = target.getAttribute("data-remove-index");
    if (indexValue === null) {
      return;
    }

    const removeIndex = Number.parseInt(indexValue, 10);
    if (Number.isNaN(removeIndex)) {
      return;
    }

    cards = cards.filter((_, index) => index !== removeIndex);
    saveCards(storageKeyByLang, cards);
    renderCards(cards);
  });

  function renderCards(currentCards) {
    if (currentCards.length === 0) {
      blogList.innerHTML = `<li class="panel blog-empty">${emptyText}</li>`;
      return;
    }

    blogList.innerHTML = currentCards
      .map((card, index) => {
        const safeTitle = escapeHtml(card.title || "");
        const safeExcerpt = escapeHtml(card.excerpt || "");
        const safeTags = escapeHtml(card.tags || "");
        const safeDate = escapeHtml(card.date || "");

        return `
          <li class="panel reveal is-visible blog-card">
            <p class="eyebrow">${safeDate}</p>
            <h3>${safeTitle}</h3>
            <p>${safeExcerpt}</p>
            <p class="blog-meta">${safeTags}</p>
            <button class="blog-remove" type="button" data-remove-index="${index}">
              ${removeLabel}
            </button>
          </li>
        `;
      })
      .join("");
  }
}

function loadCards(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (_error) {
    return fallback;
  }

  return fallback;
}

function saveCards(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
