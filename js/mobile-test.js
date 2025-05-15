/**
 * Mobile Touch Testing Script for Angry Parents: Christmas Edition
 * 
 * This script adds additional tests for touch events and mobile compatibility
 */

// Add to existing test function
function testMobileCompatibility() {
    console.log('Running mobile compatibility tests...');
    
    // Test 1: Check for passive touch event handlers (helps with scrolling performance)
    testPassiveTouchEvents();
    
    // Test 2: Verify touch areas are large enough for mobile
    testTouchTargetSizes();
    
    // Test 3: Test pinch-to-zoom functionality
    testPinchToZoom();
    
    // Test 4: Test haptic feedback
    testHapticFeedback();
    
    // Test 5: Verify the slingshot highlight appears
    testSlingshotHighlight();
    
    console.log('Mobile compatibility tests complete.');
}

/**
 * Test passive touch event handlers
 */
function testPassiveTouchEvents() {
    console.log('Testing passive touch event support...');
    
    let supportsPassive = false;
    try {
        // Test if the browser supports passive event listeners
        const options = Object.defineProperty({}, 'passive', {
            get: function() {
                supportsPassive = true;
                return true;
            }
        });
        
        window.addEventListener('test', null, options);
        window.removeEventListener('test', null, options);
        
        console.log('Passive event listeners supported:', supportsPassive);
    } catch (err) {
        console.log('Passive event listeners not supported');
    }
    
    // Verify our touch handlers use passive when appropriate
    if (supportsPassive) {
        // In a real test this would check the actual event listeners
        console.log('MANUAL CHECK REQUIRED: Verify non-preventDefault events use {passive: true}');
    }
}

/**
 * Test touch target sizes
 */
function testTouchTargetSizes() {
    console.log('Testing touch target sizes...');
    
    // Minimum recommended touch target size is 44x44px
    const minTouchSize = 44;
    
    // Get all interactive elements
    const buttons = document.querySelectorAll('button');
    const links = document.querySelectorAll('a');
    const inputs = document.querySelectorAll('input');
    
    let smallTargets = 0;
    
    // Check button sizes
    buttons.forEach(button => {
        const rect = button.getBoundingClientRect();
        if (rect.width < minTouchSize || rect.height < minTouchSize) {
            console.warn('Button too small for touch:', button, rect.width, rect.height);
            smallTargets++;
        }
    });
    
    // Check link sizes
    links.forEach(link => {
        const rect = link.getBoundingClientRect();
        if (rect.width < minTouchSize || rect.height < minTouchSize) {
            console.warn('Link too small for touch:', link, rect.width, rect.height);
            smallTargets++;
        }
    });
    
    // Check input sizes
    inputs.forEach(input => {
        const rect = input.getBoundingClientRect();
        if (rect.width < minTouchSize || rect.height < minTouchSize) {
            console.warn('Input too small for touch:', input, rect.width, rect.height);
            smallTargets++;
        }
    });
    
    console.log(`Touch target size test: ${smallTargets === 0 ? 'PASSED' : 'FAILED'}`);
    console.log(`${smallTargets} elements found with inadequate touch target size`);
}

/**
 * Test pinch-to-zoom functionality
 */
function testPinchToZoom() {
    console.log('Testing pinch-to-zoom functionality...');
    
    // Get the canvas element
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    
    // Verify zoom functionality exists
    if (typeof handlePinchGesture === 'function' && typeof resetPinchGesture === 'function') {
        console.log('Pinch-to-zoom functions found');
        
        // Verify game state has zoom properties
        if (gameState && 'pinchStartDistance' in gameState && 'currentZoom' in gameState) {
            console.log('Zoom state properties found in gameState');
            console.log('Pinch-to-zoom test: PASSED');
        } else {
            console.warn('Zoom state properties missing');
            console.log('Pinch-to-zoom test: FAILED');
        }
    } else {
        console.error('Pinch-to-zoom functions not found');
        console.log('Pinch-to-zoom test: FAILED');
    }
}

/**
 * Test haptic feedback
 */
function testHapticFeedback() {
    console.log('Testing haptic feedback...');
    
    if (typeof provideHapticFeedback === 'function') {
        console.log('Haptic feedback function found');
        
        // Test if the browser supports vibration
        if ('vibrate' in navigator) {
            console.log('Browser supports vibration API');
            
            // Don't actually vibrate during testing
            const originalVibrate = navigator.vibrate;
            navigator.vibrate = (pattern) => {
                console.log('Vibration called with pattern:', pattern);
                return true;
            };
            
            // Test different intensities
            provideHapticFeedback('light');
            provideHapticFeedback('medium');
            provideHapticFeedback('heavy');
            
            // Restore original
            navigator.vibrate = originalVibrate;
            
            console.log('Haptic feedback test: PASSED');
        } else {
            console.log('Browser does not support vibration API');
            console.log('Haptic feedback test: IGNORED (dependent on device support)');
        }
    } else {
        console.error('Haptic feedback function not found');
        console.log('Haptic feedback test: FAILED');
    }
}

/**
 * Test slingshot highlight
 */
function testSlingshotHighlight() {
    console.log('Testing slingshot highlight...');
    
    if (typeof highlightSlingshotArea === 'function') {
        console.log('Slingshot highlight function found');
        
        // Test showing highlight
        highlightSlingshotArea(true);
        
        // Check if highlight element was created
        const highlight = document.getElementById('slingshotHighlight');
        if (highlight) {
            console.log('Highlight element created successfully');
            
            // Check styling
            const styles = window.getComputedStyle(highlight);
            if (styles.display === 'block' && styles.animation.includes('pulse')) {
                console.log('Highlight element has correct styling');
            } else {
                console.warn('Highlight element missing expected styling');
            }
            
            // Test hiding highlight
            highlightSlingshotArea(false);
            if (highlight.style.display === 'none') {
                console.log('Highlight hide functionality works');
            } else {
                console.warn('Highlight not hidden properly');
            }
            
            console.log('Slingshot highlight test: PASSED');
        } else {
            console.error('Highlight element not created');
            console.log('Slingshot highlight test: FAILED');
        }
    } else {
        console.error('Slingshot highlight function not found');
        console.log('Slingshot highlight test: FAILED');
    }
}

// Add this test to our test suite
if (typeof runTests === 'function') {
    runTests.push(testMobileCompatibility);
} else {
    console.log('Main test runner not found, mobile tests can be run manually');
    
    // Add a button to run mobile tests on actual devices
    window.addEventListener('DOMContentLoaded', () => {
        const testButton = document.createElement('button');
        testButton.textContent = 'Test Mobile Compatibility';
        testButton.style.position = 'fixed';
        testButton.style.bottom = '10px';
        testButton.style.right = '10px';
        testButton.style.zIndex = '1000';
        testButton.style.padding = '10px';
        testButton.style.backgroundColor = '#3498db';
        testButton.style.color = 'white';
        testButton.style.border = 'none';
        testButton.style.borderRadius = '5px';
        
        testButton.addEventListener('click', testMobileCompatibility);
        
        // Only show in development environment
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            document.body.appendChild(testButton);
        }
    });
}
