const listeners = new Set();

const emit = (payload) => {
  listeners.forEach((listener) => {
    try {
      listener(payload);
    } catch (err) {
      // Never let UI listeners crash the notifier path.
      console.warn('Notifier listener failed:', err?.message || err);
    }
  });
};

export const notify = ({ type = 'info', title = 'Notice', message = '' } = {}) => {
  emit({ type, title, message, id: `${Date.now()}-${Math.random().toString(16).slice(2)}` });
};

export const notifySuccess = (title, message = '') => notify({ type: 'success', title, message });
export const notifyError = (title, message = '') => notify({ type: 'error', title, message });
export const notifyInfo = (title, message = '') => notify({ type: 'info', title, message });

export const subscribeNotifier = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
