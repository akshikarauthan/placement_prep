/**
 * CubeAnimation.js
 * A Three.js based rotating cube animation for LeetCrack
 */

class CubeAnimation {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    
    if (!this.container) {
      console.error(`Container with ID ${containerId} not found`);
      return;
    }
    
    // Enhanced LeetCode themed colors with more vibrant options
    this.colors = {
      primary: 0x8b0000,    // Deep maroon
      secondary: 0xffd700,  // Gold
      tertiary: 0x4b0082,   // Indigo
      accent: 0x00bfff      // Deep sky blue
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
    
    // Initialize renderer with better quality
    this.renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      precision: 'highp'
    });
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x000000, 0); // Transparent background
    this.renderer.setPixelRatio(window.devicePixelRatio); // For sharper rendering
    this.container.appendChild(this.renderer.domElement);
    
    // Create cube
    this.createCube();
    
    // Add lighting
    this.addLighting();
    
    // Start animation loop
    this.animate();
    
    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }
  
  createCube() {
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    
    // Create materials for each face with different colors
    const materials = [
      new THREE.MeshPhongMaterial({ color: this.colors.primary, shininess: 100 }),
      new THREE.MeshPhongMaterial({ color: this.colors.secondary, shininess: 100 }),
      new THREE.MeshPhongMaterial({ color: this.colors.tertiary, shininess: 100 }),
      new THREE.MeshPhongMaterial({ color: this.colors.accent, shininess: 100 }),
      new THREE.MeshPhongMaterial({ color: this.colors.primary, shininess: 100 }),
      new THREE.MeshPhongMaterial({ color: this.colors.secondary, shininess: 100 })
    ];
    
    this.cube = new THREE.Mesh(geometry, materials);
    this.scene.add(this.cube);
    
    // Add wireframe for extra visual interest
    const wireframe = new THREE.WireframeGeometry(geometry);
    const line = new THREE.LineSegments(wireframe);
    line.material.color.setHex(0xffffff);
    line.material.transparent = true;
    line.material.opacity = 0.3;
    this.cube.add(line);
  }
  
  addLighting() {
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);
    
    // Add point light for more dramatic effect
    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(-3, 3, 3);
    this.scene.add(pointLight);
  }
  
  animate() {
    this.animationId = requestAnimationFrame(this.animate.bind(this));
    
    // Rotate cube with varying speeds for more interesting motion
    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.015;
    this.cube.rotation.z += 0.005;
    
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
    
    if (this.cube) {
      this.scene.remove(this.cube);
      this.cube.geometry.dispose();
      
      // Dispose of all materials
      if (Array.isArray(this.cube.material)) {
        this.cube.material.forEach(material => material.dispose());
      } else {
        this.cube.material.dispose();
      }
    }
    
    if (this.renderer) {
      this.renderer.dispose();
      this.container.removeChild(this.renderer.domElement);
    }
    
    window.removeEventListener('resize', this.onWindowResize.bind(this));
  }
}

// Export the class
export default CubeAnimation;