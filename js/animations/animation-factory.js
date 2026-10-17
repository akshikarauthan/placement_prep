import CubeAnimation from './cube-animation.js';
import SphereAnimation from './sphere-animation.js';

class AnimationFactory {
  static createAnimation(type, containerId) {
    switch(type) {
      case 'cube':
        return new CubeAnimation(containerId);
      case 'sphere':
        return new SphereAnimation(containerId);
      default:
        console.error(`Animation type '${type}' not recognized`);
        return null;
    }
  }
}

export default AnimationFactory;