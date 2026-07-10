window.UptimeEmpireSave = {
  save(state) {
    try {
      localStorage.setItem(window.UptimeEmpireData.STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (err) {
      console.error('Save failed', err);
      return false;
    }
  },

  load() {
    try {
      const raw = localStorage.getItem(window.UptimeEmpireData.STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      console.error('Load failed', err);
      return null;
    }
  },

  export(state) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(state))));
  },

  import(encoded) {
    try {
      return JSON.parse(decodeURIComponent(escape(atob(encoded.trim()))));
    } catch (err) {
      console.error('Import failed', err);
      return null;
    }
  },

  clear() {
    try {
      localStorage.removeItem(window.UptimeEmpireData.STORAGE_KEY);
      return true;
    } catch (err) {
      console.error('Clear failed', err);
      return false;
    }
  }
};
