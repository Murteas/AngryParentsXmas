/**
 * utility.js - Helper functions for Angry Parents: Christmas Edition
 * Contains utility functions for browser detection, mobile optimization, etc.
 */

/**
 * Detect if the user is on a mobile device
 * @returns {boolean} True if on mobile device
 */
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
}

/**
 * Detect if the user is on an iOS device
 * @returns {boolean} True if on iOS device
 */
function isIOSDevice() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

/**
 * Optimize the game for the current device
 * @param {HTMLCanvasElement} canvas - The game canvas
 */
function optimizeForDevice(canvas) {
    if (isMobileDevice()) {
        // Prevent zoom gestures on mobile
        document.addEventListener('touchmove', function(event) {
            if (event.scale !== 1) {
                event.preventDefault();
            }
        }, { passive: false });
        
        // Add viewport meta tag to prevent unwanted scaling
        const metaTag = document.createElement('meta');
        metaTag.name = 'viewport';
        metaTag.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        document.head.appendChild(metaTag);
        
        // Special handling for iOS devices
        if (isIOSDevice()) {
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.height = '100%';
            document.body.style.overflow = 'hidden';
        }
    }
}

/**
 * Check if WebAssembly is supported in this browser
 * @returns {boolean} True if WebAssembly is supported
 */
function isWebAssemblySupported() {
    try {
        if (typeof WebAssembly === 'object' &&
            typeof WebAssembly.instantiate === 'function') {
            const module = new WebAssembly.Module(new Uint8Array([0,97,115,109,1,0,0,0]));
            if (module instanceof WebAssembly.Module) {
                const instance = new WebAssembly.Instance(module);
                return instance instanceof WebAssembly.Instance;
            }
        }
    } catch (e) {}
    return false;
}

/**
 * Normalize touch events to work like mouse events
 * @param {HTMLElement} element - The element to normalize events for
 * @param {Object} callbacks - Callback functions for different events
 */
function normalizeTouchEvents(element, callbacks) {
    // Store the callback functions
    const mouseDown = callbacks.mouseDown || function() {};
    const mouseMove = callbacks.mouseMove || function() {};
    const mouseUp = callbacks.mouseUp || function() {};
    
    // Track if the user is touching the screen
    let touching = false;
    
    // Add touch event listeners
    element.addEventListener('touchstart', function(e) {
        e.preventDefault();
        touching = true;
        
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            mouseDown(mouseEvent);
        }
    }, { passive: false });
    
    element.addEventListener('touchmove', function(e) {
        if (!touching) return;
        e.preventDefault();
        
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            mouseMove(mouseEvent);
        }
    }, { passive: false });
    
    element.addEventListener('touchend', function(e) {
        e.preventDefault();
        touching = false;
        
        const mouseEvent = new MouseEvent('mouseup', {});
        mouseUp(mouseEvent);
    }, { passive: false });
    
    // Also add regular mouse event listeners for desktop
    element.addEventListener('mousedown', mouseDown);
    element.addEventListener('mousemove', mouseMove);
    element.addEventListener('mouseup', mouseUp);
}

// Export functions
window.GameUtils = {
    isMobileDevice,
    isIOSDevice,
    optimizeForDevice,
    isWebAssemblySupported,
    normalizeTouchEvents
};
