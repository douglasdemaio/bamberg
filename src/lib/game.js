const CLAIMS_KEY = 'bamberg-quest-claims';
const EXPORT_KEY = 'bamberg-quest-export';

function loadClaims() {
  try {
    const raw = localStorage.getItem(CLAIMS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveClaims(claims) {
  localStorage.setItem(CLAIMS_KEY, JSON.stringify(claims));
}

export function getClaim(slug) {
  const claims = loadClaims();
  return claims[slug] || null;
}

export function isClaimed(slug) {
  return !!getClaim(slug);
}

export function claimSite(slug, method = 'question') {
  const claims = loadClaims();
  if (claims[slug]) return false;
  claims[slug] = {
    claimed: true,
    method,
    timestamp: new Date().toISOString(),
  };
  saveClaims(claims);
  return true;
}

export function getAllClaims() {
  return loadClaims();
}

export function getClaimedSlugs() {
  return Object.keys(loadClaims());
}

export function getClaimCount() {
  return getClaimedSlugs().length;
}

export function normalizeAnswer(input) {
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

export function checkAnswer(input, validAnswers) {
  const normalized = normalizeAnswer(input);
  return validAnswers.some(a => normalizeAnswer(a) === normalized);
}
