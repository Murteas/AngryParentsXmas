// Box2D.js fallback implementation
window.Box2D = window.Box2D || {
    init: async function() {
        console.warn('Using fallback Box2D implementation - game will run in limited mode');
        return Promise.resolve();
    },

    // Namespace structure to match Box2D API
    Common: {
        Math: {
            b2Vec2: function(x, y) {
                this.x = x || 0;
                this.y = y || 0;
                this.Set = function(x, y) {
                    this.x = x || 0;
                    this.y = y || 0;
                    return this;
                };
                this.Length = function() {
                    return Math.sqrt(this.x * this.x + this.y * this.y);
                };
                this.Add = function(v) {
                    return new Box2D.Common.Math.b2Vec2(this.x + v.x, this.y + v.y);
                };
                this.Subtract = function(v) {
                    return new Box2D.Common.Math.b2Vec2(this.x - v.x, this.y - v.y);
                };
                this.Multiply = function(a) {
                    return new Box2D.Common.Math.b2Vec2(this.x * a, this.y * a);
                };
                this.Copy = function() {
                    return new Box2D.Common.Math.b2Vec2(this.x, this.y);
                };
            }
        }
    },
    
    Collision: {
        Shapes: {
            b2PolygonShape: function() {
                return {
                    m_vertices: [],
                    m_radius: 0,
                    width: 0,
                    height: 0,
                    SetAsBox: function(width, height) {
                        this.m_radius = Math.sqrt(width * width + height * height);
                        this.width = width;
                        this.height = height;
                        // Create a rectangular shape
                        this.m_vertices = [
                            { x: -width, y: -height },
                            { x: width, y: -height },
                            { x: width, y: height },
                            { x: -width, y: height }
                        ];
                        return this;
                    }
                };
            },
            
            b2CircleShape: function(radius) {
                const shape = {
                    m_radius: radius || 1,
                    m_p: { x: 0, y: 0 },
                    Set: function(radius) {
                        this.m_radius = radius;
                        return this;
                    }
                };
                return shape;
            }
        }
    },
    
    Dynamics: {
        b2World: function(gravity) {
            const worldObj = {
                gravity: gravity || { x: 0, y: 9.8 },
                bodies: [], // Initialize bodies array on the world object itself
                currentBodyIndex: 0, // For GetBodyList and GetNext
                  
                Step: function(timeStep, velocityIterations, positionIterations) {
                    // Simple simulation step with basic physics
                    const gravity = this.gravity;
                    
                    // Apply gravity and update positions for all bodies
                    for (let i = 0; i < this.bodies.length; i++) {
                        const body = this.bodies[i];
                        
                        // Only apply physics to dynamic bodies
                        if (body.type === 2) { // b2_dynamicBody
                            // Apply gravity
                            body.linearVelocity.y += gravity.y * timeStep;
                            body.linearVelocity.x += gravity.x * timeStep;
                            
                            // Update position based on velocity
                            body.position.x += body.linearVelocity.x * timeStep;
                            body.position.y += body.linearVelocity.y * timeStep;
                            
                            // Very simple ground collision detection
                            // This assumes ground is at the bottom of the canvas
                            if (body.position.y > 19.5) { // Assuming canvas height is ~600px and scale is 30
                                body.position.y = 19.5;
                                body.linearVelocity.y *= -0.5; // Bounce effect
                                body.linearVelocity.x *= 0.9; // Friction
                            }
                        }
                    }
                },
                
                CreateBody: function(bodyDef) {
                    const body = {
                        position: bodyDef.position,
                        type: bodyDef.type,
                        fixtures: [],
                        angle: 0,
                        userData: null,
                        // Add next pointer for iteration
                        next: null,
                        // Add velocity for physics simulation
                        linearVelocity: { x: 0, y: 0 },
                        CreateFixture: function(fixDef, density) {
                            const fixture = {
                                shape: fixDef.shape || fixDef, // Handle both fixture def and direct shape
                                density: fixDef.density || density || 0,
                                friction: fixDef.friction || 0.5,
                                restitution: fixDef.restitution || 0.2
                            };
                            this.fixtures.push(fixture);
                            return fixture;
                        },
                        CreateFixture2: function(shape, density) {
                            return this.CreateFixture({
                                shape: shape,
                                density: density || 0
                            });
                        },
                        GetPosition: function() {
                            return this.position;
                        },
                        GetAngle: function() {
                            return this.angle;
                        },
                        SetTransform: function(position, angle) {
                            this.position = position;
                            this.angle = angle;
                        },
                        GetUserData: function() {
                            return this.userData;
                        },
                        SetUserData: function(data) {
                            this.userData = data;
                        },
                        GetType: function() {
                            return this.type;
                        },
                        GetWorldCenter: function() {
                            return this.position;
                        },
                        ApplyLinearImpulse: function(impulse, point) {
                            // In a real physics engine, this would apply an impulse at a point
                            // In our simplified fallback, we just change the velocity directly
                            this.linearVelocity.x += impulse.x;
                            this.linearVelocity.y += impulse.y;
                        },
                        GetLinearVelocity: function() {
                            return this.linearVelocity;
                        },
                        GetNext: function() {
                            // Chain to the next body in the world
                            return this.next;
                        }
                    };
                    
                    // Save body to the world's bodies array and link to previous body
                    if (worldObj.bodies.length > 0) {
                        worldObj.bodies[worldObj.bodies.length - 1].next = body;
                    }
                    worldObj.bodies.push(body);
                    return body;
                },
                
                GetBodyList: function() {
                    // Return the first body in the list (or null if empty)
                    return worldObj.bodies.length > 0 ? worldObj.bodies[0] : null;
                },
                
                DestroyBody: function(body) {
                    const index = worldObj.bodies.indexOf(body);
                    if (index > -1) {
                        // Update the linked list when removing a body
                        if (index > 0) {
                            worldObj.bodies[index - 1].next = (index + 1 < worldObj.bodies.length) ? 
                                worldObj.bodies[index + 1] : null;
                        }
                        worldObj.bodies.splice(index, 1);
                    }
                },
                
                SetContactListener: function(listener) {
                    // Store the listener but don't actually use it in the fallback
                    this.contactListener = listener;
                    
                    // We'll add basic collision handling if the listener has required methods
                    if (listener) {
                        this._processCollisions = function() {
                            // Very basic collision detection could be implemented here
                            // For the fallback, we'll skip complex collision detection
                        };
                    }
                }
            };
            
            return worldObj;
        },
        
        b2BodyDef: function() {
            this.type = 0;
            this.position = { 
                x: 0, 
                y: 0,
                Set: function(x, y) {
                    this.x = x;
                    this.y = y;
                    return this;
                }
            };
        },
        
        b2Body: { 
            b2_dynamicBody: 2, 
            b2_staticBody: 0,
            b2_kinematicBody: 1
        },
        
        b2FixtureDef: function() {
            this.shape = null;
            this.density = 1.0;
            this.friction = 0.5;
            this.restitution = 0.2;
        }
    }
};

// For backward compatibility, also expose the b2Vec2 at the top level
Box2D.b2Vec2 = Box2D.Common.Math.b2Vec2;
Box2D.b2BodyDef = Box2D.Dynamics.b2BodyDef;
Box2D.b2Body = Box2D.Dynamics.b2Body; 
Box2D.b2BodyType = Box2D.Dynamics.b2Body;
Box2D.b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
Box2D.b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
Box2D.b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;