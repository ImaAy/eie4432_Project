/* Group members : 
    Name : Imadath YAYA studentId: 23012992x
    Name: Kin Fung Yip*/

let idleTime = 0;
const idleInterval = setInterval(timerIncrement, 1000);
const IDLE_LIMIT = 2 * 60;

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
