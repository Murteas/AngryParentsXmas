# Manual Test Plan for Angry Parents: Christmas Edition

## Setup
1. Start the HTTP server (http-server -p 8081)
2. Open browser to http://localhost:8081
3. Open browser developer tools (F12) to check for console errors

## Basic UI Tests
- [ ] Verify game title is displayed
- [ ] Verify all navigation buttons are visible (Start Game, Customize, Leaderboard, Help, Music toggle)
- [ ] Verify game canvas is displayed

## Navigation Tests
- [ ] Click "Start Game" → Player name input should appear
- [ ] Click "Customize" → Customization form should appear
- [ ] Click "Leaderboard" → Leaderboard should appear
- [ ] Click "Help" → Help screen should appear
- [ ] Click music toggle → Icon should change from 🔊 to 🔇

## Customization Form Tests
- [ ] Verify photo upload functionality
- [ ] Verify adding/removing messages
- [ ] Verify gnome character selection
- [ ] Test form validation (required fields)
- [ ] Test saving customizations to localStorage

## Gameplay Tests
- [ ] Start a new game (enter name and click "Start Round")
- [ ] Verify game canvas is initialized with targets
- [ ] Test slingshot mechanic (drag and release)
- [ ] Verify physics simulation (objects should move realistically)
- [ ] Verify scoring system (hitting targets should add points)
- [ ] Verify launcher countdown (should start with 5 launches)
- [ ] Verify timer countdown (should start at 2:00)

## Leaderboard Tests
- [ ] Complete a game and verify score is added to leaderboard
- [ ] Verify leaderboard displays scores in descending order
- [ ] Verify persistence (reload page and check if scores remain)

## localStorage Tests
- [ ] Test if localStorage is properly initialized
- [ ] Test if customizations are saved between sessions
- [ ] Test leaderboard persistence between page refreshes

## Mobile/Responsive Tests
- [ ] Test on mobile device or using browser's device emulation
- [ ] Verify responsive layout adjustments
- [ ] Test touch controls on mobile view

## Mobile Compatibility Tests
- [ ] Test on iPhone browsers (Safari and Chrome)
- [ ] Verify touch controls work correctly
- [ ] Test pinch-to-zoom gesture for aiming
- [ ] Verify slingshot highlight appears when touching near it
- [ ] Test haptic feedback when interacting with the slingshot
- [ ] Verify touch targets are large enough for mobile use
- [ ] Test orientation changes (landscape to portrait)
- [ ] Verify the UI is responsive and fits on mobile screens
- [ ] Test loading screen progress indicators on slower networks
- [ ] Verify error messages are clear and readable on small screens

## Loading Screen Tests
- [ ] Verify loading screen appears when page first loads
- [ ] Verify progress bar animation works correctly
- [ ] Verify loading messages update during initialization
- [ ] Test loading screen error handling:
  - [ ] Test retry button functionality on loading failure
  - [ ] Verify descriptive error messages are shown on failure
- [ ] Verify loading screen disappears after successful initialization
- [ ] Verify in-game loading screens work when starting a game

## Loading and Error Handling Tests
- [ ] Test loading screen appearance
- [ ] Verify loading progress bar updates correctly
- [ ] Test error handling when assets fail to load
- [ ] Verify placeholders appear for missing assets
- [ ] Test retry functionality on critical errors
- [ ] Verify in-game loading indicators work
- [ ] Test network interruption scenarios
- [ ] Verify game recovers gracefully from errors

## Error Handling Tests
- [ ] Test physics initialization failure handling
- [ ] Test asset loading failure handling
- [ ] Test localStorage availability handling
- [ ] Test error messaging for user feedback
- [ ] Verify error messages are clear and actionable
- [ ] Test game recovery after non-fatal errors

## Issues Found
(Document any issues found during testing here)
