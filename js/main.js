// main.js
// Game initialization and scene management for Angry Parents: Christmas Edition

let gameInstance = null;

function showGameContainer() {
  document.getElementById('customization-form-container').classList.add('d-none');
  document.getElementById('game-container').classList.remove('d-none');
}

function showCustomizationForm() {
  document.getElementById('game-container').classList.add('d-none');
  document.getElementById('customization-form-container').classList.remove('d-none');
}

function startGameScene(customizationData) {
  showGameContainer();
  if (gameInstance) {
    gameInstance.destroy(true);
  }
  gameInstance = new Phaser.Game({
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'phaser-game',
    backgroundColor: '#e0f7fa',
    physics: {
      default: 'matter',
      matter: {
        gravity: { y: 1 },
        enableSleep: true
      }
    },
    scene: [
      window.CustomizationScene || {},
      window.GameScene || {},
      window.LeaderboardScene || {}
    ],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    input: {
      activePointers: 3
    },
    callbacks: {
      postBoot: () => {
        document.getElementById('phaser-game').focus();
      }
    }
  });
  // Pass customizationData to GameScene via global or event
  window.__customizationData = customizationData;
}

// Listen for new round button
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('new-round-btn').addEventListener('click', () => {
    showCustomizationForm();
  });
});
