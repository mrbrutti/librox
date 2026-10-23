import {coverMarkup, safeHTTPS} from "./book-cover.mjs";

(function () {
  "use strict";
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
  var keyboardSearch = false;

  document.addEventListener('keydown', function () { keyboardSearch = true; }, {passive:true});
  document.addEventListener('pointerdown', function () { keyboardSearch = false; }, {passive:true});

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
      controller = null;
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
    var animateResults = !keyboardSearch && !matchMedia('(prefers-reduced-motion: reduce)').matches;
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
          render(books, true, animateResults);
          foundCount += books.length;
          if (foundCount && jobs.length > 1)
            setStatus(foundCount + (foundCount === 1 ? " book" : " books") + " · checking the other catalog…");
        }
        return books;
      });
    });

    Promise.allSettled(jobs).then(function (settled) {
      clearTimeout(timeout);
      if (controller !== requestController) return;
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
              subjects: item.subjects || [],
            };
          })
          .filter(function (b) {
            return !!safeHTTPS(b.epub);
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
            var subjects = Array.prototype.slice.call(entry.getElementsByTagName('category')).map(function (category) {
              return category.getAttribute('term') || category.getAttribute('label') || '';
            });
            return {
              source: "Standard Ebooks",
              title: title || "Untitled",
              author: author,
              cover: cover,
              epub: epub,
              subjects: subjects,
            };
          })
          .filter(function (b) {
            return !!safeHTTPS(b.epub);
          });
      });

    function textOf(parent, tag) {
      var el = parent.getElementsByTagName(tag)[0];
      return el ? el.textContent.trim() : "";
    }
  }

  /* Metadata stays in text nodes. Cover markup escapes every title/author/URL. */
  function render(books, append, animateResults) {
    if (!append) clear(list);
    books.forEach(function (book) {
      // The app's ImportLink only unpacks http(s) targets; mirror that here.
      if (!safeHTTPS(book.epub)) return;
      var installURL = "libros://import?url=" + encodeURIComponent(book.epub);

      var li = el("li", "result");
      var cover = el("a", "result-cover");
      cover.href = installURL;
      cover.setAttribute('aria-label', 'Open ' + book.title + ' in Librox');
      cover.innerHTML = coverMarkup(book);
      var jacket = cover.querySelector('.book-jacket');
      if (jacket) {
        function revealJacket() {
          if (jacket.naturalWidth) jacket.classList.add('is-loaded');
          else jacket.remove();
        }
        jacket.addEventListener('load', revealJacket, {once:true});
        jacket.addEventListener('error', function () { jacket.remove(); }, {once:true});
        if (jacket.complete) revealJacket();
      }

      var meta = el("div", "meta");
      var source = el("div", "source");
      source.textContent = book.source;
      var title = el("h2", "title");
      title.textContent = book.title;
      var author = el("div", "author");
      author.textContent = book.author;
      meta.appendChild(title);
      if (book.author) meta.appendChild(author);
      meta.appendChild(source);

      var actions = el("div", "actions");
      var add = document.createElement("a");
      add.className = "btn-add";
      add.href = installURL;
      add.textContent = "Add to Librox";
      var arrow = el('span', 'icon i-arrow-right');
      arrow.setAttribute('aria-hidden', 'true');
      add.appendChild(arrow);
      add.setAttribute("aria-label", "Add " + book.title + " to Librox");
      var epub = document.createElement("a");
      epub.className = "btn-epub";
      epub.href = book.epub;
      epub.textContent = "Download EPUB";
      epub.setAttribute("aria-label", "Download " + book.title + " as EPUB");
      actions.appendChild(add);
      actions.appendChild(epub);

      li.appendChild(cover);
      li.appendChild(meta);
      li.appendChild(actions);
      list.appendChild(li);
      if (animateResults && li.animate) {
        li.animate([{opacity:.55, transform:'translateY(6px)'}, {opacity:1, transform:'none'}], {
          duration:240, delay:Math.min(list.children.length - 1, 4) * 35,
          easing:'cubic-bezier(.23,1,.32,1)'
        });
      }
    });
  }

  function el(tag, className) {
    var node = document.createElement(tag);
    node.className = className;
    return node;
  }
})();
