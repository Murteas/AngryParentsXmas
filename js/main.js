/**
 * Main.js - Entry point for Angry Parents: Christmas Edition
 * This file initializes the game and connects all the components
 */

// Configuration
const APP_CONFIG = {
    // Game settings
    ROUND_TIME: 120, // 2 minutes in seconds
    MAX_LAUNCHES: 5,
    TARGETS_PER_ROUND: 15,
    
    // Score values
    TARGET_VALUES: {
        present: 10,
        ornament: 20,
        gnome: 50,
        tree: 50
    },
    
    // Bonus values
    TREX_UNLOCK_SCORE: 500,
    PERFECT_SHOT_BONUS: 20,
    QUICK_ROUND_BONUS: 50,
    TREX_BONUS: 100,
    
    // Physics settings
    PHYSICS_SCALE: 30, // pixels per meter
    
    // Asset paths
    ASSETS: {
        IMAGES: {
            BACKGROUND: 'assets/images/background.png',
            SLINGSHOT: 'assets/images/slingshot.png',
            PRESENT: 'assets/images/present.png',
            ORNAMENT: 'assets/images/ornament.png',
            GNOME: 'assets/images/gnome.png',
            TREE: 'assets/images/tree.png',
            TREX: 'assets/images/trex.png'
        },
        AUDIO: {
            JINGLE_BELL: 'assets/audio/jingle-bell.mp3',
            TREX_ROAR: 'assets/audio/trex-roar.mp3',
            HOHOHO: 'assets/audio/hohoho.mp3',
            BACKGROUND_MUSIC: 'assets/audio/background-music.mp3'
        }
    }
};

// Wait for the DOM to load before initializing the game
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing Angry Parents: Christmas Edition');
    
    // Show loading screen
    showLoadingScreen();
    
    try {
        // Update loading progress
        updateLoadingProgress(10, 'Initializing physics engine...');
        
        // Initialize Box2D physics
        const physicsInitialized = await gamePhysics.init();
        if (!physicsInitialized) {
            throw new Error('Failed to initialize physics engine');
        }
        
        // Update loading progress
        updateLoadingProgress(30, 'Setting up game environment...');
        
        // Initialize the game
        initGame();
        
        // Update loading progress
        updateLoadingProgress(50, 'Configuring controls...');
        
        // Set up event listeners
        setupEventListeners();
        
        // Update loading progress
        updateLoadingProgress(70, 'Checking assets...');
        
        // Check for placeholder assets
        await checkAssetsExist();
        
        // Update loading progress
        updateLoadingProgress(90, 'Loading game assets...');
        
        // Preload essential assets
        await preloadEssentialAssets();
        
        // Complete loading
        updateLoadingProgress(100, 'Ready to play!');
        
        // Hide loading screen and show game container after a short delay
        setTimeout(() => {
            hideLoadingScreen();
            document.getElementById('gameContainer').classList.remove('d-none');
        }, 500);
    } catch (error) {
        console.error('Game initialization error:', error);
        showLoadingError(error.message || 'Failed to initialize the game');
    }
});

/**
 * Initialize the game components
 */
function initGame() {
    // Get the canvas and resize it
    const canvas = document.getElementById('gameCanvas');
    const gameArea = document.querySelector('.game-area');
    
    canvas.width = gameArea.clientWidth;
    canvas.height = gameArea.clientHeight;
    
    // Add window resize handler
    window.addEventListener('resize', () => {
        canvas.width = gameArea.clientWidth;
        canvas.height = gameArea.clientHeight;
        
        // Recreate boundaries if physics is initialized
        if (gamePhysics.world) {
            gamePhysics.clearBodies();
            gamePhysics.createBoundaries(canvas.width, canvas.height);
        }
    });
    
    // Create physics boundaries
    gamePhysics.createBoundaries(canvas.width, canvas.height);
}

/**
 * Set up all event listeners for the game
 */
function setupEventListeners() {
    // Navigation buttons
    document.getElementById('startBtn').addEventListener('click', showPlayerNameInput);
    document.getElementById('customizeBtn').addEventListener('click', showCustomizationForm);
    document.getElementById('leaderboardBtn').addEventListener('click', showLeaderboard);
    document.getElementById('helpBtn').addEventListener('click', showHelpScreen);
    document.getElementById('toggleMusicBtn').addEventListener('click', toggleMusic);
    
    // Player name input
    document.getElementById('submitPlayerNameBtn').addEventListener('click', startGame);
    
    // Game over buttons
    document.getElementById('playAgainBtn').addEventListener('click', showPlayerNameInput);
    document.getElementById('viewLeaderboardBtn').addEventListener('click', showLeaderboard);
    
    // Close buttons
    document.getElementById('closeLeaderboardBtn').addEventListener('click', hideLeaderboard);
    document.getElementById('closeHelpBtn').addEventListener('click', hideHelpScreen);
    document.getElementById('cancelCustomizeBtn').addEventListener('click', hideCustomizationForm);
    
    // Canvas touch/mouse events for slingshot
    const canvas = document.getElementById('gameCanvas');
    
    // Mouse events
    canvas.addEventListener('mousedown', handleTouchStart);
    canvas.addEventListener('mousemove', handleTouchMove);
    canvas.addEventListener('mouseup', handleTouchEnd);
    
    // Touch events
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        handleTouchStart({
            clientX: touch.clientX,
            clientY: touch.clientY
        });
    }, { passive: false });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        handleTouchMove({
            clientX: touch.clientX,
            clientY: touch.clientY
        });
    }, { passive: false });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        handleTouchEnd();
    }, { passive: false });
    
    // Pinch-to-zoom gesture
    canvas.addEventListener('touchmove', handlePinchGesture, { passive: false });
    canvas.addEventListener('touchend', resetPinchGesture);
}

// Game state
let gameState = {
    isRunning: false,
    isLaunching: false,
    score: 0,
    launchesRemaining: APP_CONFIG.MAX_LAUNCHES,
    timeRemaining: APP_CONFIG.ROUND_TIME,
    targetsHit: 0,
    targetsTotal: 0,
    trexUnlocked: false,
    playerName: '',
    isTouching: false,
    touchStart: { x: 0, y: 0 },
    touchCurrent: { x: 0, y: 0 },
    pinchStartDistance: null,
    currentZoom: 1.0,
    gameLoopInterval: null
};

// Assets
let gameAssets = {
    images: {},
    audio: {}
};

/**
 * Show the player name input screen
 */
function showPlayerNameInput() {
    // Hide other screens
    hideGameOverScreen();
    hideLeaderboard();
    hideHelpScreen();
    hideCustomizationForm();
    
    // Show player name input
    document.getElementById('playerNameInput').classList.remove('d-none');
    document.getElementById('playerName').focus();
}

/**
 * Show the customization form
 */
function showCustomizationForm() {
    // Hide other screens
    hideGameOverScreen();
    hideLeaderboard();
    hideHelpScreen();
    document.getElementById('playerNameInput').classList.add('d-none');
    
    // Show customization form
    document.getElementById('customizeForm').classList.remove('d-none');
}

/**
 * Hide the customization form
 */
function hideCustomizationForm() {
    document.getElementById('customizeForm').classList.add('d-none');
}

/**
 * Show the leaderboard
 */
function showLeaderboard() {
    // Hide other screens
    hideGameOverScreen();
    hideHelpScreen();
    hideCustomizationForm();
    document.getElementById('playerNameInput').classList.add('d-none');
    
    // Show leaderboard
    document.getElementById('leaderboard').classList.remove('d-none');
    
    // Populate leaderboard with data
    populateLeaderboard();
}

/**
 * Hide the leaderboard
 */
function hideLeaderboard() {
    document.getElementById('leaderboard').classList.add('d-none');
}

/**
 * Show the help screen
 */
function showHelpScreen() {
    // Hide other screens
    hideGameOverScreen();
    hideLeaderboard();
    hideCustomizationForm();
    document.getElementById('playerNameInput').classList.add('d-none');
    
    // Show help screen
    document.getElementById('helpScreen').classList.remove('d-none');
}

/**
 * Hide the help screen
 */
function hideHelpScreen() {
    document.getElementById('helpScreen').classList.add('d-none');
}

/**
 * Hide the game over screen
 */
function hideGameOverScreen() {
    document.getElementById('gameOverScreen').classList.add('d-none');
}

/**
 * Toggle background music
 */
function toggleMusic() {
    const musicIcon = document.querySelector('.music-icon');
    const backgroundMusic = gameAssets.audio.backgroundMusic;
    
    if (!backgroundMusic) return;
    
    if (musicIcon.textContent === '🔊') {
        // Turn off music
        musicIcon.textContent = '🔇';
        backgroundMusic.pause();
    } else {
        // Turn on music
        musicIcon.textContent = '🔊';
        if (gameState.isRunning) {
            backgroundMusic.play();
        }
    }
}

/**
 * Populate the leaderboard with scores from localStorage
 */
function populateLeaderboard() {
    const leaderboard = gameStorage.loadLeaderboard();
    const tableBody = document.getElementById('leaderboardBody');
    
    // Clear the table
    tableBody.innerHTML = '';
    
    if (leaderboard.length === 0) {
        // No scores yet
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="3" class="text-center">No scores yet</td>';
        tableBody.appendChild(row);
    } else {
        // Add each score to the table
        leaderboard.forEach((entry, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${entry.name}</td>
                <td>${entry.score}</td>
            `;
            tableBody.appendChild(row);
        });
    }
}

/**
 * Start a new game round
 */
function startGame() {
    // Get player name
    const playerNameInput = document.getElementById('playerName');
    gameState.playerName = playerNameInput.value.trim() || 'Player';
    
    // Validate player name
    if (gameState.playerName.length > 20) {
        gameState.playerName = gameState.playerName.substring(0, 20);
    }
    
    // Hide player name input
    document.getElementById('playerNameInput').classList.add('d-none');
    
    // Reset game state
    gameState.score = 0;
    gameState.launchesRemaining = APP_CONFIG.MAX_LAUNCHES;
    gameState.timeRemaining = APP_CONFIG.ROUND_TIME;
    gameState.targetsHit = 0;
    gameState.trexUnlocked = false;
    gameState.isRunning = true;
    
    // Update UI
    updateScoreDisplay();
    
    // Clear existing game loop if running
    if (gameState.gameLoopInterval) {
        clearInterval(gameState.gameLoopInterval);
    }
    
    // Create targets
    createTargets();
    
    // Show a loading indicator while we load the game assets
    const loadingIndicator = document.createElement('div');
    loadingIndicator.classList.add('loading-indicator');
    loadingIndicator.textContent = 'Loading game assets...';
    document.querySelector('.game-area').appendChild(loadingIndicator);
    
    // Load images and audio
    loadGameAssets()
        .then((success) => {
            // Remove loading indicator
            document.querySelector('.game-area').removeChild(loadingIndicator);
            
            if (success) {
                // Start game loop
                startGameLoop();
                
                // Start background music if enabled
                if (document.querySelector('.music-icon').textContent === '🔊' && gameAssets.audio.backgroundMusic) {
                    gameAssets.audio.backgroundMusic.play().catch(e => {
                        console.warn('Could not play background music. Browser may require user interaction first:', e);
                    });
                }
            } else {
                throw new Error('Failed to load game assets');
            }
        })
        .catch(error => {
            console.error('Failed to load game assets:', error);
            // Remove loading indicator if it exists
            if (document.querySelector('.loading-indicator')) {
                document.querySelector('.game-area').removeChild(loadingIndicator);
            }
            
            // Show error message
            showError('Failed to load game assets. Please try again.');
            
            // Return to main menu
            gameState.isRunning = false;
            document.getElementById('playerNameInput').classList.remove('d-none');
        });
}

/**
 * Load game assets (images and audio)
 */
async function loadGameAssets() {
    // Show loading progress in-game
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'in-game-loading';
    loadingDiv.innerHTML = `
        <div class="loading-content">
            <p>Loading game assets...</p>
            <div class="progress">
                <div id="inGameLoadingProgress" class="progress-bar progress-bar-striped progress-bar-animated" 
                     role="progressbar" style="width: 0%"></div>
            </div>
        </div>
    `;
    document.getElementById('gameContainer').appendChild(loadingDiv);
    
    // Function to load an image with progress tracking
    const loadImage = (key, src, index, total) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                gameAssets.images[key] = img;
                updateInGameLoadingProgress((index / total) * 100);
                resolve();
            };
            img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
            img.src = src;
        });
    };
    
    // Function to load audio with progress tracking
    const loadAudio = (key, src, index, total) => {
        return new Promise((resolve) => {
            try {
                const audio = new Audio();
                audio.addEventListener('canplaythrough', () => {
                    gameAssets.audio[key] = audio;
                    updateInGameLoadingProgress((index / total) * 100);
                    resolve();
                }, { once: true });
                
                // If loading fails, resolve anyway to prevent blocking the game
                audio.addEventListener('error', () => {
                    console.warn(`Failed to load audio: ${src}`);
                    updateInGameLoadingProgress((index / total) * 100);
                    resolve();
                });
                
                audio.src = src;
                audio.load();
            } catch (e) {
                console.warn(`Error initializing audio: ${src}`, e);
                updateInGameLoadingProgress((index / total) * 100);
                resolve();
            }
        });
    };
    
    try {
        // Calculate total assets for progress tracking
        const imagesToLoad = 7; // All images from APP_CONFIG.ASSETS.IMAGES
        const audioToLoad = 4;  // All audio from APP_CONFIG.ASSETS.AUDIO
        const totalAssets = imagesToLoad + audioToLoad;
        let currentAssetIndex = 0;
        
        // Load images
        await Promise.all([
            loadImage('background', APP_CONFIG.ASSETS.IMAGES.BACKGROUND, currentAssetIndex++, totalAssets),
            loadImage('slingshot', APP_CONFIG.ASSETS.IMAGES.SLINGSHOT, currentAssetIndex++, totalAssets),
            loadImage('present', APP_CONFIG.ASSETS.IMAGES.PRESENT, currentAssetIndex++, totalAssets),
            loadImage('ornament', APP_CONFIG.ASSETS.IMAGES.ORNAMENT, currentAssetIndex++, totalAssets),
            loadImage('gnome', APP_CONFIG.ASSETS.IMAGES.GNOME, currentAssetIndex++, totalAssets),
            loadImage('tree', APP_CONFIG.ASSETS.IMAGES.TREE, currentAssetIndex++, totalAssets),
            loadImage('trex', APP_CONFIG.ASSETS.IMAGES.TREX, currentAssetIndex++, totalAssets)
        ]);
        
        // Load audio
        await Promise.all([
            loadAudio('jingleBell', APP_CONFIG.ASSETS.AUDIO.JINGLE_BELL, currentAssetIndex++, totalAssets),
            loadAudio('trexRoar', APP_CONFIG.ASSETS.AUDIO.TREX_ROAR, currentAssetIndex++, totalAssets),
            loadAudio('hohoho', APP_CONFIG.ASSETS.AUDIO.HOHOHO, currentAssetIndex++, totalAssets),
            loadAudio('backgroundMusic', APP_CONFIG.ASSETS.AUDIO.BACKGROUND_MUSIC, currentAssetIndex++, totalAssets)
        ]);
        
        // Configure background music
        if (gameAssets.audio.backgroundMusic) {
            gameAssets.audio.backgroundMusic.loop = true;
            gameAssets.audio.backgroundMusic.volume = 0.5;
        }
        
        // Remove the loading div
        setTimeout(() => {
            document.getElementById('gameContainer').removeChild(loadingDiv);
        }, 500);
        
        return true;
    } catch (error) {
        console.error('Error loading assets:', error);
        
        // Remove the loading div
        if (document.getElementById('gameContainer').contains(loadingDiv)) {
            document.getElementById('gameContainer').removeChild(loadingDiv);
        }
        
        return false;
    }
}

/**
 * Update the in-game loading progress
 * @param {number} progress - Progress percentage (0-100)
 */
function updateInGameLoadingProgress(progress) {
    const progressBar = document.getElementById('inGameLoadingProgress');
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
        progressBar.setAttribute('aria-valuenow', progress);
    }
}

/**
 * Preload essential assets needed before starting the game
 */
async function preloadEssentialAssets() {
    // Function to load an image with proper progress tracking
    const loadImage = (key, src, progressCallback) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                gameAssets.images[key] = img;
                progressCallback && progressCallback(1);
                resolve({ success: true, key });
            };
            
            img.onerror = () => {
                progressCallback && progressCallback(1, true);
                reject(new Error(`Failed to load image: ${src}`));
            };
            
            img.src = src;
        });
    };
    
    // Function to load audio with proper progress tracking
    const loadAudio = (key, src, progressCallback) => {
        return new Promise((resolve) => {
            try {
                const audio = new Audio();
                
                audio.addEventListener('canplaythrough', () => {
                    gameAssets.audio[key] = audio;
                    progressCallback && progressCallback(1);
                    resolve({ success: true, key });
                }, { once: true });
                
                // If loading fails, log it but don't block the game
                audio.addEventListener('error', () => {
                    console.warn(`Failed to load audio: ${src}`);
                    progressCallback && progressCallback(1, true);
                    resolve({ success: false, key, error: `Failed to load audio: ${src}` });
                });
                
                audio.src = src;
                audio.load();
            } catch (e) {
                console.warn(`Error initializing audio: ${src}`, e);
                progressCallback && progressCallback(1, true);
                resolve({ success: false, key, error: e.message });
            }
        });
    };
    
    try {
        // Define essential assets to load
        const essentialAssetsList = [
            { type: 'image', key: 'background', src: APP_CONFIG.ASSETS.IMAGES.BACKGROUND },
            { type: 'image', key: 'slingshot', src: APP_CONFIG.ASSETS.IMAGES.SLINGSHOT }
        ];
        
        // Total number of assets to load
        const totalAssets = essentialAssetsList.length;
        let loadedAssets = 0;
        let failedAssets = 0;
        
        // Create progress tracker
        const progressCallback = (increment, isError = false) => {
            loadedAssets += increment;
            if (isError) failedAssets += increment;
            
            const progressPercent = Math.min(Math.floor((loadedAssets / totalAssets) * 100), 100);
            updateLoadingProgress(progressPercent, `Loading assets (${loadedAssets}/${totalAssets})`);
        };
        
        // Create promises for all assets
        const assetPromises = essentialAssetsList.map(asset => {
            if (asset.type === 'image') {
                return loadImage(asset.key, asset.src, progressCallback);
            } else if (asset.type === 'audio') {
                return loadAudio(asset.key, asset.src, progressCallback);
            }
        });
        
        // Wait for all essential assets to load
        const results = await Promise.allSettled(assetPromises);
        
        // Check for any critical failures
        const failedCriticalAssets = results.filter((result, index) => 
            result.status === 'rejected' && 
            essentialAssetsList[index].type === 'image'
        );
        
        if (failedCriticalAssets.length > 0) {
            console.error('Failed to load critical assets:', failedCriticalAssets);
            throw new Error(`Failed to load ${failedCriticalAssets.length} critical assets`);
        }
        
        // Log any non-critical failures but continue
        const nonCriticalFailures = results.filter(result => 
            (result.status === 'rejected' || 
            (result.status === 'fulfilled' && result.value && !result.value.success))
        );
        
        if (nonCriticalFailures.length > 0) {
            console.warn(`${nonCriticalFailures.length} non-critical assets failed to load`);
        }
        
        return true;
    } catch (error) {
        console.error('Error loading essential assets:', error);
        throw new Error('Failed to load essential game assets');
    }
}

/**
 * Check if required asset files exist and create placeholders if not
 */
async function checkAssetsExist() {
    // This function verifies essential game assets exist
    const requiredAssets = [
        // Check essential images
        { type: 'image', path: APP_CONFIG.ASSETS.IMAGES.BACKGROUND, name: 'Background' },
        { type: 'image', path: APP_CONFIG.ASSETS.IMAGES.SLINGSHOT, name: 'Slingshot' },
        { type: 'image', path: APP_CONFIG.ASSETS.IMAGES.PRESENT, name: 'Present' },
        { type: 'image', path: APP_CONFIG.ASSETS.IMAGES.ORNAMENT, name: 'Ornament' },
        { type: 'image', path: APP_CONFIG.ASSETS.IMAGES.GNOME, name: 'Gnome' },
        { type: 'image', path: APP_CONFIG.ASSETS.IMAGES.TREE, name: 'Tree' },
        { type: 'image', path: APP_CONFIG.ASSETS.IMAGES.TREX, name: 'T-Rex' },
        
        // Check essential audio
        { type: 'audio', path: APP_CONFIG.ASSETS.AUDIO.BACKGROUND_MUSIC, name: 'Background Music' },
        { type: 'audio', path: APP_CONFIG.ASSETS.AUDIO.JINGLE_BELL, name: 'Jingle Bell' },
        { type: 'audio', path: APP_CONFIG.ASSETS.AUDIO.HOHOHO, name: 'Ho Ho Ho' },
        { type: 'audio', path: APP_CONFIG.ASSETS.AUDIO.TREX_ROAR, name: 'T-Rex Roar' }
    ];
    
    // Display progress indicator
    updateLoadingProgress(70, 'Checking asset files...');
    
    const checkAsset = (asset, index) => {
        return new Promise((resolve) => {
            // Update progress
            const progressValue = 70 + Math.floor((index / requiredAssets.length) * 10);
            updateLoadingProgress(progressValue, `Checking ${asset.name}...`);
            
            if (asset.type === 'image') {
                const img = new Image();
                img.onload = () => resolve({ success: true, asset });
                img.onerror = () => resolve({ 
                    success: false, 
                    asset,
                    error: `Missing asset: ${asset.name}`
                });
                img.src = asset.path;
            } else if (asset.type === 'audio') {
                const audio = new Audio();
                audio.addEventListener('canplaythrough', () => {
                    resolve({ success: true, asset });
                }, { once: true });
                audio.addEventListener('error', () => {
                    resolve({ 
                        success: false, 
                        asset,
                        error: `Missing audio: ${asset.name}`
                    });
                }, { once: true });
                audio.src = asset.path;
                audio.load();
                
                // Add a timeout for audio check to prevent hanging
                setTimeout(() => {
                    resolve({ 
                        success: false, 
                        asset,
                        error: `Audio loading timeout: ${asset.name}`
                    });
                }, 3000);
            }
        });
    };
    
    try {
        // Check all assets sequentially for better progress reporting
        const results = [];
        for (let i = 0; i < requiredAssets.length; i++) {
            results.push(await checkAsset(requiredAssets[i], i));
        }
        
        // Get any failures
        const failures = results.filter(r => !r.success);
        
        if (failures.length > 0) {
            console.warn('Missing assets:', failures);
            
            // Create placeholders for missing assets
            for (const failure of failures) {
                const asset = failure.asset;
                console.warn(`Creating placeholder for: ${asset.name}`);
                
                if (asset.type === 'image') {
                    // Create placeholder image
                    const canvas = document.createElement('canvas');
                    canvas.width = 200;
                    canvas.height = 200;
                    const ctx = canvas.getContext('2d');
                    
                    // Draw placeholder with asset name
                    ctx.fillStyle = '#f8d7da';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = '#721c24';
                    ctx.font = '20px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(`Missing: ${asset.name}`, canvas.width/2, canvas.height/2);
                    ctx.strokeStyle = '#721c24';
                    ctx.strokeRect(5, 5, canvas.width-10, canvas.height-10);
                    
                    // Convert to data URL and create Image object
                    const placeholderImage = new Image();
                    placeholderImage.src = canvas.toDataURL('image/png');
                    
                    // Set the appropriate path in APP_CONFIG
                    const path = asset.path;
                    
                    // Extract key from path (e.g., 'background' from 'assets/images/background.png')
                    const key = path.split('/').pop().split('.')[0];
                    
                    // Store the placeholder in gameAssets
                    if (!gameAssets.images) gameAssets.images = {};
                    gameAssets.images[key] = placeholderImage;
                    
                } else if (asset.type === 'audio') {
                    // For audio, we'll create an empty Audio object as a placeholder
                    // This allows the game to call play() without errors
                    const silentAudio = new Audio();
                    
                    // Extract key from path
                    const key = asset.path.split('/').pop().split('.')[0].replace(/-/g, '_');
                    
                    if (!gameAssets.audio) gameAssets.audio = {};
                    gameAssets.audio[key] = {
                        play: () => console.warn(`Attempted to play missing audio: ${asset.name}`),
                        pause: () => {},
                        currentTime: 0,
                        volume: 1,
                        muted: false
                    };
                }
            }
            
            // Show a warning but continue loading
            if (failures.some(f => f.asset.type === 'image')) {
                // Only warn about image assets since audio can be optional
                const warningMessage = `Some game assets are missing (${failures.length}). The game will use placeholders instead.`;
                const warningElement = document.createElement('div');
                warningElement.className = 'alert alert-warning mt-3';
                warningElement.textContent = warningMessage;
                
                // Add to loading screen
                const loadingContent = document.querySelector('.loading-content');
                loadingContent.appendChild(warningElement);
                
                // Auto-hide after 5 seconds
                setTimeout(() => {
                    warningElement.classList.add('fade-out');
                    setTimeout(() => {
                        if (warningElement.parentNode) {
                            warningElement.parentNode.removeChild(warningElement);
                        }
                    }, 500);
                }, 5000);
            }
        }
          console.log('Asset check complete');
        return true;
    } catch (error) {
        console.error('Error checking assets:', error);
        // Don't throw - we'll use placeholders
        return false;
    }
}

/**
 * Create targets for the game round
 */
function createTargets() {
    // Clear existing targets
    gamePhysics.clearBodies();
    
    // Target types and their health values
    const targetTypes = ['present', 'ornament', 'gnome', 'tree'];
    const targetHealth = { 'present': 1, 'ornament': 2, 'gnome': 3, 'tree': 4 };
    
    // Set up the number of targets
    gameState.targetsHit = 0;
    gameState.targetsTotal = APP_CONFIG.TARGETS_PER_ROUND;
    
    // Get canvas dimensions
    const canvas = document.getElementById('gameCanvas');
    
    // Create targets in a formation on the right side of the screen
    for (let i = 0; i < gameState.targetsTotal; i++) {
        // Select a random target type
        const targetType = targetTypes[Math.floor(Math.random() * targetTypes.length)];
        
        // Position targets in a formation
        const row = Math.floor(i / 5);
        const col = i % 5;
        
        const xPos = canvas.width * 0.6 + col * 40; // Adjust spacing as needed
        const yPos = canvas.height * 0.3 + row * 60; // Adjust spacing as needed
        
        // Create the target with Box2D physics
        gamePhysics.createTarget(xPos, yPos, targetType, {
            health: targetHealth[targetType],
            value: APP_CONFIG.TARGET_VALUES[targetType],
            hit: false
        });
    }
}

/**
 * Start the main game loop
 */
function startGameLoop() {
    // Clear any existing loop
    if (gameState.gameLoopInterval) {
        clearInterval(gameState.gameLoopInterval);
    }
    
    // Start new loop
    gameState.gameLoopInterval = setInterval(() => {
        // Update time remaining
        if (gameState.timeRemaining > 0) {
            gameState.timeRemaining--;
            updateTimeDisplay();
        } else {
            // Time's up, end the round
            endRound();
            return;
        }
        
        // Draw the game
        drawGame();
    }, 1000); // Update every second
    
    // Start animation frame loop for smoother rendering
    requestAnimationFrame(gameAnimationLoop);
}

/**
 * Game animation loop for smooth rendering
 */
function gameAnimationLoop() {
    if (!gameState.isRunning) return;
    
    // Draw the game
    drawGame();
    
    // Continue the loop
    requestAnimationFrame(gameAnimationLoop);
}

/**
 * Handle touch/mouse start
 */
function handleTouchStart(e) {
    if (!gameState.isRunning || gameState.isLaunching) return;
    
    const canvas = document.getElementById('gameCanvas');
    const rect = canvas.getBoundingClientRect();
    
    gameState.touchStart.x = e.clientX - rect.left;
    gameState.touchStart.y = e.clientY - rect.top;
    
    // Check if touch is near the slingshot position
    const slingshotX = canvas.width * 0.1;
    const slingshotY = canvas.height * 0.7;
    
    const distance = Math.sqrt(
        Math.pow(gameState.touchStart.x - slingshotX, 2) + 
        Math.pow(gameState.touchStart.y - slingshotY, 2)
    );
    
    // If within range of slingshot, start dragging
    if (distance < 50) {
        gameState.isTouching = true;
        gameState.touchCurrent.x = gameState.touchStart.x;
        gameState.touchCurrent.y = gameState.touchStart.y;
        
        // Highlight slingshot area
        highlightSlingshotArea(true);
        
        // Provide haptic feedback
        provideHapticFeedback('light');
    }
}

/**
 * Handle touch/mouse move
 */
function handleTouchMove(e) {
    if (!gameState.isRunning || !gameState.isTouching) return;
    
    const canvas = document.getElementById('gameCanvas');
    const rect = canvas.getBoundingClientRect();
    
    gameState.touchCurrent.x = e.clientX - rect.left;
    gameState.touchCurrent.y = e.clientY - rect.top;
    
    // Redraw game with updated slingshot position
    drawGame();
}

/**
 * Handle touch/mouse end
 */
function handleTouchEnd() {
    if (!gameState.isRunning || !gameState.isTouching) return;
    
    gameState.isTouching = false;
    
    // Calculate launch vector
    const canvas = document.getElementById('gameCanvas');
    const slingshotX = canvas.width * 0.1;
    const slingshotY = canvas.height * 0.7;
    
    const dx = slingshotX - gameState.touchCurrent.x;
    const dy = slingshotY - gameState.touchCurrent.y;
    
    // Limit maximum pull distance
    const pullDistance = Math.min(Math.sqrt(dx * dx + dy * dy), 150);
    
    // Only launch if pulled back significantly
    if (pullDistance > 20) {
        launchCharacter(dx, dy);
    } else {
        // Hide slingshot highlight if not launching
        highlightSlingshotArea(false);
    }
}

/**
 * Launch a character with the given direction vector
 */
function launchCharacter(dx, dy) {
    if (gameState.launchesRemaining <= 0 || gameState.isLaunching) return;
    
    gameState.isLaunching = true;
    gameState.launchesRemaining--;
    
    // Update UI
    updateLaunchesDisplay();
    
    // Determine if this is a T-Rex launch
    const useTrex = gameState.trexUnlocked && gameState.launchesRemaining === 0;
    
    // Get canvas dimensions
    const canvas = document.getElementById('gameCanvas');
    const slingshotX = canvas.width * 0.1;
    const slingshotY = canvas.height * 0.7;
    
    // Create character body
    const character = gamePhysics.createCharacter(slingshotX, slingshotY, {
        isTrex: useTrex,
        characterIndex: useTrex ? -1 : Math.floor(Math.random() * 5) // Placeholder - would use actual character index
    });
    
    // Calculate launch velocity (scale by distance)
    const force = Math.min(Math.sqrt(dx * dx + dy * dy), 150);
    const angle = Math.atan2(dy, dx);
    const velocityScale = 15; // Adjust as needed
    
    const vx = Math.cos(angle) * force * velocityScale;
    const vy = Math.sin(angle) * force * velocityScale;
    
    // Apply impulse to character
    gamePhysics.applyImpulse(character, vx, vy);
    
    // Play sound effect for T-Rex
    if (useTrex && gameAssets.audio.trexRoar) {
        gameAssets.audio.trexRoar.currentTime = 0;
        gameAssets.audio.trexRoar.play();
        
        // Apply T-Rex effects (destroys all targets)
        const targets = gamePhysics.getBodiesByType('target');
        targets.forEach(target => {
            if (!target.userData.hit) {
                target.userData.hit = true;
                target.userData.health = 0;
                gameState.targetsHit++;
                gameState.score += target.userData.value;
            }
        });
        
        // Add T-Rex bonus
        gameState.score += APP_CONFIG.TREX_BONUS;
        updateScoreDisplay();
    }
    
    // Start physics simulation for the launch
    simulatePhysics();
}

/**
 * Simulate physics for a character launch
 */
function simulatePhysics() {
    const timeStep = 1.0 / 60.0;
    let simulationTime = 0;
    const maxSimulationTime = 5000; // 5 seconds max
    
    function step() {
        if (!gameState.isRunning || !gameState.isLaunching) return;
        
        // Step the physics world
        gamePhysics.step(timeStep);
        
        // Draw the game
        drawGame();
        
        // Increment simulation time
        simulationTime += 16; // Approx 16ms per frame
        
        // Check for simulation end conditions
        if (simulationTime > maxSimulationTime || gamePhysics.areAllBodiesAtRest()) {
            // End the simulation
            gameState.isLaunching = false;
            
            // Check for collisions and score
            checkCollisions();
            
            // Check if round is over
            if (gameState.launchesRemaining <= 0 || gameState.targetsHit >= gameState.targetsTotal) {
                endRound();
                return;
            }
            
            return;
        }
        
        // Continue simulation
        requestAnimationFrame(step);
    }
    
    // Start the simulation loop
    requestAnimationFrame(step);
}

/**
 * Check for collisions between characters and targets
 */
function checkCollisions() {
    // In a full implementation, this would use Box2D contact listeners
    // For this template, we'll just update the UI
    updateScoreDisplay();
    
    // Check if T-Rex should be unlocked
    if (gameState.score >= APP_CONFIG.TREX_UNLOCK_SCORE && !gameState.trexUnlocked) {
        gameState.trexUnlocked = true;
        
        // Show visual indicator
        // This would be implemented in the full game
    }
}

/**
 * Draw the game state on the canvas
 */
function drawGame() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    if (gameAssets.images.background) {
        ctx.drawImage(gameAssets.images.background, 0, 0, canvas.width, canvas.height);
    } else {
        // Fallback background
        ctx.fillStyle = '#34495e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw snow effect
        ctx.fillStyle = 'white';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = Math.random() * 3 + 1;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Draw slingshot
    const slingshotX = canvas.width * 0.1;
    const slingshotY = canvas.height * 0.7;
    
    if (gameAssets.images.slingshot) {
        ctx.drawImage(
            gameAssets.images.slingshot, 
            slingshotX - 25, 
            slingshotY - 50, 
            50, 
            100
        );
    } else {
        // Fallback slingshot drawing
        ctx.fillStyle = 'brown';
        ctx.fillRect(slingshotX - 5, slingshotY, 10, 50);
        ctx.fillRect(slingshotX - 25, slingshotY - 50, 10, 50);
        ctx.fillRect(slingshotX + 15, slingshotY - 50, 10, 50);
    }
    
    // Draw elastic band
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 3;
    
    if (gameState.isTouching) {
        // Draw pulled elastic
        ctx.beginPath();
        ctx.moveTo(slingshotX - 20, slingshotY - 40);
        ctx.lineTo(gameState.touchCurrent.x, gameState.touchCurrent.y);
        ctx.lineTo(slingshotX + 20, slingshotY - 40);
        ctx.stroke();
        
        // Draw character on elastic
        const characterRadius = 20;
        
        // Determine which character to show (T-Rex or regular)
        if (gameState.trexUnlocked && gameState.launchesRemaining === 1) {
            ctx.fillStyle = '#4a7f2c'; // T-Rex color
        } else {
            ctx.fillStyle = '#3498db'; // Regular character color
        }
        
        ctx.beginPath();
        ctx.arc(gameState.touchCurrent.x, gameState.touchCurrent.y, characterRadius, 0, Math.PI * 2);
        ctx.fill();
    } else {
        // Draw relaxed elastic
        ctx.beginPath();
        ctx.moveTo(slingshotX - 20, slingshotY - 40);
        ctx.lineTo(slingshotX, slingshotY - 30);
        ctx.lineTo(slingshotX + 20, slingshotY - 40);
        ctx.stroke();
    }
    
    // Draw physics bodies (characters and targets)
    if (gamePhysics.world) {
        for (let body = gamePhysics.world.GetBodyList(); body; body = body.GetNext()) {
            if (!body.userData) continue;
            
            const position = gamePhysics.getBodyPosition(body);
            if (!position) continue;
            
            ctx.save();
            ctx.translate(position.x, position.y);
            ctx.rotate(position.angle);
            
            if (body.userData.type === 'character') {
                // Draw character
                if (body.userData.isTrex) {
                    // T-Rex
                    if (gameAssets.images.trex) {
                        ctx.drawImage(
                            gameAssets.images.trex, 
                            -0.5 * gamePhysics.scale, 
                            -0.5 * gamePhysics.scale, 
                            gamePhysics.scale, 
                            gamePhysics.scale
                        );
                    } else {
                        // Fallback T-Rex
                        ctx.fillStyle = '#4a7f2c';
                        ctx.beginPath();
                        ctx.arc(0, 0, 0.5 * gamePhysics.scale, 0, Math.PI * 2);
                        ctx.fill();
                        
                        // Santa hat
                        ctx.fillStyle = '#e74c3c';
                        ctx.beginPath();
                        ctx.moveTo(0, -0.5 * gamePhysics.scale);
                        ctx.lineTo(-0.3 * gamePhysics.scale, -0.6 * gamePhysics.scale);
                        ctx.lineTo(0.3 * gamePhysics.scale, -0.8 * gamePhysics.scale);
                        ctx.closePath();
                        ctx.fill();
                        
                        // Santa hat pom-pom
                        ctx.fillStyle = 'white';
                        ctx.beginPath();
                        ctx.arc(0.3 * gamePhysics.scale, -0.8 * gamePhysics.scale, 0.1 * gamePhysics.scale, 0, Math.PI * 2);
                        ctx.fill();
                    }
                } else {
                    // Regular character
                    ctx.fillStyle = '#3498db';
                    ctx.beginPath();
                    ctx.arc(0, 0, 0.5 * gamePhysics.scale, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // In a full implementation, this would use the player's uploaded photos
                }
            } else if (body.userData.type === 'target') {
                // Draw different target types
                const targetType = body.userData.targetType;
                
                if (gameAssets.images[targetType]) {
                    // Draw using loaded image
                    let width = gamePhysics.scale;
                    let height = gamePhysics.scale;
                    
                    // Adjust size based on target type
                    if (targetType === 'gnome') {
                        width = 0.8 * gamePhysics.scale;
                        height = 1.6 * gamePhysics.scale;
                    } else if (targetType === 'tree') {
                        width = 1.2 * gamePhysics.scale;
                        height = 2 * gamePhysics.scale;
                    }
                    
                    ctx.drawImage(
                        gameAssets.images[targetType], 
                        -width / 2, 
                        -height / 2, 
                        width, 
                        height
                    );
                } else {
                    // Fallback target drawing
                    switch (targetType) {
                        case 'present':
                            ctx.fillStyle = '#e74c3c';
                            ctx.fillRect(-0.5 * gamePhysics.scale, -0.5 * gamePhysics.scale, gamePhysics.scale, gamePhysics.scale);
                            ctx.strokeStyle = '#f1c40f';
                            ctx.lineWidth = 2;
                            ctx.strokeRect(-0.5 * gamePhysics.scale, -0.5 * gamePhysics.scale, gamePhysics.scale, gamePhysics.scale);
                            break;
                            
                        case 'ornament':
                            ctx.fillStyle = '#9b59b6';
                            ctx.beginPath();
                            ctx.arc(0, 0, 0.5 * gamePhysics.scale, 0, Math.PI * 2);
                            ctx.fill();
                            break;
                            
                        case 'gnome':
                            // Body
                            ctx.fillStyle = '#e74c3c';
                            ctx.fillRect(-0.4 * gamePhysics.scale, -0.8 * gamePhysics.scale, 0.8 * gamePhysics.scale, 1.6 * gamePhysics.scale);
                            
                            // Hat
                            ctx.fillStyle = '#2ecc71';
                            ctx.beginPath();
                            ctx.moveTo(-0.4 * gamePhysics.scale, -0.8 * gamePhysics.scale);
                            ctx.lineTo(0.4 * gamePhysics.scale, -0.8 * gamePhysics.scale);
                            ctx.lineTo(0, -1.2 * gamePhysics.scale);
                            ctx.closePath();
                            ctx.fill();
                            break;
                            
                        case 'tree':
                            // Trunk
                            ctx.fillStyle = '#8b4513';
                            ctx.fillRect(-0.2 * gamePhysics.scale, 0, 0.4 * gamePhysics.scale, gamePhysics.scale);
                            
                            // Tree
                            ctx.fillStyle = '#2ecc71';
                            ctx.beginPath();
                            ctx.moveTo(-0.6 * gamePhysics.scale, 0);
                            ctx.lineTo(0.6 * gamePhysics.scale, 0);
                            ctx.lineTo(0, -gamePhysics.scale);
                            ctx.closePath();
                            ctx.fill();
                            
                            ctx.beginPath();
                            ctx.moveTo(-0.5 * gamePhysics.scale, -0.3 * gamePhysics.scale);
                            ctx.lineTo(0.5 * gamePhysics.scale, -0.3 * gamePhysics.scale);
                            ctx.lineTo(0, -1.2 * gamePhysics.scale);
                            ctx.closePath();
                            ctx.fill();
                            break;
                    }
                }
                
                // Draw health indicator for targets that have been hit but not destroyed
                if (body.userData.hit && body.userData.health > 0) {
                    const healthPercentage = body.userData.health / (targetType === 'present' ? 1 : 
                                                                     targetType === 'ornament' ? 2 : 
                                                                     targetType === 'gnome' ? 3 : 4);
                    
                    // Draw health bar
                    const barWidth = gamePhysics.scale;
                    const barHeight = 5;
                    
                    // Background
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                    ctx.fillRect(-barWidth / 2, -gamePhysics.scale * 0.7, barWidth, barHeight);
                    
                    // Health
                    ctx.fillStyle = healthPercentage > 0.5 ? '#2ecc71' : 
                                    healthPercentage > 0.25 ? '#f1c40f' : '#e74c3c';
                    ctx.fillRect(-barWidth / 2, -gamePhysics.scale * 0.7, barWidth * healthPercentage, barHeight);
                }
            }
            
            ctx.restore();
        }
    }
}

/**
 * Update the score display
 */
function updateScoreDisplay() {
    const scoreElement = document.getElementById('scoreValue');
    if (scoreElement) {
        scoreElement.textContent = gameState.score;
    }
}

/**
 * Update the launches display
 */
function updateLaunchesDisplay() {
    const launchesElement = document.getElementById('launchesValue');
    if (launchesElement) {
        launchesElement.textContent = gameState.launchesRemaining;
    }
}

/**
 * Update the time display
 */
function updateTimeDisplay() {
    const timeElement = document.getElementById('timeValue');
    if (timeElement) {
        const minutes = Math.floor(gameState.timeRemaining / 60);
        const seconds = gameState.timeRemaining % 60;
        timeElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

/**
 * End the current game round
 */
function endRound() {
    // Stop the game
    gameState.isRunning = false;
    
    // Clear game loop
    if (gameState.gameLoopInterval) {
        clearInterval(gameState.gameLoopInterval);
        gameState.gameLoopInterval = null;
    }
    
    // Stop background music
    if (gameAssets.audio.backgroundMusic) {
        gameAssets.audio.backgroundMusic.pause();
        gameAssets.audio.backgroundMusic.currentTime = 0;
    }
    
    // Add bonus for finishing quickly
    if (gameState.timeRemaining > 0) {
        gameState.score += APP_CONFIG.QUICK_ROUND_BONUS;
        updateScoreDisplay();
    }
    
    // Update final score display
    document.getElementById('finalScore').textContent = gameState.score;
    
    // Add score to leaderboard
    gameStorage.addScoreToLeaderboard(gameState.playerName, gameState.score);
    
    // Show game over screen
    document.getElementById('gameOverScreen').classList.remove('d-none');
}

/**
 * Show an error message to the user
 */
/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    // Display error in a more user-friendly way
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger mt-3';
    errorDiv.innerHTML = `<strong>Error:</strong> ${message}`;
    
    // Add to the game container with timeout to auto-remove
    const gameContainer = document.getElementById('gameContainer');
    gameContainer.prepend(errorDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
        errorDiv.classList.add('fade-out');
        setTimeout(() => errorDiv.remove(), 500);
    }, 5000);
}

/**
 * Show loading screen
 */
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    loadingScreen.classList.remove('d-none');
    
    // Reset loading progress
    const progressBar = document.getElementById('loadingProgress');
    progressBar.style.width = '0%';
    
    // Reset loading message
    const loadingMessage = document.getElementById('loadingMessage');
    loadingMessage.textContent = 'Initializing game...';
    
    // Hide any previous errors
    const loadingError = document.getElementById('loadingError');
    loadingError.classList.add('d-none');
}

/**
 * Hide loading screen
 */
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    loadingScreen.classList.add('d-none');
}

/**
 * Update loading progress
 * @param {number} progress - Progress percentage (0-100)
 * @param {string} message - Loading status message
 */
function updateLoadingProgress(progress, message) {
    // Update progress bar
    const progressBar = document.getElementById('loadingProgress');
    progressBar.style.width = `${progress}%`;
    progressBar.setAttribute('aria-valuenow', progress);
    
    // Update message
    if (message) {
        const loadingMessage = document.getElementById('loadingMessage');
        loadingMessage.textContent = message;
    }
}

/**
 * Show loading error
 * @param {string} errorMsg - Error message to display
 */
function showLoadingError(errorMsg) {
    // Update loading screen to show error
    const loadingMessage = document.getElementById('loadingMessage');
    loadingMessage.textContent = 'Loading failed';
    
    // Show error message
    const loadingError = document.getElementById('loadingError');
    const errorMessage = document.getElementById('errorMessage');
    
    loadingError.classList.remove('d-none');
    errorMessage.textContent = errorMsg || 'An unknown error occurred';
    
    // Set up retry button
    const retryButton = document.getElementById('retryButton');
    retryButton.onclick = () => {
        // Reload the page
        window.location.reload();
    };
}

/**
 * Show in-game loading indicator
 * @param {string} message - Loading message to display
 * @returns {Object} - Loading indicator elements
 */
function showInGameLoading(message) {
    // Check if there's already a loading indicator
    let loadingIndicator = document.getElementById('inGameLoading');
    
    if (!loadingIndicator) {
        // Create a new loading indicator
        loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'inGameLoading';
        loadingIndicator.className = 'in-game-loading';
        
        // Create the loading content
        const content = `
            <div class="spinner-border text-light mb-2" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p id="inGameLoadingMessage">${message || 'Loading...'}</p>
            <div class="progress mb-2">
                <div id="inGameLoadingProgress" class="progress-bar progress-bar-striped progress-bar-animated" 
                     role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
        `;
        
        loadingIndicator.innerHTML = content;
        document.getElementById('gameContainer').appendChild(loadingIndicator);
    } else {
        // Update existing loading indicator
        document.getElementById('inGameLoadingMessage').textContent = message || 'Loading...';
        document.getElementById('inGameLoadingProgress').style.width = '0%';
    }
    
    return {
        element: loadingIndicator,
        updateProgress: (progress) => {
            const progressBar = document.getElementById('inGameLoadingProgress');
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
                progressBar.setAttribute('aria-valuenow', progress);
            }
        },
        updateMessage: (newMessage) => {
            const messageElement = document.getElementById('inGameLoadingMessage');
            if (messageElement) {
                messageElement.textContent = newMessage;
            }
        }
    };
}

/**
 * Hide in-game loading indicator
 * @param {boolean} animate - Whether to animate the hiding
 */
function hideInGameLoading(animate = true) {
    const loadingIndicator = document.getElementById('inGameLoading');
    
    if (loadingIndicator) {
        if (animate) {
            loadingIndicator.classList.add('fade-out');
            setTimeout(() => {
                if (loadingIndicator.parentNode) {
                    loadingIndicator.parentNode.removeChild(loadingIndicator);
                }
            }, 500); // Match with CSS animation duration
        } else {
            if (loadingIndicator.parentNode) {
                loadingIndicator.parentNode.removeChild(loadingIndicator);
            }
        }
    }
}

/**
 * Show in-game error message
 * @param {string} errorMsg - Error message to display
 * @param {Function} retryCallback - Function to call when retry button is clicked
 * @param {number} autoHideDelay - Delay in ms after which to auto-hide the error (0 for no auto-hide)
 */
function showInGameError(errorMsg, retryCallback = null, autoHideDelay = 0) {
    // Hide any existing loading indicator
    hideInGameLoading(false);
    
    // Create error container
    const errorContainer = document.createElement('div');
    errorContainer.id = 'inGameError';
    errorContainer.className = 'in-game-loading';
    
    // Create content
    let content = `
        <div class="error-message">
            <h4>Error</h4>
            <p>${errorMsg || 'An unknown error occurred'}</p>
    `;
    
    // Add retry button if callback provided
    if (retryCallback && typeof retryCallback === 'function') {
        content += `
            <div class="mt-2">
                <button id="inGameRetryButton" class="btn btn-danger">Retry</button>
            </div>
        `;
    }
    
    content += `</div>`;
    errorContainer.innerHTML = content;
    
    // Add to game container
    document.getElementById('gameContainer').appendChild(errorContainer);
    
    // Set up retry button if provided
    if (retryCallback && typeof retryCallback === 'function') {
        document.getElementById('inGameRetryButton').addEventListener('click', () => {
            errorContainer.parentNode.removeChild(errorContainer);
            retryCallback();
        });
    }
    
    // Auto-hide if delay is provided
    if (autoHideDelay > 0) {
        setTimeout(() => {
            if (errorContainer.parentNode) {
                errorContainer.classList.add('fade-out');
                setTimeout(() => {
                    if (errorContainer.parentNode) {
                        errorContainer.parentNode.removeChild(errorContainer);
                    }
                }, 500);
            }
        }, autoHideDelay);
    }
    
    return errorContainer;
}

/**
 * Handle pinch-to-zoom gesture
 * @param {TouchEvent} e - Touch event
 */
function handlePinchGesture(e) {
    if (!gameState.isRunning || gameState.isLaunching) return;
    
    // Need at least two touch points for pinch
    if (e.touches.length < 2) return;
    
    // Get the two touch points
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    
    // Calculate distance between points
    const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
    );
    
    // Store initial distance for first pinch event
    if (!gameState.pinchStartDistance) {
        gameState.pinchStartDistance = distance;
        gameState.currentZoom = gameState.currentZoom || 1.0;
        return;
    }
    
    // Calculate zoom factor
    const zoomDelta = (distance / gameState.pinchStartDistance) - 1;
    const newZoom = Math.max(0.8, Math.min(1.5, gameState.currentZoom + (zoomDelta * 0.01)));
    
    // Only update if significant change
    if (Math.abs(newZoom - gameState.currentZoom) > 0.01) {
        gameState.currentZoom = newZoom;
        
        // Apply zoom transformation to canvas
        const canvas = document.getElementById('gameCanvas');
        canvas.style.transform = `scale(${newZoom})`;
        
        // Update pinch start distance
        gameState.pinchStartDistance = distance;
        
        // Redraw game
        drawGame();
    }
}

/**
 * Reset pinch gesture state
 */
function resetPinchGesture() {
    gameState.pinchStartDistance = null;
}

/**
 * Highlight slingshot area
 * @param {boolean} show - Whether to show or hide the highlight
 */
function highlightSlingshotArea(show) {
    const slingshotHighlight = document.getElementById('slingshotHighlight');
    
    if (!slingshotHighlight) {
        // Create highlight element if it doesn't exist
        const canvas = document.getElementById('gameCanvas');
        const highlight = document.createElement('div');
        highlight.id = 'slingshotHighlight';
        highlight.className = 'slingshot-highlight';
        highlight.style.display = show ? 'block' : 'none';
        
        // Position the highlight at the slingshot location
        const slingshotX = canvas.width * 0.1;
        const slingshotY = canvas.height * 0.7;
        
        highlight.style.left = `${slingshotX - 40}px`;
        highlight.style.top = `${slingshotY - 40}px`;
        
        document.getElementById('gameContainer').appendChild(highlight);
    } else {
        slingshotHighlight.style.display = show ? 'block' : 'none';
    }
}

/**
 * Give haptic feedback for touch events (if supported)
 * @param {string} intensity - Feedback intensity ('light', 'medium', or 'heavy')
 */
function provideHapticFeedback(intensity = 'medium') {
    if (!window.navigator.vibrate) return;
    
    switch (intensity) {
        case 'light':
            window.navigator.vibrate(10);
            break;
        case 'medium':
            window.navigator.vibrate(20);
            break;
        case 'heavy':
            window.navigator.vibrate([30, 20, 30]);
            break;
    }
}
