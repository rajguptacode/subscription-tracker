const STORAGE_KEY = 'subscribers';

const Storage = {
  load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  },

  save(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  },

  add(subscriber) {
    const list = this.load();
    list.push(subscriber);
    this.save(list);
    return list;
  },

  remove(id) {
    const list = this.load().filter(s => s.id !== id);
    this.save(list);
    return list;
  },

  update(id, updates) {
    const list = this.load().map(s => {
      if (s.id === id) return { ...s, ...updates };
      return s;
    });
    this.save(list);
    return list;
  },

  togglePaymentStatus(id) {
    const list = this.load().map(s => {
      if (s.id === id) {
        return {
          ...s,
          payment_status: s.payment_status === 'received' ? 'pending' : 'received'
        };
      }
      return s;
    });
    this.save(list);
    return list;
  },

  exportData() {
    const list = this.load();
    const blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!Array.isArray(data)) throw new Error('Invalid data format');
      this.save(data);
      return { success: true, count: data.length };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY);
  }
};
