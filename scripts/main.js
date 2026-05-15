// =========================================================================
// Sahasra Blowers — main.js
// Mobile nav toggle, scroll reveal, hero Ken Burns trigger, footer year.
// =========================================================================

(function () {
  'use strict';

  // -- site.json substitution ---------------------------------------------
  // Replaces {{KEY}} tokens in the DOM with values from /site.json.
  // Keys with an empty value are left as the visible placeholder so the
  // owner sees what still needs to be filled in.
  var TOKEN_RE = /\{\{\s*([A-Z0-9_]+)\s*\}\}/g;

  function applyConfig(config) {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    var node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue && TOKEN_RE.test(node.nodeValue)) {
        TOKEN_RE.lastIndex = 0;
        nodes.push(node);
      }
    }
    nodes.forEach(function (n) {
      n.nodeValue = n.nodeValue.replace(TOKEN_RE, function (match, key) {
        if (Object.prototype.hasOwnProperty.call(config, key) && config[key] !== '' && config[key] != null) {
          return String(config[key]);
        }
        return match;
      });
    });
  }

  fetch('site.json', { cache: 'no-cache' })
    .then(function (res) { return res.ok ? res.json() : {}; })
    .catch(function () { return {}; })
    .then(function (config) {
      var cleaned = {};
      Object.keys(config || {}).forEach(function (k) {
        if (k[0] !== '_') cleaned[k] = config[k];
      });
      applyConfig(cleaned);
    });

  // -- Footer year ---------------------------------------------------------
  var yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // -- Mobile nav toggle ---------------------------------------------------
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (event) {
      if (event.target instanceof HTMLAnchorElement) {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // -- Scroll reveal -------------------------------------------------------
  var revealTargets = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealTargets.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // -- Hero Ken Burns trigger ---------------------------------------------
  var heroArt = document.querySelector('.hero-art');
  if (heroArt) {
    requestAnimationFrame(function () {
      heroArt.classList.add('in-view');
    });
  }

})();
