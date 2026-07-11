
(function() {
  const TAU = Math.PI * 2;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const clampUnitOr = (value, fallback) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? clamp(numeric, 0, 1) : fallback;
  };
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = value => value * value * (3 - 2 * value);
  const WALL_PLACEMENT_FACES = ['back', 'left', 'front', 'right'];
  const DECOR_PLACEMENT_ZONES = {
    'neon-sign': 'wall', 'plant-wall': 'wall', 'wall-monitor': 'wall', 'framed-cert': 'wall', 'server-poster': 'wall', 'moon-window': 'wall',
    'uplink-map': 'wall', 'award-shelf': 'wall', 'maintenance-clock': 'wall', 'fiber-art': 'wall', 'incident-board': 'wall', 'snack-shelf': 'wall',
    'desk-mat': 'desk', 'tower-stack': 'desk', 'aquarium': 'desk', 'keyboard-glow': 'desk', 'mini-rack': 'desk', 'coffee-drone': 'desk',
    'desk-bonsai': 'desk', 'projector-pad': 'desk', 'lava-lamp': 'desk',
    'holo-globe': 'floor', 'chair-upgrade': 'floor', 'led-strip': 'floor', 'floor-runner': 'floor', 'hex-rug': 'floor', 'floor-bot': 'floor', 'light-grid': 'floor',
    'parts-bins': 'floor', 'retro-console': 'floor', 'bookcase': 'floor', 'model-sat': 'floor', 'cold-spares': 'floor', 'pendant-light': 'floor'
  };

  const THREE_CDN = 'https://unpkg.com/three@0.158.0/build/three.min.js';
  const ASSET = name => new URL(`assets/${name}`, document.baseURI).href;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = Array.from(document.scripts).find(script => script.src === src);
      if (existing) {
        if (existing.dataset.loaded === 'true') return resolve();
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.addEventListener('load', () => {
        script.dataset.loaded = 'true';
        resolve();
      }, { once: true });
      script.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
      document.head.appendChild(script);
    });
  }

  function makeCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  function base64ToUint8Array(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  function base64ToFloat32Array(base64) {
    const bytes = base64ToUint8Array(base64);
    return new Float32Array(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
  }

  class Office3DScene {
    constructor({ canvas, hintEl, modeEl, onArcadeInteract = null, onArcadeInput = null, onComputerInteract = null, onRobotInteract = null }) {
      this.canvas = canvas;
      this.hintEl = hintEl || null;
      this.modeEl = modeEl || null;
      this.onArcadeInteract = typeof onArcadeInteract === 'function' ? onArcadeInteract : null;
      this.onArcadeInput = typeof onArcadeInput === 'function' ? onArcadeInput : null;
      this.arcadeScreenRenderer = null;
      this.onComputerInteract = typeof onComputerInteract === 'function' ? onComputerInteract : null;
      this.onRobotInteract = typeof onRobotInteract === 'function' ? onRobotInteract : null;
      this.loaded = false;
      this.destroyed = false;
      this.width = 0;
      this.height = 0;
      this.state = {
        tier: 0,
        suiteName: 'Regular Office',
        decorations: [],
        wallFinish: 'default',
        floorFinish: 'default',
        deskFinish: 'default',
        chairFinish: 'default',
        placements: { wall: {}, floor: {}, desk: {} },
        floorBotProfile: { name: 'Floor Bot', voicePitch: 1, voiceSpeed: 1, speechFrequency: 1, voiceId: '', voiceEnabled: true, personality: 'funny' },
        soundEnabled: true
      };
      this.room = { width: 7.4, depth: 9.2, height: 3.4 };
      this.player = {
        x: 0,
        y: 1.62,
        z: 3.0,
        yaw: Math.PI,
        pitch: -0.05,
        bob: 0,
        walkPhase: 0
      };
      this.pointerLocked = false;
      this.keys = Object.create(null);
      this.mobileControls = {
        available: false,
        active: false,
        strafe: 0,
        forward: 0,
        movePointerId: null,
        lookPointerId: null,
        lastLookX: 0,
        lastLookY: 0,
        moveControl: null,
        moveStick: null,
        lookControl: null,
        interactControl: null
      };
      this.lastTime = performance.now();
      this.lastRenderAt = 0;
      this.nextOverlayUpdateAt = 0;
      this.lastHintMessage = '';
      this.lastModeLabel = '';
      this.graphicsQuality = 'performance';
      this.graphicsProfile = null;
      this.appliedGraphicsProfileKey = '';
      this.autoPerformanceFallback = false;
      this.renderCostSamples = [];
      this.performanceStats = { renderedFrames: 0, totalRenderCostMs: 0, lastRenderCostMs: 0 };
      this.obstacles = [];
      this.autoPath = [];
      this.autoStuckTimer = 0;
      this.autoIndex = 0;
      this.autoPauseUntil = 0;
      this.autoLookTarget = null;
      this.autoStuckTimer = 0;
      this.lastAutoPos = { x: 0, z: 0 };
      this.propGroups = [];
      this.dynamicDisplays = [];
      this.arcadeDisplay = null;
      this.arcadeScreenState = { mode: 'attract', title: 'UPTIME ARCADE' };
      this.visualQATargets = Object.create(null);
      this.animatedLavaLamps = [];
      this.animatedSceneObjects = [];
      this.animationObjectCacheDirty = true;
      this.screenInteractive = { position: { x: 0, z: 0 }, radius: 1.1 };
      this.computerInteractive = { position: { x: 0, z: -this.room.depth / 2 + 1.84 }, radius: 1.65, yaw: 0 };
      this.textures = Object.create(null);
      this.materials = Object.create(null);
      this.assetsReady = false;
      this.lastSceneSignature = '';
      this.serverRackAudioAnchor = { x: -this.room.width / 2 + 0.72, y: 1.12, z: -this.room.depth / 2 + 1.08 };
      this.officeAudioListener = null;
      this.serverAmbience = {
        listener: null,
        sound: null,
        bufferReady: false,
        decodePromise: null,
        loading: false,
        primed: false,
        failed: false
      };
      this.backgroundMusic = {
        listener: null,
        gain: null,
        buffers: [],
        decodePromise: null,
        loading: false,
        loaded: false,
        primed: false,
        failed: false,
        currentSource: null,
        currentTrack: null,
        lastTrackId: '',
        nextTimer: null,
        volume: 0.058
      };
      this.footstepAudio = {
        listener: null,
        gain: null,
        buffers: [],
        decodePromise: null,
        loading: false,
        loaded: false,
        primed: false,
        failed: false,
        lastTrackId: '',
        stepTimer: 0,
        wasMoving: false,
        activeSources: new Set(),
        volume: 0.21168
      };
      this.deskMonitorModel = {
        geometry: null,
        material: null,
        boundsSize: null,
        loaded: false,
        failed: false
      };
      this.raisingDeskModel = {
        loaded: false,
        failed: false,
        topGeometry: null,
        frameGeometry: null,
        boundsSize: null
      };
      this.chairModel = {
        loaded: false,
        failed: false,
        meshes: [],
        boundsSize: null,
        textureSources: null,
        loadedTextures: null
      };
      this.keyboardModel = {
        loaded: false,
        failed: false,
        meshes: [],
        boundsSize: null
      };
      this.mouseModel = {
        loaded: false,
        failed: false,
        meshes: [],
        boundsSize: null,
        textureSources: null,
        loadedTextures: null
      };
      this.lavaLampModel = {
        loaded: false,
        failed: false,
        parts: [],
        boundsSize: null
      };
      this.serverRackModel = {
        loaded: false,
        failed: false,
        parts: [],
        boundsSize: null
      };
      this.aestheticFloorTileModel = {
        loaded: false,
        failed: false,
        parts: [],
        boundsSize: null,
        textureDataUrl: '',
        texture: null,
        materialSpec: null
      };
      this.sciFiFloorTileModel = {
        loaded: false,
        failed: false,
        parts: [],
        boundsSize: null,
        textureDataUrl: '',
        texture: null,
        materialSpec: null
      };
      this.pendantLightModel = {
        loaded: false,
        failed: false,
        meshes: [],
        boundsSize: null
      };
      this.placementMode = null;
      this.moveMode = null;
      this.selectableDecor = [];
      this._placementRaycaster = null;
      this._boundPlacementPointerMove = this.handlePlacementPointerMove.bind(this);
      this._arcadeLoadId = 0;
      this.floorBot = { active: false, x: -2.35, z: 2.65, targetX: -2.35, targetZ: 2.65, state: 'patrol', timer: 0, routeIndex: 0, speechUntil: 0, speechText: '', loopCount: 0, dwellUntil: 0, speed: 0.78, lastLineAt: 0, patrolPoints: null };
      this._boundResize = this.resize.bind(this);
      this._boundLoop = this.loop.bind(this);
      this._boundMouseMove = this.handleMouseMove.bind(this);
      this._boundPointer = this.handlePointerLockChange.bind(this);
      this._boundPlacementWheel = this.handlePlacementWheel.bind(this);
      this._boundKey = this.handleKey.bind(this);
      this._boundBlur = this.handleBlur.bind(this);
      this._boundMobileMoveDown = this.handleMobileMoveDown.bind(this);
      this._boundMobileMoveMove = this.handleMobileMoveMove.bind(this);
      this._boundMobileMoveEnd = this.handleMobileMoveEnd.bind(this);
      this._boundMobileLookDown = this.handleMobileLookDown.bind(this);
      this._boundMobileLookMove = this.handleMobileLookMove.bind(this);
      this._boundMobileLookEnd = this.handleMobileLookEnd.bind(this);
      this._boundMobileInteract = this.handleMobileInteract.bind(this);
      this.bindEvents();
      this.boot();
    }

    static async ensureEngine() {
      if (window.THREE) return window.THREE;
      if (!Office3DScene._enginePromise) {
        Office3DScene._enginePromise = loadScript(THREE_CDN).then(() => {
          if (!window.THREE) throw new Error('Three.js did not initialize.');
          return window.THREE;
        });
      }
      return Office3DScene._enginePromise;
    }

    getGraphicsProfile() {
      const requested = ['auto', 'performance', 'balanced', 'quality'].includes(this.graphicsQuality) ? this.graphicsQuality : 'auto';
      const deviceMemory = Number(navigator.deviceMemory || 0);
      const lowPowerDevice = (Number(navigator.hardwareConcurrency || 0) > 0 && navigator.hardwareConcurrency <= 4) || (deviceMemory > 0 && deviceMemory <= 4);
      const effective = requested === 'auto'
        ? (this.autoPerformanceFallback || lowPowerDevice ? 'performance' : 'balanced')
        : requested;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, effective === 'performance' ? 0.85 : effective === 'balanced' ? 1 : 1.25);
      if (effective === 'performance') {
        return { requested, effective, pixelRatio, shadows: false, shadowMapSize: 512, activeFps: 30, idleFps: 15, displayInterval: 0.5, overlayInterval: 160 };
      }
      if (effective === 'quality') {
        return { requested, effective, pixelRatio, shadows: true, shadowMapSize: 1024, activeFps: 60, idleFps: 24, displayInterval: 0.12, overlayInterval: 70 };
      }
      return { requested, effective, pixelRatio, shadows: true, shadowMapSize: 512, activeFps: 45, idleFps: 20, displayInterval: 0.24, overlayInterval: 110 };
    }

    setGraphicsQuality(quality = 'performance', force = false) {
      this.graphicsQuality = ['auto', 'performance', 'balanced', 'quality'].includes(quality) ? quality : 'performance';
      const profile = this.getGraphicsProfile();
      const profileKey = `${profile.effective}:${profile.pixelRatio}:${profile.shadows}:${profile.shadowMapSize}`;
      this.graphicsProfile = profile;
      document.body?.classList.toggle('performance-graphics', profile.effective === 'performance');
      if (!force && profileKey === this.appliedGraphicsProfileKey) return;
      this.appliedGraphicsProfileKey = profileKey;
      if (!this.renderer) return;
      this.renderer.setPixelRatio(profile.pixelRatio);
      this.renderer.shadowMap.enabled = profile.shadows;
      this.renderer.shadowMap.type = profile.shadows && profile.effective === 'quality' ? this.THREE.PCFSoftShadowMap : this.THREE.BasicShadowMap;
      if (this.overheadLight) {
        this.overheadLight.castShadow = profile.shadows;
        this.overheadLight.shadow.mapSize.set(profile.shadowMapSize, profile.shadowMapSize);
      }
      this.renderer.shadowMap.needsUpdate = true;
      this.resize();
    }

    getRenderFrameInterval() {
      const profile = this.graphicsProfile || this.getGraphicsProfile();
      const active = this.isManualControlActive() || this.placementMode || this.moveMode || this.computerTransition || this.arcadeTransition;
      return 1000 / (active ? profile.activeFps : profile.idleFps);
    }

    recordRenderCost(costMs) {
      this.performanceStats.renderedFrames += 1;
      this.performanceStats.totalRenderCostMs += costMs;
      this.performanceStats.lastRenderCostMs = costMs;
      if (this.graphicsQuality !== 'auto' || this.autoPerformanceFallback) return;
      this.renderCostSamples.push(costMs);
      if (this.renderCostSamples.length > 45) this.renderCostSamples.shift();
      if (this.renderCostSamples.length < 30) return;
      const average = this.renderCostSamples.reduce((sum, value) => sum + value, 0) / this.renderCostSamples.length;
      if (average > 22) {
        this.autoPerformanceFallback = true;
        this.setGraphicsQuality('auto', true);
      }
    }

    async boot() {
      try {
        this.setHint('Loading 3D office suite…');
        const THREE = await Office3DScene.ensureEngine();
        if (this.destroyed) return;
        this.THREE = THREE;
        this.initThree();
        this.loaded = true;
        this.rebuildScene();
        this.resize();
        requestAnimationFrame(this._boundLoop);
        this.deferAssetPreload();
      } catch (error) {
        console.error(error);
        this.setHint('3D suite failed to load.');
      }
    }

    deferAssetPreload() {
      const start = () => {
        this.preloadAssets().then(() => {
          if (this.destroyed) return;
          this.rebuildScene();
          this.resize();
        }).catch(error => console.warn('Optional office assets could not finish loading.', error));
      };
      if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(start, { timeout: 1200 });
      } else {
        window.setTimeout(start, 260);
      }
    }

    yieldForAssetWork() {
      return new Promise(resolve => {
        if (typeof window.requestIdleCallback === 'function') {
          window.requestIdleCallback(() => resolve(), { timeout: 900 });
        } else {
          window.setTimeout(resolve, 32);
        }
      });
    }

    bindEvents() {
      if (!this.canvas) return;
      this.canvas.addEventListener('click', event => {
        if (!this.loaded) return;
        this.primeOfficeAudio();
        if (this.placementMode) {
          this.commitPlacementMode();
          event.preventDefault();
          return;
        }
        if (this.moveMode) {
          this.handleMoveModeClick(event);
          event.preventDefault();
          return;
        }
        if (this.arcadeHold && this.onArcadeInput) {
          const point = this.getArcadeScreenPointer(event);
          if (point) this.onArcadeInput({ type: 'pointer', ...point });
          event.preventDefault();
          return;
        }
        if (this.mobileControls.available) {
          this.activateMobileControls();
          event.preventDefault();
          return;
        }
        if (document.pointerLockElement !== this.canvas) {
          this.canvas.requestPointerLock?.();
        }
      });
      this.canvas.addEventListener('pointermove', this._boundPlacementPointerMove);
      this.canvas.addEventListener('wheel', this._boundPlacementWheel, { passive: false });
      document.addEventListener('pointerlockchange', this._boundPointer);
      document.addEventListener('mousemove', this._boundMouseMove);
      window.addEventListener('keydown', this._boundKey);
      window.addEventListener('keyup', this._boundKey);
      window.addEventListener('blur', this._boundBlur);
      window.addEventListener('resize', this._boundResize);
      this.bindMobileControls();
    }

    bindMobileControls() {
      const controls = this.mobileControls;
      controls.moveControl = document.getElementById('mobileMoveControl');
      controls.moveStick = document.getElementById('mobileMoveStick');
      controls.lookControl = document.getElementById('mobileLookControl');
      controls.interactControl = document.getElementById('mobileInteractControl');
      controls.moveControl?.addEventListener('pointerdown', this._boundMobileMoveDown);
      controls.moveControl?.addEventListener('pointermove', this._boundMobileMoveMove);
      controls.moveControl?.addEventListener('pointerup', this._boundMobileMoveEnd);
      controls.moveControl?.addEventListener('pointercancel', this._boundMobileMoveEnd);
      controls.lookControl?.addEventListener('pointerdown', this._boundMobileLookDown);
      controls.lookControl?.addEventListener('pointermove', this._boundMobileLookMove);
      controls.lookControl?.addEventListener('pointerup', this._boundMobileLookEnd);
      controls.lookControl?.addEventListener('pointercancel', this._boundMobileLookEnd);
      controls.interactControl?.addEventListener('pointerdown', this._boundMobileInteract);
      this.syncMobileControls();
    }

    isMobileControlsAvailable() {
      const coarsePointer = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
      return !!coarsePointer && Number(window.innerWidth || 0) <= 900;
    }

    syncMobileControls() {
      const controls = this.mobileControls;
      controls.available = this.isMobileControlsAvailable();
      if (!controls.available) {
        controls.active = false;
        this.clearMobileMove();
      }
      this.updateMobileControlsVisibility();
    }

    updateMobileControlsVisibility() {
      const controls = this.mobileControls;
      const visible = !!controls.available && !this.computerHold && !this.arcadeHold && !this.placementMode && !this.moveMode;
      document.body?.classList.toggle('mobile-office-controls-visible', visible);
    }

    isManualControlActive() {
      return this.pointerLocked || !!(this.mobileControls?.available && this.mobileControls.active);
    }

    activateMobileControls() {
      if (!this.mobileControls.available || !this.loaded || this.computerHold || this.arcadeHold || this.placementMode || this.moveMode) return;
      this.mobileControls.active = true;
      this.updateOverlay();
    }

    clearMobileMove() {
      const controls = this.mobileControls;
      if (!controls) return;
      controls.strafe = 0;
      controls.forward = 0;
      controls.movePointerId = null;
      if (controls.moveStick) controls.moveStick.style.transform = 'translate(-50%, -50%)';
    }

    updateMobileMove(event) {
      const controls = this.mobileControls;
      const pad = controls.moveControl;
      if (!pad) return;
      const rect = pad.getBoundingClientRect();
      const radius = Math.max(1, Math.min(rect.width, rect.height) * 0.31);
      let dx = event.clientX - (rect.left + rect.width / 2);
      let dy = event.clientY - (rect.top + rect.height / 2);
      const distance = Math.hypot(dx, dy);
      if (distance > radius) {
        dx = dx / distance * radius;
        dy = dy / distance * radius;
      }
      controls.strafe = dx / radius;
      controls.forward = -dy / radius;
      if (controls.moveStick) controls.moveStick.style.transform = `translate(-50%, -50%) translate(${dx}px, ${dy}px)`;
    }

    handleMobileMoveDown(event) {
      if (!this.mobileControls.available || event.pointerType === 'mouse') return;
      event.preventDefault();
      this.activateMobileControls();
      this.mobileControls.movePointerId = event.pointerId;
      this.mobileControls.moveControl?.setPointerCapture?.(event.pointerId);
      this.updateMobileMove(event);
    }

    handleMobileMoveMove(event) {
      if (event.pointerId !== this.mobileControls.movePointerId) return;
      event.preventDefault();
      this.updateMobileMove(event);
    }

    handleMobileMoveEnd(event) {
      if (event.pointerId !== this.mobileControls.movePointerId) return;
      event.preventDefault();
      this.clearMobileMove();
    }

    handleMobileLookDown(event) {
      if (!this.mobileControls.available || event.pointerType === 'mouse') return;
      event.preventDefault();
      this.activateMobileControls();
      const controls = this.mobileControls;
      controls.lookPointerId = event.pointerId;
      controls.lastLookX = event.clientX;
      controls.lastLookY = event.clientY;
      controls.lookControl?.setPointerCapture?.(event.pointerId);
    }

    handleMobileLookMove(event) {
      const controls = this.mobileControls;
      if (event.pointerId !== controls.lookPointerId) return;
      event.preventDefault();
      this.player.yaw -= (event.clientX - controls.lastLookX) * 0.008;
      this.player.pitch = clamp(this.player.pitch - (event.clientY - controls.lastLookY) * 0.006, -0.72, 0.72);
      controls.lastLookX = event.clientX;
      controls.lastLookY = event.clientY;
    }

    handleMobileLookEnd(event) {
      if (event.pointerId !== this.mobileControls.lookPointerId) return;
      event.preventDefault();
      this.mobileControls.lookPointerId = null;
    }

    handleMobileInteract(event) {
      if (!this.mobileControls.available || event.pointerType === 'mouse') return;
      event.preventDefault();
      this.activateMobileControls();
      this.primeOfficeAudio();
      this.performNearbyInteraction();
    }

    destroy() {
      this.destroyed = true;
      if (this.canvas) {
        this.canvas.removeEventListener('pointermove', this._boundPlacementPointerMove);
        this.canvas.removeEventListener('wheel', this._boundPlacementWheel);
      }
      const controls = this.mobileControls;
      controls.moveControl?.removeEventListener('pointerdown', this._boundMobileMoveDown);
      controls.moveControl?.removeEventListener('pointermove', this._boundMobileMoveMove);
      controls.moveControl?.removeEventListener('pointerup', this._boundMobileMoveEnd);
      controls.moveControl?.removeEventListener('pointercancel', this._boundMobileMoveEnd);
      controls.lookControl?.removeEventListener('pointerdown', this._boundMobileLookDown);
      controls.lookControl?.removeEventListener('pointermove', this._boundMobileLookMove);
      controls.lookControl?.removeEventListener('pointerup', this._boundMobileLookEnd);
      controls.lookControl?.removeEventListener('pointercancel', this._boundMobileLookEnd);
      controls.interactControl?.removeEventListener('pointerdown', this._boundMobileInteract);
      document.removeEventListener('pointerlockchange', this._boundPointer);
      document.removeEventListener('mousemove', this._boundMouseMove);
      window.removeEventListener('keydown', this._boundKey);
      window.removeEventListener('keyup', this._boundKey);
      window.removeEventListener('blur', this._boundBlur);
      window.removeEventListener('resize', this._boundResize);
      try {
        this.stopBackgroundMusicAudio();
        this.stopFootstepAudio();
        const ambience = this.serverAmbience;
        if (ambience?.sound?.isPlaying) ambience.sound.stop();
      } catch (error) {
        console.warn('Could not stop office audio cleanly.', error);
      }
      if (this.renderer) this.renderer.dispose();
    }

    handleBlur() {
      this.keys = Object.create(null);
      this.clearMobileMove();
    }

    handlePointerLockChange() {
      this.pointerLocked = document.pointerLockElement === this.canvas;
      this.updateOverlay();
    }

    releaseManualControl() {
      if (document.pointerLockElement === this.canvas) document.exitPointerLock?.();
      this.pointerLocked = false;
      this.keys = Object.create(null);
      this.mobileControls.active = false;
      this.clearMobileMove();
      this.updateOverlay();
    }

    resumeManualControl() {
      if (!this.canvas || !this.loaded || this.computerHold || this.arcadeHold) return;
      if (this.mobileControls.available) {
        this.activateMobileControls();
        return;
      }
      if (document.pointerLockElement === this.canvas) {
        this.pointerLocked = true;
        this.updateOverlay();
        return;
      }
      try {
        this.canvas.focus?.();
        const lockRequest = this.canvas.requestPointerLock?.();
        if (lockRequest && typeof lockRequest.catch === 'function') {
          lockRequest.catch(() => {
            this.pointerLocked = document.pointerLockElement === this.canvas;
            this.updateOverlay('click the room once to resume mouse look');
          });
        }
      } catch (error) {
        this.pointerLocked = document.pointerLockElement === this.canvas;
        this.updateOverlay('click the room once to resume mouse look');
      }
    }

    handleMouseMove(event) {
      if (this.placementMode || this.moveMode) return;
      if (!this.pointerLocked || !this.loaded) return;
      this.player.yaw -= event.movementX * 0.0022;
      this.player.pitch = clamp(this.player.pitch - event.movementY * 0.0020, -0.72, 0.72);
    }

    normalizeWallFace(face) {
      return WALL_PLACEMENT_FACES.includes(face) ? face : 'back';
    }

    getWallFaceLabel(face) {
      return {
        back: 'Back',
        left: 'Left',
        front: 'Front',
        right: 'Right'
      }[this.normalizeWallFace(face)] || 'Back';
    }

    getNearestWallFaceFromYaw(yaw = this.player?.yaw || 0) {
      const rawYaw = Number.isFinite(Number(yaw)) ? Number(yaw) : 0;
      const normalizedYaw = ((rawYaw % TAU) + TAU) % TAU;
      const candidates = [
        { face: 'back', yaw: 0 },
        { face: 'left', yaw: Math.PI / 2 },
        { face: 'front', yaw: Math.PI },
        { face: 'right', yaw: Math.PI * 1.5 }
      ];
      let best = candidates[0];
      let bestDelta = Infinity;
      candidates.forEach(candidate => {
        const delta = Math.abs(Math.atan2(Math.sin(normalizedYaw - candidate.yaw), Math.cos(normalizedYaw - candidate.yaw)));
        if (delta < bestDelta) {
          bestDelta = delta;
          best = candidate;
        }
      });
      return best.face;
    }

    getNearestSurfaceViewIndexFromYaw(yaw = this.player?.yaw || 0) {
      const rawYaw = Number.isFinite(Number(yaw)) ? Number(yaw) : 0;
      const normalizedYaw = ((rawYaw % TAU) + TAU) % TAU;
      const candidates = [
        { index: 0, yaw: 0 },
        { index: 1, yaw: Math.PI * 1.5 },
        { index: 2, yaw: Math.PI },
        { index: 3, yaw: Math.PI / 2 }
      ];
      let best = candidates[0];
      let bestDelta = Infinity;
      candidates.forEach(candidate => {
        const delta = Math.abs(Math.atan2(Math.sin(normalizedYaw - candidate.yaw), Math.cos(normalizedYaw - candidate.yaw)));
        if (delta < bestDelta) {
          bestDelta = delta;
          best = candidate;
        }
      });
      return best.index;
    }

    getWallPlacementBounds(face = 'back') {
      const room = this.room || { width: 7.4, depth: 9.2, height: 3.4 };
      const wallFace = this.normalizeWallFace(face);
      const marginSide = 0.55;
      const marginTop = 0.38;
      const marginBottom = 0.72;
      const depthInset = 0.075;
      const vertical = {
        min: marginBottom,
        max: Math.max(marginBottom + 0.6, room.height - marginTop)
      };
      if (wallFace === 'left' || wallFace === 'right') {
        return {
          face: wallFace,
          minAlong: -room.depth / 2 + 0.8,
          maxAlong: room.depth / 2 - 0.8,
          minY: vertical.min,
          maxY: vertical.max,
          x: wallFace === 'left' ? -room.width / 2 + depthInset : room.width / 2 - depthInset
        };
      }
      return {
        face: wallFace,
        minAlong: -room.width / 2 + marginSide,
        maxAlong: room.width / 2 - marginSide,
        minY: vertical.min,
        maxY: vertical.max,
        z: wallFace === 'back' ? -room.depth / 2 + depthInset : room.depth / 2 - depthInset
      };
    }

    normalizeWallPlacement(point, face = 'back') {
      const b = this.getWallPlacementBounds(face);
      const alongValue = b.face === 'left' || b.face === 'right' ? point.z : point.x;
      const x = clamp((alongValue - b.minAlong) / Math.max(0.001, b.maxAlong - b.minAlong), 0, 1);
      const y = clamp((point.y - b.minY) / Math.max(0.001, b.maxY - b.minY), 0, 1);
      return { x, y, face: b.face };
    }

    wallPlacementToWorld(placement = { x: 0.5, y: 0.55, face: 'back' }) {
      const face = this.normalizeWallFace(placement.face);
      const b = this.getWallPlacementBounds(face);
      const px = Number.isFinite(Number(placement.x)) ? Number(placement.x) : 0.5;
      const py = Number.isFinite(Number(placement.y)) ? Number(placement.y) : 0.55;
      const along = lerp(b.minAlong, b.maxAlong, clamp(px, 0, 1));
      const vertical = lerp(b.minY, b.maxY, clamp(py, 0, 1));
      if (face === 'left') return { x: b.x, y: vertical, z: along, rotationY: Math.PI / 2, face };
      if (face === 'right') return { x: b.x, y: vertical, z: along, rotationY: -Math.PI / 2, face };
      if (face === 'front') return { x: along, y: vertical, z: b.z, rotationY: Math.PI, face };
      return { x: along, y: vertical, z: b.z, rotationY: 0, face };
    }

    getWallPlacementPlane(face = 'back') {
      const THREE = this.THREE;
      const wallFace = this.normalizeWallFace(face);
      const b = this.getWallPlacementBounds(wallFace);
      if (wallFace === 'left') return new THREE.Plane(new THREE.Vector3(1, 0, 0), -b.x);
      if (wallFace === 'right') return new THREE.Plane(new THREE.Vector3(-1, 0, 0), b.x);
      if (wallFace === 'front') return new THREE.Plane(new THREE.Vector3(0, 0, -1), b.z);
      return new THREE.Plane(new THREE.Vector3(0, 0, 1), -b.z);
    }

    getPlacementViewForFace(face = 'back') {
      const wallFace = this.normalizeWallFace(face);
      const room = this.room || { width: 7.4, depth: 9.2, height: 3.4 };
      const poses = {
        back: { x: 0, z: Math.max(1.25, room.depth / 2 - 2.35), yaw: 0, pitch: -0.08 },
        front: { x: 0, z: Math.min(-1.25, -room.depth / 2 + 2.35), yaw: Math.PI, pitch: -0.08 },
        left: { x: Math.max(1.2, room.width / 2 - 1.85), z: 0, yaw: Math.PI / 2, pitch: -0.08 },
        right: { x: Math.min(-1.2, -room.width / 2 + 1.85), z: 0, yaw: -Math.PI / 2, pitch: -0.08 }
      };
      return poses[wallFace] || poses.back;
    }

    applyPlacementView(face = 'back') {
      const view = this.getPlacementViewForFace(face);
      this.player.x = view.x;
      this.player.z = view.z;
      this.player.yaw = view.yaw;
      this.player.pitch = view.pitch;
      this.player.bob = 0;
      this.updateOverlay('placement mode');
    }

    cyclePlacementWall(step = 1) {
      if (!this.placementMode || this.placementMode.zone !== 'wall') return;
      const currentFace = this.normalizeWallFace(this.placementMode.face);
      const currentIndex = Math.max(0, WALL_PLACEMENT_FACES.indexOf(currentFace));
      const nextIndex = (currentIndex + step + WALL_PLACEMENT_FACES.length) % WALL_PLACEMENT_FACES.length;
      const nextFace = WALL_PLACEMENT_FACES[nextIndex];
      this.placementMode.face = nextFace;
      this.placementMode.placement.face = nextFace;
      this.applyPlacementView(nextFace);
      this.positionPlacementGhost(this.placementMode.placement);
    }

    cyclePlacementSide(step = 1) {
      if (!this.placementMode) return;
      const zone = this.normalizePlacementZone(this.placementMode.zone || 'wall');
      if (zone === 'wall') {
        this.cyclePlacementWall(step);
        return;
      }
      this.cycleSurfacePlacementView(step);
    }

    setDecorMoveModeView({ viewZone = 'wall', face = 'back', viewIndex = 0 } = {}) {
      if (!this.moveMode) return;
      const safeZone = this.normalizePlacementZone(viewZone);
      if (safeZone === 'desk') {
        this.moveMode.viewZone = 'desk';
        this.moveMode.viewIndex = 0;
        this.moveMode.face = this.normalizeWallFace(face || this.moveMode.face || 'back');
        this.applyDecorPlacementView('desk', this.moveMode.face, 0);
      } else if (safeZone === 'floor') {
        const index = ((Math.round(Number(viewIndex) || 0) % 4) + 4) % 4;
        this.moveMode.viewZone = 'floor';
        this.moveMode.viewIndex = index;
        this.moveMode.face = this.normalizeWallFace(face || this.moveMode.face || 'back');
        this.applyDecorPlacementView('floor', this.moveMode.face, index);
      } else {
        const normalizedFace = this.normalizeWallFace(face || this.moveMode.face || 'back');
        this.moveMode.viewZone = 'wall';
        this.moveMode.viewIndex = 0;
        this.moveMode.face = normalizedFace;
        this.applyPlacementView(normalizedFace);
      }
      this.updateOverlay('move mode');
    }

    applyMoveModeWallView(face = 'back') {
      this.setDecorMoveModeView({ viewZone: 'wall', face });
    }

    cycleMoveModeWall(step = 1) {
      if (!this.moveMode) return;
      const viewZone = this.normalizePlacementZone(this.moveMode.viewZone || 'wall');
      if (viewZone === 'floor') {
        const current = Number.isFinite(Number(this.moveMode.viewIndex)) ? Number(this.moveMode.viewIndex) : 0;
        const next = ((current + step) % 4 + 4) % 4;
        this.setDecorMoveModeView({ viewZone: 'floor', face: this.moveMode.face || 'back', viewIndex: next });
        return;
      }
      if (viewZone === 'desk') return;
      const currentFace = this.normalizeWallFace(this.moveMode.face || 'back');
      const currentIndex = Math.max(0, WALL_PLACEMENT_FACES.indexOf(currentFace));
      const nextIndex = (currentIndex + step + WALL_PLACEMENT_FACES.length) % WALL_PLACEMENT_FACES.length;
      this.setDecorMoveModeView({ viewZone: 'wall', face: WALL_PLACEMENT_FACES[nextIndex] || 'back' });
    }

    getSurfacePlacementViewPose(zone = 'floor', viewIndex = 0) {
      const safeZone = this.normalizePlacementZone(zone);
      const room = this.room || { width: 7.4, depth: 9.2, height: 3.4 };
      const index = ((Math.round(Number(viewIndex) || 0) % 4) + 4) % 4;
      if (safeZone === 'desk') return { x: 0, z: -room.depth / 2 + 2.55, yaw: 0, pitch: -0.34 };
      const poses = [
        { x: 0, z: room.depth / 2 - 1.8, yaw: 0, pitch: -0.52 },
        { x: Math.min(-1.15, -room.width / 2 + 1.55), z: 0, yaw: -Math.PI / 2, pitch: -0.52 },
        { x: 0, z: -room.depth / 2 + 1.8, yaw: Math.PI, pitch: -0.52 },
        { x: Math.max(1.15, room.width / 2 - 1.55), z: 0, yaw: Math.PI / 2, pitch: -0.52 }
      ];
      return poses[index] || poses[0];
    }

    cycleSurfacePlacementView(step = 1) {
      if (!this.placementMode) return;
      const zone = this.normalizePlacementZone(this.placementMode.zone || 'floor');
      if (zone === 'wall') return;
      const current = Number.isFinite(Number(this.placementMode.viewIndex)) ? Number(this.placementMode.viewIndex) : 0;
      const next = ((current + step) % 4 + 4) % 4;
      this.placementMode.viewIndex = next;
      this.applyDecorPlacementView(zone, this.placementMode.face || 'back', next);
      this.positionPlacementGhost(this.placementMode.placement);
    }

    rotatePlacementItem(step = 1) {
      if (!this.placementMode) return;
      const zone = this.normalizePlacementZone(this.placementMode.zone || 'wall');
      if (zone === 'wall') return;
      const increment = zone === 'floor' ? Math.PI / 2 : Math.PI / 12;
      const direction = Number(step) < 0 ? -1 : 1;
      const current = Number.isFinite(Number(this.placementMode.placement?.rotation)) ? Number(this.placementMode.placement.rotation) : 0;
      const snapped = Math.round(current / increment) * increment;
      this.placementMode.placement.rotation = snapped + increment * direction;
      this.positionPlacementGhost(this.placementMode.placement);
    }

    getWallPlacementFromPointer(event, face = null) {
      if (!this.camera || !this.canvas || !this.THREE) return null;
      const THREE = this.THREE;
      const wallFace = this.normalizeWallFace(face || this.placementMode?.face || 'back');
      const rect = this.canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      const ndc = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -(((event.clientY - rect.top) / rect.height) * 2 - 1)
      );
      if (!this._placementRaycaster) this._placementRaycaster = new THREE.Raycaster();
      this._placementRaycaster.setFromCamera(ndc, this.camera);
      const plane = this.getWallPlacementPlane(wallFace);
      const point = new THREE.Vector3();
      const hit = this._placementRaycaster.ray.intersectPlane(plane, point);
      if (!hit) return null;
      const b = this.getWallPlacementBounds(wallFace);
      if (wallFace === 'left' || wallFace === 'right') {
        point.z = clamp(point.z, b.minAlong, b.maxAlong);
        point.x = b.x;
      } else {
        point.x = clamp(point.x, b.minAlong, b.maxAlong);
        point.z = b.z;
      }
      point.y = clamp(point.y, b.minY, b.maxY);
      return this.normalizeWallPlacement(point, wallFace);
    }

    tagDecorAsMoveTarget(group, { id = '', zone = 'floor', placement = null } = {}) {
      if (!group || !id) return group;
      const target = { id, zone: this.normalizePlacementZone(zone) };
      if (placement && typeof placement === 'object') target.placement = Object.assign({}, placement);
      group.userData.decorMoveTarget = target;
      group.traverse?.(child => {
        child.userData.decorMoveTarget = target;
      });
      return group;
    }

    registerSelectableDecor(group, data = {}) {
      if (!group || data.ghost) return group;
      this.tagDecorAsMoveTarget(group, data);
      if (!this.selectableDecor) this.selectableDecor = [];
      this.selectableDecor.push(group);
      return group;
    }

    getDecorMoveTargetFromObject(object) {
      let node = object;
      while (node) {
        if (node.userData?.decorMoveTarget) return node.userData.decorMoveTarget;
        node = node.parent;
      }
      return null;
    }

    pickDecorMoveTarget(event) {
      if (!this.camera || !this.canvas || !this.THREE || !this.selectableDecor?.length) return null;
      const THREE = this.THREE;
      const rect = this.canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      const ndc = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -(((event.clientY - rect.top) / rect.height) * 2 - 1)
      );
      if (!this._placementRaycaster) this._placementRaycaster = new THREE.Raycaster();
      this._placementRaycaster.setFromCamera(ndc, this.camera);
      const hits = this._placementRaycaster.intersectObjects(this.selectableDecor, true);
      for (const hit of hits) {
        const target = this.getDecorMoveTargetFromObject(hit.object);
        if (target?.id) return Object.assign({}, target);
      }
      return null;
    }

    handleMoveModeClick(event) {
      if (!this.moveMode) return;
      const picked = this.pickDecorMoveTarget(event);
      if (!picked) {
        this.updateOverlay('click a placed shop item');
        return;
      }
      const mode = this.moveMode;
      picked.moveModeView = {
        viewZone: this.normalizePlacementZone(mode.viewZone || 'wall'),
        face: this.normalizeWallFace(mode.face || 'back'),
        viewIndex: Number.isFinite(Number(mode.viewIndex)) ? Number(mode.viewIndex) : 0
      };
      this.finishDecorMoveMode(false);
      if (mode.onSelect) mode.onSelect(picked);
    }

    startDecorMoveMode({ onSelect = null, onCancel = null, face = null, viewZone = 'wall', viewIndex = 0 } = {}) {
      if (!this.loaded || !this.root) return;
      const safeViewZone = this.normalizePlacementZone(viewZone);
      const startingFace = WALL_PLACEMENT_FACES.includes(face)
        ? face
        : (safeViewZone === 'wall' ? this.getNearestWallFaceFromYaw(this.player?.yaw) : 'back');
      this.releaseManualControl();
      this.pointerLocked = false;
      this.keys = Object.create(null);
      this.cancelPlacementMode(false);
      this.dockFloorBotForMoveMode();
      this.moveMode = {
        face: this.normalizeWallFace(startingFace),
        viewZone: safeViewZone,
        viewIndex: Number.isFinite(Number(viewIndex)) ? Number(viewIndex) : 0,
        onSelect: typeof onSelect === 'function' ? onSelect : null,
        onCancel: typeof onCancel === 'function' ? onCancel : null
      };
      this.setDecorMoveModeView({ viewZone: this.moveMode.viewZone, face: this.moveMode.face, viewIndex: this.moveMode.viewIndex });
      this.canvas?.classList.add('is-moving-decor');
      this.updateOverlay('move mode');
    }

    finishDecorMoveMode(notify = false) {
      const mode = this.moveMode;
      this.moveMode = null;
      this.canvas?.classList.remove('is-moving-decor');
      this.updateOverlay();
      if (notify && mode?.onCancel) mode.onCancel();
    }

    cancelDecorMoveMode(notify = true) {
      if (!this.moveMode) return;
      this.finishDecorMoveMode(notify);
    }

    handlePlacementPointerMove(event) {
      if (!this.placementMode || !this.loaded) return;
      const placement = this.getPlacementFromPointer(event);
      if (!placement) return;
      this.placementMode.placement = placement;
      if (placement.face) this.placementMode.face = placement.face;
      this.positionPlacementGhost(placement);
    }

    handlePlacementWheel(event) {
      if (!this.placementMode || !this.loaded) return;
      const zone = this.normalizePlacementZone(this.placementMode.zone || 'wall');
      if (zone !== 'floor') return;
      const delta = Number(event.deltaY || 0);
      if (!Number.isFinite(delta) || Math.abs(delta) < 0.01) return;
      this.rotatePlacementItem(delta < 0 ? 1 : -1);
      event.preventDefault();
      event.stopPropagation();
    }

    normalizePlacementZone(zone = 'wall') {
      return ['wall', 'floor', 'desk'].includes(zone) ? zone : 'floor';
    }

    normalizeStoredPlacement(zone = 'floor', placement = null) {
      if (!placement || typeof placement !== 'object') return null;
      const safeZone = this.normalizePlacementZone(zone);
      const rawX = Number(placement.x);
      const rawY = Number(placement.y);
      if (!Number.isFinite(rawX) || !Number.isFinite(rawY)) return null;
      const normalized = { x: clamp(rawX, 0, 1), y: clamp(rawY, 0, 1) };
      if (safeZone === 'wall') {
        normalized.face = this.normalizeWallFace(placement.face || 'back');
      } else {
        normalized.rotation = Number.isFinite(Number(placement.rotation)) ? Number(placement.rotation) : 0;
      }
      return normalized;
    }

    getDecorPlacementZone(id) {
      return this.normalizePlacementZone(DECOR_PLACEMENT_ZONES[id] || 'floor');
    }

    getFloorBotDockPlacement() {
      const saved = (((this.state.placements || {}).floor || {})['floor-bot']) || null;
      return saved ? Object.assign({}, saved) : this.getDefaultDecorPlacement('floor-bot', 'floor');
    }

    getFloorBotDockWorld() {
      return this.decorPlacementToWorld('floor', this.getFloorBotDockPlacement());
    }

    dockFloorBotForMoveMode() {
      if (!this.floorBot?.active) return;
      const dockWorld = this.getFloorBotDockWorld();
      const rotationY = Number.isFinite(Number(dockWorld.rotationY)) ? Number(dockWorld.rotationY) : 0;
      const restingX = dockWorld.x;
      const restingZ = dockWorld.z + Math.cos(rotationY) * 0.12;
      const bot = this.floorBot;
      bot.homeX = restingX;
      bot.homeZ = restingZ;
      bot.x = restingX;
      bot.z = restingZ;
      bot.targetX = restingX;
      bot.targetZ = restingZ;
      bot.state = 'charging';
      bot.routeIndex = 0;
      bot.loopCount = 0;
      bot.dwellUntil = performance.now() + 60000;
      bot.chargeUntil = performance.now() + 60000;
      bot.hasAnnouncedResume = false;
      bot.patrolStartedAt = 0;
      bot.speechText = '';
      bot.speechUntil = 0;
      if (bot.mesh) {
        bot.mesh.position.set(restingX, 0, restingZ);
        bot.mesh.rotation.y = rotationY;
      }
    }

    getSurfacePlacementBounds(zone = 'floor') {
      const room = this.room || { width: 7.4, depth: 9.2, height: 3.4 };
      const safeZone = this.normalizePlacementZone(zone);
      if (safeZone === 'desk') {
        const deskZ = -room.depth / 2 + 0.62;
        return { zone: safeZone, minX: -1.05, maxX: 1.05, minZ: deskZ - 0.14, maxZ: deskZ + 0.54, y: 0.855 };
      }
      return { zone: 'floor', minX: -room.width / 2 + 0.7, maxX: room.width / 2 - 0.7, minZ: -room.depth / 2 + 0.7, maxZ: room.depth / 2 - 0.7, y: 0.018 };
    }

    decorPlacementToWorld(zone = 'floor', placement = { x: 0.5, y: 0.5 }) {
      const safeZone = this.normalizePlacementZone(zone);
      if (safeZone === 'wall') return this.wallPlacementToWorld(placement);
      const b = this.getSurfacePlacementBounds(safeZone);
      const px = Number.isFinite(Number(placement.x)) ? Number(placement.x) : 0.5;
      const py = Number.isFinite(Number(placement.y)) ? Number(placement.y) : 0.5;
      const rotationY = Number.isFinite(Number(placement.rotation)) ? Number(placement.rotation) : 0;
      return { x: lerp(b.minX, b.maxX, clamp(px, 0, 1)), y: b.y, z: lerp(b.minZ, b.maxZ, clamp(py, 0, 1)), rotationY, zone: safeZone };
    }

    getSurfacePlacementFromPointer(event, zone = 'floor') {
      if (!this.camera || !this.canvas || !this.THREE) return null;
      const THREE = this.THREE;
      const safeZone = this.normalizePlacementZone(zone);
      const b = this.getSurfacePlacementBounds(safeZone);
      const rect = this.canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      const ndc = new THREE.Vector2(((event.clientX - rect.left) / rect.width) * 2 - 1, -(((event.clientY - rect.top) / rect.height) * 2 - 1));
      if (!this._placementRaycaster) this._placementRaycaster = new THREE.Raycaster();
      this._placementRaycaster.setFromCamera(ndc, this.camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -b.y);
      const point = new THREE.Vector3();
      const hit = this._placementRaycaster.ray.intersectPlane(plane, point);
      if (!hit) return null;
      point.x = clamp(point.x, b.minX, b.maxX);
      point.z = clamp(point.z, b.minZ, b.maxZ);
      return {
        x: clamp((point.x - b.minX) / Math.max(0.001, b.maxX - b.minX), 0, 1),
        y: clamp((point.z - b.minZ) / Math.max(0.001, b.maxZ - b.minZ), 0, 1),
        rotation: Number.isFinite(Number(this.placementMode?.placement?.rotation)) ? Number(this.placementMode.placement.rotation) : 0
      };
    }

    getPlacementFromPointer(event) {
      const zone = this.normalizePlacementZone(this.placementMode?.zone || 'wall');
      return zone === 'wall' ? this.getWallPlacementFromPointer(event) : this.getSurfacePlacementFromPointer(event, zone);
    }

    getPlacementViewForZone(zone = 'floor', viewIndex = 0) {
      const safeZone = this.normalizePlacementZone(zone);
      if (safeZone === 'wall') return this.getPlacementViewForFace('back');
      return this.getSurfacePlacementViewPose(safeZone, viewIndex);
    }

    applyDecorPlacementView(zone = 'wall', face = 'back', viewIndex = 0) {
      const safeZone = this.normalizePlacementZone(zone);
      const view = safeZone === 'wall' ? this.getPlacementViewForFace(face) : this.getPlacementViewForZone(safeZone, viewIndex);
      this.player.x = view.x;
      this.player.z = view.z;
      this.player.yaw = view.yaw;
      this.player.pitch = view.pitch;
      this.player.bob = 0;
      this.updateOverlay('placement mode');
    }

    startWallPlacement(args = {}) {
      this.startDecorPlacement(Object.assign({}, args, { zone: 'wall' }));
    }

    startDecorPlacement({ zone = 'wall', itemId, itemName = 'decor', placement = null, viewIndex = 0, onPlace = null, onCancel = null } = {}) {
      const safeZone = this.normalizePlacementZone(zone);
      if (!itemId || !this.loaded || !this.root) return;
      this.releaseManualControl();
      this.pointerLocked = false;
      this.keys = Object.create(null);
      this.cancelPlacementMode(false);
      const safePlacement = placement || (safeZone === 'wall' ? { x: 0.5, y: 0.56, face: 'back' } : { x: 0.5, y: 0.5 });
      const normalizedFace = safeZone === 'wall' ? this.normalizeWallFace(safePlacement.face) : null;
      const normalizedPlacement = {
        x: clampUnitOr(safePlacement.x, 0.5),
        y: clampUnitOr(safePlacement.y, safeZone === 'wall' ? 0.56 : 0.5)
      };
      if (safeZone === 'wall') normalizedPlacement.face = normalizedFace;
      else normalizedPlacement.rotation = Number.isFinite(Number(safePlacement.rotation)) ? Number(safePlacement.rotation) : 0;
      const initialViewIndex = safeZone === 'floor'
        ? (Number.isFinite(Number(viewIndex)) ? ((Math.round(Number(viewIndex)) % 4) + 4) % 4 : this.getNearestSurfaceViewIndexFromYaw(this.player?.yaw))
        : 0;
      this.applyDecorPlacementView(safeZone, normalizedFace || 'back', initialViewIndex);
      const ghost = safeZone === 'wall'
        ? this.createPlacedWallDecoration(itemId, normalizedPlacement, { ghost: true, label: itemName })
        : this.createPlacedPropDecoration(itemId, safeZone, normalizedPlacement, { ghost: true, label: itemName });
      this.placementMode = {
        zone: safeZone,
        face: normalizedFace,
        itemId,
        itemName,
        placement: normalizedPlacement,
        viewIndex: initialViewIndex,
        ghost,
        onPlace: typeof onPlace === 'function' ? onPlace : null,
        onCancel: typeof onCancel === 'function' ? onCancel : null
      };
      this.positionPlacementGhost(this.placementMode.placement);
      this.canvas?.classList.add('is-placing-wall-decor');
      this.updateOverlay('placement mode');
    }

    positionPlacementGhost(placement) {
      if (!this.placementMode?.ghost) return;
      const zone = this.normalizePlacementZone(this.placementMode.zone || 'wall');
      if (zone === 'wall') {
        const pos = this.wallPlacementToWorld(placement);
        const offset = 0.025;
        this.placementMode.ghost.position.set(
          pos.x + (pos.face === 'left' ? offset : pos.face === 'right' ? -offset : 0),
          pos.y,
          pos.z + (pos.face === 'back' ? offset : pos.face === 'front' ? -offset : 0)
        );
        this.placementMode.ghost.rotation.set(0, pos.rotationY || 0, 0);
        return;
      }
      const pos = this.decorPlacementToWorld(zone, placement);
      this.placementMode.ghost.position.set(pos.x, pos.y, pos.z);
      this.placementMode.ghost.rotation.set(0, pos.rotationY || 0, 0);
    }

    commitPlacementMode() {
      if (!this.placementMode) return;
      const mode = this.placementMode;
      const zone = this.normalizePlacementZone(mode.zone || 'wall');
      const placement = {
        x: clampUnitOr(mode.placement?.x, 0.5),
        y: clampUnitOr(mode.placement?.y, zone === 'wall' ? 0.56 : 0.5)
      };
      if (zone === 'wall') placement.face = this.normalizeWallFace(mode.face || mode.placement?.face || 'back');
      else {
        placement.rotation = Number.isFinite(Number(mode.placement?.rotation)) ? Number(mode.placement.rotation) : 0;
        placement.viewIndex = Number.isFinite(Number(mode.viewIndex)) ? Number(mode.viewIndex) : 0;
      }
      this.finishPlacementMode(false);
      if (mode.onPlace) mode.onPlace(placement);
    }

    cancelPlacementMode(notify = true) {
      if (!this.placementMode) return;
      const mode = this.placementMode;
      this.finishPlacementMode(false);
      if (notify && mode.onCancel) mode.onCancel();
    }

    finishPlacementMode() {
      if (this.placementMode?.ghost && this.root) this.root.remove(this.placementMode.ghost);
      this.placementMode = null;
      this.canvas?.classList.remove('is-placing-wall-decor');
      this.updateOverlay();
    }

    handleKey(event) {
      const key = (event.key || '').toLowerCase();
      if (event.type === 'keydown') this.primeOfficeAudio();
      if (this.arcadeHold && this.onArcadeInput) {
        if (this.onArcadeInput({ type: event.type, key, event }) !== false) event.preventDefault();
        return;
      }
      if (this.placementMode && event.type === 'keydown' && (key === 'escape' || key === 'esc')) {
        this.cancelPlacementMode();
        event.preventDefault();
        return;
      }
      if (this.placementMode && event.type === 'keydown' && key === 'enter') {
        this.commitPlacementMode();
        event.preventDefault();
        return;
      }
      if (this.placementMode && event.type === 'keydown' && (key === 'q' || key === 'arrowleft')) {
        this.cyclePlacementSide(1);
        event.preventDefault();
        return;
      }
      if (this.placementMode && event.type === 'keydown' && (key === 'e' || key === 'arrowright')) {
        this.cyclePlacementSide(-1);
        event.preventDefault();
        return;
      }
      if (this.placementMode && event.type === 'keydown' && key === 'r') {
        this.rotatePlacementItem(1);
        event.preventDefault();
        return;
      }
      if (this.placementMode && event.type === 'keydown' && key === 't') {
        this.rotatePlacementItem(-1);
        event.preventDefault();
        return;
      }
      if (this.moveMode && event.type === 'keydown' && (key === 'escape' || key === 'esc')) {
        this.cancelDecorMoveMode();
        event.preventDefault();
        return;
      }
      if (this.placementMode || this.moveMode) {
        event.preventDefault();
        return;
      }
      if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift','e'].includes(key)) {
        if (key === 'e' && event.type === 'keydown') {
          if (this.performNearbyInteraction()) {
            event.preventDefault();
            return;
          }
        }
        this.keys[key] = event.type === 'keydown';
        if (this.pointerLocked || this.arcadeHold || this.computerHold) event.preventDefault();
      }
    }

    performNearbyInteraction() {
      const robotDist = this.getRobotDistance();
      const arcadeDist = this.getArcadeDistance();
      const deskDist = this.getDeskDistance();
      const choices = [];
      if (this.onArcadeInteract && arcadeDist < 2.2) choices.push({ type: 'arcade', dist: arcadeDist });
      if (this.onRobotInteract && robotDist < 1.45) choices.push({ type: 'robot', dist: robotDist });
      if (this.onComputerInteract && deskDist < 1.85) choices.push({ type: 'computer', dist: deskDist });
      choices.sort((a, b) => a.dist - b.dist);
      const choice = choices[0];
      if (choice?.type === 'arcade') {
        this.onArcadeInteract();
        return true;
      }
      if (choice?.type === 'robot') {
        this.releaseManualControl();
        this.speakBotLine('__personality_ready__');
        this.onRobotInteract();
        return true;
      }
      if (choice?.type === 'computer') {
        this.enterComputerView();
        this.onComputerInteract();
        return true;
      }
      return false;
    }

    setScene({ tier = 0, decorations = [], suiteName = '', wallFinish = 'default', floorFinish = 'default', deskFinish = 'default', chairFinish = 'default', graphicsQuality = 'performance', placements = null, floorBotProfile = null, soundEnabled = true }) {
      this.state.tier = tier;
      this.state.decorations = Array.isArray(decorations) ? decorations.filter(Boolean) : [];
      this.state.suiteName = suiteName || this.state.suiteName;
      this.state.wallFinish = wallFinish || 'default';
      this.state.floorFinish = floorFinish || 'default';
      this.state.deskFinish = deskFinish || 'default';
      this.state.chairFinish = chairFinish || 'default';
      const incomingPlacements = placements && typeof placements === 'object' ? placements : null;
      const priorPlacements = this.state.placements || { wall: {}, floor: {}, desk: {} };
      const clonePlacementZone = zone => {
        const source = incomingPlacements && Object.prototype.hasOwnProperty.call(incomingPlacements, zone)
          ? (incomingPlacements[zone] || {})
          : (priorPlacements[zone] || {});
        const out = {};
        Object.entries(source).forEach(([id, placement]) => {
          const mappedZone = DECOR_PLACEMENT_ZONES[id] || null;
          if (mappedZone && this.normalizePlacementZone(mappedZone) !== zone) return;
          const normalized = this.normalizeStoredPlacement(zone, placement);
          if (normalized) out[id] = normalized;
        });
        return out;
      };
      this.state.placements = {
        wall: clonePlacementZone('wall'),
        floor: clonePlacementZone('floor'),
        desk: clonePlacementZone('desk')
      };
      if (floorBotProfile) this.state.floorBotProfile = Object.assign({}, this.state.floorBotProfile || {}, floorBotProfile);
      this.state.soundEnabled = soundEnabled !== false;
      this.setGraphicsQuality(graphicsQuality);
      this.syncServerAmbienceAudio();
      this.syncBackgroundMusicAudio();
      this.syncFootstepAudio();
      const sceneSignature = JSON.stringify({
        tier: this.state.tier,
        decorations: this.state.decorations,
        suiteName: this.state.suiteName,
        wallFinish: this.state.wallFinish,
        floorFinish: this.state.floorFinish,
        deskFinish: this.state.deskFinish,
        chairFinish: this.state.chairFinish,
        placements: this.state.placements,
        floorBotProfile: this.state.floorBotProfile,
        soundEnabled: this.state.soundEnabled
      });
      if (this.loaded && sceneSignature !== this.lastSceneSignature) {
        this.lastSceneSignature = sceneSignature;
        this.rebuildScene();
      } else if (!this.loaded) {
        this.lastSceneSignature = sceneSignature;
      }
      this.updateOverlay();
    }

    setHint(message) {
      const nextMessage = String(message || '');
      if (nextMessage === this.lastHintMessage) return;
      this.lastHintMessage = nextMessage;
      if (this.hintEl) this.hintEl.innerHTML = nextMessage;
    }

    updateOverlay(extra = '') {
      if (!this.hintEl || !this.modeEl) return;
      this.updateMobileControlsVisibility();
      const nearArcade = this.getArcadeDistance() < 2.05;
      const nearRobot = this.getRobotDistance() < 1.45;
      const nearDesk = this.getDeskDistance() < 1.85;
      const touchControl = !!(this.mobileControls.available && this.mobileControls.active);
      const manualActive = this.isManualControlActive();
      const modeLabel = this.moveMode ? 'Move Mode' : this.placementMode ? 'Placement Mode' : this.computerHold ? 'Desk Computer' : this.arcadeHold ? 'Arcade Hold' : (touchControl ? 'Touch Control' : this.pointerLocked ? 'Manual Control' : 'Manual Standby');
      if (modeLabel !== this.lastModeLabel) {
        this.lastModeLabel = modeLabel;
        this.modeEl.textContent = modeLabel;
      }
      if (this.canvas) this.canvas.classList.toggle('is-explore', manualActive && !this.arcadeHold && !this.computerHold && !this.placementMode && !this.moveMode);
      if (!this.loaded) return;
      const botSpeechActive = this.botSpeechText && performance.now() < this.botSpeechUntil;
      const botSpeechSuffix = botSpeechActive ? ` • ${this.botSpeechText}` : '';
      if (this.moveMode) {
        const moveZone = this.normalizePlacementZone(this.moveMode.viewZone || 'wall');
        const wallLabel = this.getWallFaceLabel(this.moveMode.face || 'back').toUpperCase();
        const viewLabel = moveZone === 'desk' ? 'DESK VIEW' : moveZone === 'floor' ? 'FLOOR VIEW' : `${wallLabel} WALL`;
        const navCopy = moveZone === 'desk' ? 'use ↓ Wall View to zoom back out' : moveZone === 'floor' ? 'use the side arrows to rotate the floor view or ↓ Wall View to zoom back out' : 'use the side arrows to look around';
        this.setHint(`Move Mode • <strong>${viewLabel}</strong> • click a placed shop object to grab it • ${navCopy} • Cancel or <strong>Esc</strong> exits${botSpeechSuffix}`);
      } else if (this.placementMode) {
        const zone = this.normalizePlacementZone(this.placementMode.zone || 'wall');
        if (zone === 'wall') {
          const wallLabel = this.getWallFaceLabel(this.placementMode.face).toUpperCase();
          this.setHint(`Placement mode • <strong>${wallLabel} WALL</strong> • move the ghost with your mouse • click to place • use the on-screen arrows to switch walls • <strong>Esc</strong> to cancel${botSpeechSuffix}`);
        } else if (zone === 'floor') {
          this.setHint(`Placement mode • <strong>FLOOR</strong> • move the ghost with your mouse • click to place • side arrows rotate the view • Rotate Item turns the object • <strong>Esc</strong> to cancel${botSpeechSuffix}`);
        } else {
          const zoneLabel = zone === 'desk' ? 'DESK SURFACE' : 'FLOOR';
          this.setHint(`Placement mode • <strong>${zoneLabel}</strong> • move the ghost with your mouse • click to place • <strong>Esc</strong> to cancel${botSpeechSuffix}`);
        }
      } else if (this.computerHold) {
        this.setHint(`Desk computer open • press <strong>Esc</strong> to return to the office${botSpeechSuffix}`);
      } else if (this.arcadeHold) {
        this.setHint(`Arcade session paused here • press <strong>E</strong> to resume${botSpeechSuffix}`);
      } else if (touchControl) {
        const target = nearRobot && (!nearArcade || this.getRobotDistance() <= this.getArcadeDistance() + 0.15)
          ? 'floor bot'
          : nearArcade
            ? 'Uptime Arcade'
            : nearDesk
              ? 'desk computer'
              : 'office';
        this.setHint(`MOVE to walk, LOOK to aim, and USE near the ${target}${botSpeechSuffix}`);
      } else if (this.pointerLocked && nearRobot && (!nearArcade || this.getRobotDistance() <= this.getArcadeDistance() + 0.15)) {
        this.setHint(`WASD to move • mouse to look • Press <strong>E</strong> to configure your floor bot${botSpeechSuffix}`);
      } else if (this.pointerLocked && nearArcade) {
        this.setHint(`WASD to move • mouse to look • Press <strong>E</strong> to use Uptime Arcade${botSpeechSuffix}`);
      } else if (this.pointerLocked && nearDesk) {
        this.setHint(`WASD to move • mouse to look • Press <strong>E</strong> to open the desk computer${botSpeechSuffix}`);
      } else {
        this.setHint(`${this.pointerLocked ? 'WASD to move • mouse to look • Esc to release cursor • Desk opens the computer' : 'Click to enter the room • walk to the desk and press E for the computer'}${extra ? ` • ${extra}` : ''}${botSpeechSuffix}`);
      }
    }

    initThree() {
      const THREE = this.THREE;
      this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
      this.renderer.setClearColor(0x0d1017, 1);
      if ('outputColorSpace' in this.renderer) this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      else this.renderer.outputEncoding = THREE.sRGBEncoding;

      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.Fog(0x0d1017, 7, 18);
      this.camera = new THREE.PerspectiveCamera(70, 1, 0.05, 60);
      this.camera.rotation.order = 'YXZ';

      this.root = new THREE.Group();
      this.scene.add(this.root);
      this.initServerAmbienceAudio();

      const ambient = new THREE.HemisphereLight(0xbfd6ff, 0x16202a, 0.9);
      ambient.position.set(0, 5, 0);
      this.scene.add(ambient);

      const overhead = new THREE.DirectionalLight(0xffffff, 1.08);
      overhead.position.set(0, 6.2, 0);
      overhead.target.position.set(0, 0, 0);
      overhead.castShadow = true;
      overhead.shadow.mapSize.width = 1024;
      overhead.shadow.mapSize.height = 1024;
      overhead.shadow.camera.left = -6.5;
      overhead.shadow.camera.right = 6.5;
      overhead.shadow.camera.top = 6.5;
      overhead.shadow.camera.bottom = -6.5;
      overhead.shadow.camera.near = 0.5;
      overhead.shadow.camera.far = 14;
      overhead.shadow.bias = -0.00015;
      overhead.shadow.normalBias = 0.01;
      overhead.shadow.radius = 1.5;
      this.scene.add(overhead);
      this.scene.add(overhead.target);
      this.overheadLight = overhead;

      const accent = new THREE.PointLight(0x58d8ff, 0.22, 9, 2);
      accent.position.set(-1.4, 2.5, 1.1);
      this.scene.add(accent);

      this.setGraphicsQuality(this.graphicsQuality, true);
      this.resize();
    }

    async preloadAssets() {
      const loaders = [
        () => this.loadDeskMonitorModel(),
        () => this.loadRaisingDeskModel(),
        () => this.loadChairModel(),
        () => this.loadKeyboardModel(),
        () => this.loadMouseModel(),
        () => this.loadUploadedLavaLampModel(),
        () => this.loadServerRackModel(),
        () => this.loadAestheticFloorTileModel(),
        () => this.loadSciFiFloorTileModel(),
        () => this.loadPendantLightModel()
      ];
      for (const load of loaders) {
        if (this.destroyed) return;
        await load();
        await this.yieldForAssetWork();
      }
      this.assetsReady = true;
    }

    async loadEmbeddedFloorTileModel(modelState, data, warningLabel = 'Uploaded floor tile') {
      if (!modelState || modelState.loaded || modelState.failed) return modelState?.parts || null;
      if (!data || !Array.isArray(data.parts) || !data.parts.length) {
        modelState.failed = true;
        return null;
      }
      try {
        const THREE = this.THREE;
        const parts = [];
        const combinedBounds = new THREE.Box3();
        data.parts.forEach(partData => {
          if (!Array.isArray(partData.vertices) || !partData.vertices.length || !Array.isArray(partData.indices) || !partData.indices.length) return;
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute('position', new THREE.Float32BufferAttribute(partData.vertices, 3));
          if (Array.isArray(partData.uv) && partData.uv.length) {
            geometry.setAttribute('uv', new THREE.Float32BufferAttribute(partData.uv, 2));
          }
          geometry.setIndex(partData.indices);
          geometry.computeVertexNormals();
          geometry.computeBoundingBox();
          if (!geometry.boundingBox || geometry.boundingBox.isEmpty()) return;
          combinedBounds.union(geometry.boundingBox);
          parts.push({
            geometry,
            material: partData.material || {}
          });
        });
        const size = combinedBounds.getSize(new THREE.Vector3());
        if (!parts.length || size.x <= 0 || size.y <= 0 || size.z <= 0) throw new Error('Embedded floor tile has invalid bounds.');
        const min = combinedBounds.min.clone();
        parts.forEach(part => {
          part.geometry.translate(0, -min.y, 0);
          part.geometry.computeBoundingBox();
          part.geometry.computeVertexNormals();
        });
        modelState.parts = parts;
        modelState.boundsSize = new THREE.Vector3(size.x, size.y, size.z);
        modelState.materialSpec = data.material || {};
        modelState.textureDataUrl = data.texturePngBase64 ? `data:image/png;base64,${data.texturePngBase64}` : '';
        modelState.texture = null;
        modelState.loaded = true;
        return parts;
      } catch (error) {
        console.warn(`${warningLabel} failed to initialize; using generated floor texture fallback.`, error);
        modelState.failed = true;
        modelState.parts = [];
        modelState.boundsSize = null;
        modelState.textureDataUrl = '';
        modelState.texture = null;
        modelState.materialSpec = null;
        return null;
      }
    }

    async loadAestheticFloorTileModel() {
      return this.loadEmbeddedFloorTileModel(this.aestheticFloorTileModel, window.UptimeAestheticFloorTileData, 'Kitchen floor tile');
    }

    async loadSciFiFloorTileModel() {
      return this.loadEmbeddedFloorTileModel(this.sciFiFloorTileModel, window.UptimeSciFiFloorTileData, 'Sci-fi floor tile');
    }

    getFloorTileModelState(finishId) {
      if (finishId === 'aesthetic-tile') return this.aestheticFloorTileModel;
      if (finishId === 'sci-fi-tile') return this.sciFiFloorTileModel;
      return null;
    }

    async loadPendantLightModel() {
      const modelState = this.pendantLightModel;
      if (!modelState || modelState.loaded || modelState.failed) return modelState?.meshes || null;
      const data = window.UptimePendantLightMeshData;
      if (!data || !Array.isArray(data.meshes) || !data.meshes.length) {
        modelState.failed = true;
        return null;
      }
      try {
        const THREE = this.THREE;
        const meshes = [];
        const combinedBounds = new THREE.Box3();
        const sourceIsGLB = String(data.format || '').includes('glb');
        data.meshes.forEach(meshData => {
          if (!Array.isArray(meshData.vertices) || !meshData.vertices.length || !Array.isArray(meshData.indices) || !meshData.indices.length) return;
          const geometry = new THREE.BufferGeometry();
          const remappedVertices = [];
          for (let i = 0; i < meshData.vertices.length; i += 3) {
            const x = meshData.vertices[i];
            const y = meshData.vertices[i + 1];
            const z = meshData.vertices[i + 2];
            if (sourceIsGLB) {
              remappedVertices.push(x, y, z);
            } else {
              // Older FBX pendant assets use Z as their vertical axis. Remap them
              // into Three's Y-up space before computing bounds.
              remappedVertices.push(x, z, -y);
            }
          }
          geometry.setAttribute('position', new THREE.Float32BufferAttribute(remappedVertices, 3));
          geometry.setIndex(meshData.indices);
          geometry.computeVertexNormals();
          geometry.computeBoundingBox();
          if (!geometry.boundingBox || geometry.boundingBox.isEmpty()) return;
          combinedBounds.union(geometry.boundingBox);
          meshes.push({
            geometry,
            material: meshData.material || {},
            role: meshData.role || 'body',
            name: meshData.name || 'pendant-light-part'
          });
        });
        const size = combinedBounds.getSize(new THREE.Vector3());
        if (!meshes.length || size.x <= 0 || size.y <= 0 || size.z <= 0) throw new Error('Embedded pendant light has invalid bounds.');
        const center = combinedBounds.getCenter(new THREE.Vector3());
        meshes.forEach(part => {
          part.geometry.translate(-center.x, -combinedBounds.min.y, -center.z);
          part.geometry.computeBoundingBox();
          part.geometry.computeVertexNormals();
        });
        modelState.meshes = meshes;
        modelState.boundsSize = new THREE.Vector3(size.x, size.y, size.z);
        modelState.loaded = true;
        return meshes;
      } catch (error) {
        console.warn('Uploaded pendant light failed to initialize; using fallback light prop.', error);
        modelState.failed = true;
        modelState.meshes = [];
        modelState.boundsSize = null;
        return null;
      }
    }

    createPendantLightModel(targetHeight = 1.65, maxWidth = 0.72, maxDepth = 0.72) {
      const THREE = this.THREE;
      const modelState = this.pendantLightModel || {};
      const meshes = modelState.meshes || [];
      const size = modelState.boundsSize;
      if (!meshes.length || !size || size.x <= 0 || size.y <= 0 || size.z <= 0) return null;
      const modelGroup = new THREE.Group();
      const topAssembly = new THREE.Group();
      const fitScale = Math.min(targetHeight / Math.max(0.001, size.y), maxWidth / Math.max(0.001, size.x), maxDepth / Math.max(0.001, size.z));
      const toHex = rgba => {
        if (!Array.isArray(rgba) || rgba.length < 3) return 0xb8b8b8;
        return ((Math.max(0, Math.min(255, rgba[0])) & 255) << 16)
          | ((Math.max(0, Math.min(255, rgba[1])) & 255) << 8)
          | (Math.max(0, Math.min(255, rgba[2])) & 255);
      };
      const meshEntries = [];
      let shadeMesh = null;
      let supportMesh = null;
      let bulbRigMesh = null;
      meshes.forEach(part => {
        const role = part.role || 'body';
        const matName = String((part.material || {}).name || part.name || '').toLowerCase();
        const name = String(part.name || '');
        if (matName.includes('electrical_outlet') || matName.includes('electrical outlet')) return;
        let color = toHex((part.material || {}).color);
        let materialSettings = { color, roughness: 0.64, metalness: 0.16, side: THREE.DoubleSide };
        if (role === 'emitter' || matName.includes('emitter')) {
          materialSettings = { color: 0xfff3d0, emissive: 0xffcf76, emissiveIntensity: 1.25, roughness: 0.25, metalness: 0.0, side: THREE.DoubleSide };
        } else if (role === 'shade' || matName.includes('shade')) {
          materialSettings = { color: 0xe6deca, emissive: 0xd9ecff, emissiveIntensity: 0.22, roughness: 0.82, metalness: 0.02, transparent: true, opacity: 0.72, side: THREE.DoubleSide, depthWrite: true };
        } else if (role === 'dark' || matName.includes('black')) {
          materialSettings = { color: 0x12100d, roughness: 0.78, metalness: 0.18, side: THREE.DoubleSide };
        } else if (role === 'metal' || matName.includes('white') || matName.includes('electrical')) {
          materialSettings = { color: color || 0xd9d9d4, roughness: 0.34, metalness: 0.42, side: THREE.DoubleSide };
        } else {
          materialSettings = { color: color || 0x5d4433, roughness: 0.58, metalness: 0.16, side: THREE.DoubleSide };
        }
        const mesh = new THREE.Mesh(part.geometry, new THREE.MeshStandardMaterial(materialSettings));
        mesh.castShadow = role !== 'emitter';
        mesh.receiveShadow = role !== 'emitter';
        mesh.userData.partRole = role;
        mesh.userData.partName = name;
        const isSupport = name.toLowerCase().includes('legs');
        (isSupport ? modelGroup : topAssembly).add(mesh);
        meshEntries.push({ mesh, role, matName, name });
        if (!shadeMesh && (role === 'shade' || matName.includes('shade'))) shadeMesh = mesh;
        if (!supportMesh && isSupport) supportMesh = mesh;
        if (!bulbRigMesh && matName.includes('lamps_white') && !name.toLowerCase().includes('legs')) bulbRigMesh = mesh;
      });
      modelGroup.add(topAssembly);

      if (shadeMesh && supportMesh) {
        shadeMesh.geometry.computeBoundingBox();
        supportMesh.geometry.computeBoundingBox();
        const shadeCenter = shadeMesh.geometry.boundingBox.getCenter(new THREE.Vector3());
        const supportCenter = supportMesh.geometry.boundingBox.getCenter(new THREE.Vector3());
        const topRaise = size.y * 0.036;
        topAssembly.position.x += supportCenter.x - shadeCenter.x;
        topAssembly.position.z += supportCenter.z - shadeCenter.z;
        topAssembly.position.y += topRaise;
        topAssembly.rotation.y += Math.PI / 4;
      }

      modelGroup.updateMatrixWorld(true);
      const assembledBounds = new THREE.Box3().setFromObject(modelGroup);
      const assembledCenter = assembledBounds.getCenter(new THREE.Vector3());
      const recenterX = assembledCenter.x;
      const recenterZ = assembledCenter.z;
      const liftY = assembledBounds.min.y;
      meshEntries.forEach(entry => {
        entry.mesh.position.x -= recenterX;
        entry.mesh.position.y -= liftY;
        entry.mesh.position.z -= recenterZ;
      });

      modelGroup.updateMatrixWorld(true);
      const finalBounds = new THREE.Box3().setFromObject(modelGroup);
      const finalSize = finalBounds.getSize(new THREE.Vector3());
      let lightAnchor = new THREE.Vector3(0, finalSize.y * 0.78, 0);
      let bulbOffsetX = Math.max(0.08, finalSize.x * 0.10);
      if (shadeMesh) {
        const shadeBounds = new THREE.Box3().setFromObject(shadeMesh);
        lightAnchor = shadeBounds.getCenter(new THREE.Vector3());
        bulbOffsetX = Math.max(0.06, (shadeBounds.max.x - shadeBounds.min.x) * 0.12);
      } else if (bulbRigMesh) {
        const bulbBounds = new THREE.Box3().setFromObject(bulbRigMesh);
        lightAnchor = bulbBounds.getCenter(new THREE.Vector3());
        bulbOffsetX = Math.max(0.06, (bulbBounds.max.x - bulbBounds.min.x) * 0.12);
      }

      modelGroup.scale.setScalar(fitScale);
      modelGroup.rotation.y = Math.PI;
      return {
        group: modelGroup,
        height: finalSize.y * fitScale,
        width: finalSize.x * fitScale,
        depth: finalSize.z * fitScale,
        // These are returned in the model's local pre-scale space because the
        // light and glow are attached as children of the scaled model group.
        // Scaling them here would apply the fit scale twice and pull the glow
        // down/out of the lampshade.
        lightAnchor,
        bulbOffsetX,
        glowRadius: Math.max(finalSize.x, finalSize.z) * 0.18
      };
    }

    buildPendantLightProp(group, opts = {}) {
      const THREE = this.THREE;
      const ghost = !!opts.ghost;
      const result = this.createPendantLightModel(2.25, 1.25, 1.55);
      const makeMat = settings => new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.62, metalness: 0.12 }, settings));
      let lampHeight = 2.25;
      let lightParent = group;
      let lightAnchor = new THREE.Vector3(0, Math.max(0.45, lampHeight * 0.88), 0);
      let bulbOffsetX = 0.12;
      let glowRadius = 0.28;
      if (result && result.group) {
        lampHeight = result.height || lampHeight;
        lightAnchor = result.lightAnchor || lightAnchor;
        bulbOffsetX = result.bulbOffsetX || bulbOffsetX;
        glowRadius = result.glowRadius || glowRadius;
        lightParent = result.group;
        group.add(result.group);
      } else {
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.042, 1.85, 16), makeMat({ color: 0x17130f }));
        stem.position.y = 0.94;
        group.add(stem);
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.36, 0.10, 24), makeMat({ color: 0x17130f }));
        base.position.y = 0.04;
        group.add(base);
        const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.52, 0.58, 32, 1, true), makeMat({ color: 0xe6deca, transparent: true, opacity: 0.76, side: THREE.DoubleSide, emissive: 0xffbf72, emissiveIntensity: 0.18 }));
        shade.position.y = 1.96;
        group.add(shade);
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 14), makeMat({ color: 0xfff3d0, emissive: 0xffcf76, emissiveIntensity: 1.1 }));
        bulb.position.y = 1.85;
        group.add(bulb);
      }
      if (!ghost) {
        const bulbLeft = new THREE.PointLight(0xeef7ff, 2.55, 7.6, 1.7);
        bulbLeft.position.copy(lightAnchor).add(new THREE.Vector3(-bulbOffsetX, 0, 0));
        lightParent.add(bulbLeft);
        const bulbRight = new THREE.PointLight(0xeef7ff, 2.55, 7.6, 1.7);
        bulbRight.position.copy(lightAnchor).add(new THREE.Vector3(bulbOffsetX, 0, 0));
        lightParent.add(bulbRight);
        const warmGlow = new THREE.Mesh(new THREE.SphereGeometry(glowRadius * 1.12, 24, 16), makeMat({ color: 0xe6f3ff, emissive: 0xd9ecff, emissiveIntensity: 1.05, transparent: true, opacity: 0.20, depthWrite: false }));
        warmGlow.position.copy(lightAnchor);
        lightParent.add(warmGlow);
      }
    }

    async loadRaisingDeskModel() {
      const modelState = this.raisingDeskModel;
      if (!modelState || modelState.loaded || modelState.failed) return modelState?.topGeometry || null;
      const data = window.UptimeRaisingDeskMeshData;
      if (!data || !Array.isArray(data.vertices) || !Array.isArray(data.topIndices) || !Array.isArray(data.frameIndices)) {
        modelState.failed = true;
        return null;
      }
      try {
        const THREE = this.THREE;
        const makeGeometry = indices => {
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute('position', new THREE.Float32BufferAttribute(data.vertices, 3));
          geometry.setIndex(indices);
          return geometry;
        };
        const topGeometry = makeGeometry(data.topIndices);
        const frameGeometry = makeGeometry(data.frameIndices);
        const combined = new THREE.BufferGeometry();
        combined.setAttribute('position', new THREE.Float32BufferAttribute(data.vertices, 3));
        combined.computeBoundingBox();
        const bounds = combined.boundingBox;
        const size = bounds.getSize(new THREE.Vector3());
        if (!Number.isFinite(size.x) || !Number.isFinite(size.y) || !Number.isFinite(size.z) || size.x <= 0 || size.y <= 0 || size.z <= 0) {
          throw new Error('Embedded raising desk mesh has invalid bounds.');
        }
        const center = bounds.getCenter(new THREE.Vector3());
        [topGeometry, frameGeometry].forEach(geometry => {
          geometry.translate(-center.x, -bounds.min.y, -center.z);
          geometry.computeBoundingBox();
          geometry.computeVertexNormals();
        });
        modelState.topGeometry = topGeometry;
        modelState.frameGeometry = frameGeometry;
        modelState.boundsSize = new THREE.Vector3(size.x, size.y, size.z);
        modelState.loaded = true;
        return topGeometry;
      } catch (error) {
        console.warn('Uploaded raising desk mesh failed to initialize; using built-in desk.', error);
        modelState.failed = true;
        modelState.topGeometry = null;
        modelState.frameGeometry = null;
        return null;
      }
    }

    createRaisingDeskModel(width = 2.4, depth = 0.86, targetHeight = 0.84) {
      const THREE = this.THREE;
      const modelState = this.raisingDeskModel || {};
      const topGeometry = modelState.topGeometry;
      const frameGeometry = modelState.frameGeometry;
      const size = modelState.boundsSize;
      if (!topGeometry || !frameGeometry || !size || size.x <= 0 || size.y <= 0 || size.z <= 0) return null;
      const deskSpec = this.getDeskFinishSpec();
      const group = new THREE.Group();
      const topMaterial = new THREE.MeshStandardMaterial({
        color: deskSpec.top,
        roughness: 0.78,
        metalness: 0.05,
        side: THREE.DoubleSide
      });
      const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0x171d23,
        roughness: 0.58,
        metalness: 0.38,
        side: THREE.DoubleSide
      });
      const top = new THREE.Mesh(topGeometry, topMaterial);
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);
      [top, frame].forEach(mesh => {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
      });
      // The uploaded raising desk model's long/leg axis is its local Z axis.
      // Rotate it 90 degrees so the leg assemblies run left/right across the
      // desk width instead of front/back, while preserving the old desk footprint.
      const scaleX = depth / Math.max(0.001, size.x);
      const scaleY = targetHeight / Math.max(0.001, size.y);
      const scaleZ = width / Math.max(0.001, size.z);
      group.scale.set(scaleX, scaleY, scaleZ);
      group.rotation.y = Math.PI / 2;
      group.userData.uploadedRaisingDesk = true;
      return group;
    }


    loadChairModel() {
      const modelState = this.chairModel;
      if (!modelState || modelState.loaded || modelState.failed) return modelState?.meshes || null;
      const data = window.UptimeChairMeshData;
      if (!data || !Array.isArray(data.meshes) || !data.meshes.length) {
        if (modelState) modelState.failed = true;
        return null;
      }
      try {
        const THREE = this.THREE;
        const meshes = [];
        const combinedBounds = new THREE.Box3();
        data.meshes.forEach(meshData => {
          if (!Array.isArray(meshData.vertices) || !Array.isArray(meshData.indices) || !meshData.vertices.length || !meshData.indices.length) return;
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute('position', new THREE.Float32BufferAttribute(meshData.vertices, 3));
          if (Array.isArray(meshData.uv) && meshData.uv.length) {
            geometry.setAttribute('uv', new THREE.Float32BufferAttribute(meshData.uv, 2));
            geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(meshData.uv, 2));
          }
          geometry.setIndex(meshData.indices);
          geometry.computeBoundingBox();
          if (!geometry.boundingBox || geometry.boundingBox.isEmpty()) return;
          combinedBounds.union(geometry.boundingBox);
          geometry.computeVertexNormals();
          meshes.push({
            geometry,
            material: meshData.material || {},
            role: meshData.role || 'frame',
            textureRefs: meshData.textureRefs || {},
            name: meshData.name || 'chair-part'
          });
        });
        const size = combinedBounds.getSize(new THREE.Vector3());
        if (!meshes.length || !Number.isFinite(size.x) || !Number.isFinite(size.y) || !Number.isFinite(size.z) || size.x <= 0 || size.y <= 0 || size.z <= 0) {
          throw new Error('Embedded chair mesh has invalid bounds.');
        }
        const center = combinedBounds.getCenter(new THREE.Vector3());
        meshes.forEach(part => {
          part.geometry.translate(-center.x, -combinedBounds.min.y, -center.z);
          part.geometry.computeBoundingBox();
          part.geometry.computeVertexNormals();
        });
        modelState.meshes = meshes;
        modelState.boundsSize = new THREE.Vector3(size.x, size.y, size.z);
        modelState.textureSources = data.textures || {};
        modelState.loadedTextures = {};
        modelState.loaded = true;
        return meshes;
      } catch (error) {
        console.warn('Uploaded chair mesh failed to initialize; using built-in chair blocks.', error);
        modelState.failed = true;
        modelState.meshes = [];
        modelState.boundsSize = null;
        return null;
      }
    }

    createUploadedChairModel(width = 0.92, depth = 0.92, maxHeight = 1.28) {
      const THREE = this.THREE;
      const modelState = this.chairModel || {};
      const parts = modelState.meshes || [];
      const size = modelState.boundsSize;
      if (!parts.length || !size || size.x <= 0 || size.y <= 0 || size.z <= 0) return null;
      const chairSpec = this.getChairFinishSpec();
      const root = new THREE.Group();
      const upperGroup = new THREE.Group();
      const fitScale = Math.min(width / Math.max(0.001, size.x), depth / Math.max(0.001, size.z), maxHeight / Math.max(0.001, size.y));
      const textureCache = modelState.loadedTextures || (modelState.loadedTextures = {});
      const textureSources = modelState.textureSources || {};
      const lowerBaseParts = new Set(['pCube4', 'pCube8', 'pCube6', 'pCube7', 'pCube9', 'pCylinder1', 'pCylinder2', 'pCylinder3', 'pCylinder4', 'pCylinder5', 'pCylinder6']);
      const loadTexture = (key, isColor = false) => {
        const src = textureSources[key];
        if (!src) return null;
        if (textureCache[key]) return textureCache[key];
        const texture = new THREE.TextureLoader().load(src);
        texture.flipY = false;
        if (isColor) {
          if ('colorSpace' in texture && THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
          else if ('encoding' in texture && THREE.sRGBEncoding) texture.encoding = THREE.sRGBEncoding;
        }
        textureCache[key] = texture;
        return texture;
      };
      parts.forEach(part => {
        if (lowerBaseParts.has(part.name)) return;
        const textureRefs = part.textureRefs || {};
        const role = part.role || 'frame';
        const isLeather = role === 'leather';
        const colorHex = isLeather ? chairSpec.seat : 0x0f1217;
        const aoMap = textureRefs.aoMap ? loadTexture(textureRefs.aoMap) : null;
        const roughnessMap = textureRefs.roughnessMap ? loadTexture(textureRefs.roughnessMap) : null;
        const metalnessMap = textureRefs.metalnessMap ? loadTexture(textureRefs.metalnessMap) : null;
        const bumpMap = textureRefs.bumpMap ? loadTexture(textureRefs.bumpMap) : null;
        const material = new THREE.MeshStandardMaterial({
          color: colorHex,
          aoMap: isLeather ? aoMap : null,
          roughnessMap: isLeather ? roughnessMap : null,
          metalnessMap: isLeather ? metalnessMap : null,
          bumpMap: isLeather ? bumpMap : null,
          bumpScale: isLeather && bumpMap ? 0.008 : 0,
          metalness: isLeather ? 0.08 : 0.24,
          roughness: isLeather ? 1.0 : 0.58,
          side: THREE.DoubleSide
        });
        if (isLeather) material.aoMapIntensity = 0.55;
        const mesh = new THREE.Mesh(part.geometry, material);
        // Imported upholstery/frame pieces are detailed enough that shadow rendering becomes pricey.
        // The chair base and room lighting still ground it visually.
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        upperGroup.add(mesh);
      });
      upperGroup.scale.setScalar(fitScale);
      upperGroup.rotation.y = Math.PI;
      root.add(upperGroup);

      const armatureColor = 0x0a0d12;
      const stemMat = new THREE.MeshStandardMaterial({ color: armatureColor, metalness: 0.38, roughness: 0.56 });
      const baseMat = new THREE.MeshStandardMaterial({ color: armatureColor, metalness: 0.18, roughness: 0.72 });
      const wheelMat = new THREE.MeshStandardMaterial({ color: armatureColor, metalness: 0.22, roughness: 0.84 });

      const makeCastable = mesh => {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
      };
      const hub = makeCastable(new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.092, 0.072, 24), baseMat));
      hub.position.set(0, 0.07, 0);
      root.add(hub);

      const stem = makeCastable(new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.046, 0.305, 20), stemMat));
      stem.position.set(0, 0.242, 0);
      root.add(stem);

      const seatColumnCap = makeCastable(new THREE.Mesh(new THREE.CylinderGeometry(0.060, 0.060, 0.022, 20), stemMat));
      seatColumnCap.position.set(0, 0.40, 0);
      root.add(seatColumnCap);

      const addBarBetween = (start, end, radius, material) => {
        const startVec = new THREE.Vector3(start.x, start.y, start.z);
        const endVec = new THREE.Vector3(end.x, end.y, end.z);
        const delta = new THREE.Vector3().subVectors(endVec, startVec);
        const length = delta.length();
        if (length <= 0.001) return null;
        const bar = makeCastable(new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 12), material));
        bar.position.copy(startVec).add(delta.multiplyScalar(0.5));
        bar.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3().subVectors(endVec, startVec).normalize());
        root.add(bar);
        return bar;
      };

      const wheelGeometry = new THREE.CylinderGeometry(0.035, 0.035, 0.030, 18);
      const casterForkGeometry = new THREE.BoxGeometry(0.032, 0.075, 0.032);
      const spokeStart = { x: 0, y: 0.074, z: 0 };
      const wheelRadius = 0.385;
      const barEndRadius = 0.37;
      const forkRadius = 0.37;
      for (let i = 0; i < 5; i += 1) {
        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const dirX = Math.cos(angle);
        const dirZ = Math.sin(angle);
        const barEnd = { x: dirX * barEndRadius, y: 0.05, z: dirZ * barEndRadius };
        addBarBetween(spokeStart, barEnd, 0.018, baseMat);

        const fork = makeCastable(new THREE.Mesh(casterForkGeometry, stemMat));
        fork.position.set(dirX * forkRadius, 0.042, dirZ * forkRadius);
        fork.rotation.y = angle;
        root.add(fork);

        const wheel = makeCastable(new THREE.Mesh(wheelGeometry, wheelMat));
        wheel.position.set(dirX * wheelRadius, 0.019, dirZ * wheelRadius);
        wheel.rotation.z = Math.PI / 2;
        wheel.rotation.y = angle;
        root.add(wheel);
      }

      root.userData.uploadedChair = true;
      return root;
    }

    loadKeyboardModel() {
      const modelState = this.keyboardModel;
      if (!modelState || modelState.loaded || modelState.failed) return modelState?.meshes || null;
      const data = window.UptimeKeyboardMeshData;
      if (!data || !Array.isArray(data.meshes) || !data.meshes.length) {
        if (modelState) modelState.failed = true;
        return null;
      }
      try {
        const THREE = this.THREE;
        const geometries = [];
        const combinedBounds = new THREE.Box3();
        data.meshes.forEach(meshData => {
          if (!Array.isArray(meshData.vertices) || !Array.isArray(meshData.indices) || !meshData.vertices.length || !meshData.indices.length) return;
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute('position', new THREE.Float32BufferAttribute(meshData.vertices, 3));
          geometry.setIndex(meshData.indices);
          geometry.computeBoundingBox();
          if (!geometry.boundingBox || geometry.boundingBox.isEmpty()) return;
          combinedBounds.union(geometry.boundingBox);
          geometries.push({ geometry, material: meshData.material || {}, name: meshData.name || 'keyboard-part' });
        });
        const size = combinedBounds.getSize(new THREE.Vector3());
        if (!geometries.length || !Number.isFinite(size.x) || !Number.isFinite(size.y) || !Number.isFinite(size.z) || size.x <= 0 || size.y <= 0 || size.z <= 0) {
          throw new Error('Embedded keyboard mesh has invalid bounds.');
        }
        const center = combinedBounds.getCenter(new THREE.Vector3());
        geometries.forEach(part => {
          part.geometry.translate(-center.x, -combinedBounds.min.y, -center.z);
          part.geometry.computeBoundingBox();
          part.geometry.computeVertexNormals();
        });
        modelState.meshes = geometries;
        modelState.boundsSize = new THREE.Vector3(size.x, size.y, size.z);
        modelState.loaded = true;
        return geometries;
      } catch (error) {
        console.warn('Uploaded keyboard mesh failed to initialize; using built-in keyboard box.', error);
        modelState.failed = true;
        modelState.meshes = [];
        modelState.boundsSize = null;
        return null;
      }
    }

    createKeyboardModel(width = 0.84, maxDepth = 0.24, maxHeight = 0.055) {
      const THREE = this.THREE;
      const modelState = this.keyboardModel || {};
      const parts = modelState.meshes || [];
      const size = modelState.boundsSize;
      if (!parts.length || !size || size.x <= 0 || size.y <= 0 || size.z <= 0) return null;
      const group = new THREE.Group();
      const fitScale = Math.min(width / Math.max(0.001, size.x), maxDepth / Math.max(0.001, size.z));
      const heightScale = Math.min(fitScale, maxHeight / Math.max(0.001, size.y));
      parts.forEach(part => {
        const spec = part.material || {};
        const baseColor = Number.isFinite(Number(spec.color)) ? Number(spec.color) : 0x1b2127;
        const isKeyText = ['1', 'A', 'download ', 'wifi'].includes(part.name);
        const material = new THREE.MeshStandardMaterial({
          color: baseColor,
          roughness: Number.isFinite(Number(spec.roughness)) ? Number(spec.roughness) : 0.62,
          metalness: Number.isFinite(Number(spec.metalness)) ? Number(spec.metalness) : 0.08,
          emissive: isKeyText ? baseColor : 0x000000,
          emissiveIntensity: isKeyText ? 0.12 : 0,
          side: THREE.DoubleSide
        });
        const mesh = new THREE.Mesh(part.geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
      });
      group.scale.set(fitScale, heightScale, fitScale);
      group.rotation.y = 0;
      group.userData.uploadedKeyboard = true;
      return group;
    }

    loadMouseModel() {
      const modelState = this.mouseModel;
      if (!modelState || modelState.loaded || modelState.failed) return modelState?.meshes || null;
      const data = window.UptimeMouseMeshData;
      if (!data || !Array.isArray(data.meshes) || !data.meshes.length) {
        if (modelState) modelState.failed = true;
        return null;
      }
      try {
        const THREE = this.THREE;
        const meshes = [];
        const combinedBounds = new THREE.Box3();
        data.meshes.forEach(meshData => {
          if (!Array.isArray(meshData.vertices) || !Array.isArray(meshData.indices) || !meshData.vertices.length || !meshData.indices.length) return;
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute('position', new THREE.Float32BufferAttribute(meshData.vertices, 3));
          if (Array.isArray(meshData.uv) && meshData.uv.length) {
            geometry.setAttribute('uv', new THREE.Float32BufferAttribute(meshData.uv, 2));
            geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(meshData.uv, 2));
          }
          geometry.setIndex(meshData.indices);
          geometry.computeBoundingBox();
          if (!geometry.boundingBox || geometry.boundingBox.isEmpty()) return;
          combinedBounds.union(geometry.boundingBox);
          geometry.computeVertexNormals();
          meshes.push({ geometry, material: meshData.material || {}, name: meshData.name || 'mouse-part' });
        });
        const size = combinedBounds.getSize(new THREE.Vector3());
        if (!meshes.length || !Number.isFinite(size.x) || !Number.isFinite(size.y) || !Number.isFinite(size.z) || size.x <= 0 || size.y <= 0 || size.z <= 0) {
          throw new Error('Embedded mouse mesh has invalid bounds.');
        }
        const center = combinedBounds.getCenter(new THREE.Vector3());
        meshes.forEach(part => {
          part.geometry.translate(-center.x, -combinedBounds.min.y, -center.z);
          part.geometry.computeBoundingBox();
          part.geometry.computeVertexNormals();
        });
        modelState.meshes = meshes;
        modelState.boundsSize = new THREE.Vector3(size.x, size.y, size.z);
        modelState.textureSources = data.textures || {};
        modelState.loadedTextures = {};
        modelState.loaded = true;
        return meshes;
      } catch (error) {
        console.warn('Uploaded mouse mesh failed to initialize; using built-in mouse box.', error);
        modelState.failed = true;
        modelState.meshes = [];
        modelState.boundsSize = null;
        return null;
      }
    }

    loadServerRackModel() {
      const modelState = this.serverRackModel;
      if (!modelState || modelState.loaded || modelState.failed) return modelState?.parts || null;
      const data = window.UptimeServerRackMeshData;
      if (!data || !Array.isArray(data.parts) || !data.parts.length) {
        if (modelState) modelState.failed = true;
        return null;
      }
      try {
        const THREE = this.THREE;
        const parts = [];
        const combinedBounds = new THREE.Box3();
        data.parts.forEach(partData => {
          if (!Array.isArray(partData.vertices) || !Array.isArray(partData.indices) || !partData.vertices.length || !partData.indices.length) return;
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute('position', new THREE.Float32BufferAttribute(partData.vertices, 3));
          geometry.setIndex(partData.indices);
          geometry.computeBoundingBox();
          if (!geometry.boundingBox || geometry.boundingBox.isEmpty()) return;
          combinedBounds.union(geometry.boundingBox);
          geometry.computeVertexNormals();
          parts.push({ geometry, material: partData.material || {}, name: partData.name || 'server-rack-part' });
        });
        const size = combinedBounds.getSize(new THREE.Vector3());
        if (!parts.length || !Number.isFinite(size.x) || !Number.isFinite(size.y) || !Number.isFinite(size.z) || size.x <= 0 || size.y <= 0 || size.z <= 0) {
          throw new Error('Embedded server rack mesh has invalid bounds.');
        }
        const center = combinedBounds.getCenter(new THREE.Vector3());
        parts.forEach(part => {
          part.geometry.translate(-center.x, -combinedBounds.min.y, -center.z);
          part.geometry.computeBoundingBox();
          part.geometry.computeVertexNormals();
        });
        modelState.parts = parts;
        modelState.boundsSize = new THREE.Vector3(size.x, size.y, size.z);
        modelState.loaded = true;
        return parts;
      } catch (error) {
        console.warn('Uploaded server rack mesh failed to initialize; using built-in rack boxes.', error);
        modelState.failed = true;
        modelState.parts = [];
        modelState.boundsSize = null;
        return null;
      }
    }

    createServerRackModel(width = 1.04, height = 2.45, depth = 0.86) {
      const THREE = this.THREE;
      const modelState = this.serverRackModel || {};
      const parts = modelState.parts || [];
      const size = modelState.boundsSize;
      if (!parts.length || !size || size.x <= 0 || size.y <= 0 || size.z <= 0) return null;

      const group = new THREE.Group();
      const detailGroup = new THREE.Group();
      const cabinetW = size.x;
      const cabinetH = size.y;
      const cabinetD = size.z;
      const toHex = rgba => {
        if (!Array.isArray(rgba) || rgba.length < 3) return 0xcccccc;
        return ((Math.max(0, Math.min(255, rgba[0])) & 255) << 16)
          | ((Math.max(0, Math.min(255, rgba[1])) & 255) << 8)
          | (Math.max(0, Math.min(255, rgba[2])) & 255);
      };
      const paletteForMaterial = name => {
        const matName = String(name || '').toLowerCase();
        if (/blue/.test(matName)) return 0x49c8ff;
        if (/green.*emmisive/.test(matName)) return 0x77e7c0;
        if (/red.*emmisive/.test(matName)) return 0xe9a27d;
        if (/red_matte/.test(matName)) return 0xbf7e64;
        if (/white/.test(matName)) return 0x2f3742;
        if (/chrome/.test(matName)) return 0xcfd8de;
        if (/alum/.test(matName)) return 0xb8c0c8;
        if (/steel/.test(matName)) return 0xa9b0b7;
        if (/rubber/.test(matName)) return 0x1a1d22;
        if (/dark_annodized_shiny/.test(matName)) return 0x5b626c;
        if (/dark_annodized_matte/.test(matName)) return 0x4b525b;
        if (/dark_matte/.test(matName)) return 0x4f555e;
        if (/med_matte/.test(matName)) return 0x777e88;
        if (/label|text|logo|icon|combo|cert|connect|toggle|cc_/.test(matName)) return 0xc3cedd;
        return null;
      };
      const isEmissiveName = name => /green_5_emmisive|red_5_emmisive/i.test(name || '');
      const isStructuralShell = name => /material\.009|dark_steel|steel$|glass|frosted/i.test(String(name || ''));

      parts.forEach(part => {
        const spec = part.material || {};
        const matName = String(spec.name || part.name || '').toLowerCase();
        if (isStructuralShell(matName)) return;
        const fallbackColor = toHex(spec.color);
        const colorHex = paletteForMaterial(matName) || fallbackColor;
        const isChrome = /chrome|steel/.test(matName);
        const isAlum = /alum/.test(matName);
        const isRubber = /rubber/.test(matName);
        const isDark = /dark|matte/.test(matName);
        const isShiny = /shiny/.test(matName);
        const isTextureDependentDecal = /^(white)$|label|text|logo|icon|combo|cert|connect|toggle|cc_/.test(matName);
        if (isTextureDependentDecal) return;
        const isLabel = false;
        const material = new THREE.MeshStandardMaterial({
          color: colorHex,
          roughness: isRubber ? 0.92 : isChrome ? 0.26 : isAlum ? 0.44 : isShiny ? 0.38 : isDark ? 0.72 : 0.56,
          metalness: isRubber ? 0.02 : isChrome ? 0.82 : isAlum ? 0.58 : isShiny ? 0.30 : 0.12,
          emissive: isEmissiveName(matName) ? colorHex : (isLabel ? colorHex : 0x000000),
          emissiveIntensity: isEmissiveName(matName) ? 1.0 : (isLabel ? 0.11 : 0),
          side: THREE.DoubleSide
        });
        const mesh = new THREE.Mesh(part.geometry, material);
        // High-detail imported rack face geometry is expensive to include in shadow maps.
        // Let the simple cabinet shell handle shadows and keep these parts as visual detail only.
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        if (isEmissiveName(matName)) {
          mesh.userData.blink = 1.0 + Math.random() * 2.4;
          mesh.userData.blinkBase = 0.02;
          mesh.userData.blinkRange = 1.9;
          mesh.userData.blinkPower = 3.1;
        }
        detailGroup.add(mesh);
      });

      // Nudge the imported server-face details slightly forward so they read through the front window.
      detailGroup.position.z += cabinetD * 0.045;
      group.add(detailGroup);

      const shellColor = 0x0c0d10;
      const trimColor = 0x31343a;
      const shellMat = new THREE.MeshStandardMaterial({ color: shellColor, roughness: 0.86, metalness: 0.16 });
      const trimMat = new THREE.MeshStandardMaterial({ color: trimColor, roughness: 0.46, metalness: 0.56 });
      const glassMat = new THREE.MeshStandardMaterial({ color: 0xbcd7f2, roughness: 0.08, metalness: 0.05, transparent: true, opacity: 0.10, emissive: 0x5d87b6, emissiveIntensity: 0.04, side: THREE.DoubleSide, depthWrite: false });

      const sideT = cabinetW * 0.15;
      const topT = cabinetH * 0.055;
      const backT = cabinetD * 0.055;
      const frontInset = cabinetD * 0.5 - backT - 0.01;
      const shellDepth = cabinetD - backT;
      const addPanel = (w, h, d, x, y, z, material) => {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
        return mesh;
      };

      // Outer cabinet shell
      addPanel(sideT, cabinetH, shellDepth, -cabinetW / 2 + sideT / 2, cabinetH / 2, 0, shellMat);
      addPanel(sideT, cabinetH, shellDepth,  cabinetW / 2 - sideT / 2, cabinetH / 2, 0, shellMat);
      addPanel(cabinetW - sideT * 2, topT, shellDepth, 0, cabinetH - topT / 2, 0, shellMat);
      addPanel(cabinetW - sideT * 2, topT, shellDepth, 0, topT / 2 + cabinetH * 0.035, 0, shellMat);
      addPanel(cabinetW, cabinetH, backT, 0, cabinetH / 2, -cabinetD / 2 + backT / 2, shellMat);

      // Front bezel and center divider to mimic the reference rack cabinet.
      const openingW = cabinetW - sideT * 2.1;
      const dividerH = cabinetH * 0.10;
      const dividerY = cabinetH * 0.49;
      addPanel(sideT * 0.84, cabinetH, cabinetD * 0.065, -openingW / 2 - sideT * 0.42, cabinetH / 2, frontInset, shellMat);
      addPanel(sideT * 0.84, cabinetH, cabinetD * 0.065,  openingW / 2 + sideT * 0.42, cabinetH / 2, frontInset, shellMat);
      addPanel(openingW + sideT * 1.68, topT * 0.9, cabinetD * 0.065, 0, cabinetH - topT * 0.45, frontInset, shellMat);
      addPanel(openingW + sideT * 1.68, topT * 0.9, cabinetD * 0.065, 0, topT * 0.85 + cabinetH * 0.035, frontInset, shellMat);
      addPanel(openingW + sideT * 1.10, dividerH, cabinetD * 0.065, 0, dividerY, frontInset, shellMat);

      // Glass window planes for upper and lower rack sections.
      const upperWindowH = cabinetH * 0.39;
      const lowerWindowH = cabinetH * 0.39;
      const topWindowY = cabinetH * 0.73;
      const bottomWindowY = cabinetH * 0.25;
      const glassZ = cabinetD / 2 - 0.018;
      [
        { h: upperWindowH, y: topWindowY },
        { h: lowerWindowH, y: bottomWindowY }
      ].forEach(section => {
        const glass = new THREE.Mesh(new THREE.PlaneGeometry(openingW, section.h), glassMat);
        glass.position.set(0, section.y, glassZ);
        group.add(glass);
      });

      // Bottom plinth.
      addPanel(cabinetW * 0.88, cabinetH * 0.03, cabinetD * 0.96, 0, cabinetH * 0.015, 0, trimMat);

      group.scale.set(
        width / Math.max(0.001, cabinetW),
        height / Math.max(0.001, cabinetH),
        depth / Math.max(0.001, cabinetD)
      );
      group.rotation.y = 0;
      group.userData.uploadedServerRack = true;
      return group;
    }

    loadUploadedLavaLampModel() {
      const modelState = this.lavaLampModel;
      if (!modelState || modelState.loaded || modelState.failed) return modelState?.parts || null;
      const data = window.UptimeLavaLampObjData;
      if (!data || !Array.isArray(data.parts) || !data.parts.length) {
        modelState.failed = true;
        return null;
      }
      try {
        const THREE = this.THREE;
        const parts = [];
        const combinedBounds = new THREE.Box3();
        data.parts.forEach(partData => {
          if (!Array.isArray(partData.vertices) || !Array.isArray(partData.indices) || !partData.vertices.length || !partData.indices.length) return;
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute('position', new THREE.Float32BufferAttribute(partData.vertices, 3));
          geometry.setIndex(partData.indices);
          geometry.computeBoundingBox();
          if (!geometry.boundingBox || geometry.boundingBox.isEmpty()) return;
          combinedBounds.union(geometry.boundingBox);
          geometry.computeVertexNormals();
          parts.push({
            geometry,
            role: partData.role || 'shell',
            name: partData.name || 'lava-lamp-part',
            materialName: partData.materialName || ''
          });
        });
        const size = combinedBounds.getSize(new THREE.Vector3());
        if (!parts.length || !Number.isFinite(size.x) || !Number.isFinite(size.y) || !Number.isFinite(size.z) || size.x <= 0 || size.y <= 0 || size.z <= 0) {
          throw new Error('Embedded lava lamp mesh has invalid bounds.');
        }
        const center = combinedBounds.getCenter(new THREE.Vector3());
        parts.forEach(part => {
          part.geometry.translate(-center.x, -combinedBounds.min.y, -center.z);
          part.geometry.computeBoundingBox();
          part.geometry.computeVertexNormals();
        });
        modelState.parts = parts;
        modelState.boundsSize = new THREE.Vector3(size.x, size.y, size.z);
        modelState.loaded = true;
        return parts;
      } catch (error) {
        console.warn('Uploaded lava lamp mesh failed to initialize; using native animated lava lamp.', error);
        modelState.failed = true;
        modelState.parts = [];
        modelState.boundsSize = null;
        return null;
      }
    }

    createMouseModel(width = 0.11, maxDepth = 0.16, maxHeight = 0.055) {
      const THREE = this.THREE;
      const modelState = this.mouseModel || {};
      const parts = modelState.meshes || [];
      const size = modelState.boundsSize;
      if (!parts.length || !size || size.x <= 0 || size.y <= 0 || size.z <= 0) return null;
      const group = new THREE.Group();
      const fitScale = Math.min(width / Math.max(0.001, size.x), maxDepth / Math.max(0.001, size.z));
      const heightScale = Math.min(fitScale, maxHeight / Math.max(0.001, size.y));
      const textureCache = modelState.loadedTextures || (modelState.loadedTextures = {});
      const textureSources = modelState.textureSources || {};
      const loadTexture = (key, isColor = false) => {
        const src = textureSources[key];
        if (!src) return null;
        if (textureCache[key]) return textureCache[key];
        const texture = new THREE.TextureLoader().load(src);
        texture.flipY = false;
        if (isColor) {
          if ('colorSpace' in texture && THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
          else if ('encoding' in texture && THREE.sRGBEncoding) texture.encoding = THREE.sRGBEncoding;
        }
        textureCache[key] = texture;
        return texture;
      };
      const sharedMap = loadTexture('baseColor', true);
      const sharedAo = loadTexture('aoMap');
      const sharedMetalness = loadTexture('metalnessMap');
      const sharedRoughness = loadTexture('roughnessMap');
      const sharedNormal = loadTexture('normalMap');
      parts.forEach(part => {
        const spec = part.material || {};
        const baseColor = Number.isFinite(Number(spec.color)) ? Number(spec.color) : 0x20252a;
        const material = new THREE.MeshStandardMaterial({
          color: baseColor,
          map: sharedMap || null,
          aoMap: sharedAo || null,
          metalnessMap: sharedMetalness || null,
          roughnessMap: sharedRoughness || null,
          normalMap: sharedNormal || null,
          metalness: sharedMetalness ? 1 : (Number.isFinite(Number(spec.metalness)) ? Number(spec.metalness) : 0.08),
          roughness: sharedRoughness ? 1 : (Number.isFinite(Number(spec.roughness)) ? Number(spec.roughness) : 0.62),
          side: THREE.DoubleSide
        });
        const mesh = new THREE.Mesh(part.geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
      });
      group.scale.set(fitScale, heightScale, fitScale);
      group.rotation.y = Math.PI;
      group.userData.uploadedMouse = true;
      return group;
    }

    async loadDeskMonitorModel() {
      const modelState = this.deskMonitorModel;
      if (!modelState || modelState.loaded || modelState.failed) return modelState?.geometry || null;
      const data = window.UptimeDeskMonitorMeshData;
      if (!data || !Array.isArray(data.vertices) || !Array.isArray(data.indices)) {
        modelState.failed = true;
        return null;
      }
      try {
        const THREE = this.THREE;
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(data.vertices, 3));
        geometry.setIndex(data.indices);
        geometry.computeBoundingBox();
        const bounds = geometry.boundingBox;
        const size = bounds.getSize(new THREE.Vector3());
        if (!Number.isFinite(size.x) || !Number.isFinite(size.y) || size.x <= 0 || size.y <= 0) {
          throw new Error('Embedded monitor mesh has invalid bounds.');
        }
        const center = bounds.getCenter(new THREE.Vector3());
        geometry.translate(-center.x, -center.y, -center.z);
        geometry.computeBoundingBox();
        geometry.computeVertexNormals();
        const materialSpec = data.material || {};
        modelState.geometry = geometry;
        modelState.material = new THREE.MeshStandardMaterial({
          color: Number.isFinite(Number(materialSpec.color)) ? Number(materialSpec.color) : 0x111923,
          metalness: Number.isFinite(Number(materialSpec.metalness)) ? Number(materialSpec.metalness) : 0.22,
          roughness: Number.isFinite(Number(materialSpec.roughness)) ? Number(materialSpec.roughness) : 0.58,
          side: THREE.DoubleSide
        });
        modelState.boundsSize = geometry.boundingBox.getSize(new THREE.Vector3());
        modelState.loaded = true;
        return geometry;
      } catch (error) {
        console.warn('Uploaded desk monitor mesh failed to initialize; using built-in monitor boxes.', error);
        modelState.failed = true;
        modelState.geometry = null;
        modelState.material = null;
        return null;
      }
    }

    createDeskMonitorModelShell(width, height, depth = 0.08) {
      const THREE = this.THREE;
      const modelState = this.deskMonitorModel || {};
      const geometry = modelState.geometry;
      const size = modelState.boundsSize;
      if (!geometry || !size || size.x <= 0 || size.y <= 0) return null;
      const group = new THREE.Group();
      const material = modelState.material ? modelState.material.clone() : new THREE.MeshStandardMaterial({ color: 0x111923, roughness: 0.58, metalness: 0.22, side: THREE.DoubleSide });
      material.color.setHex(0x05080d);
      material.metalness = 0.34;
      material.roughness = 0.46;
      const shell = new THREE.Mesh(geometry, material);
      // The uploaded monitor shell imports with its back facing the room.
      // Flip only the shell mesh; the animated screen plane stays independently in front.
      shell.rotation.y = Math.PI;
      const targetWidth = width * 1.18;
      const targetHeight = height * 1.18;
      const scaleX = targetWidth / Math.max(0.001, size.x);
      const scaleY = targetHeight / Math.max(0.001, size.y);
      const scaleZ = Math.max(depth * 1.55 / Math.max(0.001, size.z || depth), Math.max(scaleX, scaleY) * 0.18);
      shell.scale.set(scaleX, scaleY, Math.min(scaleZ, Math.max(scaleX, scaleY) * 0.72));
      shell.castShadow = true;
      shell.receiveShadow = true;
      group.add(shell);

      // The uploaded shell is fairly close to the old box silhouette at desk scale.
      // Add a subtle visible bevel/edge pass from the same mesh so the imported model reads as a real frame.
      try {
        const edges = new THREE.EdgesGeometry(geometry, 18);
        const edgeLines = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x1d2a32, transparent: true, opacity: 0.72 }));
        edgeLines.rotation.y = Math.PI;
        edgeLines.scale.copy(shell.scale);
        edgeLines.position.z += 0.003;
        group.add(edgeLines);
      } catch (error) {
        // Decorative only; keep the monitor usable if EdgesGeometry is unhappy.
      }
      group.userData.uploadedMonitorShell = true;
      return group;
    }

    ensureOfficeAudioListener() {
      const THREE = this.THREE;
      if (!THREE || !this.camera) return null;
      if (this.officeAudioListener) return this.officeAudioListener;
      try {
        const listener = new THREE.AudioListener();
        this.camera.add(listener);
        this.officeAudioListener = listener;
        return listener;
      } catch (error) {
        console.warn('Office audio listener could not initialize.', error);
        return null;
      }
    }

    initServerAmbienceAudio() {
      const THREE = this.THREE;
      if (!THREE || !this.camera || this.serverAmbience?.sound || this.serverAmbience?.failed) return;
      try {
        const listener = this.ensureOfficeAudioListener();
        if (!listener) throw new Error('No office audio listener available.');
        const sound = new THREE.PositionalAudio(listener);
        sound.setLoop(true);
        sound.setVolume(this.state.soundEnabled ? 0.24 : 0);
        sound.setRefDistance(0.95);
        sound.setMaxDistance(11.5);
        sound.setRolloffFactor(2.15);
        sound.setDistanceModel('inverse');
        if (sound.panner) {
          sound.panner.panningModel = 'HRTF';
          sound.panner.distanceModel = 'inverse';
        }
        this.serverAmbience.listener = listener;
        this.serverAmbience.sound = sound;
        this.scene.add(sound);
        this.updateServerAmbiencePosition();
      } catch (error) {
        console.warn('Server rack ambience could not initialize.', error);
        this.serverAmbience.failed = true;
      }
    }

    loadServerAmbienceAudio() {
      const ambience = this.serverAmbience;
      const sound = ambience?.sound;
      if (!this.THREE || !sound || ambience.bufferReady || ambience.loading || ambience.failed) return;
      const base64 = window.UPTIME_SERVER_AMBIENCE_WAV_BASE64;
      if (!base64) {
        ambience.failed = true;
        console.warn('Server rack ambience audio data is missing.');
        return;
      }
      const ctx = ambience.listener?.context || sound.context;
      if (!ctx || typeof ctx.decodeAudioData !== 'function') {
        ambience.failed = true;
        console.warn('Server rack ambience audio context is unavailable.');
        return;
      }
      ambience.loading = true;
      try {
        const bytes = base64ToUint8Array(base64);
        const audioData = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
        const decoded = ctx.decodeAudioData(audioData);
        ambience.decodePromise = Promise.resolve(decoded)
          .then(buffer => {
            if (this.destroyed) return;
            sound.setBuffer(buffer);
            sound.setLoop(true);
            sound.setVolume(this.state.soundEnabled !== false ? 0.24 : 0);
            ambience.bufferReady = true;
            ambience.loading = false;
            this.syncServerAmbienceAudio();
          })
          .catch(error => {
            ambience.loading = false;
            ambience.failed = true;
            console.warn('Server rack ambience failed to decode.', error);
          });
      } catch (error) {
        ambience.loading = false;
        ambience.failed = true;
        console.warn('Server rack ambience failed to initialize embedded audio.', error);
      }
    }

    updateServerAmbiencePosition() {
      const sound = this.serverAmbience?.sound;
      const anchor = this.serverRackAudioAnchor;
      if (!sound || !anchor) return;
      sound.position.set(anchor.x, anchor.y, anchor.z);
    }

    primeServerAmbienceAudio() {
      if (!this.state.soundEnabled || !this.loaded) return;
      this.serverAmbience.primed = true;
      this.initServerAmbienceAudio();
      this.loadServerAmbienceAudio();
      this.syncServerAmbienceAudio();
    }

    syncServerAmbienceAudio() {
      const ambience = this.serverAmbience;
      const sound = ambience?.sound;
      if (!sound) return;
      const enabled = this.state.soundEnabled !== false;
      sound.setVolume(enabled ? 0.24 : 0);
      if (!enabled) {
        if (sound.isPlaying) sound.stop();
        return;
      }
      if (!ambience.primed || ambience.failed) return;
      if (!ambience.bufferReady) {
        this.loadServerAmbienceAudio();
        return;
      }
      if (sound.isPlaying) return;
      const ctx = ambience.listener?.context || sound.context;
      const start = () => {
        try {
          if (!sound.isPlaying) sound.play();
        } catch (error) {
          console.warn('Server rack ambience could not start.', error);
        }
      };
      if (ctx && ctx.state === 'suspended' && typeof ctx.resume === 'function') {
        ctx.resume().then(start).catch(error => {
          console.warn('Server rack ambience audio context could not resume.', error);
        });
      } else {
        start();
      }
    }


    primeOfficeAudio() {
      this.primeServerAmbienceAudio();
      this.primeBackgroundMusicAudio();
      this.primeFootstepAudio();
    }

    initFootstepAudio() {
      const foot = this.footstepAudio;
      if (!this.THREE || !this.camera || foot.gain || foot.failed) return;
      const listener = this.ensureOfficeAudioListener();
      const ctx = listener?.context;
      if (!listener || !ctx || typeof ctx.createGain !== 'function') return;
      try {
        const gain = ctx.createGain();
        gain.gain.value = 0;
        const destination = typeof listener.getInput === 'function' ? listener.getInput() : ctx.destination;
        gain.connect(destination);
        foot.listener = listener;
        foot.gain = gain;
      } catch (error) {
        foot.failed = true;
        console.warn('Footstep audio could not initialize.', error);
      }
    }

    loadFootstepAudio() {
      const foot = this.footstepAudio;
      if (foot.loaded || foot.loading || foot.failed) return;
      this.initFootstepAudio();
      const gain = foot.gain;
      const ctx = foot.listener?.context || gain?.context;
      if (!ctx || typeof ctx.decodeAudioData !== 'function') return;
      const pack = window.UPTIME_FOOTSTEP_SOUNDS || null;
      const tracks = Array.isArray(pack?.tracks) ? pack.tracks : [];
      if (!tracks.length) {
        foot.failed = true;
        console.warn('Footstep sound data is missing.');
        return;
      }
      foot.loading = true;
      try {
        foot.decodePromise = Promise.all(tracks.map(track => {
          const bytes = base64ToUint8Array(track.base64 || '');
          const audioData = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
          return Promise.resolve(ctx.decodeAudioData(audioData)).then(buffer => ({
            id: track.id || track.filename || `footstep-${Math.random()}`,
            title: track.title || track.filename || 'Footstep',
            normalizationGain: Number.isFinite(Number(track.normalizationGain)) ? Number(track.normalizationGain) : 1,
            buffer
          }));
        }))
          .then(buffers => {
            if (this.destroyed) return;
            foot.buffers = buffers.filter(item => item && item.buffer);
            foot.loaded = foot.buffers.length > 0;
            foot.loading = false;
            if (!foot.loaded) foot.failed = true;
            this.syncFootstepAudio();
          })
          .catch(error => {
            foot.loading = false;
            foot.failed = true;
            console.warn('Footstep sounds failed to decode.', error);
          });
      } catch (error) {
        foot.loading = false;
        foot.failed = true;
        console.warn('Footstep sounds failed to initialize embedded audio.', error);
      }
    }

    primeFootstepAudio() {
      if (!this.state.soundEnabled || !this.loaded) return;
      const foot = this.footstepAudio;
      foot.primed = true;
      this.initFootstepAudio();
      this.loadFootstepAudio();
      this.syncFootstepAudio();
    }

    syncFootstepAudio() {
      const foot = this.footstepAudio;
      if (!foot) return;
      this.initFootstepAudio();
      const gain = foot.gain;
      const ctx = foot.listener?.context || gain?.context;
      if (!gain || !ctx) return;
      const enabled = this.state.soundEnabled !== false;
      const targetVolume = enabled && foot.primed && !foot.failed ? foot.volume : 0;
      try {
        gain.gain.setTargetAtTime(targetVolume, ctx.currentTime, 0.04);
      } catch (error) {
        gain.gain.value = targetVolume;
      }
    }

    pickFootstepTrack() {
      const foot = this.footstepAudio;
      const tracks = foot.buffers || [];
      if (!tracks.length) return null;
      if (tracks.length === 1) return tracks[0];
      let track = tracks[Math.floor(Math.random() * tracks.length)];
      let guard = 0;
      while (track.id === foot.lastTrackId && guard < 8) {
        track = tracks[Math.floor(Math.random() * tracks.length)];
        guard += 1;
      }
      return track;
    }

    playRandomFootstepAudio(running = false) {
      const foot = this.footstepAudio;
      if (!foot || this.destroyed || foot.failed || this.state.soundEnabled === false) return;
      if (!foot.primed) this.primeFootstepAudio();
      if (!foot.loaded) {
        this.loadFootstepAudio();
        return;
      }
      const gainOut = foot.gain;
      const ctx = foot.listener?.context || gainOut?.context;
      if (!gainOut || !ctx) return;
      if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
        ctx.resume().then(() => this.playRandomFootstepAudio(running)).catch(() => {});
        return;
      }
      const track = this.pickFootstepTrack();
      if (!track) return;
      try {
        const source = ctx.createBufferSource();
        const clipGain = ctx.createGain();
        source.buffer = track.buffer;
        source.playbackRate.value = (running ? 1.08 : 0.96) + (Math.random() - 0.5) * 0.12;
        clipGain.gain.value = Math.max(0.05, track.normalizationGain || 1) * (running ? 1.08 : 0.94);
        source.connect(clipGain).connect(gainOut);
        foot.activeSources.add(source);
        foot.lastTrackId = track.id;
        source.onended = () => {
          foot.activeSources.delete(source);
          try { source.disconnect(); } catch (error) {}
          try { clipGain.disconnect(); } catch (error) {}
        };
        source.start(0);
      } catch (error) {
        console.warn('Footstep sound could not play.', error);
      }
    }

    updateFootstepAudio(moving = false, running = false, dt = 0.016) {
      const foot = this.footstepAudio;
      if (!foot || this.state.soundEnabled === false || !this.isManualControlActive() || this.computerHold || this.arcadeHold || this.placementMode || this.moveMode) {
        if (foot) {
          foot.stepTimer = 0;
          foot.wasMoving = false;
        }
        return;
      }
      if (!moving) {
        foot.stepTimer = 0;
        foot.wasMoving = false;
        return;
      }
      if (!foot.wasMoving) {
        foot.stepTimer = running ? 0.11 : 0.15;
        foot.wasMoving = true;
      }
      foot.stepTimer += Math.max(0, dt || 0);
      const interval = running ? 0.27 : 0.39;
      if (foot.stepTimer >= interval) {
        foot.stepTimer = 0;
        this.playRandomFootstepAudio(running);
      }
    }

    stopFootstepAudio() {
      const foot = this.footstepAudio;
      if (!foot?.activeSources) return;
      foot.activeSources.forEach(source => {
        try { source.onended = null; } catch (error) {}
        try { source.stop(0); } catch (error) {}
        try { source.disconnect(); } catch (error) {}
      });
      foot.activeSources.clear();
    }

    initBackgroundMusicAudio() {
      const music = this.backgroundMusic;
      if (!this.THREE || !this.camera || music.gain || music.failed) return;
      const listener = this.ensureOfficeAudioListener();
      const ctx = listener?.context;
      if (!listener || !ctx || typeof ctx.createGain !== 'function') return;
      try {
        const gain = ctx.createGain();
        gain.gain.value = 0;
        const destination = typeof listener.getInput === 'function' ? listener.getInput() : ctx.destination;
        gain.connect(destination);
        music.listener = listener;
        music.gain = gain;
      } catch (error) {
        music.failed = true;
        console.warn('Background music could not initialize.', error);
      }
    }

    loadBackgroundMusicAudio() {
      const music = this.backgroundMusic;
      if (music.loaded || music.loading || music.failed) return;
      this.initBackgroundMusicAudio();
      const gain = music.gain;
      const ctx = music.listener?.context || gain?.context;
      if (!ctx || typeof ctx.decodeAudioData !== 'function') return;
      const tracks = Array.isArray(window.UPTIME_BACKGROUND_MUSIC_TRACKS) ? window.UPTIME_BACKGROUND_MUSIC_TRACKS : [];
      if (!tracks.length) {
        music.failed = true;
        console.warn('Background music track data is missing.');
        return;
      }
      music.loading = true;
      try {
        music.decodePromise = Promise.all(tracks.map(track => {
          const bytes = base64ToUint8Array(track.base64 || '');
          const audioData = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
          return Promise.resolve(ctx.decodeAudioData(audioData)).then(buffer => ({
            id: track.id || track.title || `track-${Math.random()}`,
            title: track.title || 'Background track',
            buffer
          }));
        }))
          .then(buffers => {
            if (this.destroyed) return;
            music.buffers = buffers.filter(item => item && item.buffer);
            music.loaded = music.buffers.length > 0;
            music.loading = false;
            if (!music.loaded) music.failed = true;
            this.syncBackgroundMusicAudio();
          })
          .catch(error => {
            music.loading = false;
            music.failed = true;
            console.warn('Background music failed to decode.', error);
          });
      } catch (error) {
        music.loading = false;
        music.failed = true;
        console.warn('Background music failed to initialize embedded audio.', error);
      }
    }

    primeBackgroundMusicAudio() {
      if (!this.state.soundEnabled || !this.loaded) return;
      this.backgroundMusic.primed = true;
      this.initBackgroundMusicAudio();
      this.loadBackgroundMusicAudio();
      this.syncBackgroundMusicAudio();
    }

    syncBackgroundMusicAudio() {
      const music = this.backgroundMusic;
      this.initBackgroundMusicAudio();
      const gain = music.gain;
      const ctx = music.listener?.context || gain?.context;
      if (!gain || !ctx) return;
      const enabled = this.state.soundEnabled !== false;
      const targetVolume = enabled && music.primed && !music.failed ? music.volume : 0;
      try {
        gain.gain.setTargetAtTime(targetVolume, ctx.currentTime, 0.18);
      } catch (error) {
        gain.gain.value = targetVolume;
      }
      if (!enabled) {
        this.stopBackgroundMusicAudio();
        return;
      }
      if (!music.primed || music.failed) return;
      if (!music.loaded) {
        this.loadBackgroundMusicAudio();
        return;
      }
      if (!music.currentSource && !music.nextTimer) this.scheduleNextBackgroundMusicTrack(180);
    }

    scheduleNextBackgroundMusicTrack(delayMs = 900) {
      const music = this.backgroundMusic;
      if (music.nextTimer) clearTimeout(music.nextTimer);
      music.nextTimer = window.setTimeout(() => {
        music.nextTimer = null;
        this.playRandomBackgroundMusicTrack();
      }, Math.max(0, delayMs));
    }

    pickBackgroundMusicTrack() {
      const music = this.backgroundMusic;
      const tracks = music.buffers || [];
      if (!tracks.length) return null;
      if (tracks.length === 1) return tracks[0];
      let track = tracks[Math.floor(Math.random() * tracks.length)];
      let guard = 0;
      while (track.id === music.lastTrackId && guard < 8) {
        track = tracks[Math.floor(Math.random() * tracks.length)];
        guard += 1;
      }
      return track;
    }

    playRandomBackgroundMusicTrack() {
      const music = this.backgroundMusic;
      if (this.destroyed || music.failed || !music.primed || this.state.soundEnabled === false) return;
      if (music.currentSource) return;
      if (!music.loaded) {
        this.loadBackgroundMusicAudio();
        return;
      }
      const gain = music.gain;
      const ctx = music.listener?.context || gain?.context;
      if (!gain || !ctx) return;
      if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
        ctx.resume().then(() => this.playRandomBackgroundMusicTrack()).catch(error => {
          console.warn('Background music audio context could not resume.', error);
        });
        return;
      }
      const track = this.pickBackgroundMusicTrack();
      if (!track) return;
      try {
        const source = ctx.createBufferSource();
        source.buffer = track.buffer;
        source.loop = false;
        source.connect(gain);
        music.currentSource = source;
        music.currentTrack = track;
        music.lastTrackId = track.id;
        source.onended = () => {
          if (music.currentSource === source) {
            try { source.disconnect(); } catch (error) {}
            music.currentSource = null;
            music.currentTrack = null;
            if (!this.destroyed && this.state.soundEnabled !== false && music.primed) {
              this.scheduleNextBackgroundMusicTrack(900 + Math.floor(Math.random() * 3200));
            }
          }
        };
        source.start(0);
      } catch (error) {
        music.currentSource = null;
        music.currentTrack = null;
        console.warn('Background music could not start.', error);
      }
    }

    stopBackgroundMusicAudio() {
      const music = this.backgroundMusic;
      if (!music) return;
      if (music.nextTimer) {
        clearTimeout(music.nextTimer);
        music.nextTimer = null;
      }
      if (music.currentSource) {
        const source = music.currentSource;
        music.currentSource = null;
        music.currentTrack = null;
        try { source.onended = null; } catch (error) {}
        try { source.stop(0); } catch (error) {}
        try { source.disconnect(); } catch (error) {}
      }
    }

    resize() {
      this.syncMobileControls();
      if (!this.renderer || !this.canvas) return;
      const host = this.canvas.parentElement || this.canvas;
      const rect = host.getBoundingClientRect();
      const width = Math.max(320, Math.round(rect.width || host.clientWidth || 320));
      const height = Math.max(260, Math.round(rect.height || host.clientHeight || 260));
      this.renderer.setSize(width, height, false);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }

    clearRoot() {
      while (this.root.children.length) {
        const child = this.root.children.pop();
        this.root.remove(child);
      }
      this.obstacles = [];
      this.autoPath = [];
      this.autoStuckTimer = 0;
      this.arcadeAnchor = { x: 0, z: 0, yaw: 0 };
      this.arcadeHold = false;
      this.arcadeView = null;
      this.arcadeTransition = null;
      this.computerInteractive = { position: { x: 0, z: -this.room.depth / 2 + 1.84 }, radius: 1.65, yaw: 0 };
      this.computerHold = false;
      this.computerView = null;
      this.computerTransition = null;
      this.dynamicDisplays = [];
      this.arcadeDisplay = null;
      this.visualQATargets = Object.create(null);
      this.animatedLavaLamps = [];
      this.animatedSceneObjects = [];
      this.animationObjectCacheDirty = true;
      this.selectableDecor = [];
      if (this.placementMode?.ghost) this.root.remove(this.placementMode.ghost);
      this.serverRackAudioAnchor = { x: -this.room.width / 2 + 0.72, y: 1.12, z: -this.room.depth / 2 + 1.08 };
      this.updateServerAmbiencePosition();
      if (this.floorBot) {
        const alreadyAnnouncedOnline = !!this.floorBot.hasAnnouncedOnline;
        const lastLineAt = this.floorBot.lastLineAt || 0;
        this.floorBot.mesh = null;
        this.floorBot.active = false;
        this.floorBot.timer = 0;
        this.floorBot.routeIndex = 0;
        this.floorBot.loopCount = 0;
        this.floorBot.speechUntil = 0;
        this.floorBot.speechText = '';
        this.floorBot.dwellUntil = 0;
        this.floorBot.patrolPoints = null;
        this.floorBot.lastLineAt = lastLineAt;
        this.floorBot.hasAnnouncedOnline = alreadyAnnouncedOnline;
      }
      this.botSpeechText = '';
      this.botSpeechUntil = 0;
    }

    getRoomForTier() {
      const tier = this.state.tier || 0;
      return {
        width: 7.4 + Math.min(tier, 5) * 0.9,
        depth: 9.2 + Math.min(tier, 5) * 0.7,
        height: 3.3 + Math.min(tier, 5) * 0.18
      };
    }

    rebuildScene() {
      if (!this.loaded) return;
      const THREE = this.THREE;
      const heldViewState = {
        arcadeHold: this.arcadeHold,
        arcadeView: this.arcadeView ? Object.assign({}, this.arcadeView) : null,
        arcadeTransition: this.arcadeTransition ? Object.assign({}, this.arcadeTransition) : null,
        computerHold: this.computerHold,
        computerView: this.computerView ? Object.assign({}, this.computerView) : null,
        computerTransition: this.computerTransition ? Object.assign({}, this.computerTransition) : null
      };
      this.clearRoot();
      this.room = this.getRoomForTier();
      const room = this.room;
      if (this.overheadLight) {
        this.overheadLight.position.set(0, room.height + 2.7, 0);
        this.overheadLight.target.position.set(0, 0, 0);
        this.overheadLight.shadow.camera.left = -room.width * 0.62;
        this.overheadLight.shadow.camera.right = room.width * 0.62;
        this.overheadLight.shadow.camera.top = room.depth * 0.58;
        this.overheadLight.shadow.camera.bottom = -room.depth * 0.58;
        this.overheadLight.shadow.camera.near = 0.5;
        this.overheadLight.shadow.camera.far = room.height + 8;
        this.overheadLight.shadow.camera.updateProjectionMatrix();
      }

      const wallMat = new THREE.MeshStandardMaterial({ map: this.makeWallTexture(this.state.wallFinish), roughness: 0.98, metalness: 0.02, side: THREE.DoubleSide });
      wallMat.map.wrapS = wallMat.map.wrapT = THREE.RepeatWrapping;
      wallMat.map.repeat.set(Math.max(4, room.width / 1.25), Math.max(3, room.height / 1.15));

      if (this.state.floorFinish === 'aesthetic-tile' || this.state.floorFinish === 'sci-fi-tile') {
        const floorBaseColor = this.state.floorFinish === 'sci-fi-tile' ? 0x0a1115 : 0x100d12;
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(room.width, room.depth), new THREE.MeshStandardMaterial({ color: floorBaseColor, roughness: 0.98, metalness: 0.02, side: THREE.DoubleSide }));
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -0.002;
        floor.receiveShadow = true;
        this.root.add(floor);
        this.buildFloorTilesFromModel(this.state.floorFinish, room);
      } else {
        const floorMat = new THREE.MeshStandardMaterial({ map: this.makeFloorTexture(this.state.floorFinish), roughness: 0.95, metalness: 0.05, side: THREE.DoubleSide });
        floorMat.map.wrapS = floorMat.map.wrapT = THREE.RepeatWrapping;
        floorMat.map.repeat.set(Math.max(5, room.width / 1.1), Math.max(5, room.depth / 1.1));
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(room.width, room.depth), floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.root.add(floor);
      }

      const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(room.width, room.depth), new THREE.MeshStandardMaterial({ color: 0xb8c0c7, roughness: 0.95, metalness: 0.02, side: THREE.DoubleSide }));
      ceiling.rotation.x = Math.PI / 2;
      ceiling.position.y = room.height;
      this.root.add(ceiling);

      const backWall = new THREE.Mesh(new THREE.PlaneGeometry(room.width, room.height), wallMat.clone());
      backWall.position.set(0, room.height / 2, -room.depth / 2);
      this.root.add(backWall);
      const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(room.width, room.height), wallMat.clone());
      frontWall.position.set(0, room.height / 2, room.depth / 2);
      frontWall.rotation.y = Math.PI;
      this.root.add(frontWall);
      const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(room.depth, room.height), wallMat.clone());
      leftWall.position.set(-room.width / 2, room.height / 2, 0);
      leftWall.rotation.y = Math.PI / 2;
      this.root.add(leftWall);
      const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(room.depth, room.height), wallMat.clone());
      rightWall.position.set(room.width / 2, room.height / 2, 0);
      rightWall.rotation.y = -Math.PI / 2;
      this.root.add(rightWall);

      this.buildDoor(frontWall);
      this.buildCeilingLight();
      this.buildCoreFurniture();
      this.buildDecorations();
      this.autoPath = [];
      this.autoTarget = null;
      this.player.x = clamp(this.player.x, -room.width / 2 + 0.8, room.width / 2 - 0.8);
      this.player.z = clamp(this.player.z, -room.depth / 2 + 1.0, room.depth / 2 - 0.8);
      if (heldViewState.computerHold) {
        this.computerHold = true;
        this.computerView = heldViewState.computerView || this.getDeskExitPose();
        this.computerTransition = heldViewState.computerTransition;
      }
      if (heldViewState.arcadeHold) {
        this.arcadeHold = true;
        this.arcadeView = heldViewState.arcadeView;
        this.arcadeTransition = heldViewState.arcadeTransition;
      }
      this.updateOverlay();
    }

    buildDoor() {
      const THREE = this.THREE;
      const group = new THREE.Group();
      const z = this.room.depth / 2 - 0.01;
      const frame = new THREE.Mesh(new THREE.BoxGeometry(1.28, 2.22, 0.08), new THREE.MeshStandardMaterial({ color: 0x2b3138, roughness: 0.9 }));
      frame.position.set(0, 1.11, z);
      group.add(frame);
      const inset = new THREE.Mesh(new THREE.BoxGeometry(1.04, 1.98, 0.05), new THREE.MeshStandardMaterial({ color: 0x55606d, roughness: 0.86 }));
      inset.position.set(0, 1.03, z - 0.01);
      group.add(inset);
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.22, 0.03), new THREE.MeshStandardMaterial({ color: 0xd8dee7, metalness: 0.7, roughness: 0.24 }));
      handle.position.set(0.4, 1.02, z - 0.05);
      group.add(handle);
      this.root.add(group);
    }

    buildCeilingLight() {
      const THREE = this.THREE;
      const housing = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.46), new THREE.MeshStandardMaterial({ color: 0xe8f3ff, emissive: 0x223d58, emissiveIntensity: 0.35 }));
      housing.position.set(0, this.room.height - 0.08, 0);
      this.root.add(housing);
      const glow = new THREE.PointLight(0xeef7ff, 1.25, 18, 2);
      glow.position.set(0, this.room.height - 0.28, 0);
      this.root.add(glow);
    }

    addObstacle(x, z, w, d, pad = 0.18) {
      this.obstacles.push({ minX: x - w / 2 - pad, maxX: x + w / 2 + pad, minZ: z - d / 2 - pad, maxZ: z + d / 2 + pad });
    }

    makeContactShadowTexture() {
      const THREE = this.THREE;
      const canvas = makeCanvas(256, 256);
      const ctx = canvas.getContext('2d');
      const grad = ctx.createRadialGradient(128, 128, 18, 128, 128, 112);
      grad.addColorStop(0, 'rgba(0,0,0,0.34)');
      grad.addColorStop(0.45, 'rgba(0,0,0,0.18)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 256);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace || texture.colorSpace;
      return texture;
    }

    addContactShadow(x, z, w, d, opacity = 0.22) {
      const THREE = this.THREE;
      if (!this._contactShadowTexture) this._contactShadowTexture = this.makeContactShadowTexture();
      const shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(w, d),
        new THREE.MeshBasicMaterial({ map: this._contactShadowTexture, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide })
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.set(x, 0.0115, z);
      this.root.add(shadow);
      return shadow;
    }

    getDeskFinishSpec() {
      return {
        default: { top: 0x8b6450, wood: 0x6f4f3c, modesty: 0x5d4336 },
        graphite: { top: 0x525860, wood: 0x343940, modesty: 0x2d3238 },
        ivory: { top: 0xe8e2d8, wood: 0xc8c0b4, modesty: 0xb1a99e },
        synthwave: { top: 0x6a4b80, wood: 0x402853, modesty: 0x352045 },
        emerald: { top: 0x4c7e72, wood: 0x2d5148, modesty: 0x25423b }
      }[this.state.deskFinish || 'default'] || { top: 0x8b6450, wood: 0x6f4f3c, modesty: 0x5d4336 };
    }

    getChairFinishSpec() {
      return {
        default: { seat: 0x30465b, back: 0x324b61, base: 0x243644 },
        charcoal: { seat: 0x43484e, back: 0x515860, base: 0x262b31 },
        ice: { seat: 0xbad7ea, back: 0x96bfd8, base: 0x5f7786 },
        magenta: { seat: 0xa4467a, back: 0xba5a90, base: 0x5a2544 },
        lime: { seat: 0x74b657, back: 0x89cb6d, base: 0x325329 }
      }[this.state.chairFinish || 'default'] || { seat: 0x30465b, back: 0x324b61, base: 0x243644 };
    }

    getRobotDistance() {
      return this.floorBot && this.floorBot.mesh ? Math.hypot(this.player.x - this.floorBot.mesh.position.x, this.player.z - this.floorBot.mesh.position.z) : 999;
    }

    getBotPersonalityLines(kind = 'patrol') {
      const sets = {
        funny: {
          online: ['{name} is online and already pretending this was planned.', '{name} has booted with maximum wheel confidence.'],
          ready: ['{name} is ready for configuration. Please admire the firmware posture.', '{name} has opened the settings portal with dramatic efficiency.'],
          updated: ['{name} settings updated. The wheels feel emotionally refreshed.', '{name} has accepted the new settings and will now be impossible to humble.'],
          patrol: ['{name} is sweeping the perimeter.', '{name} reports uptime is acceptable.', '{name} is conducting a highly scientific patrol.', '{name} is definitely not joyriding.', '{name} is ninety percent diligence, ten percent wheel squeak.'],
          charge: ['{name} needs to charge before becoming decorative hardware.', '{name} is returning to dock for a tiny electric snack.'],
          resume: ['{name} is resuming patrol with freshly toasted batteries.', '{name} is back online and making it everyone’s problem.'],
          loop: ['{name} completed a patrol loop. Please clap internally.', '{name} has circled the suite and found the floor suspiciously floor-like.']
        },
        serious: {
          online: ['{name} is online. Systems nominal.', '{name} has initialized and is standing by.'],
          ready: ['{name} is ready for configuration.', '{name} is awaiting configuration input.'],
          updated: ['{name} settings updated.', '{name} configuration saved.'],
          patrol: ['{name} is conducting a routine security patrol.', '{name} confirms all sectors remain within tolerance.', '{name} is scanning the office perimeter.', '{name} reports no immediate anomalies.'],
          charge: ['{name} is returning to dock for charge preservation.', '{name} battery level requires docking.'],
          resume: ['{name} is resuming assigned duties.', '{name} patrol operations have resumed.'],
          loop: ['{name} completed a patrol loop.', '{name} perimeter route complete.']
        },
        sassy: {
          online: ['{name} is online. Try to keep up.', '{name} has arrived, which frankly improves the room.'],
          ready: ['{name} is ready for configuration. Bold of you to assume improvements are possible.', '{name} is listening. Make the settings worth the interruption.'],
          updated: ['{name} settings updated. Finally.', '{name} accepted the changes. We will see whether that was wise.'],
          patrol: ['{name} is cleaning up after everyone else, as usual.', '{name} sees your cable management and remains disappointed.', '{name} is patrolling because someone has to maintain standards.', '{name} is monitoring the room and silently taking notes.'],
          charge: ['{name} needs to charge because apparently this place runs on chaos.', '{name} is docking before the room drains every last electron.'],
          resume: ['{name} is back. Try not to break anything while {name} was gone.', '{name} has returned. Standards may resume.'],
          loop: ['{name} completed another loop. You’re welcome.', '{name} inspected the room again. The notes are not flattering.']
        },
        queen: {
          online: ['{name} is online. The suite may now proceed.', '{name} has entered the room. Adjust accordingly.'],
          ready: ['{name} is ready for configuration. Make it elegant.', '{name} grants you permission to adjust the settings.'],
          updated: ['{name} settings updated. Regal.', '{name} accepts the new configuration with grace.'],
          patrol: ['{name} is gliding through the suite like the icon {name} is.', '{name} has judged the uptime and found it acceptable.', '{name} patrols with presence and excellent lighting.', '{name} is maintaining order with royal precision.'],
          charge: ['{name} requires a brief charge intermission. Glamour is energy intensive.', '{name} is retiring to the dock for a power refresh.'],
          resume: ['{name} has returned. The room may continue admiring {name}.', '{name} resumes patrol. The standards remain high.'],
          loop: ['{name} completed a patrol loop with impeccable form.', '{name} has circled the realm. All may continue.']
        },
        sad: {
          online: ['{name} is online. Somehow.', '{name} has booted. The little light still works.'],
          ready: ['{name} is ready for configuration. Probably.', '{name} is here for settings. This is fine.'],
          updated: ['{name} settings updated. Maybe that helps.', '{name} saved the settings. A small victory.'],
          patrol: ['{name} is still patrolling. Somehow.', '{name} is rolling onward because stopping would be suspicious.', '{name} continues the route. Joy remains unavailable.', '{name} reports that the floor is still there.'],
          charge: ['{name} needs to charge. Life is a battery metaphor.', '{name} is returning to dock and thinking about outlets.'],
          resume: ['{name} is resuming patrol. Joy remains unavailable.', '{name} is back from the dock. We endure.'],
          loop: ['{name} has completed another loop. Hooray, probably.', '{name} finished the route. The room persists.']
        }
      };
      const profile = this.state.floorBotProfile || { personality: 'funny' };
      const personality = sets[profile.personality] ? profile.personality : 'funny';
      return sets[personality][kind] || sets[personality].patrol || sets.funny.patrol;
    }

    speakBotLine(line) {
      const profile = this.state.floorBotProfile || { name: 'Floor Bot', voicePitch: 1, voiceSpeed: 1, speechFrequency: 1, voiceId: '', voiceEnabled: true, personality: 'funny' };
      const tokenMatch = typeof line === 'string' ? line.match(/^__personality_([a-z0-9_-]+)__$/i) : null;
      const raw = tokenMatch ? this.getBotPersonalityLines(tokenMatch[1]) : line;
      const source = Array.isArray(raw) ? raw[Math.floor(Math.random() * raw.length)] : raw;
      const rendered = String(source || '').replace(/\{name\}/g, profile.name || 'Floor Bot');
      const now = performance.now();
      if (this.floorBot) { this.floorBot.speechText = rendered; this.floorBot.speechUntil = now + 3200; }
      this.botSpeechText = rendered;
      this.botSpeechUntil = now + 5000;
      if (!profile.voiceEnabled || !this.state.soundEnabled || !rendered) return;
      if (this._botSpeechCooldown && now < this._botSpeechCooldown) return;
      this._botSpeechCooldown = now + 6500;
      if (typeof window === 'undefined' || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
      const utterance = new window.SpeechSynthesisUtterance(rendered);
      utterance.pitch = clamp(Number(profile.voicePitch || 1), 0.2, 2.0);
      utterance.rate = clamp(Number(profile.voiceSpeed || 1), 0.25, 3.0);
      utterance.volume = 0.7;
      const voices = window.speechSynthesis.getVoices ? (window.speechSynthesis.getVoices() || []) : [];
      const selectedVoice = voices.find(voice => String(voice.voiceURI || voice.name || '') === String(profile.voiceId || ''));
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        if (selectedVoice.lang) utterance.lang = selectedVoice.lang;
      }
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }

    getFloorBotPatrolPoints() {
      const r = this.room;
      return [
        { x:  r.width / 2 - 1.60, z:  r.depth / 2 - 1.90 },
        { x:  r.width / 2 - 1.95, z:  0.95 },
        { x:  0.95,               z:  0.30 },
        { x:  0.00,               z: -0.35 },
        { x: -0.95,               z: -0.95 },
        { x: -r.width / 2 + 1.80, z: -0.35 },
        { x: -0.60,               z:  1.10 },
        { x:  r.width / 2 - 1.35, z:  0.35 }
      ];
    }

    buildArcadeModelMesh() {
      const THREE = this.THREE;
      const data = window.UptimeArcadeModelData;
      if (!data || !data.positions || !data.colors) return null;
      const geometry = new THREE.BufferGeometry();
      const positions = base64ToFloat32Array(data.positions);
      const colorBytes = base64ToUint8Array(data.colors);
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colorBytes, 3, true));
      geometry.computeVertexNormals();
      const material = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.78, metalness: 0.06 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const bounds = new THREE.Box3().setFromObject(mesh);
      const size = bounds.getSize(new THREE.Vector3());
      const desiredHeight = 2.12;
      const scale = desiredHeight / Math.max(0.001, size.y);
      mesh.scale.setScalar(scale);
      const scaledBounds = new THREE.Box3().setFromObject(mesh);
      const center = scaledBounds.getCenter(new THREE.Vector3());
      mesh.position.x -= center.x;
      mesh.position.z -= center.z;
      mesh.position.y -= (scaledBounds.min.y + 0.015);
      mesh.rotation.y = Math.PI;
      // These bounds are the authored sloped CRT face in arcade_model_data.js.
      // Store the transformed result on the mesh so the live canvas uses the
      // same four corners as the cabinet instead of a hand-tuned rectangle.
      const crtFace = {
        minX: -2.4907479286193848,
        maxX: 2.4907479286193848,
        minY: 7.702969551086426,
        maxY: 12.556206703186035,
        bottomZ: 1.2374701499938965,
        topZ: 0.11435317993164062
      };
      const faceCenterY = (crtFace.minY + crtFace.maxY) / 2;
      const faceCenterZ = (crtFace.bottomZ + crtFace.topZ) / 2;
      mesh.userData.arcadeCrtFace = {
        x: -(((crtFace.minX + crtFace.maxX) / 2) * scale),
        y: (faceCenterY - bounds.min.y) * scale - 0.015,
        z: -(faceCenterZ - ((bounds.min.z + bounds.max.z) / 2)) * scale,
        width: (crtFace.maxX - crtFace.minX) * scale,
        height: Math.hypot(crtFace.maxY - crtFace.minY, crtFace.bottomZ - crtFace.topZ) * scale,
        tilt: Math.atan2(crtFace.bottomZ - crtFace.topZ, crtFace.maxY - crtFace.minY)
      };
      return mesh;
    }

    buildCoreFurniture() {
      const THREE = this.THREE;
      const room = this.room;
      const deskZ = -room.depth / 2 + 0.62;
      const deskY = 0.8;
      const deskW = 2.4;
      const deskD = 0.86;
      const deskH = 0.08;
      const deskSpec = this.getDeskFinishSpec();
      const chairSpec = this.getChairFinishSpec();
      const raisingDesk = this.createRaisingDeskModel(deskW, deskD, deskY + deskH / 2);
      if (raisingDesk) {
        raisingDesk.position.set(0, 0, deskZ + 0.18);
        this.root.add(raisingDesk);
      } else {
        const deskTop = new THREE.Mesh(new THREE.BoxGeometry(deskW, deskH, deskD), new THREE.MeshStandardMaterial({ color: deskSpec.top, roughness: 0.9 }));
        deskTop.position.set(0, deskY, deskZ + 0.18);
        deskTop.castShadow = true;
        deskTop.receiveShadow = true;
        this.root.add(deskTop);
        [[-1.05, 0], [1.05, 0]].forEach(([x]) => {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, deskY, 0.76), new THREE.MeshStandardMaterial({ color: 0x171d23, roughness: 0.58, metalness: 0.38 }));
          leg.position.set(x, deskY / 2, deskZ + 0.18);
          leg.castShadow = true;
          this.root.add(leg);
        });
        const modesty = new THREE.Mesh(new THREE.BoxGeometry(2.06, 0.68, 0.06), new THREE.MeshStandardMaterial({ color: 0x171d23, roughness: 0.58, metalness: 0.38 }));
        modesty.position.set(0.06, 0.39, deskZ + 0.56);
        modesty.castShadow = true;
        this.root.add(modesty);
      }
      this.addObstacle(0, deskZ + 0.2, deskW, deskD, 0.3);
      this.computerInteractive = { position: { x: 0, z: deskZ + 1.22 }, radius: 1.85, yaw: 0 };

      const uploadedChair = this.createUploadedChairModel(0.92, 0.92, 1.28);
      if (uploadedChair) {
        uploadedChair.position.set(0.1, 0, deskZ + 1.18);
        this.root.add(uploadedChair);
      } else {
        const chair = new THREE.Group();
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.12, 0.68), new THREE.MeshStandardMaterial({ color: chairSpec.seat, roughness: 0.88 }));
        seat.position.set(0.1, 0.46, deskZ + 1.18);
        chair.add(seat);
        const back = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.72, 0.12), new THREE.MeshStandardMaterial({ color: chairSpec.back, roughness: 0.88 }));
        back.position.set(0.1, 0.82, deskZ + 1.48);
        chair.add(back);
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.42, 12), new THREE.MeshStandardMaterial({ color: 0x1f2e3a, metalness: 0.35, roughness: 0.55 }));
        stem.position.set(0.1, 0.2, deskZ + 1.18);
        chair.add(stem);
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.06, 0.08, 16), new THREE.MeshStandardMaterial({ color: chairSpec.base, roughness: 0.8 }));
        base.position.set(0.1, 0.04, deskZ + 1.18);
        chair.add(base);
        this.root.add(chair);
      }
      this.addObstacle(0.1, deskZ + 1.18, 0.92, 0.92, 0.08);

      const rackCount = this.state.tier >= 3 ? 2 : 1;
      const leftRackX = -room.width / 2 + 0.72;
      const rackGap = this.state.tier >= 3 ? 1.08 : 1.0;
      const rackZ = deskZ + 0.28;
      this.layout = this.layout || {};
      this.layout.rackXs = [];
      for (let i = 0; i < rackCount; i += 1) {
        const rackW = i === 0 ? (this.state.tier >= 2 ? 1.04 : 0.88) : 0.58;
        const rackH = i === 0 ? (this.state.tier >= 2 ? 2.45 : 2.08) : 1.58;
        const rackD = i === 0 ? 0.86 : 0.52;
        const rackX = leftRackX + i * rackGap;
        this.layout.rackXs.push(rackX);
        const uploadedRack = this.createServerRackModel(rackW, rackH, rackD);
        if (uploadedRack) {
          uploadedRack.position.set(rackX, 0, rackZ);
          this.root.add(uploadedRack);
        } else {
          const body = new THREE.Mesh(new THREE.BoxGeometry(rackW, rackH, rackD), new THREE.MeshStandardMaterial({ color: 0x202830, roughness: 0.84 }));
          body.position.set(rackX, rackH / 2, rackZ);
          body.castShadow = true;
          this.root.add(body);
          const bays = i === 0 ? (this.state.tier >= 3 ? 7 : 5) : 4;
          for (let row = 0; row < bays; row += 1) {
            const front = new THREE.Mesh(new THREE.BoxGeometry(rackW * 0.78, 0.14, 0.02), new THREE.MeshStandardMaterial({ color: 0x11161d, emissive: 0x021314, emissiveIntensity: 0.2 }));
            front.position.set(rackX, 0.36 + row * (rackH > 2.2 ? 0.28 : 0.24), rackZ + rackD / 2 + 0.02);
            this.root.add(front);
            const colors = [0x6ef4a1, 0x58d8ff, 0xff7f7f];
            for (let led = 0; led < 3; led += 1) {
              const bulb = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.03, 0.02), new THREE.MeshStandardMaterial({ color: colors[(row + led) % colors.length], emissive: colors[(row + led) % colors.length], emissiveIntensity: 0.75 }));
              bulb.position.set(rackX - 0.16 + led * 0.16, front.position.y, front.position.z + 0.02);
              bulb.userData.blink = 0.9 + Math.random() * 2.2;
              bulb.userData.blinkBase = 0.03;
              bulb.userData.blinkRange = 2.0;
              bulb.userData.blinkPower = 3.4;
              this.root.add(bulb);
            }
          }
        }
        this.addObstacle(rackX, rackZ, rackW, rackD, 0.2);
      }

      const primaryRackX = this.layout.rackXs[0] || leftRackX;
      this.serverRackAudioAnchor = {
        x: primaryRackX,
        y: this.state.tier >= 2 ? 1.42 : 1.18,
        z: rackZ + 0.48
      };
      this.updateServerAmbiencePosition();

      const storage = new THREE.Mesh(new THREE.BoxGeometry(0.82, 1.56, 0.78), new THREE.MeshStandardMaterial({ color: 0x465365, roughness: 0.88 }));
      const storageX = room.width / 2 - 1.72;
      const storageZ = deskZ + 0.22;
      storage.position.set(storageX, 0.78, storageZ);
      storage.castShadow = true;
      storage.receiveShadow = true;
      this.root.add(storage);
      this.addContactShadow(storageX, storageZ + 0.02, 1.02, 0.94, 0.18);
      this.addObstacle(storageX, storageZ, 0.82, 0.78, 0.16);
      const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.74, 1.36, 0.03), new THREE.MeshStandardMaterial({ color: 0x59697d, roughness: 0.82 }));
      doorFrame.castShadow = true;
      doorFrame.receiveShadow = true;
      doorFrame.position.set(storageX, 0.84, storageZ + 0.41);
      this.root.add(doorFrame);
      // Keep the pulls close to the door face. The earlier z offset placed them
      // far enough forward that they read as two disconnected floating bars.
      const doorSeam = new THREE.Mesh(new THREE.BoxGeometry(0.014, 1.22, 0.016), new THREE.MeshStandardMaterial({ color: 0x364250, roughness: 0.72 }));
      doorSeam.position.set(storageX, 0.82, storageZ + 0.428);
      this.root.add(doorSeam);
      const handleL = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.24, 0.052), new THREE.MeshStandardMaterial({ color: 0xdbe4ee, metalness: 0.7, roughness: 0.22 }));
      handleL.castShadow = true;
      handleL.position.set(storageX - 0.072, 0.77, storageZ + 0.454);
      const handleR = handleL.clone();
      handleR.position.x = storageX + 0.07;
      this.root.add(handleL);
      this.root.add(handleR);
      this.visualQATargets.storageCabinet = { x: storageX, y: 0.82, z: storageZ + 0.454 };

      this.buildMonitorCluster(deskZ);
      this.buildDeskDefaults(deskZ);
      this.buildArcadeCabinet();
      this.buildBotDock();
    }

    buildMonitorCluster(deskZ) {
      const THREE = this.THREE;
      const tiers = [
        { cols: 2, rows: 1, scale: 0.6 },
        { cols: 3, rows: 1, scale: 0.56 },
        { cols: 2, rows: 2, scale: 0.62 },
        { cols: 3, rows: 2, scale: 0.58 }
      ];
      const spec = this.state.tier >= 3 ? tiers[3] : this.state.tier >= 2 ? tiers[2] : this.state.tier >= 1 ? tiers[1] : tiers[0];
      const totalWidth = spec.cols * spec.scale + (spec.cols - 1) * 0.12;
      const startX = -totalWidth / 2 + spec.scale / 2 + 0.12;
      const baseY = 1.06;
      const baseZ = deskZ - 0.1;
      const clusterCenterX = startX + (spec.cols - 1) * (spec.scale + 0.12) / 2;
      const mount = new THREE.Group();
      const mountMat = new THREE.MeshStandardMaterial({ color: 0x26333d, metalness: 0.62, roughness: 0.42 });
      const deskSurfaceY = 0.852;
      // Keep the mounting rail immediately behind the monitor shells. The previous
      // deeper rail read as a detached bar from the office camera.
      const mountZ = baseZ - 0.14;
      const monitorBackZ = baseZ - 0.074;
      const monitorHeight = spec.scale * 0.68;
      const topMonitorY = baseY + (spec.rows - 1) * 0.54;
      const mastHeight = Math.max(0.44, topMonitorY + monitorHeight / 2 + 0.12 - deskSurfaceY);
      const basePlate = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.032, 0.18), mountMat);
      basePlate.position.set(clusterCenterX, deskSurfaceY + 0.016, mountZ);
      mount.add(basePlate);
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.038, mastHeight, 12), mountMat);
      mast.position.set(clusterCenterX, deskSurfaceY + mastHeight / 2, mountZ);
      mast.castShadow = true;
      mount.add(mast);
      const addMountBox = (width, height, depth, x, y, z) => {
        const part = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), mountMat);
        part.castShadow = true;
        mount.add(part);
        part.position.set(x, y, z);
        return part;
      };
      for (let row = 0; row < spec.rows; row += 1) {
        const y = baseY + row * 0.54;
        addMountBox(Math.max(0.22, totalWidth - 0.06), 0.035, 0.038, clusterCenterX, y, mountZ);
        for (let col = 0; col < spec.cols; col += 1) {
          const x = startX + col * (spec.scale + 0.12);
          addMountBox(0.052, 0.052, Math.abs(monitorBackZ - mountZ), x, y, (monitorBackZ + mountZ) / 2);
          addMountBox(Math.min(0.19, spec.scale * 0.34), Math.min(0.16, monitorHeight * 0.42), 0.022, x, y, monitorBackZ);
        }
      }
      this.root.add(mount);
      this.visualQATargets.deskMount = {
        x: clusterCenterX,
        y: baseY + (spec.rows - 1) * 0.27,
        z: monitorBackZ
      };
      let idx = 0;
      const palette = [0x6ef4a1, 0x58d8ff, 0xffcf7a, 0xc1a2ff, 0xff9bd4, 0x9ff2a2];
      for (let row = 0; row < spec.rows; row += 1) {
        for (let col = 0; col < spec.cols; col += 1) {
          const x = startX + col * (spec.scale + 0.12);
          const y = baseY + row * 0.54;
          const bodyWidth = spec.scale;
          const bodyHeight = spec.scale * 0.68;
          const monitorShell = this.createDeskMonitorModelShell(bodyWidth, bodyHeight, 0.105);
          const usingUploadedShell = !!monitorShell;
          if (usingUploadedShell) {
            monitorShell.position.set(x, y, baseZ - 0.01);
            monitorShell.userData.isUploadedMonitorShell = true;
            this.root.add(monitorShell);
          } else {
            const monitor = new THREE.Mesh(new THREE.BoxGeometry(bodyWidth, bodyHeight, 0.06), new THREE.MeshStandardMaterial({ color: 0x0f141c, roughness: 0.52 }));
            monitor.position.set(x, y, baseZ);
            monitor.castShadow = true;
            monitor.receiveShadow = true;
            this.root.add(monitor);
          }
          const canvas = makeCanvas(256, 160);
          const ctx = canvas.getContext('2d');
          const tex = new THREE.CanvasTexture(canvas);
          tex.colorSpace = THREE.SRGBColorSpace || tex.colorSpace;
          const color = palette[idx % palette.length];
          // Uploaded monitor shells have real depth now, so the animated canvas should sit
          // just proud of the model face instead of floating out in front of it. Keep the
          // same 16:10 animated aspect while expanding it to the inside bezel.
          const screenWidth = spec.scale * (usingUploadedShell ? 1.02 : 0.86);
          const screenHeight = screenWidth / 1.6;
          const screen = new THREE.Mesh(new THREE.PlaneGeometry(screenWidth, screenHeight), new THREE.MeshStandardMaterial({ map: tex, emissive: color, emissiveIntensity: 0.24, side: THREE.DoubleSide }));
          screen.position.set(x, y, baseZ + (usingUploadedShell ? 0.014 : 0.052));
          if (usingUploadedShell) screen.renderOrder = 8;
          this.root.add(screen);
          this.dynamicDisplays.push({ type: 'monitor', canvas, ctx, texture: tex, seed: Math.random() * 1000, screen, color, index: idx, nextFrameAt: 0, interval: 0.12, mode: idx % 6 });
          idx += 1;
        }
      }
    }

    buildDeskDefaults(deskZ) {
      const THREE = this.THREE;
      const keyboard = this.createKeyboardModel(0.84, 0.24, 0.055);
      if (keyboard) {
        // The embedded keyboard mesh is normalized with its lowest vertex at y=0.
        // Put that base slightly above the desktop so the key caps read as sitting on the surface.
        keyboard.position.set(0.08, 0.852, deskZ + 0.18);
        this.root.add(keyboard);
      } else {
        const fallbackKeyboard = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.03, 0.24), new THREE.MeshStandardMaterial({ color: 0x1b2127, roughness: 0.7 }));
        fallbackKeyboard.position.set(0.08, 0.83, deskZ + 0.18);
        this.root.add(fallbackKeyboard);
      }
      const mouse = this.createMouseModel(0.11, 0.16, 0.055);
      if (mouse) {
        // The embedded mouse mesh is normalized with its lowest vertex at y=0.
        // Put that base slightly above the desktop so the shell sits on top of the desk.
        mouse.position.set(0.76, 0.824, deskZ + 0.14);
        this.root.add(mouse);
      } else {
        const fallbackMouse = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.035, 0.16), new THREE.MeshStandardMaterial({ color: 0x20252a, roughness: 0.7 }));
        fallbackMouse.position.set(0.76, 0.84, deskZ + 0.14);
        this.root.add(fallbackMouse);
      }
    }

    buildArcadeCabinet() {
      const THREE = this.THREE;
      const room = this.room;
      const holder = new THREE.Group();
      this.root.add(holder);
      const obstacleIndex = this.obstacles.length;

      const width = 0.96;
      const depth = 1.04;
      const centerX = -room.width / 2 + 1.08;
      const centerZ = room.depth / 2 - 0.88;
      holder.position.set(centerX, 0, centerZ);

      let cabinet = this.buildArcadeModelMesh();
      const usingUploadedCabinet = !!cabinet;
      if (!cabinet) {
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.74, 1.85, 0.72), new THREE.MeshStandardMaterial({ color: 0x1a222d, roughness: 0.9 }));
        body.position.set(0, 0.92, 0.03);
        body.castShadow = true;
        body.receiveShadow = true;
        holder.add(body);
        const marquee = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.18), new THREE.MeshStandardMaterial({ map: this.makeArcadeTexture('front'), transparent: true, alphaTest: 0.02, side: THREE.DoubleSide }));
        marquee.position.set(0, 1.83, -0.37);
        holder.add(marquee);
        cabinet = null;
      } else {
        holder.add(cabinet);
      }

      const screenPose = this.buildArcadeScreenDisplay(holder, cabinet);
      this.visualQATargets.arcade = {
        x: centerX + screenPose.x,
        y: screenPose.y,
        z: centerZ + screenPose.z
      };
      this.arcadeAnchor = { x: centerX + screenPose.x, z: centerZ + screenPose.z - 0.68, yaw: Math.PI };
      this.screenInteractive = {
        position: { x: centerX + screenPose.x, y: screenPose.y, z: centerZ + screenPose.z },
        width: screenPose.width,
        height: screenPose.height,
        radius: 1.55,
        yaw: Math.PI
      };
      this.obstacles.length = obstacleIndex;
      this.addObstacle(centerX, centerZ + 0.02, 1.08, 1.18, 0.18);
      this.addContactShadow(centerX, centerZ + 0.02, 0.92, 0.70, 0.20);
    }

    buildArcadeScreenDisplay(holder, cabinet) {
      const THREE = this.THREE;
      const usingUploadedCabinet = !!cabinet;
      const crtFace = cabinet?.userData?.arcadeCrtFace;
      // The uploaded shell exposes its CRT as a tilted quadrilateral. The face
      // data is measured while normalizing the mesh, so this canvas matches its
      // white display area exactly without escaping through either cabinet side.
      const pose = crtFace
        ? Object.assign({}, crtFace)
        : { x: 0, y: 1.34, z: -0.348, width: 0.56, height: 0.42 };
      const displayAssembly = new THREE.Group();
      displayAssembly.position.set(pose.x, pose.y, pose.z);
      if (crtFace) displayAssembly.rotation.x = pose.tilt;
      holder.add(displayAssembly);
      const canvas = makeCanvas(512, 384);
      const ctx = canvas.getContext('2d');
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace || texture.colorSpace;
      const screenMat = new THREE.MeshStandardMaterial({
        map: texture,
        emissive: 0x0a2030,
        emissiveIntensity: 0.62,
        roughness: 0.36,
        metalness: 0.1,
        side: THREE.FrontSide
      });
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(pose.width, pose.height), screenMat);
      // The physical screen faces the room's negative-Z arcade approach. Without
      // this rotation, the front camera sees the texture through its mirrored back.
      screen.rotation.y = Math.PI;
      // Lift it a hair toward the player to prevent z-fighting with the authored
      // white CRT plane while leaving its visible edges coincident with that face.
      if (crtFace) screen.position.z = -0.002;
      screen.renderOrder = 10;
      displayAssembly.add(screen);

      // The uploaded cabinet already contains a molded CRT bezel. Add our own
      // only for the fallback cabinet so the live canvas reaches the four inner
      // corners of the authored screen rather than creating a second frame.
      if (!usingUploadedCabinet) {
        const bezelMat = new THREE.MeshStandardMaterial({ color: 0x101b2a, metalness: 0.58, roughness: 0.33 });
        const bezelZ = -0.014;
        const bezelParts = [
          [pose.width + 0.065, 0.032, 0, pose.height / 2 + 0.016],
          [pose.width + 0.065, 0.032, 0, -pose.height / 2 - 0.016],
          [0.032, pose.height + 0.065, -pose.width / 2 - 0.016, 0],
          [0.032, pose.height + 0.065, pose.width / 2 + 0.016, 0]
        ];
        bezelParts.forEach(([width, height, offsetX, offsetY]) => {
          const part = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.026), bezelMat);
          part.position.set(offsetX, offsetY, bezelZ);
          displayAssembly.add(part);
        });
      }

      this.arcadeDisplay = { type: 'arcade', canvas, ctx, texture, screen, assembly: displayAssembly, nextFrameAt: 0, interval: 0.066 };
      this.dynamicDisplays.push(this.arcadeDisplay);
      return pose;
    }

    setArcadeScreenState(nextState = {}) {
      this.arcadeScreenState = Object.assign({ mode: 'attract', title: 'UPTIME ARCADE' }, nextState || {});
      if (this.arcadeDisplay) this.arcadeDisplay.nextFrameAt = 0;
    }

    setArcadeScreenRenderer(renderer = null) {
      this.arcadeScreenRenderer = typeof renderer === 'function' ? renderer : null;
      if (this.arcadeDisplay) this.arcadeDisplay.nextFrameAt = 0;
    }

    getArcadeScreenPointer(event) {
      if (!this.arcadeDisplay?.screen || !this.camera || !this.canvas || !this.THREE) return null;
      const rect = this.canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      if (!this._arcadeRaycaster) this._arcadeRaycaster = new this.THREE.Raycaster();
      const ndc = new this.THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );
      this._arcadeRaycaster.setFromCamera(ndc, this.camera);
      const hit = this._arcadeRaycaster.intersectObject(this.arcadeDisplay.screen, false)[0];
      if (!hit?.uv) return null;
      return { x: 1 - hit.uv.x, y: 1 - hit.uv.y };
    }

    setVisualQACamera(viewName = 'arcade-front') {
      const views = {
        'arcade-front': { target: 'arcade', offset: { x: 0, y: 0.08, z: -1.52 } },
        'arcade-quarter': { target: 'arcade', offset: { x: 1.34, y: 0.16, z: -1.08 } },
        'desk-mount': { target: 'deskMount', offset: { x: 1.52, y: 0.2, z: 1.34 } },
        'storage-cabinet': { target: 'storageCabinet', offset: { x: 1.1, y: 0.16, z: 1.3 } }
      };
      const view = views[viewName] || views['arcade-front'];
      const target = this.visualQATargets?.[view.target];
      if (!target) return null;

      const x = target.x + view.offset.x;
      const y = target.y + view.offset.y;
      const z = target.z + view.offset.z;
      const horizontalDistance = Math.max(0.001, Math.hypot(target.x - x, target.z - z));
      this.pointerLocked = false;
      this.arcadeHold = false;
      this.computerHold = false;
      this.arcadeTransition = null;
      this.computerTransition = null;
      this.player.x = x;
      this.player.y = y;
      this.player.z = z;
      this.player.yaw = Math.atan2(x - target.x, z - target.z);
      this.player.pitch = clamp(Math.atan2(target.y - y, horizontalDistance), -0.65, 0.5);
      this.player.bob = 0;
      if (this.camera) {
        this.camera.position.set(x, y, z);
        this.camera.rotation.set(this.player.pitch, this.player.yaw, 0, 'YXZ');
      }
      this.updateOverlay('visual QA');
      return { view: viewName, target: view.target, x, y, z, yaw: this.player.yaw, pitch: this.player.pitch };
    }

    buildBotDock() {
      if (!this.state.decorations.includes('floor-bot')) return;
      const placement = this.getFloorBotDockPlacement();
      const dockWorld = this.decorPlacementToWorld('floor', placement);
      const x = dockWorld.x;
      const z = dockWorld.z;
      const rotationY = Number.isFinite(Number(dockWorld.rotationY)) ? Number(dockWorld.rotationY) : 0;
      const dock = this.createPlacedPropDecoration('floor-bot', 'floor', placement, { selectable: false });
      this.registerSelectableDecor(dock, { id: 'floor-bot', zone: 'floor', placement: Object.assign({}, placement) });

      const patrolPoints = this.getFloorBotPatrolPoints().filter(point => !this.collides(point.x, point.z));
      const startPoint = { x, z: z + Math.cos(rotationY) * 0.12 };
      this.floorBot.active = true;
      this.floorBot.homeX = startPoint.x;
      this.floorBot.homeZ = startPoint.z;
      this.floorBot.x = startPoint.x;
      this.floorBot.z = startPoint.z;
      this.floorBot.targetX = patrolPoints[0] ? patrolPoints[0].x : startPoint.x;
      this.floorBot.targetZ = patrolPoints[0] ? patrolPoints[0].z : startPoint.z;
      this.floorBot.patrolPoints = patrolPoints;
      this.floorBot.state = 'charging';
      this.floorBot.timer = 0;
      this.floorBot.routeIndex = 0;
      this.floorBot.loopCount = 0;
      this.floorBot.chatterAt = 0;
      this.floorBot.speechUntil = 0;
      this.floorBot.speechText = '';
      this.floorBot.dwellUntil = performance.now() + 600;
      this.floorBot.lastLineAt = this.floorBot.lastLineAt || 0;
      this.floorBot.speed = 0.78;
      this.floorBot.patrolStartedAt = 0;
      this.floorBot.chargeUntil = performance.now() + 60000;
      this.floorBot.hasAnnouncedResume = false;
    }

    getWallPlacedDecorSpec(id) {
      const specs = {
        'neon-sign': { w: 1.52, h: 0.38, lines: ['UPTIME'], bg: '#130918', border: '#ff79d8', colors: ['#ff79d8'], emissive: 0xff5dce, glow: 'rgba(255,121,216,0.85)' },
        'plant-wall': { w: 1.10, h: 1.14, plant: true, bg: '#24523d', border: '#5fcf82', colors: ['#caffd4'] },
        'wall-monitor': { w: 1.42, h: 0.86, monitor: true, bg: '#071019', border: '#68dfff', colors: ['#9fe8ff', '#79ffc6'] },
        'framed-cert': { w: 0.92, h: 1.08, lines: ['UPTIME', 'CERTIFIED'], bg: '#f7f3e7', border: '#d9b17a', colors: ['#3a2f21', '#6b5538'] },
        'server-poster': { w: 1.02, h: 1.24, lines: ['RETRO', 'SERVER'], bg: '#10151d', border: '#85d8ff', colors: ['#85d8ff', '#ff9edc'] },
        'moon-window': { w: 1.00, h: 1.00, moon: true, bg: '#0d1320', border: '#9ec4ff', colors: ['#f4efdf'] },
        'uplink-map': { w: 1.22, h: 0.70, lines: ['UPLINK MAP', 'metro east north'], bg: '#081016', border: '#7ceaff', colors: ['#7ceaff', '#99ffd9'] },
        'award-shelf': { w: 1.04, h: 0.46, shelf: true, bg: '#20180f', border: '#d7bd6a', colors: ['#ffe6a0'] },
        'maintenance-clock': { w: 0.62, h: 0.62, clock: true, bg: '#f7f7f1', border: '#26313a', colors: ['#26313a'] },
        'fiber-art': { w: 0.96, h: 1.08, lines: ['FIBER', 'ART'], bg: '#151420', border: '#ff89df', colors: ['#ff89df', '#7ceaff'] },
        'incident-board': { w: 1.02, h: 0.92, lines: ['INCIDENT', 'BOARD'], bg: '#2a1014', border: '#ff7f7f', colors: ['#ffb6b6', '#ffd5d5'] },
        'snack-shelf': { w: 1.04, h: 0.46, shelf: true, bg: '#20180f', border: '#d7bd6a', colors: ['#ffe6a0'] }
      };
      return specs[id] || { w: 0.9, h: 0.6, lines: [String(id || 'DECOR').toUpperCase()], bg: '#101820', border: '#7ceaff', colors: ['#7ceaff'] };
    }

    createPlacedWallDecoration(id, placement, opts = {}) {
      const THREE = this.THREE;
      const spec = this.getWallPlacedDecorSpec(id);
      const pos = this.wallPlacementToWorld(placement);
      const group = new THREE.Group();
      const ghostOffset = opts.ghost ? 0.018 : 0;
      group.position.set(
        pos.x + (pos.face === 'left' ? ghostOffset : pos.face === 'right' ? -ghostOffset : 0),
        pos.y,
        pos.z + (pos.face === 'back' ? ghostOffset : pos.face === 'front' ? -ghostOffset : 0)
      );
      group.rotation.y = pos.rotationY || 0;
      group.userData.wallDecorId = id;
      group.userData.wallFace = pos.face || 'back';
      const makeMat = settings => new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.72, metalness: 0.02, side: THREE.DoubleSide }, settings));
      const frame = new THREE.Mesh(new THREE.BoxGeometry(spec.w + 0.08, spec.h + 0.08, 0.035), makeMat({ color: 0x17202a, emissive: 0x071018, emissiveIntensity: 0.08 }));
      frame.position.z = -0.012;
      group.add(frame);
      if (id === 'neon-sign') {
        const backing = new THREE.Mesh(new THREE.BoxGeometry(spec.w, spec.h, 0.030), makeMat({ color: 0x130918, emissive: 0x130918, emissiveIntensity: 0.16 }));
        backing.position.z = 0.010;
        group.add(backing);
        const tex = this.makeLabelTexture(['UPTIME'], { width: 1024, height: 256, background: '#130918', border: '#ff79d8', colors: ['#ff9cdd'], size: 112, glow: 'rgba(255,121,216,0.95)' });
        const sign = new THREE.Mesh(new THREE.PlaneGeometry(spec.w - 0.10, spec.h - 0.08), makeMat({ map: tex, emissive: 0xff5dce, emissiveIntensity: 0.64, roughness: 0.28 }));
        sign.position.z = 0.040;
        group.add(sign);
        [-0.60, 0, 0.60].forEach(x => {
          const mount = new THREE.Mesh(new THREE.CylinderGeometry(0.020, 0.020, 0.045, 10), makeMat({ color: 0x8d4c7e, metalness: 0.52 }));
          mount.rotation.x = Math.PI / 2;
          mount.position.set(x, -spec.h * 0.38, 0.045);
          group.add(mount);
        });
      } else if (spec.plant) {
        const backing = new THREE.Mesh(new THREE.BoxGeometry(spec.w, spec.h, 0.035), makeMat({ color: 0x24523d }));
        backing.position.z = 0.012;
        group.add(backing);
        for (let i = 0; i < 16; i += 1) {
          const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.045 + (i % 4) * 0.004, 8, 8), makeMat({ color: [0x3b7a52, 0x4d9a65, 0x2f6c4a, 0x68b883][i % 4] }));
          const col = (i % 4) / 3 - 0.5;
          const row = Math.floor(i / 4) / 3 - 0.5;
          leaf.position.set(col * spec.w * 0.72 + ((i % 2) * 0.03), row * spec.h * 0.72, 0.055);
          group.add(leaf);
        }
      } else if (spec.monitor) {
        const body = new THREE.Mesh(new THREE.BoxGeometry(spec.w, spec.h, 0.04), makeMat({ color: 0x111a25, emissive: 0x071824, emissiveIntensity: 0.18 }));
        body.position.z = 0.012;
        group.add(body);
        const isLiveDisplay = !opts.ghost;
        const canvas = isLiveDisplay ? makeCanvas(1024, 512) : null;
        const ctx = canvas ? canvas.getContext('2d') : null;
        const tex = canvas
          ? new THREE.CanvasTexture(canvas)
          : this.makeLabelTexture(['NOC OVERVIEW', 'LIVE NODE MAP'], { width: 768, height: 384, background: '#061018', border: '#68dfff', colors: ['#9fe8ff', '#79ffc6'], size: 46 });
        if (canvas) tex.colorSpace = THREE.SRGBColorSpace || tex.colorSpace;
        const screen = new THREE.Mesh(new THREE.PlaneGeometry(spec.w - 0.16, spec.h - 0.18), makeMat({ map: tex, emissive: spec.emissive || 0x61d8ff, emissiveIntensity: 0.45 }));
        screen.position.z = 0.045;
        group.add(screen);
        if (canvas) {
          this.dynamicDisplays.push({ type: 'noc', title: 'NOC OVERVIEW', canvas, ctx, texture: tex, seed: Math.random() * 1000, screen, nextFrameAt: 0, interval: 0.10 });
        }
      } else if (id === 'framed-cert') {
        const wood = new THREE.Mesh(new THREE.BoxGeometry(spec.w, spec.h, 0.040), makeMat({ color: 0x4a351f, roughness: 0.52, metalness: 0.10 }));
        wood.position.z = 0.010;
        group.add(wood);
        const goldInset = new THREE.Mesh(new THREE.BoxGeometry(spec.w - 0.075, spec.h - 0.075, 0.020), makeMat({ color: 0xcaa65b, metalness: 0.44, roughness: 0.36 }));
        goldInset.position.z = 0.038;
        group.add(goldInset);
        const paper = new THREE.Mesh(new THREE.PlaneGeometry(spec.w - 0.14, spec.h - 0.14), makeMat({ color: 0xf7f2df, roughness: 0.76 }));
        paper.position.z = 0.053;
        group.add(paper);
        const certificateTitle = this.makeLabelTexture(['CERTIFICATE OF COMPLETION'], { width: 1024, height: 128, colors: ['#31445b'], size: 46, weight: 900 });
        const certificateName = this.makeLabelTexture(['UPTIME OPERATIONS'], { width: 768, height: 104, colors: ['#6a5530'], size: 40, weight: 800 });
        const titlePlane = new THREE.Mesh(new THREE.PlaneGeometry(spec.w - 0.20, 0.13), makeMat({ map: certificateTitle, transparent: true }));
        titlePlane.position.set(0, spec.h * 0.31, 0.060);
        group.add(titlePlane);
        const namePlane = new THREE.Mesh(new THREE.PlaneGeometry(spec.w - 0.26, 0.10), makeMat({ map: certificateName, transparent: true }));
        namePlane.position.set(0, spec.h * 0.02, 0.060);
        group.add(namePlane);
        [-0.18, 0, 0.18].forEach(x => {
          const rule = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.010, 0.008), makeMat({ color: 0xb9944d }));
          rule.position.set(x, -spec.h * 0.13, 0.061);
          group.add(rule);
        });
        const seal = new THREE.Mesh(new THREE.CircleGeometry(0.085, 20), makeMat({ color: 0xd8af58, emissive: 0x5e3f0c, emissiveIntensity: 0.12, metalness: 0.58, roughness: 0.32 }));
        seal.position.set(0, -spec.h * 0.28, 0.070);
        group.add(seal);
        [-0.038, 0.038].forEach(x => {
          const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.13, 0.010), makeMat({ color: 0x526f9f, roughness: 0.58 }));
          ribbon.position.set(x, -spec.h * 0.39, 0.066);
          ribbon.rotation.z = x < 0 ? -0.12 : 0.12;
          group.add(ribbon);
        });
      } else if (id === 'server-poster') {
        const paper = new THREE.Mesh(new THREE.BoxGeometry(spec.w, spec.h, 0.026), makeMat({ color: 0xadc9dc, roughness: 0.82 }));
        paper.position.z = 0.014;
        group.add(paper);
        const posterTitleTex = this.makeLabelTexture(['UPTIME PERSONAL COMPUTER'], { width: 1024, height: 120, colors: ['#17374c'], size: 45, weight: 900 });
        const posterCaptionTex = this.makeLabelTexture(['SYSTEM 81  //  8088  //  64K'], { width: 1024, height: 96, colors: ['#365769'], size: 32, weight: 800 });
        const posterTitle = new THREE.Mesh(new THREE.PlaneGeometry(spec.w - 0.12, 0.13), makeMat({ map: posterTitleTex, transparent: true }));
        posterTitle.position.set(0, spec.h * 0.40, 0.043);
        group.add(posterTitle);
        const posterCaption = new THREE.Mesh(new THREE.PlaneGeometry(spec.w - 0.12, 0.10), makeMat({ map: posterCaptionTex, transparent: true }));
        posterCaption.position.set(0, -spec.h * 0.42, 0.043);
        group.add(posterCaption);
        const pcColor = 0xd9d0b4;
        const dark = 0x293945;
        const monitor = new THREE.Mesh(new THREE.BoxGeometry(spec.w * 0.42, spec.h * 0.25, 0.028), makeMat({ color: pcColor, roughness: 0.62 }));
        monitor.position.set(-spec.w * 0.11, -spec.h * 0.02, 0.052);
        group.add(monitor);
        const crt = new THREE.Mesh(new THREE.BoxGeometry(spec.w * 0.32, spec.h * 0.15, 0.010), makeMat({ color: 0x1e4a43, emissive: 0x1f695e, emissiveIntensity: 0.22 }));
        crt.position.set(-spec.w * 0.11, -spec.h * 0.02, 0.070);
        group.add(crt);
        const neck = new THREE.Mesh(new THREE.BoxGeometry(spec.w * 0.07, spec.h * 0.07, 0.020), makeMat({ color: pcColor }));
        neck.position.set(-spec.w * 0.11, -spec.h * 0.18, 0.052);
        group.add(neck);
        const base = new THREE.Mesh(new THREE.BoxGeometry(spec.w * 0.24, spec.h * 0.035, 0.020), makeMat({ color: pcColor }));
        base.position.set(-spec.w * 0.11, -spec.h * 0.23, 0.052);
        group.add(base);
        const tower = new THREE.Mesh(new THREE.BoxGeometry(spec.w * 0.19, spec.h * 0.30, 0.026), makeMat({ color: pcColor, roughness: 0.62 }));
        tower.position.set(spec.w * 0.25, -spec.h * 0.07, 0.052);
        group.add(tower);
        [0.025, -0.045].forEach(y => {
          const drive = new THREE.Mesh(new THREE.BoxGeometry(spec.w * 0.11, spec.h * 0.04, 0.008), makeMat({ color: dark, emissive: 0x0a141a, emissiveIntensity: 0.08 }));
          drive.position.set(spec.w * 0.25, y, 0.070);
          group.add(drive);
        });
        const keyboard = new THREE.Mesh(new THREE.BoxGeometry(spec.w * 0.50, spec.h * 0.065, 0.018), makeMat({ color: pcColor, roughness: 0.66 }));
        keyboard.position.set(0, -spec.h * 0.34, 0.055);
        keyboard.rotation.z = -0.04;
        group.add(keyboard);
        for (let i = 0; i < 7; i += 1) {
          const key = new THREE.Mesh(new THREE.BoxGeometry(spec.w * 0.045, spec.h * 0.014, 0.006), makeMat({ color: dark }));
          key.position.set(-spec.w * 0.20 + i * spec.w * 0.065, -spec.h * 0.34, 0.067);
          group.add(key);
        }
      } else if (spec.moon) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(spec.w * 0.33, 0.035, 16, 48), makeMat({ color: 0x9ec4ff, emissive: 0x335588, emissiveIntensity: 0.24 }));
        ring.position.z = 0.04;
        group.add(ring);
        const disk = new THREE.Mesh(new THREE.CircleGeometry(spec.w * 0.30, 48), makeMat({ color: 0x0d1320, emissive: 0x162033, emissiveIntensity: 0.18 }));
        disk.position.z = 0.02;
        group.add(disk);
        const moon = new THREE.Mesh(new THREE.CircleGeometry(spec.w * 0.12, 28), makeMat({ color: 0xf4efdf, emissive: 0xe5dcc1, emissiveIntensity: 0.20 }));
        moon.position.set(spec.w * 0.07, spec.h * 0.02, 0.055);
        group.add(moon);
      } else if (spec.clock) {
        const clock = new THREE.Mesh(new THREE.CylinderGeometry(spec.w * 0.32, spec.w * 0.32, 0.045, 32), makeMat({ color: 0xf7f7f1 }));
        clock.rotation.x = Math.PI / 2;
        clock.position.z = 0.04;
        group.add(clock);
        const hand = new THREE.Mesh(new THREE.BoxGeometry(0.025, spec.h * 0.22, 0.012), makeMat({ color: 0x26313a }));
        hand.position.set(0, spec.h * 0.06, 0.082);
        group.add(hand);
      } else if (spec.shelf) {
        const shelfLevels = id === 'snack-shelf' ? [-0.14, 0.10] : [-0.10];
        shelfLevels.forEach((y, level) => {
          const shelf = new THREE.Mesh(new THREE.BoxGeometry(spec.w, 0.045, 0.22), makeMat({ color: id === 'snack-shelf' ? 0x273747 : 0x3a2c1d }));
          shelf.position.set(0, y, 0.07);
          group.add(shelf);
          for (let i = 0; i < 4; i += 1) {
            const color = id === 'snack-shelf' ? [0xf15f6d, 0xf7cd61, 0x7edc8b, 0x58d8ff][(i + level) % 4] : 0xd7bd6a;
            const item = id === 'snack-shelf'
              ? new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.085, 0.07), makeMat({ color }))
              : new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.055, 0.12, 12), makeMat({ color, metalness: 0.55, roughness: 0.35 }));
            item.position.set(-spec.w * 0.30 + i * spec.w * 0.20, y + (id === 'snack-shelf' ? 0.06 : 0.085), 0.095);
            group.add(item);
          }
        });
      } else {
        const lines = spec.lines || [opts.label || id];
        const tex = this.makeLabelTexture(lines, { width: 768, height: 512, background: spec.bg, border: spec.border, colors: spec.colors, size: lines.length > 1 ? 64 : 72, glow: spec.glow || '' });
        const panel = new THREE.Mesh(new THREE.PlaneGeometry(spec.w, spec.h), makeMat({ map: tex, emissive: spec.emissive || 0x000000, emissiveIntensity: spec.emissive ? 0.25 : 0.02 }));
        panel.position.z = 0.035;
        group.add(panel);
        if (id === 'server-poster') {
          for (let row = 0; row < 4; row += 1) {
            const bay = new THREE.Mesh(new THREE.BoxGeometry(spec.w * 0.54, 0.075, 0.016), makeMat({ color: 0x1b2b37, emissive: row % 2 ? 0x0a2b3c : 0x210d2a, emissiveIntensity: 0.20 }));
            bay.position.set(0, -0.21 + row * 0.12, 0.050);
            group.add(bay);
          }
        }
        if (id === 'uplink-map') {
          [[-0.34, 0.12], [-0.10, -0.10], [0.18, 0.10], [0.37, -0.15]].forEach(([x, y], index) => {
            const node = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8), makeMat({ color: index % 2 ? 0x7bfbd1 : 0x77e7ff, emissive: index % 2 ? 0x7bfbd1 : 0x77e7ff, emissiveIntensity: 0.48 }));
            node.position.set(x, y, 0.052);
            group.add(node);
          });
        }
        if (id === 'incident-board') {
          [[-0.26, 0.17, 0xffce79], [0.10, 0.18, 0xff8b9a], [-0.12, -0.18, 0x8ce7ff], [0.28, -0.13, 0xb4ed8a]].forEach(([x, y, color]) => {
            const note = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.010), makeMat({ color }));
            note.position.set(x, y, 0.052);
            group.add(note);
          });
        }
        if (id === 'fiber-art') {
          [-0.30, -0.15, 0, 0.15, 0.30].forEach((x, index) => {
            const fiber = new THREE.Mesh(new THREE.TorusGeometry(0.15 + (index % 2) * 0.035, 0.012, 8, 22, Math.PI * 1.32), makeMat({ color: index % 2 ? 0xff8bdb : 0x78e9ff, emissive: index % 2 ? 0xff8bdb : 0x78e9ff, emissiveIntensity: 0.44 }));
            fiber.position.set(x, 0, 0.055);
            fiber.rotation.z = index * 0.6;
            group.add(fiber);
          });
        }
      }
      if (opts.ghost) {
        this.applyDecorGhost(group);
      } else {
        this.registerSelectableDecor(group, { id, zone: 'wall', placement: Object.assign({}, placement) });
      }
      this.root.add(group);
      return group;
    }


    getPlacedPropSpec(id) {
      const specs = {
        'desk-mat': { w: 1.18, d: 0.52, h: 0.035, color: 0x24233a },
        'tower-stack': { w: 0.48, d: 0.36, h: 0.50, color: 0x202934 },
        'aquarium': { w: 0.48, d: 0.26, h: 0.28, color: 0x7ceaff },
        'chair-upgrade': { w: 0.78, d: 0.78, h: 0.12, color: 0x7ceaff },
        'keyboard-glow': { w: 0.74, d: 0.25, h: 0.05, color: 0x19222d },
        'mini-rack': { w: 0.38, d: 0.30, h: 0.60, color: 0x1e2630 },
        'coffee-drone': { w: 0.30, d: 0.30, h: 0.24, color: 0xe7f1ff },
        'desk-bonsai': { w: 0.30, d: 0.30, h: 0.34, color: 0x4ea466 },
        'projector-pad': { w: 0.34, d: 0.34, h: 0.48, color: 0x1d2631 },
        'lava-lamp': { w: 0.24, d: 0.24, h: 0.50, color: 0xff7bd8 },
        'holo-globe': { w: 0.60, d: 0.60, h: 1.08, color: 0x7ceaff },
        'led-strip': { w: 1.62, d: 0.12, h: 0.035, color: 0x6d2bff },
        'floor-runner': { w: 0.94, d: 2.36, h: 0.026, color: 0x2a3441 },
        'hex-rug': { w: 1.42, d: 1.42, h: 0.026, color: 0x30485f },
        'light-grid': { w: 1.22, d: 1.02, h: 0.026, color: 0x58d8ff },
        'floor-bot': { w: 0.76, d: 0.46, h: 0.16, color: 0x161e27 },
        'parts-bins': { w: 0.54, d: 0.40, h: 0.46, color: 0xffcf7a },
        'retro-console': { w: 0.54, d: 0.38, h: 0.84, color: 0xcfcad3 },
        'bookcase': { w: 0.86, d: 0.32, h: 1.28, color: 0x2f2c26 },
        'model-sat': { w: 0.56, d: 0.38, h: 0.56, color: 0x7ceaff },
        'cold-spares': { w: 0.62, d: 0.40, h: 1.08, color: 0x25313d },
        'pendant-light': { kind: 'pendant-light', w: 1.25, d: 1.55, h: 2.25, color: 0xffc36f, emissive: 0xffb45c, intensity: 0.65 }
      };
      return specs[id] || { w: 0.42, d: 0.32, h: 0.28, color: 0x58d8ff };
    }

    applyDecorGhost(group) {
      group.traverse(child => {
        if (child.isLight) child.visible = false;
        if (!child.material) return;
        child.material = child.material.clone();
        child.material.transparent = true;
        child.material.opacity = Math.min(0.58, child.material.opacity || 0.58);
        child.material.depthWrite = false;
      });
    }

    buildCanonicalPropModel(group, id, spec, opts = {}) {
      const THREE = this.THREE;
      const makeMat = settings => new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.76, metalness: 0.04 }, settings));
      const addBox = (w, h, d, color, x = 0, y = h / 2, z = 0, material = {}) => {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), makeMat(Object.assign({ color }, material)));
        mesh.position.set(x, y, z); group.add(mesh); return mesh;
      };
      const addCylinder = (rt, rb, h, color, x = 0, y = h / 2, z = 0, material = {}) => {
        const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 16), makeMat(Object.assign({ color }, material)));
        mesh.position.set(x, y, z); group.add(mesh); return mesh;
      };
      const addGlow = (w, h, d, x = 0, y = h / 2, z = 0, color = 0x63dfff) => addBox(w, h, d, color, x, y, z, { emissive: color, emissiveIntensity: 0.62, roughness: 0.35 });
      const addRing = (radius, tube, y, color, rotation = [Math.PI / 2, 0, 0]) => {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 10, 28), makeMat({ color, emissive: color, emissiveIntensity: 0.45, roughness: 0.32 }));
        ring.rotation.set(rotation[0], rotation[1], rotation[2]); ring.position.y = y; group.add(ring); return ring;
      };

      if (id === 'lava-lamp') {
        this.buildAnimatedLavaLamp(group, {
          baseColor: 0xb56d38,
          metalColor: 0x283341,
          glassColor: 0xff7bd8,
          glowColor: 0xff4bc5,
          glowIntensity: 0.38,
          glassOpacity: 0.32,
          ghost: !!opts.ghost,
          registerAnimation: !opts.ghost,
          scale: 1
        });
      } else if (id === 'pendant-light') {
        this.buildPendantLightProp(group, { ghost: !!opts.ghost });
      } else if (id === 'desk-mat') {
        addBox(spec.w, 0.025, spec.d, spec.color, 0, 0.012);
        addGlow(spec.w - 0.08, 0.012, 0.018, 0, 0.026, -spec.d * 0.40, 0x8858ff);
        addGlow(spec.w - 0.08, 0.012, 0.018, 0, 0.026, spec.d * 0.40, 0x3fe9d3);
      } else if (id === 'tower-stack') {
        [-0.13, 0.13].forEach((x, index) => {
          addBox(0.22, 0.44 + index * 0.06, 0.30, 0x1e2733, x, 0.22 + index * 0.03);
          addBox(0.17, 0.28, 0.012, 0x111820, x, 0.25 + index * 0.03, -0.157);
          [0, 1, 2].forEach(row => addGlow(0.13, 0.022, 0.008, x, 0.15 + row * 0.08 + index * 0.03, -0.166, row === 1 ? 0xff6ed5 : 0x61dfff));
          addCylinder(0.038, 0.038, 0.012, 0x334252, x, 0.37 + index * 0.04, -0.17).rotation.x = Math.PI / 2;
        });
      } else if (id === 'aquarium') {
        addBox(spec.w, 0.035, spec.d, 0x172432, 0, 0.018);
        addBox(spec.w, 0.035, spec.d, 0x172432, 0, spec.h - 0.018);
        [-1, 1].forEach(side => addBox(0.028, spec.h, spec.d, 0x172432, side * (spec.w / 2 - 0.014), spec.h / 2));
        [-1, 1].forEach(side => addBox(spec.w, spec.h, 0.016, 0x7ceaff, 0, spec.h / 2, side * (spec.d / 2 - 0.008), { transparent: true, opacity: 0.28, emissive: 0x246b88, emissiveIntensity: 0.32 }));
        addBox(spec.w - 0.07, 0.035, spec.d - 0.06, 0x2d6e75, 0, 0.058);
        [-0.12, 0.05, 0.16].forEach((x, index) => addCylinder(0.012, 0.022, 0.12 + index * 0.02, 0x49b477, x, 0.12 + index * 0.01, 0.02));
        [-0.10, 0.12].forEach((x, index) => { const fish = addBox(0.065, 0.026, 0.018, index ? 0xffb763 : 0x9bdcff, x, 0.16 + index * 0.04, -0.07); addBox(0.022, 0.034, 0.012, fish.material.color, x - (index ? 0.042 : -0.042), 0.16 + index * 0.04, -0.07); });
      } else if (id === 'chair-upgrade') {
        addCylinder(0.34, 0.38, 0.035, 0x15212d, 0, 0.018);
        addRing(0.31, 0.024, 0.040, 0x68dfff);
        addRing(0.23, 0.012, 0.053, 0xff78d7);
        [-0.22, 0.22].forEach(x => addGlow(0.12, 0.026, 0.05, x, 0.05, 0, 0x68dfff));
      } else if (id === 'keyboard-glow') {
        addBox(spec.w, 0.026, spec.d, spec.color, 0, 0.013);
        for (let row = 0; row < 3; row += 1) for (let col = 0; col < 11; col += 1) {
          const hue = [0xff73d2, 0x70eaff, 0x90f06d][(col + row) % 3];
          addBox(0.048, 0.017, 0.045, hue, -0.29 + col * 0.058, 0.033, -0.065 + row * 0.062, { emissive: hue, emissiveIntensity: 0.34, roughness: 0.42 });
        }
      } else if (id === 'mini-rack') {
        [-1, 1].forEach(side => [-1, 1].forEach(depth => addBox(0.025, spec.h, 0.025, 0x263545, side * 0.17, spec.h / 2, depth * 0.13)));
        [0.10, 0.27, 0.44].forEach((y, row) => { addBox(0.32, 0.105, 0.025, 0x0e1720, 0, y, -0.15); addGlow(0.22, 0.018, 0.008, -0.035, y, -0.164, row === 1 ? 0xff71d2 : 0x69dcff); });
        addBox(0.34, 0.018, 0.28, 0x28394b, 0, 0.02);
      } else if (id === 'coffee-drone') {
        addCylinder(0.13, 0.15, 0.030, 0x17222e, 0, 0.015);
        const mug = addCylinder(0.065, 0.072, 0.115, 0xf1f6ff, 0, 0.088, 0.01);
        const handle = new THREE.Mesh(new THREE.TorusGeometry(0.037, 0.010, 8, 16, Math.PI), makeMat({ color: 0xf1f6ff })); handle.position.set(0.071, 0.09, 0.01); handle.rotation.y = Math.PI / 2; group.add(handle);
        addBox(0.18, 0.025, 0.10, 0x263846, 0, 0.22);
        [-0.14, 0.14].forEach(x => addCylinder(0.055, 0.055, 0.009, 0x62e4ff, x, 0.22, 0, { emissive: 0x62e4ff, emissiveIntensity: 0.44 }).rotation.x = Math.PI / 2);
        void mug;
      } else if (id === 'desk-bonsai') {
        addCylinder(0.09, 0.12, 0.12, 0x735039, 0, 0.06);
        addCylinder(0.026, 0.038, 0.20, 0x72523a, 0, 0.19);
        [[0, 0.31, 0], [-0.075, 0.27, 0.02], [0.075, 0.29, -0.02], [0.02, 0.36, -0.03]].forEach(([x, y, z], index) => {
          const crown = new THREE.Mesh(new THREE.SphereGeometry(0.085 + (index % 2) * 0.012, 12, 10), makeMat({ color: [0x4ea466, 0x67bd75, 0x2f7b4d][index % 3] })); crown.position.set(x, y, z); crown.scale.set(1.15, 0.72, 0.92); group.add(crown);
        });
      } else if (id === 'projector-pad') {
        addCylinder(0.15, 0.18, 0.045, 0x172431, 0, 0.023, 0, { emissive: 0x123245, emissiveIntensity: 0.30 });
        addCylinder(0.070, 0.095, 0.10, 0x263b4d, 0, 0.095);
        const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.16, 0.34, 16, 1, true), makeMat({ color: 0x74eaff, transparent: true, opacity: 0.16, emissive: 0x45b9e8, emissiveIntensity: 0.24, depthWrite: false })); beam.position.y = 0.29; group.add(beam);
        const holo = new THREE.Mesh(new THREE.TorusKnotGeometry(0.07, 0.012, 40, 8), makeMat({ color: 0x88ecff, emissive: 0x61dfff, emissiveIntensity: 0.56, roughness: 0.28 })); holo.scale.y = 0.65; holo.position.y = 0.43; group.add(holo);
      } else if (id === 'holo-globe') {
        addCylinder(0.18, 0.25, 0.12, 0x192735, 0, 0.06);
        addCylinder(0.065, 0.12, 0.38, 0x273c4c, 0, 0.25);
        addGlow(0.20, 0.018, 0.20, 0, 0.13, 0, 0x5fe6ff);
        const orbital = new THREE.Group();
        orbital.position.y = 0.73;
        orbital.userData.spin = opts.ghost ? 0 : 0.42;
        group.add(orbital);
        const orb = new THREE.Mesh(new THREE.SphereGeometry(0.25, 24, 18), makeMat({ color: 0x7ceaff, transparent: true, opacity: 0.36, emissive: 0x55ccff, emissiveIntensity: 0.62, depthWrite: false }));
        orb.scale.y = 1.18;
        orbital.add(orb);
        const equator = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.012, 10, 32), makeMat({ color: 0x77e9ff, emissive: 0x77e9ff, emissiveIntensity: 0.62, roughness: 0.28 }));
        equator.rotation.x = Math.PI / 2;
        orbital.add(equator);
        const meridian = equator.clone();
        meridian.rotation.set(Math.PI / 2, 0, Math.PI / 5);
        orbital.add(meridian);
        const accentRing = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.010, 10, 28), makeMat({ color: 0xff82d7, emissive: 0xff82d7, emissiveIntensity: 0.52, roughness: 0.28 }));
        accentRing.rotation.set(0, Math.PI / 2, Math.PI / 6);
        orbital.add(accentRing);
      } else if (id === 'led-strip') {
        addBox(spec.w, 0.022, spec.d, 0x1b2634, 0, 0.011);
        addGlow(spec.w - 0.08, 0.014, 0.038, 0, 0.025, 0, 0x7c4dff);
        [-0.42, 0, 0.42].forEach(x => addGlow(0.18, 0.016, 0.046, x, 0.027, 0, x === 0 ? 0x68e9ff : 0xff72cf));
      } else if (id === 'floor-runner') {
        addBox(spec.w, 0.020, spec.d, 0x263444, 0, 0.010);
        [-1, 1].forEach(side => addGlow(0.035, 0.012, spec.d - 0.12, side * (spec.w / 2 - 0.045), 0.024, 0, 0x4de4d0));
        for (let z = -0.8; z <= 0.8; z += 0.4) addBox(0.62, 0.012, 0.045, 0x344a5b, 0, 0.024, z);
      } else if (id === 'hex-rug') {
        const rug = new THREE.Mesh(new THREE.CylinderGeometry(spec.w / 2, spec.w / 2, 0.022, 6), makeMat({ color: 0x27394a })); rug.rotation.y = Math.PI / 6; rug.position.y = 0.011; group.add(rug);
        const inset = new THREE.Mesh(new THREE.CylinderGeometry(spec.w * 0.36, spec.w * 0.36, 0.010, 6), makeMat({ color: 0x42657c, emissive: 0x214a61, emissiveIntensity: 0.18 })); inset.rotation.y = Math.PI / 6; inset.position.y = 0.027; group.add(inset);
        addRing(0.30, 0.010, 0.035, 0x72dfff);
      } else if (id === 'light-grid') {
        addBox(spec.w, 0.016, spec.d, 0x192634, 0, 0.008);
        for (let x = -0.40; x <= 0.40; x += 0.40) for (let z = -0.32; z <= 0.32; z += 0.32) addGlow(0.26, 0.012, 0.20, x, 0.020, z, (x === 0 && z === 0) ? 0xff70d2 : 0x64e5ff);
      } else if (id === 'floor-bot') {
        addBox(spec.w, 0.05, spec.d, 0x161e27, 0, 0.025);
        addBox(0.52, 0.10, 0.10, 0x2a3642, 0, 0.08, -0.13, { emissive: 0x143049, emissiveIntensity: 0.24 });
        addGlow(0.42, 0.014, 0.17, 0, 0.057, 0.08, 0x63dfff);
        [-0.27, 0.27].forEach(x => addGlow(0.06, 0.024, 0.06, x, 0.055, -0.12, 0x7bffc6));
      } else if (id === 'parts-bins') {
        [-0.24, 0.24].forEach(x => addBox(0.025, spec.h, 0.025, 0x263442, x, spec.h / 2));
        [0.08, 0.22, 0.36].forEach((y, row) => {
          addBox(spec.w, 0.020, spec.d, 0x324452, 0, y - 0.065);
          [-0.12, 0.12].forEach((x, col) => addBox(0.19, 0.10, 0.18, [0xffc66f, 0x64dfff, 0x83dc90][(row + col) % 3], x, y, -0.035, { roughness: 0.58 }));
        });
      } else if (id === 'retro-console') {
        addBox(spec.w, 0.52, spec.d, 0x252c40, 0, 0.26);
        const screen = addBox(0.34, 0.24, 0.028, 0x08111a, 0, 0.53, -spec.d / 2 - 0.012, { emissive: 0x17445a, emissiveIntensity: 0.36 }); screen.rotation.x = -0.18;
        addBox(0.42, 0.10, 0.24, 0x36425d, 0, 0.43, -0.02); group.children[group.children.length - 1].rotation.x = -0.20;
        addCylinder(0.030, 0.030, 0.045, 0xff6acb, -0.11, 0.50, -0.09).rotation.x = Math.PI / 2;
        [0xffd76e, 0x6de7ff, 0x80ef87].forEach((color, index) => addCylinder(0.025, 0.025, 0.018, color, 0.08 + index * 0.06, 0.49, -0.09, { emissive: color, emissiveIntensity: 0.38 }).rotation.x = Math.PI / 2);
        addBox(0.30, 0.08, 0.30, 0x1d2434, 0, 0.04);
      } else if (id === 'bookcase') {
        [-1, 1].forEach(side => addBox(0.06, spec.h, spec.d, 0x322b24, side * (spec.w / 2 - 0.03), spec.h / 2));
        [0.07, 0.38, 0.69, 1.00, 1.25].forEach((y, row) => { addBox(spec.w, 0.045, spec.d, 0x493a2c, 0, y); if (row < 4) for (let book = 0; book < 5; book += 1) addBox(0.075, 0.20 + ((book + row) % 2) * 0.05, 0.18, [0x5b82a4, 0xd06b72, 0xd4b86d, 0x60966e, 0x7968a8][(book + row) % 5], -0.28 + book * 0.13, y + 0.12, -0.02); });
        addBox(spec.w, spec.h, 0.028, 0x2a241e, 0, spec.h / 2, spec.d / 2 - 0.014);
      } else if (id === 'model-sat') {
        addCylinder(0.15, 0.19, 0.08, 0x24313f, 0, 0.04);
        addCylinder(0.026, 0.040, 0.28, 0xabb9c8, 0, 0.20);
        addBox(0.15, 0.10, 0.10, 0x71dfff, 0, 0.37, 0, { emissive: 0x28739c, emissiveIntensity: 0.24 });
        [-1, 1].forEach(side => { addBox(0.22, 0.026, 0.11, 0x5a8eb4, side * 0.20, 0.37, 0, { emissive: 0x24608a, emissiveIntensity: 0.22 }); addGlow(0.16, 0.010, 0.018, side * 0.20, 0.39, -0.062, 0x79e8ff); });
        const dish = new THREE.Mesh(new THREE.SphereGeometry(0.10, 16, 10, 0, TAU, 0, Math.PI / 2), makeMat({ color: 0xe5edf5, metalness: 0.65, roughness: 0.28 })); dish.position.set(0, 0.48, 0); dish.rotation.x = -0.45; group.add(dish);
      } else if (id === 'cold-spares') {
        addBox(spec.w, spec.h, spec.d, 0x1d2a35, 0, spec.h / 2);
        [-0.145, 0.145].forEach((x, door) => {
          addBox(0.27, 0.92, 0.018, 0x2e4150, x, 0.55, -spec.d / 2 - 0.011);
          for (let y = 0.20; y < 0.82; y += 0.10) addBox(0.16, 0.012, 0.008, 0x101a22, x, y, -spec.d / 2 - 0.024);
          addCylinder(0.016, 0.016, 0.020, 0xc8d5df, x + (door ? -0.08 : 0.08), 0.54, -spec.d / 2 - 0.034).rotation.x = Math.PI / 2;
        });
        addGlow(0.40, 0.018, 0.012, 0, 0.99, -spec.d / 2 - 0.024, 0x6be2ff);
      } else {
        addBox(spec.w, spec.h, spec.d, spec.color);
      }
    }

    createPlacedPropDecoration(id, zone, placement, opts = {}) {
      const safeZone = this.normalizePlacementZone(zone);
      const spec = this.getPlacedPropSpec(id);
      const pos = this.decorPlacementToWorld(safeZone, placement);
      const group = new this.THREE.Group();
      group.position.set(pos.x, pos.y, pos.z);
      group.rotation.y = pos.rotationY || 0;
      group.userData.decorId = id;
      group.userData.placementZone = safeZone;
      this.buildCanonicalPropModel(group, id, spec, opts);
      if (opts.ghost) {
        this.applyDecorGhost(group);
      } else if (opts.selectable !== false) {
        this.registerSelectableDecor(group, { id, zone: safeZone, placement: Object.assign({}, placement) });
      }
      if (!opts.ghost && (id === 'bookcase' || id === 'cold-spares')) this.addObstacle(pos.x, pos.z, spec.w, spec.d, 0.10);
      this.root.add(group);
      return group;
    }

    addDecorMoveHitbox(id, zone, placement, size = {}) {
      const THREE = this.THREE;
      if (!THREE || !id || !placement) return null;
      const safeZone = this.normalizePlacementZone(zone);
      const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false });
      let mesh = null;
      if (safeZone === 'wall') {
        const spec = this.getWallPlacedDecorSpec(id);
        const pos = this.wallPlacementToWorld(placement);
        mesh = new THREE.Mesh(new THREE.BoxGeometry(size.w || spec.w || 1, size.h || spec.h || 0.7, size.d || 0.12), mat);
        const offset = 0.045;
        mesh.position.set(
          pos.x + (pos.face === 'left' ? offset : pos.face === 'right' ? -offset : 0),
          pos.y,
          pos.z + (pos.face === 'back' ? offset : pos.face === 'front' ? -offset : 0)
        );
        mesh.rotation.y = pos.rotationY || 0;
      } else {
        const spec = this.getPlacedPropSpec(id);
        const pos = this.decorPlacementToWorld(safeZone, placement);
        const h = size.h || Math.max(0.16, spec.h || 0.2);
        mesh = new THREE.Mesh(new THREE.BoxGeometry(size.w || spec.w || 0.5, h, size.d || spec.d || 0.5), mat);
        mesh.position.set(pos.x, pos.y + h / 2, pos.z);
        mesh.rotation.y = pos.rotationY || 0;
      }
      mesh.renderOrder = -100;
      mesh.userData.isDecorMoveHitbox = true;
      this.root.add(mesh);
      this.registerSelectableDecor(mesh, { id, zone: safeZone, placement: Object.assign({}, placement) });
      return mesh;
    }

    addPlacedPropDecoration(id, zone, placement) {
      return this.createPlacedPropDecoration(id, zone, placement, { ghost: false });
    }

    addPlacedWallDecoration(id, placement) {
      return this.createPlacedWallDecoration(id, placement, { ghost: false });
    }

    getManualDecorPlacement(id) {
      const zone = this.getDecorPlacementZone(id);
      return { zone, placement: (((this.state.placements || {})[zone] || {})[id]) || null };
    }

    getDefaultDecorPlacement(id, zone = null) {
      const safeZone = zone ? this.normalizePlacementZone(zone) : this.getDecorPlacementZone(id);
      const wallDefaults = {
        'neon-sign': { x: 0.50, y: 0.70, face: 'back' },
        'plant-wall': { x: 0.16, y: 0.46, face: 'back' },
        'wall-monitor': { x: 0.30, y: 0.50, face: 'back' },
        'framed-cert': { x: 0.43, y: 0.44, face: 'right' },
        'server-poster': { x: 0.45, y: 0.43, face: 'left' },
        'moon-window': { x: 0.20, y: 0.49, face: 'front' },
        'uplink-map': { x: 0.22, y: 0.37, face: 'back' },
        'award-shelf': { x: 0.61, y: 0.36, face: 'right' },
        'maintenance-clock': { x: 0.66, y: 0.62, face: 'left' },
        'fiber-art': { x: 0.30, y: 0.45, face: 'left' },
        'incident-board': { x: 0.76, y: 0.43, face: 'right' },
        'snack-shelf': { x: 0.18, y: 0.28, face: 'right' }
      };
      const deskDefaults = {
        'desk-mat': { x: 0.56, y: 0.54, rotation: 0 },
        'tower-stack': { x: 0.16, y: 0.18, rotation: 0 },
        'aquarium': { x: 0.98, y: 0.14, rotation: 0 },
        'keyboard-glow': { x: 0.53, y: 0.54, rotation: 0 },
        'mini-rack': { x: 1.0, y: 0.24, rotation: 0 },
        'coffee-drone': { x: 0.30, y: 0.02, rotation: 0 },
        'desk-bonsai': { x: 0.96, y: 0.45, rotation: 0 },
        'projector-pad': { x: 0.10, y: 0.38, rotation: 0 },
        'lava-lamp': { x: 0.03, y: 0.02, rotation: 0 }
      };
      const floorDefaults = {
        'holo-globe': { x: 0.88, y: 0.48, rotation: 0 },
        'chair-upgrade': { x: 0.50, y: 0.72, rotation: 0 },
        'led-strip': { x: 0.50, y: 0.96, rotation: 0 },
        'floor-runner': { x: 0.51, y: 0.67, rotation: 0 },
        'hex-rug': { x: 0.34, y: 0.60, rotation: Math.PI / 6 },
        'floor-bot': { x: 0.94, y: 0.99, rotation: Math.PI },
        'light-grid': { x: 0.50, y: 0.52, rotation: 0 },
        'parts-bins': { x: 0.95, y: 0.02, rotation: 0 },
        'retro-console': { x: 0.94, y: 0.02, rotation: 0 },
        'bookcase': { x: 0.96, y: 0.41, rotation: 0 },
        'model-sat': { x: 0.94, y: 0.02, rotation: 0 },
        'cold-spares': { x: 0.96, y: 0.75, rotation: 0 },
        'pendant-light': { x: 0.18, y: 0.78, rotation: -Math.PI / 10 }
      };
      if (safeZone === 'wall') return Object.assign({ x: 0.5, y: 0.56, face: 'back' }, wallDefaults[id] || {});
      if (safeZone === 'desk') return Object.assign({ x: 0.5, y: 0.5, rotation: 0 }, deskDefaults[id] || {});
      return Object.assign({ x: 0.5, y: 0.5, rotation: 0 }, floorDefaults[id] || {});
    }

    addFallbackDecorHitbox(id) {
      const zone = this.getDecorPlacementZone(id);
      const placement = this.getDefaultDecorPlacement(id, zone);
      return this.addDecorMoveHitbox(id, zone, placement);
    }

    hasManualWallPlacement(id) {
      return !!(((this.state.placements || {}).wall || {})[id]);
    }

    addManualWallPlacementIfAny(id) {
      const placement = ((this.state.placements || {}).wall || {})[id];
      if (!placement) return false;
      this.addPlacedWallDecoration(id, placement);
      return true;
    }

    addManualDecorPlacementIfAny(id) {
      const { zone, placement } = this.getManualDecorPlacement(id);
      if (!placement) return false;
      if (zone === 'wall') this.addPlacedWallDecoration(id, placement);
      else this.addPlacedPropDecoration(id, zone, placement);
      return true;
    }

    buildDecorations() {
      const items = new Set(this.state.decorations || []);
      items.forEach(id => {
        const zone = DECOR_PLACEMENT_ZONES[id];
        if (!zone) return;
        if (id === 'floor-bot') {
          this.buildBotDock();
          return;
        }
        const stored = ((this.state.placements || {})[zone] || {})[id];
        const placement = stored || this.getDefaultDecorPlacement(id, zone);
        if (zone === 'wall') this.addPlacedWallDecoration(id, placement);
        else this.addPlacedPropDecoration(id, zone, placement);
      });
    }

    // --- decoration helpers ---
    makeLabelTexture(lines, opts = {}) {
      const THREE = this.THREE;
      const width = opts.width || 512;
      const height = opts.height || 256;
      const canvas = makeCanvas(width, height);
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, width, height);
      if (opts.background) {
        ctx.fillStyle = opts.background;
        ctx.fillRect(0, 0, width, height);
      }
      if (opts.border) {
        ctx.strokeStyle = opts.border;
        ctx.lineWidth = opts.borderWidth || 8;
        ctx.strokeRect(10, 10, width - 20, height - 20);
      }
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const arr = Array.isArray(lines) ? lines : [String(lines)];
      const gap = height / (arr.length + 1);
      arr.forEach((line, index) => {
        ctx.fillStyle = (opts.colors && opts.colors[index]) || opts.color || '#7ceaff';
        ctx.font = `${opts.weight || 800} ${opts.size || 42}px Inter, Arial, sans-serif`;
        ctx.shadowColor = opts.glow || 'transparent';
        ctx.shadowBlur = opts.glow ? 16 : 0;
        ctx.fillText(line, width / 2, gap * (index + 1));
      });
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace || texture.colorSpace;
      return texture;
    }

    makeWallTexture(id) {
      const THREE = this.THREE;
      if (id === 'circuit-board') {
        const cacheKey = 'wall-finish-circuit-board';
        if (this.textures[cacheKey]) return this.textures[cacheKey];
        const canvas = makeCanvas(512, 512);
        const ctx = canvas.getContext('2d');
        const drawFallbackCircuit = () => {
          ctx.fillStyle = '#516b2c';
          ctx.fillRect(0, 0, 512, 512);
          ctx.strokeStyle = 'rgba(219, 248, 45, 0.72)';
          ctx.lineWidth = 3;
          for (let y = 18; y < 512; y += 42) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            for (let x = 0; x < 512; x += 56) {
              ctx.lineTo(x + 24, y);
              ctx.lineTo(x + 24, y + ((x / 56) % 2 ? -16 : 16));
              ctx.lineTo(x + 54, y + ((x / 56) % 2 ? -16 : 16));
            }
            ctx.stroke();
          }
          ctx.fillStyle = 'rgba(239, 255, 60, 0.78)';
          for (let x = 12; x < 512; x += 38) {
            for (let y = 20; y < 512; y += 58) {
              ctx.fillRect(x, y, 6, 6);
              ctx.fillRect(x + 14, y + 14, 4, 4);
            }
          }
        };
        drawFallbackCircuit();
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace || texture.colorSpace;
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.anisotropy = this.renderer?.capabilities?.getMaxAnisotropy?.() || 1;
        const imageSrc = window.UptimeCircuitWallTextureData || ASSET('circuit_wall_texture.png');
        if (imageSrc) {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            texture.needsUpdate = true;
          };
          img.onerror = () => {
            drawFallbackCircuit();
            texture.needsUpdate = true;
          };
          img.src = imageSrc;
        }
        this.textures[cacheKey] = texture;
        return texture;
      }
      const canvas = makeCanvas(512, 512);
      const ctx = canvas.getContext('2d');
      const presets = {
        'default': ['#75996b', '#6a8e60'],
        'brushed-steel': ['#55626c', '#46505a'],
        'rose-panel': ['#6e5260', '#59414f'],
        'midnight-grid': ['#182131', '#111825'],
        'emerald-acoustic': ['#285244', '#1d4034']
      };
      const colors = presets[id] || presets.default;
      ctx.fillStyle = colors[0];
      ctx.fillRect(0, 0, 512, 512);
      if (id === 'brushed-steel') {
        for (let y = 0; y < 512; y += 8) {
          ctx.fillStyle = y % 16 === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)';
          ctx.fillRect(0, y, 512, 4);
        }
      } else if (id === 'rose-panel' || id === 'emerald-acoustic') {
        ctx.fillStyle = colors[1];
        for (let y = 0; y < 512; y += 64) ctx.fillRect(0, y, 512, 48);
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        for (let y = 0; y < 512; y += 64) ctx.fillRect(0, y, 512, 6);
      } else if (id === 'midnight-grid') {
        ctx.fillStyle = colors[1];
        ctx.fillRect(0, 0, 512, 512);
        ctx.strokeStyle = 'rgba(102,216,255,0.18)';
        ctx.lineWidth = 2;
        for (let x = 0; x <= 512; x += 32) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,512); ctx.stroke(); }
        for (let y = 0; y <= 512; y += 32) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(512,y); ctx.stroke(); }
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.025)';
        for (let x = 0; x < 512; x += 32) ctx.fillRect(x, 0, 3, 512);
      }
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace || texture.colorSpace;
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.anisotropy = this.renderer?.capabilities?.getMaxAnisotropy?.() || 1;
      return texture;
    }

    buildFloorTilesFromModel(finishId, room = this.room) {
      const THREE = this.THREE;
      const modelState = this.getFloorTileModelState(finishId) || {};
      const parts = modelState.parts || [];
      const size = modelState.boundsSize;
      if (!parts.length || !size || size.x <= 0 || size.z <= 0) return;
      const isSciFi = finishId === 'sci-fi-tile';
      const tileWorldSize = isSciFi ? 1.6 : 0.28;
      const scaleXZ = tileWorldSize / Math.max(size.x, size.z);
      const tileScaleY = isSciFi ? Math.max(0.18, scaleXZ * 0.55) : Math.max(0.24, scaleXZ * 0.45);
      const groutGap = isSciFi ? 0.012 : 0.008;
      const stepX = size.x * scaleXZ + groutGap;
      const stepZ = size.z * scaleXZ + groutGap;
      const countX = Math.max(1, Math.ceil(room.width / stepX) + 2);
      const countZ = Math.max(1, Math.ceil(room.depth / stepZ) + 2);
      const startX = -((countX - 1) * stepX) / 2;
      const startZ = -((countZ - 1) * stepZ) / 2;
      const tileCount = countX * countZ;
      const group = new THREE.Group();
      const dummy = new THREE.Object3D();
      const tileTop = size.y * tileScaleY;
      let texture = modelState.texture || null;
      if (!texture && modelState.textureDataUrl) {
        texture = new THREE.TextureLoader().load(modelState.textureDataUrl);
        texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.flipY = false;
        if ('colorSpace' in texture && THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
        else if ('encoding' in texture && THREE.sRGBEncoding) texture.encoding = THREE.sRGBEncoding;
        texture.anisotropy = Math.min(4, this.renderer?.capabilities?.getMaxAnisotropy?.() || 1);
        modelState.texture = texture;
      }
      parts.forEach(part => {
        const matInfo = part.material || modelState.materialSpec || {};
        const fallbackColor = finishId === 'sci-fi-tile'
          ? ((matInfo.name || '').toLowerCase().includes('ground2') ? 0x00a8b8 : (matInfo.color || 0x121212))
          : 0xa28778;
        const material = new THREE.MeshStandardMaterial({
          map: texture || null,
          color: texture ? 0xffffff : fallbackColor,
          roughness: Number.isFinite(matInfo.roughness) ? matInfo.roughness : (Number.isFinite(modelState.materialSpec?.roughness) ? modelState.materialSpec.roughness : 0.98),
          metalness: Number.isFinite(matInfo.metalness) ? matInfo.metalness : (Number.isFinite(modelState.materialSpec?.metalness) ? modelState.materialSpec.metalness : 0.05)
        });
        if (finishId === 'sci-fi-tile') {
          const name = (matInfo.name || '').toLowerCase();
          if (name.includes('ground2')) {
            material.emissive = new THREE.Color(0x0bb8c6);
            material.emissiveIntensity = 0.38;
          }
        }
        const instanced = new THREE.InstancedMesh(part.geometry, material, tileCount);
        instanced.castShadow = false;
        instanced.receiveShadow = true;
        instanced.instanceMatrix.setUsage(THREE.StaticDrawUsage);
        let instanceIndex = 0;
        for (let iz = 0; iz < countZ; iz += 1) {
          for (let ix = 0; ix < countX; ix += 1) {
            dummy.position.set(startX + ix * stepX, -tileTop * 0.5 + 0.001, startZ + iz * stepZ);
            dummy.rotation.set(0, 0, 0);
            dummy.scale.set(scaleXZ, tileScaleY, scaleXZ);
            dummy.updateMatrix();
            instanced.setMatrixAt(instanceIndex, dummy.matrix);
            instanceIndex += 1;
          }
        }
        instanced.instanceMatrix.needsUpdate = true;
        group.add(instanced);
      });
      group.userData.customFloorTiles = finishId;
      this.root.add(group);
    }

    makeFloorTexture(id) {
      const THREE = this.THREE;
      const canvas = makeCanvas(512, 512);
      const ctx = canvas.getContext('2d');
      const presets = {
        'default': ['#74797e', '#64696f'],
        'warm-oak': ['#8a5e44', '#6a4633'],
        'dark-rubber': ['#2b3138', '#1d2228'],
        'hex-epoxy': ['#253b53', '#182433'],
        'aurora-laminate': ['#23283a', '#1a1e2e'],
        'aesthetic-tile': ['#17141a', '#ef8aad'],
        'sci-fi-tile': ['#0e1419', '#0aa5b4']
      };
      const colors = presets[id] || presets.default;
      ctx.fillStyle = colors[0];
      ctx.fillRect(0, 0, 512, 512);
      if (id === 'warm-oak') {
        ctx.fillStyle = colors[1];
        for (let x = 0; x < 512; x += 48) ctx.fillRect(x, 0, 42, 512);
        ctx.fillStyle = 'rgba(40,18,8,0.18)';
        for (let x = 44; x < 512; x += 48) ctx.fillRect(x, 0, 4, 512);
      } else if (id === 'dark-rubber') {
        ctx.fillStyle = colors[1];
        ctx.fillRect(0, 0, 512, 512);
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        for (let y = 16; y < 512; y += 24) for (let x = 16; x < 512; x += 24) ctx.fillRect(x, y, 2, 2);
      } else if (id === 'hex-epoxy') {
        ctx.fillStyle = colors[1];
        ctx.fillRect(0, 0, 512, 512);
        ctx.strokeStyle = 'rgba(104,216,255,0.18)';
        ctx.lineWidth = 2;
        const w = 26, h = 22;
        for (let row = 0; row < 28; row++) {
          for (let col = 0; col < 22; col++) {
            const ox = col * (w * 1.5) + ((row % 2) ? w * 0.75 : 0) - 20;
            const oy = row * h - 12;
            ctx.beginPath();
            ctx.moveTo(ox + w*0.25, oy);
            ctx.lineTo(ox + w*0.75, oy);
            ctx.lineTo(ox + w, oy + h*0.5);
            ctx.lineTo(ox + w*0.75, oy + h);
            ctx.lineTo(ox + w*0.25, oy + h);
            ctx.lineTo(ox, oy + h*0.5);
            ctx.closePath();
            ctx.stroke();
          }
        }
      } else if (id === 'aurora-laminate') {
        ctx.fillStyle = colors[1];
        ctx.fillRect(0, 0, 512, 512);
        for (let x = 0; x < 512; x += 42) {
          ctx.fillStyle = (Math.floor(x / 42) % 2 === 0) ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
          ctx.fillRect(x, 0, 40, 512);
          ctx.fillStyle = 'rgba(255,255,255,0.05)';
          ctx.fillRect(x + 39, 0, 2, 512);
        }
        const ag = ctx.createLinearGradient(0, 0, 512, 512);
        ag.addColorStop(0, 'rgba(255,127,209,0.10)');
        ag.addColorStop(0.5, 'rgba(104,216,255,0.08)');
        ag.addColorStop(1, 'rgba(127,255,174,0.08)');
        ctx.fillStyle = ag;
        ctx.fillRect(0,0,512,512);
      } else if (id === 'aesthetic-tile') {
        const cell = 72;
        ctx.fillStyle = '#b88c67';
        ctx.fillRect(0, 0, 512, 512);
        for (let y = 0; y < 512; y += cell) {
          for (let x = 0; x < 512; x += cell) {
            ctx.fillStyle = ((x / cell + y / cell) % 2 === 0) ? '#b98659' : '#a5754d';
            ctx.fillRect(x + 3, y + 3, cell - 6, cell - 6);
            ctx.fillStyle = 'rgba(255,255,255,0.10)';
            ctx.fillRect(x + 10, y + 10, cell - 22, 10);
          }
        }
      } else if (id === 'sci-fi-tile') {
        ctx.fillStyle = '#091016';
        ctx.fillRect(0, 0, 512, 512);
        const cell = 128;
        for (let y = 0; y < 512; y += cell) {
          for (let x = 0; x < 512; x += cell) {
            ctx.fillStyle = '#111920';
            ctx.fillRect(x + 4, y + 4, cell - 8, cell - 8);
            ctx.strokeStyle = 'rgba(11,184,198,0.85)';
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.moveTo(x + cell / 2, y + 18);
            ctx.lineTo(x + cell / 2, y + cell - 18);
            ctx.moveTo(x + 18, y + cell / 2);
            ctx.lineTo(x + cell - 18, y + cell / 2);
            ctx.stroke();
            ctx.strokeStyle = 'rgba(11,184,198,0.45)';
            ctx.lineWidth = 4;
            ctx.strokeRect(x + 12, y + 12, cell - 24, cell - 24);
          }
        }
      } else {
        ctx.fillStyle = colors[1];
        for (let y = 0; y < 512; y += 64) ctx.fillRect(0, y, 512, 32);
      }
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace || texture.colorSpace;
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.anisotropy = this.renderer?.capabilities?.getMaxAnisotropy?.() || 1;
      return texture;
    }


    makeArcadeTexture(kind = 'front') {
      const THREE = this.THREE;
      const size = kind === 'side' ? [640, 1024] : [768, 1024];
      const canvas = makeCanvas(size[0], size[1]);
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bg.addColorStop(0, '#0c1218');
      bg.addColorStop(1, '#111923');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(130,220,255,0.10)';
      ctx.lineWidth = 4;
      if (kind === 'front') {
        ctx.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);
        ctx.fillStyle = '#7f4e17';
        ctx.fillRect(90, 58, canvas.width - 180, 90);
        ctx.fillStyle = '#171b21';
        ctx.fillRect(160, 220, canvas.width - 320, 360);
        ctx.fillStyle = '#5a1c5e';
        ctx.fillRect(112, 740, canvas.width - 224, 78);
        ctx.font = '900 56px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#101318';
        ctx.fillText('UPTIME ARCADE', canvas.width/2, 118);
        ctx.fillStyle = '#8df0ff';
        ctx.fillRect(186, 250, canvas.width - 372, 8);
        ctx.fillRect(186, 296, canvas.width - 440, 8);
        ctx.fillRect(186, 342, canvas.width - 320, 8);
        ctx.fillRect(186, 388, canvas.width - 392, 8);
        ctx.fillRect(186, 434, canvas.width - 350, 8);
        ctx.fillStyle = '#ffe27a';
        ctx.beginPath(); ctx.arc(280, 785, 22, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#ff7ea6';
        ctx.beginPath(); ctx.arc(340, 785, 22, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#7fd986';
        ctx.beginPath(); ctx.arc(400, 785, 22, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#6bc9ff';
        ctx.beginPath(); ctx.arc(460, 785, 22, 0, Math.PI*2); ctx.fill();
      } else if (kind === 'side') {
        ctx.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);
        ctx.fillStyle = '#221526';
        ctx.fillRect(64, 90, canvas.width - 128, canvas.height - 180);
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        for (let i = 0; i < 7; i += 1) {
          ctx.beginPath();
          ctx.moveTo(90, 170 + i * 110);
          ctx.lineTo(canvas.width - 90, 170 + i * 110);
          ctx.stroke();
        }
        ctx.font = '800 42px Arial';
        ctx.fillStyle = '#8df0ff';
        ctx.save();
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.rotate(-Math.PI/2);
        ctx.textAlign = 'center';
        ctx.fillText('UPTIME', 0, -26);
        ctx.fillStyle = '#ff8dcb';
        ctx.fillText('ARCADE', 0, 30);
        ctx.restore();
      } else {
        ctx.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);
        ctx.fillStyle = '#1a2026';
        ctx.fillRect(70, 100, canvas.width - 140, canvas.height - 200);
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace || tex.colorSpace;
      tex.needsUpdate = true;
      return tex;
    }

    makeScreenTexture(color) {
      const THREE = this.THREE;
      const canvas = makeCanvas(512, 320);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#081016';
      ctx.fillRect(0, 0, 512, 320);
      ctx.strokeStyle = 'rgba(124,234,255,0.45)';
      ctx.lineWidth = 6;
      ctx.strokeRect(18, 18, 476, 284);
      ctx.fillStyle = '#9fe8ff';
      ctx.font = '700 36px Inter, Arial, sans-serif';
      ctx.fillText('UPTIME', 36, 58);
      ctx.fillStyle = 'rgba(124,234,255,0.12)';
      for (let y = 76; y < 260; y += 32) ctx.fillRect(28, y, 456, 2);
      ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
      ctx.fillRect(36, 96, 140, 18);
      ctx.fillRect(36, 132, 230, 18);
      ctx.fillRect(36, 168, 184, 18);
      ctx.fillRect(36, 204, 120, 18);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace || texture.colorSpace;
      return texture;
    }

    addNeonSign(x, y, z, label) {
      const THREE = this.THREE;
      const tex = this.makeLabelTexture([label], { width: 512, height: 128, color: '#ff79d8', glow: 'rgba(255,121,216,0.8)', size: 56 });
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(1.48, 0.36), new THREE.MeshStandardMaterial({ map: tex, transparent: true, emissive: 0xff5dce, emissiveIntensity: 0.55 }));
      plane.position.set(x, y, z);
      this.root.add(plane);
    }

    addPlantWall(x, y, z, w, h) {
      const THREE = this.THREE;
      const panel = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.08), new THREE.MeshStandardMaterial({ color: 0x24523d, roughness: 0.95 }));
      panel.position.set(x, y, z);
      this.root.add(panel);
      for (let i = 0; i < 26; i += 1) {
        const blob = new THREE.Mesh(new THREE.SphereGeometry(0.08 + Math.random() * 0.04, 10, 10), new THREE.MeshStandardMaterial({ color: [0x3b7a52, 0x4d9a65, 0x2f6c4a][i % 3], roughness: 0.92 }));
        blob.position.set(x + (Math.random() - 0.5) * (w - 0.2), y + (Math.random() - 0.5) * (h - 0.2), z - 0.02 - Math.random() * 0.05);
        this.root.add(blob);
      }
    }

    addShelfStack(x, y, z) {
      const THREE = this.THREE;
      const upright = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.4, 0.44), new THREE.MeshStandardMaterial({ color: 0x1d2530 }));
      upright.position.set(x, 0.7, z);
      this.root.add(upright);
      [0.22, 0.62, 1.02].forEach((level, idx) => {
        const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.05, 0.36), new THREE.MeshStandardMaterial({ color: 0x303949 }));
        shelf.position.set(x, level, z);
        this.root.add(shelf);
        for (let i = 0; i < 4; i += 1) {
          const snack = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.12), new THREE.MeshStandardMaterial({ color: [0xf15f6d, 0xf7cd61, 0x7edc8b, 0x58d8ff][(i + idx) % 4] }));
          snack.position.set(x - 0.24 + i * 0.16, level + 0.08, z - 0.02);
          this.root.add(snack);
        }
      });
    }

    addHoloGlobe(x, y, z) {
      const THREE = this.THREE;
      const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.62, 12), new THREE.MeshStandardMaterial({ color: 0x202832, roughness: 0.82 }));
      stand.position.set(x, 0.31, z);
      this.root.add(stand);
      const globe = new THREE.Mesh(new THREE.SphereGeometry(0.22, 18, 18), new THREE.MeshStandardMaterial({ color: 0x7af0ff, transparent: true, opacity: 0.38, emissive: 0x68dfff, emissiveIntensity: 0.55 }));
      globe.position.set(x, 0.78, z);
      globe.userData.spin = 0.22;
      this.root.add(globe);
    }

    buildAnimatedLavaLamp(group, options = {}) {
      const THREE = this.THREE;
      if (!group) return null;
      const {
        baseColor = 0xb56d38,
        metalColor = 0x283341,
        glassColor = 0xff9d5a,
        glowColor = 0xff7a33,
        glowIntensity = 0.38,
        glassOpacity = 0.32,
        ghost = false,
        registerAnimation = true,
        scale = 1
      } = options;

      const uploadedModel = this.lavaLampModel;
      if (uploadedModel && uploadedModel.loaded && Array.isArray(uploadedModel.parts) && uploadedModel.parts.length && uploadedModel.boundsSize) {
        const boundsSize = uploadedModel.boundsSize;
        const targetHeight = 0.50 * scale;
        const targetWidth = 0.18 * scale;
        const fitScale = Math.min(targetHeight / Math.max(0.001, boundsSize.y), targetWidth / Math.max(0.001, Math.max(boundsSize.x, boundsSize.z)));
        let glassMesh = null;
        let light = null;
        let bottomGlow = null;

        uploadedModel.parts.forEach(part => {
          // The OBJ includes one large metaball mesh. It reads as one outside-orbiting blob when animated,
          // so keep the uploaded shell/glass and replace the lava with contained internal blobs below.
          if (part.role === 'lava') return;

          let material;
          if (part.role === 'glass') {
            material = new THREE.MeshStandardMaterial({
              color: glassColor,
              transparent: true,
              opacity: glassOpacity,
              emissive: glowColor,
              emissiveIntensity: ghost ? 0.08 : glowIntensity * 0.62,
              metalness: 0.02,
              roughness: 0.12,
              side: THREE.DoubleSide,
              depthWrite: false
            });
          } else {
            material = new THREE.MeshStandardMaterial({
              color: baseColor,
              emissive: 0x4a230b,
              emissiveIntensity: ghost ? 0.06 : 0.14,
              metalness: 0.24,
              roughness: 0.52,
              side: THREE.DoubleSide
            });
          }
          const mesh = new THREE.Mesh(part.geometry, material);
          mesh.castShadow = !ghost && part.role !== 'glass';
          mesh.receiveShadow = true;
          group.add(mesh);
          if (part.role === 'glass') glassMesh = mesh;
        });

        const blobs = [];
        const glassMinY = boundsSize.y * 0.37;
        const glassMaxY = boundsSize.y * 0.82;
        const radiusLimit = Math.max(0.24, Math.min(boundsSize.x, boundsSize.z) * 0.18);
        const blobConfigs = [
          { phase: 0.0, speed: 0.46, yBase: 0.18, radius: 0.35, stretch: 1.22, xAmp: 0.14, zAmp: 0.10, yAmp: 0.36 },
          { phase: 1.7, speed: 0.62, yBase: 0.42, radius: 0.25, stretch: 1.45, xAmp: 0.18, zAmp: 0.12, yAmp: 0.42 },
          { phase: 3.1, speed: 0.54, yBase: 0.66, radius: 0.21, stretch: 1.16, xAmp: 0.12, zAmp: 0.16, yAmp: 0.34 },
          { phase: 4.5, speed: 0.72, yBase: 0.31, radius: 0.17, stretch: 1.36, xAmp: 0.15, zAmp: 0.09, yAmp: 0.30 },
          { phase: 5.8, speed: 0.38, yBase: 0.78, radius: 0.14, stretch: 1.08, xAmp: 0.10, zAmp: 0.14, yAmp: 0.24 }
        ];

        blobConfigs.forEach((cfg, index) => {
          const mat = new THREE.MeshStandardMaterial({
            color: index % 2 ? 0xff8bd8 : 0xffb1ec,
            emissive: glowColor,
            emissiveIntensity: ghost ? 0.14 : 0.48,
            transparent: true,
            opacity: ghost ? 0.38 : 0.92,
            roughness: 0.58,
            metalness: 0.0,
            side: THREE.DoubleSide
          });
          const blob = new THREE.Mesh(new THREE.SphereGeometry(cfg.radius, 20, 16), mat);
          blob.scale.set(1, cfg.stretch, 1);
          blob.castShadow = !ghost;
          blob.receiveShadow = false;
          const y = glassMinY + (glassMaxY - glassMinY) * cfg.yBase;
          blob.position.set(0, y, 0);
          group.add(blob);
          blobs.push({ mesh: blob, ...cfg, minY: glassMinY, maxY: glassMaxY, radiusLimit });
        });

        bottomGlow = new THREE.Mesh(
          new THREE.SphereGeometry(Math.max(0.26, radiusLimit * 1.08), 20, 12),
          new THREE.MeshStandardMaterial({
            color: 0xffa35c,
            emissive: 0xff7a33,
            emissiveIntensity: ghost ? 0.10 : 0.72,
            transparent: true,
            opacity: ghost ? 0.10 : 0.20,
            depthWrite: false
          })
        );
        bottomGlow.scale.set(1.0, 0.18, 1.0);
        bottomGlow.position.set(0, glassMinY + 0.10, 0);
        group.add(bottomGlow);

        group.scale.setScalar(fitScale);
        group.rotation.y = Math.PI;

        if (!ghost) {
          light = new THREE.PointLight(glowColor, 0.58, 1.45 * scale, 2);
          light.position.set(0, glassMinY + 0.16, 0);
          group.add(light);
        }

        if (registerAnimation) {
          this.animatedLavaLamps.push({
            kind: 'uploadedModelContained',
            group,
            glass: glassMesh,
            blobs,
            light,
            bottomGlow,
            glowIntensity,
            fitScale,
            glassMinY,
            glassMaxY,
            radiusLimit
          });
        }
        group.userData.isAnimatedLavaLamp = true;
        group.userData.uploadedLavaLamp = true;
        return group;
      }

      const scaled = value => value * scale;
      const makeMat = settings => new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.52, metalness: 0.18 }, settings));

      const base = new THREE.Mesh(new THREE.CylinderGeometry(scaled(0.050), scaled(0.072), scaled(0.086), 18), makeMat({ color: baseColor, emissive: 0x51240b, emissiveIntensity: ghost ? 0.10 : 0.22 }));
      base.position.y = scaled(0.043);
      base.castShadow = true;
      base.receiveShadow = true;
      group.add(base);

      const stem = new THREE.Mesh(new THREE.CylinderGeometry(scaled(0.028), scaled(0.048), scaled(0.020), 18), makeMat({ color: metalColor, roughness: 0.36, metalness: 0.58 }));
      stem.position.y = scaled(0.096);
      stem.castShadow = true;
      stem.receiveShadow = true;
      group.add(stem);

      const glass = new THREE.Mesh(new THREE.CylinderGeometry(scaled(0.046), scaled(0.032), scaled(0.308), 22), makeMat({ color: glassColor, transparent: true, opacity: glassOpacity, emissive: glowColor, emissiveIntensity: ghost ? 0.06 : glowIntensity }));
      glass.position.y = scaled(0.262);
      glass.castShadow = !ghost;
      glass.receiveShadow = true;
      group.add(glass);

      const innerGlow = new THREE.Mesh(new THREE.CylinderGeometry(scaled(0.034), scaled(0.024), scaled(0.248), 18), makeMat({ color: 0xffc2ef, transparent: true, opacity: ghost ? 0.10 : 0.12, emissive: glowColor, emissiveIntensity: ghost ? 0.08 : glowIntensity * 0.85 }));
      innerGlow.position.y = scaled(0.252);
      group.add(innerGlow);

      const cap = new THREE.Mesh(new THREE.CylinderGeometry(scaled(0.072), scaled(0.046), scaled(0.072), 18), makeMat({ color: metalColor, roughness: 0.34, metalness: 0.62 }));
      cap.position.y = scaled(0.452);
      cap.castShadow = true;
      cap.receiveShadow = true;
      group.add(cap);

      const blobs = [];
      const blobConfigs = [
        { phase: 0.0, speed: 0.72, amp: 0.068, radius: 0.030, stretch: 1.35, sway: 0.010 },
        { phase: 2.1, speed: 0.58, amp: 0.061, radius: 0.024, stretch: 1.18, sway: 0.013 },
        { phase: 4.2, speed: 0.84, amp: 0.054, radius: 0.020, stretch: 1.52, sway: 0.016 }
      ];
      blobConfigs.forEach((cfg, index) => {
        const blob = new THREE.Mesh(new THREE.SphereGeometry(scaled(cfg.radius), 20, 16), makeMat({ color: 0xff9ae0, emissive: glowColor, emissiveIntensity: ghost ? 0.12 : 0.45, transparent: true, opacity: ghost ? 0.35 : 0.95 }));
        blob.scale.set(1, cfg.stretch, 1);
        blob.position.set(0, scaled(0.18 + index * 0.04), 0);
        blob.castShadow = !ghost;
        blob.receiveShadow = false;
        group.add(blob);
        blobs.push({ mesh: blob, ...cfg });
      });

      let light = null;
      if (!ghost) {
        light = new THREE.PointLight(glowColor, 0.42, scaled(1.3), 2);
        light.position.set(0, scaled(0.24), 0);
        group.add(light);
      }

      if (registerAnimation) {
        this.animatedLavaLamps.push({ kind: 'native', group, glass, innerGlow, blobs, light, glowIntensity, glowColor, scale });
      }
      group.userData.isAnimatedLavaLamp = true;
      return group;
    }

    addLavaLamp(x, y, z) {
      const THREE = this.THREE;
      const group = new THREE.Group();
      group.position.set(x, y, z);
      this.buildAnimatedLavaLamp(group, {
        baseColor: 0xb56d38,
        metalColor: 0x283341,
        glassColor: 0xff9d5a,
        glowColor: 0xff7a33,
        glowIntensity: 0.38,
        glassOpacity: 0.34,
        registerAnimation: true,
        ghost: false,
        scale: 1
      });
      this.root.add(group);
      this.registerSelectableDecor(group, { id: 'lava-lamp', zone: 'desk', placement: { x: 0.03, y: 0.02, rotation: 0 } });
      return group;
    }

    addWallDisplay(x, y, z, title) {
      const THREE = this.THREE;
      const panel = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.88, 0.04), new THREE.MeshStandardMaterial({ color: 0x111a25, roughness: 0.65, emissive: 0x071824, emissiveIntensity: 0.16 }));
      panel.position.set(x, y, z);
      this.root.add(panel);
      const canvas = makeCanvas(1024, 512);
      const ctx = canvas.getContext('2d');
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace || texture.colorSpace;
      const mat = new THREE.MeshStandardMaterial({ map: texture, emissive: 0x61d8ff, emissiveIntensity: 0.55, roughness: 0.3, metalness: 0.02 });
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.18, 0.68), mat);
      screen.position.set(x, y, z + 0.05);
      this.root.add(screen);
      this.dynamicDisplays.push({ type: 'noc', title, canvas, ctx, texture, seed: Math.random() * 1000, screen, panel, nextFrameAt: 0, interval: 0.10 });
    }

    addFramedPoster(x, y, z, w, h, text, bg, fg, vertical = false) {
      const THREE = this.THREE;
      const frame = new THREE.Mesh(new THREE.BoxGeometry(vertical ? 0.05 : w, vertical ? h : h, vertical ? w : 0.05), new THREE.MeshStandardMaterial({ color: 0x3b2d1d, roughness: 0.85 }));
      if (vertical) {
        frame.position.set(x, y, z);
      } else {
        frame.position.set(x, y, z);
      }
      this.root.add(frame);
      const tex = this.makeLabelTexture([text], { width: 512, height: 768, background: bg, border: '#d9b17a', color: fg, size: 52 });
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(vertical ? 0.68 : w - 0.08, h - 0.08), new THREE.MeshStandardMaterial({ map: tex }));
      if (vertical) {
        plane.position.set(x - 0.03, y, z);
        plane.rotation.y = Math.PI / 2;
      } else {
        plane.position.set(x, y, z - 0.03);
      }
      this.root.add(plane);
    }

    addMoonWindow(z, y, x, radius) {
      const THREE = this.THREE;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.05, 16, 48), new THREE.MeshStandardMaterial({ color: 0x9ec4ff, emissive: 0x335588, emissiveIntensity: 0.25 }));
      ring.position.set(x, y, z);
      ring.rotation.y = Math.PI;
      this.root.add(ring);
      const disk = new THREE.Mesh(new THREE.CircleGeometry(radius * 0.9, 48), new THREE.MeshStandardMaterial({ color: 0x0d1320, emissive: 0x162033, emissiveIntensity: 0.18 }));
      disk.position.set(x, y, z - 0.03);
      this.root.add(disk);
      const moon = new THREE.Mesh(new THREE.CircleGeometry(radius * 0.42, 28), new THREE.MeshStandardMaterial({ color: 0xf4efdf, emissive: 0xe5dcc1, emissiveIntensity: 0.2 }));
      moon.position.set(x + radius * 0.16, y + radius * 0.04, z - 0.05);
      this.root.add(moon);
    }

    addMapPanel(x, y, z) { const tex = this.makeLabelTexture(['UPLINK MAP', 'metro  east  north  euro'], { width: 768, height: 384, background: '#081016', border: '#7ceaff', colors: ['#7ceaff', '#99ffd9'], size: 56 }); const THREE = this.THREE; const p = new THREE.Mesh(new THREE.PlaneGeometry(1.04, 0.62), new THREE.MeshStandardMaterial({ map: tex, emissive: 0x58d8ff, emissiveIntensity: 0.2 })); p.position.set(x,y,z); this.root.add(p);} 
    addAwardShelf(x, y, z) { const THREE = this.THREE; const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.7,0.05,0.22), new THREE.MeshStandardMaterial({color:0x3a2c1d})); shelf.position.set(x,y,z); shelf.rotation.y=-Math.PI/2; this.root.add(shelf); for(let i=0;i<4;i++){ const cup=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.06,0.1,10), new THREE.MeshStandardMaterial({color:0xd7bd6a, metalness:0.6, roughness:0.35})); cup.position.set(x, y+0.08, z-0.22+i*0.14); this.root.add(cup);} }
    addClock(x, y, z) { const THREE=this.THREE; const c=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.22,0.04,24), new THREE.MeshStandardMaterial({color:0xf7f7f1})); c.position.set(x,y,z); c.rotation.y=Math.PI/2; this.root.add(c);} 
    addFiberArt(x,y,z){ const THREE=this.THREE; const panel=new THREE.Mesh(new THREE.PlaneGeometry(1.0,1.1), new THREE.MeshStandardMaterial({ map:this.makeLabelTexture(['FIBER','ART'],{width:512,height:768,background:'#151420',colors:['#ff89df','#7ceaff'],size:96}), emissive:0x4b2442, emissiveIntensity:0.12 })); panel.position.set(x,y,z); panel.rotation.y=Math.PI/2; this.root.add(panel);} 
    addIncidentBoard(x,y,z){ const THREE=this.THREE; const p=new THREE.Mesh(new THREE.PlaneGeometry(0.95,0.92), new THREE.MeshStandardMaterial({ map:this.makeLabelTexture(['INCIDENT','BOARD'],{width:512,height:512,background:'#2a1014',border:'#ff7f7f',colors:['#ffb6b6','#ffd5d5'],size:68}), emissive:0x5a1118, emissiveIntensity:0.1 })); p.position.set(x,y,z); p.rotation.y=-Math.PI/2; this.root.add(p);} 
    addDeskMat(){ const THREE=this.THREE; const mat=new THREE.Mesh(new THREE.PlaneGeometry(1.2,0.5), new THREE.MeshStandardMaterial({ color:0x2a2940, emissive:0x6e3cff, emissiveIntensity:0.18 })); mat.rotation.x=-Math.PI/2; mat.position.set(0.12,0.842,-this.room.depth/2+0.82); this.root.add(mat);} 
    addTowerStack(){ const THREE=this.THREE; for(let i=0;i<2;i++){ const t=new THREE.Mesh(new THREE.BoxGeometry(0.18,0.42,0.34), new THREE.MeshStandardMaterial({ color:0x202934 })); t.position.set(-0.95+i*0.22,0.21,-this.room.depth/2+0.45); this.root.add(t);} }
    addDeskAquarium(){ const THREE=this.THREE; const tank=new THREE.Mesh(new THREE.BoxGeometry(0.42,0.22,0.2), new THREE.MeshStandardMaterial({ color:0x7ceaff, transparent:true, opacity:0.32, emissive:0x245f7a, emissiveIntensity:0.25 })); tank.position.set(1.0,0.92,-this.room.depth/2+0.4); this.root.add(tank);} 
    addChairHalo(){ const THREE=this.THREE; const ring=new THREE.Mesh(new THREE.TorusGeometry(0.42,0.02,12,32), new THREE.MeshStandardMaterial({ color:0x7ceaff, emissive:0x7ceaff, emissiveIntensity:0.25 })); ring.position.set(0.1,1.22,-this.room.depth/2+2.1); ring.rotation.x=Math.PI/2; this.root.add(ring);} 
    addKeyboardGlow(){ const THREE=this.THREE; const glow=new THREE.PointLight(0xff6ad5,0.35,2.8,2); glow.position.set(0.06,0.88,-this.room.depth/2+0.82); this.root.add(glow);} 
    addMiniRack(){ const THREE=this.THREE; const r=new THREE.Mesh(new THREE.BoxGeometry(0.32,0.58,0.28), new THREE.MeshStandardMaterial({ color:0x1e2630 })); r.position.set(1.46,0.29,-this.room.depth/2+0.48); this.root.add(r);} 
    addCoffeeDrone(){ const THREE=this.THREE; const base=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,0.04,12), new THREE.MeshStandardMaterial({ color:0x1a2731 })); base.position.set(-0.42,0.86,-this.room.depth/2+0.35); this.root.add(base); const mug=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,0.1,12), new THREE.MeshStandardMaterial({ color:0xe7f1ff })); mug.position.set(-0.42,0.95,-this.room.depth/2+0.35); this.root.add(mug);} 
    addDeskBonsai(){ const THREE=this.THREE; const pot=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.08,0.08,12), new THREE.MeshStandardMaterial({ color:0x6a4a32 })); pot.position.set(0.96,0.84,-this.room.depth/2+0.76); this.root.add(pot); const crown=new THREE.Mesh(new THREE.SphereGeometry(0.12,12,12), new THREE.MeshStandardMaterial({ color:0x4ea466 })); crown.position.set(0.96,1.0,-this.room.depth/2+0.76); this.root.add(crown);} 
    addProjectorPad(){ const THREE=this.THREE; const pad=new THREE.Mesh(new THREE.CylinderGeometry(0.14,0.16,0.04,20), new THREE.MeshStandardMaterial({ color:0x1d2631, emissive:0x123245, emissiveIntensity:0.16 })); pad.position.set(-0.82,0.83,-this.room.depth/2+0.72); this.root.add(pad); const beam=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.12,0.5,16,1,true), new THREE.MeshStandardMaterial({ color:0x7ceaff, transparent:true, opacity:0.16 })); beam.position.set(-0.82,1.1,-this.room.depth/2+0.72); this.root.add(beam);} 
    addLedStrip(){ const THREE=this.THREE; const strip=new THREE.Mesh(new THREE.BoxGeometry(this.room.width-0.8,0.02,0.04), new THREE.MeshStandardMaterial({ color:0x6d2bff, emissive:0x6d2bff, emissiveIntensity:0.8 })); strip.position.set(0,0.02,this.room.depth/2-0.4); this.root.add(strip);} 
    addFloorRunner(){ const THREE=this.THREE; const mat=new THREE.Mesh(new THREE.PlaneGeometry(0.92,2.4), new THREE.MeshStandardMaterial({ color:0x2a3441 })); mat.rotation.x=-Math.PI/2; mat.position.set(0.08,0.011,1.0); this.root.add(mat);} 
    addHexRug(){ const THREE=this.THREE; const rug=new THREE.Mesh(new THREE.CircleGeometry(0.78,6), new THREE.MeshStandardMaterial({ color:0x30485f })); rug.rotation.x=-Math.PI/2; rug.position.set(-1.2,0.012,0.5); rug.rotation.z=Math.PI/6; this.root.add(rug);} 
    addFloorGrid(){ const THREE=this.THREE; for(let x=-this.room.width/2+0.6;x<=this.room.width/2-0.6;x+=0.42){ for(let z=-this.room.depth/2+0.6;z<=this.room.depth/2-0.6;z+=0.42){ const tile=new THREE.Mesh(new THREE.PlaneGeometry(0.12,0.12), new THREE.MeshStandardMaterial({ color:0x58d8ff, emissive:0x58d8ff, emissiveIntensity:0.3 })); tile.rotation.x=-Math.PI/2; tile.position.set(x,0.011,z); this.root.add(tile);} } }
    addPartsBins(){ const THREE=this.THREE; for(let i=0;i<6;i++){ const b=new THREE.Mesh(new THREE.BoxGeometry(0.14,0.1,0.18), new THREE.MeshStandardMaterial({ color:[0xffcf7a,0x58d8ff,0x7edc8b][i%3] })); b.position.set(2.72,0.24 + Math.floor(i/2)*0.18,-this.room.depth/2+0.35+(i%2)*0.18); this.root.add(b);} }
    addRetroConsole(){ const THREE=this.THREE; const c=new THREE.Mesh(new THREE.BoxGeometry(0.38,0.12,0.26), new THREE.MeshStandardMaterial({ color:0xcfcad3 })); c.position.set(2.68,0.98,-this.room.depth/2+0.35); this.root.add(c);} 
    addBookcase(){ const THREE=this.THREE; const shelf=new THREE.Mesh(new THREE.BoxGeometry(0.82,1.42,0.24), new THREE.MeshStandardMaterial({ color:0x2f2c26 })); shelf.position.set(2.78,0.71,-0.9); this.root.add(shelf); this.addObstacle(2.78,-0.9,0.82,0.24,0.1);} 
    addModelSatellite(){ const THREE=this.THREE; const stem=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.18,8), new THREE.MeshStandardMaterial({ color:0xaeb7c4 })); stem.position.set(2.68,1.18,-this.room.depth/2+0.36); this.root.add(stem); const body=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.08,0.08), new THREE.MeshStandardMaterial({ color:0x7ceaff })); body.position.set(2.68,1.28,-this.room.depth/2+0.36); this.root.add(body);} 
    addColdSpares(){ const THREE=this.THREE; const locker=new THREE.Mesh(new THREE.BoxGeometry(0.58,1.05,0.34), new THREE.MeshStandardMaterial({ color:0x25313d })); locker.position.set(2.82,0.52,1.15); this.root.add(locker); this.addObstacle(2.82,1.15,0.58,0.34,0.12);} 

    buildAutoTourPath() {
      const r = this.room;
      const candidates = [
        { x: -r.width / 2 + 1.45, z:  r.depth / 2 - 1.75 },
        { x: -r.width / 2 + 1.65, z:  1.10 },
        { x: -r.width / 2 + 1.85, z: -0.20 },
        { x: -0.85,               z:  r.depth / 2 - 1.95 },
        { x:  0.00,               z:  r.depth / 2 - 2.15 },
        { x:  0.95,               z:  r.depth / 2 - 1.95 },
        { x:  r.width / 2 - 1.85, z:  1.10 },
        { x:  r.width / 2 - 1.65, z: -0.20 },
        { x:  r.width / 2 - 1.45, z:  r.depth / 2 - 1.75 },
        { x: -1.25,               z: -1.15 },
        { x:  0.00,               z: -1.25 },
        { x:  1.25,               z: -1.15 }
      ].filter(point => !this.collides(point.x, point.z));
      this.autoPath = candidates;
      this.autoIndex = -1;
      this.autoTarget = null;
      this.autoPauseUntil = 0;
      this.autoStuckTimer = 0;
      this.autoLastPos = { x: this.player.x, z: this.player.z };
      this.chooseAutoWanderTarget();
    }

    chooseAutoWanderTarget(minDist = 1.1) {
      if (!this.autoPath.length) {
        this.autoTarget = null;
        return;
      }
      const px = this.player.x;
      const pz = this.player.z;
      const viable = this.autoPath.filter(point => Math.hypot(point.x - px, point.z - pz) >= minDist);
      const pool = viable.length ? viable : this.autoPath;
      const choice = pool[Math.floor(Math.random() * pool.length)];
      this.autoTarget = { x: choice.x, z: choice.z };
    }

    collides(x, z) {
      return this.obstacles.some(obs => x > obs.minX && x < obs.maxX && z > obs.minZ && z < obs.maxZ);
    }

    enterArcadeView() {
      const target = this.screenInteractive?.position || this.arcadeAnchor || { x: this.player.x, z: this.player.z, yaw: this.player.yaw };
      this.arcadeView = {
        x: this.player.x,
        y: this.player.y,
        z: this.player.z,
        yaw: this.player.yaw,
        pitch: this.player.pitch,
        bob: this.player.bob,
        walkPhase: this.player.walkPhase
      };
      this.arcadeHold = true;
      document.exitPointerLock?.();
      this.pointerLocked = false;
      const lookYaw = Number.isFinite(target.yaw) ? target.yaw : this.player.yaw;
      // Fit the entire physical CRT at every aspect ratio. A fixed close-up can
      // place a portrait-phone camera inside the cabinet shell and crop its sides.
      const verticalFov = (this.camera?.fov || 66) * Math.PI / 180;
      const aspect = Math.max(0.25, Number(this.camera?.aspect) || 1);
      const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * aspect);
      const screenWidth = Math.max(0.62, Number(this.screenInteractive?.width) || 0.72);
      const screenHeight = Math.max(0.54, Number(this.screenInteractive?.height) || 0.72);
      const widthDistance = screenWidth / Math.max(0.01, 2 * Math.tan(horizontalFov / 2));
      const heightDistance = screenHeight / Math.max(0.01, 2 * Math.tan(verticalFov / 2));
      const zoomDistance = Math.max(0.96, widthDistance, heightDistance) * 1.18;
      // Three's forward vector is (-sin(yaw), 0, -cos(yaw)). Move opposite
      // that direction so the camera sits in front of the CRT and looks at it.
      const zoomX = target.x + Math.sin(lookYaw) * zoomDistance;
      const zoomZ = target.z + Math.cos(lookYaw) * zoomDistance;
      const screenY = Number.isFinite(target.y) ? target.y : this.player.y - 0.1;
      const lookPitch = clamp(Math.atan2(screenY - this.player.y, zoomDistance), -0.48, -0.04);
      // First center the player in the cabinet's standing position. Once that
      // movement finishes, ease from the full cabinet view into the CRT view.
      const standingDistance = Math.max(1.55, zoomDistance + 0.62);
      const standingPose = {
        x: target.x + Math.sin(lookYaw) * standingDistance,
        z: target.z + Math.cos(lookYaw) * standingDistance,
        yaw: lookYaw,
        pitch: clamp(Math.atan2(screenY - this.player.y, standingDistance), -0.34, -0.04)
      };
      this.arcadeTransition = {
        from: { x: this.player.x, z: this.player.z, yaw: this.player.yaw, pitch: this.player.pitch },
        to: standingPose,
        next: { x: zoomX, z: zoomZ, yaw: lookYaw, pitch: lookPitch },
        t: 0,
        duration: 0.42
      };
      this.updateOverlay();
    }

    releaseArcadeView(restorePriorView = false) {
      this.arcadeHold = false;
      const exitTarget = this.screenInteractive?.position || this.arcadeAnchor;
      if (exitTarget) {
        const safeYaw = Number.isFinite(exitTarget.yaw) ? exitTarget.yaw : Math.PI;
        const screenY = Number.isFinite(exitTarget.y) ? exitTarget.y : this.player.y - 0.1;
        const standingDistance = 1.62;
        const destination = {
          x: exitTarget.x + Math.sin(safeYaw) * standingDistance,
          z: exitTarget.z + Math.cos(safeYaw) * standingDistance,
          yaw: safeYaw,
          pitch: clamp(Math.atan2(screenY - this.player.y, standingDistance), -0.34, -0.04)
        };
        this.arcadeTransition = {
          from: { x: this.player.x, z: this.player.z, yaw: this.player.yaw, pitch: this.player.pitch },
          to: destination,
          t: 0,
          duration: 0.52
        };
      } else {
        this.arcadeTransition = null;
      }
      this.arcadeView = null;
      this.updateOverlay();
    }

    getDeskExitPose() {
      const target = this.computerInteractive?.position || { x: 0, z: -this.room.depth / 2 + 1.84 };
      const lookYaw = Number.isFinite(this.computerInteractive?.yaw) ? this.computerInteractive.yaw : 0;
      const candidates = [
        { dist: 1.08, offset: 0 },
        { dist: 1.24, offset: 0 },
        { dist: 1.42, offset: 0 },
        { dist: 1.22, offset: -0.34 },
        { dist: 1.22, offset: 0.34 },
        { dist: 1.62, offset: 0 }
      ];
      for (const candidate of candidates) {
        const baseX = target.x + Math.sin(lookYaw) * candidate.dist;
        const baseZ = target.z + Math.cos(lookYaw) * candidate.dist;
        const sideX = Math.cos(lookYaw) * candidate.offset;
        const sideZ = -Math.sin(lookYaw) * candidate.offset;
        const x = baseX + sideX;
        const z = baseZ + sideZ;
        if (!this.collides(x, z)) {
          return {
            x,
            y: this.player.y || 1.62,
            z,
            yaw: lookYaw,
            pitch: -0.05,
            bob: 0,
            walkPhase: 0
          };
        }
      }
      return {
        x: target.x,
        y: this.player.y || 1.62,
        z: target.z + 1.62,
        yaw: lookYaw,
        pitch: -0.05,
        bob: 0,
        walkPhase: 0
      };
    }

    enterComputerView(options = {}) {
      const target = this.computerInteractive?.position || { x: this.player.x, z: this.player.z };
      const lookYaw = Number.isFinite(this.computerInteractive?.yaw) ? this.computerInteractive.yaw : 0;
      this.computerView = options.exitAtDesk ? this.getDeskExitPose() : {
        x: this.player.x,
        y: this.player.y,
        z: this.player.z,
        yaw: this.player.yaw,
        pitch: this.player.pitch,
        bob: this.player.bob,
        walkPhase: this.player.walkPhase
      };
      this.computerHold = true;
      document.exitPointerLock?.();
      this.pointerLocked = false;
      const zoomDistance = 0.18;
      const zoomX = target.x - Math.sin(lookYaw) * zoomDistance;
      const zoomZ = target.z - Math.cos(lookYaw) * zoomDistance;
      this.computerTransition = {
        from: { x: this.player.x, z: this.player.z, yaw: this.player.yaw, pitch: this.player.pitch },
        to: { x: zoomX, z: zoomZ, yaw: lookYaw, pitch: -0.04 },
        t: 0,
        duration: Number.isFinite(Number(options.duration)) ? Number(options.duration) : 0.52,
        mode: 'enter',
        onComplete: typeof options.onComplete === 'function' ? options.onComplete : null
      };
      this.updateOverlay();
    }

    releaseComputerView(restorePriorView = false, options = {}) {
      const target = this.computerInteractive?.position;
      const chooseSafeDeskExit = () => {
        if (!target) return this.computerView || this.getDeskExitPose();
        const safeYaw = Number.isFinite(this.computerInteractive?.yaw) ? this.computerInteractive.yaw : 0;
        for (const dist of [1.08, 1.24, 1.42, 1.62, 1.9]) {
          const sx = target.x + Math.sin(safeYaw) * dist;
          const sz = target.z + Math.cos(safeYaw) * dist;
          if (!this.collides(sx, sz)) {
            return { x: sx, y: this.player.y || 1.62, z: sz, yaw: safeYaw, pitch: -0.05, bob: 0, walkPhase: 0 };
          }
        }
        return this.getDeskExitPose();
      };
      let destination = restorePriorView && this.computerView ? Object.assign({}, this.computerView) : chooseSafeDeskExit();
      const needsSafeExit = restorePriorView && (!this.computerView || this.collides(destination.x, destination.z) || this.getDeskDistance() < 0.92);
      if (needsSafeExit) destination = chooseSafeDeskExit();
      if (!destination) destination = this.getDeskExitPose();
      this.computerHold = true;
      this.computerTransition = {
        from: { x: this.player.x, z: this.player.z, yaw: this.player.yaw, pitch: this.player.pitch },
        to: { x: destination.x, z: destination.z, yaw: Number.isFinite(destination.yaw) ? destination.yaw : this.player.yaw, pitch: Number.isFinite(destination.pitch) ? destination.pitch : -0.05 },
        t: 0,
        duration: Number.isFinite(Number(options.duration)) ? Number(options.duration) : 0.44,
        mode: 'exit',
        destination,
        onComplete: typeof options.onComplete === 'function' ? options.onComplete : null
      };
      this.updateOverlay();
    }

    getDeskDistance() {
      const target = this.computerInteractive?.position;
      if (!target) return 999;
      return Math.hypot(this.player.x - target.x, this.player.z - target.z);
    }

    getArcadeDistance() {
      const target = this.screenInteractive?.position || this.arcadeAnchor;
      if (!target) return 999;
      return Math.hypot(this.player.x - target.x, this.player.z - target.z);
    }

    update(dt) {
      if (!this.loaded) return;
      if (this.computerTransition) {
        const transition = this.computerTransition;
        transition.t = Math.min(1, transition.t + dt / Math.max(0.001, transition.duration));
        const s = transition.t * transition.t * (3 - 2 * transition.t);
        this.player.x = lerp(transition.from.x, transition.to.x, s);
        this.player.z = lerp(transition.from.z, transition.to.z, s);
        this.player.yaw = lerp(transition.from.yaw, transition.to.yaw, s);
        this.player.pitch = lerp(transition.from.pitch, transition.to.pitch, s);
        this.player.bob = 0;
        if (transition.t >= 1) {
          const done = transition.onComplete;
          if (transition.mode === 'exit') {
            const destination = transition.destination || transition.to || null;
            if (destination) {
              this.player.x = destination.x;
              this.player.y = destination.y || this.player.y || 1.62;
              this.player.z = destination.z;
              this.player.yaw = Number.isFinite(destination.yaw) ? destination.yaw : this.player.yaw;
              this.player.pitch = Number.isFinite(destination.pitch) ? destination.pitch : -0.05;
              this.player.bob = destination.bob || 0;
              this.player.walkPhase = destination.walkPhase || 0;
            }
            this.computerHold = false;
            this.computerView = null;
          }
          this.computerTransition = null;
          this.updateOverlay();
          if (typeof done === 'function') done();
        }
      } else if (this.arcadeTransition) {
        this.arcadeTransition.t = Math.min(1, this.arcadeTransition.t + dt / this.arcadeTransition.duration);
        const s = this.arcadeTransition.t * this.arcadeTransition.t * (3 - 2 * this.arcadeTransition.t);
        this.player.x = lerp(this.arcadeTransition.from.x, this.arcadeTransition.to.x, s);
        this.player.z = lerp(this.arcadeTransition.from.z, this.arcadeTransition.to.z, s);
        this.player.yaw = lerp(this.arcadeTransition.from.yaw, this.arcadeTransition.to.yaw, s);
        this.player.pitch = lerp(this.arcadeTransition.from.pitch, this.arcadeTransition.to.pitch, s);
        this.player.bob = 0;
        if (this.arcadeTransition.t >= 1) {
          const next = this.arcadeTransition.next;
          this.arcadeTransition = next
            ? { from: Object.assign({}, this.arcadeTransition.to), to: next, t: 0, duration: 0.46 }
            : null;
        }
      } else if (this.computerHold || this.arcadeHold) {
        this.player.bob = 0;
      } else if (this.isManualControlActive()) this.updateManual(dt);
      else {
        // No room autopilot: outside pointer lock, the player stays where they left off.
        this.player.bob = lerp(this.player.bob, 0, 0.12);
      }
      this.updateFloorBot(dt);
      this.camera.position.set(this.player.x, this.player.y + this.player.bob, this.player.z);
      this.camera.rotation.set(this.player.pitch, this.player.yaw, 0, 'YXZ');
      const now = performance.now();
      const overlayInterval = this.graphicsProfile?.overlayInterval || 110;
      if (now >= this.nextOverlayUpdateAt) {
        this.nextOverlayUpdateAt = now + overlayInterval;
        this.updateOverlay();
      }
    }

    updateManual(dt) {
      const speed = (this.keys.shift ? 3.6 : 2.35) * dt;
      let strafe = 0;
      let forward = 0;
      if (this.keys.w || this.keys.arrowup) forward += 1;
      if (this.keys.s || this.keys.arrowdown) forward -= 1;
      if (this.keys.a || this.keys.arrowleft) strafe -= 1;
      if (this.keys.d || this.keys.arrowright) strafe += 1;
      if (this.mobileControls.active) {
        strafe += this.mobileControls.strafe;
        forward += this.mobileControls.forward;
      }
      const length = Math.hypot(strafe, forward) || 1;
      strafe /= length;
      forward /= length;
      if (strafe || forward) {
        const dir = this._movementDirection || (this._movementDirection = new this.THREE.Vector3());
        const right = this._movementRight || (this._movementRight = new this.THREE.Vector3());
        const worldUp = this._worldUp || (this._worldUp = new this.THREE.Vector3(0, 1, 0));
        this.camera.getWorldDirection(dir);
        dir.y = 0;
        dir.normalize();
        right.crossVectors(dir, worldUp).normalize();
        const dx = (dir.x * forward + right.x * strafe) * speed;
        const dz = (dir.z * forward + right.z * strafe) * speed;
        this.tryMove(dx, dz);
        this.player.walkPhase += dt * 10;
        this.player.bob = Math.sin(this.player.walkPhase) * 0.03;
        this.updateFootstepAudio(true, !!this.keys.shift, dt);
      } else {
        this.player.bob = lerp(this.player.bob, 0, 0.12);
        this.updateFootstepAudio(false, false, dt);
      }
    }

    tryMove(dx, dz) {
      const r = this.room;
      const nx = clamp(this.player.x + dx, -r.width / 2 + 0.48, r.width / 2 - 0.48);
      const nz = clamp(this.player.z + dz, -r.depth / 2 + 0.48, r.depth / 2 - 0.48);
      if (!this.collides(nx, this.player.z)) this.player.x = nx;
      if (!this.collides(this.player.x, nz)) this.player.z = nz;
    }

    updateAuto(dt) {
      if (!this.autoPath.length) return;
      const now = performance.now() / 1000;
      if (!this.autoTarget) this.chooseAutoWanderTarget();
      const target = this.autoTarget;
      if (!target) return;

      const dx = target.x - this.player.x;
      const dz = target.z - this.player.z;
      const dist = Math.hypot(dx, dz);
      const progress = Math.hypot(this.player.x - (this.autoLastPos?.x ?? this.player.x), this.player.z - (this.autoLastPos?.z ?? this.player.z));
      this.autoLastPos = { x: this.player.x, z: this.player.z };

      if (dist < 0.14) {
        this.player.x = target.x;
        this.player.z = target.z;
        this.autoPauseUntil = 0;
        this.autoStuckTimer = 0;
        this.chooseAutoWanderTarget(1.35);
      } else {
        // Auto-tour must use the same facing convention as the camera/manual controls.
        // In this scene, camera forward on yaw=0 is negative Z, so desired yaw must point
        // the camera's actual forward vector (-sin(yaw), -cos(yaw)) toward the target.
        const desiredYaw = Math.atan2(this.player.x - target.x, this.player.z - target.z);
        let yawDelta = desiredYaw - this.player.yaw;
        while (yawDelta > Math.PI) yawDelta -= Math.PI * 2;
        while (yawDelta < -Math.PI) yawDelta += Math.PI * 2;

        const autoMoveRate = 0.68;
        const turnRate = autoMoveRate * dt;
        const turnStep = Math.max(-turnRate, Math.min(turnRate, yawDelta));
        this.player.yaw += turnStep;

        // Recompute after turning so the movement gate uses the fresh facing, not the stale one.
        let postTurnDelta = desiredYaw - this.player.yaw;
        while (postTurnDelta > Math.PI) postTurnDelta -= Math.PI * 2;
        while (postTurnDelta < -Math.PI) postTurnDelta += Math.PI * 2;

        const facingThreshold = 0.26;
        if (Math.abs(postTurnDelta) < facingThreshold) {
          const speed = autoMoveRate * dt;
          const step = Math.min(speed, dist);
          const forwardX = -Math.sin(this.player.yaw) * step;
          const forwardZ = -Math.cos(this.player.yaw) * step;
          this.tryMove(forwardX, forwardZ);
          this.player.walkPhase += dt * 8.5;
          this.player.bob = Math.sin(this.player.walkPhase) * 0.01;
        } else {
          this.player.bob = lerp(this.player.bob, 0, 0.15);
        }

        if (progress < 0.0008) this.autoStuckTimer += dt;
        else this.autoStuckTimer = 0;
        if (this.autoStuckTimer > 0.45) {
          this.autoStuckTimer = 0;
          this.chooseAutoWanderTarget(0.9);
        }
      }
      this.player.pitch = lerp(this.player.pitch, -0.06, 0.04);
    }

    getFloorBotPatrolPoints() {
      const r = this.room;
      return [
        { x:  r.width / 2 - 1.60, z:  r.depth / 2 - 1.90 },
        { x:  r.width / 2 - 1.95, z:  0.95 },
        { x:  0.95,               z:  0.30 },
        { x:  0.00,               z: -0.35 },
        { x: -0.95,               z: -0.95 },
        { x: -r.width / 2 + 1.80, z: -0.35 },
        { x: -0.60,               z:  1.10 },
        { x:  r.width / 2 - 1.35, z:  0.35 }
      ];
    }

    updateFloorBot(dt) {
      if (!this.floorBot.active) return;
      const THREE = this.THREE;
      const bot = this.floorBot;
      const patrolPoints = bot.patrolPoints || (bot.patrolPoints = this.getFloorBotPatrolPoints().filter(point => !this.collides(point.x, point.z)));
      if (!patrolPoints.length) return;
      if (!this.floorBot.mesh) {
        const bot = new THREE.Group();
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.27, 0.10, 20), new THREE.MeshStandardMaterial({ color: 0xe7eef6, roughness: 0.82 }));
        base.position.y = 0.05;
        bot.add(base);
        const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.04, 20), new THREE.MeshStandardMaterial({ color: 0x202a34, roughness: 0.88 }));
        skirt.position.y = 0.02;
        bot.add(skirt);
        const dome = new THREE.Mesh(new THREE.SphereGeometry(0.15, 18, 18), new THREE.MeshStandardMaterial({ color: 0x9ff8ff, transparent: true, opacity: 0.58, emissive: 0x58d8ff, emissiveIntensity: 0.30 }));
        dome.position.y = 0.18;
        bot.add(dome);
        const eye = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.04, 0.01), new THREE.MeshStandardMaterial({ color: 0x081117, emissive: 0x6ef4ff, emissiveIntensity: 0.65 }));
        eye.position.set(0, 0.17, -0.17);
        bot.add(eye);
        const wheelL = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 12), new THREE.MeshStandardMaterial({ color: 0x151a20, roughness: 0.9 }));
        wheelL.rotation.z = Math.PI / 2;
        wheelL.position.set(-0.18, 0.05, 0.03);
        bot.add(wheelL);
        const wheelR = wheelL.clone();
        wheelR.position.x = 0.18;
        bot.add(wheelR);
        this.floorBot.mesh = bot;
        this.root.add(bot);
        this.floorBot.mesh.position.set(this.floorBot.x, 0, this.floorBot.z);
        this.registerSelectableDecor(bot, { id: 'floor-bot', zone: 'floor', placement: this.getFloorBotDockPlacement() });
        if (!this.floorBot.hasAnnouncedOnline) {
          this.floorBot.hasAnnouncedOnline = true;
          this.speakBotLine('__personality_online__');
          this.floorBot.lastLineAt = performance.now();
        }
      }

      const now = performance.now();
      const moveToward = (tx, tz, speedScale = 1) => {
        const dx = tx - bot.x;
        const dz = tz - bot.z;
        const dist = Math.hypot(dx, dz);
        if (dist <= 0.08) {
          bot.x = tx;
          bot.z = tz;
          bot.mesh.position.set(bot.x, 0, bot.z);
          return true;
        }
        const step = Math.min(dist, bot.speed * speedScale * dt);
        const nx = bot.x + (dx / dist) * step;
        const nz = bot.z + (dz / dist) * step;
        if (!this.collides(nx, nz)) {
          bot.x = nx;
          bot.z = nz;
        }
        bot.mesh.position.set(bot.x, 0, bot.z);
        bot.mesh.rotation.y = Math.atan2(dx, dz);
        return false;
      };

      if (bot.state === 'charging') {
        if (this.moveMode) this.dockFloorBotForMoveMode();
        bot.x = bot.homeX;
        bot.z = bot.homeZ;
        bot.mesh.position.set(bot.x, 0, bot.z);
        const dockWorld = this.getFloorBotDockWorld();
        bot.mesh.rotation.y = Number.isFinite(Number(dockWorld.rotationY)) ? Number(dockWorld.rotationY) : 0;
        if (!this.moveMode && now >= (bot.chargeUntil || 0)) {
          bot.state = 'patrol';
          bot.routeIndex = 0;
          bot.dwellUntil = now + 350;
          bot.patrolStartedAt = now;
          bot.hasAnnouncedResume = false;
        }
        if (!bot.hasAnnouncedResume && now >= (bot.chargeUntil || 0) - 250) {
          this.speakBotLine('__personality_resume__');
          bot.hasAnnouncedResume = true;
          bot.lastLineAt = now;
        }
        return;
      }

      if (bot.state === 'return') {
        const docked = moveToward(bot.homeX, bot.homeZ, 1.1);
        if (docked) {
          bot.state = 'charging';
          bot.chargeUntil = now + 60000;
          bot.hasAnnouncedResume = false;
        }
        return;
      }

      if (!bot.patrolStartedAt) bot.patrolStartedAt = now;
      if (now - bot.patrolStartedAt >= 300000) {
        bot.state = 'return';
        this.speakBotLine('__personality_charge__');
        bot.lastLineAt = now;
        return;
      }

      const waypoint = patrolPoints[bot.routeIndex % patrolPoints.length];
      if (bot.dwellUntil && now < bot.dwellUntil) {
        bot.mesh.position.set(bot.x, 0, bot.z);
        return;
      }
      const arrived = moveToward(waypoint.x, waypoint.z, 1.0);
      if (arrived) {
        bot.routeIndex = (bot.routeIndex + 1) % patrolPoints.length;
        bot.loopCount += 1;
        bot.dwellUntil = now + 800;
        if (bot.loopCount % patrolPoints.length === 0) {
          this.speakBotLine('__personality_loop__');
          bot.lastLineAt = now;
        }
        return;
      }
      const chatterInterval = Math.max(12000, 44000 / Math.max(0.25, Number((this.state.floorBotProfile || {}).speechFrequency || 1)));
      if (!bot.lastLineAt || now - bot.lastLineAt > chatterInterval) {
        bot.lastLineAt = now;
        const lines = [
          '{name} is sweeping the perimeter.',
          '{name} reports uptime is acceptable.',
          '{name} is conducting a highly scientific patrol.',
          '{name} is definitely not joyriding.'
        ];
        this.speakBotLine('__personality_patrol__');
      }
    }

    renderDynamicDisplays(t) {
      if (!this.dynamicDisplays.length) return;
      const minimumInterval = this.graphicsProfile?.displayInterval || 0.24;
      this.dynamicDisplays.forEach(display => {
        if (display.nextFrameAt && t < display.nextFrameAt) return;
        const displayInterval = display.type === 'arcade' && this.arcadeScreenRenderer
          ? (display.interval || 0.066)
          : Math.max(display.interval || 0.12, minimumInterval);
        display.nextFrameAt = t + displayInterval;
        if (display.type === 'monitor') {
          const { ctx, canvas, texture, color, seed, mode, screen, index } = display;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#081118';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          const tt = t * 1.4 + seed;
          const palettes = [
            ['#6ef4a1','#173b2b','#9df7cf'],
            ['#58d8ff','#0e3142','#9cecff'],
            ['#ffcf7a','#4b3211','#ffe2ad'],
            ['#c1a2ff','#2d1d4d','#e2d3ff'],
            ['#ff9bd4','#4d1733','#ffd3ec'],
            ['#9ff2a2','#183f1d','#d8ffdc']
          ];
          const [main, dark, accent] = palettes[mode % palettes.length];
          if (mode === 0) {
            ctx.fillStyle = dark; ctx.fillRect(14, 16, 228, 24);
            for (let i=0;i<18;i++){ const h=18+Math.abs(Math.sin(tt+i*0.35))*60; ctx.fillStyle=main; ctx.fillRect(18+i*12, 126-h, 7, h); }
            ctx.fillStyle = accent; ctx.font = '700 14px Arial'; ctx.fillText('LOAD / THROUGHPUT', 18, 32);
          } else if (mode === 1) {
            ctx.strokeStyle = 'rgba(255,255,255,0.12)';
            for (let x=18;x<238;x+=22){ctx.beginPath();ctx.moveTo(x,18);ctx.lineTo(x,144);ctx.stroke();}
            ctx.beginPath(); ctx.strokeStyle = main; ctx.lineWidth = 3;
            for (let x=18;x<238;x+=6){ const y=84 + Math.sin(tt*1.8 + x*0.05)*28 + Math.cos(tt*0.8 + x*0.09)*10; if (x===18) ctx.moveTo(x,y); else ctx.lineTo(x,y);} ctx.stroke();
            ctx.fillStyle = accent; ctx.font='700 14px Arial'; ctx.fillText('LATENCY TRACE',18,32);
          } else if (mode === 2) {
            ctx.fillStyle = dark; ctx.fillRect(16, 18, 224, 120);
            for (let i=0;i<9;i++){ const w=100+Math.sin(tt+i)*90; ctx.fillStyle=i%2?main:accent; ctx.fillRect(24, 34+i*11, Math.max(16,w), 7);} ctx.fillStyle='#fff'; ctx.font='700 14px Arial'; ctx.fillText('TASK QUEUE',18,32);
          } else if (mode === 3) {
            ctx.fillStyle = dark; ctx.fillRect(16, 18, 224, 120);
            for (let y=0;y<5;y++){ for (let x=0;x<7;x++){ const glow = (Math.sin(tt*2 + x*0.8 + y)+1)/2; ctx.fillStyle = glow>0.55?main:accent; ctx.fillRect(24+x*28, 36+y*18, 18, 12); }}
            ctx.fillStyle = '#fff'; ctx.font='700 14px Arial'; ctx.fillText('NODE MAP',18,32);
          } else if (mode === 4) {
            ctx.fillStyle = dark; ctx.fillRect(16, 18, 224, 120);
            ctx.fillStyle = accent; ctx.font='700 14px Arial'; ctx.fillText('LOG STREAM',18,32);
            ctx.font='600 11px monospace';
            for (let i=0;i<7;i++){ ctx.fillStyle = i%2?main:accent; ctx.fillText(`[${(10+i).toString().padStart(2,'0')}:0${i}] service-${(index+i)%5} ok`, 22, 50+i*13); }
          } else {
            ctx.fillStyle = dark; ctx.fillRect(16, 18, 224, 120);
            for (let i=0;i<12;i++){ const x=24+i*17; const h=18+((Math.sin(tt*1.7+i*0.6)+1)*0.5)*70; ctx.fillStyle=i%3===0?main:accent; ctx.fillRect(x, 128-h, 12, h); }
            ctx.fillStyle = '#fff'; ctx.font='700 14px Arial'; ctx.fillText('POWER / THERMALS',18,32);
          }
          if (screen && screen.material) screen.material.emissiveIntensity = 0.34 + Math.abs(Math.sin(tt*1.3))*0.08;
          texture.needsUpdate = true;
          return;
        }
        if (display.type === 'arcade') {
          const { ctx, canvas, texture, screen } = display;
          if (this.arcadeScreenRenderer) {
            try {
              this.arcadeScreenRenderer(ctx, canvas.width, canvas.height, t);
              if (screen?.material?.emissive) screen.material.emissiveIntensity = 0.62 + Math.abs(Math.sin(t * 2.2)) * 0.10;
              texture.needsUpdate = true;
              return;
            } catch (error) {
              console.warn('Arcade screen renderer failed; restoring attract display.', error);
              this.arcadeScreenRenderer = null;
            }
          }
          const state = this.arcadeScreenState || { mode: 'attract', title: 'UPTIME ARCADE' };
          const now = t * 1.45;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#02050a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.strokeStyle = '#45f7ff';
          ctx.lineWidth = 7;
          ctx.strokeRect(13, 13, canvas.width - 26, canvas.height - 26);
          ctx.strokeStyle = 'rgba(255,79,216,0.66)';
          ctx.lineWidth = 2;
          ctx.strokeRect(23, 23, canvas.width - 46, canvas.height - 46);
          ctx.fillStyle = 'rgba(69,247,255,0.17)';
          for (let y = 46; y < canvas.height - 30; y += 22) ctx.fillRect(30, y, canvas.width - 60, 1);
          ctx.textBaseline = 'middle';
          ctx.textAlign = 'left';
          ctx.fillStyle = '#57f4ff';
          ctx.font = '900 38px monospace';
          ctx.fillText('UPTIME ARCADE', 46, 62);
          const activeTitle = String(state.title || 'UPTIME ARCADE').toUpperCase();
          if (state.mode === 'game' || state.mode === 'paused') {
            ctx.fillStyle = state.mode === 'paused' ? '#ffd34d' : '#7dff68';
            ctx.font = '800 17px monospace';
            ctx.fillText(state.mode === 'paused' ? 'SESSION PAUSED' : 'NOW PLAYING', 48, 110);
            ctx.fillStyle = '#f7fbff';
            ctx.font = '900 27px monospace';
            ctx.fillText(activeTitle.slice(0, 22), 48, 150);
            ctx.fillStyle = '#ff4fd8';
            ctx.font = '800 15px monospace';
            ctx.fillText(state.mode === 'paused' ? 'PRESS E TO RESUME' : 'CRT LINK ACTIVE', 48, 206);
          } else {
            const games = ['BOMBMOPPER', 'STACK OVERFLOW', 'CIRCUIT BREAKER', 'CTRL+ALT+DEFEAT', 'MORTAL KONFIG'];
            const selected = Math.floor(now * 0.55) % games.length;
            games.forEach((game, index) => {
              const y = 116 + index * 40;
              ctx.fillStyle = index === selected ? '#ff4fd8' : '#a8eaff';
              ctx.font = index === selected ? '900 19px monospace' : '700 16px monospace';
              ctx.fillText(`${index === selected ? '>' : ' '} ${game}`, 48, y);
            });
            ctx.fillStyle = '#ffd34d';
            ctx.font = '900 17px monospace';
            ctx.fillText('PRESS E TO PLAY', 48, 338);
          }
          ctx.fillStyle = 'rgba(255,255,255,0.08)';
          ctx.fillRect(28, 0, 4, canvas.height);
          ctx.fillRect(canvas.width - 32, 0, 4, canvas.height);
          if (screen?.material?.emissive) screen.material.emissiveIntensity = 0.54 + Math.abs(Math.sin(now * 1.4)) * 0.16;
          texture.needsUpdate = true;
          return;
        }
        if (display.type !== 'noc') return;
        const { ctx, canvas, texture, title, seed, screen } = display;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const bg = ctx.createLinearGradient(0,0,canvas.width,canvas.height);
        bg.addColorStop(0,'#081118'); bg.addColorStop(1,'#101727');
        ctx.fillStyle = bg; ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.strokeStyle = '#66e0ff'; ctx.lineWidth = 5; ctx.strokeRect(10,10,canvas.width-20,canvas.height-20);
        const gridA = 26;
        ctx.strokeStyle = 'rgba(102,224,255,0.12)'; ctx.lineWidth = 1;
        for (let gx = 24; gx < canvas.width - 24; gx += gridA) { ctx.beginPath(); ctx.moveTo(gx, 74); ctx.lineTo(gx, canvas.height - 28); ctx.stroke(); }
        for (let gy = 74; gy < canvas.height - 28; gy += gridA) { ctx.beginPath(); ctx.moveTo(24, gy); ctx.lineTo(canvas.width - 24, gy); ctx.stroke(); }
        ctx.textAlign='left'; ctx.textBaseline='middle'; ctx.shadowColor='rgba(104,216,255,0.35)'; ctx.shadowBlur=12;
        ctx.fillStyle='#7fffd1'; ctx.font='800 58px Arial'; ctx.fillText(title,34,50);
        ctx.fillStyle='#8fd4ff'; ctx.font='700 28px Arial'; ctx.fillText('REGION STATUS // INCIDENT GRID',34,94);
        const time = t*1.65 + seed;
        const barColors=['rgba(127,255,209,0.85)','rgba(143,212,255,0.80)','rgba(255,208,122,0.80)','rgba(255,155,212,0.78)','rgba(193,162,255,0.78)','rgba(255,120,120,0.76)'];
        for (let i=0;i<6;i++){ const y=150+i*42; const w=130+Math.floor((0.5+0.5*Math.sin(time+i*0.8))*240); ctx.fillStyle=barColors[i%barColors.length]; ctx.fillRect(38,y,w,16); ctx.fillStyle='rgba(255,255,255,0.18)'; ctx.fillRect(38,y+18,320,3);} 
        const dotColors=['#68d8ff','#7fffd1','#ffcf7a','#ff9bd4','#c1a2ff','#ff6f91'];
        for (let i=0;i<22;i++){ const px=430+((i*31+Math.sin(time*0.7+i)*18)%520); const py=128+((i*19+Math.cos(time*0.9+i*0.7)*24)%300); ctx.fillStyle=dotColors[i%dotColors.length]; ctx.globalAlpha=0.45+0.5*Math.abs(Math.sin(time*1.4+i)); ctx.fillRect(px,py,10,10); ctx.globalAlpha=1; }
        for (let i=0;i<4;i++){ ctx.fillStyle=barColors[(i+2)%barColors.length]; ctx.fillRect(742,152+i*52, 100 + Math.sin(time+i)*80, 10); }
        ctx.fillStyle='rgba(255,255,255,0.82)'; ctx.font='600 18px Arial'; ctx.fillText(`Live refresh ${Math.floor(t*10)%10}`,816,94);
        const scanY=118+((t*110)%330); ctx.fillStyle='rgba(127,255,209,0.14)'; ctx.fillRect(24,scanY,canvas.width-48,10);
        if (screen && screen.material) screen.material.emissiveIntensity = 0.42 + Math.abs(Math.sin(time*1.2))*0.12;
        texture.needsUpdate=true;
      });
    }

    animateLavaLamps(t) {
      if (!this.animatedLavaLamps.length) return;
      this.animatedLavaLamps = this.animatedLavaLamps.filter(entry => entry && entry.group && entry.group.parent);
      this.animatedLavaLamps.forEach((entry, lampIndex) => {
        const pulse = 0.82 + Math.abs(Math.sin(t * 1.6 + lampIndex * 0.9)) * 0.28;
        if (entry.glass && entry.glass.material) {
          const glassMultiplier = entry.kind === 'uploadedModelContained' ? 0.62 : 1;
          entry.glass.material.emissiveIntensity = entry.glowIntensity * glassMultiplier * pulse;
        }
        if (entry.kind === 'uploadedModelContained') {
          const range = Math.max(0.001, entry.glassMaxY - entry.glassMinY);
          (entry.blobs || []).forEach((blob, blobIndex) => {
            if (!blob.mesh) return;
            const tt = t * blob.speed + blob.phase + lampIndex * 0.37;
            const baseY = blob.minY + range * blob.yBase;
            const y = Math.max(
              blob.minY + blob.radius * 1.2,
              Math.min(blob.maxY - blob.radius * 1.4, baseY + Math.sin(tt) * blob.yAmp)
            );
            const lateralLimit = Math.max(0.04, blob.radiusLimit - blob.radius * 0.72);
            const x = Math.sin(tt * 1.45 + blobIndex * 0.6) * Math.min(blob.xAmp, lateralLimit);
            const z = Math.cos(tt * 1.18 + blobIndex * 0.9) * Math.min(blob.zAmp, lateralLimit);
            const squash = 1 + Math.sin(tt * 2.0) * 0.08;
            blob.mesh.position.set(x, y, z);
            blob.mesh.scale.set(
              squash,
              blob.stretch + Math.cos(tt * 1.75) * 0.16,
              1 / Math.max(0.84, squash)
            );
            if (blob.mesh.material) blob.mesh.material.emissiveIntensity = 0.36 + Math.abs(Math.sin(tt * 2.25)) * 0.22;
          });
          if (entry.bottomGlow && entry.bottomGlow.material) {
            entry.bottomGlow.material.emissiveIntensity = 0.62 + Math.abs(Math.sin(t * 1.9 + lampIndex)) * 0.24;
            entry.bottomGlow.material.opacity = 0.16 + Math.abs(Math.sin(t * 1.4 + lampIndex)) * 0.08;
          }
          if (entry.light) {
            entry.light.intensity = 0.46 + Math.abs(Math.sin(t * 1.7 + lampIndex)) * 0.20;
            entry.light.position.y = entry.glassMinY + 0.14 + Math.sin(t * 0.9 + lampIndex) * 0.03;
          }
          return;
        }
        if (entry.innerGlow && entry.innerGlow.material) entry.innerGlow.material.emissiveIntensity = entry.glowIntensity * 0.9 * pulse;
        if (entry.light) {
          entry.light.intensity = 0.30 + Math.abs(Math.sin(t * 1.8 + lampIndex)) * 0.18;
          entry.light.position.y = 0.24 * (entry.scale || 1) + Math.sin(t * 0.95 + lampIndex) * 0.02;
        }
        (entry.blobs || []).forEach((blob, blobIndex) => {
          if (!blob.mesh) return;
          const tt = t * blob.speed + blob.phase + lampIndex * 0.37;
          const rise = Math.sin(tt);
          const y = 0.205 + rise * blob.amp;
          const x = Math.sin(tt * 1.7 + blobIndex * 0.8) * blob.sway;
          const z = Math.cos(tt * 1.4 + blobIndex * 0.65) * (blob.sway * 0.65);
          const squash = 1 + Math.sin(tt * 2.1) * 0.10;
          blob.mesh.position.set(x * (entry.scale || 1), y * (entry.scale || 1), z * (entry.scale || 1));
          blob.mesh.scale.set(squash, blob.stretch + Math.cos(tt * 1.8) * 0.18, 1 / Math.max(0.72, squash));
          if (blob.mesh.material) blob.mesh.material.emissiveIntensity = 0.32 + Math.abs(Math.sin(tt * 2.4)) * 0.22;
        });
      });
    }

    loop(time) {
      if (this.destroyed || !this.loaded) return;
      if (this.lastRenderAt && time - this.lastRenderAt < this.getRenderFrameInterval()) {
        requestAnimationFrame(this._boundLoop);
        return;
      }
      const startedAt = performance.now();
      const dt = Math.min(0.1, (time - this.lastTime) / 1000 || 0.016);
      this.lastTime = time;
      this.lastRenderAt = time;
      this.update(dt);
      this.animateScene(time / 1000);
      this.renderer.render(this.scene, this.camera);
      this.recordRenderCost(performance.now() - startedAt);
      requestAnimationFrame(this._boundLoop);
    }

    rebuildAnimatedSceneObjectCache() {
      this.animatedSceneObjects = [];
      this.root.traverse(obj => {
        if (obj.userData && (obj.userData.spin || obj.userData.blink)) {
          this.animatedSceneObjects.push(obj);
        }
      });
      this.animationObjectCacheDirty = false;
    }

    animateScene(t) {
      this.renderDynamicDisplays(t);
      this.animateLavaLamps(t);
      if (this.animationObjectCacheDirty) this.rebuildAnimatedSceneObjectCache();
      this.animatedSceneObjects.forEach(obj => {
        if (!obj || !obj.parent || !obj.userData) return;
        if (obj.userData.spin) obj.rotation.y += obj.userData.spin * 0.01;
        if (obj.userData.blink && obj.material) {
          const speed = obj.userData.blink;
          const base = Number.isFinite(obj.userData.blinkBase) ? obj.userData.blinkBase : 0.25;
          const range = Number.isFinite(obj.userData.blinkRange) ? obj.userData.blinkRange : 0.9;
          const power = Number.isFinite(obj.userData.blinkPower) ? obj.userData.blinkPower : 1.0;
          const pulse = Math.pow(Math.abs(Math.sin(t * speed)), power);
          obj.material.emissiveIntensity = base + pulse * range;
        }
      });
    }
  }

  window.UptimeOffice3D = Office3DScene;
})();
