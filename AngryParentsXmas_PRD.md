# Product Requirements Document: Angry Parents: Christmas Edition

## 1. Overview
**Purpose**: *Angry Parents: Christmas Edition* is a simple, web-based, single-player arcade game designed for a family Christmas party. It runs on iPhones, requires no hosting costs, and is customizable with family photos and jokes. Players launch characters to knock down Christmas-themed targets, earning points displayed on a local leaderboard to determine a winner. The game revives the nostalgic *Angry Parents* game, incorporating family humor and Christmas theming.

**Target Audience**: A multigenerational family (parents, teenage and adult children, and their spouses) who enjoy arcade-style games and creative humor.

**Platform**: Web-based game accessible via a URL on iPhone browsers (e.g., Safari, Chrome), ensuring no app store downloads or server hosting costs.

**Key Features**:
- Single-player slingshot mechanic inspired by *Angry Birds*.
- Customizable with family photos, funny messages, a Scandinavian gnome character, and a T-Rex ultimate weapon.
- Christmas-themed visuals, sounds, and targets.
- 2-3 minute rounds with a local leaderboard for score comparison.

## 2. Functional Requirements

### 2.1 Gameplay
- **Objective**: Players use a slingshot to launch characters (with family photos) at Christmas-themed targets to earn points.
- **Round Structure**:
  - Duration: 2-3 minutes per round.
  - Launches: 5 per round, each taking approximately 20-30 seconds (drag-and-release mechanic).
  - Targets: 10-15 objects per round, including presents, ornaments, gnome statues, and a Christmas tree, with varying point values (10-50 points).
  - Bonus: A T-Rex “ultimate weapon” launch, unlocked after earning 500 points in a round, clears all targets for an additional 100 points.
- **Scoring**:
  - Points awarded per target hit:
    - Present: 10 points
    - Ornament: 20 points
    - Gnome statue: 50 points
    - Christmas tree: 50 points
  - Bonus points:
    - +50 points for completing the round in under 2 minutes.
    - +20 points for a “perfect shot” (clearing all targets in a single launch).
  - Score displayed at the end of the round (e.g., “You scored 1,200 points!”).

### 2.2 Customization
- **Family Photos**:
  - Users upload 5-10 family photos via a web form before the party (JPEG or PNG format, <2MB each).
  - Photos are mapped to launchable characters (e.g., “Dad,” “Mom”).
  - One character is a Scandinavian gnome with a user-selected family member’s face.
- **Funny Messages**:
  - Users provide 10-15 custom messages via the web form (max 50 characters each).
  - Messages display randomly when targets are hit (e.g., “Smashed Uncle Bob’s fruitcake tower!” or “Nice! You toppled the glitter ornament!”).
- **T-Rex Ultimate Weapon**:
  - Appears as a launchable character after reaching 500 points in a round.
  - Wears a Santa hat and smashes all targets when launched, awarding 100 points.
- **Customization Process**:
  - Web form (accessible via the game URL) includes fields for:
    - Uploading 5-10 photos.
    - Entering 10-15 funny messages.
    - Selecting one photo for the Scandinavian gnome character.
  - Form completion takes approximately 10-15 minutes, with data saved locally in the browser session.

### 2.3 Leaderboard
- **Functionality**: Displays the top scores (player name and score) after each round.
- **Implementation**: Local leaderboard stored in the browser session (no server required to keep costs at zero).
- **Access**: Players view the leaderboard via the game’s URL on any iPhone.
- **Example**:
  - Sally: 1,200 points
  - Tim: 1,050 points
  - Emma: 900 points
- **Input**: Players enter their name (max 20 characters) via a text field before starting a round.

### 2.4 Christmas Theming
- **Visuals**:
  - Background: A Scandinavian-style Christmas scene featuring a cozy cabin, snowflakes, and twinkling Christmas lights.
  - Targets:
    - Presents (square, colorful, 10 points).
    - Ornaments (round, shiny, 20 points).
    - Gnome statues (tall with pointed hats, 50 points).
    - Wobbly Christmas tree (large, 50 points).
  - Characters: Family photo faces mapped onto cartoon-style parent bodies or the Scandinavian gnome; T-Rex with a Santa hat.
- **Sound Effects**:
  - Jingle bells sound when a target is hit.
  - “Ho ho ho” sound for a perfect shot (clearing all targets in one launch).
  - T-Rex roar with jingling bells for the ultimate weapon launch.
- **Background Music**: Optional lo-fi “Winter Wonderland” track, toggleable on/off via a UI button.

## 3. Non-Functional Requirements

### 3.1 Platform
- Runs on iPhone browsers (Safari, Chrome) with iOS 16 or later.
- Responsive design optimized for iPhone screen sizes (e.g., iPhone 12, 14, 16).
- No app store deployment or server hosting to ensure zero cost.

### 3.2 Performance
- Load time: Less than 5 seconds on a standard iPhone with 4G or Wi-Fi.
- Gameplay: Maintain 60 frames per second (FPS) for smooth slingshot and physics animations.
- Local storage: Less than 10MB for photos, messages, and leaderboard data.

### 3.3 Usability
- Controls: Intuitive drag-and-release slingshot mechanic (optional tap-to-zoom/aim feature).
- UI: Clearly display score, remaining launches, and target health (e.g., hit points) on-screen.
- Accessible to all players (teens to adults) with minimal instructions, using a brief in-game tutorial or start screen.

### 3.4 Security
- No user data stored online; all data (photos, messages, leaderboard) stored locally in the browser session.
- Web form validates inputs to prevent errors:
  - Photos: JPEG/PNG, <2MB.
  - Messages: Max 50 characters.
  - Names: Max 20 characters.

## 4. Technical Requirements
- **Frontend**:
  - HTML5, CSS3, and JavaScript for core game development.
  - HTML5 Canvas or WebGL for 2D physics and animations.
  - Box2D.js (or similar library) for slingshot and target collision physics.
  - Responsive framework (e.g., Bootstrap) for iPhone compatibility.
- **Storage**:
  - LocalStorage or IndexedDB for storing photos, messages, and leaderboard data.
  - No backend or server to maintain zero hosting costs.
- **Assets**:
  - Sprite sheets for characters (family photos cropped to faces), targets (presents, ornaments, gnome statues, Christmas tree), and T-Rex with Santa hat.
  - Audio files for sound effects (jingle bells, T-Rex roar, “ho ho ho”) and background music (<1MB total).
- **Customization Form**:
  - HTML form with file upload fields for photos and text input fields for messages.
  - Client-side validation for file size, image format, and text length.

## 5. Constraints
- **Cost**: Zero hosting or deployment costs (e.g., use free static hosting like GitHub Pages).
- **Timeline**: Designed for one-time use at a Christmas party, prioritizing simplicity over scalability.
- **Scope**: Single-player only, no multiplayer networking to avoid server costs.
- **Usage**: Likely used only once, so focus on ease of setup and minimal maintenance.

## 6. Assumptions
- Family members have access to iPhones with modern browsers (Safari or Chrome, iOS 16+).
- Wi-Fi or mobile data is available to load the game URL initially.
- User can provide 5-10 photos and 10-15 funny messages before the party via the customization form.
- Players are comfortable passing a phone or accessing the game URL on their own devices to play and view the leaderboard.

## 7. Deliverables
- **Web-Based Game**:
  - Hosted at a URL (e.g., on free static hosting like GitHub Pages).
  - Includes core gameplay, customization form, and local leaderboard.
- **Documentation**:
  - User guide (in-game or separate Markdown file) explaining how to access the game and use the customization form.
  - Setup instructions for uploading photos and messages, integrated into the customization form or start screen.

## 8. Success Criteria
- Game loads and runs smoothly on iPhones for all players.
- Customization (family photos, funny messages, Scandinavian gnome, T-Rex with Santa hat) is successfully applied and visible in-game.
- Rounds take 2-3 minutes, and scores are accurately tracked and displayed on the leaderboard.
- Family enjoys the nostalgic and humorous elements, sparking laughter and friendly competition during the Christmas party.