document.addEventListener('DOMContentLoaded', function () {
  const loginButton = document.getElementById('loginButton');

  loginButton.addEventListener('click', function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const password = document.getElementById('password').value;

    // Check if username and password are not empty
    if (!username || !password) {
      alert('Username and password cannot be empty');
      return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('rememberMe', rememberMe);

    fetch('/auth/login', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'success') {
          alert(`Logged as ${data.user.username} (${data.user.role})`);
          window.location.href = '/dashboard.html';
        } else if (data.message) {
          alert(data.message);
        } else {
          alert('Unknown error');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('Unknown error');
      });
  });
});
