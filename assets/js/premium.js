(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function updateNavHeightVar(nav) {
    if (!nav) return;
    document.documentElement.style.setProperty("--pm-nav-h", nav.offsetHeight + "px");
  }

  function setupSmoothNav(nav) {
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav-link[href^="#"]'));
    if (!links.length) return;

    if (window.jQuery) {
      window.jQuery(".nav-link").off("click");
    }

    links.forEach(function (link) {
      link.addEventListener("click", function (event) {
        var hash = link.getAttribute("href");
        var target = hash ? document.querySelector(hash) : null;
        if (!target) return;

        event.preventDefault();

        var offset = nav ? nav.offsetHeight + 12 : 88;
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;

        window.scrollTo({
          top: top,
          behavior: prefersReducedMotion ? "auto" : "smooth"
        });

        var collapse = document.getElementById("navbarSupportedContent");
        if (collapse && collapse.classList.contains("show") && window.jQuery) {
          window.jQuery(collapse).collapse("hide");
        }
      });
    });
  }

  function setupActiveNav() {
    var sections = Array.prototype.slice.call(document.querySelectorAll("section[id]"));
    var linksById = {};

    sections.forEach(function (section) {
      var link = document.querySelector('.nav-link[href="#' + section.id + '"]');
      if (link) linksById[section.id] = link;
    });

    function setActive(id) {
      Object.keys(linksById).forEach(function (key) {
        linksById[key].classList.toggle("active", key === id);
      });
    }

    if ("IntersectionObserver" in window) {
      var mostVisible = { id: "", ratio: 0 };
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && entry.intersectionRatio >= mostVisible.ratio) {
            mostVisible = { id: entry.target.id, ratio: entry.intersectionRatio };
          }
        });
        if (mostVisible.id) setActive(mostVisible.id);
      }, {
        threshold: [0.2, 0.45, 0.7],
        rootMargin: "-18% 0px -56% 0px"
      });

      sections.forEach(function (section) {
        observer.observe(section);
      });
    } else {
      function onScroll() {
        var current = sections[0] ? sections[0].id : "";
        sections.forEach(function (section) {
          if (window.pageYOffset >= section.offsetTop - 120) {
            current = section.id;
          }
        });
        setActive(current);
      }
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  }

  function setupReveals() {
    var revealNodes = Array.prototype.slice.call(
      document.querySelectorAll("[data-reveal], .timeline li, .custom-card")
    );

    revealNodes.forEach(function (node) {
      if (!node.hasAttribute("data-reveal")) {
        node.setAttribute("data-reveal", "");
      }
    });

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealNodes.forEach(function (node) {
        node.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px"
    });

    revealNodes.forEach(function (node) {
      observer.observe(node);
    });
  }

  function setupLightbox() {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
    if (!cards.length) return;

    cards.forEach(function (card) {
      var title = card.getAttribute("data-caption");
      if (!title) {
        var heading = card.querySelector(".overlay-infos h5");
        if (heading) {
          card.setAttribute("data-caption", heading.textContent.trim());
        }
      }
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      if (!card.getAttribute("aria-label")) {
        card.setAttribute("aria-label", card.getAttribute("data-caption") || "Open image");
      }
    });

    var lightbox = document.createElement("div");
    lightbox.className = "premium-lightbox";
    lightbox.setAttribute("aria-hidden", "true");
    lightbox.innerHTML = [
      '<button class="premium-lightbox__close" type="button" aria-label="Close image viewer">×</button>',
      '<div class="premium-lightbox__content" role="dialog" aria-modal="true">',
      '<img class="premium-lightbox__image" src="" alt="">',
      '<p class="premium-lightbox__caption"></p>',
      "</div>"
    ].join("");

    document.body.appendChild(lightbox);

    var closeButton = lightbox.querySelector(".premium-lightbox__close");
    var image = lightbox.querySelector(".premium-lightbox__image");
    var caption = lightbox.querySelector(".premium-lightbox__caption");
    var lastFocused = null;

    function closeLightbox() {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lightbox-open");
      if (lastFocused) lastFocused.focus();
    }

    function openLightbox(card) {
      var sourceImage = card.querySelector("img");
      if (!sourceImage) return;

      lastFocused = document.activeElement;
      image.src = sourceImage.getAttribute("src");
      image.alt = sourceImage.getAttribute("alt") || "";
      caption.textContent = card.getAttribute("data-caption") || "";

      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("lightbox-open");
      closeButton.focus();
    }

    cards.forEach(function (card) {
      card.addEventListener("click", function () {
        openLightbox(card);
      });

      card.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openLightbox(card);
        }
      });
    });

    closeButton.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
        closeLightbox();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var nav = document.querySelector(".navbar");
    updateNavHeightVar(nav);
    setupSmoothNav(nav);
    setupActiveNav();
    setupReveals();
    setupLightbox();

    window.addEventListener("resize", function () {
      updateNavHeightVar(nav);
    });
  });
})();
