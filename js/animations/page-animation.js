import AnimationFactory from './animation-factory.js';

document.addEventListener('DOMContentLoaded', () => {
  // Get the current page name from the URL
  const pageName = window.location.pathname.split('/').pop().replace('.html', '');
  
  // Choose animation type based on page
  let animationType = 'cube'; // default
  
  if (pageName === 'roadmap') {
    animationType = 'sphere';
  } else if (pageName === 'dashboard') {
    animationType = 'cube';
  }
  
  // Create the animation
  const animation = AnimationFactory.createAnimation(animationType, 'cube-animation-container');
  
  // Store the animation instance
  window.pageAnimation = animation;
  
  // Clean up resources
  window.addEventListener('beforeunload', () => {
    if (animation) {
      animation.dispose();
    }
  });
});