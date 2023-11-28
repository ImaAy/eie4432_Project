import express from 'express';
import multer from 'multer';

import { add_event, update_event, fetch_event, get_eventList, updateAvTickets } from './eventdb.js';

const route = express.Router();
const storage = multer.diskStorage({
  destination: './upload/Images',
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

route.get('/', async (req, res) => {
  try {
    const eventLists = await get_eventList();
    res.json(eventLists);
  } catch (error) {
    console.error('Unable to fetch events:', error.message);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

route.get('/details/:eventId', async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const event = await fetch_event(eventId);
    res.json(event);
  } catch (error) {
    console.error('Unable to fetch events:', error.message);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

route.post('/updateAvailability/:eventId', async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const newAvTickets = await updateAvTickets(eventId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating available tickets:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update available tickets.' });
  }
});
route.post('/create', upload.single('coverImage'), async (req, res) => {
  // Extracting form data
  const {
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
  } = req.body;
  const coverImage = req.file ? `/upload/${req.file.filename}` : '/upload/defaultCountry.png';

  // Check if essential fields are not empty
  if (
    !title ||
    !flightNumber ||
    !departureDateTime ||
    !flightPrice ||
    !nbTickets ||
    !arrivalDateTime ||
    !departureAirport ||
    !arrivalAirport ||
    !airline ||
    !description ||
    !coverImage
  ) {
    return res.status(400).json({
      status: 'failed',
      message: 'Missing required fields',
    });
  }
  const avTickets = parseInt(nbTickets, 10);
  const nbTicketsInt = parseInt(nbTickets, 10);
  const success = add_event(
    title,
    flightNumber,
    flightPrice,
    nbTicketsInt,
    avTickets,
    departureDateTime,
    arrivalDateTime,
    departureAirport,
    arrivalAirport,
    airline,
    description,
    coverImage
  );

  if (success) {
    res.json({
      status: 'success',
      event: {
        title,
        flightNumber,
        flightPrice,
        nbTickets,
        departureDateTime,
        arrivalDateTime,
        departureAirport,
        arrivalAirport,
        airline,
        coverImage,
      },
    });
  } else {
    res.status(500).json({
      status: 'failed',
      message: 'Unable to save event into the database',
    });
  }
});

export default route;
