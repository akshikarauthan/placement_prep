// Data fetching module
const API = {
  async getCompanies() {
    const response = await fetch('data/companies.json');
    return response.json();
  },
  
  async getProblems() {
    const response = await fetch('data/data.json');
    return response.json();
  },
  
  async getRawData() {
    const response = await fetch('data/raw_data.json');
    return response.json();
  },
  
  // Mock AI response function (in a real app, this would call OpenAI API)
  async getAIResponse(message) {
    // For demo purposes, we'll use a rule-based approach
    // In a production app, this would call the OpenAI API
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return 'Hello! How can I help you with your LeetCode preparation today?';
    }
    
    if (lowerMessage.includes('thank')) {
      return 'You\'re welcome! Feel free to ask if you need help with anything else.';
    }
    
    if (lowerMessage.includes('bye')) {
      return 'Goodbye! Good luck with your coding practice!';
    }
    
    if (lowerMessage.includes('help')) {
      return 'I can help you with finding problems, explaining DSA concepts, providing solution approaches, and creating study plans. What would you like help with?';
    }
    
    // Default response
    return `I'm your LeetCrack AI assistant. I can help with:\n\n- Finding problems (e.g., "Find array problems")\n- Explaining concepts (e.g., "Explain dynamic programming")\n- Providing help with specific topics (e.g., "Help me with tree traversal")\n\nHow can I assist you with your coding interview preparation?`;
  }
};


export default API;