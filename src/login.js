import express from 'express';
import multer from 'multer';
import bcrypt from 'bcrypt';

import {
  validate_user,
  update_user,
  fetch_user,
  username_exist,
  update_profile,
  update_image,
  update_password,
} from './userdb.js';

const route = express.Router();
const form = multer();
const storage = multer.diskStorage({
  destination: './upload/Images',
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

const saltRounds = 10;

route.post('/register', upload.single('profileImage'), async (req, res) => {
  // Extracting form data
  const { username, password, nickname, role, gender, birthdate, email } = req.body;
  const profileImage = req.file ? `/upload/${req.file.filename}` : '/upload/defaultProfil.png';

  // Check if username and password are not empty
  if (!username || !password) {
    return res.status(400).json({
      status: 'failed',
      message: 'Missing fields',
    });
  }

  // Check for valid username length
  if (username.length < 3) {
    return res.status(400).json({
      status: 'failed',
      message: 'Username must be at least 3 characters',
    });
  }

  // Check if username is unique
  if (await username_exist(username)) {
    return res.status(400).json({
      status: 'failed',
      message: `Username ${username} already exists`,
    });
  }

  // Check for valid password length
  if (password.length < 8) {
    return res.status(400).json({
      status: 'failed',
      message: 'Password must be at least 8 characters',
    });
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, saltRounds);
  } catch (error) {
    return res.status(500).json({
      status: 'failed',
      message: 'Error hashing password',
    });
  }
  const success = await update_user(username, hashedPassword, role, gender, birthdate, email, profileImage, nickname);

  if (success) {
    res.json({
      status: 'success',
      user: {
        username,
        role,
        nickname,
        gender,
        birthdate,
        email,
        profileImage,
      },
    });
  } else {
    res.status(500).json({
      status: 'failed',
      message: 'Account created but unable to save into the database',
    });
  }
});

route.post('/login', form.none(), async (req, res) => {
  try {
    const { username, password, rememberMe } = req.body;
    if (rememberMe) {
      req.session.cookie.maxAge = 1 * 24 * 60 * 60 * 1000; // one day
    }

    const user = await validate_user(username, password);

    if (user) {
      req.session.logged = true;
      req.session.username = user.username;
      res.json({
        status: 'success',
        user: {
          username: user.username,
          role: user.role,
          gender: user.gender,
          nickname: user.nickname,
          birthdate: user.birthdate,
          email: user.email,
          profileImage: user.profileImage,
        },
      });
    } else {
      res.status(401).json({ status: 'failed', message: 'Incorrect username and password' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

route.get('/me', async (req, res) => {
  try {
    if (req.session && req.session.logged) {
      const username = req.session.username;
      const user = await fetch_user(username);
      if (user) {
        res.json(user);
      } else {
        res.status(401).json({
          status: 'failed',
          message: 'Unauthorized',
        });
      }
    } else {
      res.status(401).json({
        status: 'failed',
        message: 'Unauthorized',
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

route.post('/updateProfile', upload.array(), async (req, res) => {
  try {
    const { nickname, email, gender, birthdate } = req.body;
    console.log('update', nickname, email, gender, birthdate);
    const success = await update_profile(req.session.username, nickname, email, gender, birthdate);
    res.json(success);
  } catch (error) {
    console.error('Unable to fetch events:', error.message);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

route.post('/uploadProfileImage', upload.single('profileImage'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucune image sélectionnée' });
  }
  const profileImage = `/upload/${req.file.filename}`;
  const success = await update_image(req.session.username, profileImage);

  res.json({ profileImage, status: 'success', message: 'Success for the upload of the image' });
});

route.post('/changePassword', upload.array(), async (req, res) => {
  try {
    const user = req.session.username;
    const { oldPassword, newPassword } = req.body;

    const success = await update_password(user, oldPassword, newPassword);
    if (!success) {
      res.json({ success: false, message: 'Incorrect old password' });
    }
    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Error changing password:', error.message);
  }
});

route.post('/logout', async (req, res) => {
  try {
    if (req.session) {
      req.session.destroy();
      res.json({ status: 'success', message: 'Logged out' });
    } else {
      res.status(401).json({ status: 'failed', message: 'Not logged in' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default route;
