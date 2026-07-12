(function() {
  const DATA = window.UptimeEmpireData;
  const jitter = (min, max) => Math.random() * (max - min) + min;
  const DECOR_PLACEMENT_ZONES = {
    'neon-sign': 'wall', 'plant-wall': 'wall', 'wall-monitor': 'wall', 'framed-cert': 'wall', 'server-poster': 'wall', 'moon-window': 'wall',
    'uplink-map': 'wall', 'award-shelf': 'wall', 'maintenance-clock': 'wall', 'fiber-art': 'wall', 'incident-board': 'wall', 'snack-shelf': 'wall',
    'desk-mat': 'desk', 'tower-stack': 'desk', 'aquarium': 'desk', 'keyboard-glow': 'desk', 'mini-rack': 'desk', 'coffee-drone': 'desk',
    'desk-bonsai': 'desk', 'projector-pad': 'desk', 'lava-lamp': 'desk',
    'holo-globe': 'floor', 'chair-upgrade': 'floor', 'led-strip': 'floor', 'floor-runner': 'floor', 'hex-rug': 'floor', 'floor-bot': 'floor', 'light-grid': 'floor',
    'parts-bins': 'floor', 'retro-console': 'floor', 'bookcase': 'floor', 'model-sat': 'floor', 'cold-spares': 'floor', 'pendant-light': 'floor'
  };
  const WALL_PLACEABLE_DECOR_IDS = new Set(Object.entries(DECOR_PLACEMENT_ZONES).filter(([, zone]) => zone === 'wall').map(([id]) => id));


const HELP_SECTIONS = [
  {
    id: 'overview',
    label: 'Overview',
    blurb: 'What the game is really asking you to do.',
    html: `
      <div class="help-callout"><strong>One-sentence goal:</strong> turn a scrappy little compute setup into a ridiculous multi-region empire, then repeatedly reinvent it through overhauls, seasonal systems, and long-run meta progress.</div>
      <p><strong>Uptime Empire</strong> is an idle/incremental management game about growing infrastructure, solving incidents, dispatching mission teams, expanding into new regions, and decorating your increasingly absurd command center.</p>
      <div class="help-grid">
        <div class="help-chip"><strong>Early game</strong><br />Buy hardware, learn the generator rhythm, unlock your first missions, and stop incidents from becoming your whole personality.</div>
        <div class="help-chip"><strong>Mid game</strong><br />Build managers, services, specialists, and region projects so the empire starts running itself while you chase better missions and office upgrades.</div>
        <div class="help-chip"><strong>Late game</strong><br />Lean on regions, Command systems, contracts, doctrines, eras, and overhauls to stack permanent advantages and chase higher weirdness.</div>
        <div class="help-chip"><strong>Meta loop</strong><br />Each overhaul should feel like a cleaner, stronger rerun with more toys, better multipliers, and a fancier office.</div>
      </div>
      <h4>What matters most?</h4>
      <ul>
        <li><strong>Compute Credits</strong> are your money.</li>
        <li><strong>Research Data</strong> unlocks sharper upgrades and projects.</li>
        <li><strong>Mission Teams</strong> let you run jobs and collect high-value rewards.</li>
        <li><strong>Regions</strong> are your empire backbone. Their bonuses stack.</li>
        <li><strong>Innovation Points</strong> are your permanent overhaul currency.</li>
      </ul>
    `
  },
  {
    id: 'resources',
    label: 'Resources',
    blurb: 'Credits, RD, fragments, capacity, and what they mean.',
    html: `
      <p><strong>Compute Credits (CC)</strong> buy almost everything that makes the empire grow: generators, upgrades, specialists, services, region unlocks, office cosmetics, and more.</p>
      <p><strong>Research Data (RD)</strong> is the “smart money” resource. If something feels more advanced, weird, or permanent, expect RD to be involved.</p>
      <p><strong>Innovation Points (IP)</strong> are earned through overhauls and are spent in the permanent innovation tree.</p>
      <p><strong>IP Fragments</strong> are rarer meta drops that help some bigger systems feel meaningful even before a full overhaul.</p>
      <p><strong>Capacity</strong> is the empire’s practical size limit. Regions and some upgrades/projects are how you keep that wall from punching you in the face.</p>
      <h4>Read the top cards like this</h4>
      <ul>
        <li><strong>Avg Potential / sec</strong>: what the empire could earn if everything was humming perfectly.</li>
        <li><strong>Automated / sec</strong>: what your managers and automation are already doing for you.</li>
        <li><strong>Security</strong>: your current incident resistance / response health.</li>
        <li><strong>Offline Cap</strong>: how much value can be collected while you are away.</li>
      </ul>
    `
  },
  {
    id: 'ops',
    label: 'Ops & Upgrades',
    blurb: 'Hardware, managers, services, and scaling.',
    html: `
      <p><strong>Ops</strong> is where you build throughput. Buy more infrastructure, run things manually, and hire managers so the empire stops needing constant babysitting.</p>
      <ul>
        <li><strong>Generators</strong> create your core income and define category growth.</li>
        <li><strong>Managers</strong> automate owned generators.</li>
        <li><strong>Upgrades</strong> make everything hit harder, cheaper, faster, or smarter.</li>
        <li><strong>Specialists</strong> and <strong>Services</strong> solve specific scaling problems.</li>
      </ul>
      <h4>Simple rule of thumb</h4>
      <p>If income feels flat, check in this order: more owned hardware, better managers, more region capacity, then higher-tier upgrades.</p>
    `
  },
  {
    id: 'missions',
    label: 'Missions & Focus',
    blurb: 'Quest Board, region focus, and why focus matters now.',
    html: `
      <div class="help-callout"><strong>New focus rule:</strong> region focus no longer just changes the UI. Missions tied to your focused region get a bonus.</div>
      <p>Missions are short-to-medium jobs that convert mission teams into money, research, fragments, and safety tools like incident shields.</p>
      <h4>How mission focus works</h4>
      <ul>
        <li>Each mission family has a <strong>region affinity</strong>.</li>
        <li>If that mission’s affinity matches your currently focused region, it gets a <strong>Focus Bonus</strong>.</li>
        <li>The focus bonus currently gives <strong>better rewards</strong> and a <strong>shorter duration</strong>.</li>
      </ul>
      <p>This gives the Focus button a reason to exist without taking away the normal stacked bonuses from all unlocked regions.</p>
      <h4>How to use focus well</h4>
      <ul>
        <li>Planning a research push? Focus the region that empowers your research-heavy mission cluster.</li>
        <li>Need cash? Focus the region tied to your best profit contracts.</li>
        <li>Want smoother mission turnover? Keep an eye on which cards say the focus bonus is active.</li>
      </ul>
    `
  },
  {
    id: 'regions',
    label: 'Regions',
    blurb: 'Expansion, projects, mastery, and stacking bonuses.',
    html: `
      <p>Regions are not optional side flavor. They are the empire’s real skeleton.</p>
      <ul>
        <li><strong>Unlocking</strong> a region gives you a new long-term bonus source.</li>
        <li><strong>Expanding</strong> it increases capacity and bonus scale.</li>
        <li><strong>Projects</strong> give permanent strategic advantages.</li>
        <li><strong>Mastery</strong> makes that region stronger the more you use it.</li>
      </ul>
      <p><strong>Important:</strong> unlocked region bonuses still stack globally. Focus now adds a mission-specialization layer on top of that, instead of replacing those bonuses.</p>
    `
  },
  {
    id: 'command',
    label: 'Command & Replayability',
    blurb: 'The long-term toy box and how to create a “forever game.”',
    html: `
      <p><strong>Command</strong> is where the game stops being just a bigger number machine and starts becoming a run-planning machine.</p>
      <ul>
        <li><strong>Seasons</strong> rotate the rules and keep runs feeling different.</li>
        <li><strong>Contracts</strong> create short-term goals.</li>
        <li><strong>Boss ladder</strong> gives you recurring milestones.</li>
        <li><strong>Doctrines, eras, and challenges</strong> let you shape how a run feels.</li>
      </ul>
      <h4>A strong long-game arc to consider</h4>
      <p>The best “end goal” for an endlessly replayable game is usually not a literal ending. It is a <strong>north star</strong> that keeps resetting in a bigger form.</p>
      <div class="help-grid">
        <div class="help-chip"><strong>Recommended arc</strong><br />Start with “pay off the data-center debt,” then graduate into “buy the campus,” then “fund the orbital command deck,” then “become the sovereign network that leases infrastructure to everyone else.”</div>
        <div class="help-chip"><strong>Why it works</strong><br />Each stage feels like a finish line, but also unlocks a bigger finish line. That is what gives infinite-ish replayability its bite.</div>
      </div>
      <p>That campaign is now live in Command as the Career Route. Those huge milestone purchases survive overhauls and give the empire a real north star without creating a hard final ending.</p>
    `
  },
  {
    id: 'overhaul',
    label: 'Overhaul',
    blurb: 'What resets, what stays, and why you should want to do it.',
    html: `
      <p><strong>Overhaul</strong> is your prestige/reset layer. It is how the game turns “I finished this run” into “I built a stronger next run.”</p>
      <ul>
        <li>You lose current-run momentum pieces like immediate credits and owned run-state systems.</li>
        <li>You keep permanent gains like Innovation Points, achievements, cosmetics, and the innovation tree.</li>
        <li>The projected gain preview tells you whether it is worth pulling the lever.</li>
      </ul>
      <p>The usual healthy rhythm is: push until growth feels sticky, overhaul, come back sharper, and aim for a new strategic milestone.</p>
    `
  },
  {
    id: 'office',
    label: 'Office Suite & Shop',
    blurb: 'Cosmetics, finishes, room upgrades, and why the suite matters.',
    html: `
      <p>The Office Suite is not just decorative frosting. It is part trophy room, part progression billboard, part sandbox.</p>
      <ul>
        <li><strong>Office upgrades</strong> expand what the room can support.</li>
        <li><strong>Decor</strong> shows off milestones and adds personality.</li>
        <li><strong>Wall/Floor/Desk/Chair finishes</strong> are slotless style changes.</li>
        <li><strong>3D props</strong> are the room’s visual progression language.</li>
      </ul>
      <p>The store uses one icon per item, and finishes are represented by swatches that reflect the actual color/texture.</p>
    `
  },
  {
    id: 'incidents',
    label: 'Incidents & Security',
    blurb: 'How trouble appears and how to keep it from running your life.',
    html: `
      <p>Incidents are the game’s chaos engine. They stop pure passive scaling from becoming brain-off forever.</p>
      <ul>
        <li><strong>Security</strong>, services, specialists, and region projects all help tame them.</li>
        <li><strong>Incident Shield</strong> buys breathing room.</li>
        <li><strong>Boss incidents</strong> feed the boss ladder and long-term progression.</li>
      </ul>
      <p>If incidents feel too heavy, that is usually a sign to invest in response systems instead of only buying more money printers.</p>
    `
  },
  {
    id: 'saving',
    label: 'Save, Import, Reset',
    blurb: 'How to protect your run and what each button really means.',
    html: `
      <ul>
        <li><strong>Save</strong>: writes the current run locally.</li>
        <li><strong>Export</strong>: copies your save string so you can back it up.</li>
        <li><strong>Import</strong>: restores from an exported save string.</li>
        <li><strong>Hard Reset</strong>: wipes the run and starts fresh. Use only if you really mean it.</li>
      </ul>
      <p>When in doubt, export before you experiment.</p>
    `
  }
];


  const UI = {
    app: null,
    els: {},
    office3D: null,
    arcade: null,
    computerOpen: false,
    mobileTerminalView: '',
    worldUtilityOpen: false,
    currentWorldUtility: 'shop',
    moveModeActive: false,
    forcePlacementWallReturn: false,
    shopOpen: false,
    toastTimer: null,
    alertTimer: null,
    audioCtx: null,
    lastSoftRefresh: 0,
    currentAlertIncidentId: null,
    incidentFocusTimer: null,
    consolePinnedToBottom: true,
    lastConsoleKey: '',
    soundStep: 0,
    lastSuiteTabRendered: '',

    init(app) {
      this.app = app;
      this.cacheDom();
      if (window.UptimeOffice3D && this.els.office3dCanvas) {
        this.office3D = new window.UptimeOffice3D({
          canvas: this.els.office3dCanvas,
          hintEl: this.els.office3dHint,
          modeEl: this.els.officeViewModeValue,
          onArcadeInteract: () => this.openArcade(),
          onArcadeInput: input => this.handleCabinetArcadeInput(input),
          onComputerInteract: () => this.openDeskComputer(),
          onRobotInteract: () => this.openRobotModal()
        });
      }
      this.initArcade();
      this.bindEvents();
      this.syncComputerMode();
      this.startArcadeLoop();
      this.renderAll();
      this.startVisualQAFromQuery();
      this.startMobileTerminalQAFromQuery();
    },

    cacheDom() {
      const $ = id => document.getElementById(id);
      this.els = {
        appShell: $('appShell'),
        appMain: document.querySelector('.app-main'),
        worldHud: $('worldHud'),
        worldCreditsValue: $('worldCreditsValue'),
        worldRateValue: $('worldRateValue'),
        worldIncidentsValue: $('worldIncidentsValue'),
        mobileCreditsValue: $('mobileCreditsValue'),
        mobileRateValue: $('mobileRateValue'),
        mobileIncidentsValue: $('mobileIncidentsValue'),
        mobileTerminalBack: $('mobileTerminalBack'),
        deskComputerCloseBtn: $('deskComputerCloseBtn'),
        worldQuickActions: $('worldQuickActions'),
        worldShopBtn: $('worldShopBtn'),
        worldSettingsBtn: $('worldSettingsBtn'),
        worldUtilityOverlay: $('worldUtilityOverlay'),
        worldUtilityTitle: $('worldUtilityTitle'),
        worldUtilitySubtitle: $('worldUtilitySubtitle'),
        worldUtilityCloseBtn: $('worldUtilityCloseBtn'),
        placementHud: $('placementHud'),
        placementTitle: $('placementTitle'),
        placementWallLabel: $('placementWallLabel'),
        placementCopy: $('placementCopy'),
        placementCancelBtn: $('placementCancelBtn'),
        placementWallPrevBtn: $('placementWallPrevBtn'),
        placementWallNextBtn: $('placementWallNextBtn'),
        placementRotateControls: $('placementRotateControls'),
        placementRotateLeftBtn: $('placementRotateLeftBtn'),
        placementRotateRightBtn: $('placementRotateRightBtn'),
        placementBackToMoveBtn: $('placementBackToMoveBtn'),
        creditsValue: $('creditsValue'),
        ipsValue: $('ipsValue'),
        passiveIpsValue: $('passiveIpsValue'),
        ipValue: $('ipValue'),
        researchValue: $('researchValue'),
        fragmentsValue: $('fragmentsValue'),
        lifetimeValue: $('lifetimeValue'),
        capacityValue: $('capacityValue'),
        managersValue: $('managersValue'),
        missionTeamsValue: $('missionTeamsValue'),
        securityValue: $('securityValue'),
        offlineValue: $('offlineValue'),
        missionTeamsPanelValue: $('missionTeamsPanelValue'),
        missionResearchValue: $('missionResearchValue'),
        activeIncidentsValue: $('activeIncidentsValue'),
        incidentShieldValue: $('incidentShieldValue'),
        purchaseModeWrap: $('purchaseModeWrap'),
        regionChipRow: $('regionChipRow'),
        networkFootprintCard: $('networkFootprintCard'),
        networkShortcuts: $('networkShortcuts'),
        opsIncidentSummary: $('opsIncidentSummary'),
        opsList: $('opsList'),
        mainNav: $('mainNav'),
        upgradeTabs: $('upgradeTabs'),
        upgradeList: $('upgradeList'),
        managerList: $('managerList'),
        specialistList: $('specialistList'),
        serviceList: $('serviceList'),
        incidentList: $('incidentList'),
        missionList: $('missionList'),
        seasonCard: $('seasonCard'),
        campaignGoalList: $('campaignGoalList'),
        contractsList: $('contractsList'),
        bossLadderList: $('bossLadderList'),
        regionMasteryList: $('regionMasteryList'),
        commandCollectionsList: $('commandCollectionsList'),
        commandNoticeBtn: $('commandNoticeBtn'),
        commandNoticeBadge: $('commandNoticeBadge'),
        helpBtn: $('helpBtn'),
        regionsList: $('regionsList'),
        doctrineList: $('doctrineList'),
        eraList: $('eraList'),
        challengeList: $('challengeList'),
        achievementPanelGrid: $('achievementPanelGrid'),
        achievementRecentList: $('achievementRecentList'),
        collectionsList: $('collectionsList'),
        achievementRecentAsideList: $('achievementRecentAsideList'),
        achievementBadgeGrid: $('achievementBadgeGrid'),
        suiteAchievementGrid: $('suiteAchievementGrid'),
        prestigeGainValue: $('prestigeGainValue'),
        prestigeTree: $('prestigeTree'),
        saveBtn: $('saveBtn'),
        exportBtn: $('exportBtn'),
        importBtn: $('importBtn'),
        resetBtn: $('resetBtn'),
        prestigeBtn: $('prestigeBtn'),
        suiteUpgradeCard: $('suiteUpgradeCard'),
        shopMoveModeBtn: $('shopMoveModeBtn'),
        shopTabs: $('shopTabs'),
        shopList: $('shopList'),
        suiteTabs: $('suiteTabs'),
        toggleSoundBtn: $('toggleSoundBtn'),
        graphicsQualityWrap: $('graphicsQualityWrap'),
        toast: $('toast'),
        fxLayer: $('fxLayer'),
        officeScene: $('officeScene'),
        office3dCanvas: $('office3dCanvas'),
        office3dHint: $('office3dHint'),
        officeViewModeValue: $('officeViewModeValue'),
        officeSuiteValue: $('officeSuiteValue'),
        wallFinishValue: $('wallFinishValue'),
        floorFinishValue: $('floorFinishValue'),
        officePropsValue: $('officePropsValue'),
        officeUpgradeBtn: $('officeUpgradeBtn'),
        arcadeOverlay: $('arcadeOverlay'),
        arcadeMenuScreen: $('arcadeMenuScreen'),
        arcadeGameScreen: $('arcadeGameScreen'),
        arcadeCanvas: $('arcadeCanvas'),
        arcadeDomGame: $('arcadeDomGame'),
        arcadeQuitBtn: $('arcadeQuitBtn'),
        arcadeInlineConfirm: $('arcadeInlineConfirm'),
        arcadeInlineConfirmTitle: $('arcadeInlineConfirmTitle'),
        arcadeInlineConfirmBody: $('arcadeInlineConfirmBody'),
        arcadeInlineConfirmBtn: $('arcadeInlineConfirmBtn'),
        arcadeInlineCancelBtn: $('arcadeInlineCancelBtn'),
        offlineSummaryPopup: $('offlineSummaryPopup'),
        offlineSummaryBody: $('offlineSummaryBody'),
        offlineSummaryCloseBtn: $('offlineSummaryCloseBtn'),
        consoleFeed: $('consoleFeed'),
        achievementModal: $('achievementModal'),
        achievementModalTitle: $('achievementModalTitle'),
        achievementModalSubtitle: $('achievementModalSubtitle'),
        achievementModalBody: $('achievementModalBody'),
        closeAchievementBtn: $('closeAchievementBtn'),
        helpModal: $('helpModal'),
        helpNav: $('helpNav'),
        helpContent: $('helpContent'),
        closeHelpBtn: $('closeHelpBtn'),
        robotModal: $('robotModal'),
        closeRobotBtn: $('closeRobotBtn'),
        saveRobotBtn: $('saveRobotBtn'),
        robotNameInput: $('robotNameInput'),
        robotPitchInput: $('robotPitchInput'),
        robotPitchValue: $('robotPitchValue'),
        robotSpeedInput: $('robotSpeedInput'),
        robotSpeedValue: $('robotSpeedValue'),
        robotFrequencyInput: $('robotFrequencyInput'),
        robotFrequencyValue: $('robotFrequencyValue'),
        robotVoiceSelect: $('robotVoiceSelect'),
        robotPersonalitySelect: $('robotPersonalitySelect'),
        robotVoiceToggle: $('robotVoiceToggle'),
        incidentAlert: $('incidentAlert'),
        incidentAlertIcon: $('incidentAlertIcon'),
        incidentAlertTitle: $('incidentAlertTitle'),
        incidentAlertText: $('incidentAlertText'),
        incidentAlertAckBtn: $('incidentAlertAckBtn'),
        incidentAlertBtn: $('incidentAlertBtn')
      };
    },

    startVisualQAFromQuery() {
      const params = new URLSearchParams(window.location.search);
      const requestedView = params.get('qa');
      const allowedViews = new Set(['arcade-front', 'arcade-quarter', 'desk-mount', 'storage-cabinet']);
      if (!allowedViews.has(requestedView)) return;

      document.body.classList.add('visual-qa-mode');
      const deadline = performance.now() + 30000;
      const waitForScene = () => {
        const scene = this.office3D;
        if (scene?.loaded && scene.assetsReady && scene.arcadeDisplay) {
          scene.setArcadeScreenState({ mode: 'menu', title: 'UPTIME ARCADE' });
          const camera = scene.setVisualQACamera(requestedView);
          window.__UPTIME_VISUAL_QA__ = {
            status: camera ? 'ready' : 'failed',
            view: requestedView,
            camera,
            assetsReady: !!scene.assetsReady
          };
          return;
        }
        if (performance.now() >= deadline) {
          window.__UPTIME_VISUAL_QA__ = { status: 'failed', view: requestedView, reason: 'Timed out waiting for the office scene.' };
          return;
        }
        requestAnimationFrame(waitForScene);
      };
      requestAnimationFrame(waitForScene);
    },

    startMobileTerminalQAFromQuery() {
      const params = new URLSearchParams(window.location.search);
      if (params.get('qa') !== 'mobile-terminal') return;
      document.body.classList.add('mobile-terminal-preview');
      window.setTimeout(() => this.openDeskComputer({ panel: 'ops', forceDeskView: true }), 80);
    },

    bindEvents() {
      this.els.mainNav.addEventListener('click', e => {
        const btn = e.target.closest('.nav-btn');
        if (!btn) return;
        const terminalView = btn.dataset.terminalView;
        if (terminalView) {
          this.primeAudio();
          this.playSound('ui');
          this.openMobileTerminalApp(terminalView);
          return;
        }
        const targetPanel = btn.dataset.panel;
        if (!targetPanel) return;
        this.primeAudio();
        this.playSound('ui');
        this.app.changePanel(targetPanel);
        requestAnimationFrame(() => this.scrollMainToTop());
      });

      if (this.els.mobileTerminalBack) this.els.mobileTerminalBack.addEventListener('click', () => this.closeMobileTerminalApp());

      if (this.els.commandNoticeBtn) {
        this.els.commandNoticeBtn.addEventListener('click', () => {
          this.primeAudio();
          this.playSound('ui');
          this.app.changePanel('command');
          requestAnimationFrame(() => this.scrollMainToTop());
        });
      }

      if (this.els.helpBtn) {
        this.els.helpBtn.addEventListener('click', () => {
          this.primeAudio();
          this.playSound('ui');
          this.openHelpModal();
        });
      }

      if (this.els.networkShortcuts) {
        this.els.networkShortcuts.addEventListener('click', e => {
          const btn = e.target.closest('button');
          if (!btn) return;
          if (btn.dataset.panel) this.app.changePanel(btn.dataset.panel);
          if (btn.dataset.action === 'open-shop') this.openWorldUtility('shop');
        });
      }

      this.els.upgradeTabs.addEventListener('click', e => {
        const btn = e.target.closest('.subtab');
        if (!btn) return;
        this.primeAudio();
        this.playSound('ui');
        this.app.changeUpgradeView(btn.dataset.upgradeView);
      });

      this.els.shopTabs.addEventListener('click', e => {
        const btn = e.target.closest('.subtab');
        if (!btn) return;
        this.primeAudio();
        this.playSound('ui');
        this.app.changeShopView(btn.dataset.shopView);
      });

      this.els.suiteTabs.addEventListener('click', e => {
        const btn = e.target.closest('.suite-tab');
        if (!btn) return;
        this.primeAudio();
        this.playSound('ui');
        const targetTab = btn.dataset.suiteTab;
        this.app.changeSuiteTab(targetTab);
        if (targetTab === 'console') {
          this.consolePinnedToBottom = true;
          requestAnimationFrame(() => this.renderConsole(true));
        }
      });

      document.addEventListener('click', e => {
        const doctrineBtn = e.target.closest('[data-action="set-doctrine"]');
        if (doctrineBtn) {
          this.primeAudio();
          this.playSound('ui');
          this.app.setDoctrine(doctrineBtn.dataset.id);
          this.app.renderAll();
          return;
        }
        const eraBtn = e.target.closest('[data-action="set-era"]');
        if (eraBtn) {
          this.primeAudio();
          this.playSound('ui');
          this.app.setEra(eraBtn.dataset.id);
          this.app.renderAll();
          return;
        }
        const challengeBtn = e.target.closest('[data-action="select-challenge"]');
        if (challengeBtn) {
          this.primeAudio();
          this.playSound('ui');
          this.app.selectChallenge(challengeBtn.dataset.id || null);
          this.app.renderAll();
          return;
        }
        const contractBtn = e.target.closest('[data-action="claim-contract"]');
        if (contractBtn) {
          this.primeAudio();
          this.playSound('achievement');
          this.app.claimContract(contractBtn.dataset.id);
          this.app.renderAll();
          return;
        }
        const campaignBtn = e.target.closest('[data-action="buy-campaign-goal"]');
        if (campaignBtn) {
          this.primeAudio();
          this.playSound('achievement');
          const result = this.app.buyCampaignGoal(campaignBtn.dataset.id);
          if (!result.ok) this.playSound('error');
          this.app.renderAll();
          return;
        }
      });

      if (this.els.consoleFeed) {
        this.els.consoleFeed.addEventListener('scroll', () => {
          const feed = this.els.consoleFeed;
          if (!feed) return;
          const distanceFromBottom = feed.scrollHeight - feed.clientHeight - feed.scrollTop;
          this.consolePinnedToBottom = distanceFromBottom <= 18;
        });
      }

      this.els.purchaseModeWrap.addEventListener('click', e => {
        const btn = e.target.closest('.mode-chip');
        if (!btn) return;
        const value = btn.dataset.mode === 'MAX' ? 'MAX' : Number(btn.dataset.mode);
        this.primeAudio();
        this.playSound('ui');
        this.app.changePurchaseMode(value);
      });

      this.els.regionChipRow.addEventListener('click', e => {
        const btn = e.target.closest('.region-chip');
        if (!btn) return;
        this.primeAudio();
        this.playSound('ui');
        this.app.setCurrentRegion(btn.dataset.regionId);
      });

      this.els.opsList.addEventListener('click', e => {
        const target = e.target.closest('button');
        if (!target) return;
        const action = target.dataset.action;
        const id = target.dataset.id;
        if (!action || !id) return;
        let result = null;
        if (action === 'buy-generator') {
          result = this.app.buyGenerator(id);
          if (result.ok) {
            this.primeAudio();
            this.spawnPurchaseBurst(target, `+${result.qty}`);
            this.playSound('buy');
          } else if (result.reason === 'capacity') {
            this.toast('Not enough capacity. Expand regions or reduce high-tier pressure.');
          }
        }
        if (action === 'run-generator') {
          result = this.app.runGenerator(id);
          if (result.ok) {
            this.primeAudio();
            this.spawnPurchaseBurst(target, 'run');
            this.playSound('run');
          }
        }
        if (action === 'hire-manager') {
          result = this.app.hireManager(id);
          if (result.ok) {
            this.primeAudio();
            this.toast('Manager hired.');
            this.spawnPurchaseBurst(target, 'auto');
            this.playSound('hire');
          }
        }
        if (result && !result.ok && result.reason === 'credits') this.toast('Not enough credits.');
        this.app.renderAll();
      });

      this.els.opsIncidentSummary.addEventListener('click', e => {
        const pill = e.target.closest('[data-action="open-missions"]');
        if (!pill) return;
        this.openIncidentCenter(pill.dataset.incidentId || null);
      });

      this.els.upgradeList.addEventListener('click', e => {
        const btn = e.target.closest('button[data-action="buy-upgrade"]');
        if (!btn) return;
        this.primeAudio();
        const upgradeDef = this.app.getUpgradeDef(btn.dataset.id);
        const card = btn.closest('.upgrade-card');
        const result = this.app.buyUpgrade(btn.dataset.id);
        if (result.ok) {
          if (card) {
            card.classList.add('done');
            btn.textContent = 'Installed';
            btn.classList.remove('can-afford');
            btn.classList.add('nope');
            btn.disabled = true;
          }
          const completeLabel = upgradeDef?.category === 'research' ? 'Research complete' : 'Upgrade installed';
          this.toast(`${completeLabel}: ${upgradeDef?.name || 'Unnamed Upgrade'}.`, upgradeDef?.category === 'research' ? 'system' : 'info');
          this.spawnPurchaseBurst(btn, upgradeDef?.category === 'research' ? 'research' : 'upgrade');
          this.playSound('buy');
          this.renderTop();
          this.renderUpgrades();
          requestAnimationFrame(() => this.app.renderAll());
        } else {
          this.toast(result.reason === 'research' ? 'Need more Research Data.' : result.reason === 'requires' ? 'Finish the prerequisite research first.' : 'Not enough credits.');
          this.app.renderAll();
        }
      });

      this.els.managerList.addEventListener('click', e => {
        const btn = e.target.closest('button[data-action="hire-manager"]');
        if (!btn) return;
        const result = this.app.hireManager(btn.dataset.id);
        if (result.ok) {
          this.toast('Manager hired.');
          this.spawnPurchaseBurst(btn, 'auto');
          this.playSound('hire');
        } else this.toast('Cannot hire that manager yet.');
        this.app.renderAll();
      });

      this.els.specialistList.addEventListener('click', e => {
        const btn = e.target.closest('button[data-action="hire-specialist"]');
        if (!btn) return;
        const result = this.app.hireSpecialist(btn.dataset.id);
        if (result.ok) {
          this.toast('Specialist joined the empire.');
          this.spawnPurchaseBurst(btn, 'hire');
          this.playSound('hire');
        } else this.toast('Not enough credits.');
        this.app.renderAll();
      });

      this.els.serviceList.addEventListener('click', e => {
        const btn = e.target.closest('button[data-action="buy-service"]');
        if (!btn) return;
        const result = this.app.buyService(btn.dataset.id);
        if (result.ok) {
          this.toast('Service contract signed.');
          this.spawnPurchaseBurst(btn, 'service');
          this.playSound('buy');
        } else this.toast(result.reason === 'research' ? 'Need more Research Data.' : 'Not enough credits.');
        this.app.renderAll();
      });

      this.els.regionsList.addEventListener('click', e => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const action = btn.dataset.action;
        const id = btn.dataset.id;
        if (!action || !id) return;
        let result = null;
        const regionDef = this.app.getRegionDef(id);
        if (action === 'unlock-region') result = this.app.unlockRegion(id);
        if (action === 'expand-region') result = this.app.expandRegion(id);
        if (action === 'project-region') result = this.app.buyRegionProject(id);
        if (action === 'focus-region') {
          this.app.setCurrentRegion(id);
          return;
        }
        if (result && result.ok) {
          const regionName = regionDef?.name || 'Unknown Region';
          const projectName = regionDef?.project?.name || 'Site project';
          this.toast(
            action === 'unlock-region'
              ? `Region unlocked: ${regionName}.`
              : action === 'expand-region'
                ? `Region expanded: ${regionName}.`
                : `${projectName} completed in ${regionName}.`
          );
          this.spawnPurchaseBurst(btn, action === 'project-region' ? 'project' : 'expand');
          this.playSound('buy');
        } else if (result) {
          this.toast(result.reason === 'research' ? 'Need more Research Data.' : 'Not enough credits.');
        }
        this.app.renderAll();
      });

      this.els.prestigeTree.addEventListener('click', e => {
        const btn = e.target.closest('button[data-action="buy-tree"]');
        if (!btn) return;
        const result = this.app.buyPrestigeNode(btn.dataset.id);
        if (result.ok) {
          this.toast('Innovation node purchased.');
          this.spawnPurchaseBurst(btn, 'IP');
          this.playSound('prestige');
        } else this.toast('Cannot buy that node yet.');
        this.app.renderAll();
      });

      this.els.prestigeBtn.addEventListener('click', () => {
        const gain = this.app.getPrestigeGain();
        if (gain <= 0) {
          this.toast('Push a little farther before overhauling.');
          return;
        }
        const result = this.app.doPrestige();
        if (result.ok) {
          this.toast(`Overhaul complete. +${result.gain} IP`);
          this.showBuddyLine('new run!');
          this.playSound('prestige');
        }
      });

      this.els.missionList.addEventListener('click', e => {
        const btn = e.target.closest('button[data-action="start-mission"]');
        if (!btn) return;
        const result = this.app.startQuest(btn.dataset.id);
        if (result.ok) {
          this.toast('Mission dispatched.');
          this.spawnPurchaseBurst(btn, 'quest');
          this.playSound('run');
        } else if (result.reason === 'teams') {
          this.toast('No mission teams available.');
        } else if (result.reason === 'cooldown') {
          this.toast(`Mission cooling down for ${this.app.formatDuration(result.cooldownRemaining)}.`);
        } else this.toast('Mission locked.');
        this.app.renderAll();
      });

      this.els.incidentList.addEventListener('click', e => {
        const btn = e.target.closest('button[data-action="respond-incident"]');
        if (!btn) return;
        const result = this.app.respondToIncident(btn.dataset.id);
        if (result.ok) {
          this.toast(result.resolved ? (result.boss ? 'Boss incident resolved.' : 'Incident resolved.') : 'Response team dispatched.');
          this.spawnPurchaseBurst(btn, result.resolved ? (result.boss ? 'boss' : 'fixed') : 'patch');
          this.playSound(result.resolved ? 'achievement' : 'run');
        }
        this.app.renderAll();
      });

      this.els.achievementPanelGrid.addEventListener('click', e => {
        const btn = e.target.closest('[data-achievement-id]');
        if (!btn) return;
        this.openAchievementModal(btn.dataset.achievementId);
      });

      if (this.els.achievementBadgeGrid) {
        this.els.achievementBadgeGrid.addEventListener('click', e => {
          const btn = e.target.closest('[data-achievement-id]');
          if (!btn) return;
          this.openAchievementModal(btn.dataset.achievementId);
        });
      }

      if (this.els.suiteAchievementGrid) {
        this.els.suiteAchievementGrid.addEventListener('click', e => {
          const btn = e.target.closest('[data-achievement-id]');
          if (!btn) return;
          this.openAchievementModal(btn.dataset.achievementId);
        });
      }

      this.els.closeAchievementBtn.addEventListener('click', () => this.closeAchievementModal());
      this.els.achievementModal.addEventListener('click', e => {
        if (e.target === this.els.achievementModal) this.closeAchievementModal();
      });

      if (this.els.closeHelpBtn) this.els.closeHelpBtn.addEventListener('click', () => this.closeHelpModal());
      if (this.els.helpModal) {
        this.els.helpModal.addEventListener('click', e => {
          if (e.target === this.els.helpModal) this.closeHelpModal();
        });
      }
      if (this.els.closeRobotBtn) this.els.closeRobotBtn.addEventListener('click', () => this.closeRobotModal());
      if (this.els.robotModal) {
        this.els.robotModal.addEventListener('click', e => {
          if (e.target === this.els.robotModal) this.closeRobotModal();
        });
      }
      if (this.els.robotPitchInput && this.els.robotPitchValue) {
        this.els.robotPitchInput.addEventListener('input', () => {
          this.els.robotPitchValue.textContent = `${Number(this.els.robotPitchInput.value || 1).toFixed(2)}x`;
        });
      }
      if (this.els.robotSpeedInput && this.els.robotSpeedValue) {
        this.els.robotSpeedInput.addEventListener('input', () => {
          this.els.robotSpeedValue.textContent = `${Number(this.els.robotSpeedInput.value || 1).toFixed(2)}x`;
        });
      }
      if (this.els.robotFrequencyInput && this.els.robotFrequencyValue) {
        this.els.robotFrequencyInput.addEventListener('input', () => {
          this.els.robotFrequencyValue.textContent = `${Number(this.els.robotFrequencyInput.value || 1).toFixed(2)}x`;
        });
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        this.populateRobotVoiceSelect(this.app?.state?.floorBotProfile?.voiceId || '');
        if ('onvoiceschanged' in window.speechSynthesis) {
          window.speechSynthesis.addEventListener('voiceschanged', () => {
            this.populateRobotVoiceSelect(this.app?.state?.floorBotProfile?.voiceId || this.els.robotVoiceSelect?.value || '');
          });
        }
      }
      if (this.els.saveRobotBtn) this.els.saveRobotBtn.addEventListener('click', () => this.saveRobotModal());
      if (this.els.arcadeQuitBtn) this.els.arcadeQuitBtn.addEventListener('click', () => this.confirmQuitArcadeGame());
      if (this.els.arcadeInlineCancelBtn) this.els.arcadeInlineCancelBtn.addEventListener('click', () => this.hideArcadeInlineConfirm());
      if (this.els.arcadeInlineConfirmBtn) this.els.arcadeInlineConfirmBtn.addEventListener('click', () => this.runArcadeInlineConfirm());
      if (this.els.offlineSummaryCloseBtn) this.els.offlineSummaryCloseBtn.addEventListener('click', () => this.hideOfflineSummary());
      if (this.els.deskComputerCloseBtn) this.els.deskComputerCloseBtn.addEventListener('click', () => this.closeDeskComputer());
      if (this.els.worldShopBtn) this.els.worldShopBtn.addEventListener('click', () => this.openWorldUtility('shop'));
      if (this.els.worldSettingsBtn) this.els.worldSettingsBtn.addEventListener('click', () => this.openWorldUtility('settings'));
      if (this.els.shopMoveModeBtn) this.els.shopMoveModeBtn.addEventListener('click', () => this.startShopMoveMode());
      if (this.els.placementCancelBtn) this.els.placementCancelBtn.addEventListener('click', () => {
        if (this.office3D?.placementMode && this.office3D.cancelPlacementMode) this.office3D.cancelPlacementMode();
        else if (this.office3D?.moveMode && this.office3D.cancelDecorMoveMode) this.office3D.cancelDecorMoveMode();
      });
      if (this.els.placementWallPrevBtn) this.els.placementWallPrevBtn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        if (this.office3D?.placementMode && this.office3D.cyclePlacementSide) {
          const zone = this.office3D.placementMode.zone || 'wall';
          this.office3D.cyclePlacementSide(zone === 'floor' ? -1 : 1);
          this.syncPlacementWallLabel();
        } else if (this.office3D?.moveMode && this.office3D.cycleMoveModeWall) {
          const viewZone = this.office3D.moveMode.viewZone || 'wall';
          this.office3D.cycleMoveModeWall(viewZone === 'floor' ? -1 : 1);
          this.syncMoveModeWallLabel();
        }
      });
      if (this.els.placementWallNextBtn) this.els.placementWallNextBtn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        if (this.office3D?.placementMode && this.office3D.cyclePlacementSide) {
          const zone = this.office3D.placementMode.zone || 'wall';
          this.office3D.cyclePlacementSide(zone === 'floor' ? 1 : -1);
          this.syncPlacementWallLabel();
        } else if (this.office3D?.moveMode && this.office3D.cycleMoveModeWall) {
          const viewZone = this.office3D.moveMode.viewZone || 'wall';
          this.office3D.cycleMoveModeWall(viewZone === 'floor' ? 1 : -1);
          this.syncMoveModeWallLabel();
        }
      });
      if (this.els.placementBackToMoveBtn) this.els.placementBackToMoveBtn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        if (this.office3D?.placementMode && this.office3D.cancelPlacementMode) {
          this.forcePlacementWallReturn = true;
          this.office3D.cancelPlacementMode();
        } else if (this.office3D?.moveMode && this.office3D.setDecorMoveModeView) {
          this.office3D.setDecorMoveModeView({ viewZone: 'wall', face: this.office3D.moveMode.face || 'back' });
          this.syncMoveModeHud(true);
        }
      });
      if (this.els.placementRotateLeftBtn) this.els.placementRotateLeftBtn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        if (this.office3D && this.office3D.rotatePlacementItem) this.office3D.rotatePlacementItem(-1);
      });
      if (this.els.placementRotateRightBtn) this.els.placementRotateRightBtn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        if (this.office3D && this.office3D.rotatePlacementItem) this.office3D.rotatePlacementItem(1);
      });
      if (this.els.worldUtilityCloseBtn) this.els.worldUtilityCloseBtn.addEventListener('click', () => this.closeWorldUtility());
      if (this.els.worldUtilityOverlay) {
        this.els.worldUtilityOverlay.addEventListener('click', e => {
          if (e.target === this.els.worldUtilityOverlay) this.closeWorldUtility();
        });
      }

      document.addEventListener('keydown', e => {
        if (this.arcade && (this.arcade.overlayOpen || this.arcade.holdView)) {
          if (e.key === 'Escape') {
            e.preventDefault();
            if (this.arcade.overlayOpen) {
              if (this.arcade.currentGameId) this.suspendArcadeSession();
              else this.leaveArcade(false);
              return;
            }
          }
          if (this.arcade.overlayOpen) {
            this.handleArcadeKeyDown(e);
            return;
          }
        }
        if (e.key !== 'Escape') return;
        if (this.worldUtilityOpen) {
          e.preventDefault();
          this.closeWorldUtility();
          return;
        }
        let closedModal = false;
        if (this.els.robotModal && !this.els.robotModal.classList.contains('hidden')) { this.closeRobotModal(); closedModal = true; }
        if (this.els.helpModal && !this.els.helpModal.classList.contains('hidden')) { this.closeHelpModal(); closedModal = true; }
        if (this.els.achievementModal && !this.els.achievementModal.classList.contains('hidden')) { this.closeAchievementModal(); closedModal = true; }
        if (closedModal) return;
        if (this.computerOpen) {
          e.preventDefault();
          this.closeDeskComputer();
        }
      });
      document.addEventListener('keyup', e => {
        if (this.arcade && this.arcade.overlayOpen) this.handleArcadeKeyUp(e);
      });
      document.addEventListener('contextmenu', e => {
        e.preventDefault();
      });

      this.els.saveBtn.addEventListener('click', () => this.app.save(true));

      this.els.exportBtn.addEventListener('click', async () => {
        const value = this.app.exportSave();
        try {
          await navigator.clipboard.writeText(value);
          this.toast('Save copied to clipboard.');
        } catch (err) {
          window.prompt('Copy your save:', value);
        }
      });

      this.els.importBtn.addEventListener('click', () => {
        const input = window.prompt('Paste your save string:');
        if (!input) return;
        const ok = this.app.importSave(input);
        this.toast(ok ? 'Save imported.' : 'Import failed.');
      });

      this.els.resetBtn.addEventListener('click', () => {
        const yes = window.confirm('Hard reset everything. Are you sure?');
        if (!yes) return;
        this.app.hardReset();
        this.toast('Fresh start.');
      });

      this.els.shopList.addEventListener('click', e => {
        const placementBtn = e.target.closest('button[data-action="place-cosmetic"]');
        if (placementBtn) {
          this.startDecorPlacement(placementBtn.dataset.category, placementBtn.dataset.id);
          return;
        }
        const btn = e.target.closest('button[data-action="buy-cosmetic"]');
        if (!btn) return;
        const category = btn.dataset.category;
        const id = btn.dataset.id;
        const placementZone = this.getCosmeticPlacementZone(category, id);
        const isPlaceable = !!placementZone;
        const result = this.app.buyCosmetic(category, id);
        if (result.ok) {
          const msg = result.unequipped ? 'Item unequipped.' : result.purchased && result.equipped ? (isPlaceable ? `Purchased. Choose a ${placementZone} spot.` : 'Purchased and equipped.') : result.purchased ? 'Purchased.' : 'Updated.';
          this.toast(msg);
          this.spawnPurchaseBurst(btn, result.unequipped ? 'off' : result.equipped ? 'equip' : 'style');
          this.showBuddyLine(result.unequipped ? 'swap' : 'fancy');
          this.playSound('buy');
          this.app.renderAll();
          if (isPlaceable && !result.unequipped) {
            requestAnimationFrame(() => this.startDecorPlacement(category, id));
          }
        } else {
          this.toast(result.reason === 'slots' ? 'No decor slots left. Upgrade the office suite.' : 'Not enough credits.');
          this.app.renderAll();
        }
      });

      this.els.officeUpgradeBtn.addEventListener('click', () => {
        const result = this.app.buyOfficeUpgrade();
        if (result.ok) {
          this.toast('Office suite upgraded. More decor slots unlocked.');
          this.playSound('buy');
        } else if (result.reason === 'max') this.toast('Office suite already maxed. Tiny luxury achieved.');
        else this.toast(result.reason === 'research' ? 'Need more Research Data.' : 'Not enough credits.');
        this.app.renderAll();
      });

      if (this.els.suiteUpgradeCard) {
        this.els.suiteUpgradeCard.addEventListener('click', e => {
          const btn = e.target.closest('button[data-action="buy-office-upgrade"]');
          if (!btn) return;
          const result = this.app.buyOfficeUpgrade();
          if (result.ok) {
            this.toast('Office suite upgraded. More decor slots unlocked.');
            this.spawnPurchaseBurst(btn, 'suite');
            this.playSound('buy');
          } else if (result.reason === 'max') this.toast('Office suite already maxed. Tiny luxury achieved.');
          else this.toast(result.reason === 'research' ? 'Need more Research Data.' : 'Not enough credits.');
          this.app.renderAll();
        });
      }

      this.els.toggleSoundBtn.addEventListener('click', () => {
        this.app.setSoundEnabled(!this.app.state.soundEnabled);
        if (this.app.state.soundEnabled) this.playSound('run');
      });

      if (this.els.graphicsQualityWrap) {
        this.els.graphicsQualityWrap.addEventListener('click', e => {
          const button = e.target.closest('[data-graphics-quality]');
          if (!button) return;
          this.app.setGraphicsQuality(button.dataset.graphicsQuality);
          this.playSound('ui');
        });
      }

      this.els.incidentAlertAckBtn.addEventListener('click', () => {
        this.hideIncidentAlert();
      });

      this.els.incidentAlertBtn.addEventListener('click', () => {
        const incidentId = this.currentAlertIncidentId;
        this.hideIncidentAlert();
        this.openIncidentCenter(incidentId);
      });
    },

    syncComputerMode() {
      const computerOpen = !!this.computerOpen;
      document.body.classList.toggle('office-computer-mode', computerOpen);
      document.body.classList.toggle('office-world-mode', !computerOpen);
      document.body.classList.toggle('mobile-terminal-app-open', computerOpen && !!this.mobileTerminalView);
      if (this.els.appShell) this.els.appShell.classList.toggle('computer-active', computerOpen);
      if (this.els.deskComputerCloseBtn) this.els.deskComputerCloseBtn.classList.toggle('hidden', !computerOpen);
      if (this.els.mobileTerminalBack) this.els.mobileTerminalBack.classList.toggle('hidden', !(computerOpen && this.mobileTerminalView));
      if (this.els.worldHud) this.els.worldHud.classList.toggle('hidden', computerOpen);
      if (this.els.worldQuickActions) this.els.worldQuickActions.classList.toggle('hidden', computerOpen);
      if (this.office3D && this.office3D.resize) requestAnimationFrame(() => this.office3D.resize());
    },

    openMobileTerminalApp(view) {
      if (!this.computerOpen) return;
      const nextView = ['achievements', 'console'].includes(view) ? view : 'console';
      this.mobileTerminalView = nextView;
      this.app.changeSuiteTab(nextView);
      this.syncComputerMode();
      if (nextView === 'console') {
        this.consolePinnedToBottom = true;
        requestAnimationFrame(() => this.renderConsole(true));
      }
    },

    closeMobileTerminalApp() {
      if (!this.mobileTerminalView) return;
      this.mobileTerminalView = '';
      this.app.changeSuiteTab('console');
      this.syncComputerMode();
      requestAnimationFrame(() => this.scrollMainToTop());
    },

    openDeskComputer(options = {}) {
      const wasOpen = !!this.computerOpen;
      const shouldStageDeskZoom = !wasOpen && this.office3D && this.office3D.enterComputerView;
      const transitionToken = `${Date.now()}-${Math.random()}`;
      this.pendingComputerOpenToken = transitionToken;
      const finishOpen = () => {
        if (this.pendingComputerOpenToken !== transitionToken || !this.computerOpen) return;
        this.syncComputerMode();
        this.renderAll();
      };
      if (shouldStageDeskZoom) {
        this.office3D.enterComputerView({ exitAtDesk: !!options.forceDeskView, onComplete: finishOpen, duration: 0.52 });
      }
      this.computerOpen = true;
      this.mobileTerminalView = '';
      if (options.panel) this.app.state.currentPanel = options.panel;

      // The 3D Office Suite is now the world itself, and Shop/Settings
      // are top-right world buttons. The desk terminal only hosts terminal apps.
      const requestedSuiteTab = options.suiteTab || this.app.state.currentSuiteTab;
      this.app.state.currentSuiteTab = ['achievements', 'console'].includes(requestedSuiteTab) ? requestedSuiteTab : 'console';

      if (shouldStageDeskZoom) {
        document.body.classList.add('office-computer-transitioning');
        window.setTimeout(() => {
          document.body.classList.remove('office-computer-transitioning');
          finishOpen();
        }, 620);
      } else {
        this.syncComputerMode();
        this.renderAll();
      }
      if (!wasOpen) {
        this.primeAudio();
        this.playSound('ui');
        this.toast('Desk computer online. Press Escape to return to the office.');
      }
    },

    closeDeskComputer(resumeControl = true) {
      if (!this.computerOpen) return;
      this.pendingComputerOpenToken = null;
      this.computerOpen = false;
      this.mobileTerminalView = '';
      this.syncComputerMode();
      const resumeAfterZoom = () => {
        if (resumeControl && !this.computerOpen && !this.worldUtilityOpen && this.office3D && this.office3D.resumeManualControl) {
          this.office3D.resumeManualControl();
        }
      };
      if (this.office3D && this.office3D.releaseComputerView) this.office3D.releaseComputerView(true, { onComplete: resumeAfterZoom, duration: 0.44 });
      else if (resumeControl) requestAnimationFrame(resumeAfterZoom);
      this.renderAll();
      this.toast('Back in the office.');
    },

    syncWorldUtility() {
      const open = !!this.worldUtilityOpen;
      const utility = this.currentWorldUtility === 'settings' ? 'settings' : 'shop';
      document.body.classList.toggle('world-utility-open', open);
      if (this.els.worldUtilityOverlay) {
        this.els.worldUtilityOverlay.classList.toggle('hidden', !open);
        this.els.worldUtilityOverlay.setAttribute('aria-hidden', open ? 'false' : 'true');
      }
      document.querySelectorAll('.world-utility-section').forEach(panel => {
        panel.classList.toggle('active', panel.id === `world-utility-${utility}`);
      });
      if (this.els.worldShopBtn) this.els.worldShopBtn.classList.toggle('active', open && utility === 'shop');
      if (this.els.worldSettingsBtn) this.els.worldSettingsBtn.classList.toggle('active', open && utility === 'settings');
      if (this.els.worldUtilityTitle) this.els.worldUtilityTitle.textContent = utility === 'settings' ? 'Settings & Saves' : 'Cosmetic Shop';
      if (this.els.worldUtilitySubtitle) {
        this.els.worldUtilitySubtitle.textContent = utility === 'settings'
          ? 'Audio, save tools, import/export, and reset controls.'
          : 'Customize the office without sitting down at the desk terminal.';
      }
    },

    openWorldUtility(utility = 'shop') {
      if (this.computerOpen) this.closeDeskComputer(false);
      this.currentWorldUtility = utility === 'settings' ? 'settings' : 'shop';
      this.worldUtilityOpen = true;
      if (this.office3D && this.office3D.releaseManualControl) this.office3D.releaseManualControl();
      this.syncWorldUtility();
      this.primeAudio();
      this.playSound('ui');
      this.renderShop();
    },

    closeWorldUtility(resumeControl = true) {
      if (!this.worldUtilityOpen) return;
      this.worldUtilityOpen = false;
      this.syncWorldUtility();
      if (resumeControl) {
        requestAnimationFrame(() => {
          if (!this.computerOpen && !this.worldUtilityOpen && this.office3D && this.office3D.resumeManualControl) {
            this.office3D.resumeManualControl();
          }
        });
      }
    },

    scrollMainToTop() {
      if (!this.els.appMain) return;
      this.els.appMain.scrollTo({ top: 0, behavior: 'auto' });
    },

    openShop() {
      this.openWorldUtility('shop');
    },

    closeShop() {
      this.closeWorldUtility();
    },

    openAchievementModal(id) {
      const def = DATA.achievementDefs.find(item => item.id === id);
      if (!def) return;
      const unlockedAt = this.app.getAchievementTime(id);
      this.els.achievementModalTitle.textContent = `${def.icon} ${def.name}`;
      this.els.achievementModalSubtitle.textContent = unlockedAt ? `Unlocked ${new Date(unlockedAt).toLocaleString()}` : 'Not unlocked yet';
      this.els.achievementModalBody.innerHTML = `
        <article class="card section-card">
          <p>${def.desc}</p>
          <div class="manager-meta"><span><strong>Reward:</strong> ${this.describeAchievementReward(def.reward || {})}</span></div>
        </article>`;
      this.els.achievementModal.classList.remove('hidden');
    },

    closeAchievementModal() {
      this.els.achievementModal.classList.add('hidden');
    },

    openHelpModal(sectionId = 'overview') {
      if (!this.els.helpModal || !this.els.helpNav || !this.els.helpContent) return;
      const target = HELP_SECTIONS.find(section => section.id === sectionId) || HELP_SECTIONS[0];
      this.els.helpNav.innerHTML = HELP_SECTIONS.map(section => `
        <button class="help-section-tab ${section.id === target.id ? 'active' : ''}" data-help-section="${section.id}">
          <strong>${section.label}</strong>
          <span>${section.blurb}</span>
        </button>`).join('');
      this.els.helpContent.innerHTML = target.html;
      this.els.helpNav.querySelectorAll('[data-help-section]').forEach(btn => {
        btn.addEventListener('click', () => this.openHelpModal(btn.dataset.helpSection));
      });
      this.els.helpModal.classList.remove('hidden');
    },

    closeHelpModal() {
      if (!this.els.helpModal) return;
      this.els.helpModal.classList.add('hidden');
    },

    getAvailableSpeechVoices() {
      if (typeof window === 'undefined' || !window.speechSynthesis || !window.speechSynthesis.getVoices) return [];
      const voices = window.speechSynthesis.getVoices() || [];
      return voices.filter(Boolean).sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
    },

    populateRobotVoiceSelect(selectedVoiceId = '') {
      if (!this.els.robotVoiceSelect) return;
      const voices = this.getAvailableSpeechVoices();
      const select = this.els.robotVoiceSelect;
      const previous = selectedVoiceId || select.value || '';
      select.innerHTML = '';
      const defaultOpt = document.createElement('option');
      defaultOpt.value = '';
      defaultOpt.textContent = 'Default Browser Voice';
      select.appendChild(defaultOpt);
      voices.forEach(voice => {
        const opt = document.createElement('option');
        const voiceId = String(voice.voiceURI || voice.name || '');
        opt.value = voiceId;
        const lang = voice.lang ? ` (${voice.lang})` : '';
        const extra = voice.default ? ' • default' : '';
        opt.textContent = `${voice.name || 'Voice'}${lang}${extra}`;
        select.appendChild(opt);
      });
      select.value = Array.from(select.options).some(o => o.value === previous) ? previous : '';
    },

    openRobotModal() {
      if (!this.els.robotModal) return;
      const profile = this.app.state.floorBotProfile || { name: 'Floor Bot', voicePitch: 1, voiceSpeed: 1, speechFrequency: 1, voiceEnabled: true, personality: 'funny' };
      if (this.els.robotNameInput) this.els.robotNameInput.value = profile.name || 'Floor Bot';
      if (this.els.robotPitchInput) this.els.robotPitchInput.value = String(profile.voicePitch ?? 1);
      if (this.els.robotPitchValue) this.els.robotPitchValue.textContent = `${Number(profile.voicePitch ?? 1).toFixed(2)}x`;
      if (this.els.robotSpeedInput) this.els.robotSpeedInput.value = String(profile.voiceSpeed ?? 1);
      if (this.els.robotSpeedValue) this.els.robotSpeedValue.textContent = `${Number(profile.voiceSpeed ?? 1).toFixed(2)}x`;
      if (this.els.robotFrequencyInput) this.els.robotFrequencyInput.value = String(profile.speechFrequency ?? 1);
      if (this.els.robotFrequencyValue) this.els.robotFrequencyValue.textContent = `${Number(profile.speechFrequency ?? 1).toFixed(2)}x`;
      this.populateRobotVoiceSelect(profile.voiceId || '');
      if (this.els.robotPersonalitySelect) this.els.robotPersonalitySelect.value = profile.personality || 'funny';
      if (this.els.robotVoiceToggle) this.els.robotVoiceToggle.checked = profile.voiceEnabled !== false;
      this.els.robotModal.classList.remove('hidden');
    },

    closeRobotModal() {
      if (!this.els.robotModal) return;
      this.els.robotModal.classList.add('hidden');
    },

    saveRobotModal() {
      const profile = this.app.updateFloorBotProfile({
        name: this.els.robotNameInput ? this.els.robotNameInput.value : 'Floor Bot',
        voicePitch: this.els.robotPitchInput ? Number(this.els.robotPitchInput.value || 1) : 1,
        voiceSpeed: this.els.robotSpeedInput ? Number(this.els.robotSpeedInput.value || 1) : 1,
        speechFrequency: this.els.robotFrequencyInput ? Number(this.els.robotFrequencyInput.value || 1) : 1,
        voiceId: this.els.robotVoiceSelect ? this.els.robotVoiceSelect.value : '',
        personality: this.els.robotPersonalitySelect ? this.els.robotPersonalitySelect.value : 'funny',
        voiceEnabled: this.els.robotVoiceToggle ? this.els.robotVoiceToggle.checked : true
      });
      this.closeRobotModal();
      this.renderOffice();
      if (this.office3D && this.office3D.speakBotLine) this.office3D.speakBotLine('__personality_updated__');
      this.toast('Robot settings updated.');
    },

    openIncidentCenter(incidentId = null) {
      this.openDeskComputer({ panel: 'missions', suiteTab: 'console', forceDeskView: true });
      this.app.changePanel('missions');
      if (!incidentId) {
        requestAnimationFrame(() => {
          const monitor = this.els.incidentList?.closest('.section-card') || this.els.incidentList;
          if (monitor) monitor.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        return;
      }
      requestAnimationFrame(() => this.focusIncidentCard(incidentId));
    },

    focusIncidentCard(incidentId) {
      const target = document.querySelector(`[data-incident-card="${incidentId}"]`);
      if (!target) {
        const fallback = this.els.incidentList?.closest('.section-card') || this.els.incidentList;
        if (fallback) fallback.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('incident-focus');
      clearTimeout(this.incidentFocusTimer);
      this.incidentFocusTimer = setTimeout(() => target.classList.remove('incident-focus'), 1700);
    },

    renderAll() {
      this.syncComputerMode();
      this.renderPurchaseModes();
      this.renderRegionChips();
      this.renderPanels();
      this.renderSuitePanels();
      this.renderOps();
      this.renderMissions();
      this.renderUpgrades();
      this.renderStaff();
      this.renderRegions();
      this.renderPrestige();
      this.renderCommand();
      this.renderAchievements();
      this.renderCollections();
      this.renderOffice();
      this.renderShop();
      this.renderConsole();
      this.renderGraphicsQuality();
      this.syncWorldUtility();
      this.updateLive(true, true);
    },

    renderPanels() {
      document.querySelectorAll('.panel').forEach(panel => panel.classList.remove('active'));
      const active = document.getElementById(`panel-${this.app.state.currentPanel}`);
      if (active) active.classList.add('active');

      if (this.els.networkFootprintCard) {
        this.els.networkFootprintCard.classList.toggle('hidden', this.app.state.currentPanel !== 'ops');
      }

      this.els.mainNav.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.panel === this.app.state.currentPanel);
      });
      this.renderCommandAttention();

      this.els.upgradeTabs.querySelectorAll('.subtab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.upgradeView === this.app.state.currentUpgradeView);
      });

      if (this.els.shopTabs) {
        this.els.shopTabs.querySelectorAll('.subtab').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.shopView === this.app.state.currentShopView);
        });
      }
    },

    renderSuitePanels() {
      let suiteTab = this.app.state.currentSuiteTab;
      const terminalTabs = ['office', 'achievements', 'console'];

      // Shop and Settings now live as world buttons, not desk-terminal apps.
      if (!terminalTabs.includes(suiteTab)) {
        suiteTab = this.computerOpen ? 'console' : 'office';
        this.app.state.currentSuiteTab = suiteTab;
      }

      // The Office Suite panel belongs only to world mode now. In computer mode,
      // route accidental/legacy office tab state into the terminal console.
      if (this.computerOpen && suiteTab === 'office') {
        suiteTab = 'console';
        this.app.state.currentSuiteTab = 'console';
      }

      document.querySelectorAll('.suite-panel').forEach(panel => panel.classList.remove('active'));
      const active = document.getElementById(`suite-panel-${suiteTab}`);
      if (active) active.classList.add('active');
      if (this.els.suiteTabs) {
        this.els.suiteTabs.querySelectorAll('.suite-tab').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.suiteTab === suiteTab);
        });
      }
      if (this.office3D && suiteTab === 'office' && this.lastSuiteTabRendered !== 'office') {
        requestAnimationFrame(() => this.office3D.resize());
      }
      this.lastSuiteTabRendered = suiteTab;
    },

    renderTop() {
      const state = this.app.state;
      this.els.creditsValue.textContent = `${this.app.formatNumber(state.credits)} CC`;
      const potentialIps = this.app.getPotentialIncomePerSecond();
      this.els.ipsValue.textContent = `${this.app.formatNumber(potentialIps)} CC`;
      this.els.passiveIpsValue.textContent = `${this.app.formatNumber(this.app.getAutomatedIncomePerSecond())} CC`;
      this.els.ipValue.textContent = `${this.app.formatNumber(state.innovationPoints)} IP`;
      this.els.researchValue.textContent = `${this.app.formatNumber(state.research)} RD`;
      this.els.fragmentsValue.textContent = `${state.ipFragments}/3`;
      this.els.lifetimeValue.textContent = `${this.app.formatNumber(state.lifetimeCredits)} CC`;
      this.els.capacityValue.textContent = `${this.app.formatNumber(this.app.getUsedCapacity())} / ${this.app.formatNumber(this.app.getTotalCapacity())}`;
      this.els.managersValue.textContent = `${state.totalManagers}`;
      this.els.missionTeamsValue.textContent = `${this.app.getAvailableMissionTeams()} / ${state.missionSlots}`;
      this.els.securityValue.textContent = `${Math.round((this.app.state.multipliers.incidentChanceReduction + this.app.state.multipliers.responsePower) * 100)}%`;
      this.els.offlineValue.textContent = `${state.offlineCapHours}h @ ${Math.round(this.app.getEffectiveOfflineEfficiency() * 100)}%`;
      this.els.missionTeamsPanelValue.textContent = `${this.app.getAvailableMissionTeams()} / ${state.missionSlots}`;
      this.els.missionResearchValue.textContent = `${this.app.formatNumber(state.research)} RD`;
      this.els.activeIncidentsValue.textContent = `${state.activeIncidents.length}`;
      this.els.incidentShieldValue.textContent = state.incidentShieldRemaining > 0 ? this.app.formatDuration(state.incidentShieldRemaining) : 'None';
      if (this.els.toggleSoundBtn) {
        this.els.toggleSoundBtn.textContent = state.soundEnabled ? 'Sound On' : 'Sound Off';
        this.els.toggleSoundBtn.classList.toggle('active', state.soundEnabled);
      }
      if (this.els.worldCreditsValue) this.els.worldCreditsValue.textContent = `${this.app.formatNumber(state.credits)} CC`;
      if (this.els.worldRateValue) this.els.worldRateValue.textContent = `${this.app.formatNumber(this.app.getAutomatedIncomePerSecond())} CC`;
      if (this.els.worldIncidentsValue) this.els.worldIncidentsValue.textContent = `${state.activeIncidents.length}`;
      if (this.els.mobileCreditsValue) this.els.mobileCreditsValue.textContent = `${this.app.formatNumber(state.credits)} CC`;
      if (this.els.mobileRateValue) this.els.mobileRateValue.textContent = `${this.app.formatNumber(this.app.getAutomatedIncomePerSecond())} CC`;
      if (this.els.mobileIncidentsValue) this.els.mobileIncidentsValue.textContent = `${state.activeIncidents.length}`;
    },

    renderGraphicsQuality() {
      if (!this.els.graphicsQualityWrap) return;
      const quality = ['auto', 'performance', 'balanced', 'quality'].includes(this.app.state.graphicsQuality)
        ? this.app.state.graphicsQuality
        : 'performance';
      this.els.graphicsQualityWrap.querySelectorAll('[data-graphics-quality]').forEach(button => {
        const active = button.dataset.graphicsQuality === quality;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    },

    renderPurchaseModes() {
      this.els.purchaseModeWrap.innerHTML = DATA.purchaseModes.map(mode => {
        const label = String(mode);
        return `<button class="mode-chip ${this.app.state.purchaseMode === mode ? 'active' : ''}" data-mode="${label}">${label}</button>`;
      }).join('');
    },

    renderRegionChips() {
      this.els.regionChipRow.innerHTML = DATA.regionDefs.filter(region => this.app.state.unlockedRegions[region.id]).map(region => {
        const lvl = this.app.state.regionLevels[region.id] || 0;
        return `<button class="region-chip ${this.app.state.currentRegionId === region.id ? 'active' : ''}" data-region-id="${region.id}">${region.icon} ${region.name} <span class="muted">Lv ${lvl + 1}</span></button>`;
      }).join('');
    },

    renderOps() {
      this.renderOpsIncidentSummary();
      this.els.opsList.innerHTML = DATA.generatorDefs.map(def => {
        const gen = this.app.getGenState(def.id);
        const unlocked = this.app.canUnlockGenerator(def);
        const nextCost = this.app.getNextCost(def, gen.owned);
        const qty = Math.max(0, this.app.getSelectedQuantity(def));
        const bulkCost = qty ? this.app.costForQuantity(def, gen.owned, qty) : 0;
        const canAfford = qty > 0 && this.app.state.credits >= bulkCost && this.app.getRemainingCapacity() >= this.app.getEffectiveCapacityUse(def) * qty;
        const managerCost = this.app.getManagerCost(def);
        const canHire = gen.owned > 0 && !gen.managerHired && this.app.state.credits >= managerCost;
        const milestones = DATA.milestoneDefs.map(m => `<span class="milestone-pill ${gen.owned >= m.count ? 'hit' : ''}">${m.count}</span>`).join('');
        const incomePerCycle = gen.owned ? this.app.getIncomePerCycle(def, gen) : 0;
        const perSecond = gen.owned ? this.app.getGeneratorPotentialPerSecond(def, gen) : 0;
        const lockMsg = !unlocked ? `Unlocks at ${this.app.formatNumber(def.unlockAt)} lifetime compute` : '';
        return `
          <article class="row-card ${unlocked ? '' : 'locked'}" data-gen-card="${def.id}">
            <div class="row-main">
              <div>
                <div class="generator-name"><span class="icon-badge">${def.icon}</span> ${def.name}</div>
                <div class="row-meta">
                  <span><strong>Owned:</strong> <span data-gen-owned="${def.id}">${gen.owned}</span></span>
                  <span><strong>Cycle:</strong> <span data-gen-cycle="${def.id}">${this.app.formatDuration(this.app.getCycleTime(def))}</span></span>
                  <span><strong>Cap / unit:</strong> <span data-gen-cap="${def.id}">${this.app.getEffectiveCapacityUse(def).toFixed(1)}</span></span>
                </div>
                <div class="row-meta">
                  <span><strong>Per cycle:</strong> <span class="income-good" data-gen-per-cycle="${def.id}">${this.app.formatNumber(incomePerCycle)} CC</span></span>
                  <span><strong>Avg / sec:</strong> <span class="income-good" data-gen-per-second="${def.id}">${this.app.formatNumber(perSecond)} CC</span></span>
                  <span><strong>Manager:</strong> ${def.managerName}</span>
                </div>
                <p class="muted">${def.desc}</p>
                <p class="lock-msg ${lockMsg ? '' : 'hidden'}" data-gen-lock="${def.id}">${lockMsg}</p>
                <div class="progress-wrap">
                  <div class="progress-track"><div class="progress-bar" data-progress-id="${def.id}"></div></div>
                  <div class="milestones">${DATA.milestoneDefs.map(m => `<span class="milestone-pill ${gen.owned >= m.count ? 'hit' : ''}" data-gen-milestone="${def.id}:${m.count}">${m.count}</span>`).join('')}</div>
                </div>
              </div>
              <div class="row-actions">
                <button class="action-btn ${(!gen.running && !gen.automated && gen.owned) ? 'can-afford' : 'nope'}" data-action="run-generator" data-id="${def.id}">
                  ${gen.automated ? 'Automated' : gen.running ? 'Running...' : 'Run'}
                </button>
                <button class="action-btn ${canHire ? 'can-afford' : 'nope'}" data-action="hire-manager" data-id="${def.id}">
                  ${gen.managerHired ? 'Manager ✓' : `Hire Manager (${this.app.formatNumber(managerCost)})`}
                </button>
                <button class="buy-btn ${canAfford ? 'can-afford' : 'nope'}" data-action="buy-generator" data-id="${def.id}">
                  ${qty ? `Buy ${qty}` : 'Buy'} (${this.app.formatNumber(qty ? bulkCost : nextCost)})
                </button>
              </div>
            </div>
          </article>`;
      }).join('');
    },

    updateOpsLive(force = false) {
      const list = this.els.opsList;
      if (!list || !list.children || !list.children.length) return;
      DATA.generatorDefs.forEach(def => {
        const gen = this.app.getGenState(def.id);
        const card = list.querySelector(`[data-gen-card="${def.id}"]`);
        if (!card) return;
        const unlocked = this.app.canUnlockGenerator(def);
        const nextCost = this.app.getNextCost(def, gen.owned);
        const qty = Math.max(0, this.app.getSelectedQuantity(def));
        const bulkCost = qty ? this.app.costForQuantity(def, gen.owned, qty) : 0;
        const capUse = this.app.getEffectiveCapacityUse(def);
        const canAfford = qty > 0 && this.app.state.credits >= bulkCost && this.app.getRemainingCapacity() >= capUse * qty;
        const managerCost = this.app.getManagerCost(def);
        const canHire = gen.owned > 0 && !gen.managerHired && this.app.state.credits >= managerCost;
        const incomePerCycle = gen.owned ? this.app.getIncomePerCycle(def, gen) : 0;
        const perSecond = gen.owned ? this.app.getGeneratorPotentialPerSecond(def, gen) : 0;
        const lockMsg = !unlocked ? `Unlocks at ${this.app.formatNumber(def.unlockAt)} lifetime compute` : '';

        card.classList.toggle('locked', !unlocked);
        const ownedEl = card.querySelector(`[data-gen-owned="${def.id}"]`);
        const cycleEl = card.querySelector(`[data-gen-cycle="${def.id}"]`);
        const capEl = card.querySelector(`[data-gen-cap="${def.id}"]`);
        const perCycleEl = card.querySelector(`[data-gen-per-cycle="${def.id}"]`);
        const perSecondEl = card.querySelector(`[data-gen-per-second="${def.id}"]`);
        const lockEl = card.querySelector(`[data-gen-lock="${def.id}"]`);
        if (ownedEl) ownedEl.textContent = gen.owned;
        if (cycleEl) cycleEl.textContent = this.app.formatDuration(this.app.getCycleTime(def));
        if (capEl) capEl.textContent = capUse.toFixed(1);
        if (perCycleEl) perCycleEl.textContent = `${this.app.formatNumber(incomePerCycle)} CC`;
        if (perSecondEl) perSecondEl.textContent = `${this.app.formatNumber(perSecond)} CC`;
        if (lockEl) {
          lockEl.textContent = lockMsg;
          lockEl.classList.toggle('hidden', !lockMsg);
        }

        DATA.milestoneDefs.forEach(m => {
          const pill = card.querySelector(`[data-gen-milestone="${def.id}:${m.count}"]`);
          if (pill) pill.classList.toggle('hit', gen.owned >= m.count);
        });

        const runBtn = card.querySelector(`button[data-action="run-generator"][data-id="${def.id}"]`);
        if (runBtn) {
          const runReady = !gen.running && !gen.automated && gen.owned > 0;
          runBtn.textContent = gen.automated ? 'Automated' : gen.running ? 'Running...' : 'Run';
          runBtn.disabled = !runReady;
          runBtn.classList.toggle('can-afford', runReady);
          runBtn.classList.toggle('nope', !runReady);
        }

        const managerBtn = card.querySelector(`button[data-action="hire-manager"][data-id="${def.id}"]`);
        if (managerBtn) {
          const managerLabel = gen.managerHired ? 'Manager ✓' : `Hire Manager (${this.app.formatNumber(managerCost)})`;
          managerBtn.textContent = managerLabel;
          managerBtn.disabled = gen.managerHired || gen.owned <= 0 || !canHire;
          managerBtn.classList.toggle('can-afford', canHire);
          managerBtn.classList.toggle('nope', !canHire);
        }

        const buyBtn = card.querySelector(`button[data-action="buy-generator"][data-id="${def.id}"]`);
        if (buyBtn) {
          buyBtn.textContent = `${qty ? `Buy ${qty}` : 'Buy'} (${this.app.formatNumber(qty ? bulkCost : nextCost)})`;
          buyBtn.disabled = !canAfford;
          buyBtn.classList.toggle('can-afford', canAfford);
          buyBtn.classList.toggle('nope', !canAfford);
        }
      });
    },

    renderOpsIncidentSummary() {
      const incidents = this.app.state.activeIncidents;
      if (!incidents.length) {
        this.els.opsIncidentSummary.innerHTML = `
          <div class="status-pill calm">No active incidents</div>
          <div class="status-pill">Security ${Math.round(this.app.state.multipliers.incidentChanceReduction * 100)}%</div>
          <div class="status-pill">Response ${Math.round(this.app.state.multipliers.responsePower * 100)}%</div>
          <div class="status-pill">Shield ${this.app.state.incidentShieldRemaining > 0 ? this.app.formatDuration(this.app.state.incidentShieldRemaining) : 'none'}</div>`;
        return;
      }
      this.els.opsIncidentSummary.innerHTML = incidents.map(incident => `
        <button class="status-pill incident ${incident.boss ? 'boss' : ''} severity-${this.getSeverityClass(incident.severity)}" data-action="open-missions" data-incident-id="${incident.uid}">${incident.icon} ${incident.name} · ${this.app.formatDuration(incident.remaining)}</button>`
      ).join('');
    },



    getPanelAvailabilityCounts() {
      const counts = {
        ops: 0,
        missions: 0,
        upgrades: 0,
        staff: 0,
        regions: 0,
        command: 0,
        overhaul: 0
      };

      const credits = this.app.state.credits;
      const research = this.app.state.research;

      DATA.generatorDefs.forEach(def => {
        const gen = this.app.getGenState(def.id);
        const qty = Math.max(0, this.app.getSelectedQuantity(def));
        const bulkCost = qty ? this.app.costForQuantity(def, gen.owned, qty) : 0;
        const canBuy = this.app.canUnlockGenerator(def)
          && qty > 0
          && credits >= bulkCost
          && this.app.getRemainingCapacity() >= this.app.getEffectiveCapacityUse(def) * qty;
        const canHire = gen.owned > 0 && !gen.managerHired && credits >= this.app.getManagerCost(def);
        if (canBuy || canHire) counts.ops += 1;
      });

      DATA.upgradeDefs
        .filter(def => !this.app.state.purchasedUpgrades[def.id] && this.app.meetsCondition(def.visibleWhen))
        .forEach(def => {
          if (this.app.upgradeRequirementsMet(def) && this.app.canBuyUpgradeDef(def)) counts.upgrades += 1;
        });

      DATA.generatorDefs.forEach(def => {
        const gen = this.app.getGenState(def.id);
        if (gen.owned > 0 && !gen.managerHired && credits >= this.app.getManagerCost(def)) counts.staff += 1;
      });

      (DATA.specialistDefs || []).forEach(def => {
        if (!this.app.state.hiredSpecialists[def.id] && this.app.meetsCondition(def.visibleWhen) && credits >= def.cost) counts.staff += 1;
      });

      (DATA.serviceDefs || []).forEach(def => {
        const canBuy = !this.app.state.purchasedServices[def.id]
          && this.app.meetsCondition(def.visibleWhen)
          && credits >= (def.cost || 0)
          && research >= (def.costResearch || 0);
        if (canBuy) counts.staff += 1;
      });

      DATA.regionDefs.forEach(region => {
        const unlocked = this.app.state.unlockedRegions[region.id];
        const canUnlock = !unlocked && credits >= this.app.getRegionUnlockCost(region);
        const canExpand = unlocked && credits >= this.app.getRegionExpansionCost(region.id);
        const project = region.project;
        const canProject = !!project
          && unlocked
          && !this.app.state.regionProjects[region.id]
          && credits >= (project.costCredits || 0)
          && research >= (project.costResearch || 0);
        if (canUnlock || canExpand || canProject) counts.regions += 1;
      });

      (DATA.prestigeNodeDefs || []).forEach(node => {
        if (this.app.canBuyPrestigeNode(node)) counts.overhaul += 1;
      });

      return counts;
    },

    getUpgradeViewAvailabilityCounts() {
      const counts = {
        global: 0,
        category: 0,
        automation: 0,
        facilities: 0,
        resilience: 0,
        research: 0
      };

      DATA.upgradeDefs
        .filter(def => !this.app.state.purchasedUpgrades[def.id] && this.app.meetsCondition(def.visibleWhen))
        .forEach(def => {
          if (this.app.upgradeRequirementsMet(def) && this.app.canBuyUpgradeDef(def)) {
            counts[def.view] = (counts[def.view] || 0) + 1;
          }
        });

      return counts;
    },

    updateUpgradeSubtabBadges() {
      if (!this.els.upgradeTabs) return;
      const counts = this.getUpgradeViewAvailabilityCounts();
      this.els.upgradeTabs.querySelectorAll('.subtab[data-upgrade-view]').forEach(btn => {
        const view = btn.dataset.upgradeView;
        const count = counts[view] || 0;
        btn.dataset.badge = '';
        btn.dataset.dot = count > 0 ? 'true' : '';
        btn.classList.toggle('has-alert', count > 0);
      });
    },

    updateTabAvailabilityBadges() {
      const counts = this.getPanelAvailabilityCounts();
      if (!this.els.mainNav) return;
      this.els.mainNav.querySelectorAll('.nav-btn').forEach(btn => {
        const panel = btn.dataset.panel;
        const count = panel === 'ops' ? 0 : (counts[panel] || 0);
        btn.dataset.badge = count > 0 ? (count > 99 ? '99+' : String(count)) : '';
        btn.classList.toggle('has-alert', count > 0);
      });
      this.updateUpgradeSubtabBadges();
    },

    updateCurrentPanelCardDots() {
      const active = document.getElementById(`panel-${this.app.state.currentPanel}`);
      if (!active) return;
      active.querySelectorAll('.has-available-dot').forEach(card => card.classList.remove('has-available-dot'));
      if (this.app.state.currentPanel === 'ops') return;
      const selectors = [
        'button[data-action="buy-generator"].can-afford:not([disabled])',
        'button[data-action="hire-manager"].can-afford:not([disabled])',
        'button[data-action="buy-upgrade"].can-afford:not([disabled])',
        'button[data-action="hire-specialist"].can-afford:not([disabled])',
        'button[data-action="buy-service"].can-afford:not([disabled])',
        'button[data-action="unlock-region"].can-afford:not([disabled])',
        'button[data-action="expand-region"].can-afford:not([disabled])',
        'button[data-action="project-region"].can-afford:not([disabled])',
        'button[data-action="buy-tree"].can-afford:not([disabled])'
      ];
      active.querySelectorAll(selectors.join(',')).forEach(btn => {
        const card = btn.closest('.row-card, .manager-card, .upgrade-card, .region-card, .tree-card');
        if (card) card.classList.add('has-available-dot');
      });
    },

    getCommandAttentionCount() {
      let count = 0;
      const contracts = [...this.app.getContractsForSpan('daily'), ...this.app.getContractsForSpan('weekly')];
      count += contracts.filter(contract => contract.complete && !contract.claimed).length;
      const doctrineChoices = (DATA.doctrineDefs || []).filter(def => this.app.meetsCondition(def.unlockWhen) && def.id !== this.app.state.activeDoctrineId);
      if (doctrineChoices.length) count += 1;
      const eraChoices = (DATA.eraDefs || []).filter(def => this.app.meetsCondition(def.unlockWhen) && def.id !== this.app.state.activeEraId);
      if (eraChoices.length) count += 1;
      const freshChallenges = (DATA.challengeDefs || []).filter(def => this.app.meetsCondition(def.unlockWhen) && !this.app.state.challengeCompletions?.[def.id] && this.app.state.selectedChallengeId !== def.id && this.app.state.activeChallengeId !== def.id);
      if (freshChallenges.length) count += 1;
      return count;
    },

    renderCommandAttention() {
      this.updateTabAvailabilityBadges();
    },

    renderCampaignRequirementChips(def) {
      const chips = [];
      if (def.requiresGoal) {
        const prior = this.app.getCampaignGoalDef(def.requiresGoal);
        const done = this.app.isCampaignGoalComplete(def.requiresGoal);
        chips.push(`<span class="requirement-chip ${done ? 'done' : 'locked'}">${done ? '✓' : '•'} ${prior?.name || def.requiresGoal}</span>`);
      }
      const cond = def.unlockWhen || {};
      const addCond = (label, done) => chips.push(`<span class="requirement-chip ${done ? 'done' : 'locked'}">${done ? '✓' : '•'} ${label}</span>`);
      if (cond.officeTier) addCond(`${this.app.getOfficeSuiteDef(Math.min(cond.officeTier, DATA.officeSuiteDefs.length - 1)).name}`, this.app.state.officeTier >= cond.officeTier);
      if (cond.unlockedRegions) addCond(`${this.app.getUnlockedRegions().length}/${cond.unlockedRegions} regions`, this.app.getUnlockedRegions().length >= cond.unlockedRegions);
      if (cond.unlockedRegion) addCond(`${this.app.getRegionDef(cond.unlockedRegion)?.name || cond.unlockedRegion} unlocked`, !!this.app.state.unlockedRegions?.[cond.unlockedRegion]);
      if (cond.research) addCond(`${this.app.formatNumber(this.app.state.research)} / ${this.app.formatNumber(cond.research)} RD`, this.app.state.research >= cond.research);
      if (cond.prestiges) addCond(`${this.app.state.stats.prestiges} / ${cond.prestiges} overhauls`, this.app.state.stats.prestiges >= cond.prestiges);
      if (cond.highestTier) addCond(`tier ${this.app.getHighestTierOwned()} / ${cond.highestTier}`, this.app.getHighestTierOwned() >= cond.highestTier);
      return chips.length ? `<div class="requirement-row">${chips.join('')}</div>` : '';
    },

    describeCampaignCosts(def) {
      const bits = [];
      if (def.costCredits) bits.push(`${this.app.formatNumber(def.costCredits)} CC`);
      if (def.costResearch) bits.push(`${this.app.formatNumber(def.costResearch)} RD`);
      if (def.costIp) bits.push(`${def.costIp} IP`);
      if (def.costFragments) bits.push(`${def.costFragments} Fragments`);
      return bits.join(' • ');
    },

    renderCommand() {
      this.renderCommandAttention();
      if (this.els.campaignGoalList) {
        const goals = DATA.campaignGoalDefs || [];
        const completed = this.app.getCampaignGoalsCompletedCount ? this.app.getCampaignGoalsCompletedCount() : 0;
        const nextGoal = goals.find(goal => !this.app.isCampaignGoalComplete(goal.id));
        const pct = goals.length ? Math.round((completed / goals.length) * 100) : 0;
        const summary = `
          <article class="manager-card card campaign-route-summary ${completed >= goals.length ? 'done' : ''}">
            <div class="manager-top">
              <div class="manager-name"><span class="icon-badge">🧭</span> Career Route</div>
              <span class="tag">${completed}/${goals.length} secured</span>
            </div>
            <p class="muted">These giant objective purchases survive overhauls and give the empire a real long-game arc instead of a fuzzy maybe-someday ending.</p>
            <div class="manager-meta"><span><strong>Current north star:</strong> ${nextGoal ? nextGoal.name : 'Route complete. You are the landlord of the future.'}</span></div>
            <div class="progress-track slim"><div class="progress-bar mission-bar" style="width:${pct}%"></div></div>
          </article>`;
        const cards = goals.map(def => {
          const done = this.app.isCampaignGoalComplete(def.id);
          const unlocked = this.app.campaignGoalRequirementsMet ? this.app.campaignGoalRequirementsMet(def) : true;
          const canBuy = this.app.canBuyCampaignGoal ? this.app.canBuyCampaignGoal(def) : false;
          const when = this.app.getCampaignGoalCompletionTime ? this.app.getCampaignGoalCompletionTime(def.id) : 0;
          return `
            <article class="manager-card card campaign-goal-card ${done ? 'done' : (!unlocked ? 'locked' : '')}">
              <div class="manager-top">
                <div class="manager-name"><span class="icon-badge">${def.icon}</span> ${def.name}</div>
                <span class="tag">${done ? 'secured' : def.stage}</span>
              </div>
              <p class="muted">${def.desc}</p>
              <div class="manager-meta"><span><strong>Cost:</strong> ${this.describeCampaignCosts(def)}</span></div>
              <div class="manager-meta"><span><strong>Reward:</strong> ${def.rewardText}</span>${when ? `<span><strong>Secured:</strong> ${new Date(when).toLocaleDateString()}</span>` : ''}</div>
              ${this.renderCampaignRequirementChips(def)}
              <div class="manager-actions"><button class="buy-btn ${done ? 'nope' : canBuy ? 'can-afford' : 'nope'}" data-action="buy-campaign-goal" data-id="${def.id}">${done ? 'Secured' : unlocked ? 'Secure Objective' : 'Locked Route'}</button></div>
            </article>`;
        }).join('');
        this.els.campaignGoalList.innerHTML = summary + cards;
      }
      if (this.els.regionMasteryList) {
        const visibleRegions = DATA.regionDefs.filter(region => this.app.state.unlockedRegions?.[region.id] || this.app.meetsCondition(region.visibleWhen) || this.app.meetsCondition(region.unlockWhen));
        this.els.regionMasteryList.innerHTML = visibleRegions.map(region => {
          const mastery = this.app.getRegionMastery(region.id);
          const nextXp = this.app.getRegionMasteryNextXp(mastery.level);
          const currentXp = Math.floor(mastery.xp || 0);
          const pct = Math.max(0, Math.min(100, currentXp / Math.max(1, nextXp) * 100));
          const unlocked = !!this.app.state.unlockedRegions?.[region.id];
          const expanded = this.app.state.regionLevels?.[region.id] || 0;
          const projectOwned = !!this.app.state.regionProjects?.[region.id];
          return `
            <article class="manager-card card region-mastery-card ${unlocked ? '' : 'locked'}">
              <div class="manager-top">
                <div class="manager-name"><span class="icon-badge">${region.icon}</span> ${region.name}</div>
                <span class="tag">Lv ${mastery.level + 1}</span>
              </div>
              <p class="muted">${region.desc}</p>
              <div class="progress-track slim"><div class="progress-bar mission-bar" style="width:${pct}%"></div></div>
              <div class="manager-meta"><span><strong>Mastery XP:</strong> ${currentXp} / ${nextXp}</span><span><strong>Expands:</strong> ${expanded}</span></div>
              <div class="manager-meta"><span><strong>Project:</strong> ${projectOwned ? 'built' : region.project ? 'available later' : 'none'}</span><span><strong>Scale:</strong> +${mastery.level * 6}% bonus • +${mastery.level * 4}% capacity</span></div>
            </article>`;
        }).join('') || `<div class="manager-card card"><p class="muted">Regions will show up here as your empire stops pretending it is small.</p></div>`;
      }
    },

    renderMissions() {
      const season = this.app.getCurrentSeasonDef();
      if (this.els.seasonCard) {
        const doctrine = this.app.getActiveDoctrineDef();
        const era = this.app.getActiveEraDef();
        this.els.seasonCard.innerHTML = season ? `
          <article class="manager-card card meta-card season-meta">
            <div class="manager-top">
              <div class="manager-name"><span class="icon-badge">${season.icon}</span> ${season.name}</div>
              <span class="tag">weekly rotation</span>
            </div>
            <p class="muted">${season.desc}</p>
            <div class="manager-meta"><span><strong>Effect:</strong> ${season.summary}</span></div>
            <div class="manager-meta"><span><strong>Doctrine:</strong> ${doctrine?.name || 'Balanced'}</span><span><strong>Era:</strong> ${era?.name || 'Foundation Era'}</span></div>
          </article>` : `<div class="manager-card card"><p class="muted">No seasonal operation is active.</p></div>`;
      }

      if (this.els.contractsList) {
        const contracts = [...this.app.getContractsForSpan('daily'), ...this.app.getContractsForSpan('weekly')];
        this.els.contractsList.innerHTML = contracts.map(contract => {
          const pct = Math.max(0, Math.min(100, (contract.progress / Math.max(1, contract.goalValue)) * 100));
          const rewardBits = [];
          if (contract.reward.credits) rewardBits.push(`${this.app.formatNumber(contract.reward.credits)} CC`);
          if (contract.reward.research) rewardBits.push(`${contract.reward.research} RD`);
          if (contract.reward.fragments) rewardBits.push(`${contract.reward.fragments} frag`);
          if (contract.reward.ip) rewardBits.push(`${contract.reward.ip} IP`);
          return `
            <article class="manager-card card contract-card ${contract.complete ? 'done' : ''}">
              <div class="manager-top">
                <div class="manager-name"><span class="icon-badge">${contract.icon}</span> ${contract.name}</div>
                <span class="tag">${contract.span}</span>
              </div>
              <p class="muted">${contract.desc}</p>
              <div class="manager-meta"><span><strong>Progress:</strong> ${contract.goalValue >= 1000 ? `${this.app.formatNumber(contract.progress)} / ${this.app.formatNumber(contract.goalValue)}` : `${Math.floor(contract.progress)} / ${contract.goalValue}`}</span><span><strong>Reward:</strong> ${rewardBits.join(' • ')}</span></div>
              <div class="progress-track slim"><div class="progress-bar mission-bar" style="width:${pct}%"></div></div>
              <div class="manager-actions">
                <button class="buy-btn ${(contract.complete && !contract.claimed) ? 'can-afford' : 'nope'}" data-action="claim-contract" data-id="${contract.claimKey}">${contract.claimed ? 'Claimed' : contract.complete ? 'Claim Reward' : 'In Progress'}</button>
              </div>
            </article>`;
        }).join('');
      }

      if (this.els.bossLadderList) {
        const bosses = DATA.incidentDefs.filter(def => def.boss);
        this.els.bossLadderList.innerHTML = bosses.map(def => {
          const clears = this.app.state.bossCatalog?.[def.id] || 0;
          const rank = ['Unseen', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Mythic'][this.app.getBossRankValue(def.id)] || 'Unseen';
          return `
            <article class="manager-card card boss-ladder-card ${clears ? 'done' : ''}">
              <div class="manager-top">
                <div class="manager-name"><span class="icon-badge">${def.icon}</span> ${def.name}</div>
                <span class="tag">${rank}</span>
              </div>
              <p class="muted">${def.desc}</p>
              <div class="manager-meta"><span><strong>Clears:</strong> ${clears}</span><span><strong>Bonus Rank:</strong> +${this.app.getBossRankValue(def.id)} RD on future clears</span></div>
            </article>`;
        }).join('');
      }

      const incidents = this.app.state.activeIncidents;
      if (!incidents.length) {
        this.els.incidentList.innerHTML = `<div class="manager-card card"><p class="muted">Quiet floor. No active incidents. Suspiciously peaceful.</p></div>`;
      } else {
        this.els.incidentList.innerHTML = incidents.map(incident => `
          <article class="manager-card card incident-card ${incident.boss ? 'boss' : ''} severity-${this.getSeverityClass(incident.severity)}" data-incident-card="${incident.uid}">
            <div class="manager-top">
              <div class="manager-name"><span class="icon-badge">${incident.icon}</span> ${incident.name}</div>
              <span class="tag">${incident.boss ? 'boss · ' : ''}sev ${incident.severity.toFixed(1)}</span>
            </div>
            <p class="muted">${incident.desc}</p>
            <div class="manager-meta">
              <span><strong>Remaining:</strong> <span data-incident-remaining="${incident.uid}">${this.app.formatDuration(incident.remaining)}</span></span>
              <span><strong>Penalty:</strong> ${this.describeIncidentPenalties(incident)}</span>
            </div>
            <div class="progress-track slim"><div class="progress-bar mission-bar" data-incident-progress="${incident.uid}" style="width:${Math.max(0, Math.min(100, (1 - incident.remaining / incident.total) * 100))}%"></div></div>
            <div class="manager-actions">
              <button class="buy-btn can-afford" data-action="respond-incident" data-id="${incident.uid}">Dispatch Response</button>
            </div>
          </article>`).join('');
      }

      const activeCards = this.app.state.activeMissions.map(mission => `
        <article class="manager-card card mission-card active" data-active-mission-card="${mission.uid}">
          <div class="manager-top">
            <div class="manager-name"><span class="icon-badge">${mission.icon}</span> ${mission.name}</div>
            <span class="tag">${mission.tier || 'mission'} · ${mission.teams} team${mission.teams > 1 ? 's' : ''}</span>
          </div>
          <div class="manager-meta">
            <span><strong>Remaining:</strong> <span data-mission-remaining="${mission.uid}">${this.app.formatDuration(mission.remaining)}</span></span>
            <span><strong>Reward:</strong> ${this.describeMissionReward(mission.reward)}</span>
          </div>
          <div class="progress-track slim"><div class="progress-bar mission-bar" data-mission-progress="${mission.uid}" style="width:${Math.max(0, Math.min(100, (1 - mission.remaining / mission.total) * 100))}%"></div></div>
        </article>`).join('');

      const availableCards = DATA.questDefs.filter(def => this.app.meetsCondition(def.visibleWhen)).map(def => {
        const reward = this.app.getQuestRewardPreview(def);
        const cooldownRemaining = this.app.getQuestCooldownRemaining(def.id);
        const canStart = this.app.getAvailableMissionTeams() >= def.teams && cooldownRemaining <= 0;
        return `
          <article class="manager-card card mission-card" data-mission-def="${def.id}">
            <div class="manager-top">
              <div class="manager-name"><span class="icon-badge">${def.icon}</span> ${def.name}</div>
              <span class="tag">${def.tier || def.kind}</span>
            </div>
            <p class="muted">${def.desc}</p>
            <div class="manager-meta">
              <span><strong>Time:</strong> ${this.app.formatDuration(def.duration)}</span>
              <span><strong>Cooldown:</strong> <span data-mission-cooldown="${def.id}">${this.app.formatDuration(this.app.getQuestCooldown(def))}</span></span>
            </div>
            <div class="manager-meta">
              <span><strong>Teams:</strong> ${def.teams}</span>
              <span><strong>Reward:</strong> <span data-mission-reward="${def.id}">${this.describeMissionReward(reward)}</span></span>
            </div>
            <div class="lock-msg ${cooldownRemaining > 0 ? '' : 'hidden'}" data-mission-cooldown-msg="${def.id}">${cooldownRemaining > 0 ? `Cooling down for ${this.app.formatDuration(cooldownRemaining)}` : ''}</div>
            <div class="manager-actions">
              <button class="buy-btn ${canStart ? 'can-afford' : 'nope'}" data-action="start-mission" data-id="${def.id}">${cooldownRemaining > 0 ? 'Cooling Down' : 'Dispatch'}</button>
            </div>
          </article>`;
      }).join('');

      const emptyActive = `<div class="manager-card card"><p class="muted">No teams out right now. The board looks almost lonely.</p></div>`;
      const emptyAvailable = `<div class="manager-card card"><p class="muted">Nothing new on the board yet. Grow the empire and stranger jobs will appear.</p></div>`;
      this.els.missionList.innerHTML = `
        <div class="subsection-label">Active Missions</div>
        <div class="mission-subgroup active-group">${activeCards || emptyActive}</div>
        <div class="subsection-label">Available Missions</div>
        <div class="mission-subgroup available-group">${availableCards || emptyAvailable}</div>`;
    },

    renderUpgrades() {
      const view = this.app.state.currentUpgradeView;
      const cards = DATA.upgradeDefs
        .filter(def => def.view === view)
        .filter(def => !this.app.state.purchasedUpgrades[def.id] && this.app.meetsCondition(def.visibleWhen));

      if (!cards.length) {
        this.els.upgradeList.innerHTML = `<div class="card section-card"><p class="muted">No upgrades visible here yet. Keep scaling and they’ll emerge from the server fog.</p></div>`;
        return;
      }

      const renderCard = def => {
        const requirementsMet = this.app.upgradeRequirementsMet(def);
        const canAfford = this.app.canBuyUpgradeDef(def);
        const reqText = def.requires && def.requires.length
          ? def.requires.map(req => DATA.upgradeDefs.find(item => item.id === req)?.name || req).join(' • ')
          : '';
        return `
          <article class="card upgrade-card ${requirementsMet ? '' : 'locked'}" data-upgrade-card="${def.id}">
            <div class="upgrade-top">
              <div class="upgrade-name"><span class="icon-badge">${def.icon}</span> ${def.name}</div>
              <span class="tag">${def.branch || view}</span>
            </div>
            <div class="upgrade-meta">
              <span><strong>Cost:</strong> <span data-upgrade-cost="${def.id}">${this.app.formatNumber(def.cost || 0)} CC${def.costResearch ? ` + ${def.costResearch} RD` : ''}</span></span>
            </div>
            <p class="muted">${def.desc}</p>
            ${reqText ? `<div class="lock-msg ${requirementsMet ? '' : 'needs'}" data-upgrade-req="${def.id}"><strong>Prereqs:</strong> ${reqText}</div>` : ''}
            <div class="row-actions">
              <button class="buy-btn ${(requirementsMet && canAfford) ? 'can-afford' : 'nope'}" data-action="buy-upgrade" data-id="${def.id}">${requirementsMet ? 'Install Upgrade' : 'Locked Research'}</button>
            </div>
          </article>`;
      };

      if (view === 'research') {
        const branchOrder = ['Theory', 'Ops', 'Security', 'Materials', 'Frontier'];
        const grouped = branchOrder.map(branch => {
          const groupCards = cards.filter(def => (def.branch || 'Unsorted') === branch);
          if (!groupCards.length) return '';
          return `<div class="subsection-label research-branch-label">${branch} Branch</div>${groupCards.map(renderCard).join('')}`;
        }).filter(Boolean);
        const leftovers = cards.filter(def => !branchOrder.includes(def.branch || ''));
        if (leftovers.length) grouped.push(`<div class="subsection-label research-branch-label">Experimental</div>${leftovers.map(renderCard).join('')}`);
        this.els.upgradeList.innerHTML = `<div class="card section-card research-explainer"><p class="muted"><strong>Research Data</strong> now fuels branching tech paths, premium facility tuning, office expansion, and late-game projects. Follow branches to unlock stranger, stronger upgrades.</p></div>${grouped.join('')}`;
        return;
      }

      this.els.upgradeList.innerHTML = cards.map(renderCard).join('');
    },

    renderStaff() {
      this.els.managerList.innerHTML = DATA.generatorDefs.map(def => {
        const gen = this.app.getGenState(def.id);
        const cost = this.app.getManagerCost(def);
        const canHire = gen.owned > 0 && !gen.managerHired && this.app.state.credits >= cost;
        return `
          <article class="manager-card card ${gen.owned ? '' : 'locked'}">
            <div class="manager-top">
              <div class="manager-name"><span class="icon-badge">${def.icon}</span> ${def.managerName}</div>
              <span class="tag">${def.name}</span>
            </div>
            <div class="manager-meta">
              <span><strong>Status:</strong> ${gen.managerHired ? 'Hired' : gen.owned ? 'Available' : 'Locked'}</span>
              <span><strong>Cost:</strong> ${this.app.formatNumber(cost)} CC</span>
            </div>
            <div class="manager-actions">
              <button class="buy-btn ${canHire ? 'can-afford' : 'nope'}" data-action="hire-manager" data-id="${def.id}">${gen.managerHired ? 'On duty' : 'Hire Manager'}</button>
            </div>
          </article>`;
      }).join('');

      const specialists = DATA.specialistDefs.filter(def => !this.app.state.hiredSpecialists[def.id] && this.app.meetsCondition(def.visibleWhen));
      this.els.specialistList.innerHTML = specialists.length ? specialists.map(def => {
        const canAfford = this.app.state.credits >= def.cost;
        return `
          <article class="manager-card card rarity-${def.rarity}">
            <div class="manager-top">
              <div class="manager-name"><span class="icon-badge">${def.icon}</span> ${def.name}</div>
              <span class="tag">${def.rarity}</span>
            </div>
            <div class="manager-meta">
              <span><strong>Cost:</strong> ${this.app.formatNumber(def.cost)} CC</span>
            </div>
            <p class="muted">${def.desc}</p>
            <div class="manager-actions">
              <button class="buy-btn ${canAfford ? 'can-afford' : 'nope'}" data-action="hire-specialist" data-id="${def.id}">Hire Specialist</button>
            </div>
          </article>`;
      }).join('') : `<div class="section-card"><p class="muted">All visible specialists already hired.</p></div>`;

      const services = DATA.serviceDefs.filter(def => !this.app.state.purchasedServices[def.id] && this.app.meetsCondition(def.visibleWhen));
      this.els.serviceList.innerHTML = services.length ? services.map(def => {
        const canAfford = this.app.state.credits >= (def.cost || 0) && this.app.state.research >= (def.costResearch || 0);
        return `
          <article class="manager-card card service-card">
            <div class="manager-top">
              <div class="manager-name"><span class="icon-badge">${def.icon}</span> ${def.name}</div>
              <span class="tag">service</span>
            </div>
            <div class="manager-meta">
              <span><strong>Cost:</strong> ${this.app.formatNumber(def.cost || 0)} CC${def.costResearch ? ` + ${def.costResearch} RD` : ''}</span>
            </div>
            <p class="muted">${def.desc}</p>
            <div class="manager-actions">
              <button class="buy-btn ${canAfford ? 'can-afford' : 'nope'}" data-action="buy-service" data-id="${def.id}">Sign Contract</button>
            </div>
          </article>`;
      }).join('') : `<div class="section-card"><p class="muted">All visible services already active. Very adult. Very responsible.</p></div>`;
    },

    renderRegions() {
      const current = this.app.state.currentRegionId;
      this.els.regionsList.innerHTML = DATA.regionDefs.map(region => {
        const unlocked = this.app.state.unlockedRegions[region.id];
        const level = this.app.state.regionLevels[region.id] || 0;
        const mastery = this.app.getRegionMastery(region.id);
        const nextXp = this.app.getRegionMasteryNextXp(mastery.level);
        const unlockCost = this.app.getRegionUnlockCost(region);
        const expandCost = this.app.getRegionExpansionCost(region.id);
        const canUnlock = !unlocked && this.app.state.credits >= unlockCost;
        const canExpand = unlocked && this.app.state.credits >= expandCost;
        const project = region.project;
        const projectOwned = this.app.state.regionProjects[region.id];
        const canProject = project && unlocked && !projectOwned && this.app.state.credits >= (project.costCredits || 0) && this.app.state.research >= (project.costResearch || 0);
        const bonusBits = [];
        const effects = region.effects || {};
        if (effects.speed) bonusBits.push(`Cycle speed +${Math.round(effects.speed * 100)}%`);
        if (effects.income) bonusBits.push(`Income +${Math.round(effects.income * 100)}%`);
        if (effects.expansionDiscount) bonusBits.push(`Region costs -${Math.round(effects.expansionDiscount * 100)}%`);
        if (effects.highTierCapacityReduction) bonusBits.push(`High-tier capacity -${Math.round(effects.highTierCapacityReduction * 100)}%`);
        if (effects.categoryBonus) Object.entries(effects.categoryBonus).forEach(([cat, bonus]) => bonusBits.push(`${cat} income x${bonus}`));
        return `
          <article class="card region-card ${unlocked ? '' : 'locked'}" data-region-card="${region.id}">
            <div class="region-top">
              <div class="region-name"><span class="icon-badge">${region.icon}</span> ${region.name}</div>
              <span class="tag income-good ${current === region.id ? '' : 'hidden'}" data-region-focus="${region.id}">focused</span>
            </div>
            <div class="region-meta">
              <span><strong>Level:</strong> <span data-region-level="${region.id}">${level + 1}</span></span>
              <span><strong>Capacity:</strong> <span data-region-capacity="${region.id}">${this.app.formatNumber((region.baseCapacity + region.capPerLevel * level) * (1 + mastery.level * 0.04))}</span></span>
            </div>
            <p class="muted">${region.desc}</p>
            <div class="region-meta"><span><strong>Bonus:</strong> ${bonusBits.join(' • ') || 'Capacity only'}</span></div>
            <div class="region-meta"><span><strong>Current Effect:</strong> <span data-region-currentbonus="${region.id}">${this.describeRegionCurrentBonus(region, level)}</span></span></div>
            <div class="region-meta"><span><strong>Mastery:</strong> Lv ${mastery.level + 1} • +${(mastery.level * 4)}% capacity • +${(mastery.level * 6)}% bonus scale</span></div>
            <div class="progress-track slim"><div class="progress-bar mission-bar" data-region-mastery="${region.id}" style="width:${Math.max(0, Math.min(100, mastery.xp / Math.max(1, nextXp) * 100))}%"></div></div>
            <div class="region-meta"><span><strong>Next Mastery:</strong> ${Math.floor(mastery.xp)} / ${nextXp} XP</span></div>
            ${project ? `<div class="region-project ${projectOwned ? 'done' : ''}"><strong>${project.icon} ${project.name}</strong><p class="muted">${project.desc}</p><div class="region-meta"><span><strong>Project Cost:</strong> ${this.app.formatNumber(project.costCredits || 0)} CC${project.costResearch ? ` + ${project.costResearch} RD` : ''}</span></div><div class="region-meta"><span><strong>Advantage:</strong> ${this.describeEffectBundle(project.effects)}</span></div></div>` : ''}
            <div class="region-actions">
              ${unlocked ? `<button class="soft-btn" data-action="focus-region" data-id="${region.id}">Focus</button>` : ''}
              ${unlocked
                ? `<button class="buy-btn ${canExpand ? 'can-afford' : 'nope'}" data-action="expand-region" data-id="${region.id}">Expand (${this.app.formatNumber(expandCost)})</button>`
                : `<button class="buy-btn ${canUnlock ? 'can-afford' : 'nope'}" data-action="unlock-region" data-id="${region.id}">Unlock (${this.app.formatNumber(unlockCost)})</button>`}
              ${project && unlocked ? `<button class="buy-btn ${projectOwned ? 'nope' : canProject ? 'can-afford' : 'nope'}" data-action="project-region" data-id="${region.id}">${projectOwned ? 'Project ✓' : 'Build Project'}</button>` : ''}
            </div>
          </article>`;
      }).join('');
    },

    updateRegionsLive(force = false) {
      const list = this.els.regionsList;
      if (!list || !list.children || !list.children.length) return;
      const current = this.app.state.currentRegionId;
      const visibleIds = DATA.regionDefs.map(region => region.id);
      const domIds = [...list.querySelectorAll('[data-region-card]')].map(card => card.dataset.regionCard);
      if (domIds.length !== visibleIds.length || domIds.some((id, idx) => id !== visibleIds[idx])) {
        this.renderRegions();
        return;
      }

      DATA.regionDefs.forEach(region => {
        const card = list.querySelector(`[data-region-card="${region.id}"]`);
        if (!card) return;
        const unlocked = this.app.state.unlockedRegions[region.id];
        const level = this.app.state.regionLevels[region.id] || 0;
        const unlockCost = this.app.getRegionUnlockCost(region);
        const expandCost = this.app.getRegionExpansionCost(region.id);
        const canUnlock = !unlocked && this.app.state.credits >= unlockCost;
        const canExpand = unlocked && this.app.state.credits >= expandCost;
        const project = region.project;
        const projectOwned = this.app.state.regionProjects[region.id];
        const canProject = project && unlocked && !projectOwned && this.app.state.credits >= (project.costCredits || 0) && this.app.state.research >= (project.costResearch || 0);

        card.classList.toggle('locked', !unlocked);

        const focusTag = card.querySelector(`[data-region-focus="${region.id}"]`);
        if (focusTag) focusTag.classList.toggle('hidden', current !== region.id);

        const levelEl = card.querySelector(`[data-region-level="${region.id}"]`);
        if (levelEl) levelEl.textContent = level + 1;
        const capEl = card.querySelector(`[data-region-capacity="${region.id}"]`);
        if (capEl) capEl.textContent = this.app.formatNumber(region.baseCapacity + region.capPerLevel * level);
        const currentBonusEl = card.querySelector(`[data-region-currentbonus="${region.id}"]`);
        if (currentBonusEl) currentBonusEl.textContent = this.describeRegionCurrentBonus(region, level);
        const mastery = this.app.getRegionMastery(region.id);
        const masteryBar = card.querySelector(`[data-region-mastery="${region.id}"]`);
        if (masteryBar) masteryBar.style.width = `${Math.max(0, Math.min(100, mastery.xp / Math.max(1, this.app.getRegionMasteryNextXp(mastery.level)) * 100))}%`;

        const unlockBtn = card.querySelector(`button[data-action="unlock-region"][data-id="${region.id}"]`);
        if (unlockBtn) {
          unlockBtn.textContent = `Unlock (${this.app.formatNumber(unlockCost)})`;
          unlockBtn.disabled = !canUnlock;
          unlockBtn.classList.toggle('can-afford', canUnlock);
          unlockBtn.classList.toggle('nope', !canUnlock);
        }

        const expandBtn = card.querySelector(`button[data-action="expand-region"][data-id="${region.id}"]`);
        if (expandBtn) {
          expandBtn.textContent = `Expand (${this.app.formatNumber(expandCost)})`;
          expandBtn.disabled = !canExpand;
          expandBtn.classList.toggle('can-afford', canExpand);
          expandBtn.classList.toggle('nope', !canExpand);
        }

        const projectBtn = card.querySelector(`button[data-action="project-region"][data-id="${region.id}"]`);
        if (projectBtn) {
          projectBtn.textContent = projectOwned ? 'Project ✓' : 'Build Project';
          projectBtn.disabled = projectOwned || !canProject;
          projectBtn.classList.toggle('can-afford', !projectOwned && canProject);
          projectBtn.classList.toggle('nope', projectOwned || !canProject);
        }
      });
    },

    describeRegionCurrentBonus(region, level = 0) {
      const effects = region.effects || {};
      const scale = 1 + level * 0.08;
      const bits = [];
      if (effects.speed) bits.push(`Cycle speed +${Math.round(effects.speed * scale * 100)}%`);
      if (effects.income) bits.push(`Income +${Math.round(effects.income * scale * 100)}%`);
      if (effects.expansionDiscount) bits.push(`Region costs -${Math.round(effects.expansionDiscount * scale * 100)}%`);
      if (effects.highTierCapacityReduction) bits.push(`High-tier capacity -${Math.round(effects.highTierCapacityReduction * scale * 100)}%`);
      if (effects.categoryBonus) {
        Object.entries(effects.categoryBonus).forEach(([cat, bonus]) => {
          const scaled = 1 + (bonus - 1) * (1 + level * 0.05);
          bits.push(`${cat} income x${scaled >= 10 ? scaled.toFixed(1) : scaled.toFixed(2).replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1')}`);
        });
      }
      return bits.join(' • ') || 'Capacity only';
    },

    renderPrestige() {
      const projectedGain = this.app.getPrestigeGain();
      this.els.prestigeGainValue.textContent = `${projectedGain} IP`;
      if (this.els.prestigeBtn) {
        this.els.prestigeBtn.disabled = projectedGain <= 0;
        this.els.prestigeBtn.classList.toggle('nope', projectedGain <= 0);
        this.els.prestigeBtn.classList.toggle('can-afford', projectedGain > 0);
      }

      if (this.els.doctrineList) {
        this.els.doctrineList.innerHTML = (DATA.doctrineDefs || []).map(def => {
          const unlocked = this.app.meetsCondition(def.unlockWhen);
          const active = this.app.state.activeDoctrineId === def.id;
          return `<article class="manager-card card ${active ? 'done' : (!unlocked ? 'locked' : '')}"><div class="manager-top"><div class="manager-name"><span class="icon-badge">${def.icon}</span> ${def.name}</div><span class="tag">${active ? 'active' : unlocked ? 'ready' : 'locked'}</span></div><p class="muted">${def.desc}</p><div class="manager-actions"><button class="buy-btn ${(unlocked && !active) ? 'can-afford' : 'nope'}" data-action="set-doctrine" data-id="${def.id}">${active ? 'Active Doctrine' : unlocked ? 'Activate Doctrine' : 'Locked'}</button></div></article>`;
        }).join('');
      }

      if (this.els.eraList) {
        this.els.eraList.innerHTML = (DATA.eraDefs || []).map(def => {
          const unlocked = this.app.meetsCondition(def.unlockWhen);
          const active = this.app.state.activeEraId === def.id;
          return `<article class="manager-card card ${active ? 'done' : (!unlocked ? 'locked' : '')}"><div class="manager-top"><div class="manager-name"><span class="icon-badge">${def.icon}</span> ${def.name}</div><span class="tag">${active ? 'active' : unlocked ? 'unlocked' : 'locked'}</span></div><p class="muted">${def.desc}</p><div class="manager-meta"><span><strong>Effect:</strong> ${this.describeEffectBundle(def.effects || {}) || 'era flavor'}</span></div><div class="manager-actions"><button class="buy-btn ${(unlocked && !active) ? 'can-afford' : 'nope'}" data-action="set-era" data-id="${def.id}">${active ? 'Active Era' : unlocked ? 'Switch Era' : 'Locked'}</button></div></article>`;
        }).join('');
      }

      if (this.els.challengeList) {
        const selected = this.app.state.selectedChallengeId;
        const activeChallenge = this.app.state.activeChallengeId;
        this.els.challengeList.innerHTML = [`<article class="manager-card card ${!selected ? 'done' : ''}"><div class="manager-top"><div class="manager-name"><span class="icon-badge">🟢</span> Normal Run</div><span class="tag">safe</span></div><p class="muted">No extra rules. Sometimes the best chaos is optional.</p><div class="manager-actions"><button class="buy-btn ${selected ? 'can-afford' : 'nope'}" data-action="select-challenge" data-id="">${selected ? 'Choose Normal Run' : 'Normal Selected'}</button></div></article>`, ...(DATA.challengeDefs || []).map(def => {
          const unlocked = this.app.meetsCondition(def.unlockWhen);
          const selectedHere = selected === def.id;
          const activeHere = activeChallenge === def.id;
          const clears = this.app.state.challengeCompletions?.[def.id] || 0;
          return `<article class="manager-card card ${(selectedHere || activeHere) ? 'done' : (!unlocked ? 'locked' : '')}"><div class="manager-top"><div class="manager-name"><span class="icon-badge">${def.icon}</span> ${def.name}</div><span class="tag">clears ${clears}</span></div><p class="muted">${def.desc}</p><div class="manager-meta"><span><strong>Goal:</strong> ${this.describeChallengeGoal(def.goal)}</span></div><div class="manager-meta"><span><strong>Reward:</strong> ${def.rewardText}</span></div><div class="manager-actions"><button class="buy-btn ${(unlocked && !selectedHere) ? 'can-afford' : 'nope'}" data-action="select-challenge" data-id="${def.id}">${activeHere ? 'Challenge Active This Run' : selectedHere ? 'Armed For Next Overhaul' : unlocked ? 'Arm Challenge' : 'Locked'}</button></div></article>`;
        })].join('');
      }

      const branches = [...new Set(DATA.prestigeNodeDefs.map(node => node.branch))];
      this.els.prestigeTree.innerHTML = branches.map(branch => {
        const nodes = DATA.prestigeNodeDefs.filter(node => node.branch === branch).map(node => {
          const level = this.app.getNodeLevel(node.id);
          const maxLevel = node.maxLevel || 1;
          const ownedOut = level >= maxLevel;
          const requirementsMet = !(node.requires && node.requires.some(req => !this.app.getNodeLevel(req)));
          const canBuy = this.app.canBuyPrestigeNode(node);
          const cost = this.app.getPrestigeNodeCost(node);
          return `
            <article class="card tree-card ${ownedOut ? 'done' : (!requirementsMet ? 'locked' : '')}">
              <div class="tree-top">
                <div class="tree-name"><span class="icon-badge">${node.icon}</span> ${node.name}</div>
                <span class="tag">${node.branch}</span>
              </div>
              <div class="tree-meta"><span><strong>Cost:</strong> ${cost} IP</span><span><strong>Level:</strong> ${level}/${maxLevel === 1 ? 1 : maxLevel}</span></div>
              <p class="muted">${node.desc}</p>
              ${node.requires && node.requires.length ? `<div class="lock-msg ${requirementsMet ? '' : 'needs'}"><strong>Requires:</strong> ${node.requires.map(req => DATA.prestigeNodeDefs.find(item => item.id === req)?.name || req).join(' • ')}</div>` : ''}
              <div class="manager-actions">
                <button class="buy-btn ${ownedOut ? 'nope' : canBuy ? 'can-afford' : 'nope'}" data-action="buy-tree" data-id="${node.id}">${ownedOut ? 'Maxed' : maxLevel > 1 ? 'Increase Node' : 'Purchase Node'}</button>
              </div>
            </article>`;
        }).join('');
        return `<div class="subsection-label research-branch-label">${branch}</div>${nodes}`;
      }).join('');
    },

    renderAchievements() {
      const defs = DATA.achievementDefs;
      const allBadgeMarkup = defs.map(def => this.renderAchievementBadge(def)).join('');
      const earnedDefs = defs.filter(def => this.app.getAchievementTime(def.id));
      const earnedBadgeMarkup = earnedDefs.length
        ? earnedDefs.map(def => this.renderAchievementBadge(def)).join('')
        : `<div class="manager-card card"><p class="muted">No earned badges yet. Go make the little office worker proud.</p></div>`;

      this.els.achievementPanelGrid.innerHTML = allBadgeMarkup;
      if (this.els.suiteAchievementGrid) this.els.suiteAchievementGrid.innerHTML = allBadgeMarkup;
      if (this.els.achievementBadgeGrid) {
        this.els.achievementBadgeGrid.innerHTML = earnedBadgeMarkup;
        this.els.achievementBadgeGrid.classList.add('earned-only');
      }

      const recent = earnedDefs
        .sort((a, b) => this.app.getAchievementTime(b.id) - this.app.getAchievementTime(a.id))
        .slice(0, 8);
      const recentMarkup = recent.length ? recent.map(def => `
        <article class="manager-card card achievement-card done">
          <div class="manager-top">
            <div class="manager-name"><span class="icon-badge">${def.icon}</span> ${def.name}</div>
            <span class="tag">${new Date(this.app.getAchievementTime(def.id)).toLocaleDateString()}</span>
          </div>
          <p class="muted">${def.desc}</p>
          <div class="manager-meta"><span><strong>Reward:</strong> ${this.describeAchievementReward(def.reward || {})}</span></div>
        </article>`).join('') : `<div class="manager-card card"><p class="muted">No badges yet. Go build something loud.</p></div>`;
      this.els.achievementRecentList.innerHTML = recentMarkup;
      if (this.els.achievementRecentAsideList) this.els.achievementRecentAsideList.innerHTML = recentMarkup;
    },

    renderAchievementBadge(def) {
      const unlocked = !!this.app.getAchievementTime(def.id);
      const unlockedAt = this.app.getAchievementTime(def.id);
      return `<button class="achievement-badge ${unlocked ? 'unlocked shine' : 'locked'}" data-achievement-id="${def.id}" data-achievement-time="${unlockedAt || ''}" title="${def.name}"><span class="badge-icon">${def.icon}</span><span class="badge-label">${def.name}</span></button>`;
    },

    renderCollections() {
      const defs = [
        { name: 'Achievements', current: Object.keys(this.app.state.achievementsClaimed || {}).length, total: DATA.achievementDefs.length, reward: 'pure bragging rights' },
        { name: 'Region Projects', current: this.app.getPurchasedProjectCount(), total: DATA.regionDefs.filter(region => !!region.project).length, reward: 'map completion flex' },
        { name: 'Cosmetics Owned', current: this.app.getCosmeticsOwnedCount(), total: Object.values(DATA.cosmetics || {}).flat().filter(item => item.id !== 'default').length, reward: 'office vanity archive' },
        { name: 'Boss Incident Catalog', current: Object.keys(this.app.state.bossCatalog || {}).filter(id => (this.app.state.bossCatalog[id] || 0) > 0).length, total: DATA.incidentDefs.filter(def => def.boss).length, reward: 'legend ladder progress' },
        { name: 'Challenge Clears', current: this.app.getChallengeCompletionCount(), total: (DATA.challengeDefs || []).length * 3, reward: 'permanent global trickle bonus' },
        { name: 'Career Route', current: this.app.getCampaignGoalsCompletedCount ? this.app.getCampaignGoalsCompletedCount() : 0, total: (DATA.campaignGoalDefs || []).length, reward: 'permanent north-star campaign bonuses' },
        { name: 'Office Tiers', current: this.app.state.officeTier + 1, total: DATA.officeSuiteDefs.length, reward: 'bigger and sillier command spaces' }
      ];
      const markup = defs.map(def => {
        const pct = Math.max(0, Math.min(100, (def.current / Math.max(1, def.total)) * 100));
        return `<article class="manager-card card collection-card"><div class="manager-top"><div class="manager-name">${def.name}</div><span class="tag">${def.current}/${def.total}</span></div><div class="progress-track slim"><div class="progress-bar mission-bar" style="width:${pct}%"></div></div><div class="manager-meta"><span><strong>Reward Loop:</strong> ${def.reward}</span></div></article>`;
      }).join('');
      if (this.els.collectionsList) this.els.collectionsList.innerHTML = markup;
      if (this.els.commandCollectionsList) this.els.commandCollectionsList.innerHTML = markup;
    },

    initArcade() {
      const storedScores = (() => {
        try { return JSON.parse(window.localStorage.getItem('uptime_empire_arcade_scores_v1') || '{}') || {}; } catch (_e) { return {}; }
      })();
      this.arcade = {
        overlayOpen: false,
        holdView: false,
        currentGameId: null,
        cabinetMenuIndex: 0,
        gamePaused: false,
        lastTs: performance.now(),
        keys: {},
        selectedSolitaire: null,
        solitaireDrag: null,
        confirmAction: null,
        solitaireUndo: [],
        solitaireHintText: '',
        solitaireHintUntil: 0,
        solitaireHintMove: null,
        solitaireLastClick: null,
        games: {
          bombmopper: null,
          stackOverflow: null,
          circuitBreaker: null,
          ctrlAltDefeat: null,
          mortalKonfig: null
        },
        scores: storedScores,
        catalog: [
          { id: 'bombmopper', title: 'Bombmopper', genre: 'Minefield cleanup puzzler', roster: 'Moppet-9 • Sir Beep • Safety Cone Prime', desc: 'A janitor-bot hazard maze with flags, reveals, and chain clears.' },
          { id: 'stackOverflow', title: 'Stack Overflow', genre: 'Klondike solitaire clone', roster: 'Queen Cache • King Kernel • Jack Packet • Ace Stack', desc: 'A terminal-themed solitaire layout. Functionally standard Klondike, just friendlier about the clicks.' },
          { id: 'circuitBreaker', title: 'Circuit Breaker', genre: 'Tech sprint racer', roster: 'Byte Rider • Volt Vandal • Packet Phantom', desc: 'An endless neon service-lane racer through relay gates, dropped packets, and bad merge traffic.' },
          { id: 'ctrlAltDefeat', title: 'Ctrl+Alt+Defeat', genre: 'Tiny sysadmin RPG', roster: 'Nova Admin • Null Rat • Kernel Wraith • Patch Pixie', desc: 'A compact turn-based office RPG about debugging monsters and keeping your own HP above zero.' },
          { id: 'mortalKonfig', title: 'Mortal Konfig', genre: 'Office-fantasy fighter', roster: 'Kernel Khan • Patch Widow • Ping Reaper • Siren.exe', desc: 'A quick one-on-one fighter where configuration errors are settled with deeply unprofessional violence.' }
        ]
      };
    },

    startArcadeLoop() {
      const frame = now => {
        this.advanceArcade(now);
        window.requestAnimationFrame(frame);
      };
      window.requestAnimationFrame(frame);
    },

    // The cabinet texture can still be redrawn on a device that throttles the
    // page animation frame. Keep one guarded clock that either path can use.
    advanceArcade(now = this.arcadePerfNow()) {
      if (!this.arcade || !this.arcade.overlayOpen || !this.arcade.currentGameId || this.arcade.gamePaused) return;
      const stamp = Number(now) || this.arcadePerfNow();
      if (stamp - (this.arcade.lastAdvanceAt || 0) < 12) return;
      this.arcade.lastAdvanceAt = stamp;
      this.updateArcade(stamp);
    },

    getArcadeScore(id) {
      return Number(this.arcade?.scores?.[id] || 0);
    },

    setArcadeScore(id, value) {
      if (!this.arcade) return 0;
      const next = Math.max(this.getArcadeScore(id), Math.floor(value || 0));
      this.arcade.scores[id] = next;
      try { window.localStorage.setItem('uptime_empire_arcade_scores_v1', JSON.stringify(this.arcade.scores)); } catch (_e) {}
      return next;
    },

    showOfflineSummary(summary) {
      if (!summary || !this.els.offlineSummaryPopup || !this.els.offlineSummaryBody) return;
      const rows = [];
      if (summary.credits > 0) rows.push(`<div class="offline-summary-row"><span>Automated income collected</span><strong>${this.app.formatNumber(summary.credits)} CC</strong></div>`);
      if (summary.missionsCompleted > 0) rows.push(`<div class="offline-summary-row"><span>Missions completed while offline</span><strong>${summary.missionsCompleted}</strong></div>`);
      if (!rows.length) return;
      this.els.offlineSummaryBody.innerHTML = rows.join('');
      this.els.offlineSummaryPopup.classList.remove('hidden');
      clearTimeout(this._offlineSummaryTimer);
      this._offlineSummaryTimer = setTimeout(() => this.hideOfflineSummary(), 9000);
    },

    hideOfflineSummary() {
      if (!this.els.offlineSummaryPopup) return;
      this.els.offlineSummaryPopup.classList.add('hidden');
    },

    openArcade() {
      // v3.26: the 3D office is now the world, not a terminal tab.
      // Do not require currentSuiteTab === 'office', because the desk terminal
      // may leave the app on Console/Shop/Settings while the player is still
      // standing in the room. Only block arcade entry while the desk computer
      // is actually open.
      if (!this.arcade || this.computerOpen) return;
      this.arcade.overlayOpen = true;
      this.arcade.holdView = true;
      clearTimeout(this.arcade.showTimer);
      if (this.els.officeScene) this.els.officeScene.classList.add('arcade-focus');
      document.body.classList.add('arcade-active');
      this.office3D?.setArcadeScreenState({ mode: 'menu', title: 'UPTIME ARCADE' });
      this.office3D?.setArcadeScreenRenderer((ctx, width, height, time) => this.renderCabinetArcade(ctx, width, height, time));
      this.office3D?.enterArcadeView();
      if (this.els.arcadeOverlay) this.els.arcadeOverlay.classList.add('hidden');
      if (this.arcade.currentGameId) this.openArcadeGame(this.arcade.currentGameId, true);
      else this.renderArcadeMenu();
    },

    leaveArcade(holdView = false) {
      if (!this.arcade) return;
      this.arcade.overlayOpen = false;
      this.arcade.holdView = !!holdView;
      clearTimeout(this.arcade.showTimer);
      if (this.els.arcadeOverlay) this.els.arcadeOverlay.classList.add('hidden');
      this.hideArcadeInlineConfirm();
      const heldGame = this.arcade.currentGameId ? this.arcadeGameDef(this.arcade.currentGameId) : null;
      this.office3D?.setArcadeScreenState(holdView && heldGame
        ? { mode: 'paused', title: heldGame.title }
        : { mode: 'attract', title: 'UPTIME ARCADE' });
      if (!holdView) this.office3D?.setArcadeScreenRenderer(null);
      document.body.classList.remove('arcade-active');
      if (this.els.officeScene) {
        this.els.officeScene.classList.toggle('arcade-focus', !!holdView);
        this.els.officeScene.classList.remove('arcade-expanded');
      }
      if (holdView) this.office3D?.enterArcadeView();
      else {
        this.office3D?.releaseArcadeView(true);
        if (this.office3D?.resumeManualControl) {
          // v3.27: leaving the arcade should return straight to room mouse-look,
          // matching the desk computer close behavior and avoiding the visible
          // crosshair/cursor standby state.
          this.office3D.resumeManualControl();
          requestAnimationFrame(() => {
            if (!this.computerOpen && this.arcade && !this.arcade.overlayOpen && !this.arcade.holdView) {
              this.office3D.resumeManualControl();
            }
          });
        }
      }
    },

    suspendArcadeSession() {
      if (!this.arcade) return;
      if (!this.arcade.currentGameId) {
        this.leaveArcade(false);
        return;
      }
      this.arcade.gamePaused = true;
      this.leaveArcade(true);
    },

    showArcadeInlineConfirm(title, body, action) {
      if (!this.arcade || !this.els.arcadeInlineConfirm) return;
      this.arcade.confirmAction = action || null;
      if (this.els.arcadeInlineConfirmTitle) this.els.arcadeInlineConfirmTitle.textContent = title;
      if (this.els.arcadeInlineConfirmBody) this.els.arcadeInlineConfirmBody.textContent = body;
      this.els.arcadeInlineConfirm.classList.remove('hidden');
    },

    hideArcadeInlineConfirm() {
      if (!this.arcade || !this.els.arcadeInlineConfirm) return;
      this.arcade.confirmAction = null;
      this.els.arcadeInlineConfirm.classList.add('hidden');
    },

    runArcadeInlineConfirm() {
      if (!this.arcade) return;
      const action = this.arcade.confirmAction;
      this.hideArcadeInlineConfirm();
      if (action === 'quit-game') {
        this.arcade.currentGameId = null;
        this.arcade.gamePaused = false;
        this.renderArcadeMenu();
      } else if (action === 'leave-arcade') {
        this.leaveArcade(false);
      }
    },

    confirmQuitArcadeGame() {
      if (!this.arcade) return;
      if (this.arcade.currentGameId) {
        this.showArcadeInlineConfirm('Quit current game?', 'Return to the cabinet menu and close the current session?', 'quit-game');
      } else {
        this.showArcadeInlineConfirm('Leave arcade?', 'Return to the office view?', 'leave-arcade');
      }
    },

    renderArcadeMenu() {
      if (!this.arcade || !this.els.arcadeMenuScreen || !this.els.arcadeGameScreen) return;
      this.arcade.currentGameId = null;
      this.arcade.gamePaused = false;
      this.hideArcadeInlineConfirm();
      if (this.arcade.overlayOpen) {
        this.arcade.cabinetMenuIndex = Math.max(0, Math.min(this.arcade.catalog.length - 1, this.arcade.cabinetMenuIndex || 0));
        this.office3D?.setArcadeScreenState({ mode: 'menu', title: 'UPTIME ARCADE' });
        if (this.els.arcadeOverlay) this.els.arcadeOverlay.classList.add('hidden');
        return;
      }
      this.els.arcadeGameScreen.classList.add('hidden');
      this.els.arcadeMenuScreen.classList.remove('hidden');
      const cards = this.arcade.catalog.map(game => `
        <article class="arcade-game-card">
          <div class="manager-top"><h4>${game.title}</h4><span class="tag">${game.genre}</span></div>
          <div class="arcade-hiscore">Hiscore: ${this.getArcadeScore(game.id)}</div>
          <p>${game.desc}</p>
          <button class="soft-btn" data-arcade-play="${game.id}">Play</button>
        </article>`).join('');
      this.els.arcadeMenuScreen.innerHTML = `
        <div class="arcade-menu-actions">
          <div class="muted">Five tiny cabinet games live here. Pick one, chase a hiscore, or leave the machine humming.</div>
          <button class="soft-btn" id="arcadeLeaveBtn">Leave Arcade</button>
        </div>
        <div class="arcade-menu-grid">${cards}</div>`;
      this.els.arcadeMenuScreen.querySelectorAll('[data-arcade-play]').forEach(btn => btn.addEventListener('click', () => this.openArcadeGame(btn.dataset.arcadePlay)));
      const leaveBtn = this.els.arcadeMenuScreen.querySelector('#arcadeLeaveBtn');
      if (leaveBtn) leaveBtn.addEventListener('click', () => this.leaveArcade(false));
    },

    openArcadeGame(id, resume = false) {
      if (!this.arcade || !this.els.arcadeMenuScreen || !this.els.arcadeGameScreen) return;
      this.arcade.overlayOpen = true;
      this.arcade.holdView = true;
      this.arcade.currentGameId = id;
      this.els.arcadeMenuScreen.classList.add('hidden');
      this.els.arcadeGameScreen.classList.remove('hidden');
      const title = this.arcade.catalog.find(g => g.id === id)?.title || id;
      this.els.arcadeGameScreen.innerHTML = `
        <div class="arcade-screen-controls">
          <div class="muted"><strong>${title}</strong> • Hiscore ${this.getArcadeScore(id)}</div>
          <div class="muted">Esc pauses and exits to the office. White X quits the game.</div>
        </div>
        <canvas id="arcadeCanvas" width="640" height="360"></canvas>
        <div class="arcade-dom-game hidden" id="arcadeDomGame"></div>`;
      this.els.arcadeCanvas = document.getElementById('arcadeCanvas');
      this.els.arcadeDomGame = document.getElementById('arcadeDomGame');
      if (!resume || !this.arcade.games[id]) this.createArcadeGame(id);
      this.arcade.gamePaused = !!resume;
      this.arcade.lastTs = performance.now();
      this.bindArcadeDomGame(id);
      this.renderCurrentArcadeFrame(true);
    },

    bindArcadeDomGame(id) {
      if (!this.els.arcadeDomGame) return;
      if (id === 'bombmopper') {
        this.els.arcadeDomGame.addEventListener('click', e => {
          const restart = e.target.closest('[data-bomb-restart]');
          if (restart) { this.arcade.games.bombmopper = this.createBombmopperGame(this.arcade.bombmopperCarryScore || 0); this.arcade.gamePaused = false; this.renderBombmopper(); return; }
          const cell = e.target.closest('[data-bomb-cell]');
          if (!cell) return;
          this.onBombmopperCell(Number(cell.dataset.bombCell), false);
        });
        this.els.arcadeDomGame.addEventListener('contextmenu', e => {
          const cell = e.target.closest('[data-bomb-cell]');
          if (!cell) return;
          e.preventDefault();
          this.onBombmopperCell(Number(cell.dataset.bombCell), true);
        });
      }
      if (id === 'stackOverflow') {
        this.els.arcadeDomGame.addEventListener('click', e => {
          const action = e.target.closest('[data-sol-action]');
          if (!action) return;
          this.handleSolitaireAction(action.dataset.solAction, action.dataset.solPile, Number(action.dataset.solIndex || 0));
        });
        this.els.arcadeDomGame.addEventListener('dragstart', e => {
          const card = e.target.closest('[data-sol-draggable]');
          if (!card) return;
          this.startSolitaireDrag(card.dataset.solSource, card.dataset.solPile, Number(card.dataset.solIndex || 0));
          try { e.dataTransfer.setData('text/plain', 'stack-overflow'); e.dataTransfer.effectAllowed = 'move'; } catch (_e) {}
        });
        this.els.arcadeDomGame.addEventListener('dragover', e => {
          const target = e.target.closest('[data-sol-drop]');
          if (!target || !this.arcade.solitaireDrag) return;
          e.preventDefault();
          target.classList.add('arcade-drop-target');
        });
        this.els.arcadeDomGame.addEventListener('dragleave', e => {
          const target = e.target.closest('[data-sol-drop]');
          if (target) target.classList.remove('arcade-drop-target');
        });
        this.els.arcadeDomGame.addEventListener('drop', e => {
          const target = e.target.closest('[data-sol-drop]');
          if (!target || !this.arcade.solitaireDrag) return;
          e.preventDefault();
          target.classList.remove('arcade-drop-target');
          this.handleSolitaireAction(target.dataset.solDrop, target.dataset.solPile, 0);
          this.clearSolitaireDrag();
        });
        this.els.arcadeDomGame.addEventListener('dragend', () => this.clearSolitaireDrag());
        this.els.arcadeDomGame.addEventListener('dblclick', e => {
          const card = e.target.closest('.arcade-card[data-sol-autofoundation]');
          if (!card) return;
          this.trySolitaireAutoFoundation(card.dataset.solSource, card.dataset.solPile, Number(card.dataset.solIndex || 0));
        });
      }
      if (id === 'ctrlAltDefeat') {
        this.els.arcadeDomGame.addEventListener('click', e => {
          const btn = e.target.closest('[data-rpg-action]');
          if (!btn) return;
          this.handleRpgAction(btn.dataset.rpgAction);
        });
      }
    },

    createArcadeGame(id) {
      if (id === 'bombmopper') {
        if (typeof this.arcade.bombmopperCarryScore !== 'number') this.arcade.bombmopperCarryScore = 0;
        this.arcade.games[id] = this.createBombmopperGame(this.arcade.bombmopperCarryScore || 0);
      }
      if (id === 'stackOverflow') { this.arcade.games[id] = this.createSolitaireGame(); this.arcade.solitaireUndo = []; this.arcade.solitaireHintText = ''; this.arcade.solitaireHintUntil = 0; this.arcade.solitaireHintMove = null; }
      if (id === 'circuitBreaker') this.arcade.games[id] = this.createCircuitBreakerGame();
      if (id === 'ctrlAltDefeat') this.arcade.games[id] = this.createCtrlAltDefeatGame();
      if (id === 'mortalKonfig') this.arcade.games[id] = this.createMortalKonfigGame();
    },

    updateArcade(now) {
      if (!this.arcade || !this.arcade.currentGameId || !this.arcade.overlayOpen || this.arcade.gamePaused) return;
      const dt = Math.min(0.05, (now - this.arcade.lastTs) / 1000 || 0.016);
      this.arcade.lastTs = now;
      const id = this.arcade.currentGameId;
      if (id === 'bombmopper') this.updateBombmopper(dt);
      if (id === 'circuitBreaker') { this.updateCircuitBreaker(dt); this.renderCircuitBreaker(); }
      if (id === 'ctrlAltDefeat') this.updateCtrlAltDefeat(dt);
      if (id === 'mortalKonfig') { this.updateMortalKonfig(dt); this.renderMortalKonfig(); }
    },

    renderCurrentArcadeFrame(force = false) {
      if (!this.arcade || !this.arcade.currentGameId) return;
      const id = this.arcade.currentGameId;
      if (id === 'bombmopper') this.renderBombmopper();
      if (id === 'stackOverflow') this.renderSolitaire();
      if (id === 'circuitBreaker') this.renderCircuitBreaker();
      if (id === 'ctrlAltDefeat') this.renderCtrlAltDefeat();
      if (id === 'mortalKonfig') this.renderMortalKonfig();
    },

    handleArcadeKeyDown(e) {
      if (!this.arcade || !this.arcade.overlayOpen || !this.arcade.currentGameId) return;
      const key = e.key.toLowerCase();
      const activeGame = this.arcade.currentGameId;
      if (key === 'p' && (activeGame === 'circuitBreaker' || activeGame === 'mortalKonfig')) {
        e.preventDefault();
        this.arcade.gamePaused = !this.arcade.gamePaused;
        this.arcade.keys.p = false;
        this.arcade.lastTs = this.arcadePerfNow();
        this.arcade.lastAdvanceAt = 0;
        return;
      }
      this.arcade.keys[key] = true;
      if (this.arcade.gamePaused) this.arcade.gamePaused = false;
      if (this.arcade.currentGameId === 'ctrlAltDefeat') {
        if (key === 'a') this.handleRpgAction('attack');
        if (key === 'p') this.handleRpgAction('patch');
        if (key === 'o') this.handleRpgAction('overclock');
      }
      e.preventDefault();
    },

    handleArcadeKeyUp(e) {
      if (!this.arcade) return;
      this.arcade.keys[e.key.toLowerCase()] = false;
    },

    handleCabinetArcadeInput(input) {
      const arcade = this.arcade;
      if (!arcade || !arcade.overlayOpen) return false;
      if (input.type === 'pointer') {
        this.handleCabinetArcadePointer(input.x, input.y);
        return true;
      }
      if (input.type === 'keyup') {
        this.handleArcadeKeyUp(input.event);
        return true;
      }
      if (input.type !== 'keydown') return true;
      const key = input.key;
      if (key === 'escape' || key === 'esc') {
        if (arcade.currentGameId) this.renderArcadeMenu();
        else this.leaveArcade(false);
        return true;
      }
      if (!arcade.currentGameId) {
        if (key === 'arrowup' || key === 'w') arcade.cabinetMenuIndex = (arcade.cabinetMenuIndex + arcade.catalog.length - 1) % arcade.catalog.length;
        if (key === 'arrowdown' || key === 's') arcade.cabinetMenuIndex = (arcade.cabinetMenuIndex + 1) % arcade.catalog.length;
        if (key === 'enter' || key === ' ' || key === 'e') this.openArcadeGame(arcade.catalog[arcade.cabinetMenuIndex].id);
        return true;
      }
      this.handleArcadeKeyDown(input.event);
      return true;
    },

    handleCabinetArcadePointer(u, v) {
      const arcade = this.arcade;
      if (!arcade) return;
      const x = Math.max(0, Math.min(512, u * 512));
      const y = Math.max(0, Math.min(384, v * 384));
      if (!arcade.currentGameId) {
        if (y > 330) { this.leaveArcade(false); return; }
        const index = Math.floor((y - 86) / 43);
        if (index >= 0 && index < arcade.catalog.length) {
          arcade.cabinetMenuIndex = index;
          this.openArcadeGame(arcade.catalog[index].id);
        }
        return;
      }
      const id = arcade.currentGameId;
      const game = arcade.games[id];
      if (!game) return;
      if (y < 36 && x < 82) { this.renderArcadeMenu(); return; }
      if ((id === 'circuitBreaker' || id === 'mortalKonfig') && y < 36 && x >= 352 && x <= 420) {
        arcade.gamePaused = !arcade.gamePaused;
        arcade.lastTs = this.arcadePerfNow();
        arcade.lastAdvanceAt = 0;
        return;
      }
      // Any game tap resumes after a mobile browser has throttled its normal
      // animation callbacks, except the dedicated pause control above.
      arcade.gamePaused = false;
      arcade.lastTs = this.arcadePerfNow();
      arcade.lastAdvanceAt = 0;
      if (y < 36 && x > 420) { this.restartArcadeGame(id); return; }
      if (game.over || game.won) {
        if (x >= 158 && x <= 354 && y >= 220 && y <= 260) this.restartArcadeGame(id);
        return;
      }
      if (id === 'bombmopper') {
        if (y >= 334 && y <= 360 && x >= 340 && x <= 488) { game.mode = game.mode === 'flag' ? 'reveal' : 'flag'; return; }
        const cellSize = 24, left = 136, top = 72;
        const col = Math.floor((x - left) / cellSize), row = Math.floor((y - top) / cellSize);
        if (col >= 0 && col < 10 && row >= 0 && row < 10) this.onBombmopperCell(row * 10 + col, false);
        return;
      }
      if (id === 'stackOverflow') {
        if (y > 334) {
          const actions = ['new', 'undo', 'hint', 'auto'];
          const index = Math.floor((x - 96) / 82);
          if (actions[index]) this.handleSolitaireAction(actions[index]);
          return;
        }
        if (y >= 58 && y <= 118) {
          if (x >= 22 && x <= 74) this.handleSolitaireAction('draw');
          else if (x >= 82 && x <= 134) this.handleSolitaireAction('selectWaste');
          else if (x >= 254 && x <= 462) {
            const suits = ['H', 'D', 'C', 'S'];
            this.handleSolitaireAction('toFoundation', suits[Math.floor((x - 254) / 52)]);
          }
          return;
        }
        if (y >= 126 && y < 322) {
          const pile = Math.floor((x - 18) / 70);
          if (pile >= 0 && pile < 7) {
            const cards = game.tableau[pile] || [];
            const offset = Math.min(16, Math.max(10, (176 - 56) / Math.max(1, cards.length)));
            const index = Math.max(0, Math.min(cards.length - 1, Math.floor((y - 126) / offset)));
            if (cards.length) this.handleSolitaireAction('selectTableau', pile, index);
            else this.handleSolitaireAction('toTableau', pile);
          }
        }
        return;
      }
      if (id === 'circuitBreaker') {
        if (y > 88 && y < 312) game.lane = Math.max(0, Math.min(2, Math.floor((x - 124) / 88)));
        return;
      }
      if (id === 'ctrlAltDefeat') {
        const actions = ['attack', 'patch', 'overclock', 'firewall'];
        const index = Math.floor((x - 28) / 114);
        if (y > 276 && y < 330 && actions[index]) this.handleRpgAction(actions[index]);
        return;
      }
      if (id === 'mortalKonfig' && y > 310) {
        const action = Math.max(0, Math.min(5, Math.floor((x - 10) / 82)));
        if (action === 0) game.player.x = Math.max(54, game.player.x - 30);
        if (action === 1) game.player.x = Math.min(586, game.player.x + 30);
        if (action === 2 && game.player.y === 0) { game.player.vy = 330; game.player.y = 1; }
        if (action === 3) this.startFighterAttack(game, 'player', 'punch');
        if (action === 4) this.startFighterAttack(game, 'player', 'kick');
        if (action === 5) { game.player.block = Math.max(game.player.block, 0.32); game.message = 'Firewall stance raised.'; }
      }
    },

    renderCabinetArcade(ctx, width, height, time = 0) {
      this.advanceArcade(this.arcadePerfNow());
      const sx = width / 512, sy = height / 384;
      ctx.save();
      ctx.setTransform(sx, 0, 0, sy, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = '#02050a'; ctx.fillRect(0, 0, 512, 384);
      ctx.strokeStyle = '#45f7ff'; ctx.lineWidth = 5; ctx.strokeRect(8, 8, 496, 368);
      ctx.strokeStyle = 'rgba(255,79,216,0.72)'; ctx.lineWidth = 2; ctx.strokeRect(16, 16, 480, 352);
      ctx.fillStyle = 'rgba(69,247,255,0.12)';
      for (let y = 28; y < 370; y += 12) ctx.fillRect(20, y, 472, 1);
      if (!this.arcade?.currentGameId) this.renderCabinetArcadeMenu(ctx, time);
      else this.renderCabinetArcadeGame(ctx, this.arcade.currentGameId, time);
      ctx.restore();
    },

    drawCabinetText(ctx, text, x, y, size = 12, color = '#f7fbff', align = 'left') {
      ctx.textAlign = align;
      ctx.textBaseline = 'middle';
      ctx.fillStyle = color;
      ctx.font = `700 ${size}px "Courier New", monospace`;
      ctx.fillText(String(text), x, y);
    },

    renderCabinetArcadeMenu(ctx, time) {
      const arcade = this.arcade;
      this.drawCabinetText(ctx, 'UPTIME ARCADE', 256, 43, 25, '#57f4ff', 'center');
      this.drawCabinetText(ctx, 'SELECT WITH ARROWS OR TAP THE CRT', 256, 66, 10, '#ffd34d', 'center');
      arcade.catalog.forEach((game, index) => {
        const y = 97 + index * 43;
        const selected = index === arcade.cabinetMenuIndex;
        if (selected) { ctx.fillStyle = 'rgba(255,79,216,0.24)'; ctx.fillRect(32, y - 16, 448, 33); }
        this.drawCabinetText(ctx, selected ? '>' : ' ', 42, y, 17, selected ? '#ff4fd8' : '#9fe8ff');
        this.drawCabinetText(ctx, `${String(index + 1).padStart(2, '0')} ${game.title.toUpperCase()}`, 63, y, 16, selected ? '#f7fbff' : '#a8eaff');
        this.drawCabinetText(ctx, game.genre, 472, y, 10, game.accent, 'right');
      });
      const selected = arcade.catalog[arcade.cabinetMenuIndex];
      this.drawCabinetText(ctx, selected.desc.toUpperCase(), 256, 324, 10, '#d5efff', 'center');
      this.drawCabinetText(ctx, `HI ${this.getArcadeScore(selected.id)}   //   ENTER TO PLAY   //   ESC OR TAP HERE TO EXIT`, 256, 348, 10, '#7dff68', 'center');
      if (Math.floor(time * 1.4) % 2) this.drawCabinetText(ctx, 'READY', 462, 42, 9, '#ff4fd8', 'right');
    },

    renderCabinetArcadeGame(ctx, id, time) {
      const def = this.arcadeGameDef(id);
      const game = this.arcade.games[id];
      this.drawCabinetText(ctx, '< MENU', 26, 30, 10, '#a8eaff');
      this.drawCabinetText(ctx, def.title.toUpperCase(), 256, 30, 16, def.accent, 'center');
      if (id === 'circuitBreaker' || id === 'mortalKonfig') this.drawCabinetText(ctx, this.arcade.gamePaused ? 'RESUME' : 'PAUSE', 386, 30, 9, '#a8eaff', 'center');
      this.drawCabinetText(ctx, game?.won ? 'NEXT RUN >' : 'RESTART >', 486, 30, 10, '#ffd34d', 'right');
      if (id === 'bombmopper') this.renderCabinetBombmopper(ctx, game);
      if (id === 'stackOverflow') this.renderCabinetSolitaire(ctx, game);
      if (id === 'circuitBreaker') this.renderCabinetCircuit(ctx, game, time);
      if (id === 'ctrlAltDefeat') this.renderCabinetRpg(ctx, game);
      if (id === 'mortalKonfig') this.renderCabinetFighter(ctx, game);
      if (this.arcade.gamePaused && !game?.over) this.renderCabinetPauseOverlay(ctx);
      if (game?.over || game?.won) this.renderCabinetResultOverlay(ctx, game);
    },

    renderCabinetPauseOverlay(ctx) {
      ctx.fillStyle = 'rgba(2, 4, 10, 0.78)'; ctx.fillRect(122, 146, 268, 92);
      ctx.strokeStyle = '#45f7ff'; ctx.lineWidth = 3; ctx.strokeRect(122, 146, 268, 92);
      this.drawCabinetText(ctx, 'PAUSED', 256, 176, 24, '#45f7ff', 'center');
      this.drawCabinetText(ctx, 'TAP RESUME OR PRESS P', 256, 207, 10, '#d5efff', 'center');
    },

    renderCabinetResultOverlay(ctx, game) {
      const won = !!game.won;
      ctx.fillStyle = 'rgba(2, 4, 10, 0.88)'; ctx.fillRect(74, 104, 364, 190);
      ctx.strokeStyle = won ? '#7dff68' : '#ff5a6d'; ctx.lineWidth = 4; ctx.strokeRect(74, 104, 364, 190);
      ctx.strokeStyle = won ? 'rgba(125,255,104,0.34)' : 'rgba(255,90,109,0.34)'; ctx.lineWidth = 1; ctx.strokeRect(84, 114, 344, 170);
      this.drawCabinetText(ctx, won ? 'RUN CLEAR' : 'GAME OVER', 256, 148, 31, won ? '#7dff68' : '#ff5a6d', 'center');
      this.drawCabinetText(ctx, won ? 'SCORE CARRIES INTO THE NEXT RUN' : 'RUN SCORE BANKED. NEXT RUN STARTS FRESH.', 256, 178, 10, '#d5efff', 'center');
      this.drawCabinetText(ctx, `SCORE ${Math.floor(game.score || 0)}   //   HI ${this.getArcadeScore(this.arcade.currentGameId)}`, 256, 198, 11, '#ffd34d', 'center');
      ctx.fillStyle = won ? 'rgba(125,255,104,0.20)' : 'rgba(255,90,109,0.20)'; ctx.fillRect(158, 220, 196, 40);
      ctx.strokeStyle = won ? '#7dff68' : '#ff5a6d'; ctx.lineWidth = 2; ctx.strokeRect(158, 220, 196, 40);
      this.drawCabinetText(ctx, won ? 'NEXT RUN' : 'RESTART', 256, 240, 15, '#f7fbff', 'center');
    },

    renderCabinetBombmopper(ctx, game) {
      if (!game) return;
      const flags = game.cells.filter(cell => cell.flagged).length;
      this.drawCabinetText(ctx, `SHIFT ${game.round}   SCORE ${Math.floor(game.score)}   HI ${this.getArcadeScore('bombmopper')}   BOMBS ${game.bombs - flags}   ${Math.floor(game.elapsed)}S`, 256, 53, 9, '#a8eaff', 'center');
      const cellSize = 24, left = 136, top = 72;
      game.cells.forEach((cell, index) => {
        const x = left + (index % 10) * cellSize, y = top + Math.floor(index / 10) * cellSize;
        ctx.fillStyle = cell.revealed ? (cell.mine ? '#ff5a6d' : '#173246') : '#17212d';
        ctx.fillRect(x + 1, y + 1, cellSize - 3, cellSize - 3);
        ctx.strokeStyle = cell.revealed ? '#4b6d82' : '#45f7ff'; ctx.lineWidth = 1; ctx.strokeRect(x + 1, y + 1, cellSize - 3, cellSize - 3);
        if (cell.revealed && cell.mine) this.drawCabinetText(ctx, '*', x + 11, y + 12, 16, '#fff', 'center');
        else if (cell.flagged) this.drawCabinetText(ctx, 'F', x + 11, y + 12, 12, '#ffd34d', 'center');
        else if (cell.revealed && cell.adj) this.drawCabinetText(ctx, cell.adj, x + 11, y + 12, 12, ['#fff', '#57f4ff', '#7dff68', '#ff4fd8'][Math.min(3, cell.adj - 1)], 'center');
      });
      this.drawCabinetText(ctx, game.message.toUpperCase(), 256, 323, 10, game.over ? (game.won ? '#7dff68' : '#ff5a6d') : '#d5efff', 'center');
      this.drawCabinetText(ctx, `TAP GRID TO ${game.mode === 'flag' ? 'FLAG' : 'REVEAL'}`, 176, 346, 10, '#ffd34d', 'center');
      ctx.fillStyle = 'rgba(255,211,77,0.16)'; ctx.fillRect(340, 334, 148, 26); ctx.strokeStyle = '#ffd34d'; ctx.strokeRect(340, 334, 148, 26);
      this.drawCabinetText(ctx, `MODE: ${game.mode === 'flag' ? 'FLAG' : 'REVEAL'}`, 414, 347, 10, '#ffe39b', 'center');
      if (game.over) this.drawCabinetText(ctx, 'RUN COMPLETE - TAP RESTART', 256, 366, 10, '#ff4fd8', 'center');
    },

    arcadeSuitGlyph(suit) {
      return ({ H: '\u2665', D: '\u2666', C: '\u2663', S: '\u2660' })[suit] || String(suit || '');
    },

    arcadeCardLabel(card) {
      return card ? `${card.rank}${this.arcadeSuitGlyph(card.suit)}` : '';
    },

    drawCabinetCard(ctx, card, x, y, selected = false) {
      ctx.fillStyle = card?.faceUp ? '#e8f4ff' : '#35244e';
      ctx.fillRect(x, y, 52, 66);
      ctx.strokeStyle = selected ? '#ffd34d' : '#45f7ff'; ctx.lineWidth = selected ? 3 : 1; ctx.strokeRect(x, y, 52, 66);
      if (!card?.faceUp) { this.drawCabinetText(ctx, 'SYS', x + 26, y + 31, 10, '#ff9ddd', 'center'); return; }
      const red = card.color === 'red';
      const suit = this.arcadeSuitGlyph(card.suit);
      this.drawCabinetText(ctx, `${card.rank}${suit}`, x + 5, y + 11, 10, red ? '#d92d53' : '#142030');
      this.drawCabinetText(ctx, suit, x + 26, y + 37, 19, red ? '#d92d53' : '#142030', 'center');
    },

    renderCabinetSolitaire(ctx, game) {
      if (!game) return;
      this.drawCabinetText(ctx, `DEAL ${game.round}  SCORE ${game.score}  MOVES ${game.moves}  HI ${this.getArcadeScore('stackOverflow')}`, 256, 52, 9, '#ffb8ed', 'center');
      if (game.stock.length) this.drawCabinetCard(ctx, { faceUp: false }, 22, 58);
      else { ctx.strokeStyle = '#ff4fd8'; ctx.strokeRect(22, 58, 52, 66); this.drawCabinetText(ctx, 'RESET', 48, 91, 8, '#ffb8ed', 'center'); }
      const waste = game.waste[game.waste.length - 1];
      if (waste) this.drawCabinetCard(ctx, waste, 82, 58, this.arcade.selectedSolitaire?.source === 'waste');
      else { ctx.strokeStyle = '#345367'; ctx.strokeRect(82, 58, 52, 66); }
      ['H', 'D', 'C', 'S'].forEach((suit, index) => {
        const card = game.foundations[suit][game.foundations[suit].length - 1];
        const x = 254 + index * 52;
        if (card) this.drawCabinetCard(ctx, card, x, 58); else { ctx.strokeStyle = '#345367'; ctx.strokeRect(x, 58, 48, 66); this.drawCabinetText(ctx, this.arcadeSuitGlyph(suit), x + 24, 91, 18, '#6f9bb5', 'center'); }
      });
      game.tableau.forEach((pile, pileIndex) => {
        const x = 18 + pileIndex * 70;
        if (!pile.length) { ctx.strokeStyle = '#345367'; ctx.strokeRect(x, 126, 52, 66); return; }
        const offset = Math.min(16, Math.max(10, (176 - 56) / Math.max(1, pile.length)));
        pile.forEach((card, index) => this.drawCabinetCard(ctx, card, x, 126 + index * offset, this.arcade.selectedSolitaire?.source === 'tableau' && this.arcade.selectedSolitaire.pile === pileIndex && this.arcade.selectedSolitaire.index === index));
      });
      this.drawCabinetText(ctx, (game.message || '').toUpperCase(), 256, 307, 9, '#d5efff', 'center');
      ['NEW', 'UNDO', 'HINT', 'AUTO'].forEach((label, index) => {
        const x = 96 + index * 82; ctx.fillStyle = 'rgba(255,79,216,0.18)'; ctx.fillRect(x, 334, 70, 24); ctx.strokeStyle = '#ff4fd8'; ctx.strokeRect(x, 334, 70, 24); this.drawCabinetText(ctx, label, x + 35, 346, 10, '#ffd0f0', 'center');
      });
    },

    renderCabinetCircuit(ctx, game, time) {
      if (!game) return;
      const difficulty = Math.max(1, Number(game.difficulty) || 1);
      game.difficulty = difficulty;
      const sector = game.sectors[game.sector];
      const shake = game.screenShake > 0 ? Math.ceil(Math.sin(time * 90) * 5 * (game.screenShake / 0.26)) : 0;
      ctx.save();
      ctx.translate(shake, 0);
      ctx.fillStyle = sector.bg; ctx.fillRect(124, 58, 264, 258);
      [168, 256, 344].forEach(x => { ctx.strokeStyle = 'rgba(69,247,255,0.24)'; ctx.beginPath(); ctx.moveTo(x, 58); ctx.lineTo(x, 316); ctx.stroke(); });
      for (let y = 72 + (Math.floor(time * 150) % 32); y < 312; y += 32) { ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.fillRect(125, y, 263, 3); }
      this.drawCabinetText(ctx, `LOOP ${game.loop} X${difficulty.toFixed(2)} SECTOR ${game.sector + 1}/5 ${sector.name}`, 26, 63, 9, '#d5efff');
      this.drawCabinetText(ctx, `LIVES ${game.lives}`, 26, 82, 11, '#ffd34d');
      this.drawCabinetText(ctx, `SCORE ${game.score}`, 486, 63, 10, '#d5efff', 'right');
      this.drawCabinetText(ctx, `${Math.max(0, Math.ceil(game.sessionDuration - game.sessionTime))}S`, 486, 82, 11, '#7dff68', 'right');
      game.obstacles.forEach(item => {
        const x = 168 + item.lane * 88, y = item.y * 0.75 + 62;
        if (item.kind === 'spike') { ctx.fillStyle = '#ff5a6d'; ctx.beginPath(); ctx.moveTo(x, y - 12); ctx.lineTo(x - 24, y + 12); ctx.lineTo(x + 24, y + 12); ctx.fill(); }
        else if (item.kind === 'drop') { ctx.fillStyle = '#ffd34d'; ctx.fillRect(x - 7, y - 15, 14, 30); ctx.fillStyle = '#6b3b10'; ctx.fillRect(x - 18, y - 3, 36, 7); }
        else if (item.kind === 'lock') { ctx.strokeStyle = '#ff4fd8'; ctx.lineWidth = 4; ctx.strokeRect(x - 18, y - 13, 36, 26); ctx.fillStyle = '#ff4fd8'; ctx.fillRect(x - 5, y - 2, 10, 12); }
        else { ctx.fillStyle = '#45f7ff'; ctx.fillRect(x - 20, y - 10, 40, 20); ctx.fillStyle = '#07121c'; ctx.fillRect(x - 8, y - 4, 16, 8); }
      });
      game.pickups.forEach(item => {
        const x = 168 + item.lane * 88, y = item.y * 0.75 + 62;
        const color = item.kind === 'shield' ? '#45f7ff' : item.kind === 'patch' ? '#ffd34d' : item.kind === 'phase' ? '#c1a2ff' : item.kind === 'scrubber' ? '#ff9bd4' : '#7dff68';
        ctx.fillStyle = color; ctx.fillRect(x - 11, y - 11, 22, 22); ctx.fillStyle = '#07121c'; ctx.fillRect(x - 3, y - 7, 6, 14); ctx.fillRect(x - 7, y - 3, 14, 6);
      });
      const carX = 168 + game.lane * 88; ctx.fillStyle = '#ffd34d'; ctx.fillRect(carX - 24, 282, 48, 20); ctx.fillStyle = '#ff5a6d'; ctx.fillRect(carX - 13, 274, 26, 10);
      ctx.fillStyle = '#25344a'; ctx.fillRect(124, 326, 264, 8); ctx.fillStyle = '#7dff68'; ctx.fillRect(124, 326, Math.min(264, game.sessionTime / game.sessionDuration * 264), 8);
      this.drawCabinetText(ctx, 'TAP A LANE OR USE A/D  //  SHIELD, PHASE, PATCH, SCRUB', 256, 353, 9, '#7dff68', 'center');
      if (game.over) this.drawCabinetText(ctx, 'PACKET LOSS - RESTART TO RUN AGAIN', 256, 370, 10, '#ff5a6d', 'center');
      if (game.damageFlash > 0) { ctx.fillStyle = `rgba(255,40,60,${game.damageFlash * 1.8})`; ctx.fillRect(20, 52, 472, 310); }
      if (game.sectorFlash > 0) { ctx.fillStyle = `rgba(125,255,104,${game.sectorFlash * 0.20})`; ctx.fillRect(124, 58, 264, 258); }
      ctx.restore();
    },

    renderCabinetRpg(ctx, game) {
      if (!game) return;
      const hp = (value, max, x, y, width, color, flip = false) => {
        ctx.fillStyle = '#263446'; ctx.fillRect(x, y, width, 12);
        const fill = Math.max(0, value / max) * width;
        ctx.fillStyle = color; ctx.fillRect(flip ? x + width - fill : x, y, fill, 12);
      };
      const sprite = (x, y, color, kind, facing = 1) => {
        ctx.save(); ctx.translate(x, y); ctx.scale(facing, 1);
        ctx.fillStyle = color;
        if (kind === 'null') { ctx.fillRect(-16, -48, 32, 32); ctx.fillStyle = '#07111b'; ctx.fillRect(-10, -41, 20, 8); }
        else if (kind === 'storm') { ctx.fillRect(-18, -42, 36, 24); ctx.fillRect(-10, -56, 20, 12); ctx.fillStyle = '#f7fbff'; ctx.fillRect(12, -38, 10, 5); }
        else if (kind === 'freeze') { ctx.fillRect(-14, -56, 28, 40); ctx.fillStyle = '#d8ffff'; ctx.fillRect(-7, -68, 14, 12); }
        else if (kind === 'root') { ctx.fillRect(-20, -52, 40, 36); ctx.fillStyle = '#1a0b13'; ctx.fillRect(-13, -44, 26, 8); ctx.fillStyle = color; ctx.fillRect(-8, -68, 16, 16); }
        else { ctx.fillRect(-15, -50, 30, 34); ctx.fillStyle = '#fff1b0'; ctx.fillRect(-9, -64, 18, 14); }
        ctx.restore();
      };
      this.drawCabinetText(ctx, `INCIDENT ${game.wave}  //  TURN ${game.turn}  //  SCORE ${game.score}  //  HI ${this.getArcadeScore('ctrlAltDefeat')}`, 256, 55, 9, '#ffe19a', 'center');
      this.drawCabinetText(ctx, 'NOVA ADMIN', 42, 88, 12, '#57f4ff'); hp(game.player.hp, game.player.maxHp, 42, 99, 162, '#57f4ff');
      this.drawCabinetText(ctx, game.enemy.name.toUpperCase(), 470, 88, 12, game.enemy.color, 'right'); hp(game.enemy.hp, game.enemy.maxHp, 308, 99, 162, game.enemy.color, true);
      sprite(113, 216, '#57f4ff', 'admin', 1);
      sprite(399, 216, game.enemy.color, game.enemy.sprite, -1);
      ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(184, 145, 144, 54); ctx.strokeStyle = game.enemy.intent.color; ctx.strokeRect(184, 145, 144, 54);
      this.drawCabinetText(ctx, 'NEXT INTENT', 256, 160, 9, '#d5efff', 'center');
      this.drawCabinetText(ctx, `${game.enemy.intent.label} ${game.enemy.intent.damage + game.player.heat - 1}`, 256, 181, 14, game.enemy.intent.color, 'center');
      this.drawCabinetText(ctx, `HP ${game.player.hp}/${game.player.maxHp}  PATCH ${game.player.patches}  GUARD ${game.player.guard}  HEAT ${game.player.heat}`, 42, 251, 8, '#a8eaff');
      this.drawCabinetText(ctx, `HP ${Math.max(0, game.enemy.hp)}/${game.enemy.maxHp}  BASE ${game.enemy.attack}`, 470, 251, 8, '#ffd5e9', 'right');
      ['STRIKE', 'PATCH', 'OVERCLOCK', 'FIREWALL'].forEach((label, index) => { const x = 28 + index * 114; ctx.fillStyle = 'rgba(255,211,77,0.18)'; ctx.fillRect(x, 278, 106, 42); ctx.strokeStyle = '#ffd34d'; ctx.strokeRect(x, 278, 106, 42); this.drawCabinetText(ctx, label, x + 53, 299, label === 'OVERCLOCK' ? 8 : 10, '#ffe39b', 'center'); });
      this.drawCabinetText(ctx, (game.log[0] || '').toUpperCase(), 256, 344, 9, game.over ? '#ff5a6d' : '#d5efff', 'center');
      if (game.over) this.drawCabinetText(ctx, 'RUN ENDED - TAP RESTART', 256, 367, 10, '#ff4fd8', 'center');
    },

    renderCabinetFighter(ctx, game) {
      if (!game) return;
      ctx.fillStyle = '#17142d'; ctx.fillRect(22, 58, 468, 246); ctx.fillStyle = '#0d1020'; ctx.fillRect(22, 266, 468, 38);
      const bar = (x, hp, max, color, flip = false) => { ctx.fillStyle = '#263446'; ctx.fillRect(x, 65, 166, 12); ctx.fillStyle = color; const width = Math.max(0, hp / max) * 166; ctx.fillRect(flip ? x + 166 - width : x, 65, width, 12); };
      bar(34, game.player.hp, game.player.maxHp, '#ffd34d'); bar(312, game.enemy.hp, game.enemy.maxHp, '#ff5a6d', true);
      this.drawCabinetText(ctx, `TIER ${game.tier}  ROUND ${game.round}  AI X${(game.aiSkill || 1).toFixed(2)}  WINS ${game.wins}-${game.enemyWins}  SCORE ${game.score}`, 256, 93, 9, '#d5efff', 'center');
      const fighter = (unit, color, label) => {
        const x = 22 + (unit.x / 640) * 468;
        const y = 270 - unit.y * 0.48;
        const facing = unit.dir || 1;
        const paint = unit.block > 0 ? '#45f7ff' : color;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(facing, 1);
        ctx.fillStyle = paint;
        // Head, visor, torso, and a grounded rear leg establish a readable stance.
        ctx.fillRect(-10, -70, 20, 18);
        ctx.fillStyle = '#111827'; ctx.fillRect(-7, -65, 14, 5);
        ctx.fillStyle = paint; ctx.fillRect(-13, -51, 26, 31);
        const action = unit.attack?.kind;
        // A kick replaces the forward standing leg; it never adds a third leg.
        ctx.fillRect(-11, -20, 8, 20);
        if (action !== 'kick') ctx.fillRect(4, -20, 8, 20);
        if (action === 'punch') {
          // Straight arm and bright fist: a very different read from a kick.
          ctx.fillRect(10, -46, 30, 8);
          ctx.fillStyle = '#f7fbff'; ctx.fillRect(38, -48, 8, 12);
          ctx.fillStyle = paint; ctx.fillRect(-25, -44, 12, 8);
        } else if (action === 'kick') {
          // Plant one leg and throw the other low and forward with a boot.
          ctx.fillRect(-11, -20, 9, 20);
          ctx.fillRect(8, -25, 15, 8);
          ctx.fillRect(20, -17, 26, 8);
          ctx.fillStyle = '#f7fbff'; ctx.fillRect(43, -18, 10, 10);
          ctx.fillStyle = paint; ctx.fillRect(10, -46, 16, 8);
        } else if (unit.block > 0) {
          ctx.fillStyle = 'rgba(69,247,255,0.30)'; ctx.fillRect(13, -60, 20, 48);
          ctx.fillStyle = paint; ctx.fillRect(10, -48, 12, 26); ctx.fillRect(-25, -48, 12, 26);
        } else {
          ctx.fillRect(11, -46, 15, 8);
          ctx.fillRect(-26, -46, 15, 8);
        }
        ctx.restore();
        this.drawCabinetText(ctx, label, x, y + 13, 8, '#fff', 'center');
      };
      fighter(game.player, '#ffd34d', 'ADMIN'); fighter(game.enemy, '#ff5a6d', 'KERNEL');
      ['LEFT', 'RIGHT', 'JUMP', 'PUNCH', 'KICK', 'BLOCK'].forEach((label, index) => { const x = 10 + index * 82; ctx.fillStyle = 'rgba(255,90,109,0.18)'; ctx.fillRect(x, 320, 76, 34); ctx.strokeStyle = '#ff5a6d'; ctx.strokeRect(x, 320, 76, 34); this.drawCabinetText(ctx, label, x + 38, 337, 8, '#ffd4dc', 'center'); });
      this.drawCabinetText(ctx, game.message.toUpperCase(), 256, 370, 9, game.over ? (game.won ? '#7dff68' : '#ff5a6d') : '#d5efff', 'center');
    },

    drawArcadeFrameBase(ctx, title, subtitle) {
      if (!ctx || !this.els.arcadeCanvas) return;
      ctx.clearRect(0, 0, this.els.arcadeCanvas.width, this.els.arcadeCanvas.height);
      const grad = ctx.createLinearGradient(0, 0, 0, this.els.arcadeCanvas.height);
      grad.addColorStop(0, '#0d1522');
      grad.addColorStop(1, '#05080f');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, this.els.arcadeCanvas.width, this.els.arcadeCanvas.height);
      ctx.strokeStyle = 'rgba(120,220,255,0.18)'; ctx.lineWidth = 2; ctx.strokeRect(8, 8, this.els.arcadeCanvas.width - 16, this.els.arcadeCanvas.height - 16);
      ctx.fillStyle = '#ff9fd9'; ctx.font = 'bold 22px monospace'; ctx.textAlign = 'left'; ctx.fillText(title, 18, 30);
      ctx.fillStyle = '#b5e8ff'; ctx.font = '12px monospace'; ctx.fillText(subtitle, 18, 48);
    },

    drawArcadePauseOverlay(ctx) {
      ctx.fillStyle = 'rgba(3,6,10,0.72)'; ctx.fillRect(150, 130, 340, 90);
      ctx.fillStyle = '#fff0cb'; ctx.font = 'bold 22px monospace'; ctx.fillText('PAUSED', 270, 165);
      ctx.font = '13px monospace'; ctx.fillStyle = '#b5e8ff'; ctx.fillText('Press a game button to resume later.', 188, 190);
    },

    cardColor(card) { return (card.suit === '♥' || card.suit === '♦') ? 'red' : ''; },
    cardLabel(card) { return `${card.rank}${card.suit}`; },

    createBombmopperGame(baseScore = 0) {
      const mineCount = 14;
      const total = 100;
      const mines = new Set();
      while (mines.size < mineCount) mines.add(Math.floor(Math.random() * total));
      const cells = Array.from({ length: total }, (_, i) => ({ mine: mines.has(i), revealed: false, flagged: false, adjacent: 0 }));
      const dirs = [-11,-10,-9,-1,1,9,10,11];
      cells.forEach((cell, i) => {
        const x = i % 10, y = Math.floor(i / 10);
        cell.adjacent = dirs.reduce((sum, dir) => {
          const j = i + dir;
          if (j < 0 || j >= total) return sum;
          const nx = j % 10, ny = Math.floor(j / 10);
          if (Math.abs(nx - x) > 1 || Math.abs(ny - y) > 1) return sum;
          return sum + (cells[j].mine ? 1 : 0);
        }, 0);
      });
      return { cells, started: false, over: false, won: false, score: baseScore, elapsed: 0, mineCount, firstClick: true, streakScore: baseScore };
    },

    floodRevealBomb(index, game) {
      const stack = [index];
      while (stack.length) {
        const i = stack.pop();
        const cell = game.cells[i];
        if (cell.revealed || cell.flagged) continue;
        cell.revealed = true;
        if (cell.adjacent !== 0) continue;
        const x = i % 10, y = Math.floor(i / 10);
        for (let dy = -1; dy <= 1; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            if (!dx && !dy) continue;
            const nx = x + dx, ny = y + dy;
            if (nx < 0 || nx >= 10 || ny < 0 || ny >= 10) continue;
            const ni = ny * 10 + nx;
            if (!game.cells[ni].revealed && !game.cells[ni].flagged) stack.push(ni);
          }
        }
      }
    },

    relocateBombmopperFirstClick(index, game) {
      const current = game.cells[index];
      if (!current.mine) return;
      const swapIndex = game.cells.findIndex((cell, i) => i !== index && !cell.mine);
      if (swapIndex < 0) return;
      game.cells[index].mine = false;
      game.cells[swapIndex].mine = true;
      const dirs = [-11,-10,-9,-1,1,9,10,11];
      game.cells.forEach((cell, i) => {
        const x = i % 10, y = Math.floor(i / 10);
        cell.adjacent = dirs.reduce((sum, dir) => {
          const j = i + dir;
          if (j < 0 || j >= game.cells.length) return sum;
          const nx = j % 10, ny = Math.floor(j / 10);
          if (Math.abs(nx - x) > 1 || Math.abs(ny - y) > 1) return sum;
          return sum + (game.cells[j].mine ? 1 : 0);
        }, 0);
      });
    },

    onBombmopperCell(index, flag) {
      if (this.arcade.gamePaused) this.arcade.gamePaused = false;
      const game = this.arcade.games.bombmopper;
      if (!game || game.over || game.won) return;
      game.started = true;
      if (game.firstClick && !flag) {
        this.relocateBombmopperFirstClick(index, game);
        game.firstClick = false;
      }
      const cell = game.cells[index];
      if (flag) {
        if (!cell.revealed) cell.flagged = !cell.flagged;
      } else {
        if (cell.flagged || cell.revealed) return;
        if (cell.mine) {
          cell.revealed = true;
          game.over = true;
          game.cells.forEach(other => { if (other.mine) other.revealed = true; });
          this.setArcadeScore('bombmopper', game.score);
          this.arcade.bombmopperCarryScore = 0;
        } else {
          this.floodRevealBomb(index, game);
          const revealed = game.cells.filter(c => c.revealed).length;
          game.score = Math.max(game.score, (game.streakScore || 0) + revealed * 12 - Math.floor(game.elapsed));
          if (revealed >= 86) {
            game.won = true;
            game.score += 500;
            this.arcade.bombmopperCarryScore = game.score;
            this.setArcadeScore('bombmopper', game.score);
          } else {
            this.arcade.bombmopperCarryScore = Math.max(this.arcade.bombmopperCarryScore || 0, game.score);
          }
        }
      }
      this.renderBombmopper();
    },

    updateBombmopper(dt) {
      const game = this.arcade?.games?.bombmopper;
      if (!game || game.over || game.won || !game.started) return;
      const prevSecond = Math.floor(game.elapsed || 0);
      game.elapsed = (game.elapsed || 0) + dt;
      const nextSecond = Math.floor(game.elapsed);
      if (prevSecond !== nextSecond) this.renderBombmopper();
    },

    renderBombmopper() {
      this.els.arcadeCanvas.classList.add('hidden');
      this.els.arcadeDomGame.classList.remove('hidden');
      const game = this.arcade.games.bombmopper;
      const bombsLeft = Math.max(0, game.mineCount - game.cells.filter(cell => cell.flagged).length);
      const content = game.cells.map((cell, index) => {
        let cls = 'arcade-bomb-cell';
        let value = '';
        if (cell.revealed) {
          cls += ' revealed';
          if (cell.mine) { cls += ' mine'; value = '✹'; }
          else value = cell.adjacent || '';
        } else if (cell.flagged) { cls += ' flagged'; value = '⚑'; }
        return `<button class="${cls}" data-bomb-cell="${index}">${value}</button>`;
      }).join('');
      const face = game.over ? '☠️' : (game.won ? '😎' : '🙂');
      const overlay = game.over ? `<div class="arcade-result-overlay"><div class="arcade-result-card"><h4>Bombmopper crashed the shift</h4><p>You hit a mine. Start a fresh board right here.</p><div class="manager-actions"><button class="buy-btn can-afford" data-bomb-restart>New Game</button></div></div></div>` : game.won ? `<div class="arcade-result-overlay"><div class="arcade-result-card"><h4>Board cleared</h4><p>Bombmopper posted a hazard-free highscore.</p><div class="manager-actions"><button class="buy-btn can-afford" data-bomb-restart>Play Again</button></div></div></div>` : '';
      const best = this.arcade?.scores?.bombmopper || 0;
      this.els.arcadeDomGame.innerHTML = `<div class="arcade-screen-controls arcade-bomb-status"><div class="muted">Score ${Math.max(0, Math.floor(game.score || 0))}</div><div class="arcade-bomb-face-wrap"><button class="arcade-face-btn" type="button" data-bomb-restart>${face}</button></div><div class="muted">Hi ${best} • Bombs ${bombsLeft} • Time ${Math.floor(game.elapsed)}s</div></div><div class="arcade-bomb-wrap"><div class="arcade-bomb-grid">${content}</div>${overlay}</div>`;
    },

    makeDeck() {
      const suits = ['♠','♥','♦','♣'];
      const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
      const deck = [];
      suits.forEach(suit => ranks.forEach(rank => deck.push({ suit, rank })));
      for (let i = deck.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      return deck;
    },

    createSolitaireGame() {
      const deck = this.makeDeck();
      const tableaus = Array.from({ length: 7 }, (_, pileIndex) => Array.from({ length: pileIndex + 1 }, (_, idx) => ({ ...deck.pop(), faceUp: idx === pileIndex })));
      return { tableaus, foundations: { '♠': [], '♥': [], '♦': [], '♣': [] }, draw: deck, waste: [], score: 0, won: false, over: false, loseReason: '' };
    },

    snapshotSolitaire(game) {
      return JSON.parse(JSON.stringify(game));
    },

    pushSolitaireUndo(game) {
      if (!this.arcade) return;
      this.arcade.solitaireUndo = this.arcade.solitaireUndo || [];
      this.arcade.solitaireUndo.push(this.snapshotSolitaire(game));
      if (this.arcade.solitaireUndo.length > 60) this.arcade.solitaireUndo.shift();
    },

    restoreSolitaireUndo() {
      const stack = this.arcade?.solitaireUndo || [];
      if (!stack.length) return;
      this.arcade.games.stackOverflow = stack.pop();
      this.arcade.solitaireHintText = '';
      this.arcade.solitaireHintUntil = 0;
      this.arcade.solitaireHintMove = null;
      this.arcade.selectedSolitaire = null;
      this.arcade.solitaireLastClick = null;
      this.clearSolitaireDrag();
      this.renderSolitaire();
    },

    getSolitaireCardFromSource(game, source, pile, index) {
      if (source === 'waste') return game.waste[game.waste.length - 1] || null;
      return game.tableaus[Number(pile)]?.[Number(index)] || null;
    },

    getSolitaireAutoFoundationTarget(card, game) {
      if (!card) return null;
      const suit = card.suit;
      return this.canPlaceOnFoundation(card, game.foundations[suit]) ? suit : null;
    },

    trySolitaireAutoFoundation(source, pile, index) {
      const game = this.arcade.games.stackOverflow;
      if (!game || game.over || game.won) return false;
      const card = this.getSolitaireCardFromSource(game, source, pile, index);
      const suit = this.getSolitaireAutoFoundationTarget(card, game);
      if (!suit) return false;
      this.arcade.selectedSolitaire = source === 'waste' ? { source: 'waste' } : { source: 'tableau', pile: Number(pile), index: Number(index) };
      this.handleSolitaireAction('toFoundation', suit, 0);
      return true;
    },

    hasAnySolitaireMoves(game) {
      if (game.won || game.over) return false;
      if (game.draw.length || game.waste.length) return true;
      const tableaus = game.tableaus;
      for (let p = 0; p < tableaus.length; p += 1) {
        const pile = tableaus[p];
        for (let i = 0; i < pile.length; i += 1) {
          const card = pile[i];
          if (!card.faceUp) continue;
          if (this.getSolitaireAutoFoundationTarget(card, game)) return true;
          const targetCard = i === 0 ? card : pile[i];
          for (let tp = 0; tp < tableaus.length; tp += 1) {
            if (tp === p) continue;
            const targetPile = tableaus[tp];
            const targetTop = targetPile[targetPile.length - 1];
            if (this.canPlaceOnTableau(card, targetTop)) return true;
          }
        }
      }
      return false;
    },

    getSolitaireHint(game) {
      const waste = game.waste[game.waste.length - 1];
      if (waste) {
        const suit = this.getSolitaireAutoFoundationTarget(waste, game);
        if (suit) return { from: { source: 'waste' }, to: { type: 'foundation', pile: suit } };
        for (let i = 0; i < game.tableaus.length; i += 1) {
          const top = game.tableaus[i][game.tableaus[i].length - 1];
          if (this.canPlaceOnTableau(waste, top)) return { from: { source: 'waste' }, to: { type: 'tableau', pile: i } };
        }
      }
      for (let p = 0; p < game.tableaus.length; p += 1) {
        const pile = game.tableaus[p];
        for (let i = 0; i < pile.length; i += 1) {
          const card = pile[i];
          if (!card.faceUp) continue;
          const suit = this.getSolitaireAutoFoundationTarget(card, game);
          if (suit) return { from: { source: 'tableau', pile: p, index: i }, to: { type: 'foundation', pile: suit } };
          for (let tp = 0; tp < game.tableaus.length; tp += 1) {
            if (tp === p) continue;
            const top = game.tableaus[tp][game.tableaus[tp].length - 1];
            if (this.canPlaceOnTableau(card, top)) return { from: { source: 'tableau', pile: p, index: i }, to: { type: 'tableau', pile: tp } };
          }
        }
      }
      return null;
    },

    drawFromStock(game) {
      if (!game.draw.length) {
        game.draw = game.waste.reverse().map(card => ({ ...card, faceUp: false }));
        game.waste = [];
        return;
      }
      game.waste.push({ ...game.draw.pop(), faceUp: true });
      game.score = Math.max(0, game.score - 1);
    },

    canPlaceOnTableau(card, target) {
      if (!target) return card.rank === 'K';
      const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
      const color = c => (c.suit === '♥' || c.suit === '♦') ? 'r' : 'b';
      return color(card) !== color(target) && ranks.indexOf(card.rank) === ranks.indexOf(target.rank) - 1;
    },

    canPlaceOnFoundation(card, pile) {
      const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
      if (!pile.length) return card.rank === 'A';
      const top = pile[pile.length - 1];
      return card.suit === top.suit && ranks.indexOf(card.rank) === ranks.indexOf(top.rank) + 1;
    },

    startSolitaireDrag(source, pile = null, index = 0) {
      if (!this.arcade || !this.arcade.games.stackOverflow) return;
      this.arcade.selectedSolitaire = source === 'waste' ? { source: 'waste' } : { source: 'tableau', pile: Number(pile), index: Number(index) };
      this.arcade.solitaireDrag = { source, pile: pile == null ? null : Number(pile), index: Number(index || 0) };
    },

    clearSolitaireDrag() {
      if (!this.arcade) return;
      this.arcade.solitaireDrag = null;
      if (this.els.arcadeDomGame) this.els.arcadeDomGame.querySelectorAll('.arcade-drop-target').forEach(el => el.classList.remove('arcade-drop-target'));
    },

    handleSolitaireAction(action, pile, index) {
      if (this.arcade.gamePaused) this.arcade.gamePaused = false;
      const game = this.arcade.games.stackOverflow;
      if (!game || game.won || game.over) return;
      if (action === 'new') {
        this.arcade.games.stackOverflow = this.createSolitaireGame();
        this.arcade.solitaireUndo = [];
        this.arcade.solitaireHintText = '';
        this.arcade.solitaireHintUntil = 0;
        this.arcade.solitaireHintMove = null;
        this.renderSolitaire();
        return;
      }
      if (action === 'undo') {
        this.restoreSolitaireUndo();
        return;
      }
      if (action === 'hint') {
        const hint = this.getSolitaireHint(game);
        if (!hint) {
          if (!this.hasAnySolitaireMoves(game)) { game.over = true; game.loseReason = 'No valid moves left.'; this.renderSolitaire(); }
          return;
        }
        game.score = Math.max(0, game.score - 15);
        this.arcade.solitaireHintMove = hint;
        this.arcade.solitaireHintUntil = performance.now() + 2700;
        this.arcade.solitaireHintText = '';
        this.setArcadeScore('stackOverflow', game.score);
        this.renderSolitaire();
        return;
      }
      if (action === 'quit-lost') {
        this.arcade.currentGameId = null;
        this.arcade.gamePaused = false;
        this.renderArcadeMenu();
        return;
      }

      let changed = false;
      if (action === 'draw') {
        this.pushSolitaireUndo(game);
        this.drawFromStock(game);
        this.drawFromStock(game);
        changed = true;
      } else if (action === 'selectWaste') {
        const now = performance.now();
        const last = this.arcade.solitaireLastClick;
        if (last && last.source === 'waste' && now - last.at < 340) {
          this.arcade.solitaireLastClick = null;
          this.trySolitaireAutoFoundation('waste', 0, 0);
          return;
        }
        this.arcade.solitaireLastClick = { source: 'waste', pile: 0, index: 0, at: now };
        this.arcade.selectedSolitaire = { source: 'waste' };
      } else if (action === 'selectTableau') {
        const pileCards = game.tableaus[Number(pile)] || [];
        const card = pileCards[index];
        if (!card?.faceUp) { return; }
        const now = performance.now();
        const last = this.arcade.solitaireLastClick;
        if (last && last.source === 'tableau' && last.pile === Number(pile) && last.index === index && now - last.at < 340) {
          this.arcade.solitaireLastClick = null;
          this.trySolitaireAutoFoundation('tableau', Number(pile), index);
          return;
        }
        this.arcade.solitaireLastClick = { source: 'tableau', pile: Number(pile), index, at: now };
        this.arcade.selectedSolitaire = { source: 'tableau', pile: Number(pile), index };
      } else if (action === 'toFoundation') {
        this.pushSolitaireUndo(game);
        const suit = pile;
        const sel = this.arcade.selectedSolitaire;
        if (!sel) { return; }
        let card = null;
        if (sel.source === 'waste') card = game.waste[game.waste.length - 1];
        else card = game.tableaus[sel.pile]?.[sel.index];
        if (!card || !this.canPlaceOnFoundation(card, game.foundations[suit])) { this.arcade.solitaireUndo.pop(); return; }
        if (sel.source === 'waste') game.waste.pop();
        else {
          game.tableaus[sel.pile].splice(sel.index, 1);
          const reveal = game.tableaus[sel.pile][game.tableaus[sel.pile].length - 1];
          if (reveal) reveal.faceUp = true;
        }
        game.foundations[suit].push({ ...card, faceUp: true });
        game.score += 12;
        this.arcade.selectedSolitaire = null;
        changed = true;
      } else if (action === 'toTableau') {
        this.pushSolitaireUndo(game);
        const targetPile = game.tableaus[Number(pile)];
        const targetCard = targetPile[targetPile.length - 1];
        const sel = this.arcade.selectedSolitaire;
        if (!sel) { return; }
        let movingCards = [];
        if (sel.source === 'waste') {
          const card = game.waste[game.waste.length - 1];
          if (!card || !this.canPlaceOnTableau(card, targetCard)) { this.arcade.solitaireUndo.pop(); return; }
          movingCards = [{ ...card, faceUp: true }];
          game.waste.pop();
        } else {
          const pileIndex = sel.pile;
          movingCards = game.tableaus[pileIndex].slice(sel.index).map(card => ({ ...card, faceUp: true }));
          if (!movingCards.length || !this.canPlaceOnTableau(movingCards[0], targetCard)) { this.arcade.solitaireUndo.pop(); return; }
          game.tableaus[pileIndex].splice(sel.index, movingCards.length);
          const reveal = game.tableaus[pileIndex][game.tableaus[pileIndex].length - 1];
          if (reveal) reveal.faceUp = true;
        }
        targetPile.push(...movingCards);
        game.score += 5;
        this.arcade.selectedSolitaire = null;
        changed = true;
      } else {
        this.arcade.solitaireUndo.pop();
      }
      this.clearSolitaireDrag();
      if (changed) { this.arcade.solitaireHintText = ''; this.arcade.solitaireHintMove = null; this.arcade.solitaireLastClick = null; }
      const won = Object.values(game.foundations).every(p => p.length === 13);
      if (won) {
        game.won = true;
        this.setArcadeScore('stackOverflow', game.score + 500);
      } else {
        if (!this.hasAnySolitaireMoves(game)) {
          game.over = true;
          game.loseReason = 'No valid moves left.';
        }
        this.setArcadeScore('stackOverflow', game.score);
      }
      this.renderSolitaire();
    },

    renderSolitaire() {
      this.els.arcadeCanvas.classList.add('hidden');
      this.els.arcadeDomGame.classList.remove('hidden');
      const game = this.arcade.games.stackOverflow;
      const hintActive = this.arcade.solitaireHintMove && performance.now() < (this.arcade.solitaireHintUntil || 0);
      const isHintFrom = (source, pile, index = null) => {
        const h = this.arcade.solitaireHintMove;
        if (!hintActive || !h || !h.from) return false;
        return h.from.source === source && String(h.from.pile ?? '') === String(pile ?? '') && String(h.from.index ?? '') === String(index ?? '');
      };
      const isHintTo = (type, pile) => {
        const h = this.arcade.solitaireHintMove;
        if (!hintActive || !h || !h.to) return false;
        return h.to.type === type && String(h.to.pile ?? '') === String(pile ?? '');
      };
      const renderCard = (card, extraClass = '', attrs = '') => card.faceUp
        ? `<div class="arcade-card ${this.cardColor(card)} ${extraClass}" ${attrs}><span class="arcade-card-corner">${card.rank}${card.suit}</span><span class="arcade-card-center">${card.suit}</span></div>`
        : `<div class="arcade-card back ${extraClass}" ${attrs}><span class="arcade-card-back-label">STACK</span></div>`;
      const foundationCells = ['♠','♥','♦','♣'].map(suit => {
        const top = game.foundations[suit][game.foundations[suit].length - 1];
        return `<div class="arcade-foundation ${isHintTo('foundation', suit) ? 'arcade-hint-target' : ''}" data-sol-action="toFoundation" data-sol-drop="toFoundation" data-sol-pile="${suit}">${top ? renderCard(top) : ''}</div>`;
      }).join('');
      const tableauHtml = game.tableaus.map((pile, pileIndex) => {
        const availableHeight = 520;
        const cardHeight = 96;
        const defaultStep = 19;
        const step = pile.length > 1 ? Math.max(8, Math.min(defaultStep, Math.floor((availableHeight - cardHeight) / (pile.length - 1)))) : defaultStep;
        return `<div class="arcade-tableau ${isHintTo('tableau', pileIndex) ? 'arcade-hint-target' : ''}" data-sol-action="toTableau" data-sol-drop="toTableau" data-sol-pile="${pileIndex}" style="--stack-step:${step}px">${pile.map((card, cardIndex) => {
          const selected = (this.arcade.selectedSolitaire && this.arcade.selectedSolitaire.source === 'tableau' && this.arcade.selectedSolitaire.pile === pileIndex && this.arcade.selectedSolitaire.index === cardIndex) ? 'arcade-selected' : '';
          const hintClass = isHintFrom('tableau', pileIndex, cardIndex) ? 'arcade-hint-source' : '';
          const attrs = card.faceUp ? `draggable="true" data-sol-draggable="1" data-sol-source="tableau" data-sol-pile="${pileIndex}" data-sol-index="${cardIndex}" data-sol-action="selectTableau" data-sol-autofoundation="1"` : '';
          return renderCard(card, `${selected} ${hintClass}`.trim(), attrs);
        }).join('')}</div>`;
      }).join('');
      const wasteTop = game.waste[game.waste.length - 1];
      const wasteCard = wasteTop ? renderCard(wasteTop, `${(this.arcade.selectedSolitaire && this.arcade.selectedSolitaire.source === 'waste') ? 'arcade-selected' : ''} ${isHintFrom('waste') ? 'arcade-hint-source' : ''}`.trim(), 'draggable="true" data-sol-draggable="1" data-sol-source="waste" data-sol-action="selectWaste" data-sol-autofoundation="1"') : '';
      const overlay = game.over ? `<div class="arcade-result-overlay"><div class="arcade-result-card"><h4>Stack Overflow is out of moves</h4><p>${game.loseReason || 'No valid moves left.'}</p><div class="manager-actions"><button class="buy-btn can-afford" data-sol-action="new">New Game</button><button class="soft-btn" data-sol-action="quit-lost">Quit to Menu</button></div></div></div>` : game.won ? '<div class="arcade-result-overlay"><div class="arcade-result-card"><h4>Deck cleared</h4><p>Every stack is tidy. The overflow has been contained.</p><div class="manager-actions"><button class="buy-btn can-afford" data-sol-action="new">New Game</button></div></div></div>' : '';
      this.els.arcadeDomGame.innerHTML = `<div class="arcade-screen-controls"><div class="muted">Score ${game.score}</div><div class="manager-actions arcade-inline-actions"><button class="soft-btn" data-sol-action="new">New Game</button><button class="soft-btn" data-sol-action="undo">Undo</button><button class="soft-btn" data-sol-action="hint">Hint (-15)</button></div></div>${this.arcade.gamePaused ? '<div class="help-callout">Paused exactly where you left it. Click or drag a card to resume.</div>' : ''}<div class="arcade-solitaire-board tall"><div class="arcade-solitaire-top"><div class="arcade-stock-waste"><div class="arcade-pile arcade-stock" data-sol-action="draw">${game.draw.length ? `<div class="arcade-card back"><span class="arcade-card-back-label">DRAW</span></div>` : '<div class="muted">reset stock</div>'}</div><div class="arcade-pile arcade-waste ${isHintTo('waste', 0) ? 'arcade-hint-target' : ''}">${wasteCard}</div></div><div class="arcade-solitaire-foundations">${foundationCells}</div></div><div class="arcade-solitaire-bottom"><div class="arcade-solitaire-spacer"></div><div class="arcade-solitaire-layout">${tableauHtml}</div></div>${overlay}</div>`;
    },

    createCircuitBreakerGame() {
      return {
        lane: 1,
        distance: 0,
        score: 0,
        level: 0,
        levels: [
          { name: 'Fiber Run', bg: ['#07111a','#0e2432'], road: '#123044', speed: 78, spawn: 0.7, goal: 650, hazards: ['packet','relay'], pickups: ['boost'] },
          { name: 'Datacenter Drift', bg: ['#170d22','#312244'], road: '#1d2f56', speed: 92, spawn: 0.62, goal: 820, hazards: ['packet','relay','spill'], pickups: ['boost','shield'] },
          { name: 'Core Switch Circuit', bg: ['#071b12','#13412a'], road: '#173b2a', speed: 108, spawn: 0.54, goal: 980, hazards: ['packet','relay','spill','jammer'], pickups: ['boost','shield'] }
        ],
        obstacles: [],
        pickups: [],
        fx: [],
        spawnTimer: 0.3,
        pickupTimer: 2.4,
        boostUntil: 0,
        shieldUntil: 0,
        over: false,
        winFlash: 0
      };
    },

    updateCircuitBreaker(dt) {
      const g = this.arcade.games.circuitBreaker;
      if (!g || g.over) return;
      const level = g.levels[g.level];
      if (this.arcade.keys['arrowleft'] || this.arcade.keys['a']) g.lane = Math.max(0, g.lane - 1), this.arcade.keys['arrowleft']=this.arcade.keys['a']=false;
      if (this.arcade.keys['arrowright'] || this.arcade.keys['d']) g.lane = Math.min(2, g.lane + 1), this.arcade.keys['arrowright']=this.arcade.keys['d']=false;
      const now = performance.now();
      const speed = level.speed * (now < g.boostUntil ? 1.45 : 1);
      g.spawnTimer -= dt;
      g.pickupTimer -= dt;
      if (g.spawnTimer <= 0) {
        const kind = level.hazards[Math.floor(Math.random() * level.hazards.length)];
        g.obstacles.push({ lane: Math.floor(Math.random() * 3), y: -34, kind });
        g.spawnTimer = Math.max(0.26, level.spawn + (Math.random() * 0.22 - 0.08));
      }
      if (g.pickupTimer <= 0) {
        const kind = level.pickups[Math.floor(Math.random() * level.pickups.length)];
        g.pickups.push({ lane: Math.floor(Math.random() * 3), y: -28, kind });
        g.pickupTimer = 3.2 + Math.random() * 2.1;
      }
      g.obstacles.forEach(o => o.y += (speed + 150) * dt);
      g.pickups.forEach(o => o.y += (speed + 150) * dt);
      g.obstacles = g.obstacles.filter(o => o.y < 390);
      g.pickups = g.pickups.filter(o => o.y < 390);
      g.distance += speed * dt;
      g.score = Math.floor(g.distance) + g.level * 300;
      g.pickups = g.pickups.filter(o => {
        if (o.lane === g.lane && o.y > 248 && o.y < 330) {
          if (o.kind === 'boost') g.boostUntil = now + 2800;
          if (o.kind === 'shield') g.shieldUntil = now + 3200;
          g.fx.push({ text: o.kind === 'boost' ? 'BOOST' : 'SHIELD', ttl: 0.8 });
          return false;
        }
        return true;
      });
      g.obstacles.forEach(o => {
        if (o.lane !== g.lane || o.y < 244 || o.y > 324) return;
        if (now < g.shieldUntil) {
          g.shieldUntil = 0;
          o.y = 999;
          g.fx.push({ text: 'BLOCK', ttl: 0.6 });
        } else {
          g.over = true;
        }
      });
      if (!g.over && g.distance >= level.goal) {
        if (g.level < g.levels.length - 1) {
          g.level += 1;
          g.distance = 0;
          g.obstacles = [];
          g.pickups = [];
          g.winFlash = 1.1;
          g.fx.push({ text: `TRACK ${g.level + 1}`, ttl: 1.1 });
        } else {
          g.over = true;
        }
      }
      g.fx.forEach(f => f.ttl -= dt);
      g.fx = g.fx.filter(f => f.ttl > 0);
      if (g.winFlash > 0) g.winFlash -= dt;
      if (g.over) this.setArcadeScore('circuitBreaker', g.score);
    },

    renderCircuitBreaker() {
      this.els.arcadeCanvas.classList.remove('hidden');
      this.els.arcadeDomGame.classList.add('hidden');
      const ctx = this.els.arcadeCanvas.getContext('2d');
      const g = this.arcade.games.circuitBreaker;
      const level = g.levels[g.level];
      this.drawArcadeFrameBase(ctx, 'Circuit Breaker', 'A/D or ←/→ change lanes • grab boosts and survive each track.');
      const lanes = [170, 320, 470];
      const roadX = 110, roadY = 56, roadW = 420, roadH = 278;
      const grad = ctx.createLinearGradient(0, roadY, 0, roadY + roadH); grad.addColorStop(0, level.bg[0]); grad.addColorStop(1, level.bg[1]);
      ctx.fillStyle = grad; ctx.fillRect(roadX, roadY, roadW, roadH);
      ctx.fillStyle = level.road; ctx.fillRect(roadX + 16, roadY, roadW - 32, roadH);
      ctx.strokeStyle = 'rgba(120,220,255,0.16)'; ctx.lineWidth = 3; lanes.forEach(x => { ctx.beginPath(); ctx.moveTo(x, roadY); ctx.lineTo(x, roadY + roadH); ctx.stroke(); });
      ctx.fillStyle = '#9cf3ff'; ctx.fillText(`${level.name}`, 22, 28);
      ctx.fillText(`Track ${g.level + 1}/${g.levels.length}`, 240, 28);
      ctx.fillText(`Progress ${Math.floor(g.distance)}/${level.goal}`, 430, 28);
      const px = lanes[g.lane] - 27;
      ctx.fillStyle = '#ffb15f'; ctx.fillRect(px, 286, 54, 26);
      ctx.fillStyle = '#101820'; ctx.fillRect(px + 8, 292, 38, 10);
      g.obstacles.forEach(o => {
        const ox = lanes[o.lane] - 24;
        if (o.kind === 'packet') { ctx.fillStyle = '#7be4ff'; ctx.fillRect(ox, o.y, 48, 24); }
        if (o.kind === 'relay') { ctx.fillStyle = '#ff6ca0'; ctx.fillRect(ox, o.y, 48, 24); }
        if (o.kind === 'spill') { ctx.fillStyle = '#ffcf59'; ctx.beginPath(); ctx.ellipse(ox + 24, o.y + 14, 28, 14, 0, 0, Math.PI * 2); ctx.fill(); }
        if (o.kind === 'jammer') { ctx.fillStyle = '#c5a0ff'; ctx.fillRect(ox + 8, o.y, 32, 28); ctx.fillRect(ox, o.y + 8, 48, 12); }
      });
      g.pickups.forEach(o => {
        const ox = lanes[o.lane];
        ctx.fillStyle = o.kind === 'boost' ? '#79ffb8' : '#8cd8ff';
        ctx.beginPath(); ctx.arc(ox, o.y + 12, 12, 0, Math.PI * 2); ctx.fill();
      });
      if (performance.now() < g.boostUntil) { ctx.fillStyle = '#79ffb8'; ctx.fillText('BOOST', 540, 56); }
      if (performance.now() < g.shieldUntil) { ctx.fillStyle = '#8cd8ff'; ctx.fillText('SHIELD', 540, 76); }
      g.fx.forEach((f, i) => { ctx.fillStyle = `rgba(255,240,203,${Math.max(0,f.ttl).toFixed(2)})`; ctx.fillText(f.text, 282, 110 + i * 18); });
      if (g.over) { ctx.fillStyle = 'rgba(3,6,10,0.78)'; ctx.fillRect(140, 116, 360, 100); ctx.fillStyle = '#fff0cb'; ctx.font = 'bold 22px monospace'; ctx.fillText(g.level === g.levels.length - 1 && g.distance >= level.goal ? 'SECTOR CLEARED.' : 'PACKET LOSS.', 210, 158); ctx.font = '14px monospace'; ctx.fillStyle = '#b5e8ff'; ctx.fillText('Close with the white X, then start a fresh run.', 178, 186); }
      if (this.arcade.gamePaused && !g.over) this.drawArcadePauseOverlay(ctx);
    },

    createCtrlAltDefeatGame() { return { floor: 1, player: { hp: 34, maxHp: 34, patch: 3 }, enemy: null, log: ['Nova Admin enters the ticket dungeon.'], over: false, score: 0 }; },
    spawnRpgEnemy(game) {
      const roster = [ { name: 'Null Rat', hp: 12, atk: 4, color: '#ff8ea5' }, { name: 'Kernel Wraith', hp: 18, atk: 5, color: '#9fd8ff' }, { name: 'Patch Pixie', hp: 15, atk: 3, color: '#c6ff9e' }, { name: 'Segfault Ogre', hp: 24, atk: 6, color: '#ffcf7f' } ];
      game.enemy = { ...roster[Math.min(roster.length - 1, game.floor - 1)] };
    },
    updateCtrlAltDefeat(dt) { const g = this.arcade.games.ctrlAltDefeat; if (!g || g.over) return; if (!g.enemy) this.spawnRpgEnemy(g); },
    handleRpgAction(action) {
      if (this.arcade.gamePaused) this.arcade.gamePaused = false;
      const g = this.arcade.games.ctrlAltDefeat;
      if (!g || g.over) return;
      if (!g.enemy) this.spawnRpgEnemy(g);
      if (action === 'attack') { const dmg = 5 + Math.floor(Math.random() * 5); g.enemy.hp -= dmg; g.log.unshift(`Nova Admin scripts ${g.enemy.name} for ${dmg}.`); }
      else if (action === 'patch' && g.player.patch > 0) { const heal = 7 + Math.floor(Math.random() * 4); g.player.hp = Math.min(g.player.maxHp, g.player.hp + heal); g.player.patch -= 1; g.log.unshift(`Nova Admin patches for ${heal}.`); }
      else if (action === 'overclock') { const dmg = 9 + Math.floor(Math.random() * 4); g.enemy.hp -= dmg; g.player.hp -= 3; g.log.unshift(`Nova Admin overclocks and spikes ${g.enemy.name} for ${dmg}.`); }
      if (g.enemy.hp <= 0) { g.score += 100 * g.floor; g.floor += 1; g.log.unshift(`${g.enemy.name} deleted. Floor ${g.floor} opens.`); g.enemy = null; if (g.score > 0) this.setArcadeScore('ctrlAltDefeat', g.score); return; }
      const enemyDmg = 3 + Math.floor(Math.random() * Math.max(2, g.floor + 2)); g.player.hp -= enemyDmg; g.log.unshift(`${g.enemy.name} hits back for ${enemyDmg}.`);
      if (g.player.hp <= 0) { g.player.hp = 0; g.over = true; this.setArcadeScore('ctrlAltDefeat', g.score); }
      this.renderCtrlAltDefeat();
    },
    renderCtrlAltDefeat() {
      this.els.arcadeCanvas.classList.add('hidden');
      this.els.arcadeDomGame.classList.remove('hidden');
      const g = this.arcade.games.ctrlAltDefeat; if (!g.enemy) this.spawnRpgEnemy(g);
      this.els.arcadeDomGame.innerHTML = `<div class="arcade-screen-controls"><div class="muted">A = attack • P = patch • O = overclock</div><div class="muted">Score ${g.score}</div></div>${this.arcade.gamePaused ? '<div class="help-callout">Paused exactly where you left it. Press a button to resume.</div>' : ''}<div class="help-grid"><div class="help-chip"><strong>Nova Admin</strong><br>HP ${g.player.hp}/${g.player.maxHp}<br>Patches ${g.player.patch}</div><div class="help-chip"><strong>${g.enemy.name}</strong><br>HP ${Math.max(0, g.enemy.hp)}<br>Threat ${g.floor}</div></div><div class="manager-actions"><button class="soft-btn" data-rpg-action="attack">Attack</button><button class="soft-btn" data-rpg-action="patch">Patch</button><button class="soft-btn" data-rpg-action="overclock">Overclock</button></div><div class="stack" style="margin-top:12px;">${g.log.slice(0,6).map(line => `<div class="help-chip">${line}</div>`).join('')}</div>${g.over ? '<div class="help-callout" style="margin-top:12px;">Ctrl+Alt+Defeat run ended. Your highscore is safe.</div>' : ''}`;
    },

    createMortalKonfigGame() {
      return { playerX: 140, enemyX: 500, playerY: 0, enemyY: 0, playerVy: 0, enemyVy: 0, playerHp: 100, enemyHp: 100, roundWins: 0, over: false, enemyCooldown: 0, score: 0, playerState: 'idle', enemyState: 'idle', playerStateUntil: 0, enemyStateUntil: 0, playerAttackHit: false, enemyAttackHit: false, difficulty: 1 };
    },
    updateMortalKonfig(dt) {
      const g = this.arcade.games.mortalKonfig; if (!g || g.over) return;
      const now = performance.now();
      const gravity = 900;
      const moveSpeed = 150 + g.roundWins * 6;
      const jumpStrength = 360;
      const applyPhysics = who => {
        g[`${who}Vy`] += gravity * dt;
        g[`${who}Y`] = Math.max(0, g[`${who}Y`] - g[`${who}Vy`] * dt);
        if (g[`${who}Y`] === 0) g[`${who}Vy`] = 0;
      };
      if (g.playerStateUntil && now > g.playerStateUntil) g.playerState = g.playerY > 0 ? 'jump' : 'idle';
      if (g.enemyStateUntil && now > g.enemyStateUntil) g.enemyState = g.enemyY > 0 ? 'jump' : 'idle';
      if (g.playerY === 0 && (this.arcade.keys['w'] || this.arcade.keys['arrowup'] || this.arcade.keys[' '])) {
        g.playerVy = jumpStrength; g.playerY = 1; g.playerState = 'jump'; this.arcade.keys['w']=this.arcade.keys['arrowup']=this.arcade.keys[' ']=false;
      }
      let moving = false;
      if (this.arcade.keys['arrowleft'] || this.arcade.keys['a']) { g.playerX = Math.max(70, g.playerX - moveSpeed * dt); moving = true; }
      if (this.arcade.keys['arrowright'] || this.arcade.keys['d']) { g.playerX = Math.min(570, g.playerX + moveSpeed * dt); moving = true; }
      if (moving && g.playerY === 0 && !g.playerState.startsWith('punch') && !g.playerState.startsWith('kick')) g.playerState = 'walk';
      if (!moving && g.playerY === 0 && !g.playerState.startsWith('punch') && !g.playerState.startsWith('kick')) g.playerState = 'idle';
      const tryPlayerAttack = (type) => {
        if (g.playerState.startsWith('punch') || g.playerState.startsWith('kick')) return;
        const range = type === 'jab' ? 86 : 102;
        const dmg = type === 'jab' ? 7 + Math.floor(Math.random()*4) : 11 + Math.floor(Math.random()*5);
        g.playerState = type === 'jab' ? 'punch' : 'kick'; g.playerStateUntil = now + (type === 'jab' ? 220 : 300); g.playerAttackHit = false;
        if (Math.abs(g.playerX - g.enemyX) < range && Math.abs(g.playerY - g.enemyY) < 42) { g.enemyHp -= dmg; g.playerAttackHit = true; }
      };
      if (this.arcade.keys['j']) { this.arcade.keys['j']=false; tryPlayerAttack('jab'); }
      if (this.arcade.keys['k']) { this.arcade.keys['k']=false; tryPlayerAttack('kick'); }
      const aiRange = 80 + g.roundWins * 4;
      g.enemyCooldown -= dt;
      if (g.enemyX > g.playerX + aiRange) { g.enemyX -= moveSpeed * (0.62 + g.roundWins*0.04) * dt; if (g.enemyY===0 && !g.enemyState.startsWith('punch') && !g.enemyState.startsWith('kick')) g.enemyState='walk'; }
      else if (g.enemyX < g.playerX - aiRange) { g.enemyX += moveSpeed * (0.62 + g.roundWins*0.04) * dt; if (g.enemyY===0 && !g.enemyState.startsWith('punch') && !g.enemyState.startsWith('kick')) g.enemyState='walk'; }
      else if (g.enemyY===0 && !g.enemyState.startsWith('punch') && !g.enemyState.startsWith('kick')) g.enemyState='idle';
      if (g.enemyY === 0 && g.enemyCooldown <= 0 && Math.random() < Math.min(0.22, 0.08 + g.roundWins * 0.03)) {
        g.enemyVy = jumpStrength * (0.92 + Math.random()*0.12); g.enemyY = 1; g.enemyState = 'jump';
      }
      if (g.enemyCooldown <= 0 && Math.abs(g.playerX - g.enemyX) < 102 && Math.abs(g.playerY - g.enemyY) < 46) {
        const heavy = Math.random() < Math.min(0.6, 0.28 + g.roundWins * 0.06);
        g.enemyState = heavy ? 'kick' : 'punch';
        g.enemyStateUntil = now + (heavy ? 310 : 220);
        const dmg = heavy ? 10 + Math.floor(Math.random()*5) + g.roundWins : 6 + Math.floor(Math.random()*4) + Math.floor(g.roundWins/2);
        g.playerHp -= dmg;
        g.enemyCooldown = Math.max(0.28, 0.8 - g.roundWins * 0.06);
      }
      applyPhysics('player'); applyPhysics('enemy');
      if (g.enemyHp <= 0) { g.roundWins += 1; g.score += 250 + g.roundWins * 100; g.enemyHp = 100 + Math.min(40, g.roundWins * 8); g.playerHp = Math.min(100, g.playerHp + 18); g.enemyX = 500; g.playerX = 140; g.enemyY = g.playerY = 0; g.enemyVy = g.playerVy = 0; g.enemyCooldown = 0.55; g.difficulty = 1 + g.roundWins; this.setArcadeScore('mortalKonfig', g.score); }
      if (g.playerHp <= 0) { g.playerHp = 0; g.over = true; this.setArcadeScore('mortalKonfig', g.score); }
    },
    renderFighter(ctx, x, groundY, color, state, yOffset) {
      const bob = state === 'walk' ? Math.sin(performance.now()*0.02) * 3 : 0;
      const y = groundY - yOffset;
      ctx.save();
      ctx.translate(x, y + bob);
      ctx.fillStyle = color;
      ctx.fillRect(-14, -56, 28, 42);
      ctx.fillRect(-10, -80, 20, 22);
      // legs
      const legSpread = state === 'walk' ? 8 : 4;
      ctx.fillRect(-11, -14, 8, 28);
      ctx.fillRect(3, -14, 8, 28);
      // arms based on state
      if (state === 'punch') { ctx.fillRect(14, -48, 20, 6); ctx.fillRect(-24, -44, 10, 6); }
      else if (state === 'kick') { ctx.fillRect(14, -44, 18, 6); ctx.fillRect(-24, -44, 10, 6); ctx.fillRect(8, 0, 22, 6); }
      else if (state === 'jump') { ctx.fillRect(14, -48, 12, 6); ctx.fillRect(-26, -48, 12, 6); }
      else { ctx.fillRect(14, -42, 12, 6); ctx.fillRect(-26, -42, 12, 6); }
      ctx.restore();
    },
    renderMortalKonfig() {
      this.els.arcadeCanvas.classList.remove('hidden');
      this.els.arcadeDomGame.classList.add('hidden');
      const ctx = this.els.arcadeCanvas.getContext('2d');
      const g = this.arcade.games.mortalKonfig;
      this.drawArcadeFrameBase(ctx, 'Mortal Konfig', 'A/D move • W jump • J punch • K kick');
      const sky = ctx.createLinearGradient(0, 56, 0, 334); sky.addColorStop(0, '#120e22'); sky.addColorStop(1, '#2b2348');
      ctx.fillStyle = sky; ctx.fillRect(0, 56, 640, 278);
      ctx.fillStyle = '#132435'; ctx.fillRect(0, 300, 640, 60); ctx.fillStyle = '#2a4258'; ctx.fillRect(0, 260, 640, 8);
      ctx.fillStyle = '#ff7d98'; ctx.fillRect(20, 18, Math.max(0, g.playerHp) * 2.2, 14); ctx.fillStyle = '#7adfff'; ctx.fillRect(640 - 20 - Math.max(0, g.enemyHp) * 2.2, 18, Math.max(0, g.enemyHp) * 2.2, 14);
      ctx.fillStyle = '#fff0cb'; ctx.font = '12px monospace'; ctx.fillText(`Wins ${g.roundWins}  Score ${g.score}  AI ${g.difficulty}`, 220, 30);
      this.renderFighter(ctx, g.playerX, 274, '#ffd17f', g.playerState, g.playerY);
      this.renderFighter(ctx, g.enemyX, 274, '#ff8dc0', g.enemyState, g.enemyY);
      if (g.over) { ctx.fillStyle = 'rgba(3,6,10,0.78)'; ctx.fillRect(164, 118, 320, 90); ctx.fillStyle = '#fff0cb'; ctx.font = 'bold 24px monospace'; ctx.fillText('FATAL MISCONFIG.', 204, 156); ctx.font = '13px monospace'; ctx.fillStyle = '#b5e8ff'; ctx.fillText('Close with the white X to return to the cabinet menu.', 178, 182); }
      if (this.arcade.gamePaused && !g.over) this.drawArcadePauseOverlay(ctx);
    },

    // v3.105 arcade rebuild: later object keys intentionally replace the older
    // prototypes above while leaving the surrounding office systems untouched.
    initArcade() {
      const storedScores = (() => {
        try { return JSON.parse(window.localStorage.getItem('uptime_empire_arcade_scores_v1') || '{}') || {}; } catch (_e) { return {}; }
      })();
      const catalog = [
        { id: 'bombmopper', title: 'Bombmopper', badge: 'BM', cabinet: '01', genre: 'GRID SWEEP', difficulty: 'TACTICAL', controls: 'Click reveal, F flag mode, right-click flag', accent: '#45f7ff', accentSoft: 'rgba(69,247,255,0.18)', desc: 'Sweep a volatile server floor. First click is safe, flags matter, chain clears pay out.' },
        { id: 'stackOverflow', title: 'Stack Overflow', badge: 'SO', cabinet: '02', genre: 'KLONDIKE', difficulty: 'PATIENT', controls: 'Draw, click cards, Auto, Undo, Hint', accent: '#ff4fd8', accentSoft: 'rgba(255,79,216,0.17)', desc: 'A full click-to-move Klondike table dressed like a late-night terminal panic.' },
        { id: 'circuitBreaker', title: 'Circuit Breaker', badge: 'CB', cabinet: '03', genre: 'LANE RUNNER', difficulty: 'FAST', controls: 'A/D or arrows steer, R restarts', accent: '#7dff68', accentSoft: 'rgba(125,255,104,0.16)', desc: 'Dodge bad packets, grab shields, and keep the uptime car alive through five sectors.' },
        { id: 'ctrlAltDefeat', title: 'Ctrl+Alt+Defeat', badge: 'CAD', cabinet: '04', genre: 'SYSADMIN RPG', difficulty: 'BOSS RUSH', controls: 'A attack, P patch, O overclock, F firewall', accent: '#ffd34d', accentSoft: 'rgba(255,211,77,0.18)', desc: 'A compact turn-based run with five escalating incidents and a final root-cause duel.' },
        { id: 'mortalKonfig', title: 'Mortal Konfig', badge: 'MK', cabinet: '05', genre: 'PIXEL FIGHTER', difficulty: 'ARCADE', controls: 'A/D move, W jump, J punch, K kick, L block', accent: '#ff5a6d', accentSoft: 'rgba(255,90,109,0.18)', desc: 'Best-of-three config combat with jumping, blocking, hit windows, and a pushy AI.' }
      ];
      this.arcade = {
        overlayOpen: false,
        holdView: false,
        currentGameId: null,
        cabinetMenuIndex: 0,
        gamePaused: false,
        lastTs: this.arcadePerfNow(),
        keys: {},
        selectedSolitaire: null,
        solitaireUndo: [],
        solitaireHintMove: null,
        solitaireHintUntil: 0,
        confirmAction: null,
        games: {
          bombmopper: null,
          stackOverflow: null,
          circuitBreaker: null,
          ctrlAltDefeat: null,
          mortalKonfig: null
        },
        scores: storedScores,
        catalog
      };
    },

    arcadePerfNow() {
      return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    },

    arcadeGameDef(id) {
      return (this.arcade?.catalog || []).find(game => game.id === id) || null;
    },

    arcadeEscape(value) {
      return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
    },

    shuffleArcadeList(list) {
      const output = list.slice();
      for (let i = output.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [output[i], output[j]] = [output[j], output[i]];
      }
      return output;
    },

    renderArcadeMenu() {
      if (!this.arcade || !this.els.arcadeMenuScreen || !this.els.arcadeGameScreen) return;
      this.arcade.currentGameId = null;
      this.arcade.gamePaused = false;
      this.hideArcadeInlineConfirm();
      if (this.arcade.overlayOpen) {
        this.arcade.cabinetMenuIndex = Math.max(0, Math.min(this.arcade.catalog.length - 1, this.arcade.cabinetMenuIndex || 0));
        this.office3D?.setArcadeScreenState({ mode: 'menu', title: 'UPTIME ARCADE' });
        if (this.els.arcadeOverlay) this.els.arcadeOverlay.classList.add('hidden');
        return;
      }
      this.els.arcadeGameScreen.classList.add('hidden');
      this.els.arcadeMenuScreen.classList.remove('hidden');
      this.office3D?.setArcadeScreenState({ mode: 'menu', title: 'UPTIME ARCADE' });
      const brand = this.els.arcadeOverlay?.querySelector('.arcade-overlay-brand');
      if (brand) brand.textContent = 'UPTIME ARCADE // NEON SERVICE DECK';
      const totalHi = this.arcade.catalog.reduce((sum, game) => sum + this.getArcadeScore(game.id), 0);
      const cards = this.arcade.catalog.map(game => {
        const score = this.getArcadeScore(game.id);
        return `
          <article class="arcade-game-card arcade-pixel-card" style="--game-accent:${game.accent};--game-accent-soft:${game.accentSoft};">
            <div class="arcade-card-top">
              <span class="arcade-card-badge">${game.badge}</span>
              <span class="arcade-cabinet-slot">CAB-${game.cabinet}</span>
            </div>
            <h4>${game.title}</h4>
            <div class="arcade-roster">${game.genre} // ${game.difficulty}</div>
            <p>${game.desc}</p>
            <div class="arcade-card-controls">
              <span class="arcade-hiscore">HI ${score}</span>
              <button class="arcade-pixel-btn" type="button" data-arcade-play="${game.id}">PLAY</button>
            </div>
          </article>`;
      }).join('');
      this.els.arcadeMenuScreen.innerHTML = `
        <div class="arcade-crt-menu">
          <div class="arcade-menu-marquee">
            <div>
              <div class="arcade-marquee-kicker">INSERT COIN // PRESS E AT CABINET</div>
              <div class="arcade-marquee-title">UPTIME ARCADE</div>
            </div>
            <div class="arcade-marquee-score">TOTAL HI ${totalHi}</div>
            <button class="arcade-pixel-btn secondary" type="button" id="arcadeLeaveBtn">EXIT</button>
          </div>
          <div class="arcade-menu-grid">${cards}</div>
          <div class="arcade-menu-footer">
            <span>5 MACHINES ONLINE</span>
            <span>CRT MODE ACTIVE</span>
            <span>HIGH SCORES SAVED LOCALLY</span>
          </div>
        </div>`;
      this.els.arcadeMenuScreen.querySelectorAll('[data-arcade-play]').forEach(btn => btn.addEventListener('click', () => this.openArcadeGame(btn.dataset.arcadePlay)));
      const leaveBtn = this.els.arcadeMenuScreen.querySelector('#arcadeLeaveBtn');
      if (leaveBtn) leaveBtn.addEventListener('click', () => this.leaveArcade(false));
    },

    openArcadeGame(id, resume = false) {
      if (!this.arcade || !this.els.arcadeMenuScreen || !this.els.arcadeGameScreen) return;
      const gameDef = this.arcadeGameDef(id);
      if (!gameDef) return;
      this.arcade.overlayOpen = true;
      this.arcade.holdView = true;
      this.arcade.currentGameId = id;
      this.hideArcadeInlineConfirm();
      if (this.arcade.overlayOpen) {
        if (!resume || !this.arcade.games[id]) this.createArcadeGame(id);
        this.arcade.gamePaused = false;
        this.arcade.lastTs = this.arcadePerfNow();
        this.office3D?.setArcadeScreenState({ mode: 'game', title: gameDef.title });
        if (this.els.arcadeOverlay) this.els.arcadeOverlay.classList.add('hidden');
        return;
      }
      this.els.arcadeMenuScreen.classList.add('hidden');
      this.els.arcadeGameScreen.classList.remove('hidden');
      this.office3D?.setArcadeScreenState({ mode: 'game', title: gameDef.title });
      const brand = this.els.arcadeOverlay?.querySelector('.arcade-overlay-brand');
      if (brand) brand.textContent = `UPTIME ARCADE // ${gameDef.title.toUpperCase()}`;
      this.els.arcadeGameScreen.innerHTML = `
        <div class="arcade-game-cabinet" style="--game-accent:${gameDef.accent};--game-accent-soft:${gameDef.accentSoft};">
          <div class="arcade-screen-controls arcade-game-hud">
            <button class="arcade-pixel-btn secondary" type="button" id="arcadeBackToMenuBtn">MENU</button>
            <div class="arcade-game-titleplate">
              <span class="arcade-card-badge">${gameDef.badge}</span>
              <div>
                <strong>${gameDef.title}</strong>
                <span>${gameDef.controls}</span>
              </div>
            </div>
            <div class="arcade-game-stat">HI ${this.getArcadeScore(id)}</div>
            <button class="arcade-pixel-btn" type="button" id="arcadeRestartBtn">RESTART</button>
          </div>
          <div class="arcade-crt-viewport">
            <canvas id="arcadeCanvas" width="640" height="360"></canvas>
            <div class="arcade-dom-game hidden" id="arcadeDomGame"></div>
          </div>
        </div>`;
      this.els.arcadeCanvas = document.getElementById('arcadeCanvas');
      this.els.arcadeDomGame = document.getElementById('arcadeDomGame');
      if (!resume || !this.arcade.games[id]) this.createArcadeGame(id);
      this.arcade.gamePaused = !!resume;
      this.arcade.lastTs = this.arcadePerfNow();
      const backBtn = this.els.arcadeGameScreen.querySelector('#arcadeBackToMenuBtn');
      const restartBtn = this.els.arcadeGameScreen.querySelector('#arcadeRestartBtn');
      if (backBtn) backBtn.addEventListener('click', () => this.renderArcadeMenu());
      if (restartBtn) restartBtn.addEventListener('click', () => this.restartArcadeGame(id));
      this.bindArcadeDomGame(id);
      this.renderCurrentArcadeFrame(true);
    },

    bindArcadeDomGame(id) {
      if (!this.els.arcadeDomGame) return;
      if (id === 'bombmopper') {
        this.els.arcadeDomGame.addEventListener('click', e => {
          const action = e.target.closest('[data-bomb-action]');
          if (action) {
            if (action.dataset.bombAction === 'restart') this.restartArcadeGame('bombmopper');
            if (action.dataset.bombAction === 'mode') {
              const game = this.arcade.games.bombmopper;
              game.mode = game.mode === 'flag' ? 'reveal' : 'flag';
              this.renderBombmopper();
            }
            return;
          }
          const cell = e.target.closest('[data-bomb-index]');
          if (!cell) return;
          this.onBombmopperCell(Number(cell.dataset.bombIndex), false);
        });
        this.els.arcadeDomGame.addEventListener('contextmenu', e => {
          const cell = e.target.closest('[data-bomb-index]');
          if (!cell) return;
          e.preventDefault();
          this.onBombmopperCell(Number(cell.dataset.bombIndex), true);
        });
      }
      if (id === 'stackOverflow') {
        this.els.arcadeDomGame.addEventListener('click', e => {
          const action = e.target.closest('[data-sol-action]');
          if (!action) return;
          this.handleSolitaireAction(action.dataset.solAction, action.dataset.solPile, Number(action.dataset.solIndex || 0));
        });
        this.els.arcadeDomGame.addEventListener('dblclick', e => {
          const card = e.target.closest('[data-sol-source]');
          if (!card) return;
          this.trySolitaireAutoFoundation(card.dataset.solSource, card.dataset.solPile, Number(card.dataset.solIndex || 0));
        });
      }
      if (id === 'ctrlAltDefeat') {
        this.els.arcadeDomGame.addEventListener('click', e => {
          const action = e.target.closest('[data-rpg-action]');
          if (!action) return;
          if (action.dataset.rpgAction === 'restart') this.restartArcadeGame('ctrlAltDefeat');
          else this.handleRpgAction(action.dataset.rpgAction);
        });
      }
    },

    createArcadeGame(id, carryScore = 0, round = 1) {
      if (!this.arcade) return null;
      let game = null;
      if (id === 'bombmopper') game = this.createBombmopperGame(carryScore, round);
      if (id === 'stackOverflow') {
        game = this.createSolitaireGame(carryScore, round);
        this.arcade.solitaireUndo = [];
        this.arcade.selectedSolitaire = null;
        this.arcade.solitaireHintMove = null;
        this.arcade.solitaireHintUntil = 0;
      }
      if (id === 'circuitBreaker') game = this.createCircuitBreakerGame(carryScore, round);
      if (id === 'ctrlAltDefeat') game = this.createCtrlAltDefeatGame(carryScore, round);
      if (id === 'mortalKonfig') game = this.createMortalKonfigGame(carryScore, round);
      if (game) this.arcade.games[id] = game;
      return game;
    },

    restartArcadeGame(id = this.arcade?.currentGameId) {
      if (!id || !this.arcade) return;
      const prior = this.arcade.games[id];
      const carryScore = prior?.won ? Number(prior.score || 0) : 0;
      const round = prior?.won
        ? (id === 'bombmopper' || id === 'stackOverflow'
          ? Number(prior.round || 1) + 1
          : Number(prior.nextRound || 1))
        : 1;
      this.createArcadeGame(id, carryScore, round);
      this.arcade.gamePaused = false;
      this.arcade.keys = {};
      this.arcade.lastTs = this.arcadePerfNow();
      this.arcade.lastAdvanceAt = 0;
      const title = this.arcadeGameDef(id)?.title || id;
      this.office3D?.setArcadeScreenState({ mode: 'game', title });
      this.renderCurrentArcadeFrame(true);
    },

    updateArcade(now) {
      if (!this.arcade || !this.arcade.currentGameId || !this.arcade.overlayOpen || this.arcade.gamePaused) return;
      const dt = Math.min(0.05, (now - this.arcade.lastTs) / 1000 || 0.016);
      this.arcade.lastTs = now;
      const id = this.arcade.currentGameId;
      if (id === 'bombmopper') {
        const game = this.arcade.games.bombmopper;
        this.updateBombmopper(dt);
        if (game && !game.over && game.armed) {
          game.renderPulse = (game.renderPulse || 0) + dt;
          if (game.renderPulse > 0.25) {
            game.renderPulse = 0;
            this.renderBombmopper();
          }
        }
      }
      if (id === 'circuitBreaker') { this.updateCircuitBreaker(dt); this.renderCircuitBreaker(); }
      if (id === 'mortalKonfig') { this.updateMortalKonfig(dt); this.renderMortalKonfig(); }
    },

    renderCurrentArcadeFrame(force = false) {
      if (!this.arcade || !this.arcade.currentGameId) return;
      const id = this.arcade.currentGameId;
      if (id === 'bombmopper') this.renderBombmopper();
      if (id === 'stackOverflow') this.renderSolitaire();
      if (id === 'circuitBreaker') this.renderCircuitBreaker();
      if (id === 'ctrlAltDefeat') this.renderCtrlAltDefeat();
      if (id === 'mortalKonfig') this.renderMortalKonfig();
    },

    handleArcadeKeyDown(e) {
      if (!this.arcade || !this.arcade.overlayOpen || !this.arcade.currentGameId) return;
      const key = e.key.toLowerCase();
      const activeGame = this.arcade.currentGameId;
      if (key === 'p' && (activeGame === 'circuitBreaker' || activeGame === 'mortalKonfig')) {
        e.preventDefault();
        this.arcade.gamePaused = !this.arcade.gamePaused;
        this.arcade.keys.p = false;
        this.arcade.lastTs = this.arcadePerfNow();
        this.arcade.lastAdvanceAt = 0;
        return;
      }
      this.arcade.keys[key] = true;
      if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' ', 'a', 'd', 'w', 'j', 'k', 'l', 'f', 'p', 'o', 'r', 'h', 'u', 'n'].includes(key)) e.preventDefault();
      if (this.arcade.gamePaused) this.arcade.gamePaused = false;
      const id = activeGame;
      if (key === 'r') { this.restartArcadeGame(id); return; }
      if (id === 'bombmopper' && key === 'f') {
        const game = this.arcade.games.bombmopper;
        if (game) game.mode = game.mode === 'flag' ? 'reveal' : 'flag';
        this.renderBombmopper();
      }
      if (id === 'stackOverflow') {
        if (key === 'n') this.restartArcadeGame('stackOverflow');
        if (key === 'u') this.handleSolitaireAction('undo');
        if (key === 'h') this.handleSolitaireAction('hint');
      }
      if (id === 'ctrlAltDefeat') {
        if (key === 'a') this.handleRpgAction('attack');
        if (key === 'p') this.handleRpgAction('patch');
        if (key === 'o') this.handleRpgAction('overclock');
        if (key === 'f') this.handleRpgAction('firewall');
      }
    },

    handleArcadeKeyUp(e) {
      if (!this.arcade) return;
      this.arcade.keys[e.key.toLowerCase()] = false;
    },

    drawArcadeFrameBase(ctx, title, subtitle) {
      if (!ctx || !this.els.arcadeCanvas) return;
      const canvas = this.els.arcadeCanvas;
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#03040b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const accent = this.arcadeGameDef(this.arcade?.currentGameId)?.accent || '#45f7ff';
      ctx.strokeStyle = accent;
      ctx.lineWidth = 3;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      for (let y = 42; y < canvas.height - 14; y += 8) {
        ctx.beginPath();
        ctx.moveTo(14, y);
        ctx.lineTo(canvas.width - 14, y);
        ctx.stroke();
      }
      ctx.fillStyle = '#f7fbff';
      ctx.font = 'bold 18px "Courier New", monospace';
      ctx.fillText(title.toUpperCase(), 24, 32);
      ctx.fillStyle = accent;
      ctx.font = '11px "Courier New", monospace';
      ctx.fillText(subtitle.toUpperCase(), 24, 50);
    },

    drawArcadePauseOverlay(ctx) {
      ctx.fillStyle = 'rgba(0,0,0,0.64)';
      ctx.fillRect(0, 0, 640, 360);
      ctx.fillStyle = '#f9fbff';
      ctx.font = 'bold 24px "Courier New", monospace';
      ctx.fillText('PAUSED', 270, 176);
      ctx.font = '12px "Courier New", monospace';
      ctx.fillText('PRESS ANY GAME KEY TO RESUME', 220, 202);
    },

    createBombmopperGame(carryScore = 0, round = 1) {
      const size = 10;
      const bombs = 16;
      return {
        size,
        bombs,
        cells: Array.from({ length: size * size }, (_, index) => ({ index, mine: false, adj: 0, revealed: false, flagged: false })),
        armed: false,
        mode: 'reveal',
        elapsed: 0,
        score: carryScore,
        carryScore,
        round,
        over: false,
        won: false,
        message: carryScore ? `Shift ${round}. Keep the run alive.` : 'First click is safe. Clear every non-bomb tile.',
        renderPulse: 0
      };
    },

    getBombNeighbors(game, index) {
      const x = index % game.size;
      const y = Math.floor(index / game.size);
      const neighbors = [];
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (!dx && !dy) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < game.size && ny >= 0 && ny < game.size) neighbors.push(ny * game.size + nx);
        }
      }
      return neighbors;
    },

    armBombmopper(game, safeIndex) {
      const protectedCells = new Set([safeIndex, ...this.getBombNeighbors(game, safeIndex)]);
      const candidates = game.cells.map(cell => cell.index).filter(index => !protectedCells.has(index));
      this.shuffleArcadeList(candidates).slice(0, game.bombs).forEach(index => { game.cells[index].mine = true; });
      game.cells.forEach(cell => {
        cell.adj = this.getBombNeighbors(game, cell.index).filter(neighbor => game.cells[neighbor].mine).length;
      });
      game.armed = true;
    },

    revealBombCell(game, index) {
      const cell = game.cells[index];
      if (!cell || cell.revealed || cell.flagged) return 0;
      cell.revealed = true;
      let changed = 1;
      if (!cell.mine && cell.adj === 0) {
        this.getBombNeighbors(game, index).forEach(neighbor => { changed += this.revealBombCell(game, neighbor); });
      }
      return changed;
    },

    refreshBombmopperScore(game) {
      const revealed = game.cells.filter(cell => cell.revealed && !cell.mine).length;
      const correctFlags = game.cells.filter(cell => cell.flagged && cell.mine).length;
      const timePenalty = Math.floor(game.elapsed * 0.7);
      const winBonus = game.won ? 900 + Math.max(0, 240 - Math.floor(game.elapsed)) * 3 : 0;
      game.score = game.carryScore + Math.max(0, revealed * 18 + correctFlags * 12 + winBonus - timePenalty);
      return game.score;
    },

    onBombmopperCell(index, forceFlag = false) {
      const game = this.arcade?.games?.bombmopper;
      if (!game || game.over || game.won || !game.cells[index]) return;
      this.arcade.gamePaused = false;
      const cell = game.cells[index];
      if (forceFlag || game.mode === 'flag') {
        if (!cell.revealed) cell.flagged = !cell.flagged;
        game.message = cell.flagged ? 'Flag planted.' : 'Flag removed.';
        this.refreshBombmopperScore(game);
        this.renderBombmopper();
        return;
      }
      if (!game.armed) this.armBombmopper(game, index);
      if (cell.flagged) return;
      if (cell.mine) {
        cell.revealed = true;
        game.cells.forEach(other => { if (other.mine) other.revealed = true; });
        game.over = true;
        game.message = 'Bomb hit. Board locked.';
        this.refreshBombmopperScore(game);
        this.setArcadeScore('bombmopper', game.score);
        this.renderBombmopper();
        return;
      }
      this.revealBombCell(game, index);
      const safeCells = game.cells.length - game.bombs;
      const revealedSafe = game.cells.filter(other => other.revealed && !other.mine).length;
      if (revealedSafe >= safeCells) {
        game.won = true;
        game.over = true;
        game.cells.forEach(other => { if (other.mine) other.flagged = true; });
        game.message = 'Board cleared. Perfect uptime.';
      } else {
        game.message = cell.adj ? `${cell.adj} hazard signals nearby.` : 'Clean chain opened.';
      }
      this.refreshBombmopperScore(game);
      if (game.over) this.setArcadeScore('bombmopper', game.score);
      this.renderBombmopper();
    },

    updateBombmopper(dt) {
      const game = this.arcade?.games?.bombmopper;
      if (!game || game.over || !game.armed) return;
      game.elapsed += dt;
      this.refreshBombmopperScore(game);
    },

    renderBombmopper() {
      if (!this.els.arcadeCanvas || !this.els.arcadeDomGame) return;
      this.els.arcadeCanvas.classList.add('hidden');
      this.els.arcadeDomGame.classList.remove('hidden');
      const game = this.arcade.games.bombmopper;
      const flags = game.cells.filter(cell => cell.flagged).length;
      const grid = game.cells.map(cell => {
        let label = '';
        let cls = 'arcade-bomb-cell';
        if (cell.revealed) {
          cls += ' revealed';
          if (cell.mine) { cls += ' mine'; label = '*'; }
          else if (cell.adj) label = String(cell.adj);
        } else if (cell.flagged) {
          cls += ' flagged';
          label = 'F';
        }
        return `<button class="${cls}" type="button" data-bomb-index="${cell.index}" aria-label="Tile ${cell.index}">${label}</button>`;
      }).join('');
      const overlay = game.over ? `
        <div class="arcade-result-overlay">
          <div class="arcade-result-card pixel-result">
            <h4>${game.won ? 'BOARD CLEAR' : 'RUN CRASHED'}</h4>
            <p>${game.message}</p>
            <button class="arcade-pixel-btn" type="button" data-bomb-action="restart">NEW BOARD</button>
          </div>
        </div>` : '';
      this.els.arcadeDomGame.innerHTML = `
        <div class="arcade-mini-shell bomb-shell">
          <div class="arcade-mini-hud">
            <span>SCORE ${Math.floor(game.score)}</span>
            <span>HI ${this.getArcadeScore('bombmopper')}</span>
            <span>BOMBS ${Math.max(0, game.bombs - flags)}</span>
            <span>TIME ${Math.floor(game.elapsed)}s</span>
            <button class="arcade-pixel-btn tiny ${game.mode === 'flag' ? 'active' : ''}" type="button" data-bomb-action="mode">${game.mode === 'flag' ? 'FLAG ON' : 'REVEAL'}</button>
          </div>
          <div class="arcade-status-line">${this.arcadeEscape(game.message)}</div>
          <div class="arcade-bomb-wrap">
            <div class="arcade-bomb-grid">${grid}</div>
            ${overlay}
          </div>
        </div>`;
    },

    makeDeck() {
      const suits = ['H', 'D', 'C', 'S'];
      const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
      return suits.flatMap(suit => ranks.map((rank, index) => ({
        suit,
        rank,
        value: index + 1,
        color: suit === 'H' || suit === 'D' ? 'red' : 'black',
        faceUp: false,
        id: `${suit}${rank}`
      })));
    },

    createSolitaireGame(carryScore = 0, round = 1) {
      const deck = this.shuffleArcadeList(this.makeDeck());
      const tableau = Array.from({ length: 7 }, () => []);
      for (let pile = 0; pile < 7; pile += 1) {
        for (let slot = 0; slot <= pile; slot += 1) {
          const card = deck.pop();
          card.faceUp = slot === pile;
          tableau[pile].push(card);
        }
      }
      return {
        stock: deck,
        waste: [],
        foundations: { H: [], D: [], C: [], S: [] },
        tableau,
        moves: 0,
        score: carryScore,
        round,
        won: false,
        message: carryScore ? `Deal ${round}. Keep building the run.` : 'Build foundations from A to K. Empty lanes take kings.'
      };
    },

    snapshotSolitaire(game) {
      return JSON.parse(JSON.stringify(game));
    },

    pushSolitaireUndo(game) {
      this.arcade.solitaireUndo = this.arcade.solitaireUndo || [];
      this.arcade.solitaireUndo.push(this.snapshotSolitaire(game));
      if (this.arcade.solitaireUndo.length > 80) this.arcade.solitaireUndo.shift();
    },

    undoSolitaire() {
      const stack = this.arcade?.solitaireUndo || [];
      if (!stack.length) return false;
      this.arcade.games.stackOverflow = stack.pop();
      this.arcade.selectedSolitaire = null;
      this.arcade.solitaireHintMove = null;
      this.arcade.solitaireHintUntil = 0;
      this.renderSolitaire();
      return true;
    },

    cardColor(card) {
      return card?.color === 'red' ? 'red' : 'black';
    },

    canPlaceOnFoundation(card, foundation) {
      if (!card) return false;
      const top = foundation[foundation.length - 1];
      return top ? card.suit === top.suit && card.value === top.value + 1 : card.value === 1;
    },

    canPlaceOnTableau(card, targetCard) {
      if (!card) return false;
      if (!targetCard) return card.value === 13;
      return targetCard.faceUp && card.color !== targetCard.color && card.value === targetCard.value - 1;
    },

    getSolitaireSelection(game) {
      const selected = this.arcade?.selectedSolitaire;
      if (!selected) return null;
      if (selected.source === 'waste') {
        const card = game.waste[game.waste.length - 1];
        return card ? { source: 'waste', cards: [card] } : null;
      }
      if (selected.source === 'tableau') {
        const pile = game.tableau[selected.pile] || [];
        const cards = pile.slice(selected.index);
        if (!cards.length || !cards[0].faceUp) return null;
        return { source: 'tableau', pile: selected.pile, index: selected.index, cards };
      }
      return null;
    },

    removeSolitaireSelection(game, selection) {
      if (selection.source === 'waste') game.waste.pop();
      if (selection.source === 'tableau') game.tableau[selection.pile].splice(selection.index);
    },

    revealSolitaireTops(game) {
      let flipped = 0;
      game.tableau.forEach(pile => {
        const top = pile[pile.length - 1];
        if (top && !top.faceUp) {
          top.faceUp = true;
          flipped += 1;
        }
      });
      return flipped;
    },

    afterSolitaireMove(game, points, message) {
      const flips = this.revealSolitaireTops(game);
      game.moves += 1;
      game.score = Math.max(0, game.score + points + flips * 5);
      game.message = message || 'Move accepted.';
      this.arcade.selectedSolitaire = null;
      this.arcade.solitaireHintMove = null;
      this.arcade.solitaireHintUntil = 0;
      const foundationCount = Object.values(game.foundations).reduce((sum, pile) => sum + pile.length, 0);
      if (foundationCount === 52) {
        game.won = true;
        game.score += 1200;
        game.message = 'Deck cleared. Overflow contained.';
        this.setArcadeScore('stackOverflow', game.score);
      }
    },

    tryMoveSolitaireToFoundation(targetSuit = null) {
      const game = this.arcade.games.stackOverflow;
      const selection = this.getSolitaireSelection(game);
      if (!selection || selection.cards.length !== 1) return false;
      const card = selection.cards[0];
      const suit = targetSuit || card.suit;
      if (suit !== card.suit || !this.canPlaceOnFoundation(card, game.foundations[card.suit])) {
        game.message = 'That card cannot dock there yet.';
        return false;
      }
      this.pushSolitaireUndo(game);
      this.removeSolitaireSelection(game, selection);
      card.faceUp = true;
      game.foundations[card.suit].push(card);
      this.afterSolitaireMove(game, 25, `${card.rank}${card.suit} sent to foundation.`);
      return true;
    },

    tryMoveSolitaireToTableau(targetPileIndex) {
      const game = this.arcade.games.stackOverflow;
      const targetPile = game.tableau[targetPileIndex];
      const selection = this.getSolitaireSelection(game);
      if (!selection || !targetPile) return false;
      if (selection.source === 'tableau' && selection.pile === targetPileIndex) return false;
      const targetCard = targetPile[targetPile.length - 1] || null;
      if (!this.canPlaceOnTableau(selection.cards[0], targetCard)) {
        game.message = targetCard ? 'Need alternating color and descending rank.' : 'Only kings can open an empty lane.';
        return false;
      }
      this.pushSolitaireUndo(game);
      this.removeSolitaireSelection(game, selection);
      targetPile.push(...selection.cards);
      this.afterSolitaireMove(game, 12, `Moved ${selection.cards.length} card${selection.cards.length === 1 ? '' : 's'}.`);
      return true;
    },

    trySolitaireAutoFoundation(source, pile, index) {
      if (source === 'waste') this.arcade.selectedSolitaire = { source: 'waste' };
      if (source === 'tableau') this.arcade.selectedSolitaire = { source: 'tableau', pile: Number(pile), index: Number(index) };
      const moved = this.tryMoveSolitaireToFoundation();
      this.renderSolitaire();
      return moved;
    },

    findSolitaireAutoMove(game) {
      const waste = game.waste[game.waste.length - 1];
      if (waste && this.canPlaceOnFoundation(waste, game.foundations[waste.suit])) return { source: 'waste' };
      for (let pile = 0; pile < game.tableau.length; pile += 1) {
        const cards = game.tableau[pile];
        const top = cards[cards.length - 1];
        if (top && top.faceUp && this.canPlaceOnFoundation(top, game.foundations[top.suit])) return { source: 'tableau', pile, index: cards.length - 1 };
      }
      return null;
    },

    handleSolitaireAuto() {
      const game = this.arcade.games.stackOverflow;
      let moved = 0;
      for (let guard = 0; guard < 52; guard += 1) {
        const move = this.findSolitaireAutoMove(game);
        if (!move) break;
        this.arcade.selectedSolitaire = move.source === 'waste' ? { source: 'waste' } : { source: 'tableau', pile: move.pile, index: move.index };
        if (!this.tryMoveSolitaireToFoundation()) break;
        moved += 1;
      }
      game.message = moved ? `Auto-stacked ${moved} card${moved === 1 ? '' : 's'}.` : 'No safe foundation move found.';
      this.renderSolitaire();
    },

    findSolitaireHint(game) {
      const auto = this.findSolitaireAutoMove(game);
      if (auto) return { ...auto, to: 'foundation', text: 'A top card can move to a foundation.' };
      const waste = game.waste[game.waste.length - 1];
      if (waste) {
        for (let pile = 0; pile < game.tableau.length; pile += 1) {
          const target = game.tableau[pile][game.tableau[pile].length - 1] || null;
          if (this.canPlaceOnTableau(waste, target)) return { source: 'waste', to: 'tableau', target: pile, text: `Move ${waste.rank}${waste.suit} to lane ${pile + 1}.` };
        }
      }
      for (let from = 0; from < game.tableau.length; from += 1) {
        for (let index = 0; index < game.tableau[from].length; index += 1) {
          const card = game.tableau[from][index];
          if (!card.faceUp) continue;
          for (let targetPile = 0; targetPile < game.tableau.length; targetPile += 1) {
            if (from === targetPile) continue;
            const target = game.tableau[targetPile][game.tableau[targetPile].length - 1] || null;
            if (this.canPlaceOnTableau(card, target)) return { source: 'tableau', pile: from, index, to: 'tableau', target: targetPile, text: `Move ${card.rank}${card.suit} to lane ${targetPile + 1}.` };
          }
        }
      }
      if (game.stock.length) return { source: 'stock', to: 'waste', text: 'Draw from stock.' };
      return null;
    },

    handleSolitaireAction(action, pile = null, index = 0) {
      const game = this.arcade?.games?.stackOverflow;
      if (!game || game.won) return;
      this.arcade.gamePaused = false;
      if (action === 'new') { this.restartArcadeGame('stackOverflow'); return; }
      if (action === 'undo') { if (!this.undoSolitaire()) { game.message = 'No undo in buffer.'; this.renderSolitaire(); } return; }
      if (action === 'hint') {
        const hint = this.findSolitaireHint(game);
        this.arcade.solitaireHintMove = hint;
        this.arcade.solitaireHintUntil = this.arcadePerfNow() + 3000;
        game.score = Math.max(0, game.score - 5);
        game.message = hint ? hint.text : 'No obvious move. Cycle stock or reshuffle your plan.';
        this.renderSolitaire();
        return;
      }
      if (action === 'auto') { this.handleSolitaireAuto(); return; }
      if (action === 'draw') {
        this.pushSolitaireUndo(game);
        if (game.stock.length) {
          const card = game.stock.pop();
          card.faceUp = true;
          game.waste.push(card);
          this.afterSolitaireMove(game, 2, `Drew ${card.rank}${card.suit}.`);
        } else if (game.waste.length) {
          game.stock = game.waste.reverse().map(card => ({ ...card, faceUp: false }));
          game.waste = [];
          this.afterSolitaireMove(game, -15, 'Waste recycled into stock.');
        } else {
          game.message = 'Stock is empty.';
          this.arcade.solitaireUndo.pop();
        }
        this.renderSolitaire();
        return;
      }
      if (action === 'selectWaste') {
        if (!game.waste.length) return;
        this.arcade.selectedSolitaire = { source: 'waste' };
        const card = game.waste[game.waste.length - 1];
        game.message = `Selected ${card.rank}${card.suit}.`;
        this.renderSolitaire();
        return;
      }
      if (action === 'selectTableau') {
        const pileIndex = Number(pile);
        const cardIndex = Number(index);
        const cards = game.tableau[pileIndex] || [];
        const card = cards[cardIndex];
        if (!card || !card.faceUp) return;
        const selected = this.arcade.selectedSolitaire;
        if (selected && !(selected.source === 'tableau' && selected.pile === pileIndex)) {
          if (this.tryMoveSolitaireToTableau(pileIndex)) { this.renderSolitaire(); return; }
        }
        this.arcade.selectedSolitaire = { source: 'tableau', pile: pileIndex, index: cardIndex };
        game.message = `Selected ${card.rank}${card.suit}${cardIndex < cards.length - 1 ? ' stack' : ''}.`;
        this.renderSolitaire();
        return;
      }
      if (action === 'toFoundation') {
        this.tryMoveSolitaireToFoundation(pile);
        this.renderSolitaire();
        return;
      }
      if (action === 'toTableau') {
        this.tryMoveSolitaireToTableau(Number(pile));
        this.renderSolitaire();
      }
    },

    renderSolitaire() {
      if (!this.els.arcadeCanvas || !this.els.arcadeDomGame) return;
      this.els.arcadeCanvas.classList.add('hidden');
      this.els.arcadeDomGame.classList.remove('hidden');
      const game = this.arcade.games.stackOverflow;
      const selected = this.arcade.selectedSolitaire;
      const hint = this.arcade.solitaireHintMove && this.arcadePerfNow() < (this.arcade.solitaireHintUntil || 0) ? this.arcade.solitaireHintMove : null;
      const renderCard = (card, attrs = '', extra = '') => {
        if (!card.faceUp) return `<div class="arcade-card back ${extra}" ${attrs}><span>STACK</span></div>`;
        return `<div class="arcade-card ${this.cardColor(card)} ${extra}" ${attrs}><span class="arcade-card-corner">${card.rank}${card.suit}</span><span class="arcade-card-center">${card.suit}</span></div>`;
      };
      const foundations = ['H', 'D', 'C', 'S'].map(suit => {
        const top = game.foundations[suit][game.foundations[suit].length - 1];
        const hintClass = hint?.to === 'foundation' && (hint.source !== 'waste' || suit === game.waste[game.waste.length - 1]?.suit) ? 'arcade-hint-target' : '';
        return `<div class="arcade-foundation ${hintClass}" data-sol-action="toFoundation" data-sol-pile="${suit}">${top ? renderCard(top) : `<span>${suit}</span>`}</div>`;
      }).join('');
      const wasteTop = game.waste[game.waste.length - 1];
      const wasteSelected = selected?.source === 'waste' ? 'arcade-selected' : '';
      const wasteHint = hint?.source === 'waste' ? 'arcade-hint-source' : '';
      const waste = wasteTop ? renderCard(wasteTop, 'data-sol-action="selectWaste" data-sol-source="waste"', `${wasteSelected} ${wasteHint}`) : '<div class="arcade-empty-label">WASTE</div>';
      const tableau = game.tableau.map((pile, pileIndex) => {
        const pileHint = hint?.to === 'tableau' && hint.target === pileIndex ? 'arcade-hint-target' : '';
        const cards = pile.map((card, cardIndex) => {
          const isSelected = selected?.source === 'tableau' && selected.pile === pileIndex && selected.index === cardIndex;
          const isHint = hint?.source === 'tableau' && hint.pile === pileIndex && hint.index === cardIndex;
          const attrs = card.faceUp ? `data-sol-action="selectTableau" data-sol-source="tableau" data-sol-pile="${pileIndex}" data-sol-index="${cardIndex}"` : '';
          return renderCard(card, attrs, `${isSelected ? 'arcade-selected' : ''} ${isHint ? 'arcade-hint-source' : ''}`);
        }).join('');
        return `<div class="arcade-tableau ${pileHint}" data-sol-action="toTableau" data-sol-pile="${pileIndex}">${cards || '<div class="arcade-empty-label">KING</div>'}</div>`;
      }).join('');
      const overlay = game.won ? `
        <div class="arcade-result-overlay">
          <div class="arcade-result-card pixel-result">
            <h4>STACK CLEARED</h4>
            <p>${this.arcadeEscape(game.message)}</p>
            <button class="arcade-pixel-btn" type="button" data-sol-action="new">NEW DEAL</button>
          </div>
        </div>` : '';
      this.els.arcadeDomGame.innerHTML = `
        <div class="arcade-mini-shell pixel-solitaire">
          <div class="arcade-mini-hud">
            <span>SCORE ${game.score}</span>
            <span>MOVES ${game.moves}</span>
            <span>HI ${this.getArcadeScore('stackOverflow')}</span>
            <button class="arcade-pixel-btn tiny" type="button" data-sol-action="new">NEW</button>
            <button class="arcade-pixel-btn tiny" type="button" data-sol-action="undo">UNDO</button>
            <button class="arcade-pixel-btn tiny" type="button" data-sol-action="hint">HINT</button>
            <button class="arcade-pixel-btn tiny" type="button" data-sol-action="auto">AUTO</button>
          </div>
          <div class="arcade-status-line">${this.arcadeEscape(game.message)}</div>
          <div class="arcade-solitaire-board">
            <div class="arcade-solitaire-top">
              <div class="arcade-stock-waste">
                <div class="arcade-pile arcade-stock" data-sol-action="draw">${game.stock.length ? '<div class="arcade-card back"><span>DRAW</span></div>' : '<div class="arcade-empty-label">RESET</div>'}</div>
                <div class="arcade-pile arcade-waste">${waste}</div>
              </div>
              <div class="arcade-solitaire-foundations">${foundations}</div>
            </div>
            <div class="arcade-solitaire-layout">${tableau}</div>
            ${overlay}
          </div>
        </div>`;
    },

    createCircuitBreakerGame(carryScore = 0, loop = 1) {
      const difficulty = 1 + (loop - 1) * 0.13;
      return {
        lane: 1,
        lives: 4,
        sector: 0,
        loop,
        difficulty,
        nextRound: loop + 1,
        sectors: [
          { name: 'BOOT', goal: 850, speed: 145, spawn: 0.92, bg: '#102142' },
          { name: 'CACHE', goal: 1050, speed: 170, spawn: 0.80, bg: '#1c214f' },
          { name: 'PATCH', goal: 1260, speed: 195, spawn: 0.70, bg: '#142e35' },
          { name: 'FAILOVER', goal: 1510, speed: 220, spawn: 0.62, bg: '#30213b' },
          { name: 'UPTIME', goal: 1800, speed: 245, spawn: 0.56, bg: '#17311f' }
        ],
        distance: 0,
        totalDistance: 0,
        score: carryScore,
        carryScore,
        sessionTime: 0,
        sessionDuration: 30,
        spawnTimer: 0.4,
        pickupTimer: 1.8,
        obstacles: [],
        pickups: [],
        shield: 0,
        boost: 0,
        invuln: 0,
        screenShake: 0,
        damageFlash: 0,
        sectorFlash: 0,
        over: false,
        won: false,
        fx: []
      };
    },

    updateCircuitBreaker(dt) {
      const game = this.arcade.games.circuitBreaker;
      if (!game || game.over) return;
      // Existing cabinet sessions can survive a deploy. Normalize the new
      // progression fields before using them so they remain playable.
      game.difficulty = Math.max(1, Number(game.difficulty) || 1);
      game.screenShake = Math.max(0, Number(game.screenShake) || 0);
      game.damageFlash = Math.max(0, Number(game.damageFlash) || 0);
      game.sectorFlash = Math.max(0, Number(game.sectorFlash) || 0);
      if (this.arcade.keys.arrowleft || this.arcade.keys.a) {
        game.lane = Math.max(0, game.lane - 1);
        this.arcade.keys.arrowleft = this.arcade.keys.a = false;
      }
      if (this.arcade.keys.arrowright || this.arcade.keys.d) {
        game.lane = Math.min(2, game.lane + 1);
        this.arcade.keys.arrowright = this.arcade.keys.d = false;
      }
      const sector = game.sectors[game.sector];
      game.shield = Math.max(0, game.shield - dt);
      game.boost = Math.max(0, game.boost - dt);
      game.invuln = Math.max(0, game.invuln - dt);
      game.screenShake = Math.max(0, game.screenShake - dt);
      game.damageFlash = Math.max(0, game.damageFlash - dt);
      game.sectorFlash = Math.max(0, game.sectorFlash - dt);
      game.sessionTime += dt;
      const nextSector = Math.min(game.sectors.length - 1, Math.floor(game.sessionTime / (game.sessionDuration / game.sectors.length)));
      if (nextSector !== game.sector) {
        game.sector = nextSector;
        // Sector changes alter the presentation, never erase the active run.
        game.sectorFlash = 0.7;
        game.fx.push({ text: `SECTOR ${game.sector + 1}`, ttl: 1.1 });
      }
      const speed = sector.speed * game.difficulty * (game.boost > 0 ? 1.35 : 1);
      game.distance += speed * dt;
      game.totalDistance += speed * dt;
      game.score = game.carryScore + Math.floor(game.totalDistance * 1.4) + game.sector * 250 + game.lives * 35;
      game.spawnTimer -= dt;
      game.pickupTimer -= dt;
      if (game.spawnTimer <= 0) {
        const kind = ['packet', 'spike', 'drop', 'lock'][Math.floor(Math.random() * 4)];
        const clearLanes = [0, 1, 2].filter(lane => !game.obstacles.some(item => item.lane === lane && item.y < 118));
        const lanes = clearLanes.length ? clearLanes : [0, 1, 2];
        game.obstacles.push({ lane: lanes[Math.floor(Math.random() * lanes.length)], y: -34, kind, hit: false });
        game.spawnTimer = Math.max(0.28, (sector.spawn + Math.random() * 0.20 - 0.08) / game.difficulty);
      }
      if (game.pickupTimer <= 0) {
        const kind = ['boost', 'shield', 'patch', 'phase', 'scrubber'][Math.floor(Math.random() * 5)];
        game.pickups.push({ lane: Math.floor(Math.random() * 3), y: -28, kind });
        game.pickupTimer = 2.6 + Math.random() * 1.8;
      }
      game.obstacles.forEach(item => { item.y += (speed + 170) * dt; });
      game.pickups.forEach(item => { item.y += (speed + 170) * dt; });
      game.pickups = game.pickups.filter(item => {
        if (item.lane === game.lane && item.y > 252 && item.y < 322) {
          if (item.kind === 'boost') game.boost = 3.0;
          if (item.kind === 'shield') game.shield = 5.0;
          if (item.kind === 'patch') game.lives = Math.min(4, game.lives + 1);
          if (item.kind === 'phase') game.invuln = 2.5;
          if (item.kind === 'scrubber') { game.obstacles = game.obstacles.filter(obstacle => obstacle.lane !== item.lane); game.score += 150; }
          game.fx.push({ text: item.kind.toUpperCase(), ttl: 0.8 });
          return false;
        }
        return item.y < 390;
      });
      game.obstacles.forEach(item => {
        if (item.hit || item.lane !== game.lane || item.y < 252 || item.y > 322 || game.invuln > 0) return;
        item.hit = true;
        if (game.shield > 0) {
          game.shield = 0;
          game.fx.push({ text: 'BLOCK', ttl: 0.7 });
        } else {
          game.lives -= item.kind === 'spike' ? 2 : 1;
          game.invuln = 1.0;
          game.screenShake = 0.26;
          game.damageFlash = 0.24;
          game.fx.push({ text: 'HIT', ttl: 0.7 });
          if (game.lives <= 0) {
            game.over = true;
            this.setArcadeScore('circuitBreaker', game.score);
          }
        }
      });
      game.obstacles = game.obstacles.filter(item => item.y < 390 && !item.hit);
      if (!game.over && game.sessionTime >= game.sessionDuration) {
        game.won = true;
        game.over = true;
        game.score += 1200 + game.loop * 240 + game.lives * 180;
        game.message = `Loop ${game.loop} held for 30 seconds.`;
      }
      game.fx.forEach(fx => { fx.ttl -= dt; });
      game.fx = game.fx.filter(fx => fx.ttl > 0);
    },

    renderCircuitBreaker() {
      if (!this.els.arcadeCanvas || !this.els.arcadeDomGame) return;
      this.els.arcadeCanvas.classList.remove('hidden');
      this.els.arcadeDomGame.classList.add('hidden');
      const ctx = this.els.arcadeCanvas.getContext('2d');
      const game = this.arcade.games.circuitBreaker;
      const sector = game.sectors[game.sector];
      this.drawArcadeFrameBase(ctx, 'Circuit Breaker', 'A/D or arrows steer. Shields block one crash.');
      const lanes = [190, 320, 450];
      ctx.fillStyle = sector.bg;
      ctx.fillRect(92, 62, 456, 270);
      ctx.fillStyle = '#070b17';
      ctx.fillRect(122, 62, 396, 270);
      ctx.strokeStyle = 'rgba(69,247,255,0.25)';
      ctx.lineWidth = 2;
      lanes.forEach(x => {
        ctx.beginPath();
        ctx.moveTo(x, 62);
        ctx.lineTo(x, 332);
        ctx.stroke();
      });
      for (let y = 70 + (Math.floor(game.totalDistance) % 36); y < 332; y += 36) {
        ctx.fillStyle = 'rgba(255,255,255,0.16)';
        lanes.forEach(x => ctx.fillRect(x - 2, y, 4, 18));
      }
      ctx.fillStyle = '#f7fbff';
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.fillText(`SECTOR ${game.sector + 1}/5 ${sector.name}`, 24, 70);
      ctx.fillText(`LIVES ${game.lives}`, 24, 88);
      ctx.fillText(`SCORE ${game.score}`, 506, 70);
      ctx.fillText(`HI ${this.getArcadeScore('circuitBreaker')}`, 506, 88);
      ctx.fillStyle = '#232b3a';
      ctx.fillRect(180, 338, 280, 8);
      ctx.fillStyle = '#7dff68';
      ctx.fillRect(180, 338, Math.min(280, (game.distance / sector.goal) * 280), 8);
      game.obstacles.forEach(item => {
        const x = lanes[item.lane];
        ctx.fillStyle = item.kind === 'spike' ? '#ff5a6d' : item.kind === 'drop' ? '#ffd34d' : item.kind === 'lock' ? '#ff4fd8' : '#45f7ff';
        ctx.fillRect(x - 24, item.y, 48, 24);
        ctx.fillStyle = '#03040b';
        ctx.fillRect(x - 14, item.y + 8, 28, 8);
      });
      game.pickups.forEach(item => {
        const x = lanes[item.lane];
        ctx.fillStyle = item.kind === 'boost' ? '#7dff68' : item.kind === 'shield' ? '#45f7ff' : '#ffd34d';
        ctx.fillRect(x - 13, item.y, 26, 26);
        ctx.fillStyle = '#03040b';
        ctx.fillRect(x - 5, item.y + 5, 10, 16);
      });
      const carX = lanes[game.lane];
      ctx.fillStyle = game.invuln > 0 && Math.floor(this.arcadePerfNow() / 90) % 2 ? '#ffffff' : '#ffd34d';
      ctx.fillRect(carX - 26, 286, 52, 26);
      ctx.fillStyle = '#ff5a6d';
      ctx.fillRect(carX - 16, 278, 32, 12);
      ctx.fillStyle = '#03040b';
      ctx.fillRect(carX - 18, 292, 36, 8);
      if (game.boost > 0) { ctx.fillStyle = '#7dff68'; ctx.fillText('BOOST', 24, 112); }
      if (game.shield > 0) { ctx.fillStyle = '#45f7ff'; ctx.fillText('SHIELD', 24, 130); }
      game.fx.forEach((fx, index) => {
        ctx.fillStyle = `rgba(247,251,255,${Math.max(0, fx.ttl)})`;
        ctx.font = 'bold 18px "Courier New", monospace';
        ctx.fillText(fx.text, 275, 128 + index * 22);
      });
      if (game.over) {
        ctx.fillStyle = 'rgba(0,0,0,0.74)';
        ctx.fillRect(150, 120, 340, 110);
        ctx.fillStyle = game.won ? '#7dff68' : '#ff5a6d';
        ctx.font = 'bold 24px "Courier New", monospace';
        ctx.fillText(game.won ? 'UPTIME HELD' : 'PACKET LOSS', 220, 158);
        ctx.fillStyle = '#f7fbff';
        ctx.font = '12px "Courier New", monospace';
        ctx.fillText('PRESS R OR RESTART FOR A NEW RUN', 196, 188);
      }
      if (this.arcade.gamePaused && !game.over) this.drawArcadePauseOverlay(ctx);
    },

    createCtrlAltDefeatGame(carryScore = 0, wave = 1) {
      const game = {
        wave,
        nextRound: wave + 1,
        turn: 1,
        player: { hp: 72, maxHp: 72, patches: 3, guard: 0, heat: 0, combo: 0 },
        enemy: null,
        log: ['Incident queue online. Read the enemy intent, then make the call.'],
        score: carryScore,
        over: false
      };
      this.spawnRpgEnemy(game);
      return game;
    },

    spawnRpgEnemy(game) {
      const roster = [
        { name: 'Null Pointer', color: '#45f7ff', sprite: 'null' },
        { name: 'Cache Storm', color: '#ff4fd8', sprite: 'storm' },
        { name: 'Config Drift', color: '#ffd34d', sprite: 'drift' },
        { name: 'Deploy Freeze', color: '#7dff68', sprite: 'freeze' },
        { name: 'Root Cause', color: '#ff5a6d', sprite: 'root' }
      ];
      const def = roster[(game.wave - 1) % roster.length];
      const maxHp = 24 + game.wave * 9 + Math.floor(game.wave / 3) * 6;
      const attack = 3 + Math.floor(game.wave * 0.8);
      game.enemy = { ...def, hp: maxHp, maxHp, attack, intent: null };
      this.rollRpgIntent(game);
    },

    rollRpgIntent(game) {
      const enemy = game?.enemy;
      if (!enemy) return;
      const options = [
        { label: 'PING', damage: enemy.attack, color: '#45f7ff' },
        { label: 'SURGE', damage: enemy.attack + 3, color: '#ffd34d' },
        { label: 'BREACH', damage: enemy.attack + 6, color: '#ff5a6d' }
      ];
      enemy.intent = options[Math.floor(Math.random() * options.length)];
    },

    handleRpgAction(action) {
      const game = this.arcade?.games?.ctrlAltDefeat;
      if (!game || game.over) return;
      this.arcade.gamePaused = false;
      if (!game.enemy) this.spawnRpgEnemy(game);
      const player = game.player;
      const enemy = game.enemy;
      const roll = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
      if (action === 'attack') {
        const dmg = roll(8, 12) + player.combo * 2;
        enemy.hp -= dmg;
        player.combo = Math.min(4, player.combo + 1);
        game.log.unshift(`Strike lands for ${dmg}. Combo ${player.combo}.`);
      } else if (action === 'patch') {
        if (player.patches <= 0) {
          game.log.unshift('Patch kit empty. Defeat an incident to restock.');
          this.renderCtrlAltDefeat();
          return;
        }
        const heal = roll(16, 22);
        player.hp = Math.min(player.maxHp, player.hp + heal);
        player.patches -= 1;
        player.heat = Math.max(0, player.heat - 2);
        player.combo = 0;
        game.log.unshift(`Patch restores ${heal} integrity.`);
      } else if (action === 'overclock') {
        const dmg = roll(15, 21) + player.heat * 3;
        enemy.hp -= dmg;
        player.heat += 1;
        player.combo = 0;
        game.log.unshift(`Overclock spikes ${enemy.name} for ${dmg}. Heat ${player.heat}.`);
      } else if (action === 'firewall') {
        player.guard = 12 + game.wave * 2;
        player.heat = Math.max(0, player.heat - 1);
        player.combo = 0;
        game.log.unshift(`Firewall raises ${player.guard} guard.`);
      } else {
        return;
      }
      if (enemy.hp <= 0) {
        game.score += game.wave * 180 + Math.max(0, player.hp) * 4 + player.patches * 30;
        game.won = true;
        game.over = true;
        game.nextRound = game.wave + 1;
        game.log.unshift(`Incident ${game.wave} resolved. Queue escalates next run.`);
        this.renderCtrlAltDefeat();
        return;
      }
      let incoming = Math.max(1, enemy.intent.damage + player.heat - 1);
      if (player.guard > 0) {
        const blocked = Math.min(player.guard, incoming);
        incoming -= blocked;
        player.guard -= blocked;
        game.log.unshift(`Firewall blocks ${blocked}.`);
      }
      if (incoming > 0) {
        player.hp -= incoming;
        game.log.unshift(`${enemy.name} uses ${enemy.intent.label} for ${incoming}.`);
      }
      if (player.hp <= 0) {
        player.hp = 0;
        game.over = true;
        game.log.unshift('Admin down. Run archived.');
        this.setArcadeScore('ctrlAltDefeat', game.score);
      } else {
        game.turn += 1;
        this.rollRpgIntent(game);
      }
      this.renderCtrlAltDefeat();
    },

    renderCtrlAltDefeat() {
      if (!this.els.arcadeCanvas || !this.els.arcadeDomGame) return;
      this.els.arcadeCanvas.classList.add('hidden');
      this.els.arcadeDomGame.classList.remove('hidden');
      const game = this.arcade.games.ctrlAltDefeat;
      const player = game.player;
      const enemy = game.enemy;
      const hpBar = (value, max) => `<div class="arcade-rpg-bar"><span style="width:${Math.max(0, Math.min(100, (value / max) * 100))}%"></span></div>`;
      const overlay = game.over ? `
        <div class="arcade-result-overlay">
          <div class="arcade-result-card pixel-result">
            <h4>${game.won ? 'SHIFT SAVED' : 'RUN ENDED'}</h4>
            <p>Score ${game.score}. High score ${this.getArcadeScore('ctrlAltDefeat')}.</p>
            <button class="arcade-pixel-btn" type="button" data-rpg-action="restart">NEW RUN</button>
          </div>
        </div>` : '';
      this.els.arcadeDomGame.innerHTML = `
        <div class="arcade-mini-shell arcade-rpg-shell">
          <div class="arcade-mini-hud">
            <span>WAVE ${game.wave}/${game.maxWave}</span>
            <span>SCORE ${game.score}</span>
            <span>HI ${this.getArcadeScore('ctrlAltDefeat')}</span>
          </div>
          <div class="arcade-rpg-stage">
            <div class="arcade-rpg-panel">
              <div class="arcade-rpg-sprite admin"></div>
              <h4>NOVA ADMIN</h4>
              ${hpBar(player.hp, player.maxHp)}
              <div class="arcade-rpg-stats">HP ${player.hp}/${player.maxHp} // PATCH ${player.patches} // HEAT ${player.heat} // SHIELD ${player.shield}</div>
            </div>
            <div class="arcade-rpg-panel enemy" style="--enemy-color:${enemy.color};">
              <div class="arcade-rpg-sprite enemy"></div>
              <h4>${enemy.name}</h4>
              ${hpBar(enemy.hp, enemy.maxHp)}
              <div class="arcade-rpg-stats">HP ${Math.max(0, enemy.hp)}/${enemy.maxHp} // ATK ${enemy.atkMin}-${enemy.atkMax}</div>
            </div>
          </div>
          <div class="arcade-rpg-actions">
            <button class="arcade-pixel-btn" type="button" data-rpg-action="attack">ATTACK</button>
            <button class="arcade-pixel-btn" type="button" data-rpg-action="patch">PATCH</button>
            <button class="arcade-pixel-btn" type="button" data-rpg-action="overclock">OVERCLOCK</button>
            <button class="arcade-pixel-btn" type="button" data-rpg-action="firewall">FIREWALL</button>
          </div>
          <div class="arcade-rpg-log">${game.log.slice(0, 7).map(line => `<div>${this.arcadeEscape(line)}</div>`).join('')}</div>
          ${overlay}
        </div>`;
    },

    createMortalKonfigGame(carryScore = 0, tier = 1) {
      return {
        player: { x: 150, y: 0, vy: 0, hp: 100, maxHp: 100, attack: null, block: 0, stun: 0, dir: 1 },
        enemy: { x: 500, y: 0, vy: 0, hp: 100, maxHp: 100, attack: null, block: 0, stun: 0, dir: -1 },
        wins: 0,
        enemyWins: 0,
        round: 1,
        tier,
        nextRound: tier + 1,
        aiSkill: 1 + (tier - 1) * 0.16,
        score: carryScore,
        aiTimer: 0.4,
        over: false,
        won: false,
        message: 'Best of three. Block with L, strike with J/K.'
      };
    },

    startFighterAttack(game, who, kind) {
      const fighter = game[who];
      if (!fighter || fighter.attack || fighter.stun > 0) return;
      const heavy = kind === 'kick';
      fighter.attack = { kind, t: 0, duration: heavy ? 0.34 : 0.24, range: heavy ? 92 : 72, dmg: heavy ? 15 : 9, hit: false };
    },

    applyFighterHit(game, attackerName) {
      const attacker = game[attackerName];
      const defender = game[attackerName === 'player' ? 'enemy' : 'player'];
      if (!attacker.attack || attacker.attack.hit || attacker.attack.t < attacker.attack.duration * 0.32) return;
      const reach = attacker.attack.range;
      const close = Math.abs(attacker.x - defender.x) < reach && Math.abs(attacker.y - defender.y) < 48;
      if (!close) return;
      attacker.attack.hit = true;
      const facingIncoming = Math.sign(attacker.x - defender.x) === defender.dir;
      const blocking = defender.block > 0 && facingIncoming;
      const dmg = blocking ? Math.ceil(attacker.attack.dmg * 0.28) : attacker.attack.dmg;
      defender.hp -= dmg;
      defender.stun = blocking ? 0.08 : 0.18;
      game.message = `${attackerName === 'player' ? 'Player' : 'Kernel'} ${attacker.attack.kind} hits for ${dmg}.`;
    },

    resetFighterRound(game, playerWon) {
      if (playerWon) {
        game.wins += 1;
        game.score += 420 + game.round * 120 + Math.max(0, game.player.hp) * 3;
        this.setArcadeScore('mortalKonfig', game.score);
      } else {
        game.enemyWins += 1;
      }
      if (game.wins >= 2 || game.enemyWins >= 2) {
        if (game.wins >= 2) {
          game.score += 900 + game.tier * 180;
          game.won = true;
          game.over = true;
          game.nextRound = game.tier + 1;
          game.message = `Tier ${game.tier} conquered. Next tier queued.`;
          return;
        } else {
          game.over = true;
          game.won = false;
          game.message = 'Fatal misconfig.';
          this.setArcadeScore('mortalKonfig', game.score);
        }
        return;
      }
      game.round += 1;
      game.player = { x: 150, y: 0, vy: 0, hp: 100, maxHp: 100, attack: null, block: 0, stun: 0, dir: 1 };
      const hp = 100 + game.tier * 20 + game.round * 14;
      game.enemy = { x: 500, y: 0, vy: 0, hp, maxHp: hp, attack: null, block: 0, stun: 0, dir: -1 };
      game.aiSkill = 1 + (game.tier - 1) * 0.16 + (game.round - 1) * 0.14;
      game.message = `Round ${game.round}. Kernel AI x${game.aiSkill.toFixed(2)}.`;
    },

    updateMortalKonfig(dt) {
      const game = this.arcade.games.mortalKonfig;
      if (!game || game.over) return;
      const player = game.player;
      const enemy = game.enemy;
      const keys = this.arcade.keys;
      const gravity = 720;
      const moveSpeed = 170;
      const jump = 330;
      const aiSkill = game.aiSkill || (1 + (game.tier - 1) * 0.16 + (game.round - 1) * 0.14);
      player.dir = enemy.x >= player.x ? 1 : -1;
      enemy.dir = player.x >= enemy.x ? 1 : -1;
      player.block = keys.l ? 0.12 : Math.max(0, player.block - dt);
      if (player.stun > 0) player.stun -= dt;
      if (enemy.stun > 0) enemy.stun -= dt;
      if (player.stun <= 0 && player.block <= 0) {
        if (keys.a || keys.arrowleft) player.x -= moveSpeed * dt;
        if (keys.d || keys.arrowright) player.x += moveSpeed * dt;
        if ((keys.w || keys.arrowup || keys[' ']) && player.y === 0) {
          player.vy = jump;
          player.y = 1;
          keys.w = keys.arrowup = keys[' '] = false;
        }
        if (keys.j) { keys.j = false; this.startFighterAttack(game, 'player', 'punch'); }
        if (keys.k) { keys.k = false; this.startFighterAttack(game, 'player', 'kick'); }
      }
      game.aiTimer -= dt;
      if (enemy.stun <= 0) {
        const dist = Math.abs(player.x - enemy.x);
        const preferredRange = Math.max(62, 100 - aiSkill * 13);
        if (dist > preferredRange) enemy.x += Math.sign(player.x - enemy.x) * moveSpeed * (0.58 + aiSkill * 0.18) * dt;
        if (enemy.y === 0 && Math.random() < 0.003 + aiSkill * 0.0015) { enemy.vy = jump * (0.84 + Math.min(0.16, aiSkill * 0.04)); enemy.y = 1; }
        enemy.block = player.attack && dist < 108 && Math.random() < Math.min(0.82, 0.38 + aiSkill * 0.16) ? 0.18 + aiSkill * 0.02 : Math.max(0, enemy.block - dt);
        if (dist < 104 && game.aiTimer <= 0 && enemy.block <= 0) {
          this.startFighterAttack(game, 'enemy', Math.random() < Math.min(0.78, 0.28 + aiSkill * 0.16) ? 'kick' : 'punch');
          game.aiTimer = Math.max(0.24, 0.92 - aiSkill * 0.16);
        }
      }
      [player, enemy].forEach(fighter => {
        fighter.x = Math.max(54, Math.min(586, fighter.x));
        fighter.vy -= gravity * dt;
        fighter.y = Math.max(0, fighter.y + fighter.vy * dt);
        if (fighter.y === 0 && fighter.vy < 0) fighter.vy = 0;
        if (fighter.attack) fighter.attack.t += dt;
      });
      this.applyFighterHit(game, 'player');
      this.applyFighterHit(game, 'enemy');
      // Resolve the hit window before clearing the animation. This guarantees
      // that a fast mobile frame cannot leave a punch state hanging forever.
      [player, enemy].forEach(fighter => {
        if (fighter.attack && fighter.attack.t >= fighter.attack.duration) fighter.attack = null;
      });
      if (enemy.hp <= 0) this.resetFighterRound(game, true);
      else if (player.hp <= 0) this.resetFighterRound(game, false);
    },

    drawPixelFighter(ctx, fighter, color, name) {
      const ground = 286;
      const x = fighter.x;
      const y = ground - fighter.y;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(fighter.dir, 1);
      ctx.fillStyle = fighter.block > 0 ? '#45f7ff' : color;
      ctx.fillRect(-14, -62, 28, 42);
      ctx.fillRect(-10, -84, 20, 20);
      ctx.fillRect(-12, -20, 8, 24);
      ctx.fillRect(4, -20, 8, 24);
      const attacking = fighter.attack?.kind;
      if (attacking === 'punch') {
        ctx.fillRect(12, -50, 30, 8);
        ctx.fillRect(-26, -48, 12, 8);
      } else if (attacking === 'kick') {
        ctx.fillRect(10, -46, 20, 8);
        ctx.fillRect(8, -10, 34, 8);
        ctx.fillRect(-24, -46, 10, 8);
      } else if (fighter.block > 0) {
        ctx.fillRect(12, -58, 10, 32);
        ctx.fillRect(-22, -58, 10, 32);
      } else {
        ctx.fillRect(12, -46, 14, 8);
        ctx.fillRect(-26, -46, 14, 8);
      }
      ctx.restore();
      ctx.fillStyle = '#f7fbff';
      ctx.font = '10px "Courier New", monospace';
      ctx.fillText(name, x - 26, y + 18);
    },

    renderMortalKonfig() {
      if (!this.els.arcadeCanvas || !this.els.arcadeDomGame) return;
      this.els.arcadeCanvas.classList.remove('hidden');
      this.els.arcadeDomGame.classList.add('hidden');
      const ctx = this.els.arcadeCanvas.getContext('2d');
      const game = this.arcade.games.mortalKonfig;
      this.drawArcadeFrameBase(ctx, 'Mortal Konfig', 'A/D move, W jump, J punch, K kick, L block.');
      ctx.fillStyle = '#111026';
      ctx.fillRect(18, 62, 604, 270);
      ctx.fillStyle = '#1d1a36';
      for (let x = 30; x < 622; x += 28) ctx.fillRect(x, 252, 14, 80);
      ctx.fillStyle = '#080b12';
      ctx.fillRect(18, 286, 604, 46);
      ctx.fillStyle = '#f7fbff';
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.fillText(`ROUND ${game.round}  WINS ${game.wins}-${game.enemyWins}  SCORE ${game.score}`, 214, 32);
      ctx.fillStyle = '#232b3a';
      ctx.fillRect(24, 70, 220, 12);
      ctx.fillRect(396, 70, 220, 12);
      ctx.fillStyle = '#ffd34d';
      ctx.fillRect(24, 70, Math.max(0, game.player.hp / game.player.maxHp) * 220, 12);
      ctx.fillStyle = '#ff5a6d';
      ctx.fillRect(396 + (1 - Math.max(0, game.enemy.hp / game.enemy.maxHp)) * 220, 70, Math.max(0, game.enemy.hp / game.enemy.maxHp) * 220, 12);
      this.drawPixelFighter(ctx, game.player, '#ffd34d', 'ADMIN');
      this.drawPixelFighter(ctx, game.enemy, '#ff5a6d', 'KERNEL');
      ctx.fillStyle = '#45f7ff';
      ctx.font = '11px "Courier New", monospace';
      ctx.fillText(game.message.toUpperCase(), 24, 346);
      if (game.over) {
        ctx.fillStyle = 'rgba(0,0,0,0.76)';
        ctx.fillRect(150, 118, 340, 118);
        ctx.fillStyle = game.won ? '#7dff68' : '#ff5a6d';
        ctx.font = 'bold 24px "Courier New", monospace';
        ctx.fillText(game.won ? 'KONFIG WINS' : 'FATAL ERROR', 214, 158);
        ctx.fillStyle = '#f7fbff';
        ctx.font = '12px "Courier New", monospace';
        ctx.fillText(`SCORE ${game.score} // HI ${this.getArcadeScore('mortalKonfig')}`, 220, 186);
        ctx.fillText('PRESS R OR RESTART TO RUN IT BACK', 196, 206);
      }
      if (this.arcade.gamePaused && !game.over) this.drawArcadePauseOverlay(ctx);
    },

    renderOffice() {
      const wallFinish = this.app.getEquippedCosmetic ? this.app.getEquippedCosmetic('wallFinish') : ((this.app.state.equippedCosmetics || {}).wallFinish || 'default');
      const floorFinish = this.app.getEquippedCosmetic ? this.app.getEquippedCosmetic('floorFinish') : ((this.app.state.equippedCosmetics || {}).floorFinish || 'default');
      const deskFinish = this.app.getEquippedCosmetic ? this.app.getEquippedCosmetic('deskFinish') : ((this.app.state.equippedCosmetics || {}).deskFinish || 'default');
      const chairFinish = this.app.getEquippedCosmetic ? this.app.getEquippedCosmetic('chairFinish') : ((this.app.state.equippedCosmetics || {}).chairFinish || 'default');
      if (this.els.officeScene) {
        this.els.officeScene.dataset.officeTier = String(this.app.state.officeTier);
        this.els.officeScene.dataset.era = this.app.state.activeEraId || 'foundation';
        this.els.officeScene.dataset.wallFinish = wallFinish;
        this.els.officeScene.dataset.floorFinish = floorFinish;
      }
      document.body.dataset.era = this.app.state.activeEraId || 'foundation';
      if (this.office3D) {
        const placementState = this.app.state.cosmeticPlacements || {};
        this.office3D.setScene({
          tier: this.app.state.officeTier,
          decorations: this.app.state.equippedDecorations,
          suiteName: this.app.getOfficeSuiteDef().name,
          wallFinish,
          floorFinish,
          deskFinish,
          chairFinish,
          graphicsQuality: this.app.state.graphicsQuality,
          placements: {
            wall: Object.assign({}, placementState.wall || {}),
            floor: Object.assign({}, placementState.floor || {}),
            desk: Object.assign({}, placementState.desk || {})
          },
          floorBotProfile: this.app.state.floorBotProfile,
          soundEnabled: this.app.state.soundEnabled
        });
      }
      if (this.els.officeSuiteValue) this.els.officeSuiteValue.textContent = this.app.getOfficeSuiteDef().name;
      if (this.els.wallFinishValue) this.els.wallFinishValue.textContent = ((DATA.cosmetics.wallFinish || []).find(item => item.id === wallFinish) || {}).name || 'Soft Green Walls';
      if (this.els.floorFinishValue) this.els.floorFinishValue.textContent = ((DATA.cosmetics.floorFinish || []).find(item => item.id === floorFinish) || {}).name || 'Dark Gray Floor';
      if (this.els.officePropsValue) this.els.officePropsValue.textContent = `${this.app.countEquippedDecorations()} / ${this.app.getDecorSlotLimit()}`;
      if (this.els.officeUpgradeBtn) this.els.officeUpgradeBtn.textContent = this.app.state.officeTier >= DATA.officeSuiteDefs.length - 1 ? 'Max Suite' : 'Upgrade Suite';
    },


    getFinishPreviewStyle(category, id) {
      const wallFinishStyles = {
        'default': 'background: linear-gradient(180deg, #7aa06f 0%, #6a8f60 100%);',
        'brushed-steel': 'background: linear-gradient(180deg, #5b6772 0%, #424c55 45%, #2f363d 100%); background-image: linear-gradient(180deg, rgba(255,255,255,0.18), transparent 24%), repeating-linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.08) 6px, transparent 6px, transparent 14px);',
        'rose-panel': 'background: linear-gradient(180deg, #71505e 0%, #4d3340 100%); background-image: linear-gradient(180deg, rgba(255,255,255,0.12), transparent 26%), repeating-linear-gradient(180deg, rgba(255,218,231,0.10), rgba(255,218,231,0.10) 8px, transparent 8px, transparent 18px);',
        'midnight-grid': 'background: linear-gradient(180deg, #182132 0%, #0f1520 100%); background-image: linear-gradient(90deg, rgba(102,216,255,0.12) 1px, transparent 1px), linear-gradient(rgba(102,216,255,0.08) 1px, transparent 1px); background-size: 18px 18px, 18px 18px;',
        'emerald-acoustic': 'background: linear-gradient(180deg, #2d5b4c 0%, #1d3d33 100%); background-image: linear-gradient(180deg, rgba(255,255,255,0.10), transparent 22%), repeating-linear-gradient(180deg, rgba(225,255,238,0.08), rgba(225,255,238,0.08) 8px, transparent 8px, transparent 18px);',
        'circuit-board': 'background: #506d37 url("assets/circuit_wall_texture.png") center center / cover no-repeat;'
      };
      const floorFinishStyles = {
        'default': 'background: linear-gradient(180deg, #787c80 0%, #5d6165 100%); background-image: linear-gradient(180deg, rgba(255,255,255,0.10), transparent 30%), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px); background-size: auto, 18px 18px;',
        'warm-oak': 'background: linear-gradient(180deg, #8a5e44 0%, #6a4633 100%); background-image: repeating-linear-gradient(90deg, rgba(73,37,16,0.55), rgba(73,37,16,0.55) 2px, transparent 2px, transparent 16px), linear-gradient(180deg, rgba(255,220,183,0.10), transparent 30%);',
        'dark-rubber': 'background: linear-gradient(180deg, #2d3238 0%, #191d22 100%); background-image: radial-gradient(circle at 20% 25%, rgba(255,255,255,0.08) 0 1px, transparent 2px); background-size: 18px 18px;',
        'hex-epoxy': 'background: linear-gradient(180deg, #29405a 0%, #1a2736 100%); background-image: linear-gradient(30deg, rgba(104,216,255,0.16) 12%, transparent 12.5%, transparent 87%, rgba(104,216,255,0.16) 87.5%), linear-gradient(150deg, rgba(104,216,255,0.16) 12%, transparent 12.5%, transparent 87%, rgba(104,216,255,0.16) 87.5%); background-size: 16px 28px, 16px 28px;',
        'aurora-laminate': 'background: linear-gradient(180deg, #2d3144 0%, #1c2030 100%); background-image: linear-gradient(90deg, rgba(255,127,209,0.22), rgba(104,216,255,0.18), rgba(127,255,174,0.18));',
        'aesthetic-tile': 'background: linear-gradient(180deg, #c09169 0%, #9d734e 100%); background-image: repeating-linear-gradient(0deg, transparent, transparent 66px, rgba(255,255,255,0.18) 66px, rgba(255,255,255,0.18) 68px), repeating-linear-gradient(90deg, transparent, transparent 66px, rgba(255,255,255,0.18) 66px, rgba(255,255,255,0.18) 68px), linear-gradient(135deg, rgba(255,255,255,0.10), transparent 45%); background-size: 68px 68px, 68px 68px, auto;',
        'sci-fi-tile': 'background: linear-gradient(180deg, #0f171d 0%, #091016 100%); background-image: repeating-linear-gradient(0deg, transparent, transparent 74px, rgba(11,184,198,0.22) 74px, rgba(11,184,198,0.22) 76px), repeating-linear-gradient(90deg, transparent, transparent 74px, rgba(11,184,198,0.22) 74px, rgba(11,184,198,0.22) 76px), linear-gradient(90deg, transparent 44%, rgba(11,184,198,0.9) 44%, rgba(11,184,198,0.9) 56%, transparent 56%), linear-gradient(transparent 44%, rgba(11,184,198,0.9) 44%, rgba(11,184,198,0.9) 56%, transparent 56%); background-size: 76px 76px, 76px 76px, 76px 76px, 76px 76px;'
      };
      const deskFinishStyles = {
        'default': 'background: linear-gradient(180deg, #8b6450 0%, #6d4e3c 100%);',
        'graphite': 'background: linear-gradient(180deg, #4d545c 0%, #2f353c 100%);',
        'ivory': 'background: linear-gradient(180deg, #f0eee9 0%, #d1cbc2 100%);',
        'synthwave': 'background: linear-gradient(180deg, #5d3c74 0%, #341f48 100%);',
        'emerald': 'background: linear-gradient(180deg, #3d6f63 0%, #23443c 100%);'
      };
      const chairFinishStyles = {
        'default': 'background: linear-gradient(180deg, #324b61 0%, #243746 100%);',
        'charcoal': 'background: linear-gradient(180deg, #4c5258 0%, #2d3136 100%);',
        'ice': 'background: linear-gradient(180deg, #cfe7f7 0%, #8cb5cf 100%);',
        'magenta': 'background: linear-gradient(180deg, #bf4f8f 0%, #7a2c59 100%);',
        'lime': 'background: linear-gradient(180deg, #7fc75a 0%, #3b6e28 100%);'
      };
      const source = category === 'wallFinish' ? wallFinishStyles : category === 'floorFinish' ? floorFinishStyles : category === 'deskFinish' ? deskFinishStyles : chairFinishStyles;
      return source[id] || source.default || '';
    },

    getCosmeticPlacementZone(category, id) {
      if (!id || id === 'default') return null;
      const zone = DECOR_PLACEMENT_ZONES[id] || null;
      if (!zone) return null;
      if (!['office', 'wall', 'desk', 'floor', 'shelf'].includes(category)) return null;
      return zone;
    },

    isWallPlaceableCosmetic(category, id) {
      return this.getCosmeticPlacementZone(category, id) === 'wall';
    },

    isPlaceableCosmetic(category, id) {
      return !!this.getCosmeticPlacementZone(category, id);
    },

    getPlacementWallDisplayName(face = '') {
      return ({ back: 'Back Wall', left: 'Left Wall', front: 'Front Wall', right: 'Right Wall' })[face] || 'Back Wall';
    },

    getPlacementZoneDisplayName(zone = '') {
      return ({ wall: 'Wall Placement', floor: 'Floor Placement', desk: 'Desk Placement' })[zone] || 'Decor Placement';
    },

    syncPlacementWallLabel() {
      const zone = this.office3D?.placementMode?.zone || 'wall';
      if (!this.els.placementWallLabel) return;
      if (zone === 'wall') {
        const face = this.office3D?.placementMode?.face || this.office3D?.placementMode?.placement?.face || 'back';
        this.els.placementWallLabel.textContent = this.getPlacementWallDisplayName(face);
      } else {
        this.els.placementWallLabel.textContent = this.getPlacementZoneDisplayName(zone).replace(' Placement', '');
      }
    },

    syncMoveModeWallLabel() {
      const mode = this.office3D?.moveMode || {};
      const viewZone = ['wall', 'floor', 'desk'].includes(mode.viewZone) ? mode.viewZone : 'wall';
      const face = mode.face || 'back';
      let label = `${this.getPlacementWallDisplayName(face)} Search View`;
      if (viewZone === 'floor') label = `Floor View ${((Number(mode.viewIndex) || 0) % 4 + 4) % 4 + 1}`;
      if (viewZone === 'desk') label = 'Desk View';
      if (this.els.placementWallLabel) this.els.placementWallLabel.textContent = label;
    },

    getCurrentMoveModeView() {
      const mode = this.office3D?.moveMode || {};
      return {
        viewZone: ['wall', 'floor', 'desk'].includes(mode.viewZone) ? mode.viewZone : 'wall',
        face: ['back', 'left', 'front', 'right'].includes(mode.face) ? mode.face : 'back',
        viewIndex: Number.isFinite(Number(mode.viewIndex)) ? Number(mode.viewIndex) : 0
      };
    },

    getFloorViewIndexFromMoveView(moveView = {}) {
      if (moveView.viewZone === 'floor' && Number.isFinite(Number(moveView.viewIndex))) return ((Math.round(Number(moveView.viewIndex)) % 4) + 4) % 4;
      const face = ['back', 'left', 'front', 'right'].includes(moveView.face) ? moveView.face : 'back';
      const faceToFloorView = { back: 0, right: 1, front: 2, left: 3 };
      return faceToFloorView[face] ?? 0;
    },

    getPlacementViewIndexForMoveGrab(zone = 'wall', moveView = {}) {
      return zone === 'floor' ? this.getFloorViewIndexFromMoveView(moveView) : 0;
    },

    getReturnMoveModeView(zone = 'wall', placement = null, options = {}) {
      const base = options.returnMoveView || this.getCurrentMoveModeView();
      const safeZone = ['wall', 'floor', 'desk'].includes(zone) ? zone : 'floor';
      if (this.forcePlacementWallReturn) return { viewZone: 'wall', face: base.face || 'back', viewIndex: 0 };
      if (safeZone === 'wall') return { viewZone: 'wall', face: (placement && placement.face) || base.face || 'back', viewIndex: 0 };
      if (safeZone === 'desk') return { viewZone: 'desk', face: base.face || 'back', viewIndex: 0 };
      return {
        viewZone: 'floor',
        face: base.face || 'back',
        viewIndex: Number.isFinite(Number(placement?.viewIndex)) ? Number(placement.viewIndex) : this.getFloorViewIndexFromMoveView(base)
      };
    },

    syncPlacementHud(active, itemName = '', zone = 'wall', options = {}) {
      const normalizedZone = ['wall', 'floor', 'desk'].includes(zone) ? zone : 'wall';
      if (this.els.placementHud) this.els.placementHud.classList.toggle('hidden', !active);
      const showSideArrows = active && (normalizedZone === 'wall' || normalizedZone === 'floor');
      if (this.els.placementWallPrevBtn) this.els.placementWallPrevBtn.classList.toggle('hidden', !showSideArrows);
      if (this.els.placementWallNextBtn) this.els.placementWallNextBtn.classList.toggle('hidden', !showSideArrows);
      if (this.els.placementRotateControls) this.els.placementRotateControls.classList.toggle('hidden', !(active && (normalizedZone === 'floor' || normalizedZone === 'desk')));
      const showBackToMove = !!(active && options.fromMoveMode && normalizedZone !== 'wall');
      if (this.els.placementBackToMoveBtn) {
        this.els.placementBackToMoveBtn.classList.toggle('hidden', !showBackToMove);
        this.els.placementBackToMoveBtn.textContent = '↓ Wall View';
      }
      document.body.classList.toggle('wall-placement-mode', !!active);
      if (!active) document.body.classList.remove('decor-move-mode');
      if (this.els.worldQuickActions) this.els.worldQuickActions.classList.toggle('hidden', !!active);
      const zoneName = this.getPlacementZoneDisplayName(normalizedZone);
      const instructions = normalizedZone === 'wall'
        ? 'Move the ghost object with your mouse, then <strong>click</strong> to place. Use the side arrows to switch walls. Press <strong>Esc</strong> or Cancel to stop placing.'
        : normalizedZone === 'floor'
          ? `Move the ghost object on the floor, then <strong>click</strong> to place. Use the mouse wheel or Rotate 90° buttons to turn the object. Use the side arrows to rotate the view.${showBackToMove ? ' Use <strong>↓ Wall View</strong> to zoom back out and keep searching.' : ''} Press <strong>Esc</strong> or Cancel to stop placing.`
          : `Move the ghost object within the ${normalizedZone} zone, then <strong>click</strong> to place.${showBackToMove ? ' Use <strong>↓ Wall View</strong> to zoom back out and keep searching.' : ''} Press <strong>Esc</strong> or Cancel to stop placing.`;
      if (this.els.placementTitle) this.els.placementTitle.textContent = active ? `Place ${itemName || 'decor'}` : 'Place decor';
      const kicker = this.els.placementHud?.querySelector?.('.placement-kicker');
      if (kicker) kicker.textContent = zoneName;
      if (this.els.placementCopy) this.els.placementCopy.innerHTML = active ? instructions : 'Move the ghost object, then click to place. Floor items can rotate with the mouse wheel or rotate buttons.';
      if (active) this.syncPlacementWallLabel();
    },

    getPlaceableCosmeticEntryById(id) {
      const categories = ['office', 'wall', 'desk', 'floor', 'shelf'];
      for (const category of categories) {
        const item = (DATA.cosmetics[category] || []).find(entry => entry.id === id);
        if (!item) continue;
        const owned = !!((this.app.state.purchasedCosmetics || {})[category] || {})[id];
        if (owned) return { category, item };
      }
      for (const category of categories) {
        const item = (DATA.cosmetics[category] || []).find(entry => entry.id === id);
        if (item) return { category, item };
      }
      return null;
    },

    getMovableDecorCount() {
      const equipped = Array.isArray(this.app.state.equippedDecorations) ? this.app.state.equippedDecorations : [];
      return equipped.filter(id => {
        const entry = this.getPlaceableCosmeticEntryById(id);
        return !!(entry && this.getCosmeticPlacementZone(entry.category, id));
      }).length;
    },

    syncMoveModeHud(active) {
      this.moveModeActive = !!active;
      const moveView = this.getCurrentMoveModeView();
      const viewZone = moveView.viewZone || 'wall';
      if (this.els.placementHud) this.els.placementHud.classList.toggle('hidden', !active);
      const showSideArrows = !!(active && (viewZone === 'wall' || viewZone === 'floor'));
      if (this.els.placementWallPrevBtn) this.els.placementWallPrevBtn.classList.toggle('hidden', !showSideArrows);
      if (this.els.placementWallNextBtn) this.els.placementWallNextBtn.classList.toggle('hidden', !showSideArrows);
      if (this.els.placementRotateControls) this.els.placementRotateControls.classList.add('hidden');
      if (this.els.placementBackToMoveBtn) {
        this.els.placementBackToMoveBtn.classList.toggle('hidden', !(active && viewZone !== 'wall'));
        this.els.placementBackToMoveBtn.textContent = '↓ Wall View';
      }
      document.body.classList.toggle('wall-placement-mode', !!active);
      document.body.classList.toggle('decor-move-mode', !!active);
      if (this.els.worldQuickActions) this.els.worldQuickActions.classList.toggle('hidden', !!active);
      const kicker = this.els.placementHud?.querySelector?.('.placement-kicker');
      if (kicker) kicker.textContent = viewZone === 'desk' ? 'Move Mode · Desk' : viewZone === 'floor' ? 'Move Mode · Floor' : 'Move Mode';
      if (this.els.placementTitle) this.els.placementTitle.textContent = active ? 'Grab placed decor' : 'Place decor';
      if (active) this.syncMoveModeWallLabel();
      else if (this.els.placementWallLabel) this.els.placementWallLabel.textContent = 'Back Wall';
      if (this.els.placementCopy) {
        const copy = viewZone === 'desk'
          ? 'Click another desk item to grab it, or use <strong>↓ Wall View</strong> to zoom back out. Press <strong>Esc</strong> or Cancel to exit Move Mode.'
          : viewZone === 'floor'
            ? 'Use the side arrows to rotate the floor view, then click any placed shop item to grab it. Use <strong>↓ Wall View</strong> to zoom back out. Press <strong>Esc</strong> or Cancel to exit Move Mode.'
            : 'Use the side arrows to look around each wall, then click any placed shop item to grab it. Floor and desk items will zoom into their placement view. Press <strong>Esc</strong> or Cancel to exit Move Mode.';
        this.els.placementCopy.innerHTML = active ? copy : 'Move the ghost object, then click to place.';
      }
    },


    startShopMoveMode(options = {}) {
      if (!this.office3D || !this.office3D.startDecorMoveMode) {
        this.toast('3D move mode is not ready yet.');
        return;
      }
      if (this.getMovableDecorCount() <= 0) {
        this.toast('Place at least one decor item first, then Move Mode can grab it.');
        return;
      }
      if (this.worldUtilityOpen) this.closeWorldUtility(false);
      const requestedView = {
        viewZone: ['wall', 'floor', 'desk'].includes(options.viewZone) ? options.viewZone : 'wall',
        face: ['back', 'left', 'front', 'right'].includes(options.face) ? options.face : null,
        viewIndex: Number.isFinite(Number(options.viewIndex)) ? Number(options.viewIndex) : 0
      };
      this.office3D.startDecorMoveMode({
        viewZone: requestedView.viewZone,
        face: requestedView.face,
        viewIndex: requestedView.viewIndex,
        onSelect: target => {
          const moveView = target.moveModeView || this.getCurrentMoveModeView();
          this.syncMoveModeHud(false);
          const entry = this.getPlaceableCosmeticEntryById(target.id);
          if (!entry) {
            this.toast('Could not identify that decor item.');
            return;
          }
          const placementZone = this.getCosmeticPlacementZone(entry.category, target.id);
          this.startDecorPlacement(entry.category, target.id, { returnToMoveMode: true, fromMoveMode: true, initialPlacement: target.placement || null, returnMoveView: moveView, placementViewIndex: this.getPlacementViewIndexForMoveGrab(placementZone, moveView) });
        },
        onCancel: () => {
          this.syncMoveModeHud(false);
          if (!options.silent) this.toast('Move Mode closed.');
          requestAnimationFrame(() => {
            if (!this.computerOpen && !this.worldUtilityOpen && this.office3D?.resumeManualControl) this.office3D.resumeManualControl();
          });
        }
      });
      this.syncMoveModeHud(true);
      if (!options.silent) this.toast('Move Mode: click a placed item to grab it.');
    },

    startDecorPlacement(category, id, options = {}) {
      const zone = this.getCosmeticPlacementZone(category, id);
      if (!zone) {
        this.toast('This item cannot be manually placed yet.');
        return;
      }
      const owned = !!((this.app.state.purchasedCosmetics || {})[category] || {})[id];
      if (!owned) {
        this.toast('Buy this item first, then place it.');
        return;
      }
      const equip = this.app.ensureDecorationEquipped ? this.app.ensureDecorationEquipped(id) : { ok: true };
      if (!equip.ok) {
        this.toast(equip.reason === 'slots' ? 'No decor slots left. Upgrade the office suite.' : 'Could not equip this item.');
        this.app.renderAll();
        return;
      }
      const item = (DATA.cosmetics[category] || []).find(entry => entry.id === id) || { name: id };
      const existingPlacement = this.app.getCosmeticPlacement ? (this.app.getCosmeticPlacement(zone, id) || options.initialPlacement || null) : (options.initialPlacement || null);
      if (this.worldUtilityOpen) this.closeWorldUtility(false);
      this.syncPlacementHud(true, item.name, zone, { fromMoveMode: !!options.fromMoveMode });
      this.app.renderAll();
      if (!this.office3D || !this.office3D.startDecorPlacement) {
        this.syncPlacementHud(false, '', zone);
        this.toast('3D placement is not ready yet.');
        return;
      }
      this.office3D.startDecorPlacement({
        zone,
        itemId: id,
        itemName: item.name,
        placement: existingPlacement,
        viewIndex: Number.isFinite(Number(options.placementViewIndex)) ? Number(options.placementViewIndex) : 0,
        onPlace: placement => {
          if (this.app.setCosmeticPlacement) this.app.setCosmeticPlacement(zone, id, placement);
          const returnView = this.getReturnMoveModeView(zone, placement, options);
          this.forcePlacementWallReturn = false;
          this.syncPlacementHud(false, '', zone);
          this.toast(options.fromMoveMode ? `${item.name} moved.` : `${item.name} placed.`);
          this.playSound('ui');
          this.app.renderAll();
          requestAnimationFrame(() => {
            if (options.returnToMoveMode) this.startShopMoveMode(Object.assign({ silent: true }, returnView));
            else if (!this.computerOpen && !this.worldUtilityOpen && this.office3D?.resumeManualControl) this.office3D.resumeManualControl();
          });
        },
        onCancel: () => {
          const returnView = this.getReturnMoveModeView(zone, null, options);
          this.forcePlacementWallReturn = false;
          this.syncPlacementHud(false, '', zone);
          this.toast(options.returnToMoveMode ? 'Grab cancelled. Pick another item.' : 'Placement cancelled.');
          requestAnimationFrame(() => {
            if (options.returnToMoveMode) this.startShopMoveMode(Object.assign({ silent: true }, returnView));
            else if (!this.computerOpen && !this.worldUtilityOpen && this.office3D?.resumeManualControl) this.office3D.resumeManualControl();
          });
        }
      });
      this.syncPlacementWallLabel();
    },

    startWallDecorPlacement(category, id) {
      this.startDecorPlacement(category, id);
    },

    renderShop() {
      const allowedCategories = ['office', 'wall', 'desk', 'floor', 'shelf', 'wallFinish', 'floorFinish', 'deskFinish', 'chairFinish'];
      const category = allowedCategories.includes(this.app.state.currentShopView) ? this.app.state.currentShopView : 'office';
      if (category !== this.app.state.currentShopView) this.app.state.currentShopView = category;
      const currentSuite = this.app.getOfficeSuiteDef();
      const nextSuite = this.app.state.officeTier < DATA.officeSuiteDefs.length - 1 ? this.app.getOfficeSuiteDef(this.app.state.officeTier + 1) : null;
      this.els.suiteUpgradeCard.innerHTML = nextSuite ? `
        <article class="manager-card card suite-card">
          <div class="manager-top">
            <div class="manager-name"><span class="icon-badge">🏢</span> ${currentSuite.name} → ${nextSuite.name}</div>
            <span class="tag">${currentSuite.slots} → ${nextSuite.slots} slots</span>
          </div>
          <p class="muted">${nextSuite.desc}</p>
          <div class="manager-meta"><span><strong>Cost:</strong> ${this.app.formatNumber(nextSuite.costCredits)} CC + ${nextSuite.costResearch} RD</span></div>
          <div class="manager-actions">
            <button class="buy-btn ${(this.app.state.credits >= nextSuite.costCredits && this.app.state.research >= nextSuite.costResearch) ? 'can-afford' : 'nope'}" data-action="buy-office-upgrade">Upgrade Suite</button>
          </div>
        </article>` : `<article class="manager-card card suite-card done"><div class="manager-top"><div class="manager-name"><span class="icon-badge">🏢</span> ${currentSuite.name}</div><span class="tag">maxed</span></div><p class="muted">Your office suite is as ridiculous as it needs to be.</p></article>`;

      const slotlessCategory = this.app.isSlotlessCosmeticCategory ? this.app.isSlotlessCosmeticCategory(category) : ['outfit', 'wallFinish', 'floorFinish', 'deskFinish', 'chairFinish'].includes(category);
      const items = (DATA.cosmetics[category] || []).filter(item => slotlessCategory || item.id !== 'default');
      this.els.shopList.innerHTML = items.map(item => {
        const owned = !!this.app.state.purchasedCosmetics[category][item.id];
        const placementZone = this.getCosmeticPlacementZone(category, item.id);
        const placeable = !!placementZone;
        const placement = placeable && this.app.getCosmeticPlacement ? this.app.getCosmeticPlacement(placementZone, item.id) : null;
        const equipped = slotlessCategory ? (this.app.getEquippedCosmetic ? this.app.getEquippedCosmetic(category) === item.id : ((this.app.state.equippedCosmetics || {})[category] === item.id)) : this.app.isDecorationEquipped(item.id);
        const canAfford = this.app.state.credits >= item.cost || owned;
        const isFinishCategory = category === 'wallFinish' || category === 'floorFinish' || category === 'deskFinish' || category === 'chairFinish';
        const previewClasses = `cosmetic-preview${isFinishCategory ? ' finish-swatch' : ''}`;
        const previewStyle = isFinishCategory ? ` style="${this.getFinishPreviewStyle(category, item.id)}"` : '';
        const previewIcon = isFinishCategory ? '' : `<span class="cosmetic-preview-icon">${item.icon}</span>`;
        const nameIcon = isFinishCategory ? '' : `<span class="icon-badge">${item.icon}</span> `;
        let label = this.app.formatNumber(item.cost) + ' CC';
        let buttonLabel = 'Buy';
        if (owned) {
          label = equipped ? (placement ? 'placed' : 'equipped') : 'owned';
          buttonLabel = slotlessCategory ? (equipped ? 'Equipped' : 'Equip') : placeable ? (equipped ? 'Unequip' : 'Place') : (equipped ? 'Unequip' : 'Equip');
        } else if (placeable) {
          buttonLabel = 'Buy + Place';
        }
        const placeButton = placeable && owned && equipped ? `<button class="soft-btn placement-card-btn" data-action="place-cosmetic" data-category="${category}" data-id="${item.id}">${placement ? 'Move' : 'Place'}</button>` : '';
        const placementNote = placeable ? `<div class="placement-card-note">${placement ? `Manual ${placementZone} spot saved. You can move it anytime.` : `Manual ${placementZone} placement available.`}</div>` : '';
        return `
          <article class="manager-card card cosmetic-card ${equipped ? 'done' : ''} ${placeable ? 'wall-placeable-card' : ''}">
            <div class="cosmetic-card-layout">
              <div class="${previewClasses}" data-category="${category}" data-item="${item.id}" aria-hidden="true"${previewStyle}>
                ${previewIcon}
              </div>
              <div class="cosmetic-copy">
                <div class="manager-top">
                  <div class="manager-name">${nameIcon}${item.name}</div>
                  <span class="tag">${label}</span>
                </div>
                <p class="muted">${item.desc}</p>
                ${placementNote}
                <div class="manager-actions">
                  <button class="buy-btn ${canAfford ? 'can-afford' : 'nope'}" data-action="buy-cosmetic" data-category="${category}" data-id="${item.id}">${buttonLabel}</button>
                  ${placeButton}
                </div>
              </div>
            </div>
          </article>`;
      }).join('');
    },


    updateMissionsLive(force = false) {
      if (!this.els.missionList || !this.els.incidentList) return;
      const visibleDefs = DATA.questDefs.filter(def => this.app.meetsCondition(def.visibleWhen));
      const domMissionDefs = [...this.els.missionList.querySelectorAll('[data-mission-def]')].map(card => card.dataset.missionDef);
      const domActiveMissions = [...this.els.missionList.querySelectorAll('[data-active-mission-card]')].map(card => card.dataset.activeMissionCard);
      const domIncidentCards = [...this.els.incidentList.querySelectorAll('[data-incident-card]')].map(card => card.dataset.incidentCard);
      const activeIds = this.app.state.activeMissions.map(m => m.uid);
      const incidentIds = this.app.state.activeIncidents.map(i => i.uid);
      if (domMissionDefs.length !== visibleDefs.length
          || domMissionDefs.some((id, idx) => id !== visibleDefs[idx].id)
          || domActiveMissions.length !== activeIds.length
          || domActiveMissions.some((id, idx) => id !== activeIds[idx])
          || domIncidentCards.length !== incidentIds.length
          || domIncidentCards.some((id, idx) => id !== incidentIds[idx])) {
        this.renderMissions();
        return;
      }

      this.app.state.activeIncidents.forEach(incident => {
        const remainingEl = this.els.incidentList.querySelector(`[data-incident-remaining="${incident.uid}"]`);
        if (remainingEl) remainingEl.textContent = this.app.formatDuration(incident.remaining);
        const bar = this.els.incidentList.querySelector(`[data-incident-progress="${incident.uid}"]`);
        if (bar) bar.style.width = `${Math.max(0, Math.min(100, (1 - incident.remaining / incident.total) * 100))}%`;
      });

      this.app.state.activeMissions.forEach(mission => {
        const remainingEl = this.els.missionList.querySelector(`[data-mission-remaining="${mission.uid}"]`);
        if (remainingEl) remainingEl.textContent = this.app.formatDuration(mission.remaining);
        const bar = this.els.missionList.querySelector(`[data-mission-progress="${mission.uid}"]`);
        if (bar) bar.style.width = `${Math.max(0, Math.min(100, (1 - mission.remaining / mission.total) * 100))}%`;
      });

      visibleDefs.forEach(def => {
        const cooldownRemaining = this.app.getQuestCooldownRemaining(def.id);
        const canStart = this.app.getAvailableMissionTeams() >= def.teams && cooldownRemaining <= 0;
        const msg = this.els.missionList.querySelector(`[data-mission-cooldown-msg="${def.id}"]`);
        if (msg) {
          msg.textContent = cooldownRemaining > 0 ? `Cooling down for ${this.app.formatDuration(cooldownRemaining)}` : '';
          msg.classList.toggle('hidden', cooldownRemaining <= 0);
        }
        const cooldownEl = this.els.missionList.querySelector(`[data-mission-cooldown="${def.id}"]`);
        if (cooldownEl) cooldownEl.textContent = this.app.formatDuration(this.app.getQuestCooldown(def));
        const rewardEl = this.els.missionList.querySelector(`[data-mission-reward="${def.id}"]`);
        if (rewardEl) rewardEl.textContent = this.describeMissionReward(this.app.getQuestRewardPreview(def));
        const btn = this.els.missionList.querySelector(`button[data-action="start-mission"][data-id="${def.id}"]`);
        if (btn) {
          btn.textContent = cooldownRemaining > 0 ? 'Cooling Down' : 'Dispatch';
          btn.disabled = !canStart;
          btn.classList.toggle('can-afford', canStart);
          btn.classList.toggle('nope', !canStart);
        }
      });
    },

    updateUpgradesLive(force = false) {
      if (!this.els.upgradeList) return;
      const view = this.app.state.currentUpgradeView;
      const visibleDefs = DATA.upgradeDefs
        .filter(def => def.view === view)
        .filter(def => !this.app.state.purchasedUpgrades[def.id] && this.app.meetsCondition(def.visibleWhen));

      const domIds = [...this.els.upgradeList.querySelectorAll('[data-upgrade-card]')].map(card => card.dataset.upgradeCard);
      if (domIds.length !== visibleDefs.length || domIds.some((id, idx) => id !== visibleDefs[idx].id)) {
        this.renderUpgrades();
        return;
      }

      visibleDefs.forEach(def => {
        const card = this.els.upgradeList.querySelector(`[data-upgrade-card="${def.id}"]`);
        if (!card) return;
        const requirementsMet = this.app.upgradeRequirementsMet(def);
        const canAfford = this.app.canBuyUpgradeDef(def);
        const canHighlight = requirementsMet && canAfford;
        card.classList.toggle('locked', !requirementsMet);
        const costEl = card.querySelector(`[data-upgrade-cost="${def.id}"]`);
        if (costEl) costEl.textContent = `${this.app.formatNumber(def.cost || 0)} CC${def.costResearch ? ` + ${def.costResearch} RD` : ''}`;
        const reqEl = card.querySelector(`[data-upgrade-req="${def.id}"]`);
        if (reqEl) reqEl.classList.toggle('needs', !requirementsMet);
        const btn = card.querySelector(`button[data-action="buy-upgrade"][data-id="${def.id}"]`);
        if (btn) {
          btn.textContent = requirementsMet ? 'Install Upgrade' : 'Locked Research';
          btn.disabled = !canHighlight;
          btn.classList.toggle('can-afford', canHighlight);
          btn.classList.toggle('nope', !canHighlight);
        }
      });
    },

    renderConsole(force = false) {
      const feed = this.els.consoleFeed;
      if (!feed) return;
      const logs = this.app.state.consoleLog || [];
      const last = logs[logs.length - 1];
      const renderKey = logs.length ? `${logs.length}:${last.time || 0}:${last.message || ''}:${last.level || 'info'}` : 'empty';
      if (!force && renderKey === this.lastConsoleKey) return;

      const previousScrollTop = feed.scrollTop;
      const distanceFromBottom = feed.scrollHeight - feed.clientHeight - feed.scrollTop;
      const shouldStick = this.consolePinnedToBottom || distanceFromBottom <= 18;

      if (!logs.length) {
        feed.innerHTML = `<div class="console-empty">[00:00:00] Waiting for the first clack of empire activity...<span class="console-cursor" aria-hidden="true"></span></div>`;
        this.lastConsoleKey = renderKey;
        if (shouldStick) feed.scrollTop = feed.scrollHeight;
        return;
      }

      feed.innerHTML = logs.map((entry, idx) => {
        const stamp = new Date(entry.time || Date.now()).toLocaleTimeString([], { hour12: false });
        const cursor = idx === logs.length - 1 ? '<span class="console-cursor" aria-hidden="true"></span>' : '';
        return `<div class="console-line ${entry.level || 'info'}"><span class="console-time">[${stamp}]</span><span class="console-text">${entry.message}${cursor}</span></div>`;
      }).join('');

      this.lastConsoleKey = renderKey;
      if (this.app.state.currentSuiteTab === 'console' && shouldStick) {
        feed.scrollTop = feed.scrollHeight;
        this.consolePinnedToBottom = true;
      } else {
        feed.scrollTop = previousScrollTop;
      }
    },

    updateLive(force = false, skipSoftRefresh = false) {
      const now = performance.now();
      if (!force && now - (this.lastLiveRefresh || 0) < 120) return;
      this.lastLiveRefresh = now;
      this.renderTop();
      this.updateBuddy();
      DATA.generatorDefs.forEach(def => {
        const gen = this.app.getGenState(def.id);
        const bar = document.querySelector(`[data-progress-id="${def.id}"]`);
        if (!bar) return;
        const pct = gen.owned ? Math.max(0, Math.min(100, (gen.progress / this.app.getCycleTime(def)) * 100)) : 0;
        bar.style.width = `${pct}%`;
      });
      if (!skipSoftRefresh && (force || now - this.lastSoftRefresh > 750)) {
        this.lastSoftRefresh = now;
        this.renderAchievements();
        this.renderSuitePanels();
        if (this.worldUtilityOpen && this.currentWorldUtility === 'shop') this.renderShop();
        if (this.app.state.currentSuiteTab === 'console') this.renderConsole();
        if (this.app.state.currentPanel === 'missions') {
          this.renderMissions();
          this.updateMissionsLive(force);
        }
        if (this.app.state.currentPanel === 'ops') {
          this.renderOpsIncidentSummary();
          this.updateOpsLive(force);
        }
        if (this.app.state.currentPanel === 'upgrades') this.updateUpgradesLive(force);
        if (this.app.state.currentPanel === 'staff') this.renderStaff();
        if (this.app.state.currentPanel === 'regions') this.updateRegionsLive(force);
        if (this.app.state.currentPanel === 'command') {
          this.renderPrestige();
          this.renderCommand();
          this.renderCollections();
        }
        if (this.app.state.currentPanel === 'overhaul') this.renderPrestige();
        if (this.app.state.currentPanel === 'achievements') this.renderCollections();
      }
      this.updateTabAvailabilityBadges();
      this.updateCurrentPanelCardDots();
    },

    updateBuddy() {
      return;
    },

    lookupCosmeticName(category, id) {
      return (DATA.cosmetics[category] || []).find(item => item.id === id)?.name || 'Default';
    },

    describeMissionReward(reward) {
      const bits = [];
      if (reward.credits) bits.push(`${this.app.formatNumber(reward.credits)} CC`);
      if (reward.research) bits.push(`${reward.research} RD`);
      if (reward.ipFragments) bits.push(`${reward.ipFragments} IP frag`);
      if (reward.incidentShield) bits.push(`${this.app.formatDuration(reward.incidentShield)} shield`);
      return bits.join(' • ');
    },

    describeChallengeGoal(goal = {}) {
      if (goal.managers) return `Hire ${goal.managers} managers`;
      if (goal.highestTier && goal.unlockedRegion) return `Reach tier ${goal.highestTier} and unlock ${this.app.getRegionDef(goal.unlockedRegion)?.name || goal.unlockedRegion}`;
      if (goal.highestTier) return `Reach tier ${goal.highestTier}`;
      if (goal.research) return `Stockpile ${goal.research} RD`;
      if (goal.unlockedRegion && goal.incidentsResolved) return `Unlock ${this.app.getRegionDef(goal.unlockedRegion)?.name || goal.unlockedRegion} and resolve ${goal.incidentsResolved} incidents`;
      if (goal.unlockedRegion) return `Unlock ${this.app.getRegionDef(goal.unlockedRegion)?.name || goal.unlockedRegion}`;
      return 'Complete the challenge conditions';
    },

    describeAchievementReward(reward) {
      const bits = [];
      if (reward.credits) bits.push(`${this.app.formatNumber(reward.credits)} CC`);
      if (reward.research) bits.push(`${reward.research} RD`);
      if (reward.ip) bits.push(`${reward.ip} IP`);
      return bits.join(' • ') || 'glory';
    },

    describeIncidentPenalties(incident) {
      const p = incident.penalties || {};
      const bits = [];
      if (p.incomeMult) bits.push(`income ${Math.round(p.incomeMult * 100)}%`);
      if (p.speedMult) bits.push(`speed ${Math.round(p.speedMult * 100)}%`);
      if (p.automatedMult) bits.push(`auto ${Math.round(p.automatedMult * 100)}%`);
      if (p.offlineEfficiencyDelta) bits.push(`offline ${Math.round(p.offlineEfficiencyDelta * 100)}%`);
      if (p.categoryMult) Object.entries(p.categoryMult).forEach(([k, v]) => bits.push(`${k} ${Math.round(v * 100)}%`));
      return bits.join(' • ');
    },

    describeEffectBundle(effects = {}) {
      const bits = [];
      if (effects.multiply) {
        Object.entries(effects.multiply).forEach(([key, value]) => {
          if (key === 'globalIncome') bits.push(`global income x${value}`);
          if (key === 'missionSpeed') bits.push(`mission speed x${value}`);
          if (key === 'missionReward') bits.push(`mission rewards x${value}`);
          if (key === 'automatedIncome') bits.push(`auto income x${value}`);
          if (key === 'researchBonus') bits.push(`research x${value}`);
          if (key === 'speed') bits.push(`cycle speed x${value}`);
        });
      }
      if (effects.add) {
        Object.entries(effects.add).forEach(([key, value]) => {
          if (key === 'missionSlots') bits.push(`+${value} mission team`);
          if (key === 'responsePower') bits.push(`response +${Math.round(value * 100)}%`);
          if (key === 'capacityBonus') bits.push(`capacity +${Math.round(value * 100)}%`);
          if (key === 'incidentDurationReduction') bits.push(`incident duration -${Math.round(value * 100)}%`);
          if (key === 'incidentChanceReduction') bits.push(`incident chance -${Math.round(value * 100)}%`);
          if (key === 'missionCooldownReduction') bits.push(`mission cooldown -${Math.round(value * 100)}%`);
        });
      }
      if (effects.categoryMultiply) {
        Object.entries(effects.categoryMultiply).forEach(([key, value]) => bits.push(`${key} x${value}`));
      }
      if (effects.categoryIncidentShield) {
        Object.entries(effects.categoryIncidentShield).forEach(([key, value]) => bits.push(`${key} incidents softened ${Math.round(value * 100)}%`));
      }
      return bits.join(' • ') || 'permanent regional bonus';
    },

    getSeverityClass(severity) {
      if (severity >= 2.7) return 'high';
      if (severity >= 1.6) return 'mid';
      return 'low';
    },

    toast(message, level = 'info') {
      if (!message || !this.els || !this.els.toast) return;
      if (this.app && this.app.pushConsoleLog) this.app.pushConsoleLog(message, level);
      this.els.toast.textContent = message;
      this.els.toast.classList.add('show');
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => {
        if (this.els && this.els.toast) this.els.toast.classList.remove('show');
      }, 2400);
      if (this.app?.state?.currentSuiteTab === 'console') this.renderConsole();
    },

    spawnPurchaseBurst(target, label) {
      if (!this.els.fxLayer || !target) return;
      const rect = target.getBoundingClientRect();
      const layerRect = this.els.fxLayer.getBoundingClientRect();
      const centerX = rect.left - layerRect.left + rect.width / 2;
      const centerY = rect.top - layerRect.top + rect.height / 2;
      const labelEl = document.createElement('div');
      labelEl.className = 'fx-dot fx-label';
      labelEl.textContent = label;
      labelEl.style.left = `${centerX}px`;
      labelEl.style.top = `${centerY}px`;
      labelEl.style.setProperty('--dx', `${jitter(-24, 24)}px`);
      labelEl.style.setProperty('--dy', `${jitter(-40, -10)}px`);
      this.els.fxLayer.appendChild(labelEl);
      for (let i = 0; i < 9; i += 1) {
        const spark = document.createElement('div');
        spark.className = 'fx-dot fx-spark';
        spark.textContent = '•';
        spark.style.left = `${centerX}px`;
        spark.style.top = `${centerY}px`;
        spark.style.setProperty('--dx', `${jitter(-42, 42)}px`);
        spark.style.setProperty('--dy', `${jitter(-50, 18)}px`);
        spark.style.opacity = '0.95';
        spark.style.fontSize = `${jitter(0.72, 1.08)}rem`;
        this.els.fxLayer.appendChild(spark);
        setTimeout(() => spark.remove(), 720);
      }
      setTimeout(() => labelEl.remove(), 820);
    },

    showBuddyLine(text) {
      if (!this.els.buddyBubble) return;
      this.els.buddyBubble.textContent = text;
      this.els.buddyBubble.classList.add('show');
      clearTimeout(this.buddyTimer);
      this.buddyTimer = setTimeout(() => this.els.buddyBubble.classList.remove('show'), 1800);
    },

    triggerIncidentAlert(incident) {
      this.currentAlertIncidentId = incident.uid || null;
      this.els.incidentAlertIcon.textContent = incident.icon || '🚨';
      this.els.incidentAlertTitle.textContent = `${incident.boss ? 'BOSS INCIDENT: ' : ''}${incident.name} detected`;
      this.els.incidentAlertText.textContent = `${incident.desc} Severity ${incident.severity.toFixed(1)}.${incident.boss ? ' This one is a table-slapper.' : ''}`;
      this.els.incidentAlertBtn.textContent = 'Go to Incident';
      this.els.incidentAlert.classList.remove('hidden');
      clearTimeout(this.alertTimer);
      this.alertTimer = setTimeout(() => this.hideIncidentAlert(), 5000);
      if (this.app?.state?.currentSuiteTab === 'console') this.renderConsole();
      this.playSiren();
    },

    hideIncidentAlert() {
      this.els.incidentAlert.classList.add('hidden');
    },

    primeAudio() {
      const ctx = this.getAudioContext();
      if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
      return ctx;
    },

    playSiren() {
      if (!this.app.state.soundEnabled) return;
      const ctx = this.primeAudio();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(660, now);
      for (let i = 0; i < 8; i += 1) {
        osc.frequency.linearRampToValueAtTime(i % 2 === 0 ? 860 : 620, now + 0.22 * (i + 1));
      }
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.05, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.9);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 2);
    },

    playSound(kind = 'buy') {
      if (!this.app.state.soundEnabled) return;
      const ctx = this.primeAudio();
      if (!ctx) return;
      const now = ctx.currentTime;
      this.soundStep = (this.soundStep || 0) + 1;
      this.lastSoundByKind = this.lastSoundByKind || {};

      const pickTone = (pool, key) => {
        if (!pool?.length) return 440;
        if (pool.length === 1) {
          this.lastSoundByKind[key] = pool[0];
          return pool[0];
        }
        let note = pool[Math.floor(Math.random() * pool.length)];
        if (pool.length > 1) {
          let guard = 0;
          while (note === this.lastSoundByKind[key] && guard < 6) {
            note = pool[Math.floor(Math.random() * pool.length)];
            guard += 1;
          }
        }
        this.lastSoundByKind[key] = note;
        return note;
      };

      if (kind === 'ui') {
        const length = Math.max(1, Math.floor(ctx.sampleRate * 0.018));
        const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
        const channel = buffer.getChannelData(0);
        for (let i = 0; i < length; i += 1) {
          const decay = 1 - i / length;
          channel[i] = (Math.random() * 2 - 1) * decay * 0.55;
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1650, now);
        filter.Q.value = 0.95;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.095, now + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);
        source.connect(filter).connect(gain).connect(ctx.destination);
        source.start(now);
        source.stop(now + 0.07);
        return;
      }

      const tonePools = {
        buy: [392.0, 440.0, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99],
        run: [349.23, 392.0, 440.0, 493.88, 523.25, 587.33],
        hire: [329.63, 392.0, 415.3, 466.16, 523.25, 587.33],
        prestige: [261.63, 329.63, 392.0],
        achievement: [659.25, 783.99, 1046.5, 1318.51],
        missionComplete: [523.25, 659.25, 783.99]
      };
      const pool = tonePools[kind] || tonePools.buy;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = kind === 'achievement' ? 'triangle' : (kind === 'prestige' ? 'sawtooth' : 'square');

      if (kind === 'missionComplete') {
        const seq = pool;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(seq[0], now);
        seq.slice(1).forEach((tone, index) => {
          osc.frequency.linearRampToValueAtTime(tone, now + 0.06 * (index + 1));
        });
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.04, now + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.014, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.26);
        return;
      }

      if (kind === 'achievement') {
        const seq = pool;
        osc.frequency.setValueAtTime(seq[0], now);
        seq.slice(1).forEach((tone, index) => {
          osc.frequency.linearRampToValueAtTime(tone, now + 0.085 * (index + 1));
        });
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.05, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.018, now + 0.22);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.36);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.38);
        return;
      }

      if (kind === 'prestige') {
        osc.frequency.setValueAtTime(pool[0], now);
        pool.slice(1).forEach((tone, index) => {
          osc.frequency.linearRampToValueAtTime(tone, now + 0.065 * (index + 1));
        });
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.04, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.26);
        return;
      }

      const note = pickTone(pool, kind);
      osc.frequency.setValueAtTime(note, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(kind === 'hire' ? 0.032 : 0.038, now + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    },

    getAudioContext() {
      if (this.audioCtx) return this.audioCtx;
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      this.audioCtx = new Ctx();
      return this.audioCtx;
    }
  };

  window.UptimeEmpireUI = UI;
})();
