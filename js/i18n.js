(function() {
var allPromise = fetch('/i18n/all.json').then(function(r) { return r.json(); });
var curLang = 'de';
try { curLang = localStorage.getItem('bq-lang') || 'de'; } catch (e) {}

function t(key, lang) {
  if (!window.__bqTranslations) return key;
  var dict = window.__bqTranslations;
  var val = dict[lang] && dict[lang][key];
  if (!val && lang !== 'en') val = dict.en && dict.en[key];
  if (!val && lang !== 'de') val = dict.de && dict.de[key];
  return val || key;
}

function applyTranslations(lang) {
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.getAttribute('data-i18n');
    if (!key) return;
    var pStr = el.getAttribute('data-i18n-params');
    var text = t(key, lang);
    if (pStr) {
      try {
        var params = JSON.parse(pStr);
        for (var k in params) {
          text = text.replace('{' + k + '}', params[k]);
        }
      } catch (e) {}
    }
    el.textContent = text;
  });

  document.querySelectorAll('[data-i18n-html]').forEach(function(el) {
    var key = el.getAttribute('data-i18n-html');
    if (!key) return;
    var pStr = el.getAttribute('data-i18n-params');
    var text = t(key, lang);
    if (pStr) {
      try {
        var params = JSON.parse(pStr);
        for (var k in params) {
          text = text.replace('{' + k + '}', params[k]);
        }
      } catch (e) {}
    }
    el.innerHTML = text;
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'), lang);
  });

  document.querySelectorAll('[data-i18n-aria]').forEach(function(el) {
    el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria'), lang));
  });

  document.querySelectorAll('[data-i18n-title]').forEach(function(el) {
    el.setAttribute('title', t(el.getAttribute('data-i18n-title'), lang));
  });

  document.querySelectorAll('[data-i18n-content]').forEach(function(el) {
    var content = el.getAttribute('data-i18n-content-' + lang);
    if (!content) content = el.getAttribute('data-i18n-content-en');
    if (!content) content = el.getAttribute('data-i18n-content-de');
    if (content) el.innerHTML = content;
  });

  var skipLink = document.getElementById('skip-link');
  if (skipLink) skipLink.textContent = t('site.skip_link', lang);

  var themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.setAttribute('aria-label', t('site.theme_toggle', lang));
    themeToggle.setAttribute('title', t('site.theme_toggle', lang));
  }
}

window.__bqt = t;
window.__applyBqTranslations = applyTranslations;

allPromise.then(function(data) {
  window.__bqTranslations = data;
  applyTranslations(curLang);
});
})();
