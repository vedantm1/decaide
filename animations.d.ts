// Global animation library type declarations

declare global {
  interface Window {
    AOS: {
      init: (options?: {
        duration?: number;
        once?: boolean;
        offset?: number;
        easing?: string;
      }) => void;
      refresh: () => void;
    };
    
    gsap: {
      registerPlugin: (plugin: any) => void;
      fromTo: (target: any, from: any, to: any) => void;
      from: (target: any, options: any) => void;
      to: (target: any, options: any) => void;
    };
    
    ScrollTrigger: any;
    
    Rellax: new (selector: string, options?: {
      speed?: number;
      center?: boolean;
      wrapper?: string | null;
      round?: boolean;
      vertical?: boolean;
      horizontal?: boolean;
    }) => {
      destroy: () => void;
    };
    
    VanillaTilt: {
      init: (elements: NodeListOf<Element> | Element, options?: {
        max?: number;
        speed?: number;
        glare?: boolean;
        'max-glare'?: number;
        scale?: number;
        perspective?: number;
        transition?: boolean;
      }) => void;
    };
    
    Splitting: (options?: { target?: Element }) => void;
    
    confetti: (options?: {
      particleCount?: number;
      spread?: number;
      origin?: { x?: number; y?: number };
      colors?: string[];
      shapes?: string[];
      scalar?: number;
      drift?: number;
      gravity?: number;
      ticks?: number;
      decay?: number;
      startVelocity?: number;
    }) => void;
  }
  
  interface Element {
    vanillaTilt?: {
      destroy: () => void;
    };
  }
}

export {};