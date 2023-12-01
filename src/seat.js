/* Group members : 
    Name : Imadath YAYA studentId: 23012992x
    Name: Kin Fung Yip*/

import express from 'express';
import multer from 'multer';

import { get_seatList, get_seatInfo, update_statut,get_seatMap } from './seatdb.js';

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

route.get('/details/:seatMapId', async (req, res) => {
  try {
      const seatMapId = req.params.seatMapId;
      const seatMap = await get_seatMap(seatMapId);

      if (!seatMap) {
          return res.status(404).json({ message: 'Seat map not found' });
      }
      res.json(seatMap);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});


route.get('/seat-info', upload.array(),async (req, res) => {
  try {
    const { seatNum, seatMapId } = req.query;
    const seat = await get_seatInfo(seatMapId, seatNum);
    res.json(seat);
  } catch (error) {
    console.error('Error fetching seat information:', error);
    res.status(500).send('Error fetching seat information');
  }
});

route.post('/updateStatut', upload.array(), async (req, res) => {
  try {
    const { seatMapId,selectedSeat } = req.body;
    const user = req.session.userId;
    const success = await update_statut(seatMapId,selectedSeat, user);
    res.json({ success });
  } catch (error) {
    console.error('Unable to update seat status:', error.message);
    res.status(500).json({ message: 'Error updating seat status' });
  }
});
export default route;
