/**
 * Roadmap page animation initialization
 */

import SphereAnimation from './sphere-animation.js';

// Initialize the sphere animation when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Create the sphere animation
  const sphereAnimation = new SphereAnimation('cube-animation-container');
  
  // Store the animation instance in window for potential access later
  window.sphereAnimation = sphereAnimation;
  
  // Clean up resources when the page is unloaded
  window.addEventListener('beforeunload', () => {
    if (sphereAnimation) {
      sphereAnimation.dispose();
    }
  });
});