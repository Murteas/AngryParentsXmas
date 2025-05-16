# Final Product Requirements Document (PRD) for *Angry Parents: Christmas Edition*

## 1. Overview
**Purpose:** *Angry Parents: Christmas Edition* is a simple, web-based, single-player arcade game designed for a family Christmas party. Each player uses their own iPhone to play, accessing the game via a URL. The game requires no hosting costs and is pre-customized with family photos and funny messages embedded in the code before deployment. Players launch characters to knock down targets, earning points to share verbally with the group to determine a winner. The game revives the family’s nostalgic *Angry Parents* game with Christmas theming.

**Target Audience:** A multigenerational family (parents, teenage and adult children, and spouses, approximately 6-12 players) who enjoy arcade-style games and creative humor.

**Platform:** Web-based game accessible via a URL on iPhone browsers (e.g., Safari), ensuring no app store downloads or hosting costs.

**Key Features:**
- Single-player slingshot mechanic (like *Angry Birds*), with each player using their own iPhone.
- Pre-customized with family photos and funny messages embedded in the code.
- Christmas-themed visuals, sounds, and targets.
- 2-3 minute rounds with scores shared verbally.

---

## 2. Functional Requirements

### 2.1 Gameplay
- **Objective:** Players use a slingshot to launch characters (pre-customized with family photos) at Christmas-themed targets to earn points.
- **Round Structure:**
  - Duration: 2-3 minutes per round, including 5 launches (each ~20-30 seconds), animations (e.g., targets falling, score updates), and transitions.
  - Targets: 10-15 objects (e.g., presents, ornaments, gnome statues, Christmas tree) with varying point values (10-50 points).
  - Bonus: A T-Rex “ultimate weapon” launch (unlocked after 500 points in a round) clears all targets for 100 bonus points, usable once during remaining launches (e.g., if unlocked after the third launch, available for the fourth or fifth).
- **Scoring:**
  - Points awarded per target hit (e.g., present = 10 points, gnome statue = 50 points).
  - Bonus points for speed (+50 for finishing in <2 minutes) or “perfect shots” (+20 for clearing all targets in one launch).
  - Score displayed prominently at the end of the round (e.g., “Your Score: 1,200 points!”).
- **Game Over:** After a round, a “Round Over” screen shows the player’s score with a “Play Again” button to restart the game.

### 2.2 Customization (Embedded in Code)
- **Family Photos:**
  - 5-10 family photos (JPEG/PNG, <2MB each) are embedded in the game’s code before deployment.
  - Photos are mapped to launchable characters (e.g., “Dad,” “Mom”).
  - One character is a Scandinavian gnome with a family member’s face (specified by the organizer during development).
- **Funny Messages:**
  - 10-15 custom messages (max 50 characters each) are embedded in the code (e.g., “Smashed Uncle Bob’s fruitcake tower!”).
  - Messages display randomly when targets are hit.
- **T-Rex Ultimate Weapon:**
  - Embedded as a launchable character (with a Santa hat) after reaching 500 points.
- **Customization Process:**
  - The organizer provides photos and messages to the developer before deployment.
  - These are hard-coded into the game (e.g., as base64-encoded images or text arrays in JavaScript).
  - No player or organizer customization occurs post-deployment.

### 2.3 Score Sharing
- **Verbal Score Sharing:**
  - Players verbally report their scores to the group after each round (e.g., “I got 1,200 points!”).
  - The “Round Over” screen displays the score in large, clear text to facilitate sharing.
  - No leaderboard is implemented, simplifying development and avoiding data storage needs.
  - The organizer can track scores informally (e.g., on paper) to declare a winner.

### 2.4 Christmas Theming
- **Visuals:**
  - Background: Scandinavian-style Christmas scene (cozy cabin, snowflakes, twinkling lights).
  - Targets: Presents (square, colorful), ornaments (round, shiny), gnome statues (tall, pointed hat), wobbly Christmas tree (large, 50 points).
  - Characters: Family photo faces on cartoon-style bodies or gnome, T-Rex with a Santa hat.
- **Sound Effects:**
  - Jingle bells for target hits, “ho ho ho” for perfect shots, T-Rex roar (with jingling bells) for the ultimate weapon.
- **Background Music:** Optional lo-fi “Winter Wonderland” track.
- **Sound Controls:** Separate on/off toggles for sound effects and music, accessible from the main menu or settings screen.

---

## 3. Non-Functional Requirements

### 3.1 Platform
- Runs on iPhone browsers (Safari, Chrome) via a URL.
- Responsive design for iPhone screen sizes (e.g., iPhone 12, 14, 16).
- No app store deployment or server hosting to ensure zero cost.
- Each player uses their own iPhone for gameplay.

### 3.2 Performance
- Load time: <5 seconds on a standard iPhone with 4G/Wi-Fi.
- Smooth gameplay: 60 FPS for slingshot and physics animations.
- Local storage: <10MB for game assets (no runtime storage needed).

### 3.3 Usability
- **Customization:** Handled by the developer pre-deployment; players only play the game.
- **Player Experience:** Players access the game URL, enter their name (optional, for immersion), play a round, and verbally share their score—no setup required.
- Intuitive controls: Drag-and-release slingshot (tap to zoom/aim optional).
- Clear UI: Score, launches remaining, and target health visible on-screen.
- Minimal instructions for all ages (teens to adults).

### 3.4 Accessibility
- High color contrast for text and key elements to aid visual impairments.
- Playable without sound (visual cues for all actions).
- Optional tooltips or a short tutorial (e.g., “Drag to aim, release to launch”) for first-time players.
- No screen reader support required.

### 3.5 Security
- No user data stored or uploaded; customization is hard-coded.
- No runtime data collection, ensuring privacy.

---

## 4. Technical Requirements
- **Frontend:**
  - HTML5, CSS3, JavaScript for web-based game.
  - **Recommended Tool:** Phaser.js for its 2D game framework, physics engine, and mobile support (developer may choose another framework, e.g., PixiJS, if preferred).
  - Canvas/WebGL for 2D physics and animations (e.g., Box2D.js or Matter.js if not using Phaser).
  - Responsive framework (e.g., Bootstrap) for iPhone compatibility.
- **Storage:**
  - No runtime storage; customization is hard-coded.
- **Assets:**
  - Hard-coded sprite sheets for characters (family photos cropped to faces), targets, and T-Rex.
  - Audio files for jingle bells, T-Rex roar, and music (<1MB total).
- **Error Handling:**
  - If a launch fails (e.g., no collision), deduct the launch and continue.
  - Ensure robust asset loading to prevent crashes if images/audio fail to load.

---

## 5. Constraints
- **Cost:** Zero hosting or deployment costs (e.g., use GitHub Pages).
- **Timeline:** One-time Christmas party, prioritizing simplicity.
- **Scope:** Single-player on individual iPhones, no multiplayer networking.
- **Usage:** Likely used once, so no scalability needed.

---

## 6. Assumptions
- Players have iPhones with modern browsers (Safari/Chrome, iOS 16+).
- Wi-Fi or mobile data is available to load the game URL.
- The organizer provides 5-10 photos and 10-15 messages to the developer before deployment.
- Approximately 6-12 players will participate, sharing scores verbally.

---

## 7. Deliverables
- **Web-Based Game:**
  - Hosted on a free static site (e.g., GitHub Pages) with a URL for gameplay.
  - Includes pre-customized assets (photos, messages) and gameplay.
- **Documentation:**
  - Guide for players to access the game and verbally share scores.
  - Instructions for the organizer to provide customization data (photos, messages) to the developer.

---

## 8. Success Criteria
- The developer embeds customization (photos, messages) correctly before deployment.
- Game runs smoothly on each player’s iPhone via the provided URL.
- Rounds take 2-3 minutes, with scores easily shared verbally.
- Family enjoys the nostalgic and humorous elements, sparking laughter and competition.

---

## 9. Responses to Developer Questions
- **Device Usage:** Each player uses their own iPhone for gameplay. Scores are shared verbally, with no leaderboard.
- **Leaderboard Persistence:** Not applicable; verbal score sharing eliminates the need for a leaderboard.
- **Customization Data:** Photos and messages are hard-coded by the developer; no runtime customization or storage.
- **Gameplay Timing:** 2-3 minutes includes 5 launches (100-150 seconds) plus animations/transitions. Cap at 3 minutes with a timer if needed.
- **T-Rex Unlock:** Unlocked at 500 points, usable once in remaining launches of the same round.
- **Sound Controls:** Separate on/off toggles for sound effects and music.
- **Accessibility:** High contrast and sound-independent play; no screen reader support.
- **Error Handling:** Deduct failed launches; ensure robust asset loading.
- **Game Over:** “Round Over” screen with score and “Play Again” button.
- **Multiplayer Aspect:** Single-player on individual iPhones, with verbal score sharing.