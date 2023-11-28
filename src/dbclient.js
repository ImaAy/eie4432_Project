import { MongoClient, ServerApiVersion } from 'mongodb';
import config from './config.js';
const connect_uri = config.CONNECTION_STR;
const client = new MongoClient(connect_uri, {
  connectTimeoutMS: 50000,
  serverSelectionTimeoutMS: 50000,
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

function getCurrentDateTime() {
  const current = new Date();
  const date = current.toLocaleDateString('en-US');
  const time = current.toLocaleTimeString('en-US');
  return `${date}, ${time}`;
}

async function connect() {
  try {
    await client.connect();
    await client.db('bookingFlight').command({ ping: 1 });
    console.log(getCurrentDateTime() + ' - Successfully connected to the database!');
  } catch (err) {
    console.error(getCurrentDateTime() + ' - Failed to connect to the database:', err);
    process.exit(1);
  }
}
connect().catch(console.dir);
export default client;
