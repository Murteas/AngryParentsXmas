// customization.js

/**
 * === HOW TO CUSTOMIZE FAMILY PHOTOS & MESSAGES ===
 *
 * 1. Place your own cropped face images (JPEG or PNG, <2MB each) in the folder:
 *      assets/images/
 *    Example: dad.png, mom.png, cousin1.jpg, etc.
 *
 * 2. Update the FAMILY_PHOTOS array below with the filenames of your images.
 *    Example:
 *      window.FAMILY_PHOTOS = [
 *        'assets/images/dad.png',
 *        'assets/images/mom.png',
 *        'assets/images/cousin1.jpg',
 *        'assets/images/cousin2.jpg',
 *        'assets/images/uncle.png'
 *      ];
 *
 * 3. Choose ONE photo to be the gnome face. Set its filename in GNOME_PHOTO below.
 *    Example:
 *      window.GNOME_PHOTO = 'assets/images/uncle.png';
 *
 * 4. Edit the FUNNY_MESSAGES array below with your own funny messages (10-15, max 50 chars each).
 *    Example:
 *      window.FUNNY_MESSAGES = [
 *        "Knocked over the fruitcake!",
 *        "Grandma's ornament is history!",
 *        ...
 *      ];
 *
 * 5. Save and reload the game in your browser. That's it!
 */

// === FAMILY PHOTOS (edit this array) ===
window.FAMILY_PHOTOS = [
  'assets/images/photo1.png',
  'assets/images/photo2.png',
  'assets/images/photo3.png',
  'assets/images/photo4.png',
  'assets/images/photo5.png'
];

// === GNOME FACE PHOTO (choose one from above) ===
window.GNOME_PHOTO = 'assets/images/photo1.png';

// === FUNNY MESSAGES (edit this array) ===
window.FUNNY_MESSAGES = [
  "Smashed Uncle Bob’s fruitcake tower!",
  "Grandma's ornament didn't stand a chance!",
  "Tinsel everywhere!",
  "Gnome down!",
  "Santa would be proud!",
  "That tree is wobblier than last year!",
  "Direct hit on the presents!",
  "Eggnog power shot!",
  "Jingle all the way!",
  "Perfect launch!"
];

// Show face selection screen
window.addEventListener('DOMContentLoaded', function() {
  var container = document.getElementById('customization-form-container');
  var gameContainer = document.getElementById('game-container');
  container.innerHTML = '<h2 class="mb-3">Choose Your Face</h2><div id="face-grid" class="d-flex flex-wrap mb-3"></div><button id="start-game-btn" class="btn btn-primary mt-2" disabled>Start Game</button>';
  var faceGrid = document.getElementById('face-grid');
  window.FAMILY_PHOTOS.forEach(function(src, idx) {
    var div = document.createElement('div');
    div.className = 'p-2';
    var img = document.createElement('img');
    img.src = src;
    img.alt = 'Family face ' + (idx+1);
    img.style.width = '80px';
    img.style.height = '80px';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '50%';
    img.style.border = '3px solid #b22222';
    img.style.cursor = 'pointer';
    img.tabIndex = 0;
    img.addEventListener('click', function() {
      document.querySelectorAll('#face-grid img').forEach(function(i) { i.style.outline = ''; });
      img.style.outline = '4px solid #007bff';
      img.setAttribute('aria-selected', 'true');
      document.getElementById('start-game-btn').disabled = false;
      window.__selectedFaceIdx = idx;
    });
    div.appendChild(img);
    faceGrid.appendChild(div);
  });
  document.getElementById('start-game-btn').addEventListener('click', function() {
    container.classList.add('d-none');
    gameContainer.classList.remove('d-none');
    // Start game with selected face
    var gnomeIdx = window.FAMILY_PHOTOS.indexOf(window.GNOME_PHOTO);
    if (gnomeIdx < 0) gnomeIdx = 0;
    startGameScene({
      photos: window.FAMILY_PHOTOS,
      gnomeIdx: gnomeIdx,
      messages: window.FUNNY_MESSAGES,
      selectedFaceIdx: window.__selectedFaceIdx || 0
    });
  });
});
