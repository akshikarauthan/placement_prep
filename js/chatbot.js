import API from './api.js';
import CONFIG from './config.js';
import ProgressTracker from './progress.js';

class ChatbotAssistant {
  constructor() {
    this.chatMessages = document.getElementById('chat-messages');
    this.userInput = document.getElementById('user-input');
    this.sendButton = document.getElementById('send-button');
    this.voiceToggle = document.getElementById('voice-toggle');
    this.voiceStatus = document.getElementById('voice-status');
    this.voiceActive = false;
    this.problemsData = null;
    this.rawData = null;
    
    this.init();
  }
  
  async init() {
    // Load data
    try {
      this.problemsData = await API.getProblems();
      this.rawData = await API.getRawData();
    } catch (error) {
      console.error('Failed to load data:', error);
      this.addMessage('assistant', 'Sorry, I had trouble loading problem data. Please try refreshing the page.');
    }
    
    // Set up event listeners
    this.sendButton.addEventListener('click', () => this.handleUserMessage());
    this.userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleUserMessage();
    });
    this.voiceToggle.addEventListener('click', () => this.toggleVoiceMode());
    
    // Initialize voice recognition if available
    this.initVoiceRecognition();
  }
  
  initVoiceRecognition() {
    if (annyang) {
      // Add commands
      const commands = {
        'find *topic problems': (topic) => {
          this.userInput.value = `Find ${topic} problems`;
          this.handleUserMessage();
        },
        'explain *concept': (concept) => {
          this.userInput.value = `Explain ${concept}`;
          this.handleUserMessage();
        },
        'help me with *question': (question) => {
          this.userInput.value = `Help me with ${question}`;
          this.handleUserMessage();
        }
      };
      
      annyang.addCommands(commands);
      
      annyang.addCallback('result', (phrases) => {
        if (this.voiceActive) {
          this.userInput.value = phrases[0];
        }
      });
    }
  }
  
  toggleVoiceMode() {
    if (annyang) {
      if (!this.voiceActive) {
        // Start listening
        annyang.start({ autoRestart: true, continuous: false });
        this.voiceActive = true;
        this.voiceToggle.classList.add('btn-primary');
        this.voiceToggle.classList.remove('btn-outline-primary');
        this.voiceStatus.classList.remove('d-none');
        this.voiceStatus.classList.add('voice-active');
        
        // Text-to-speech response
        this.speak('Voice assistant activated. How can I help you?');
      } else {
        // Stop listening
        annyang.abort();
        this.voiceActive = false;
        this.voiceToggle.classList.remove('btn-primary');
        this.voiceToggle.classList.add('btn-outline-primary');
        this.voiceStatus.classList.add('d-none');
        this.voiceStatus.classList.remove('voice-active');
      }
    } else {
      alert('Voice recognition is not supported in your browser.');
    }
  }
  
  speak(text) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }
  
  async handleUserMessage() {
    const message = this.userInput.value.trim();
    if (!message) return;
    
    // Add user message to chat
    this.addMessage('user', message);
    this.userInput.value = '';
    
    // Process the message
    await this.processUserMessage(message);
  }
  
  async processUserMessage(message) {
    // Show typing indicator
    const typingIndicator = this.addTypingIndicator();
    try {
      // Try server-side RAG if available
      let serverReply = null;
      try {
        const resp = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message })
        });
        if (resp.ok) {
          const json = await resp.json();
          if (json && json.reply) serverReply = json.reply;
        }
      } catch (e) {
        console.warn('Server chat call failed, falling back to local logic', e);
      }

      let response = null;
      if (serverReply) {
        response = serverReply;
      } else {
        // Fallback to local rule-based logic
        if (message.toLowerCase().includes('find') && message.toLowerCase().includes('problem')) {
          response = this.findProblems(message);
        } else if (message.toLowerCase().includes('explain')) {
          response = this.explainConcept(message);
        } else if (message.toLowerCase().includes('help') && message.toLowerCase().includes('with')) {
          response = this.provideHelp(message);
        } else {
          response = this.generateGenericResponse(message);
        }
      }

      // Remove typing indicator
      this.chatMessages.removeChild(typingIndicator);
      // Add assistant response
      this.addMessage('assistant', response);
      // Text-to-speech if voice mode is active
      if (this.voiceActive) {
        const textOnly = response.replace(/<[^>]*>/g, '');
        this.speak(textOnly);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      this.chatMessages.removeChild(typingIndicator);
      this.addMessage('assistant', 'Sorry, I encountered an error processing your request.');
    }
  }
  
  findProblems(message) {
    // Extract topic from message
    const topicMatch = message.match(/find\s+([\w\s]+)\s+problems/i);
    let topic = topicMatch ? topicMatch[1].trim().toLowerCase() : '';
    
    if (!topic) {
      return 'What type of problems are you looking for? Please specify a topic like "arrays" or "dynamic programming".';
    }
    
    // Map common variations to standard topics
    const topicMap = {
      'dp': 'dynamic programming',
      'dfs': 'depth-first search',
      'bfs': 'breadth-first search',
      'oop': 'object-oriented programming',
      'linked list': 'linked list',
      'linkedlist': 'linked list'
    };
    
    topic = topicMap[topic] || topic;
    
    // Search for problems
    const matchingProblems = [];
    
    // Search in raw data
    if (this.rawData) {
      this.rawData.forEach(problem => {
        const problemTopics = problem.Topics.toLowerCase();
        if (problemTopics.includes(topic)) {
          matchingProblems.push({
            title: problem.Title,
            difficulty: problem.Difficulty,
            link: problem.Link
          });
        }
      });
    }
    
    // Limit to 5 problems
    const limitedProblems = matchingProblems.slice(0, 5);
    
    if (limitedProblems.length === 0) {
      return `I couldn't find any problems related to "${topic}". Try a different topic or check your spelling.`;
    }
    
    // Format response
    let response = `Here are some problems related to **${topic}**:\n\n`;
    limitedProblems.forEach(problem => {
      response += `- [${problem.title}](${problem.link}) (${problem.difficulty})\n`;
    });
    
    response += `\n*Found ${matchingProblems.length} problems in total. Showing the first ${limitedProblems.length}.*`;
    
    return response;
  }
  
  explainConcept(message) {
    // Extract concept from message
    const conceptMatch = message.match(/explain\s+([\w\s]+)/i);
    const concept = conceptMatch ? conceptMatch[1].trim().toLowerCase() : '';
    
    if (!concept) {
      return 'What concept would you like me to explain?';
    }
    
    // Map of DSA concepts and explanations
    const conceptExplanations = {
      'array': `**Arrays** are a fundamental data structure that store elements of the same type in contiguous memory locations. Key operations:\n\n- Access: O(1) - Direct access by index\n- Search: O(n) - Linear search in unsorted array, O(log n) in sorted array using binary search\n- Insert/Delete at end: O(1) - Amortized for dynamic arrays\n- Insert/Delete at arbitrary position: O(n) - Need to shift elements\n\nCommon array techniques:\n- Two pointers\n- Sliding window\n- Prefix sums\n- Kadane's algorithm for maximum subarray\n\nArrays are used in almost every algorithm and are the foundation for many other data structures.`,
      
      'linked list': `**Linked Lists** consist of nodes where each node contains data and a reference to the next node. Key operations:\n\n- Access: O(n) - Need to traverse from head\n- Search: O(n) - Linear traversal\n- Insert/Delete at beginning: O(1)\n- Insert/Delete at end: O(n) for singly linked list, O(1) for doubly linked list with tail pointer\n- Insert/Delete at arbitrary position: O(n) to find position, O(1) to change pointers\n\nTypes of linked lists:\n- Singly linked list: Each node points to the next node\n- Doubly linked list: Each node points to both next and previous nodes\n- Circular linked list: Last node points back to the first node\n\nLinked lists are useful when you need efficient insertions/deletions and don't need random access.`,
      
      'stack': `**Stacks** follow the Last-In-First-Out (LIFO) principle. Key operations:\n\n- Push: O(1) - Add element to top\n- Pop: O(1) - Remove element from top\n- Peek/Top: O(1) - View top element without removing\n- isEmpty: O(1) - Check if stack is empty\n\nApplications:\n- Function call stack in programming languages\n- Expression evaluation and syntax parsing\n- Backtracking algorithms\n- Undo functionality in applications\n\nStacks can be implemented using arrays or linked lists. They're useful for problems involving matching pairs, nested structures, or when you need to process elements in reverse order of their arrival.`,
      
      'queue': `**Queues** follow the First-In-First-Out (FIFO) principle. Key operations:\n\n- Enqueue: O(1) - Add element to rear\n- Dequeue: O(1) - Remove element from front\n- Front: O(1) - View front element without removing\n- isEmpty: O(1) - Check if queue is empty\n\nVariations:\n- Circular Queue: Efficient use of fixed-size array\n- Priority Queue: Elements have priority values, highest priority served first\n- Deque (Double-ended queue): Insert/delete from both ends\n\nApplications:\n- BFS algorithm\n- CPU scheduling\n- Print job scheduling\n- Request handling in web servers\n\nQueues are essential for level-order processing and managing resources in a fair order.`,
      
      'tree': `**Trees** are hierarchical data structures with a root node and child nodes. Key properties:\n\n- Each node has 0 or more children\n- Exactly one path between any two nodes\n- Height: Longest path from root to leaf\n- Depth: Length of path from root to node\n\nTypes:\n- Binary Tree: Each node has at most 2 children\n- Binary Search Tree (BST): Left child < parent < right child\n- AVL Tree: Self-balancing BST\n- Red-Black Tree: Self-balancing BST with color properties\n- B-Tree: Self-balancing tree with multiple keys per node\n\nTraversals:\n- Inorder (Left-Root-Right): Gives sorted order for BST\n- Preorder (Root-Left-Right): Used to create copy of tree\n- Postorder (Left-Right-Root): Used to delete tree\n- Level Order: Process level by level\n\nTrees are used for representing hierarchical data, efficient searching, and maintaining sorted data.`,
      
      'graph': `**Graphs** consist of vertices (nodes) and edges connecting them. Key properties:\n\n- Directed vs Undirected: Edges have direction or not\n- Weighted vs Unweighted: Edges have weights or not\n- Connected vs Disconnected: Path exists between any two vertices or not\n- Cyclic vs Acyclic: Contains cycles or not\n\nRepresentations:\n- Adjacency Matrix: 2D array where matrix[i][j] indicates edge between i and j\n- Adjacency List: Array of lists where each list contains neighbors of a vertex\n\nAlgorithms:\n- BFS: Shortest path in unweighted graph, O(V+E)\n- DFS: Detecting cycles, topological sorting, O(V+E)\n- Dijkstra's: Shortest path in weighted graph (non-negative), O(E log V)\n- Bellman-Ford: Shortest path with negative weights, O(VE)\n- Kruskal's & Prim's: Minimum spanning tree, O(E log E) and O(E log V)\n\nGraphs model networks, relationships, and many real-world problems.`,
      
      'hash table': `**Hash Tables** (or Hash Maps) store key-value pairs with O(1) average time complexity for insertions, deletions, and lookups. Key components:\n\n- Hash Function: Converts keys to array indices\n- Collision Resolution: Handling when different keys hash to same index\n  - Chaining: Store colliding elements in linked list\n  - Open Addressing: Find next available slot (linear/quadratic probing, double hashing)\n\nOperations:\n- Insert: O(1) average, O(n) worst case\n- Delete: O(1) average, O(n) worst case\n- Search: O(1) average, O(n) worst case\n\nLoad Factor = Number of entries / Table size\n- High load factor increases collision probability\n- Rehashing (resizing) needed when load factor exceeds threshold\n\nHash tables are used for implementing associative arrays, database indexing, caching, and sets.`,
      
      'dynamic programming': `**Dynamic Programming (DP)** is a technique for solving problems by breaking them down into simpler subproblems. It's applicable when problems have:\n\n1. Overlapping subproblems: Same subproblems solved multiple times\n2. Optimal substructure: Optimal solution contains optimal solutions to subproblems\n\nApproaches:\n- Top-down (Memoization): Recursive approach with caching\n- Bottom-up (Tabulation): Iterative approach building from smallest subproblems\n\nSteps to solve DP problems:\n1. Define state: Identify what a subproblem looks like\n2. Formulate recurrence relation: How to build solution from smaller subproblems\n3. Identify base cases\n4. Decide computation order (bottom-up) or use memoization (top-down)\n5. Extract final answer\n\nCommon DP problems:\n- Fibonacci sequence\n- Longest Common Subsequence\n- Knapsack problem\n- Longest Increasing Subsequence\n- Edit Distance\n- Coin Change\n\nDP trades space for time, reducing exponential time complexity to polynomial.`,
      
      'greedy': `**Greedy Algorithms** make locally optimal choices at each step with the hope of finding a global optimum. Key characteristics:\n\n- Makes best choice at current step without considering future consequences\n- Never reconsiders previous choices\n- Simple and efficient but doesn't always yield optimal solution\n\nWhen to use Greedy:\n- Problem has optimal substructure\n- Local optimal choice leads to global optimal solution\n\nCommon Greedy Algorithms:\n- Kruskal's and Prim's for Minimum Spanning Tree\n- Dijkstra's for Shortest Path\n- Huffman Coding for data compression\n- Activity Selection Problem\n- Fractional Knapsack\n\nGreedy vs Dynamic Programming:\n- Greedy: Makes irrevocable decisions based on current state\n- DP: Considers all possible decisions and their future impact\n\nGreedy algorithms are faster but require proof of correctness for each problem.`,
      
      'backtracking': `**Backtracking** is an algorithmic technique that builds solutions incrementally and abandons a path as soon as it determines the path cannot lead to a valid solution. Key concepts:\n\n- Depth-First Search approach\n- Try all possibilities until you find a solution\n- Prune search space by discarding invalid paths early\n\nGeneral approach:\n1. Choose: Select a candidate for the solution\n2. Constraint: Check if the candidate violates any constraints\n3. Goal: Check if we've reached a complete solution\n4. Backtrack: If constraints violated or goal not reached, undo choice and try alternatives\n\nCommon Backtracking Problems:\n- N-Queens Problem\n- Sudoku Solver\n- Permutations and Combinations\n- Subset Sum\n- Hamiltonian Path\n- Graph Coloring\n\nBacktracking is used when you need to find all (or some) solutions to a problem with constraints.`,
      
      'binary search': `**Binary Search** is a divide-and-conquer algorithm that finds the position of a target value in a sorted array. Key properties:\n\n- Time Complexity: O(log n)\n- Space Complexity: O(1) iterative, O(log n) recursive\n- Requires sorted input\n\nBasic algorithm:\n1. Compare target with middle element\n2. If equal, return index\n3. If target < middle, search left half\n4. If target > middle, search right half\n5. Repeat until found or search space is empty\n\nVariations:\n- Finding first/last occurrence of element\n- Finding element closest to target\n- Search in rotated sorted array\n- Binary search on answer (for optimization problems)\n\nCommon pitfalls:\n- Off-by-one errors in boundary conditions\n- Integer overflow in calculating mid = (left + right) / 2 (use mid = left + (right - left) / 2)\n- Infinite loops if search space doesn't reduce\n\nBinary search is also applicable to monotonic functions and optimization problems.`
    };
    
    // Check if we have an explanation for this concept
    for (const [key, explanation] of Object.entries(conceptExplanations)) {
      if (concept.includes(key)) {
        return explanation;
      }
    }
    
    return `I don't have a detailed explanation for "${concept}" yet. Is there a specific aspect of this concept you'd like to know about?`;
  }
  
  provideHelp(message) {
    // Extract question from message
    const questionMatch = message.match(/help\s+me\s+with\s+([\w\s]+)/i);
    const question = questionMatch ? questionMatch[1].trim().toLowerCase() : '';
    
    if (!question) {
      return 'What specific problem or concept do you need help with?';
    }
    
    // Generic approach suggestions based on keywords
    if (question.includes('array') || question.includes('subarray')) {
      return `For array problems, consider these approaches:\n\n1. **Two Pointers**: Useful for problems like finding pairs with a target sum, removing duplicates, or container with most water.\n\n2. **Sliding Window**: Great for subarrays with constraints like "maximum sum subarray of size k" or "smallest subarray with sum greater than x".\n\n3. **Prefix Sums**: Helps with range sum queries and finding subarrays with a given sum.\n\n4. **Sorting**: Often simplifies problems by bringing similar elements together.\n\n5. **Hash Table**: Useful for problems like Two Sum, finding duplicates, or counting frequencies.\n\nCan you share more details about your specific array problem?`;
    }
    
    if (question.includes('tree') || question.includes('binary')) {
      return `For tree problems, consider these approaches:\n\n1. **Recursion**: Most tree problems can be solved recursively by considering:\n   - Base case (null node)\n   - Logic for current node\n   - Recursive calls for children\n\n2. **DFS Traversals**:\n   - Inorder (Left-Root-Right): Gives sorted order for BST\n   - Preorder (Root-Left-Right): Used for tree construction\n   - Postorder (Left-Right-Root): Used for deletion and calculating heights\n\n3. **BFS/Level Order**: Use a queue to process nodes level by level.\n\n4. **Height Calculation**: Many problems involve tree height or balancing.\n\n5. **Path Finding**: For problems about paths between nodes or path sums.\n\nCan you share more details about your specific tree problem?`;
    }
    
    if (question.includes('dynamic') || question.includes('dp')) {
      return `For dynamic programming problems, follow these steps:\n\n1. **Identify Subproblems**: Break down the problem into smaller, overlapping subproblems.\n\n2. **Define State**: What information do you need to solve a subproblem? This becomes your DP state.\n\n3. **Formulate Recurrence Relation**: How do you build solutions from smaller subproblems?\n\n4. **Identify Base Cases**: The simplest cases that don't depend on other subproblems.\n\n5. **Decide Implementation Approach**:\n   - Top-down (Memoization): Recursive with caching\n   - Bottom-up (Tabulation): Iterative building from base cases\n\n6. **Optimize Space**: Often you can reduce space complexity by only keeping necessary previous states.\n\nCan you share more details about your specific DP problem?`;
    }
    
    if (question.includes('graph')) {
      return `For graph problems, consider these approaches:\n\n1. **Graph Representation**:\n   - Adjacency Matrix: Good for dense graphs and quick edge lookups\n   - Adjacency List: Better for sparse graphs and iterating over neighbors\n\n2. **BFS**: Use for:\n   - Shortest path in unweighted graphs\n   - Level-order traversal\n   - Finding connected components\n\n3. **DFS**: Use for:\n   - Detecting cycles\n   - Topological sorting\n   - Finding strongly connected components\n\n4. **Dijkstra's Algorithm**: Shortest path in weighted graphs (no negative weights)\n\n5. **Bellman-Ford**: Shortest path with negative weights\n\n6. **Union-Find**: For problems involving disjoint sets\n\nCan you share more details about your specific graph problem?`;
    }
    
    // Generic response if no specific topic identified
    return `To help you with "${question}", I'd need more specific details. Here are some general problem-solving steps:\n\n1. **Understand the problem**: Make sure you grasp what's being asked.\n\n2. **Identify the data structures** that might be relevant (arrays, trees, graphs, etc.).\n\n3. **Consider common algorithms** for that data structure (sorting, searching, traversal).\n\n4. **Think about edge cases**: Empty input, single element, duplicates, etc.\n\n5. **Start with a brute force approach**, then optimize.\n\n6. **Use common techniques** like two pointers, sliding window, hash tables, or dynamic programming if applicable.\n\nCould you provide more details about the specific problem you're working on?`;
  }
  
  generateGenericResponse(message) {
    // Simple rule-based responses
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
  
  addMessage(type, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Parse markdown if it's from assistant
    if (type === 'assistant') {
      contentDiv.innerHTML = marked.parse(content);
    } else {
      contentDiv.textContent = content;
    }
    
    messageDiv.appendChild(contentDiv);
    this.chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }
  
  addTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = '<p>Typing<span class="typing-dots">...</span></p>';
    
    typingDiv.appendChild(contentDiv);
    this.chatMessages.appendChild(typingDiv);
    
    // Scroll to bottom
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    
    return typingDiv;
  }
}

// Initialize the chatbot when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ChatbotAssistant();
});