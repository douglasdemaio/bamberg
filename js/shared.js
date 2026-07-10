(function () {
  var btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.addEventListener('click', function () {
      var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('bq-theme', next); } catch (e) {}
    });
  }

  var sel = document.getElementById('lang-select');
  if (sel) {
    var saved = 'de';
    try { saved = localStorage.getItem('bq-lang') || 'de'; } catch (e) {}
    sel.value = saved;
    sel.addEventListener('change', function () {
      var lang = sel.value;
      document.documentElement.lang = lang;
      try { localStorage.setItem('bq-lang', lang); } catch (e) {}
      window.location.reload();
    });
  }
})();
