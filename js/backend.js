// api.js - API Wrapper for Frontend-Backend Communication

class PlacementTestAPI {
    constructor() {
        this.backend = new PlacementTestBackend();
    }

    // ==================== TEST OPERATIONS ====================

    /**
     * Start a new test session
     * @param {string} difficulty - EASY, MEDIUM, or HARD
     * @param {string} userId - User identifier (optional)
     * @returns {Promise<Object>} Session data
     */
    async startTest(difficulty, userId = 'anonymous') {
        try {
            const response = this.backend.startTest(difficulty, userId);
            
            if (!response.success) {
                throw new Error(response.message);
            }

            return {
                success: true,
                data: {
                    sessionId: response.sessionId,
                    questions: response.questions,
                    timeLimit: response.timeLimit,
                    totalQuestions: response.totalQuestions,
                    difficulty: response.difficulty
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Save answer for a question
     * @param {string} sessionId - Session identifier
     * @param {number} questionId - Question identifier
     * @param {number} answer - Selected answer index
     * @returns {Promise<Object>} Save status
     */
    async saveAnswer(sessionId, questionId, answer) {
        try {
            const response = this.backend.saveAnswer(sessionId, questionId, answer);
            
            return {
                success: response.success,
                message: response.message,
                totalAnswered: response.totalAnswered
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Submit test and get results
     * @param {string} sessionId - Session identifier
     * @returns {Promise<Object>} Test results
     */
    async submitTest(sessionId) {
        try {
            const response = this.backend.submitTest(sessionId);
            
            if (!response.success) {
                throw new Error(response.message);
            }

            return {
                success: true,
                result: response.result
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get test result by session ID
     * @param {string} sessionId - Session identifier
     * @returns {Promise<Object>} Test result
     */
    async getResult(sessionId) {
        try {
            const result = this.backend.getResult(sessionId);
            
            if (!result) {
                throw new Error('Result not found');
            }

            return {
                success: true,
                result
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ==================== QUESTIONS OPERATIONS ====================

    /**
     * Get questions by difficulty
     * @param {string} difficulty - EASY, MEDIUM, or HARD
     * @returns {Promise<Array>} List of questions
     */
    async getQuestions(difficulty) {
        try {
            const questions = this.backend.getQuestions(difficulty);
            
            return {
                success: true,
                questions,
                count: questions.length
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                questions: []
            };
        }
    }

    /**
     * Search questions
     * @param {string} query - Search query
     * @param {string} difficulty - Optional difficulty filter
     * @returns {Promise<Array>} Filtered questions
     */
    async searchQuestions(query, difficulty = null) {
        try {
            const questions = this.backend.searchQuestions(query, difficulty);
            
            return {
                success: true,
                questions,
                count: questions.length
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                questions: []
            };
        }
    }

    // ==================== ANALYTICS & STATISTICS ====================

    /**
     * Get overall analytics
     * @returns {Promise<Object>} Analytics data
     */
    async getAnalytics() {
        try {
            const analytics = this.backend.getAnalytics();
            
            return {
                success: true,
                analytics
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get statistics
     * @returns {Promise<Object>} Statistics data
     */
    async getStatistics() {
        try {
            const stats = this.backend.getStatistics();
            
            return {
                success: true,
                stats
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get leaderboard
     * @param {string} difficulty - Optional difficulty filter
     * @param {number} limit - Number of results
     * @returns {Promise<Array>} Leaderboard entries
     */
    async getLeaderboard(difficulty = null, limit = 10) {
        try {
            const leaderboard = this.backend.getLeaderboard(difficulty, limit);
            
            return {
                success: true,
                leaderboard,
                count: leaderboard.length
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                leaderboard: []
            };
        }
    }

    // ==================== USER OPERATIONS ====================

    /**
     * Get all results for a user
     * @param {string} userId - User identifier
     * @returns {Promise<Array>} User's test results
     */
    async getUserResults(userId) {
        try {
            const results = this.backend.getAllResults(userId);
            
            return {
                success: true,
                results,
                count: results.length
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                results: []
            };
        }
    }

    /**
     * Export results to JSON file
     * @returns {Promise<Object>} Export status
     */
    async exportResults() {
        try {
            this.backend.exportResults();
            
            return {
                success: true,
                message: 'Results exported successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ==================== UTILITY FUNCTIONS ====================

    /**
     * Format time in mm:ss
     * @param {number} seconds - Time in seconds
     * @returns {string} Formatted time
     */
    formatTime(seconds) {
        return this.backend.formatTime(seconds);
    }

    /**
     * Clear all data (use with caution)
     * @returns {Promise<Object>} Clear status
     */
    async clearAllData() {
        try {
            if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
                this.backend.clearAllData();
                return {
                    success: true,
                    message: 'All data cleared successfully'
                };
            }
            return {
                success: false,
                message: 'Operation cancelled'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get session answers
     * @param {string} sessionId - Session identifier
     * @returns {Promise<Array>} User's answers
     */
    async getSessionAnswers(sessionId) {
        try {
            const answers = this.backend.getSessionAnswers(sessionId);
            
            if (!answers) {
                throw new Error('Session not found');
            }

            return {
                success: true,
                answers
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                answers: []
            };
        }
    }
}

// ==================== EVENT-DRIVEN API WRAPPER ====================

class TestEventHandler {
    constructor(api) {
        this.api = api;
        this.listeners = {};
    }

    /**
     * Register event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    /**
     * Emit event
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }

    /**
     * Start test with event handling
     */
    async startTest(difficulty, userId) {
        this.emit('test:starting', { difficulty, userId });
        
        const result = await this.api.startTest(difficulty, userId);
        
        if (result.success) {
            this.emit('test:started', result.data);
        } else {
            this.emit('test:error', result.error);
        }
        
        return result;
    }

    /**
     * Submit answer with event handling
     */
    async saveAnswer(sessionId, questionId, answer) {
        this.emit('answer:saving', { sessionId, questionId, answer });
        
        const result = await this.api.saveAnswer(sessionId, questionId, answer);
        
        if (result.success) {
            this.emit('answer:saved', result);
        } else {
            this.emit('answer:error', result.error);
        }
        
        return result;
    }

    /**
     * Submit test with event handling
     */
    async submitTest(sessionId) {
        this.emit('test:submitting', { sessionId });
        
        const result = await this.api.submitTest(sessionId);
        
        if (result.success) {
            this.emit('test:submitted', result.result);
        } else {
            this.emit('test:error', result.error);
        }
        
        return result;
    }
}

// ==================== INITIALIZATION ====================

// Create API instance
const api = new PlacementTestAPI();

// Create event handler
const testEvents = new TestEventHandler(api);

// Example event listeners
testEvents.on('test:started', (data) => {
    console.log('✅ Test started:', data);
});

testEvents.on('test:submitted', (result) => {
    console.log('✅ Test submitted:', result);
});

testEvents.on('test:error', (error) => {
    console.error('❌ Error:', error);
});

// Export for use in HTML
window.placementTestAPI = api;
window.testEvents = testEvents;

// Log initialization
console.log('🚀 Placement Test API initialized');
console.log('📊 Available methods:', Object.getOwnPropertyNames(Plac))