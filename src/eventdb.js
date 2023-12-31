/* Group members : 
    Name : Imadath YAYA studentId: 23012992x
    Name: Kin Fung Yip*/

import fs from 'fs/promises';
import client from './dbclient.js';
import { ObjectId } from 'mongodb';

async function init_event_db() {
  try {
    const events = client.db('bookingFlight').collection('events');
    const eventCount = await events.countDocuments();

    if (eventCount === 0) {
      const eventData = await fs.readFile('./events.json', 'utf8');
      let eventObjects = JSON.parse(eventData);

      // Insert data into the database
      const insertResult = await events.insertMany(eventObjects);
      console.log(`Added ${insertResult.insertedCount} events`);
    }
  } catch (err) {
    console.error('Unable to initialize the event database!', err);
  }
}

async function updateAvTickets(eventId) {
  try {
    const filter = { _id: new ObjectId(eventId) };
    const update = { $inc: { avTickets: -1 } };
    const events = client.db('bookingFlight').collection('events');
    const result = await events.updateOne(filter, update);

    if (result.modifiedCount === 1) {
      console.log('Mise à jour réussie.');
      return true;
    } else {
      console.log('Aucune mise à jour effectuée.');
      return false;
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour des tickets disponibles:', error.message);
    return false;
  }
}

async function add_event(
  title,
  flightNumber,
  flightPrice,
  nbTickets,
  avTickets,
  departureDateTime,
  arrivalDateTime,
  departureAirport,
  arrivalAirport,
  airline,
  description,
  coverImage
) {
  try {
    const events = client.db('bookingFlight').collection('events');
    const seatMaps = client.db('bookingFlight').collection('seatMaps');
    const seatData = [];
    const totalRows = 10;
    const seatsPerRow = 6; 

    for (let row = 1; row <= totalRows; row++) {
      for (let seat = 0; seat < seatsPerRow; seat++) {
        const seatNumber = `${row}${String.fromCharCode(65 + seat)}`;
        const seatClass = row <= 3 ? 'premium' : 'economy';

        seatData.push({
          _id: new ObjectId(),
          seatNumber,
          isOccupied: false,
          price: seatClass === 'premium' ? 150 : 100,
          class: seatClass,
          reservedBy: null
        });
      }
    }

    const seatMap = await seatMaps.insertOne({ seats: seatData });
    const seatMapId = seatMap.insertedId;
    const newEvent = {
      title,
      flightNumber,
      flightPrice,
      nbTickets,
      avTickets,
      departureDateTime,
      arrivalDateTime,
      departureAirport,
      arrivalAirport,
      airline,
      description,
      coverImage,
      seatMapId,
    };


    const result = await events.insertOne(newEvent);
    return result.insertedId;
  } catch (error) {
    console.error('Unable to add event to the database!', error.message);
    return false;
  }
}

async function update_event(
  eventId,
  title,
  flightNumber,
  flightPrice,
  nbTickets,
  departureDateTime,
  arrivalDateTime,
  departureAirport,
  arrivalAirport,
  airline,
  description,
  coverImage
) {
  try {
    const events = client.db('bookingFlight').collection('events');
    const filter = { _id: eventId };
    const update = {
      $set: {
        title,
        flightNumber,
        flightPrice,
        nbTickets,
        departureDateTime,
        arrivalDateTime,
        departureAirport,
        arrivalAirport,
        airline,
        description,
        coverImage,
      },
    };

    const result = await events.updateOne(filter, update);
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Unable to update the event in the database!', error.message);
    return false;
  }
}

async function fetch_event(eventId) {
  try {
    const events = client.db('bookingFlight').collection('events');
    const event = await events.findOne({ _id: new ObjectId(eventId) });
    return event;
  } catch (error) {
    console.error('Unable to fetch event from database!', error.message);
    throw error;
  }
}

async function get_eventList() {
  try {
    const events = client.db('bookingFlight').collection('events');
    const eventList = await events.find({}).toArray();
    return eventList;
  } catch (error) {
    console.error('Unable to fetch events from database:', error.message);
    throw error;
  }
}

async function get_events(query) {
    try {
        const events = client.db('bookingFlight').collection('events');
        const eventsList = await events.find({ title: new RegExp(query, 'i') }).toArray();
        return eventsList;
    } catch (error) {
        console.error('Erreur lors de la récupération des événements:', error);
        return null;
    }
}

init_event_db().catch(console.dir);

export { add_event, update_event, fetch_event, get_eventList, updateAvTickets, get_events };
