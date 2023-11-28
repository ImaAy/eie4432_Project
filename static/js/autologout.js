let idleTime = 0;
const idleInterval = setInterval(timerIncrement, 1000);
const IDLE_LIMIT = 15 * 60; // 15 min

window.onload = resetTimer;
document.onmousemove = resetTimer;
document.onkeypress = resetTimer;

function timerIncrement() {
  idleTime++;
  if (idleTime >= IDLE_LIMIT) {
    clearInterval(idleInterval);
    fetch('/auth/logout', {
      method: 'POST',
    })
      .then(() => {
        alert('Due to inactivity, you have been logged out.');
        window.location.href = 'index.html';
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }
}

function resetTimer() {
  idleTime = 0;
}
