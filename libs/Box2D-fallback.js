// Box2D.js fallback implementation
window.Box2D = window.Box2D || {
    init: async function() {
        console.warn('Using fallback Box2D implementation - game will run in limited mode');
        return Promise.resolve();
    },
    b2Vec2: function(x, y) {
        this.x = x || 0;
        this.y = y || 0;
        this.Set = function(x, y) {
            this.x = x || 0;
            this.y = y || 0;
        };
    },
    b2World: function(gravity) {
        this.gravity = gravity || { x: 0, y: 9.8 };
        this.bodies = [];
        
        return {
            Step: function() {},
            CreateBody: function(bodyDef) {
                const body = {
                    position: bodyDef.position,
                    type: bodyDef.type,
                    fixtures: [],
                    CreateFixture: function(fixDef) {
                        const fixture = {
                            shape: fixDef.shape,
                            density: fixDef.density,
                            friction: fixDef.friction,
                            restitution: fixDef.restitution
                        };
                        this.fixtures.push(fixture);
                        return fixture;
                    },
                    GetPosition: function() {
                        return this.position;
                    },
                    SetTransform: function(position, angle) {
                        this.position = position;
                        this.angle = angle;
                    }
                };
                
                this.bodies.push(body);
                return body;
            },
            DestroyBody: function(body) {
                const index = this.bodies.indexOf(body);
                if (index > -1) {
                    this.bodies.splice(index, 1);
                }
            }
        };
    },
    b2BodyDef: function() {
        this.type = 0;
        this.position = { 
            x: 0, 
            y: 0,
            Set: function(x, y) {
                this.x = x;
                this.y = y;
            }
        };
    },
    b2Body: { b2_dynamicBody: 2, b2_staticBody: 0 },
    b2BodyType: { b2_dynamicBody: 2, b2_staticBody: 0 },
    b2FixtureDef: function() {
        this.shape = null;
        this.density = 1.0;
        this.friction = 0.5;
        this.restitution = 0.2;
    },
    b2PolygonShape: function() {
        this.vertices = [];
        
        return {
            SetAsBox: function(width, height) {
                this.width = width;
                this.height = height;
                // Create a rectangular shape
                this.vertices = [
                    { x: -width, y: -height },
                    { x: width, y: -height },
                    { x: width, y: height },
                    { x: -width, y: height }
                ];
                return this;
            }
        };
    },
    b2CircleShape: function() {
        this.m_radius = 1;
        this.m_p = { x: 0, y: 0 };
        
        this.Set = function(radius) {
            this.m_radius = radius;
        };
    }
};
