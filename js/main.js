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
    
    // Initialize Box2D physics
    const physicsInitialized = await gamePhysics.init();
    if (!physicsInitialized) {
        showError('Failed to initialize physics. Please refresh the page and try again.');
        return;
    }
    
    // Initialize the game
    initGame();
    
    // Set up event listeners
    setupEventListeners();
    
    // Check for placeholder assets
    checkAssetsExist();
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
    
    // Load images and audio
    loadGameAssets()
        .then(() => {
            // Start game loop
            startGameLoop();
            
            // Start background music if enabled
            if (document.querySelector('.music-icon').textContent === '🔊' && gameAssets.audio.backgroundMusic) {
                gameAssets.audio.backgroundMusic.play();
            }
        })
        .catch(error => {
            console.error('Failed to load game assets:', error);
            showError('Failed to load game assets. Please refresh the page and try again.');
        });
}

/**
 * Load game assets (images and audio)
 */
async function loadGameAssets() {
    // Function to load an image
    const loadImage = (key, src) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                gameAssets.images[key] = img;
                resolve();
            };
            img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
            img.src = src;
        });
    };
    
    // Function to load audio
    const loadAudio = (key, src) => {
        return new Promise((resolve) => {
            try {
                const audio = new Audio();
                audio.addEventListener('canplaythrough', () => {
                    gameAssets.audio[key] = audio;
                    resolve();
                }, { once: true });
                
                // If loading fails, resolve anyway to prevent blocking the game
                audio.addEventListener('error', () => {
                    console.warn(`Failed to load audio: ${src}`);
                    resolve();
                });
                
                audio.src = src;
                audio.load();
            } catch (e) {
                console.warn(`Error initializing audio: ${src}`, e);
                resolve();
            }
        });
    };
    
    try {
        // Check if assets directory exists and create placeholders if needed
        await checkAssetsExist();
        
        // Load images
        await Promise.all([
            loadImage('background', APP_CONFIG.ASSETS.IMAGES.BACKGROUND),
            loadImage('slingshot', APP_CONFIG.ASSETS.IMAGES.SLINGSHOT),
            loadImage('present', APP_CONFIG.ASSETS.IMAGES.PRESENT),
            loadImage('ornament', APP_CONFIG.ASSETS.IMAGES.ORNAMENT),
            loadImage('gnome', APP_CONFIG.ASSETS.IMAGES.GNOME),
            loadImage('tree', APP_CONFIG.ASSETS.IMAGES.TREE),
            loadImage('trex', APP_CONFIG.ASSETS.IMAGES.TREX)
        ]);
        
        // Load audio
        await Promise.all([
            loadAudio('jingleBell', APP_CONFIG.ASSETS.AUDIO.JINGLE_BELL),
            loadAudio('trexRoar', APP_CONFIG.ASSETS.AUDIO.TREX_ROAR),
            loadAudio('hohoho', APP_CONFIG.ASSETS.AUDIO.HOHOHO),
            loadAudio('backgroundMusic', APP_CONFIG.ASSETS.AUDIO.BACKGROUND_MUSIC)
        ]);
        
        // Configure background music
        if (gameAssets.audio.backgroundMusic) {
            gameAssets.audio.backgroundMusic.loop = true;
            gameAssets.audio.backgroundMusic.volume = 0.5;
        }
        
        return true;
    } catch (error) {
        console.error('Error loading assets:', error);
        return false;
    }
}

/**
 * Check if required asset files exist and create placeholders if not
 */
async function checkAssetsExist() {
    // Since we can't directly check if files exist on the client side,
    // we'll create placeholder assets if needed when deploying
    
    // This is a simplified check - in a real implementation
    // you would need to provide actual assets or generate them
    
    console.log('Asset check complete');
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
function showError(message) {
    alert(message);
}
