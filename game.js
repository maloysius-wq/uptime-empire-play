(function() {
  const DATA = window.UptimeEmpireData;
  // Keep every interface skin available while the new workspace is being playtested.
  // Their normal unlock definitions remain in data.js for restoration after testing.
  const UI_SKIN_PLAYTEST_UNLOCK_ALL = true;
  const WORKSPACE_SECTION_DEFAULTS = {
    command: 'overview',
    infrastructure: 'fleet',
    people: 'operations',
    network: 'regions',
    progress: 'overhaul'
  };
  const WORKSPACE_SECTION_BY_PANEL = {
    command: ['overview'],
    infrastructure: ['fleet', 'upgrades'],
    people: ['operations', 'staff'],
    network: ['regions'],
    progress: ['overhaul', 'skins', 'achievements']
  };

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function freshGeneratorState(def) {
    return {
      id: def.id,
      owned: 0,
      progress: 0,
      running: false,
      automated: false,
      managerHired: false
    };
  }

  function numericMap(source = {}) {
    const out = {};
    Object.entries(source || {}).forEach(([key, value]) => {
      if (typeof value === 'number') out[key] = value;
      else if (value) out[key] = 1;
    });
    return out;
  }

  function timestampMap(source = {}) {
    const out = {};
    Object.entries(source || {}).forEach(([key, value]) => {
      if (!value) return;
      out[key] = typeof value === 'number' ? value : Date.now();
    });
    return out;
  }

  function baseMultipliers() {
    return {
      globalIncome: 1,
      automatedIncome: 1,
      speed: 1,
      category: DATA.categories.reduce((acc, cat) => {
        acc[cat] = 1;
        return acc;
      }, {}),
      costReduction: 0,
      managerDiscount: 0,
      capacityBonus: 0,
      regionCostReduction: 0,
      highTierCapacityReduction: 0,
      prestigeIncomeBonus: 0,
      startingCredits: 0,
      incidentChanceReduction: 0,
      incidentDurationReduction: 0,
      incidentSeverityReduction: 0,
      responsePower: 0,
      missionSpeed: 1,
      missionReward: 1,
      researchBonus: 1,
      missionCooldownReduction: 0,
      officeSlotsBonus: 0,
      categoryIncidentShield: DATA.categories.reduce((acc, cat) => {
        acc[cat] = 0;
        return acc;
      }, {})
    };
  }

  const SLOTLESS_COSMETIC_CATEGORIES = ['outfit', 'wallFinish', 'floorFinish', 'deskFinish', 'chairFinish'];
  const PLACEMENT_SCHEMA_VERSION = 2;
  const PLACEMENT_ZONES = ['wall', 'floor', 'desk'];
  const WALL_PLACEMENT_FACES = ['back', 'left', 'front', 'right'];
  const PLACEMENT_ZONE_BY_DECOR_ID = {
    'neon-sign': 'wall', 'plant-wall': 'wall', 'wall-monitor': 'wall', 'framed-cert': 'wall', 'server-poster': 'wall', 'moon-window': 'wall',
    'uplink-map': 'wall', 'award-shelf': 'wall', 'maintenance-clock': 'wall', 'fiber-art': 'wall', 'incident-board': 'wall', 'snack-shelf': 'wall', 'ops-beacon': 'wall', 'runbook-board': 'wall',
    'desk-mat': 'desk', 'tower-stack': 'desk', 'aquarium': 'desk', 'keyboard-glow': 'desk', 'mini-rack': 'desk', 'coffee-drone': 'desk',
    'desk-bonsai': 'desk', 'projector-pad': 'desk', 'lava-lamp': 'desk',
    'holo-globe': 'floor', 'chair-upgrade': 'floor', 'led-strip': 'floor', 'floor-runner': 'floor', 'hex-rug': 'floor', 'floor-bot': 'floor', 'light-grid': 'floor',
    'parts-bins': 'floor', 'retro-console': 'floor', 'bookcase': 'floor', 'model-sat': 'floor', 'cold-spares': 'floor', 'pendant-light': 'floor', 'server-island': 'floor', 'uplink-radio': 'floor'
  };

  function emptyPlacementBuckets() {
    return { wall: {}, floor: {}, desk: {} };
  }

  function normalizePlacementZone(zone = 'floor') {
    return PLACEMENT_ZONES.includes(zone) ? zone : 'floor';
  }

  function normalizeCosmeticPlacement(zone, placement) {
    if (!placement || typeof placement !== 'object') return null;
    const safeZone = normalizePlacementZone(zone);
    const x = Math.max(0, Math.min(1, Number(placement.x)));
    const y = Math.max(0, Math.min(1, Number(placement.y)));
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    if (safeZone === 'wall') {
      const face = WALL_PLACEMENT_FACES.includes(placement.face) ? placement.face : 'back';
      return { x, y, face };
    }
    const rotation = Number.isFinite(Number(placement.rotation)) ? Number(placement.rotation) : 0;
    return { x, y, rotation };
  }

  function forEachPlacementEntry(source, visit) {
    if (!source || typeof source !== 'object') return;
    PLACEMENT_ZONES.forEach(zone => {
      const bucket = source[zone];
      if (!bucket || typeof bucket !== 'object' || Array.isArray(bucket)) return;
      Object.entries(bucket).forEach(([id, placement]) => visit(zone, id, placement));
    });
    Object.entries(source).forEach(([id, placement]) => {
      if (PLACEMENT_ZONES.includes(id) || !placement || typeof placement !== 'object' || Array.isArray(placement)) return;
      if (!Object.prototype.hasOwnProperty.call(placement, 'x') || !Object.prototype.hasOwnProperty.call(placement, 'y')) return;
      const inferredZone = PLACEMENT_ZONE_BY_DECOR_ID[id] || (placement.face ? 'wall' : 'floor');
      visit(inferredZone, id, placement);
    });
  }

  function normalizePlacementBuckets(...sources) {
    const out = emptyPlacementBuckets();
    sources.forEach(source => {
      forEachPlacementEntry(source, (zone, id, placement) => {
        if (!id) return;
        const canonicalZone = normalizePlacementZone(PLACEMENT_ZONE_BY_DECOR_ID[id] || zone);
        const normalized = normalizeCosmeticPlacement(canonicalZone, placement);
        if (!normalized) return;
        PLACEMENT_ZONES.forEach(otherZone => {
          if (otherZone !== canonicalZone) delete out[otherZone][id];
        });
        out[canonicalZone][id] = normalized;
      });
    });
    return out;
  }

  function syncPlacementCompatibility(state) {
    if (!state || typeof state !== 'object') return state;
    const canonical = normalizePlacementBuckets(state.cosmeticPlacements);
    state.cosmeticPlacements = canonical;
    state.placements = normalizePlacementBuckets(canonical);
    state.placementSchemaVersion = PLACEMENT_SCHEMA_VERSION;
    return state;
  }


const QUEST_REGION_FOCUS = {
  helpdesk: 'garage',
  migration: 'business',
  audit: 'business',
  'colo-onboard': 'business',
  'r-and-d': 'euro',
  recovery: 'north',
  'noc-refresh': 'useast',
  'peering-deal': 'useast',
  'chaos-drill': 'euro',
  'supply-chain': 'north',
  'fabric-lab': 'euro',
  'ai-benchmark': 'apac',
  'orbital-sync': 'core',
  'quantum-probe': 'core',
  'global-failover': 'north',
  'moon-market': 'lunar',
  'dark-fiber': 'useast',
  'lunar-black': 'lunar',
  continuum: 'core',
  'fleet-orchestration': 'apac',
  'deep-vault-theorem': 'lunar',
  'planetary-twin': 'core',
  'red-planet-tender': 'lunar',
  'sovereign-cache': 'core',
  'chrono-brokerage': 'lunar'
};

const QUEST_FOCUS_REWARD_MULT = 1.18;
const QUEST_FOCUS_DURATION_MULT = 0.88;

  function createNewState() {
    const regionLevels = {};
    const unlockedRegions = {};
    const regionProjects = {};
    DATA.regionDefs.forEach((region, index) => {
      regionLevels[region.id] = 0;
      unlockedRegions[region.id] = index === 0;
      regionProjects[region.id] = false;
    });

    return {
      version: 9,
      credits: 20,
      lifetimeCredits: 0,
      innovationPoints: 0,
      ipFragments: 0,
      research: 0,
      purchaseMode: 1,
      currentPanel: 'command',
      currentWorkspaceSection: 'overview',
      currentUpgradeView: 'global',
      currentShopView: 'office',
      currentSuiteTab: 'office',
      currentRegionId: DATA.regionDefs[0].id,
      totalManagers: 0,
      generators: DATA.generatorDefs.map(freshGeneratorState),
      purchasedUpgrades: {},
      hiredSpecialists: {},
      purchasedPrestigeNodes: {},
      purchasedServices: {},
      unlockedRegions,
      regionLevels,
      regionProjects,
      purchasedCosmetics: Object.keys(DATA.cosmetics).reduce((acc, category) => {
        acc[category] = { default: true };
        return acc;
      }, {}),
      equippedCosmetics: {
        outfit: 'default',
        wallFinish: 'default',
        floorFinish: 'default',
        deskFinish: 'default',
        chairFinish: 'default'
      },
      uiSkin: 'founder',
      purchasedUiSkins: { founder: true },
      floorBotProfile: {
        name: 'Floor Bot',
        voicePitch: 1,
        voiceSpeed: 1,
        speechFrequency: 1,
        voiceId: '',
        voiceEnabled: true,
        personality: 'funny'
      },
      equippedDecorations: [],
      placementSchemaVersion: PLACEMENT_SCHEMA_VERSION,
      cosmeticPlacements: emptyPlacementBuckets(),
      placements: emptyPlacementBuckets(),
      officeTier: 0,
      achievementsClaimed: {},
      selectedChallengeId: null,
      activeChallengeId: null,
      challengeCompletions: {},
      activeDoctrineId: null,
      activeEraId: null,
      contractClaims: {},
      sideJobIndex: 0,
      regionMastery: Object.fromEntries(DATA.regionDefs.map(region => [region.id, { xp: 0, level: 0 }])),
      bossCatalog: {},
      campaignGoals: {},
      campaignGoalMoments: {},
      missionSlots: 1,
      activeMissions: [],
      missionCooldowns: {},
      activeIncidents: [],
      nextIncidentAt: Date.now() + 150000,
      incidentShieldRemaining: 0,
      offlineCapHours: 4,
      offlineEfficiency: 0.5,
      multipliers: baseMultipliers(),
      stats: {
        incidentsResolved: 0,
        missionsCompleted: 0,
        prestiges: 0,
        manualRuns: 0,
        researchSpent: 0
      },
      lastActiveAt: Date.now(),
      lastSaveAt: Date.now(),
      soundEnabled: true,
      graphicsQuality: 'performance',
      consoleLog: [],
      officeBuddy: {
        x: 30,
        facingLeft: false,
        nextMoveAt: Date.now() + 2000
      }
    };
  }

  function mergeState(loaded) {
    const fresh = createNewState();
    if (!loaded || typeof loaded !== 'object') return fresh;

    const merged = deepClone(fresh);
    Object.assign(merged, loaded);

    merged.generators = DATA.generatorDefs.map(def => {
      const found = (loaded.generators || []).find(item => item.id === def.id);
      return Object.assign(freshGeneratorState(def), found || {});
    });

    merged.purchasedUpgrades = Object.assign({}, fresh.purchasedUpgrades, loaded.purchasedUpgrades || {});
    merged.hiredSpecialists = Object.assign({}, fresh.hiredSpecialists, loaded.hiredSpecialists || {});
    merged.purchasedPrestigeNodes = numericMap(loaded.purchasedPrestigeNodes || {});
    merged.purchasedServices = Object.assign({}, fresh.purchasedServices, loaded.purchasedServices || {});
    merged.unlockedRegions = Object.assign({}, fresh.unlockedRegions, loaded.unlockedRegions || {});
    merged.regionLevels = Object.assign({}, fresh.regionLevels, loaded.regionLevels || {});
    merged.regionProjects = Object.assign({}, fresh.regionProjects, loaded.regionProjects || {});
    merged.selectedChallengeId = loaded.selectedChallengeId || null;
    merged.activeChallengeId = loaded.activeChallengeId || null;
    merged.challengeCompletions = numericMap(loaded.challengeCompletions || {});
    merged.activeDoctrineId = null;
    merged.activeEraId = null;
    merged.contractClaims = Object.assign({}, loaded.contractClaims || {});
    merged.sideJobIndex = Math.max(0, Math.floor(Number(loaded.sideJobIndex) || 0));
    merged.regionMastery = Object.fromEntries(DATA.regionDefs.map(region => {
      const saved = (loaded.regionMastery || {})[region.id] || {};
      return [region.id, { xp: Number(saved.xp || 0), level: Number(saved.level || 0) }];
    }));
    merged.bossCatalog = numericMap(loaded.bossCatalog || {});
    // Old saves keep every empire asset and milestone; only retired story state is dropped.
    delete merged.quietNetwork;

    merged.purchasedCosmetics = Object.keys(DATA.cosmetics).reduce((acc, category) => {
      acc[category] = Object.assign({}, fresh.purchasedCosmetics[category] || { default: true }, (loaded.purchasedCosmetics || {})[category] || {});
      return acc;
    }, {});

    merged.equippedCosmetics = {
      outfit: ((loaded.equippedCosmetics || {}).outfit) || 'default',
      wallFinish: ((loaded.equippedCosmetics || {}).wallFinish) || 'default',
      floorFinish: ((loaded.equippedCosmetics || {}).floorFinish) || 'default',
      deskFinish: ((loaded.equippedCosmetics || {}).deskFinish) || 'default',
      chairFinish: ((loaded.equippedCosmetics || {}).chairFinish) || 'default'
    };
    merged.purchasedUiSkins = Object.assign({ founder: true }, loaded.purchasedUiSkins || {});
    merged.uiSkin = (DATA.uiSkinDefs || []).some(def => def.id === loaded.uiSkin) ? loaded.uiSkin : 'founder';
    merged.floorBotProfile = {
      name: typeof (loaded.floorBotProfile || {}).name === 'string' && (loaded.floorBotProfile || {}).name.trim() ? (loaded.floorBotProfile || {}).name.trim().slice(0, 28) : 'Floor Bot',
      voicePitch: Math.max(0.025, Math.min(10.0, Number((loaded.floorBotProfile || {}).voicePitch || 1))),
      voiceSpeed: Math.max(0.25, Math.min(3.0, Number((loaded.floorBotProfile || {}).voiceSpeed || 1))),
      speechFrequency: Math.max(0.25, Math.min(3.0, Number((loaded.floorBotProfile || {}).speechFrequency || 1))),
      voiceId: typeof (loaded.floorBotProfile || {}).voiceId === 'string' ? (loaded.floorBotProfile || {}).voiceId.slice(0, 160) : '',
      voiceEnabled: (loaded.floorBotProfile || {}).voiceEnabled !== false,
      personality: ['sassy','serious','queen','funny','sad'].includes((loaded.floorBotProfile || {}).personality) ? (loaded.floorBotProfile || {}).personality : 'funny'
    };

    const migratedDecor = Array.isArray(loaded.equippedDecorations) ? loaded.equippedDecorations.slice() : [];
    const oldOffice = (loaded.equippedCosmetics || {}).office;
    const oldDesk = (loaded.equippedCosmetics || {}).desk;
    if (oldOffice && oldOffice !== 'default' && !migratedDecor.includes(oldOffice)) migratedDecor.push(oldOffice);
    if (oldDesk && oldDesk !== 'default' && !migratedDecor.includes(oldDesk)) migratedDecor.push(oldDesk);
    merged.equippedDecorations = migratedDecor;
    merged.cosmeticPlacements = normalizePlacementBuckets(
      loaded.placements,
      { wall: loaded.wallPlacements || loaded.wallDecorPlacements || {} },
      loaded.cosmeticPlacements
    );
    syncPlacementCompatibility(merged);

    merged.officeTier = typeof loaded.officeTier === 'number' ? loaded.officeTier : 0;
    merged.achievementsClaimed = timestampMap(loaded.achievementsClaimed || {});
    merged.missionCooldowns = Object.assign({}, loaded.missionCooldowns || {});
    merged.multipliers = baseMultipliers();
    merged.stats = Object.assign({}, fresh.stats, loaded.stats || {});
    merged.officeBuddy = Object.assign({}, fresh.officeBuddy, loaded.officeBuddy || {});
    merged.activeMissions = Array.isArray(loaded.activeMissions) ? loaded.activeMissions : [];
    merged.activeIncidents = Array.isArray(loaded.activeIncidents) ? loaded.activeIncidents : [];

    if (!DATA.purchaseModes.includes(merged.purchaseMode)) merged.purchaseMode = 1;
    if (!DATA.regionDefs.some(r => r.id === merged.currentRegionId)) merged.currentRegionId = DATA.regionDefs[0].id;
    const panelMigrations = {
      ops: 'infrastructure',
      upgrades: 'infrastructure',
      missions: 'people',
      staff: 'people',
      regions: 'network',
      overhaul: 'progress',
      achievements: 'progress'
    };
    merged.currentPanel = panelMigrations[merged.currentPanel] || merged.currentPanel;
    if (!['command', 'infrastructure', 'people', 'network', 'progress'].includes(merged.currentPanel)) merged.currentPanel = 'command';
    if (!WORKSPACE_SECTION_BY_PANEL[merged.currentPanel].includes(merged.currentWorkspaceSection)) {
      merged.currentWorkspaceSection = WORKSPACE_SECTION_DEFAULTS[merged.currentPanel];
    }
    if (!['global', 'category', 'automation', 'facilities', 'resilience', 'research'].includes(merged.currentUpgradeView)) merged.currentUpgradeView = 'global';
    if (!Object.keys(DATA.cosmetics).includes(merged.currentShopView)) merged.currentShopView = 'office';
    if (!['office', 'achievements', 'console'].includes(merged.currentSuiteTab)) merged.currentSuiteTab = 'office';
    if (!DATA.challengeDefs?.some(def => def.id === merged.selectedChallengeId)) merged.selectedChallengeId = null;
    if (!DATA.challengeDefs?.some(def => def.id === merged.activeChallengeId)) merged.activeChallengeId = null;
    if (!DATA.doctrineDefs?.some(def => def.id === merged.activeDoctrineId)) merged.activeDoctrineId = 'balanced';
    if (!DATA.eraDefs?.some(def => def.id === merged.activeEraId)) merged.activeEraId = 'foundation';
    if (typeof merged.soundEnabled !== 'boolean') merged.soundEnabled = true;
    if (!['auto', 'performance', 'balanced', 'quality'].includes(merged.graphicsQuality)) merged.graphicsQuality = 'performance';
    if (typeof merged.research !== 'number') merged.research = 0;
    if (typeof merged.ipFragments !== 'number') merged.ipFragments = 0;
    if (typeof merged.missionSlots !== 'number') merged.missionSlots = 1;
    if (typeof merged.incidentShieldRemaining !== 'number') merged.incidentShieldRemaining = 0;
    if (typeof merged.offlineCapHours !== 'number') merged.offlineCapHours = 4;
    if (typeof merged.offlineEfficiency !== 'number') merged.offlineEfficiency = 0.5;
    merged.consoleLog = Array.isArray(loaded.consoleLog) ? loaded.consoleLog.slice(-50) : [];

    const maxDecor = DATA.officeSuiteDefs[Math.min(DATA.officeSuiteDefs.length - 1, merged.officeTier)].slots;
    merged.equippedDecorations = merged.equippedDecorations.filter(id => id !== 'default').slice(0, maxDecor);

    return merged;
  }

  const App = {
    state: null,
    lastFrame: performance.now(),
    saveTimer: null,
    achievementAccumulator: 0,

    init() {
      this.state = mergeState(window.UptimeEmpireSave.load());
      this.recomputeBonuses();
      window.UptimeEmpire = this;
      this.bindGlobals();
      this.syncManagerCount();
      this.lastFrame = performance.now();
      if (window.UptimeEmpireUI) window.UptimeEmpireUI.init(this);
      this.applyOfflineEarnings();
      this.updateAchievements();
      this.loop();
      this.startAutosave();
    },

    bindGlobals() {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) this.save();
        else this.applyOfflineEarnings();
      });
      window.addEventListener('beforeunload', () => this.save());
      window.addEventListener('pagehide', () => this.save());
    },

    save(showToast = false) {
      this.state.lastActiveAt = Date.now();
      this.state.lastSaveAt = Date.now();
      syncPlacementCompatibility(this.state);
      const ok = window.UptimeEmpireSave.save(this.state);
      if (ok && showToast && window.UptimeEmpireUI) window.UptimeEmpireUI.toast('Saved.');
    },

    exportSave() {
      syncPlacementCompatibility(this.state);
      return window.UptimeEmpireSave.export(this.state);
    },

    importSave(encoded) {
      const incoming = window.UptimeEmpireSave.import(encoded);
      if (!incoming) return false;
      this.state = mergeState(incoming);
      this.recomputeBonuses();
      this.applyOfflineEarnings();
      this.syncManagerCount();
      this.renderAll();
      return true;
    },

    hardReset() {
      window.UptimeEmpireSave.clear();
      this.state = createNewState();
      syncPlacementCompatibility(this.state);
      this.recomputeBonuses();
      this.renderAll();
    },

    getDef(id, collection = DATA.generatorDefs) {
      return collection.find(item => item.id === id);
    },

    getGenState(id) {
      return this.state.generators.find(gen => gen.id === id);
    },

    getOwnedById(id) {
      return this.getGenState(id)?.owned || 0;
    },

    getCategoryOwned(category) {
      return this.state.generators.reduce((sum, gen) => {
        const def = this.getDef(gen.id);
        return sum + (def.category === category ? gen.owned : 0);
      }, 0);
    },

    getHighestTierOwned() {
      return this.state.generators.reduce((max, gen) => {
        if (!gen.owned) return max;
        return Math.max(max, this.getDef(gen.id).tier);
      }, 0);
    },

    getUnlockedRegions() {
      return DATA.regionDefs.filter(region => this.state.unlockedRegions[region.id]);
    },

    getRegionDef(id) {
      return DATA.regionDefs.find(region => region.id === id);
    },

    getServiceDef(id) {
      return DATA.serviceDefs.find(item => item.id === id);
    },

    getUpgradeDef(id) {
      return DATA.upgradeDefs.find(item => item.id === id);
    },

    upgradeRequirementsMet(def) {
      if (!def || !def.requires || !def.requires.length) return true;
      return def.requires.every(req => this.state.purchasedUpgrades[req]);
    },

    canBuyUpgradeDef(def) {
      if (!def || this.state.purchasedUpgrades[def.id] || !this.meetsCondition(def.visibleWhen) || !this.upgradeRequirementsMet(def)) return false;
      return this.state.credits >= (def.cost || 0) && this.state.research >= (def.costResearch || 0);
    },

    getSpecialistDef(id) {
      return DATA.specialistDefs.find(item => item.id === id);
    },

    getPrestigeDef(id) {
      return DATA.prestigeNodeDefs.find(item => item.id === id);
    },

    getQuestDef(id) {
      return DATA.questDefs.find(item => item.id === id);
    },

    getQuestFocusRegionId(defOrId) {
      const def = typeof defOrId === 'string' ? this.getQuestDef(defOrId) : defOrId;
      if (!def) return null;
      return def.focusRegionId || QUEST_REGION_FOCUS[def.id] || null;
    },

    getQuestFocusRegion(defOrId) {
      const regionId = this.getQuestFocusRegionId(defOrId);
      return regionId ? this.getRegionDef(regionId) : null;
    },

    getQuestFocusState(defOrId) {
      const def = typeof defOrId === 'string' ? this.getQuestDef(defOrId) : defOrId;
      const regionId = this.getQuestFocusRegionId(def);
      const region = regionId ? this.getRegionDef(regionId) : null;
      const active = !!regionId && this.state.currentRegionId === regionId && !!this.state.unlockedRegions[regionId];
      return {
        regionId,
        region,
        active,
        rewardMult: active ? QUEST_FOCUS_REWARD_MULT : 1,
        durationMult: active ? QUEST_FOCUS_DURATION_MULT : 1
      };
    },

    getIncidentDef(id) {
      return DATA.incidentDefs.find(item => item.id === id);
    },

    getOfficeSuiteDef(level = this.state.officeTier) {
      return DATA.officeSuiteDefs[Math.max(0, Math.min(DATA.officeSuiteDefs.length - 1, level))];
    },

    getActiveDoctrineDef() {
      return DATA.doctrineDefs?.find(def => def.id === this.state.activeDoctrineId) || DATA.doctrineDefs?.[0] || null;
    },

    getActiveEraDef() {
      return DATA.eraDefs?.find(def => def.id === this.state.activeEraId) || DATA.eraDefs?.[0] || null;
    },

    getActiveChallengeDef() {
      return DATA.challengeDefs?.find(def => def.id === this.state.activeChallengeId) || null;
    },

    getSelectedChallengeDef() {
      return DATA.challengeDefs?.find(def => def.id === this.state.selectedChallengeId) || null;
    },

    getChallengeCompletionCount() {
      return Object.values(this.state.challengeCompletions || {}).reduce((sum, value) => sum + (Number(value) || 0), 0);
    },

    getSeasonWeekSeed() {
      const now = new Date();
      const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
      const diff = (Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - start.getTime()) / 86400000;
      return Math.floor(diff / 7);
    },

    getCurrentSeasonDef() {
      const defs = DATA.seasonDefs || [];
      if (!defs.length) return null;
      return defs[this.getSeasonWeekSeed() % defs.length];
    },

    getRegionMastery(regionId) {
      return this.state.regionMastery?.[regionId] || { xp: 0, level: 0 };
    },

    getRegionMasteryNextXp(level = 0) {
      return Math.floor(70 + level * 45 + Math.pow(level, 1.35) * 18);
    },

    addRegionMasteryXp(regionId, amount, silent = false) {
      const mastery = this.state.regionMastery[regionId] || (this.state.regionMastery[regionId] = { xp: 0, level: 0 });
      mastery.xp += amount;
      let leveled = 0;
      while (mastery.xp >= this.getRegionMasteryNextXp(mastery.level)) {
        mastery.xp -= this.getRegionMasteryNextXp(mastery.level);
        mastery.level += 1;
        leveled += 1;
      }
      if (leveled) {
        if (!silent) this.pushConsoleLog(`${this.getRegionDef(regionId)?.name || regionId} mastery reached Lv ${mastery.level + 1}.`, 'system');
        this.recomputeBonuses();
      }
      return leveled;
    },

    getPurchasedProjectCount() {
      return Object.values(this.state.regionProjects).filter(Boolean).length;
    },

    getCosmeticsOwnedCount() {
      const flat = Object.keys(DATA.cosmetics).flatMap(group => Object.entries(this.state.purchasedCosmetics[group] || {}));
      return flat.filter(([id, owned]) => owned && id !== 'default').length;
    },

    getDecorSlotLimit() {
      const suiteSlots = this.getOfficeSuiteDef().slots;
      return suiteSlots + Math.max(0, Math.floor(this.state.multipliers.officeSlotsBonus || 0));
    },

    countEquippedDecorations() {
      return this.state.equippedDecorations.length;
    },

    isDecorationEquipped(id) {
      return this.state.equippedDecorations.includes(id);
    },

    getAchievementTime(id) {
      return this.state.achievementsClaimed[id] || 0;
    },

    applyEffectBundleToTarget(effects, target) {
      if (!effects) return;
      if (effects.multiply) {
        Object.entries(effects.multiply).forEach(([key, value]) => {
          if (typeof target.multipliers[key] === 'number') target.multipliers[key] *= value;
        });
      }
      if (effects.add) {
        Object.entries(effects.add).forEach(([key, value]) => {
          if (key in target.multipliers && typeof target.multipliers[key] === 'number') target.multipliers[key] += value;
          else if (key === 'offlineCapHours') target.offlineCapHours += value;
          else if (key === 'offlineEfficiency') target.offlineEfficiency += value;
          else if (key === 'missionSlots') target.missionSlots += value;
        });
      }
      if (effects.categoryMultiply) {
        Object.entries(effects.categoryMultiply).forEach(([category, value]) => {
          target.multipliers.category[category] *= value;
        });
      }
      if (effects.categoryIncidentShield) {
        Object.entries(effects.categoryIncidentShield).forEach(([category, value]) => {
          target.multipliers.categoryIncidentShield[category] += value;
        });
      }
    },

    recomputeBonuses() {
      const target = {
        multipliers: baseMultipliers(),
        offlineCapHours: 4,
        offlineEfficiency: 0.5,
        missionSlots: 1
      };

      DATA.prestigeNodeDefs.forEach(def => {
        const level = this.state.purchasedPrestigeNodes[def.id] || 0;
        for (let i = 0; i < level; i += 1) this.applyEffectBundleToTarget(def.effects, target);
      });
      DATA.upgradeDefs.forEach(def => {
        if (this.state.purchasedUpgrades[def.id]) this.applyEffectBundleToTarget(def.effects, target);
      });
      DATA.specialistDefs.forEach(def => {
        if (this.state.hiredSpecialists[def.id]) this.applyEffectBundleToTarget(def.effects, target);
      });
      DATA.serviceDefs.forEach(def => {
        if (this.state.purchasedServices[def.id]) this.applyEffectBundleToTarget(def.effects, target);
      });
      DATA.regionDefs.forEach(region => {
        if (this.state.regionProjects[region.id] && region.project) this.applyEffectBundleToTarget(region.project.effects, target);
      });
      (DATA.campaignGoalDefs || []).forEach(goal => {
        if (this.state.campaignGoals?.[goal.id]) this.applyEffectBundleToTarget(goal.effects || {}, target);
      });
      const activeChallenge = this.getActiveChallengeDef();
      if (activeChallenge?.effects) this.applyEffectBundleToTarget(activeChallenge.effects, target);

      target.offlineEfficiency = Math.min(1, target.offlineEfficiency);
      target.multipliers.costReduction = Math.min(0.90, target.multipliers.costReduction);
      target.multipliers.managerDiscount = Math.min(0.85, target.multipliers.managerDiscount);
      target.multipliers.regionCostReduction = Math.min(0.85, target.multipliers.regionCostReduction);
      target.multipliers.highTierCapacityReduction = Math.min(0.75, target.multipliers.highTierCapacityReduction);
      target.multipliers.incidentChanceReduction = Math.min(0.85, target.multipliers.incidentChanceReduction);
      target.multipliers.incidentDurationReduction = Math.min(0.85, target.multipliers.incidentDurationReduction);
      target.multipliers.incidentSeverityReduction = Math.min(0.7, target.multipliers.incidentSeverityReduction);
      target.multipliers.missionCooldownReduction = Math.min(0.75, target.multipliers.missionCooldownReduction);
      target.missionSlots = Math.max(1, target.missionSlots);

      this.state.multipliers = target.multipliers;
      this.state.offlineCapHours = target.offlineCapHours;
      this.state.offlineEfficiency = target.offlineEfficiency;
      this.state.missionSlots = target.missionSlots;
      this.state.equippedDecorations = this.state.equippedDecorations.slice(0, this.getDecorSlotLimit());
    },

    applyOfflineEarnings() {
      const now = Date.now();
      const last = this.state.lastActiveAt || now;
      const elapsedSec = Math.max(0, Math.floor((now - last) / 1000));
      this.state.lastActiveAt = now;
      if (elapsedSec < 5) return;
      const cappedSec = Math.min(elapsedSec, Math.floor(this.state.offlineCapHours * 3600));
      const passive = this.getAutomatedIncomePerSecond() * cappedSec * this.getEffectiveOfflineEfficiency();
      if (passive > 0) this.addCredits(passive);
      this.tickIncidents(cappedSec, true);
      const completedMissions = this.tickMissions(cappedSec, true);
      if (this.state.incidentShieldRemaining > 0) this.state.incidentShieldRemaining = Math.max(0, this.state.incidentShieldRemaining - cappedSec);
      if ((passive > 0 || (completedMissions && completedMissions.length)) && window.UptimeEmpireUI) {
        const parts = [];
        if (passive > 0) parts.push(`${this.formatNumber(passive)} CC`);
        if (completedMissions && completedMissions.length) parts.push(`${completedMissions.length} mission${completedMissions.length === 1 ? '' : 's'} complete`);
        window.UptimeEmpireUI.toast(`Offline progress: ${parts.join(' • ')}`);
        window.UptimeEmpireUI.showOfflineSummary?.({ credits: passive, missionsCompleted: completedMissions ? completedMissions.length : 0 });
        window.UptimeEmpireUI.showBuddyLine('welcome back');
      }
      this.updateAchievements();
    },

    getMilestoneMultiplier(owned) {
      return DATA.milestoneDefs.reduce((mult, milestone) => (owned >= milestone.count ? mult * milestone.mult : mult), 1);
    },

    getRegionEffects() {
      const totals = {
        income: 0,
        speed: 0,
        expansionDiscount: 0,
        highTierCapacityReduction: 0,
        categoryBonus: {}
      };

      this.getUnlockedRegions().forEach(region => {
        const lvl = this.state.regionLevels[region.id] || 0;
        const mastery = this.getRegionMastery(region.id);
        const scale = (1 + lvl * 0.08) * (1 + mastery.level * 0.06);
        const effects = region.effects || {};
        if (effects.income) totals.income += effects.income * scale;
        if (effects.speed) totals.speed += effects.speed * scale;
        if (effects.expansionDiscount) totals.expansionDiscount += effects.expansionDiscount * scale;
        if (effects.highTierCapacityReduction) totals.highTierCapacityReduction += effects.highTierCapacityReduction * scale;
        if (effects.categoryBonus) {
          Object.entries(effects.categoryBonus).forEach(([category, bonus]) => {
            const scaled = 1 + (bonus - 1) * (1 + lvl * 0.05);
            totals.categoryBonus[category] = (totals.categoryBonus[category] || 1) * scaled;
          });
        }
      });

      return totals;
    },

    getDynamicIncidentModifiers() {
      const totals = {
        incomeMult: 1,
        speedMult: 1,
        automatedMult: 1,
        offlineEfficiencyDelta: 0,
        categoryMult: DATA.categories.reduce((acc, cat) => {
          acc[cat] = 1;
          return acc;
        }, {})
      };

      this.state.activeIncidents.forEach(incident => {
        const penalties = incident.penalties || {};
        if (penalties.incomeMult) totals.incomeMult *= penalties.incomeMult;
        if (penalties.speedMult) totals.speedMult *= penalties.speedMult;
        if (penalties.automatedMult) totals.automatedMult *= penalties.automatedMult;
        if (penalties.offlineEfficiencyDelta) totals.offlineEfficiencyDelta += penalties.offlineEfficiencyDelta;
        if (penalties.categoryMult) {
          Object.entries(penalties.categoryMult).forEach(([category, value]) => {
            totals.categoryMult[category] *= value;
          });
        }
      });

      return totals;
    },

    getCategoryMultiplier(category) {
      const base = this.state.multipliers.category[category] || 1;
      const regionEffects = this.getRegionEffects();
      const regionCategory = regionEffects.categoryBonus[category] || 1;
      const incidentMult = this.getDynamicIncidentModifiers().categoryMult[category] || 1;
      return base * regionCategory * incidentMult;
    },

    getIncomePerCycle(def, gen) {
      const milestone = this.getMilestoneMultiplier(gen.owned);
      const incidentMods = this.getDynamicIncidentModifiers();
      const automatedBonus = gen.automated ? this.state.multipliers.automatedIncome * incidentMods.automatedMult : 1;
      const global = this.state.multipliers.globalIncome * (1 + this.state.multipliers.prestigeIncomeBonus) * incidentMods.incomeMult;
      const category = this.getCategoryMultiplier(def.category);
      const region = 1 + this.getRegionEffects().income;
      return def.payout * gen.owned * milestone * automatedBonus * global * category * region;
    },

    getCycleTime(def) {
      const regionSpeed = 1 + this.getRegionEffects().speed;
      const incidentSpeed = this.getDynamicIncidentModifiers().speedMult;
      const speedMult = this.state.multipliers.speed * regionSpeed * incidentSpeed;
      return Math.max(0.15, def.cycle / speedMult);
    },

    getGeneratorPotentialPerSecond(def, gen) {
      if (!gen.owned) return 0;
      return this.getIncomePerCycle(def, gen) / this.getCycleTime(def);
    },

    getPotentialIncomePerSecond() {
      return this.state.generators.reduce((sum, gen) => sum + this.getGeneratorPotentialPerSecond(this.getDef(gen.id), gen), 0);
    },

    getAutomatedIncomePerSecond() {
      return this.state.generators.reduce((sum, gen) => {
        if (!gen.automated || !gen.owned) return sum;
        return sum + this.getGeneratorPotentialPerSecond(this.getDef(gen.id), gen);
      }, 0);
    },

    getEffectiveOfflineEfficiency() {
      const incidentDelta = this.getDynamicIncidentModifiers().offlineEfficiencyDelta;
      return Math.max(0.1, Math.min(1, this.state.offlineEfficiency + incidentDelta));
    },

    addCredits(amount) {
      this.state.credits += amount;
      this.state.lifetimeCredits += amount;
    },

    addResearch(amount) {
      this.state.research += amount;
    },

    spendResearch(amount) {
      this.state.research -= amount;
      this.state.stats.researchSpent += amount;
    },

    addIpFragments(amount) {
      const before = this.state.innovationPoints;
      this.state.ipFragments += amount;
      while (this.state.ipFragments >= 3) {
        this.state.ipFragments -= 3;
        this.state.innovationPoints += 1;
      }
      const gained = this.state.innovationPoints - before;
      if (gained > 0) this.pushConsoleLog(`IP fragments condensed into +${gained} Innovation Point${gained > 1 ? 's' : ''}.`, 'system');
    },

    canUnlockGenerator(def) {
      return this.state.lifetimeCredits >= def.unlockAt || DATA.generatorDefs.findIndex(d => d.id === def.id) === 0;
    },

    getNextCost(def, owned) {
      const raw = def.baseCost * Math.pow(def.growth, owned);
      return raw * Math.max(0.10, 1 - this.state.multipliers.costReduction);
    },

    getManagerCost(def) {
      return def.managerCost * Math.max(0.15, 1 - this.state.multipliers.managerDiscount);
    },

    getSelectedQuantity(def) {
      if (this.state.purchaseMode === 'MAX') return this.getAffordableCount(def);
      return this.state.purchaseMode;
    },

    costForQuantity(def, startOwned, qty) {
      let sum = 0;
      for (let i = 0; i < qty; i += 1) sum += this.getNextCost(def, startOwned + i);
      return sum;
    },

    getEffectiveCapacityUse(def) {
      let use = def.capacityUse;
      if (def.tier >= 9) {
        const reduction = Math.min(0.75, this.state.multipliers.highTierCapacityReduction + this.getRegionEffects().highTierCapacityReduction);
        use *= Math.max(0.2, 1 - reduction);
      }
      return use;
    },

    getTotalCapacity() {
      const raw = this.getUnlockedRegions().reduce((sum, region) => {
        const level = this.state.regionLevels[region.id] || 0;
        const mastery = this.getRegionMastery(region.id);
        const regionCapacity = (region.baseCapacity + region.capPerLevel * level) * (1 + mastery.level * 0.04);
        return sum + regionCapacity;
      }, 0);
      return raw * (1 + this.state.multipliers.capacityBonus);
    },

    getUsedCapacity() {
      return this.state.generators.reduce((sum, gen) => {
        if (!gen.owned) return sum;
        const def = this.getDef(gen.id);
        return sum + gen.owned * this.getEffectiveCapacityUse(def);
      }, 0);
    },

    getRemainingCapacity() {
      return this.getTotalCapacity() - this.getUsedCapacity();
    },

    getAffordableCount(def) {
      let credits = this.state.credits;
      let owned = this.getGenState(def.id).owned;
      let count = 0;
      let remainingCap = this.getRemainingCapacity();
      const capUse = this.getEffectiveCapacityUse(def);
      while (count < 10000) {
        const cost = this.getNextCost(def, owned);
        if (credits < cost || remainingCap < capUse) break;
        credits -= cost;
        remainingCap -= capUse;
        owned += 1;
        count += 1;
      }
      return count;
    },

    buyGenerator(id) {
      const def = this.getDef(id);
      const gen = this.getGenState(id);
      if (!def || !gen || !this.canUnlockGenerator(def)) return { ok: false, reason: 'locked' };
      const qty = Math.max(0, this.getSelectedQuantity(def));
      if (!qty) return { ok: false, reason: 'none' };
      const totalCost = this.costForQuantity(def, gen.owned, qty);
      const requiredCapacity = this.getEffectiveCapacityUse(def) * qty;
      if (this.state.credits < totalCost) return { ok: false, reason: 'credits' };
      if (this.getRemainingCapacity() < requiredCapacity) return { ok: false, reason: 'capacity' };

      const beforeOwned = gen.owned;
      this.state.credits -= totalCost;
      gen.owned += qty;
      const milestoneHit = DATA.milestoneDefs.find(m => beforeOwned < m.count && gen.owned >= m.count);
      if (milestoneHit && window.UptimeEmpireUI) {
        window.UptimeEmpireUI.toast(`${def.name} hit ${milestoneHit.count}. Throughput surge.`);
        window.UptimeEmpireUI.showBuddyLine('milestone!');
      }
      this.updateAchievements();
      return { ok: true, cost: totalCost, qty };
    },

    runGenerator(id) {
      const gen = this.getGenState(id);
      if (!gen || !gen.owned || gen.automated || gen.running) return { ok: false };
      gen.running = true;
      gen.progress = 0;
      this.state.stats.manualRuns += 1;
      this.save(false);
      return { ok: true };
    },

    maybeAwardCycle(def, gen) {
      const payout = this.getIncomePerCycle(def, gen);
      this.addCredits(payout);
      if (!gen.automated) {
        gen.running = false;
        gen.progress = 0;
      }
      return payout;
    },

    hireManager(id) {
      const def = this.getDef(id);
      const gen = this.getGenState(id);
      if (!def || !gen || gen.managerHired || !gen.owned) return { ok: false, reason: 'locked' };
      const cost = this.getManagerCost(def);
      if (this.state.credits < cost) return { ok: false, reason: 'credits' };
      this.state.credits -= cost;
      gen.managerHired = true;
      gen.automated = true;
      gen.running = false;
      gen.progress = 0;
      this.syncManagerCount();
      const arrival = DATA.managerArrivalLines?.[id];
      if (arrival) this.pushConsoleLog(`${def.managerName}: ${arrival}`, 'system');
      this.updateAchievements();
      return { ok: true, cost };
    },

    syncManagerCount() {
      this.state.totalManagers = this.state.generators.filter(gen => gen.managerHired).length;
    },

    meetsCondition(condition) {
      if (!condition) return true;
      if (condition.lifetimeCredits && this.state.lifetimeCredits < condition.lifetimeCredits) return false;
      if (condition.managers && this.state.totalManagers < condition.managers) return false;
      if (condition.prestigePoints && this.state.innovationPoints < condition.prestigePoints) return false;
      if (condition.unlockedRegion && !this.state.unlockedRegions[condition.unlockedRegion]) return false;
      if (condition.unlockedRegions && this.getUnlockedRegions().length < condition.unlockedRegions) return false;
      if (condition.missionsCompleted && this.state.stats.missionsCompleted < condition.missionsCompleted) return false;
      if (condition.incidentsResolved && this.state.stats.incidentsResolved < condition.incidentsResolved) return false;
      if (condition.prestiges && this.state.stats.prestiges < condition.prestiges) return false;
      if (condition.research && this.state.research < condition.research) return false;
      if (condition.ownedId && this.getOwnedById(condition.ownedId.id) < condition.ownedId.amount) return false;
      if (condition.ownedCategory && this.getCategoryOwned(condition.ownedCategory.category) < condition.ownedCategory.amount) return false;
      if (condition.highestTier && this.getHighestTierOwned() < condition.highestTier) return false;
      if (condition.builtProject && !this.state.regionProjects[condition.builtProject]) return false;
      if (condition.builtProjects && this.getPurchasedProjectCount() < condition.builtProjects) return false;
      if (condition.officeTier && this.state.officeTier < condition.officeTier) return false;
      if (condition.cosmeticsOwned && this.getCosmeticsOwnedCount() < condition.cosmeticsOwned) return false;
      if (condition.totalCapacity && this.getTotalCapacity() < condition.totalCapacity) return false;
      if (condition.potentialIncomePerSecond && this.getPotentialIncomePerSecond() < condition.potentialIncomePerSecond) return false;
      if (condition.incidentShieldRemaining && this.state.incidentShieldRemaining < condition.incidentShieldRemaining) return false;
      if (condition.campaignGoal && !this.isCampaignGoalComplete(condition.campaignGoal)) return false;
      return true;
    },

    buyUpgrade(id) {
      const def = this.getUpgradeDef(id);
      if (!def || this.state.purchasedUpgrades[id] || !this.meetsCondition(def.visibleWhen)) return { ok: false };
      if (!this.upgradeRequirementsMet(def)) return { ok: false, reason: 'requires' };
      const costCredits = def.cost || 0;
      const costResearch = def.costResearch || 0;
      if (this.state.credits < costCredits) return { ok: false, reason: 'credits' };
      if (this.state.research < costResearch) return { ok: false, reason: 'research' };
      this.state.credits -= costCredits;
      if (costResearch) this.spendResearch(costResearch);
      this.state.purchasedUpgrades[id] = true;
      this.recomputeBonuses();
      this.updateAchievements();
      return { ok: true };
    },

    hireSpecialist(id) {
      const def = this.getSpecialistDef(id);
      if (!def || this.state.hiredSpecialists[id] || !this.meetsCondition(def.visibleWhen)) return { ok: false };
      if (this.state.credits < def.cost) return { ok: false, reason: 'credits' };
      this.state.credits -= def.cost;
      this.state.hiredSpecialists[id] = true;
      this.recomputeBonuses();
      return { ok: true };
    },

    buyService(id) {
      const def = this.getServiceDef(id);
      if (!def || this.state.purchasedServices[id] || !this.meetsCondition(def.visibleWhen)) return { ok: false };
      const costCredits = def.cost || 0;
      const costResearch = def.costResearch || 0;
      if (this.state.credits < costCredits) return { ok: false, reason: 'credits' };
      if (this.state.research < costResearch) return { ok: false, reason: 'research' };
      this.state.credits -= costCredits;
      if (costResearch) this.spendResearch(costResearch);
      this.state.purchasedServices[id] = true;
      this.recomputeBonuses();
      return { ok: true };
    },

    unlockRegion(id) {
      const region = this.getRegionDef(id);
      if (!region || this.state.unlockedRegions[id]) return { ok: false };
      const cost = this.getRegionUnlockCost(region);
      if (this.state.credits < cost) return { ok: false, reason: 'credits' };
      this.state.credits -= cost;
      this.state.unlockedRegions[id] = true;
      this.state.currentRegionId = id;
      this.addRegionMasteryXp(id, 40, true);
      this.pushConsoleLog(`Region expanded outward: ${region.name} came online.`, 'system');
      this.updateAchievements();
      return { ok: true };
    },

    getRegionUnlockCost(region) {
      const discount = Math.min(0.75, this.state.multipliers.regionCostReduction + this.getRegionEffects().expansionDiscount);
      return region.unlockCost * Math.max(0.20, 1 - discount);
    },

    getRegionExpansionCost(regionId) {
      const region = this.getRegionDef(regionId);
      const level = this.state.regionLevels[regionId] || 0;
      const raw = region.expansionBaseCost * Math.pow(1.75, level);
      const discount = Math.min(0.75, this.state.multipliers.regionCostReduction + this.getRegionEffects().expansionDiscount);
      return raw * Math.max(0.20, 1 - discount);
    },

    expandRegion(id) {
      const region = this.getRegionDef(id);
      if (!region || !this.state.unlockedRegions[id]) return { ok: false };
      const cost = this.getRegionExpansionCost(id);
      if (this.state.credits < cost) return { ok: false, reason: 'credits' };
      this.state.credits -= cost;
      this.state.regionLevels[id] = (this.state.regionLevels[id] || 0) + 1;
      this.addRegionMasteryXp(id, 24, true);
      this.pushConsoleLog(`Region expanded: ${region.name} reached Lv ${(this.state.regionLevels[id] || 0) + 1}.`, 'system');
      this.updateAchievements();
      return { ok: true };
    },

    buyRegionProject(id) {
      const region = this.getRegionDef(id);
      if (!region || !region.project || !this.state.unlockedRegions[id] || this.state.regionProjects[id]) return { ok: false };
      const cc = region.project.costCredits || 0;
      const research = region.project.costResearch || 0;
      if (this.state.credits < cc) return { ok: false, reason: 'credits' };
      if (this.state.research < research) return { ok: false, reason: 'research' };
      this.state.credits -= cc;
      if (research) this.spendResearch(research);
      this.state.regionProjects[id] = true;
      this.addRegionMasteryXp(id, 54, true);
      this.recomputeBonuses();
      this.pushConsoleLog(`Regional project complete: ${region.project.name} in ${region.name}.`, 'system');
      this.updateAchievements();
      return { ok: true };
    },

    getNodeLevel(nodeId) {
      return this.state.purchasedPrestigeNodes[nodeId] || 0;
    },

    getPrestigeNodeCost(node) {
      const level = this.getNodeLevel(node.id);
      if (!node.costGrowth) return node.cost;
      return Math.floor(node.cost * Math.pow(node.costGrowth, level));
    },

    canBuyPrestigeNode(node) {
      const level = this.getNodeLevel(node.id);
      const maxLevel = node.maxLevel || 1;
      if (level >= maxLevel) return false;
      if (this.state.innovationPoints < this.getPrestigeNodeCost(node)) return false;
      if (node.requires && node.requires.some(req => !this.getNodeLevel(req))) return false;
      return true;
    },

    buyPrestigeNode(id) {
      const node = this.getPrestigeDef(id);
      if (!node || !this.canBuyPrestigeNode(node)) return { ok: false };
      const cost = this.getPrestigeNodeCost(node);
      this.state.innovationPoints -= cost;
      this.state.purchasedPrestigeNodes[id] = this.getNodeLevel(id) + 1;
      this.recomputeBonuses();
      return { ok: true, cost };
    },

    setDoctrine(id) {
      const doctrine = DATA.doctrineDefs?.find(def => def.id === id);
      if (!doctrine || !this.meetsCondition(doctrine.unlockWhen)) return { ok: false };
      this.state.activeDoctrineId = id;
      this.recomputeBonuses();
      this.pushConsoleLog(`Doctrine engaged: ${doctrine.name}.`, 'system');
      return { ok: true };
    },

    setEra(id) {
      const era = DATA.eraDefs?.find(def => def.id === id);
      if (!era || !this.meetsCondition(era.unlockWhen)) return { ok: false };
      this.state.activeEraId = id;
      this.recomputeBonuses();
      this.pushConsoleLog(`Era switched: ${era.name}.`, 'system');
      return { ok: true };
    },

    selectChallenge(id) {
      if (!id) {
        this.state.selectedChallengeId = null;
        this.pushConsoleLog('Next overhaul set to Normal Run.', 'system');
        return { ok: true };
      }
      const challenge = DATA.challengeDefs?.find(def => def.id === id);
      if (!challenge || !this.meetsCondition(challenge.unlockWhen)) return { ok: false };
      this.state.selectedChallengeId = id;
      this.pushConsoleLog(`Next overhaul armed with challenge: ${challenge.name}.`, 'system');
      return { ok: true };
    },

    getContractPeriodKey(span = 'daily') {
      const now = new Date();
      if (span === 'weekly') return `${now.getUTCFullYear()}-W${this.getSeasonWeekSeed()}`;
      return `${now.getUTCFullYear()}-${now.getUTCMonth()+1}-${now.getUTCDate()}`;
    },

    getCurrentSideJob() {
      const defs = DATA.contractDefs?.daily || [];
      if (!defs.length) return null;
      const index = Math.max(0, Math.floor(Number(this.state.sideJobIndex) || 0));
      const def = defs[index % defs.length];
      const progress = this.getContractProgress(def.goal);
      const goalValue = this.getContractGoalValue(def.goal);
      const claimKey = `side-job:${index}:${def.id}`;
      return Object.assign({}, def, {
        span: 'side job',
        claimKey,
        progress,
        goalValue,
        complete: progress >= goalValue,
        claimed: !!this.state.contractClaims[claimKey]
      });
    },

    getContractsForSpan(span = 'daily') {
      const defs = (DATA.contractDefs && DATA.contractDefs[span]) || [];
      if (!defs.length) return [];
      const periodKey = this.getContractPeriodKey(span);
      const seedBase = [...periodKey].reduce((sum, ch) => sum + ch.charCodeAt(0), span === 'weekly' ? 97 : 31);
      const count = Math.min(span === 'weekly' ? 2 : 3, defs.length);
      const start = seedBase % defs.length;
      const ordered = defs.map((_, offset) => defs[(start + offset) % defs.length]);
      const picks = ordered.slice(0, count);
      return picks.map(def => {
        const progress = this.getContractProgress(def.goal);
        const goalValue = this.getContractGoalValue(def.goal);
        const claimKey = `${span}:${periodKey}:${def.id}`;
        return Object.assign({}, def, {
          span,
          periodKey,
          claimKey,
          progress,
          goalValue,
          complete: progress >= goalValue,
          claimed: !!this.state.contractClaims[claimKey]
        });
      });
    },

    getContractGoalValue(goal) {
      if (goal.managers) return goal.managers;
      if (goal.missionsCompleted) return goal.missionsCompleted;
      if (goal.incidentsResolved) return goal.incidentsResolved;
      if (goal.potentialIncomePerSecond) return goal.potentialIncomePerSecond;
      if (goal.officeTier) return goal.officeTier;
      if (goal.unlockedRegions) return goal.unlockedRegions;
      if (goal.builtProjects) return goal.builtProjects;
      if (goal.prestiges) return goal.prestiges;
      if (goal.ownedId) return goal.ownedId.amount;
      return 1;
    },

    getContractProgress(goal) {
      if (goal.managers) return this.state.totalManagers;
      if (goal.missionsCompleted) return this.state.stats.missionsCompleted;
      if (goal.incidentsResolved) return this.state.stats.incidentsResolved;
      if (goal.potentialIncomePerSecond) return this.getPotentialIncomePerSecond();
      if (goal.officeTier) return this.state.officeTier;
      if (goal.unlockedRegions) return this.getUnlockedRegions().length;
      if (goal.builtProjects) return this.getPurchasedProjectCount();
      if (goal.prestiges) return this.state.stats.prestiges;
      if (goal.ownedId) return this.getOwnedById(goal.ownedId.id);
      return 0;
    },

    claimContract(claimKey) {
      const contract = this.getCurrentSideJob();
      if (!contract || contract.claimed || !contract.complete) return { ok: false };
      if (contract.claimKey !== claimKey) return { ok: false };
      this.state.contractClaims[claimKey] = true;
      const reward = contract.reward || {};
      if (reward.credits) this.addCredits(reward.credits);
      if (reward.research) this.addResearch(reward.research);
      if (reward.fragments) this.addIpFragments(reward.fragments);
      if (reward.ip) this.state.innovationPoints += reward.ip;
      this.state.sideJobIndex = Math.max(0, Math.floor(Number(this.state.sideJobIndex) || 0)) + 1;
      this.pushConsoleLog(`${contract.name} side job completed. Rewards delivered.`, 'system');
      return { ok: true };
    },

    checkChallengeCompletion() {
      const active = this.getActiveChallengeDef();
      if (!active) return;
      if (!this.meetsCondition(active.goal)) return;
      this.state.challengeCompletions[active.id] = (this.state.challengeCompletions[active.id] || 0) + 1;
      const reward = active.reward || {};
      if (reward.ip) this.state.innovationPoints += reward.ip;
      if (reward.research) this.addResearch(reward.research);
      if (reward.fragments) this.addIpFragments(reward.fragments);
      this.pushConsoleLog(`Challenge cleared: ${active.name}.`, 'system');
      if (window.UptimeEmpireUI) {
        window.UptimeEmpireUI.toast(`Challenge cleared: ${active.name}`);
        window.UptimeEmpireUI.playSound('achievement');
      }
      this.state.activeChallengeId = null;
      this.recomputeBonuses();
    },

    getBossRankValue(typeId) {
      const count = this.state.bossCatalog?.[typeId] || 0;
      if (count >= 12) return 5;
      if (count >= 8) return 4;
      if (count >= 5) return 3;
      if (count >= 3) return 2;
      if (count >= 1) return 1;
      return 0;
    },

    getPrestigeGain() {
      const lifetime = Math.max(0, this.state.lifetimeCredits);
      const highestRegion = this.getUnlockedRegions().length;
      const highestTier = this.getHighestTierOwned();
      const missions = Math.floor(this.state.stats.missionsCompleted / 8);
      return Math.floor(Math.pow(lifetime / 1e9, 0.35) + highestRegion * 2 + highestTier + missions);
    },

    doPrestige() {
      const gain = this.getPrestigeGain();
      if (gain <= 0) return { ok: false };
      const preserved = {
        innovationPoints: this.state.innovationPoints + gain,
        purchasedPrestigeNodes: Object.assign({}, this.state.purchasedPrestigeNodes),
        purchasedCosmetics: deepClone(this.state.purchasedCosmetics),
        equippedCosmetics: deepClone(this.state.equippedCosmetics),
        uiSkin: this.state.uiSkin,
        purchasedUiSkins: Object.assign({}, this.state.purchasedUiSkins),
        equippedDecorations: deepClone(this.state.equippedDecorations),
        officeTier: this.state.officeTier,
        achievementsClaimed: Object.assign({}, this.state.achievementsClaimed),
        research: this.state.research,
        ipFragments: this.state.ipFragments,
        selectedChallengeId: this.state.selectedChallengeId,
        activeChallengeId: this.state.selectedChallengeId || null,
        challengeCompletions: Object.assign({}, this.state.challengeCompletions),
        activeDoctrineId: this.state.activeDoctrineId,
        activeEraId: this.state.activeEraId,
        contractClaims: Object.assign({}, this.state.contractClaims),
        sideJobIndex: this.state.sideJobIndex,
        regionMastery: deepClone(this.state.regionMastery),
        bossCatalog: Object.assign({}, this.state.bossCatalog),
        campaignGoals: Object.assign({}, this.state.campaignGoals),
        campaignGoalMoments: Object.assign({}, this.state.campaignGoalMoments),
        floorBotProfile: deepClone(this.state.floorBotProfile),
        stats: Object.assign({}, this.state.stats, { prestiges: this.state.stats.prestiges + 1 })
      };
      this.state = createNewState();
      this.state.innovationPoints = preserved.innovationPoints;
      this.state.purchasedPrestigeNodes = preserved.purchasedPrestigeNodes;
      this.state.purchasedCosmetics = preserved.purchasedCosmetics;
      this.state.equippedCosmetics = preserved.equippedCosmetics;
      this.state.uiSkin = preserved.uiSkin;
      this.state.purchasedUiSkins = preserved.purchasedUiSkins;
      this.state.equippedDecorations = preserved.equippedDecorations;
      this.state.officeTier = preserved.officeTier;
      this.state.achievementsClaimed = preserved.achievementsClaimed;
      this.state.research = preserved.research;
      this.state.ipFragments = preserved.ipFragments;
      this.state.selectedChallengeId = preserved.selectedChallengeId;
      this.state.activeChallengeId = preserved.activeChallengeId;
      this.state.challengeCompletions = preserved.challengeCompletions;
      this.state.activeDoctrineId = preserved.activeDoctrineId;
      this.state.activeEraId = preserved.activeEraId;
      this.state.contractClaims = preserved.contractClaims;
      this.state.sideJobIndex = preserved.sideJobIndex;
      this.state.regionMastery = preserved.regionMastery;
      this.state.bossCatalog = preserved.bossCatalog;
      this.state.campaignGoals = preserved.campaignGoals;
      this.state.campaignGoalMoments = preserved.campaignGoalMoments;
      this.state.floorBotProfile = preserved.floorBotProfile;
      this.state.stats = preserved.stats;
      this.recomputeBonuses();
      this.state.credits += this.state.multipliers.startingCredits;
      this.renderAll();
      this.updateAchievements();
      return { ok: true, gain };
    },

    getCampaignGoalDef(id) {
      return (DATA.campaignGoalDefs || []).find(goal => goal.id === id) || null;
    },

    isCampaignGoalComplete(id) {
      return !!this.state.campaignGoals?.[id];
    },

    getCampaignGoalCompletionTime(id) {
      return this.state.campaignGoalMoments?.[id] || this.state.campaignGoals?.[id] || 0;
    },

    getCampaignGoalsCompletedCount() {
      return Object.keys(this.state.campaignGoals || {}).filter(id => !!this.state.campaignGoals[id]).length;
    },

    campaignGoalRequirementsMet(def) {
      if (!def) return false;
      if (def.requiresGoal && !this.isCampaignGoalComplete(def.requiresGoal)) return false;
      return this.meetsCondition(def.unlockWhen);
    },

    canBuyCampaignGoal(defOrId) {
      const def = typeof defOrId === 'string' ? this.getCampaignGoalDef(defOrId) : defOrId;
      if (!def || this.isCampaignGoalComplete(def.id) || !this.campaignGoalRequirementsMet(def)) return false;
      if (this.state.credits < (def.costCredits || 0)) return false;
      if (this.state.research < (def.costResearch || 0)) return false;
      if (this.state.innovationPoints < (def.costIp || 0)) return false;
      if (this.state.ipFragments < (def.costFragments || 0)) return false;
      return true;
    },

    buyCampaignGoal(id) {
      const def = this.getCampaignGoalDef(id);
      if (!def) return { ok: false, reason: 'missing' };
      if (this.isCampaignGoalComplete(id)) return { ok: false, reason: 'owned' };
      if (!this.campaignGoalRequirementsMet(def)) return { ok: false, reason: 'locked' };
      if (this.state.credits < (def.costCredits || 0)) return { ok: false, reason: 'credits' };
      if (this.state.research < (def.costResearch || 0)) return { ok: false, reason: 'research' };
      if (this.state.innovationPoints < (def.costIp || 0)) return { ok: false, reason: 'ip' };
      if (this.state.ipFragments < (def.costFragments || 0)) return { ok: false, reason: 'fragments' };
      this.state.credits -= (def.costCredits || 0);
      if (def.costResearch) this.spendResearch(def.costResearch);
      if (def.costIp) this.state.innovationPoints -= def.costIp;
      if (def.costFragments) this.state.ipFragments -= def.costFragments;
      const stamp = Date.now();
      this.state.campaignGoals[id] = stamp;
      this.state.campaignGoalMoments[id] = stamp;
      this.recomputeBonuses();
      const completed = this.getCampaignGoalsCompletedCount();
      this.pushConsoleLog(`${def.name} complete. Big Bet milestone ${completed}/${(DATA.campaignGoalDefs || []).length}.`, 'system');
      if (window.UptimeEmpireUI) {
        window.UptimeEmpireUI.toast(`${def.name} secured.`);
        window.UptimeEmpireUI.showBuddyLine('north star +1');
      }
      if (completed >= (DATA.campaignGoalDefs || []).length) {
        this.pushConsoleLog('Big Bet complete: Uptime Empire is no longer a shed dream.', 'system');
        if (window.UptimeEmpireUI) window.UptimeEmpireUI.toast('Uptime Empire built. Founder Mode unlocked.');
      }
      return { ok: true };
    },

    updateFloorBotProfile(profile) {
      const current = this.state.floorBotProfile || { name: 'Floor Bot', voicePitch: 1, voiceSpeed: 1, speechFrequency: 1, voiceId: '', voiceEnabled: true, personality: 'funny' };
      this.state.floorBotProfile = {
        name: typeof profile?.name === 'string' && profile.name.trim() ? profile.name.trim().slice(0, 28) : (current.name || 'Floor Bot'),
        voicePitch: Math.max(0.025, Math.min(10.0, Number(profile?.voicePitch ?? current.voicePitch ?? 1))),
        voiceSpeed: Math.max(0.25, Math.min(3.0, Number(profile?.voiceSpeed ?? current.voiceSpeed ?? 1))),
        speechFrequency: Math.max(0.25, Math.min(3.0, Number(profile?.speechFrequency ?? current.speechFrequency ?? 1))),
        voiceId: typeof profile?.voiceId === 'string' ? profile.voiceId.slice(0, 160) : (current.voiceId || ''),
        voiceEnabled: profile?.voiceEnabled !== false,
        personality: ['sassy','serious','queen','funny','sad'].includes(profile?.personality) ? profile.personality : (current.personality || 'funny')
      };
      this.save(false);
      return this.state.floorBotProfile;
    },

    buyOfficeUpgrade() {
      if (this.state.officeTier >= DATA.officeSuiteDefs.length - 1) return { ok: false, reason: 'max' };
      const next = this.getOfficeSuiteDef(this.state.officeTier + 1);
      if (this.state.credits < next.costCredits) return { ok: false, reason: 'credits' };
      if (this.state.research < next.costResearch) return { ok: false, reason: 'research' };
      this.state.credits -= next.costCredits;
      if (next.costResearch) this.spendResearch(next.costResearch);
      this.state.officeTier += 1;
      this.updateAchievements();
      return { ok: true };
    },

    isSlotlessCosmeticCategory(category) {
      return SLOTLESS_COSMETIC_CATEGORIES.includes(category);
    },

    getEquippedCosmetic(category) {
      return (this.state.equippedCosmetics || {})[category] || 'default';
    },

    getUiSkinDef(id) {
      return (DATA.uiSkinDefs || []).find(def => def.id === id) || null;
    },

    isUiSkinUnlocked(defOrId) {
      const def = typeof defOrId === 'string' ? this.getUiSkinDef(defOrId) : defOrId;
      if (!def) return false;
      if (UI_SKIN_PLAYTEST_UNLOCK_ALL) return true;
      if (def.id === 'founder' || this.state.purchasedUiSkins?.[def.id]) return true;
      return !!def.unlockWhen && this.meetsCondition(def.unlockWhen);
    },

    acquireUiSkin(id) {
      const def = this.getUiSkinDef(id);
      if (!def) return { ok: false, reason: 'missing' };
      if (this.isUiSkinUnlocked(def)) {
        this.state.uiSkin = id;
        return { ok: true, equipped: true };
      }
      if (!def.costCredits) return { ok: false, reason: 'locked' };
      if (this.state.credits < def.costCredits) return { ok: false, reason: 'credits' };
      this.state.credits -= def.costCredits;
      this.state.purchasedUiSkins[id] = true;
      this.state.uiSkin = id;
      this.pushConsoleLog(`Interface skin installed: ${def.name}.`, 'system');
      return { ok: true, purchased: true, equipped: true };
    },

    buyCosmetic(category, id) {
      const item = (DATA.cosmetics[category] || []).find(entry => entry.id === id);
      if (!item) return { ok: false };

      if (this.isSlotlessCosmeticCategory(category)) {
        if (this.state.purchasedCosmetics[category][id]) {
          this.state.equippedCosmetics[category] = id;
          return { ok: true, equipped: true };
        }
        if (this.state.credits < item.cost) return { ok: false, reason: 'credits' };
        this.state.credits -= item.cost;
        this.state.purchasedCosmetics[category][id] = true;
        this.state.equippedCosmetics[category] = id;
        this.updateAchievements();
        return { ok: true, purchased: true, equipped: true };
      }

      if (id === 'default') return { ok: false, reason: 'default' };

      if (!this.state.purchasedCosmetics[category][id]) {
        if (this.state.credits < item.cost) return { ok: false, reason: 'credits' };
        this.state.credits -= item.cost;
        this.state.purchasedCosmetics[category][id] = true;
        if (this.countEquippedDecorations() < this.getDecorSlotLimit()) {
          this.state.equippedDecorations.push(id);
          this.updateAchievements();
          return { ok: true, purchased: true, equipped: true };
        }
        this.updateAchievements();
        return { ok: true, purchased: true, equipped: false };
      }

      if (this.isDecorationEquipped(id)) {
        this.state.equippedDecorations = this.state.equippedDecorations.filter(entry => entry !== id);
        return { ok: true, unequipped: true };
      }

      if (this.countEquippedDecorations() >= this.getDecorSlotLimit()) return { ok: false, reason: 'slots' };
      this.state.equippedDecorations.push(id);
      return { ok: true, equipped: true };
    },

    getCosmeticPlacement(zone, id) {
      const safeZone = normalizePlacementZone(zone);
      const placement = ((this.state.cosmeticPlacements || {})[safeZone] || {})[id] || null;
      return placement ? Object.assign({}, placement) : null;
    },

    setCosmeticPlacement(zone, id, placement) {
      if (!zone || !id || !placement) return false;
      const safeZone = normalizePlacementZone(PLACEMENT_ZONE_BY_DECOR_ID[id] || zone);
      const savedPlacement = normalizeCosmeticPlacement(safeZone, placement);
      if (!savedPlacement) return false;
      if (!this.state.cosmeticPlacements) this.state.cosmeticPlacements = emptyPlacementBuckets();
      PLACEMENT_ZONES.forEach(otherZone => {
        if (!this.state.cosmeticPlacements[otherZone]) this.state.cosmeticPlacements[otherZone] = {};
        if (otherZone !== safeZone) delete this.state.cosmeticPlacements[otherZone][id];
      });
      this.state.cosmeticPlacements[safeZone][id] = savedPlacement;
      syncPlacementCompatibility(this.state);
      this.save(false);
      return true;
    },

    ensureDecorationEquipped(id) {
      if (!id || id === 'default') return { ok: false, reason: 'default' };
      if (this.isDecorationEquipped(id)) return { ok: true, already: true };
      if (this.countEquippedDecorations() >= this.getDecorSlotLimit()) return { ok: false, reason: 'slots' };
      this.state.equippedDecorations.push(id);
      this.save(false);
      return { ok: true, equipped: true };
    },

    pushConsoleLog(message, level = 'info') {
      if (!message) return;
      this.state.consoleLog.push({
        id: `log-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
        time: Date.now(),
        level,
        message
      });
      if (this.state.consoleLog.length > 50) this.state.consoleLog = this.state.consoleLog.slice(-50);
    },

    setSoundEnabled(enabled) {
      this.state.soundEnabled = !!enabled;
      this.renderAll();
    },

    setGraphicsQuality(quality) {
      const nextQuality = ['auto', 'performance', 'balanced', 'quality'].includes(quality) ? quality : 'performance';
      if (this.state.graphicsQuality === nextQuality) return;
      this.state.graphicsQuality = nextQuality;
      this.renderAll();
    },

    formatNumber(value) {
      if (!Number.isFinite(value)) return '∞';
      const abs = Math.abs(value);
      if (abs < 1000) return value.toFixed(abs >= 100 ? 0 : abs >= 10 ? 1 : 2).replace(/\.0+$/, '');
      const suffixes = ['K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
      let idx = -1;
      let n = abs;
      while (n >= 1000 && idx < suffixes.length - 1) {
        n /= 1000;
        idx += 1;
      }
      const sign = value < 0 ? '-' : '';
      const digits = n >= 100 ? 0 : n >= 10 ? 1 : 2;
      return `${sign}${n.toFixed(digits).replace(/\.0+$/, '')}${suffixes[idx]}`;
    },

    formatDuration(seconds) {
      const s = Math.max(0, Math.floor(seconds));
      const days = Math.floor(s / 86400);
      const hours = Math.floor((s % 86400) / 3600);
      const mins = Math.floor((s % 3600) / 60);
      if (days > 0) return `${days}d ${hours}h`;
      if (hours > 0) return `${hours}h ${mins}m`;
      if (mins > 0) return `${mins}m ${s % 60}s`;
      return `${s}s`;
    },

    changePanel(panel) {
      const migrations = {
        ops: 'infrastructure',
        upgrades: 'infrastructure',
        missions: 'people',
        staff: 'people',
        regions: 'network',
        overhaul: 'progress',
        achievements: 'progress'
      };
      const next = migrations[panel] || panel;
      this.state.currentPanel = ['command', 'infrastructure', 'people', 'network', 'progress'].includes(next) ? next : 'command';
      if (!WORKSPACE_SECTION_BY_PANEL[this.state.currentPanel].includes(this.state.currentWorkspaceSection)) {
        this.state.currentWorkspaceSection = WORKSPACE_SECTION_DEFAULTS[this.state.currentPanel];
      }
      this.renderAll();
    },

    changeWorkspaceSection(section) {
      const available = WORKSPACE_SECTION_BY_PANEL[this.state.currentPanel] || [];
      if (!available.includes(section)) return;
      this.state.currentWorkspaceSection = section;
      this.renderAll();
    },

    changePurchaseMode(mode) {
      this.state.purchaseMode = mode;
      this.renderAll();
    },

    changeUpgradeView(view) {
      this.state.currentUpgradeView = view;
      this.renderAll();
    },

    changeShopView(view) {
      this.state.currentShopView = view;
      this.renderAll();
    },

    changeSuiteTab(view) {
      this.state.currentSuiteTab = ['office', 'achievements', 'console'].includes(view) ? view : 'console';
      this.renderAll();
    },

    setCurrentRegion(id) {
      if (!this.state.unlockedRegions[id]) return;
      this.state.currentRegionId = id;
      this.renderAll();
    },

    getMissionTeamUsage() {
      return this.state.activeMissions.reduce((sum, mission) => sum + (mission.teams || 1), 0);
    },

    getAvailableMissionTeams() {
      return Math.max(0, this.state.missionSlots - this.getMissionTeamUsage());
    },

    getQuestRewardPreview(def) {
      const tierBonus = {
        Routine: 1,
        Standard: 1.15,
        Advanced: 1.35,
        Elite: 1.6,
        Legendary: 1.9,
        Mythic: 2.3,
        Apex: 2.9,
        Transcendent: 3.6
      }[def.tier] || 1;
      const focus = this.getQuestFocusState(def);
      const credits = Math.max(def.rewards.flatCredits || 0, this.getPotentialIncomePerSecond() * (def.rewards.creditsSec || 0));
      const creditReward = credits * this.state.multipliers.missionReward * tierBonus * focus.rewardMult;
      const researchReward = Math.max(0, Math.round((def.rewards.research || 0) * this.state.multipliers.researchBonus * Math.max(1, tierBonus * 0.75) * focus.rewardMult));
      return {
        credits: creditReward,
        research: researchReward,
        ipFragments: Math.max(def.rewards.ipShards || 0, tierBonus >= 2.3 ? 1 : 0),
        incidentShield: def.rewards.incidentShield || 0,
        focusActive: focus.active,
        focusRegionId: focus.regionId
      };
    },

    getQuestDuration(def) {
      const focus = this.getQuestFocusState(def);
      return Math.max(30, Math.round(def.duration * focus.durationMult));
    },

    getQuestCooldown(def) {
      const reduction = Math.min(0.75, this.state.multipliers.missionCooldownReduction || 0);
      const tierMult = {
        Routine: 0.95,
        Standard: 1,
        Advanced: 1.08,
        Elite: 1.18,
        Legendary: 1.28,
        Mythic: 1.42,
        Apex: 1.58,
        Transcendent: 1.8
      }[def.tier] || 1;
      return Math.max(15, Math.floor((def.cooldown || 0) * tierMult * (1 - reduction)));
    },

    getQuestCooldownRemaining(id) {
      const readyAt = this.state.missionCooldowns[id] || 0;
      return Math.max(0, Math.ceil((readyAt - Date.now()) / 1000));
    },

    startQuest(id) {
      const def = this.getQuestDef(id);
      if (!def || !this.meetsCondition(def.visibleWhen)) return { ok: false, reason: 'locked' };
      if (this.getAvailableMissionTeams() < def.teams) return { ok: false, reason: 'teams' };
      const cooldownRemaining = this.getQuestCooldownRemaining(id);
      if (cooldownRemaining > 0) return { ok: false, reason: 'cooldown', cooldownRemaining };
      const reward = this.getQuestRewardPreview(def);
      const duration = this.getQuestDuration(def);
      const focus = this.getQuestFocusState(def);
      this.state.missionCooldowns[id] = Date.now() + this.getQuestCooldown(def) * 1000;
      this.state.activeMissions.push({
        uid: `${id}-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
        id,
        name: def.name,
        icon: def.icon,
        teams: def.teams,
        total: duration,
        remaining: duration,
        reward,
        kind: def.kind,
        tier: def.tier,
        focusRegionId: focus.regionId,
        focusActive: focus.active
      });
      this.save(false);
      return { ok: true };
    },

    completeMission(mission, silent = false) {
      this.addCredits(mission.reward.credits || 0);
      this.addResearch(mission.reward.research || 0);
      if (mission.reward.ipFragments) this.addIpFragments(mission.reward.ipFragments);
      if (mission.reward.incidentShield) this.state.incidentShieldRemaining += mission.reward.incidentShield;
      this.state.stats.missionsCompleted += 1;
      if (!silent && window.UptimeEmpireUI) {
        window.UptimeEmpireUI.toast(`${mission.name} complete.`);
        window.UptimeEmpireUI.showBuddyLine('quest done');
        window.UptimeEmpireUI.playSound('missionComplete');
      }
      this.updateAchievements();
    },

    tickMissions(dt, silent = false) {
      if (!this.state.activeMissions.length) return [];
      const speed = this.state.multipliers.missionSpeed;
      const completed = [];
      this.state.activeMissions.forEach(mission => {
        mission.remaining -= dt * speed;
        if (mission.remaining <= 0) completed.push(mission.uid);
      });
      if (!completed.length) return [];
      const completedMissions = [];
      const leftovers = [];
      this.state.activeMissions.forEach(mission => {
        if (completed.includes(mission.uid)) { this.completeMission(mission, silent); completedMissions.push(mission); }
        else leftovers.push(mission);
      });
      this.state.activeMissions = leftovers;
      return completedMissions;
    },

    scheduleNextIncident() {
      const prevention = Math.min(0.87, this.state.multipliers.incidentChanceReduction + (this.state.incidentShieldRemaining > 0 ? 0.10 : 0));
      const base = rand(110, 230) * 1000;
      const scaled = base / Math.max(0.12, 1 - prevention);
      this.state.nextIncidentAt = Date.now() + scaled;
    },

    spawnIncident() {
      const visible = DATA.incidentDefs.filter(def => this.meetsCondition(def.visibleWhen));
      if (!visible.length) {
        this.scheduleNextIncident();
        return;
      }
      const weighted = [];
      visible.forEach(def => {
        const copies = Math.max(1, Math.round((def.weight || (def.boss ? 0.35 : 1)) * 10));
        for (let i = 0; i < copies; i += 1) weighted.push(def);
      });
      const def = weighted[Math.floor(Math.random() * weighted.length)];
      const highestTier = this.getHighestTierOwned();
      const tierPressure = Math.min(def.boss ? 2.2 : 1.6, highestTier * (def.boss ? 0.05 : 0.035));
      const severityBase = (def.boss ? 1.8 : 1) + Math.random() * (def.boss ? 1.7 : 1.4) + tierPressure;
      const severity = Math.max(def.boss ? 1.4 : 0.8, severityBase - this.state.multipliers.incidentSeverityReduction * (def.boss ? 1.6 : 2));
      const duration = def.baseDuration * severity * Math.max(0.22, 1 - this.state.multipliers.incidentDurationReduction);
      const penalties = {};
      if (def.penalties.incomeMult) penalties.incomeMult = 1 - (1 - def.penalties.incomeMult) * severity;
      if (def.penalties.speedMult) penalties.speedMult = 1 - (1 - def.penalties.speedMult) * severity;
      if (def.penalties.automatedMult) penalties.automatedMult = 1 - (1 - def.penalties.automatedMult) * severity;
      if (def.penalties.offlineEfficiencyDelta) penalties.offlineEfficiencyDelta = def.penalties.offlineEfficiencyDelta * severity;
      if (def.penalties.categoryMult) {
        penalties.categoryMult = {};
        Object.entries(def.penalties.categoryMult).forEach(([category, value]) => {
          const rawPenalty = 1 - (1 - value) * severity;
          const shield = this.state.multipliers.categoryIncidentShield[category] || 0;
          penalties.categoryMult[category] = Math.min(1, rawPenalty + shield);
        });
      }
      const incident = {
        uid: `${def.id}-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
        typeId: def.id,
        name: def.name,
        icon: def.icon,
        desc: def.desc,
        severity,
        total: duration,
        remaining: duration,
        penalties,
        tags: def.tags || [],
        boss: !!def.boss
      };
      this.state.activeIncidents.push(incident);
      if (window.UptimeEmpireUI) {
        window.UptimeEmpireUI.toast(`${def.name} detected.`);
        window.UptimeEmpireUI.showBuddyLine(def.boss ? 'that seems bad' : 'uh oh');
        window.UptimeEmpireUI.triggerIncidentAlert(incident);
      }
      this.scheduleNextIncident();
    },

    maybeSpawnIncident(now) {
      if (this.state.totalManagers < 2) {
        if (!this.state.nextIncidentAt || now >= this.state.nextIncidentAt) this.scheduleNextIncident();
        return;
      }
      if (this.state.activeIncidents.length >= 4) return;
      if (!this.state.nextIncidentAt || now >= this.state.nextIncidentAt) this.spawnIncident();
    },

    respondToIncident(uid) {
      const incident = this.state.activeIncidents.find(item => item.uid === uid);
      if (!incident) return { ok: false };
      const base = (incident.boss ? 9 : 12) + this.state.multipliers.responsePower * (incident.boss ? 38 : 45);
      incident.remaining -= base;
      if (incident.remaining <= 0) {
        this.resolveIncident(uid);
        return { ok: true, resolved: true, boss: incident.boss };
      }
      return { ok: true, resolved: false, boss: incident.boss };
    },

    resolveIncident(uid, silent = false) {
      const incident = this.state.activeIncidents.find(item => item.uid === uid);
      if (!incident) return;
      this.state.activeIncidents = this.state.activeIncidents.filter(item => item.uid !== uid);
      this.state.stats.incidentsResolved += 1;
      let researchReward = Math.max(1, Math.round(incident.severity * (incident.boss ? 4 : 1.5)));
      if (incident.boss) {
        this.state.bossCatalog[incident.typeId] = (this.state.bossCatalog[incident.typeId] || 0) + 1;
        researchReward += this.getBossRankValue(incident.typeId);
      }
      this.addResearch(researchReward);
      if (incident.boss) this.addIpFragments(Math.max(1, Math.round(incident.severity / 1.8)) + Math.floor(this.getBossRankValue(incident.typeId) / 2));
      if (!silent && window.UptimeEmpireUI) {
        window.UptimeEmpireUI.toast(`${incident.name} resolved.`);
        window.UptimeEmpireUI.showBuddyLine(incident.boss ? 'boss down' : 'fixed it');
      }
      this.updateAchievements();
    },

    tickIncidents(dt, silent = false) {
      if (!this.state.activeIncidents.length) return;
      const response = 1 + this.state.multipliers.responsePower;
      const completed = [];
      this.state.activeIncidents.forEach(incident => {
        incident.remaining -= dt * response * (incident.boss ? 0.20 : 0.35);
        if (incident.remaining <= 0) completed.push(incident.uid);
      });
      completed.forEach(uid => this.resolveIncident(uid, silent));
    },

    updateAchievements() {
      DATA.achievementDefs.forEach(def => {
        if (this.state.achievementsClaimed[def.id]) return;
        if (!this.meetsCondition(def.condition)) return;
        this.state.achievementsClaimed[def.id] = Date.now();
        const reward = def.reward || {};
        if (reward.credits) this.addCredits(reward.credits);
        if (reward.research) this.addResearch(reward.research);
        if (reward.ip) this.state.innovationPoints += reward.ip;
        if (window.UptimeEmpireUI) {
          window.UptimeEmpireUI.toast(`Achievement unlocked: ${def.name}`);
          window.UptimeEmpireUI.showBuddyLine('achievement!');
          window.UptimeEmpireUI.playSound('achievement');
        }
      });
    },

    tickGenerators(dt) {
      this.state.generators.forEach(gen => {
        if (!gen.owned) return;
        const def = this.getDef(gen.id);
        const cycle = this.getCycleTime(def);
        if (gen.automated) {
          gen.progress += dt;
          while (gen.progress >= cycle) {
            gen.progress -= cycle;
            this.maybeAwardCycle(def, gen);
          }
        } else if (gen.running) {
          gen.progress += dt;
          if (gen.progress >= cycle) this.maybeAwardCycle(def, gen);
        }
      });
    },

    tickBuddy(now) {
      const buddy = this.state.officeBuddy;
      if (!buddy.nextMoveAt || now >= buddy.nextMoveAt) {
        buddy.x = 18 + Math.random() * 240;
        buddy.facingLeft = Math.random() > 0.5;
        buddy.nextMoveAt = now + 2500 + Math.random() * 3500;
        if (window.UptimeEmpireUI) {
          window.UptimeEmpireUI.updateBuddy();
          if (Math.random() > 0.55) window.UptimeEmpireUI.showBuddyLine(DATA.buddyLines[Math.floor(Math.random() * DATA.buddyLines.length)]);
        }
      }
    },

    loop() {
      const nowPerf = performance.now();
      const dt = Math.min(0.25, (nowPerf - this.lastFrame) / 1000);
      this.lastFrame = nowPerf;
      const now = Date.now();
      this.tickGenerators(dt);
      this.tickMissions(dt);
      this.tickIncidents(dt);
      if (this.state.incidentShieldRemaining > 0) this.state.incidentShieldRemaining = Math.max(0, this.state.incidentShieldRemaining - dt);
      this.maybeSpawnIncident(now);
      this.tickBuddy(now);
      this.achievementAccumulator += dt;
      if (this.achievementAccumulator >= 2) {
        this.achievementAccumulator = 0;
        this.updateAchievements();
        this.checkChallengeCompletion();
      }
      if (window.UptimeEmpireUI) window.UptimeEmpireUI.updateLive();
      requestAnimationFrame(() => this.loop());
    },

    startAutosave() {
      if (this.saveTimer) clearInterval(this.saveTimer);
      this.saveTimer = setInterval(() => this.save(false), 15000);
    },

    renderAll() {
      if (window.UptimeEmpireUI) window.UptimeEmpireUI.renderAll();
    }
  };

  window.UptimeEmpirePlacementSchema = {
    version: PLACEMENT_SCHEMA_VERSION,
    normalizePlacement: normalizeCosmeticPlacement,
    normalizeBuckets: normalizePlacementBuckets,
    normalizeState: state => syncPlacementCompatibility(state)
  };

  document.addEventListener('DOMContentLoaded', () => App.init());
})();
