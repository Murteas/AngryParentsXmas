/**
 * Game.js - Main game logic for Angry Parents: Christmas Edition
 * This file handles the game canvas rendering, physics, and game state
 */

// Game constants
const GAME_CONSTANTS = {
    ROUND_TIME: 120, // 2 minutes in seconds
    MAX_LAUNCHES: 5,
    TARGETS_PER_ROUND: 15,
    TREX_UNLOCK_SCORE: 500,
    PERFECT_SHOT_BONUS: 20,
    QUICK_ROUND_BONUS: 50,
    TARGET_VALUES: {
        present: 10,
        ornament: 20,
        gnome: 50,
        tree: 50
    }
};

// Box2D shortcuts for better readability
let b2Vec2, b2BodyDef, b2Body, b2BodyType, b2FixtureDef, b2World, b2PolygonShape, b2CircleShape;

class Game {
    constructor() {
        // Canvas and rendering context
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Resize canvas to fit the screen
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Game state
        this.isRunning = false;
        this.isLaunching = false;
        this.score = 0;
        this.launchesRemaining = GAME_CONSTANTS.MAX_LAUNCHES;
        this.timeRemaining = GAME_CONSTANTS.ROUND_TIME;
        this.targetsHit = 0;
        this.targetsTotal = 0;
        this.trexUnlocked = false;
        this.currentCharacter = null;
        this.characters = [];
        this.targets = [];
        this.funnyMessages = [];
        this.playerName = "";
        
        // Physics world
        this.scale = 30; // pixels per meter for Box2D
        this.world = null;
        
        // Audio
        this.sounds = {
            jingleBell: null,
            trexRoar: null,
            hohoho: null,
            backgroundMusic: null
        };
        
        // Game visuals
        this.backgroundImage = null;
        this.slingshotImage = null;
        
        // Touch/mouse interaction
        this.touchStart = { x: 0, y: 0 };
        this.touchCurrent = { x: 0, y: 0 };
        this.isTouching = false;
        
        // Initialize event listeners
        this.initEventListeners();
    }
    
    /**
     * Initialize all event listeners for the game
     */
    initEventListeners() {
        // Touch/mouse events for slingshot
        this.canvas.addEventListener('mousedown', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleTouchEnd(e));
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleTouchStart(e.touches[0]);
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handleTouchMove(e.touches[0]);
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handleTouchEnd(e);
        }, { passive: false });
        
        // UI buttons
        document.getElementById('startBtn').addEventListener('click', () => this.showPlayerNameInput());
        document.getElementById('customizeBtn').addEventListener('click', () => this.showCustomizationForm());
        document.getElementById('leaderboardBtn').addEventListener('click', () => this.showLeaderboard());
        document.getElementById('helpBtn').addEventListener('click', () => this.showHelp());
        document.getElementById('toggleMusicBtn').addEventListener('click', () => this.toggleMusic());
        
        document.getElementById('submitPlayerNameBtn').addEventListener('click', () => this.startGame());
        document.getElementById('closeLeaderboardBtn').addEventListener('click', () => this.hideLeaderboard());
        document.getElementById('closeHelpBtn').addEventListener('click', () => this.hideHelp());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.showPlayerNameInput());
        document.getElementById('viewLeaderboardBtn').addEventListener('click', () => this.showLeaderboard());
    }
    
    /**
     * Resize canvas to fit the window
     */
    resizeCanvas() {
        const gameArea = document.querySelector('.game-area');
        this.canvas.width = gameArea.clientWidth;
        this.canvas.height = gameArea.clientHeight;
        
        // If game is running, adjust physics world and redraw
        if (this.isRunning) {
            this.drawGame();
        }
    }
      /**
     * Initialize Box2D physics engine
     */
    async initPhysics() {
        try {
            // Wait for Box2D WASM to initialize
            await Box2D.init();
            
            // Create shortcuts to Box2D objects
            b2Vec2 = Box2D.b2Vec2;
            b2BodyDef = Box2D.b2BodyDef;
            b2Body = Box2D.b2Body;
            b2BodyType = Box2D.b2BodyType;
            b2FixtureDef = Box2D.b2FixtureDef;
            b2World = Box2D.b2World;
            b2PolygonShape = Box2D.b2PolygonShape;
            b2CircleShape = Box2D.b2CircleShape;
            
            // Create a world with gravity
            this.world = new b2World(new b2Vec2(0, 9.8)); // Earth gravity
            
            // Set up collision listener
            this.world.SetContactListener({
                BeginContact: this.handleCollision.bind(this),
                EndContact: function() {},
                PreSolve: function() {},
                PostSolve: function() {}
            });
            
            // Check for iOS devices and warn about potential WebAssembly issues
            if (window.GameUtils && window.GameUtils.isIOSDevice()) {
                console.warn('iOS device detected - Box2D-WASM may have compatibility issues');
                this.showIOSWarning();
            }
            
            // Check if we're using a fallback implementation
            this.checkFallbackImplementation();
              } catch (error) {
            console.error('Error initializing physics:', error);
            
            // Show error message to user
            this.showPhysicsError();
            
            // Try to continue with fallback implementation
            this.world = new b2World(new b2Vec2(0, 9.8));
        }
        
        // Create ground and boundaries
        this.createBoundaries();
    }
    
    /**
     * Create physical boundaries for the game world
     */    createBoundaries() {
        // Create ground
        const groundDef = new b2BodyDef();
        this.safeSetPosition(groundDef.position, this.canvas.width / (2 * this.scale), this.canvas.height / this.scale);
        const ground = this.world.CreateBody(groundDef);
        
        const groundShape = new b2PolygonShape();
        groundShape.SetAsBox(this.canvas.width / (2 * this.scale), 0.5);
        
        ground.CreateFixture(groundShape, 0);
        
        // Create walls on the sides
        const leftWallDef = new b2BodyDef();
        this.safeSetPosition(leftWallDef.position, 0, this.canvas.height / (2 * this.scale));
        const leftWall = this.world.CreateBody(leftWallDef);
        
        const leftWallShape = new b2PolygonShape();
        leftWallShape.SetAsBox(0.5, this.canvas.height / (2 * this.scale));
        
        leftWall.CreateFixture(leftWallShape, 0);
          const rightWallDef = new b2BodyDef();
        this.safeSetPosition(rightWallDef.position, this.canvas.width / this.scale, this.canvas.height / (2 * this.scale));
        const rightWall = this.world.CreateBody(rightWallDef);
        
        const rightWallShape = new b2PolygonShape();
        rightWallShape.SetAsBox(0.5, this.canvas.height / (2 * this.scale));
        
        rightWall.CreateFixture(rightWallShape, 0);
    }
    
    /**
     * Load all game assets (images, sounds)
     */
    async loadAssets() {
        // Function to load an image
        const loadImage = (src) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = src;
            });
        };
        
        // Function to load an audio file
        const loadAudio = (src) => {
            return new Promise((resolve) => {
                const audio = new Audio(src);
                audio.addEventListener('canplaythrough', () => resolve(audio), { once: true });
                audio.load();
            });
        };
        
        try {
            // In a real implementation, you would load actual assets
            // For this template, we'll use placeholder paths
            this.backgroundImage = await loadImage('assets/images/background.png');
            this.slingshotImage = await loadImage('assets/images/slingshot.png');
            
            // Load audio files
            this.sounds.jingleBell = await loadAudio('assets/audio/jingle-bell.mp3');
            this.sounds.trexRoar = await loadAudio('assets/audio/trex-roar.mp3');
            this.sounds.hohoho = await loadAudio('assets/audio/hohoho.mp3');
            this.sounds.backgroundMusic = await loadAudio('assets/audio/background-music.mp3');
            
            // Configure background music
            this.sounds.backgroundMusic.loop = true;
            this.sounds.backgroundMusic.volume = 0.5;
            
            return true;
        } catch (error) {
            console.error("Error loading assets:", error);
            return false;
        }
    }
    
    /**
     * Handle collision between objects
     */
    handleCollision(contact) {
        const bodyA = contact.GetFixtureA().GetBody();
        const bodyB = contact.GetFixtureB().GetBody();
        
        // Check if a character hit a target
        if ((bodyA.userData?.type === 'character' && bodyB.userData?.type === 'target') ||
            (bodyA.userData?.type === 'target' && bodyB.userData?.type === 'character')) {
            
            const target = bodyA.userData?.type === 'target' ? bodyA : bodyB;
            
            // Only count if the target hasn't been hit yet
            if (!target.userData.hit) {
                target.userData.hit = true;
                target.userData.health -= 1;
                
                // If target health is depleted
                if (target.userData.health <= 0) {
                    this.targetsHit++;
                    this.score += target.userData.value;
                    
                    // Play sound effect
                    this.sounds.jingleBell.currentTime = 0;
                    this.sounds.jingleBell.play();
                    
                    // Show a random funny message
                    this.showFunnyMessage();
                    
                    // Check for perfect shot (all targets in one launch)
                    if (this.targetsHit === this.targetsTotal && this.launchesRemaining === GAME_CONSTANTS.MAX_LAUNCHES - 1) {
                        this.score += GAME_CONSTANTS.PERFECT_SHOT_BONUS;
                        this.sounds.hohoho.play();
                    }
                    
                    // Check if T-Rex should be unlocked
                    if (this.score >= GAME_CONSTANTS.TREX_UNLOCK_SCORE && !this.trexUnlocked) {
                        this.trexUnlocked = true;
                        // Visual indicator would be added here
                    }
                }
            }
        }
    }
    
    /**
     * Show a random funny message on target hit
     */
    showFunnyMessage() {
        if (this.funnyMessages.length === 0) return;
        
        const randomIndex = Math.floor(Math.random() * this.funnyMessages.length);
        const message = this.funnyMessages[randomIndex];
        
        // Create a message element
        const messageElement = document.createElement('div');
        messageElement.className = 'funny-message-popup';
        messageElement.textContent = message;
        
        // Random position near where the target was hit
        const x = Math.random() * (this.canvas.width * 0.6) + (this.canvas.width * 0.2);
        const y = Math.random() * (this.canvas.height * 0.4) + (this.canvas.height * 0.3);
        
        messageElement.style.left = `${x}px`;
        messageElement.style.top = `${y}px`;
        
        document.querySelector('.game-area').appendChild(messageElement);
        
        // Animate and remove after a short time
        setTimeout(() => {
            messageElement.classList.add('fade-out');
            setTimeout(() => {
                messageElement.remove();
            }, 500);
        }, 1500);
    }
    
    /**
     * Handle touch/mouse start
     */
    handleTouchStart(e) {
        if (!this.isRunning || this.isLaunching) return;
        
        const rect = this.canvas.getBoundingClientRect();
        this.touchStart.x = e.clientX - rect.left;
        this.touchStart.y = e.clientY - rect.top;
        
        // Check if touch is near the slingshot
        const slingshotX = this.canvas.width * 0.1;
        const slingshotY = this.canvas.height * 0.7;
        const distance = Math.sqrt(
            Math.pow(this.touchStart.x - slingshotX, 2) + 
            Math.pow(this.touchStart.y - slingshotY, 2)
        );
        
        if (distance < 50) {
            this.isTouching = true;
            this.touchCurrent.x = this.touchStart.x;
            this.touchCurrent.y = this.touchStart.y;
        }
    }
    
    /**
     * Handle touch/mouse move
     */
    handleTouchMove(e) {
        if (!this.isRunning || !this.isTouching) return;
        
        const rect = this.canvas.getBoundingClientRect();
        this.touchCurrent.x = e.clientX - rect.left;
        this.touchCurrent.y = e.clientY - rect.top;
        
        // Redraw the game with the pulled slingshot
        this.drawGame();
    }
    
    /**
     * Handle touch/mouse end
     */
    handleTouchEnd() {
        if (!this.isRunning || !this.isTouching) return;
        
        this.isTouching = false;
        
        // Calculate launch velocity based on pull distance and angle
        const slingshotX = this.canvas.width * 0.1;
        const slingshotY = this.canvas.height * 0.7;
        
        const dx = slingshotX - this.touchCurrent.x;
        const dy = slingshotY - this.touchCurrent.y;
        
        // Limit max pull
        const pullDistance = Math.min(Math.sqrt(dx * dx + dy * dy), 150);
        const angle = Math.atan2(dy, dx);
        
        // Scale pull distance to velocity
        const velocityScale = 10;
        const vx = Math.cos(angle) * pullDistance * velocityScale;
        const vy = Math.sin(angle) * pullDistance * velocityScale;
        
        // Launch character if pull distance is significant
        if (pullDistance > 10) {
            this.launchCharacter(vx, vy);
        }
    }
    
    /**
     * Launch a character with the given velocity
     */
    launchCharacter(vx, vy) {
        if (this.launchesRemaining <= 0) return;
        
        this.isLaunching = true;
        this.launchesRemaining--;
        
        // Update UI
        document.getElementById('launchesValue').textContent = this.launchesRemaining;
        
        // Select current character type (T-Rex or regular)
        const useTreex = this.trexUnlocked && this.launchesRemaining === 0;
          // Create a physics body for the character
        const characterDef = new b2BodyDef();
        characterDef.type = b2BodyType.b2_dynamicBody;
        this.safeSetPosition(characterDef.position, 
            this.canvas.width * 0.1 / this.scale, 
            this.canvas.height * 0.7 / this.scale);
        
        const character = this.world.CreateBody(characterDef);
        
        const characterShape = new b2CircleShape();
        characterShape.m_radius = 0.5; // 0.5 meters radius
        
        const fixtureDef = new b2FixtureDef();
        fixtureDef.shape = characterShape;
        fixtureDef.density = 1.0;
        fixtureDef.friction = 0.3;
        fixtureDef.restitution = 0.4; // Bounciness
        
        character.CreateFixture(fixtureDef);
        
        // Set user data for collision detection
        character.userData = {
            type: 'character',
            isTrex: useTreex,
            imageIndex: useTreex ? -1 : Math.floor(Math.random() * this.characters.length)
        };
        
        // Apply launch velocity
        character.ApplyLinearImpulse(
            new b2Vec2(vx / this.scale, -vy / this.scale), 
            character.GetWorldCenter()
        );
        
        // If this is the T-Rex, play roar sound
        if (useTreex) {
            this.sounds.trexRoar.play();
            
            // Apply damage to all targets (T-Rex destroys everything)
            for (let i = 0; i < this.targets.length; i++) {
                const target = this.targets[i];
                if (!target.userData.hit) {
                    target.userData.health = 0;
                    target.userData.hit = true;
                    this.targetsHit++;
                    this.score += target.userData.value;
                }
            }
            
            // Add T-Rex bonus
            this.score += 100;
        }
        
        // Start physics simulation loop
        this.simulatePhysics();
    }
    
    /**
     * Run physics simulation for a launched character
     */
    simulatePhysics() {
        // Time step for Box2D
        const timeStep = 1.0 / 60.0;
        const velocityIterations = 6;
        const positionIterations = 2;
        
        // Flag to detect when physics simulation should end
        let simRunning = true;
        let startTime = Date.now();
        
        const simulationLoop = () => {
            if (!simRunning) return;
            
            // Step the physics world
            this.world.Step(timeStep, velocityIterations, positionIterations);
            
            // Draw the updated state
            this.drawGame();
            
            // Check if simulation should end (timeout or all bodies at rest)
            const elapsedTime = Date.now() - startTime;
            let allBodiesAtRest = true;
            
            // Check if all bodies are at rest
            for (let body = this.world.GetBodyList(); body; body = body.GetNext()) {
                if (body.GetType() === b2BodyType.b2_dynamicBody) {
                    const velocity = body.GetLinearVelocity();
                    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
                    
                    if (speed > 0.1) { // If any body is still moving significantly
                        allBodiesAtRest = false;
                        break;
                    }
                }
            }
            
            // End simulation after timeout or when everything stops moving
            if (elapsedTime > 5000 || allBodiesAtRest) {
                simRunning = false;
                this.isLaunching = false;
                
                // Check if round is over
                if (this.launchesRemaining <= 0 || this.targetsHit >= this.targetsTotal) {
                    this.endRound();
                }
                
                return;
            }
            
            // Continue simulation
            requestAnimationFrame(simulationLoop);
        };
        
        simulationLoop();
    }
    
    /**
     * Create targets for the round
     */
    createTargets() {
        const targetTypes = ['present', 'ornament', 'gnome', 'tree'];
        const targetHealth = { 'present': 1, 'ornament': 2, 'gnome': 3, 'tree': 4 };
        
        // Clear any existing targets
        this.targets = [];
        this.targetsHit = 0;
        this.targetsTotal = GAME_CONSTANTS.TARGETS_PER_ROUND;
        
        // Create targets on the right side of the screen
        for (let i = 0; i < this.targetsTotal; i++) {
            const targetType = targetTypes[Math.floor(Math.random() * targetTypes.length)];
            
            const targetDef = new b2BodyDef();
            targetDef.type = b2BodyType.b2_dynamicBody;
              // Position targets in a formation on the right side
            const row = Math.floor(i / 5);
            const col = i % 5;
            
            this.safeSetPosition(
                targetDef.position,
                (this.canvas.width * 0.6 + col * 30) / this.scale,
                (this.canvas.height * 0.3 + row * 40) / this.scale
            );
            
            const target = this.world.CreateBody(targetDef);
            
            // Different shapes for different target types
            let shape;
            if (targetType === 'ornament') {
                shape = new b2CircleShape();
                shape.m_radius = 0.5;
            } else {
                shape = new b2PolygonShape();
                
                if (targetType === 'present') {
                    shape.SetAsBox(0.5, 0.5); // Square
                } else if (targetType === 'gnome') {
                    shape.SetAsBox(0.4, 0.8); // Tall rectangle
                } else { // tree
                    shape.SetAsBox(0.6, 1.0); // Large rectangle
                }
            }
            
            const fixtureDef = new b2FixtureDef();
            fixtureDef.shape = shape;
            fixtureDef.density = 1.0;
            fixtureDef.friction = 0.3;
            fixtureDef.restitution = 0.1;
            
            target.CreateFixture(fixtureDef);
            
            // Set user data for collision detection
            target.userData = {
                type: 'target',
                targetType: targetType,
                hit: false,
                health: targetHealth[targetType],
                value: GAME_CONSTANTS.TARGET_VALUES[targetType]
            };
            
            this.targets.push(target);
        }
    }
    
    /**
     * Draw the current game state on the canvas
     */
    drawGame() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        if (this.backgroundImage) {
            this.ctx.drawImage(this.backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            // Fallback background if image not loaded
            this.ctx.fillStyle = '#34495e';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw snow effect
            this.ctx.fillStyle = 'white';
            for (let i = 0; i < 50; i++) {
                const x = Math.random() * this.canvas.width;
                const y = Math.random() * this.canvas.height;
                const radius = Math.random() * 3 + 1;
                this.ctx.beginPath();
                this.ctx.arc(x, y, radius, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        
        // Draw slingshot
        const slingshotX = this.canvas.width * 0.1;
        const slingshotY = this.canvas.height * 0.7;
        
        if (this.slingshotImage) {
            this.ctx.drawImage(
                this.slingshotImage, 
                slingshotX - 25, 
                slingshotY - 50, 
                50, 
                100
            );
        } else {
            // Fallback slingshot if image not loaded
            this.ctx.fillStyle = 'brown';
            this.ctx.fillRect(slingshotX - 5, slingshotY, 10, 50);
            this.ctx.fillRect(slingshotX - 25, slingshotY - 50, 10, 50);
            this.ctx.fillRect(slingshotX + 15, slingshotY - 50, 10, 50);
        }
        
        // Draw elastic band
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 3;
        
        if (this.isTouching) {
            // Draw pulled elastic
            this.ctx.beginPath();
            this.ctx.moveTo(slingshotX - 20, slingshotY - 40);
            this.ctx.lineTo(this.touchCurrent.x, this.touchCurrent.y);
            this.ctx.lineTo(slingshotX + 20, slingshotY - 40);
            this.ctx.stroke();
            
            // Draw character on elastic
            const characterRadius = 20;
            this.ctx.fillStyle = '#ff0000';
            this.ctx.beginPath();
            this.ctx.arc(this.touchCurrent.x, this.touchCurrent.y, characterRadius, 0, Math.PI * 2);
            this.ctx.fill();
        } else {
            // Draw relaxed elastic
            this.ctx.beginPath();
            this.ctx.moveTo(slingshotX - 20, slingshotY - 40);
            this.ctx.lineTo(slingshotX, slingshotY - 30);
            this.ctx.lineTo(slingshotX + 20, slingshotY - 40);
            this.ctx.stroke();
        }
        
        // Draw Box2D bodies
        if (this.world) {
            for (let body = this.world.GetBodyList(); body; body = body.GetNext()) {
                const position = body.GetPosition();
                const angle = body.GetAngle();
                
                this.ctx.save();
                this.ctx.translate(position.x * this.scale, position.y * this.scale);
                this.ctx.rotate(angle);
                
                if (body.userData) {
                    if (body.userData.type === 'character') {
                        // Draw character
                        if (body.userData.isTrex) {
                            // Draw T-Rex
                            this.ctx.fillStyle = '#4a7f2c';
                            this.ctx.beginPath();
                            this.ctx.arc(0, 0, 0.5 * this.scale, 0, Math.PI * 2);
                            this.ctx.fill();
                            
                            // Santa hat
                            this.ctx.fillStyle = '#e74c3c';
                            this.ctx.beginPath();
                            this.ctx.moveTo(0, -0.5 * this.scale);
                            this.ctx.lineTo(-0.3 * this.scale, -0.6 * this.scale);
                            this.ctx.lineTo(0.3 * this.scale, -0.8 * this.scale);
                            this.ctx.closePath();
                            this.ctx.fill();
                            
                            // Santa hat pom-pom
                            this.ctx.fillStyle = 'white';
                            this.ctx.beginPath();
                            this.ctx.arc(0.3 * this.scale, -0.8 * this.scale, 0.1 * this.scale, 0, Math.PI * 2);
                            this.ctx.fill();
                        } else {
                            // Draw regular character
                            this.ctx.fillStyle = '#3498db';
                            this.ctx.beginPath();
                            this.ctx.arc(0, 0, 0.5 * this.scale, 0, Math.PI * 2);
                            this.ctx.fill();
                        }
                    } else if (body.userData.type === 'target') {
                        // Draw different target types
                        switch (body.userData.targetType) {
                            case 'present':
                                this.ctx.fillStyle = '#e74c3c';
                                this.ctx.fillRect(-0.5 * this.scale, -0.5 * this.scale, this.scale, this.scale);
                                this.ctx.strokeStyle = '#f1c40f';
                                this.ctx.lineWidth = 2;
                                this.ctx.strokeRect(-0.5 * this.scale, -0.5 * this.scale, this.scale, this.scale);
                                break;
                                
                            case 'ornament':
                                this.ctx.fillStyle = '#9b59b6';
                                this.ctx.beginPath();
                                this.ctx.arc(0, 0, 0.5 * this.scale, 0, Math.PI * 2);
                                this.ctx.fill();
                                break;
                                
                            case 'gnome':
                                // Body
                                this.ctx.fillStyle = '#e74c3c';
                                this.ctx.fillRect(-0.4 * this.scale, -0.8 * this.scale, 0.8 * this.scale, 1.6 * this.scale);
                                
                                // Hat
                                this.ctx.fillStyle = '#2ecc71';
                                this.ctx.beginPath();
                                this.ctx.moveTo(-0.4 * this.scale, -0.8 * this.scale);
                                this.ctx.lineTo(0.4 * this.scale, -0.8 * this.scale);
                                this.ctx.lineTo(0, -1.2 * this.scale);
                                this.ctx.closePath();
                                this.ctx.fill();
                                break;
                                
                            case 'tree':
                                // Trunk
                                this.ctx.fillStyle = '#8b4513';
                                this.ctx.fillRect(-0.2 * this.scale, 0, 0.4 * this.scale, this.scale);
                                
                                // Tree
                                this.ctx.fillStyle = '#2ecc71';
                                this.ctx.beginPath();
                                this.ctx.moveTo(-0.6 * this.scale, 0);
                                this.ctx.lineTo(0.6 * this.scale, 0);
                                this.ctx.lineTo(0, -this.scale);
                                this.ctx.closePath();
                                this.ctx.fill();
                                
                                this.ctx.beginPath();
                                this.ctx.moveTo(-0.5 * this.scale, -0.3 * this.scale);
                                this.ctx.lineTo(0.5 * this.scale, -0.3 * this.scale);
                                this.ctx.lineTo(0, -1.2 * this.scale);
                                this.ctx.closePath();
                                this.ctx.fill();
                                break;
                        }
                    }
                }
                
                this.ctx.restore();
            }
        }
        
        // Draw UI elements
        this.updateStats();
    }
    
    /**
     * Update the game statistics display
     */
    updateStats() {
        const scoreElement = document.getElementById('scoreValue');
        const launchesElement = document.getElementById('launchesValue');
        const timeElement = document.getElementById('timeValue');
        
        if (scoreElement) scoreElement.textContent = this.score;
        if (launchesElement) launchesElement.textContent = this.launchesRemaining;
        
        if (timeElement) {
            const minutes = Math.floor(this.timeRemaining / 60);
            const seconds = this.timeRemaining % 60;
            timeElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    /**
     * Start a new game round
     */
    async startGame() {
        // Get player name
        const playerNameInput = document.getElementById('playerName');
        this.playerName = playerNameInput.value.trim() || 'Player';
        
        // Validate player name
        if (this.playerName.length > 20) {
            this.playerName = this.playerName.substring(0, 20);
        }
        
        // Hide player name input
        document.getElementById('playerNameInput').classList.add('d-none');
        
        // Reset game state
        this.score = 0;
        this.launchesRemaining = GAME_CONSTANTS.MAX_LAUNCHES;
        this.timeRemaining = GAME_CONSTANTS.ROUND_TIME;
        this.targetsHit = 0;
        this.trexUnlocked = false;
        
        // Initialize physics if not already done
        if (!this.world) {
            await this.initPhysics();
        }
        
        // Create targets
        this.createTargets();
        
        // Start game loop
        this.isRunning = true;
        this.startGameLoop();
        
        // Load customizations from localStorage
        this.loadCustomizations();
        
        // Start background music if enabled
        if (document.querySelector('.music-icon').textContent === '🔊') {
            this.sounds.backgroundMusic.play();
        }
    }
    
    /**
     * Start the main game loop
     */
    startGameLoop() {
        let lastTime = Date.now();
        let timer = 0;
        
        const loop = () => {
            if (!this.isRunning) return;
            
            const now = Date.now();
            const deltaTime = (now - lastTime) / 1000; // Convert to seconds
            lastTime = now;
            
            // Update timer
            timer += deltaTime;
            if (timer >= 1) {
                timer = 0;
                if (this.timeRemaining > 0) {
                    this.timeRemaining--;
                } else {
                    // Time's up, end the round
                    this.endRound();
                    return;
                }
            }
            
            // Draw game
            this.drawGame();
            
            // Continue loop
            requestAnimationFrame(loop);
        };
        
        loop();
    }
    
    /**
     * End the current game round
     */
    endRound() {
        this.isRunning = false;
        
        // Stop background music
        this.sounds.backgroundMusic.pause();
        this.sounds.backgroundMusic.currentTime = 0;
        
        // Add bonus for finishing quickly
        if (this.timeRemaining > 0) {
            this.score += GAME_CONSTANTS.QUICK_ROUND_BONUS;
        }
        
        // Update final score display
        document.getElementById('finalScore').textContent = this.score;
        
        // Add score to leaderboard
        this.updateLeaderboard();
        
        // Show game over screen
        document.getElementById('gameOverScreen').classList.remove('d-none');
    }
    
    /**
     * Update the leaderboard with the current score
     */
    updateLeaderboard() {
        // Get existing leaderboard from localStorage
        let leaderboard = [];
        try {
            const savedLeaderboard = localStorage.getItem('angryParentsLeaderboard');
            if (savedLeaderboard) {
                leaderboard = JSON.parse(savedLeaderboard);
            }
        } catch (e) {
            console.error('Error loading leaderboard:', e);
        }
        
        // Add current score
        leaderboard.push({
            name: this.playerName,
            score: this.score,
            date: new Date().toISOString()
        });
        
        // Sort by score (highest first)
        leaderboard.sort((a, b) => b.score - a.score);
        
        // Limit to top 10
        if (leaderboard.length > 10) {
            leaderboard = leaderboard.slice(0, 10);
        }
        
        // Save back to localStorage
        try {
            localStorage.setItem('angryParentsLeaderboard', JSON.stringify(leaderboard));
        } catch (e) {
            console.error('Error saving leaderboard:', e);
        }
    }
    
    /**
     * Show the leaderboard
     */
    showLeaderboard() {
        // Get leaderboard data
        let leaderboard = [];
        try {
            const savedLeaderboard = localStorage.getItem('angryParentsLeaderboard');
            if (savedLeaderboard) {
                leaderboard = JSON.parse(savedLeaderboard);
            }
        } catch (e) {
            console.error('Error loading leaderboard:', e);
        }
        
        // Populate leaderboard table
        const tableBody = document.getElementById('leaderboardBody');
        tableBody.innerHTML = '';
        
        if (leaderboard.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="3" class="text-center">No scores yet</td>';
            tableBody.appendChild(row);
        } else {
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
        
        // Show leaderboard
        document.getElementById('leaderboard').classList.remove('d-none');
        
        // Hide game over screen if it's visible
        document.getElementById('gameOverScreen').classList.add('d-none');
    }
    
    /**
     * Hide the leaderboard
     */
    hideLeaderboard() {
        document.getElementById('leaderboard').classList.add('d-none');
    }
    
    /**
     * Show the help screen
     */
    showHelp() {
        document.getElementById('helpScreen').classList.remove('d-none');
    }
    
    /**
     * Hide the help screen
     */
    hideHelp() {
        document.getElementById('helpScreen').classList.add('d-none');
    }
    
    /**
     * Show the customization form
     */
    showCustomizationForm() {
        document.getElementById('customizeForm').classList.remove('d-none');
    }
    
    /**
     * Hide the customization form
     */
    hideCustomizationForm() {
        document.getElementById('customizeForm').classList.add('d-none');
    }
    
    /**
     * Show the player name input screen
     */
    showPlayerNameInput() {
        // Hide game over screen if it's visible
        document.getElementById('gameOverScreen').classList.add('d-none');
        
        // Show player name input
        document.getElementById('playerNameInput').classList.remove('d-none');
    }
    
    /**
     * Toggle background music
     */
    toggleMusic() {
        const musicIcon = document.querySelector('.music-icon');
        
        if (musicIcon.textContent === '🔊') {
            // Turn off music
            musicIcon.textContent = '🔇';
            this.sounds.backgroundMusic.pause();
        } else {
            // Turn on music
            musicIcon.textContent = '🔊';
            if (this.isRunning) {
                this.sounds.backgroundMusic.play();
            }
        }
    }
    
    /**
     * Load saved customizations from localStorage
     */
    loadCustomizations() {
        try {
            // Load characters (photos)
            const characters = localStorage.getItem('angryParentsCharacters');
            if (characters) {
                this.characters = JSON.parse(characters);
            }
            
            // Load funny messages
            const messages = localStorage.getItem('angryParentsMessages');
            if (messages) {
                this.funnyMessages = JSON.parse(messages);
            }
        } catch (e) {
            console.error('Error loading customizations:', e);
        }
    }
    
    /**
     * Check if the game is using a fallback Box2D implementation
     */
    checkFallbackImplementation() {
        // Check for typical properties of our fallback implementation
        try {
            const testVec = new b2Vec2(1, 1);
            const usingFallback = typeof testVec.Length !== 'function';
            
            if (usingFallback && !this._fallbackWarningShown) {
                console.warn('Using fallback Box2D implementation - game may not function correctly');
                this.showFallbackWarning();
            }
        } catch (error) {
            console.error('Error checking Box2D implementation:', error);
        }
    }
    
    /**
     * Show a warning message about fallback implementation
     */
    showFallbackWarning() {
        const warningElement = document.createElement('div');
        warningElement.style.position = 'absolute';
        warningElement.style.top = '10px';
        warningElement.style.left = '50%';
        warningElement.style.transform = 'translateX(-50%)';
        warningElement.style.backgroundColor = 'rgba(255, 200, 0, 0.8)';
        warningElement.style.padding = '10px';
        warningElement.style.borderRadius = '5px';
        warningElement.style.color = 'black';
        warningElement.style.fontWeight = 'bold';
        warningElement.style.zIndex = '1000';
        warningElement.textContent = 'Running in limited physics mode. Game may not function correctly.';
        
        document.body.appendChild(warningElement);
        
        // Hide after 5 seconds
        setTimeout(() => {
            warningElement.style.opacity = '0';
            warningElement.style.transition = 'opacity 1s';
            setTimeout(() => {
                document.body.removeChild(warningElement);
            }, 1000);
        }, 5000);
        
        this._fallbackWarningShown = true;
    }
    
    /**
     * Show a warning for iOS users about potential WebAssembly issues
     */
    showIOSWarning() {
        const warningElement = document.createElement('div');
        warningElement.style.position = 'absolute';
        warningElement.style.top = '10px';
        warningElement.style.left = '50%';
        warningElement.style.transform = 'translateX(-50%)';
        warningElement.style.backgroundColor = 'rgba(255, 200, 0, 0.8)';
        warningElement.style.padding = '10px';
        warningElement.style.borderRadius = '5px';
        warningElement.style.color = 'black';
        warningElement.style.fontWeight = 'bold';
        warningElement.style.zIndex = '1000';
        warningElement.textContent = 'iOS device detected. If game physics don\'t work correctly, please try a different browser.';
        
        document.body.appendChild(warningElement);
        
        // Hide after 5 seconds
        setTimeout(() => {
            warningElement.style.opacity = '0';
            warningElement.style.transition = 'opacity 1s';
            setTimeout(() => {
                document.body.removeChild(warningElement);
            }, 1000);
        }, 8000);
    }
    
    /**
     * Show a physics initialization error message
     */
    showPhysicsError() {
        const errorElement = document.createElement('div');
        errorElement.style.position = 'absolute';
        errorElement.style.top = '50%';
        errorElement.style.left = '50%';
        errorElement.style.transform = 'translate(-50%, -50%)';
        errorElement.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
        errorElement.style.padding = '20px';
        errorElement.style.borderRadius = '10px';
        errorElement.style.color = 'white';
        errorElement.style.fontWeight = 'bold';
        errorElement.style.zIndex = '1000';
        errorElement.style.textAlign = 'center';
        errorElement.innerHTML = `
            <h3>Physics Engine Error</h3>
            <p>There was a problem initializing the physics engine.</p>
            <p>The game will attempt to continue with limited functionality.</p>
            <button id="continue-btn" style="padding: 10px; margin-top: 10px; cursor: pointer;">Continue Anyway</button>
        `;
        
        document.body.appendChild(errorElement);
        
        document.getElementById('continue-btn').addEventListener('click', () => {
            document.body.removeChild(errorElement);
        });
    }
    
    /**
     * Helper method to set position safely across different Box2D versions
     * @param {Object} positionObj - Box2D position object
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    safeSetPosition(positionObj, x, y) {
        if (typeof positionObj.Set === 'function') {
            // Using older Box2D API
            positionObj.Set(x, y);
        } else {
            // Using newer Box2D-WASM API
            positionObj.x = x;
            positionObj.y = y;
        }
    }
}

// Wait for the DOM to load before initializing the game
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Angry Parents: Christmas Edition');
    
    // Create a new game instance
    window.game = new Game();
    
    // Load game assets
    window.game.loadAssets()
        .then(success => {
            if (success) {
                console.log('Game assets loaded successfully');
            } else {
                console.warn('Some game assets failed to load');
            }
        });
});
