document.addEventListener('DOMContentLoaded', () => {
  fetch('/auth/me')
    .then((response) => response.json())
    .then((data) => {
      const userType = data.role;
      updateNavbar(userType);
    })
    .catch((error) => console.error('Error fetching user type:', error));

  document.getElementById('logoutLink').addEventListener('click', function (event) {
    event.preventDefault();
    if (confirm('Are you sure you want to log out?')) {
      fetch('/auth/logout', { method: 'POST' })
        .then((response) => {
          if (response.ok) {
            window.location.href = '/index.html';
          } else {
            alert('Failed to log out');
          }
        })
        .catch((error) => console.error('Error:', error));
    }
  });
});

function updateNavbar(userType) {
  const navItems = document.querySelectorAll('nav [data-role]');

  navItems.forEach((item) => {
    if (item.getAttribute('data-role') === userType) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}
