(function () {
  function fmtTime(timeStr) {
    if (!timeStr) return '—';
    if (timeStr.indexOf(':') === -1) return timeStr;
    var parts = timeStr.split(':');
    var h = parseInt(parts[0], 10);
    var m = parts[1] || '00';
    if (h >= 24) h -= 24;
    return (h < 10 ? '0' + h : '' + h) + ':' + m;
  }

  function pickSchedule(line) {
    var tt = window.__todayType || 'weekday';
    return line[tt === 'sat' ? 'sat' : (tt === 'sun' ? 'sun' : 'weekday')] || line.weekday;
  }

  function fastestJourney(dest, todayType) {
    var best = null;
    dest.lines.forEach(function (line) {
      var s = line[todayType] || line.weekday;
      if (!s) return;
      if (!best || s.journey_min < best) best = s.journey_min;
    });
    return best;
  }

  function renderDest(dest, sites) {
    var lang = document.documentElement.lang || 'de';
    var pickLang = window.__bqPickLang || function (o) { return o && (o[lang] || o.en || o.de); };

    var site = sites.find(function (s) { return s.slug === dest.poi_slug; });
    var name = pickLang(site && site.name) || dest.stop.name;
    var tagline = site ? pickLang(site.history_60w) || '' : '';
    var url = '/site.html?slug=' + dest.poi_slug;

    var todayType = dest.today_type || 'weekday';
    var journey = fastestJourney(dest, todayType) || '—';
    var schedHtml = '';
    dest.lines.forEach(function (line) {
      var s = pickSchedule(line);
      if (!s) return;
      var tripLabel = s.trip_count;
      var first = fmtTime(s.first_dep);
      var last = fmtTime(s.last_dep);
      schedHtml +=
        '<p class="sched-row">' +
          '<span class="line-badge">Linie ' + line.line + '</span> ' +
          '<strong>' + first + '</strong> – <strong>' + last + '</strong> · ' +
          tripLabel + '× <span data-i18n="beyond.trips">Abfahrten</span> · ' +
          (s.avg_headway_min > 0 ? 'ca. ' + s.avg_headway_min + ' min <span data-i18n="beyond.takt">Takt</span>' : '') +
        '</p>';
    });

    var claimed = window.__linienpassClaimed ? window.__linienpassClaimed(dest.poi_slug) : false;
    var stampHtml = claimed
      ? '<span class="stamp-claimed-tag">✅ <span data-i18n="beyond.stamped">Gestempelt</span></span>'
      : '<button type="button" class="stamp-btn" data-stamp="' + dest.poi_slug + '">🔑 <span data-i18n="beyond.stamp_btn">Abstempeln</span></button>';

    var walkHtml = dest.walk_from_zob && dest.walk_m
      ? '<li>🚶 ' + dest.walk_m + ' m <span data-i18n="beyond.walk_from_stop">vom Busstopp</span></li>'
      : '';

    var card = document.createElement('article');
    card.className = 'dest-card';
    card.dataset.slug = dest.poi_slug;
    card.innerHTML =
      '<div class="dest-head">' +
        '<div>' +
          '<h3 class="dest-title"><a href="' + url + '">' + name + '</a></h3>' +
          (tagline ? '<p class="dest-tagline">' + tagline + '</p>' : '') +
        '</div>' +
        '<span class="dest-time-badge">🕓 ca. ' + journey + ' min</span>' +
      '</div>' +
      '<ul class="dest-meta">' +
        '<li>🚌 ' + dest.stop.name + '</li>' +
        walkHtml +
      '</ul>' +
      '<div class="lines-row">' + schedHtml + '</div>' +
      '<p class="sched-note"><span data-i18n="beyond.fahrplan_note">Fahrplan – keine Echtzeit.</span></p>' +
      '<div class="stamp-status">' + stampHtml + '</div>';

    return card;
  }

  function updateLinienpassStatus() {
    var count = window.__countLinienpass ? window.__countLinienpass() : 0;
    var el = document.getElementById('linienpass-count');
    var done = document.getElementById('linienpass-complete');
    if (el) el.textContent = count;
    if (done) done.hidden = !(window.__linienpassComplete && window.__linienpassComplete());
  }

  window.initBeyond = function (lang, transit) {
    window.__todayType = transit.today_types && transit.today_types.bambados || 'weekday';
    var root = document.getElementById('beyond-root');
    var rBtn = document.getElementById('roulette-btn');
    var rResult = document.getElementById('roulette-result');
    if (!root) return;

    fetch('/data/sites.json')
      .then(function (r) { return r.json(); })
      .then(function (sites) {
        root.innerHTML = '';
        transit.destinations.forEach(function (dest) {
          root.appendChild(renderDest(dest, sites));
        });
        bindStampButtons();
        updateLinienpassStatus();
        if (typeof window.__applyBqTranslations === 'function') {
          window.__applyBqTranslations(lang);
        }

        if (rBtn && rResult) {
          rBtn.addEventListener('click', function () {
            var t = window.__todayType || 'weekday';
            var withSched = transit.destinations.filter(function (d) {
              return d.lines.some(function (l) { return l[t] || l.weekday; });
            });
            var pool = withSched.length ? withSched : transit.destinations;
            var pick = pool[Math.floor(Math.random() * pool.length)];
            var site = sites.find(function (s) { return s.slug === pick.poi_slug; });
            var name = site ? (window.__bqPickLang ? window.__bqPickLang(site.name) : site.name.de) : pick.stop.name;
            rResult.innerHTML = '<span data-i18n="beyond.roulette_goes_to">Der Bus fährt nach</span> <strong>' + name + '</strong> (' + pick.stop.name + ').';
            if (typeof window.__applyBqTranslations === 'function') window.__applyBqTranslations(lang);
          });
        }
      });
  };

  function bindStampButtons() {
    document.querySelectorAll('[data-stamp]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var slug = btn.dataset.stamp;
        if (window.__stampLinienpass && window.__stampLinienpass(slug)) {
          btn.outerHTML = '<span class="stamp-claimed-tag">✅ <span data-i18n="beyond.stamped">Gestempelt</span></span>';
          updateLinienpassStatus();
          if (typeof window.__applyBqTranslations === 'function') window.__applyBqTranslations(document.documentElement.lang || 'de');
        }
      });
    });
  }
})();