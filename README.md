# Angry Parents: Christmas Edition

A web-based arcade game designed for a family Christmas party, inspired by Angry Birds. Players launch characters with family photos to knock down Christmas-themed targets and earn points.

## Features

- Single-player slingshot mechanic 
- Customizable with family photos and funny messages
- Christmas-themed visuals and sounds
- Special "T-Rex with Santa hat" ultimate weapon
- Local leaderboard stored in the browser
- Designed for iPhone browsers with zero hosting costs

## Setup Instructions

### Prerequisites

- A modern web browser (Chrome, Safari, Firefox)
- Git (for deployment to GitHub Pages)

### Local Development

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/AngryParentsXmas.git
   cd AngryParentsXmas
   ```

2. Open the project in your favorite code editor.

3. For local testing, you can use any simple HTTP server. For example, with Python:
   ```
   # If you have Python 3 installed:
   python -m http.server
   
   # Or with Python 2:
   python -m SimpleHTTPServer
   ```

4. Visit `http://localhost:8000` in your browser.

### Deployment to GitHub Pages

1. Create a new GitHub repository.

2. Push your code to the repository:
   ```
   git remote set-url origin https://github.com/yourusername/AngryParentsXmas.git
   git push -u origin main
   ```

3. Go to your repository settings, navigate to the "Pages" section.

4. Select the "main" branch as the source and click "Save".

5. Your game will be available at `https://yourusername.github.io/AngryParentsXmas/`.

## Adding Assets

Before using the game, you'll need to add the following assets:

### Images

Place these in the `assets/images/` directory:
- `background.png`: A Christmas-themed background scene
- `slingshot.png`: The slingshot image
- `present.png`: Gift present target
- `ornament.png`: Christmas ornament target
- `gnome.png`: Scandinavian gnome target
- `tree.png`: Christmas tree target
- `trex.png`: T-Rex with Santa hat (ultimate weapon)

### Audio

Place these in the `assets/audio/` directory:
- `jingle-bell.mp3`: Sound effect for hitting targets
- `trex-roar.mp3`: Sound effect for the T-Rex ultimate weapon
- `hohoho.mp3`: Santa laugh for perfect shots
- `background-music.mp3`: Christmas background music

## Game Customization

1. Access the game URL in your browser.
2. Click the "Customize" button to open the customization form.
3. Upload 5-10 family photos (JPEG or PNG, <2MB each).
4. Add 10-15 funny messages (max 50 characters each).
5. Select which photo to use for the Scandinavian gnome character.
6. Click "Save Customizations" to apply your changes.

## How to Play

1. Click "Start Game" and enter your name.
2. Pull back the slingshot and release to launch a character.
3. Aim for the Christmas targets to score points:
   - Present: 10 points
   - Ornament: 20 points
   - Gnome statue: 50 points
   - Christmas tree: 50 points
4. Reach 500 points to unlock the T-Rex ultimate weapon.
5. Complete the round to view your final score on the leaderboard.

## Technical Notes

- The game uses Box2D.js for physics simulation.
- All game data is stored locally in the browser using localStorage.
- The game is designed to be responsive and work on iPhone browsers.
- No server-side code or database is required, making it free to host.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by Angry Birds
- Built with HTML5, CSS3, and JavaScript
- Uses Box2D.js for physics
- Bootstrap for responsive design
