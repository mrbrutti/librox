/* Librox site behavior: theme chips + the Find Books search.
   Search talks directly to the same catalogs the app ships with —
   no server of ours in between, same as the app's Discover tab. */
(function () {
  "use strict";

  /* ---------- Themes ---------- */
  var THEMES = ["eink", "paper", "dark"];
  function applyTheme(name) {
    if (THEMES.indexOf(name) === -1) return;
    document.documentElement.setAttribute("data-theme", name);
    try { localStorage.setItem("librox-theme", name); } catch (e) {}
    document.querySelectorAll(".theme-chip").forEach(function (chip) {
      chip.setAttribute("aria-pressed", chip.dataset.theme === name ? "true" : "false");
    });
  }
  document.querySelectorAll(".theme-chip").forEach(function (chip) {
    chip.addEventListener("click", function () { applyTheme(chip.dataset.theme); });
  });
  // Reflect a stored choice (set pre-paint by the inline head script) in the chips.
  var current = document.documentElement.getAttribute("data-theme");
  if (current) {
    document.querySelectorAll(".theme-chip").forEach(function (chip) {
      chip.setAttribute("aria-pressed", chip.dataset.theme === current ? "true" : "false");
    });
  }

  /* ---------- Cover tints — the app's palette and its exact hash ----------
     LibrosStyle.coverTint: djb2 over UTF-8, wrapping at 64 bits, mod 6.
     Same title → same colour on the page and on the phone. */
  var COVER_TINTS = ["#2F4A4A", "#8A4B2F", "#6B4A5C", "#4A5C4A", "#3F4E63", "#7A6A3F"];
  var MASK64 = (1n << 64n) - 1n;
  function coverTint(title) {
    var bytes = new TextEncoder().encode(title);
    var h = 5381n;
    for (var i = 0; i < bytes.length; i++) {
      h = (h * 33n + BigInt(bytes[i])) & MASK64;
    }
    return COVER_TINTS[Number(h % 6n)];
  }

  /* ---------- Search ---------- */
  var form = document.getElementById("book-search");
  if (!form) return; // inner pages have no search

  var input = document.getElementById("book-query");
  var status = document.getElementById("search-status");
  var list = document.getElementById("search-results");
  var sourceChips = Array.prototype.slice.call(document.querySelectorAll(".source-chip"));
  var activeSource = "all";
  var controller = null;
  var debounceTimer = null;
  var PER_SOURCE = 10;

  sourceChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      activeSource = chip.dataset.source;
      sourceChips.forEach(function (c) {
        c.setAttribute("aria-checked", c === chip ? "true" : "false");
      });
      if (input.value.trim().length >= 2) runSearch(input.value.trim());
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var q = input.value.trim();
    if (q.length >= 2) runSearch(q);
  });
  input.addEventListener("input", function () {
    clearTimeout(debounceTimer);
    var q = input.value.trim();
    if (q.length < 2) { setStatus(""); clear(list); return; }
    debounceTimer = setTimeout(function () { runSearch(q); }, 400);
  });

  function setStatus(text) { status.textContent = text; }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  function runSearch(query) {
    if (controller) controller.abort();
    controller = new AbortController();
    var signal = controller.signal;
    setStatus("Searching the commons…");
    clear(list);

    var jobs = [];
    if (activeSource === "all" || activeSource === "gutenberg") jobs.push(searchGutendex(query, signal));
    if (activeSource === "all" || activeSource === "standardebooks") jobs.push(searchStandardEbooks(query, signal));

    Promise.allSettled(jobs).then(function (settled) {
      if (signal.aborted) return;
      var books = [];
      var failures = 0;
      settled.forEach(function (s) {
        if (s.status === "fulfilled") books = books.concat(s.value);
        else failures++;
      });
      render(books);
      if (books.length === 0) {
        setStatus(failures === jobs.length && jobs.length > 0
          ? "The catalogs didn’t answer — try again in a moment."
          : "Nothing in the commons for “" + query + "”. Try an author or a shorter title.");
      } else {
        setStatus(books.length + (books.length === 1 ? " book" : " books") +
          (failures ? " · one catalog didn’t answer" : ""));
      }
    });
  }

  /* Project Gutenberg via Gutendex — JSON, CORS-open. */
  function searchGutendex(query, signal) {
    var url = "https://gutendex.com/books/?search=" + encodeURIComponent(query);
    return fetch(url, { signal: signal }).then(function (r) {
      if (!r.ok) throw new Error("gutendex " + r.status);
      return r.json();
    }).then(function (json) {
      return (json.results || []).slice(0, PER_SOURCE).map(function (item) {
        var epub = null, cover = null;
        for (var type in item.formats) {
          var u = item.formats[type];
          if (type.indexOf("image/") === 0 && !cover) cover = u;
          if (type.indexOf("application/epub+zip") === 0 && !epub) epub = u;
        }
        return {
          source: "Project Gutenberg",
          // Gutendex titles sometimes leak MARC subfield markers ("… : $b …").
          title: (item.title || "Untitled").replace(/\s*:\s*\$b\s*/g, ": "),
          author: (item.authors && item.authors[0] && item.authors[0].name) || "",
          cover: cover,
          epub: epub
        };
      }).filter(function (b) { return !!b.epub; });
    });
  }

  /* Standard Ebooks via their OPDS feed — Atom XML, CORS-open. */
  function searchStandardEbooks(query, signal) {
    var url = "https://standardebooks.org/feeds/opds/all?query=" + encodeURIComponent(query);
    return fetch(url, { signal: signal }).then(function (r) {
      if (!r.ok) throw new Error("standardebooks " + r.status);
      return r.text();
    }).then(function (text) {
      var doc = new DOMParser().parseFromString(text, "application/xml");
      var entries = Array.prototype.slice.call(doc.getElementsByTagName("entry"));
      return entries.slice(0, PER_SOURCE).map(function (entry) {
        var title = textOf(entry, "title");
        var author = "";
        var authorEl = entry.getElementsByTagName("author")[0];
        if (authorEl) author = textOf(authorEl, "name");
        var epub = null, cover = null;
        var links = entry.getElementsByTagName("link");
        for (var i = 0; i < links.length; i++) {
          var rel = links[i].getAttribute("rel") || "";
          var type = links[i].getAttribute("type") || "";
          var href = links[i].getAttribute("href") || "";
          if (!href) continue;
          var abs = new URL(href, "https://standardebooks.org").href;
          if (rel === "http://opds-spec.org/acquisition/open-access" &&
              type.indexOf("application/epub+zip") === 0 &&
              abs.indexOf("_advanced") === -1 && !epub) epub = abs;
          if (rel === "http://opds-spec.org/image/thumbnail" && !cover) cover = abs;
        }
        return { source: "Standard Ebooks", title: title || "Untitled", author: author, cover: cover, epub: epub };
      }).filter(function (b) { return !!b.epub; });
    });

    function textOf(parent, tag) {
      var el = parent.getElementsByTagName(tag)[0];
      return el ? el.textContent.trim() : "";
    }
  }

  /* ---------- Rendering — DOM building only, API text never hits innerHTML. */
  function render(books) {
    clear(list);
    books.forEach(function (book) {
      // The app's ImportLink only unpacks http(s) targets; mirror that here.
      if (!/^https:\/\//i.test(book.epub)) return;
      var installURL = "libros://import?url=" + encodeURIComponent(book.epub);

      var li = el("li", "result");
      var cover = el("div", "cover");
      cover.style.setProperty("--cover-tint", coverTint(book.title));
      var initial = el("div", "initial");
      initial.textContent = (book.title.trim().charAt(0) || "·").toUpperCase();
      cover.appendChild(initial);
      if (book.cover && /^https:\/\//i.test(book.cover)) {
        var img = document.createElement("img");
        img.alt = "";
        img.loading = "lazy";
        img.referrerPolicy = "no-referrer";
        img.addEventListener("error", function () { img.remove(); });
        img.src = book.cover;
        cover.appendChild(img);
      }

      var meta = el("div", "meta");
      var eyebrow = el("div", "eyebrow");
      eyebrow.textContent = book.source;
      var title = el("div", "title");
      title.textContent = book.title;
      var author = el("div", "author");
      author.textContent = book.author;
      meta.appendChild(eyebrow); meta.appendChild(title);
      if (book.author) meta.appendChild(author);

      var actions = el("div", "actions");
      var add = document.createElement("a");
      add.className = "btn-add";
      add.href = installURL;
      add.textContent = "Add to Librox";
      add.setAttribute("aria-label", "Add " + book.title + " to Librox");
      var epub = document.createElement("a");
      epub.className = "btn-epub";
      epub.href = book.epub;
      epub.textContent = "EPUB";
      epub.setAttribute("aria-label", "Download " + book.title + " as EPUB");
      actions.appendChild(add); actions.appendChild(epub);

      li.appendChild(cover); li.appendChild(meta); li.appendChild(actions);
      list.appendChild(li);
    });
  }

  function el(tag, className) {
    var node = document.createElement(tag);
    node.className = className;
    return node;
  }
})();
