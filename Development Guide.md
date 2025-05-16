# Development Guide for Angry Parents: Christmas Edition

## 1. Project Overview
*Angry Parents: Christmas Edition* is a single-player, web-based arcade game for a family Christmas party, running on a single iPhone with no hosting costs. Players take turns in a pass-and-play mode, using a slingshot to launch characters (customized with family photos) at Christmas-themed targets to earn points, which are tracked on a local leaderboard. The game is customized once by the organizer before play, with 5-10 family photos and 10-15 funny messages. It features a Scandinavian Christmas theme, a T-Rex ultimate weapon, and accessibility requirements (WCAG 2.1 AA). This guide provides a clear roadmap for an Agentic AI to build the game from scratch, based on the latest Product Requirements Document (PRD).

## 2. Objectives
- Build a fully functional game that meets all PRD requirements.
- Ensure zero hosting costs using free static hosting (e.g., GitHub Pages).
- Optimize for iPhone browsers (Safari, Chrome, iOS 16+), with <5s load time and 60 FPS gameplay.
- Use LocalStorage for photos, messages, and leaderboard, with robust error handling.
- Deliver a fun, nostalgic experience with family humor and Christmas theming.

## 3. Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+).
- **Game Framework**: [Phaser.js 3](https://phaser.io/) with Matter.js for 2D physics (slingshot, collisions).
- **Styling**: [Bootstrap 5](https://getbootstrap.com/) for responsive form UI, custom CSS for game visuals.
- **Storage**: LocalStorage for photos (base64-encoded), messages, and leaderboard scores.
- **Assets**: Sprite sheets (PNG) for characters and targets, MP3 files for audio (<1MB total).
- **Hosting**: GitHub Pages for free static hosting.
- **Tools**: VSCode with GitHub Copilot (GPT-4.1) for coding, Git for version control.

## 4. File Structure
```
AngryParentsXmas/
├── index.html          # Main entry point (customization form, game loader)
├── css/
│   └── style.css       # Responsive styles for form and game
├── js/
│   ├── main.js         # Game initialization, scene management
│   ├── customization.js # Form logic, photo/message storage
│   ├── game.js         # Slingshot mechanic, targets, scoring
│   └── leaderboard.js  # Score tracking, leaderboard display
├── assets/
│   ├── images/         # Sprite sheets (characters, targets, background)
│   └── audio/          # Sound effects, background music
└── README.md           # Project setup and user guide
```

## 5. Implementation Steps

### 5.1 Setup and Initialization
1. **Create Repository**:
   - Initialize a Git repository on GitHub (`AngryParentsXmas`).
   - Set up GitHub Pages for deployment (use `main` branch).
2. **Install Dependencies**:
   - Include Phaser.js via CDN: `https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.min.js`.
   - Include Bootstrap via CDN: `https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css` and JS bundle.
3. **Create `index.html`**:
   - Set up a responsive HTML5 structure with Bootstrap.
   - Include a customization form and a placeholder `<canvas>` for the game.
   - Load `js/main.js` and other scripts.
4. **Initialize Phaser in `js/main.js`**:
   - Create a Phaser game instance (800x600px, auto-scaled for iPhone).
   - Define scenes: `CustomizationScene`, `GameScene`, `LeaderboardScene`.

### 5.2 Customization Form (`js/customization.js`)
1. **Build Form in `index.html`**:
   - Add inputs for 5-10 photos ( `<input type="file" accept="image/jpeg,image/png" multiple>`).
   - Add 10-15 text inputs for messages ( `<input type="text" maxlength="50">`).
   - Include a dropdown to select one photo for the gnome character.
   - Add a “Save and Start” button and an “Add Message” button to dynamically add message fields.
2. **Validate Inputs**:
   - Check photo formats (JPEG/PNG), size (<2MB), and count (5-10).
   - Ensure messages are <50 characters and 10-15 are provided.
   - Display error messages (e.g., “Invalid file format”) and prevent submission until valid.
3. **Process Photos**:
   - Use `FileReader` API to read photos as base64 strings.
   - Crop photos to circular face regions (use `canvas` for client-side cropping).
   - Store base64 strings in LocalStorage with keys (e.g., `photo_1`, `gnome_photo`).
4. **Store Messages**:
   - Save messages as a JSON array in LocalStorage (key: `messages`).
5. **Preview Photos**:
   - Display uploaded photo thumbnails below the form for user confirmation.
6. **Transition**:
   - On valid submission, hide the form and start `GameScene`.

### 5.3 Gameplay (`js/game.js`)
1. **Setup Scene**:
   - Create a Phaser `GameScene` with a Scandinavian Christmas background (cozy cabin, snowflakes, lights).
   - Use a sprite sheet for the background (PNG, <500KB).
2. **Slingshot Mechanic**:
   - Implement a drag-and-release slingshot using Matter.js constraints.
   - Allow players to drag a character (family photo or gnome) and release to launch.
   - Support 5 launches per round, each taking ~20-30s (including aiming).
   - Add optional tap-to-zoom/aim feature for accessibility.
3. **Characters**:
   - Load 5-10 family photos and gnome photo from LocalStorage as textures.
   - Map photos to cartoon-style parent bodies (sprite sheet).
   - Include a T-Rex character (Santa hat) unlocked after 500 points, replacing one launch.
4. **Targets**:
   - Create 10-15 targets per round (sprites):
     - Presents (square, 10 points, 2 hit points).
     - Ornaments (round, 20 points, 1 hit point).
     - Gnome statues (tall, 50 points, 3 hit points).
     - Christmas tree (large, 50 points, 5 hit points).
   - Use Matter.js for collision detection and physics (e.g., wobbly tree).
   - Display hit points on-screen (e.g., health bars or numbers).
5. **Scoring**:
   - Award points per target hit (10-50 points).
   - Add bonuses: +50 points for <2 minutes, +20 points for perfect shot (all targets in one launch).
   - Unlock T-Rex at 500 points; award 100 points for its launch (clears all targets).
   - Display current score and remaining launches on-screen.
6. **Timing**:
   - Enforce a 2-3 minute round timer, including animations and transitions.
   - Show a countdown timer in the UI.
7. **Game Over**:
   - After 5 launches or timer expiry, show a game over screen with the final score.
   - Offer buttons to view leaderboard or start a new round.

### 5.4 Leaderboard (`js/leaderboard.js`)
1. **Name Input**:
   - Before each round, prompt the player to enter their name ( `<input type="text" maxlength="20">`).
   - Validate name (non-empty, <20 chars).
2. **Store Scores**:
   - Save scores in LocalStorage as a JSON array (key: `leaderboard`, e.g., `[{name: "Sally", score: 1200}, ...]`).
   - Update after each round.
3. **Display Leaderboard**:
   - Create a `LeaderboardScene` in Phaser or a Bootstrap modal.
   - Show top scores (name, score) sorted by score (descending).
   - Example: “Sally: 1,200 points, Tim: 1,050 points”.
   - Add buttons to start a new round or return to the form.

### 5.5 Theming and Audio
1. **Visuals**:
   - Use sprite sheets for characters (family photos cropped to faces), targets, and T-Rex (PNG, <2MB total).
   - Ensure high color contrast (WCAG 2.1 AA) for accessibility.
   - Optimize sprites for iPhone retina displays.
2. **Sound Effects**:
   - Add MP3 files (<1MB total):
     - Jingle bells for target hits.
     - “Ho ho ho” for perfect shots.
     - T-Rex roar with jingling bells for T-Rex launch.
   - Load via Phaser’s audio system.
3. **Background Music**:
   - Include a lo-fi “Winter Wonderland” track (MP3, <500KB).
   - Add a mute toggle button in the UI to control all audio (music + effects).
4. **Tutorial**:
   - Add a brief in-game tutorial (text or animated) on the start screen, explaining slingshot controls and objectives.

### 5.6 Storage and Performance
1. **LocalStorage**:
   - Store photos as base64 strings (compress to <1MB each via `canvas` resizing).
   - Store messages and leaderboard as JSON.
   - Monitor storage usage (<10MB total).
   - If LocalStorage limits are exceeded (5-10MB), fall back to IndexedDB.
2. **Performance**:
   - Optimize assets (compress PNGs, MP3s) for <5s load time.
   - Ensure 60 FPS gameplay with Phaser’s WebGL renderer.
   - Test on iPhone 12/14/16 emulators (Safari, Chrome, iOS 16+).
3. **Error Handling**:
   - Handle LocalStorage quota errors (e.g., alert user to clear browser data).
   - Validate all inputs and provide clear error messages.

## 6. Best Practices
- **Code Structure**:
  - Use modular JavaScript (ES6 modules or IIFE).
  - Comment code for clarity (e.g., “// Initialize slingshot physics”).
  - Follow Airbnb JavaScript style guide.
- **Accessibility**:
  - Ensure high contrast (WCAG 2.1 AA).
  - Use semantic HTML for the form.
  - Support touch gestures (drag-and-release) for iPhone.
- **Testing**:
  - Test form validation (invalid files, long messages).
  - Test gameplay (physics, scoring, T-Rex unlock).
  - Test leaderboard (score sorting, name input).
  - Test on iPhone emulators and physical devices.
- **Version Control**:
  - Commit changes frequently with clear messages (e.g., “Add customization form validation”).
  - Use branches for features (e.g., `feature/gameplay`).

## 7. Asset Requirements
- **Images** (in `assets/images/`):
  - Background: Scandinavian cabin scene (PNG, 800x600px).
  - Characters: Sprite sheet for parent bodies, T-Rex with Santa hat (PNG).
  - Targets: Sprite sheet for presents, ornaments, gnome statues, Christmas tree (PNG).
- **Audio** (in `assets/audio/`):
  - jingle_bells.mp3: Target hit sound.
  - ho_ho_ho.mp3: Perfect shot sound.
  - trex_roar.mp3: T-Rex launch sound.
  - winter_wonderland.mp3: Background music.
- **Source**: Use royalty-free assets from [OpenGameArt](https://opengameart.org/) or create placeholders. Family photos are user-uploaded.

## 8. Testing and Validation
1. **Unit Tests**:
   - Test form validation (photo size, message length).
   - Test scoring logic (points, bonuses).
   - Test LocalStorage read/write.
2. **Integration Tests**:
   - Test form-to-game transition.
   - Test gameplay-to-leaderboard flow.
3. **User Testing**:
   - Verify 2-3 minute rounds, intuitive controls, and fun factor.
   - Ensure customization (photos, messages) appears correctly.
4. **Performance Tests**:
   - Measure load time (<5s) and FPS (60) on iPhone emulators.
   - Check storage usage (<10MB).

## 9. Deployment
- Deploy to GitHub Pages:
  - Push to `main` branch.
  - Enable GitHub Pages in repository settings (source: `main`, root).
- Test the URL (e.g., `https://username.github.io/AngryParentsXmas`) on an iPhone.
- Provide a user guide in `README.md`:
  - Instructions for accessing the game URL.
  - Steps to customize photos/messages.
  - How to play and view the leaderboard.

## 10. Success Criteria
- Game loads and runs smoothly on a single iPhone (Safari/Chrome, iOS 16+).
- Customization (5-10 photos, 10-15 messages, gnome, T-Rex) is applied correctly.
- Rounds take 2-3 minutes, with accurate scoring and leaderboard display.
- Christmas theming (visuals, audio) and humor spark laughter and competition.
- Zero hosting costs, with all data stored locally.

## 11. Notes for Agentic AI
- Use GitHub Copilot (GPT-4.1) for real-time code suggestions in VSCode.
- Supplement with Claude Sonnet 3.7 for complex logic or documentation if needed.
- Prompt Copilot with specific tasks (e.g., “Generate a Phaser.js slingshot with Matter.js”).
- Regularly validate code against the PRD to ensure feature completeness.
- If stuck, ask for clarification on specific PRD requirements or implementation details.

## 12. Timeline
- **Week 1**: Set up repository, implement customization form, store data in LocalStorage.
- **Week 2**: Build gameplay (slingshot, targets, scoring, T-Rex), add theming.
- **Week 3**: Implement leaderboard, tutorial, and audio; optimize performance.
- **Week 4**: Test thoroughly, deploy to GitHub Pages, finalize documentation.