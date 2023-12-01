
/* Group members : 
    Name : Imadath YAYA studentId: 23012992x
    Name: Kin Fung Yip*/
    
var seatsInfo;
var totalCols = 6;
var totalRows = 10;
var seatMapId;

function searchEvents() {
  const searchTerm = document.getElementById('eventSearchInput').value;

  fetch(`/event/searchEvents?query=${searchTerm}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(events => {
      displaySearchResults(events);
    })
    .catch(error => {
      console.error('Error searching events:', error);
    });
}

function displaySearchResults(events) {
  const resultsElement = document.getElementById('searchResults');
  resultsElement.innerHTML = '';
  events.forEach(event => {
    const listItem = document.createElement('a');
    listItem.classList.add('list-group-item', 'list-group-item-action');
    listItem.textContent = event.title;
    listItem.setAttribute('href', '#');
    listItem.onclick = function() { selectEvent(event._id); }; 
    resultsElement.appendChild(listItem);
  });
}




function fetchSeatsData() {
  return fetch('/seats')
    .then((response) => response.json())
    .catch((error) => console.error('Error fetching seat data:', error));
}

function createSeatMap(seatMapId, seats, totalRows, totalCols) {
  const { seatSize, spaceBetweenSeats, aisleWidth } = adjustSeatSizeAndSpacing(window.innerWidth, totalRows, totalCols);
  let svgContent = '';
  seats.forEach((seat) => {
    const { seatNumber, isOccupied, class: seatClass } = seat;
    // Passez les valeurs dynamiques à getSeatPosition
    const [x, y] = getSeatPosition(seatNumber, totalRows, totalCols, seatSize, spaceBetweenSeats, aisleWidth);
    const color = isOccupied ? 'red' : seatClass === 'premium' ? 'blue' : 'green';
    svgContent += `
      <g class="seat" id="${seatNumber}" transform="translate(${x}, ${y})">
        <rect width="${seatSize}" height="${seatSize}" fill="${color}"></rect>
        <text x="${seatSize / 2}" y="${seatSize * 0.7}" fill="white" text-anchor="middle">${seatNumber}</text>
      </g>
    `;
  });

  // Utilisez les dimensions dynamiques pour définir le viewBox
  const svgViewBoxWidth = totalCols * (seatSize + spaceBetweenSeats) + aisleWidth;
  const svgViewBoxHeight = totalRows * (seatSize + spaceBetweenSeats);
  const seatMap = document.getElementById('seatMap');
  seatMap.setAttribute('viewBox', `0 0 ${svgViewBoxWidth} ${svgViewBoxHeight}`);
  seatMap.innerHTML = svgContent;
  attachEventListeners(seatMapId);
}



function adjustSeatSizeAndSpacing(windowWidth, totalRows, totalCols) {
  const maxSeatSize = 30; // La taille maximale d'un siège
  const minSeatSize = 10; // La taille minimale d'un siège
  const maxScreenWidth = 1200; // La largeur d'écran maximale pour le calcul

  // Calculer la taille du siège en fonction de la largeur de l'écran
  const seatSize = Math.max(windowWidth / maxScreenWidth * maxSeatSize, minSeatSize);
  const spaceBetweenSeats = seatSize * 0.2; // Définir l'espacement entre les sièges à 20% de la taille du siège
  const aisleWidth = seatSize; // La largeur de l'allée égale à la taille du siège

  // Mettre à jour le viewBox avec les nouvelles dimensions
  const svgViewBoxWidth = totalCols * (seatSize + spaceBetweenSeats) + aisleWidth;
  const svgViewBoxHeight = totalRows * (seatSize + spaceBetweenSeats);
  const seatMap = document.getElementById('seatMap');
  seatMap.setAttribute('viewBox', `0 0 ${svgViewBoxWidth} ${svgViewBoxHeight}`);

  return { seatSize, spaceBetweenSeats, aisleWidth };
}

function getSeatPosition(seatNumber, totalRows, totalCols, seatSize, spaceBetweenSeats, aisleWidth) {
  const row = parseInt(seatNumber.slice(0, -1), 10) - 1;
  const col = seatNumber.slice(-1).charCodeAt(0) - 'A'.charCodeAt(0);
  const seatsPerAisle = 3;

  const additionalSpaceForAisles = Math.floor(col / seatsPerAisle) * aisleWidth;
  const x = col * (seatSize + spaceBetweenSeats) + additionalSpaceForAisles;
  const y = row * (seatSize + spaceBetweenSeats);

  const svgViewBoxWidth = totalCols * (seatSize + spaceBetweenSeats) + aisleWidth;
  const svgViewBoxHeight = totalRows * (seatSize + spaceBetweenSeats);

  const xOffset = Math.max(0, (svgViewBoxWidth - (totalCols * (seatSize + spaceBetweenSeats) + aisleWidth)) / 2);
  const yOffset = Math.max(0, (svgViewBoxHeight - (totalRows * (seatSize + spaceBetweenSeats))) / 2);

  return [xOffset + x, yOffset + y];
}

function selectEvent(eventId) {
  // Efface les résultats de recherche existants
  document.getElementById('searchResults').innerHTML = '';

  fetch(`/event/details/${eventId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(eventDetails => {
      seatMapId=eventDetails.seatMapId;
      const eventTitleElement = document.getElementById('eventTitle');
      eventTitleElement.innerHTML = '<h2><strong>' + eventDetails.title + '</strong></h2>';
      return fetch(`/seats/details/${eventDetails.seatMapId}`);
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(seatMapDetails => {
      const { seats} = seatMapDetails;
      console.log("seat",seats);
      createSeatMap(seatMapId,seats, totalRows, totalCols);
    })
    .catch(error => {
      console.error('Error fetching seat map:', error);
    });
}



function attachEventListeners(seatMapId) {
  const tooltip = document.getElementById('seatInfoTooltip');

  document.querySelectorAll('.seat').forEach((seat) => {
    seat.addEventListener('mouseover', (event) => {
      const seatNum = event.currentTarget.id;
      const url = new URL(window.location.origin + '/seats/seat-info');
      url.searchParams.append('seatNum', seatNum);
      url.searchParams.append('seatMapId', seatMapId);

      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data) => {
          if (data.reservedBy) {
              return fetch(`/auth/user-info/${data.reservedBy}`).then(userResponse => {
                  if (!userResponse.ok) {
                      throw new Error('Network response was not ok');
                  }
                  return userResponse.json().then(userInfo => {
                      return { seatData: data, userData: userInfo };
                  });
              });
          } else {
              return { seatData: data };
          }
        })
        .then(({ seatData, userData }) => {
            let userInfoHtml = userData ? `<br>Reserved by: ${userData.username} <br>Email:(${userData.email}) <br>Gender: (${userData.gender}) ` : '<br>Not reserved';
            tooltip.innerHTML = `Seat: ${seatData.seatNumber}<br>Occupied: ${seatData.isOccupied}<br>Class: ${seatData.class}${userInfoHtml}`;
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

document.addEventListener('DOMContentLoaded', () => {
  /*fetchSeatsData().then(seatsData => {
    createSeatMap(seatsData, totalRows, totalCols);
  });*/
});
