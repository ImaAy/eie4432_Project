/* Group members : 
    Name : Imadath YAYA studentId: 23012992x
    Name: Kin Fung Yip*/

import express from 'express';
import multer from 'multer';

import { add_event, update_event, fetch_event, get_eventList, updateAvTickets, get_events } from './eventdb.js';

const route = express.Router();
route.use(express.json())
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

route.get('/searchEvents', async (req, res) => {
    try {
        const query = req.query.query;
        const events = await get_events(query);

        if (!events) {
            res.status(500).send('Erreur lors de la récupération des événements');
        } else {
            res.json(events);
        }
    } catch (error) {
        console.error('Erreur serveur:', error);
        res.status(500).send('Erreur serveur');
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
