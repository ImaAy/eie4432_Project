/* Group members : 
    Name : Imadath YAYA studentId: 23012992x
    Name: Kin Fung Yip*/

import fs from 'fs/promises';
import client from './dbclient.js';
import { ObjectId } from 'mongodb';

async function initializeSeats() {
  try {
    const events = client.db('bookingFlight').collection('events');
    const seatMaps = client.db('bookingFlight').collection('seatMaps');

    const allEvents = await events.find().toArray();

    for (const event of allEvents) {
      if (event.seatMapId) {
        continue;
      }
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
      await events.updateOne({ _id: event._id }, { $set: { seatMapId: seatMapId } });
    }

    console.log('Seats and seat maps initialized successfully for all events');
  } catch (err) {
    console.error('Failed to initialize seats:', err);
  }
}

async function get_seatList() {
  try {
    const seats = client.db('bookingFlight').collection('seats');
    const seatData = await seats.find({}).toArray();
    return seatData;
  } catch (error) {
    console.error('Unable to fetch events from database:', error.message);
    throw error;
  }
}

async function get_seatInfo(seatMapId, seatNum) {
  try {
    const seatMaps = client.db('bookingFlight').collection('seatMaps');
    const users = client.db('bookingFlight').collection('users');
    
    // Trouvez la carte des sièges contenant le numéro de siège
    const seatMap = await seatMaps.findOne({ _id: new ObjectId(seatMapId), 'seats.seatNumber': seatNum });

    if (!seatMap) {
      console.log('Seat map not found');
      return null;
    }

    const seat = seatMap.seats.find(s => s.seatNumber === seatNum);

    if (seat && seat.reservedBy) {
      const user = await users.findOne({ _id: new ObjectId(seat.reservedBy) });
      seat.userInfo = user ? { name: user.name, email: user.email } : null;
    }
    return seat;
  } catch (error) {
    console.error('Unable to fetch seat information from database:', error.message);
    throw error;
  }
}


async function get_seatMap(seatMapId) {
  try {
    const seatMaps = client.db('bookingFlight').collection('seatMaps');
    const seatMap = await seatMaps.findOne({ _id: new ObjectId(seatMapId) }); 
    return seatMap;
  } catch (error) {
    console.error('Unable to fetch seat map from database:', error.message);
    throw error;
  }
}


async function update_statut(seatMapId, seatNumber, user) {
  try {
    const seats = client.db('bookingFlight').collection('seatMaps');
    // Use the seatMapId as an ObjectId and seatNumber as a string directly
    const filter = { '_id': new ObjectId(seatMapId), 'seats.seatNumber': seatNumber };
    const update = { $set: { 'seats.$.isOccupied': true, 'seats.$.reservedBy': user } };

    const result = await seats.updateOne(filter, update);
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Unable to update the seat status in the database:', error.message);
    return false;
  }
}

initializeSeats().catch(console.dir);

export { get_seatList, get_seatInfo, update_statut, get_seatMap};
