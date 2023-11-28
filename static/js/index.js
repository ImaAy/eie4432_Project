async function checkAuthentication() {
  try {
    // Making an API call to /auth/me
    const response = await fetch('/auth/me');

    // Check if the API call is successful
    if (!response.ok) {
      // If unsuccessful, show an alert and redirect to login page
      alert('Please login');
      window.open('index.html', '_self');
    } else {
      const data = await response.json();
      const userInfo = `${data.user.username} (${data.user.role})`;
      document.getElementById('userInfo').innerHTML = userInfo;
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Please login');
    window.open('index.html', '_self');
  }
}

async function logout() {
  try {
    const response = await fetch('/auth/logout', { method: 'POST' });
    const data = await response.json();
    if (data.status === 'success') {
      window.location.href = 'index.html';
    } else {
      alert('Logout failed!');
    }
  } catch (error) {
    alert('Logout failed!');
  }
}

$(document).ready(function () {
  $('#logoutBtn').click(function () {
    const isConfirmed = confirm('Confirm to logout?');
    if (isConfirmed) {
      logout();
    }
  });
});

checkAuthentication();
