const CONFIG = {
  // Minimum frequency for problems to appear in roadmap
  MIN_FREQUENCY: 5,
  
  // Topic order for roadmap
  TOPIC_ORDER: [
    "Array", "String", "Hash Table", "Two Pointers", "Sliding Window",
    "Stack", "Queue", "Linked List", "Tree", "Binary Search", "Heap",
    "Graph", "Greedy", "Dynamic Programming", "Backtracking", "Trie"
  ],
  
  // Difficulty levels
  DIFFICULTY_LEVELS: ["Easy", "Medium", "Hard"],
  
  // Theme colors
  COLORS: {
    primary: '#800000',
    secondary: '#f5f9ec',
    accent: '#007acc'
  },
  
  // Chatbot settings
  CHATBOT: {
    voiceRate: 1.0,
    voicePitch: 1.0,
    maxResponseLength: 500,
    wakeWord: 'hey placement_prep'
  }
};

export default CONFIG;