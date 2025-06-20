/**
 * Scrollbar utility functions for Fortune 500 level UI
 */

export const scrollbarClasses = {
  premium: 'premium-scroll',
  main: 'main-content',
  dashboard: 'dashboard-content',
  content: 'content-container',
  card: 'card-scroll',
  modal: 'modal-scroll',
  dialog: 'dialog-scroll',
  sheet: 'sheet-scroll',
} as const;

export type ScrollbarType = keyof typeof scrollbarClasses;

/**
 * Get the appropriate scrollbar class for a component
 */
export function getScrollbarClass(type: ScrollbarType): string {
  return scrollbarClasses[type];
}

/**
 * Apply premium scrollbar styling to an element
 */
export function applyPremiumScrollbar(element: HTMLElement, type: ScrollbarType = 'premium'): void {
  if (element) {
    element.classList.add(getScrollbarClass(type));
  }
}

/**
 * Smooth scroll to element with premium animation
 */
export function smoothScrollToElement(
  element: HTMLElement | string,
  options: ScrollIntoViewOptions = {}
): void {
  const targetElement = typeof element === 'string' 
    ? document.querySelector(element) as HTMLElement
    : element;
    
  if (targetElement) {
    targetElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
      ...options
    });
  }
}

/**
 * Create scroll shadows for containers
 */
export function createScrollShadows(container: HTMLElement): void {
  const topShadow = document.createElement('div');
  const bottomShadow = document.createElement('div');
  
  topShadow.className = 'scroll-shadow-top';
  bottomShadow.className = 'scroll-shadow-bottom';
  
  container.prepend(topShadow);
  container.append(bottomShadow);
}

/**
 * Initialize premium scrollbar for a container
 */
export function initializePremiumScrollbar(
  container: HTMLElement,
  type: ScrollbarType = 'premium',
  withShadows: boolean = false
): void {
  applyPremiumScrollbar(container, type);
  
  if (withShadows) {
    createScrollShadows(container);
  }
  
  // Add smooth scrolling behavior
  container.style.scrollBehavior = 'smooth';
}