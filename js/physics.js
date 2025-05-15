/**
 * Physics.js - Handles Box2D physics for Angry Parents: Christmas Edition
 * This file provides a wrapper for Box2D physics engine functionality
 */

class GamePhysics {
    constructor(scale = 30) {
        // Box2D scale (pixels per meter)
        this.scale = scale;
        
        // Box2D world
        this.world = null;
        
        // Box2D shortcuts for better readability
        this.b2Vec2 = null;
        this.b2BodyDef = null;
        this.b2Body = null;
        this.b2BodyType = null;
        this.b2FixtureDef = null;
        this.b2World = null;
        this.b2PolygonShape = null;
        this.b2CircleShape = null;
        
        // Physics bodies
        this.bodies = [];
    }
    
    /**
     * Initialize Box2D physics engine
     * @returns {Promise} Promise that resolves when Box2D is initialized
     */
    async init() {
        try {
            // Wait for Box2D WASM to initialize
            await Box2D.init();
            
            // Create shortcuts to Box2D objects
            this.b2Vec2 = Box2D.b2Vec2;
            this.b2BodyDef = Box2D.b2BodyDef;
            this.b2Body = Box2D.b2Body;
            this.b2BodyType = Box2D.b2BodyType;
            this.b2FixtureDef = Box2D.b2FixtureDef;
            this.b2World = Box2D.b2World;
            this.b2PolygonShape = Box2D.b2PolygonShape;
            this.b2CircleShape = Box2D.b2CircleShape;
            
            // Create a world with gravity
            this.world = new this.b2World(new this.b2Vec2(0, 9.8)); // Earth gravity
            
            console.log('Box2D physics initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize Box2D:', error);
            return false;
        }
    }
    
    /**
     * Set a contact listener for collision detection
     * @param {Object} callbacks - Collision callback functions
     */
    setContactListener(callbacks) {
        if (!this.world) {
            console.error('Physics world not initialized');
            return;
        }
        
        this.world.SetContactListener({
            BeginContact: callbacks.beginContact || function() {},
            EndContact: callbacks.endContact || function() {},
            PreSolve: callbacks.preSolve || function() {},
            PostSolve: callbacks.postSolve || function() {}
        });
    }
    
    /**
     * Create boundaries (ground and walls) for the game world
     * @param {number} width - Canvas width in pixels
     * @param {number} height - Canvas height in pixels
     */
    createBoundaries(width, height) {
        if (!this.world) {
            console.error('Physics world not initialized');
            return;
        }
        
        // Convert dimensions to meters
        const worldWidth = width / this.scale;
        const worldHeight = height / this.scale;
        
        // Create ground
        const groundDef = new this.b2BodyDef();
        groundDef.position.Set(worldWidth / 2, worldHeight - 0.5);
        const ground = this.world.CreateBody(groundDef);
        
        const groundShape = new this.b2PolygonShape();
        groundShape.SetAsBox(worldWidth / 2, 0.5);
        
        ground.CreateFixture(groundShape, 0);
        ground.userData = { type: 'boundary', name: 'ground' };
        
        // Create left wall
        const leftWallDef = new this.b2BodyDef();
        leftWallDef.position.Set(0, worldHeight / 2);
        const leftWall = this.world.CreateBody(leftWallDef);
        
        const leftWallShape = new this.b2PolygonShape();
        leftWallShape.SetAsBox(0.5, worldHeight / 2);
        
        leftWall.CreateFixture(leftWallShape, 0);
        leftWall.userData = { type: 'boundary', name: 'leftWall' };
        
        // Create right wall
        const rightWallDef = new this.b2BodyDef();
        rightWallDef.position.Set(worldWidth, worldHeight / 2);
        const rightWall = this.world.CreateBody(rightWallDef);
        
        const rightWallShape = new this.b2PolygonShape();
        rightWallShape.SetAsBox(0.5, worldHeight / 2);
        
        rightWall.CreateFixture(rightWallShape, 0);
        rightWall.userData = { type: 'boundary', name: 'rightWall' };
    }
    
    /**
     * Create a new character (projectile)
     * @param {number} x - X position in pixels
     * @param {number} y - Y position in pixels
     * @param {Object} userData - Custom data to attach to the body
     * @returns {Object} Box2D body object
     */
    createCharacter(x, y, userData) {
        if (!this.world) {
            console.error('Physics world not initialized');
            return null;
        }
        
        // Convert position to meters
        const posX = x / this.scale;
        const posY = y / this.scale;
        
        // Create body definition
        const bodyDef = new this.b2BodyDef();
        bodyDef.type = this.b2BodyType.b2_dynamicBody;
        bodyDef.position.Set(posX, posY);
        
        // Create body
        const body = this.world.CreateBody(bodyDef);
        
        // Create shape (circle for characters)
        const shape = new this.b2CircleShape();
        shape.m_radius = 0.5; // 0.5 meters radius
        
        // Create fixture
        const fixtureDef = new this.b2FixtureDef();
        fixtureDef.shape = shape;
        fixtureDef.density = 1.0;
        fixtureDef.friction = 0.3;
        fixtureDef.restitution = 0.4; // Bounciness
        
        body.CreateFixture(fixtureDef);
        
        // Set user data
        body.userData = {
            type: 'character',
            ...userData
        };
        
        // Track this body
        this.bodies.push(body);
        
        return body;
    }
    
    /**
     * Create a new target
     * @param {number} x - X position in pixels
     * @param {number} y - Y position in pixels
     * @param {string} targetType - Type of target (present, ornament, gnome, tree)
     * @param {Object} userData - Custom data to attach to the body
     * @returns {Object} Box2D body object
     */
    createTarget(x, y, targetType, userData) {
        if (!this.world) {
            console.error('Physics world not initialized');
            return null;
        }
        
        // Convert position to meters
        const posX = x / this.scale;
        const posY = y / this.scale;
        
        // Create body definition
        const bodyDef = new this.b2BodyDef();
        bodyDef.type = this.b2BodyType.b2_dynamicBody;
        bodyDef.position.Set(posX, posY);
        
        // Create body
        const body = this.world.CreateBody(bodyDef);
        
        // Create shape based on target type
        let shape;
        switch (targetType) {
            case 'ornament':
                shape = new this.b2CircleShape();
                shape.m_radius = 0.5;
                break;
                
            case 'present':
                shape = new this.b2PolygonShape();
                shape.SetAsBox(0.5, 0.5); // Square
                break;
                
            case 'gnome':
                shape = new this.b2PolygonShape();
                shape.SetAsBox(0.4, 0.8); // Tall rectangle
                break;
                
            case 'tree':
                shape = new this.b2PolygonShape();
                shape.SetAsBox(0.6, 1.0); // Large rectangle
                break;
                
            default:
                shape = new this.b2PolygonShape();
                shape.SetAsBox(0.5, 0.5); // Default square
        }
        
        // Create fixture
        const fixtureDef = new this.b2FixtureDef();
        fixtureDef.shape = shape;
        fixtureDef.density = 1.0;
        fixtureDef.friction = 0.3;
        fixtureDef.restitution = 0.1;
        
        body.CreateFixture(fixtureDef);
        
        // Set user data
        body.userData = {
            type: 'target',
            targetType,
            ...userData
        };
        
        // Track this body
        this.bodies.push(body);
        
        return body;
    }
    
    /**
     * Apply an impulse force to a body
     * @param {Object} body - Box2D body
     * @param {number} forceX - X component of force in pixels
     * @param {number} forceY - Y component of force in pixels
     */
    applyImpulse(body, forceX, forceY) {
        if (!body) {
            console.error('Invalid body');
            return;
        }
        
        // Convert force to meters
        const impulseX = forceX / this.scale;
        const impulseY = forceY / this.scale;
        
        // Apply impulse at the center of the body
        body.ApplyLinearImpulse(
            new this.b2Vec2(impulseX, impulseY),
            body.GetWorldCenter()
        );
    }
    
    /**
     * Step the physics simulation forward
     * @param {number} timeStep - Time step in seconds
     * @param {number} velocityIterations - Velocity iterations
     * @param {number} positionIterations - Position iterations
     */
    step(timeStep = 1/60, velocityIterations = 6, positionIterations = 2) {
        if (!this.world) {
            console.error('Physics world not initialized');
            return;
        }
        
        this.world.Step(timeStep, velocityIterations, positionIterations);
    }
    
    /**
     * Get the position and angle of a body in pixel coordinates
     * @param {Object} body - Box2D body
     * @returns {Object} Position and angle in pixels/radians
     */
    getBodyPosition(body) {
        if (!body) {
            return null;
        }
        
        const position = body.GetPosition();
        
        return {
            x: position.x * this.scale,
            y: position.y * this.scale,
            angle: body.GetAngle()
        };
    }
    
    /**
     * Check if a body is at rest
     * @param {Object} body - Box2D body
     * @param {number} threshold - Velocity threshold for "at rest"
     * @returns {boolean} Whether the body is at rest
     */
    isBodyAtRest(body, threshold = 0.1) {
        if (!body) {
            return true;
        }
        
        const velocity = body.GetLinearVelocity();
        const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
        
        return speed <= threshold;
    }
    
    /**
     * Check if all dynamic bodies are at rest
     * @param {number} threshold - Velocity threshold for "at rest"
     * @returns {boolean} Whether all dynamic bodies are at rest
     */
    areAllBodiesAtRest(threshold = 0.1) {
        if (!this.world) {
            return true;
        }
        
        for (let body = this.world.GetBodyList(); body; body = body.GetNext()) {
            if (body.GetType() === this.b2BodyType.b2_dynamicBody) {
                if (!this.isBodyAtRest(body, threshold)) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    /**
     * Clear all bodies except boundaries
     */
    clearBodies() {
        if (!this.world) {
            return;
        }
        
        // We can't remove bodies during iteration, so collect them first
        const bodiesToRemove = [];
        
        for (let body = this.world.GetBodyList(); body; body = body.GetNext()) {
            if (body.userData && body.userData.type !== 'boundary') {
                bodiesToRemove.push(body);
            }
        }
        
        // Remove the collected bodies
        bodiesToRemove.forEach(body => {
            this.world.DestroyBody(body);
        });
        
        // Clear the bodies array
        this.bodies = [];
    }
    
    /**
     * Get all bodies of a specific type
     * @param {string} type - Type of bodies to get
     * @returns {Array} Array of bodies
     */
    getBodiesByType(type) {
        if (!this.world) {
            return [];
        }
        
        const bodies = [];
        
        for (let body = this.world.GetBodyList(); body; body = body.GetNext()) {
            if (body.userData && body.userData.type === type) {
                bodies.push(body);
            }
        }
        
        return bodies;
    }
}

// Create a global instance for the game to use
const gamePhysics = new GamePhysics();
