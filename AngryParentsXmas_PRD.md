# Updated Product Requirements Document (PRD) for *Angry Parents: Christmas Edition*

## 1. Overview
**Purpose:** *Angry Parents: Christmas Edition* is a simple, web-based, single-player arcade game designed for a family Christmas party. It runs on iPhones, requires no hosting costs, and is customized by the host (you) before the party with family photos and funny messages. Players launch characters to knock down targets, earning points displayed on a leaderboard to determine a winner. The game is nostalgic, reviving the family’s *Angry Parents* game, and includes Christmas theming for festive fun.

**Target Audience:** A multigenerational family (parents, teenage and adult children, and spouses) who enjoy arcade-style games and creative humor.

**Platform:** Web-based game accessible via a URL on iPhone browsers (e.g., Safari), ensuring no app store downloads or hosting costs.

**Key Features:**
- Single-player slingshot mechanic (like *Angry Birds*).
- Pre-customized by the host with family photos and funny messages.
- Christmas-themed visuals, sounds, and targets.
- 2-3 minute rounds with a local leaderboard for score comparison.

---

## 2. Functional Requirements

### 2.1 Gameplay
- **Objective:** Players use a slingshot to launch characters (pre-customized with family photos) at Christmas-themed targets to earn points.
- **Round Structure:**
  - Duration: 2-3 minutes per round.
  - Launches: 5 per round, each taking ~20-30 seconds (drag-and-release mechanic).
  - Targets: 10-15 objects (e.g., presents, ornaments, gnome statues, Christmas tree) with varying point values (10-50 points).
  - Bonus: A T-Rex “ultimate weapon” launch (unlocked after 500 points) clears all targets for extra points (100 points).
- **Scoring:**
  - Points awarded for each target hit (e.g., present = 10 points, gnome statue = 50 points).
  - Bonus points for speed (e.g., +50 for finishing in <2 minutes) or “perfect shots” (e.g., +20 for clearing all targets in one launch).
  - Score displayed at the end of the round (e.g., “You scored 1,200 points!”).

### 2.2 Customization (Pre-Configured by Host)
- **Family Photos:**
  - The host uploads 5-10 family photos via a web form before the party (JPEG/PNG, <2MB each).
  - Photos are mapped to launchable characters (e.g., “Dad,” “Mom”).
  - One character is a Scandinavian gnome with a family member’s face (host selects which photo).
- **Funny Messages:**
  - The host provides 10-15 custom messages via the web form (e.g., “Smashed Uncle Bob’s fruitcake tower!”).
  - Messages display randomly when targets are hit.
- **T-Rex Ultimate Weapon:**
  - Appears as a launchable character after reaching 500 points in a round.
  - Wears a Santa hat and smashes all targets when launched.
- **Customization Process:**
  - The host accesses a web form (via the game URL) before the party to:
    - Upload 5-10 family photos.
    - Enter 10-15 funny messages (max 50 characters each).
    - Select a photo for the gnome character.
  - The form is simple, takes ~10-15 minutes to complete, and saves the data locally in the browser session.
  - **Note:** Players do not upload or customize anything; they access the pre-configured game.

### 2.3 Leaderboard
- **Functionality:** Displays top scores (name + score) after each round.
- **Implementation:** Local leaderboard stored in the browser session (no server required).
- **Access:** Players view the leaderboard via the game’s URL on any iPhone.
- **Example:**
  - Sally: 1,200 points
  - Tim: 1,050 points
  - Emma: 900 points
- **Input:** Players enter their name (max 20 characters) before starting a round.

### 2.4 Christmas Theming
- **Visuals:**
  - Background: Scandinavian-style Christmas scene (cozy cabin, snowflakes, twinkling lights).
  - Targets: Presents, ornaments, gnome statues, wobbly Christmas tree.
  - Characters: Family photo faces on bodies (cartoon-style parents or gnome), T-Rex with a Santa hat.
- **Sound Effects:**
  - Jingle bells when a target is hit.
  - Soft “ho ho ho” for a perfect shot.
  - T-Rex roar (with jingling bells) for the ultimate weapon.
- **Background Music:** Optional lo-fi “Winter Wonderland” track (toggleable on/off).

---

## 3. Non-Functional Requirements

### 3.1 Platform
- Runs on iPhone browsers (Safari, Chrome) via a URL.
- Responsive design for iPhone screen sizes (e.g., iPhone 12, 14, 16).
- No app store deployment or server hosting to ensure zero cost.

### 3.2 Performance
- Load time: <5 seconds on a standard iPhone with 4G/Wi-Fi.
- Smooth gameplay: 60 FPS for slingshot and physics animations.
- Local storage: <10MB for photos, messages, and leaderboard data.

### 3.3 Usability
- **Host Customization:** The host completes a one-time setup via a web form before the party; players do not interact with customization.
- **Player Experience:** Players access the game via a URL, enter their name, play a round, and view the leaderboard—no additional setup required.
- Intuitive controls: Drag-and-release slingshot (tap to zoom/aim optional).
- Clear UI: Score, launches remaining, and target health visible on-screen.
- Accessible to all ages (teens to adults) with minimal instructions.

### 3.4 Security
- No user data stored online; all data (photos, messages) stored locally in the browser session.
- Web form validates inputs (e.g., image size, text length) to prevent errors.

---

## 4. Technical Requirements
- **Frontend:**
  - HTML5, CSS3, JavaScript for web-based game.
  - **Recommended Tool:** Phaser.js is suggested for its 2D game framework, physics engine (for slingshot mechanics), and mobile support. However, the developer may choose another framework if preferred.
  - Canvas/WebGL for 2D physics and animations (e.g., Box2D.js or Matter.js if not using Phaser).
  - Responsive framework (e.g., Bootstrap) for iPhone compatibility.
- **Storage:**
  - LocalStorage or IndexedDB for photos, messages, and leaderboard.
  - No backend/server to keep costs at zero.
- **Assets:**
  - Sprite sheets for characters (family photos cropped to faces), targets, and T-Rex.
  - Audio files for jingle bells, T-Rex roar, and background music (<1MB total).
- **Customization Form:**
  - Simple HTML form with file upload (photos) and text input (messages).
  - Client-side validation for file size and text length.

---

## 5. Constraints
- **Cost:** Zero hosting or deployment costs (no server or app store).
- **Timeline:** Game is for a one-time Christmas party, so simplicity is key.
- **Scope:** Single-player only, no multiplayer networking.
- **Usage:** Likely used only once, so prioritize ease of setup over scalability.

---

## 6. Assumptions
- The host has access to an iPhone or computer to complete the customization form before the party.
- Family has access to iPhones with modern browsers (Safari/Chrome, iOS 16+).
- Wi-Fi or mobile data is available to load the game URL initially.
- The host can provide 5-10 photos and 10-15 messages before the party.
- Players are comfortable passing a phone or accessing the URL on their own devices.

---

## 7. Deliverables
- **Web-Based Game:**
  - Accessible via a URL (e.g., hosted on a free static site like GitHub Pages).
  - Includes gameplay, host customization form, and leaderboard.
- **Documentation:**
  - User guide for the host to complete customization and for players to access the game.
  - Setup instructions for uploading photos/messages (provided in-game).

---

## 8. Success Criteria
- The host successfully customizes the game before the party with photos and messages.
- Game loads and runs smoothly on iPhones for all players.
- Rounds take 2-3 minutes, and scores are accurately tracked on the leaderboard.
- Family enjoys the nostalgic and humorous elements, sparking laughter and competition.

---

### Additional Note on Technology Stack
- **Phaser.js Recommendation:** Phaser.js is suggested due to its suitability for 2D arcade games, built-in physics engine, and mobile optimization. It can simplify development and ensure the game runs smoothly on iPhones. However, the final choice of framework is left to the developer’s discretion, as they may have expertise in other tools (e.g., PixiJS, Cocos2d-js) that could also meet the requirements.