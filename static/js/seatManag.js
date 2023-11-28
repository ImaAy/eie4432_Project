document.addEventListener('DOMContentLoaded', () => {
  fetchSeatsData().then((seats) => {
    const seatMap = document.getElementById('seatMap');
    seatMap.innerHTML = createSeatMap(seats, 10, 6);
    attachEventListeners();
  });

  attachEventListeners();
});

function fetchSeatsData() {
  return fetch('/seats')
    .then((response) => response.json())
    .catch((error) => console.error('Error fetching seat data:', error));
}

function createSeatMap(seats, totalRows, totalCols) {
  let svgContent = '';
  seats.forEach((seat) => {
    const { seatNumber, isOccupied, class: seatClass } = seat;
    const [x, y] = getSeatPosition(seatNumber, totalRows, totalCols);
    const color = isOccupied ? 'red' : seatClass === 'premium' ? 'blue' : 'green';
    svgContent += `
            <g class="seat" id="${seatNumber}" transform="translate(${x}, ${y})">
                <rect width="30" height="30" fill="${color}"></rect>
                <text x="15" y="20" fill="white" text-anchor="middle">${seatNumber}</text>
            </g>
        `;
  });
  return svgContent;
}

function getSeatPosition(seatNumber, totalRows, totalCols) {
  const row = parseInt(seatNumber.slice(0, -1), 10) - 1;
  const col = seatNumber.slice(-1).charCodeAt(0) - 'A'.charCodeAt(0);

  const spaceBetweenSeats = 0;
  const aisleWidth = 20;
  const seatsPerAisle = 3;

  const additionalSpaceForAisles = Math.floor(col / seatsPerAisle) * aisleWidth;

  const x = col * (60 + spaceBetweenSeats) + additionalSpaceForAisles;
  const y = row * 60;

  const totalSpaceBetweenSeats = (totalCols - 1) * spaceBetweenSeats;
  const totalAisleWidth = Math.floor((totalCols - 1) / seatsPerAisle) * aisleWidth;
  const svgWidth = totalCols * 60 + totalSpaceBetweenSeats + totalAisleWidth;
  const svgHeight = totalRows * 60;

  const xOffset = (600 - svgWidth) / 2;
  const yOffset = (800 - svgHeight) / 2;

  return [xOffset + x, yOffset + y];
}

function attachEventListeners() {
  const tooltip = document.getElementById('seatInfoTooltip');

  document.querySelectorAll('.seat').forEach((seat) => {
    seat.addEventListener('mouseover', (event) => {
      const seatNum = event.currentTarget.id;
      fetch(`/seats/seat-info/${seatNum}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data) => {
          let userInfo = data.reservedBy ? `<br>Reserved by: ${data.reservedBy}` : '<br>Not reserved';
          tooltip.innerHTML = `Seat: ${data.seatNumber}<br>Occupied: ${data.isOccupied}<br>Class: ${data.class}${userInfo}`;
          tooltip.style.display = 'block';
          tooltip.style.left = event.pageX + 'px';
          tooltip.style.top = event.pageY + 'px';
        })
        .catch((error) => console.error('Error fetching seat information:', error));
    });

    seat.addEventListener('mouseout', () => {
      tooltip.style.display = 'none';
    });
    seat.addEventListener('click', (event) => {
      // Gérer la sélection du siège
    });
  });
}
