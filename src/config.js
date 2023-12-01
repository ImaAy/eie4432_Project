/* Group members : 
    Name : Imadath YAYA studentId: 23012992x
    Name: Kin Fung Yip*/

import dotenv from 'dotenv';
dotenv.config();

if (!process.env.CONNECTION_STR) {
  console.error('CONNECTION_STR is not defined');
  process.exit(1);
}

export default {
  CONNECTION_STR: process.env.CONNECTION_STR,
};
