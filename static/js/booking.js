/* Group members : 
    Name : Imadath YAYA studentId: 23012992x
    Name: Kin Fung Yip*/

document.addEventListener('DOMContentLoaded', function () {
  var eventId = sessionStorage.getItem('eventId');
  var seatMapId;
  if (eventId) {
    fetch(`/event/details/${eventId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((eventDetails) => {
        document.getElementById('eventTitle').textContent = eventDetails.title;
        document.getElementById('eventPrice').textContent = eventDetails.flightPrice;
        document.getElementById('eventDescription').textContent = eventDetails.description;
        document.getElementById('eventImage').src = eventDetails.coverImage;
        document.getElementById('eventAirline').textContent = eventDetails.airline;
        document.getElementById('eventDepartureDate').textContent = eventDetails.departureDate;
        document.getElementById('eventDepartureAirport').textContent = eventDetails.departureAirport;
        document.getElementById('eventArrivalDate').textContent = eventDetails.arrivalDate;
        document.getElementById('eventArrivalAirport').textContent = eventDetails.arrivalAirport;
        document.getElementById('flightPrice').textContent = eventDetails.flightPrice;

        fetchSeatsData(eventDetails).then((seatMapDetails) => {
          seatMapId = seatMapDetails._id;
          const seats = seatMapDetails.seats;
          const seatMap = document.getElementById('seatMap');
          seatMap.innerHTML = createSeatMap(seats);
          attachEventListeners();
        });
      })
      .catch((error) => console.error('Error:', error));
  }

  

  document.getElementById('contactForm').addEventListener('submit', function (e) {
    e.preventDefault();
  });

  document.getElementById('submitBooking').addEventListener('click', function () {
    var eventId = sessionStorage.getItem('eventId');
    var selectedSeatElement = document.querySelector('.seat.selected');
    var selectedSeat = selectedSeatElement ? selectedSeatElement.id : null;
    var totalPrice = document.getElementById('flightPrice').textContent;
    var inputs = document.querySelectorAll('#contactForm input, #contactForm select');
    for (var i = 0; i < inputs.length; i++) {
      if (inputs[i].value.trim() === '') {
        alert('Veuillez remplir tous les champs avant de soumettre.');
        return;
      }
    }
    if (!selectedSeat) {
      alert('Please select a seat.');
      return;
    }
    sessionStorage.setItem('eventId', eventId);
    sessionStorage.setItem('totalPrice', totalPrice);
    sessionStorage.setItem('seatMapId', seatMapId);
    sessionStorage.setItem('selectedSeat', selectedSeat);
    window.location.href = 'payment.html';
  });
});

function createSeatMap(seats) {
  let svgContent = '';
  seats.forEach((seat) => {
    const { seatNumber, isOccupied, class: seatClass, price } = seat;
    const [x, y] = getSeatPosition(seatNumber);
    const color = isOccupied ? 'red' : seatClass === 'premium' ? 'blue' : 'green';
    svgContent += `
      <g class="seat" id="${seatNumber}" transform="translate(${x}, ${y})" data-price="${price}" data-occupied="${isOccupied}">
        <rect width="40" height="40" fill="${color}"></rect>
        <text x="20" y="25" fill="white" text-anchor="middle" font-size="15">${seatNumber}</text>
      </g>
    `;
  });
  return svgContent;
}

function attachEventListeners() {
  document.querySelectorAll('.seat').forEach((seat) => {
    seat.addEventListener('click', handleSeatClick);
  });
}

function handleSeatClick(event) {
  const seat = event.currentTarget;
  const isOccupied = seat.dataset.occupied === 'true';
  if (!isOccupied) {
    const selected = document.querySelector('.seat.selected');
    if (selected) {
      selected.classList.remove('selected');
    }
    seat.classList.add('selected');
    updatePrice(seat.dataset.price);
  }
}

function fetchSeatsData(eventDetails) {
  return fetch(`/seats/details/${eventDetails.seatMapId}`)
    .then((response) => response.json())
    .catch((error) => console.error('Error fetching seat data:', error));
}

function updatePrice(seatPrice) {
  const flightPriceElement = document.getElementById('flightPrice');
  const eventPriceElement = document.getElementById('eventPrice');
  let currentFlightPrice = parseFloat(eventPriceElement.textContent);
  if (isNaN(currentFlightPrice)) currentFlightPrice = 0;
  let seatPriceNumber = parseFloat(seatPrice);
  if (isNaN(seatPriceNumber)) {
    console.error('Not valid.');
    return;
  }
  let newFlightPrice = currentFlightPrice + seatPriceNumber;
  flightPriceElement.textContent = newFlightPrice.toFixed(2);
}

function getSeatPosition(seatNumber) {
  const row = parseInt(seatNumber.slice(0, -1)) - 1;
  const col = seatNumber.slice(-1).charCodeAt(0) - 'A'.charCodeAt(0);

  const aisleSpace = 20;
  const seatWidth = 50;
  const seatsPerGroup = 3;

  const aisleOffset = Math.floor(col / seatsPerGroup) * aisleSpace;

  const x = col * seatWidth + aisleOffset;
  const y = row * seatWidth;

  return [x, y];
}
