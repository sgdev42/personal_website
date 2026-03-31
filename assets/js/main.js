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

  siteNav.querySelectorAll("a").forEach((anchor) => {
    anchor.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      siteNav.classList.remove("is-open");
    });
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

const blogList = document.querySelector("#blog-list");
if (blogList) {
  loadBlogCards(blogList);
}

const sectionNavLinks = Array.from(
  document.querySelectorAll('.site-nav a[href^="#"]')
);
if (sectionNavLinks.length > 0) {
  const linkBySection = new Map();

  sectionNavLinks.forEach((link) => {
    const sectionId = link.getAttribute("href")?.slice(1);
    if (!sectionId) {
      return;
    }
    const sectionNode = document.getElementById(sectionId);
    if (!sectionNode) {
      return;
    }
    linkBySection.set(sectionNode, link);
  });

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) {
        return;
      }

      sectionNavLinks.forEach((link) => link.removeAttribute("aria-current"));
      const activeLink = linkBySection.get(visible.target);
      if (activeLink) {
        activeLink.setAttribute("aria-current", "page");
      }
    },
    {
      threshold: [0.2, 0.4, 0.6],
      rootMargin: "-20% 0px -55% 0px",
    }
  );

  linkBySection.forEach((_link, sectionNode) => sectionObserver.observe(sectionNode));
}

async function loadBlogCards(targetNode) {
  const sourcePath = targetNode.getAttribute("data-source") || "../data/blog_cards.json";

  try {
    const response = await fetch(sourcePath);
    if (!response.ok) {
      renderBlogError(targetNode, "Unable to load blog cards.");
      return;
    }

    const data = await response.json();
    const cards = Array.isArray(data.cards) ? data.cards : [];
    renderBlogCards(targetNode, cards);

    if (typeof window.__applySiteLanguage === "function") {
      await window.__applySiteLanguage();
    }
  } catch (_error) {
    renderBlogError(targetNode, "Unable to load blog cards.");
  }
}

function renderBlogCards(targetNode, cards) {
  if (cards.length === 0) {
    targetNode.innerHTML = '<li class="panel blog-empty">No cards available yet.</li>';
    return;
  }

  targetNode.innerHTML = cards
    .map((card) => {
      const safeDate = escapeHtml(card.date || "");
      const safeTitle = escapeHtml(card.title || "");
      const safeExcerpt = escapeHtml(card.excerpt || "");
      const safeTags = escapeHtml(card.tags || "");
      const sourceLang = normalizeSourceLanguage(card.source_lang);

      return `
        <li class="panel reveal is-visible blog-card" data-source-lang="${sourceLang}">
          <p class="eyebrow">${safeDate}</p>
          <h3>${safeTitle}</h3>
          <p>${safeExcerpt}</p>
          <p class="blog-meta">${safeTags}</p>
        </li>
      `;
    })
    .join("");
}

function renderBlogError(targetNode, message) {
  targetNode.innerHTML = `<li class="panel blog-empty">${escapeHtml(message)}</li>`;
}

function normalizeSourceLanguage(value) {
  const lower = String(value || "en").toLowerCase();
  if (lower.startsWith("zh")) {
    return "zh-CN";
  }
  return "en";
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
