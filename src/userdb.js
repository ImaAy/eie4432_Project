/* Group members : 
    Name : Imadath YAYA studentId: 23012992x
    Name: Kin Fung Yip*/

import fs from 'fs/promises';
import client from './dbclient.js';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
const saltRounds = 10;
async function init_db() {
  try {
    const users = client.db('bookingFlight').collection('users');
    const userCount = await users.countDocuments();

    if (userCount === 0) {
      const userData = await fs.readFile('./users.json', 'utf8');
      let userObjects = JSON.parse(userData);
      for (let user of userObjects) {
        if (user.username === 'admin') {
          user.password = await bcrypt.hash(user.password, saltRounds);
          break;
        }
      }

      // Insérer les données dans la base de données
      const insertResult = await users.insertMany(userObjects);

      // Afficher le nombre d'enregistrements insérés
      console.log(`Added ${insertResult.insertedCount} users`);
    }
  } catch (err) {
    console.error('Unable to initialize the database!', err);
  }
}

async function validate_user(username, password) {
  if (!username || !password) {
    return false;
  }

  try {
    const users = client.db('bookingFlight').collection('users');
    const user = await users.findOne({ username:username });
    if (!user) {
      return false;
    }
    const match = await bcrypt.compare(password, user.password);
    return match ? user : false;
  } catch (error) {
    console.error('Unable to fetch from database!', error.message);
    return false;
  }
}

async function update_user(username, password, role, gender, birthdate, email, profileImage, nickname) {
  try {
    const users = client.db('bookingFlight').collection('users');

    const filter = { username: username };
    const update = {
      $set: { password, role, gender, birthdate, email, profileImage, nickname },
    };

    const result = await users.updateOne(filter, update, { upsert: true });

    if (result.upsertedCount === 0) {
      console.log('Added 0 user');
    } else {
      console.log('Added 1 user');
    }

    return true;
  } catch (error) {
    console.error('Unable to update the database!', error.message);
    return false;
  }
}

async function update_profile(userId, nickname, email, gender, birthdate) {
  try {
    const users = client.db('bookingFlight').collection('users');
    const filter = { _id : new ObjectId(userId) };
    const update = {
      $set: {
        nickname: nickname,
        email: email,
        gender: gender,
        birthdate: birthdate,
      },
    };

    const result = await users.updateOne(filter, update, { upsert: true });

    if (result.upsertedCount === 0) {
      console.log("Aucune mise à jour effectuée pour l'utilisateur");
    } else {
      console.log("Mise à jour effectuée pour l'utilisateur");
    }

    return true;
  } catch (error) {
    console.error('Impossible de mettre à jour la base de données :', error.message);
    return false;
  }
}

async function update_image(userId, profileImage) {
  try {
    const users = client.db('bookingFlight').collection('users');
    const filter = { _id : new ObjectId(userId) };
    const update = {
      $set: { profileImage: profileImage },
    };

    const result = await users.updateOne(filter, update, { upsert: true });

    if (result.modifiedCount === 0) {
      console.log('update 0 image');
    } else {
      console.log('update 1 image');
    }

    return true;
  } catch (error) {
    console.error('Unable to update the database!', error.message);
    return false;
  }
}

async function update_password(userId, oldPassword, newPassword) {
  try {
    const users = client.db('bookingFlight').collection('users');
    const user = await users.findOne({ _id : new ObjectId(userId) });
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);

    if (!passwordMatch) {
      return false;
    }
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);


    const filter = {_id : new ObjectId(userId)};
    const update = {
      $set: { password: newPasswordHash },
    };

    const result = await users.updateOne(filter, update, { upsert: true });
    return true;
  } catch (error) {
    console.error('Unable to update the database!', error.message);
    return false;
  }
}

async function fetch_user(userId) {
  try {
    const users = client.db('bookingFlight').collection('users');
    const user = await users.findOne({ _id: new ObjectId(userId) });
    return user;
  } catch (error) {
    console.error('Unable to fetch from database!', error.message);
    throw error;
  }
}

async function fetch_userName(username) {
  try {
    const users = client.db('bookingFlight').collection('users');
    const user = await users.findOne({ username: username });
    return user;
  } catch (error) {
    console.error('Unable to fetch from database!', error.message);
    throw error;
  }
}

async function add_event(userId, eventId) {
    try {
        const users = client.db('bookingFlight').collection('users');
        
        const updateResult = await users.updateOne(
            { _id: new ObjectId(userId) },
            { $addToSet: { events: eventId } }
        );

        console.log("Résultat de l'update:", updateResult);

        return updateResult.modifiedCount > 0;
    } catch (error) {
        console.error('Erreur lors de la réservation de l\'événement:', error);
        return false;
    }
}

async function add_ticket(userId, ticketData) {
    try {
        const users = client.db('bookingFlight').collection('users');
        
        const updateResult = await users.updateOne(
            { _id: new ObjectId(userId) },
            { $push: { tickets: ticketData } }
        );
        
        return updateResult.modifiedCount > 0;
    } catch (error) {
        console.error('Erreur lors de l\'ajout du ticket:', error);
        return false;
    }
}


async function username_exist(username) {
  try {
    const user = await fetch_userName(username);

    return !!user;
  } catch (error) {
    console.error('Unable to fetch from database!', error.message);
    return false;
  }
}

async function findUserTickets(userId) {
  try {
    const users = client.db('bookingFlight').collection('users');

    const user = await users.findOne({ _id: new ObjectId(userId) });
    return user ? user.tickets : [];
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    throw error;
  }
}

init_db().catch(console.dir);

export { validate_user, update_user, fetch_user, username_exist, update_profile, update_image, update_password,add_event, add_ticket,findUserTickets};
