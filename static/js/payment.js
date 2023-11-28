var eventTitle;
var totalPrice;
var selectedSeat;
document.addEventListener('DOMContentLoaded', function () {
  var eventId = sessionStorage.getItem('eventId');
  totalPrice = sessionStorage.getItem('totalPrice');
  selectedSeat = sessionStorage.getItem('selectedSeat');
  console.log('seatSession  ', selectedSeat);
  if (eventId) {
    fetch(`/event/details/${eventId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((eventDetails) => {
        eventTitle = eventDetails.title;
        document.getElementById('eventTitle').textContent = eventDetails.title;
        document.getElementById('eventPrice').textContent = eventDetails.flightPrice;
        document.getElementById('eventDescription').textContent = eventDetails.description;
        document.getElementById('eventImage').src = eventDetails.coverImage;
        document.getElementById('eventAirline').textContent = eventDetails.airline;
        document.getElementById('eventDepartureDate').textContent = eventDetails.departureDate;
        document.getElementById('eventDepartureAirport').textContent = eventDetails.departureAirport;
        document.getElementById('eventArrivalDate').textContent = eventDetails.arrivalDate;
        document.getElementById('eventArrivalAirport').textContent = eventDetails.arrivalAirport;
        document.getElementById('totalPriceDisplay').textContent = totalPrice;
      })
      .catch((error) => console.error('Error:', error));
  }
  document.getElementById('totalPriceDisplay').textContent = totalPrice;
  document.getElementById('seatDisplay').textContent = selectedSeat;

  document.getElementById('payment-form').addEventListener('submit', function (event) {
    event.preventDefault();
    var formData = new FormData();
    formData.append('selectedSeat', selectedSeat);
    fetch('/seats/updateStatut', {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        console.log('seattttt');
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Network response was not ok.');
        }
      })
      .then((data) => {
        console.log('Success:', data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    let cardNumber = document.getElementById('cardNumber').value;
    if (!cardNumber.match(/\d{16}/)) {
      alert('Please enter a valid 16-digit credit card number.');
      return;
    }
    let expirationDate = document.getElementById('expirationDate').value;
    if (!expirationDate.match(/\d{2}\/\d{2}/)) {
      alert('Please enter a valid expiration date in MM/YY format.');
      return;
    }
    let cvv = document.getElementById('cvv').value;
    if (!cvv.match(/\d{3}/)) {
      alert('Please enter a valid 3-digit CVV.');
      return;
    }
    console.log('Form submitted successfully.');
    alert('Payment successful!');
    displayElectronicTicket();
    updateAvTickets(eventId);
    setTimeout(function () {
      window.location.href = 'dashboard.html';
    }, 10000);
  });
});

function updateAvTickets(eventId) {
  fetch(`/event/updateAvailability/${eventId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => {})
    .catch((error) => console.error('Error:', error));
}

function displayElectronicTicket() {
  document.getElementById('info').style.display = 'none';
  const paymentStatusSection = document.getElementById('payment-status');

  paymentStatusSection.innerHTML = `
    <div class="card border-success mb-3">
      <div class="card-header bg-success text-white">Payment Status</div>
      <div class="card-body text-success">
        <h5 class="card-title">Successful</h5>
        <p class="card-text">Your payment has been processed successfully.</p>
      </div>
    </div>
  `;
  paymentStatusSection.style.display = 'block';
  const ticketSection = document.getElementById('electronic-ticket');
  ticketSection.innerHTML = `
    <div class="card">
      <div class="card-header">Electronic Ticket</div>
      <div class="card-body">
        <h5 class="card-title">Event: ${eventTitle}</h5>
        <p class="card-text"><strong>Ticket Number:</strong> #${Math.floor(Math.random() * 1000000)}</p>
        <p class="card-text"><strong>Price:</strong> ${totalPrice}</p>
        <p class="card-text"><strong>Date:</strong> 2023-12-01</p>
        <p class="card-text"><strong>Seat: ${selectedSeat}</strong> </p>
        <p class="card-text">Thank you for your purchase! You will be automatically redirected to the menu in 30 seconds.</p>
      </div>
    </div>
  `;
  ticketSection.style.display = 'block';
}
