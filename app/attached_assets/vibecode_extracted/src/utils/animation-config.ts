// Animation configuration and feature flags
export const ANIMATION_CONFIG = {
  // Set to false to disable all animations as fallback
  ENABLE_ANIMATIONS: true,
  
  // Animation durations
  DEFAULT_DURATION: 1000,
  FAST_DURATION: 500,
  SLOW_DURATION: 1500,
  
  // Animation delays
  DEFAULT_DELAY: 0,
  STAGGER_DELAY: 100,
  
  // Performance settings
  REDUCE_MOTION_FALLBACK: true,
};

export const isAnimationEnabled = (): boolean => {
  return ANIMATION_CONFIG.ENABLE_ANIMATIONS;
};

export const getAnimationDuration = (type: 'fast' | 'default' | 'slow' = 'default'): number => {
  if (!isAnimationEnabled()) return 0;
  
  switch (type) {
    case 'fast': return ANIMATION_CONFIG.FAST_DURATION;
    case 'slow': return ANIMATION_CONFIG.SLOW_DURATION;
    default: return ANIMATION_CONFIG.DEFAULT_DURATION;
  }
};