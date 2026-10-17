class FloatingAssistant {
  constructor() {
    this.createButton();
    this.setupEventListeners();
  }
  
  createButton() {
    const button = document.createElement('button');
    button.id = 'floating-assistant-btn';
    button.innerHTML = '<i class="bi bi-robot"></i>';
    button.title = 'Ask AI Assistant';
    
    // Style the button
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.width = '60px';
    button.style.height = '60px';
    button.style.borderRadius = '50%';
    button.style.backgroundColor = 'var(--primary-color)';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    button.style.fontSize = '24px';
    button.style.cursor = 'pointer';
    button.style.zIndex = '1000';
    button.style.display = 'flex';
    button.style.justifyContent = 'center';
    button.style.alignItems = 'center';
    button.style.transition = 'transform 0.2s';
    
    document.body.appendChild(button);
    
    // Add hover effect
    button.addEventListener('mouseover', () => {
      button.style.transform = 'scale(1.1)';
    });
    
    button.addEventListener('mouseout', () => {
      button.style.transform = 'scale(1)';
    });
    
    this.button = button;
  }
  
  setupEventListeners() {
    this.button.addEventListener('click', () => {
      window.location.href = 'chatbot.html';
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new FloatingAssistant();
});