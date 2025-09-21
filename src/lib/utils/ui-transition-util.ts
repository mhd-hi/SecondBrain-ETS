export type TransitionDirection = 'left' | 'right' | null;

export type TransitionState = {
  isTransitioning: boolean;
  direction: TransitionDirection;
};

export const createTransitionState = (): TransitionState => ({
  isTransitioning: false,
  direction: null,
});

export const getTransitionDirection = (action: 'prev' | 'next'): TransitionDirection => {
  return action === 'prev' ? 'right' : 'left';
};

export const getTransitionDirectionFromOffset = (currentOffset: number, targetOffset: number): TransitionDirection => {
  if (currentOffset === targetOffset) {
    return null;
  }
  return currentOffset > targetOffset ? 'right' : 'left';
};

export const getTransitionClasses = (transitionState: TransitionState): string => {
  if (!transitionState.isTransitioning) {
    return 'opacity-100 translate-x-0';
  }

  // Only animate the exit direction, not the return
  switch (transitionState.direction) {
    case 'left':
      return 'opacity-70 -translate-x-2';
    case 'right':
      return 'opacity-70 translate-x-2';
    default:
      return 'opacity-70 translate-x-0';
  }
};

export const resetTransitionState = (): TransitionState => ({
  isTransitioning: false,
  direction: null,
});
