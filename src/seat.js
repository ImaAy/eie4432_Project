import express from 'express';
import multer from 'multer';

import { get_seatList, get_seatInfo, update_statut } from './seatdb.js';

const route = express.Router();

const upload = multer();

route.get('/', async (req, res) => {
  try {
    const seatData = await get_seatList();
    res.json(seatData);
  } catch (error) {
    console.error('Error fetching seat data:', error);
    res.status(500).send('Error fetching seat data');
  }
});

route.get('/seat-info/:seatNum', async (req, res) => {
  try {
    const seatNum = req.params.seatNum;
    const seat = await get_seatInfo(seatNum);
    res.json(seat);
  } catch (error) {
    console.error('Error fetching seat information:', error);
    res.status(500).send('Error fetching seat information');
  }
});

route.post('/updateStatut', upload.array(), async (req, res) => {
  try {
    const { selectedSeat } = req.body;
    const user = req.session.username;
    console.log(selectedSeat, user);
    const success = await update_statut(selectedSeat, user);
    res.json({ success });
  } catch (error) {
    console.error('Unable to update seat status:', error.message);
    res.status(500).json({ message: 'Error updating seat status' });
  }
});
export default route;
