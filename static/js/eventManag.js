/* Group members : 
    Name : Imadath YAYA studentId: 23012992x
    Name: Kin Fung Yip*/

document.addEventListener('DOMContentLoaded', function () {
  const createEventButton = document.getElementById('createEvent');

  createEventButton.addEventListener('click', function (event) {
    event.preventDefault();

    var title = document.getElementById('title').value;
    var flightNumber = document.getElementById('flightNumber').value;
    var flightPrice = document.getElementById('flightPrice').value;
    var nbTickets = document.getElementById('nbTickets').value;
    var departureDateTime = document.getElementById('departureDateTime').value;
    var arrivalDateTime = document.getElementById('arrivalDateTime').value;
    var departureAirport = document.getElementById('departureAirport').value;
    var arrivalAirport = document.getElementById('arrivalAirport').value;
    var airline = document.getElementById('airline').value;
    var description = document.getElementById('description').value;
    var coverImage = document.getElementById('coverImage').files[0];

    // Check if the essential fields are filled
    if (
      !title ||
      !flightNumber ||
      !departureDateTime ||
      !arrivalDateTime ||
      !flightPrice ||
      !departureAirport ||
      !arrivalAirport ||
      !airline ||
      !description ||
      !nbTickets
    ) {
      alert('Please fill in all the required fields');
      return;
    }

    // Prepare form data for event creation
    var formData = new FormData();
    formData.append('title', title);
    formData.append('flightNumber', flightNumber);
    formData.append('flightPrice', flightPrice);
    formData.append('nbTickets', nbTickets);
    formData.append('departureDateTime', departureDateTime);
    formData.append('arrivalDateTime', arrivalDateTime);
    formData.append('departureAirport', departureAirport);
    formData.append('arrivalAirport', arrivalAirport);
    formData.append('airline', airline);
    formData.append('description', description);
    formData.append('coverImage', coverImage);

    // Send request to server to create event
    fetch('/event/create', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'success') {
          alert(`Event created successfully: ${title}`);
          window.location.href = '/dashboard.html';
        } else {
          alert(data.message);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  });
});
