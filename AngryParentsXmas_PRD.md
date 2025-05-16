# Product Requirements Document: Angry Parents: Christmas Edition

## 1. Overview
**Purpose**: *Angry Parents: Christmas Edition* is a simple, web-based, single-player arcade game designed for a family Christmas party. It runs on a **single iPhone**, requires no hosting costs, and includes **pre-embedded family photos and funny messages** as part of the application. Players **take turns playing rounds on the same device** in a pass-and-play mode, **selecting a pre-included face to represent their character**, launching characters to knock down Christmas-themed targets, and earning points displayed on a local leaderboard to determine a winner. The game revives the nostalgic *Angry Parents* game, incorporating family humor and Christmas theming.

**Target Audience**: A multigenerational family (parents, teenage and adult children, and their spouses) who enjoy arcade-style games and creative humor.

**Platform**: Web-based game accessible via a URL on iPhone browsers (e.g., Safari, Chrome), ensuring no app store downloads or server hosting costs.

**Key Features**:
- Single-player slingshot mechanic inspired by *Angry Birds*.
- Pre-included 5-10 family photos and 10-15 funny messages, with player face selection.
- Christmas-themed visuals, sounds, and targets.
- 2-3 minute rounds with a local leaderboard for score comparison.

## 2. Functional Requirements

### 2.1 Gameplay
- **Objective**: Players use a slingshot to launch characters (with a selected pre-included family photo face) at Christmas-themed targets to earn points.
- **Round Structure**:
  - Duration: 2-3 minutes per round, including animations and transitions.
  - Launches: 5 per round, each taking approximately 20-30 seconds (drag-and-release mechanic).
  - Targets: 10-15 objects per round, including presents, ornaments, gnome statues, and a Christmas tree, with varying point values (10-50 points).
  - Bonus: A T-Rex “ultimate weapon” launch, unlocked after earning 500 points in a round, clears all targets for an additional 100 points and replaces one of the remaining launches.
- **Scoring**:
  - Points awarded per target hit:
    - Present: 10 points
    - Ornament: 20 points
    - Gnome statue: 50 points
    - Christmas tree: 50 points
  - Bonus points:
    - +50 points for completing the round in under 2 minutes.
    - +20 points for a “perfect shot” (clearing all targets in a single launch).
  - Score displayed at the end of the round (e.g., “You scored 1,200 points!”) on a game over screen.

### 2.2 Customization
- **Family Photos**:
  - The application includes **5-10 pre-embedded family photos** (JPEG or PNG format, <2MB each) stored in the `assets/images/` folder.
  - Photos are mapped to launchable characters (e.g., “Dad,” “Mom”).
  - One character is a **Scandinavian gnome** with a pre-selected family member’s face (chosen by the developer from the included photos).
- **Funny Messages**:
  - The application includes **10-15 pre-embedded funny messages** (max 50 characters each) hardcoded in the application (e.g., in `js/customization.js`).
  - Messages display randomly when targets are hit (e.g., “Smashed Uncle Bob’s fruitcake!” or “Toppled the glitter ornament!”).
  - Example messages:
    - “Smashed Uncle Bob’s fruitcake!”
    - “Toppled the glitter ornament!”
    - “Wrecked the gnome’s hat!”
    - “Ho ho no! Tree down!”
    - “Presents pulverized!”
    - “Naughty list approved!”
    - “Jingle bells, you smashed it!”
    - “Ornament obliterated!”
    - “Gnome’s on vacation now!”
    - “Tree’s taking a nap!”
    - [Developer to add 5 more if needed to reach 10-15]
- **Player Face Selection**:
  - Before each round, players select one of the pre-included family photos to represent their character via a **dropdown or grid UI**.
  - The selected face is applied to the launchable character for that player’s round.
- **T-Rex Ultimate Weapon**:
  - Appears as a launchable character after reaching 500 points in a round.
  - Wears a Santa hat and smashes all targets when launched, awarding 100 points.
- **Customization Process**:
  - **No setup form is required**; photos and messages are pre-included in the application.
  - Players select their representative face before their round, taking <30 seconds.
  - Face selections are saved temporarily in the browser session (LocalStorage) for the round.

### 2.3 Leaderboard
- **Functionality**: Displays the top scores (player name and score) after each round.
- **Implementation**: Local leaderboard stored in the browser session on the device using **LocalStorage** (no server required to keep costs at zero). Scores may be lost if the browser is closed, which is acceptable for one-time use.
- **Access**: Players view the leaderboard on the same device after playing their rounds.
- **Example**:
  - Sally: 1,200 points
  - Tim: 1,050 points
  - Emma: 900 points
- **Input**: Each player enters their name (max 20 characters) via a text field and selects their face before starting a round.

### 2.4 Christmas Theming
- **Visuals**:
  - Background: A Scandinavian-style Christmas scene featuring a cozy cabin, snowflakes, and twinkling Christmas lights.
  - Targets:
    - Presents (square, colorful, 10 points, 2 hit points).
    - Ornaments (round, shiny, 20 points, 1 hit point).
    - Gnome statues (tall with pointed hats, 50 points, 3 hit points).
    - Wobbly Christmas tree (large, 50 points, 5 hit points).
  - Characters: Selected family photo faces or gnome face mapped onto cartoon-style parent bodies; T-Rex with a Santa hat.
- **Sound Effects**:
  - Jingle bells sound when a target is hit.
  - “Ho ho ho” sound for a perfect shot (clearing all targets in one launch).
  - T-Rex roar with jingling bells for the ultimate weapon launch.
- **Background Music**: Optional lo-fi “Winter Wonderland” track, toggleable on/off via a single mute button controlling all audio (music and effects).

## 3. Non-Functional Requirements

### 3.1 Platform
- Runs on iPhone browsers (Safari, Chrome) with iOS 16 or later.
- Responsive design optimized for iPhone screen sizes (e.g., iPhone 12, 14, 16).
- No app store deployment or server hosting to ensure zero cost.

### 3.2 Performance
- Load time: Less than 5 seconds on a standard iPhone with 4G or Wi-Fi.
- Gameplay: Maintain 60 frames per second (FPS) for smooth slingshot and physics animations.
- Local storage: Less than 10MB for leaderboard data and temporary face selections (photos are embedded as assets).

### 3.3 Usability
- Controls: Intuitive drag-and-release slingshot mechanic (optional tap-to-zoom/aim feature).
- UI: Clearly display score, remaining launches, target health (e.g., hit points), and face selection options on-screen.
- Accessible to all players (teens to adults) with minimal instructions, using a brief in-game tutorial or start screen.
- Face selection process takes <30 seconds per player.

### 3.4 Security
- No user data stored online; all data (leaderboard, face selections) stored locally in the browser session using LocalStorage.
- Pre-embedded photos and messages are static assets, requiring no user input validation beyond name and face selection.
- Input validation:
  - Names: Max 20 characters, non-empty.
  - Face selection: Must choose one of the pre-included photos.

## 4. Technical Requirements
- **Frontend**:
  - HTML5, CSS3, and JavaScript for core game development.
  - HTML5 Canvas or WebGL for 2D physics and animations.
  - Phaser.js 3 with Matter.js (or similar library) for slingshot and target collision physics.
  - Bootstrap 5 for responsive face selection and leaderboard UI.
- **Storage**:
  - LocalStorage for storing leaderboard data and temporary face selections (<100KB).
  - No backend or server to maintain zero hosting costs.
- **Assets**:
  - Sprite sheets for characters (family photo faces cropped to circles), targets (presents, ornaments, gnome statues, Christmas tree), and T-Rex with Santa hat (PNG, <2MB total).
  - Audio files for sound effects (jingle bells, T-Rex roar, “ho ho ho”) and background music (<1MB total).
  - 5-10 family photos (JPEG/PNG, <2MB each) embedded in `assets/images/`.
- **Face Selection UI**:
  - Dropdown or grid displaying thumbnails of pre-included photos.
  - Client-side logic to apply selected face to the character sprite.

## 5. Constraints
- **Cost**: Zero hosting or deployment costs (e.g., use free static hosting like GitHub Pages).
- **Timeline**: Designed for one-time use at a Christmas party, prioritizing simplicity over scalability.
- **Scope**: Single-player only, no multiplayer networking to avoid server costs.
- **Usage**: Likely used only once, so focus on ease of setup and minimal maintenance.

## 6. Assumptions
- Family members share a single iPhone with a modern browser (Safari or Chrome, iOS 16+).
- Wi-Fi or mobile data is available to load the game URL initially.
- Players are comfortable passing the phone for pass-and-play mode.
- Developer provides 5-10 placeholder family photos and 10-15 funny messages if specific ones are not supplied.

## 7. Deliverables
- **Web-Based Game**:
  - Hosted at a URL (e.g., on GitHub Pages).
  - Includes core gameplay, pre-embedded photos and messages, face selection UI, and local leaderboard.
- **Documentation**:
  - User guide (in-game or in `README.md`) explaining how to access the game, select a face, play, and view the leaderboard.
  - Setup instructions for developers to replace placeholder photos if needed, integrated into the codebase or `README.md`.

## 8. Success Criteria
- Game loads and runs smoothly on a single iPhone (Safari/Chrome, iOS 16+).
- Pre-included photos (5-10) and messages (10-15) display correctly in gameplay.
- Face selection is intuitive, taking <30 seconds per player.
- Rounds take 2-3 minutes, with accurate scoring and leaderboard display.
- Christmas theming (visuals, audio) and humor spark laughter and friendly competition during the Christmas party.
- Zero hosting costs, with all data stored locally.