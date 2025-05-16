# Development Guide for Angry Parents: Christmas Edition

## 1. Project Overview
*Angry Parents: Christmas Edition* is a single-player, web-based arcade game for a family Christmas party, running on a single iPhone with no hosting costs. Players take turns in a pass-and-play mode, selecting a pre-included family photo to represent their character, using a slingshot to launch characters at Christmas-themed targets, and earning points tracked on a local leaderboard. The game includes 5-10 pre-embedded family photos and 10-15 funny messages, requiring no setup by the organizer. It features a Scandinavian Christmas theme, a T-Rex ultimate weapon, and accessibility requirements (WCAG 2.1 AA). This guide provides a roadmap for an Agentic AI to build the game from scratch, based on the latest Product Requirements Document (PRD).

## 2. Objectives
- Build a fully functional game meeting all PRD requirements.
- Embed 5-10 family photos and 10-15 funny messages in the application.
- Implement a face selection UI for players to choose their character’s face.
- Ensure zero hosting costs using GitHub Pages.
- Optimize for iPhone browsers (Safari, Chrome, iOS 16+), with <5s load time and 60 FPS.
- Use LocalStorage for leaderboard and temporary face selections.
- Deliver a fun, nostalgic experience with family humor and Christmas theming.

## 3. Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+).
- **Game Framework**: [Phaser.js 3](https://phaser.io/) with Matter.js for 2D physics (slingshot, collisions).
- **Styling**: [Bootstrap 5](https://getbootstrap.com/) for responsive UI, custom CSS for game visuals.
- **Storage**: LocalStorage for leaderboard scores and temporary face selections.
- **Assets**: PNG sprite sheets for characters and targets, MP3 audio (<1MB total).
- **Hosting**: GitHub Pages for free static hosting.
- **Tools**: VSCode with GitHub Copilot (GPT-4.1) for coding, Git for version control.

## 4. File Structure
```
AngryParentsXmas/
├── index.html          # Main entry point (face selection UI, game loader)
├── css/
│   └── style.css       # Responsive styles for UI and game
├── js/
│   ├── main.js         # Game initialization, scene management
│   ├── customization.js # Face selection logic, pre-embedded messages
│   ├── game.js         # Slingshot mechanic, targets, scoring
│   └── leaderboard.js  # Score tracking, leaderboard display
├── assets/
│   ├── images/         # Family photos, sprite sheets (characters, targets, background)
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
   - Include a face selection UI (dropdown or grid) and a `<canvas>` for the game.
   - Load `js/main.js` and other scripts.
4. **Initialize Phaser in `js/main.js`**:
   - Create a Phaser game instance (800x600px, auto-scaled for iPhone).
   - Define scenes: `FaceSelectionScene`, `GameScene`, `LeaderboardScene`.

### 5.2 Face Selection and Customization (`js/customization.js`)
1. **Embed Photos**:
   - Include 5-10 family photos (JPEG/PNG, <2MB each) in `assets/images/` (e.g., `dad.jpg`, `mom.jpg`, `gnome_face.jpg`).
   - Designate one photo as the Scandinavian gnome’s face (e.g., `gnome_face.jpg`).
   - Store photo metadata in an array (e.g., `[{id: 'dad', path: 'assets/images/dad.jpg'}, ...]`).
2. **Embed Messages**:
   - Hardcode 10-15 funny messages in an array (max 50 characters each):
     ```javascript
     const messages = [
       "Smashed Uncle Bob’s fruitcake!",
       "Toppled the glitter ornament!",
       "Wrecked the gnome’s hat!",
       "Ho ho no! Tree down!",
       "Presents pulverized!",
       "Naughty list approved!",
       "Jingle bells, you smashed it!",
       "Ornament obliterated!",
       "Gnome’s on vacation now!",
       "Tree’s taking a nap!",
       // Add 5 more if desired
     ];
     ```
3. **Face Selection UI**:
   - Create a Bootstrap-based UI in `FaceSelectionScene` or `index.html`:
     - Display a grid of photo thumbnails (e.g., 2x3 layout) or a dropdown listing photo names (e.g., “Dad,” “Mom”).
     - Include a text input for player name ( `<input type="text" maxlength="20">`).
     - Add a “Start Round” button.
   - Validate name (non-empty, <20 chars) and ensure a face is selected.
   - On submission, save the selection to LocalStorage (e.g., `{name: "Sally", faceId: "dad"}`) and transition to `GameScene`.
4. **Message Display**:
   - Randomly select a message from the array when a target is hit and display it on-screen (e.g., via Phaser text).

### 5.3 Gameplay (`js/game.js`)
1. **Setup Scene**:
   - Create a Phaser `GameScene` with a Scandinavian Christmas background (cozy cabin, snowflakes, lights).
   - Use a sprite sheet for the background (PNG, <500KB).
2. **Slingshot Mechanic**:
   - Implement a drag-and-release slingshot using Matter.js constraints.
   - Allow players to drag the selected character (family photo face) and release to launch.
   - Support 5 launches per round, each taking ~20-30s (including aiming).
   - Add optional tap-to-zoom/aim feature for accessibility.
3. **Characters**:
   - Load the selected face and gnome photo as textures from `assets/images/`.
   - Map faces to cartoon-style parent bodies (sprite sheet).
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
1. **Store Scores**:
   - Save scores in LocalStorage as a JSON array (key: `leaderboard`, e.g., `[{name: "Sally", score: 1200}, ...]`).
   - Update after each round.
2. **Display Leaderboard**:
   - Create a `LeaderboardScene` in Phaser or a Bootstrap modal.
   - Show top scores (name, score) sorted by score (descending).
   - Example: “Sally: 1,200 points, Tim: 1,050 points”.
   - Add buttons to start a new round or restart face selection.

### 5.5 Theming and Audio
1. **Visuals**:
   - Use sprite sheets for characters (family photo faces), targets, and T-Rex (PNG, <2MB total).
   - Ensure high color contrast (WCAG 2.1 AA) for accessibility.
   - Optimize sprites for iPhone retina displays.
2. **Sound Effects**:
   - Add MP3 files (<1MB total):
     - `jingle_bells.mp3`: Target hits.
     - `ho_ho_ho.mp3`: Perfect shots.
     - `trex_roar.mp3`: T-Rex launch.
   - Load via Phaser’s audio system.
3. **Background Music**:
   - Include a lo-fi `winter_wonderland.mp3` track (<500KB).
   - Add a mute toggle button in the UI to control all audio.
4. **Tutorial**:
   - Add a brief in-game tutorial (text or animated) on the start screen, explaining slingshot controls and objectives.

### 5.6 Storage and Performance
1. **LocalStorage**:
   - Store leaderboard and face selections (JSON, <100KB).
   - Photos are embedded as assets, not stored in LocalStorage.
   - Handle quota errors (e.g., alert user to clear browser data).
2. **Performance**:
   - Optimize assets (compress PNGs, MP3s) for <5s load time.
   - Ensure 60 FPS with Phaser’s WebGL renderer.
   - Test on iPhone 12/14/16 emulators (Safari, Chrome, iOS 16+).
3. **Error Handling**:
   - Validate name and face selection inputs.
   - Provide error messages (e.g., “Please enter a name”).

## 6. Best Practices
- **Code Structure**:
  - Use ES6 modules or IIFE for modularity.
  - Comment code (e.g., “// Load family photo textures”).
  - Follow Airbnb JavaScript style guide.
- **Accessibility**:
  - Ensure WCAG 2.1 AA contrast.
  - Use semantic HTML for UI.
  - Support touch gestures for iPhone.
- **Testing**:
  - Test face selection (all photos load, selections saved).
  - Test gameplay (physics, scoring, T-Rex).
  - Test leaderboard (sorting, display).
  - Test on iPhone emulators and devices.
- **Version Control**:
  - Commit frequently with clear messages (e.g., “Add face selection UI”).
  - Use branches for features (e.g., `feature/gameplay`).

## 7. Asset Requirements
- **Images** (`assets/images/`):
  - Family photos: 5-10 JPEG/PNGs (<2MB each, e.g., `dad.jpg`, `gnome_face.jpg`).
  - Background: Scandinavian cabin scene (PNG, 800x600px).
  - Characters: Sprite sheet for parent bodies, T-Rex with Santa hat (PNG).
  - Targets: Sprite sheet for presents, ornaments, gnome statues, tree (PNG).
- **Audio** (`assets/audio/`):
  - `jingle_bells.mp3`: Target hit.
  - `ho_ho_ho.mp3`: Perfect shot.
  - `trex_roar.mp3`: T-Rex launch.
  - `winter_wonderland.mp3`: Background music.
- **Source**: Use royalty-free assets from [OpenGameArt](https://opengameart.org/) or create placeholders. Family photos can be developer-provided placeholders.

## 8. Testing and Validation
1. **Unit Tests**:
   - Test face selection (photo loading, validation).
   - Test scoring (points, bonuses).
   - Test LocalStorage read/write.
2. **Integration Tests**:
   - Test face selection to gameplay transition.
   - Test gameplay to leaderboard flow.
3. **User Testing**:
   - Verify 2-3 minute rounds, intuitive controls, humor.
   - Ensure photos and messages display correctly.
4. **Performance Tests**:
   - Measure load time (<5s) and FPS (60) on iPhone emulators.
   - Check storage usage (<10MB, mostly assets).

## 9. Deployment
- Deploy to GitHub Pages:
  - Push to `main` branch.
  - Enable GitHub Pages (source: `main`, root).
- Test the URL (e.g., `https://username.github.io/AngryParentsXmas`) on an iPhone.
- Provide a user guide in `README.md`:
  - Instructions for accessing the game URL.
  - Steps to select a face and play.
  - How to view the leaderboard.

## 10. Success Criteria
- Game loads and runs smoothly on a single iPhone (Safari/Chrome, iOS 16+).
- Pre-included photos (5-10) and messages (10-15) display correctly.
- Face selection is intuitive, taking <30 seconds per player.
- Rounds take 2-3 minutes, with accurate scoring and leaderboard display.
- Christmas theming and humor spark laughter and competition.
- Zero hosting costs, with data stored locally.

## 11. Notes for Agentic AI
- Use GitHub Copilot (GPT-4.1) for real-time code suggestions in VSCode.
- Use Claude Sonnet 3.7 for complex logic or documentation if needed.
- Prompt Copilot with tasks (e.g., “Generate a Phaser.js slingshot with Matter.js”).
- Validate code against the PRD regularly.
- Ask for clarification if PRD requirements are unclear.

## 12. Timeline
- **Week 1**: Set up repository, implement face selection UI, embed photos/messages.
- **Week 2**: Build gameplay (slingshot, targets, scoring, T-Rex), add theming.
- **Week 3**: Implement leaderboard, tutorial, audio; optimize performance.
- **Week 4**: Test thoroughly, deploy to GitHub Pages, finalize documentation.