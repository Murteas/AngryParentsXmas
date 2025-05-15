/**
 * box2d-test.js - Test script for Box2D compatibility
 * This file tests various Box2D functions to ensure compatibility across different browsers
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🧪 Running Box2D compatibility tests...');
    
    // Create a container for test results
    const resultsContainer = document.createElement('div');
    resultsContainer.id = 'b2d-test-results';
    resultsContainer.style.position = 'fixed';
    resultsContainer.style.top = '50px';
    resultsContainer.style.right = '20px';
    resultsContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    resultsContainer.style.color = 'white';
    resultsContainer.style.padding = '10px';
    resultsContainer.style.borderRadius = '5px';
    resultsContainer.style.maxWidth = '300px';
    resultsContainer.style.fontSize = '12px';
    resultsContainer.style.fontFamily = 'monospace';
    resultsContainer.style.zIndex = '10000';
    
    const header = document.createElement('div');
    header.textContent = '📊 Box2D Compatibility Tests';
    header.style.fontWeight = 'bold';
    header.style.marginBottom = '5px';
    resultsContainer.appendChild(header);
    
    const testList = document.createElement('ul');
    testList.style.listStyleType = 'none';
    testList.style.margin = '0';
    testList.style.padding = '0';
    resultsContainer.appendChild(testList);
    
    document.body.appendChild(resultsContainer);
    
    // Helper function to add a test result
    function addTestResult(name, result, details = '') {
        const testItem = document.createElement('li');
        
        const status = result ? '✅' : '❌';
        testItem.innerHTML = `${status} ${name}`;
        testItem.style.color = result ? '#8f8' : '#f88';
        
        if (details) {
            const detailsSpan = document.createElement('span');
            detailsSpan.textContent = details;
            detailsSpan.style.color = '#bbb';
            detailsSpan.style.fontSize = '10px';
            detailsSpan.style.display = 'block';
            detailsSpan.style.marginLeft = '15px';
            testItem.appendChild(detailsSpan);
        }
        
        testList.appendChild(testItem);
        return result;
    }
    
    // Helper function to run all tests
    async function runTests() {
        try {
            // Test 1: Box2D is defined
            const box2dAvailable = typeof Box2D !== 'undefined';
            addTestResult('Box2D Available', box2dAvailable);
            if (!box2dAvailable) return;
            
            // Wait for Box2D init if available
            try {
                if (typeof Box2D.init === 'function') {
                    await Box2D.init();
                    addTestResult('Box2D.init() Success', true);
                } else {
                    addTestResult('Box2D.init()', false, 'Function not available');
                }
            } catch (e) {
                addTestResult('Box2D.init()', false, e.message);
            }
            
            // Test basic objects
            const tests = [
                { name: 'b2Vec2', check: () => new Box2D.b2Vec2(0, 0) instanceof Object },
                { name: 'b2World', check: () => new Box2D.b2World(new Box2D.b2Vec2(0, 9.8)) instanceof Object },
                { name: 'b2BodyDef', check: () => new Box2D.b2BodyDef() instanceof Object },
                { name: 'b2Body', check: () => Box2D.b2Body !== undefined },
                { name: 'b2PolygonShape', check: () => new Box2D.b2PolygonShape() instanceof Object },
                { name: 'b2CircleShape', check: () => new Box2D.b2CircleShape() instanceof Object }
            ];
            
            for (const test of tests) {
                try {
                    const result = test.check();
                    addTestResult(test.name, result);
                } catch (e) {
                    addTestResult(test.name, false, e.message);
                }
            }
            
            // Test vector operations
            try {
                const vec = new Box2D.b2Vec2(3, 4);
                const hasX = typeof vec.x === 'number';
                const hasY = typeof vec.y === 'number';
                addTestResult('Vector x,y properties', hasX && hasY, `x: ${hasX}, y: ${hasY}`);
                
                // Test Set method
                let setMethodWorks = false;
                try {
                    if (typeof vec.Set === 'function') {
                        vec.Set(5, 6);
                        setMethodWorks = vec.x === 5 && vec.y === 6;
                    } else {
                        // Try direct assignment
                        vec.x = 5;
                        vec.y = 6;
                        setMethodWorks = vec.x === 5 && vec.y === 6;
                    }
                } catch (e) {
                    // Do nothing
                }
                addTestResult('Vector position setting', setMethodWorks, 
                    setMethodWorks ? 'Using ' + (typeof vec.Set === 'function' ? 'Set()' : 'direct properties') : 'Failed');
            } catch (e) {
                addTestResult('Vector operations', false, e.message);
            }
            
            // Test world creation and body addition
            try {
                const world = new Box2D.b2World(new Box2D.b2Vec2(0, 9.8));
                const bodyDef = new Box2D.b2BodyDef();
                
                // Test position setting
                try {
                    if (typeof bodyDef.position.Set === 'function') {
                        bodyDef.position.Set(10, 10);
                    } else {
                        bodyDef.position.x = 10;
                        bodyDef.position.y = 10;
                    }
                    
                    const positionSetCorrectly = 
                        bodyDef.position.x === 10 && 
                        bodyDef.position.y === 10;
                    
                    addTestResult('Body position setting', positionSetCorrectly);
                } catch (e) {
                    addTestResult('Body position setting', false, e.message);
                }
                
                // Test body creation
                try {
                    const body = world.CreateBody(bodyDef);
                    addTestResult('World.CreateBody', body instanceof Object);
                } catch (e) {
                    addTestResult('World.CreateBody', false, e.message);
                }
                
                // Test Step method
                try {
                    world.Step(1/60, 8, 3);
                    addTestResult('World.Step', true);
                } catch (e) {
                    addTestResult('World.Step', false, e.message);
                }
            } catch (e) {
                addTestResult('World creation', false, e.message);
            }
            
            // Display API version information if physics class is available
            if (window.Physics && typeof window.Physics.prototype.detectApiVersion === 'function') {
                const physics = new Physics();
                await physics.init();
                const apiVersion = physics.detectApiVersion();
                const versionInfo = document.createElement('div');
                versionInfo.style.marginTop = '10px';
                versionInfo.style.fontWeight = 'bold';
                versionInfo.textContent = `API Version: ${apiVersion}`;
                versionInfo.style.color = apiVersion === 'fallback' ? '#f88' : '#8f8';
                resultsContainer.appendChild(versionInfo);
            }
            
            // Add a close button
            const closeButton = document.createElement('button');
            closeButton.textContent = 'Close';
            closeButton.style.marginTop = '10px';
            closeButton.style.padding = '5px';
            closeButton.style.width = '100%';
            closeButton.addEventListener('click', function() {
                document.body.removeChild(resultsContainer);
            });
            resultsContainer.appendChild(closeButton);
            
        } catch (e) {
            console.error('Test error:', e);
            addTestResult('General test execution', false, e.message);
        }
    }
    
    // Run tests after Box2D has had time to load
    setTimeout(runTests, 1000);
});
