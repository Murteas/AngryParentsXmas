// game.js
// Slingshot mechanic, targets, scoring, and gameplay logic using Phaser.js and Matter.js
// This is a stub. Full implementation will follow after initial UI and storage setup.

// GameScene: Loads background, user photos, and sets up slingshot mechanic
function GameScene() {
  Phaser.Scene.call(this, { key: 'GameScene' });
  this.slingshot = null;
  this.slingConstraint = null;
  this.character = null;
  this.launchCount = 0;
  this.maxLaunches = 5;
  this.score = 0;
  this.background = null;
  this.characterTextures = [];
  this.currentCharacterIdx = 0;
  this.isDragging = false;
}

GameScene.prototype = Object.create(Phaser.Scene.prototype);
GameScene.prototype.constructor = GameScene;

GameScene.prototype.preload = function() {
    // Load background (placeholder if not present)
    this.load.image('background', 'assets/images/background.png');
    // Load a cartoon body sprite (placeholder)
    this.load.image('body', 'assets/images/body.png');
    // Load target sprites (placeholders if not present)
    this.load.image('present', 'assets/images/present.png');
    this.load.image('ornament', 'assets/images/ornament.png');
    this.load.image('gnome_statue', 'assets/images/gnome_statue.png');
    this.load.image('tree', 'assets/images/tree.png');
    // Load user photos from localStorage as base64 textures
    var photoCount = parseInt(localStorage.getItem('photo_count') || '0', 10);
    for (var i = 1; i <= photoCount; i++) {
      var dataUrl = localStorage.getItem('photo_' + i);
      if (dataUrl) {
        this.textures.addBase64('photo_' + i, dataUrl);
        this.characterTextures.push('photo_' + i);
      }
    }
    // Load gnome photo
    var gnomePhoto = localStorage.getItem('gnome_photo');
    if (gnomePhoto) {
      this.textures.addBase64('gnome_photo', gnomePhoto);
    }
    // Load audio (stub)
    // this.load.audio('jingle', 'assets/audio/jingle_bells.mp3');
  }

GameScene.prototype.createTargets = function() {
    // Presents (square, 10 points, 2 HP)
    this.targets = [];
    for (var i = 0; i < 5; i++) {
      var present = this.matter.add.sprite(500 + i * 40, 520, 'present')
        .setRectangle(40, 40)
        .setStatic(false)
        .setData('type', 'present')
        .setData('points', 10)
        .setData('hp', 2);
      // Add HP text
      present.hpText = this.add.text(present.x, present.y - 30, '2', { fontSize: '16px', color: '#222', backgroundColor: '#fff' }).setOrigin(0.5);
      present.hpText.setDepth(5);
      present.updateHpText = function() {
        this.hpText.setText(this.getData('hp'));
        this.hpText.setPosition(this.x, this.y - 30);
      };
      this.targets.push(present);
    }
    // Ornaments (round, 20 points, 1 HP)
    for (var i = 0; i < 4; i++) {
      var ornament = this.matter.add.sprite(600 + i * 35, 480, 'ornament')
        .setCircle(18)
        .setStatic(false)
        .setData('type', 'ornament')
        .setData('points', 20)
        .setData('hp', 1);
      ornament.hpText = this.add.text(ornament.x, ornament.y - 25, '1', { fontSize: '16px', color: '#222', backgroundColor: '#fff' }).setOrigin(0.5);
      ornament.hpText.setDepth(5);
      ornament.updateHpText = function() {
        this.hpText.setText(this.getData('hp'));
        this.hpText.setPosition(this.x, this.y - 25);
      };
      this.targets.push(ornament);
    }
    // Gnome statues (tall, 50 points, 3 HP)
    for (var i = 0; i < 2; i++) {
      var gnome = this.matter.add.sprite(700 + i * 50, 520, 'gnome_statue')
        .setRectangle(30, 60)
        .setStatic(false)
        .setData('type', 'gnome_statue')
        .setData('points', 50)
        .setData('hp', 3);
      gnome.hpText = this.add.text(gnome.x, gnome.y - 40, '3', { fontSize: '16px', color: '#222', backgroundColor: '#fff' }).setOrigin(0.5);
      gnome.hpText.setDepth(5);
      gnome.updateHpText = function() {
        this.hpText.setText(this.getData('hp'));
        this.hpText.setPosition(this.x, this.y - 40);
      };
      this.targets.push(gnome);
    }
    // Christmas tree (large, 50 points, 5 HP)
    var tree = this.matter.add.sprite(600, 400, 'tree')
      .setRectangle(60, 100)
      .setStatic(false)
      .setData('type', 'tree')
      .setData('points', 50)
      .setData('hp', 5);
    tree.hpText = this.add.text(tree.x, tree.y - 60, '5', { fontSize: '16px', color: '#222', backgroundColor: '#fff' }).setOrigin(0.5);
    tree.hpText.setDepth(5);
    tree.updateHpText = function() {
      this.hpText.setText(this.getData('hp'));
      this.hpText.setPosition(this.x, this.y - 60);
    };
    this.targets.push(tree);
  }

GameScene.prototype.create = function() {
    // Round timer
    this.roundTime = 120; // seconds
    this.timerText = this.add.text(400, 40, 'Time: 2:00', { fontSize: '22px', color: '#222', backgroundColor: '#fff' }).setOrigin(0.5).setDepth(10);
    this.roundTimer = this.time.addEvent({
      delay: 1000,
      callback: function() {
        this.roundTime--;
        var min = Math.floor(this.roundTime / 60);
        var sec = this.roundTime % 60;
        this.timerText.setText('Time: ' + min + ':' + (sec < 10 ? '0' : '') + sec);
        if (this.roundTime <= 0) {
          this.endRound();
        }
      },
      callbackScope: this,
      loop: true
    });
    // Add background
    this.background = this.add.image(400, 300, 'background').setDisplaySize(800, 600);

    // Set up slingshot base (visual only for now)
    this.slingshot = this.add.rectangle(150, 500, 30, 120, 0x8B5A2B).setDepth(1);

    // Add first character (photo on cartoon body)
    this.spawnCharacter();

    // Create targets
    this.createTargets();

    // Set up input for drag-and-release
    this.input.on('pointerdown', this.onPointerDown, this);
    this.input.on('pointermove', this.onPointerMove, this);
    this.input.on('pointerup', this.onPointerUp, this);

    // Score and launches UI
    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '20px', color: '#b22222', fontStyle: 'bold' });
    this.launchesText = this.add.text(16, 44, `Launches: ${this.maxLaunches}`, { fontSize: '18px', color: '#222' });

    // Listen for collisions
    this.matter.world.on('collisionstart', this.handleCollision, this);
  }

GameScene.prototype.handleCollision = function(event) {
    // Check for collisions between character and targets
    var messages = [];
    try {
      messages = JSON.parse(localStorage.getItem('messages')) || [];
    } catch (e) {}
    event.pairs.forEach(function(pair) {
      var bodyA = pair.bodyA;
      var bodyB = pair.bodyB;
      var targetSprite = null;
      if (bodyA.gameObject && this.targets.includes(bodyA.gameObject)) {
        targetSprite = bodyA.gameObject;
      } else if (bodyB.gameObject && this.targets.includes(bodyB.gameObject)) {
        targetSprite = bodyB.gameObject;
      }
      if (targetSprite && targetSprite.getData('hp') > 0) {
        // Reduce HP
        var hp = targetSprite.getData('hp') - 1;
        targetSprite.setData('hp', hp);
        if (typeof targetSprite.updateHpText === 'function') targetSprite.updateHpText();
        // Flash effect
        this.tweens.add({ targets: targetSprite, alpha: 0.5, yoyo: true, duration: 100, repeat: 1 });
        // Show random message
        if (messages.length > 0) {
          var msg = messages[Math.floor(Math.random() * messages.length)];
          var msgText = this.add.text(targetSprite.x, targetSprite.y - 80, msg, { fontSize: '18px', color: '#b22222', backgroundColor: '#fff', padding: { x: 8, y: 4 } }).setOrigin(0.5).setDepth(20);
          this.tweens.add({ targets: msgText, y: msgText.y - 40, alpha: 0, duration: 1200, onComplete: function() { msgText.destroy(); } });
        }
        if (hp <= 0) {
          // Award points
          this.score += targetSprite.getData('points');
          this.scoreText.setText('Score: ' + this.score);
          // Remove target and HP text
          if (targetSprite.hpText) targetSprite.hpText.destroy();
          targetSprite.destroy();
        }
      }
    }, this);
  }

GameScene.prototype.spawnCharacter = function() {
  // Remove previous character if exists
  if (this.character) {
    this.character.destroy();
  }
  // Use current photo texture
  var texture = this.characterTextures.length > 0 ? this.characterTextures[this.currentCharacterIdx % this.characterTextures.length] : 'body';
  // Create a Matter.js body for the character
  this.character = this.matter.add.image(150, 500, texture)
    .setCircle(32)
    .setScale(0.5)
    .setBounce(0.5)
    .setFriction(0.005)
    .setDepth(2)
    .setInteractive();
  this.character.setStatic(true);
  this.isDragging = false;
};

GameScene.prototype.onPointerDown = function(pointer) {
  if (this.character && Phaser.Geom.Circle.Contains(this.character.getBounds(), pointer.x, pointer.y)) {
    this.isDragging = true;
    this.character.setStatic(true);
  }
};

GameScene.prototype.onPointerMove = function(pointer) {
  if (this.isDragging && this.character) {
    // Limit drag radius
    var dx = pointer.x - 150;
    var dy = pointer.y - 500;
    var maxRadius = 100;
    var dist = Math.sqrt(dx*dx + dy*dy);
    var angle = Math.atan2(dy, dx);
    if (dist > maxRadius) dist = maxRadius;
    var newX = 150 + Math.cos(angle) * dist;
    var newY = 500 + Math.sin(angle) * dist;
    this.character.setPosition(newX, newY);
  }
};

GameScene.prototype.onPointerUp = function(pointer) {
  if (this.isDragging && this.character) {
    this.isDragging = false;
    // Calculate launch velocity
    var dx = 150 - this.character.x;
    var dy = 500 - this.character.y;
    this.character.setStatic(false);
    this.character.setVelocity(dx * 0.1, dy * 0.1);
    this.launchCount++;
    this.launchesText.setText('Launches: ' + (this.maxLaunches - this.launchCount));
    // After a short delay, spawn next character if launches remain
    this.time.delayedCall(1500, function() {
      if (this.launchCount < this.maxLaunches) {
        this.currentCharacterIdx++;
        this.spawnCharacter();
      } else {
        this.endRound();
      }
    }, [], this);
  }
};

GameScene.prototype.endRound = function() {
  if (this.roundTimer) this.roundTimer.remove(false);
  // Bonus: <2 min completion
  var bonus = 0;
  if (this.roundTime > 0) {
    bonus += 50;
  }
  // Bonus: perfect shot (all targets cleared in one launch)
  var perfect = false;
  if (this.targets && this.targets.length > 0 && this.targets.every(function(t) { return !t.active; })) {
    perfect = true;
    bonus += 20;
  }
  // T-Rex unlock (not implemented yet)

  this.score += bonus;
  // Show game over and score
  this.add.rectangle(400, 300, 500, 200, 0xffffff, 0.95).setDepth(10);
  this.add.text(400, 260, 'Round Over!', { fontSize: '40px', color: '#b22222', fontStyle: 'bold' }).setOrigin(0.5).setDepth(11);
  var scoreMsg = 'Your Score: ' + this.score;
  if (bonus > 0) scoreMsg += '  (+' + bonus + ' bonus)';
  this.add.text(400, 320, scoreMsg, { fontSize: '32px', color: '#222' }).setOrigin(0.5).setDepth(11);
  var btn = this.add.text(400, 380, 'View Leaderboard', { fontSize: '24px', color: '#007bff', backgroundColor: '#fff', padding: { x: 16, y: 8 } })
    .setOrigin(0.5)
    .setInteractive()
    .setDepth(11);
  btn.on('pointerdown', function() {
    if (window.showLeaderboardModal) window.showLeaderboardModal();
  });
};

GameScene.prototype.update = function() {
  // Game loop logic (future: targets, scoring, etc.)
};

window.GameScene = GameScene;
