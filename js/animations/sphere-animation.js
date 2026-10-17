/**
 * SphereAnimation.js
 * A Three.js based rotating sphere animation for LeetCrack
 */

class SphereAnimation {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    
    if (!this.container) {
      console.error(`Container with ID ${containerId} not found`);
      return;
    }
    
    // LeetCode themed colors
    this.colors = {
      primary: 0x2cbb5d,    // LeetCode green
      secondary: 0xffa116,  // LeetCode orange
      tertiary: 0xb3b3b3,   // LeetCode gray
    };
    
    this.init();
  }
  
  init() {
    // Initialize scene
    this.scene = new THREE.Scene();
    
    // Initialize camera
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 5;
    
    // Initialize renderer
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x000000, 0); // Transparent background
    this.container.appendChild(this.renderer.domElement);
    
    // Create sphere
    this.createSphere();
    
    // Add lighting
    this.addLighting();
    
    // Start animation loop
    this.animate();
    
    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }
  
  createSphere() {
    const geometry = new THREE.SphereGeometry(2, 32, 32);
    const material = new THREE.MeshPhongMaterial({ 
      color: this.colors.primary,
      shininess: 100,
      emissive: 0x111111,
      specular: 0xffffff
    });
    
    this.sphere = new THREE.Mesh(geometry, material);
    this.scene.add(this.sphere);
    
    // Add wireframe
    const wireframe = new THREE.WireframeGeometry(geometry);
    const line = new THREE.LineSegments(wireframe);
    line.material.color.setHex(this.colors.secondary);
    line.material.transparent = true;
    line.material.opacity = 0.3;
    this.sphere.add(line);
  }
  
  addLighting() {
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);
  }
  
  animate() {
    this.animationId = requestAnimationFrame(this.animate.bind(this));
    
    // Rotate sphere
    this.sphere.rotation.x += 0.005;
    this.sphere.rotation.y += 0.01;
    
    this.renderer.render(this.scene, this.camera);
  }
  
  onWindowResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
  
  dispose() {
    // Clean up resources
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    if (this.sphere) {
      this.scene.remove(this.sphere);
      this.sphere.geometry.dispose();
      this.sphere.material.dispose();
    }
    
    if (this.renderer) {
      this.renderer.dispose();
      this.container.removeChild(this.renderer.domElement);
    }
    
    window.removeEventListener('resize', this.onWindowResize.bind(this));
  }
}

// Export the class
export default SphereAnimation;