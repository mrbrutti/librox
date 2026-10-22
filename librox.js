/* Librox site behavior: Duo story, theme chips, and the Find Books search.
   Search talks directly to the same catalogs the app ships with —
   no server of ours in between, same as the app's Discover tab. */
(function () {
  "use strict";

  /* One App Store product ID serves the public listing. Tailor the wording,
     but keep the country-neutral HTTPS link so Apple resolves the storefront. */
  var storeURL = "https://apps.apple.com/app/id6796746657";
  var platform = navigator.platform || "";
  var userAgent = navigator.userAgent || "";
  var isIPad = /iPad/.test(userAgent) || (platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var isIPhone = /iPhone|iPod/.test(userAgent);
  var isMac = !isIPad && /Mac/.test(platform);
  document.querySelectorAll("[data-store-link]").forEach(function (link) {
    link.href = storeURL;
  });
  var storeLabel = document.querySelector("[data-store-label]");
  if (storeLabel) {
    storeLabel.textContent = isIPhone
      ? "Get Librox for iPhone"
      : isIPad
        ? "Get Librox for iPad"
        : isMac
          ? "View Librox on the App Store"
          : "Get Librox on the App Store";
  }
  var storeAvailability = document.querySelector("[data-store-availability]");
  if (isMac && storeAvailability) {
    storeAvailability.textContent = "See supported devices and system requirements on the App Store.";
    storeAvailability.hidden = false;
  }

  /* Compact navigation is enhanced only after its controls are connected. */
  var menu = document.querySelector('[data-menu-toggle]');
  var header = document.querySelector('.site-header');
  function setMenu(open) {
    header.classList.toggle('menu-open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    menu.querySelector('.icon').className = 'icon i-' + (open ? 'x' : 'list');
  }
  if (menu && header) {
    menu.hidden = false;
    document.documentElement.classList.add('js');
    menu.addEventListener('click', function () { setMenu(menu.getAttribute('aria-expanded') !== 'true'); });
    header.querySelectorAll('.site-links a').forEach(function (link) { link.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { setMenu(false); menu.focus(); }
    });
    document.addEventListener('click', function (event) { if (!header.contains(event.target)) setMenu(false); });
    matchMedia('(min-width:761px)').addEventListener('change', function () { setMenu(false); });
  }

  /* Follow system appearance until a visitor chooses a theme for this page. */
  var THEMES = ['eink', 'paper', 'dark'];
  var systemDark = matchMedia('(prefers-color-scheme: dark)');
  function syncThemeControls(name) {
    document.querySelectorAll('.theme-chip').forEach(function (chip) { chip.setAttribute('aria-pressed', String(chip.dataset.theme === name)); });
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = name === 'dark' ? '#191a19' : name === 'eink' ? '#f7f8f8' : '#f6f4ef';
  }
  document.querySelectorAll('.theme-chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      if (THEMES.indexOf(chip.dataset.theme) === -1) return;
      document.documentElement.setAttribute('data-theme', chip.dataset.theme);
      syncThemeControls(chip.dataset.theme);
    });
  });
  function followSystem() {
    var selected = document.documentElement.getAttribute('data-theme');
    syncThemeControls(selected || (systemDark.matches ? 'dark' : 'paper'));
  }
  followSystem();
  systemDark.addEventListener('change', followSystem);

  /* ---------- Cover tints — the app's palette and its exact hash ----------
     LibrosStyle.coverTint: djb2 over UTF-8, wrapping at 64 bits, mod 6.
     Same title → same colour on the page and on the phone. */
  var COVER_TINTS = [
    "#2F4A4A",
    "#8A4B2F",
    "#6B4A5C",
    "#4A5C4A",
    "#3F4E63",
    "#7A6A3F",
  ];
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
  var sourceChips = Array.prototype.slice.call(
    document.querySelectorAll(".source-chip"),
  );
  var activeSource = "all";
  var fallback = document.querySelector("[data-catalog-fallback]");
  var start = document.querySelector("[data-search-start]");
  var controller = null;
  var debounceTimer = null;
  var PER_SOURCE = 10;

  sourceChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      activeSource = chip.dataset.source;
      sourceChips.forEach(function (c) {
        c.setAttribute("aria-checked", c === chip ? "true" : "false");
        c.tabIndex = c === chip ? 0 : -1;
      });
      if (input.value.trim().length >= 2) runSearch(input.value.trim());
    });
  });

  sourceChips.forEach(function (chip, index) {
    chip.tabIndex = chip.getAttribute('aria-checked') === 'true' ? 0 : -1;
    chip.addEventListener('keydown', function (event) {
      var next;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % sourceChips.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + sourceChips.length - 1) % sourceChips.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = sourceChips.length - 1;
      if (next === undefined) return;
      event.preventDefault(); sourceChips[next].focus(); sourceChips[next].click();
    });
  });
  document.querySelectorAll('[data-search-query]').forEach(function (button) {
    button.addEventListener('click', function () { input.value = button.dataset.searchQuery; input.focus(); runSearch(input.value); });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var q = input.value.trim();
    if (q.length >= 2) runSearch(q);
    else { setStatus("Enter at least two characters to search."); input.focus(); }
  });
  input.addEventListener("input", function () {
    clearTimeout(debounceTimer);
    var q = input.value.trim();
    if (q.length < 2) {
      if (controller) controller.abort();
      setStatus("");
      status.classList.remove("is-loading");
      list.removeAttribute("aria-busy");
      if (start) start.hidden = false;
      if (fallback) fallback.hidden = true;
      clear(list);
      return;
    }
    debounceTimer = setTimeout(function () {
      runSearch(q);
    }, 400);
  });

  function setStatus(text) {
    status.textContent = text;
  }
  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function runSearch(query) {
    clearTimeout(debounceTimer);
    if (controller) controller.abort();
    var requestController = new AbortController();
    controller = requestController;
    var signal = requestController.signal;
    var timedOut = false;
    var timeout = setTimeout(function () {
      timedOut = true;
      requestController.abort();
    }, 12000);
    if (fallback) {
      fallback.hidden = true;
      fallback.querySelector('[data-catalog-gutenberg]').href = 'https://www.gutenberg.org/ebooks/search/?query=' + encodeURIComponent(query);
      fallback.querySelector('[data-catalog-standard]').href = 'https://standardebooks.org/ebooks?query=' + encodeURIComponent(query);
    }
    if (start) start.hidden = true;
    status.classList.add("is-loading");
    list.setAttribute("aria-busy", "true");
    setStatus("Searching the catalogs…");
    clear(list);

    var jobs = [];
    if (activeSource === "all" || activeSource === "gutenberg")
      jobs.push(searchGutendex(query, signal));
    if (activeSource === "all" || activeSource === "standardebooks")
      jobs.push(searchStandardEbooks(query, signal));

    // A slow catalog must not hold back books already returned by another.
    var foundCount = 0;
    jobs = jobs.map(function (job) {
      return job.then(function (books) {
        if (!signal.aborted && controller === requestController) {
          render(books, true);
          foundCount += books.length;
          if (foundCount && jobs.length > 1)
            setStatus(foundCount + (foundCount === 1 ? " book" : " books") + " · checking the other catalog…");
        }
        return books;
      });
    });

    Promise.allSettled(jobs).then(function (settled) {
      clearTimeout(timeout);
      if (signal.aborted && !timedOut) return;
      status.classList.remove("is-loading");
      list.removeAttribute("aria-busy");
      var books = [];
      var failures = 0;
      settled.forEach(function (s) {
        if (s.status === "fulfilled") books = books.concat(s.value);
        else failures++;
      });
      if (fallback) fallback.hidden = failures === 0;
      if (books.length === 0) {
        setStatus(
          failures === jobs.length && jobs.length > 0
            ? "The catalogs couldn’t be reached. Try again, or open a catalog below."
            : "No books found for “" +
                query +
                "”. Try an author or a shorter title.",
        );
      } else {
        setStatus(
          books.length +
            (books.length === 1 ? " book" : " books") +
            (failures ? " · one catalog didn’t answer" : ""),
        );
      }
    });
  }

  /* Project Gutenberg via Gutendex — JSON, CORS-open. */
  function searchGutendex(query, signal) {
    var url = "https://gutendex.com/books/?search=" + encodeURIComponent(query);
    return fetch(url, { signal: signal })
      .then(function (r) {
        if (!r.ok) throw new Error("gutendex " + r.status);
        return r.json();
      })
      .then(function (json) {
        return (json.results || [])
          .slice(0, PER_SOURCE)
          .map(function (item) {
            var epub = null,
              cover = null;
            for (var type in item.formats) {
              var u = item.formats[type];
              if (type.indexOf("image/") === 0 && !cover) cover = u;
              if (type.indexOf("application/epub+zip") === 0 && !epub) epub = u;
            }
            return {
              source: "Project Gutenberg",
              // Gutendex titles sometimes leak MARC subfield markers ("… : $b …").
              title: (item.title || "Untitled").replace(/\s*:\s*\$b\s*/g, ": "),
              author:
                (item.authors && item.authors[0] && item.authors[0].name) || "",
              cover: cover,
              epub: epub,
            };
          })
          .filter(function (b) {
            return !!b.epub;
          });
      });
  }

  /* Standard Ebooks via their OPDS feed — Atom XML, CORS-open. */
  function searchStandardEbooks(query, signal) {
    var url =
      "https://standardebooks.org/feeds/opds/all?query=" +
      encodeURIComponent(query);
    return fetch(url, { signal: signal })
      .then(function (r) {
        if (!r.ok) throw new Error("standardebooks " + r.status);
        return r.text();
      })
      .then(function (text) {
        var doc = new DOMParser().parseFromString(text, "application/xml");
        var entries = Array.prototype.slice.call(
          doc.getElementsByTagName("entry"),
        );
        return entries
          .slice(0, PER_SOURCE)
          .map(function (entry) {
            var title = textOf(entry, "title");
            var author = "";
            var authorEl = entry.getElementsByTagName("author")[0];
            if (authorEl) author = textOf(authorEl, "name");
            var epub = null,
              cover = null;
            var links = entry.getElementsByTagName("link");
            for (var i = 0; i < links.length; i++) {
              var rel = links[i].getAttribute("rel") || "";
              var type = links[i].getAttribute("type") || "";
              var href = links[i].getAttribute("href") || "";
              if (!href) continue;
              var abs = new URL(href, "https://standardebooks.org").href;
              if (
                rel === "http://opds-spec.org/acquisition/open-access" &&
                type.indexOf("application/epub+zip") === 0 &&
                abs.indexOf("_advanced") === -1 &&
                !epub
              )
                epub = abs;
              if (rel === "http://opds-spec.org/image/thumbnail" && !cover)
                cover = abs;
            }
            return {
              source: "Standard Ebooks",
              title: title || "Untitled",
              author: author,
              cover: cover,
              epub: epub,
            };
          })
          .filter(function (b) {
            return !!b.epub;
          });
      });

    function textOf(parent, tag) {
      var el = parent.getElementsByTagName(tag)[0];
      return el ? el.textContent.trim() : "";
    }
  }

  /* ---------- Rendering — DOM building only, API text never hits innerHTML. */
  function render(books, append) {
    if (!append) clear(list);
    books.forEach(function (book) {
      // The app's ImportLink only unpacks http(s) targets; mirror that here.
      if (!/^https:\/\//i.test(book.epub)) return;
      var installURL = "libros://import?url=" + encodeURIComponent(book.epub);

      var li = el("li", "result");
      var cover = el("div", "cover");
      cover.setAttribute("aria-hidden", "true");
      cover.style.setProperty("--cover-tint", coverTint(book.title));
      var initial = el("div", "initial");
      initial.textContent = (book.title.trim().charAt(0) || "·").toUpperCase();
      cover.appendChild(initial);
      if (book.cover && /^https:\/\//i.test(book.cover)) {
        var img = document.createElement("img");
        img.alt = "";
        img.loading = "lazy";
        img.referrerPolicy = "no-referrer";
        img.addEventListener("error", function () {
          img.remove();
        });
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
      meta.appendChild(eyebrow);
      meta.appendChild(title);
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
      actions.appendChild(add);
      actions.appendChild(epub);

      li.appendChild(cover);
      li.appendChild(meta);
      li.appendChild(actions);
      list.appendChild(li);
    });
  }

  function el(tag, className) {
    var node = document.createElement(tag);
    node.className = className;
    return node;
  }
})();
