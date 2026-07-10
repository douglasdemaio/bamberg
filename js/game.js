var CLAIMS_KEY = 'bamberg-quest-claims';

function loadClaims() {
  try {
    var raw = localStorage.getItem(CLAIMS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveClaims(claims) {
  localStorage.setItem(CLAIMS_KEY, JSON.stringify(claims));
}

function getClaim(slug) {
  var claims = loadClaims();
  return claims[slug] || null;
}

function isClaimed(slug) {
  return !!getClaim(slug);
}

function claimSite(slug, method) {
  if (method === undefined) method = 'question';
  var claims = loadClaims();
  if (claims[slug]) return false;
  claims[slug] = {
    claimed: true,
    method: method,
    timestamp: new Date().toISOString()
  };
  saveClaims(claims);
  return true;
}

function getAllClaims() {
  return loadClaims();
}

function getClaimedSlugs() {
  return Object.keys(loadClaims());
}

function getClaimCount() {
  return getClaimedSlugs().length;
}

function normalizeAnswer(input) {
  return input
    .toLowerCase()
    .replace(/[ß]/g, 'ss')
    .replace(/[ä]/g, 'ae')
    .replace(/[ö]/g, 'oe')
    .replace(/[ü]/g, 'ue')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function checkAnswer(input, validAnswers) {
  var normalized = normalizeAnswer(input);
  return validAnswers.some(function(a) {
    return normalizeAnswer(a) === normalized;
  });
}
