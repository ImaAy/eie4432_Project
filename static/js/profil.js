/* Group members : 
    Name : Imadath YAYA studentId: 23012992x
    Name: Kin Fung Yip*/

document.addEventListener('DOMContentLoaded', function () {
  const formFields = document.querySelectorAll('#profileForm input, #profileForm select');
  formFields.forEach((field) => {
    field.setAttribute('readonly', 'true');
  });
  fetchUserDataAfterUpload();

  document.getElementById('updateProfileBtn').addEventListener('click', function () {
    formFields.forEach((field) => {
      field.removeAttribute('readonly');
    });
    document.getElementById('saveBtn').style.display = 'block';
    this.style.display = 'none';
  });

  document.getElementById('saveBtn').addEventListener('click', function () {
    event.preventDefault();
    var nickname = document.getElementById('nickname').value;
    var email = document.getElementById('email').value;
    var gender = document.getElementById('gender').value;
    var birthdate = document.getElementById('birthdate').value;

    var updatedValues = new FormData();
    updatedValues.append('nickname', nickname);
    updatedValues.append('email', email);
    updatedValues.append('gender', gender);
    updatedValues.append('birthdate', birthdate);
    fetch('/auth/updateProfile', {
      method: 'POST',
      body: updatedValues,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        console.log('Réponse du serveur:', data);
        fetchUserDataAfterUpload();
      })
      .catch((error) => {
        console.error('Erreur lors de la requête fetch:', error);
      });
    formFields.forEach((field) => {
      field.setAttribute('readonly', 'true');
    });

    this.style.display = 'none';
    document.getElementById('updateProfileBtn').style.display = 'block';
  });

  document.getElementById('editBtn').addEventListener('click', function () {
    var fileInput = document.getElementById('fileInput');
    fileInput.click();
    fileInput.addEventListener('change', function () {
      const file = fileInput.files[0];
      const formData = new FormData();
      formData.append('profileImage', file);

      fetch('/auth/uploadProfileImage', {
        method: 'POST',
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          fetchUserDataAfterUpload();
        })
        .catch((error) => {
          console.error('Erreur lors de la requête fetch:', error);
        });
    });
  });

  const changePasswordBtn = document.getElementById('changePasswordBtn');
  const profileForm = document.getElementById('profileForm');
  const passwordForm = document.getElementById('changePasswordForm');

  changePasswordBtn.addEventListener('click', function () {
    profileForm.style.display = 'none';
    passwordForm.style.display = 'block';
    this.style.display = 'none';
  });

  const validatePasswordBtn = document.getElementById('validatePasswordBtn');
  validatePasswordBtn.addEventListener('click', () => {
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (newPassword !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    var updateValue = new FormData();
    updateValue.append('oldPassword', oldPassword);
    updateValue.append('newPassword', newPassword);

    fetch('/auth/changePassword', {
      method: 'POST',
      body: updateValue,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Échec de la requête au backend');
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          alert('Password changed with success !');
          profileForm.style.display = 'block';
          passwordForm.style.display = 'none';
          changePasswordBtn.style.display = 'block';
        } else {
          alert('Error during the changement of the password!Try again');
        }
      })
      .catch((error) => {
        console.error('Erreur lors de la requête au backend:', error.message);
      });
  });
});

function fetchUserDataAfterUpload() {
  fetch(`/auth/me/`)
    .then((response) => response.json())
    .then((userData) => {
      document.getElementById('nickname').value = userData.nickname;
      document.getElementById('email').value = userData.email;
      document.getElementById('gender').value = userData.gender;
      document.getElementById('birthdate').value = userData.birthdate;
      const profileImage = document.getElementById('profileImage');

      if (profileImage) {
        profileImage.setAttribute('src', userData.profileImage);
      } else {
        profileImage.setAttribute('src', '/upload/defaultProfil.png');
      }
    });
}
