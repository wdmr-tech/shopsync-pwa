export const triggerHaptic = (pattern = 30) => {
  try {
    // 1. Verificamos si el entorno es el navegador
    if (typeof window === 'undefined' || !window.navigator || !window.navigator.vibrate) {
      return; 
    }

    // 2. Leemos la configuración de forma segura
    const storedValue = localStorage.getItem('haptic_enabled');
    
    // Si NO existe el valor (primera vez), asumimos true. 
    // Solo si el valor es explícitamente "false", lo apagamos.
    const hapticEnabled = storedValue === null ? true : storedValue !== 'false';

    if (hapticEnabled) {
      // Forzamos el patrón a ser un número o array para máxima compatibilidad
      window.navigator.vibrate(pattern);
    }
  } catch (error) {
    console.warn("Haptics not supported or blocked by browser.", error);
  }
};
