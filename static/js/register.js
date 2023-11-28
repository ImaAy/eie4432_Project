document.addEventListener('DOMContentLoaded', function () {
  const registerButton = document.getElementById('registerButton');

  registerButton.addEventListener('click', function (event) {
    event.preventDefault();
    var username = document.getElementById('userID').value;
    var email = document.getElementById('email').value;
    var nickname = document.getElementById('nickname').value;
    var password = document.getElementById('password').value;
    var confirmPassword = document.getElementById('repeat-password').value;
    var role = 'user';
    var birthdate = document.getElementById('birthdate').value;
    const selectedRadioButton = document.querySelector('input[name="gender"]:checked');
    const gender = selectedRadioButton ? selectedRadioButton.value : null;
    var profileImage = document.getElementById('profileImage').files[0];

    // Check if username and password are entered
    if (!username || !password) {
      alert('Username and password cannot be empty');
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      alert('Password mismatch!');
      return;
    }

    if (!birthdate) {
      alert('Please select your birthdate');
    }

    if (!gender) {
      alert('Please select your gender');
    }

    // Prepare form data
    var formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('nickname', nickname);
    formData.append('role', role);
    formData.append('gender', gender);
    formData.append('birthdate', birthdate);
    formData.append('email', email);
    formData.append('profileImage', profileImage);

    // Send request to server
    fetch('/auth/register', {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data.status === 'success') {
          alert(`Welcome, ${username}!\nYou can login with your account now!`);
          window.location.href = '/index.html';
        } else {
          alert(data.message);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  });
});
