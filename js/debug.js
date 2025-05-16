/**
 * debug.js - Debugging utilities for Angry Parents: Christmas Edition
 */

// Create a debug logger that shows messages on screen
const GameDebug = {
    // Keep track of messages to avoid duplicates
    messages: new Set(),
    
    // DOM element for showing messages
    debugElement: null,
    
    // Initialize debug panel
    init: function() {
        // Create debug panel if it doesn't exist
        if (!this.debugElement) {
            this.debugElement = document.createElement('div');
            this.debugElement.id = 'game-debug-panel';
            this.debugElement.style.position = 'fixed';
            this.debugElement.style.bottom = '10px';
            this.debugElement.style.left = '10px';
            this.debugElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            this.debugElement.style.color = 'white';
            this.debugElement.style.padding = '10px';
            this.debugElement.style.borderRadius = '5px';
            this.debugElement.style.fontFamily = 'monospace';
            this.debugElement.style.fontSize = '12px';
            this.debugElement.style.maxWidth = '80%';
            this.debugElement.style.maxHeight = '200px';
            this.debugElement.style.overflow = 'auto';
            this.debugElement.style.zIndex = '10000';
            
            // Add close button
            const closeBtn = document.createElement('button');
            closeBtn.textContent = 'Clear';
            closeBtn.style.position = 'absolute';
            closeBtn.style.top = '5px';
            closeBtn.style.right = '5px';
            closeBtn.style.fontSize = '10px';
            closeBtn.style.padding = '2px 5px';
            closeBtn.onclick = () => this.clear();
            
            this.debugElement.appendChild(closeBtn);
            
            // Add messages container
            const messagesContainer = document.createElement('div');
            messagesContainer.id = 'debug-messages';
            messagesContainer.style.marginTop = '20px';
            this.debugElement.appendChild(messagesContainer);
            
            document.body.appendChild(this.debugElement);
        }
        
        return this;
    },
    
    // Log a message to both console and debug panel
    log: function(message, type = 'info') {
        // Always log to console
        console.log(`[DEBUG] ${message}`);
        
        // Initialize if not already done
        if (!this.debugElement) {
            this.init();
        }
        
        // Create unique key for this message
        const key = `${type}:${message}`;
        
        // Don't add duplicate messages
        if (this.messages.has(key)) {
            return;
        }
        
        // Add to tracking set
        this.messages.add(key);
        
        // Add to panel
        const msgElement = document.createElement('div');
        msgElement.textContent = message;
        msgElement.style.borderBottom = '1px solid #444';
        msgElement.style.padding = '3px 0';
        
        // Set color based on type
        switch (type) {
            case 'error':
                msgElement.style.color = '#ff6b6b';
                break;
            case 'warning':
                msgElement.style.color = '#feca57';
                break;
            case 'success':
                msgElement.style.color = '#1dd1a1';
                break;
            default:
                msgElement.style.color = '#54a0ff';
        }
        
        const messagesContainer = document.querySelector('#debug-messages');
        if (messagesContainer) {
            messagesContainer.appendChild(msgElement);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    },
    
    // Log an error message
    error: function(message) {
        this.log(message, 'error');
    },
    
    // Log a warning message
    warn: function(message) {
        this.log(message, 'warning');
    },
    
    // Log a success message
    success: function(message) {
        this.log(message, 'success');
    },
    
    // Clear all messages
    clear: function() {
        this.messages.clear();
        const messagesContainer = document.querySelector('#debug-messages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
        }
    }
};

// Initialize the debug panel when the script loads
document.addEventListener('DOMContentLoaded', function() {
    GameDebug.init();
    GameDebug.log('Debug panel initialized');
});
