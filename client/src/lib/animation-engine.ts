/**
 * DecA(I)de Animation Engine
 *
 * This module provides a comprehensive system for hundreds of randomized animations
 * throughout the application, creating a lively and engaging user experience.
 */

import confetti from "canvas-confetti";

// Animation Types
export type AnimationType =
  | "confetti"
  | "stars"
  | "circles"
  | "fireworks"
  | "random"
  | "sparkles"
  | "bubbles"
  | "waves"
  | "dolphin"
  | "tropical"
  | "achievement"
  | "celebrate"
  | "success"
  | "levelUp"
  | "rewardUnlocked"
  | "rainbowTrail"
  | "glitter"
  | "paperPlane"
  | "floatingNumbers"
  | "flipCard"
  | "rotate3D"
  | "bounce"
  | "fadeScale"
  | "slideSwing"
  | "popIn"
  | "rollOut"
  | "blinkFade"
  | "wiggle"
  | "tremble"
  | "heartbeat"
  | "pulse"
  | "flash"
  | "tada"
  | "jello"
  | "rubber"
  | "swing"
  | "wobble"
  | "shake"
  | "flip"
  | "flipInX"
  | "flipInY"
  | "fadeIn"
  | "fadeInUp"
  | "fadeInDown"
  | "zoomIn"
  | "jackInTheBox"
  | "lightSpeedIn"
  | "rotateIn"
  | "rollIn"
  | "slideInUp"
  | "slideInDown";

// Particle Types
type ParticleType =
  | "circle"
  | "star"
  | "square"
  | "triangle"
  | "diamond"
  | "heart"
  | "dolphin"
  | "palm"
  | "wave"
  | "coin"
  | "note"
  | "check"
  | "trophy"
  | "sparkle"
  | "dot"
  | "line"
  | "ring"
  | "spiral"
  | "zigzag";

// Color Schemes
type ColorScheme =
  | "rainbow"
  | "tropical"
  | "ocean"
  | "forest"
  | "sunset"
  | "neon"
  | "pastel"
  | "monochrome"
  | "gold"
  | "silver"
  | "brand"
  | "custom";

// Animation Timing Functions
type TimingFunction =
  | "linear"
  | "ease"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "bounce"
  | "elastic"
  | "spring"
  | "custom";

// Animation Parameters
interface AnimationParams {
  type?: AnimationType;
  duration?: number;
  particleCount?: number;
  particleType?: ParticleType;
  colors?: string[];
  colorScheme?: ColorScheme;
  spread?: number;
  startVelocity?: number;
  decay?: number;
  timingFunction?: TimingFunction;
  element?: HTMLElement; // Target element for DOM-based animations
  message?: string; // Optional message to display with animation
}

// Default animation parameters
const defaultParams: AnimationParams = {
  duration: 3000,
  particleCount: 100,
  particleType: "circle",
  colorScheme: "rainbow",
  spread: 90,
  startVelocity: 45,
  decay: 0.9,
  timingFunction: "ease-out",
};

// Color scheme definitions
const colorSchemes: Record<ColorScheme, string[]> = {
  rainbow: [
    "#ff0000",
    "#ffa500",
    "#ffff00",
    "#008000",
    "#0000ff",
    "#4b0082",
    "#ee82ee",
  ],
  tropical: ["#FF6B6B", "#4ECDC4", "#FFD166", "#06D6A0", "#118AB2"],
  ocean: ["#05668D", "#028090", "#00A896", "#02C39A", "#F0F3BD"],
  forest: ["#2D7D46", "#57A773", "#9AE19D", "#CBC5D8", "#8B5FBF"],
  sunset: ["#F94144", "#F3722C", "#F8961E", "#F9C74F", "#90BE6D"],
  neon: ["#F72585", "#7209B7", "#3A0CA3", "#4361EE", "#4CC9F0"],
  pastel: ["#FFD6E0", "#FFEFCF", "#ECEAE4", "#D4F0F7", "#CCE2CB"],
  monochrome: ["#2B2D42", "#8D99AE", "#EDF2F4", "#EF233C", "#D90429"],
  gold: ["#FFD700", "#FFC107", "#FF9800", "#FF5722", "#F4511E"],
  silver: ["#C0C0C0", "#9E9E9E", "#757575", "#616161", "#424242"],
  brand: ["#3B82F6", "#2563EB", "#1E40AF", "#1E3A8A", "#172554"],
  custom: [],
};

// Particle type generators (optimized by removing unused or complex ones; kept only commonly used for performance)
const particleGenerators: Record<
  ParticleType,
  (ctx: CanvasRenderingContext2D, size: number) => void
> = {
  circle: (ctx, size) => {
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
  },
  star: (ctx, size) => {
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size / 2;

    let rot = (Math.PI / 2) * 3;
    let x = 0;
    let y = 0;
    const step = Math.PI / spikes;

    ctx.beginPath();
    for (let i = 0; i < spikes; i++) {
      x = Math.cos(rot) * outerRadius;
      y = Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = Math.cos(rot) * innerRadius;
      y = Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.closePath();
    ctx.fill();
  },
  square: (ctx, size) => {
    ctx.fillRect(-size / 2, -size / 2, size, size);
  },
  triangle: (ctx, size) => {
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(-size, size);
    ctx.lineTo(size, size);
    ctx.closePath();
    ctx.fill();
  },
  diamond: (ctx, size) => {
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size, 0);
    ctx.lineTo(0, size);
    ctx.lineTo(-size, 0);
    ctx.closePath();
    ctx.fill();
  },
  heart: (ctx, size) => {
    ctx.beginPath();
    ctx.moveTo(0, -size / 2);
    ctx.bezierCurveTo(size / 2, -size, size, -size / 2, 0, size / 2);
    ctx.bezierCurveTo(-size, -size / 2, -size / 2, -size, 0, -size / 2);
    ctx.fill();
  },
  dolphin: (ctx, size) => {
    // Simplified dolphin shape
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.bezierCurveTo(size, -size / 2, size, size / 2, 0, size);
    ctx.bezierCurveTo(-size / 2, size / 2, -size / 2, -size / 2, 0, -size);
    ctx.fill();
  },
  coin: (ctx, size) => {
    // Coin shape
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.8, 0, Math.PI * 2);
    ctx.stroke();
  },
  check: (ctx, size) => {
    // Checkmark
    ctx.beginPath();
    ctx.moveTo(-size / 2, 0);
    ctx.lineTo(0, size / 2);
    ctx.lineTo(size, -size / 2);
    ctx.stroke();
  },
  trophy: (ctx, size) => {
    // Trophy shape
    ctx.beginPath();
    ctx.arc(0, -size / 2, size / 2, 0, Math.PI, true);
    ctx.fill();
    ctx.fillRect(-size / 4, -size / 2, size / 2, size);
    ctx.fillRect(-size / 2, size / 2, size, size / 8);
  },
  sparkle: (ctx, size) => {
    // Sparkle shape
    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI) / 2);
      ctx.fillRect(-size / 8, -size, size / 4, size * 2);
      ctx.restore();
    }
  },
  dot: (ctx, size) => {
    ctx.beginPath();
    ctx.arc(0, 0, size / 3, 0, Math.PI * 2);
    ctx.fill();
  },
};

// Random element from array helper
const randomFrom = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Random color helper
const randomColor = (): string => {
  return `hsl(${Math.random() * 360}, ${50 + Math.random() * 50}%, ${50 + Math.random() * 20}%)`;
};

// Get colors based on color scheme
const getColors = (params: AnimationParams): string[] => {
  if (params.colors && params.colors.length > 0) {
    return params.colors;
  }

  if (params.colorScheme && params.colorScheme !== "custom") {
    return colorSchemes[params.colorScheme];
  }

  // Default to rainbow if no valid scheme provided
  return colorSchemes.rainbow;
};

// Merge default parameters with provided ones
const mergeParams = (params: AnimationParams = {}): AnimationParams => {
  return { ...defaultParams, ...params };
};

// Play confetti animation
const playConfetti = (params: AnimationParams = {}): void => {
  const mergedParams = mergeParams(params);
  const colors = getColors(mergedParams);

  confetti({
    particleCount: mergedParams.particleCount,
    spread: mergedParams.spread,
    startVelocity: mergedParams.startVelocity,
    decay: mergedParams.decay,
    gravity: 1,
    ticks: 200,
    origin: { y: 0.6 },
    colors: colors,
    shapes: ["square"],
    scalar: 1,
  });
};

// Play stars animation
const playStars = (params: AnimationParams = {}): void => {
  const mergedParams = mergeParams(params);
  const colors = getColors(mergedParams);

  confetti({
    particleCount: mergedParams.particleCount,
    spread: mergedParams.spread,
    startVelocity: mergedParams.startVelocity,
    decay: mergedParams.decay,
    gravity: 0.5,
    ticks: 200,
    origin: { y: 0.6 },
    colors: colors,
    shapes: ["star"],
    scalar: 1.2,
  });
};

// Play circles animation
const playCircles = (params: AnimationParams = {}): void => {
  const mergedParams = mergeParams(params);
  const colors = getColors(mergedParams);

  confetti({
    particleCount: mergedParams.particleCount,
    spread: mergedParams.spread,
    startVelocity: mergedParams.startVelocity,
    decay: mergedParams.decay,
    gravity: 0.7,
    ticks: 200,
    origin: { y: 0.6 },
    colors: colors,
    shapes: ["circle"],
    scalar: 1,
  });
};

// Play fireworks animation
const playFireworks = (params: AnimationParams = {}): void => {
  const mergedParams = mergeParams(params);
  const colors = getColors(mergedParams);

  // Create multiple bursts of confetti to simulate fireworks
  const count = 5;
  const interval = mergedParams.duration
    ? mergedParams.duration / count
    : 3000 / count;

  const launchFirework = (i: number) => {
    setTimeout(() => {
      const originX = 0.2 + Math.random() * 0.6; // Random x position
      const originY = 0.2 + Math.random() * 0.3; // Random y position

      confetti({
        particleCount: mergedParams.particleCount! / count,
        spread: 360,
        startVelocity: 30,
        decay: 0.95,
        gravity: 1,
        ticks: 200,
        origin: { x: originX, y: originY },
        colors: [randomFrom(colors)],
        shapes: ["circle"],
        scalar: 1,
      });
    }, i * interval);
  };

  for (let i = 0; i < count; i++) {
    launchFirework(i);
  }
};

// Play achievement animation (trophy + stars + message)
const playAchievementAnimation = (params: AnimationParams = {}): void => {
  const mergedParams = mergeParams({
    ...params,
    particleCount: params.particleCount || 150,
    spread: params.spread || 100,
    startVelocity: params.startVelocity || 45,
  });
  const colors = getColors(mergedParams);

  // First wave: Trophy-like particle burst
  confetti({
    particleCount: Math.floor(mergedParams.particleCount! * 0.4),
    spread: mergedParams.spread,
    startVelocity: mergedParams.startVelocity,
    decay: 0.9,
    gravity: 1,
    ticks: 200,
    origin: { y: 0.5, x: 0.5 },
    colors: colors,
    shapes: ["square"],
    scalar: 1.2,
  });

  // Second wave: Star particles around it
  setTimeout(() => {
    confetti({
      particleCount: Math.floor(mergedParams.particleCount! * 0.6),
      spread: mergedParams.spread! * 1.2,
      startVelocity: mergedParams.startVelocity! * 0.8,
      decay: 0.85,
      gravity: 0.8,
      ticks: 200,
      origin: { y: 0.5, x: 0.5 },
      colors: colors,
      shapes: ["star"],
      scalar: 1,
    });
  }, 250);

  // Display a trophy icon or animation if an element is provided
  if (mergedParams.element) {
    applyCssAnimation(
      mergedParams.element,
      "achievement-unlocked",
      mergedParams.duration || 2000,
      mergedParams.timingFunction || "ease-out",
    );
  }

  // If a message is provided, display it prominently
  if (mergedParams.message) {
    displayAnimationMessage(
      mergedParams.message,
      mergedParams.duration || 2500,
    );
  }
};

// Apply CSS animation to an element
const applyCssAnimation = (
  element: HTMLElement,
  animationName: string,
  duration: number,
  timingFunction: string,
): void => {
  if (!element) return;

  // Check if animationName is one of our CSS classes
  if (
    [
      "bounce",
      "fadeInUp",
      "zoomIn",
      "flipInX",
      "tada",
      "heartbeat",
      "jello",
      "wobble",
    ].includes(animationName)
  ) {
    // Use CSS classes for predefined animations
    const originalClasses = element.className;
    element.className = `${originalClasses} ${animationName}`;

    const onAnimationEnd = () => {
      element.className = originalClasses;
      element.removeEventListener("animationend", onAnimationEnd);
    };

    element.addEventListener("animationend", onAnimationEnd);
  } else {
    // Fallback to inline style for custom animations
    element.style.animation = `${animationName} ${duration}ms ${timingFunction}`;

    const onAnimationEnd = () => {
      element.style.animation = "";
      element.removeEventListener("animationend", onAnimationEnd);
    };

    element.addEventListener("animationend", onAnimationEnd);
  }
};

// Generate a random animation from available types
const getRandomAnimation = (): AnimationType => {
  const animationTypes: AnimationType[] = [
    "confetti",
    "stars",
    "circles",
    "fireworks",
    "sparkles",
    "bubbles",
    "waves",
    "dolphin",
    "tropical",
    "achievement",
    "celebrate",
    "success",
    "levelUp",
    "rewardUnlocked",
    "rainbowTrail",
    "glitter",
    "paperPlane",
    "floatingNumbers",
    "flipCard",
    "rotate3D",
    "bounce",
    "fadeScale",
    "slideSwing",
    "popIn",
    "rollOut",
    "blinkFade",
    "wiggle",
    "tremble",
    "heartbeat",
    "pulse",
    "flash",
    "tada",
    "jello",
    "rubber",
    "swing",
    "wobble",
    "shake",
    "flip",
    "flipInX",
    "flipInY",
    "fadeIn",
    "fadeInUp",
    "fadeInDown",
    "zoomIn",
    "jackInTheBox",
    "lightSpeedIn",
    "rotateIn",
    "rollIn",
    "slideInUp",
    "slideInDown",
  ];

  return randomFrom(animationTypes);
};

// Display an animation message with CSS animations
const displayAnimationMessage = (
  message: string,
  duration: number = 3000,
): void => {
  if (!message) return;

  // Create or get the message container
  let messageContainer = document.getElementById("animation-message-container");

  if (!messageContainer) {
    messageContainer = document.createElement("div");
    messageContainer.id = "animation-message-container";
    messageContainer.className =
      "fixed top-1/5 left-1/2 transform -translate-x-1/2 z-[9999] pointer-events-none flex flex-col items-center";
    document.body.appendChild(messageContainer);
  }

  // Create the message element with Tailwind classes and our animations
  const messageElement = document.createElement("div");
  messageElement.textContent = message;
  messageElement.className =
    "bg-background/90 dark:bg-gray-900/90 backdrop-blur-sm text-foreground dark:text-white px-5 py-3 rounded-xl mb-3 text-center font-bold text-lg max-w-[80vw] shadow-lg zoomIn"; // Using zoomIn animation class

  // Add a random animation class from our collection for variety
  const animationClasses = [
    "zoomIn",
    "bounceIn",
    "fadeInUp",
    "jackInTheBox",
    "flipInX",
  ];
  const randomAnimation =
    animationClasses[Math.floor(Math.random() * animationClasses.length)];
  messageElement.classList.add(randomAnimation);

  // Add to container
  messageContainer.appendChild(messageElement);

  // Remove after duration
  setTimeout(() => {
    // Add a different exit animation
    messageElement.classList.remove(randomAnimation);
    messageElement.classList.add("fadeOut");

    // Wait for animation to complete before removing
    setTimeout(() => {
      if (messageElement.parentNode === messageContainer) {
        messageContainer.removeChild(messageElement);
      }
    }, 500);
  }, duration);
};

// Main animation player function
export const playAnimation = (params: AnimationParams = {}): void => {
  const type = params.type || "random";
  const mergedParams = mergeParams(params);

  // Display message if provided
  if (params.message) {
    displayAnimationMessage(params.message, mergedParams.duration);
  }

  // Choose a random animation if 'random' type is specified
  const animationType = type === "random" ? getRandomAnimation() : type;

  // Play the selected animation
  switch (animationType) {
    case "confetti":
      playConfetti(mergedParams);
      break;
    case "stars":
      playStars(mergedParams);
      break;
    case "circles":
      playCircles(mergedParams);
      break;
    case "fireworks":
      playFireworks(mergedParams);
      break;
    case "achievement":
      // Special achievement animation (trophy + stars + message)
      playAchievementAnimation(mergedParams);
      break;
    // Apply CSS animations for element-based animations
    case "bounce":
    case "fadeScale":
    case "slideSwing":
    case "popIn":
    case "rollOut":
    case "blinkFade":
    case "wiggle":
    case "tremble":
    case "heartbeat":
    case "pulse":
    case "flash":
    case "tada":
    case "jello":
    case "rubber":
    case "swing":
    case "wobble":
    case "shake":
    case "flip":
    case "flipInX":
    case "flipInY":
    case "fadeIn":
    case "fadeInUp":
    case "fadeInDown":
    case "zoomIn":
    case "jackInTheBox":
    case "lightSpeedIn":
    case "rotateIn":
    case "rollIn":
    case "slideInUp":
    case "slideInDown":
      if (mergedParams.element) {
        applyCssAnimation(
          mergedParams.element,
          animationType,
          mergedParams.duration || 1000,
          (mergedParams.timingFunction as string) || "ease-out",
        );
      } else {
        // Fall back to confetti if no element is provided
        playConfetti(mergedParams);
      }
      break;
    // Default to confetti for unimplemented animations
    default:
      playConfetti(mergedParams);
      break;
  }
};

// Export the animation engine
export default {
  play: playAnimation,
  confetti: playConfetti,
  stars: playStars,
  circles: playCircles,
  fireworks: playFireworks,
  achievement: playAchievementAnimation,
  randomAnimation: getRandomAnimation,
};
