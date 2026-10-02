(function() {
  const DATA = window.UptimeEmpireData;
  const KEY = DATA.STORAGE_KEY;
  const BACKUP_KEY = KEY + ':backup';
  const WRITER_KEY = KEY + ':writer';
  const LEASE_MS = 45000;
  // Standard built-ins support browsers and VM harnesses without crypto.
  const tabId = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2) + '-' + Math.random().toString(36).slice(2);
  let claimedBefore = false;
  const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const number = value => typeof value === 'number' && Number.isFinite(value);
  const nonnegative = value => number(value) && value >= 0;
  const integer = value => nonnegative(value) && Number.isSafeInteger(value);
  const string = value => typeof value === 'string';
  const flag = value => typeof value === 'boolean';
  const optional = (object, key, check) => !own(object, key) || check(object[key]);
  const numericMap = value => record(value) && Object.values(value).every(nonnegative);
  const flagMap = value => record(value) && Object.values(value).every(item => flag(item) || nonnegative(item));
  const catalogHas = (name, id) => (DATA[name] || []).some(def => def.id === id);

  function jsonSafe(value, seen = new Set(), depth = 0) {
    if (depth > 64) return false;
    if (value === null || string(value) || flag(value)) return true;
    if (typeof value === 'number') return number(value);
    if (typeof value !== 'object' || seen.has(value)) return false;
    seen.add(value);
    const valid = Object.keys(value).every(key =>
      !['__proto__', 'prototype', 'constructor'].includes(key) && jsonSafe(value[key], seen, depth + 1));
    seen.delete(value);
    return valid;
  }

  function validGenerator(value) {
    return record(value) && string(value.id) && value.id.length > 0 &&
      optional(value, 'owned', integer) && optional(value, 'progress', nonnegative) &&
      ['running', 'automated', 'managerHired'].every(key => optional(value, key, flag));
  }

  function validMission(value) {
    return record(value) && string(value.id) && string(value.uid) &&
      number(value.remaining) && nonnegative(value.total) && record(value.reward) &&
      Object.entries(value.reward).every(([key, item]) => key === 'focusActive' ? flag(item) :
        key === 'focusRegionId' ? item === null || string(item) : nonnegative(item)) &&
      optional(value, 'teams', item => integer(item) && item > 0) &&
      ['name', 'icon', 'kind', 'focusRegionId'].every(key => optional(value, key, item => item === null || string(item))) &&
      optional(value, 'focusActive', flag) && optional(value, 'tier', string);
  }

  function validIncident(value) {
    return record(value) && string(value.typeId) && string(value.uid) &&
      number(value.remaining) && nonnegative(value.total) && nonnegative(value.severity) &&
      record(value.penalties) && Object.entries(value.penalties).every(([key, item]) =>
        key === 'categoryMult' ? record(item) && Object.values(item).every(number) : number(item)) &&
      optional(value, 'boss', flag) && optional(value, 'tags', item => Array.isArray(item) && item.every(string)) &&
      ['name', 'icon', 'desc'].every(key => optional(value, key, string));
  }

  function isValidState(state) {
    try {
      if (!record(state) || !jsonSafe(state) || !['version', 'credits', 'generators'].some(key => own(state, key))) return false;
      const numericFields = ['credits', 'lifetimeCredits', 'innovationPoints', 'ipFragments', 'research', 'debtPaid', 'prestigeMissionBaseline',
        'nextIncidentAt', 'incidentShieldRemaining', 'offlineCapHours', 'offlineEfficiency', 'lastActiveAt', 'lastSaveAt'];
      if (!numericFields.every(key => optional(state, key, nonnegative))) return false;
      if (!['version', 'officeTier', 'totalManagers', 'sideJobIndex', 'missionSlots', 'placementSchemaVersion']
        .every(key => optional(state, key, integer))) return false;
      if (!optional(state, 'generators', value => Array.isArray(value) && value.every(validGenerator))) return false;
      if (!optional(state, 'activeMissions', value => Array.isArray(value) && value.every(validMission))) return false;
      if (!optional(state, 'activeIncidents', value => Array.isArray(value) && value.every(validIncident))) return false;
      if (!['stats', 'regionLevels', 'missionCooldowns'].every(key => optional(state, key, numericMap))) return false;
      if (!['purchasedUpgrades', 'hiredSpecialists', 'purchasedPrestigeNodes', 'purchasedServices',
        'unlockedRegions', 'regionProjects', 'achievementsClaimed', 'challengeCompletions', 'contractClaims',
        'bossCatalog', 'campaignGoals', 'campaignGoalMoments', 'purchasedUiSkins']
        .every(key => optional(state, key, flagMap))) return false;
      if (!['purchasedCosmetics', 'equippedCosmetics', 'floorBotProfile', 'officeBuddy', 'multipliers',
        'placements', 'cosmeticPlacements', 'wallPlacements', 'wallDecorPlacements'].every(key => optional(state, key, record))) return false;
      if (!optional(state, 'purchasedCosmetics', value => Object.values(value).every(flagMap))) return false;
      if (!optional(state, 'equippedCosmetics', value => Object.values(value).every(string))) return false;
      if (!optional(state, 'regionMastery', value => record(value) && Object.values(value).every(item =>
        record(item) && optional(item, 'xp', nonnegative) && optional(item, 'level', integer)))) return false;
      if (!optional(state, 'equippedDecorations', value => Array.isArray(value) && value.every(string))) return false;
      if (!optional(state, 'consoleLog', Array.isArray)) return false;
      if (!optional(state, 'sideJobBaseline', value => value === null ||
        record(value) && integer(value.index) && nonnegative(value.value))) return false;
      if (!optional(state, 'officeLightSettings', value => record(value) && Object.values(value).every(item =>
        record(item) && flag(item.enabled) && number(item.brightness) && item.brightness >= 0 && item.brightness <= 2 &&
        (item.color === null || string(item.color) && /^#[0-9a-f]{6}$/i.test(item.color))))) return false;
      if (!optional(state, 'radioProfile', value => record(value) && optional(value, 'enabled', flag) &&
        optional(value, 'station', string) && optional(value, 'volume', item => number(item) && item >= 0 && item <= 0.2))) return false;
      if (!optional(state, 'floorBotProfile', value => record(value) &&
        ['voicePitch', 'voiceSpeed', 'speechFrequency'].every(key => optional(value, key, nonnegative)) &&
        ['name', 'voiceId', 'personality'].every(key => optional(value, key, string)) && optional(value, 'voiceEnabled', flag))) return false;
      if (!optional(state, 'soundEnabled', flag)) return false;
      if (!['currentPanel', 'currentWorkspaceSection', 'currentUpgradeView', 'currentShopView', 'currentSuiteTab',
        'currentRegionId', 'uiSkin', 'graphicsQuality'].every(key => optional(state, key, string))) return false;
      if (!['selectedChallengeId', 'activeChallengeId', 'activeDoctrineId', 'activeEraId']
        .every(key => optional(state, key, value => value === null || string(value)))) return false;
      return optional(state, 'purchaseMode', value => number(value) || value === 'MAX');
    } catch (_) { return false; }
  }

  function candidate(state) {
    if (!isValidState(state)) return null;
    const copy = JSON.parse(JSON.stringify(state));
    // Retired catalog entries must never reach simulation lookups.
    if (copy.generators) copy.generators = copy.generators.filter(item => catalogHas('generatorDefs', item.id));
    if (copy.activeMissions) copy.activeMissions = copy.activeMissions.filter(item => catalogHas('questDefs', item.id));
    if (copy.activeIncidents) copy.activeIncidents = copy.activeIncidents.filter(item => catalogHas('incidentDefs', item.typeId));
    return copy;
  }

  function parse(raw) {
    try { return raw ? candidate(JSON.parse(raw)) : null; }
    catch (_) { return null; }
  }

  function lease() {
    const raw = localStorage.getItem(WRITER_KEY);
    if (!raw) return null;
    try {
      const value = JSON.parse(raw);
      return record(value) && string(value.owner) && number(value.expiresAt) ? value : null;
    } catch (_) { return null; }
  }

  function remove(key) {
    if (typeof localStorage.removeItem === 'function') localStorage.removeItem(key);
    else localStorage.setItem(key, '');
  }

  const api = {
    lastLoadStatus: 'empty',
    isValidState,

    isWriterOwner() {
      try {
        const current = lease();
        return !!current && current.owner === tabId;
      } catch (_) { return false; }
    },

    canWrite() {
      try {
        const current = lease();
        return !!current && current.owner === tabId && current.expiresAt > Date.now();
      } catch (_) { return false; }
    },

    claimWriter(force = false) {
      try {
        const current = lease();
        if (!force && current && current.owner !== tabId && current.expiresAt > Date.now()) return false;
        localStorage.setItem(WRITER_KEY, JSON.stringify({ owner: tabId, expiresAt: Date.now() + LEASE_MS }));
        const owned = api.canWrite();
        if (owned) claimedBefore = true;
        return owned;
      } catch (_) { return false; }
    },

    releaseWriter() {
      try {
        if (!api.canWrite()) return false;
        remove(WRITER_KEY);
        return true;
      } catch (_) { return false; }
    },

    save(state) {
      try {
        const valid = candidate(state);
        if (!valid) return false;
        // Expiry can follow browser throttling; displacement must require an explicit claim.
        if (!api.canWrite() && !api.isWriterOwner() && (claimedBefore || !api.claimWriter())) return false;
        if (!api.claimWriter()) return false;
        const previous = parse(localStorage.getItem(KEY));
        const raw = JSON.stringify(valid);
        if (!api.canWrite()) return false;
        if (previous) localStorage.setItem(BACKUP_KEY, JSON.stringify(previous));
        if (!api.canWrite()) return false;
        localStorage.setItem(KEY, raw);
        return true;
      } catch (_) { return false; }
    },

    load() {
      try {
        const raw = localStorage.getItem(KEY);
        const primary = parse(raw);
        if (primary) { api.lastLoadStatus = 'loaded'; return primary; }
        const backupRaw = localStorage.getItem(BACKUP_KEY);
        const backup = parse(backupRaw);
        if (backup) { api.lastLoadStatus = 'recovered'; return backup; }
        api.lastLoadStatus = raw || backupRaw ? 'corrupt' : 'empty';
        return null;
      } catch (_) { api.lastLoadStatus = 'unavailable'; return null; }
    },

    export(state) {
      try {
        const valid = candidate(state);
        return valid ? btoa(unescape(encodeURIComponent(JSON.stringify(valid)))) : null;
      } catch (_) { return null; }
    },

    import(encoded) {
      try {
        if (!string(encoded)) return null;
        return parse(decodeURIComponent(escape(atob(encoded.trim()))));
      } catch (_) { return null; }
    },

    clear() {
      try {
        if (!api.canWrite()) return false;
        remove(BACKUP_KEY);
        if (!api.canWrite()) return false;
        remove(KEY);
        return true;
      } catch (_) { return false; }
    }
  };
  window.UptimeEmpireSave = api;
})();
