let toastHandler: ((message: string, type?: 'success' | 'error' | 'info' | 'warning', duration?: number) => void) | null = null;

export const setToastHandler = (handler: typeof toastHandler) => {
  toastHandler = handler;
};

export const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 3000) => {
  if (toastHandler) {
    toastHandler(message, type, duration);
  } else {
    // Fallback to console if toast system not initialized
    console.log(`[${type.toUpperCase()}] ${message}`);
  }
};


