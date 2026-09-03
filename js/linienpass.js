(function () {
  var LINIENPASS_SLUGS = ['bambados', 'schloss-seehof', 'erba-park', 'bruderwald', 'altenburg'];

  function getLinienpassKey(slug) {
    return 'bamberg-quest-claims-' + slug;
  }

  function linienpassClaimed(slug) {
    try {
      return localStorage.getItem(getLinienpassKey(slug)) === '1';
    } catch (_) { return false; }
  }

  function stampLinienpass(slug) {
    try {
      localStorage.setItem(getLinienpassKey(slug), '1');
      return true;
    } catch (_) { return false; }
  }

  function countLinienpass() {
    return LINIENPASS_SLUGS.filter(linienpassClaimed).length;
  }

  function linienpassComplete() {
    return countLinienpass() === LINIENPASS_SLUGS.length;
  }

  window.__linienpassClaimed = linienpassClaimed;
  window.__stampLinienpass = stampLinienpass;
  window.__countLinienpass = countLinienpass;
  window.__linienpassComplete = linienpassComplete;
  window.__linienpassSlugs = LINIENPASS_SLUGS;
})();