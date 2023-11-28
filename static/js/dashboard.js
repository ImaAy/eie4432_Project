// script.js
document.addEventListener('DOMContentLoaded', function () {
  const eventList = document.getElementById('eventList');
  const searchInput = document.getElementById('searchInput');
  let events = [];

  async function fetchEvents() {
    try {
      const response = await fetch('/event');
      events = await response.json();
      updateEventList(events);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }

  function createEventCard(event) {
    const colDiv = document.createElement('div');
    colDiv.className = 'col mb-4';

    const card = document.createElement('div');
    card.className = 'card h-100 shadow-sm';
    card.classList.add('clickable-card', 'shadow');

    const departureDate = new Date(event.departureDateTime).toLocaleString();
    const arrivalDate = new Date(event.arrivalDateTime).toLocaleString();
    const coverImageSrc = event.coverImage;

    // Vérifier si avTickets est égal à zéro
    const isSoldOut = event.avTickets === 0;

    card.innerHTML = `
        <img src="${coverImageSrc}" class="card-img-top" alt="${event.title}">
        <div class="card-body">
            <h5 class="card-title">${event.title}</h5>
            <p class="card-text"><strong>Airline:</strong> ${event.airline}</p>
            <p class="card-text"><strong>FlightPrice(HKD):</strong> ${event.flightPrice}</p>
            <p class="card-text"><strong>Available Tickets:</strong> ${event.avTickets}</p>
            <p class="card-text"><strong>Departure:</strong> ${departureDate} from ${event.departureAirport}</p>
            <p class="card-text"><strong>Arrival:</strong> ${arrivalDate} at ${event.arrivalAirport}</p>
            <hr>
            <p class="card-text">${event.description}</p>
            <button class="btn btn-primary select-button" data-event-id="${event._id}" ${isSoldOut ? 'disabled' : ''}>
                ${isSoldOut ? '<em>Sold Out</em>' : 'Select'}
            </button>
        </div>
    `;

    const selectButton = card.querySelector('.select-button');
    selectButton.addEventListener('click', () => {
      if (!isSoldOut) {
        handleCardClick(event);
      }
    });

    card.addEventListener('mouseover', () => {
      card.classList.add('shadow-lg');
    });

    card.addEventListener('mouseout', () => {
      card.classList.remove('shadow-lg');
    });

    if (isSoldOut) {
      card.style.opacity = 0.5;
    }

    colDiv.appendChild(card);
    return colDiv;
  }

  function handleCardClick(event) {
    const userConfirmed = confirm(`Would you like to book this flight: ${event.title}?`);
    if (userConfirmed) {
      sessionStorage.setItem('eventId', event._id);

      console.log('Redirecting to booking page...');
      window.location.href = 'booking.html';
    }
  }

  function updateEventList(filteredEvents) {
    if (!Array.isArray(filteredEvents)) {
      console.error('Invalid input to updateEventList: not an array');
      return;
    }
    eventList.innerHTML = '';
    filteredEvents.forEach((event) => {
      eventList.appendChild(createEventCard(event));
    });
  }

  searchInput.addEventListener('input', function () {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredEvents = events.filter(
      (event) => event.title.toLowerCase().includes(searchTerm) || event.airline.toLowerCase().includes(searchTerm)
    );
    updateEventList(filteredEvents);
  });

  fetchEvents();
});
