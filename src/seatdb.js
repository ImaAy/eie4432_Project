import fs from 'fs/promises';
import client from './dbclient.js';
import { ObjectId } from 'mongodb';

async function initializeSeats() {
  try {
    const seats = client.db('bookingFlight').collection('seats');
    const seatCount = await seats.countDocuments();

    if (seatCount === 0) {
      await seats.deleteMany({}); // Supprimer les sièges existants pour éviter les doublons

      const totalRows = 10; // Exemple : 10 rangées
      const seatsPerRow = 6; // Exemple : 6 sièges par rangée (A-F)
      const seatData = [];

      for (let row = 1; row <= totalRows; row++) {
        for (let seat = 0; seat < seatsPerRow; seat++) {
          const seatNumber = `${row}${String.fromCharCode(65 + seat)}`;
          const seatClass = row <= 3 ? 'premium' : 'economy'; // Les deux premières rangées sont premium

          seatData.push({
            seatNumber,
            isOccupied: false,
            price: seatClass === 'premium' ? 150 : 100, // Prix différent pour premium
            class: seatClass,
            reservedBy: null,
          });
        }
      }
      await seats.insertMany(seatData);
      console.log('Seats initialized successfully');
    }
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

async function get_seatInfo(seatNum) {
  try {
    const seats = client.db('bookingFlight').collection('seats');
    const users = client.db('bookingFlight').collection('users');
    const seat = await seats.findOne({ seatNumber: seatNum });

    if (seat && seat.reservedBy) {
      const user = await users.findOne({ _id: seat.reservedBy });
      seat.userInfo = user ? { name: user.name } : null;
    }
    console.log('seat info', seat);
    return seat;
  } catch (error) {
    console.error('Unable to fetch events from database:', error.message);
    throw error;
  }
}

async function update_statut(seatId, user) {
  try {
    const seats = client.db('bookingFlight').collection('seats');
    const filter = { seatNumber: seatId };
    const update = { $set: { isOccupied: true, reservedBy: user } };
    const result = await seats.updateOne(filter, update);
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Unable to update the seat status in the database:', error.message);
    return false;
  }
}
initializeSeats().catch(console.dir);

export { get_seatList, get_seatInfo, update_statut };
