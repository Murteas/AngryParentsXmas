// Box2D.js fallback implementation
window.Box2D = window.Box2D || {
    init: async function() {
        console.warn('Using fallback Box2D implementation');
        return Promise.resolve();
    },
    b2Vec2: function(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    },
    b2World: function() {
        return {
            Step: function() {},
            CreateBody: function() { return {} },
            DestroyBody: function() {}
        };
    },
    b2BodyDef: function() {
        this.type = 0;
        this.position = { x: 0, y: 0 };
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
        return {
            SetAsBox: function() {}
        };
    },
    b2CircleShape: function() {
        this.m_radius = 1;
    }
};
