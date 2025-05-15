/**
 * Storage.js - Handles local storage for Angry Parents: Christmas Edition
 * This file manages saving and loading photos, messages, and leaderboard data
 */

class GameStorage {
    constructor() {
        // Storage keys
        this.KEYS = {
            CHARACTERS: 'angryParentsCharacters',
            MESSAGES: 'angryParentsMessages',
            LEADERBOARD: 'angryParentsLeaderboard',
            GNOME_CHARACTER: 'angryParentsGnomeCharacter'
        };
        
        // Initialize storage
        this.initStorage();
    }
    
    /**
     * Initialize the local storage with empty data if it doesn't exist
     */
    initStorage() {
        // Check if storage is available
        if (!this.isStorageAvailable()) {
            console.error('LocalStorage is not available');
            return;
        }
        
        // Initialize empty arrays if they don't exist
        if (!localStorage.getItem(this.KEYS.CHARACTERS)) {
            localStorage.setItem(this.KEYS.CHARACTERS, JSON.stringify([]));
        }
        
        if (!localStorage.getItem(this.KEYS.MESSAGES)) {
            localStorage.setItem(this.KEYS.MESSAGES, JSON.stringify([]));
        }
        
        if (!localStorage.getItem(this.KEYS.LEADERBOARD)) {
            localStorage.setItem(this.KEYS.LEADERBOARD, JSON.stringify([]));
        }
        
        if (!localStorage.getItem(this.KEYS.GNOME_CHARACTER)) {
            localStorage.setItem(this.KEYS.GNOME_CHARACTER, '0');
        }
    }
    
    /**
     * Check if localStorage is available
     * @returns {boolean} True if localStorage is available
     */
    isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Save characters (photos) to localStorage
     * @param {Array} characters - Array of character data objects
     * @returns {boolean} Success or failure
     */
    saveCharacters(characters) {
        try {
            if (!this.isStorageAvailable()) return false;
            
            // Validate input
            if (!Array.isArray(characters)) {
                console.error('Invalid characters data');
                return false;
            }
            
            // Limit to 10 characters
            const charactersToSave = characters.slice(0, 10);
            
            localStorage.setItem(this.KEYS.CHARACTERS, JSON.stringify(charactersToSave));
            return true;
        } catch (e) {
            console.error('Error saving characters:', e);
            return false;
        }
    }
    
    /**
     * Load characters (photos) from localStorage
     * @returns {Array} Array of character data objects
     */
    loadCharacters() {
        try {
            if (!this.isStorageAvailable()) return [];
            
            const characterData = localStorage.getItem(this.KEYS.CHARACTERS);
            return characterData ? JSON.parse(characterData) : [];
        } catch (e) {
            console.error('Error loading characters:', e);
            return [];
        }
    }
    
    /**
     * Save funny messages to localStorage
     * @param {Array} messages - Array of message strings
     * @returns {boolean} Success or failure
     */
    saveMessages(messages) {
        try {
            if (!this.isStorageAvailable()) return false;
            
            // Validate input
            if (!Array.isArray(messages)) {
                console.error('Invalid messages data');
                return false;
            }
            
            // Limit to 15 messages and truncate if needed
            const messagesToSave = messages
                .slice(0, 15)
                .map(msg => msg.substring(0, 50));
            
            localStorage.setItem(this.KEYS.MESSAGES, JSON.stringify(messagesToSave));
            return true;
        } catch (e) {
            console.error('Error saving messages:', e);
            return false;
        }
    }
    
    /**
     * Load funny messages from localStorage
     * @returns {Array} Array of message strings
     */
    loadMessages() {
        try {
            if (!this.isStorageAvailable()) return [];
            
            const messagesData = localStorage.getItem(this.KEYS.MESSAGES);
            return messagesData ? JSON.parse(messagesData) : [];
        } catch (e) {
            console.error('Error loading messages:', e);
            return [];
        }
    }
    
    /**
     * Save gnome character selection to localStorage
     * @param {number} index - Index of the character photo to use for the gnome
     * @returns {boolean} Success or failure
     */
    saveGnomeCharacter(index) {
        try {
            if (!this.isStorageAvailable()) return false;
            
            localStorage.setItem(this.KEYS.GNOME_CHARACTER, index.toString());
            return true;
        } catch (e) {
            console.error('Error saving gnome character:', e);
            return false;
        }
    }
    
    /**
     * Load gnome character selection from localStorage
     * @returns {number} Index of the character photo to use for the gnome
     */
    loadGnomeCharacter() {
        try {
            if (!this.isStorageAvailable()) return 0;
            
            const index = localStorage.getItem(this.KEYS.GNOME_CHARACTER);
            return index ? parseInt(index, 10) : 0;
        } catch (e) {
            console.error('Error loading gnome character:', e);
            return 0;
        }
    }
    
    /**
     * Save leaderboard data to localStorage
     * @param {Array} leaderboard - Array of score objects
     * @returns {boolean} Success or failure
     */
    saveLeaderboard(leaderboard) {
        try {
            if (!this.isStorageAvailable()) return false;
            
            // Validate input
            if (!Array.isArray(leaderboard)) {
                console.error('Invalid leaderboard data');
                return false;
            }
            
            // Sort by score (highest first)
            leaderboard.sort((a, b) => b.score - a.score);
            
            // Limit to top 10
            const leaderboardToSave = leaderboard.slice(0, 10);
            
            localStorage.setItem(this.KEYS.LEADERBOARD, JSON.stringify(leaderboardToSave));
            return true;
        } catch (e) {
            console.error('Error saving leaderboard:', e);
            return false;
        }
    }
    
    /**
     * Load leaderboard data from localStorage
     * @returns {Array} Array of score objects
     */
    loadLeaderboard() {
        try {
            if (!this.isStorageAvailable()) return [];
            
            const leaderboardData = localStorage.getItem(this.KEYS.LEADERBOARD);
            return leaderboardData ? JSON.parse(leaderboardData) : [];
        } catch (e) {
            console.error('Error loading leaderboard:', e);
            return [];
        }
    }
    
    /**
     * Add a new score to the leaderboard
     * @param {string} name - Player name
     * @param {number} score - Player score
     * @returns {boolean} Success or failure
     */
    addScoreToLeaderboard(name, score) {
        try {
            if (!this.isStorageAvailable()) return false;
            
            // Validate input
            if (typeof name !== 'string' || typeof score !== 'number') {
                console.error('Invalid score data');
                return false;
            }
            
            // Truncate name if needed
            const playerName = name.substring(0, 20);
            
            // Get existing leaderboard
            const leaderboard = this.loadLeaderboard();
            
            // Add new score
            leaderboard.push({
                name: playerName,
                score: score,
                date: new Date().toISOString()
            });
            
            // Save updated leaderboard
            return this.saveLeaderboard(leaderboard);
        } catch (e) {
            console.error('Error adding score to leaderboard:', e);
            return false;
        }
    }
    
    /**
     * Clear all game data from localStorage
     * @returns {boolean} Success or failure
     */
    clearAllData() {
        try {
            if (!this.isStorageAvailable()) return false;
            
            localStorage.removeItem(this.KEYS.CHARACTERS);
            localStorage.removeItem(this.KEYS.MESSAGES);
            localStorage.removeItem(this.KEYS.LEADERBOARD);
            localStorage.removeItem(this.KEYS.GNOME_CHARACTER);
            
            // Re-initialize with empty values
            this.initStorage();
            
            return true;
        } catch (e) {
            console.error('Error clearing all data:', e);
            return false;
        }
    }
    
    /**
     * Get the estimated storage usage in MB
     * @returns {number} Estimated storage usage in MB
     */
    getStorageUsage() {
        try {
            if (!this.isStorageAvailable()) return 0;
            
            let totalSize = 0;
            
            // Estimate size of each storage item
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('angryParents')) {
                    const value = localStorage.getItem(key);
                    totalSize += key.length + value.length;
                }
            }
            
            // Convert to MB
            return totalSize / (1024 * 1024);
        } catch (e) {
            console.error('Error getting storage usage:', e);
            return 0;
        }
    }
}

// Create a global instance for the game to use
const gameStorage = new GameStorage();
