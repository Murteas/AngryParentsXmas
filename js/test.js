/**
 * Simple test script to check if the game loads and initializes properly
 */

// Wait for the DOM to load
window.addEventListener('DOMContentLoaded', function() {
    console.log("🧪 TEST: DOM loaded");
    
    // Check if key elements exist
    const canvas = document.getElementById('gameCanvas');
    const startBtn = document.getElementById('startBtn');
    const customizeBtn = document.getElementById('customizeBtn');
    
    if (canvas) {
        console.log("🧪 TEST: Game canvas found ✅");
    } else {
        console.error("🧪 TEST: Game canvas not found ❌");
    }
    
    if (startBtn) {
        console.log("🧪 TEST: Start button found ✅");
    } else {
        console.error("🧪 TEST: Start button not found ❌");
    }
    
    if (customizeBtn) {
        console.log("🧪 TEST: Customize button found ✅");
    } else {
        console.error("🧪 TEST: Customize button not found ❌");
    }
    
    // Check if scripts are loaded properly
    if (typeof gameStorage !== 'undefined') {
        console.log("🧪 TEST: gameStorage initialized ✅");
        console.log("🧪 TEST: localStorage available:", gameStorage.isStorageAvailable());
    } else {
        console.error("🧪 TEST: gameStorage not initialized ❌");
    }
    
    if (typeof gamePhysics !== 'undefined') {
        console.log("🧪 TEST: gamePhysics referenced ✅");
    } else {
        console.error("🧪 TEST: gamePhysics not found ❌");
    }
    
    if (typeof Box2D !== 'undefined') {
        console.log("🧪 TEST: Box2D loaded ✅");
    } else {
        console.warn("🧪 TEST: Box2D not loaded (might load asynchronously) ⚠️");
    }
    
    // Test basic game functionality
    console.log("🧪 TEST: Testing basic button functionality");
    
    // 1. Test start button click event
    try {
        const startBtnEvent = new Event('click');
        startBtn.dispatchEvent(startBtnEvent);
        console.log("🧪 TEST: Start button click event dispatched ✅");
        
        // Check if player name input is shown
        const playerNameInput = document.getElementById('playerNameInput');
        if (playerNameInput && !playerNameInput.classList.contains('d-none')) {
            console.log("🧪 TEST: Player name input shown correctly ✅");
        } else {
            console.error("🧪 TEST: Player name input not shown ❌");
        }
    } catch (e) {
        console.error("🧪 TEST: Error testing start button:", e);
    }
    
    // Check if loading screen elements exist
    const loadingScreen = document.getElementById('loadingScreen');
    const loadingProgress = document.getElementById('loadingProgress');
    const loadingMessage = document.getElementById('loadingMessage');
    
    if (loadingScreen) {
        console.log("🧪 TEST: Loading screen found ✅");
    } else {
        console.error("🧪 TEST: Loading screen not found ❌");
    }
    
    if (loadingProgress) {
        console.log("🧪 TEST: Loading progress bar found ✅");
    } else {
        console.error("🧪 TEST: Loading progress bar not found ❌");
    }
    
    if (loadingMessage) {
        console.log("🧪 TEST: Loading message found ✅");
    } else {
        console.error("🧪 TEST: Loading message not found ❌");
    }
    
    // Test loading screen functions if they exist
    if (typeof updateLoadingProgress === 'function') {
        console.log("🧪 TEST: updateLoadingProgress function available ✅");
        
        // Manual test of loading progress updates
        try {
            updateLoadingProgress(25, "Testing loading progress...");
            console.log("🧪 TEST: updateLoadingProgress executed without error ✅");
        } catch (e) {
            console.error("🧪 TEST: updateLoadingProgress execution failed ❌", e);
        }
    } else {
        console.warn("🧪 TEST: updateLoadingProgress function not available yet ⚠️");
    }
    
    // Test error handling function if it exists
    if (typeof showLoadingError === 'function') {
        console.log("🧪 TEST: showLoadingError function available ✅");
    } else {
        console.warn("🧪 TEST: showLoadingError function not available yet ⚠️");
    }
    
    console.log("🧪 TEST: Test script completed");
});
