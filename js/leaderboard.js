// leaderboard.js
// Handles score tracking, name input, and leaderboard display

const LEADERBOARD_KEY = 'leaderboard';
const MAX_NAME_LENGTH = 20;

function getLeaderboard() {
  try {
    return JSON.parse(localStorage.getItem(LEADERBOARD_KEY)) || [];
  } catch {
    return [];
  }
}

function saveLeaderboard(leaderboard) {
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
}

function addScoreToLeaderboard(name, score) {
  const leaderboard = getLeaderboard();
  leaderboard.push({ name, score });
  leaderboard.sort((a, b) => b.score - a.score);
  saveLeaderboard(leaderboard.slice(0, 10)); // Keep top 10
}

function showLeaderboardModal() {
  const leaderboard = getLeaderboard();
  const content = document.getElementById('leaderboard-content');
  if (leaderboard.length === 0) {
    content.innerHTML = '<p>No scores yet. Play a round!</p>';
  } else {
    content.innerHTML = '<ol>' + leaderboard.map(entry => `<li><strong>${entry.name}</strong>: ${entry.score} points</li>`).join('') + '</ol>';
  }
  const modal = new bootstrap.Modal(document.getElementById('leaderboard-modal'));
  modal.show();
}

// Expose for game.js
window.addScoreToLeaderboard = addScoreToLeaderboard;
window.showLeaderboardModal = showLeaderboardModal;
