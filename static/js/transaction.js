/* Group members : 
    Name : Imadath YAYA studentId: 23012992x
    Name: Kin Fung Yip*/

function fetchTickets() {
    fetch('/auth/tickets')
    .then(response => response.json())
    .then(tickets => {
        const monthFilter = document.getElementById('monthFilter').value;
        const filteredTickets = monthFilter ? tickets.filter(ticket => ticket.date.startsWith(`2023-${monthFilter}`)) : tickets;
        displayTickets(filteredTickets);
    });
}

// Display tickets in the list
// Display tickets in the list or a message if there are no tickets
function displayTickets(tickets) {
    const ticketsElement = document.getElementById('tickets');
    ticketsElement.innerHTML = ''; // Clear the list

    if (tickets.length === 0) {
        const noTicketsMessage = document.createElement('p');
        noTicketsMessage.classList.add('list-group-item');
        noTicketsMessage.textContent = 'No ticket purchases found for this month.';
        ticketsElement.appendChild(noTicketsMessage);
    } else {
        tickets.forEach(ticket => {
            const ticketElement = document.createElement('a');
            ticketElement.classList.add('list-group-item', 'list-group-item-action');
            ticketElement.innerHTML = `
                <h5 class="mb-1">${ticket.eventTitle}</h5>
                <p class="mb-1">Ticket Number: ${ticket.ticketNumber}</p>
                <p class="mb-1">Total Price: $${ticket.totalPrice}</p>
                <small>Date: ${ticket.date} at ${ticket.hour}</small>
            `;
            ticketsElement.appendChild(ticketElement);
        });
    }
}


document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('monthFilter').addEventListener('mouseover', function() {
        this.size = 6;
    });

    document.getElementById('monthFilter').addEventListener('mouseleave', function() {
        this.size = 1;
    });
    const monthFilterElement = document.getElementById('monthFilter');
    
    if(monthFilterElement) {
        monthFilterElement.addEventListener('change', fetchTickets);
        fetchTickets();
    } else {
        console.error('monthFilter element not found');
    }
});