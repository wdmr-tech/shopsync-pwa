export const triggerHaptic = (pattern = 30) => {
  // Leemos la configuración (por defecto activado)
  const hapticEnabled = localStorage.getItem('haptic_enabled') !== 'false';
  if (hapticEnabled && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};
