const iconMap = {
  about: "CH",
  music: "M",
  books: "B",
  art: "A",
  education: "E",
  apps: "G",
  journal: "J",
  nature: "N",
  comedy: ":)",
  scripture: "faith",
  misc: "*",
  faith: "faith",
  other: "+"
};

const pageParam = new URLSearchParams(window.location.search).get("page");

async function getJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Could not load ${path}`);
  }
  return response.json();
}

function iconNode(iconKey) {
  const span = document.createElement("span");
  span.className = "card-icon";
  const icon = iconMap[iconKey] || iconKey || "*";
  if (icon === "faith") {
    span.classList.add("faith-medallion");
    span.textContent = "faith";
  } else {
    span.textContent = icon;
  }
  return span;
}

function setText(id, value) {
  const node = document.getElementById(id);
  if (node) {
    node.textContent = value || "";
  }
}

function renderList(id, items) {
  const list = document.getElementById(id);
  if (!list) return;
  list.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `<span aria-hidden="true">${item.symbol || "*"}</span><span>${item.text}</span>`;
    list.appendChild(li);
  });
}

function renderQuickLinks(links) {
  const holder = document.getElementById("quick-links");
  if (!holder) return;
  holder.innerHTML = "";
  links.forEach((link) => {
    const a = document.createElement("a");
    a.href = link.url;
    a.textContent = link.label;
    holder.appendChild(a);
  });
}

function renderCategories(categories) {
  const grid = document.getElementById("category-grid");
  if (!grid) return;
  grid.innerHTML = "";

  categories.forEach((category) => {
    const card = document.createElement("a");
    card.className = `world-card ${category.priority ? "priority" : "placeholder"}`;
    card.href = category.href || `page.html?page=${category.id}`;
    if (card.href.startsWith("http")) {
      card.target = "_blank";
      card.rel = "noopener noreferrer";
    }
    card.appendChild(iconNode(category.icon));

    const content = document.createElement("div");
    content.className = "card-content";
    content.innerHTML = `<h3>${category.title}</h3><p>${category.description}</p>`;
    card.appendChild(content);

    const footer = document.createElement("div");
    footer.className = "card-footer";
    footer.innerHTML = `<span>${category.cta || "Open hub"}</span><span class="status-pill">${category.status || "Ready"}</span>`;
    card.appendChild(footer);
    grid.appendChild(card);
  });
}

async function initHome() {
  const [site, categories] = await Promise.all([
    getJson("data/site.json"),
    getJson("data/categories.json")
  ]);

  document.title = `${site.title} | Personal Hub`;
  setText("site-title", site.title);
  setText("site-tagline", site.tagline);
  setText("site-intro", site.intro);
  setText("note-to-you", site.noteToYou);
  setText("footer-left", site.footerLeft);
  renderList("currently-list", site.currently);
  renderList("updates-list", site.updates);
  renderQuickLinks(site.quickLinks);
  renderCategories(categories);
}

function renderSubcategories(page) {
  const grid = document.getElementById("subcategories-grid");
  if (!grid) return;
  grid.innerHTML = "";

  page.subcategories.forEach((sub) => {
    if (page.layout === "book-catalog") {
      renderBookCard(grid, sub);
      return;
    }

    const card = document.createElement(sub.url ? "a" : "article");
    card.className = "sub-card";
    if (sub.url) {
      card.href = sub.url;
      card.target = "_blank";
      card.rel = "noopener noreferrer";
    }
    if (page.layout === "music-folders") {
      const thumb = document.createElement("div");
      thumb.className = `music-thumb ${sub.visual || "music-notes"}`;
      thumb.setAttribute("aria-hidden", "true");
      if (sub.thumb) {
        thumb.style.backgroundImage = `url("${sub.thumb}")`;
      } else {
        thumb.textContent = sub.symbol || "";
      }
      card.appendChild(thumb);
    }
    const icon = sub.iconImage ? document.createElement("span") : iconNode(sub.icon || page.icon || "other");
    icon.className = "sub-icon card-icon" + (icon.classList.contains("faith-medallion") ? " faith-medallion" : "");
    if (sub.iconImage) {
      icon.style.backgroundImage = `url("${sub.iconImage}")`;
      icon.setAttribute("aria-hidden", "true");
    }
    card.appendChild(icon);

    const title = document.createElement("h3");
    title.textContent = sub.title;
    card.appendChild(title);

    const desc = document.createElement("p");
    desc.textContent = sub.description;
    card.appendChild(desc);
    grid.appendChild(card);
  });
}

function renderBookCard(grid, book) {
  const card = document.createElement(book.url ? "a" : "article");
  card.className = `book-card ${book.comingSoon ? "coming-soon" : ""}`;
  if (book.url) {
    card.href = book.url;
    card.target = "_blank";
    card.rel = "noopener noreferrer";
  }

  const cover = document.createElement("div");
  cover.className = "book-cover";
  if (book.cover) {
    cover.style.backgroundImage = `url("${book.cover}")`;
  }
  cover.setAttribute("aria-hidden", "true");
  card.appendChild(cover);

  const title = document.createElement("h3");
  title.textContent = book.title;
  card.appendChild(title);

  const desc = document.createElement("p");
  desc.textContent = book.description;
  card.appendChild(desc);

  const action = document.createElement("span");
  action.className = "book-action";
  action.textContent = book.comingSoon ? "Coming Soon" : "Learn More";
  card.appendChild(action);

  grid.appendChild(card);
}

function renderResources(page) {
  const holder = document.getElementById("resource-list");
  if (!holder) return;
  holder.innerHTML = "";

  page.resources.forEach((resource) => {
    const item = document.createElement("article");
    item.className = "resource-item";
    item.innerHTML = `<h3>${resource.title}</h3><p>${resource.description}</p>`;
    if (resource.url) {
      const a = document.createElement("a");
      a.className = "resource-link";
      a.href = resource.url;
      a.textContent = resource.label || "Open";
      item.appendChild(a);
    }
    holder.appendChild(item);
  });
}

async function initPage() {
  if (!pageParam) {
    document.querySelector("main").innerHTML = `<section class="missing-page"><h1>Choose a hub</h1><p>Head back to the main page and choose one of the available worlds.</p><p><a class="resource-link" href="index.html#worlds">Back to all worlds</a></p></section>`;
    return;
  }

  try {
    const page = await getJson(`data/pages/${pageParam}.json`);
    document.body.classList.add(`page-${pageParam}`);
    document.title = `${page.title} | Chas Hathaway`;
    setText("page-kicker", page.kicker || "Category hub");
    setText("page-title", page.title);
    setText("page-description", page.description);
    setText("subsection-heading", page.subsectionHeading || "What belongs here");
    renderSubcategories(page);
    renderResources(page);
  } catch (error) {
    document.querySelector("main").innerHTML = `<section class="missing-page"><h1>That hub is still in the workshop.</h1><p>This placeholder is ready for a future page.</p><p><a class="resource-link" href="index.html#worlds">Back to all worlds</a></p></section>`;
  }
}

if (document.body.classList.contains("home-page")) {
  initHome();
}

if (document.body.classList.contains("detail-page")) {
  initPage();
}
