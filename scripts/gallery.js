// =========================================================================
// Sahasra Blowers — gallery.js
// Loads assets/gallary/manifest.json, renders a masonry grid with lazy
// loading, and provides a lightweight lightbox with keyboard / swipe nav.
// =========================================================================

(function () {
  'use strict';

  var grid = document.getElementById('gallery-grid');
  var overlay = document.getElementById('lightbox');
  if (!grid || !overlay) return;

  var lbImage = overlay.querySelector('#lb-image');
  var lbCaption = overlay.querySelector('#lb-caption');
  var lbMeta = overlay.querySelector('#lb-meta');
  var lbClose = overlay.querySelector('.lb-close');
  var lbPrev = overlay.querySelector('.lb-prev');
  var lbNext = overlay.querySelector('.lb-next');

  var galleryDir = 'assets/gallary/';
  var manifestUrl = galleryDir + 'manifest.json';

  var images = [];
  var current = 0;

  // ----------------------------------------------------------------------
  // Render grid
  // ----------------------------------------------------------------------
  function render(items) {
    if (!items.length) {
      grid.innerHTML = '<p class="gallery-empty">No images yet — check back soon.</p>';
      return;
    }
    var frag = document.createDocumentFragment();
    items.forEach(function (item, idx) {
      var fig = document.createElement('figure');
      fig.className = 'gallery-item';
      fig.setAttribute('role', 'listitem');
      fig.setAttribute('data-index', String(idx));
      fig.tabIndex = 0;
      fig.setAttribute('aria-label', item.caption || item.file);

      var img = document.createElement('img');
      img.src = encodeURI(galleryDir + item.file);
      img.alt = item.caption || '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.style.objectFit = item.fit === 'cover' ? 'cover' : 'contain';
      // Fallback if image fails — collapse the tile gracefully
      img.addEventListener('error', function () { fig.style.display = 'none'; });

      fig.appendChild(img);

      if (item.caption) {
        var cap = document.createElement('figcaption');
        cap.textContent = item.caption;
        fig.appendChild(cap);
      }

      fig.addEventListener('click', function () { openAt(idx); });
      fig.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openAt(idx);
        }
      });

      frag.appendChild(fig);
    });
    grid.innerHTML = '';
    grid.appendChild(frag);
  }

  // ----------------------------------------------------------------------
  // Lightbox controls
  // ----------------------------------------------------------------------
  function openAt(index) {
    if (!images.length) return;
    current = ((index % images.length) + images.length) % images.length;
    show(current);
    overlay.hidden = false;
    overlay.classList.add('is-open');
    document.body.classList.add('lb-locked');
    lbClose.focus();
  }

  function show(index) {
    var item = images[index];
    if (!item) return;
    lbImage.src = encodeURI(galleryDir + item.file);
    lbImage.alt = item.caption || '';
    lbCaption.textContent = item.caption || '';
    lbMeta.textContent = (index + 1) + ' / ' + images.length;
  }

  function close() {
    overlay.classList.remove('is-open');
    overlay.hidden = true;
    document.body.classList.remove('lb-locked');
    lbImage.src = '';
  }

  function next() { show(current = (current + 1) % images.length); }
  function prev() { show(current = (current - 1 + images.length) % images.length); }

  lbClose.addEventListener('click', close);
  lbNext.addEventListener('click', next);
  lbPrev.addEventListener('click', prev);
  overlay.addEventListener('click', function (event) {
    if (event.target === overlay) close();
  });
  document.addEventListener('keydown', function (event) {
    if (overlay.hidden) return;
    if (event.key === 'Escape') close();
    else if (event.key === 'ArrowRight') next();
    else if (event.key === 'ArrowLeft') prev();
  });

  // Touch swipe
  var touchStart = null;
  overlay.addEventListener('touchstart', function (event) {
    if (event.touches.length === 1) touchStart = event.touches[0].clientX;
  }, { passive: true });
  overlay.addEventListener('touchend', function (event) {
    if (touchStart == null) return;
    var dx = event.changedTouches[0].clientX - touchStart;
    if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); }
    touchStart = null;
  });

  // ----------------------------------------------------------------------
  // Boot
  // ----------------------------------------------------------------------
  fetch(manifestUrl, { cache: 'no-cache' })
    .then(function (res) {
      if (!res.ok) throw new Error('Manifest HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) {
      images = Array.isArray(data && data.images) ? data.images : [];
      render(images);
    })
    .catch(function (err) {
      console.error('[gallery] Failed to load manifest:', err);
      grid.innerHTML = '<p class="gallery-empty">Could not load gallery. Please refresh the page.</p>';
    });

})();
