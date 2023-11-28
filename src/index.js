import express from 'express';
import session from 'express-session';
import mongostore from 'connect-mongo';
import client from './dbclient.js';
import login from './login.js';
import event from './event.js';
import seat from './seat.js';
import path from 'path';

const app = express();

app.use(
  session({
    secret: 'book_flight_project',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true },
    store: mongostore.create({
      client,
      dbName: 'bookingFlight',
      collectionName: 'session',
    }),
  })
);

app.get('/', (req, res) => {
  if (req.session.logged) {
    res.redirect('/dashboard.html');
  } else {
    res.redirect('/index.html');
  }
});

app.use(express.urlencoded({ extended: true }));

app.use('/auth', login);
app.use('/event', event);
app.use('/seats', seat);

app.use('/', express.static(path.join(process.cwd(), '/static')));
app.use('/upload', express.static(path.join(process.cwd(), 'upload/Images')));

const PORT = 8080;

function getCurrentDateTimeHKT() {
  const now = new Date();
  now.setHours(now.getHours() + 8);
  return now.toISOString().replace('T', ' ').substr(0, 19);
}
app.listen(PORT, () => {
  console.log(`${getCurrentDateTimeHKT()} HKT - Server started at http://127.0.0.1:${PORT}`);
});
